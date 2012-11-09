/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.collaboration.slideshare = function () {
  	this.socket = null;
	this.current_slide_name = null;
	this.button_play = null;
	this.button_prev = null;
	this.button_next = null;
};

org.goorm.core.collaboration.slideshare.prototype = {

	init: function(){
		this.socket = io.connect();
		var self = this;
		
		$("#slide_body").append("<div id='slide_url' class='layout_right_slide_tab'>URL <input id='slideshare_url' type='text' value='http://www.slideshare.net/jeg0330/goorm-15035830'/></div><div id='slide_control'><button id='slide_prev'><img src='images/icons/context/prev.png' style='margin-top:3px;' /></button><button id='slideshare_presentation'><img src='images/icons/context/play.png' style='margin-top:3px;' /></button><button id='slide_next'><img src='images/icons/context/next.png' style='margin-top:3px;' /></button></div><iframe id='iframe_slideshare' src='"+document.baseURI+"lib/slideshare/slide.html' width='100%' frameborder=0 marginwidth=0 marginheight=0 scrolling=no allowfullscreen> </iframe>");
		
		if (this.socket.socket.connected) {
//			this.socket.emit("message", '{"channel": "slideshare", "action":"send_message", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace": "'+ core.status.current_project_name +'", "message":"' + encodedMsg + '"}');
		}
		
		this.socket.on("slideshare_message", function (data) {
			/*
			 * data = {slide_url, page}
			 */
			
			if(data.slide_url != self.current_slide_name) {
				iframe_slideshare.loadPlayer(data.slide_url, data.page);
				self.current_slide_name = data.slide_url;
			}
			if(iframe_slideshare.player && iframe_slideshare.player.jumpTo) {
				iframe_slideshare.player.jumpTo(data.page);
			}
 		});
 		
 		this.button_play = new YAHOO.widget.Button("slideshare_presentation", {
 			onclick: {
 				fn:function(){
					var url = $("#slideshare_url").val();
					if(url != ""){
						self.load_slide(url);
					}
				}
			}
		});
				
		this.button_prev = new YAHOO.widget.Button("slide_prev", {
 			onclick: {
 				fn:function(){
	 				iframe_slideshare.player.previous();
					self.socket.emit("message", '{"channel": "slideshare", "slide_url":"'+self.current_slide_name+'", "page":'+iframe_slideshare.player.getCurrentSlide()+'}');
				}
			}
		});
		
		this.button_next = new YAHOO.widget.Button("slide_next", {
 			onclick: {
 				fn: function(){
					iframe_slideshare.player.next();
					self.socket.emit("message", '{"channel": "slideshare", "slide_url":"'+self.current_slide_name+'", "page":'+iframe_slideshare.player.getCurrentSlide()+'}');
				}
			}
		});
		
		$(core).bind("layout_resized", function () {
			var layout_right_width = $(".yui-layout-unit-right").find(".yui-layout-wrap").width();
			$("#slideshare_url").width(layout_right_width - 80);
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
				iframe_slideshare.loadPlayer(slide_url[1]);
//						iframe_slideshare.player.getCurrentSlide()
				self.current_slide_name = slide_url[1];
				self.socket.emit("message", '{"channel":"slideshare", "slide_url":"'+slide_url[1]+'", "page":1}');
			}
		});
	}
}