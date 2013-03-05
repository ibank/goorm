/*
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
var EventEmitter = require("events").EventEmitter;
module.exports = {
	files: [],
	
	msg: function (io, socket, msg) {
		/*
		 * msg = {slide_url, page}
		 */
		 var message;
		 if(msg.type=="request"){

		 	/*var clients = io.sockets.clients();
		 	for(var i=0 ;i<clients.length;i++){
		 		var client = clients[i];
		 		if(client.store.store)
		 		console.log("client id:",client.store.store,"msg id:",msg.userid);
		 		if(client.store.data.id_type && client.store.data.id_type.id == msg.userid){
		 			console.log("client id:",client.id,"msg id:",msg.userid);
		 			io.sockets.in(msg.workspace).emit("synchronize_request", '{"id":'+client.id+'}');
		 		}
		 	}*/
		 	var user_list = [{id:msg.userid,type:"password"}];
		 	var evt_user = new EventEmitter();
			var clients = io.sockets.clients();

			evt_user.on('get_user', function(evt_user, user_index){
				if(user_list[user_index] != undefined){
					var user = user_list[user_index];
					var evt_client = new EventEmitter();

					evt_client.on('is_connected', function(evt_client, i){
						if(clients[i] != undefined){
							var client = clients[i];

							client.get('id_type', function(err, id_type){
								if(JSON.stringify({'id':user.id, 'type':user.type}) == id_type){
									
									var data =  {"userid":client.id};
									
									socket.broadcast.to(msg.workspace).emit("synchronize_request", JSON.stringify(data));
									evt_user.emit('get_user', evt_user, ++user_index);
								}
								else{
									evt_client.emit('is_connected', evt_client, ++i);
								}
							})
						}
						else{
							evt_user.emit('get_user', evt_user, ++user_index);
						}
					});	
					evt_client.emit('is_connected', evt_client, 0);
				}
			});
			evt_user.emit('get_user', evt_user, 0);
		 	
		 }else if(msg.type == "respond"){
		 	message = {slide_url: msg.slide_url, page:msg.page, img:msg.img};
		 	io.sockets.sockets[msg.id].emit("slideshare_message",message);
		 }else{
			message = {slide_url: msg.slide_url, page:msg.page};
		
			socket.broadcast.to(msg.workspace).emit("slideshare_message", message);
			////socket.emit("slideshare_message", message);
		
			//io.sockets.in(msg.workspace).emit("slideshare_message", message);
		}
	}
};

/*{ store: 
   { options: undefined,
     clients: 
      { sQAw_2KrN1032RAoUaLh: [Object],
        G6F7aLxKgWmQ7huQUaLi: [Circular] },
     manager: 
      { server: [Object],
        namespaces: [Object],
        sockets: [Object],
        _events: [Object],
        settings: [Object],
        handshaken: [Object],
        connected: [Object],
        open: [Object],
        closed: {},
        rooms: [Object],
        roomClients: [Object],
        oldListeners: [Object],
        sequenceNumber: 743547618,
        gc: [Object] } },
  id: 'G6F7aLxKgWmQ7huQUaLi',
  data: 
   { workspace: 'dudbstjr70_w',
     id_type: '{"id":"yys1221","type":"password"}' } }*/