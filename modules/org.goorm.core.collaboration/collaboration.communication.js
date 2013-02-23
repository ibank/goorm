/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var EventEmitter = require("events").EventEmitter;

module.exports = {
	files: [],
	
	msg: function (io, socket, msg) {
		if(msg.action == 'send_whisper_message'){
			var sessionid = msg.sessionid;
			
			var target_user = JSON.parse(msg.target_user);
			var target_id_type = JSON.stringify({ 'id' : target_user.user, 'type' : target_user.type })

			var from_chatting_message = "From > " + msg.nick + "["+msg.user+"] : " + msg.message;
			var to_chatting_message = "To > " + target_user.nick + "["+target_user.user+"] : " + msg.message;
			
			var clients = io.sockets.clients();
			clients.forEach(function(client){
				client.get('id_type', function(err, data){
					if(data == target_id_type){
						io.sockets.sockets[client.id].emit('communication_whisper_message', from_chatting_message);
					};
				})
			});
			
			io.sockets.sockets[sessionid].emit('communication_whisper_message', to_chatting_message);
		}
		else{ // or msg.action = send_message
			var chatting_message = msg.nick + " : " + msg.message;
			
			socket.broadcast.to(msg.workspace).emit("communication_message", chatting_message);
			socket.emit("communication_message", chatting_message);
		}
	},

	is_connected : function(io, user_list, is_connected, is_not_connected, callback){
		var evt_user = new EventEmitter();
		var clients = io.sockets.clients();

		evt_user.on('get_user', function(evt_user, user_index){
			if(user_list[user_index] != undefined){
				var user = user_list[user_index];
				var evt_client = new EventEmitter();

				evt_client.on('is_connected', function(evt_client, i){
					if(clients[i] != undefined){
						var client = clients[i];

						client.get('id_type', function(err, id_type){
							if(JSON.stringify({'id':user.id, 'type':user.type}) == id_type){
								if(is_connected)
									is_connected.call(this, { 'status' : true, 'client' : client, 'user' : user });

								evt_user.emit('get_user', evt_user, ++user_index);
							}
							else{
								evt_client.emit('is_connected', evt_client, ++i);
							}
						})
					}
					else{
						if(is_not_connected)
							is_not_connected.call(this, { 'status' : false, 'user' : user })
						evt_user.emit('get_user', evt_user, ++user_index);
					}
				});	
				evt_client.emit('is_connected', evt_client, 0);
			}
			else{
				if(callback) callback();
			}
		});
		evt_user.emit('get_user', evt_user, 0);
	}
};
