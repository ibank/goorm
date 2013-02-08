/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.help.about = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
};

org.goorm.core.help.about.prototype = {
	init: function () {
		var self = this;
		
		var handle_ok = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true}]; 
						 
		this.dialog = new org.goorm.core.help.about.dialog();
		this.dialog.init({
			localization_key:"title_about_goorm",
			title:"About goorm",
			path:"configs/dialogs/org.goorm.core.help/help.about.html",
			width:660,
			height:580,
			modal:true,
			buttons:this.buttons,
			success: function () {
				
			}			
		});
		this.dialog = this.dialog.dialog;
	}, 
	
	show: function () {
		this.dialog.panel.show();
	}
};
