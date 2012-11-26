/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.utility.toast = function () {
	this.panel = null
};

org.goorm.core.utility.toast.prototype = {
	init: function () {
		var self= this;
		
		this.panel = new YAHOO.widget.Panel("toast",
			{ 
				width:"240px", 
			 	fixedcenter:true, 
			 	close:false, 
			 	draggable:false, 
			 	zIndex:9999,
			 	modal:true,
			 	visible:false,
			 	underlay: "none",
			 	effect:{effect:YAHOO.widget.ContainerEffect.FADE, duration:0.5}
			} 
		);

		this.panel.setBody("");
		this.panel.render("goorm_dialog_container");
	},
	
	show: function (str) {
		var self = this;
		
		this.panel.setBody(str);
		this.panel.show();
		
		setTimeout(function () {
			self.panel.hide();
		},1000);
	}
};