

org.goorm.core.admin.user_manager.projects = function () {
	this.change_list = {};
};

org.goorm.core.admin.user_manager.projects.prototype = {
	init : function() {
		this.to_lock_button = new YAHOO.widget.Button("user_management_lock", { onclick: { fn: this.to_lock }, label:'>>' });
		this.to_unlock_button = new YAHOO.widget.Button("user_management_unlock", { onclick: { fn: this.to_unlock }, label:'<<' });
		this.apply_button = new YAHOO.widget.Button("user_management_available_blind_apply", { onclick: { fn: this.apply }, label:'<span localization_key="apply">Apply</span>' });

		this.load();
	},
	
	load : function(){
		var self = this;
		
		// $.get('/project/get_list', function(projects){
			// console.log(projects);
		// });
	},
	
	to_lock : function(){
		
	},
	
	to_unlock : function(){
		
	},
	
	refresh : function(){
		
	},
	
	load_default : function(){
		
	}
}
