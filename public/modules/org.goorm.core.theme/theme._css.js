/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.theme._css = function () {
	this.dialog = null;
	this.buttons = null;
	this.parent = null;
	this.target = null;
};

org.goorm.core.theme._css.prototype = {
	init: function (parent) {
		var self = this;
		this.parent = parent;
		var handle_ok = function() {
			var area_name = $(self.target).attr("id");
			area_name = area_name.replace(/.$/g, '').replace("Cell",'');
	
			var string="";
			string+="<div id='"+area_name+"Cell"+($(self.target).parent().children().length+1)+"' class='css_cell newCssCell'><div style='overflow:auto; float:left'><div class='property'>"+$("#new_property").attr("value")+"</div><br>";
			if($("#new_selector").attr("value").length>25)
				string+="<div class='id_class_name' value='"+$("#new_selector").attr("value")+"'>"+$("#new_selector").attr("value").substr(0,25)+"..."+"</div></div>";	
			else
				string+="<div class='id_class_name' value='"+$("#new_selector").attr("value")+"'>"+$("#new_selector").attr("value")+"</div></div>";		
	
			if($("#new_property").attr("value").indexOf("color") > -1) {
				string+="<input type='text' class='css_value' value='#FFFFFF'></input>";
				string+="<button class='colorbox' style='background-color:white'></button></div>";
			}
			else{
				string+="<input type='text' class='css_value' value=''></input>";
				string+="</div>";
			}
			
			if($("#css_box"+area_name+" .id_class_name[value='"+$("#new_selector").attr("value")+"']").length==0)
				$(self.target).before(string);
			else
				$($("#css_box"+area_name+" .id_class_name[value='"+$("#new_selector").attr("value")+"']")[$("#css_box"+area_name+" .id_class_name[value='"+$("#new_selector").attr("value")+"']").length-1]).parent().parent().after(string);
			
			$(".newCssCell").bind("click",self.parent.css_box_click_function, this);
			
			if($("#new_property").attr("value").indexOf("color") > -1) {
 				$(".newCssCell").children(".colorbox").bind('click', self.parent.color_box_click_function, this);
			}
			$(".newCssCell").removeClass("newCssCell");
			
			this.hide(); 
			
			$("#new_selector").attr("value",".yui-skin-sam");
			$("#new_selector").addClass("example_selector");
			$("#new_property").attr("value","margin-top");
			$("#new_property").addClass("example_property");			
		};

		var handle_cancel = function() { 
			this.hide(); 

			$("#new_selector").attr("value",".yui-skin-sam");
			$("#new_selector").addClass("example_selector");
			$("#new_property").attr("value","margin-top");
			$("#new_property").addClass("example_property");
			
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}];
						 			 
		this.dialog = new org.goorm.core.theme._css.dialog();
		this.dialog.init({
			localization_key:"title_add_new_css",
			title:"Add New CSS", 
			path:"../../config/preference/org.goorm.core.theme/theme._css.html",
			width:220,
			height:133,
			modal:true,
			buttons:this.buttons,
			success: function () {
				$("#new_selector").bind('focus',function(){
					$(this).attr("value","");
					$(this).removeClass("example_selector");
				});
				$("#new_property").bind('focus',function(){
					$(this).attr("value","");
					$(this).removeClass("example_property");
				});
			}
		});
		
		this.dialog = this.dialog.dialog;		
	},
	
	show: function(target) {
		var self=this;
		this.target = target;
 
		this.dialog.panel.show();
	},
	
};