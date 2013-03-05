/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

module.exports = {
	user_cursors: {},
	
	send_cursors: function(socket, msg) {
		socket.emit("editing_get_cursors", this.get_last_user_cursors(msg.filename));
	},
	
	leave: function(io, socket, msg) {
		delete this.user_cursors[msg.user];
		//socket.broadcast.to(msg.workspace).emit("editing_someone_leaved", msg.nick);
		io.sockets.in(msg.workspace).emit("editing_someone_leaved", msg.nick);
	},
	
	msg: function (io, socket, msg) {
		io.sockets.in(msg.workspace).emit("editing_message", JSON.stringify(msg));
		if (msg.action == 'cursor') this.user_cursors[msg.user] = msg;
	},
	
	get_last_user_cursors: function (filename) {
		var ret = [];
		for (var user in this.user_cursors) {
			var cursor = this.user_cursors[user];
			if ((cursor != undefined) && (cursor.filepath == filename)) {
				ret.push(cursor);
			}
		}
		return ret;
	}
};
