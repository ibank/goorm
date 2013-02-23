
org.goorm.core.collaboration.message = function () {
	this.container = "#communication .communication_toolbar";

	this.invite = null;
}

org.goorm.core.collaboration.message.prototype = {
	init : function(){
		var self = this;

		this.invite = new org.goorm.core.collaboration.invite();
		this.invite.init();

		$(core).bind('goorm_login_complete', function() {
			$(self.container).append('<span id="message_check_button" class="message_number"> Message (<span id="unchecked_msg_num">0</span>) </span>');
			$(self.container).append('<div id="message_container"><div id="message_list"></div><div id="message_toolbar"><span id="message_container_close_button">CLOSE</span></div></div>');
			
			$("#message_container").hide();
						
			$("#message_check_button").click(function () {
				self.load_message();
				$("#message_container").toggle();
			});
			
			$("#message_container_close_button").click(function () {
				$("#message_container").hide();
			});
			
			self.load_message();
		})

	},

	route : function(type){
		var self = this;

		if(/invite/.test(type)){
			return self.invite;
		}
	},

	load_message : function(){
		var self = this;

		$("#message_list").empty();

		$.get('/message/get_list/receive', function(data){
			for(var i=0; i<data.length; i++){
				var message = data[i];
				var message_html = self.route(message.type).get_html(message);

				$("#message_list").append("<div class='message_list_item' type='"+message.type+"'>"+message_html+"</div>")
			}

			self.get_unchecked_msg_number(function(data) {
				$("#unchecked_msg_num").html(data);
			});

			$('.message_list_item').unbind('click');
			$('.message_list_item').click(function(e){
				self.action(this);
			});
		})
	},

	action : function(message_html){
		var self = this;
		var _id = $(message_html).find('.message_head').attr('_id');

		$.get('/message/get', {'_id':_id}, function(message){
			if(message){
				self.route($(message_html).attr('type')).action(message);
				self.check(_id);
			}
		})
	},

	check : function(_id){
		var self = this;

		$.post('/message/check', {'_id':_id}, function(data){
			self.load_message();
		});
	},

	get_unchecked_msg_number : function(callback){
		$.get('/message/get_list/unchecked', function(data){
			callback(data);
		})
	}
}
