
var auth_m = require('./auth.manager.js');

var google_manager = null;
var twitter_manager = require('./plugin/twitter.js');
var facebook_manager = null;
var github_manager = null;

var social = function(social_type){
	this.social_type = social_type;
	this.api = eval( social_type + '_manager' );
	this.init_data = eval( '__social_key.' + social_type );
}

social.prototype = {
	load : function(userdata, method_type, api_root, data, callback){
		this.init_data.accessToken = userdata.accessToken || null;
		this.init_data.accessTokenSecret = userdata.accessTokenSecret || null;

		this.api.init(this.init_data);
		this.api.trigger(method_type, api_root, data, callback);
	},
	
	login : function(req, callback){
		var self = this;
		
		var user = self.get_user_data(req.session.auth[self.social_type]);
		if(user){
			auth_m.get(user, function(user_data){
				if(user_data){
					self.update_session(req, user_data);
					callback({
						result : true
					});
				}
				else{
					self.register(user, req, callback);
				}
			});
		}
		else{
			callback({
				code : 0,
				result : false
			})
		}
	},
	
	get_user_data : function(session_data){
		var self = this;
		var user = {};
		
		if(self.social_type === 'twitter'){
			user.id = session_data.user.id + '_' + self.social_type;
			user.name = session_data.user.name;
			user.nick = session_data.user.screen_name;
			user.email = session_data.user.email || null;
			user.type = 'Twitter';
			user.level = 'Member';
			
			return user;
		}
		else if(self.social_type === 'google'){
			user.id = session_data.user.id + '_' + self.social_type;
			user.name = session_data.user.name;
			user.nick = session_data.user.name;
			user.email = session_data.user.email || null;
			user.type = 'Google';
			user.level = 'Member';
			
			return user;
		}
		else if(self.social_type === 'github'){
			user.id = session_data.user.id + '_' + self.social_type;
			user.name = session_data.user.name;
			user.nick = session_data.user.login;
			user.email = session_data.user.email || null;
			user.type = 'Github';
			user.level = 'Member';
			
			return user;
		}
		else{
			return null;
		}
	},
	
	register : function(user, req, callback){
		var self = this;
		
		auth_m.add(user, function(result){
			if(result){
				self.update_session(req, user);
				callback({ result : true });
			}
			else callback({ code : 1, result : false });
		});
	},
	
	update_session : function(req, user){
		var self = this;
		var session_user = {}
		
		var user_schema = auth_m.get_user_schema();
		for(var attr in user_schema){
			if(attr == 'pw' || attr == 'deleted')
				continue;
			session_user[attr] = user[attr];
		}
		req.session.auth[self.social_type].user = session_user || req.session.auth[self.social_type].user;
	}
}

module.exports = social