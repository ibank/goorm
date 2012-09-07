/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module file
 **/

/**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class openURL
 * @extends file
 **/
org.goorm.core.file.openURL = function () {
	/**
	 * This presents the current browser version
	 * @property dialog
	 **/
	this.dialog = null;
	/**
	 * This presents the current browser version
	 * @property tabView
	 **/
	this.tabView = null;
	
	/**
	 * The array object that contains the information about buttons on the bottom of a dialog 
	 * @property buttons
	 * @type Object
	 * @default null
	 **/
	this.buttons = null;
	
	/**
	 * This presents the current browser version
	 * @property treeView
	 **/
	this.treeView = null;
};

org.goorm.core.file.openURL.prototype = {
	
	/**
	 * This function is an goorm core initializating function.  
	 * @constructor 
	 **/
	init: function () { 
		
		var handleOk = function() { 
			core.mainLayout.workSpace.windowManager.add($("#openURLaddress").val(),$("#openURLaddress").val(),"url");
			this.hide(); 
		};

		var handleCancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK", handler:handleOk, isDefault:true},
						 {text:"Cancel",  handler:handleCancel}]; 
						 
		this.dialog = new org.goorm.core.file.openURL.dialog();
		this.dialog.init({
			title:"Open URL", 
			path:"configs/dialogs/org.goorm.core.file/file.openURL.html",

			width:420,
			height:150,

			modal:true,
			buttons:this.buttons,
			yesText:"Open",
			noText:"Cancel",
		});
		this.dialog = this.dialog.dialog;
		
		//this.dialog.panel.setBody("AA");
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method show 
	 **/
	show: function () {
		this.dialog.panel.show();
	}	
};