/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file._export = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.dialog_explorer = null;
};

org.goorm.core.file._export.prototype = {
	init: function () { 
		var self = this;
		
		var handle_ok = function() {
		
			var data = self.dialog_explorer.get_data();

			if(data.path=="" || data.name=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);
				// alert.show("Not Selected.");
				return false;
			}

			var postdata = {
				user: core.user.first_name+"_"+core.user.last_name,
				path: data.path,
				file: data.name
			};
								
			$.get("file/export", postdata, function (data) {
				if (data.err_code == 0) {
					self.dialog.panel.hide();
					
					var downloaddata = {
						file: data.path	
					};
					
					location.href = "download/?file="+data.path;
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
						 
		this.dialog = new org.goorm.core.file._export.dialog();
		this.dialog.init({
			title:"Export File", 
			path:"configs/dialogs/org.goorm.core.file/file._export.html",
			width:800,
			height:500,
			modal:true,
			yes_text:"<span localization_key='open'>Open</span>",
			no_text:"<span localization_key='cancel'>Cancel</span>",
			buttons:this.buttons,
			success: function () {
				var resize = new YAHOO.util.Resize("file_export_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#file_export_dialog_middle").width();
		            var w = ev.width;
		            $("#file_export_dialog_center").css('width', (width - w - 9) + 'px');
		        });
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_explorer = new org.goorm.core.dialog.explorer();
		
		//this.dialog.panel.setBody("AA");
	},
	
	show: function () {
		var self = this;
			
		self.dialog_explorer.init("#file_export", false);
	
		this.dialog.panel.show();
	}
};