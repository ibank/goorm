var users = require('./collaboration.users.js');
var workspace = require('./collaboration.workspace.js');
var communication = require('./collaboration.communication.js');
var editing = require('./collaboration.editing.js');
var composing = require('./collaboration.composing.js');
var drawing = require('./collaboration.drawing.js');


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
					editing.msg(socket, msg_obj);
				}
				else if (channel == "composing") {
					composing.msg(socket, msg_obj);
				}
				else if (channel == "drawing") {
					drawing.msg(socket, msg_obj);
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
