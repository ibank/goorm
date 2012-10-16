/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module collaboration
 **/

/**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class settings
 * @extends collaboration
 **/
org.goorm.core.collaboration.settings = function () {
	/**
	 * This presents the current browser version
	 * @property dialog
	 * @type Object
	 * @default null
	 **/
	this.dialog = null;
	
	/**
	 * The array object that contains the information about buttons on the bottom of a dialog 
	 * @property buttons
	 * @type Object
	 * @default null
	 **/
	this.buttons = null;
	
	/**
	 * This presents the current browser version
	 * @property tabview
	 * @type Object
	 * @default null
	 **/
	this.tabview = null;
	
	/**
	 * This presents the current browser version
	 * @property treeview
	 * @type Object
	 * @default null
	 **/
	this.treeview = null;
};

org.goorm.core.collaboration.settings.prototype = {
	
	/**
	 * This function is an goorm core initializating function.  
	 * @constructor 
	 **/
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
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
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
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method show 
	 **/
	show: function () {
		$("#dialog_collaboration_settings #collaboration_server_url").val(core.preference['collaboration_server_url']);
		$("#dialog_collaboration_settings #collaboration_server_port").val(core.preference['collaboration_server_port']);
		
		if(core.user.last_name != null && core.user.first_name != null){
			$("#dialog_collaboration_settings #collaboration_nickname").val(core.user.last_name+" "+core.user.first_name).attr("readonly","readonly");
		}
		else {
			$("#dialog_collaboration_settings #collaboration_nickname").val(localStorage['collaboration_nickname']);
		}
		this.dialog.panel.show();
	}	
};