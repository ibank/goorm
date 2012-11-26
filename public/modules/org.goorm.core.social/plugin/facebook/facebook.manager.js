

org.goorm.core.social_plugin.facebook.manager = function () {
	this.api = null;
}

org.goorm.core.social_plugin.facebook.manager.prototype =  {
	init : function(source){
		this.api = new org.goorm.core.social_plugin.facebook();
		// this.api.init();
		
		// this.attach_button(source);
		this.init_click_event();
	},
	
	attach_button : function(source){
		var facebook_item = "";

		facebook_item +=	'<div class="facebook_post_feed">';
		facebook_item +=		'<img src="/images/icons/social/fb.png" style="width: 20px; margin-right: 8px;">';
		facebook_item +=	'</div>';
		
		$(source).append(facebook_item);
	},
	
	post_feed_me : function(postdata){
		var self = this;
		
		self.api.get_login_status(function(response){
			if(response.code == 0){
				self.api.post_personal_feed(postdata, function(postid){
					console.log(postid);
				});
			}
			else{
				alert(response.message);
			}
		});
	},
	
	init_click_event : function(){
		var self = this;
		
		$(document).on("click", ".facebook_post_feed", function(){
			var message = $('#input_chat_message').val();
			
			var name = core.user.id;
			
			var postdata = {
				'message': message,
				'name': name,
				'caption' : 'caption...',
				'description' : 'description...',
				'source' : 'source...',
				'place' : 'place...',
				'tag' : 'tag...'
			};
			
			self.post_feed_me(postdata);
		});
	}
}