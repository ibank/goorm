
org.goorm.core.social_plugin.twitter.manager = function () {
	this.api = null;
}

org.goorm.core.social_plugin.twitter.manager.prototype =  {
	init : function(source){
		this.api = new org.goorm.core.social_plugin.twitter();
		this.api.init();
	},
	
	post_direct_message : function(){
		this.api.post_direct_message();
	},
	
	get_time_line : function(){
		this.api.get_time_line();
	}
}