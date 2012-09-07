/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.plugin.web = function () {
	this.name = "web";
	this.mainmenu = null;
	this.build_options = null;
	this.build_source = null;
	this.build_target = null;
	this.build_file_type = "o";
};

org.goorm.plugin.web.prototype = {
	init: function () {
		
		this.addProjectItem();
		
		this.mainmenu = core.module.layout.mainmenu;
		
		//this.debugger = new org.uizard.core.debug();
		//this.debug_message = new org.uizard.core.debug.message();
		
		this.cErrorFilter = /[A-Za-z]* error: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.cWarningFilter = /[A-Za-z]* warning: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.lineFilter = /:[0-9]*:/;
		
		this.add_mainmenu();
		
		//core.dictionary.loadDictionary("plugins/org.uizard.plugin.c/dictionary.json");
	},
	
	
	addProjectItem: function () {
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='webp'><div class='project_type_icon'><img src='/org.goorm.plugin.web/images/web.png' class='project_icon' /></div><div class='project_type_title'>web Project</div><div class='project_type_description'>web Project using GNU Compiler Collection</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all webp' description='  Create New Project for web' projecttype='web'><img src='/org.goorm.plugin.web/images/web.png' class='project_item_icon' /><br /><a>web Project</a></div>");
		
		$(".project_dialog_type").append("<option value='c'>web Projects</option>");
		
	},

	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_web\" localizationKey='file_new_web_project'>Web Project</a></li>");
		this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_web]").unbind("click");
		$("a[action=new_file_web]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=web]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=web]").position().top - 100);
		});
	},
	
	new_project: function(data) {
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
		var send_data = {
				"plugin" : "org.goorm.plugin.web",
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			core.module.layout.project_explorer.refresh();
		});
	},
	
	run: function(path) {
		var send_data = {
				"plugin" : "org.goorm.plugin.web",
				"data" : {
					"project_path" : path
				}
		};
		
		$.get('/plugin/run', send_data, function(result){
			if(result.code == 200){
				//success 
				if(result.run_path) {
					window.open('.'+result.run_path+'/index.html', 'goormWeb');
				}
			}
		});
	}	
};