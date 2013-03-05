/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.collaboration.slideshare = {
  	socket: null,
	current_slide_name: null,
	button_play: null,
	button_prev: null,
	button_next: null,
	canvas: null,
	slideshare_document: null,
	ctx: null,
	myctx: {
		strokeStyle : "#FF0000",
		lineWidth : 3
	},
	datum: null,
	flashMovie: null,
	drawing_state: 'undraw',
	slide_show_mode: false,
	layout_temp_data: {},


	init: function(){
		this.socket = io.connect();
		var self = this;

		var slide_body = "";
		slide_body += "<div id='slide_url' class='layout_right_slide_tab'>";
		slide_body +=	"<div id='slide_url_input'>URL <input id='slideshare_url' type='text' value='http://www.slideshare.net/nrkim87/ss'/></div>"
		slide_body += "</div>";
		slide_body += "<div id='slide_menu'>"
		slide_body += 	"<div id='slide_control'>"
		slide_body +=		"<button id='slide_prev'>"
		slide_body +=			"<img src='images/icons/context/prev.png' style='margin-top:3px;' />"
		slide_body +=		"</button>"
		slide_body +=		"<button id='slideshare_presentation'>"
		slide_body +=			"<img src='images/icons/context/play.png' style='margin-top:3px;' />"
		slide_body +=		"</button>"
		slide_body +=		"<button id='slide_next'>"
		slide_body +=			"<img src='images/icons/context/next.png' style='margin-top:3px;' />"
		slide_body +=		"</button>"
		slide_body +=	"</div>"
		slide_body +=	"<div id='drawing_control'>"
		slide_body +=		"<input type='hidden' id='paint' value=''/>"
		slide_body +=		"<input type='hidden' id='palette' value='palette'/>"
		slide_body +=		"<input type='hidden' id='brush' value='brush'/>"
		slide_body +=		"<input type='hidden' id='erase_all' value='erase_all'/>"
		slide_body +=		"<input type='hidden' id='connect' value='disconnected'/>"
		slide_body +=		"<div id='slideshare_canvas_toolbar' class='main_toolbar'></div>"
		slide_body +=	"</div>"
		slide_body +=	"<div id='brush_container' style='display:none;'>"
		slide_body +=		"<div id='brush_slider'>"
		slide_body +=			"<div id='sliderbg' style='margin-left: auto;margin-right: auto;'>"
		slide_body +=				"<div id='sliderthumb'>"
		slide_body +=					"<img src='images/org.goorm.core.collaboration/thumb-s.gif'>"
		slide_body +=				"</div>"
		slide_body +=			"</div>"
		slide_body +=		"</div>"
		slide_body +=		"<input type='text' id='brush_thickness'/>"
		slide_body +=	"</div>"
		slide_body +=	"<div id='slideshare_palette_container' style='position:absolute; display:none;'>"
		slide_body +=		"<div id='slideshare_palette' style='width: 335px; height: 230px; background-color: #fff; border: 1px solid #333; border-radius: 3px;'>"
		slide_body +=			"<button id='close_slideshare_palette' style=' margin-top:200px; margin-left:300px;'>close</button>"
		slide_body +=		"</div>"
		slide_body +=	"</div>"
		slide_body += "</div>"
		slide_body += "<input type='hidden' id='slide_authentic' value='true'/>"
		slide_body += "<div id='eraser' style='display: none; position: absolute; width: 20px; height: 20px; border: 1px solid #000;background-color: #fff;'></div>"
		slide_body += "<iframe id='iframe_slideshare' src='http://"+document.location.host+"/lib/slideshare/slide.html' width='100%' height='100%' frameborder=0 marginwidth=0 marginheight=0 scrolling=no> </iframe>"

		$("#slide_body").append(slide_body);
		core.module.toolbar.add_to_slideshare("public/configs/toolbars/org.goorm.core.slideshare/slideshare.toolbar.html","org.goorm.core.slideshare",$("#slideshare_canvas_toolbar"));
		//$("#brush_container").hide();
		//$("#brush_container").attr("state","hide");

		//$("#slideshare_palette_container").hide();
		//$("#slideshare_palette_container").attr("state","hide");
		//$("#slideshare_palette_container").css("position","absolute");
		this.slide_qu = [];
		this.slide_page = 1;
		$('a[action="slideshare_draw"]').attr("value","draw");
		var slider = new YAHOO.widget.Slider.getHorizSlider("sliderbg", "sliderthumb", 0, 200);
		slider.subscribe("slideEnd", function (){
			self.change_brush_thickness(slider.getValue());
		});
		slider.subscribe("change", function () {
		    $( "#brush_thickness" ).val(slider.getValue()/10 );
		});
		var count = 0;
		this.connect_button = $("a[action=slideshare_connect]").find("div");
		$('#close_slideshare_palette').click(function(e){
			$("#slideshare_palette_container").hide();
			$('a[action="slideshare_palette"]').find('div').removeClass('slide_button_pressed');
		});
		$('a[action="slideshare_draw"]').unbind('click');
		$('a[action="slideshare_draw"]').click(function(e){
			if($(this).find('div').hasClass('slide_button_pressed')){
				$(this).find('div').removeClass('slide_button_pressed')
			}
			else{
				$(this).find('div').addClass('slide_button_pressed')
			}
			if($(this).attr('value') == "undraw") {
				$(this).attr('value', 'draw');
				$("#brush_container").hide();
				$("#slideshare_palette_container").hide();
				$("#paint").unbind("click");
				$(".slide_button_pressed").removeClass('slide_button_pressed');
				$(self.canvas).css('z-index', '1');
				if(self.connect_button.attr('state')=="connected")
					self.connect_button.addClass('slide_button_pressed');

			} else {
				$(this).attr('value', 'undraw');
				$(self.canvas).css('z-index', '4');
				if($("#paint").val()=='paint'){
					$('a[action="slideshare_paint"]').find('div').addClass('slide_button_pressed');
				} else if ($("#paint").val()=='erase'){
					$('a[action="slideshare_erase"]').find('div').addClass('slide_button_pressed');
				}
				if(count == 0) {
					self.draw_init();
					count++;
				}
				if(self.slide_qu[self.slide_page]){
					self.ctx.drawImage(self.slide_qu[self.slide_page], 0, 0,$("#iframe_slideshare").contents().find("#main").width(),$("#iframe_slideshare").contents().find("#main").height());
				}
 				//self.draw_canvas();

				//$("a[action=slideshare_paint]").find('div').addClass('slide_button_pressed')
				//$("a[action=slideshare_erase]").find('div').removeClass('slide_button_pressed')
				//$("#paint").val("paint");
			}
		})

		if (this.socket.socket.connected) {
		//this.socket.emit("message", '{"channel": "slideshare", "action":"send_message", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace": "'+ core.status.current_project_path +'", "message":"' + encodedMsg + '"}');
		}
			/*$("a[action=slideshare_paint]").hide();
			$("a[action=slideshare_erase]").hide();
			$("a[action=slideshare_palette]").hide();
			$("a[action=slideshare_brush]").hide();
			$("a[action=slideshare_erase_all]").hide();*/
 		$("body").one("share_drawing", function () {
			self.canvas = iframe_slideshare.get_canvas();
			$(self.canvas).css('z-index', '4');
			self.slideshare_document = iframe_slideshare.get_document();
			//self.datum = self.slideshare_document.getElementById("player");
			if(self.ctx != null){
				self.ctx.canvas.width = $("#iframe_slideshare").contents().find("#main").width();
				self.ctx.canvas.height = $("#iframe_slideshare").contents().find("#main").height();
			}
 		});

		// this.button_play = new YAHOO.widget.Button("slideshare_presentation", {
		// 	onclick: {
		// 		fn:function(){
		// 			var url = $("#slideshare_url").val();
		// 			if(url != ""){
		// 				self.load_slide(url);
		// 			}
		// 		}
		// 	}
		// });
		this.button_play = new YAHOO.widget.Button("slideshare_presentation", {
			onclick: {
				fn:function(){
					if(self.canvas){
						var dataURL =self.canvas.toDataURL();
						var img = new Image;
						img.src = dataURL;
						self.slide_qu[self.slide_page] = img;
						self.slide_page = 1;
						self.erase_all();
						if(self.slide_qu[self.slide_page]){
							//self.slide_qu[self.slide_page].onload = function(){
							self.ctx.drawImage(self.slide_qu[self.slide_page], 0, 0,$("#iframe_slideshare").contents().find("#main").width(),$("#iframe_slideshare").contents().find("#main").height());
						}
						
					}
					var url = $("#slideshare_url").val();
					if(url != ""){
						self.load_slide(url);
					}
					
					if(iframe_slideshare.player && iframe_slideshare.player.jumpTo) {
						iframe_slideshare.player.jumpTo(data.page);
					}
				} 
			}
		});
		this.button_prev = new YAHOO.widget.Button("slide_prev", {
 			onclick: {
 				fn:function(){
	 				iframe_slideshare.player.previous();
					self.socket_mode("message", '{"channel": "slideshare", "workspace": "'+ core.status.current_project_path +'", "slide_url":"'+self.current_slide_name+'", "page":'+iframe_slideshare.player.getCurrentSlide()+'}');
					if(self.canvas){
						var dataURL =self.canvas.toDataURL();
						var img = new Image;
						img.src = dataURL;
						self.slide_qu[self.slide_page] = img;
						--self.slide_page;
						self.erase_all();
						if(self.slide_qu[self.slide_page]){
							//self.slide_qu[self.slide_page].onload = function(){
							self.ctx.drawImage(self.slide_qu[self.slide_page], 0, 0,$("#iframe_slideshare").contents().find("#main").width(),$("#iframe_slideshare").contents().find("#main").height());
						}
					}
				}
			}
		});
		
		this.button_next = new YAHOO.widget.Button("slide_next", {
 			onclick: {
 				fn: function(){
					iframe_slideshare.player.next();
					if(self.slide_page!=iframe_slideshare.player.getCurrentSlide()){
						self.socket_mode("message", '{"channel": "slideshare", "workspace": "'+ core.status.current_project_path +'", "slide_url":"'+self.current_slide_name+'", "page":'+iframe_slideshare.player.getCurrentSlide()+'}');
						if(self.canvas){
							var dataURL =self.canvas.toDataURL();
							var img = new Image;
							img.src = dataURL;
							self.slide_qu[self.slide_page] = img;
							++self.slide_page;
							self.erase_all();
							if(self.slide_qu[self.slide_page]){
								//self.slide_qu[self.slide_page].onload = function(){
								self.ctx.drawImage(self.slide_qu[self.slide_page], 0, 0,$("#iframe_slideshare").contents().find("#main").width(),$("#iframe_slideshare").contents().find("#main").height());
							}
							
						}
					}
				}
			}
		});
		
		$(core).bind("layout_resized", function () {
			var layout_right_width = $(".yui-layout-unit-right").find(".yui-layout-wrap").width();
			$("#slideshare_url").width(layout_right_width - 80);
			if(self.ctx!=null){
				$(self.canvas).trigger("resize_canvas");
			}
		});
		
	},
	
	draw_slideshare_msg : function(raw_msg) {
		var self = this;
		var msg_obj = (typeof(raw_msg) == "string") ? JSON.parse(raw_msg) : raw_msg;
		var channel = "";
		if (msg_obj["channel"] != undefined) {
			channel = msg_obj["channel"];
		}
		switch (channel) {
		case "draw" :
			self.drawing(msg_obj);
			break;
		case "erase" :
			self.erase(msg_obj);
			break;
		case "erase_all" :
			self.erase_all();
			break;
		case "request" :
			self.request_current_state();
			break;
		}	
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
				//  iframe_slideshare.player.getCurrentSlide()
				self.current_slide_name = slide_url[1];
				self.socket_mode("message", '{"channel":"slideshare", "workspace": "'+ core.status.current_project_path +'", "slide_url":"'+slide_url[1]+'", "page":1}');
			}
		});
	},

	load_plugin : function(){
		var self = this;

		this.slider = new YAHOO.widget.Slider.getHorizSlider("sliderbg", "sliderthumb", 0, 200);
		this.slider.subscribe("slideEnd", function (){
			self.change_brush_thickness(self.slider.getValue());
		});
		this.slider.subscribe("change", function () {
		    $( "#brush_thickness" ).val(self.slider.getValue()/10 );
		});

		this.picker = new YAHOO.widget.ColorPicker("slideshare_palette", {
			showhsvcontrols: false,
			showhexfcontrols: false,
			images: {
				PICKER_THUMB: "/images/org.goorm.core.collaboration/picker_thumb.png",
				HUE_THUMB: "/images/org.goorm.core.collaboration/hue_thumb.png"
			}
		});
		this.picker.setValue([255,0,0],false);
		this.picker.on("rgbChange", function(o) {
			self.change_color(o);
		});

	},
	connecting: function(){
		self = this;
		self.socket.on("slideshare_get", function (data) {
				self.draw_slideshare_msg(data);
		});
		if($('#slide_authentic').val()!='true')
			self.socket.emit("message", '{"channel":"slideshare", "type": "request", "userid":"'+core.user.id+'", "workspace": "'+ core.status.current_project_path +'"}');
		self.socket.on("slideshare_message", function (data) {
			/*
			 * data = {slide_url, page}
			 */
			if(self.canvas && self.ctx){
				if(data.img){
					console.log(data.img);
					var dataURL = data.img;
					var img = new Image;
					img.src = dataURL;
					self.slide_page = data.page;
					self.slide_qu[data.page] = img;
					self.erase_all();
					img.onload = function(){
						self.ctx.drawImage(img, 0, 0,$("#iframe_slideshare").contents().find("#main").width(),$("#iframe_slideshare").contents().find("#main").height());
					};
				}else{
					var dataURL =self.canvas.toDataURL();
					var img = new Image;
					img.src = dataURL;
					self.slide_qu[self.slide_page] = img;
					self.slide_page = data.page;
					self.erase_all();
					if(self.slide_qu[data.page]){
						self.ctx.drawImage(self.slide_qu[data.page], 0, 0,$("#iframe_slideshare").contents().find("#main").width(),$("#iframe_slideshare").contents().find("#main").height());
					}	
				}		
			}else if(data.img){
				var dataURL = data.img;
				var img = new Image;
				img.src = dataURL;
				self.slide_page = data.page;
				self.slide_qu[data.page] = img;

			}
			if(data.slide_url != self.current_slide_name) {
				iframe_slideshare.loadPlayer(data.slide_url, data.page);
				self.current_slide_name = data.slide_url;
				$("#slideshare_url").val(data.slide_url);
				self.slide_qu = [];
			}
			if(iframe_slideshare.player && iframe_slideshare.player.jumpTo) {
				iframe_slideshare.player.jumpTo(data.page);
			}
			$("body").trigger("share_drawing");
		});
	},
	disconnecting: function(){
		this.socket.removeAllListeners("slideshare_get");
		this.socket.removeAllListeners("slideshare_message");
	},
	draw_init: function (){
		var self = this;
		self.coordinate = [];
		self.canvas = iframe_slideshare.get_canvas();
		self.erase_size = 20;
		//self.canvas = $("#iframe_slideshare").contents().find("#drawing-canvas");
		self.slideshare_document = iframe_slideshare.get_document();
		self.datum = self.slideshare_document.getElementById("player");
		$(self.canvas).css('z-index', '4');
		//self.main_div = self.slideshare_document.getElementById("main");
		//self.body_top = $("#iframe_slideshare").position().top;
		if(self.ctx==null)
			self.ctx = self.canvas.getContext('2d');

		/*var init_ctx = {
			canvas : {
				width :	$("#iframe_slideshare").contents().find("#player").width(),
				height :	$("#iframe_slideshare").contents().find("#player").height()
			},
			lineCap : 'round',
			lineJoin : 'round',
			strokeStyle : "#FF0000",
			lineWidth : 3
		};
		$.extend(self.ctx, init_ctx);*/ // it does not work

		self.ctx.canvas.width = $("#iframe_slideshare").contents().find("#player").width();
		self.ctx.canvas.height = $("#iframe_slideshare").contents().find("#player").height();
		self.ctx.lineCap = 'round';
		self.ctx.lineJoin = 'round';
		self.strokeStyle = "#FF0000";
		

		/*self.ctx.webkitImageSmoothingEnabled = false;
		self.ctx.mozImageSmoothingEnabled = false;*/
		$("#iframe_slideshare").contents().attr('unselectable', 'on')
		.css('user-select', 'none')
		.on('selectstart', false);

		$(self.canvas).mousedown( function (e) {
			if($("#paint").val()=='erase'){
				$(self.canvas).css('cursor', 'none');
				self.draw_canvas('erase');
			}else if($("#paint").val()=='paint'){
				$(self.canvas).css('cursor', 'crosshair');
				self.draw_canvas('paint');
			}
		});

		$(self.canvas).mouseup( function () {
			self.mouseState = 0;
			$('#eraser').hide();
			$(self.canvas).css('cursor', 'default');
			$(self.slideshare_document).unbind('mousemove');
		});


		$(self.canvas).click( function () {
			if($('a[action="slideshare_draw"]').find('div').hasClass('slide_button_pressed')){
				$('a[action="slideshare_palette"]').find('div').removeClass('slide_button_pressed');
				$('a[action="slideshare_brush"]').find('div').removeClass('slide_button_pressed');
				//$('a[action="slideshare_erase_size"]').find('div').removeClass('slide_button_pressed');
			} else {
				$(".slide_button_pressed").removeClass('slide_button_pressed');
			}
			$("#brush_container").hide();
			$("#slideshare_palette_container").hide();
			//$("#slideshare_palette_container").attr("state","hide");
		});
		$(self.canvas).bind("resize_canvas",function(){
			var dataURL =self.canvas.toDataURL();
			var img = new Image;
			img.src = dataURL;
			img.onload = function (){
				//var width = self.myctx.lineWidth;
				//var style = self.myctx.strokeStyle;
				// self.ctx.canvas.width = $(self.main_div).width();
				// self.ctx.canvas.height = $(self.main_div).height();
				self.ctx.canvas.width = $("#iframe_slideshare").contents().find("#main").width();
				self.ctx.canvas.height = $("#iframe_slideshare").contents().find("#main").height();
				self.ctx.strokeStyle=self.myctx.strokeStyle;
				self.ctx.lineWidth = self.myctx.lineWidth;
				self.ctx.drawImage(img, 0, 0,$("#iframe_slideshare").contents().find("#main").width(),$("#iframe_slideshare").contents().find("#main").height());
			}
			//self.body_top = $("#iframe_slideshare").position().top;
		});

		$(self.canvas).mouseleave(function(e){
			self.mouseState = 0;
			$(self.canvas).css('cursor', 'default');
			$(self.slideshare_document).unbind('mousemove');
			$('#eraser').hide();
		});

		//$("#erase_all, #slide_prev, #slide_next").unbind('click');
		//$("#erase_all, #slide_prev, #slide_next").click( function () {
		$("#erase_all").unbind('click');
		$("#erase_all").click( function(){
			self.ctx.beginPath();
			self.ctx.clearRect( 0, 0, self.ctx.canvas.width, self.ctx.canvas.height);
			self.ctx.closePath();
			self.socket_mode("slideshare",'{"channel":"erase_all", "workspace": "'+ core.status.current_project_path +'"}');
		});
		
		if(self.picker==null){
			self.picker = new YAHOO.widget.ColorPicker("slideshare_palette", {
				showhsvcontrols: false,
				showhexfcontrols: false,
				images: {
					PICKER_THUMB: "/images/org.goorm.core.collaboration/picker_thumb.png",
					HUE_THUMB: "/images/org.goorm.core.collaboration/hue_thumb.png"
				}
			});
		}
		self.picker.setValue([255,0,0],false);
		self.picker.on("rgbChange", function(o) {
			self.change_color(o);
		});
	},

	show_canvas : function(){
		var self = this;

		this.drawing_state =  'draw';

		$(this.flashMovie).css('z-index', '4');

		$("#brush_container").hide();
		$("#slideshare_palette_container").hide();

		$("#paint").unbind("click");
		$(".slide_button_pressed").removeClass('slide_button_pressed')
	},

	draw_canvas: function (mode) {
		var self = this;
		var ctx = self.ctx;
		var position = $(self.canvas).position();
		// var relative_width = self.canvas.width;
		// var relative_height = self.canvas.height;
		var data = {};
		self.mouseState = 0;
		$(self.slideshare_document).unbind('mousemove');
		switch( mode ){
		case 'paint' :
			$(self.slideshare_document).mousemove( function (e) {

				if (self.mouseState == 0) {
					self.mouseState = 1;
					x_from = e.pageX - position.left;
					y_from = e.pageY - position.top;
				}
				x = e.pageX - position.left;
				y = e.pageY - position.top;

				data = {
					"channel" : "draw",
					"workspace" : core.status.current_project_path,
					"x" : x/self.canvas.width,
					"y" : y/self.canvas.height,
					"x_from" : x_from/self.canvas.width,
					"y_from" : y_from/self.canvas.height,
					"lineWidth" : self.myctx.lineWidth/self.canvas.width,
					"color" : self.myctx.strokeStyle
				};

				self.drawing(data);
				self.socket_mode('slideshare',JSON.stringify(data));

				x_from = x;
				y_from = y;
			});
			break;
		case 'erase' :
			$(self.slideshare_document).mousemove( function (e) {
				$('#eraser').show();
				$('#eraser').css({ 'top' : e.pageY + $("#iframe_slideshare").position().top+5, 'left' : e.pageX+5 });

				data = {
					"channel" : "erase",
					"workspace" : core.status.current_project_path,
					"x" : e.pageX/self.canvas.width,
					"y" : e.pageY/self.canvas.height,
					"erase_size" : self.erase_size,
					"relative_width" : self.canvas.width,
					"relative_height" : self.canvas.height
				};

				self.erase(data);
				self.socket_mode('slideshare',JSON.stringify(data));
			});
			break;
		/*case 'highlight' :
			$(self.slideshare_document).mousemove( function (e) {

				if (self.mouseState == 0) {
					self.mouseState = 1;
					x_from = e.pageX - position.left;
					y_from = e.pageY - position.top;
				}
				x = e.pageX - position.left;
				y = e.pageY - position.top;

				data = {
					"channel" : "highlight",
					"workspace" : core.status.current_project_path,
					"x" : x/self.canvas.width,
					"y" : y/self.canvas.height,
					"x_from" : x_from/self.canvas.width,
					"y_from" : y_from/self.canvas.height,
					"lineWidth" : self.myctx.lineWidth/self.canvas.width,
					"color" : self.myctx.strokeStyle
				};

				self.highlight(data);
				self.socket_mode('slideshare',JSON.stringify(data));

				x_from = x;
				y_from = y;
			});
			break;*/
		}
	},

	socket_mode: function(key,message){
		if(this.connect_button.attr('state')=="connected" && $('#slide_authentic').val()=='true'){
			this.socket.emit(key,message);
		}
	},

	change_brush_thickness: function (lineWidth) {
		if (this.ctx != null) {
			var line_width = lineWidth / 10;
			!(line_width) && (line_width = 0.1);

			this.myctx.lineWidth = line_width;
			$('#eraser').css({'width':lineWidth/6,'height':lineWidth/6});
			this.erase_size = lineWidth/6;
		}
		//this.socket.emit("slideshare",'{"channel":"thickness", "workspace": "'+ core.status.current_project_path +'", "lineWidth":"'+this.ctx.lineWidth+'"}');
		//this.socket_mode('{"channel":"thickness", "workspace": "'+ core.status.current_project_path +'", "lineWidth":"'+this.myctx.lineWidth+'"}');
	},

	change_color: function(data){
		function colorToHex (color) {
			var red = color[0];
			var green = color[1];
			var blue = color[2];

			var rgb = blue | (green << 8) | (red << 16);
			return '#' + rgb.toString(16);
		}

		this.myctx.strokeStyle = colorToHex(data.newValue);
	},

	drawing : function (data) {
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = "round";
		this.ctx.beginPath();
		this.ctx.lineWidth = data.lineWidth*this.canvas.width;
		this.ctx.strokeStyle = data.color;
		this.ctx.moveTo(data["x_from"]*this.canvas.width, data["y_from"]*this.canvas.height);
		this.ctx.lineTo(data["x"]*this.canvas.width, data["y"]*this.canvas.height);
		this.ctx.closePath();
		this.ctx.stroke();
	},
	
	erase : function (data) {
		this.ctx.beginPath();
		this.ctx.clearRect( data["x"]*this.canvas.width, data["y"]*this.canvas.height, data["erase_size"]*this.canvas.width/data["relative_width"], data["erase_size"]*this.canvas.height/data["relative_height"]);
		//this.ctx.clearRect( data["x"]*this.canvas.width, data["y"]*this.canvas.height, this.erase_size, this.erase_size);
		this.ctx.closePath();
	},
	/*highlight: function(data){
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = "round";
		this.ctx.beginPath();
		this.ctx.globalAlpha = 0.;
		this.ctx.lineWidth = data.lineWidth*this.canvas.width;
		this.ctx.strokeStyle = data.color;
		this.ctx.moveTo(data["x_from"]*this.canvas.width, data["y_from"]*this.canvas.height);
		this.ctx.lineTo(data["x"]*this.canvas.width, data["y"]*this.canvas.height);
		this.ctx.closePath();
		this.ctx.stroke();
	},*/
	erase_all : function () {
		if(this.ctx){
			this.ctx.beginPath();
			this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
			this.ctx.closePath();
		}
	}
};
