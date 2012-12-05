
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var user_permission_schema = {
	id: String,
	type : String,
	projects : String
};

var EventEmitter = require("events").EventEmitter;
var User = mongoose.model('user', new Schema(user_permission_schema));
var g_auth_manager = require('../org.goorm.auth/auth.manager.js')

module.exports = {
	get_projects : function(user, callback){
		User.findOne({'id':user.id, 'type':user.type}, function(err, user_data){
			if(user_data && user_data.projects){
				var projects = JSON.parse(user_data.projects);
				callback(projects);
			}
			else{
				callback(null);
			}
		});
	},
	
	set_projects : function(user, projects, callback){
		var self = this;
		
		User.update({'id':user.id, 'type':user.type}, {$set:{projects:projects}}, function(err){
			if(!err){
				callback(true);
			}
			else{
				console.log(err, 'User permission setting [fail]')
				callback(false);
			}
		})
	},
	
	lock_projects : function(user, projects, callback){
		var self = this;
		
		this.get_projects(user, function(current_projects){
			var evt = new EventEmitter();
			if(!current_project) current_project = {}
			
			evt.on('lock_projects', function(evt, i){
				if(projects[i]){
					current_projects[projects[i]] = true;
				}
				else{
					current_projects = JSON.stringify(current_projects);
					self.set_projects(user, current_projects, callback);
				}
			});
			evt.emit('lock_projects', evt, 0);
		});
	},
	
	unlock_projects : function(user, projects, callback){
		var self = this;
		
		this.get_projects(user, function(current_projects){
			var evt = new EventEmitter();
			if(!current_project) current_project = {}
			
			evt.on('lock_projects', function(evt, i){
				if(projects[i]){
					current_projects[projects[i]] = false;
				}
				else{
					current_projects = JSON.stringify(current_projects);
					self.set_projects(user, current_projects, callback);
				}
			});
			evt.emit('lock_projects', evt, 0);
		});
	}
}