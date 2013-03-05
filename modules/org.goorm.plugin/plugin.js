/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var walk = require('walk');
var g_env = require("../../configs/env.js");
var EventEmitter = require("events").EventEmitter;

module.exports = {
	get_list: function (evt) {
		var self = this;
		plugins = [];
		
		var options = {
			followLinks: false
		};
				
		walker = walk.walk(__path + "plugins", options);
		
		walker.on("directories", function (root, dirStatsArray, next) {
			if (root == __path + "plugins" ) {
				for (var i=0; i<dirStatsArray.length; i++) {
					if (dirStatsArray[i].name != '.svn') {
						plugins.push({name:dirStatsArray[i].name});
					}
				}
				
				evt.emit("plugin_get_list", plugins);
			}
			
			next();
		});
		
		walker.on("end", function () {
		});
	},
	
	do_new: function (req, res) {
		var plugin = require("../../plugins/"+req.plugin+"/modules/");
		plugin.do_new(req, res);
	},
	
	debug_server: function (io) {
		var self = this;
		console.log("debug server started");
		io.set('log level', 0);
		io.sockets.on('connection', function (socket) {
			var plugin = null;
			var evt = new EventEmitter();
			
			console.log("debug server connected");
			
			evt.on("response", function (data) {
				console.log(data);
				socket.emit("debug_response", data);
			});
			
			socket.on('debug', function (msg) {
				if(msg.mode == "init") {
					if(plugin !== null) {
						plugin.debug({"mode":"close"}, evt);
					}
					plugin = require("../../plugins/"+msg.plugin+"/modules/");
				}
				if(plugin !== null) {
					plugin.debug(msg, evt);
				}
			});
		});
	},
	
	run: function (req, res) {
		var plugin = require("../../plugins/"+req.plugin+"/modules/");
		plugin.run(req, res);
	},
	
	extend_function: function (req, res) {
		var plugin = require("../../plugins/"+req.plugin+"/modules/");
		plugin.extend_function(req, res);
	},
	extend_function_sign_check: function (req, evtt) {
		//console.log("SDAFASFDASDFA");
		var plugin = require("../../plugins/"+"org.goorm.plugin.lecture"+"/modules/");
		var evt = new EventEmitter();
		var ret={}
		evt.on("auth_check_user_data", function (data) {
			if(data.result){
				var g_auth_manager = require("../org.goorm.auth/auth.manager");
				
				g_auth_manager.register(req, function(result){
				
					ret.type='signup';
					ret.data=result;
					evtt.emit("auth_check_user_data_final", ret);
				
				});
			}
			else{
				ret.type='check';
					ret.data=data;
					evtt.emit("auth_check_user_data_final", ret);
			}
		});
		
		plugin.extend_function_sign_check(req.body, evt);
	}
};
