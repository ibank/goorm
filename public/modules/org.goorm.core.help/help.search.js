/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.help.search = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
};

org.goorm.core.help.search.prototype = {
	init: function () {
		var self = this;
		
		var handle_close = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='close'>Close</span>", handler:handle_close, isDefault:true},
						 ]; 

		this.dialog = new org.goorm.core.help.search.dialog();
		this.dialog.init({
			title:"Help search", 
			path:"configs/dialogs/org.goorm.core.help/help.search.html",
			width:400,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				// //TabView Init
				// self.tabview = new YAHOO.widget.TabView('helpSearchContents');
// 				
				// //TreeView Init
				// self.treeview = new YAHOO.widget.TreeView("helpSearchTreeview");
				// self.treeview.render();
			}			
		});
		this.dialog = this.dialog.dialog;
	},
	
	show: function () {
		this.dialog.panel.show();
	}
};
