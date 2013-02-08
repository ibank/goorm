/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

module.exports = {
	files: [],
	
	msg: function (io, socket, msg) {
		
		if(msg.action == 'send_whisper_message'){
			var sessionid = msg.sessionid;
			
			var target_user = JSON.parse(msg.target_user);
			var target_id_type = target_user.user+'_'+target_user.type;

			var from_chatting_message = "From > " + msg.nick + "["+msg.user+"] : " + msg.message;
			var to_chatting_message = "To > " + target_user.nick + "["+target_user.user+"] : " + msg.message;
			
			var clients = io.sockets.clients();
			clients.forEach(function(client){
				client.get('id_type', function(err, data){
					if(data == target_id_type){
						io.sockets.sockets[client.id].emit('communication_whisper_message', from_chatting_message);
					};
				})
			});
			
			io.sockets.sockets[sessionid].emit('communication_whisper_message', to_chatting_message);
		}
		else{ // or msg.action = send_message
			var chatting_message = msg.nick + " : " + msg.message;
			
			socket.broadcast.to(msg.workspace).emit("communication_message", chatting_message);
			socket.emit("communication_message", chatting_message);
		}
	}
};
