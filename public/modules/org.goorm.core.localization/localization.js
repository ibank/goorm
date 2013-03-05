/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.localization = {
	language: null,
	data1: null,
	data2: null,
	data3: null,
	data4: null,
	data5: null,
	before_language: null,
	msg: null,
	dialog_localization: [],

	init: function () {
		var self = this;
	},

	change_language: function (language, flag) {	
		var self = this;
		var is_first = false;
		
		if(language == null || language) language = "us";

		if ( (localStorage.getItem("language")=="null" || localStorage.getItem("language")==null) && core.server_language=="client") {
			is_first = true;
		}

		localStorage.setItem("language", language);

		var current = "";
		if(language=="us") {
			current = "English";
		}
		else if(language=="kor") {
			current="한국어";
		}
		$("#language_button-button").text(current);
		
		if(flag || !this.data1){
			$.getJSON("configs/languages/"+language+".menu.json", function (data) {
				self.data1 = data;
				self.apply(data);
			});
		}
		
		if(flag || !this.data2){
			$.getJSON("configs/languages/"+language+".dialog.json", function (data) {
				self.data2 = data;
				
				self.apply(data);
			});
		}
		
		if(flag || !this.msg){
			$.getJSON("configs/languages/"+language+".msg.json", function (data) {
				self.msg = data;
				
				if (is_first && language=="kor") {
					confirmation.init({
						message: core.module.localization.msg["confirmation_language_message"].value,
						yes_text: core.module.localization.msg["confirmation_language_message_yes"].value,
						no_text: core.module.localization.msg["confirmation_language_message_no"].value,
	
						title: "Language Automatic Change", 
						
						yes: function () {
							core.module.localization.change_language(language);
						}, no: function () {
							core.module.localization.change_language("us");
						}
					});
					
					confirmation.panel.show();
				}
				
				self.apply(data);
				self.apply_message(data);
			});
		}
		
		if(flag || !this.data4){
			$.getJSON("configs/languages/"+language+".dict.json", function (data) {
				self.data4 = data;
				self.apply(data);
			});
		}
		
		if(flag || !this.data5){
			$.getJSON("configs/languages/"+language+".title.json", function (data) {
				self.data5 = data;
				self.apply(data);
			});
		}

	
		core.dialog.help_contents.load();
	},

	apply: function (data) {
		var self = this;
		if (data != null) {
			$.each(data, function (key, value) {
				var helptext = $("[localization_key='" + key + "']").find(".helptext").html();
				
				$("[localization_key='" + key + "']").html(this.value);
				$("input[localization_key='" + key + "']").val(this.value);
				
				if (helptext != null) {
					$("[localization_key='" + key + "']").append("<em class='helptext'>" + helptext + "</em>");
				}
				
				// attach tooltip
				$("[tooltip="+key+"]").attr("title", this.value);
				
				if(this.children) {
					self.apply(this.children);
				}
			});
		}
	},
	
	apply_message: function (data) {
		var self = this;
		
		if (data != null) {
			$.each(data, function (key, value) {
				eval("self.msg[\""+key+"\"]"+"=\""+this.value+"\";");
			});
		}
	},
	
	refresh : function(flag){
		var self = this;
		var language = "";
		if(flag){
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
				
				self.change_language(language,true);
			}
			else {
				self.change_language(localStorage.getItem("language"),true);
			}

		}else{
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
			
				self.change_language(language);
			}
			else {
				self.change_language(localStorage.getItem("language"));
			}
		}
	}
};
