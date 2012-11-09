/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.project.open = function () {
	this.dialog = null;
	this.buttons = null;
	this.chat = null;
	this.project_list = null;
};

org.goorm.core.project.open.prototype = {
	init: function () {
		
		var self = this;
				
		var handle_open = function() {
			var data = self.project_list.get_data();

			if (data.path=="" || data.name=="" || data.type=="") {
				alert.show(core.module.localization.msg["alert_project_not_selected"]);
				// alert.show("Project item is not selected");
				return false;
			}
			else {
				self.open(data.path, data.name, data.type);
				this.hide(); 
			}
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='open'>Open</span>", handler:handle_open, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.project.open.dialog();
		this.dialog.init({
			title:"Open Project", 
			path:"configs/dialogs/org.goorm.core.project/project.open.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				var resize = new YAHOO.util.Resize("project_open_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#project_open_dialog_middle").width();
		            var w = ev.width;
		            $("#project_open_dialog_center").css('width', (width - w - 9) + 'px');
		        });
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.project_list = new org.goorm.core.project.list();
	},
	
	show: function () {
		this.project_list.init("#project_open");
		this.dialog.panel.show();
	},
	
	open: function (current_project_path, current_project_name, current_project_type) {
		core.module.layout.communication.leave();
		core.status.current_project_path = current_project_path;
		core.status.current_project_name = current_project_name;
		core.status.current_project_type = current_project_type;

		var current_project = {};
		current_project.current_project_path = current_project_path;
		current_project.current_project_name = current_project_name;
		current_project.current_project_type = current_project_type;

		localStorage["current_project"] = JSON.stringify(current_project);

		core.dialog.project_property.refresh_toolbox();
		core.module.layout.project_explorer.refresh();
		
		core.module.layout.communication.join();
		core.module.layout.terminal.change_project_dir();
		$(core).trigger("on_project_open");
	}
};