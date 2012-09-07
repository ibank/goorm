org.goorm.core.preference.language = function () {
	this.preference = null;
};

org.goorm.core.preference.language.prototype = {
	init: function () {
		var self = this;
		
		var language = "";

		var language_button = new YAHOO.widget.Button("language_button", {
													type: "menu",
													menu: "language_select"});

		var on_menu_click = function (type, menuitems) {
			var event = menuitems[0],	//	DOM event
				menuitem = menuitems[1];	//	MenuItem instance that was the target of 
										//	the event 
			if (menuitem) {
				$("#language_button-button").text($(menuitem.element).text());
				core.module.localization.change_language(menuitem.value);
			}
		 
		};
 
		language_button.getMenu().subscribe("click", on_menu_click);
		
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
			core.module.localization.before_language=language;
			
		}
		else {
			core.module.localization.change_language(localStorage.getItem("language"));
			core.module.localization.before_language=localStorage.getItem("language");
		}
		
		var language_pack_download_button = new YAHOO.widget.Button("language_pack_download_button");
	}
}