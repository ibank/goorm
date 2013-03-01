/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/



org.goorm.core.auth = function () {
	this.profile = null;
	this.signup = null;
	this.project = null;
};

org.goorm.core.auth.prototype = {					
	init: function () {
		this.profile = new org.goorm.core.auth.profile();
		this.profile.init();
		
		this.signup = new org.goorm.core.auth.signup();
		this.signup.init();

		// this.dashboard = new org.goorm.core.auth.dashboard();
		// this.dashboard.init();

		this.message = new org.goorm.core.collaboration.message();
		this.message.init();

		this.socket = io.connect();
		this.socket.on('force_disconnect', function(){
			notice.show(core.module.localization.msg['alert_force_logout']);

			$('#panelContainer_Notice').find('.yui-button').one('click', function(){
				location.href = '/';
			})
		})
	},
	
	get_info: function (callback) {
		$.getJSON("auth/get_info", function (data) {
			if (data.id != "" && data.id != undefined) {
				core.user.id = data.id;
				core.user.level = data.level;
				core.user.email = data.email;
				core.user.name = data.name;
				core.user.nick = data.nick || null;
				core.user.type = data.type;
				core.user.group = data.group || null;
				core.user.uid = data.uid || null;
				core.user.gid = data.gid && data.gid[0] || null;
				callback(true);
			}
			else{
				callback(false);
			}
		});
	},
	
	access_local_mode : function(){
		core.user.id = "";
		core.user.email = "";
		core.user.name = "";
		core.user.nick = "";
		core.user.level = "Member";
		core.user.type = "password"
		
		for (var i=0; i < Math.random() * 4 + 2; i++) {
			core.user.id += String.fromCharCode(97 + Math.round(Math.random() * 25));
		}
		core.user.id = core.user.id + '_guest';
		
		for (var j=0; j < Math.random() * 4 + 2; j++) {
			core.user.name += String.fromCharCode(97 + Math.round(Math.random() * 25));
		}
		core.user.name = core.user.name + '_guest';

		for (var j=0; j < Math.random() * 4 + 2; j++) {
			core.user.nick += String.fromCharCode(97 + Math.round(Math.random() * 25));
		}
		core.user.nick = core.user.nick + '_guest';
		
		localStorage['user'] = JSON.stringify(core.user);
		core.local_complete();
	},
	
	show_profile : function(target_id, target_type){
		this.profile.show(target_id, target_type);
	},
	
	show_signup : function(mode) {
		core.status.focus_on_inputbox = true;
		core.module.auth.signup.show(mode);
	},
	
	social_login : function(__this){
		var id = $(__this).attr('id')
		
		if(/facebook/.test(id)){
			location.href = '/auth/facebook'
		}
		else if(/twitter/.test(id)){
			location.href = '/auth/twitter'
		}
		else if(/github/.test(id)){
			location.href = '/auth/github'
		}
		else if(/google/.test(id)){
			location.href = '/auth/google'
		}
		else{
			//console.log('None');
		}
	},
	
	login: function () {
		var self = this;
		var user_id = $("#goorm_id").val();
		var user_pw = $("#goorm_pw").val();

		if(core.status.is_login){
			return;
		}

		if(!user_id){
			core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_id'])
			return
		}
		if(!user_pw){
			core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_password'])
			return
		}

		var postdata = {
			id : user_id,
			pw : user_pw,
			type : 'password'
		}

		$.post("/auth/login", postdata, function(login_result){
			if(login_result.result && !core.status.is_login){
				core.status.is_login = true;
				core.complete();
			}
			else{
				switch(login_result.code){
					case 0:
						core.module.toast.show(core.module.localization.msg["alert_login_not_match_password"]);
						break;
					case 1:
						core.module.toast.show(core.module.localization.msg["alert_login_no_id"]);
						break;
					case 2:
						self.duplicate_login(postdata);
						break;
					default :
						core.module.toast.show(core.module.localization.msg["alert_login_undefined_id_or_password"]);
						break;
				}
			}
		});
	},

	duplicate_login : function(postdata){
		confirmation.init({
			message: core.module.localization.msg["alert_confirm_duplicate_login"],
			yes_text: core.module.localization.msg["confirmation_yes"],
			no_text: core.module.localization.msg["confirmation_no"],
			title: "Confirmation",
			zIndex: 1001, 

			yes: function () {
				$.post("/auth/login/duplicate", postdata, function(duplicate_login_result){
					if(duplicate_login_result){
						$.post("/auth/login", postdata, function(login_result){
							if(login_result.result){
								core.complete();
							}
						});
					}
				})
			},
			no: function () {
				
			}
		});
		
		confirmation.panel.show();
	},

	check_admin : function(callback){
		$.get('/auth/check_admin', function(result){
			callback(result);
		});
	},

	display_error_message : function(result, type){
		
		function display_message(message){
			if(type == 'toast'){
				core.module.toast.show(message);
			}
			else if(type == 'alert'){
				alert.show(message);
			}
		}

		switch(result.code){
			case 0:
				display_message(core.module.localization.msg['alert_user_undefined_id']);
				break;
			case 1:
				display_message(core.module.localization.msg['alert_user_unfit_reg_id']);
				break;
			case 2:
				display_message(core.module.localization.msg['alert_user_duplicate_id']);
				break;
			case 3:
				display_message(core.module.localization.msg['alert_user_not_found_id']);
				break;
			case 4:
				display_message(core.module.localization.msg['alert_user_unmatched_id']);
				break;
			case 10:
				display_message(core.module.localization.msg['alert_user_undefined_password']);
				break;
			case 11:
				display_message(core.module.localization.msg['alert_user_undefined_re_password']);
				break;
			case 12:
				display_message(core.module.localization.msg['alert_user_undefined_password_not_match']);
				break;
			case 13:
				display_message(core.module.localization.msg['alert_user_unfit_req_password']);
				break;
			case 20:
				display_message(core.module.localization.msg['alert_user_undefined_email']);
				break;
			case 21:
				display_message(core.module.localization.msg['alert_user_unfit_email']);
				break;
			case 30:
				display_message(core.module.localization.msg['alert_user_undefined_name']);
				break;
			case 31:
				display_message(core.module.localization.msg['alert_user_unfit_name']);
				break;
			case 40:
				display_message(core.module.localization.msg['alert_user_undefined_nick']);
				break;
			case 41:
				display_message(core.module.localization.msg['alert_user_unfit_nick']);
				break;
		}
	}	
};
