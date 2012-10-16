/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.file._import = function () {
	this.dialog = null;
	this.buttons = null;
	this.dialog_explorer = null;
};

org.goorm.core.file._import.prototype = {

	init: function () { 
		var self = this;
		
		var handle_ok = function() {

			if($("#file_import_file").attr("value").substr($("#file_import_file").attr("value").length-3,3).toLowerCase()!="zip") {
				alert.show(core.module.localization.msg["alertFileNotSelect"]);
				return false;
			}
		
			core.module.loading_bar.start("Import processing...");
			$('#myForm').submit();
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.file._import.dialog();
		this.dialog.init({
			title:"Import File", 
			path:"configs/dialogs/org.goorm.core.file/file._import.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons,
			kind:"import",
			success: function () {

				var resize = new YAHOO.util.Resize("import_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#import_dialog_middle").width();
		            var w = ev.width;
		            $("#import_dialog_center").css('width', (width - w - 9) + 'px');
		        });
			
				var form_options = {
					target: "#upload_output",
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
	            $('#myForm').ajaxForm(form_options);
				
				$('#myForm').submit(function() { 
				    // submit the form 
				    //$(this).ajaxSubmit(); 
				    // return false to prevent normal browser submit and page navigation 
				    return false; 
				});
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_explorer = new org.goorm.core.dialog.explorer();		
	},
	
	show: function () {
		var self = this;
		$("#upload_output").empty();
		$("#file_import_file").val("");
		self.dialog_explorer.init("#file_import", false);
		this.dialog.panel.show();		
	}
};