/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.social_plugin = {
	source: '.communication_message_social_area',

	facebook: null,
	twitter: null,

	init : function(){
		this.facebook = org.goorm.core.social_plugin.facebook.manager;
		this.facebook.init(this.source);
		
		
		//this.twitter = org.goorm.core.social_plugin.twitter.manager;
		//this.twitter.init(this.source);
	}
}

