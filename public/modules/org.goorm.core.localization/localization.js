/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.localization = function () {
	this.language = null;
	this.data1 = null;
	this.data2 = null;
	this.data3 = null;
	this.before_language = null;
	this.msg = null;
};

org.goorm.core.localization.prototype = {
	init: function () {

	},

	change_language: function (language) {
		var self = this;
		
		var is_first = false;
		
		if (localStorage.getItem("language")==null && core.server_language=="client") {
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

		//Get a stencil and adapt it to div
		var url = "file/get_contents";
		
		$.ajax({
			url: url,			
			type: "GET",
			data: "path=configs/language/"+language+".menu.json",
			success: function(data) {

				self.data1 = eval(data);
				
				self.apply(self.data1[0]);
			}
		});

		$.ajax({
			url: url,			
			type: "POST",
			data: "path=configs/language/"+language+".dialog.json",
			success: function(data) {
				self.data2 = eval(data);
				
				self.apply(self.data2[0]);
			}
		});
		
		$.ajax({
			url: url,			
			type: "POST",
			data: "path=configs/language/"+language+".msg.json",
			success: function(data) {
				self.data3 = eval(data);
				delete self.msg;	
				self.msg = new Array();
				
				self.apply_message(self.data3[0]);
				
				if (is_first && language=="kor") {
					confirmation.init({
						title: core.module.localization.msg["confirmationLanguageTitle"], 
						message: core.module.localization.msg["confirmationLanguageMessage"],
						yes_text: core.module.localization.msg["confirmation_yes"],
						no_text: core.module.localization.msg["confirmation_no"],
						yes: function () {
							core.module.localization.change_language(language);
							core.module.localization.before_language=language;
						}, no: function () {
							core.module.localization.change_language("us");
							core.module.localization.before_language="us";
						}
					});
					
					confirmation.panel.show();
				}
			}
		});
		
/*
		$.getScript('config/language/' + language + '.msg.js', function () {

			delete self.msg;	
			eval("self.msg = new org.goorm.core.module.localization."+language+"();");
			self.msg.init();
			
			if (is_first && language=="kor") {
				confirmation.init({
					title: core.module.localization.msg["confirmationLanguageTitle"], 
					message: core.module.localization.msg["confirmationLanguageMessage"],
					yes_text: core.module.localization.msg["confirmation_yes"],
					no_text: core.module.localization.msg["confirmation_no"],
					yes: function () {
						core.module.localization.change_language(language);
						core.module.localization.before_language=language;
					}, no: function () {
						core.module.localization.change_language("us");
						core.module.localization.before_language="us";
					}
				});
				
				confirmation.panel.show();
			}
		});	
*/

	},

	apply: function (data) {
		var self = this;
		
		if (data != null) {
			$.each(data, function (key, value) {
				
				var helptext = $("[localization_key='" + key + "']").find(".helptext").html();
				
				$("[localization_key='" + key + "']").html(this.value);
				
				if (helptext != null) {
					$("[localization_key='" + key + "']").append("<em class='helptext'>" + helptext + "</em>");
				}
				
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
	}
};