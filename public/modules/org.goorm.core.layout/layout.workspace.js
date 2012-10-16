/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.layout.workspace = function () {
	this.window_manager = null;
};

org.goorm.core.layout.workspace.prototype = {
	init: function (target) { 
		var self = this;
		
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