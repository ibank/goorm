/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.theme.details = {
	dialog: null,
	buttons: null,
	manager: null,
	parent: null,

	init: function (parent) {
		var self = this;
		self.parent = parent;

		var handle_apply = function() { 
			self.manager.update_json();
			this.hide(); 
		};
		var handle_cancel = function() { 
			this.hide(); 
		};
		this.buttons = [ {text:"<span localization_key='save'>Save</span>", handler:handle_apply, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 

		this.manager = org.goorm.core.theme.manager;
		this.manager.init(parent);

		this.dialog = org.goorm.core.theme.details.dialog;
		this.dialog.init({
			localization_key:"title_theme_details",
			title:"Theme Details", 
			path:"configs/dialogs/org.goorm.core.theme/theme.details.html",
			width:1000,
			height:600,
			modal:true,
			buttons:this.buttons,
			success: function () {
				$.getJSON("configs/dialogs/org.goorm.core.theme/tree.json", function(json){
					// construct basic tree structure
					self.manager.create_treeview(json);
					self.manager.create_tabview(json);
					
					// TreeView labelClick function
					self.manager.treeview.subscribe("clickEvent", function(nodedata){
						var label = nodedata.node.label;
						label = label.replace(/[/#. ]/,"");
						$("#theme_details_tabview > *").hide();
						$("#theme_details_tabview #"+label).show();
 					});

					self.manager.create_datatable();
				});
			}

		});
		this.dialog = this.dialog.dialog;
	},

	show: function () {
		this.manager.set_datatable();
		this.dialog.panel.show();
	}
};