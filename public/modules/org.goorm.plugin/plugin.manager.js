/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.manager = function () {
	this.plugins = null;
	this.list = 0;
	this.interval = null;
	this.preference = null;
	this.toolbox_selector = null;
};

org.goorm.plugin.manager.prototype = {
	init: function () {
		this.plugins = new Object();
		this.list = [];
	},
	
	get: function () {
		var self = this;
		
		var url = "plugin/get_list";
				
		//var i = 0;
		//this.interval = window.setInterval(function () { if(i<100) { statusbar.progressbar.set('value', i+=10); } else { window.clearInterval(self.interval); } }, 100);
		
		//statusbar.start();
		
		$.ajax({
			url: url,			
			type: "GET",
			async: false,
			success: function(data) {
				self.list = eval(data);
								
				//statusbar.progressbar.set('value', 100);
				/*
				if(self.interval) {
					window.clearInterval(self.interval);
				}
				*/
				
				//statusbar.stop();
				$(core).trigger("plugin_loaded");
				
				//$(core).trigger("goorm_loading");
			}
		});
		
		//$(core).trigger("plugin_loaded");
	},
	
	load: function (index) {
		var self = this;
		
		if (index == this.list.length && this.list.length != 0) {
		
			$("#toolbox_selectbox").prepend("<option value='all'>ALL</option>");
			
			return false;
		}
		else if(this.list.length != 0){
			if (index == 0) {
				$("#toolbox").html("<div id='toolbox_selector'></div>");
				$("#toolbox_selector").append("<select id='toolbox_selectbox' name='toolbox_selectbox' style='width:100%;'></select>");
				
				$("#toolbox_selectbox").change(function () {
					if ($(this).val() == "all") {
						$("#toolbox div").show();
					}
					$("#" + $("#toolbox_selector option:selected").val() + "_toolset").show();
				});
			}
			
			var plugin_name = this.list[index].name;

			if (plugin_name != undefined) {	
				$.getScript('/' + plugin_name + '/plug.js', function () {
					//Plugin initialization
					eval("self.plugins['"+plugin_name+"'] = new " + plugin_name + "();");
					self.plugins[plugin_name].init();

					index++;
					self.load(index);
					core.module.preference.manager.get_default_file('/' + plugin_name + '/preference.json', function(json){
						core.preference.plugins[plugin_name] || (core.preference.plugins[plugin_name] = {})
						core.preference.plugins[plugin_name] = $.extend(true, json, core.preference.plugins[plugin_name]);
						// restore default를 위한 기본 preference데이터를 저장.
						core.module.preference.preference_default.plugins[plugin_name] = {};
						core.module.preference.preference_default.plugins[plugin_name] = $.extend(true, core.module.preference.preference_default.plugins[plugin_name], json);
					});
					
					$(core).trigger("goorm_loading");
				});
			}
		}
		// else {
			// $(core).trigger("goorm_loading");
		// }
	},

	new_project: function (data){
		/* data = 
		   { 
			project_type,
			project_detailed_type,
			project_author,
			project_name,
			project_about,
			use_collaboration
		   }
		*/
		
		if(data.project_type == "goorm") {
		
		}
		else {
			console.log(this.plugins);
			console.log(data.project_type);
			if($.isFunction(this.plugins["org.goorm.plugin."+data.project_type].new_project)) {
				console.log(data);
				this.plugins["org.goorm.plugin."+data.project_type].new_project(data);
//				core.dialog.project_property.set_project_information();
			}
		}
	}
};
