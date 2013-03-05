/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.social_plugin.facebook = {
	appID: null,

	init : function(appid){
		var self = this;
		
		this.appID = appid;
		window.fbAsyncInit = function() {
			FB.init({
				appId : appid, // App ID
				status : true, // check login status
				cookie : true, // enable cookies to allow the server to access the session
				xfbml : true  // parse XFBML
			}, {scope:'publish_stream'});
		};
		
		(function(d){
			var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "/lib/com.facebook.code/all.js";
			ref.parentNode.insertBefore(js, ref);
		}(document));
	},
	
	get_login_status : function(callback){
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				callback({
					code : 0
				});
			} else if (response.status === 'not_authorized') {
				callback({
					code : 1,
					message : 'Not authorized'
				});
			} else {
				callback({
					code : 2,
					message : 'Not loggined'
				});
			}
		});
	},
	
	get_login : function(callback){
		FB.login(function(response) {
			if (response.authResponse) {
				callback(true);
			}
			else {
				callback(false);
			}
		});
	},
	
	post_personal_feed : function(data, callback){
		FB.api('/me/feed', 'post', data, function(response) {
			if (!response || response.error) {
				alert('Error occured');
			}
			else{
				callback(response.id);
			}
		});
	},
	
	del_personal_feed : function(postid){
		FB.api(postid, 'delete', function(response){
			if (!response || response.error) {
				alert('Error occured');
			}
		});
	}
}
