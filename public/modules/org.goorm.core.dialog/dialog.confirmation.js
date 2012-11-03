/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.dialog.confirmation = function () {
	this.panel = null;
	this.context_menu = null;
	this.path = null;
	this.title = null;
	this.type = null;
	this.left = null;
	this.top = null;
	this.width = null;
	this.height = null;
	this.yes_text = null;
	this.no_text = null;
	this.yes = null;
	this.no = null;
};

org.goorm.core.dialog.confirmation.prototype = {
	init: function (option) {
		var self = this;

		this.title = option["title"];
		this.message = option["message"];
		
		this.yes_text = option["yes_text"];
		this.no_text = option["no_text"];
		
		this.yes = option["yes"];
		this.no = option["no"];
		
		
		this.title = this.title.split(" ").join("_");
		this.timestamp = new Date().getTime();
		
		var handle_yes = function() { 
			if ( typeof self.yes == "function" )
				self.yes();
			this.hide(); 
		};
		
		var handle_no = function() { 
			if ( typeof self.no == "function" )
				self.no();
			this.hide(); 
		};
		
		if ($("#goorm_dialog_container").find("#panelContainer_" + this.title)) {
			$("#goorm_dialog_container").find("#panelContainer_" + this.title).remove();
		}
		
		$("#goorm_dialog_container").append("<div id='panelContainer_" + this.title + "'></div>");
		
		this.panel = new YAHOO.widget.SimpleDialog(
			"panelContainer_" + this.title, { 
				width: '400px',
				visible: false, 
				underlay: "none",
				close: true,
				draggable: true,
				text: this.message,
				constraintoviewport: true,
				fixedcenter: true,
				effect:{effect:YAHOO.widget.ContainerEffect.FADE,duration:0.2},
				buttons: [ 
					{ text:self.yes_text, handler:handle_yes, isDefault:true },
					{ text:self.no_text,  handler:handle_no } 
				] 
			} 
		);
		
		this.panel.setHeader(this.title.split("_").join(" "));
		this.panel.setBody("Loading Data...");
		this.panel.render();
		
		//$(document).unbind('keydown', 'esc');
		$(document).bind('keydown', 'esc', function () {
			if (self.panel.cfg.config.visible.value && !core.status.keydown) {
				self.panel.hide();
			}
		});
		
		//$(document).unbind('keydown', 'return');
		$(document).bind('keydown', 'return', function (e) {
			if (self.panel.cfg.config.visible.value && !core.status.keydown && !alert.panel.cfg.config.visible.value && !notice.panel.cfg.config.visible.value) {
				handle_yes();
						
				core.status.keydown = true;
			}
		});	
	}
	
};