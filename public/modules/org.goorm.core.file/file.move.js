/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file.move = {
	dialog: null,
	buttons: null,
	dialog_explorer: null,

	init: function () { 
		
		var self = this;
				
		var handle_ok = function() { 

			var data = self.dialog_explorer.get_data();
		
			if(data.path=="" || data.name=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);
				// alert.show("File name is empty. Please fill it...");
				return false;
			}
			
			var postdata = {
				ori_path: $("#file_move_ori_path").val(),
				ori_file: $("#file_move_ori_file").val(),
				dst_path: data.path,
				dst_file: data.name
			};

			$.get("file/move", postdata, function (data) {
				if(data.err_code==0) {
					if(self.is_alive_window) {
						var window_manager = core.module.layout.workspace.window_manager;
						var filetype = window_manager.window[window_manager.active_window].filetype;

						window_manager.window[window_manager.active_window].close();
						window_manager.open(data.path, data.file, filetype);						
					}
					
					core.module.layout.project_explorer.refresh();
				}
				else {
					//alert.show(core.module.localization.msg["alert_error"] + received_data.message);
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

		this.dialog = org.goorm.core.file.move.dialog;
		this.dialog.init({
			localization_key:"title_move",
			title:"Move", 
			path:"configs/dialogs/org.goorm.core.file/file.move.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons, 
			success: function () {
				var resize = new YAHOO.util.Resize("move_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#move_dialog_middle").width();
		            var w = ev.width;
		            // $("#move_dialog_center").css('width', (width - w - 9) + 'px');
		            $("#file_move_files").css('width', (width - w - 9) + 'px');
		        });
		        
		        $("#file_move_project_type").change(function() {
		        	var type = $(this).val();
		        	$("#move_dialog_center").find(".file_item").each(function() {
		        		if (type==0) {
		        			$(this).css("display","block");
		        		}
		        		else if($(this).attr('filetype')==type) {
		        			$(this).css("display","block");
		        		}
		        		else {
		        			$(this).css("display","none");
		        		}
		        	});
		        });
			}
		});
		this.dialog = this.dialog.dialog;
		this.dialog_explorer = new org.goorm.core.dialog.explorer();		
	},
	
	show: function (context) {
	
		var self = this;
		self.dialog_explorer.init("#file_move", false);
		self.is_alive_window = false;

		if (context) {
			if("/"+core.status.current_project_path == core.status.selected_file) {
				alert.show("Cannot move!");
				return ;
			}
			var filename = (core.status.selected_file.split("/")).pop();
			var filepath = 	core.status.selected_file.replace(filename, "");
			filepath = filepath.replace("//", "/");
			
			$("#file_move_ori_file").attr("value", filename);
			$("#file_move_ori_path").attr("value", filepath);
			$("#file_move_target_name").attr("value", filename);
			
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
		}
		else {	
			var window_manager = core.module.layout.workspace.window_manager;
			
			for (var i = 0; i < window_manager.index; i++) {
				if(window_manager.window[i].alive) {
					self.is_alive_window = true;
				}
			}


			if(self.is_alive_window) {
				$("#file_move_ori_file").attr("value", window_manager.window[window_manager.active_window].filename);
				$("#file_move_ori_path").attr("value", window_manager.window[window_manager.active_window].filepath);
				$("#file_move_target_name").attr("value", window_manager.window[window_manager.active_window].filename);
			}
			else {
				var temp_path = core.status.selected_file
				var temp_name = temp_path.split("/").pop();
				temp_path = temp_path.replace(temp_name, "");

				$("#file_move_ori_file").attr("value", temp_name);
				$("#file_move_ori_path").attr("value", temp_path);
				$("#file_move_target_name").attr("value", temp_name);
			}			
		}
	
		this.dialog.panel.show();
		
	}
};