/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.layout.workspace = function () {
	this.window_manager = null;
	this.collaboration = null;
};

org.goorm.core.layout.workspace.prototype = {
	init: function (target) { 
		var self = this;
		
		this.collaboration = new org.goorm.core.collaboration.workspace();
		$(core).bind('goorm_login_complete', function(){
			self.collaboration.init();
		})
		
		//attaching tab element
		$("#"+target).append("<div id='workspace'></div>");
		
		//attaching window manager
		this.attach_window_manager('workspace');
		
		$("#workspace").mousedown(function (e) {
			$("#workspace").find(".hd").each(function(i) {
				$(this).removeClass("activated");
			});
		});
	},

	attach_window_manager: function(target) {
		//attaching window manager
		this.window_manager = new org.goorm.core.window.manager();
		this.window_manager.init(target);
	}
};