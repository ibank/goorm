/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module help
 **/

/**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class tipsAndTricks
 * @extends help
 **/
org.goorm.core.help.tipsAndTricks = function () {
	/**
	 * This presents the current browser version
	 * @property dialog
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
	 * @property tabView
	 **/
	this.tabView = null;
};

org.goorm.core.help.tipsAndTricks.prototype = {
	/**
	 * This function is an goorm core initializating function.  
	 * @method init 
	 **/
	
	init: function () {
		var self = this;
		
		var handleOk = function() { 
			
			this.hide(); 
		};

/*
		var handleCancel = function() { 
			
			this.hide(); 
		};
*/
		
		this.buttons = [ {text:"OK", handler:handleOk, isDefault:true} ]

						 
		this.dialog = new org.goorm.core.help.tipsAndTricks.dialog();
		this.dialog.init({
			title:"Tips_and_Tricks", 
			path:"configs/dialogs/org.goorm.core.help/help.tipsAndTricks.html",
			width:700,
			height:400,
		 	modal:true,
			buttons:this.buttons,
			success: function () {
				
			},
			kind:"tipsAndTricks"			
		});
		this.dialog = this.dialog.dialog;

		this.dialog.buttons[0].handler = handleOk;

		//alert.show(this.dialog.buttons[0].handler.toSource());
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method show 
	 **/
	show: function () {
		this.dialog.totalStep = $("div[id='tipAndTricksContents']").find(".wizardStep").size();
		this.dialog.panel.show();
	}
};
