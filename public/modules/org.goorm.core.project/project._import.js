/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
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
			if($("#project_import_file").attr("value").substr($("#project_import_file").attr("value").length-3,3).toLowerCase()!="zip") {
				//alert.show(core.module.localization.msg["alertOnlyZipAllowed"]);
				alert.show("Zip file only");
				return false;
			}
		
			core.module.loading_bar.start("Import processing...");
			$('#project_import_my_form').submit();
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.project._import.dialog();
		this.dialog.init({
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
							notice.show(data.message);
							core.module.layout.project_explorer.refresh();
						}
						else {
							alert.show(data.message);
						}
						//notice.show(core.module.localization.msg["noticeProjectImportDone"]);
						
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
		this.project_list.init("#project_import");
		this.dialog.panel.show();
	}
};