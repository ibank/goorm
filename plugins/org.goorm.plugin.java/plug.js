/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.java = function () {
	this.name = "java";
	this.mainmenu = null;
	this.current_debug_project = null;
	this.terminal = null;
	this.breakpoints = null;
	this.preference = null;
};

org.goorm.plugin.java.prototype = {
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
		
		this.preference = core.preference.plugins['org.goorm.plugin.java'];
	},
	
	add_project_item: function () {
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='javap'><div class='project_type_icon'><img src='/org.goorm.plugin.java/images/java.png' class='project_icon' /></div><div class='project_type_title'>Java Project</div><div class='project_type_description'>Java Project using SUN Java Compiler Collection</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all javap' description='  Create New Project for Java' projecttype='java' plugin_name='org.goorm.plugin.java'><img src='/org.goorm.plugin.java/images/java_console.png' class='project_item_icon' /><br /><a>Java Console Project</a></div>");
		
		$(".project_dialog_type").append("<option value='c'>Java Projects</option>").attr("selected", "");;
		
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
			project_desc,
			use_collaboration
		   }
		*/
		var send_data = {
				"plugin" : "org.goorm.plugin.java",
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
		var property = core.property.plugins['org.goorm.plugin.java'];
		
		var classpath = property['plugin.java.build_path'];
		var classname = property['plugin.java.main'];

		var cmd1 = "java -cp "+classpath+" "+classname;
		core.module.layout.terminal.send_command(cmd1+'\r');

	},
	
	debug: function (path) {
		var self = this;
		var property = core.property.plugins['org.goorm.plugin.java'];
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
		
		$(debug_module).off("debug_end");
		$(debug_module).on("debug_end",function(){
			table_variable.initializeTable();
			table_variable.refreshView();
			
			// clear highlight lines
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i in windows) {
				var window = windows[i];
				if (window.project == self.current_debug_project) {
					window.editor && window.editor.clear_highlight();
				}
			}
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
		var property = core.property.plugins['org.goorm.plugin.java'];
		var table_variable = core.module.debug.table_variable;
		
		var mainPath = " "+property['plugin.java.main'];
		var buildPath = " "+property['plugin.java.build_path'];
		
		if(this.terminal === null) {
			console.log("no connection!");
			return ;
		}
		switch (cmd.mode) {
		case 'init' :
			self.terminal.send_command("jdb -classpath"+buildPath+mainPath+"\r", null);
			self.set_breakpoints();
			self.terminal.send_command("run\r", />/, function(){
				self.debug_get_status();
			});
			break;
		case 'continue':
			self.set_breakpoints();
			self.terminal.send_command("cont\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		case 'terminate':
//			self.set_breakpoints();
			self.terminal.flush_command_queue();
			self.terminal.send_command("exit\r", self.prompt); 
			
			table_variable.initializeTable();
			table_variable.refreshView();
			
			// clear highlight lines
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i in windows) {
				var window = windows[i];
				if (window.project == self.current_debug_project) {
					window.editor && window.editor.clear_highlight();
				}
			}
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
		
		// clear highlight lines
		var windows = core.module.layout.workspace.window_manager.window;
		for (var i in windows) {
			var window = windows[i];
			if (window.project == self.current_debug_project) {
				window.editor && window.editor.clear_highlight();
			}
		}
		
		$.each(lines, function(i, line){
			if(line == '') return;
			// 현재 라인 처리
			var regex = /\[1\].*\((.*):([\d]+)\)/;
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
		var property = core.property.plugins['org.goorm.plugin.java'];
		var windows = core.module.layout.workspace.window_manager.window;
		var remains = [];
		var breakpoints = [];
		for (var i=0; i < windows.length; i++) {
			var window = windows[i];

			if (window.project == this.current_debug_project) {
				var filename = window.filename;
				var filepath = window.filepath;
				if(window.editor === null) continue;				
				
				for (var j = 0; j < window.editor.breakpoints.length; j++) {
					var breakpoint = window.editor.breakpoints[j];
					breakpoint += 1;
					var classname = filename.split('.java')[0];
					var package = filepath.split(property['plugin.java.source_path']).pop();
					package = package.replace("/", ".");
					
					breakpoint = package + classname + ":" + breakpoint;
					breakpoints.push(breakpoint);
				}
			}
		}
		
		for(var j=0; j < self.breakpoints.length; j++) {
			remains.push(self.breakpoints[j]);
		}
		
		if(breakpoints.length > 0){
			for(var j=0; j < breakpoints.length; j++) {
				var breakpoint = breakpoints[j];
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
				self.terminal.send_command("clear "+remains[j]+"\r", />|(main\[[\d]\][\s\n]*)$/);
			}
		}

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
		var plugin = property.plugins['org.goorm.plugin.java'];
		var buildOptions = " "+plugin['plugin.java.build_option'];
		var buildPath = " -d "+workspace+projectName+"/"+plugin['plugin.java.build_path'];
		var classPath = " -cp "+workspace+projectName+"/"+plugin['plugin.java.source_path'];
		
		var cmd = 'find '+workspace+projectName+"/"+plugin['plugin.java.source_path']+' -name "*.java" -print > '+workspace+projectName+'/file.list';
		var cmd1 = "javac"+classPath+buildPath+buildOptions+" @"+workspace+projectName+"/file.list";

		core.module.layout.terminal.send_command(cmd+'\r', null, function(){
			core.module.layout.terminal.send_command(cmd1+'\r', null, function(){
				core.module.layout.project_explorer.refresh();
			});
		});
		if(callback) callback();
	},
	
	clean: function(project_name){
		var workspace = core.preference.workspace_path;
		var property = core.property;
		if(project_name) {
			core.workspace[project_name] && (property = core.workspace[project_name])
		}
		else {
			var project_name = core.status.current_project_path;
		}
		var plugin = property.plugins['org.goorm.plugin.java'];
		var buildPath = plugin['plugin.java.build_path'];
		core.module.layout.terminal.send_command("rm -rf "+workspace+project_name+"/"+buildPath+"* \r", null, function(){
			core.module.layout.project_explorer.refresh();
		});
	}
};