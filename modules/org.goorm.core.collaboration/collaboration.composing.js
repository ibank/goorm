/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

module.exports = {
	msg: function (socket, msg) {
		socket.broadcast.to(msg.workspace).emit("composing_message", JSON.stringify(msg));
	}
};
