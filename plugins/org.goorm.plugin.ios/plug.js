/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.ios = function () {
	this.name = "c";
	this.mainmenu = null;
	this.debug = null;
	this.debug_message = null;
	this.build_options = null;
	this.build_source = null;
	this.build_target = null;
	this.build_file_type = "o";
};

org.goorm.plugin.ios.prototype = {
	init: function () {
		//this.add_project_item();
		
		
		this.mainmenu = core.module.layout.mainmenu;
		
		//this.preference = core.dialogPreference.plugin['c'].preference;
		
		//this.debugger = new org.uizard.core.debug();
		//this.debug_message = new org.uizard.core.debug.message();
		
		this.cErrorFilter = /[A-Za-z]* error: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.cWarningFilter = /[A-Za-z]* warning: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.lineFilter = /:[0-9]*:/;
		
		//this.add_mainmenu();
		
		//core.dictionary.loadDictionary("plugins/org.uizard.plugin.c/dictionary.json");
	},
	
	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_ios\" localizationKey='file_new_ios_project'>iOS Project</a></li>");
		this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_ios]").unbind("click");
		$("a[action=new_file_ios]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=ios]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=ios]").position().top - 100);
		});
	}
};