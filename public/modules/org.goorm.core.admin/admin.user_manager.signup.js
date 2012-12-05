

org.goorm.core.admin.user_manager.signup = function () {

};

org.goorm.core.admin.user_manager.signup.prototype = {
	init : function() {
		
		this.apply_button =  new YAHOO.widget.Button("user_management_signup_apply", { onclick: { fn: this.apply }, label:'<span localization_key="apply">Apply</span>' });
		this.load();
	},
	
	load : function() {
		$.get('/admin/get_config', function(config){
			if(config){
				for(var config_name in config){
					if(config[config_name]) $('[name="user_management_'+config_name+'"]').attr('checked', 'checked')
					else $('[name="user_management_'+config_name+'"]').removeAttr('checked');
				}
			}
		});
	},
	
	load_default : function(){
		this.refresh();
	},
	
	apply : function() {
		var self = this;
		var config = {};
		
		$('#user_manager_tabview').find('.signup_config').each(function(i, e){
			var name = $(this).attr('name');
			
			if(/^user_management_/.test(name)){
				var target_name = name.substring(16);
				config[target_name] = $('[name="'+name+'"]').attr('checked');
				
				if(config[target_name]) config[target_name] = true;
				else config[target_name] = false;
			}
		});
		
		$.post('/admin/set_config', config, function(config_result){
			// self.refresh();
		});
	},
	
	refresh : function(){
		$.get('/admin/get_config', function(config){
			if(config){
				for(var config_name in config){
					if(config[config_name]) $('[name="user_management_'+config_name+'"]').attr('checked', 'checked')
					else $('[name="user_management_'+config_name+'"]').removeAttr('checked');
				}
			}
		});
	}
}
