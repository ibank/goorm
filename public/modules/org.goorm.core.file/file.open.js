/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file.open = {
	dialog: null,
	buttons: null,
	filename: null,
	filetype: null,
	filepath: null,
	dialog_explorer: null,

	init: function () { 
		
		var self = this;
				
		var handle_ok = function() { 
			
			var data = self.dialog_explorer.get_data();
		
			if(data.path=="" || $("#file_open_target_name").val()=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);
				return false;
			}

			if($("#file_open_target_name").val().indexOf("..")!=-1) {
				alert.show(core.module.localization.msg["alert_file_name_illegal"]);
				return false;
			}

			core.module.layout.workspace.window_manager.open(data.path, $("#file_open_target_name").val(), data.type);
			
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
	
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 

		this.dialog = org.goorm.core.file.open.dialog;
		this.dialog.init({
			localization_key:"title_open_file",
			title:"Open file", 
			path:"configs/dialogs/org.goorm.core.file/file.open.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons, 
			success: function () {
				var resize = new YAHOO.util.Resize("open_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#open_dialog_middle").width();
		            var w = ev.width;
		            // $("#open_dialog_center").css('width', (width - w - 9) + 'px');
		            $("#file_open_files").css('width', (width - w - 9) + 'px');
		        });
		        
/*
		        $("#file_open_project_type").change(function() {
		        	var type = $(this).val();
		        	$("#open_dialog_center").find(".file_item").each(function() {
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
*/
		        
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_explorer = new org.goorm.core.dialog.explorer();		
	},

	show: function () {
		var self = this;
	
		this.dialog.panel.show();
		
		self.dialog_explorer.init("#file_open", false);
		
	}
};