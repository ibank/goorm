module.exports = {
	msg: function (socket, msg) {
		socket.broadcast.to(msg.workspace).emit("editing_message", JSON.stringify(msg));
	}
};
