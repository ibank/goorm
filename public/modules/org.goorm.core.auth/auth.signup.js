
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
					
				}
			}
			else if(signup_result.type == 'check'){
				if(!signup_result.data.result) self.signup_error_message(signup_result.data);
			}
		});
	},
	
	signup_error_message : function(result){
		// $("#login_message").empty();
		switch(result.code){
			case 0:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_id']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_id']);
				break;
			case 1:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_unfit_reg_id']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_unfit_reg_id']);
				break;
			case 2:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_duplicate_id']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_duplicate_id']);
				break;
			case 3:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_duplicate_id']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_not_found_id']);
				break;
			case 10:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_password']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_password']);
				break;
			case 11:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_re_password']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_re_password']);
				break;
			case 12:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_password_not_match']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_password_not_match']);
				break;
			case 13:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_unfit_req_password']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_unfit_req_password']);
				break;
			case 20:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_email']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_email']);
				break;
			case 21:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_unfit_email']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_unfit_email']);
				break;
			case 30:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_name']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_name']);
				break;
			case 31:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_unfit_name']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_unfit_name']);
				break;
			case 40:
				// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_nick']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_nick']);
				break;
			case 41:
				$("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_unfit_nick']+'</div>');
				core.module.toast.show(core.module.localization.msg['alert_sigup_unfit_nick']);
				break;
		}
		// $("#login_message").fadeIn(1000);
		// $("#login_message").fadeOut(1000);
	},
}