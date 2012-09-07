module.exports = {
	msg: function (socket, msg) {
		console.log(msg);
		socket.broadcast.to(msg.workspace).emit("composing_message", JSON.stringify(msg));
	}
};
