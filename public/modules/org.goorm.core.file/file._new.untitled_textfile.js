/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file._new.untitled_textfile = function () {
	this.dialog = null;
	this.buttons = null;
	this.dialog_explorer = null;
};

org.goorm.core.file._new.untitled_textfile.prototype = {
	init: function () { 
		var self = this;
		
		var handle_ok = function() {

			var data = self.dialog_explorer.get_data();

			if(data.path=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);
				// alert.show("Target location is empty. Please fill it...");
				return false;
			}

			var postdata = {
				current_path: data.path
			};

			$.get("file/new_untitled_text_file", postdata, function (data) {
				var received_data = data;
				
				if (data.err_code==0) {
					//core.module.layout.workspace.window_manager.open("../../project/"+$("#text_new_input_location_path").val(), received_data.filename, "txt");
					core.module.layout.project_explorer.refresh();
				}
				else {
					alert.show(data.message);
				}

			});

			this.hide();
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 

		this.dialog = new org.goorm.core.file._new.untitled_textfile.dialog();
		this.dialog.init({
			title:"New Untitled Text File", 
			path:"configs/dialogs/org.goorm.core.file/file._new.untitled_textfile.html",
			width:400,
			height:460,
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
		
		self.dialog_explorer.init("#text_new", true);

		this.dialog.panel.show();
	}
};