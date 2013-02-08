/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.project._import = function () {
	this.dialog = null;
	this.buttons = null;
	this.project_list = null;	
};

org.goorm.core.project._import.prototype = {
	init: function () { 
		
		var self = this;
		
		var handle_ok = function() {
			if ($("#project_import_location").val()=="") {
				alert.show(core.module.localization.msg["alert_project_not_selected"]);
				return false;
			}
					
			var file_name = $("#project_import_file").val();
			if(file_name.substr(file_name.length-3,3).toLowerCase()!="zip") {
				alert.show(core.module.localization.msg["alert_only_zip_allowed"]);
				return false;
			}
			
			core.module.loading_bar.start("Import processing...");
			$('#project_import_my_form').submit();
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.project._import.dialog();
		this.dialog.init({
			localization_key:"title_import_project",
			title:"Import Project", 
			path:"configs/dialogs/org.goorm.core.project/project._import.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons,
			kind:"import",
			success: function () {
				var resize = new YAHOO.util.Resize("project_import_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#project_import_dialog_middle").width();
		            var w = ev.width;
		            $("#project_import_dialog_center").css('width', (width - w - 9) + 'px');
		        });
		        			
				var form_options = {
					target: "#project_import_upload_output",
					success: function(data) {
						self.dialog.panel.hide();
						core.module.loading_bar.stop();
						
						if (data.err_code==0) {
							// notice.show("Project is imported.");
							notice.show(core.module.localization.msg['notice_file_import_done']);
							core.module.layout.project_explorer.refresh();
						}
						else {
							alert.show(data.message);
						}
					}
				}
	            $('#project_import_my_form').ajaxForm(form_options);
				
				$('#project_import_my_form').submit(function() { 
				    // submit the form 
				    //$(this).ajaxSubmit(); 
				    // return false to prevent normal browser submit and page navigation 
				    return false; 
				});
				
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.project_list = new org.goorm.core.project.list;
	},
	
	show: function () {
		$("#project_import_upload_output").empty();
		$("#project_import_file").val("");	
		this.project_list.init("#project_import");
		this.dialog.panel.show();
	}
};