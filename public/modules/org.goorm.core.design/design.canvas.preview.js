/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.design.canvas.preview = function () {
	
	this.panel = null;	
	this.target = null;
	this.real_target = null;
	this.real_width = null;
	this.real_height = null;
	this.width = null;
	this.height = null;
	this.left = null;
	this.top = null;
	this.scale = null;
	this.parent = null;
	this.indicator_width = null;
	this.is_preview_clicked = null;
	this.indicator_top_fake = null;
};


org.goorm.core.design.canvas.preview.prototype = {
	init: function (target, width, height, scale, parent) {
		var self = this;

		//Set Properties
		self.target = target;
		self.real_width = width;
		self.width = width*scale;
		self.real_height = height;
		self.height = height*scale;
		self.scale = scale;
		self.parent = parent;
		self.is_preview_clicked = false;
		
		self.indicator_top_fake = 30;
				
		this.panel = new YAHOO.widget.Panel(
			target, { 
				visible: true, 
				underlay: "none",
				close: false,
				autofillheight: "body",
				draggable: true,
				constraintoviewport: true
			} 
		);	
		
		//////////////////////////////////////////////////////////////////////////////////////////
		// window setting
		//////////////////////////////////////////////////////////////////////////////////////////	
		
		this.panel.setHeader("<div style='overflow:auto' class='titlebar'><div style='float:left; font-size:9px;'>Preview</div><div style='float:right;'><img src='images/icons/context/closebutton.png' class='closePreview window_button' /></div></div>");
		this.panel.setBody("<div class='window_container'></div>");
		this.panel.render();
		
		$(target).parent().css("left", 30);
		$(target).parent().css("top", 70);
		
		$(target).find(".hd").mouseup(function () {
			self.left = parseInt($(self.target).parent().offset().left-$(self.target).parent().parent().offset().left);
			self.top = parseInt($(self.target).parent().offset().top-$(self.target).parent().parent().offset().top);
		});
		

		//adding html container
		$(target).find(".window_container").append("<div class='previewCanvasIndicator'></div>");
		$(target).find(".window_container").append("<div class='previewCanvas'></div>");
		$(target).find(".window_container").find(".previewCanvas").append("<canvas width='"+self.width+"' height='"+self.height+"'></canvas>");
		$(target).find(".window_container").find(".previewCanvas").append("<div class='previewEvent' style='width:"+self.width+"px; height:"+self.height+"px;'></div>");		
		
		$(self.target).find(".closePreview").click(function() {
			self.parent.toolbar.toggle_preview();
		});

	},
	
	setSize: function (option, indicator_top_fake) {
		var self = this;
		
		if (option=="change") {
			self.real_width = self.parent.width;
			self.width = self.parent.width*self.scale;
			self.real_height = self.parent.height;
			self.height = self.parent.height*self.scale;
			
			if (!indicator_top_fake) {
				self.indicator_top_fake = 30;
			}
			else {
				self.indicator_top_fake = indicator_top_fake;
			}
			
			$(self.target).find(".window_container").find(".previewCanvas").find("canvas").attr("width", self.width);
			$(self.target).find(".window_container").find(".previewCanvas").find("canvas").attr("height", self.height);
			$(self.target).find(".window_container").find(".previewCanvas").find(".previewEvent").width(self.width);
			$(self.target).find(".window_container").find(".previewCanvas").find(".previewEvent").height(self.height);
		}
		
		// set window_container size
		$(self.target).find(".window_container").width(self.width);
		$(self.target).find(".window_container").height(self.height);
		
		// set indicator size
		if(($(self.target).parent().parent().find(".canvas_container").width()-14) > self.real_width) {
			self.indicator_width = $(self.target).find(".window_container").width()+3;
		}
		else {
			self.indicator_width = ($(self.target).parent().parent().find(".canvas_container").width()-14)*self.scale;
		}
		self.indicatorHeight = ($(self.target).parent().parent().find(".canvas_container").height()-14)*self.scale;
		$(self.target).find(".previewCanvasIndicator").width(self.indicator_width-5);
		$(self.target).find(".previewCanvasIndicator").height(self.indicatorHeight-5);
		
	},

	setup: function () {
		
		var self = this;
		
		self.left = parseInt($(self.target).parent().css("left"));
		self.top = parseInt($(self.target).parent().css("top"));
		
		self.indicator_top_fake = 30;
		
		// set scroll event
		$(self.parent.target).scroll(function () {

			var movedLeft = $(this).scrollLeft();
			var movedTop = $(this).scrollTop();
			
/*
			var zoomValue = self.parent.toolbar.zoom_level/100;
			
			
			movedLeft = movedLeft/zoomValue;
			movedTop = movedTop/zoomValue;
*/
			
			var threshold = self.real_height * self.scale - $(self.target).find(".previewCanvasIndicator").height();
			
			if ((movedLeft-45) * self.scale <= 0) {
				$(self.target).find(".previewCanvasIndicator").css("left", 0);
			}
			else if ( (movedLeft-45) * self.scale > self.width - self.indicator_width + 3) {
				$(self.target).find(".previewCanvasIndicator").css("left", "");
				$(self.target).find(".previewCanvasIndicator").css("right", 0);
			}
			else {
				$(self.target).find(".previewCanvasIndicator").css("left", ((movedLeft-45) * self.scale));
			}
			
			if ((movedTop-self.indicator_top_fake) * self.scale <= 0) {
				$(self.target).find(".previewCanvasIndicator").css("top", 0);
			}
			else if ( (movedTop-self.indicator_top_fake) * self.scale > self.height - self.indicatorHeight + 3) {
				$(self.target).find(".previewCanvasIndicator").css("top", "");
				$(self.target).find(".previewCanvasIndicator").css("bottom", 0);
			}
			else {
				$(self.target).find(".previewCanvasIndicator").css("top", ((movedTop-self.indicator_top_fake) * self.scale));
			}

		});
		
		
		// set previewEvent
		$(self.target).find(".previewEvent").mousedown(function (event) {
			self.is_preview_clicked=true;
		});
		
		$(self.target).find(".previewEvent").mouseup(function (event) {
			self.is_preview_clicked = false;
			var clickedX = event.pageX-$(this).offset().left;
			var clickedY = event.pageY-$(this).offset().top;
									
			self.moveScrollFromEvent(clickedX, clickedY);
		});
		
		$(self.target).find(".previewEvent").mousemove(function (event) {
			if(self.is_preview_clicked) {
				var clickedX = event.pageX-$(this).offset().left;
				var clickedY = event.pageY-$(this).offset().top;
				
				self.moveScrollFromEvent(clickedX, clickedY);
			}
		});
				
		$(self.target).find(".previewEvent").mouseout(function (event) {
			self.is_preview_clicked=false;
		});
	},
	
	moveScrollFromEvent: function (clickedX, clickedY) {
		var self = this;

		if ( clickedY < self.indicatorHeight/2 ) {
			$(self.target).parent().parent().find(".canvas_container").scrollTop(self.indicator_top_fake);			
		}
		else if ( clickedY > self.height - self.indicatorHeight/2 ) {
			var totalHeight = $(self.target).parent().parent().find(".canvas_container").find(".space").height();
			var currentwindowHeight = $(self.target).parent().parent().find(".canvas_container").height()-14;

			$(self.target).parent().parent().find(".canvas_container").scrollTop(totalHeight-currentwindowHeight-self.indicator_top_fake);
		}
		else {
			$(self.target).parent().parent().find(".canvas_container").scrollTop((clickedY-(self.indicatorHeight/2))/self.scale+self.indicator_top_fake);			
		}
				
		if ((self.width-2) > $(self.target).find(".previewCanvasIndicator").width()) {
			if ( clickedX < self.indicator_width/2 ) {
				$(self.target).parent().parent().find(".canvas_container").scrollLeft(18);			
			}
			else if ( clickedX > self.width - self.indicator_width/2 + 5 ) {				
				var totalWidth = $(self.target).parent().parent().find(".canvas_container").find(".space").width();
				var currentwindowWidth = $(self.target).parent().parent().find(".canvas_container").width()-14;
				
				$(self.target).parent().parent().find(".canvas_container").scrollLeft(totalWidth-currentwindowWidth-18+14);
			}
			else {
				$(self.target).parent().parent().find(".canvas_container").scrollLeft((clickedX-(self.indicator_width/2)+4)/self.scale);
			}
		}
		else {
			var totalWidth = $(self.target).parent().parent().find(".canvas_container").find(".space").width();
			var currentwindowWidth = $(self.target).parent().parent().find(".canvas_container").width()-14;
	
			$(self.target).parent().parent().find(".canvas_container").scrollLeft((totalWidth-currentwindowWidth)/2);
		}
	},
	
	draw: function () {
		var self = this;
		
		
/*
		this.selected_index = $.unique(this.selected_index);
*/
		
		
		//Canvas Element (Supported in HTML5)
		if($(this.target).find(".previewCanvas").find("canvas")[0].getContext) {
			//Get Context
			var context = $(this.target).find(".previewCanvas").find("canvas")[0].getContext('2d');

			//Clear the canvas
			context.clearRect (0, 0, $(this.target).find(".previewCanvas").find("canvas").width(), $(this.target).find(".previewCanvas").find("canvas").height());	
			
			//All objects
			$(this.parent.objects).each(function (i) {				
				//if the object is line type
				if($(this)[0].type == 'line') {
					
					var sx=0, sy=0, ex=0, ey=0;
					
					if ($(this)[0].properties.sx) {
						sx = parseInt($(this)[0].properties.sx);
						sx *= self.scale;
					}
					
					if ($(this)[0].properties.sy) {
						sy = parseInt($(this)[0].properties.sy);
						sy *= self.scale;
					}
	
					if ($(this)[0].properties.ex) {
						ex = parseInt($(this)[0].properties.ex);
						ex *= self.scale;
					}

					if ($(this)[0].properties.ey) {					
						ey = parseInt($(this)[0].properties.ey);
						ey *= self.scale;
					}
					

					
					//is hovered?
					if(self.parent.hovered_index == i) {
						context.beginPath();
						context.strokeStyle = "#FFFF00";
						
						context.moveTo(sx, sy);
						context.lineTo(ex, ey);
						context.lineWidth = parseFloat($(this)[0].properties.thickness)*self.scale+5;
						context.stroke();
					}
					
					
					//drawing the object
					context.beginPath();
					context.strokeStyle = "#000000";
					
					
					
					
					if (this.properties.dashed) {
						var dash_array=[5, 4];
						var dash_count = dash_array.length;
						
						var dx, dy;
						
						var dash_index=0, draw=true;
						
						var x, y;
						
						if (ex < sx) {
							x = ex;
							y = ey;
						}
						else {
							x = sx;
							y = sy;
						}
						
						dx = (ex-sx);
						dy = (ey-sy);
						context.moveTo(x, y);
						context.lineWidth = parseFloat($(this)[0].properties.thickness);
						
						var slope = dy/dx;
						var remaining_distance = Math.sqrt( dx*dx + dy*dy );
						
						while (remaining_distance>=0.1){
							var dash_length = dash_array[dash_index++%dash_count];
							
							if (dash_length > remaining_distance) 
								dash_length = remaining_distance;
								
						  	var step_x = Math.sqrt( dash_length*dash_length / (1 + slope*slope) );
							
						  	x += step_x
						  	y += slope*step_x;
							
						  	context[draw ? 'lineTo' : 'moveTo'](x,y);
						
						  	remaining_distance -= dash_length;
						  	draw = !draw;
						}
						
						context.stroke();
					}
					else {	
						context.moveTo(sx, sy);
						context.lineTo(ex, ey);
						context.lineWidth = parseFloat($(this)[0].properties.thickness)*self.scale+0.5;
						context.stroke();
					}
					
					if (this.shape) {
											
						if (this.shape.rotate) {
							this.shape.rotate(this.properties.sx, this.properties.sy, this.properties.ex, this.properties.ey);
						}
					
					}					
				}
				else if($(this)[0].type == 'square') { //if the object is line type
					var sx=0, sy=0, ex=0, ey=0;
					
					if ($(this)[0].properties.sx) {
						sx = parseInt($(this)[0].properties.sx);
						sx *= self.scale;
					}
					
					if ($(this)[0].properties.sy) {
						sy = parseInt($(this)[0].properties.sy);	
						sy *= self.scale;
					}
	
					if ($(this)[0].properties.ex) {
						ex = parseInt($(this)[0].properties.ex);
						ex *= self.scale;
					}

					if ($(this)[0].properties.ey) {					
						ey = parseInt($(this)[0].properties.ey);
						ey *= self.scale;
					}
					
					//is hovered?
					if(self.parent.hovered_index == i) {
						context.beginPath();
						context.strokeStyle = "#FFFF00";
						
						context.rect(sx, sy, ex-sx, ey-sy);
						context.lineWidth = 5;
						context.closePath();
						
						context.stroke();
						
						context.beginPath();
						context.strokeStyle = "#000000";
						context.fillStyle = "#FFFFFF";
						
						context.rect(sx, sy, ex-sx, ey-sy);
						context.lineWidth = 0.5;
						context.closePath();
						
						context.stroke();
					}
										
					//drawing the object
					
					context.beginPath();
					context.strokeStyle = "#000000";
					context.fillStyle = "#FFFFFF";
					
					context.rect(sx, sy, ex-sx, ey-sy);
					context.lineWidth = 0.5;
					context.closePath();
					
					context.stroke();
					context.fill();
										
					if (this.shape) {
											
						if (this.shape.move) {
							this.shape.move(this.properties.sx, this.properties.sy, this.properties.ex, this.properties.ey);
							this.shape.set_shape();
						}
					
					}
				}
			});
		}
	}
};
