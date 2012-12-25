var user_schema = {
	id: String,
	pw: String,
	name: String,
	nick: String,
	email: String,
	deleted: Boolean,
	type : String,
	level : String,
	permission : String
};

var EventEmitter = require("events").EventEmitter;
var User = mongoose.model('user', new Schema(user_schema));

var g_admin = require('../org.goorm.admin/admin.js')
var g_admin_permission = require('../org.goorm.admin/admin.permission.js')

var check_form = {
	regular_expression_id : /^[0-9a-zA-Z]{4,15}$/,
	regular_expression_password : /^(?=([a-zA-Z]+[0-9]+[a-zA-Z0-9]*|[0-9]+[a-zA-Z]+[a-zA-Z0-9]*)$).{8,15}$/,
	regular_expression_name : /^[가-힣0-9a-zA-Z._-]{2,15}$/,
	regular_expression_nick : /^[가-힣0-9a-zA-Z._-]{2,20}$/,
	regular_expression_email : /^([0-9a-zA-Z._-]+)@([0-9a-zA-Z_-]+)(\.[a-zA-Z0-9]+)(\.[a-zA-Z]+)?$/
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
				
				for(var attrname in user_schema){
					doc[attrname] = user[attrname];
				}
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
				if(config && config.general_signup_config){
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
			});
		}
	},
	
	add : function(userdata, callback){
		var self = this;
		
		var doc = new User();
		var user = userdata;
		
		for(var attrname in user_schema){
			doc[attrname] = user[attrname];
		}
		doc.deleted = false;
		
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
			if(attrname == 'id' || attrname == 'pw' || attrname == 'type' || attrname == 'level' || attrname == 'deleted')
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
		
		self.get(user, function(user_data){
			if(user_data && !user_data.deleted){
				if(user_data.pw == user.pw){
					self.update_session(req.session, user_data);
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
			}
			else{
				callback({
					code : 1,
					result : false
				})
			}
		});
	},
	
	logout : function(req, callback){
		req.session.destroy();
		if(req.loggedIn) req.logout();	// for Social Login
		callback(true);
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
		User.findOne({'level':'Admin'}, function(err, result){
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
			if(attr == 'pw' || attr == 'deleted' || attr == 'permission')
				continue;
			user_data[attr] = user[attr];
		}
		
		session.auth = {};
		session.auth.loggedIn = true;
		session.auth['password'] = {};
		session.auth['password'].user = user_data;
	},
	
	get_user_schema : function(){
		return user_schema;
	}
}

