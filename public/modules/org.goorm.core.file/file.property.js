/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
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
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
		
		
		this.dialog = new org.goorm.core.file.property.dialog();
		this.dialog.init({
			title:"Property", 
			path:"configs/dialogs/org.goorm.core.file/file.property.html",
			width:480,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				//TabView Init
				self.tabview = new YAHOO.widget.TabView('property_file_contents');
			}
		});
		this.dialog = this.dialog.dialog;
		
		//this.dialog.panel.setBody("AA");
	},

	show: function () {
		var self = this;
		
		if(core.status.selected_file != null){			
			var postdata = {
				path: core.status.selected_file
			};

			$.get("file/get_property", postdata, function (data) {
				if (data.err_code==0) {
					$("#property_file_contents #filename").html(data.filename);
					$("#property_file_contents #fileType").html(data.filetype);
					$("#property_file_contents #fileLocation").html(data.path);
					$("#property_file_contents #fileSize").html(data.size+" byte");
					$("#property_file_contents #aTime").html(data.atime);
					$("#property_file_contents #mTime").html(data.mtime);
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
			alert.show("Not Selected");
		}
	}	
};