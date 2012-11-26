

org.goorm.core.admin.user_manager.signup = function () {

};

org.goorm.core.admin.user_manager.signup.prototype = {
	init : function() {
		this.load();
	},
	
	load : function() {
		$.get('/admin/get_config', function(config){
			if(config){
				if(config.general_signup_config){
					$('[name="user_management_config_general_signup"]').attr('checked', 'checked')
				}
				else{
					$('[name="user_management_config_general_signup"]').removeAttr('checked');
				}
			}
		});
	},
	
	refresh : function(){
		$.get('/admin/get_config', function(config){
			if(config){
				if(config.general_signup_config){
					$('[name="user_management_config_general_signup"]').attr('checked', 'checked')
				}
				else{
					$('[name="user_management_config_general_signup"]').removeAttr('checked');
				}
			}
		});
	}
}
