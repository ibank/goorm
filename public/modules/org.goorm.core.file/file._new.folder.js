/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.file._new.folder = function () {
	this.dialog = null;
	this.buttons = null;
	this.dialog_explorer = null;
};

org.goorm.core.file._new.folder.prototype = {
	init: function () { 
		var self = this;
		
		var handle_ok = function() {
		
			var data = self.dialog_explorer.get_data();
			
			if(data.path=="" || data.name=="") {
				//alert.show(core.module.localization.msg["alertFileNameEmpty"]);
				alert.show("Folder Name is empty.");
				return false;
			}
			else {
				
				var postdata = {
					current_path: data.path,
					folder_name: data.name
				};

				$.get("file/new_folder", postdata, function (data) {
					if (data.err_code==0) {
						core.module.layout.project_explorer.refresh();
					}
					else {
						alert.show(data.message);
					}
				});
			}
			
			this.hide();
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 

		this.dialog = new org.goorm.core.file._new.folder.dialog();
		this.dialog.init({
			title:"New folder", 
			path:"configs/dialogs/org.goorm.core.file/file._new.folder.html",
			width:400,
			height:500,
			modal:true,
			buttons:this.buttons, 
			success: function () {

			}
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_explorer = new org.goorm.core.dialog.explorer();
		
		//this.dialog.panel.setBody("AA");
	},
	
	show: function (context) {
		var self = this;

		self.dialog_explorer.init("#folder_new", true);
		
		this.dialog.panel.show();
	}
};