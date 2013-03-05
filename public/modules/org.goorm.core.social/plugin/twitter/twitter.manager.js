/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.core.social_plugin.twitter.manager = {
	api: null,
	
	init : function(source) {
		this.api = org.goorm.core.social_plugin.twitter;
		this.api.init();
	},
	
	post_direct_message : function(){
		this.api.post_direct_message();
	},
	
	get_time_line : function() {
		this.api.get_time_line();
	}
};