/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.dialog.alert = function () {
	this.panel = null;
	this.context_menu = null;
	this.path = null;
	this.title = null;
	this.message = null;
	this.image_url = null;
	this.type = null;
	this.left = null;
	this.top = null;
	this.width = null;
	this.height = null;
};

org.goorm.core.dialog.alert.prototype = {
	init: function () {
		var self = this;

		this.title = "Alert";
		this.image_url = "images/org.goorm.core.dialog/dialog_alert.png";
		
		this.title = this.title.split(" ").join("_");
		this.timestamp = new Date().getTime();
		
		var handle_yes = function() { 
			this.hide();
		};

		if ($("#goorm_dialog_container").find("#panelContainer_" + this.title)) {
			$("#goorm_dialog_container").find("#panelContainer_" + this.title).remove();
		}
		
		$("#goorm_dialog_container").append("<div id='panelContainer_" + this.title + "'></div>");
		
		this.panel = new YAHOO.widget.SimpleDialog(
			"panelContainer_" + this.title, { 
				width: '300px',
				height: '160px',
				visible: false, 
				underlay: "none",
				close: true,
				draggable: true,
				modal: true,
				text: "",
				constraintoviewport: true,
				fixedcenter: true,
				effect:{effect:YAHOO.widget.ContainerEffect.FADE,duration:0.2},
				buttons: [ 
					{ text:"<span localization_key='ok'>OK</span>", handler:handle_yes, isDefault:true }
				] 
			} 
		);
		
		this.panel.setHeader(this.title.split("_").join(" "));
		this.panel.setBody("Loading Data...");
		this.panel.render();

		$("#panelContainer_" + this.title).find(".button-group").css("text-align", "center");
		
		//$(document).unbind('keydown', 'esc');
		$(document).bind('keydown', 'esc', function () {
			if (self.panel.cfg.config.visible.value && !core.status.keydown) {
				self.panel.hide();
			}
		});
		
		//$(document).unbind('keydown', 'return');
		$(document).bind('keydown', 'return', function (e) {
			if (self.buttons && self.panel.cfg.config.visible.value && !core.status.keydown) {
				$(self.buttons).each(function (i) {
					if (this.isDefault) {
						this.hide = function(){};
						this.handler();
						
						core.status.keydown = true;
					}
				});
			}
		});	
				
	},
	
	show: function (message) {
		this.message = message;
		
		$("#panelContainer_" + this.title).find(".bd").empty();
		$("#panelContainer_" + this.title).find(".bd").append(this.message);
		$("#panelContainer_" + this.title).find(".bd").prepend("<div class='alert_image_div'><img src='"+this.image_url+"'/></div>");
		$("#panelContainer_" + this.title).find(".bd").css("text-align", "left");
		
		this.panel.show();
	}
	
};