/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.core.social_plugin.twitter = {
	init : function(){
		console.log("!");
	},
	
	post_direct_message : function(){
		var postdata = {
			'api_root' : 'statuses/update',
			'data' : {
				'status' : 'testtest'
			}
		}
		
		$.post('/social/twitter', postdata, function(result){
			console.log(result);
		});
	},
	
	// get_time_line : function(){
		// $.ajax({
			// type : 'get',
			// dataType : 'jsonp',
			// url : 'https://api.twitter.com/1/statuses/user_timeline.json?screen_name=nys3909&count=1&callback=?',
			// success : function(data){
				
			// },
			// error : function(err, status, data){}
		// });
	// }
}