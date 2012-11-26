

org.goorm.core.social_plugin = function () {
	this.source = '.communication_message_social_area'

	this.facebook = null;
	this.twitter = null;
}

org.goorm.core.social_plugin.prototype =  {
	init : function(){
		this.facebook = new org.goorm.core.social_plugin.facebook.manager();
		this.facebook.init(this.source);
		
		this.twitter = new org.goorm.core.social_plugin.twitter.manager();
		this.twitter.init(this.source);
	}
}

