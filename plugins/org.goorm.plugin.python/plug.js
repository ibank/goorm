/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.python = function () {
	this.name = "python";
	this.mainmenu = null;
	this.debug_con = null;
	this.current_debug_project = null;
	this.terminal = null;
	this.preference = null;
};

org.goorm.plugin.python.prototype = {
	init: function () {
		this.add_project_item();
		
		this.mainmenu = core.module.layout.mainmenu;
		
		this.cErrorFilter = /[A-Za-z]* error: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.cWarningFilter = /[A-Za-z]* warning: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.lineFilter = /:[0-9]*:/;
		
		this.add_mainmenu();
		
		this.add_menu_action();
		
		this.preference = core.preference.plugins['org.goorm.plugin.python'];
	},
	
	add_project_item: function () {
		// Project New 왼쪽에 Project Type 버튼 추가
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project_type='python'><div class='project_type_icon'><img src='/org.goorm.plugin.python/images/python.png' class='project_icon' /></div><div class='project_type_title'>Python Project</div><div class='project_type_description'>Python Project</div></div>");
		
		// Project New 오른쪽에 새 Project Button 추가
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all python' description='  Create New Project for Python' project_type='python' plugin_name='org.goorm.plugin.python'><img src='/org.goorm.plugin.python/images/python_console.png' class='project_item_icon' /><br /><a>Python Project</a></div>");

		// Project Open/Import/Export/Delete에 Project Type Option 추가
		$(".project_dialog_type").append("<option value='python'>Python Projects</option>").attr("selected", "");
		
	},

	add_mainmenu: function () {
		var self = this;
		
		// File - New.. Project Type 추가
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_python\" localizationKey='file_new_python_project'>Python Project</a></li>");
		//this.mainmenu.render();
	},
	
	add_menu_action: function () {
		
		// 위에서 추가한 mainmenu에 대한 action 추가
		$("a[action=new_file_python]").unbind("click");
		$("a[action=new_file_python]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project_type=python]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project_type=python]").position().top - 100);
		});
	},
	
	new_project: function(data) {

		var send_data = {
				"plugin" : "org.goorm.plugin.python",
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			// 가끔씩 제대로 refresh가 안됨.
			setTimeout(function(){
				core.module.layout.project_explorer.refresh();
			}, 500);
		});
	},
	
	run: function(path) {
		var self=this;
		var property = core.property.plugins['org.goorm.plugin.python'];
		
		var classname = property['plugin.python.main'];

		var cmd1 = "python ./"+classname;
		core.module.layout.terminal.send_command(cmd1);

	}	
};