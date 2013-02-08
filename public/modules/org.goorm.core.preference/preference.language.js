/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.preference.language = function () {
	this.preference = null;
};

org.goorm.core.preference.language.prototype = {
	init: function () {
		var self = this;
		
		var language = "";

		var language_button = new YAHOO.widget.Button("language_button", {type: "menu", menu: "language_select"});

 
		language_button.getMenu().subscribe("click", function (type, menuitems) {
			var event = menuitems[0];
			var menuitem = menuitems[1];

			if (menuitem) {
				$("#language_button-button").text($(menuitem.element).text());
				core.module.localization.change_language(menuitem.value);
			}
		 
		});
		
		if(localStorage.getItem("language")==null) {
			if (core.server_language=="client") {
				if(navigator.language=="ko") {
					language = "kor";
				}
				else {
					language = "us";
				}
			}
			else {
				language = core.server_language;
			}
			
			core.module.localization.change_language(language);
		}
		else {
			core.module.localization.change_language(localStorage.getItem("language"));
		}
		
		//var language_pack_download_button = new YAHOO.widget.Button("language_pack_download_button", {label:'<span localization_key="language_pack_download">Download Another Language Pack</span>'});
	}
}
