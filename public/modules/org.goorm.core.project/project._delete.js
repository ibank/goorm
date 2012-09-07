/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.project._delete = function () {
	this.dialog = null;
	this.buttons = null;
	this.chat = null;
	this.project_list = null;	
};

org.goorm.core.project._delete.prototype = {
	init: function () {
		
		var self = this;
				
		var handle_delete = function() { 

			var data = self.project_list.get_data();

			// project delete
			if (data.path=="") {
				//alert.show(core.module.localization.msg["alertProjectNotSelected"]);
				alert.show("Not selected");
				return false;
			}

			var postdata = {
				project_path: data.path
			};

			$.get("project/delete", postdata, function (data) {
				var received_data = data;
				
				if(received_data.err_code==0) {
					if ( postdata.project_path == core.status.current_project_path ) {
						core.status.current_project_path = "";
						core.status.current_project_name = "";
						core.status.current_project_type = "";
						core.dialog.open_project.open("","","");
					}
				}
				else {
					//alert.show(core.module.localization.msg["alertError"] + received_data.message);
					alert.show("Can not delete project");
				}
				
				core.module.layout.project_explorer.refresh();
				core.dialog.project_property.refresh_toolbox();
			});
			
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"Delete", handler:handle_delete, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.project._delete.dialog();
		this.dialog.init({
			title:"Delete Project", 
			path:"configs/dialogs/org.goorm.core.project/project._delete.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				var resize = new YAHOO.util.Resize("project_delete_dialog_left", {
		            handles: ['r'],
		            minWidth: 250,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#project_delete_dialog_middle").width();
		            var w = ev.width;
		            $("#project_delete_dialog_center").css('width', (width - w - 9) + 'px');
		        });
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.project_list = new org.goorm.core.project.list;		
	},
	
	show: function () {
		this.project_list.init("#project_delete");
		this.dialog.panel.show();
	}
};