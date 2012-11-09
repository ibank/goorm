/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.project.list = function () {
	this.location = null;
	this.types = null;
	this.list = null;
	this.information = null;
	
	this.path = null;
	this.name = null;
	this.type = null;
};

org.goorm.core.project.list.prototype = {
	init: function (context) {
		var self = this;
		
		self.location = context + "_location";
		self.types = context + "_types";
		self.list = context + "_list";
		self.information = context + "_information";
		
		self.path = context + "_path";
		self.name = context + "_name";
		self.type = context + "_type";
		
		$(self.location).val("");
		$(self.list).empty();
		$(self.information).empty();
//		$("div[id='project.open']").find("#project_open_dialog_left").scrollTop(0);

		
		self.add_project_list();
		self.add_project_item();
	},
	
	get_data: function() {
		var self = this;
	
		var data = {};
		data.path = $(self.path).val();
		data.name = $(self.name).val();
		data.type = $(self.type).val();
		
		return data;	
	},

	
	add_project_list: function () {
		var self = this;

		$.getJSON("project/get_list", null, function (data) {
			$(data).each(function (i) {		
			//for(var project_idx=0; project_idx<sorting_data.length; project_idx++) {
				var icon_str = "";
				icon_str += "<div id='selector_" + this.contents.name + "' value='" + i + "' class='selector_project' type='" + this.contents.type + "'>";
				icon_str += "<div style='padding-left:65px; padding-top:20px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis'>";
				icon_str += this.contents.name;
				icon_str += "</div>";
				icon_str += "</div>";

				$(self.list).append(icon_str);
			});
			
			$(self.list+" .selector_project").click(function() {
				$(self.list+" .selector_project").removeClass("selected_button");
				$(this).addClass("selected_button");
				
				var idx = $(this).attr("value");
				
				$(self.location).val("/" + data[idx].name);
				$(self.path).val(data[idx].name);
				$(self.name).val(data[idx].contents.name);
				$(self.type).val(data[idx].contents.type);

				$(self.information).empty();
				$(self.information).append("<b>Project Type : </b>");
				$(self.information).append(data[idx].contents.type+"<br/>");
				$(self.information).append("<b>Project Detail : </b>");
				$(self.information).append(data[idx].contents.detailedtype+"<br/>");
				$(self.information).append("<b>Project Author : </b>");
				$(self.information).append(data[idx].contents.author+"<br/>");
				$(self.information).append("<b>Project Name : </b>");
				$(self.information).append(data[idx].contents.name+"<br/>");
				$(self.information).append("<b>Project Description : </b>");
				$(self.information).append(data[idx].contents.about+"<br/>");
				$(self.information).append("<b>Project Date : </b>");
				$(self.information).append(data[idx].contents.date+"<br/>");
			});
		});
	},
	
	add_project_item: function() {
		var self = this;

		$(self.types+" option:eq(0)").attr("selected", "selected");
		
		$(self.types).change(function() {
			var type = $(self.types+" option:selected").val();
			if(type=="All") {
				$(self.list+" .selector_project").each(function() {
					$(this).css("display", "block");
				});
			}
			else {
				$(self.list+" .selector_project").each(function() {
					if($(this).attr("type")==type) {
						$(this).css("display", "block");
					}
					else {
						$(this).css("display", "none");
					}
				});
			}
		});
	}
};