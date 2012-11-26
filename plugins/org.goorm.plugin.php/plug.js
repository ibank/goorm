/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.php = function () {
	this.name = "php";
	this.mainmenu = null;
};

org.goorm.plugin.php.prototype = {
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
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='phpp'><div class='project_type_icon'><img src='/org.goorm.plugin.php/images/php.png' class='project_icon' /></div><div class='project_type_title'>PHP Project</div><div class='project_type_description'>PHP Project (HTML5/Javascript)</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all phpp' description='  Create New Project for php' projecttype='php' plugin_name='org.goorm.plugin.php'><img src='/org.goorm.plugin.php/images/php_console.png' class='project_item_icon' /><br /><a>PHP Project</a></div>");
		
		$(".project_dialog_type").append("<option value='php'>php Projects</option>").attr("selected", "");
		
	},

	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_php\" localizationKey='file_new_php_project'>PHP Project</a></li>");
		//this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_php]").unbind("click");
		$("a[action=new_file_php]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=phpp]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=phpp]").position().top - 100);
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
				"plugin" : "org.goorm.plugin.php",
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			core.module.layout.project_explorer.refresh();
		});
	},
	
	run: function(path) {
		var property = core.property.plugins['org.goorm.plugin.php'];
		var main = property['plugin.php.main'];
		var run_path = property['plugin.php.run_path'];
		var deploy_path = property['plugin.php.deploy_path'];
		var send_data = {
				"plugin" : "org.goorm.plugin.php",
				"data" : {
					"project_path" : path,
					"deploy_path" : deploy_path
				}
		};

		$.get('/plugin/run', send_data, function(result){
			if(result.code == 200){
				//success 
				window.open(run_path + path +'/'+main, 'goormphp');
			}
			else{
				//failure
//				console.log("err!",result);
				alert.show("Cannot run this project! <br>Check deploy path");
			}
		});
	}	
};