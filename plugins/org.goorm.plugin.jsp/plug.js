/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.jsp = function () {
	this.name = "jsp";
	this.mainmenu = null;
};

org.goorm.plugin.jsp.prototype = {
	init: function () {
		
		this.add_project_item();
		
		this.mainmenu = core.module.layout.mainmenu;
		
		//this.debugger = new org.uizard.core.debug();
		//this.debug_message = new org.uizard.core.debug.message();
		
		this.cErrorFilter = /[A-Za-z]* error: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.cWarningFilter = /[A-Za-z]* warning: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.lineFilter = /:[0-9]*:/;
		
		this.add_mainmenu();
		
		this.add_menu_action();
		
		//core.dictionary.loadDictionary("plugins/org.uizard.plugin.c/dictionary.json");
	},
	
	
	add_project_item: function () {
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='jspp'><div class='project_type_icon'><img src='/org.goorm.plugin.jsp/images/jsp.png' class='project_icon' /></div><div class='project_type_title'>JSP Project</div><div class='project_type_description'>JSP Project (HTML5/Javascript)</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all jspp' description='  Create New Project for jsp' projecttype='jsp' plugin_name='org.goorm.plugin.jsp'><img src='/org.goorm.plugin.jsp/images/jsp_console.png' class='project_item_icon' /><br /><a>JSP Project</a></div>");
		
		$(".project_dialog_type").append("<option value='jsp'>jsp Projects</option>").attr("selected", "");
		
	},

	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_jsp\" localizationKey='file_new_jsp_project'>JSP Project</a></li>");
		//this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_jsp]").unbind("click");
		$("a[action=new_file_jsp]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=jspp]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=jspp]").position().top - 100);
		});
	},
	
	new_project: function(data) {
		/* data = 
		   { 
			project_type,
			project_detailed_type,
			project_author,
			project_name,
			project_desc,
			use_collaboration
		   }
		*/
		var send_data = {
				"plugin" : "org.goorm.plugin.jsp",
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			core.module.layout.project_explorer.refresh();
		});
	},
	
	run: function(path) {
		var property = core.property.plugins['org.goorm.plugin.jsp'];
		var main = property['plugin.jsp.main'];
		var run_path = property['plugin.jsp.run_path'];
		var deploy_path = property['plugin.jsp.deploy_path'];
		var send_data = {
				"plugin" : "org.goorm.plugin.jsp",
				"data" : {
					"project_path" : path,
					"deploy_path" : deploy_path
				}
		};

		$.get('/plugin/run', send_data, function(result){
			if(result.code == 200){
				//success 
				window.open(run_path + path +'/'+main, 'goormjsp');
			}
			else{
				//failure
//				console.log("err!",result);
				alert.show("Cannot run this project! <br>Check deploy path");
			}
		});
	}	
};