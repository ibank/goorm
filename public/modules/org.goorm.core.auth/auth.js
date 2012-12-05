/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/



org.goorm.core.auth = function () {
	this.target = null;
	this.history = [];
	this.history_count = 0;
	this.socket = null;
	this.ansi_color_codes = [
		{key: '30', css: 'color:#000000;'},
		{key: '31', css: 'color:#FF8888;'},
		{key: '32', css: 'color:#88FF88;'},
		{key: '33', css: 'color:yellow;'},
		{key: '34', css: 'color:#8888FF;'},
		{key: '35', css: 'color:#FF33FF;'},
		{key: '36', css: 'color:cyan;'},
		{key: '37', css: 'color:white;'},
		{key: '01', css: 'font-weight:bold;'},
		{key: '04', css: 'text-decoration:underline;'},
		{key: '40', css: 'background-color:black;'},
		{key: '41', css: 'background-color:#FF8888;'},
		{key: '42', css: 'background-color:#88FF88;'},
		{key: '43', css: 'background-color:yellow;'},
		{key: '44', css: 'background-color:#8888FF;'},
		{key: '45', css: 'background-color:#FF33FF;'},
		{key: '46', css: 'background-color:cyan;'},
		{key: '47', css: 'background-color:white;'}
	];
	this.ansi_color_code_regexp = /\[([0-9][0-9];?)* ?m/g;
	this.bash_text_reset = /\[0*m/g;
	
	this.user = "";
	this.server = "";
	this.path = "";
	
	this.prompt_length = 0;
	
	//this.timestamp = "";
	
	this.in_panel = false;
	
	this.terminal_name = "";
	
	this.index = -1;
	
	this.timestamp = null;
	
	this.command_queue = null;
	
	this.default_prompt = /bash-\d\.\d\$/;
	 
	this.stdout = "";
	this.prompt = null;
	this.command_ready = true;
	this.running_queue = false;
	this.debug_endstr = null;
	this.platform = "darwin";
	
	this.signup_panel = null;
	this.profile = null;
	this.signup = null;
};

org.goorm.core.auth.prototype = {					
	init: function () {
		this.profile = new org.goorm.core.auth.profile();
		this.profile.init();
		
		this.signup = new org.goorm.core.auth.signup();
		this.signup.init();
	},
	
	get_info: function (callback) {
		$.getJSON("auth/get_info", function (data) {
			if (data.id != "" && data.id != undefined) {
				core.user.id = data.id;
				core.user.email = data.email;
				core.user.name = data.name;
				core.user.nick = data.nick || null;
				callback(true);
			}
			// else if(localStorage['user'] && localStorage['user'] != ""){
				// var user = JSON.parse(localStorage['user']);
// 				
				// core.user.email = user.email
				// core.user.first_name = null;
				// core.user.last_name = user.nick || null;
				// callback(true);
			// }
			else{
				callback(false);
			}
			// else {
				// for (var i=0; i < Math.random() * 4 + 2; i++) {
					// core.user.first_name += String.fromCharCode(97 + Math.round(Math.random() * 25));
				// }
				// for (var j=0; j < Math.random() * 4 + 2; j++) {
					// core.user.last_name += String.fromCharCode(97 + Math.round(Math.random() * 25));
				// }
			// }
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
	
	set_profile_content : function(){
		$.getJSON("auth/get_info", function (data){
			if (data.name != "" && data.name != undefined) {	
				var nickname = data.nick || data.nickname || "";
				
				$('[name="profile_id_input"]').val(data.id);
				$('[name="profile_name_input"]').val(data.name);
				$('[name="profile_nickname_input"]').val(nickname);
				$('[name="profile_email_input"]').val(data.email);
				if(data.type == 'password') data.type = 'Generic';
				$('[name="profile_type_input"]').val(data.type);
				$('[name="profile_level_input"]').val(data.level);
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
			}
			else{
				$('[name="profile_id_input"]').val("");
				$('[name="profile_name_input"]').val("");
				$('[name="profile_nickname_input"]').val("");
				$('[name="profile_email_input"]').val("");
				$('[name="profile_type_input"]').val("");
				$('[name="profile_level_input"]').val("");
			}
		});
	},
	
	profile_panel_show : function(){
		this.set_profile_content();
		this.profile.show();
	},

	show_signup : function(mode) {
		core.status.focus_on_inputbox = true;
		core.module.auth.signup.show(mode);
		
		// window.open('about:blank').location.href = 'http://goorm.org/cms/member/join';
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
			// $("#login_message").empty();
			// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_id']+'</div>');
			// $("#login_message").fadeIn(1000);
			// $("#login_message").fadeOut(1000);
			core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_id'])
			return
		}
		if(!user_pw){
			// $("#login_message").empty();
			// $("#login_message").append('<div class="signup_error_message">'+core.module.localization.msg['alert_sigup_undefined_password']+'</div>');
			// $("#login_message").fadeIn(1000);
			// $("#login_message").fadeOut(1000);
			core.module.toast.show(core.module.localization.msg['alert_sigup_undefined_password'])
			return
		}

		var postdata = {
			id : user_id,
			pw : user_pw,
			type : 'password'
		}
		
		// goorm api
		// $.ajax({
			// url : "http://goorm.org/api/login2",
			// dataType : "jsonp",
			// data : postdata,
			// jsonp: "callback",
			// success : function(data){
				// if(data.err){
					// switch(data.err.code){
						// case 1:
							// alert.show(core.module.localization.msg["alert_login_not_match_password"]);
							// break;
						// case 2:
							// alert.show(core.module.localization.msg["alert_login_no_id"]);
							// break;
						// case 3:
							// alert.show(core.module.localization.msg["alert_login_undefined_id_or_password"]);
							// break;
					// }
				// }
				// else{
					// if(!core.status.is_login){
						// localStorage['user'] = JSON.stringify(data.info);
						// core.complete();
						// core.status.is_login = true;
					// }
				// }
			// },
			// error : function(err, status, data){
				
			// }
		// });
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
					default :
						core.module.toast.show(core.module.localization.msg["alert_login_undefined_id_or_password"]);
						break;
				}
			}
		});
	},
	
	check_admin : function(callback){
		$.get('/auth/check_admin', function(result){
			callback(result);
		});
	}
};
