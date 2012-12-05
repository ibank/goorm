/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file.rename = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
	this.is_alive_window = null;
};

org.goorm.core.file.rename.prototype = {
	init: function () { 
		
		var self = this;
		
		var dst_name_check = function(dst_name){
			var strings = "{}[]()<>?|~`!@#$%^&*-+\"'\\/";
			for(var i=0; i<strings.length; i++)
				if(dst_name.indexOf(strings[i]) != -1) return false;
			return true;
		}
		
		var handle_ok = function() { 
			var ori_path = $("#input_rename_old_filepath").val();
			var ori_name = $("#input_rename_old_filename").val();
			var dst_name = $("#input_rename_new_filename").val();
			
			if (dst_name=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);
				// alert.show("File name is empty. Please fill it...");
				return false;
			}
			else if (dst_name.indexOf(" ")!=-1) {
				// alert.show("Can not use space in file name");
				alert.show(core.module.localization.msg["alert_allow_character"]);
				return false;
			}
			else if (!dst_name_check(dst_name)){
				// alert.show("Can not use special characters in file name");
				alert.show(core.module.localization.msg["alert_allow_character"]);
				return false;
			}
		
			var postdata = {
				ori_path: $("#input_rename_old_filepath").attr("value"),
				ori_name: $("#input_rename_old_filename").attr("value"),
				dst_name: $("#input_rename_new_filename").attr("value")
			};
									
			$.get("file/rename", postdata, function (data) {
				var received_data = data;
								
				if(received_data.err_code==0) {
					if(self.is_alive_window) {
						var window_manager = core.module.layout.workspace.window_manager;
						var filetype = window_manager.window[window_manager.active_window].filetype;
						
						window_manager.window[window_manager.active_window].close();
						window_manager.open(received_data.path, received_data.file, filetype);						
					}
					
					core.module.layout.project_explorer.refresh();
				}
				else {
					//alert.show(core.module.localization.msg["alert_error"] + received_data.message);
					alert.show(received_data.message);
				}
			});
			this.hide(); 
		};

		var handle_cancel = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
		
		this.dialog = new org.goorm.core.file.rename.dialog();
		this.dialog.init({
			localization_key:"title_rename",
			title:"Rename", 
			path:"configs/dialogs/org.goorm.core.file/file.rename.html",
			width:450,
			height:120,
			modal:true,
			buttons:this.buttons,
			success: function () {
			}
		});
		this.dialog = this.dialog.dialog;
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method show 
	 **/
	show: function (context) {
		var self = this;
		
		self.is_alive_window = false;	

		if (context) {
			if("/"+core.status.current_project_path == core.status.selected_file) {
				alert.show("Cannot Rename!");
				return ;
			}
			var filename = (core.status.selected_file.split("/")).pop();
			var filepath = 	core.status.selected_file.replace(filename, "");
			filepath = filepath.replace("//", "/");
			
			$("#input_rename_new_filename").attr("value", filename);
			$("#input_rename_old_filepath").attr("value", filepath);
			$("#input_rename_old_filename").attr("value", filename);
			
			var window_manager = core.module.layout.workspace.window_manager;
			
			for (var i = 0; i < window_manager.index; i++) {
				var window_filename = window_manager.window[i].filename;
				var window_filepath = window_manager.window[i].filepath;
				window_filepath = window_filepath + "/";
				window_filepath = window_filepath.replace("//", "/");				
			
				if( window_manager.window[i].alive && window_filename == filename && window_filepath == filepath) {
					self.is_alive_window = true;
				}
			}
			
			this.dialog.panel.show();
		}
		else {	
			var window_manager = core.module.layout.workspace.window_manager;
			
			for (var i = 0; i < window_manager.index; i++) {
				if(window_manager.window[i].alive) {
					self.is_alive_window = true;
				}
			}


			if(self.is_alive_window) {
				$("#input_rename_new_filename").attr("value", window_manager.window[window_manager.active_window].filename);
				$("#input_rename_old_filepath").attr("value", window_manager.window[window_manager.active_window].filepath);
				$("#input_rename_old_filename").attr("value", window_manager.window[window_manager.active_window].filename);
			}
			else {
				var temp_path = core.status.selected_file
				var temp_name = temp_path.split("/").pop();
				temp_path = temp_path.replace(temp_name, "");
				
				$("#input_rename_new_filename").attr("value", temp_name);
				$("#input_rename_old_filepath").attr("value", temp_path);
				$("#input_rename_old_filename").attr("value", temp_name);
			}
			
			this.dialog.panel.show();
		}
	}	
};