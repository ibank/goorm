/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.collaboration.workspace = {
	socket: null,

	init: function() {
		var self = this;
		
		this.socket = io.connect();
		
		this.socket.on("workspace_message", function (data) {
 			data = JSON.parse(data);

 			if(data.workspace == ''){
 				return;
 			}

 			if (data.workspace == core.status.current_project_path && data.user != core.user.id) {
	 			core.module.layout.project_explorer.refresh(false);
 			}
		});
		
		
		$(core).bind("project_explorer_refreshed", function () {
			self.socket.emit("message", '{"channel": "workspace", "action":"project_explorer_refresh", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "type":"'+core.user.type+'", "workspace": "'+ core.status.current_project_path + '"}');
		});
		
	}
};
