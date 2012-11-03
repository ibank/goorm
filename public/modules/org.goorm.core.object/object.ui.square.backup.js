/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.object.ui.square = function () {
	this.target = null;
	this.timestamp = null;
	this.container = null;
	this.context_menu = null;
	this.id = null;
	this.name = null;	
	this.x = null;
	this.y = null;
	this.sx = null;
	this.sy = null;
	this.ex = null;
	this.ey = null;	
	this.width = null;
	this.height = null;
	this.connector = null;
	this.attribute_list = new Array("id", "name", "x", "y", "width", "height");
};

org.goorm.core.object.ui.square.prototype = {

	init: function (target) {
		var self = this;

		//Set 
		this.target = target; //target container for adding this object
		this.timestamp = new Date().getTime(); //For distinguishing objects, using the timestamp
		this.container = "objectContainer_" + this.timestamp; //object presentation container
		
		this.connector = [];
		this.connector['n'] = null;
		this.connector['e'] = null;
		this.connector['s'] = null;
		this.connector['w'] = null;
		this.connector['ne'] = null;
		this.connector['se'] = null;
		this.connector['nw'] = null;
		this.connector['sw'] = null;
		
		
		//adding html container and set default shapes
		$(target).append("<div class='" + this.container + "'></div>");
		$(target).find("." + this.container).css("position", "absolute");
		$(target).find("." + this.container).css("border", "1px solid #ccc");
		$(target).find("." + this.container).width(100);
		$(target).find("." + this.container).height(100);
		$(target).find("." + this.container).css("left", 0);
		$(target).find("." + this.container).css("top", 0);
		
		//Set Properties		
		this.id = "square";
		this.name = "square_" + this.timestamp;	
		this.sx = $(target).find("." + this.container).position().left;
		this.sy = $(target).find("." + this.container).position().top;
		this.x = this.sx;
		this.y = this.sy;
		this.width = $(target).find("." + this.container).width();
		this.height = $(target).find("." + this.container).height();
		this.ex = this.sx + this.width;
		this.ey = this.sy + this.height;		
		
		//Set context menu
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init("configs/menu/org.goorm.core.object/object.ui.html", "object.ui", $(target).find("." + this.container), this.timestamp);
		
		//Set Draggable
		$(target).find("." + this.container).draggable({
			containment: $(self.target).find(".canvas"),
			scroll: false,
			//grid: [10, 10],
			stop: function (event, ui) {
				self.sx = $(self.target).find("." + self.container).position().left;
				self.sy = $(self.target).find("." + self.container).position().top;
				self.ex = self.sx + self.width;
				self.ey = self.sy + self.height;
				self.x = self.sx;
				self.y = self.sy;				
			}
		});
		
		//Set Resizable
		$(target).find("." + this.container).resizable({
			maxHeight: $(self.target).height(),
			maxWidth: $(self.target).width(),
			minHeight: 10,
			minWidth: 10,
			handles: 'n,e,s,w,ne,se,nw,sw',
			knobHandles: true,
			stop: function (event, ui) {
				self.width = $(self.target).find("." + self.container).width();
				self.height = $(self.target).find("." + self.container).height();
				self.ex = self.sx + self.width;
				self.ey = self.sy + self.height;
			}
		});
		
		//Resize handle status is hidden in default
		$(target).find("." + self.container).find(".ui-resizable-handle").hide();
		
		//Hover event in resize handle toggle for showing
		$(target).find("." + this.container).hover(function () {
			$(target).find("." + self.container).find(".ui-resizable-handle").show();
			$(target).find("." + self.container).css("cursor", "move");
		}, function () {
			$(target).find("." + self.container).find(".ui-resizable-handle").hide();
			$(target).find("." + self.container).css("cursor", "default");
		});	
		
		return this;
	},
	
	select: function () {
		$(this.target).find("." + this.container).find(".ui-resizable-handle").show();
	},
	
	deselect: function () {
		$(this.target).find("." + this.container).find(".ui-resizable-handle").hide();
	},
	
	remove: function () {
		
	},
	
	apply: function () {
		$(this.target).find("." + this.container).width(this.width);
		$(this.target).find("." + this.container).height(this.height);
		$(this.target).find("." + this.container).css("left", parseInt(this.x));
		$(this.target).find("." + this.container).css("top", parseInt(this.y));
	}
};