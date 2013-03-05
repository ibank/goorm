/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.core.auth.profile = {
	dialog: null,
	buttons: null,
	
	target_id: null,

	init: function () {
		
		var self = this;
				
		var handle_settings = function() { 
			$('#goorm_profile_container').find('[name="profile_id_input"]').attr('disabled', 'disabled');
			$('#goorm_profile_container').find('[name="profile_name_input"]').removeAttr('readonly');
			$('#goorm_profile_container').find('[name="profile_nickname_input"]').removeAttr('readonly');
			$('#goorm_profile_container').find('[name="profile_email_input"]').removeAttr('readonly');
			$('#goorm_profile_container').find('[name="profile_type_input"]').attr('disabled', 'disabled');
			$('#goorm_profile_container').find('[name="profile_level_input"]').attr('disabled', 'disabled');
			
			$(self.dialog.buttons[0].htmlButton).hide();
			$(self.dialog.buttons[2].htmlButton).hide();
			$(self.dialog.buttons[1].htmlButton).show();
		};
		var handle_settings_pw = function() {
			
			self.dialog.panel.cfg.setProperty('width', '360px');
			self.dialog.panel.cfg.setProperty('height', '400px');
			var html_t = '';
			html_t += "<span localization_key='dialog_goorm_profile_password' name='profile_pw_span' class='goorm_profile_span'> Password : </span>";
			html_t += "<input type='password' name='profile_pw_input' class='goorm_profile_input'>";
			html_t += "<span localization_key='dialog_goorm_profile_password_confirm' name='profile_re_pw_span' class='goorm_profile_span'> Confirm pw : </span>";
			html_t += "<input type='password' name='profile_re_pw_input' class='goorm_profile_input'>";
			$("#profile_content_container").append(html_t); 

			$('#goorm_profile_container').find('[name="profile_id_input"]').attr('disabled', 'disabled');
			$('#goorm_profile_container').find('[name="profile_name_input"]').removeAttr('readonly');
			$('#goorm_profile_container').find('[name="profile_nickname_input"]').removeAttr('readonly');
			$('#goorm_profile_container').find('[name="profile_email_input"]').removeAttr('readonly');
			$('#goorm_profile_container').find('[name="profile_type_input"]').attr('disabled', 'disabled');
			$('#goorm_profile_container').find('[name="profile_level_input"]').attr('disabled', 'disabled');
			
			$(self.dialog.buttons[0].htmlButton).hide();
			$(self.dialog.buttons[2].htmlButton).hide();
			$(self.dialog.buttons[1].htmlButton).show();
			core.module.auth.profile.dialog.panel._aButtons[1].removeListener('click');
			core.module.auth.profile.dialog.panel._aButtons[1].addListener('click', handle_modify_pw);
			core.module.localization.refresh(true);
			core.status.focus_on_inputbox=true;

		};

		var handle_modify = function() {
			confirmation.init({
				message: core.module.localization.msg["confirmation_modify_profile"],
				yes_text: core.module.localization.msg["confirmation_yes"],
				no_text: core.module.localization.msg["confirmation_no"],
				title: core.module.localization.msg["confirmation_title"], 

				yes: function () {
					var type = $('#goorm_profile_container').find('[name="profile_type_input"]').val();
					if($('#goorm_profile_container').find('[name="profile_type_input"]').val() == 'Generic') type = 'password';
					
					var postdata = {
						'id' : $('#goorm_profile_container').find('[name="profile_id_input"]').val(),
						'name' : $('#goorm_profile_container').find('[name="profile_name_input"]').val(),
						'nick' : $('#goorm_profile_container').find('[name="profile_nickname_input"]').val(),
						'email' : $('#goorm_profile_container').find('[name="profile_email_input"]').val(),
						'type' : 'password'
					}
						core.status.focus_on_inputbox=false;
					$.post('/user/set', postdata, function(result){
						if(result.type == 'set'){
							if(result.data) location.href = '/';
							else{
								
							}
						}
						else if(result.type == 'check'){
								if(!result.data.result){ core.module.auth.display_error_message(result.data, 'toast');
								core.status.focus_on_inputbox=true;
								}
						}
					})
				}, no: function () {
				}
			});
			
			confirmation.panel.show();
		};
		var handle_modify_pw = function() {

			confirmation.init({
				message: core.module.localization.msg["confirmation_modify_profile"],
				yes_text: core.module.localization.msg["confirmation_yes"],
				no_text: core.module.localization.msg["confirmation_no"],
				title: core.module.localization.msg["confirmation_title"], 

				yes: function () {
					var type = $('#goorm_profile_container').find('[name="profile_type_input"]').val();
					if($('#goorm_profile_container').find('[name="profile_type_input"]').val() == 'Generic') type = 'password';
					
					var postdata = {
						'id' : $('#goorm_profile_container').find('[name="profile_id_input"]').val(),
						'name' : $('#goorm_profile_container').find('[name="profile_name_input"]').val(),
						'nick' : $('#goorm_profile_container').find('[name="profile_nickname_input"]').val(),
						'email' : $('#goorm_profile_container').find('[name="profile_email_input"]').val(),
						'pw' : $('#goorm_profile_container').find('[name="profile_pw_input"]').val(),
						're_pw' : $('#goorm_profile_container').find('[name="profile_re_pw_input"]').val(),
						'type' : 'password'
					}
					
					$.post('/user/set_pw', postdata, function(result){
						if(result.type == 'set'){
							if(result.data) location.href = '/';
							else{
								
							}
						}
						else if(result.type == 'check'){
							if(!result.data.result) core.module.auth.display_error_message(result.data, 'toast');
						}
					})
				}, no: function () {
				}
			});
			
			confirmation.panel.show();
		};

		var handle_cancel = function() { 
			var __self = this;
			
			$('#goorm_profile_container input').attr('readonly', 'readonly');
			$('#goorm_profile_container input').removeAttr('disabled');
			$('#goorm_profile_container').find('[name="profile_pw_span"]').remove();
			$('#goorm_profile_container').find('[name="profile_re_pw_span"]').remove();
			$('#goorm_profile_container').find('[name="profile_pw_input"]').remove();
			$('#goorm_profile_container').find('[name="profile_re_pw_input"]').remove();
			core.module.auth.get_info(function(result){
				if(!result) {$(self.buttons[0].htmlButton).hide();
					$(self.dialog.buttons[2].htmlButton).hide();}
				else if(self.target_id == core.user.id) {$(self.dialog.buttons[0].htmlButton).show();
				$(self.dialog.buttons[2].htmlButton).show();
				}
				$(self.buttons[1].htmlButton).hide();
	
				__self.hide(); 
				self.dialog.panel.cfg.setProperty('width', '330px');
				self.dialog.panel.cfg.setProperty('height', '330px');
			});
		};
		
		this.buttons = [ {text:"<span localization_key='account_modify'>Sett</span>", handler:handle_settings, isDefault:true},
							{text:"<span localization_key='modify'>Modi</span>",  handler:handle_modify},
							{text:"<span localization_key='modify_pw'>pw</span>",  handler:handle_settings_pw},
							{text:"<span localization_key='close'>Clos</span>",  handler:handle_cancel}]; 
						 
		this.dialog = org.goorm.core.auth.profile.dialog;
		this.dialog.init({
			localization_key:"title_profile",
			title:"Profile", 
			path:"configs/dialogs/org.goorm.core.auth/auth.profile.html",
			width:330,
			height:330,
			modal:true,
			buttons:this.buttons,
			success: function () {

			}
		});
		this.dialog = this.dialog.dialog;
	},
	
	set_content : function(target_id, target_type){
		var self = this;
		
		this.get_content(target_id, target_type, function(data){

			if (data && data.id != "" && data.id != undefined) {	
				var nickname = data.nick || data.nickname || "";
				
				$('[name="profile_id_input"]').val(data.id);
				$('[name="profile_name_input"]').val(data.name);
				$('[name="profile_nickname_input"]').val(nickname);
				$('[name="profile_email_input"]').val(data.email);
				if(data.type == 'password') data.type = 'Generic';
				$('[name="profile_type_input"]').val(data.type);
				$('[name="profile_level_input"]').val(data.level);
				$('[name="profile_student_id_input"]').val(data.student_id);
				$('[name="profile_lecture_input"]').val(data.group);
			}
			else if(localStorage['user'] && localStorage['user'] != ""){
				var user = JSON.parse(localStorage['user']);

				$('[name="profile_id_input"]').val(user.id);
				$('[name="profile_name_input"]').val(user.name);
				$('[name="profile_nickname_input"]').val(user.nick);
				$('[name="profile_email_input"]').val(user.email);
				if(user.type == 'password') user.type = 'Generic';
				$('[name="profile_type_input"]').val(user.type);
				$('[name="profile_level_input"]').val(user.level);
				$('[name="profile_student_id_input"]').val(data.student_id);
				$('[name="profile_lecture_input"]').val(data.group);
			}
			else{
				$('[name="profile_id_input"]').val("");
				$('[name="profile_name_input"]').val("");
				$('[name="profile_nickname_input"]').val("");
				$('[name="profile_email_input"]').val("");
				$('[name="profile_type_input"]').val("");
				$('[name="profile_level_input"]').val("");
				$('[name="profile_student_id_input"]').val(data.student_id);
				$('[name="profile_lecture_input"]').val(data.group);
			}
		});
	},
	
	get_content : function(target_id, target_type, callback){
		$.getJSON("auth/get_info", function (data){
			if(!$.isEmptyObject(data) && target_id != data.id){
				var postdata = {
					'id' : target_id,
					'type' : target_type
				}
				
				$.post('/user/get', postdata, function(other_user_data){
					callback(other_user_data);
				});
			}
			else{
				callback(data);
			}
		});
	},
	
	show : function(target_id, target_type){
		var self = this;
		this.target_id = target_id;
		
		core.module.auth.get_info(function(result){
			$(self.buttons[0].htmlButton).show();
			$(self.buttons[2].htmlButton).show();
			if(!result || core.user.id != target_id){ $(self.buttons[0].htmlButton).hide();
				$(self.buttons[2].htmlButton).hide();}
			$(self.buttons[1].htmlButton).hide();	
			self.set_content(target_id, target_type);
			self.dialog.panel.show();
		});
	}
}