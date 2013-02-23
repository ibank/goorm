/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file.property = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
};

org.goorm.core.file.property.prototype = {
	init: function () { 
		
		var handle_ok = function() { 
			
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
		
		
		this.dialog = new org.goorm.core.file.property.dialog();
		this.dialog.init({
			localization_key:"title_property",
			title:"Property", 
			path:"configs/dialogs/org.goorm.core.file/file.property.html",
			width:480,
			height:400,
			modal:true,
			buttons:this.buttons,
			success: function () {
				//TabView Init
				self.tabview = new YAHOO.widget.TabView('property_file_contents');
			}
		});
		this.dialog = this.dialog.dialog;
	},

	show: function () {
		var self = this;
		
		if(core.status.selected_file != null){			
			var postdata = {
				path: core.status.selected_file
			};

			$.get("file/get_property", postdata, function (data) {
				if (data.err_code==0) {
					function convert_date (target_date) {
						var date = new Date(target_date);
						var month = parseInt(date.getMonth()) + 1;
						var tmp_date = date.getFullYear() + "/" + month + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
						return tmp_date;
					}
					
					$("#property_file_contents #filename").html(data.filename);
					$("#property_file_contents #fileType").html(data.filetype);
					$("#property_file_contents #fileLocation").html(data.path);
					$("#property_file_contents #fileSize").html(data.size+" bytes");
					$("#property_file_contents #aTime").html(convert_date(data.atime));
					$("#property_file_contents #mTime").html(convert_date(data.mtime));
					self.dialog.panel.show();
				}
				else {
					$("#property_file_contents #filename").html("");
					$("#property_file_contents #fileType").html("");
					$("#property_file_contents #fileLocation").html("");
					$("#property_file_contents #fileSize").html("");
					$("#property_file_contents #aTime").html("");
					$("#property_file_contents #mTime").html("");
					alert.show(data.message);
				}
			});			
		}
		else {
			// alert.show("Not Selected");
			alert.show(core.module.localization.msg['alert_file_not_select'])
		}
	}	
};