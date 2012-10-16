/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.theme.details = function () {
	this.dialog = null;
	this.buttons = null;
	this.manager = null;
	this.parent = null;
};


org.goorm.core.theme.details.prototype = {
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
		this.buttons = [ {text:"Save", handler:handle_apply, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 

		this.manager = new org.goorm.core.theme.manager();
		this.manager.init(parent);

		this.dialog = new org.goorm.core.theme.details.dialog();
		this.dialog.init({
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