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
};

org.goorm.core.auth.prototype = {					
	init: function () {
		
	},
	
	get_info: function () {
		core.user.email = "";
		core.user.first_name = "";
		core.user.last_name = "";
	
		$.getJSON("auth/get_info", function (data) {
			if (data.name != "" && data.name != undefined) {	
				core.user.email = data.email;
				core.user.first_name = data.given_name;
				core.user.last_name = data.family_name;		
			}
			else {
				for (var i=0; i < Math.random() * 4 + 2; i++) {
					core.user.first_name += String.fromCharCode(97 + Math.round(Math.random() * 25));
				}
				for (var j=0; j < Math.random() * 4 + 2; j++) {
					core.user.last_name += String.fromCharCode(97 + Math.round(Math.random() * 25));
				}
			}	
		});
	}			
};