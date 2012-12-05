/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.theme._new = function () {
	this.dialog = null;
	this.buttons = null;
	this.parent = null;
};

org.goorm.core.theme._new.prototype = {
	init: function (parent) {
		var self = this;
		
		this.parent = parent;
		
		var handle_ok = function() {
			(self.parent.button_theme_selector).getMenu().subscribe("render", self.parent.button_theme_menu_renderer, $("#newThemeName").attr("value"));
			(self.parent.button_theme_selector).getMenu().subscribe("click", self.parent.button_theme_selector_function);	
			
			var url = "module/org.goorm.core.theme/theme.save.php";
			var data = "";
			var path = "configs/themes/"+$("#newThemeName").attr("value");
			var filename = $("#newThemeName").attr("value");

			$.ajax({
				url: url,			
				type: "POST",
				data: { path: path, filename: filename ,data: data, kind: "new" },
				success: function(e) {
					m.s("Create new theme successfully");
				}
			});
						
			this.hide(); 
		};

		var handle_cancel = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}];
						 
		this.dialog = new org.goorm.core.theme._new.dialog();
		this.dialog.init({
			localization_key:"title_preference",
			title:"Preference", 
			path:"configs/preferences/org.goorm.core.theme/theme._new.html",
			width:220,
			height:120,
			modal:true,
			buttons:this.buttons,
			success: function () {

			}
		});
		
		this.dialog = this.dialog.dialog;
	},
	
	show: function () {
		var self=this;

		this.dialog.panel.show();
	},
	
};