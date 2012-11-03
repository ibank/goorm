/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.nodejs = function () {
	this.name = "nodejs";
	this.mainmenu = null;
	this.debug_con = null;
	this.current_debug_project = null;
	this.terminal = null;
	this.breakpoints = null;
};

org.goorm.plugin.nodejs.prototype = {
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
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='nodejsp'><div class='project_type_icon'><img src='/org.goorm.plugin.nodejs/images/nodejs.png' class='project_icon' /></div><div class='project_type_title'>nodejs Project</div><div class='project_type_description'>Server-side Javascript Project with node.js</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all nodejsp' description='  Create New Project for nodejs' projecttype='nodejs'  plugin_name='org.goorm.plugin.nodejs'><img src='/org.goorm.plugin.nodejs/images/nodejs_console.png' class='project_item_icon' /><br /><a>nodejs Project</a></div>");
		
		$(".project_dialog_type").append("<option value='c'>nodejs Projects</option>").attr("selected", "");
		
	},
	
	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_nodejs\" localizationKey='file_new_nodejs_project'>nodejs Project</a></li>");
		this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_nodejs]").unbind("click");
		$("a[action=new_file_nodejs]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=nodejs]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=nodejs]").position().top - 100);
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
				"plugin" : "org.goorm.plugin.nodejs",
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			core.module.layout.project_explorer.refresh();
		});
	},
	
	run: function(path) {
		var self=this;
		var property = core.property.plugins['org.goorm.plugin.nodejs'];
		
		var source_path = property['plugin.nodejs.source_path'];
		var main = property['plugin.nodejs.main'];

		var cmd1 = "node "+source_path+main;
		core.module.layout.terminal.send_command(cmd1+'\r');

	},
	
	debug: function (path) {
		var self = this;
		var property = core.property.plugins['org.goorm.plugin.nodejs'];
		var table_variable = core.module.debug.table_variable;
		var debug_module = core.module.debug;
		this.terminal = core.module.layout.workspace.window_manager.open("/", "debug", "terminal", "Terminal").terminal;
		this.current_debug_project = path;
		this.prompt = /debug>/;
		this.terminal.debug_endstr = /program terminated/;
		
		// debug탭 초기화
		table_variable.initializeTable();
		table_variable.refreshView();
		
		this.breakpoints = [];
		
//		// debug start!
		var send_data = {
				"plugin" : "org.goorm.plugin.nodejs",
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
		
//		$(debug_module).off("value_changed");
//		$(debug_module).on("value_changed",function(e, data){
//			self.terminal.send_command("set "+data.variable+"="+data.value+"\r", self.prompt);
//		});
		
		$(debug_module).off("debug_end");
		$(debug_module).on("debug_end",function(){
			table_variable.initializeTable();
			table_variable.refreshView();
			
			$.get("/remove_port", {
				"port": self.debug_port
			});
			
			// clear highlight lines
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i in windows) {
				var window = windows[i];
				if (window.project == self.current_debug_project) {
					window.editor && window.editor.clear_highlight();
				}
			}
			
			setTimeout(function(){
				self.debug_cmd({mode:'terminate'});
			}, 500);
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
		var property = core.property.plugins['org.goorm.plugin.nodejs'];
		var table_variable = core.module.debug.table_variable;
		
		var main = property['plugin.nodejs.main'];
		var buildPath = " "+property['plugin.nodejs.source_path'];
		
		if(this.terminal === null) {
			console.log("no connection!");
			return ;
		}
				
		switch (cmd.mode) {
			case 'init':
				$.getJSON("/alloc_port", {
					"process_name": "node debug"
				}, function(result){
					self.debug_port = result.port;
					self.terminal.flush_command_queue();
					self.terminal.send_command("node debug --port=" + result.port+buildPath+main+"\r", null);
					setTimeout(function(){
						self.terminal.send_command("\r", /connecting.*ok/);
						self.set_breakpoints();
						self.debug_get_status();
					}, 1000);
					
				})
				break;
			case 'continue':
				self.set_breakpoints();
				self.terminal.send_command("cont\r", self.prompt, function(){
					setTimeout(function(){
						self.debug_get_status();
					}, 500);
				}); break;
				break;
			case 'terminate':
				self.terminal.flush_command_queue();
				self.terminal.send_command("quit\r", self.prompt);
				
				table_variable.initializeTable();
				table_variable.refreshView();
				
				$.get("/remove_port", {
					"port": self.debug_port
				});
				
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
					setTimeout(function(){
						self.debug_get_status();
					}, 500);
				}); break;
			case 'step_in':
				self.set_breakpoints();
				self.terminal.send_command("step\r", self.prompt, function(){
					setTimeout(function(){
						self.debug_get_status();
					}, 500);
				}); break;
			case 'step_out':
				self.set_breakpoints();
				self.terminal.send_command("out\r", self.prompt, function(){
					setTimeout(function(){
						self.debug_get_status();
					}, 500);
				}); break;
			default:
				break;
		}		
	},
	
	debug_get_status: function(){
		var self = this;
		this.terminal.send_command("backtrace\r", this.prompt, function(terminal_data){
			self.set_currentline(terminal_data);
		});
		
		// nodejs에서 전체 variable을 볼수있는 명령어가 없음.
//		this.terminal.send_command("locals\r", this.prompt, function(terminal_data){
//			self.set_debug_variable(terminal_data);
//		});
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
			var regex = /#0 (.*):([\d]+):([\d]+)/;
			if(regex.test(line)) {
				var match = line.match(regex);
				var filename = match[1];
				var line_number = match[2];
				console.log(filename, line_number);
				
				
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
		var property = core.property.plugins['org.goorm.plugin.nodejs'];
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
					filename = filename.split('.js')[0];
					breakpoint = "'" + filename + "', " + breakpoint;
					
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
					self.terminal.send_command("setBreakpoint(" + breakpoint + ")\r", />|(main\[[\d]\][\s\n]*)$/);
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
				self.terminal.send_command("clearBreakpoint(" + remains[j] + ")\r", />|(main\[[\d]\][\s\n]*)$/);
			}
		}

	},
	
	build: function (projectName, callback) {
		var self=this;
		
		console.log("build not needed for nodejs.");
		
		if(callback) callback();
	},
	clean: function(){
		console.log("nodejs clean");
	}
};