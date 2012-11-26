

org.goorm.core.admin.user_manager = function() {
	this.dialog = null;
	this.tabview = null;
	this.treeview = null;
	this.buttons = null;
	this.manager = null;
	this.grid_opacity_slider = null;	
};

org.goorm.core.admin.user_manager.prototype = {
	init: function () {
		var self = this;

		this.manager = new org.goorm.core.admin.user_manager.manager();
		this.manager.init();
		
		this.dialog = new org.goorm.core.admin.user_manager.dialog();
		
		this.load_default();
	},
	
	load_default: function(){
		
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
			this.hide();
		};

		var handle_cancel = function() { 
			this.hide();
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}];
		
		this.dialog.init({
			title:"User Management", 
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
						label = label.replace(/[/#. ]/,"");
						
						$("#user_manager_tabview > *").hide();
						$("#user_manager_tabview #"+label).show();
					});
					
					self.all = new org.goorm.core.admin.user_manager.all();
					self.all.init();
					
					self.available_blind = new org.goorm.core.admin.user_manager.available_blind();
					self.available_blind.init();
					
					self.signup = new org.goorm.core.admin.user_manager.signup();
					self.signup.init();
				});
			}
		});
		
		this.dialog = this.dialog.dialog;
	}
}