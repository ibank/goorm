/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.collaboration.slideshare = function () {
  	this.socket = null;
	this.current_slide_name = null;
};

org.goorm.core.collaboration.slideshare.prototype = {

	init: function(){
		this.socket = io.connect();
		var self = this;
		
		if (this.socket.socket.connected) {
//			this.socket.emit("message", '{"channel": "slideshare", "action":"send_message", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace": "'+ core.status.current_project_name +'", "message":"' + encodedMsg + '"}');
		}
		
		this.socket.on("slideshare_message", function (data) {
			/*
			 * data = {slide_url, page}
			 */
			
			if(data.slide_url != self.current_slide_name) {
				window.slideshare.loadPlayer(data.slide_url, data.page);
				self.current_slide_name = data.slide_url;
			}
			if(window.slideshare.player && window.slideshare.player.jumpTo) {
				window.slideshare.player.jumpTo(data.page);
			}
 		});
		
		// bind prev button
		$("#slide_prev").click(function(){
			window.slideshare.player.previous();
			self.socket.emit("message", '{"channel": "slideshare", "slide_url":"'+self.current_slide_name+'", "page":'+window.slideshare.player.getCurrentSlide()+'}');
		});
		
		// bind prev button
		$("#slide_next").click(function(){
			window.slideshare.player.next();
			self.socket.emit("message", '{"channel": "slideshare", "slide_url":"'+self.current_slide_name+'", "page":'+window.slideshare.player.getCurrentSlide()+'}');
		});
		
		// bind presentation
		$("#slideshare_presentation").click(function(){
			var url = $("#slide_url").val();
			if(url != ""){
				self.load_slide(url);
			}
		});
	},
	
	/*
	 * slideshare 주소를 알아내서 플레이어 로딩.
	 */
	load_slide: function(url) {
		var self = this;
		$.ajax({
			url: "http://www.slideshare.net/api/oembed/2",
			data: {
				"url": url,
				"format": "json"
			},
			dataType: "jsonp",
			success: function(json){
				var slide_url = json.slide_image_baseurl.match(/.com\/([^/]*)\//);
				
				// this.slideshare.loadPlayer() 에러남.
				window.slideshare.loadPlayer(slide_url[1]);
//						window.slideshare.player.getCurrentSlide()
				self.current_slide_name = slide_url[1];
				self.socket.emit("message", '{"channel":"slideshare", "slide_url":"'+slide_url[1]+'", "page":1}');
			}
		});
	}
}