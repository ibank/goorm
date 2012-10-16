module.exports = {
	files: [],
	
	msg: function (socket, msg) {
		/*
		 * msg = {slide_url, page}
		 */
//		console.log(111,msg);
		var message = {slide_url: msg.slide_url, page:msg.page};
		
		socket.broadcast.to(msg.workspace).emit("slideshare_message", message);
		socket.emit("slideshare_message", message);
	}
};
