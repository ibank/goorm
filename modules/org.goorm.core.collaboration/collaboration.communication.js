/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

module.exports = {
	files: [],
	
	msg: function (socket, msg) {
		chatting_message = msg.user + " : " + msg.message; 
		
		socket.broadcast.to(msg.workspace).emit("communication_message", chatting_message);
		socket.emit("communication_message", chatting_message);
	}
};
