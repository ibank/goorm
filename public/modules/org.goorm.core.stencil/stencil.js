/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.stencil = function () {
	this.container = null;
	this.timestamp = null;
	this.shape = null;
	this.data = null;	
	this.type = null;
	this.properties = null;
	this.javascript = null;
};

org.goorm.core.stencil.prototype = {
	init: function(shape, type, container, callback) {
		this.timestamp = new Date().getTime();
		
		this.shape = shape;
		this.type = type;
		this.container = container;

		this.properties = {};
		
		$(this.container).append("<div id='stencil_" + this.timestamp + "' style='position:absolute; display:none;'></div>");

		//$(this.container).find("#"+"stencil_" + this.timestamp).append("shape");
		
		this.adapter(callback);
		
		return this;
	},
	
	move: function(sx, sy, ex, ey) {
		var start_x, start_y, width, height;
		
		if (this.type == "square") {
		
			if (sx > ex) {
				start_x = ex;
			}
			else {
				start_x = sx;
			}
			
			if (sy > ey) {
				start_y = ey;
			}
			else {
				start_y = sy;
			}
			
			width = Math.abs(ex-sx);
			height = Math.abs(ey-sy);

			
			$(this.container).find("#"+"stencil_" + this.timestamp).css("left", start_x);
			$(this.container).find("#"+"stencil_" + this.timestamp).css("top", start_y);
			$(this.container).find("#"+"stencil_" + this.timestamp).css("width", width);
			$(this.container).find("#"+"stencil_" + this.timestamp).css("height", height);
		}
	},
	
	rotate: function(context, sx, sy, ex, ey) {
		var start_x, start_y, width, height;
		
		if (this.type == "line") {
						
			width = Math.abs(ex-sx);
			
			var length = parseInt(Math.sqrt((ex-sx)*(ex-sx)+(ey-sy)*(ey-sy)));
			var radian = Math.acos((ex-sx)/length);
			
			
			start_x = (sx+ex)/2-length/2;
			start_y = (sy+ey)/2;
			
			var minus = 1;
			 
			if (ey < sy) {
				minus = -1;
			}
			
			
			$(this.container).find("#"+"stencil_" + this.timestamp).css("left", start_x);
			$(this.container).find("#"+"stencil_" + this.timestamp).css("top", start_y);
			$(this.container).find("#"+"stencil_" + this.timestamp).css("width", length);
			$(this.container).find("#"+"stencil_" + this.timestamp).css("height", 1);
			
			// For webkit browsers: e.g. Chrome
	        $(this.container).find("#"+"stencil_" + this.timestamp).css({ 'WebkitTransform': 'rotate(' + minus * radian + 'rad)'});
	          // For Mozilla browser: e.g. Firefox
	        $(this.container).find("#"+"stencil_" + this.timestamp).css({ '-moz-transform': 'rotate(' + minus * radian + 'rad)'});
			
			
			//context.rotate(radian);			

			
			
			//context.rotate(-radian);	
						
			
		}
	},

	adapter: function(callback) {
		var self = this;
		
		//Get a stencil and adapt it to div
		var url = "file/get_contents";
		
		if (this.type == "square") {
			
			$.ajax({
				url: url,			
				type: "GET",
				data: "path=stencils/"+this.shape+".json",
				success: function(data) {
					self.properties = eval("(" + data + ")");

					if (typeof callback == "function") {
						callback();
					}
					
					self.set_shape();
				}
			});
			
			$.ajax({
				url: url,			
				type: "GET",
				data: "path=stencils/"+this.shape+".html",
				success: function(data) {
					self.data = data;
					$(self.container).find("#"+"stencil_" + self.timestamp).html(data);
					
					if (typeof callback == "function") {
						callback();
					}
				}
			});
			

		}
		else if (this.type == "line") {
			$.ajax({
				url: url,			
				type: "GET",
				data: "path=stencils/"+this.shape+".js",
				success: function(data) {
					//$(self.container).find("#"+"stencil_" + self.timestamp).html(data);
					self.javascript = data;
					
					$(document).trigger("line_stencil_code_loaded");
				}
			});
		}

	},

	set_shape: function() {
		var self = this;
		
		if (this.properties != null) {
			$.each(this.properties, function (key, state) {
				if (key == "font_size") {
					$(self.container).find("#"+"stencil_" + self.timestamp).find("."+key).css("font-size", state);
				}
				else if (key == "font_color") {
					$(self.container).find("#"+"stencil_" + self.timestamp).find("."+key).css("color", state);
				}
				else if (key == "font_style") {
					$(self.container).find("#"+"stencil_" + self.timestamp).find("."+key).css("font-style", state);
				}
				else if (key == "font_weight") {
					$(self.container).find("#"+"stencil_" + self.timestamp).find("."+key).css("font-weight", state);
				}				
				else if (key == "bg_color") {
					$(self.container).find("#"+"stencil_" + self.timestamp).find("."+key).css("background-color", state);
				}								
				else {
					$(self.container).find("#"+"stencil_" + self.timestamp).find("."+key).html(state);
				}
			});
		}
	},

	remove: function() {
		$(this.container).find("#"+"stencil_" + this.timestamp).remove();
		
		delete this;
	},
	

	show: function() {
		$(this.container).find("#"+"stencil_" + this.timestamp).show();
	}
	
};