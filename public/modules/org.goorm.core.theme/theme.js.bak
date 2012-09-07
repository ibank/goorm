/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.theme = function () {
	this.button_theme_selector = null;
	this.button_theme_selector_function = null;
	this.button_theme_menu_renderer = null;
/*
	this.buttonNewTheme = null;
	this.buttonNewThemeFunction = null;
*/
	this.button_apply_theme = null;
	this.button_apply_theme_function = null;	

	this.color_picker = null;
	this.button_color_picker_ok = null;
	this.button_color_picker_ok_function = null;
	this.button_color_picker_cancel = null;
	this.button_color_picker_cancel_function = null;
	this.color_to_rgb = null;	
	
	this.color_box_click_function = null;
	this.area_box_click_function = null;
	this.css_box_click_function = null;
	this.input_box_click_function = null;
	
	this.apply_theme = null;
		
	this.part_array = null;

/* 	this.dialogNewTheme = null; */
	this.dialog_new_area = null;
	this.dialog_new_css = null;
	
	this.current_theme = null;
	
	this.theme_title = null;
	this.theme_dir = null;
	this.theme_version = null;
	this.theme_author = null;
	this.theme_author_mail = null;
};

org.goorm.core.theme.prototype = {

	init: function () {
		var self = this;
		
		self.set_on();
		
		self.current_theme = core.preference["preference.theme.current_theme"];
		self.button_theme_selector = new YAHOO.widget.Button("button_theme_selector", {  
			type: "menu",  
			menu: "button_theme_selectorMenu" 
		}); 

/* 		self.buttonNewTheme =  new YAHOO.widget.Button("buttonNewTheme", { onclick: { fn: self.buttonNewThemeFunction } }); */
		self.button_apply_theme = new YAHOO.widget.Button("button_apply_theme", { onclick: { fn: self.button_apply_theme_function } });

		this.color_picker = new YAHOO.widget.ColorPicker("yui-picker", {
			showhsvcontrols: true,
			showhexcontrols: true,
			images: {
				PICKER_THUMB: "images/org.goorm.core.theme/picker_thumb.png",
				HUE_THUMB: "images/org.goorm.core.theme/hue_thumb.png"
			}
		});

		this.button_color_picker_ok =  new YAHOO.widget.Button("button_color_picker_ok", { onclick: { fn: self.button_color_picker_ok_function } });
		this.button_color_picker_cancel =  new YAHOO.widget.Button("button_color_picker_cancel", { onclick: { fn: self.button_color_picker_cancel_function } });

		self.load();

		
/* 		this.dialogNewTheme = new org.goorm.core.theme._new(); */
/* 		this.dialogNewTheme.init(this); */

		this.dialog_new_area = new org.goorm.core.theme.area();
		this.dialog_new_area.init(this);

		this.dialog_new_css = new org.goorm.core.theme._css();
		this.dialog_new_css.init(this);
		
		if (localStorage.getItem("preference.theme.current_theme")==null) {
			self.current_theme = core.server_theme;
			self.button_apply_theme_function();
		}
	},
	
	set_on: function() {
		var self = this;	
		this.apply_theme = function(){
			for(var j = 0; j < self.part_array.length; j++ ){
				i=1;
				$("#css_box"+self.part_array[j]).children().each(function(){
					if($(this).attr("class").indexOf("add_new_css")>-1) {}
					else {
						$($("#"+$(this).attr('id')+" .id_class_name").attr("value")).css($("#"+$(this).attr('id')+" .property").text(),$("#"+$(this).attr('id')+" .css_value").attr("value"));
						i++;
					}
				});
			}
		};
		
		this.button_theme_selector_function = function (p_sType, p_aArgs) {
			var oEvent = p_aArgs[0],	//	DOM event
				oMenuItem = p_aArgs[1];	//	MenuItem instance that was the target of the event
				
			self.current_theme=oMenuItem.value;

			if (oMenuItem) {
				$("#button_theme_selector").html($(oMenuItem.element).text());
			
				var dir = "configs/themes/"+oMenuItem.value+"/"+oMenuItem.value+".json";

				//clear area_box 
				$('.area_box').children().remove();
				$(".css_box").remove();
				
				self.load_json(dir);
			}
		};
/*		
		this.buttonNewThemeFunction = function () {
			self.dialogNewTheme.show();
		};
*/
		this.button_apply_theme_function = function () {
			$("input[name='preference\.theme\.current_theme']").attr("value", self.current_theme);

			var i=1;
			
			var url = "module/org.goorm.core.theme/theme.save.php";
			var data = "{\n";
			var path = "configs/themes/" + self.current_theme;

			var css_url = "module/org.goorm.core.theme/theme.saveCss.php";
			var css_data = "";

			var previous_area_name = "0";
			data=data+'\t"title":"'+self.theme_title+'",\n\t"dirName":"'+self.theme_dir+'",\n\t"version":"'+self.theme_version+'",\n\t"author":"'+self.theme_author+'",\n\t"e-mail":"'+self.theme_author_mail+'",\n\t"theme":{\n';
			for(var j = 0; j < self.part_array.length; j++ ){
				i=1;
				data=data+'\t\t"'+self.part_array[j]+'":{\n';
								
				$("#css_box"+self.part_array[j]).children().each(function(){	
					if($(this).attr("class").indexOf("add_new_css")>-1){}
					
					else {			
						if(previous_area_name=="0"){
							css_data=css_data+$("#"+$(this).attr('id')+" .id_class_name").attr("value")+'{';
							data=data+'\t\t\t"'+$("#"+$(this).attr('id')+" .id_class_name").attr("value")+'":{';
						}
						else if(previous_area_name==$("#"+$(this).attr('id')+" .id_class_name").attr("value")){		
							data=data+',';
						}
						else{
							css_data=css_data+"\n}\n"+$("#"+$(this).attr('id')+" .id_class_name").attr("value")+"{";
							if(i==1){
								data=data+'\t\t\t"'+$("#"+$(this).attr('id')+" .id_class_name").attr("value")+'":{';
							}
							else{
								data=data+'},\n\t\t\t"'+$("#"+$(this).attr('id')+" .id_class_name").attr("value")+'":{';
							}
						}
						css_data=css_data+"\n\t\t"+$("#"+$(this).attr('id')+" .property").text()+":"+$("#"+$(this).attr('id')+" .css_value").attr("value")+";";
						data=data+'"'+$("#"+$(this).attr('id')+" .property").text()+'":"'+$("#"+$(this).attr('id')+" .css_value").attr("value")+'"';
						previous_area_name=$("#"+$(this).attr('id')+" .id_class_name").attr("value");
						i++;
					}
				});

				if(j==(self.part_array.length)-1)
					data=data+"}\n\t\t}";
				else

					data=data+"}\n\t\t},\n";		
			}
			data=data+"\n\t}\n}";

			$.ajax({
				url: url,			
				type: "POST",
				data: { path: path, filename: self.current_theme ,data: data },
				success: function(e) {
					var received_data = eval("("+e+")");
					if(received_data.errCode==0) {
						m.s("Save theme file successfully");
					}
					else {
						alert.show(received_data.errCode + " : " + received_data.message);
					}			
				}
			});
						
			$.ajax({
				url: css_url,			
				type: "POST",
				data: { filename: self.current_theme, data: css_data },
				success: function(e) {
					var received_data = eval("("+e+")");
					if(received_data.errCode==0) {
						self.load_css();
					}
					else {
						alert.show(received_data.errCode + " : " + received_data.message);
					}				
				}
			});

		};
		
		this.button_theme_menu_renderer = function (p_sType, p_aArgs, theme_title) {
			this.addItems([
				{ text: theme_title[0], value: theme_title[1] }
			]);
		};
		this.button_color_picker_ok_function = function (p_oEvent) {
			$("#"+$(".yui-picker-panel").attr("parent")+" .colorbox").css("background-color", "rgb("+$(self.color_picker).attr("newValue")+")");
			$("#"+$(".yui-picker-panel").attr("parent")+" .css_value").attr("value", "#"+self.color_picker.get("hex"));
			$(".yui-picker-panel").hide();
		};

		this.button_color_picker_cancel_function = function (p_oEvent) {
			$(".yui-picker-panel").hide();
		};

		this.color_to_rgb = function (color) {
			var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
			var red = parseInt(digits[2]);
			var green = parseInt(digits[3]);
			var blue = parseInt(digits[4]);
			var rgb=[red,green,blue];
			
			return rgb;
		};		
		this.css_box_click_function = function (o) {
			$(".yui-picker-panel").hide();	

			$(o.currentTarget).parent().children().removeClass("selected");
			$(o.currentTarget).find("input").focus();

			if($(o.currentTarget).attr("class").indexOf("add_new_css")>-1){
				self.dialog_new_css.show(this);
			}
			else
				$(o.currentTarget).addClass("selected");
		};		
		this.input_box_click_function = function (o) {
			$(".yui-picker-panel").hide();

			$(o.currentTarget).parent().parent().children().removeClass("selected");
			$($(o.currentTarget).parent()).addClass("selected");
		};	
		this.color_box_click_function = function (o) {
		
			$(o.currentTarget).parent().parent().children().removeClass("selected");		
			$(o.currentTarget).parent().addClass("selected");	
			$(".yui-picker-panel").attr("parent",$($(o.currentTarget).parent()).attr('id'));

			if(($(window).width())-($("."+$(o.currentTarget).attr("class")).offset().left)-25<392) {
				$(".yui-picker-panel").css("left",(o.currentTarget).offsetLeft-392+25+83+"px");
				$(".yui-picker-panel").css("top",(o.currentTarget).offsetTop+23+"px");				
			}
			
			else {
				$(".yui-picker-panel").css("left",(o.currentTarget).offsetLeft+25+"px");
				$(".yui-picker-panel").css("top",(o.currentTarget).offsetTop+"px");
			}
			
			$(".yui-picker-panel").show();

			var rgb = self.color_to_rgb($(this).css("background-color"));
			self.color_picker.setValue([rgb[0],rgb[1],rgb[2]]);
			
			o.stopPropagation();
		};	
		this.area_box_click_function = function(o){
			$(".area_cell").removeClass("selected");
			
			var area_class_names = $(o.target).attr("class").toString();
			var area_class_names_array = area_class_names.split(' ');

			$("#css_box"+area_class_names_array[1]).children().removeClass("selected");

			$(".css_box").hide();
						
			if($(o.target).attr("class").indexOf("addNewArea")>-1) {
				$("#css_boxdefault").show();
				self.dialog_new_area.show(this);
			}
			else{
				$("#css_box"+$(o.target).text()).show();
				$(o.target).addClass("selected");
			}
		};
	},
	
	load: function () {

		var self = this;
		var postdata = {
			kind: "theme"
		};
		var sorting_data;			

		$.post("module/org.goorm.core.theme/theme.getList.php", postdata, function (data) {	
			sorting_data = eval(data);

			for (var i in sorting_data) {
				if(sorting_data[i].cls=='folder') {
					if(sorting_data[i].filename=='assets'||sorting_data[i].filename=='.svn') {
						continue;
					}
					//////////

					var dir = "configs/themes/"+sorting_data[i].filename+"/"+sorting_data[i].filename+".json";
					var theme_title = "";
					var theme_dirName = "";
					$.ajax({
						url : dir,
						dataType : "json",
						success : function(jd){
							theme_title = jd['title'];
							theme_dirName = jd['dirName'];							

							(self.button_theme_selector).getMenu().subscribe("render", self.button_theme_menu_renderer, [theme_title, theme_dirName]);
						}
					});
												
					/////////
					//(self.button_theme_selector).getMenu().subscribe("render", self.button_theme_menu_renderer, sorting_data[i].filename);	
					
					if(core.preference["preference.theme.current_theme"]==sorting_data[i].filename) {
						dir = "configs/themes/"+sorting_data[i].filename+"/"+sorting_data[i].filename+".json";						
						$.ajax({
							url : dir,
							dataType : "json",
							success : function(jd){
								theme_title = jd['title'];										
								$("#button_theme_selector").html(theme_title);
							}
						});
						//init thème contents (area_box, css_box)
						var selected_theme = sorting_data[i].filename;
						dir = "configs/themes/"+sorting_data[i].filename+"/"+sorting_data[i].filename+".json";

						self.load_json(dir);
						self.load_css();
					}
				}
			}
			

		});
		(self.button_theme_selector).getMenu().subscribe("click", self.button_theme_selector_function);	
	},
	
	
	init_div_view : function() {
		var self = this;
		$("#css_boxdefault").show();
		for(var i = 0; i < self.part_array.length; i++ ){
			$("#css_box"+self.part_array[i]).hide();
		}
	},
	
	load_json: function (dir) {

		var self = this;
		self.part_array = new Array();

		$.ajax({
			url : dir,
			dataType : "json",
			success : function(jd){
				self.theme_author=jd['author'];
				self.theme_dir=jd['dirName']
				self.theme_version=jd['version'];
				self.theme_author_mail=jd['e-mail'];
				self.theme_title=jd['title'];
			

				for (var area_name in jd['theme']){
					self.part_array.push(area_name);
					$(".area_box").append("<div class='area_cell "+area_name+"'>"+area_name+"</div>");	

				}
				
				$(".area_box").append("<div class='area_cell addNewArea'>Add New Area</div>");	
																
				var string = "";
				for (var name in jd['theme']) {
					var i=1;
					string+="<div id='css_box"+name+"' class='css_box'>";
					for(var name2 in jd['theme'][name]) {
	
						//alert(name2) == id,class name
						for(var name3 in jd['theme'][name][name2]) {
							//alert(name3) == property
							string+="<div id='"+name+"Cell"+i+"' class='css_cell'><div style='overflow:auto; float:left'><div class='property'>"+name3+"</div><br>";
							if(name2.length>40)
								string+="<div class='id_class_name' value='"+name2+"'>"+name2.substr(0,40)+"..."+"</div></div><br><br>";	
							else
								string+="<div class='id_class_name' value='"+name2+"'>"+name2+"</div></div><br><br>";	
	
							//alert(jd[name][name2][name3]) == value
							string+="<input type='text' class='css_value' value='"+jd['theme'][name][name2][name3]+"'></input>";
		
							if(name3.indexOf("color") > -1)
							{
								string+="<button style='background-color:"+jd['theme'][name][name2][name3]+";' class='colorbox'></button></div>";
							}
							else
								string+="</div>";
							i++;
						}
					}
					string+="<div id='"+name+"Cell"+i+"' class='css_cell add_new_css'><div style='float:left; margin-left:5px;  margin-top:7px; font-size:11px'>Add New CSS</div></div>";
					string+="</div>";
				}
				string+="<div id='css_boxdefault' class='css_box'></div>";
				$(".themeContents").append(string);	

				self.init_div_view();	
				self.connect();
			}
		});
	},
	
	connect: function(){
		var self = this;

		$(".area_cell").bind('click', self.area_box_click_function, this);
		$(".colorbox").bind('click', self.color_box_click_function, this);
		$(".css_cell").bind('click', self.css_box_click_function, this);
		$(".css_cell input").bind('click', self.input_box_click_function, this);
 
 		//subscribe to the rgbChange event;
		self.color_picker.on("rgbChange", function(o){
			$(self.color_picker).attr("newValue",o.newValue);
		});	
		
	},
	
	load_css: function () {
		var self = this;
		
		$("head").append("<link>");
	    var css = $("head").children(":last");
	    css.attr({
	    	rel:  "stylesheet",
	    	type: "text/css",
	    	href: "temp/"+self.current_theme+".css"
	    });
	}
};