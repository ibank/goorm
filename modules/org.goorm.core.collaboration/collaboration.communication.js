module.exports = {
	files: [],
	
	msg: function (socket, msg) {
		chatting_message = msg.user + " : " + msg.message; 
		
		socket.broadcast.to(msg.workspace).emit("communication_message", chatting_message);
		socket.emit("communication_message", chatting_message);
	}
};
