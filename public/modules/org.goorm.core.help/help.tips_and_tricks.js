/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.help.tips_and_tricks = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
};

org.goorm.core.help.tips_and_tricks.prototype = {
	init: function () {
		var self = this;
		
		var handle_ok = function() { 
			
			this.hide(); 
		};

/*
		var handle_cancel = function() { 
			
			this.hide(); 
		};
*/
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true} ]

						 
		this.dialog = new org.goorm.core.help.tips_and_tricks.dialog();
		this.dialog.init({
			localization_key:"title_tip_and_tricks",
			title:"Tips and Tricks", 
			path:"configs/dialogs/org.goorm.core.help/help.tips_and_tricks.html",
			width:700,
			height:400,
		 	modal:true,
			buttons:this.buttons,
			success: function () {
				
			},
			kind:"tipsAndTricks"			
		});
		this.dialog = this.dialog.dialog;

		this.dialog.buttons[0].handler = handle_ok;

		//alert.show(this.dialog.buttons[0].handler.toSource());
	},

	show: function () {
		this.dialog.total_step = $("div[id='tip_and_tricks_contents']").find(".wizard_step").size();
		this.dialog.panel.show();
	}
};
