/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/


org.goorm.core.admin.user_manager = {
	dialog: null,
	buttons: null,
	manager: null,

	init: function () {
		var self = this;

		this.manager = org.goorm.core.admin.user_manager.manager;
		this.manager.init();
		
		this.dialog = org.goorm.core.admin.user_manager.dialog;
	},
	
	load_default: function(){
		var self = this;
		
		for(var tablabel in self.manager.tabview){
			var target_tab = self.manager.tabview_list[tablabel];
			for(var j in target_tab){
				target_tab[j].load_default();
			}
		}
	},
	
	show : function(){
		this.dialog.panel.show();
	},
	
	apply : function(){
		
	},
	
	save : function(){
		
	},
	
	init_dialog: function(){
		var self = this;
		
		var handle_ok = function() {
			self.apply();
			self.save();
			self.load_default();
			this.hide();
		};

		var handle_cancel = function() { 
			this.hide();
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}];
		
		this.dialog.init({
			localization_key:"title_goorm_management",
			title:"Goorm Management", 
			path:"configs/dialogs/org.goorm.core.admin/user_management.html",
			width:700,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				// create default dialog tree and tabview
				$.getJSON("configs/dialogs/org.goorm.core.admin/tree.json", function(json){
					// construct basic tree structure
					self.manager.create_treeview(json);
					self.manager.create_tabview(json);

					// TreeView labelClick function
					self.manager.treeview.subscribe("clickEvent", function(nodedata){
						var label = nodedata.node.label;
						
						$("#user_manager_tabview > *").hide();
						$("#user_manager_tabview #"+label).show();
					});
					
					for(var tablabel in self.manager.tabview){
						var target_tab = self.manager.tabview_list[tablabel];
						for(var j in target_tab){
							target_tab[j].init();
						}
					}
					
					for(var i=0; i<self.manager.localization_ids.length; i++){
						var local_target = self.manager.localization_ids[i];
						$('#'+local_target.id).attr('localization_key', local_target.localization_key);
					}
					
					$('#user_manager_tabview').find('.tab_action').click(function(){
						var parents = $(this).attr('parents');
						var name = $(this).attr('tab_action');
						
						self.manager.tabview_list[parents][name].refresh();
					});
				});
			}
		});
		
		this.dialog = this.dialog.dialog;
	}
}