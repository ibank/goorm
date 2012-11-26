/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.design.canvas.toolbar = function () {
	this.canvas = null;
	this.target = null; 
	this.is_collaboration_on = false; 
	this.is_preview_on = true;
	this.is_ruler_on = true; 	
	this.is_grid_on = true; 	
	this.zoom_level = 100;
};

org.goorm.core.design.canvas.toolbar.prototype = {
	init: function(canvas) {
		var self = this;
		
		this.canvas = canvas;
		this.target = canvas.target;
		
		$(this.target).parent().prepend("<div class='design_toolbar_container'></div>");
		$(this.target).parent().append("<div class='design.preview_container'></div>");
		//$(this.target).append("<div class='design_status_container'></div>");
		
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/grid.png' action='gridOnOff' class='toolbar_button toolbar_buttonPressed' border='0' />"); 
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/grid-snap.png' action='snap_to_grid' class='toolbar_button' border='0' />"); 
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/resize.png' action='resize' class='toolbar_button' border='0' />"); 
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/printer.png' class='toolbar_button' border='0' />"); 
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/ruler_onoff.png' action='rulerOnOff' class='toolbar_button toolbar_buttonPressed' border='0' />"); 
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/preview.png' action='previewOnOff' class='toolbar_button toolbar_buttonPressed' border='0' />"); 
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/zoom-fit.png' action='zoomFit' class='toolbar_button' border='0' />"); 
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/zoom-in.png' action='zoomIn' class='toolbar_button' border='0' />"); 
		$(this.target).parent().find(".design_toolbar_container").append("<img src='images/org.goorm.core.design/zoom-out.png' action='zoomOut' class='toolbar_button' border='0' />"); 
		
		$(this.target).parent().find(".design_toolbar_container").append("<div style='float:right; width:150px; text-align:right; padding-top:2px;'><select class='zoom_levelSelector'><option value='25'>25%</option><option value='50'>50%</option><option value='75'>75%</option><option value='100' selected=true>100%</option><option value='150'>150%</option><option value='200'>200%</option><option value='400'>400%</option><option value='800'>800%</option><option value='1600'>1600%</option></select></div>"); 
		
		$(this.target).parent().find(".zoom_levelSelector").change(function () {
			self.zoom($(this).val());
		});		

		$(this.target).parent().find(".design_toolbar_container").find("img[action='gridOnOff']").click(function () {
			self.toggle_grid();
		});

		$(this.target).parent().find(".design_toolbar_container").find("img[action='snap_to_grid']").click(function () {
			self.toggle_snap_to_grid();
		});
		
		$(this.target).parent().find(".design_toolbar_container").find("img[action='resize']").click(function () {			
			self.canvas.dialog.panel.show();
		});
		
//		$(this.target).find(".design_toolbar_container").find("img[action='collaborationOnOff']").click(function () {
//			if (self.is_collaboration_on) {
//				self.is_collaboration_on = false;
//				
//				//TO-DO: Change to event-based
//				self.canvas.set_collaboration_off();
//				$(self.target).find(".design_toolbar_container").find("img[action='collaborationOnOff']").removeClass("toolbar_buttonPressed");
//			}
//			else {
//				self.is_collaboration_on = true;
//				self.canvas.set_collaboration_on();
//				$(self.target).find(".design_toolbar_container").find("img[action='collaborationOnOff']").addClass("toolbar_buttonPressed");
//			}
//		});
		
		$(this.target).parent().find(".design_toolbar_container").find("img[action='previewOnOff']").click(function () {
			self.toggle_preview();
		});
		
		$(this.target).parent().find(".design_toolbar_container").find("img[action='rulerOnOff']").click(function () {
			self.toggle_ruler();
		});
		
		$(this.target).parent().find(".design_toolbar_container").find("img[action='zoomFit']").click(function () {
			self.zoomFit();
		});
		
		$(this.target).parent().find(".design_toolbar_container").find("img[action='zoomIn']").click(function () {
			self.zoomIn();
		});
		
		$(this.target).parent().find(".design_toolbar_container").find("img[action='zoomOut']").click(function () {
			self.zoomOut();
		});
		
		
		//$(this.target).find(".design_status_container").append("<img src='images/org.goorm.core.design/line.png' class='lineDrawing toolbar_button' border='0' />");
		//$(this.target).find(".design_status_container").append("<img src='images/org.goorm.core.design/shape.png' class='squareDrawing toolbar_button' border='0' />"); 
		
	},
	
	zoom: function(value) {
		if (0< value && value < 1600) {
			this.zoom_level = value;
		}
		
		$(this.target).find(".space").css("zoom", this.zoom_level + "%");	
		$(this.target).find(".skin").css("zoom", this.zoom_level + "%");	
		$(this.target).find(".canvas").css("zoom", this.zoom_level + "%");	
	},
	
	zoomFit: function() {
		this.zoom_level = 100;
		
		$(this.target).find(".space").css("zoom", "100%");	
		$(this.target).find(".skin").css("zoom", "100%");	
		$(this.target).find(".canvas").css("zoom", "100%");	
	},
	
	zoomIn: function() {
		if (this.zoom_level < 1600) {
			this.zoom_level += 10;
		}
		
		$(this.target).find(".space").css("zoom", this.zoom_level + "%");	
		$(this.target).find(".skin").css("zoom", this.zoom_level + "%");	
		$(this.target).find(".canvas").css("zoom", this.zoom_level + "%");	
	},	

	zoomOut: function() {
		if (this.zoom_level >= 20) {
			this.zoom_level -= 10;
		}
		
		$(this.target).find(".space").css("zoom", this.zoom_level + "%");	
		$(this.target).find(".skin").css("zoom", this.zoom_level + "%");	
		$(this.target).find(".canvas").css("zoom", this.zoom_level + "%");	
	},		
	
	toggle_preview: function() {
		var self = this;
		if (self.is_preview_on) {
			self.is_preview_on = false;
			$(self.target).parent().find(".design_toolbar_container").find("img[action='previewOnOff']").removeClass("toolbar_buttonPressed");
			$(self.target).parent().find(".design.preview_container").hide();
		}
		else {
			self.is_preview_on = true;
			$(self.target).parent().find(".design_toolbar_container").find("img[action='previewOnOff']").addClass("toolbar_buttonPressed");
			$(self.target).parent().find(".design.preview_container").show();
		}
	},
	
	toggle_ruler: function() {
		var self = this;
		if (self.is_ruler_on) {
			self.is_ruler_on = false;
			$(self.target).parent().find(".design_toolbar_container").find("img[action='rulerOnOff']").removeClass("toolbar_buttonPressed");
			self.canvas.parent.ruler.show(false);
		}
		else {
			self.is_ruler_on = true;
			$(self.target).parent().find(".design_toolbar_container").find("img[action='rulerOnOff']").addClass("toolbar_buttonPressed");
			self.canvas.parent.ruler.show(true);
		}
		
		self.canvas.parent.resize_all();
	},
	
	toggle_snap_to_grid: function() {
		var self = this;
		if (self.canvas.snap_to_grid) {
			self.canvas.snap_to_grid = false;
			$(self.target).parent().find(".design_toolbar_container").find("img[action='snap_to_grid']").removeClass("toolbar_buttonPressed");
		}
		else {
			self.canvas.snap_to_grid = true;
			$(self.target).parent().find(".design_toolbar_container").find("img[action='snap_to_grid']").addClass("toolbar_buttonPressed");
		}
	},
	
	toggle_grid: function() {
		var self = this;
		if (self.is_grid_on) {
			self.is_grid_on = false;
			$(self.target).find(".grid").hide();
			$(self.target).find(".design_toolbar_container").find("img[action='gridOnOff']").removeClass("toolbar_buttonPressed");
		}
		else {
			self.is_grid_on = true;
			$(self.target).find(".grid").show();
			$(self.target).find(".design_toolbar_container").find("img[action='gridOnOff']").addClass("toolbar_buttonPressed");
		}
	},
	
	change_grid_unit: function(size) {
		var self = this;
		$(self.target).find(".grid").css("background-image","url(images/org.goorm.core.design/grid_"+size+"px.png)");
	},
	
	change_grid_opacity: function(opacity) {
		var self = this;
		$(self.target).find(".grid").css("-moz-opacity",opacity);
		$(self.target).find(".grid").css("filter","alpha(opacity="+(opacity*100)+")");
		$(self.target).find(".grid").css("opacity",opacity);
	},
	
	change_ruler_unit: function(unit) {
		var self = this;
		$(self.target).parent().find(".ruler_x").css("background-image","url(images/org.goorm.core.design/ruler_"+unit+"_x.png)");
		$(self.target).parent().find(".ruler_y").css("background-image","url(images/org.goorm.core.design/ruler_"+unit+"_y.png)");
	}
};