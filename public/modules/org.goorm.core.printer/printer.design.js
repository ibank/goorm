/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.printer.design = function () {
	this.canvas = null;
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
};


org.goorm.core.printer.design.prototype = {
	init: function (target, width, height, scale, parent) {
		var self = this;

		//this.canvas = canvas;

		//Set Properties
		self.target = target;
		self.real_width = width;
		self.width = width*scale;
		self.real_height = height;
		self.height = height*scale;
		self.scale = scale;
		self.parent = parent;
		self.is_preview_clicked = false;
		
		

		//adding html container
		$(target).append("<div class='canvas'></div>"); //This is a canvas layer
		$(target).find(".canvas").append("<div class='shapes' style='position:absolute; width:" + width + "px; height:" + height + "px; border:1px solid #ccc;'></div>"); //This is a grid layer which has grid background image and opacity
		$(target).find(".canvas").append("<canvas width='"+self.width+"' height='"+self.height+"' style='position:absolute; background-color:transparent;'></canvas>"); //This is a canvas element which is supported in HTML5
		
		
		//Get the Stencils
		$(target).prepend("<head><style></style></head>");
		
		var url = "file/get_contents";
		
		$.ajax({
			url: url,			
			type: "GET",
			data: "path=../../stencil/org.goorm.stencil.uml/stencil.uml.css",
			success: function(data) {
				$(target).find("style").html(data);
			}
		});
	},

	draw: function () {
		var self = this;
		
		/*
		this.selected_index = $.unique(this.selected_index);
		*/
		
		//Canvas Element (Supported in HTML5)
		if($(this.target).find(".canvas").find("canvas")[0].getContext) {
			//Get Context
			var context = $(this.target).find(".canvas").find("canvas")[0].getContext('2d');
			
			//Clear the canvas
			context.clearRect (0, 0, $(this.target).find(".canvas").find("canvas").width(), $(this.target).find(".canvas").find("canvas").height());	
			
			//All objects
			$(this.parent.objects).each(function (i) {
				

				
				if (this.properties.timestamp == null) {
					var a = self.parent.objects.slice(0, i);
					var b = self.parent.objects.slice(i, self.parent.objects.length);
					
					b.shift();
					self.parent.objects = a.concat(b);
					//self.objects.pop(i);					
				}


			
				//if the object is line type
				if($(this)[0].type == 'line') {
					
					var sx=0, sy=0, ex=0, ey=0;
					
					if ($(this)[0].properties.sx) {
						sx = parseInt($(this)[0].properties.sx);
					}
					
					if ($(this)[0].properties.sy) {
						sy = parseInt($(this)[0].properties.sy);	
					}
	
					if ($(this)[0].properties.ex) {
						ex = parseInt($(this)[0].properties.ex);
					}

					if ($(this)[0].properties.ey) {					
						ey = parseInt($(this)[0].properties.ey);
					}
					
					if (!self.parent.multi_node_line) {
					
						//is hovered?
						if(self.parent.hovered_index == i) {
							context.beginPath();
							context.strokeStyle = "#FFFF00";
							
							context.moveTo(sx, sy);
							context.lineTo(ex, ey);
							context.lineWidth = parseFloat($(this)[0].properties.thickness) + 5;
							context.stroke();
						}
						
						
						//drawing the object
						context.beginPath();
						context.strokeStyle = $(this)[0].properties.color;
						
						
						
						
						if (this.properties.dashed) {
							var dash_array=[5*parseFloat($(this)[0].properties.thickness), 4*parseFloat($(this)[0].properties.thickness)];
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
								y += slope * step_x;
								
								context[draw ? 'lineTo' : 'moveTo'](x,y);
							
								remaining_distance -= dash_length;
								draw = !draw;
							}
							
							context.stroke();
						}
						else {	
							context.moveTo(sx, sy);
							context.lineTo(ex, ey);
							context.lineWidth = parseFloat($(this)[0].properties.thickness);
							context.stroke();
						}
	
	
						
						//is selected? or hovered?
						if($.inArray(i, self.parent.selected_index) >= 0 || self.parent.selected) {
							context.beginPath();
							context.strokeStyle = "#666666";
							
							context.rect(sx- 3, sy - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();
							
							context.fillStyle = "#FFFFFF";
							context.fill();
							
							context.beginPath();
							context.strokeStyle = "#666666";
							
							context.rect(ex- 3, ey - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();
							
							context.fillStyle = "#FFFFFF";
							context.fill();
						}
						
						if (this.shape) {
						
							eval(this.shape.javascript);
						
						}
						
					}
					else {
						
						//drawing the object
						context.beginPath();
						context.strokeStyle = $(this)[0].properties.color;
		
						if (this.properties.dashed) {
							var dash_array=[5*parseFloat($(this)[0].properties.thickness), 4*parseFloat($(this)[0].properties.thickness)];
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
							context.lineTo((sx+ex)/2, sy);							
							context.lineTo((sx+ex)/2, ey);
							context.lineTo(ex, ey);
							context.lineWidth = parseFloat($(this)[0].properties.thickness);
							context.stroke();
						}
	
	
						
						//is selected? or hovered?
						if($.inArray(i, self.parent.selected_index) >= 0 || self.parent.selected) {
							context.beginPath();
							context.strokeStyle = "#666666";
							
							context.rect(sx- 3, sy - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();
							
							context.fillStyle = "#FFFFFF";
							context.fill();
							
							context.beginPath();
							context.strokeStyle = "#666666";
							
							context.rect(ex- 3, ey - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();
							
							context.fillStyle = "#FFFFFF";
							context.fill();
						}
						
						if (this.shape) {
						
							eval(this.shape.javascript);
						
						}
					}
					
										
				}
				else if($(this)[0].type == 'square') { //if the object is line type
					
					var sx=0, sy=0, ex=0, ey=0;
					
					if ($(this)[0].properties.sx) {
						sx = parseInt($(this)[0].properties.sx);
					}
					
					if ($(this)[0].properties.sy) {
						sy = parseInt($(this)[0].properties.sy);	
					}
	
					if ($(this)[0].properties.ex) {
						ex = parseInt($(this)[0].properties.ex);
					}

					if ($(this)[0].properties.ey) {					
						ey = parseInt($(this)[0].properties.ey);
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
					/*
					context.beginPath();
					context.strokeStyle = "#000000";
					context.fillStyle = "#FFFFFF";
					
					context.rect(sx, sy, ex-sx, ey-sy);
					context.lineWidth = 0.5;
					context.closePath();
					
					context.stroke();
					context.fill();
					*/
					

					
					//is selected?
					if($.inArray(i, self.parent.selected_index) >= 0 || self.parent.selected) {
						context.beginPath();
						context.strokeStyle = "#666666";
						context.fillStyle = "#FFFFFF";
						
						context.rect(sx- 3, sy - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
						
						context.rect(ex- 3, sy - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
						
						context.rect(ex- 3, ey - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
						
						context.rect(sx- 3, ey - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
						
						context.rect( (sx+ex)/2 - 3, ey - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
						
						context.rect( (sx+ex)/2 - 3, sy - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
						
						context.rect(ex- 3, (sy+ey)/2 - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
						
						context.rect(sx- 3, (sy+ey)/2 - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
					}
				
					
					if (this.shape) {
						$(self.target).find(".canvas").find(".shapes").append("<div id='stencil_" + this.shape.timestamp + "' style='position:absolute;'></div>");
						
						if (this.shape.move) {
							var start_x, start_y, width, height;

							$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + this.shape.timestamp).html(this.shape.data);
							
							
							if (this.properties.sx > this.properties.ex) {
								start_x = this.properties.ex;
							}
							else {
								start_x = this.properties.sx;
							}
							
							if (this.properties.sy > this.properties.ey) {
								start_y = this.properties.ey;
							}
							else {
								start_y = this.properties.sy;
							}
							
							width = Math.abs(this.properties.ex-this.properties.sx);
							height = Math.abs(this.properties.ey-this.properties.sy);
							
							$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + this.shape.timestamp).css("left", start_x);
							$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + this.shape.timestamp).css("top", start_y);
							$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + this.shape.timestamp).css("width", width);
							$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + this.shape.timestamp).css("height", height);
							//$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + this.shape.timestamp).css("border", "1px solid #000");

							self.set_shape(this.shape);							
						}
					
					}
				}
			});
		}
		//this.preview.draw();
	},

	set_shape: function(object) {
		var self = this;
		
		if (object.properties != null) {
			$.each(object.properties, function (key, state) {
				if (key == "font_size") {
					$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + object.timestamp).find("."+key).css("font-size", state);
				}
				else if (key == "font_color") {
					$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + object.timestamp).find("."+key).css("color", state);
				}
				else if (key == "font_style") {
					$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + object.timestamp).find("."+key).css("font-style", state);
				}
				else if (key == "font_weight") {
					$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + object.timestamp).find("."+key).css("font-weight", state);
				}				
				else if (key == "bg_color") {
					$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + object.timestamp).find("."+key).css("background-color", state);
				}								
				else {
					$(self.target).find(".canvas").find(".shapes").find("#"+"stencil_" + object.timestamp).find("."+key).html(state);
				}
			});
		}
	}
	
/*	draw: function () {
		var self = this;
		

		
		
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
*/

};
