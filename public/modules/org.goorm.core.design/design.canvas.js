/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.design.canvas = function () {
	this.target = null;
	this.title = null;
	this.toolbar = null;
	this.width = null;
	this.height = null;
	this.skin_width = null;
	this.skin_height = null;
	this.snap_to_grid = false;
	this.context_menu = null;
	this.objects = null;
	this.object_manager = null;
	this.focus = -1;
	this.inner_node = null;
	this.hovered_index = null;
	this.selected_index = null;
	this.is_drawing = false;
	this.is_adding = -1;
	this.is_modifying = false;
	this.is_double_clicking = 0;
	this.previous_x = null;
	this.previous_y = null;
	this.sx = null;
	this.sy = null;
	this.ex = null;
	this.ey = null;
	this.copied_objects = null;
	this.copied_objects_undo = null;
	this.copied_objects_redo = null;
	this.undo_manager = null;
	this.dialog = null;	
	this.preview = null;
	this.collaboration = null;
	this.object_explorer = null;
	this.multi_node_line = false;	
	this.preview_slider = null;	
	this.is_shift_pressed = null;
};

org.goorm.core.design.canvas.prototype = {
	
	init: function (target, width, height, title, parent) {
		var self = this;
		
		//adding html container
		$(target).append("<div class='dummyspace'></div>"); //This is a canvas layer
		$(target).append("<div class='space'></div>"); //This is a margin when parent window is smaller than canvas size
		$(target).append("<div class='skin'></div>"); //This is a canvas layer
		$(target).append("<div class='canvas'></div>"); //This is a canvas layer
		$(target).find(".canvas").append("<div class='grid'></div>"); //This is a grid layer which has grid background image and opacity
		$(target).find(".canvas").append("<div class='shapes'></div>"); //This is a grid layer which has grid background image and opacity
		$(target).find(".canvas").append("<canvas width='"+width+"' height='"+height+"'></canvas>"); //This is a canvas element which is supported in HTML5
		$(target).find(".canvas").append("<canvas width='"+width+"' height='"+height+"'></canvas>"); //This is a canvas element which is supported in HTML5
		
		
		//Set Properties
		this.target = target;
		this.title = title;
		this.parent = parent;
		
		this.objects = [];
		this.copied_objects = [];
		this.copied_objects_undo = [];
		this.copied_objects_redo = [];
		
		this.is_adding = -1;
		this.is_modifying = false;
		
		this.is_shift_pressed = false;
		
		
		
		this.object_manager = new org.goorm.core.object.manager();
		this.object_manager.init("", this);

		
		//object_explorer Initialization
		this.object_explorer = new org.goorm.core.design.canvas.object_explorer();
		this.object_explorer.init(this);


		//Toolbar Initialization		
		this.toolbar = new org.goorm.core.design.canvas.toolbar();
		this.toolbar.init(this);

		
		//preview Initialization		
		//this.preview = new org.goorm.core.design.canvas.preview();
		//this.preview.init($(target).parent().find(".design.preview_container")[0], width, height, 0.1, this);

		
		//Blocking Context Menus for Empty Space		
		var empty_context_menu = new org.goorm.core.menu.context();
		empty_context_menu.init("", "none", $(target).find(".design.preview_container"), "");

		
		this.collaboration = new org.goorm.core.collaboration.composing();
		this.collaboration.init(this);
		
		$(document).bind("line_stencil_code_loaded", function () {
			self.draw();
		});
		
		
		$(document).bind("keydown", "Shift", function () {
			self.is_shift_pressed = true;
		});
		
		$(document).bind("keyup", "Shift", function () {
			self.is_shift_pressed = false;
		});


		//Set Dialog
		var handle_ok = function() { 
			
			var width = $("#" + self.dialog.container_id).find(".design_canvas_setting").find(".canvas_width").val();
			var height = $("#" + self.dialog.container_id).find(".design_canvas_setting").find(".canvas_height").val();
			
			self.set_size(width, height);
			
/*
			self.preview.scale=(self.preview_slider.get_real_value()/100).toFixed(2);
			self.preview.set_size("change");
*/
			
			parent.resize_all();
			
			this.hide(); 
			
		};

		var handle_cancel = function() { 

			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
		
		this.dialog = new org.goorm.core.design.canvas.dialog();

		this.dialog.init({
			localization_key:"title_canvas_setting",
			title:"Canvas Setting", 
			path:"configs/dialogs/org.goorm.core.design/design.canvas.html",
			width:595,
			height:400,
			modal:false,
			draggable:true,
			buttons:this.buttons,
			success: function () {
				var tabview = new YAHOO.widget.TabView($("#" + self.dialog.container_id).find(".design_canvas_setting").get(0));
				
				
				var width = self.width;
				$("#" + self.dialog.container_id).find(".design_canvas_setting").find(".canvas_width").val(width);
				var height = self.height;
				$("#" + self.dialog.container_id).find(".design_canvas_setting").find(".canvas_height").val(height);
				
				self.preview_slider = YAHOO.widget.Slider.getHorizSlider("preview_slider_background", "preview_slider_thumb", 0, 200, 20);
				self.preview_slider.animate = true;
				self.preview_slider.get_real_value = function() {
					return (Math.round((this.getValue()/4)+10));
				}
				self.preview_slider.subscribe("change", function(offsetFromStart) {
					$("#preview_slider_value").empty();
					$("#preview_slider_value").append(self.preview_slider.get_real_value());
				});
				
				//self.preview_slider.setValue(parseInt((self.preview.scale-0.1)*400));
			}
		});
		this.dialog = this.dialog.dialog;		

		//Set Undo Manager
		//this.undo_manager = new undo_manager();
		
		
		
		this.selected_index = [];

		//Set canvas size
		this.set_size(width, height);

				
		//Set Context Menu
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init("configs/menu/org.goorm.core.design/design.canvas.html", "design.canvas", $(target).find(".canvas").find("canvas"), this.title, "", function() {
			//Set context menu action
			$("div[id='design.canvas_"+self.title+"']").find("a[action=paste_object]").click(function () {
				self.paste();
			});						
			$("div[id='design.canvas_"+self.title+"']").find("a[action=canvas_zoom_fit]").click(function () {
				self.toolbar.zoomFit();
			});			
			$("div[id='design.canvas_"+self.title+"']").find("a[action=canvas_zoom_in]").click(function () {
				self.toolbar.zoomIn();
			});
			$("div[id='design.canvas_"+self.title+"']").find("a[action=canvas_zoom_out]").click(function () {
				self.toolbar.zoomOut();
			});		
			$("div[id='design.canvas_"+self.title+"']").find("a[action=canvas_snap_to_grid_on]").click(function () {
				self.toolbar.toggle_snap_to_grid();
			});		
			$("div[id='design.canvas_"+self.title+"']").find("a[action=show_canvas_setting]").click(function () {
				self.dialog.panel.show();
			});				
		});

				
		$(target).find(".canvas").find("canvas").dblclick(function (e) {
			var parent_offset = $(this).parent().offset(); 
			var ratio = self.toolbar.zoom_level / 100;
			var x = Math.floor(e.pageX - parent_offset.left) * ratio;
			var y = Math.floor(e.pageY - parent_offset.top) * ratio;

			$(self.objects).each(function (i) {
				if (this.type == "square") {
				
					//sx, sy : Line Start Position,
					//ex, ey : Line End Position
					var sx=0, sy=0, ex=0, ey=0;
					var shape_properties = this.shape.properties;
					
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
					
					var tInputWidth = Math.floor((ex-sx-20)/6);
					
					var object_pointer = this;
					
					if ( ( (sx - 5 <= x && x <= ex + 5) || (ex - 5 <= x && x <= sx + 5) ) && ( (sy - 5 <= y && y <= ey + 5) || (ey - 5 <= y && y <= sy + 5) ) ) {
						$("div[id='stencil_" + $(this)[0].shape.timestamp+"']").find("span").each(function() {
							var tsx = Math.floor($(this).offset().left-parent_offset.left);
							var tsy = Math.floor($(this).offset().top-parent_offset.top);
							var tex = Math.floor(tsx + $(this).width());
							var tey = Math.floor(tsy + $(this).height());
							
							if( (tsx <= x && x <= tex) && (tsy <= y && y <= tey) ) {
								self.is_double_clicking = 100000;
								var tValue = $(this).text();
								
								var selected_object_key = this;
								
								$(this).empty();
								$(this).append("<input type='text' value='"+tValue+"' size='"+tInputWidth+"'>");
								
								$(this).find("input").focus();
								
								$(this).find("input").bind('keypress', function(e) {
									var code = (e.keyCode ? e.keyCode : e.which);
									if (code == 13) {
										var value = $(this).val();
										
										eval("shape_properties." + $(this).parent().attr("class") + "='" + value + "';");

										$(selected_object_key).empty();
										$(selected_object_key).append(tValue);
										
										self.select_item(i);
										
										self.is_double_clicking = 3;
										
										object_pointer.properties.status = "modified";
									}
								});
							}
						});
						$("div[id='stencil_" + $(this)[0].shape.timestamp+"']").find("ul").each(function() {
							var tsx = Math.floor($(this).offset().left-parent_offset.left);
							var tsy = Math.floor($(this).offset().top-parent_offset.top);
							var tex = Math.floor(tsx + $(this).width());
							var tey = Math.floor(tsy + $(this).height());
							
							if( (tsx <= x && x <= tex) && (tsy <= y && y <= tey) ) {
								self.is_double_clicking = 100000;
								var tValue = $(this).text();
								
								var selected_object_key = this;
								
								$(this).empty();
								$(this).append("<input type='text' value='"+tValue+"' size='"+tInputWidth+"'>");
								
								$(this).find("input").focus();
								
								$(this).find("input").bind('keypress', function(e) {
									var code = (e.keyCode ? e.keyCode : e.which);
									if (code == 13) {
										tValue = $(this).val();
										eval("shape_properties." + $(this).parent().attr("class") + "='" + tValue + "';");

										$(selected_object_key).empty();
										$(selected_object_key).append(tValue);
										
										self.select_item(i);
										
										self.is_double_clicking = 3;
										
										object_pointer.properties.status = "modified";
									}
								});
							}
						});						
					}
				}
			});
			$(self.target).find(".canvas").find(".grid").find(".selection").remove();
		});
		

		//Set Mouse Down Event in Canvas
		$(target).find(".canvas").find("canvas").mousedown(function (e) {
			if (e.which == 1 || e.which == 3) {
				
				
				self.sx = 0;
				self.sy = 0;
				self.ex = 0;
				self.ey = 0;				
				
				//self.deselect();
				//self.object_manager.unset();
				
				//Calculate the position (x, y) in Canvas Axis
				var parent_offset = $(this).parent().offset(); 	
				var ratio = self.toolbar.zoom_level / 100;
				var x = Math.floor(e.pageX - parent_offset.left) * ratio;
				var y = Math.floor(e.pageY - parent_offset.top) * ratio;
				
				
				if (!($(self.target).find(".canvas").hasClass("status_drawing_line")) && 
					!($(self.target).find(".canvas").hasClass("status_drawing_square")) &&
					!($(self.target).find(".canvas").hasClass("status_move")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_top_left")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_top_right")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_bottom_left")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_bottom_right")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_top")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_bottom")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_left")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_right")) &&
					!self.is_drawing ) {
					//Set the start position for selection layer
					self.sx = x;
					self.sy = y;
				
					$(self.target).find(".canvas").find(".grid").append("<div class='selection' style='display:none;'></div>");
				}
				
				
				var select_something = false;


				//Set Status with Drawing Mode
				if($(self.target).find(".canvas").hasClass("status_drawing_line")) {			
					$(self.target).parent().find(".design_status_container").find(".lineDrawing").addClass("toolbar_buttonPressed");
				}
				//If square mode
				else if($(self.target).find(".canvas").hasClass("status_drawing_square")) {
					$(self.target).parent().find(".design_status_container").find(".squareDrawing").addClass("toolbar_buttonPressed");
				}
				else {
					$(self.target).parent().find(".design_status_container").find(".lineDrawing").removeClass("toolbar_buttonPressed");
					$(self.target).parent().find(".design_status_container").find(".squareDrawing").removeClass("toolbar_buttonPressed");
				}
				
				
				
				
				
				
				//Objects
				$(self.objects).each(function (i) {

					
					if (this.properties.selected_node == "body") {
						self.previous_x = x;
						self.previous_y = y;					
					}
					
					if (this.shape) {
						this.shape.move(x, y, x+1, y+1);
					}
					
					if (this.type == "line") {
					
						self.is_hovered(x, y, this, function() {
							if (self.selected_index.length <= 1 && !self.is_shift_pressed) {
								self.selected_index = [];
							}
							
							if (self.hovered_index == i) {
								self.select_item(i);
								select_something = true;
								
								//if ($.inArray(i, self.selected_index) > -1 && self.is_shift_pressed) {
								//	self.selected_index.pop(i);
								//}
							}							
							
						});
					}
					else if (this.type == "square") {
					
						//sx, sy : Line Start Position,
						//ex, ey : Line End Position
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
						
						if ( ( (sx - 5 <= x && x <= ex + 5) || (ex - 5 <= x && x <= sx + 5) ) && ( (sy - 5 <= y && y <= ey + 5) || (ey - 5 <= y && y <= sy + 5) ) ) {
							if (self.selected_index.length <= 1 && !self.is_shift_pressed) {
								self.selected_index = [];
							}
							
							if (self.hovered_index == i) {

								
								if ($.inArray(i, self.selected_index) > -1 && self.is_shift_pressed) {
									self.selected_index.splice(self.selected_index.indexOf(i), 1);
								}
								else {
									self.select_item(i);
									select_something = true;
								}
							}
								
							//return false; //exit the each function, because the cursor status can be changed by the other object		
						}
						else {
							//self.deselect_item(i);							
						}
					}
				});	
				


				
				if (!select_something && !self.is_shift_pressed) {
					self.deselect();
					self.object_manager.unset();
				}
			
				self.draw();
				
				self.context_menu.hide();
				
			}
			
			if (e.which == 3) {
				if (self.hovered_index > -1) {
					self.context_menu.hide();
				}
			}
			
		});

		
		//Mouse Move Event in Canvas
		$(target).find(".canvas").find("canvas").mousemove(function (e) {
			if( self.is_double_clicking-- < 1 ) {
				//Calculate the position (x, y) in Canvas Axis
				var parent_offset = $(this).parent().offset(); 	
				var ratio = self.toolbar.zoom_level / 100;
				var x = Math.floor(e.pageX - parent_offset.left) * ratio;
				var y = Math.floor(e.pageY - parent_offset.top) * ratio;
				
				//Print the current position (x, y) to right bottom space of parent window. (window footer)
				$(target).parent().parent().parent().find(".ft").find(".mouse_position_view").html("(" + x + ", " + y + ")");
				
				
				//Selection Layer
				if ($(self.target).find(".canvas").find(".grid").find(".selection")) {
					//Set the end position for selection layer
					self.ex = x;
					self.ey = y;
					
					if(self.ex - self.sx < 0) {
						$(self.target).find(".canvas").find(".grid").find(".selection").css("left", self.ex);
					}
					else {
						$(self.target).find(".canvas").find(".grid").find(".selection").css("left", self.sx);
					}
					
					if(self.ey - self.sy < 0) {
						$(self.target).find(".canvas").find(".grid").find(".selection").css("top", self.ey);
					}
					else {
						$(self.target).find(".canvas").find(".grid").find(".selection").css("top", self.sy);
					}
					
					$(self.target).find(".canvas").find(".grid").find(".selection").width(Math.abs(self.ex - self.sx)-4);
					$(self.target).find(".canvas").find(".grid").find(".selection").height(Math.abs(self.ey - self.sy)-4);
					
					$(self.target).find(".canvas").find(".grid").find(".selection").show();
				}
				
				
				
				
				self.hovered_index = null; //Canvas has no hovered object
								
				//If user has selected the line drawing tool, keep the cursor is crosshair, unless, chanage the cursor is default
				if (!(($(self.target).find(".canvas").hasClass("status_drawing_line")) || ($(self.target).find(".canvas").hasClass("status_drawing_square")))) {
					self.change_status("status_default");
				}
				
				
				//Set Status with Drawing Mode
				if($(self.target).find(".canvas").hasClass("status_drawing_line")) {			
					$(self.target).parent().find(".design_status_container").find(".lineDrawing").addClass("toolbar_buttonPressed");
				}
				//If square mode
				else if($(self.target).find(".canvas").hasClass("status_drawing_square")) {
					$(self.target).parent().find(".design_status_container").find(".squareDrawing").addClass("toolbar_buttonPressed");
				}
				else {
					$(self.target).parent().find(".design_status_container").find(".lineDrawing").removeClass("toolbar_buttonPressed");
					$(self.target).parent().find(".design_status_container").find(".squareDrawing").removeClass("toolbar_buttonPressed");
				}
				
				//Objects
				$(self.objects).each(function (i) {
					//Set grouply moving after selecting with making area
					//if ($.inArray(i, self.selected_index) > -1) {
						//this.properties.selected_node = "body";
						//this.properties.is_dragging = true;
					//}
					
					
					if (this.shape && this.properties.is_dragging && !this.properties.is_drawing_finished) {
						if(!self.is_modifying && self.is_adding<0) {
							delete self.copied_objects_undo;
							self.copied_objects_undo = [];
							
							$(self.selected_index).each(function (i) {
								var properties = {};
								properties.sx = self.objects[this].properties.sx;
								properties.sy = self.objects[this].properties.sy;
								properties.ex = self.objects[this].properties.ex;
								properties.ey = self.objects[this].properties.ey;
	
								self.copied_objects_undo[this]=properties;
							});
							
							self.is_modifying = true;
						}
						this.shape.show();
					}
					
				
					if (this.properties.selected_node == "body" && this.properties.is_dragging) {
						self.move(i, x - this.properties.previous_x, y - this.properties.previous_y);
						
						var obj = this;
						
						$(self.selected_index).each(function (j) {
							if(i != this) {
								self.objects[this].properties.sx += x - obj.properties.previous_x;
								self.objects[this].properties.sy += y - obj.properties.previous_y;
								
								if (self.objects[this].type == "line") {
									$(self.objects[this].properties.inner_node).each(function (i) {
										this.x += x - obj.properties.previous_x;
										this.y += y - obj.properties.previous_y;
									});
								}
								
								self.objects[this].properties.ex += x - obj.properties.previous_x;
								self.objects[this].properties.ey += y - obj.properties.previous_y;		
								
								self.objects[this].properties.status = "modified";			
							}
						});
					}
					
					
				
					if (this.type == "line") {
						//sx, sy : Start Position,
						//ex, ey : End Position
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
						
						self.is_hovered(x, y, this, function() {
							self.hover_item(i);
						});
						
						
						/*
if  ( ( (sx - 5 <= x && x <= ex + 5) || (ex - 5 <= x && x <= sx + 5) ) && ( (sy - 5 <= y && y <= ey + 5) || (ey - 5 <= y && y <= sy + 5) ) ) {
						
							//Calculate the constant for Line Function : y = ax + b
							var a;
							var b1, b2;
							var c = 5;
							
							if ( $(this)[0].properties.ex - $(this)[0].properties.sx != 0) {
	
								a = ($(this)[0].properties.ey - $(this)[0].properties.sy) / ($(this)[0].properties.ex - $(this)[0].properties.sx);
								
								c = Math.round(5 * Math.sqrt(a * a + 1) * 1000)/1000; // +- 5px
								
								b1 = $(this)[0].properties.sy - a * $(this)[0].properties.sx - c;
								b2 = $(this)[0].properties.sy - a * $(this)[0].properties.sx + c;
								
								
								if ( Math.round((Math.abs(a)*1000))/1000 < 0.01 ||  Math.round((Math.abs(1/a)*1000))/1000 < 0.01) {
									self.hover_item(i);	
									
									//return false; //exit the each function, because the cursor status can be changed by the other object
								}
								else {
									//if a mouse cursor is in line selection coverage,
									if (a * x + b1  <= y && y <= a * x + b2 && (((y - b1) / a <= x && x <=  (y - b2) / a) || ((y - b2) / a <= x && x <=  (y - b1) / a))) {
										self.hover_item(i);
										
										//return false; //exit the each function, because the cursor status can be changed by the other object
									}
								}
							}
							else {
								self.hover_item(i);	
								
								//return false; //exit the each function, because the cursor status can be changed by the other object
							}
							
							
						}
*/
						
						//Connection between Line and Square Objects
						if (this.properties.selected_node == "head" && this.properties.is_dragging) {
							var current_object = this;
							
							//Objects
							$(self.objects).each(function (i) {
								if (this.type == "square") {
									if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.sx = this.properties.sx;
										current_object.properties.sy = this.properties.sy;
	
										//return false;
									}
									else if ((this.properties.sx + this.properties.ex)/2 - 10 <= x && x <= (this.properties.sx + this.properties.ex)/2 + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.sx = Math.round((this.properties.sx + this.properties.ex)/2);
										current_object.properties.sy = this.properties.sy;
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.sx = this.properties.ex;
										current_object.properties.sy = this.properties.sy;
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && (this.properties.sy + this.properties.ey)/2 - 10 <= y && y <= (this.properties.sy + this.properties.ey)/2 + 10) {
										
										current_object.properties.sx = this.properties.ex;
										current_object.properties.sy = Math.round((this.properties.sy + this.properties.ey)/2);
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.sx = this.properties.ex;
										current_object.properties.sy = this.properties.ey;
										
										//return false;
									}
									else if ((this.properties.sx + this.properties.ex)/2 - 10 <= x && x <= (this.properties.sx + this.properties.ex)/2 + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.sx = Math.round((this.properties.sx + this.properties.ex)/2);
										current_object.properties.sy = this.properties.ey;
										
										//return false;
									}
									else if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.sx = this.properties.sx;
										current_object.properties.sy = this.properties.ey;
										
										//return false;
									}
									else if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && (this.properties.sy + this.properties.ey)/2 - 10 <= y && y <= (this.properties.sy + this.properties.ey)/2 + 10) {
										
										current_object.properties.sx = this.properties.sx;
										current_object.properties.sy = Math.round((this.properties.sy + this.properties.ey)/2);
										
										//return false;
									}
								}
							});
						}
						else if (this.properties.selected_node == "tail" && this.properties.is_dragging) {
							var current_object = this;
							
							//Objects
							$(self.objects).each(function (i) {
								if (this.type == "square") {
									if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.ex = this.properties.sx;
										current_object.properties.ey = this.properties.sy;
										
										//return false;
									}
									else if ((this.properties.sx + this.properties.ex)/2 - 10 <= x && x <= (this.properties.sx + this.properties.ex)/2 + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.ex = Math.round((this.properties.sx + this.properties.ex)/2);
										current_object.properties.ey = this.properties.sy;
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.ex = this.properties.ex;
										current_object.properties.ey = this.properties.sy;
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && (this.properties.sy + this.properties.ey)/2 - 10 <= y && y <= (this.properties.sy + this.properties.ey)/2 + 10) {
										
										current_object.properties.ex = this.properties.ex;
										current_object.properties.ey = Math.round((this.properties.sy + this.properties.ey)/2);
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.ex = this.properties.ex;
										current_object.properties.ey = this.properties.ey;
										
										//return false;
									}
									else if ((this.properties.sx + this.properties.ex)/2 - 10 <= x && x <= (this.properties.sx + this.properties.ex)/2 + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.ex = Math.round((this.properties.sx + this.properties.ex)/2);
										current_object.properties.ey = this.properties.ey;
										
										//return false;
									}
									else if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.ex = this.properties.sx;
										current_object.properties.ey = this.properties.ey;
										
										//return false;
									}
									else if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && (this.properties.sy + this.properties.ey)/2 - 10 <= y && y <= (this.properties.sy + this.properties.ey)/2 + 10) {
										
										current_object.properties.ex = this.properties.sx;
										current_object.properties.ey = Math.round((this.properties.sy + this.properties.ey)/2);
										
										//return false;
									}
								}
							});
						}
					}
					else if (this.type == "square") {
						
						//sx, sy : Line Start Position,
						//ex, ey : Line End Position
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
						
						if ( ( (sx - 5 <= x && x <= ex + 5) || (ex - 5 <= x && x <= sx + 5) ) && ( (sy - 5 <= y && y <= ey + 5) || (ey - 5 <= y && y <= sy + 5) ) ) {
		
							self.hover_item(i);	
							
							//return false; //exit the each function, because the cursor status can be changed by the other object	
						}
	
					}
				});
				
				
				
				//Occuring mouse move event, draw the canvas
				self.draw();
			}
			
			//$(".designer_message").html("Focus Index: " + this.focus + " / selected_index: " + this.selected_index);
		});
		
		
		//Set Mouse Up Event in Canvas
		$(target).find(".canvas").find("canvas").mouseup(function (e) {
			self.is_drawing = false;
			
			//Calculate the position (x, y) in Canvas Axis
			var parent_offset = $(this).parent().offset(); 	
			var ratio = self.toolbar.zoom_level / 100;
			var x = Math.floor(e.pageX - parent_offset.left) * ratio;
			var y = Math.floor(e.pageY - parent_offset.top) * ratio;

			
			if (e.which == 1) {
				
				//Selection Layer
				if(!($(self.target).find(".canvas").hasClass("status_drawing_line")) && 
					!($(self.target).find(".canvas").hasClass("status_drawing_square")) &&
					!($(self.target).find(".canvas").hasClass("status_move")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_top_left")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_top_right")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_bottom_left")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_bottom_right")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_top")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_bottom")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_left")) &&
					!($(self.target).find(".canvas").hasClass("status_resize_right")) &&
					!self.is_drawing ) {
					
					if ($(self.target).find(".canvas").find(".grid").find(".selection") &&
						($(self.target).find(".canvas").find(".grid").find(".selection").width() >= 5 || 
						$(self.target).find(".canvas").find(".grid").find(".selection").height() >= 5) ) {
						self.select();
					}
					
					$(self.target).find(".canvas").find(".grid").find(".selection").remove();
					
					self.sx = 0;
					self.sy = 0;
					self.ex = 0;
					self.ey = 0;
				}
				else if (self.is_adding > -1 && self.objects[self.is_adding] != undefined) {
					var properties = {};
					
					properties.sx = self.objects[self.is_adding].properties.sx;
					properties.sy = self.objects[self.is_adding].properties.sy;
					properties.ex = self.objects[self.is_adding].properties.ex;
					properties.ey = self.objects[self.is_adding].properties.ey;
					
					//Register the undo function
					/*
					self.undo_manager.register(
						self, self.remove, [self.objects.length-1], 'Remove Item',
						self, self.add, [self.objects[self.is_adding].type, self.objects[self.is_adding].shape_name, self.objects[self.is_adding].option, properties], 'Create Item'
					);
					*/
					self.is_adding = -1;
				}

				
				if (Math.abs(x - self.previous_x) < 4 && Math.abs(y - self.previous_y) < 4) {
					
					if (!self.is_shift_pressed) {
						self.deselect();
						self.object_manager.unset();
					}
					
					if (self.hovered_index >= 0) {
						
						if (self.selected_index.length == 0) {
							self.select_item(self.hovered_index);
						}
						/*
						 
						if ($.inArray(self.hovered_index, self.selected_index) > -1 && self.is_shift_pressed) {
							self.selected_index.splice(self.selected_index.indexOf(self.hovered_index), 1);
						}
						else {
							self.select_item(self.hovered_index);
						}
						*/						
					}
				}

				//Set Status with Drawing Mode
				if($(self.target).find(".canvas").hasClass("status_drawing_line")) {			
					$(self.target).parent().find(".design_status_container").find(".lineDrawing").addClass("toolbar_buttonPressed");
				}
				//If square mode
				else if($(self.target).find(".canvas").hasClass("status_drawing_square")) {
					$(self.target).parent().find(".design_status_container").find(".squareDrawing").addClass("toolbar_buttonPressed");
				}
				else {
					$(self.target).parent().find(".design_status_container").find(".lineDrawing").removeClass("toolbar_buttonPressed");
					$(self.target).parent().find(".design_status_container").find(".squareDrawing").removeClass("toolbar_buttonPressed");
				}
				
				//Objects
				$(self.objects).each(function (i) {
				
					if (self.snap_to_grid) {
						var unit = parseInt(core.preference["preference.designer.grid_unit"]);
						
						if (this.properties.sx % unit < unit / 4) {
							this.properties.sx -= this.properties.sx % unit;
						}
						else if (this.properties.sx % unit > unit * 3 / 4) {
							this.properties.sx = parseInt(Math.round(this.properties.sx/unit)) * unit;
						}
						
						if (this.properties.sy % unit < unit / 4) {
							this.properties.sy -= this.properties.sy % unit;
						}
						else if (this.properties.sy % unit > unit * 3 / 4) {
							this.properties.sy = parseInt(Math.round(this.properties.sy/unit)) * unit;
						}
						
						
						if (this.properties.ex % unit < unit / 4) {
							this.properties.ex -= this.properties.ex % unit;
						}
						else if (this.properties.ex % unit > unit * 3 / 4) {
							this.properties.ex = parseInt(Math.round(this.properties.ex/unit)) * unit;
						}
						
						if (this.properties.ey % unit < unit / 4) {
							this.properties.ey -= this.properties.ey % unit;
						}
						else if (this.properties.ey % unit > unit * 3 / 4) {
							this.properties.ey = parseInt(Math.round(this.properties.ey/unit)) * unit;
						}
						
						//this.properties.sx = parseInt(Math.round(this.properties.sx/unit)) * unit;
						//this.properties.sy = parseInt(Math.round(this.properties.sy/unit)) * unit;
						//this.properties.ex = parseInt(Math.round(this.properties.ex/unit)) * unit;
						//this.properties.ey = parseInt(Math.round(this.properties.ey/unit)) * unit;	
					}

					if (this.type == "line") {

						//Connection between Line and Square Objects
						if (this.properties.selected_node == "head") {
							var current_object = this;
							
							//Objects
							$(self.objects).each(function (j) {
								if (this.type == "square") {
									if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
					
										current_object.properties.connector['head'] = j;
										this.properties.connector['tl'] = i;
										
										current_object.properties.sx = this.properties.sx;
										current_object.properties.sy = this.properties.sy;
										//return false;
									}
									else if ((this.properties.sx + this.properties.ex)/2 - 10 <= x && x <= (this.properties.sx + this.properties.ex)/2 + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.connector['head'] = j;
										this.properties.connector['t'] = i;
										
										current_object.properties.sx = Math.round((this.properties.sx + this.properties.ex)/2);
										current_object.properties.sy = this.properties.sy;
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.connector['head'] = j;
										this.properties.connector['tr'] = i;
										
										current_object.properties.sx = this.properties.ex;
										current_object.properties.sy = this.properties.sy;
									
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && (this.properties.sy + this.properties.ey)/2 - 10 <= y && y <= (this.properties.sy + this.properties.ey)/2 + 10) {
										
										current_object.properties.connector['head'] = j;
										this.properties.connector['r'] = i;
										
										current_object.properties.sx = this.properties.ex;
										current_object.properties.sy = Math.round((this.properties.sy + this.properties.ey)/2);
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.connector['head'] = j;
										this.properties.connector['br'] = i;
										
										current_object.properties.sx = this.properties.ex;
										current_object.properties.sy = this.properties.ey;
										
										//return false;
									}
									else if ((this.properties.sx + this.properties.ex)/2 - 10 <= x && x <= (this.properties.sx + this.properties.ex)/2 + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.connector['head'] = j;
										this.properties.connector['b'] = i;
										
										current_object.properties.sx = Math.round((this.properties.sx + this.properties.ex)/2);
										current_object.properties.sy = this.properties.ey;
										
										//return false;
									}
									else if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.connector['head'] = j;
										this.properties.connector['bl'] = i;
										
										current_object.properties.sx = this.properties.sx;
										current_object.properties.sy = this.properties.ey;
										
										//return false;
									}
									else if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && (this.properties.sy + this.properties.ey)/2 - 10 <= y && y <= (this.properties.sy + this.properties.ey)/2 + 10) {
										
										current_object.properties.connector['head'] = j;
										this.properties.connector['l'] = i;
										
										current_object.properties.sx = this.properties.sx;
										current_object.properties.sy = Math.round((this.properties.sy + this.properties.ey)/2);
										
										//return false;
									}
	
								}
							});
						}
						else if (this.properties.selected_node == "tail") {
							var current_object = this;
							
							//Objects
							$(self.objects).each(function (j) {
								if (this.type == "square") {
									if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.connector['tail'] = j;
										this.properties.connector['tl'] = i;
										
										current_object.properties.ex = this.properties.sx;
										current_object.properties.ey = this.properties.sy;
										
										//return false;
									}
									else if ((this.properties.sx + this.properties.ex)/2 - 10 <= x && x <= (this.properties.sx + this.properties.ex)/2 + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.connector['tail'] = j;
										this.properties.connector['t'] = i;
										
										current_object.properties.ex = Math.round((this.properties.sx + this.properties.ex)/2);
										current_object.properties.ey = this.properties.sy;
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && this.properties.sy - 10 <= y && y <= this.properties.sy + 10) {
										
										current_object.properties.connector['tail'] = j;
										this.properties.connector['tr'] = i;
										
										current_object.properties.ex = this.properties.ex;
										current_object.properties.ey = this.properties.sy;
									
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && (this.properties.sy + this.properties.ey)/2 - 10 <= y && y <= (this.properties.sy + this.properties.ey)/2 + 10) {
										
										current_object.properties.connector['tail'] = j;
										this.properties.connector['r'] = i;
										
										current_object.properties.ex = this.properties.ex;
										current_object.properties.ey = Math.round((this.properties.sy + this.properties.ey)/2);										
										
										//return false;
									}
									else if (this.properties.ex - 10 <= x && x <= this.properties.ex + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.connector['tail'] = j;
										this.properties.connector['br'] = i;
										
										current_object.properties.ex = this.properties.ex;
										current_object.properties.ey = this.properties.ey;
										
										//return false;
									}
									else if ((this.properties.sx + this.properties.ex)/2 - 10 <= x && x <= (this.properties.sx + this.properties.ex)/2 + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.connector['tail'] = j;
										this.properties.connector['b'] = i;
										
										current_object.properties.ex = Math.round((this.properties.sx + this.properties.ex)/2);
										current_object.properties.ey = this.properties.ey;										
										
										//return false;
									}
									else if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && this.properties.ey - 10 <= y && y <= this.properties.ey + 10) {
										
										current_object.properties.connector['tail'] = j;
										this.properties.connector['bl'] = i;
										
										current_object.properties.ex = this.properties.sx;
										current_object.properties.ey = this.properties.ey;
										
										//return false;
									}
									else if (this.properties.sx - 10 <= x && x <= this.properties.sx + 10 && (this.properties.sy + this.properties.ey)/2 - 10 <= y && y <= (this.properties.sy + this.properties.ey)/2 + 10) {
										
										current_object.properties.connector['tail'] = j;
										this.properties.connector['l'] = i;
										
										current_object.properties.ex = this.properties.sx;
										current_object.properties.ey = Math.round((this.properties.sy + this.properties.ey)/2);
										
										//return false;
									}


								}
								
								
							});
						}
						else if (this.properties.selected_node == "body") {
							var current_object = this;
							
							current_object.properties.connector['head'] = null;
							current_object.properties.connector['tail'] = null;
							
							$(self.objects).each(function (j) {
								if (this.type == "square") {
									if (this.properties.connector['tl'] == i) {
										this.properties.connector['tl'] = null;
									}
									else if (this.properties.connector['t'] == i) {
										this.properties.connector['t'] = null;
									}
									else if (this.properties.connector['tr'] == i) {
										this.properties.connector['tr'] = null;
									}
									else if (this.properties.connector['r'] == i) {
										this.properties.connector['r'] = null;
									}
									else if (this.properties.connector['br'] == i) {
										this.properties.connector['br'] = null;
									}
									else if (this.properties.connector['b'] == i) {
										this.properties.connector['b'] = null;
									}
									else if (this.properties.connector['bl'] == i) {
										this.properties.connector['bl'] = null;
									}
									else if (this.properties.connector['l'] == i) {
										this.properties.connector['l'] = null;
									}
								}
							});
						}
						// why?
						//self.object_manager.set(this);
					}
					
				});
				
				// register undo_manager in modify
				if(self.is_modifying) {
					delete self.copied_objects_redo;
					self.copied_objects_redo = [];
					
					$(self.selected_index).each(function (i) {
						var properties = {};
						properties.sx = self.objects[this].properties.sx;
						properties.sy = self.objects[this].properties.sy;
						properties.ex = self.objects[this].properties.ex;
						properties.ey = self.objects[this].properties.ey;

						self.copied_objects_redo[this]=properties;
						
						// refresh Property
						self.object_manager.set(self.objects[this]);
					});
					
					/*
					self.undo_manager.register(
						self, self.set_properties2, [self.selected_index.slice(0), self.copied_objects_undo], 'Undo Item',
						self, self.set_properties2, [self.selected_index.slice(0), self.copied_objects_redo], 'Redo Item'
					);
					*/
					
					self.is_modifying = false;
				}

				self.draw();
				
				//self.deselect();
				//self.object_manager.unset();
				
				$(self.collaboration).trigger("modify", [self.objects[self.hovered_index]]);
			}
			
			this.focus = -1;
			
			//refresh Object
			self.object_explorer.refresh();
		});
	
		
		/*
		
		$(target).find(".canvas").click(function (e) {
			var parent_offset = $(this).parent().offset(); 
			var x = Math.floor(e.pageX - parent_offset.left);
			var y = Math.floor(e.pageY - parent_offset.top);	
			
			if (e.which == 1) {
				$(self.objects).each(function (i) {
				
					if (this.type == "square") {
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
						
						if ( ( (sx <= x && x <= ex) || (ex <= x && x <= sx) ) && ( (sy <= y && y <= ey) || (ey <= y && y <= sy) ) ) {
							self.object_manager.set(this);
							
							return false;
						}
					}
				});
			}
		});
		
		*/
		
		//this.preview.set_size();
		//this.preview.setup();

		
		/*
		
		if(core.dialog.preference.preference["preference.designer.show_preview"]=="true") {
			this.toolbar.is_preview_on = false;
		}
		else {
			this.toolbar.is_preview_on = true;
		}
		this.toolbar.toggle_preview();
		
		if(core.preference["preference.designer.show_grid"]=="true") {
			this.toolbar.is_grid_on = false;
		}
		else {
			this.toolbar.is_grid_on = true;
		}
		this.toolbar.toggle_grid();
		
		if(core.preference["preference.designer.show_ruler"]=="true") {
			this.toolbar.is_ruler_on = false;
		}
		else {
			this.toolbar.is_ruler_on = true;
		}
		this.toolbar.toggle_ruler();
		
		if(core.preference["preference.designer.snap_to_grid"]=="true") {
			this.snap_to_grid = false;
		}
		else {
			this.snap_to_grid = true;
		}
		*/
		
		/*
		this.toolbar.toggle_snap_to_grid();
		
		this.toolbar.change_grid_unit(core.preference["preference.designer.grid_unit"]);
		
		this.toolbar.change_grid_opacity(core.preference["preference.designer.grid_opacity"]);
		
		this.toolbar.change_ruler_unit(core.preference["preference.designer.ruler_unit"]);
		*/

	},

	is_hovered : function (x, y, object, callback) {

	
		//sx, sy : Start Position,
		//ex, ey : End Position
		var sx=0, sy=0, ex=0, ey=0;
				
		if (object.properties.sx) {
			sx = parseInt(object.properties.sx);
		}
		
		if (object.properties.sy) {
			sy = parseInt(object.properties.sy);	
		}
	
		if (object.properties.ex) {
			ex = parseInt(object.properties.ex);
		}
	
		if (object.properties.ey) {					
			ey = parseInt(object.properties.ey);
		}

		if (object.properties.inner_node != null) {
		for(var i=0; i<=object.properties.inner_node.length; i++) {
			if (i == 0) {  //start 
				
				if(object.properties.inner_node.length == 0) {
					sx = object.properties.sx;
					sy = object.properties.sy;
					ex = object.properties.ex;
					ey = object.properties.ey;
				}
				else {
					sx = object.properties.sx;
					sy = object.properties.sy;
					ex = object.properties.inner_node[0].x;
					ey = object.properties.inner_node[0].y;
				}
				
			} 
			else if(i == object.properties.inner_node.length) {  //end
				sx = object.properties.inner_node[i-1].x;
				sy = object.properties.inner_node[i-1].y;
				ex = object.properties.ex;
				ey = object.properties.ey;	
			}
			else {  //middle				
				sx = object.properties.inner_node[i-1].x;
				sy = object.properties.inner_node[i-1].y;
				ex = object.properties.inner_node[i].x;
				ey = object.properties.inner_node[i].y;
			}
		
			
			if  ( ( (sx - 5 <= x && x <= ex + 5) || (ex - 5 <= x && x <= sx + 5) ) && ( (sy - 5 <= y && y <= ey + 5) || (ey - 5 <= y && y <= sy + 5) ) ) {
									
				//Calculate the constant for Line Function : y = ax + b
				var a;
				var b1, b2;
				var c = 5;
				
				if ( ex - sx != 0) {
			
					a = (ey - sy) / (ex - sx);
					
					c = Math.round(5 * Math.sqrt(a * a + 1) * 1000)/1000; // +- 5px
					
					b1 = sy - a * sx - c;
					b2 = sy - a * sx + c;
					
					
					if ( Math.round((Math.abs(a)*1000))/1000 < 0.01 ||  Math.round((Math.abs(1/a)*1000))/1000 < 0.01) {
						if(typeof callback == 'function') {
							callback();
							return;
						}	
						
						//return false; //exit the each function, because the cursor status can be changed by the other object
					}
					else {
						//if a mouse cursor is in line selection coverage,
						if (a * x + b1  <= y && y <= a * x + b2 && (((y - b1) / a <= x && x <=  (y - b2) / a) || ((y - b2) / a <= x && x <=  (y - b1) / a))) {
							if(typeof callback == 'function') {
								callback();
								return;
							}	
							
							//return false; //exit the each function, because the cursor status can be changed by the other object
						}
					}
				}
				else {
					if(typeof callback == 'function') {
						callback();
						return;
					}		
					
					//return false; //exit the each function, because the cursor status can be changed by the other object
				}
				
			}
		}
		}	
	},
	
	set_size: function (width, height, indicator_top_fake) {
		var self = this;
	
		//Set width, height properties
		this.width = parseInt(width);
		this.height = parseInt(height);
		
		$("#" + self.dialog.container_id).find(".design_canvas_setting").find(".canvas_width").val(width);
		var height = self.height;
		$("#" + self.dialog.container_id).find(".design_canvas_setting").find(".canvas_height").val(height);
		
		//Set Canvas Layer Style for aligning center
		$(this.target).find(".canvas").width(this.width);
		$(this.target).find(".canvas").height(this.height);	
		$(this.target).find(".canvas").css("margin-left", 0 - (this.width/2));	
		$(this.target).find(".canvas").css("margin-top", 0 - (this.height/2));	
		
		//Set Canvas Element Style
		$(this.target).find(".canvas").find(".shapes").css("position", "absolute");
		$(this.target).find(".canvas").find(".shapes").css("left", 0);
		$(this.target).find(".canvas").find(".shapes").css("top", 0);
		
		//Set Canvas Element Style
		$(this.target).find(".canvas").find("canvas").css("position", "absolute");
		$(this.target).find(".canvas").find("canvas").css("left", 0);
		$(this.target).find(".canvas").find("canvas").css("top", 0);
		$(this.target).find(".canvas").find("canvas").css("width", this.width);
		$(this.target).find(".canvas").find("canvas").css("height", this.height);
		$(this.target).find(".canvas").find("canvas").attr("width", this.width);
		$(this.target).find(".canvas").find("canvas").attr("height", this.height);			
		
		//Set Canvas Space Style : default margin is 50 (90 = 50 x 2 - 10)
		$(this.target).find(".space").width(this.width + 90);
		$(this.target).find(".space").height(this.height + 100);

		//Set Canvas Dummy Space Style : default margin is 50 (90 = 50 x 2 - 10)
		$(this.target).find(".dummyspace").width(this.width + 90);
		$(this.target).find(".dummyspace").height(this.height + 100);
		
		//this.preview.set_size("change", indicator_top_fake);
	},
	
	set_skin: function (imgsrc, width, height) {
		//Set width, height properties
		this.skin_width = parseInt(width);
		this.skin_height = parseInt(height);
		
		//Set Canvas Layer Style for aligning center
		$(this.target).find(".skin").width(this.skin_width);
		$(this.target).find(".skin").height(this.skin_height);	

		$(this.target).find(".skin").css("margin-left", 0 - (this.skin_width/2));	
		$(this.target).find(".skin").css("margin-top", 0 - (this.skin_height/2));	
		$(this.target).find(".skin").css("background-image", "url(" + imgsrc + ")");
		
		//Set Canvas Space Style : default margin is 50 (90 = 50 x 2 - 10)
		$(this.target).find(".space").width(this.skin_width + 90);
		$(this.target).find(".space").height(this.skin_height + 100);	

	},
	
	add: function (type, shape, option, properties, callback) {
		var self = this;
		
		
		if (!self.is_drawing) {
			
			self.is_drawing = true;
			
			var object = new org.goorm.core.object.ui();
			object.init($(self.target).find(".canvas"), self, type, shape, option, function () {
				
				if (typeof callback == "function") {
					callback();
				}
			});
			
			self.objects.push(object);
			
			//Add the object
			
			self.is_adding = self.objects.length-1;

			if(properties) {
				self.objects[self.objects.length-1].properties.sx = properties.sx;
				self.objects[self.objects.length-1].properties.sy = properties.sy;
				self.objects[self.objects.length-1].properties.ex = properties.ex;
				self.objects[self.objects.length-1].properties.ey = properties.ey;
				
				self.objects[self.objects.length-1].properties.is_drawing_finished = true;
				
				self.is_drawing = false;
				self.is_adding = -1;
				self.objects[self.objects.length-1].shape.show();
				self.draw();
			}

			//Refresh the Object Explorer (for Testing)
			self.object_explorer.refresh();
			
			$(this.collaboration).trigger("add", [self.objects[self.objects.length-1]]);
		}
	},
	
	select_all: function () {
		var self = this;
		
		$(this.objects).each(function (i) {
			self.select_item(i);
		});
	},
	
	select: function () {
		var self = this;
		
		//All objects
		$(this.objects).each(function (i) {
			var sx=0, sy=0;
			
			this.selected = false;
					
			if ($(this)[0].properties.sx) {
				sx = parseInt($(this)[0].properties.sx);
			}
			
			if ($(this)[0].properties.sy) {
				sy = parseInt($(this)[0].properties.sy);	
			}


			
			if ( ( (self.sx <= sx && sx <= self.ex) || (self.ex <= sx && sx <= self.sx) ) && ( (self.sy <= sy && sy <= self.ey) || (self.ey <= sy && sy <= self.sy) ) ) {
				var ex=0, ey=0;
					
				if ($(this)[0].properties.ex) {
					ex = parseInt($(this)[0].properties.ex);
				}
	
				if ($(this)[0].properties.ey) {					
					ey = parseInt($(this)[0].properties.ey);
				}
				
			
				if( ( (self.sx <= ex && ex <= self.ex) || (self.ex <= ex && ex <= self.sx) ) && ( (self.sy <= ey && ey <= self.ey) || (self.ey <= ey && ey <= self.sy) ) ) {
					self.selected_index.push(i);
					/*
					if($(this)[0].type == 'square') {
						//is selected?
						if($.inArray(i, $(self.selected_index)) >= 0) {
							$(this)[0].select();
						}
					}
					*/
					
					this.selected = true;
					
/*
					$("#object_explorer").find(".objectInformation").each(function (k) {
						
						
						if(k == i) {
							$(this).addClass("highlighted");
						}
					});
*/
					self.object_explorer.highlight(i);
					
					self.object_manager.set(this);
				}
			}
		});

		
		//$(".designer_message").html("Focus Index: " + this.focus + " / selected_index: " + this.selected_index);
	},
	
	deselect: function () {
		var self = this;

		//All objects
		/*
		$(this.objects).each(function (i) {
			if($(this)[0].type == 'square') {
				//is selected?
				if($.inArray(i, $(self.selected_index)) >= 0) {
					$(this)[0].deselect();
				}
			}
		});
		*/
		
		
		$(this.objects).each(function (i) {			
			self.selected_index.pop();	
		});
	
		$("#object_explorer").find(".highlighted").each(function(i) {
			$(this).removeClass("highlighted");
		});

	},
	
	unfocus_all: function () {
		var self = this;
		
		this.focus = -1;
		
		$(this.objects).each(function (i) {			
			this.properties.focus = false;	
		});
	},
	
	draw: function () {
		var self = this;
		
		
		this.selected_index = $.unique(this.selected_index);
		
		
		//Canvas Element (Supported in HTML5)
		if($(this.target).find(".canvas").find("canvas")[0].getContext) {
			//Get Context
			var context = $(this.target).find(".canvas").find("canvas")[0].getContext('2d');
			
			//Clear the canvas
			context.clearRect(0, 0, $(this.target).find(".canvas").find("canvas").width(), $(this.target).find(".canvas").find("canvas").height());	
			
			//All objects
			$(this.objects).each(function (i) {
				
				if (this.properties.timestamp == null) {
					var a = self.objects.slice(0, i);
					var b = self.objects.slice(i, self.objects.length);
					
					b.shift();
					self.objects = a.concat(b);
					//self.objects.pop(i);					
				}
				
/*
				if (self.snap_to_grid) {
					this.properties.sx = parseInt(Math.round(this.properties.sx/10)) * 10;
					this.properties.sy = parseInt(Math.round(this.properties.sy/10)) * 10;
					this.properties.ex = parseInt(Math.round(this.properties.ex/10)) * 10;
					this.properties.ey = parseInt(Math.round(this.properties.ey/10)) * 10;												
				}
*/
				
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
					


					//is hovered?
					if(self.hovered_index == i) {
						context.beginPath();
						context.strokeStyle = "#FFFF00";
						
						context.moveTo(sx, sy);
						
						$(this.properties.inner_node).each(function() {
							context.lineTo(this.x, this.y);
						});
						
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
						
						context.moveTo(x, y);
						context.lineWidth = parseFloat($(this)[0].properties.thickness);
						
						$(this.properties.inner_node).each(function() {
							dx = (x - this.x);
							dy = (y - this.y);
							
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
							
							x = this.x;
							y = this.y;
						});
						
						
						if (ex < sx) {
							dx = (x - sx);
							dy = (y - sy);
						}
						else {
							dx = (x - ex);
							dy = (y - ey);							
						}
												
						var slope = dy/dx;
						var remaining_distance = Math.sqrt( dx*dx + dy*dy );
						
						while (remaining_distance>=0.1){
							var dash_length = dash_array[dash_index++ % dash_count];
							
							if (dash_length > remaining_distance) 
								dash_length = remaining_distance;
								
							var step_x = Math.sqrt( dash_length*dash_length / (1 + slope * slope) );
							
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
						
						$(this.properties.inner_node).each(function() {
							context.lineTo(this.x, this.y);
						});
						
						context.lineTo(ex, ey);
						context.lineWidth = parseFloat($(this)[0].properties.thickness);
						context.stroke();
					}

					
					if (this.shape) {
						var temp_sx = this.properties.sx;
						var temp_sy = this.properties.sy;
						var temp_ex = this.properties.ex;
						var temp_ey = this.properties.ey;						
						
						if (this.properties.inner_node.length > 0) {
							temp_sx = this.properties.inner_node[this.properties.inner_node.length - 1].x;
							temp_sy = this.properties.inner_node[this.properties.inner_node.length - 1].y;

							temp_ex = this.properties.inner_node[0].x;
							temp_ey = this.properties.inner_node[0].y;							
						}

						eval(this.shape.javascript);
					}
					
					//is selected? 
					if($.inArray(i, self.selected_index) >= 0 || self.selected) {
						context.beginPath();
						context.strokeStyle = "#666666";
						
						context.rect(sx- 3, sy - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						
						context.fillStyle = "#FFFFFF";
						context.fill();

						/*
						context.beginPath();
						context.fillStyle = "#000";
					    context.font = '11px Arial';
					    context.fillText('[H] ' + sx + ',' + sy, sx+8, sy+8);						
						*/
						
						$(this.properties.inner_node).each(function(i) {
							context.beginPath();
							context.strokeStyle = "#666666";
						
							context.rect(this.x- 3, this.y - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();
						
							context.fillStyle = "#FFFFFF";
							context.fill();
							
							/*
							context.beginPath();
							context.fillStyle = "#000";
						    context.font = '11px Arial';
						    context.fillText('['+i+'] ' + this.x + ',' + this.y, this.x+8, this.y+8);
						    */
						});
						
						
						context.beginPath();
						context.strokeStyle = "#666666";
						
						context.rect(ex- 3, ey - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						
						context.fillStyle = "#FFFFFF";
						context.fill();
						
						/*
						context.beginPath();
						context.fillStyle = "#000";
					    context.font = '11px Arial';
					    context.fillText('[T] ' + ex + ',' + ey, ex+8, ey+8);
					    */	
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
					if(self.hovered_index == i) {
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
					if($.inArray(i, self.selected_index) >= 0 || self.selected) {
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
											
						if (this.shape.move) {
							this.shape.move(this.properties.sx, this.properties.sy, this.properties.ex, this.properties.ey);
							this.shape.set_shape();
						}
					
					}
				}
			});
		}
		
		//this.preview.draw();
	},
	
	set_cursor: function (cursor_type) {
		//Set the cursor in cavas layer
		$(this.target).find(".canvas").css("cursor", cursor_type);
	},
	
	set_drawing_mode: function (mode) {
		//Remove all status
		$(this.target).find(".canvas").removeClass("status_default");
		$(this.target).find(".canvas").removeClass("status_drawing_line");
		$(this.target).find(".canvas").removeClass("status_drawing_square");
		$(this.target).find(".canvas").removeClass("status_move");
		
		$(this.target).find(".canvas").removeClass("status_resize_top_left");
		$(this.target).find(".canvas").removeClass("status_resize_top_right");
		$(this.target).find(".canvas").removeClass("status_resize_bottom_left");
		$(this.target).find(".canvas").removeClass("status_resize_bottom_right");
		$(this.target).find(".canvas").removeClass("status_resize_top");
		$(this.target).find(".canvas").removeClass("status_resize_bottom");
		$(this.target).find(".canvas").removeClass("status_resize_left");
		$(this.target).find(".canvas").removeClass("status_resize_right");
		
		
		$(this.target).parent().find(".design_status_container").find(".lineDrawing").removeClass("toolbar_buttonPressed");
		$(this.target).parent().find(".design_status_container").find(".squareDrawing").removeClass("toolbar_buttonPressed");
		
		//If line mode
		if(mode == "line") {			
			$(this.target).find(".canvas").addClass("status_drawing_line");

		}
		//If square mode
		else if(mode == "square") {
			$(this.target).find(".canvas").addClass("status_drawing_square");

		}
	},
	
	change_status: function (className) {
		$(this.target).find(".canvas").removeClass("status_default");
		$(this.target).find(".canvas").removeClass("status_drawing_line");
		$(this.target).find(".canvas").removeClass("status_drawing_square");
		$(this.target).find(".canvas").removeClass("status_move");
		
		$(this.target).find(".canvas").removeClass("status_resize_top_left");
		$(this.target).find(".canvas").removeClass("status_resize_top_right");
		$(this.target).find(".canvas").removeClass("status_resize_bottom_left");
		$(this.target).find(".canvas").removeClass("status_resize_bottom_right");
		$(this.target).find(".canvas").removeClass("status_resize_top");
		$(this.target).find(".canvas").removeClass("status_resize_bottom");
		$(this.target).find(".canvas").removeClass("status_resize_left");
		$(this.target).find(".canvas").removeClass("status_resize_right");
		
		$(this.target).find(".canvas").addClass(className);
	},
	
	highlight_object: function (index) {
	
		$("#object_tree").find(".ygtvcontent").each(function (i) {
			if("objectInformation"+index == $(this).text()) {
				$(this).parent().parent().parent().parent().addClass("highlighted");
			}
			else {
				$(this).parent().parent().parent().parent().removeClass("highlighted");
			}
		});
/*
		
		this.object_explorer.highlight(index);
		
		$("#object_explorer").find(".objectInformation").each(function (k) {
			$(this).removeClass("highlighted");
			
			if(k == index) {
				$(this).addClass("highlighted");
			}
		});
*/
	},
	
	unhighlight_object: function (index) {
		this.object_explorer.unhighlight(index);
	},
	
	select_item: function (index) {
		///if (this.focus <= index) {
		if (!this.is_shift_pressed) {
			this.unfocus_all();
		}
		//this.deselect();
		this.focus = index;
		
		if (this.objects[index]) {
			this.objects[index].properties.focus = true;
			//}
				
			
			this.selected_index.push(index); //Set current selected object
		
			//Set the cursor shape to move
			this.change_status("status_move");
			
			this.object_manager.set(this.objects[index]);
			
			//test
			this.highlight_object(index);
		
			
			if (this.objects[index].type == "line") {
				var j;
				
				if (this.objects[index].properties.connector["head"] != null) {
					j = this.objects[index].properties.connector["head"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				if (this.objects[index].properties.connector["tail"] != null) {
					j = this.objects[index].properties.connector["tail"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				
				
			}
			else if (this.objects[index].type == "square") {
				var j;
				
				if (this.objects[index].properties.connector["tl"] != null) {
					j = this.objects[index].properties.connector["tl"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				if (this.objects[index].properties.connector["t"] != null) {
					j = this.objects[index].properties.connector["t"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				if (this.objects[index].properties.connector["tr"] != null) {
					j = this.objects[index].properties.connector["tr"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				if (this.objects[index].properties.connector["r"] != null) {
					j = this.objects[index].properties.connector["r"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				if (this.objects[index].properties.connector["br"] != null) {
					j = this.objects[index].properties.connector["br"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				if (this.objects[index].properties.connector["b"] != null) {
					j = this.objects[index].properties.connector["b"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				if (this.objects[index].properties.connector["bl"] != null) {
					j = this.objects[index].properties.connector["bl"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
				if (this.objects[index].properties.connector["l"] != null) {
					j = this.objects[index].properties.connector["l"];
					this.objects[j].properties.focus = true;
					this.selected_index.push(j);
					this.highlight_object(j);
				}
	
			}
		}


		
//		m.s("you selected " + index + " item", "canvas");
		
		//$(".designer_message").html("Focus Index: " + this.focus + " / selected_index: " + this.selected_index);
	},
	
	deselect_item: function (index) {
		//this.selected_index.pop(index);
										
		//If user has selected the line drawing tool, keep the cursor is crosshair, unless, chanage the cursor is default
		if (!(($(this.target).find(".canvas").hasClass("status_drawing_line")) || ($(this.target).find(".canvas").hasClass("status_drawing_square")))) {
			this.change_status("status_default");		
		}
  
		if (this.focus > index) {
			this.focus = -1;
			this.objects[index].properties.focus = false;
		}
		
		this.unhighlight_object(index);	
		
//		m.er("you deselected " + index + " item", "canvas");		


		//$(".designer_message").html("Focus Index: " + this.focus + " / selected_index: " + this.selected_index);
	},
	
	hover_item: function (index) { 
		this.hovered_index = index; //Set current hovered object
									
		//Set the cursor shape to move
		this.change_status("status_move");
		
		//this.object_manager.set(this.objects[index]);
		
		this.highlight_object(index);
	},
	
	move: function (index, offsetX, offsetY) {
		if (this.objects[index].type == "line") {
			/*
			var j;
			
			if (this.objects[index].properties.connector["head"] != null) {
				j = this.objects[index].properties.connector["head"];
				this.objects[j].properties.move(offsetX, offsetY);
			}
			if (this.objects[index].properties.connector["tail"] != null) {
				j = this.objects[index].properties.connector["tail"];
				this.objects[j].properties.move(offsetX, offsetY);
			}
			*/
			
			//this.objects[index].properties.move(offsetX, offsetY);			
		}
		else if (this.objects[index].type == "square") {
			var j;
			
			if (this.objects[index].properties.connector["tl"] != null) {
				j = this.objects[index].properties.connector["tl"];
				//this.objects[j].properties.move(offsetX, offsetY);
				if (this.objects[j].properties.connector["tail"] != null && this.objects[j].properties.connector["tail"] == index) {
					//this.objects[j].properties.ex += offsetX;
					//this.objects[j].properties.ey += offsetY;
				}
				
				if (this.objects[j].properties.connector["head"] != null && this.objects[j].properties.connector["head"] == index) {
					//this.objects[j].properties.sx += offsetX;
					//this.objects[j].properties.sy += offsetY;
				}
			}
			if (this.objects[index].properties.connector["t"] != null) {
				j = this.objects[index].properties.connector["t"];
				//this.objects[j].properties.move(offsetX, offsetY);
				if (this.objects[j].properties.connector["tail"] != null && this.objects[j].properties.connector["tail"] == index) {
					//this.objects[j].properties.ex += offsetX;
					//this.objects[j].properties.ey += offsetY;
				}
				
				if (this.objects[j].properties.connector["head"] != null && this.objects[j].properties.connector["head"] == index) {
					//this.objects[j].properties.sx += offsetX;
					//this.objects[j].properties.sy += offsetY;
				}
			}
			if (this.objects[index].properties.connector["tr"] != null) {
				j = this.objects[index].properties.connector["tr"];
				//this.objects[j].properties.move(offsetX, offsetY);
				if (this.objects[j].properties.connector["tail"] != null && this.objects[j].properties.connector["tail"] == index) {
					//this.objects[j].properties.ex += offsetX;
					//this.objects[j].properties.ey += offsetY;
				}
				
				if (this.objects[j].properties.connector["head"] != null && this.objects[j].properties.connector["head"] == index) {
					//this.objects[j].properties.sx += offsetX;
					//this.objects[j].properties.sy += offsetY;
				}
			}
			if (this.objects[index].properties.connector["r"] != null) {
				j = this.objects[index].properties.connector["r"];
				//this.objects[j].properties.move(offsetX, offsetY);
				if (this.objects[j].properties.connector["tail"] != null && this.objects[j].properties.connector["tail"] == index) {
					//this.objects[j].properties.ex += offsetX;
					//this.objects[j].properties.ey += offsetY;
				}
				
				if (this.objects[j].properties.connector["head"] != null && this.objects[j].properties.connector["head"] == index) {
					//this.objects[j].properties.sx += offsetX;
					//this.objects[j].properties.sy += offsetY;
				}
			}
			if (this.objects[index].properties.connector["br"] != null) {
				j = this.objects[index].properties.connector["br"];
				//this.objects[j].properties.move(offsetX, offsetY);
				if (this.objects[j].properties.connector["tail"] != null && this.objects[j].properties.connector["tail"] == index) {
					//this.objects[j].properties.ex += offsetX;
					//this.objects[j].properties.ey += offsetY;
				}
				
				if (this.objects[j].properties.connector["head"] != null && this.objects[j].properties.connector["head"] == index) {
					//this.objects[j].properties.sx += offsetX;
					//this.objects[j].properties.sy += offsetY;
				}
			}
			if (this.objects[index].properties.connector["b"] != null) {
				j = this.objects[index].properties.connector["b"];
				//this.objects[j].properties.move(offsetX, offsetY);
				if (this.objects[j].properties.connector["tail"] != null && this.objects[j].properties.connector["tail"] == index) {
					//this.objects[j].properties.ex += offsetX;
					//this.objects[j].properties.ey += offsetY;
				}
				
				if (this.objects[j].properties.connector["head"] != null && this.objects[j].properties.connector["head"] == index) {
					//this.objects[j].properties.sx += offsetX;
					//this.objects[j].properties.sy += offsetY;
				}
			}
			if (this.objects[index].properties.connector["bl"] != null) {
				j = this.objects[index].properties.connector["bl"];
				//this.objects[j].properties.move(offsetX, offsetY);
				if (this.objects[j].properties.connector["tail"] != null && this.objects[j].properties.connector["tail"] == index) {
					//this.objects[j].properties.ex += offsetX;
					//this.objects[j].properties.ey += offsetY;
				}
				
				if (this.objects[j].properties.connector["head"] != null && this.objects[j].properties.connector["head"] == index) {
					//this.objects[j].properties.sx += offsetX;
					//this.objects[j].properties.sy += offsetY;
				}
			}
			if (this.objects[index].properties.connector["l"] != null) {
				j = this.objects[index].properties.connector["l"];
				//this.objects[j].properties.move(offsetX, offsetY);
				if (this.objects[j].properties.connector["tail"] != null && this.objects[j].properties.connector["tail"] == index) {
					//this.objects[j].properties.ex += offsetX;
					//this.objects[j].properties.ey += offsetY;
				}
				
				if (this.objects[j].properties.connector["head"] != null && this.objects[j].properties.connector["head"] == index) {
					//this.objects[j].properties.sx += offsetX;
					//this.objects[j].properties.sy += offsetY;
				}
			}

		}
		
		$(this.collaboration).trigger("modify", [this.objects[index]]);
	},
	
	bring_forward: function (object) {
		if (!object) {
			object = this.objects[this.focus];
		}
		
		
		var index = -1;
		

		$(this.objects).each(function (i) {
			if (this.properties.timestamp == object.properties.timestamp) {
				index = i;
			}
		});
		
		if (this.objects.length - 1 > index && index >= 0) {
			
			var html = $(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).html();
			$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).remove();

			$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index+1].shape.timestamp).after("<div id='stencil_" + this.objects[index].shape.timestamp + "' style='position:absolute; display:none;'></div>");
			$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).html(html);
			
			this.objects[index].shape.move(this.objects[index].properties.sx, this.objects[index].properties.sy, this.objects[index].properties.ex, this.objects[index].properties.ey);
			this.objects[index].shape.show();
			
			this.objects = $(this.objects).move(index, index+1);
			this.focus++;
		}

	},
	
	send_backward: function (object) {
		if (!object) {
			object = this.objects[this.focus];
		}
		
				
		var index = -1;

		$(this.objects).each(function (i) {
			if (this.properties.timestamp == object.properties.timestamp)
				index = i;
		});
		
		if (this.objects.length > index && index > 0) {
			var html = $(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).html();
			$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).remove();

			$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index-1].shape.timestamp).before("<div id='stencil_" + this.objects[index].shape.timestamp + "' style='position:absolute; display:none;'></div>");
			$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).html(html);
			
			this.objects[index].shape.move(this.objects[index].properties.sx, this.objects[index].properties.sy, this.objects[index].properties.ex, this.objects[index].properties.ey);
			this.objects[index].shape.show();
			
			this.objects = $(this.objects).move(index, index-1);
			this.focus--;
		}

	},
	
	bring_to_front: function (object) {
		if (!object) {
			object = this.objects[this.focus];
		}
		
		
		var index = -1;

		$(this.objects).each(function (i) {
			if (this.properties.timestamp == object.properties.timestamp)
				index = i;
		});
		
		var html = $(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).html();
		$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).remove();

		$(this.target).find(".canvas").find(".shapes").append("<div id='stencil_" + this.objects[index].shape.timestamp + "' style='position:absolute; display:none;'></div>");
		$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).html(html);
		
		this.objects[index].shape.move(this.objects[index].properties.sx, this.objects[index].properties.sy, this.objects[index].properties.ex, this.objects[index].properties.ey);
		this.objects[index].shape.show();
		
		
		this.objects = $(this.objects).move(index, this.objects.length-1);
		this.focus = this.objects.length-1;
	},
	
	send_to_back: function (object) {
		if (!object) {
			object = this.objects[this.focus];
		}
		
		
		var index = -1;

		$(this.objects).each(function (i) {
			if (this.properties.timestamp == object.properties.timestamp)
				index = i;
		});
		
		var html = $(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).html();
		$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).remove();

		$(this.target).find(".canvas").find(".shapes").prepend("<div id='stencil_" + this.objects[index].shape.timestamp + "' style='position:absolute; display:none;'></div>");
		$(this.target).find(".canvas").find(".shapes").find("#stencil_" + this.objects[index].shape.timestamp).html(html);
		
		this.objects[index].shape.move(this.objects[index].properties.sx, this.objects[index].properties.sy, this.objects[index].properties.ex, this.objects[index].properties.ey);
		this.objects[index].shape.show();
		
		
		this.objects = $(this.objects).move(index, 0);
		this.focus = 0;
	},
	
	align_left: function () {
		var self = this;
		
		var point = 0;
		
		$(this.selected_index).each(function (i) {
			if (i == 0) {
				point = self.objects[this].properties.sx;
			}
			
			if (self.objects[this].properties.sx < self.objects[this].properties.ex) {
				if (self.objects[this].properties.sx < point) {
					point = self.objects[this].properties.sx;
				}
			}
			else {
				if (self.objects[this].properties.ex < point) {
					point = self.objects[this].properties.ex;
				}
			}

		});
		
		$(this.selected_index).each(function (i) {
			if (self.objects[this].properties.sx < self.objects[this].properties.ex) {
				self.objects[this].properties.ex -= (self.objects[this].properties.sx - point);
				self.objects[this].properties.sx = point;
			}
			else {
				self.objects[this].properties.sx -= (self.objects[this].properties.ex - point);
				self.objects[this].properties.ex = point;
			}
		});
		
		this.draw();
	},
	
	align_right: function () {
		var self = this;
		
		var point = 0;
		
		$(this.selected_index).each(function (i) {
			if (self.objects[this].properties.sx < self.objects[this].properties.ex) {
				if (self.objects[this].properties.ex > point) {
					point = self.objects[this].properties.ex;
				}
			}
			else {
				if (self.objects[this].properties.sx > point) {
					point = self.objects[this].properties.sx;
				}
			}
		});
		
		$(this.selected_index).each(function (i) {
			if (self.objects[this].properties.sx < self.objects[this].properties.ex) {
				self.objects[this].properties.sx += (point - self.objects[this].properties.ex);
				self.objects[this].properties.ex = point;
			}
			else {
				self.objects[this].properties.ex += (point - self.objects[this].properties.sx);
				self.objects[this].properties.sx = point;
			}
		});
		
		this.draw();
	},
	
	align_top: function () {
		var self = this;
		
		var point = 0;
		
		$(this.selected_index).each(function (i) {
			if (i == 0) {
				point = self.objects[this].properties.sy;
			}
			
			if (self.objects[this].properties.sy < self.objects[this].properties.ey) {
				if (self.objects[this].properties.sy < point) {
					point = self.objects[this].properties.sy;
				}
			}
			else {
				if (self.objects[this].properties.ey < point) {
					point = self.objects[this].properties.ey;
				}
			}

		});
		
		$(this.selected_index).each(function (i) {
			if (self.objects[this].properties.sy < self.objects[this].properties.ey) {
				self.objects[this].properties.ey -= (self.objects[this].properties.sy - point);
				self.objects[this].properties.sy = point;
			}
			else {
				self.objects[this].properties.sy -= (self.objects[this].properties.ey - point);
				self.objects[this].properties.ey = point;
			}
		});
		
		this.draw();
	},
	
	align_bottom: function () {
		var self = this;
		
		var point = 0;
		
		$(this.selected_index).each(function (i) {
			if (self.objects[this].properties.sy < self.objects[this].properties.ey) {
				if (self.objects[this].properties.ey > point) {
					point = self.objects[this].properties.ey;
				}
			}
			else {
				if (self.objects[this].properties.sy > point) {
					point = self.objects[this].properties.sy;
				}
			}
		});
		
		$(this.selected_index).each(function (i) {
			if (self.objects[this].properties.sy < self.objects[this].properties.ey) {
				self.objects[this].properties.sy += (point - self.objects[this].properties.ey);
				self.objects[this].properties.ey = point;
			}
			else {
				self.objects[this].properties.ey += (point - self.objects[this].properties.sy);
				self.objects[this].properties.sy = point;
			}
		});
		
		this.draw();
	},
	
	align_horizontally_center: function () {
		var self = this;
		
		var point = 0;

		point = (self.objects[this.selected_index[0]].properties.sx + self.objects[this.selected_index[0]].properties.ex) / 2;

		
		$(this.selected_index).each(function (i) {
			var halfVal = Math.abs(self.objects[this].properties.ex - self.objects[this].properties.sx)/2;
			
			if (self.objects[this].properties.sx < self.objects[this].properties.ex) {
				self.objects[this].properties.sx = point - halfVal;
				self.objects[this].properties.ex = point + halfVal;
			}
			else {
				self.objects[this].properties.ex = point - halfVal;
				self.objects[this].properties.sx = point + halfVal;
			}
		});
		
		this.draw();
	},
	
	align_vertically_center: function () {
		var self = this;
		
		var point = 0;
		
		point = (self.objects[this.selected_index[0]].properties.sy + self.objects[this.selected_index[0]].properties.ey) / 2;

		
		$(this.selected_index).each(function (i) {
			var halfVal = Math.abs(self.objects[this].properties.ey - self.objects[this].properties.sy)/2;
			
			if (self.objects[this].properties.sy < self.objects[this].properties.ey) {
				self.objects[this].properties.sy = point - halfVal;
				self.objects[this].properties.ey = point + halfVal;
			}
			else {
				self.objects[this].properties.ey = point - halfVal;
				self.objects[this].properties.sy = point + halfVal;
			}
		});
		
		this.draw();
	},
	
	_delete: function () { 
		var self = this;

		$(this.selected_index).each(function (i) {
			$(self.collaboration).trigger("remove", [self.objects[this].properties.id]);
			
			self.objects[this].remove();
		});
	},
	
	cut: function () { 
		var self = this;
		
		delete this.copied_objects;
		this.copied_objects = [];
		
		$(this.selected_index).each(function (i) {
			self.copied_objects.push(self.clone(self.objects[this]));
			
			self.objects[this].remove();
		});
	},
	
	copy: function () { 
		var self = this;
		
		delete this.copied_objects;
		this.copied_objects = [];
		
		$(this.selected_index).each(function (i) {
			self.copied_objects.push(self.clone(self.objects[this]));
		});
	},
	
	paste: function () { 
		var self = this;
		
		var length = self.objects.length;

		
		$(this.copied_objects).each(function (i) {
			self.is_drawing = false;
			
			var dummyObject = this;
			self.add(this.type, this.shape_name, null, null, function () {
				
				self.set_shape_properties(self.objects[length+i], dummyObject);
								
				//self.objects[i].shape.move(dummyObject.properties.sx, dummyObject.properties.sy, dummyObject.properties.ex, dummyObject.properties.ey);
				self.objects[length+i].shape.show();
		
				self.objects[length+i].shape.set_shape();			
					
				self.draw();
			});
						
			self.set_properties(self.objects[length+i], this);
			
			self.objects[length+i].properties.sx += 10;
			self.objects[length+i].properties.sy += 10;
			self.objects[length+i].properties.ex += 10;
			self.objects[length+i].properties.ey += 10;
		});

		this.draw();
		
		delete this.copied_objects;
	},
	
	load: function (objects) {
		var self = this;
		
		//for reloading phase
		delete this.objects;
		this.objects = [];
		
		$(this.target).find(".canvas").find(".shapes").empty();
		

		$(objects).each(function (i) {
			self.is_drawing = false;
			
			var dummyObject = this;
			self.add(this.type, this.shape_name, null, null, function () {
		
				self.set_shape_properties(self.objects[i], dummyObject);
								
				//self.objects[i].shape.move(dummyObject.properties.sx, dummyObject.properties.sy, dummyObject.properties.ex, dummyObject.properties.ey);
				self.objects[i].shape.show();
				
				self.objects[i].shape.set_shape();
				
				self.draw();
			});
						
			self.set_properties(self.objects[i], this);
		});

		this.draw();
	},

	clone: function (object) { 
		var objectClone = {}; 

		
		for (var property in object) {

			
			if (typeof object[property] == 'object') {
				var objectInner = object[property];
				
				var objectCloneInner = {}; 
				for (var propertyInner in objectInner) {
					
					if (typeof objectInner[propertyInner] == 'object') {
						var objectInnerInner = objectInner[propertyInner];
				
						var objectCloneInnerInner = {}; 
						for (var propertyInnerInner in objectInnerInner) {
							
							if (typeof objectInnerInner[propertyInnerInner] == 'object') {
								//objectClone[property] = this.clone(objectInner[property]); 
							}
							else {
								objectCloneInnerInner[propertyInnerInner] = objectInnerInner[propertyInnerInner]; 
							}
						}
						
						objectCloneInner[propertyInner] = objectCloneInnerInner;
					}
					else {
						objectCloneInner[propertyInner] = objectInner[propertyInner]; 
					}
				}
				
				
				objectClone[property] = objectCloneInner;

			}
			else {
				objectClone[property] = object[property]; 
			}
		}
				
		return objectClone; 		
	},
	
	undo: function () { 
		//this.undo_manager.undo();
	},
	
	redo: function () { 
		//this.undo_manager.redo();
	},
	
	remove: function (index) { 
		var self = this;
		
		var properties = {};
		properties.sx = self.objects[index].properties.sx;
		properties.sy = self.objects[index].properties.sy;
		properties.ex = self.objects[index].properties.ex;
		properties.ey = self.objects[index].properties.ey;
		
		/*		
		self.undo_manager.register(
			self, self.add, [self.objects[index].type, self.objects[index].shape_name, self.objects[index].option, properties], 'Create Item',
			self, self.remove, [self.objects.length-1], 'Remove Item'
		);
		*/
	
		this.objects[index].remove();
		
		delete this.objects[index];
		
		this.draw();
		

	},

	set_properties: function (target, source) {
			
		target.type = source.type;
		target.shape_name = source.shape_name;
		target.data_uuid = source.data_uuid;
		
		target.properties.kind = source.properties.kind;
		target.properties.focus = source.properties.focus;
		target.properties.is_dragging = source.properties.is_dragging;
		target.properties.is_drawing_finished = source.properties.is_drawing_finished;
		target.properties.sx = parseInt(source.properties.sx);
		target.properties.sy = parseInt(source.properties.sy);
		target.properties.ex = parseInt(source.properties.ex);
		target.properties.ey = parseInt(source.properties.ey);
		target.properties.previous_x = parseInt(source.properties.previous_x);
		target.properties.previous_y = parseInt(source.properties.previous_y);
		target.properties.id = source.properties.id;
		target.properties.name = source.properties.name;		
		target.properties.x = parseInt(source.properties.x);
		target.properties.y = parseInt(source.properties.y);
		target.properties.width = parseInt(source.properties.width);
		target.properties.height = parseInt(source.properties.height);
		target.properties.connector = source.properties.connector;
		
		if (target.type == "line") {
			target.properties.thickness = source.properties.thickness;
			target.properties.color = source.properties.color;
			
			if (source.properties.inner_node) {
				target.properties.inner_node = source.properties.inner_node;
			}
		}
	},
	
	set_shape_properties: function (target, source) {
		
		if (target.type == "square") {
			//target.shape.properties = null;
			
			$.each(source.shape.properties, function (key, value) {
				eval('target.shape.properties.' + key + ' = value;');

				
				/*
				try {
					eval('target.shape.properties.' + key + ' = value;');
				}
				catch (e) {
				}	
				*/		
			});
		}
		
		//target.properties.attribute_list = source.properties.attribute_list;
		
		target.shape.set_shape();
	},
	
	set_properties2: function (selected_index, properties) {
		var self = this;
	
		$(selected_index).each(function (i) {
			self.objects[this].properties.sx = properties[this].sx;
			self.objects[this].properties.sy = properties[this].sy;
			self.objects[this].properties.ex = properties[this].ex;
			self.objects[this].properties.ey = properties[this].ey;
		});
			
		this.draw();
	}
};