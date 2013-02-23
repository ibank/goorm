/**
 * author: sung-tae ryu
 * email: xenoz0718@gmail.com
 * node.js book example, Freelec
 **/

Array.prototype.removeByValue = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}

module.exports = {
	users: new Array(),

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
				
				self.join(socket, msg_obj);
			});
			
			socket.on('message', function (raw_msg) {
				var msg_obj = JSON.parse(raw_msg);
				var channel = "";

				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				
				if (channel == "chat") {
					self.msg(io, socket, msg_obj);
				}
				else if (channel == "editing") {
					self.editing(socket, msg_obj);
				}
			});
			
			socket.on('leave', function (raw_msg) {
				var msg_obj = JSON.parse(raw_msg);
				var channel = "";
				if(msg_obj["channel"] != undefined) {
					channel = msg_obj["channel"];
				}
				
				self.leave(socket, msg_obj);
			});
		}); 
		
		io.sockets.on('close', function (socket) {
			
		});
	},
	
	join: function (socket, msg) {
		socket.join(msg.workspace);
		socket.set('workspace', msg.workspace);
		
		this.users.push(msg.username);
		index = this.users.length - 1;
		
		socket.broadcast.to(msg.workspace).emit("someone_joined", JSON.stringify(this.users));
		socket.emit("someone_joined", JSON.stringify(this.users));
	},
	
	leave: function (socket, msg) {
		socket.leave(msg.workspace);
		
		this.users.removeByValue(msg.username);
		socket.broadcast.to(msg.workspace).emit("someone_leaved", msg.username);
		socket.broadcast.to(msg.workspace).emit("refresh_userlist", JSON.stringify(this.users));
	},
	
	msg: function (io, socket, msg) {
		var chatting_message = msg.username + " : " + msg.message;
			
		socket.broadcast.to(msg.workspace).emit("communication_message", chatting_message);
		socket.emit("communication_message", chatting_message);
	},
	
	editing: function (socket, msg) {
		socket.broadcast.to(msg.workspace).emit("editing_message", JSON.stringify(msg));
	}
};
