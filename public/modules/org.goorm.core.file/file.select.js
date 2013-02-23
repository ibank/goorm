/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file.select = function () {
	this.dialog = null;
	this.buttons = null;
	this.filename = null;
	this.filetype = null;
	this.filepath = null;
	this.dialog_explorer = null;
	this.target = null;
	
};

org.goorm.core.file.select.prototype = {
	init: function () { 
		
		var self = this;
				
		var handle_ok = function() { 
			
			var data = self.dialog_explorer.get_data();
		
			if(data.path=="" || $("#file_select_target_name").val()=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);
				return false;
			}

			if($("#file_select_target_name").val().indexOf("..")!=-1) {
				alert.show(core.module.localization.msg["alert_file_name_illegal"]);
				return false;
			}

			self.target.target_file = data.path+"/"+$("#file_select_target_name").val();
			self.target.file_list_process();
			
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
	
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 

		this.dialog = new org.goorm.core.file.select.dialog();
		this.dialog.init({
			localization_key:"title_file_select",
			title:"File select", 
			path:"configs/dialogs/org.goorm.core.file/file.select.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons, 
			success: function () {
				var resize = new YAHOO.util.Resize("file_select_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#file_select_dialog_middle").width();
		            var w = ev.width;
		            $("#file_select_dialog_center").css('width', (width - w - 9) + 'px');
		        });
		        
/*
		        $("#file_select_project_type").change(function() {
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

	show: function (t) {
		this.target = t;
		this.dialog.panel.show();
		
		this.dialog_explorer.init("#file_select", false);
		
	}
};