
org.goorm.core.auth.signup = function () {
	this.dialog = null;
	this.buttons = null;
	
	this.mode = null;
}

org.goorm.core.auth.signup.prototype = {
	init: function () {
		
		var self = this;
				
		var handle_signup = function() { 
			var postdata = {
				id : $('[name="signup_id_input"]').val(),
				pw : $('[name="signup_password_input"]').val(),
				re_pw : $('[name="signup_repassword_input"]').val(),
				name : $('[name="signup_name_input"]').val(),
				nick : $('[name="signup_nick_input"]').val(),
				email : $('[name="signup_email_input"]').val(),
				type : 'password'
			}
			
			if(!self.mode) self.mode = 'general';
			self.signup(postdata, self.mode);
		};

		var handle_cancel = function() { 
			if(self.mode != 'admin') this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='register'>Register</span>", handler:handle_signup, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.auth.signup.dialog();
		this.dialog.init({
			localization_key:"title_register",
			title:"Register", 
			path:"configs/dialogs/org.goorm.core.auth/auth.signup.html",
			width:380,
			height:300,
			zindex:1001,
			modal:true,
			buttons:this.buttons,
			success: function () {

			}
		});
		this.dialog = this.dialog.dialog;
	},
	
	
	show : function(mode){
		var self = this;
		
		this.mode = mode;
		
		if(mode == 'admin'){
			var panel_id = self.dialog.panel.id;
			$('#'+panel_id).find('.hd').html('Admin Registration');
			$('#'+panel_id).find('[localization_key="cancel"]').parent().parent().parent().hide();

			self.dialog.title = 'Admin Registration';
		}
		else{
			var panel_id = self.dialog.panel.id;
			$('#'+panel_id).find('.hd').html('Register');
			self.dialog.title = 'Register';
		}
		
		this.dialog.panel.show();
	},
	
	signup : function(postdata, mode) {
		var self = this;
		
		$.post("/auth/signup?mode="+mode, postdata, function(signup_result){
			if(signup_result.type == 'signup'){
				if(signup_result.data.result){
					self.dialog.panel.hide();
					core.complete();
				}
				else{
					switch(signup_result.code){
						case 0:
							//alert.show(core.module.localization.msg['alert_user_add_fail'])
							break;

						case 30:
							//alert.show(core.module.localization.msg['alert_signup_blind'])
							break;

						default:
							console.log(signup_result);
					}
				}
			}
			else if(signup_result.type == 'check'){
				if(!signup_result.data.result) core.module.auth.display_error_message(signup_result.data, 'alert');
			}
		});
	}
}