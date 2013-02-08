/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

module.exports = {
	files: [],
	
	msg: function (socket, msg) {
		/*
		 * msg = {slide_url, page}
		 */
		var message = {slide_url: msg.slide_url, page:msg.page};
		
		socket.broadcast.to(msg.workspace).emit("slideshare_message", message);
		socket.emit("slideshare_message", message);
	}
};
