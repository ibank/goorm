/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
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
var history = require('./collaboration.history.js');

module.exports = {
	start: function (io) {
		var self = this;
		self.soc = io;
		io.set('log level', 0);
		io.sockets.on('connection', function (socket) {
			socket.on('join', function (raw_msg) {
				var msg_obj = JSON.parse(raw_msg);
				var channel = "";
				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				
				if (channel == "workspace") {
					workspace.join(io, socket, msg_obj);
				}
				else if(channel == "filepath") {
					history.join(socket, msg_obj);
					editing.send_cursors(socket, msg_obj);
				}
			});
			
			socket.on('message', function (raw_msg) {
				var msg_obj = JSON.parse(raw_msg);
				var channel = "";

				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				
				if (channel == "communication") {
					communication.msg(io, socket, msg_obj);
				}
				else if (channel == "editing") {
					editing.msg(io, socket, msg_obj);
					history.msg(io, socket, msg_obj);
				}
				else if (channel == "history") {
					history.command_msg(io, socket, msg_obj);	// merge&delete, delay msgs..
				}
				else if (channel == "composing") {
					composing.msg(io, socket, msg_obj);
				}
				else if (channel == "drawing") {
					drawing.msg(io, socket, msg_obj);
				}
				else if (channel == "slideshare") {
					slideshare.msg(io, socket, msg_obj);
				}
				else if (channel == "workspace") {
					workspace.msg(io, socket, msg_obj);
				}
			});
			
			socket.on('leave', function (raw_msg) {
				var msg_obj = JSON.parse(raw_msg);
				var channel = "";
				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				
				if (channel == "workspace") {
					workspace.leave(io, socket, msg_obj);
				}
				else if(channel == "filepath"){
					editing.leave(io, socket, msg_obj);
					history.leave(socket, msg_obj);
				}
			});

			socket.on('invite', function(raw_msg) {
				var msg_obj = JSON.parse(raw_msg);
				var channel = "";
				var action = "";
				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				if(msg_obj["action"] != undefined) {
					action = msg_obj["action"];
				}

				if (channel == "workspace") {
					if(action == "invite")
						workspace.invite(io, socket, msg_obj);
					else if(action == 'invitation_answer')
						workspace.invitation_answer(io, socket, msg_obj);
				}
			});

			socket.on('slideshare',function(raw_msg){
				var msg_obj = JSON.parse(raw_msg);
				var channel = "";
				if(msg_obj["channel"]!=undefined){
					channel = msg_obj["channel"];
				}
				//socket.broadcast.to(msg_obj.workspace).emit('slideshare_get',JSON.stringify(msg_obj));
				
				io.sockets.in(msg_obj.workspace).emit('slideshare_get',JSON.stringify(msg_obj));
				
				/*switch(channel){
					
				}*/
			});
			
			// Quiz
			//
			socket.on('quiz', function(raw_msg){
				var msg_obj = JSON.parse(raw_msg);
				var channel = "";
				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}

				if (channel == "start") {
					io.sockets.emit('quiz_start', JSON.stringify(msg_obj));
				}
				else if(channel == 'stop') {
					io.sockets.emit('quiz_stop', JSON.stringify(msg_obj));
				}
			})
		}); 
		
		io.sockets.on('close', function (socket) {
			
		});
	},

	get_io : function(){
		return this.soc;
	},

	lecture : function(path, file_name, file_type){
		this.soc.sockets.emit('open_source_code',{path: path, file_name: file_name, file_type: file_type});
	}
};
