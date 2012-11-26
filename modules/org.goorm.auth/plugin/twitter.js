
var Twit = require('twit');
var T = null;

module.exports = {
	init : function(init_data){
		T = new Twit({
			consumer_key: init_data.consumerKey,
			consumer_secret: init_data.consumerSecret,
			access_token: init_data.accessToken,
			access_token_secret: init_data.accessTokenSecret
		});
	},
	
	trigger : function(method_type, api_root, data, callback){
		var method = method_type.toLowerCase();
		
		if(method == 'post')
			this.post(api_root, data, callback);
		else if(method == 'get')
			this.get(api_root, data, callback);
		else
			callback({
				code : 0,
				message : 'method is not defined'
			});
	},
	
	post : function(api_root, data, callback){
		T.post(api_root, data, function(err, reply){
			if(!err){
				callback(reply);
			}
			else{
				console.log(err);
				callback({
					code : 1,
					err : err,
					message : 'post is invalid'
				});
			}
		});
	},
	
	get : function(api_root, data, callback){

	}
}