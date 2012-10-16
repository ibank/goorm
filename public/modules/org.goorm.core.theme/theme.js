/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.theme = function () {
	this.theme_data = null;
	this.current_theme = null;
	this.current_theme_data = null;
	this.details_dialog = null;
	this.apply_theme_button = null;
	this.details_button = null;
	
};

org.goorm.core.theme.prototype = {

	init: function () {
		var self = this;
		
		self.apply_theme_button = new YAHOO.widget.Button({  
									label:"Theme Apply",  
									id:"theme_apply_button",  
									container:"buttons_for_theme" }); 

		self.details_button = new YAHOO.widget.Button({  
									label:"Details",  
									id:"details_button",  
									container:"wrap_selectbox" }); 

		function on_theme_apply_button_click(p_oEvent) { 
			self.apply_theme();
		} 
		function on_details_button_click(p_oEvent) { 
			self.details_dialog.show();
		} 
		
		self.apply_theme_button.on("click", on_theme_apply_button_click); 
		self.details_button.on("click", on_details_button_click); 

		$.get("theme/get_list", "", function (data) {
			self.theme_data = data
			self.make_theme_selectbox();
		});

		$("#theme_selectbox").change(function() {
			if($(this).val() == -1){
				self.create_new_theme();
			}
			else{
				self.on_theme_selectbox_change($(this).val());
				self.get_theme_contents($(this).val());
			}
		});
	},

	//load theme select box 
	make_theme_selectbox: function() {
		var self = this;
		
		$("#theme_selectbox").empty();

		var max_num = parseInt($("#theme_selectbox").width()/8);

		for(var theme_idx=0; theme_idx<self.theme_data.length; theme_idx++) {
			var temp_name = self.theme_data[theme_idx].contents.title;

			if(temp_name.length > max_num) {
				temp_name = temp_name.substring(0, max_num-1);
				temp_name += " …";
			}

			if (theme_idx == core.preference["preference.theme.current_theme"]) {
				// need to edit 
				$("#theme_selectbox").append("<option value='"+theme_idx+"' selected>"+temp_name+"</option>");
				self.current_theme = self.theme_data[theme_idx];
				self.on_theme_selectbox_change(theme_idx);

				var css_node = $("link[kind='theme']");
				if(css_node.length==0){
					$("head").append("<link>");
					css_node = $("head").children(":last");
					css_node.attr({
						rel:  "stylesheet",
						type: "text/css",
						href: "/configs/themes/"+self.current_theme.name + "/" + self.current_theme.name+".css",
						kind: "theme"
					});
				}
				else{
					css_node.attr({
						href: "/configs/themes/"+self.current_theme.name + "/" + self.current_theme.name+".css",
						kind: "theme"
					});
				}
			}
			else {
				$("#theme_selectbox").append("<option value='"+theme_idx+"'>"+temp_name+"</option>");
			}
		}
		
/* 		$("#theme_selectbox").append("<option value='-1'>Create New Theme ...</option>"); */

		self.details_dialog = new org.goorm.core.theme.details();
		self.details_dialog.init(self);
	},

	//select box change
	on_theme_selectbox_change: function (theme_idx) {
		var self = this;

		self.current_theme = self.theme_data[theme_idx];

		var temp_description = self.current_theme.contents.description;
		var temp_date = self.current_theme.contents.date;
		var temp_author = self.current_theme.contents.author;
		
		var max_num = parseInt(($(".theme_info").width()-80)/8);
		
		if(temp_description.length > max_num) {
			temp_description = temp_description.substring(0, max_num-1);
			temp_description += " …";
		}
		
		if(temp_author.length > max_num) {
			temp_author = temp_author.substring(0, max_num-1);
			temp_author += " …";
		}
		
		$(".theme_info").empty();
		$(".theme_info").append("<div>Description : "+temp_description+"</div>");
		$(".theme_info").append("<div>Version : "+temp_date+"</div>");
		$(".theme_info").append("<div>Author : "+temp_author+"</div>");

		if(self.current_theme.contents.modifiable=="true"){
			$("#"+self.details_button._configs.id.value).show();
		}
		else{
			$("#"+self.details_button._configs.id.value).hide();
		}

		self.get_theme_contents(theme_idx);
	},
	get_theme_contents: function(theme_idx) { 
		var self = this;
		var path = "/public/configs/themes/"+self.current_theme.name+"/"+self.current_theme.name+".json";

		$.ajax({
			url: "theme/get_contents",			
			type: "GET",
			data: { path: path },
			success: function(data) {
				self.current_theme_data = JSON.parse(data);
			}
		});
	},	
	apply_theme: function() { 
		var self = this;
		var url = "theme/put_contents";
		var path = self.current_theme.name + "/" + self.current_theme.name+".css";
		var filedata = "";
		
		for(var element in self.current_theme_data){
			filedata += self.current_theme_data[element].selector + " {\n";
			for(var property in self.current_theme_data[element].style){
				if($.isArray(self.current_theme_data[element].style[property])){
					for(var style_cnt=0; style_cnt<self.current_theme_data[element].style[property].length; style_cnt++){
						filedata += "\t" + property + ":" + self.current_theme_data[element].style[property][style_cnt] + ";\n";
					}
				}
				else{
					filedata += "\t" + property + ":" + self.current_theme_data[element].style[property] + ";\n";					
				}
			}
			filedata += "}\n";
		}

		$.ajax({
			url: url,			
			type: "GET",
			data: { path: path, data: filedata },
			success: function(data) {
				//apply theme
				var css_node = $("link[kind='theme']");
				if(css_node.length==0){
					$("head").append("<link>");
					css_node = $("head").children(":last");
					css_node.attr({
						rel:  "stylesheet",
						type: "text/css",
						href: "/configs/themes/"+self.current_theme.name + "/" + self.current_theme.name+".css",
						kind: "theme"
					});
				}
				else{
					css_node.attr({
						href: "/configs/themes/"+self.current_theme.name + "/" + self.current_theme.name+".css",
						kind: "theme"
					});
				}
				m.s("Save complete! (" + self.filename + ")", "org.goorm.core.theme");
			}
		});

		path = self.current_theme.name + "/" + self.current_theme.name+".json";
		filedata = JSON.stringify(self.current_theme_data,null,'\t');

		$.ajax({
			url: url,			
			type: "GET",
			data: { path: path, data: filedata },
			success: function(data) {
				//apply theme
				m.s("Save complete! (" + self.filename + ")", "org.goorm.core.theme");
			}
		});

	},
	//create new theme
	create_new_theme: function() {
		console.log("create new theme");
		$(".theme_info").empty();
	}
};