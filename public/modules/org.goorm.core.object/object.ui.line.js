/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.object.ui.line = function () {
	this.target = null;
	this.timestamp = null;
	this.focus = true;
	this.is_dragging = false;
	this.is_drawing_finished = false;
	this.selected_node = null;
	this.inner_node = null;
	this.selected_inner_node_index = null;	 
	this.sx = null;
	this.sy = null;
	this.ex = null;
	this.ey = null;
	this.previous_x = null;
	this.previous_y = null;
	this.id = null;
	this.name = null;	
	this.type = null;		
	this.x = null;
	this.y = null;
	this.width = null;
	this.height = null;
	this.thickness = 0.5;
	this.color = "#000";
	this.connector = null;
	this.status = null;
	this.head_type = null;	
	this.tail_type = null;		
	this.dashed = false;	
	this.attribute_list = new Array("id", "name", "kind", "timestamp", "sx", "sy", "ex", "ey", "thickness", "color");
};

org.goorm.core.object.ui.line.prototype = {
	init: function (target, kind, dashed) {
		var self = this;
		
		//Set 
		this.target = target;
		this.dashed = dashed;
		this.timestamp = new Date().getTime();
		
		this.connector = [];
		this.connector['head'] = null;
		this.connector['tail'] = null;
		
		
		//Set the properties
		this.id = "line_"+this.timestamp;
		this.name = "line_"+this.timestamp;
		this.kind = kind;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		
		this.inner_node = [];

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
			//////////////////////////////////////////////////
			
			
			/*
if ( ( (self.sx - 5 < x && x < self.ex + 5) || (self.ex - 5 < x && x < self.sx + 5) ) && ( (self.sy - 5 < y && y < self.ey + 5) || (self.ey - 5 < y && y < self.sy + 5) ) ) { //Body Selection
				//Calculate the constant for Line Function : y = ax + b
				var a;
				var b1, b2;
				var c = 5;
				
				if ( self.ex - self.sx != 0) {
					a = (self.ey - self.sy) / (self.ex - self.sx);
					
					c = Math.round(5 * Math.sqrt(a * a + 1) * 1000)/1000; // +- 5px
					
					b1 = self.sy - a * self.sx - c;
					b2 = self.sy - a * self.sx + c;
					
					
					if ( Math.round((Math.abs(a)*1000))/1000 < 0.01 || Math.round((Math.abs(1/a)*1000))/1000 < 0.01 ||
					     ( (a * x + b1 <= y && y <= a * x + b2 && (((y - b1) / a <= x && x <=  (y - b2) / a) || ((y - b2) / a <= x && x <=  (y - b1) / a))) ) ) {
						
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
				}
			}
*/
			if (e.which == 1) {
				if(self.is_hovered(x, y) >= 0) {
					self.is_dragging = true;
					self.is_drawing_finished = false;
						  
					self.selected_node = "body";
					
					//Using Current x, y
					x = e.pageX - parent_offset.left;
					y = e.pageY - parent_offset.top;
					
					self.previous_x = x;
					self.previous_y = y;

				}
			
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
					
					
					//중간노드들에 이부분 적용하기
					//Dragging Head
					if (self.sy - 3 < y && y < self.sy + 3 && self.sx - 3 < x && x <  self.sx + 3) {
						self.is_dragging = true;
						self.is_drawing_finished = false;
			
						self.selected_node = "head";
					}
					//Dragging Tail
					else if (self.ey - 3 < y && y < self.ey + 3 && self.ex - 3 < x && x <  self.ex + 3) {
						self.is_dragging = true;
						self.is_drawing_finished = false;
						
						self.selected_node = "tail";
					}
					else {
						/*						
						if (self.selected_node != "body") {
							self.selected_node = null;
						}
						*/
						
						$(self.inner_node).each(function (i) {
							if (this.y - 3 < y && y < this.y + 3 && this.x - 3 < x && x <  this.x + 3) {
								self.is_dragging = true;
								self.is_drawing_finished = false;
											
								self.selected_node = "inner_node";
								self.selected_inner_node_index = i;
								
								return false;
							}
						});	
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
				if (self.selected_node == "head") {
					self.sx = x;
					self.sy = y;
				}
				else if (self.selected_node == "body") {
					self.sx += x - self.previous_x;  //클릭되는 순간의 좌표
					self.sy += y - self.previous_y;
					self.ex += x - self.previous_x;
					self.ey += y - self.previous_y;

					$(self.inner_node).each(function (i) {
						this.x += x - self.previous_x;
						this.y += y - self.previous_y;
					});

					self.previous_x = x;
					self.previous_y = y;
				}
				else if (self.selected_node == "inner_node") {
					self.inner_node[self.selected_inner_node_index].x = x;
					self.inner_node[self.selected_inner_node_index].y = y;
				}
				//Dragging Tail and Default
				else {
					self.ex = x;
					self.ey = y;
				}	
				
				self.draw_line(self.sx, self.sy, self.ex, self.ey);
			}
			
			if((self.sy - 3 < y && y < self.sy + 3 && self.sx - 3 < x && x <  self.sx + 3) || (self.ey - 3 < y && y < self.ey + 3 && self.ex - 3 < x && x <  self.ex + 3)) {
				//Set the cursor is crosshair
				self.change_status("status_drawing_line");
			}
			else {
				$(self.inner_node).each(function (i) {
					if (this.y - 3 < y && y < this.y + 3 && this.x - 3 < x && x <  this.x + 3) {
						self.change_status("status_drawing_line");
					}
				});				
			}
		});		
		
		//Set Mouse Up Event in Canvas  
		$(target).find("canvas").mouseup(function (e) {
			
			if (!self.focus) {
				return false;
			}
			
			if (e.which == 1) {
				//If Drawing and Dragging is not finished
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
				e.stopPropagation()
				
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
				e.stopPropagation()
				
				return false;
			}
		});

		//Set double click Event in Canvas
		$(target).find("canvas").dblclick(function (e) {
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
			
			if (e.which == 1) { //선 위에서 클릭된 상태.
				var index = self.is_hovered(x, y);
				
				if(index >= 0) {
					var popFlag = false;
					$(self.inner_node).each(function (i) {
						if (this.y - 3 < y && y < this.y + 3 && this.x - 3 < x && x <  this.x + 3) {
							self.pop_inner_node(i);
							popFlag = true;
							
							return false;
						}
					});
						
					if (!popFlag) {
						self.push_inner_node(x, y, index);
					}
				}
			}
			

		});

		return this;
	},
	
	push_inner_node: function (x, y, index) {
		var self = this;
		
		if (self.inner_node.length > 1) {
			self.inner_node.splice(index, 0, {x:x, y:y});
		}
		else {
			self.inner_node.push({x:x, y:y});
		}
	},
	
	pop_inner_node: function (index) {
		var self = this;
		
		if (self.inner_node.length > 1) {
			self.inner_node.splice(index, 1);
		}
		else {
			self.inner_node.pop();
		}
	},
	
	is_hovered: function (x, y) {
	
		var sx, sy, ex, ey;
	
		for (var i=0 ; i <= this.inner_node.length ; i++) {
			if(i==0) {  //start 
				if(this.inner_node.length == 0) {
					sx = this.sx;
					sy = this.sy;
					ex = this.ex;
					ey = this.ey;
				}else {
					sx = this.sx;
					sy = this.sy;
					ex = this.inner_node[0].x;
					ey = this.inner_node[0].y;
				}
				
			} 
			else if(i == this.inner_node.length) {  //end
					sx = this.inner_node[i-1].x;
					sy = this.inner_node[i-1].y;
					ex = this.ex;
					ey = this.ey;	
			}
			else {  //middle
				sx = this.inner_node[i-1].x;
				sy = this.inner_node[i-1].y;
				ex = this.inner_node[i].x;
				ey = this.inner_node[i].y;
			}
		
		
			if ( ( (sx - 5 < x && x < ex + 5) || (ex - 5 < x && x < sx + 5) ) && ( (sy - 5 < y && y < ey + 5) || (ey - 5 < y && y < sy + 5) ) ) { //Body Selection
				//Calculate the constant for Line Function : y = ax + b
				var a;
				var b1, b2;
				var c = 5;
				
				if ( ex - sx != 0) {
					a = (ey - sy) / (ex - sx);
					
					c = Math.round(5 * Math.sqrt(a * a + 1) * 1000)/1000; // +- 5px
					
					b1 = sy - a * sx - c;
					b2 = sy - a * sx + c;
					
					
					if ( Math.round((Math.abs(a)*1000))/1000 < 0.01 || Math.round((Math.abs(1/a)*1000))/1000 < 0.01 ||
					     ( (a * x + b1 <= y && y <= a * x + b2 && (((y - b1) / a <= x && x <=  (y - b2) / a) || ((y - b2) / a <= x && x <=  (y - b1) / a))) ) ) {

						return i;
					}
				}
			}
		}
		
		return -1;
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
			
			if(this.is_dragging) {
				context.beginPath();
			
				context.strokeStyle = "#ccc";
				context.moveTo(sx, sy);
				
				$(this.properties.inner_node).each(function() {
					context.lineTo(this.x, this.y);
				});
				
				context.lineTo(ex, ey);				
				context.lineWidth = 0.5;
				context.stroke();
			}
		}
	},

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
		
		this.inner_node = null;
		
		this.previous_x = null;
		this.previous_y = null;
		
		this.id = null;
		this.name = null;	
		this.x = null;
		this.y = null;
		this.width = null;
		this.height = null;
		this.thickness = null;
		
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

		$(this.inner_node).each(function (i) {
			this.x += offset_x;
			this.y += offset_y;
		});
	
		this.status = "modified";
	}
};