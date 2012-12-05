
org.goorm.core.social_plugin.twitter = function () {
	
}

org.goorm.core.social_plugin.twitter.prototype =  {
	init : function(){
		
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