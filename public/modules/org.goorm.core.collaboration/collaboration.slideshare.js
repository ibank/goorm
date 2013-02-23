/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
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
	this.canvas = null;
	this.slideshare_document = null;
	this.ctx = null;
	this.myctx = {
		strokeStyle : "#FF0000",
		lineWidth : 3
	};
	this.datum = null;
	this.flashMovie = null;
	this.drawing_state = 'undraw';
};

 org.goorm.core.collaboration.slideshare.prototype = {

	init: function(){
		this.socket = io.connect();
		var self = this;

		var slide_body = "";
		slide_body += "<div id='slide_url' class='layout_right_slide_tab'>";
		slide_body +=	"URL <input id='slideshare_url' type='text' value='http://www.slideshare.net/jeg0330/goorm-15035830'/>"
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
		slide_body +=		"<input type='hidden' id='paint' value='paint'/>"
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
		slide_body +=		"<div id='slideshare_palette' style='width: 335px; height: 200px; background-color: #fff; border: 1px solid #333; border-radius: 3px;'></div>"
		slide_body +=	"</div>"
		slide_body +=	"</div>"
		slide_body += "<div id='eraser' style='display: none; position: absolute; width: 20px; height: 20px; border: 1px solid #000;background-color: #fff;'></div>"
		slide_body += "<iframe id='iframe_slideshare' src='http://"+document.location.host+"/lib/slideshare/slide.html' width='100%' height='100%' frameborder=0 marginwidth=0 marginheight=0 scrolling=no> </iframe>"

		$("#slide_body").append(slide_body);
		core.module.toolbar.add_to_slideshare("public/configs/toolbars/org.goorm.core.slideshare/slideshare.toolbar.html","org.goorm.core.slideshare",$("#slideshare_canvas_toolbar"));
		$("#brush_container").hide();
		$("#brush_container").attr("state","hide");

		$("#slideshare_palette_container").hide();
		$("#slideshare_palette_container").attr("state","hide");
		$("#slideshare_palette_container").css("position","absolute");
		$('a[action="slideshare_draw"]').attr("value","draw");
		var slider = new YAHOO.widget.Slider.getHorizSlider("sliderbg", "sliderthumb", 0, 200);
		slider.subscribe("slideEnd", function (){
			self.change_brush_thickness(slider.getValue());
		});
		slider.subscribe("change", function () {
		    $( "#brush_thickness" ).val(slider.getValue()/10 );
		});
		var count = 0;
		

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
			} else {
				$(this).attr('value', 'undraw');
				$(self.canvas).css('z-index', '4');

				if(count == 0) {
					self.draw_init();
					count++;
				}
 				self.draw_canvas();

				$("a[action=slideshare_paint]").find('div').addClass('slide_button_pressed')
				$("#paint").val("paint");
			}
		})
		

		if (this.socket.socket.connected) {
		//this.socket.emit("message", '{"channel": "slideshare", "action":"send_message", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace": "'+ core.status.current_project_name +'", "message":"' + encodedMsg + '"}');
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

			$("body").trigger("share_drawing");
		});


 		$("body").one("share_drawing", function (data){
 		
			self.canvas = iframe_slideshare.get_canvas();
			self.slideshare_document = iframe_slideshare.get_document();
			self.datum = self.slideshare_document.getElementById("player");
			self.ctx = self.canvas.getContext('2d');
			self.ctx.canvas.width = $(self.datum).width();
			self.ctx.canvas.height = $(self.datum).height();
			console.log("enter")
			self.socket.on("slideshare_get", function (raw_msg) {
				/*
				 * data = {channel, color, lineWidth, workspace, x, x_from, y, y_from}
				 */
				var msg_obj = JSON.parse(raw_msg);
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
				}
			});


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
					self.socket.emit("message", '{"channel": "slideshare", "workspace": "'+ core.status.current_project_name +'", "slide_url":"'+self.current_slide_name+'", "page":'+iframe_slideshare.player.getCurrentSlide()+'}');
				}
			}
		});
		
		this.button_next = new YAHOO.widget.Button("slide_next", {
 			onclick: {
 				fn: function(){
					iframe_slideshare.player.next();
					self.socket.emit("message", '{"channel": "slideshare", "workspace": "'+ core.status.current_project_name +'", "slide_url":"'+self.current_slide_name+'", "page":'+iframe_slideshare.player.getCurrentSlide()+'}');
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
				self.socket.emit("message", '{"channel":"slideshare", "workspace": "'+ core.status.current_project_name +'", "slide_url":"'+slide_url[1]+'", "page":1}');
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

	draw_init: function (){
		var self = this;
		self.coordinate = [];
		self.canvas = iframe_slideshare.get_canvas();
		self.erase_size = 20;
		//self.canvas = $("#iframe_slideshare").contents().find("#drawing-canvas");
		self.slideshare_document = iframe_slideshare.get_document();
		self.datum = self.slideshare_document.getElementById("player");

		self.main_div = self.slideshare_document.getElementById("main");
		self.body_top = $("#iframe_slideshare").position().top;

		self.ctx = self.canvas.getContext('2d');

		var init_ctx = {
			canvas : {
				width :	$("#iframe_slideshare").contents().find("#player").width(),
				height :	$("#iframe_slideshare").contents().find("#player").height()
			},
			lineCap : 'round',
			lineJoin : 'round',
			strokeStyle : "#FF0000",
			lineWidth : 3
		};
		$.extend(self.ctx, init_ctx);

		/*self.ctx.webkitImageSmoothingEnabled = false;
		self.ctx.mozImageSmoothingEnabled = false;*/
		$("#iframe_slideshare").contents().attr('unselectable', 'on')
		.css('user-select', 'none')
		.on('selectstart', false);

		$(self.canvas).mousedown( function (e) {
			
			if($("#paint").val()=='erase'){
				/*$('#eraser').show();
				$(self.slideshare_document).mousemove( function (e){
					$('#eraser').css({'top':e.pageY+self.body_top+5,'left':e.pageX+5});
				});*/
				$(self.canvas).css('cursor', 'none');
			}else
				$(self.canvas).css('cursor', 'crosshair');
			self.draw_canvas($("#paint").val());
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
			$("#slideshare_palette_container").attr("state","hide");
		});
		
		// $(self.canvas).click( function () {
		// 	if($('a[action="slideshare_draw"]').find('div').hasClass('slide_button_pressed')){
		// 		if($("a[action=slideshare_connect]").find('div').hasClass('slide_button_pressed')){
		// 			$(".slide_button_pressed").removeClass('slide_button_pressed');
		// 			$('a[action="slideshare_draw"]').find('div').addClass('slide_button_pressed');
		// 			$("a[action=slideshare_connect]").find('div').addClass('slide_button_pressed');
		// 		}else{
		// 			$(".slide_button_pressed").removeClass('slide_button_pressed');
		// 			$('a[action="slideshare_draw"]').find('div').addClass('slide_button_pressed');
		// 		}
		// 	} else {
		// 		$(".slide_button_pressed").removeClass('slide_button_pressed');
		// 	}
		// 	$("#brush_container").hide();
		// 	$("#slideshare_palette_container").hide();
		// 	$("#slideshare_palette_container").attr("state","hide");
		// 	$("#slideshare_palette_contadraw_initiner").attr("state","hide");
		// });

		$(self.canvas).bind("resize_canvas",function(){
			var dataURL =self.canvas.toDataURL();
			var img = new Image;
			img.src = dataURL;

			img.onload = function (){
				//var width = self.myctx.lineWidth;
				//var style = self.myctx.strokeStyle;
				self.ctx.canvas.width = $(self.main_div).width();
				self.ctx.canvas.height = $(self.main_div).height();
				self.ctx.strokeStyle=self.myctx.strokeStyle;
				self.ctx.lineWidth = self.myctx.lineWidth;
				self.ctx.drawImage(img, 0, 0,$(self.datum).width(),$(self.datum).height());
			}
			self.body_top = $("#iframe_slideshare").position().top;
		});
		$(self.canvas).mouseleave(function(e){
			self.mouseState = 0;
			$(self.canvas).css('cursor', 'default');
			$(self.slideshare_document).unbind('mousemove');
			$('#eraser').hide();
		});

		$("#erase_all, #slide_prev, #slide_next").unbind('click');
		$("#erase_all, #slide_prev, #slide_next").click( function () {
			self.ctx.beginPath();
			self.ctx.clearRect( 0, 0, self.ctx.canvas.width, self.ctx.canvas.height);
			self.ctx.closePath();
			self.socket.emit("slideshare",'{"channel":"erase_all", "workspace": "'+ core.status.current_project_name +'"}');
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
		var relative_width = self.canvas.width;
		var relative_height = self.canvas.height;
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

					if (x<0 || y<0 || x>self.ctx.canvas.width || y>self.ctx.canvas.height) {
						$(self.canvas).trigger('mouseup');
						return;
					}

					var data = {
						"channel" : "draw",
						"workspace" : core.status.current_project_name,
						"x" : x/self.canvas.width,
						"y" : y/self.canvas.height,
						"x_from" : x_from/self.canvas.width,
						"y_from" : y_from/self.canvas.height,
						"lineWidth" : self.myctx.lineWidth/self.canvas.width,
						"color" : self.myctx.strokeStyle
					};

					self.drawing(data);
					self.socket_mode(JSON.stringify(data));
					// self.ctx.lineCap = 'round';
					// self.ctx.lineJoin = "round";
					// self.ctx.beginPath();	
					// self.ctx.moveTo( x_from, y_from);
					// self.ctx.lineTo( x, y);
					// self.ctx.closePath();
					// self.ctx.stroke();
					//self.socket.emit("slideshare",'{"channel":"draw", "workspace": "'+ core.status.current_project_name +'", "x_from":"'+(x_from*relative_width)+'","y_from":"'+(y_from*relative_height)+'","x":"'+(x*relative_width)+'","y":"'+(y*relative_height)+'","lineWidth":"'+self.ctx.lineWidth+'","color":"'+self.ctx.strokeStyle+'"}');
					//self.socket_mode('{"channel":"draw", "workspace": "'+ core.status.current_project_name +'", "x_from":"'+(x_from*relative_width)+'","y_from":"'+(y_from*relative_height)+'","x":"'+(x*relative_width)+'","y":"'+(y*relative_height)+'","lineWidth":"'+self.ctx.lineWidth+'","color":"'+self.ctx.strokeStyle+'"}');
					//self.socket_mode('{"channel":"draw", "workspace": "'+ core.status.current_project_name +'", "x_from":"'+(x_from/relative_width)+'","y_from":"'+(y_from/relative_height)+'","x":"'+(x/relative_width)+'","y":"'+(y/relative_height)+'","lineWidth":"'+self.ctx.lineWidth/relative_width+'","color":"'+self.ctx.strokeStyle+'"}');
					
					x_from = x;
					y_from = y;
				});

				break;
			case 'erase' :
				$(self.slideshare_document).mousemove( function (e){
					$('#eraser').show();
					$('#eraser').css({'top':e.pageY+self.body_top+5,'left':e.pageX+5});
					self.ctx.beginPath();
					self.ctx.clearRect( e.pageX, e.pageY, self.erase_size, self.erase_size);//clear partly
					self.ctx.closePath();

					//self.socket.emit("slideshare",'{"channel":"erase", "workspace": "'+ core.status.current_project_name +'", "x":"'+(e.pageX*relative_width)+'","y":"'+(e.pageY*relative_height)+'"}');
					//self.socket_mode('{"channel":"erase", "workspace": "'+ core.status.current_project_name +'", "x":"'+(e.pageX*relative_width)+'","y":"'+(e.pageY*relative_height)+'"}');
					self.socket_mode('{"channel":"erase", "workspace": "'+ core.status.current_project_name +'", "x":"'+(e.pageX/relative_width)+'","y":"'+(e.pageY/relative_height)+'","relative_width":"'+relative_width+'","relative_height":"'+relative_height+'"}');
				});
				break;
		}
	},

	socket_mode: function(message){
		//if(this.connect_button.attr('state')=="connected"){
			this.socket.emit("slideshare",message);
		//}
	},

	change_brush_thickness: function (lineWidth) {
		if (this.ctx != null) {
			var line_width = lineWidth / 10;
			!(line_width) && (line_width = 0.1);

			this.myctx.lineWidth = line_width;
			$('#eraser').css({'width':lineWidth/6,'height':lineWidth/6});
			this.erase_size = lineWidth/6;
		}
		//this.socket.emit("slideshare",'{"channel":"thickness", "workspace": "'+ core.status.current_project_name +'", "lineWidth":"'+this.ctx.lineWidth+'"}');
		//this.socket_mode('{"channel":"thickness", "workspace": "'+ core.status.current_project_name +'", "lineWidth":"'+this.myctx.lineWidth+'"}');
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
		this.ctx.clearRect( data["x"]*this.canvas.width, data["y"]*this.canvas.height, 30*this.canvas.width/data["relative_width"], 30*this.canvas.height/data["relative_height"]);
		this.ctx.closePath();
	},
	erase_all : function () {
		this.ctx.beginPath();
		this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.closePath();
	},
	// thickness : function (data) {
	// 	this.ctx.beginPath();
	// 	this.ctx.lineWidth = data["lineWidth"];
	// 	this.ctx.closePath();
	// },

	hide_all : function(){

	}
};
