/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.object.ui.selection = function () {
	this.target = null;
	this.timestamp = null;
	this.context_menu = null;
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
	this.x = null;
	this.y = null;
	this.width = null;
	this.height = null;
	this.connector = null;	
	this.attribute_list = new Array("id", "name", "sx", "sy", "ex", "ey");
};

org.goorm.core.object.ui.selection.prototype = {
	init: function (target) {
		var self = this;
		
		//Set 
		this.target = target;
		this.timestamp = new Date().getTime();
		
		this.connector = [];
		this.connector['head'] = null;
		this.connector['tail'] = null;
		
		
		//Set the properties
		this.id = "line";
		this.name = "line_"+this.timestamp;	
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		
		//Set context menu
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init("configs/menu/org.goorm.core.object/object.ui.html", "object.ui", "", this.timestamp, "", function() {
			//Set context menu action
			$("div[id='object.ui_"+self.timestamp+"']").find("a[action=cut_object]").click(function () {
				m.s("cut", "context menu");
			});
			$("div[id='object.ui_"+self.timestamp+"']").find("a[action=copy_object]").click(function () {
				m.s("copy", "context menu");
			});
			$("div[id='object.ui_"+self.timestamp+"']").find("a[action=paste_object]").click(function () {
				m.s("paste", "context menu");
			});						
			$("div[id='object.ui_"+self.timestamp+"']").find("a[action=delete_object]").click(function () {
				m.s("delete", "context menu");
			});			
		});
		
		


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
			
			
			//Select Body of Line
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
				else if (e.which === 3) {
					
					/* Right Mousebutton was clicked! */
					self.context_menu.menu.show();
	
					$("div[id='object.ui_" + self.timestamp+"']").css("z-index", 5);
					$("div[id='object.ui_" + self.timestamp+"']").css("left", e.pageX);
					$("div[id='object.ui_" + self.timestamp+"']").css("top", e.pageY);	
		
					e.preventDefault();
					e.stopPropagation()
					
					return false;
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
					
					//Dragging Top Left
					if (self.sy - 3 < y && y < self.sy + 3 && self.sx - 3 < x && x <  self.sx + 3) {
						self.is_dragging = true;
						self.is_drawing_finished = false;
			
						self.selected_node = "tl";
					}
					//Dragging Top Right
					if (self.sy - 3 < y && y < self.sy + 3 && self.ex - 3 < x && x <  self.ex + 3) {
						self.is_dragging = true;
						self.is_drawing_finished = false;
			
						self.selected_node = "tr";
					}
					//Dragging Bottom Right
					else if (self.ey - 3 < y && y < self.ey + 3 && self.ex - 3 < x && x <  self.ex + 3) {
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "br";
					}
					//Dragging Bottom Left
					else if (self.ey - 3 < y && y < self.ey + 3 && self.sx - 3 < x && x <  self.sx + 3) {
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "bl";
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
				//Dragging Head
				if (self.selected_node == "tl") {
					self.sx = x;
					self.sy = y;
				}
				else if (self.selected_node == "body") {
					self.sx += x - self.previous_x;
					self.sy += y - self.previous_y;
					self.ex += x - self.previous_x;
					self.ey += y - self.previous_y;
					
					self.previous_x = x;
					self.previous_y = y;
				}
				//Dragging Tail and Default
				else {
					self.ex = x;
					self.ey = y;
				}	
				
				self.draw_line(self.sx, self.sy, self.ex, self.ey);
			}
			
			if((self.sy - 3 < y && y < self.sy + 3 && self.sx - 3 < x && x <  self.sx + 3) || (self.sy - 3 < y && y < self.sy + 3 && self.ex - 3 < x && x <  self.ex + 3) || (self.ey - 3 < y && y < self.ey + 3 && self.ex - 3 < x && x <  self.ex + 3) || (self.ey - 3 < y && y < self.ey + 3 && self.sx - 3 < x && x <  self.sx + 3)) {
				//Set the cursor is crosshair
				$(self.target).removeClass("status_default");
				$(self.target).removeClass("status_move");
				$(self.target).removeClass("status_drawing_square");
				$(self.target).addClass("status_drawing_line");
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
				}
				
				//Set the cursor is default
				$(self.target).removeClass("status_drawing_line");
				$(self.target).removeClass("status_move");
				$(self.target).removeClass("status_drawing_square");
				$(self.target).addClass("status_default");
			}
			else if (e.which === 3) {
				
				e.preventDefault();
				e.stopPropagation()
				
				return false;
			}
		});
		
		$(target).find("canvas").click(function (e) {
			if (!self.focus) {
				return false;
			}
			
			if (e.which === 3) {
				e.preventDefault();
				e.stopPropagation()
				
				return false;
			}
		});
		
		return this;
	},

	draw_line: function (sx, sy, ex, ey) {
		
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
		if($(this.target).find("canvas").getContext) {
			var context = $(this.target).find("canvas").getContext('2d');
			
			//clear whole canvas
			context.clearRect (0, 0, $(this.target).find("canvas").width(), $(this.target).find("canvas").height());	
			
			context.strokeStyle = "#000000";
			context.lineWidth = 0.5;
					
			context.beginPath();			
			context.rect(sx, sy, ex-sx, ey-sy);				
			context.closePath();
			context.stroke();
		}
	},
	
	remove: function () {
		
	}
};