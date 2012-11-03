/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file._new = function () {
	this.dialog = null;
	this.buttons = null;
	this.is_new_anyway = false;
	this.dialog_explorer = null;
};

org.goorm.core.file._new.prototype = {
	init: function () { 
		var self = this;
		
		var handle_ok = function() {
		
			var data = self.dialog_explorer.get_data();
		
			if(data.path=="" || data.name=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);				// alert.show("File name is empty. Please fill it...");				return false;
			}

			var postdata = {
				new_anyway: self.is_new_anyway,
				path: data.path+"/"+data.name,
				type: data.type
			};
			
			$.get("file/new", postdata, function (data) {
				if (data.err_code == 99) {
					confirmation.init({
						// title: core.module.localization.msg["confirmation_new_title"], 
						// message: core.module.localization.msg["confirmation_new_message"],
						// yes_text: core.module.localization.msg["confirmation_yes"],
						// no_text: core.module.localization.msg["confirmation_no"],
//						title: "Confirmation", 
//						message: "Exist file. Do you want to make anyway?",
//						yes_text: "yes",
//						no_text: "no",

						title: "Confirmation", 
						message: "<span localization_key='confirmation_new_message'>Exist file. Do you want to make anyway?</span>",
						yes_text: "<span localization_key='yes'>Yes</span>",
						no_text: "<span localization_key='no'>No</span>",

						yes: function () {
							self.is_new_anyway = true;
							handle_ok();
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
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 

		this.dialog = new org.goorm.core.file._new.dialog();
		this.dialog.init({
			title:"New file", 
			path:"configs/dialogs/org.goorm.core.file/file._new.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons, 
			success: function () {
				var resize = new YAHOO.util.Resize("file_new_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#file_new_dialog_middle").width();
		            var w = ev.width;
		            $("#file_new_dialog_center").css('width', (width - w - 9) + 'px');
		        });
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_explorer = new org.goorm.core.dialog.explorer();

		//this.dialog.panel.setBody("AA");
	},

	show: function (context) {
		var self = this;
	
		this.is_new_anyway = false;
	
		self.dialog_explorer.init("#file_new", false);
	
		this.dialog.panel.show();
	}	
};