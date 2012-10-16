/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.plugin.java = function () {
	this.name = "java";
	this.mainmenu = null;
	this.build_options = null;
	this.build_source = null;
	this.build_target = null;
	this.build_file_type = "o";
	this.debug_con = null;
	this.current_debug_project = null;
	this.terminal = null;
	this.breakpoints = null;
};

org.goorm.plugin.java.prototype = {
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
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='javap'><div class='project_type_icon'><img src='/org.goorm.plugin.java/images/java.png' class='project_icon' /></div><div class='project_type_title'>Java Project</div><div class='project_type_description'>Java Project using GNU Compiler Collection</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all javap' description='  Create New Project for Java' projecttype='java'><img src='/org.goorm.plugin.java/images/java_console.png' class='project_item_icon' /><br /><a>Java Console Project</a></div>");
		
		$(".project_dialog_type").append("<option value='c'>Java Projects</option>");
		
	},
	
	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_java\" localizationKey='file_new_java_project'>Java Project</a></li>");
		this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_java]").unbind("click");
		$("a[action=new_file_java]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=java]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=java]").position().top - 100);
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
				"plugin" : "org.goorm.plugin.java",
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			core.module.layout.project_explorer.refresh();
		});
	},
	
	run: function(path) {
		var self=this;
		
		this.path_project = "";

		var classpath = "src/project";
		var classname = "main";

		var cmd1 = "java -cp "+classpath+" "+classname;
		console.log(cmd1);
		core.module.layout.terminal.send_command(cmd1+'\r');

	},
	
	debug: function (path) {
		var self = this;
		var table_variable = core.module.debug.table_variable;
		var debug_module = core.module.debug;
		this.terminal = core.module.layout.workspace.window_manager.open("/", "debug", "terminal", "Terminal").terminal;
		this.current_debug_project = path;
		this.prompt = /(main\[[\d]\][\s\n]*)$/;
		this.terminal.debug_endstr = /application exited/;
		
		// debug탭 초기화
		table_variable.initializeTable();
		table_variable.refreshView();
		
		this.breakpoints = [];
		
		// debug start!
		var send_data = {
				"plugin" : "org.goorm.plugin.java",
				"path" : path,
				"mode" : "init"
		};
		
		if(this.terminal.index != -1) {
			self.debug_cmd(send_data);
		}
		else {
			$(this.terminal).one("terminal_ready", function(){
				self.debug_cmd(send_data);
			});
		}
		
		$(debug_module).off("value_changed");
		$(debug_module).on("value_changed",function(e, data){
			self.terminal.send_command("set "+data.variable+"="+data.value+"\r", self.prompt);
		});
	},
	
	/*
	 * 디버깅 명령어 전송
	 */
	debug_cmd: function (cmd) {
		/*
		 * cmd = { mode, project_path }
		 */
		var self=this;
		if(this.terminal === null) {
			console.log("no connection!");
			return ;
		}
		
		switch (cmd.mode) {
		case 'init' :
			self.terminal.send_command("jdb -classpath src/project/ main\r", null);
			self.set_breakpoints();
			self.terminal.send_command("run\r", />/, function(){
				self.debug_get_status();
			});
			break;
//		case 'run':
//			self.terminal.send_command("run\r"); break;
		case 'continue':
			self.set_breakpoints();
			self.terminal.send_command("cont\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		case 'terminate':
			self.set_breakpoints();
			self.terminal.send_command("exit\r", self.prompt); 
			table_variable.initializeTable();
			table_variable.refreshView();
			break;
		case 'step_over':
			self.set_breakpoints();
			self.terminal.send_command("next\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		case 'step_in':
			self.set_breakpoints();
			self.terminal.send_command("step\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		case 'step_out':
			self.set_breakpoints();
			self.terminal.send_command("step up\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		default : break;
		}
		
	},
	
	debug_get_status: function(){
		var self = this;
		this.terminal.send_command("where\r", this.prompt, function(terminal_data){
			self.set_currentline(terminal_data);
		});
		this.terminal.send_command("locals\r", this.prompt, function(terminal_data){
			self.set_debug_variable(terminal_data);
		});
	},
	
	set_currentline: function(terminal_data){
		var self = this;
		var lines = terminal_data.split('\n');
		$.each(lines, function(i, line){
			if(line == '') return;
			// 현재 라인 처리
			var regex = /\[\d\].*\((.*):([\d]+)\)/;
			if(regex.test(line)) {
				var match = line.match(regex);
				var filename = match[1];
				var line_number = match[2];
				
				var windows = core.module.layout.workspace.window_manager.window;
				for (var j=0; j<windows.length; j++) {
					var window = windows[j];
					if (window.project == self.current_debug_project 
							&& window.filename == filename) {
						window.editor.highlight_line(line_number);
					}
				}
			}
		});
	},
	
	set_debug_variable: function(terminal_data){
		var lines = terminal_data.split('\n');
		var table_variable = core.module.debug.table_variable;
		
		table_variable.initializeTable();
		
		$.each(lines, function(i, line){
			if(line == '') return;
			
			// local variable 추가
			var variable = line.split(' = ');
			if (variable.length == 2) {
				table_variable.addRow({
					"variable": variable[0].trim(),
					"value": variable[1].trim()
				});
			}
		});
		table_variable.refreshView();
	},
	
	set_breakpoints: function(){
		var self = this;
		var windows = core.module.layout.workspace.window_manager.window;
		for (var i=0; i < windows.length; i++) {
			var window = windows[i];
			var remains = [];

			if (window.project == this.current_debug_project) {
				var filename = window.filename;
				
				if(window.editor === null) continue;				
				var breakpoints = window.editor.breakpoints;
				for(var j=0; j < self.breakpoints.length; j++) {
					remains.push(self.breakpoints[j]);
				}

				if(breakpoints.length > 0){
					for(var j=0; j < breakpoints.length; j++) {
						var breakpoint = breakpoints[j];
						breakpoint += 1;
						var classname = filename.split('.java')[0];
						
						breakpoint = classname+":"+breakpoint;
						var result = remains.inArray(breakpoint);
						if(result == -1) {
							self.terminal.send_command("stop at "+breakpoint+"\r", />|(main\[[\d]\][\s\n]*)$/);
							self.breakpoints.push(breakpoint);
						}
						else {
							remains.remove(result);
						}
					}
				}
				else {
					// no breakpoints
				}
				
				for(var j=0; j < remains.length; j++) {
					var result = self.breakpoints.inArray(remains[j]);
					if(result != -1) {
						self.breakpoints.remove(result);
						self.terminal.send_command("clear "+remains[j]+"\r", self.prompt);
					}
				}
			}
		}
	},
	
	build: function (projectName, projectPath, callback) {
		var self=this;
		
		this.path_project = "";

		var buildOptions = "";
//		var buildOptions = $("#buildConfiguration").find('[name=plugin\\.c\\.buildOptions]').val();		
//		if(buildOptions == undefined){
//			buildOptions = core.dialogPreference.preference['plugin.c.buildOptions'];
//		}
//		
		var buildSource = "src/project/main.java";
//		var buildSource = $("#buildConfiguration").find('[name=plugin\\.c\\.buildSource]').val();		
//		if(buildSource == undefined){
//			buildSource = core.dialogPreference.preference['plugin.c.buildSource'];
//		}
//		
		var cmd1 = "javac "+buildSource+" -g";
		console.log(cmd1);
		core.module.layout.terminal.send_command(cmd1+'\r', null, function(){
			core.module.layout.project_explorer.refresh();
		});
		if(callback) callback();
	},
	clean: function(){
		console.log("java clean");
		core.module.layout.project_explorer.refresh();
	}
};