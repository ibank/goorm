/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module collaboration
 **/

/**
 * This is an goorm code generator.
 * goorm starts with this code generator.
 * @class edit.server
 * @extends collaboration
 **/

/**
 * This presents the current browser version
 * @property sys
 **/
var sys = require("sys");

/**
 * This presents the current browser version
 * @property ws
 **/
var ws = require('/usr/local/lib/node_modules/websocket-server/lib/ws/server');

/**
 * This presents the current browser version
 * @property redis
 **/
var redis = require("/usr/local/lib/node_modules/redis-client/lib/redis-client");

/**
 * This function is an goorm core initializating function.
 * @method log
 * @param {Data} data The data.
 **/
function log(data) {
	sys.log("\033[0;32m" + data + "\033[0m");
}

/**
 * This presents the current browser version
 * @property user_count
 * @type Number
 * @default 0
 **/
var user_count = 0;

/**
 * This presents the current browser version
 * @property main_store
 **/
var main_store = redis.createClient();

/**
 * This presents the current browser version
 * @property server
 **/
var server = ws.createServer({
	debug : true
});

server.addListener("listening", function() {
	log("Listening for connections.");
	main_store.flushall();
});

server.addListener("request", function(req, res) {
	res.writeHead(200, {
		"Content-Type" : "text/plain"
	});
	res.write("Chat Server");
	res.end();
});
// Handle WebSocket Requests
server.addListener("connection", function(conn) {
	log("opened connection: " + conn.id);

	//server.send(conn.id, "Connected as: "+conn.id);
	//conn.broadcast("<"+conn.id+"> connected");

	var self = conn;

	conn.redis_subscriber = redis.createClient();
	conn.redis_publisher = redis.createClient();

	conn.redis_subscriber.subscribeTo("*", function(channel, message, subscriptionPattern) {
		var output = '{"channel": "' + channel + '", "payload": ' + message + '}';
		//var output = '"channel": "' + channel + '", ' + message ;
		log("in subscribe: "+output);
		conn.write(output);
	});

	conn.addListener("message", function(raw_message) {
		log(conn.id + ": " + JSON.stringify(raw_message));
		message_obj = JSON.parse(raw_message);

		if(message_obj["channel"] != undefined)
			channel = message_obj["channel"];

		if(message_obj["message"] != undefined)
			message = message_obj["message"];

		if(message_obj["identifier"] != undefined)
			identifier = message_obj["identifier"];

		if(message_obj["action"] != undefined)
			action = message_obj["action"];
			
		if(message_obj["user"] != undefined)
			user = message_obj["user"];
		else user = this.user_id;
			
		timestamp = new Date().getTime();
		serialized_message = JSON.stringify({
			"user" : user,
			"action" : action,
			"identifier" : identifier,
			"message" : message,
			"timestamp" : timestamp,
			"channel" : channel
		});

		//store snapshot
		if(channel == "chat") {
			if(action == "init") {
				//main_store.flushall();
				current_user_id = ++user_count;
				conn.user_id =current_user_id + "\|\@\|" + user;
				//push user to current project user group
				main_store.rpush("users_" + identifier,conn.user_id, function(err, reply) {

					//get users list from the list
					main_store.lrange("users_" + identifier, 0, -1, function(err, values) {
						var str = "";
						for(v in values){
						    if(v!=0) str+=",";
						    str += '"' + values[v] + '"';
						}
						conn.write('{"channel": "initial", "id":"' + conn.user_id + '", "users":[' + str + '] }');

						//get previous messages from a list
						main_store.lrange("chat_" + identifier, -3, -1, function(err, messages) {
							for(var msg_id in messages) {
								conn.write('{"channel": "chat_' + identifier + '", "payload": ' + messages[msg_id] + '}');
							}
						});

						conn.redis_publisher.publish("chat_" + identifier, JSON.stringify({
							"action" : "join",
							"user" : conn.user_id
						}), function(err, reply) {
						});
					});
				});
				sys.puts("user:" + conn.user_id + "has joined to " + identifier + "chat room");
			} else if(action == "leave") {
				sys.puts("User " + conn.user_id + " closing");
				conn.redis_publisher.publish("chat_" + identifier, JSON.stringify({
					"action" : "leave",
					"user" : conn.user_id
				}), function(err, reply) {
					//delete user id
					main_store.lrem("users_" + identifier, 0, conn.user_id, function(err, values) {
						sys.puts("User " + conn.user_id + " closed");
						conn.redis_publisher.close();
						conn.redis_subscriber.close();
					});
				});
			} else {
				//conn.redis_publisher.publish(channel, serialized_message, function (err, reply) {
				conn.redis_publisher.publish("chat_" + identifier, serialized_message, function(err, reply) {

					//store the messages on main store
					main_store.rpush("chat_" + identifier, serialized_message, function(err, reply) {
						while(main_store.llen() > 3) {
							main_store.lpop("chat_" + identifier);
						}
					});
				});
			}

		} else if(channel == "edit") {
			if(action == "init") {
				current_user_id = conn.user_id = ++user_count;
				conn.identifier = identifier;
				conn.channel = channel;

				//store the current user's id on global store
				main_store.rpush('users_' + identifier, conn.user_id, function(err, reply) {
					main_store.lrange('users_' + identifier, 0, -1, function(err, values) {

						conn.write('{"channel": "initial", "id":' + current_user_id + ', "users":[' + values + '] }');

						//send all the exisiting diff messages
						// main_store.lrange('pad-diff', 0, -1, function(err, messages){
						// for(var msg_id in messages){
						// conn.write('{"channel": "diff", "payload": ' + messages[msg_id] + '}');
						// }
						// });
						//

						main_store.lrange('data_' + identifier, 0, -1, function(err, messages) {
							for(var msg_id in messages) {
								conn.write('{"channel": "edit","action":"change", "payload": ' + messages[msg_id] + '}');
							}
						});
					});
				});
			} else if(action == "autoSaved") {
				// clear mainstore
				main_store.del('data_' + identifier, function(err, values) {
				});
			} else if(action == "leave") {
				conn.redis_publisher.publish("edit", JSON.stringify({
					"action" : "leave",
					"user" : conn.user_id
				}), function(err, reply) {
					//delete user id
					main_store.lrem("users_" + identifier, 0, conn.user_id + "", function(err, values) {
						sys.puts("User " + conn.user_id + " closed");
						conn.redis_publisher.close();
						conn.redis_subscriber.close();
					});
				});
			} else {
				conn.redis_publisher.publish(channel, serialized_message, function(err, reply) {
					sys.puts("Published message to " + (reply === 0 ? "no one" : (reply + " subscriber(s).")));
					//store the messages on main store
					main_store.rpush('data_' + identifier, serialized_message, function(err, reply) {
					});
				});
			}
		} else if(channel == "design") {
			//main_store.flushall();
			if(action == "init") {
				current_user_id = conn.user_id = ++user_count;
				conn.identifier = identifier;
				conn.channel = channel;

				//store the current user's id on global store
				main_store.rpush('users_' + identifier, conn.user_id, function(err, reply) {
					main_store.lrange('users_' + identifier, 0, -1, function(err, values) {

						conn.write('{"channel": "initial", "id":' + current_user_id + ', "users":[' + values + '] }');

						//send all the exisiting diff messages
						// main_store.lrange('pad-diff', 0, -1, function(err, messages){
						// for(var msg_id in messages){
						// conn.write('{"channel": "diff", "payload": ' + messages[msg_id] + '}');
						// }
						// });
						//

						main_store.lrange('data_' + identifier, 0, -1, function(err, messages) {
							for(var msg_id in messages) {
								conn.write('{"channel": "design", "payload": ' + messages[msg_id] + '}');
							}
						});
						
						conn.redis_publisher.publish("design", JSON.stringify({
								"action" : "join",
								"identifier" : conn.identifier,
								"user" : conn.user_id
						}), function(err, reply) {
						log("join message published");
						});
					});
				});
			} else if(action == "leave") {
				conn.redis_publisher.publish("design", JSON.stringify({
						"action" : "leave",
						"identifier" : conn.identifier,
						"user" : conn.user_id
				}), function(err, reply) {
					//delete user id
					main_store.lrem("users_" + identifier, 0, conn.user_id + "", function(err, values) {
						sys.puts("User " + conn.user_id + " closed");
						conn.redis_publisher.close();
						conn.redis_subscriber.close();
					});
				});
			} else if(action == "autoSaved") {
				// clear mainstore
				main_store.del('data_' + identifier, function(err, values) {
				});
			} else {
				conn.redis_publisher.publish("design", serialized_message, function(err, reply) {
					//store the messages on main store
					main_store.rpush('data_' + identifier, serialized_message, function(err, reply) {
						//sys.put(identifier);
						
					});
				});
			}

		}
	});
});

server.addListener("close", function(conn) {
	sys.puts("User " + conn.identifier + " onClose");

	//publish a message before leaving
	conn.redis_publisher.publish(conn.channel, JSON.stringify({
		"action" : "leave",
		"user" : conn.user_id
	}), function(err, reply) {
		sys.puts(err);
		sys.puts("Published message to " + (reply === 0 ? "no one" : (reply + " subscriber(s).")));

		//delete user id
		main_store.lrem("users_" + conn.identifier, 0, conn.user_id, function(err, values) {
			sys.puts("User " + conn.user_id + " closed");
			conn.redis_publisher.close();
			conn.redis_subscriber.close();
		});
	});

	conn.redis_publisher.close();
	conn.redis_subscriber.close();
});

server.listen(8090);
