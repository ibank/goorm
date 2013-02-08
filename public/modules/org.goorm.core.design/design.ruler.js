/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.design.ruler = function () {
	this.target = null;
	this.value = null;
	this.unit = null;
	this.context_menu = new Array();
};

org.goorm.core.design.ruler.prototype = {
	init: function (target, value, unit, title) {
		this.target = target;
		this.title = title;
		
		$(target).append("<div class='ruler'></div>");
		$(target).append("<div class='ruler_x'></div>");
		$(target).append("<div class='ruler_y'></div>");

		
		this.set_unit(value, unit);
		
		this.context_menu[0] = new org.goorm.core.menu.context();
		this.context_menu[0].init("configs/menu/org.goorm.core.design/design.ruler.html", "design.ruler", $(target).find(".ruler"), this.title);
		
		this.context_menu[1] = new org.goorm.core.menu.context();
		this.context_menu[1].init("configs/menu/org.goorm.core.design/design.ruler_x.html", "design.ruler_x", $(target).find(".ruler_x"), this.title);		
		
		this.context_menu[2] = new org.goorm.core.menu.context();
		this.context_menu[2].init("configs/menu/org.goorm.core.design/design.ruler_y.html", "design.ruler_y", $(target).find(".ruler_y"), this.title);		
	},

	set_unit: function (value, unit) {
		this.value = value;
		this.unit = unit;
	},

	show: function (value) {
		var self = this;
		
		if(value) {
			$(this.target).find(".ruler").show();
			$(this.target).find(".ruler_x").show();
			$(this.target).find(".ruler_y").show();
			$(this.target).find(".canvas_container").css("left", "14px");
			$(this.target).find(".canvas_container").css("top", "14px");
			$(this.target).find(".canvas_container").width($(self.target).find(".canvas_container").width()-14);
			$(this.target).find(".canvas_container").height($(self.target).find(".canvas_container").height()-14);
		}
		else {
			$(this.target).find(".ruler").hide();
			$(this.target).find(".ruler_x").hide();
			$(this.target).find(".ruler_y").hide();
			$(this.target).find(".canvas_container").css("left", "0");
			$(this.target).find(".canvas_container").css("top", "0");
			$(this.target).find(".canvas_container").width($(self.target).find(".canvas_container").width()+14);
			$(this.target).find(".canvas_container").height($(self.target).find(".canvas_container").height()+14);
		}
	}
};