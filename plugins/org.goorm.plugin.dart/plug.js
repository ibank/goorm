/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.dart = function () {
	this.name = "dart";
	this.mainmenu = null;
	this.build_options = null;
	this.build_source = null;
	this.build_target = null;
	this.build_file_type = "o";
};

org.goorm.plugin.dart.prototype = {
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
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='dartp'><div class='project_type_icon'><img src='/org.goorm.plugin.dart/images/dart.png' class='project_icon' /></div><div class='project_type_title'>DART Project</div><div class='project_type_description'>Dart Project (HTML5/Javascript)</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all dartp' description='  Create default Dart project' projecttype='dart' plugin_name='org.goorm.plugin.dart'><img src='/org.goorm.plugin.dart/images/dart_console.png' class='project_item_icon' /><br /><a>Default Dart project</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all dartp' description='  Create sample Clock project' projecttype='dart' plugin_name='org.goorm.plugin.dart'><img src='/org.goorm.plugin.dart/images/dart_console.png' class='project_item_icon' /><br /><a>Clock sample</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all dartp' description='  Create sample Sunflower project' projecttype='dart' plugin_name='org.goorm.plugin.dart'><img src='/org.goorm.plugin.dart/images/dart_console.png' class='project_item_icon' /><br /><a>Sunflower sample</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all dartp' description='  Create sample Spirodraw project' projecttype='dart' plugin_name='org.goorm.plugin.dart'><img src='/org.goorm.plugin.dart/images/dart_console.png' class='project_item_icon' /><br /><a>Spirodraw sample</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all dartp' description='  Create sample Solar project' projecttype='dart' plugin_name='org.goorm.plugin.dart'><img src='/org.goorm.plugin.dart/images/dart_console.png' class='project_item_icon' /><br /><a>Solar sample</a></div>");
		
		$(".project_dialog_type").append("<option value='dart'>Dart Projects</option>").attr("selected", "");
		
	},

	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_dart\" localizationKey='file_new_dart_project'>DART Project</a></li>");
		//this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_dart]").unbind("click");
		$("a[action=new_file_dart]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=dartp]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=dartp]").position().top - 100);
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

		switch(data.project_detailed_type) {
		case "Clock sample": 
			data.project_detailed_type="clock";
			data.plugins["org.goorm.plugin.dart"]["plugin.dart.main"] = "clock";
			break;
		case "Sunflower sample": 
			data.project_detailed_type="sunflower";
			data.plugins["org.goorm.plugin.dart"]["plugin.dart.main"] = "sunflower";
			break;
		case "Spirodraw sample": 
			data.project_detailed_type="Spirodraw";
			data.plugins["org.goorm.plugin.dart"]["plugin.dart.main"] = "Spirodraw";
			break;
		case "Solar sample": 
			data.project_detailed_type="solar";
			data.plugins["org.goorm.plugin.dart"]["plugin.dart.main"] = "solar";
			break;
		case "Default Dart project":
		default:
			data.project_detailed_type="default";
			data.plugins["org.goorm.plugin.dart"]["plugin.dart.main"] = "hi";
		}
		
		var send_data = {
				"plugin" : "org.goorm.plugin.dart",
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			// update project.json file
			core.dialog.project_property.load_property(core.status.current_project_path, function(data){
				$(core).trigger("on_project_open");
				core.module.layout.project_explorer.refresh();
			});
		});
	},
	
	run: function(path) {
		var self=this;
		var property = core.property.plugins['org.goorm.plugin.dart'];
		
		var send_data = {
				"plugin" : "org.goorm.plugin.dart",
				"data" : {
					"project_path" : path
				}
		};
		
		$.get('/plugin/run', send_data, function(result){
			if(result.code == 200){
				//success 
				if(result.run_path) {
					window.open('.'+result.run_path+'/index.html', 'goormDart');
				}
			}
		});
	},
	
	build: function (projectName, callback) {
		var self=this;
		var workspace = core.preference.workspace_path;
		var property = core.property;
		if(projectName) {
			core.workspace[projectName] && (property = core.workspace[projectName])
		}
		else {
			var projectName = core.status.current_project_path;
		}
		var plugin = property.plugins['org.goorm.plugin.dart'];
		var buildOptions = " "+plugin['plugin.dart.build_option'];
		var buildPath = " --out="+workspace+projectName+"/"+plugin['plugin.dart.main']+".dart.js";
		var buildTarget = " "+workspace+projectName+"/"+plugin['plugin.dart.main']+".dart";
		
		var cmd = "dart2js"+buildPath+buildTarget;
		
		core.module.layout.terminal.send_command(cmd+'\r', null, function(){
			core.module.layout.project_explorer.refresh();
		});
		
		if(callback) callback();
	},
	
	clean: function(project_name){
	}
};