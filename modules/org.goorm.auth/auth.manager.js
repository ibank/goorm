var user_schema = {
	id: String,
	pw: String,
	name: String,
	nick: String,
	email: String,
	deleted: Boolean,
	type : String,
	level : String,
	last_access_time : Date
};

var EventEmitter = require("events").EventEmitter;
var crypto = require('crypto');
var User = mongoose.model('user', new Schema(user_schema));

var g_admin = require('../org.goorm.admin/admin.js')
var g_admin_permission = require('../org.goorm.admin/admin.permission.js')
var g_collaboration = require('../org.goorm.core.collaboration/collaboration.js')
var g_collaboration_communication = require('../org.goorm.core.collaboration/collaboration.communication.js')

var check_form = {
	regular_expression_id : /^[0-9a-zA-Z]{4,15}$/,
	regular_expression_password : /^(?=([a-zA-Z]+[0-9]+[a-zA-Z0-9]*|[0-9]+[a-zA-Z]+[a-zA-Z0-9]*)$).{8,15}$/,
	regular_expression_name : /^[가-힣 0-9a-zA-Z._-]{2,15}$/,
	regular_expression_nick : /^[가-힣 0-9a-zA-Z._-]{2,20}$/,
	regular_expression_student_id : /^[0-9]{10,10}$/,
	regular_expression_email : /^([0-9a-zA-Z._-]+)@([0-9a-zA-Z_-]+)(\.[a-zA-Z0-9]+)(\.[a-zA-Z]+)?$/

}


var exec = require('child_process').exec;

var os = {
	add : function(option){
		var id = option.id;

		return 'useradd ' + id;
	},

	del : function(option){
		var id = option.id;

		return 'userdel -f -r ' + id;
	},

	get_uid : function(option){
		var id = option.id;

		return 'id -u ' + id;
	},

	get_gid : function(option){
		var id = option.id;

		return 'id -g ' + id;
	}
}

module.exports = {
	admin_registeration : function(req, callback){
		var self = this;
		
		// User.find({'level':'admin'}, function(err, result){
			// if(result && result.length > 0){
				// callback({
					// code : 10,
					// result : false
				// })
			// }
			// else{
				var doc = new User();
				var user = req.body;
				var sha_pw = crypto.createHash('sha1');
				
				for(var attrname in user_schema){
					doc[attrname] = user[attrname];
				}
				sha_pw.update(doc.pw);
				doc.pw = sha_pw.digest('hex');
				doc.deleted = false;
				doc.type = 'password';
				doc.level = 'Admin';
				
				doc.save(function(err){
					if(!err){
						g_admin.init_config(function(config_result){
							if(config_result.result){
								self.update_session(req.session, doc);
								callback({
									result : true
								});
							}
							else{
								callback(config_result);
							}
						})
					}
					else {
						console.log(err, 'Admin initialize [fail]');
						callback({
							code : 11,
							result : false
						})
					}
				});
			// }
		// });		
	},
	
	register : function(req, callback){
		var self = this;
		
		var mode = req.query.mode;
		if(mode == 'admin') self.admin_registeration(req, callback);
		else {
			g_admin.get_config(function(config){
				if(config){
					if(config.general_signup_config){
						req.body.level = 'Member';

						self.add(req.body, function(add_result){
							if(add_result){

								self.update_session(req.session, req.body)
								callback({
									result : true
								});
							}
							else{
								callback({
									code : 0,
									result : false
								})
							}
						})
					}
					else{
						callback({
							code : 30,
							result : false
						})
					}
				}
				else{
					g_admin.init_config(function(config_result){
						if(config_result.result){
							self.register(req, callback);
						}
						else{
							callback(config_result);
						}
					})
				}
			});
		}
	},
	
	add : function(userdata, callback){
		var self = this;
		
		var doc = new User();
		var user = userdata;
		var sha_pw = crypto.createHash('sha1');
		
		for(var attrname in user_schema){
			doc[attrname] = user[attrname];
		}
		doc.deleted = false;
		if(doc.pw){
			sha_pw.update(doc.pw);
			doc.pw = sha_pw.digest('hex');
		}

		doc.save(function(err){
			if(!err){
				callback(true);
			}
			else {
				console.log(err, 'User Adding [fail]');
				callback(false);
			}
		})
	},
	
	// for admin
	user_add : function(user, callback){
		this.add(user, callback);
	},
	
	get : function(user, callback){
		User.findOne({'id':user.id, 'type':user.type}, function(err, data){
			callback(data);
		});
	},
	
	user_get : function(user, callback){
		var self = this;
		
		this.get(user, function(user_data){
			if(user_data){
				user_data = self.filtering(user_data);
				callback(user_data);
			}
			else callback(null);
		});
	},
	
	get_list : function(callback){
		var self = this;
		
		User.find({}, function(err, result){
			var evt = new EventEmitter();
			evt.on('get_list_filtering', function(evt, i){
				if(result[i]){
					result[i] = self.filtering(result[i]);
					evt.emit('get_list_filtering', evt, ++i);
				}
				else{
					callback(result);
				}
			});
			evt.emit('get_list_filtering', evt, 0);
		});
	},
	
	get_group_list : function(option, callback){
		var group = option['group'];

		User.find({'group':group}, function(err, data){
			callback(data);
		})
	},

	get_match_list : function(option, callback){
		var query = option['query'];

		User.find({ $or: [{'id' : {$regex:query, $options: 'g'} }, {'name' : {$regex:query, $options: 'g'} }, {'nick' : {$regex:query, $options: 'g'}}] }, function(err, user_list){
			callback(user_list);
		});
	},

	avail_blind : function(users, callback){
		var self = this;
		var data = users.data;
		var ret = {};
		
		var evt = new EventEmitter();
		evt.on('blanch_user_avail_blind', function(evt, i){
			if(data[i]){
				if(data[i].deleted == 'true' || data[i].deleted === true){
					self.blind(data[i], function(blind_data){
						ret[data[i].id] = blind_data;
						evt.emit('blanch_user_avail_blind', evt, ++i);
					});
				}
				else if(data[i].deleted == 'false' || data[i].deleted === false){
					self.avail(data[i], function(avail_data){
						ret[data[i].id] = avail_data;
						evt.emit('blanch_user_avail_blind', evt, ++i);
					});
				}
			}
			else{
				callback(ret);
			}
		});
		evt.emit('blanch_user_avail_blind', evt, 0)
	},
	
	avail: function(user, callback){
		User.update({'id':user.id, 'type':user.type}, {$set:{deleted:false}}, {multi:true}, function(err){
			if (!err) callback(true);
			else {
				console.log(err, 'User Availiave [fail]');
				callback(false);
			}
		});
	},
	
	blind: function(user, callback){
		User.update({'id':user.id, 'type':user.type}, {$set:{deleted:true}}, {multi:true}, function(err){
			if (!err) callback(true);
			else {
				console.log(err, 'User Blindng [fail]');
				callback(false);
			}
		});
	},
	
	remove : function(user, callback){
		User.remove({id:user.id, type:user.type}, function(err){
			if(!err) callback(true);
			else callback(false);
		});
	},
	
	set: function(user, req, callback){
		var self = this;
		
		var member = {};
		
		for(var attrname in user){
			if(attrname == 'id' || attrname == 'type' || attrname == 'level' || attrname == 'deleted' || attrname == 'last_access_time')
				continue;
			member[attrname] = user[attrname];
		}

		User.update({'id':user.id, 'type':user.type}, {$set:member}, null, function(err){
			if ( !err ) {
				// self.update_session(req.session, member);
				callback({
					result : true,
					data : member
				});	
			} else {
				console.log('member_dao : Member updating [fail]', err);
				callback({
					result : false
				}); 
			}
		});
	},
	
	user_set : function(req, callback){
		var self = this;
		var user = req.body;
		if(user.pw)
		{

			var crypto = require('crypto');
			var sha_pw = crypto.createHash('sha1');
			user.pw=sha_pw.update(user.pw).digest('hex');
		}
		self.set(user, req, function(set_result){
			if(set_result.result){
				self.get(user, function(user_data){
					self.update_session(req.session, user_data);
					callback(true);
				})
			}
			else{
				callback(false);
			}
		});
	},
	
	login : function(user, req, callback){
		var self = this;
		var sha_pw = crypto.createHash('sha1');
		
		self.get(user, function(user_data){
			if(user_data && !user_data.deleted){
				sha_pw.update(user.pw);

				if(user_data.pw == sha_pw.digest('hex')){
					self.duplicate_login_check(user_data, function(can_be_login){

						if(can_be_login){

							// Update Session
							//
							self.update_session(req.session, user_data);

							//	Access User
							//
							self.access(user);
							callback({
								result : true
							});
						}
						else{
							// duplicate login process
							//
							callback({
								code : 2,
								result : false
							})
						}
					});
				}
				else{
					callback({
						code : 0,
						result : false
					})
				}
			}
			else{
				callback({
					code : 1,
					result : false
				})
			}
		});
	},
	
	access : function(user){
		var member = {'last_access_time': new Date()}
		User.update({'id':user.id, 'type':user.type}, {$set:member}, null, function(err){
			if(err) console.log(err, 'Access Fail');
		});
	},

	logout : function(req, callback){
		//////////////////////////////////////////////////
		// for firefox
		//////////////////////////////////////////////////
		var io = g_collaboration.get_io();
		var user_list = [{
			'id' : req.body.id,
			'type' : req.body.type
		}]

		var is_connect = function(data){
			io.sockets.sockets[data.client.id].emit("logout_disconnect");
			req.session.destroy();	
			if(req.loggedIn) req.logout();	// for Social Login
			callback(true);
		}

		var is_not_connect = function(data){
			req.session.destroy();	
			if(req.loggedIn) req.logout();	// for Social Login
			callback(true);
		}

		g_collaboration_communication.is_connected(io,  user_list, is_connect,  is_not_connect)
	},
	
	set_check : function(user, evt){
		var ret = {}
		
		if(!user.id){
			ret.result = false;
			ret.code = 0;
			
			evt.emit("auth_set_check_user_data", ret);
		}
		else{
			User.findOne({'id':user.id, 'type': user.type}, function(err, result){
				if(err){
					ret.result = false;
					ret.code = 3;
					
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!user.name){
					ret.result = false;
					ret.code = 30;
		
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!check_form.regular_expression_name.test(user.name)){
					ret.result = false;
					ret.code = 31;
					
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!user.nick){
					ret.result = false;
					ret.code = 40;
		
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!check_form.regular_expression_nick.test(user.nick)){
					ret.result = false;
					ret.code = 41;
					
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!user.email){
					ret.result = false;
					ret.code = 20;
		
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!check_form.regular_expression_email.test(user.email)){
					ret.result = false;
					ret.code = 21;
					
					evt.emit("auth_set_check_user_data", ret);
				}
				else{
				
									ret.result = true;
									evt.emit("auth_set_check_user_data", ret);
						
				}
			});
		}
	},
	set_check_pw : function(user, evt){
		var ret = {}
		
		if(!user.id){
			ret.result = false;
			ret.code = 0;
			
			evt.emit("auth_set_check_user_data", ret);
		}
		else{
			User.findOne({'id':user.id, 'type': user.type}, function(err, result){
				if(err){
					ret.result = false;
					ret.code = 3;
					
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!user.name){
					ret.result = false;
					ret.code = 30;
		
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!check_form.regular_expression_name.test(user.name)){
					ret.result = false;
					ret.code = 31;
					
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!user.nick){
					ret.result = false;
					ret.code = 40;
		
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!check_form.regular_expression_nick.test(user.nick)){
					ret.result = false;
					ret.code = 41;
					
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!user.email){
					ret.result = false;
					ret.code = 20;
		
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!check_form.regular_expression_email.test(user.email)){
					ret.result = false;
					ret.code = 21;
					
					evt.emit("auth_set_check_user_data", ret);
				}
				else if(!user.re_pw){
						ret.result = false;
						ret.code = 11;
			
						evt.emit("auth_set_check_user_data", ret);
					}
					else if(user.pw != user.re_pw){
						ret.result = false;
						ret.code = 12;
			
						evt.emit("auth_set_check_user_data", ret);
					}
					else if(!check_form.regular_expression_password.test(user.pw)){
						ret.result = false;
						ret.code = 13;
						
						evt.emit("auth_set_check_user_data", ret);
					}
				else{
				
									ret.result = true;
									evt.emit("auth_set_check_user_data", ret);
						
				}
			});
		}
	},
	
	check : function(user, evt){
		var ret = {}
		
		if(!user.id){
			ret.result = false;
			ret.code = 0;
			
			evt.emit("auth_check_user_data", ret);
		}
		else if(!check_form.regular_expression_id.test(user.id)){
			ret.result = false;
			ret.code = 1;
			
			evt.emit("auth_check_user_data", ret);
		}
		else{
			User.findOne({'id':user.id, 'type': user.type}, function(err, result){
				if(!err && result){
					ret.result = false;
					ret.code = 2;
					
					evt.emit("auth_check_user_data", ret);
				}
				else{
					if(!user.pw){
						ret.result = false;
						ret.code = 10;
			
						evt.emit("auth_check_user_data", ret);
					}
					else if(!user.re_pw){
						ret.result = false;
						ret.code = 11;
			
						evt.emit("auth_check_user_data", ret);
					}
					else if(user.pw != user.re_pw){
						ret.result = false;
						ret.code = 12;
			
						evt.emit("auth_check_user_data", ret);
					}
					else if(!check_form.regular_expression_password.test(user.pw)){
						ret.result = false;
						ret.code = 13;
						
						evt.emit("auth_check_user_data", ret);
					}
					else if(!user.name){
						ret.result = false;
						ret.code = 30;
			
						evt.emit("auth_check_user_data", ret);
					}
					else if(!check_form.regular_expression_name.test(user.name)){
						ret.result = false;
						ret.code = 31;
						
						evt.emit("auth_check_user_data", ret);
					}
					else if(!user.nick){
						ret.result = false;
						ret.code = 40;
			
						evt.emit("auth_check_user_data", ret);
					}
					else if(!check_form.regular_expression_nick.test(user.nick)){
						ret.result = false;
						ret.code = 41;
						
						evt.emit("auth_check_user_data", ret);
					}
					else if(!user.email){
						ret.result = false;
						ret.code = 20;
			
						evt.emit("auth_check_user_data", ret);
					}
					else if(!check_form.regular_expression_email.test(user.email)){
						ret.result = false;
						ret.code = 21;
						
						evt.emit("auth_check_user_data", ret);
					}
					else{
										ret.result = true;
										evt.emit("auth_check_user_data", ret);
				
						
					}
				}
			});
		}
	},
	
	check_admin : function(callback){
		User.findOne([{'level':'Admin'},{'level':'Owner'}], function(err, result){
			if(result) callback(true);
			else callback(false);
		})
	},
	
	filtering : function(data){
		var user_data = {};
		for(var attr in user_schema){
			if(attr == 'pw')
				continue;
			user_data[attr] = data[attr];
		}
		
		return user_data;
	},
	
	update_session : function(session, user){
		var user_data = {};

		for(var attr in user_schema){
			if(attr == 'pw' || attr == 'deleted' || attr == 'last_access_time')
				continue;
			user_data[attr] = user[attr];
		}
		
		session.auth = {};
		session.auth.loggedIn = true;
		session.auth[user.type.toLowerCase()] = {};
		session.auth[user.type.toLowerCase()].user = user_data;

		// Redis Store
		//
		if(__redis_mode)
			store.client.set(user_data.id, JSON.stringify(session));
	},
	
	get_user_schema : function(){
		return user_schema;
	},

	duplicate_login_check : function(user, callback){
		var io = g_collaboration.get_io();

		var userdata = [{
			'id' : user.id,
			'type' : user.type
		}]

		var is_connect = function(){
			callback(false);
		}

		var is_not_connect = function(){
			callback(true);
		}

		g_collaboration_communication.is_connected(io, userdata, is_connect, is_not_connect);
	},

	disconnect_user_and_login : function(user, callback){
		var io = g_collaboration.get_io();
		var self = this;
		var userdata = [{
			'id' : user.id,
			'type' : user.type
		}];

		var is_connect = function(data){

			// store.destroy : RedisStore
			//

			// console.log(Store);

			// store.client.get(user.id, function(null_obj, session){
				// var util = require('util'); console.log(util.inspect(JSON.parse(session), false, null));

				// if(session.auth[user.type.toLowerCase()].user.id == user.id){
					// store.destroy(user.id, function(){
						// console.log(session.auth)
						// console.log(express_store);
					// })
				// }
			// })

			if(!__redis_mode){
				// store.sessions : express MemoryStore
				
				var sessions = store.sessions

				for(var sid in sessions){
					var session = JSON.parse(sessions[sid]);

					if(session.auth && session.auth.loggedIn){
						var session_user = session.auth[user.type.toLowerCase()].user;

						if(session_user.id == user.id && session_user.type == user.type){
							store.destroy(sid, function(){
								callback(true);
							})
						}
					}
				}
			}

			io.sockets.sockets[data.client.id].emit("force_disconnect");
			io.sockets.sockets[data.client.id].disconnect();
		}

		var is_not_connect = function(data){
			callback(true);
		}

		g_collaboration_communication.is_connected(io, userdata, is_connect, is_not_connect);
	},

	get_user_doc : function(){
		return User;
	},

	g_exec : function(command, callback){
		exec(command, function(err, stdout, stderr){
			if(err){
				console.log(err, stdout, stderr);
				callback(false)
			}else{
				callback(stdout)
			}
		})
	},
}

