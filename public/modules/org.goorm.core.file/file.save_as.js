/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.file.save_as = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.dialog_explorer = null;
	this.is_save_anyway = false;
	this.contents_data = null;
};

org.goorm.core.file.save_as.prototype = {
	init: function () { 
		var self = this;
		
		var handle_save = function() {
		
			var data = self.dialog_explorer.get_data();
		
			if(data.path=="" || data.name=="") {
				//alert.show(core.module.localization.msg["alertFileNameEmpty"]);
				alert.show("File Name is Empty.");
				return false;
			}

			var postdata = {
				save_anyway: self.is_save_anyway,
				path: data.path+"/"+data.name,
				type: data.type,
				data: self.contents_data
			};
			
			$.get("file/save_as", postdata, function (data) {
				if (data.err_code == 99) {
					confirmation.init({
/*
						title: core.module.localization.msg["confirmationNewTitle"], 
						message: core.module.localization.msg["confirmationNewMessage"],
						yes_text: core.module.localization.msg["confirmation_yes"],
						no_text: core.module.localization.msg["confirmation_no"],
*/
						title: "Confirmation", 
						message: "Exist file. Do you want to save anyway?",
						yes_text: "yes",
						no_text: "no",
						yes: function () {
							self.is_save_anyway = true;
							handle_save();
						}, no: function () {
						}
					});
					
					confirmation.panel.show();
				}
				else if (data.err_code == 0) {
					self.dialog.panel.hide();
					core.module.layout.project_explorer.refresh();
				}
				else {
					alert.show(data.message);
				}
			});
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"Save", handler:handle_save, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}];
						 
		this.dialog = new org.goorm.core.file.save_as.dialog();
		this.dialog.init({
			title:"Save as", 
			path:"configs/dialogs/org.goorm.core.file/file.save_as.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				var resize = new YAHOO.util.Resize("save_as_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#save_as_dialog_middle").width();
		            var w = ev.width;
		            $("#save_as_dialog_center").css('width', (width - w - 9) + 'px');
		        });
		        
			}
		});
		this.dialog = this.dialog.dialog;

		this.dialog_explorer = new org.goorm.core.dialog.explorer();
	},
	
	show: function () {
		var self = this;
	
		self.contents_data = "";
		self.is_save_anyway = false;
	
		var window_manager = core.module.layout.workspace.window_manager;

		if (window_manager.active_window<0) {
			//alert.show(core.module.localization.msg.alert_file_not_opened);
			alert.show("file not opened");
		}
		else {
			if(window_manager.window[window_manager.active_window].designer != undefined) {
				self.contents_data = window_manager.window[window_manager.active_window].designer.get_contents();
			}
			else if(window_manager.window[window_manager.active_window].editor != undefined) {
				self.contents_data = window_manager.window[window_manager.active_window].editor.get_contents();
			}
		}
		
		self.dialog_explorer.init("#file_save_as", false);
		self.dialog.panel.show();
	}	
};