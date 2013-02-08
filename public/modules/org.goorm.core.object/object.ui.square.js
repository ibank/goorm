/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.object.ui.square = function () {
	this.target = null;
	this.timestamp = null;
	this.focus = true;
	this.is_dragging = false;
	this.is_drawing_finished = false;
	this.selected_node = null;
	this.sx = null;
	this.sy = null;
	this.ex = null;
	this.ey = null;
	this.previous_x = null;
	this.previous_y = null;
	this.id = null;
	this.name = null;	
	this.kind = null;		
	this.x = null;
	this.y = null;
	this.width = null;
	this.height = null;
	this.connector = null;	
	this.status = null;	
	this.proportion = null;	
	this.attribute_list = new Array("id", "name", "kind", "timestamp", "sx", "sy", "ex", "ey");
};

org.goorm.core.object.ui.square.prototype = {
	init: function (target, kind, proportion) {
		var self = this;
		
		//Set 
		this.target = target;
		this.timestamp = new Date().getTime();
		
		this.connector = [];
		this.connector['tl'] = null;
		this.connector['t'] = null;
		this.connector['tr'] = null;
		this.connector['r'] = null;
		this.connector['br'] = null;
		this.connector['b'] = null;
		this.connector['bl'] = null;
		this.connector['l'] = null;
		
		this.proportion = proportion;
		
		//Set the properties
		this.id = "square_"+this.timestamp;
		this.name = "square_"+this.timestamp;	
		this.kind = kind;			
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		
		
		//Set Mouse Down Event in Canvas
		$(target).find("canvas").mousedown(function (e) {
			
			if (!self.focus) {
				return false;
			}
			
			//Calculate the position (x, y) in Canvas Axis
			var parent_offset = $(this).parent().offset(); 
			x = e.pageX - parent_offset.left;
			y = e.pageY - parent_offset.top;
			
			
			if (self.sx) {
				self.sx = parseInt(self.sx);
			}
			
			if (self.sy) {
				self.sy = parseInt(self.sy);
			}
			
			if (self.ex) {
				self.ex = parseInt(self.ex);
			}
			
			if (self.ey) {
				self.ey = parseInt(self.ey);		
			}
			
			
			//Select Body of Square
			if ( ( (self.sx - 5 < x && x < self.ex + 5) || (self.ex - 5 < x && x < self.sx + 5) ) && ( (self.sy - 5 < y && y < self.ey + 5) || (self.ey - 5 < y && y < self.sy + 5) ) ) { //Body Selection
				if (e.which == 1) {
					self.is_dragging = true;
					self.is_drawing_finished = false;
						  
					self.selected_node = "body";
					
					//Using Current x, y
					x = e.pageX - parent_offset.left;
					y = e.pageY - parent_offset.top;
					
					self.previous_x = x;
					self.previous_y = y;
				}
			}

			if (e.which == 1) {
				
				//First Drawing			
				if (!self.is_drawing_finished && !self.is_dragging) {
					self.is_dragging = true;
					self.is_drawing_finished = false;
					
					//Using Current x, y
					x = e.pageX - parent_offset.left;
					y = e.pageY - parent_offset.top;
					
					self.sx = x;
					self.sy = y;
					
					self.selected_node = null;
				}
				else {
					//Using Current x, y
					x = e.pageX - parent_offset.left;
					y = e.pageY - parent_offset.top;
					
	
					if (self.sy - 3 < y && y < self.sy + 3 && self.sx - 3 < x && x <  self.sx + 3) {
						//Set the cursor is resize
						self.change_status("status_resize_top_left");
						
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "tl";
					}
					else if (self.sy - 3 < y && y < self.sy + 3 && self.ex - 3 < x && x <  self.ex + 3) {
						//Set the cursor is resize
						self.change_status("status_resize_top_right");
						
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "tr";
					}
					else if (self.ey - 3 < y && y < self.ey + 3 && self.ex - 3 < x && x <  self.ex + 3) {
						//Set the cursor is resize
						self.change_status("status_resize_bottom_right");
						
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "br";
					}
					else if (self.ey - 3 < y && y < self.ey + 3 && self.sx - 3 < x && x <  self.sx + 3) {
						//Set the cursor is resize
						self.change_status("status_resize_bottom_left");
						
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "bl";
					}
					else if ((self.sy+self.ey)/2 - 3 < y && y < (self.sy+self.ey)/2 + 3 && self.sx - 3 < x && x <  self.sx + 3) {
						//Set the cursor is resize
						self.change_status("status_resize_left");
						
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "l";
					}
					else if ((self.sy+self.ey)/2 - 3 < y && y < (self.sy+self.ey)/2 + 3 && self.ex - 3 < x && x <  self.ex + 3) {
						//Set the cursor is resize
						self.change_status("status_resize_right");
						
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "r";
					}
					else if (self.sy - 3 < y && y < self.sy + 3 && (self.sx+self.ex)/2 - 3 < x && x < (self.sx+self.ex)/2 + 3) {
						//Set the cursor is resize
						self.change_status("status_resize_top");
						
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "t";
					}
					else if (self.ey - 3 < y && y < self.ey + 3 && (self.sx+self.ex)/2 - 3 < x && x < (self.sx+self.ex)/2 + 3) {
						//Set the cursor is resize
						self.change_status("status_resize_bottom");
						
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "b";
					}
					else {
						if (self.selected_node != "body") {
							self.selected_node = null;
						}
					}
					
				}
				
			}

		});
		
		//Set Mouse Move Event in Canvas
		$(target).find("canvas").mousemove(function (e) {
			
			if (!self.focus) {
				return false;
			}
			
			//Calculate the position (x, y) in Canvas Axis
			var parent_offset = $(this).parent().offset(); 	
			x = Math.floor(e.pageX - parent_offset.left);
			y = Math.floor(e.pageY - parent_offset.top);
			  
			if(!self.is_drawing_finished && self.is_dragging) {
				
				//Dragging Body
				if (self.selected_node == "body") {
					self.sx += x - self.previous_x;
					self.sy += y - self.previous_y;
					self.ex += x - self.previous_x;
					self.ey += y - self.previous_y;
					
					self.previous_x = x;
					self.previous_y = y;
				}
				//Dragging Top Left
				else if (self.selected_node == "tl") {
					
					if (self.proportion) {
						var ratio = self.proportion[1] / self.proportion[0];
						
						self.sx = x;
						
						var width = Math.abs(self.ex - self.sx);
						var height = width * ratio;
						
						self.sy = self.ey - parseInt(height);
					}
					else {
						self.sx = x;
						self.sy = y;
					}
				}				
				//Dragging Top
				else if (self.selected_node == "t") {
					if (self.proportion) {
						var ratio = self.proportion[0] / self.proportion[1];
						
						self.sy = y;
						
						var height = Math.abs(self.ey - self.sy);
						var width = height * ratio;
						var middle = (self.sx + self.ex) / 2;
						
						self.sx = middle - parseInt(width/2);
						self.ex = middle + parseInt(width/2);
					}
					else {
						self.sy = y;
					}
				}
				//Dragging Top Right
				else if (self.selected_node == "tr") {
					if (self.proportion) {
						var ratio = self.proportion[1] / self.proportion[0];
						
						self.ex = x;
						
						var width = Math.abs(self.ex - self.sx);
						var height = width * ratio;
						
						self.sy = self.ey - parseInt(height);
					}
					else {
						self.ex = x;
						self.sy = y;
					}
				}				
				//Dragging Right
				else if (self.selected_node == "r") {
					if (self.proportion) {
						var ratio = self.proportion[1] / self.proportion[0];
						
						self.ex = x;
					
						var width = Math.abs(self.ex - self.sx);
						var height = width * ratio;
						
						self.ey = self.sy + parseInt(height);
					}
					else {
						self.ex = x;
					}
				}	
				//Dragging Bottom Right
				else if (self.selected_node == "br") {
					if (self.proportion) {
						var ratio = self.proportion[1] / self.proportion[0];
						
						self.ex = x;
					
						var width = Math.abs(self.ex - self.sx);
						var height = width * ratio;
						
						self.ey = self.sy + parseInt(height);
					}
					else {
						self.ex = x;
						self.ey = y;
					}
				}				
				//Dragging Bottom
				else if (self.selected_node == "b") {
					if (self.proportion) {
						var ratio = self.proportion[0] / self.proportion[1];
						
						self.ey = y;
						
						var height = Math.abs(self.ey - self.sy);
						var width = height * ratio;
						var middle = (self.sx + self.ex) / 2;
						
						self.sx = middle - parseInt(width/2);
						self.ex = middle + parseInt(width/2);
					}
					else {
						self.ey = y;
					}
				}	
				//Dragging Bottom Left
				else if (self.selected_node == "bl") {
					if (self.proportion) {
						var ratio = self.proportion[1] / self.proportion[0];
						
						self.sx = x;
					
						var width = Math.abs(self.ex - self.sx);
						var height = width * ratio;
						
						self.ey = self.sy + parseInt(height);
					}
					else {
						self.sx = x;
						self.ey = y;
					}
				}				
				//Dragging Left
				else if (self.selected_node == "l") {
					if (self.proportion) {
						var ratio = self.proportion[1] / self.proportion[0];
						
						self.sx = x;
					
						var width = Math.abs(self.ex - self.sx);
						var height = width * ratio;
						
						self.ey = self.sy + parseInt(height);
					}
					else {
						self.sx = x;
					}
				}
				//Dragging Default
				else {
					if (self.proportion) {
						var ratio = self.proportion[1] / self.proportion[0];
						
						self.ex = x;
					
						var width = Math.abs(self.ex - self.sx);
						var height = width * ratio;
						
						self.ey = self.sy + parseInt(height);
					}
					else {
						self.ex = x;
						self.ey = y;
					}
				}	
				
				
				/*
				if (self.proportion) {
					var ratio = self.proportion[1] / self.proportion[0];
						
					self.ex = x;
					
					var width = Math.abs(self.ex - self.sx);
					var height = width * ratio;
						
					self.ey = self.sy + parseInt(height);
				}
				*/
				
				self.draw_square(self.sx, self.sy, self.ex, self.ey);
			}
			
			if (self.sy - 3 < y && y < self.sy + 3 && self.sx - 3 < x && x <  self.sx + 3) {
				//Set the cursor is resize
				self.change_status("status_resize_top_left");
			}
			else if (self.sy - 3 < y && y < self.sy + 3 && self.ex - 3 < x && x <  self.ex + 3) {
				//Set the cursor is resize
				self.change_status("status_resize_top_right");
			}
			else if (self.ey - 3 < y && y < self.ey + 3 && self.ex - 3 < x && x <  self.ex + 3) {
				//Set the cursor is resize
				self.change_status("status_resize_bottom_right");
			}
			else if (self.ey - 3 < y && y < self.ey + 3 && self.sx - 3 < x && x <  self.sx + 3) {
				//Set the cursor is resize
				self.change_status("status_resize_bottom_left");
			}
			else if ((self.sy+self.ey)/2 - 3 < y && y < (self.sy+self.ey)/2 + 3 && self.sx - 3 < x && x <  self.sx + 3) {
				//Set the cursor is resize
				self.change_status("status_resize_left");
			}
			else if ((self.sy+self.ey)/2 - 3 < y && y < (self.sy+self.ey)/2 + 3 && self.ex - 3 < x && x <  self.ex + 3) {
				//Set the cursor is resize
				self.change_status("status_resize_right");
			}
			else if (self.sy - 3 < y && y < self.sy + 3 && (self.sx+self.ex)/2 - 3 < x && x < (self.sx+self.ex)/2 + 3) {
				//Set the cursor is resize
				self.change_status("status_resize_top");
			}
			else if (self.ey - 3 < y && y < self.ey + 3 && (self.sx+self.ex)/2 - 3 < x && x < (self.sx+self.ex)/2 + 3) {
				//Set the cursor is resize
				self.change_status("status_resize_bottom");
			}
		});		
		
		//Set Mouse Up Event in Canvas  
		$(target).find("canvas").mouseup(function (e) {
			if (!self.focus) {
				return false;
			}			
			
			if (e.which == 1) {
				//If Drawing and Dragging is not finished and
				if(!self.is_drawing_finished && self.is_dragging) {	
					self.is_dragging = false;
					self.is_drawing_finished = true;
					
					if (self.sx) {
						self.sx = parseInt(self.sx);
					}
					
					if (self.sy) {
						self.sy = parseInt(self.sy);
					}
					
					if (self.ex) {
						self.ex = parseInt(self.ex);
					}
					
					if (self.ey) {
						self.ey = parseInt(self.ey);		
					}
					
					self.x = self.sx;
					self.y = self.sy;
					self.width = Math.abs(self.ex - self.sx);
					self.height = Math.abs(self.ey - self.sy);
					
					self.status = "modified";
				}
				
				//Set the cursor is default
				self.change_status("status_default");
			}
			else if (e.which == 3) {
				
				e.preventDefault();
				e.stopPropagation();
				
				return false;
			}

			self.clear();	
			
			
					
		});
		
		$(target).find("canvas").click(function (e) {
			if (!self.focus) {
				return false;
			}
			
			if (e.which == 3) {
				e.preventDefault();
				e.stopPropagation();
				
				return false;
			}
		});
		
		return this;
	},
	
	draw_square: function (sx, sy, ex, ey) {
		
		if (sx) {
			sx = parseInt(sx);
		}
		
		if (sy) {
			sy = parseInt(sy);
		}
		
		if (ex) {
			ex = parseInt(ex);
		}
		
		if (ey) {
			ey = parseInt(ey);		
		}
		
		//drawing the line
		// remove [1] nulla
		if($(this.target).find("canvas").getContext) {
			var context = $(this.target).find("canvas").getContext('2d');
			
			//clear whole canvas
			context.clearRect (0, 0, $(this.target).find("canvas").width(), $(this.target).find("canvas").height());	
		
			/*
			if(this.is_dragging) {	
				context.strokeStyle = "#ccc";
				context.lineWidth = 0.5;
						
				context.beginPath();			
				context.rect(sx, sy, ex-sx, ey-sy);				
				context.closePath();
				context.stroke();
			}
			*/
		}
	},
	
	// remove [1] nula
	clear: function () {
		if($(this.target).find("canvas").getContext) {
			var context = $(this.target).find("canvas").getContext('2d');
			//clear whole canvas
			context.clearRect (0, 0, $(this.target).find("canvas").width(), $(this.target).find("canvas").height());	
		}
	},

	remove: function () {
		this.target = null;
		this.timestamp = null;
	
		this.focus = null;
		this.is_dragging = null;
		this.is_drawing_finished = null;
		this.selected_node = null;
		
		this.sx = null;
		this.sy = null;
		this.ex = null;
		this.ey = null;
		
		this.previous_x = null;
		this.previous_y = null;
		
		this.id = null;
		this.name = null;	
		this.x = null;
		this.y = null;
		this.width = null;
		this.height = null;
		
		this.connector = null;	
		
		delete this;
	},

	change_status: function (class_name) {
		$(this.target).removeClass("status_default");
		$(this.target).removeClass("status_drawing_line");
		$(this.target).removeClass("status_drawing_square");
		$(this.target).removeClass("status_move");

		$(this.target).removeClass("status_resize_top_left");
		$(this.target).removeClass("status_resize_top_right");
		$(this.target).removeClass("status_resize_bottom_left");
		$(this.target).removeClass("status_resize_bottom_right");
		$(this.target).removeClass("status_resize_top");
		$(this.target).removeClass("status_resize_bottom");
		$(this.target).removeClass("status_resize_left");
		$(this.target).removeClass("status_resize_right");		
		
		$(this.target).addClass(class_name);
	},
	
	move: function (offset_x, offset_y) {
		this.sx += offset_x;
		this.sy += offset_y;
		this.ex += offset_x;
		this.ey += offset_y;
		
		self.status = "modified";
	}
};