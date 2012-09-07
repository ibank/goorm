/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.dialog = function () {
	this.panel = null;
	this.container_id = null;
	this.context_menu = null;
	this.path = null;
	this.title = null;
	this.type = null;
	this.left = null;
	this.top = null;
	this.width = null;
	this.height = null;
	this.yes = null;
	this.no = null;
	this.buttons = null;
	this.success = null;
	this.zindex = null;
	this.modal = null;		
};

org.goorm.core.dialog.prototype = {
	init: function (option, appendded) {
		var self = this;

		this.title = option["title"];
		this.path = option["path"];		
		this.width = option["width"];
		this.height = option["height"];
		this.modal = option["modal"];
		this.zindex = parseInt(option["zindex"]);
		
		// this.yes_text = option["yes_text"];
		// this.no_text = option["no_text"];	
		this.buttons = option["buttons"];
		// this.yes = option["yes"];
		// this.no = option["no"];
		
		this.success = option["success"];
		
		this.title = this.title.split(" ").join("_");
		this.timestamp = new Date().getTime();
		
		
		if (appendded == undefined) {
			appendded = false;
		}
		
		
		if ($("#goorm_dialog_container").find("#panelContainer_" + this.title)) {
			$("#goorm_dialog_container").find("#panelContainer_" + this.title).remove();
		}
		
		
		this.container_id = "panelContainer_" + this.title + "_" + this.timestamp;
		
		
		
		$("#goorm_dialog_container").append("<div id='" + this.container_id + "'></div>");
		
		this.panel = new YAHOO.widget.Dialog(
			this.container_id, { 
				width: self.width+'px',
				height: self.height+'px', 
				visible: false, 
				underlay: "none",
				close: true,
				autofillheight: "body",
				draggable: true,
				constraintoviewport: true,
				modal: false,
				zindex: self.zindex,
				fixedcenter: true,
				effect:{effect:YAHOO.widget.ContainerEffect.FADE,duration:0.2},
				buttons:  this.buttons
					// [ { text:self.yes_text, handler:handle_yes, isDefault:true },
					// { text:self.no_text,  handler:handle_no }] 
				 
			} 
		);

		this.panel.setHeader(this.title.split("_").join(" "));
		this.panel.setBody("Loading Data...");
		this.panel.render();
		

		//$(document).unbind('keydown', 'esc');
		$(document).bind('keydown', 'esc', function () {
			if (confirmation.panel == undefined) {
				confirmation.panel = {};
				confirmation.panel.cfg = {};
				confirmation.panel.cfg.config = {};
				confirmation.panel.cfg.config.visible = {};
				confirmation.panel.cfg.config.visible.value = false;
			}
			
			if (self.buttons && self.panel.cfg.config.visible.value && !core.status.keydown && !alert.panel.cfg.config.visible.value && !notice.panel.cfg.config.visible.value && !confirmation.panel.cfg.config.visible.value) {
				$(self.buttons).each(function (i) { 
					if (this.text == "Cancel") {
						this.hide = function(){};
						this.handler();
						
						core.status.keydown = true;
				
						self.panel.hide();
					}
				});
			}
		});
		
		//$(document).unbind('keydown', 'return');
		$(document).bind('keydown', 'return', function (e) {
			if (confirmation.panel == undefined) {
				confirmation.panel = {};
				confirmation.panel.cfg = {};
				confirmation.panel.cfg.config = {};
				confirmation.panel.cfg.config.visible = {};
				confirmation.panel.cfg.config.visible.value = false;
			}
		
			if (self.buttons && self.panel.cfg.config.visible.value && !core.status.keydown && !alert.panel.cfg.config.visible.value && !notice.panel.cfg.config.visible.value && !confirmation.panel.cfg.config.visible.value) {
				$(self.buttons).each(function (i) {
					if (this.isDefault) {
						console.log("!");
						
						this.hide = function(){};
						this.handler();
						
						core.status.keydown = true;
					}
				});
			}
		});		
		
		

		
		var url = "file/get_contents";	
		
		$.ajax({
			url: url,			
			type: "GET",
			data: "path=public/" + self.path,
			success: function(data) {

				self.panel.setBody(data);
				
				if ($.isFunction(self.success))
					self.success();
				
				if (!appendded) {
					
					core.dialog.loaded_count++;
					
					if (core.dialog.loaded_count == (Object.keys(core.dialog).length - 1)) {
	/*
						$(core).trigger("coreDialogLoaded");
	*/
					}
					
	
					$(core).trigger("goorm_loading");
				}
			}
		});
		
		
		return this;
	}
	
};