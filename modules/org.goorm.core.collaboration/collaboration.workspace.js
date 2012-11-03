/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

module.exports = {
	workspaces: new Array(),
	users: new Array(),
	
	join: function (socket, msg) {
		console.log(msg.workspace);
		
		socket.join(msg.workspace);
		socket.set('workspace', msg.workspace);
	
		
		var index = 0;
		
		if ((index = this.workspaces.inArray(msg.workspace)) > -1) {
			this.users[index].list.push(msg.user);
		}
		else {
			this.workspaces.push(msg.workspace);
			this.users.push({workspace:msg.workspace, list:[]});
			this.users[this.users.length-1].list.push(msg.user);
			index = this.users.length - 1;
		}
		
		var return_msg = {
			user: msg.user,
			list: this.users[index].list
		};
		
		socket.broadcast.to(msg.workspace).emit("communication_someone_joined", JSON.stringify(return_msg));
		socket.emit("communication_someone_joined", JSON.stringify(return_msg));
	},
	
	leave: function (socket, msg) {
		socket.leave(msg.workspace);
		
		var index = 0;
		
		if ((index = this.workspaces.inArray(msg.workspace)) > -1) {
			var user_index = 0;
			
			if ((user_index = this.users[index].list.inArray(msg.user)) > -1) {
				this.users[index].list.remove(user_index);
			
				var return_msg = {
					user: msg.user,
					list: this.users[index].list 
				};
				
				socket.broadcast.to(msg.workspace).emit("communication_someone_leaved", JSON.stringify(return_msg));
			}
		}

		socket.broadcast.to(msg.workspace).emit("editing_someone_leaved", msg.user);
	}
};
