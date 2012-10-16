/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
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
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true}]; 
						 
		this.dialog = new org.goorm.core.help.about.dialog();
		this.dialog.init({
			title:"About goorm",
			path:"configs/dialogs/org.goorm.core.help/help.about.html",
			width:650,
			height:600,
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
