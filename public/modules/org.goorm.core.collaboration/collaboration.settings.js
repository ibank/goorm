/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.collaboration.settings = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
};

org.goorm.core.collaboration.settings.prototype = {
	init: function () { 
		
		var handle_ok = function() { 
			localStorage['collaboration_nickname'] = $("#dialog_collaboration_settings #collaboration_nickname").val();
			
			core.preference['collaboration_server_url'] = $("#dialog_collaboration_settings #collaboration_server_url").val();
			core.preference['collaboration_server_port'] = $("#dialog_collaboration_settings #collaboration_server_port").val();
			
			core.preference.save();
			
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.collaboration.settings.dialog();
		this.dialog.init({
			title:"Settings", 
			path:"configs/dialogs/org.goorm.core.collaboration/collaboration.settings.html",
			width:700,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				//TabView Init
				self.tabview = new YAHOO.widget.TabView('settings_contents');
				
				//TreeView Init
				self.treeview = new YAHOO.widget.TreeView("settings_treeview");
				self.treeview.render();
				if(localStorage['collaboration_nickname'] == undefined || localStorage['collaboration_nickname'] == ""){
					localStorage['collaboration_nickname'] = "unknownUser";
				}
			}
		});
		this.dialog = this.dialog.dialog;
		
		//this.dialog.panel.setBody("AA");
	},
	
	show: function () {
		$("#dialog_collaboration_settings #collaboration_server_url").val(core.preference['collaboration_server_url']);
		$("#dialog_collaboration_settings #collaboration_server_port").val(core.preference['collaboration_server_port']);
		
		if(core.user.id != null){
			$("#dialog_collaboration_settings #collaboration_nickname").val(core.user.id).attr("readonly","readonly");
		}
		else {
			$("#dialog_collaboration_settings #collaboration_nickname").val(localStorage['collaboration_nickname']);
		}
		this.dialog.panel.show();
	}	
};