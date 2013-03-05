/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.core.auth.dashboard = {
	socket: null,
	ip: null,
	access_time: null,
	
	init : function(){
		// this.socket = io.connect('http://localhost:3000');
	},

	access : function() {
		var self = this;
		var data = {
			'id' : core.user.id,
			'type' : core.user.type,
			'access_time' : new Date()
		}

		this.socket.emit('access', JSON.stringify(data));
	}
}