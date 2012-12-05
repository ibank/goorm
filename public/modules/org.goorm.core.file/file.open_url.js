/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file.open_url = function () {
	this.dialog = null;
	this.tabview = null;
	this.buttons = null;
	this.treeview = null;
};

org.goorm.core.file.open_url.prototype = {
	init: function () { 
		
		var handle_ok = function() { 
			core.module.layout.workspace.window_manager.add($("#open_url_address").val(),$("#open_url_address").val(),"url","Editor");
			this.hide(); 
		};

		var handle_cancel = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.file.open_url.dialog();
		this.dialog.init({
			localization_key:"title_open_url",
			title:"Open URL", 
			path:"configs/dialogs/org.goorm.core.file/file.open_url.html",
			width:420,
			height:150,
			modal:true,
			buttons:this.buttons,
			yes_text:"<span localization_key='open'>Open</span>",
			no_text:"<span localization_key='cancel'>Cancel</span>",
		});
		this.dialog = this.dialog.dialog;
		
		//this.dialog.panel.setBody("AA");
	},

	show: function () {
		this.dialog.panel.show();
	}	
};