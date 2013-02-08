/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.object.ui = function () {
	this.target = null;
	this.parent = null;
	this.type = null; // square or line
	this.kind = null;
	this.shape_name = null;
	this.shape = null;
	this.dashed = null;
	this.proportion = null;
	this.properties = null;
	this.selected = false;
	this.data_uuid = null;
	this.context_menu = null;
};

org.goorm.core.object.ui.prototype = {
	init: function (target, parent, type, shape_name, option, callback) {
		var self = this;
		
		this.target = target;
		this.parent = parent;
		this.type = type;
		this.shape_name = shape_name;
		this.properties = null;
		
		if (option) {
			this.dashed = option['dashed'];
			this.proportion = option['proportion'];
		}

		
		if(type == "line") {
			if(shape_name != null) {
				this.shape = new org.goorm.core.stencil();
				this.shape.init(shape_name, this.type, $("#" + core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].container).find(".shapes"));
				
				this.kind = this.shape_name.split("/");
				this.kind = this.kind[1];
				
				this.properties = new org.goorm.core.object.ui.line().init(target, this.kind, this.dashed);
			}
			else {
				this.properties = new org.goorm.core.object.ui.line().init(target, "line", this.dashed);
			}
		}
		else if(type == "square") {
			
			
			if(shape_name != null) {
				this.shape = new org.goorm.core.stencil();
				this.shape.init(shape_name, this.type, $("#" + core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].container).find(".shapes"), callback);
				
				this.kind = this.shape_name.split("/");
				this.kind = this.kind[1];
				
				this.properties = new org.goorm.core.object.ui.square().init(target, this.kind, this.proportion);
			}
			else {
				this.properties = new org.goorm.core.object.ui.square().init(target, "square", this.proportion);
			}			
		}
		
		
		//Set context menu
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init("configs/menu/org.goorm.core.object/object.ui.html", "object.ui", "", this.properties.timestamp, "", function() {
			//Set context menu action
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=cut_object]").click(function () {
				self.cut();
			});
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=copy_object]").click(function () {
				self.copy();
			});
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=paste_object]").click(function () {
				self.paste();
			});						
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=delete_object]").click(function () {
				/*for (var index in self.parent.objects) {
					if (self.parent.objects[index]==self) {
						self.parent.remove(index);
					}
				}*/
				self._delete();
			});	
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=bring_to_front]").click(function () {
				self.bring_to_front();
			});	
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=send_to_back]").click(function () {
				self.send_to_back();
			});	
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=bring_forward]").click(function () {
				self.bring_forward();
			});	
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=send_backward]").click(function () {
				self.send_backward();
			});	
			$("div[id='object.ui_"+self.properties.timestamp+"']").find("a[action=properties_object]").click(function () {
				self.properties_object();
			});				
		});
		
		
		$(target).find("canvas").mousedown(function (e) {
			if (e.which == 3) {
				if (self.type == "square") {
					var parent_offset = $(this).parent().offset(); 
					x = e.pageX - parent_offset.left;
					y = e.pageY - parent_offset.top;
					
					//Select Body of Square
					if ( ( (self.properties.sx - 5 < x && x < self.properties.ex + 5) || (self.properties.ex - 5 < x && x < self.properties.sx + 5) ) && ( (self.properties.sy - 5 < y && y < self.properties.ey + 5) || (self.properties.ey - 5 < y && y < self.properties.sy + 5) ) ) { //Body Selection
					
						
						/* Right Mousebutton was clicked! */
						$("div.yuimenu").css("visibility", "hidden");
						$("div.yui-menu-shadow").removeClass("yui-menu-shadow-visible");
						self.context_menu.menu.show();
		
						$("div[id='object.ui_" + self.properties.timestamp+"']").css("z-index", 5);
						$("div[id='object.ui_" + self.properties.timestamp+"']").css("left", e.pageX);
						$("div[id='object.ui_" + self.properties.timestamp+"']").css("top", e.pageY);	
						
						e.preventDefault();
						e.stopPropagation();
						
						return false;
					}
				}			
				else if (self.type == "line") {
					//Calculate the position (x, y) in Canvas Axis
					var parent_offset = $(this).parent().offset(); 
					x = e.pageX - parent_offset.left;
					y = e.pageY - parent_offset.top;
					
					
					if (self.properties.sx) {
						self.properties.sx = parseInt(self.properties.sx);
					}
					
					if (self.properties.sy) {
						self.properties.sy = parseInt(self.properties.sy);
					}
					
					if (self.properties.ex) {
						self.properties.ex = parseInt(self.properties.ex);
					}
					
					if (self.properties.ey) {
						self.properties.ey = parseInt(self.properties.ey);		
					}
					
					
					//Select Body of Line
					if ( ( (self.properties.sx - 5 < x && x < self.properties.ex + 5) || (self.properties.ex - 5 < x && x < self.properties.sx + 5) ) && ( (self.properties.sy - 5 < y && y < self.properties.ey + 5) || (self.properties.ey - 5 < y && y < self.properties.sy + 5) ) ) { //Body Selection
						//Calculate the constant for Line Function : y = ax + b
						var a;
						var b1, b2;
						var c = 5;
						
						if ( self.properties.ex - self.properties.sx != 0) {
							a = (self.properties.ey - self.properties.sy) / (self.properties.ex - self.properties.sx);
							
							c = Math.round(5 * Math.sqrt(a * a + 1) * 1000)/1000; // +- 5px
							
							b1 = self.properties.sy - a * self.properties.sx - c;
							b2 = self.properties.sy - a * self.properties.sx + c;
							
							
							if ( Math.round((Math.abs(a)*1000))/1000 < 0.01 || Math.round((Math.abs(1/a)*1000))/1000 < 0.01 ||
							     ( (a * x + b1 <= y && y <= a * x + b2 && (((y - b1) / a <= x && x <=  (y - b2) / a) || ((y - b2) / a <= x && x <=  (y - b1) / a))) ) ) {
								
								/* Right Mousebutton was clicked! */
								$("div.yuimenu").css("visibility", "hidden");
								$("div.yui-menu-shadow").removeClass("yui-menu-shadow-visible");
								self.context_menu.menu.show();
					
								$("div[id='object.ui_" + self.properties.timestamp+"']").css("z-index", 5);
								$("div[id='object.ui_" + self.properties.timestamp+"']").css("left", e.pageX);
								$("div[id='object.ui_" + self.properties.timestamp+"']").css("top", e.pageY);	

						
								e.preventDefault();
								e.stopPropagation();									
								return false;
							}
						}
					}
				}
			}
			else if (e.which == 1) {
				self.context_menu.menu.hide();
			}
		});

		return this;
	},

	set_adapter: function () {
		
	},

	select: function () {
		if(this.type == "square") {
			//this.properties.select();
		}
	},

	deselect: function () {
		if(this.type == "square") {
			//this.properties.deselect();
		}
	},

	bring_to_front: function () {
		this.parent.bring_to_front(this);
	},

	send_to_back: function () {
		this.parent.send_to_back(this);
	},
	
	bring_forward: function () {
		this.parent.bring_forward(this);
	},
	
	send_backward: function () {
		this.parent.send_backward(this);
	},
	
	properties_object: function () {
		//this.parent.properties_object(this);
	},
	
	remove: function () {
/*
		//Register the undo function
		
		var properties = {};
		properties.sx = this.properties.sx;
		properties.sy = this.properties.sy;
		properties.ex = this.properties.ex;
		properties.ey = this.properties.ey;
		
		this.parent.undo_manager.register(
			this.parent, this.parent.add, [this.type, this.shape, this.option, properties], 'Create Item',
			self, self.remove, [], 'Remove Item'
		);
	
*/
		this.properties.remove();
		this.shape.remove();
		
		delete this;
	},
	
	_delete: function () {
		this.parent._delete();
	},

	cut: function () {
		this.parent.cut();
	},

	copy: function () {
		this.parent.copy();
	},
	
	paste: function () {
		this.parent.paste();
	}
	
};
