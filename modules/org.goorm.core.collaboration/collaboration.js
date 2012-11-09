/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var users = require('./collaboration.users.js');
var workspace = require('./collaboration.workspace.js');
var communication = require('./collaboration.communication.js');
var editing = require('./collaboration.editing.js');
var composing = require('./collaboration.composing.js');
var drawing = require('./collaboration.drawing.js');
var slideshare = require('./collaboration.slideshare.js');
var updating = require('./collaboration.updating.js');

module.exports = {
	start: function (io) {
		var self = this;
		
		io.set('log level', 0);
		io.sockets.on('connection', function (socket) {
			socket.on('join', function (raw_msg) {
				var msg_obj = JSON.parse(raw_msg);

				var channel = "";
				
				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				
				if (channel == "workspace") {
					workspace.join(socket, msg_obj);
				}
			});
			
			socket.on('message', function (raw_msg) {
				var msg_obj = JSON.parse(raw_msg);
				
				var channel = "";

				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				
				if (channel == "communication") {
					communication.msg(socket, msg_obj);
				}
				else if (channel == "editing") {
					updating.push(msg_obj.workspace, msg_obj);
					editing.msg(socket, msg_obj);
				}
				else if (channel == "composing") {
					composing.msg(socket, msg_obj);
				}
				else if (channel == "drawing") {
					drawing.msg(socket, msg_obj);
				}
				else if (channel == "slideshare") {
					slideshare.msg(socket, msg_obj);
				}
			});
			
			socket.on('leave', function (raw_msg) {
				var msg_obj = JSON.parse(raw_msg);
				
				var channel = "";

				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				
				if (channel == "workspace") {
					workspace.leave(socket, msg_obj);
				}
			});
		}); 
		
		io.sockets.on('close', function (socket) {
			
		});
	}
};
