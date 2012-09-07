/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.plugin.cpp = function () {
	this.name = "c";
	this.mainmenu = null;
	this.build_options = null;
	this.build_source = null;
	this.build_target = null;
	this.build_file_type = "o";
	this.debug_con = null;
	this.current_debug_project = null;
	this.terminal = null;
};

org.goorm.plugin.cpp.prototype = {
	init: function () {
		this.addProjectItem();
		
		this.mainmenu = core.module.layout.mainmenu;
		
		//this.debugger = new org.goorm.core.debug();
		//this.debug_message = new org.goorm.core.debug.message();
		
		this.cErrorFilter = /[A-Za-z]* error: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.cWarningFilter = /[A-Za-z]* warning: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.lineFilter = /:[0-9]*:/;
		
		this.add_mainmenu();
		
		//core.dictionary.loadDictionary("plugins/org.uizard.plugin.c/dictionary.json");
	},
	
	addProjectItem: function () {
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='cpp'><div class='project_type_icon'><img src='/org.goorm.plugin.cpp/images/cpp.png' class='project_icon' /></div><div class='project_type_title'>C/C++ Project</div><div class='project_type_description'>C/C++ Project using GNU Compiler Collection</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all cpp' description='  Create New Project for C' projecttype='cpp'><img src='/org.goorm.plugin.cpp/images/cpp_console.png' class='project_item_icon' /><br /><a>C/C++ Console Project</a></div>");
		
		$(".project_dialog_type").append("<option value='cpp'>C/C++ Projects</option>");
		
	},
	
	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_cpp\" localizationKey='file_new_cpp_project'>C/C++ Project</a></li>");
		this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_cpp]").unbind("click");
		$("a[action=new_file_cpp]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=cpp]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=cpp]").position().top - 100);
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
				"plugin" : "org.goorm.plugin."+data.project_type,
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			core.module.layout.project_explorer.refresh();
		});
	},
	
	run: function(path) {
		var self=this;
		
		this.path_project = "";

		var classname = "main";

		var cmd1 = "./"+classname;
		console.log(cmd1);
		core.module.layout.terminal.send_command(cmd1+'\r');
	},
	
	debug: function (path) {
		var self = this;
		var table_variable = core.module.debug.table_variable;
		var debug_module = core.module.debug;
		this.terminal = core.module.layout.workspace.window_manager.open("/", "debug", "terminal", "Terminal").terminal;
		this.current_debug_project = path;
		
		// debug탭 초기화
		table_variable.initializeTable();
		table_variable.refreshView();
		
//		// debug start!
		var send_data = {
				"plugin" : "org.goorm.plugin.cpp",
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
		
		this.status_updated = false;
		this.data_buffer = null;
		this.debug_buffer = null;
		this.timeouts = [];
		
		var flags = {
			"started" : 	false,
			"terminated" : 	false,
			"connected" :	false,
			"prompt" :		false
		}
		
		// command receive
		$(core.module.debug).off("terminal_msg");
		$(core.module.debug).on("terminal_msg", function (e, data) {
//			console.log(data);
			
			var regex_gdb = /\(gdb\)/;
			var regex_where = /where/;
			var regex_locals = /info locals/;
			
			if(/Program exited normally/.test(data)) {
				flags.terminated = true;
			}
			// gdb ready
			else if(/[\. ]*done/.test(data)) {
				flags.connected = true;
			}
			// 명령어가 실행된 뒤 현재라인과 변수를 불러온다.
			else if (regex_gdb.test(data)) {
				flags.prompt = true;
			}
			
			if (flags.terminated) {
				// 커넥션 끊겼을시 처리
				self.terminal.send_command("quit\r");
				table_variable.initializeTable();
				table_variable.refreshView();
				
				// timeout 제거
				while (self.timeouts.length > 0) {
					clearTimeout(self.timeouts.pop());
				}
				
				// highlight 제거
				var windows = core.module.layout.workspace.window_manager.window;
				for (var i in windows) {
					var window = windows[i];
					if (window.editor) 
						window.editor.clear_highlight();
				}
				flags.terminated = false;
			}
			else if (!flags.started && flags.connected && flags.prompt) {
				self.debug_cmd({
					"mode":"run",
					"project_path":path
				});
				flags.started = true;
			}
			else if (flags.started && self.status_updated === false && flags.prompt) {
				var t1 = setTimeout(function(){
				self.terminal.send_command("where\r");
				}, 150);
				
				var t2 = setTimeout(function(){
					self.terminal.send_command("info locals\r");
				}, 300);
				
				self.timeouts.push(t1);
				self.timeouts.push(t2);
				self.status_updated = true;
			}
				
			
			
			// gdb명령어가 실행되면 다음 gdb명령까지 데이터를 모은다.
			if(regex_gdb.test(data)) {
				if(self.debug_buffer != null) {
//					console.log(self.debug_buffer);
					// 현재 라인 처리하는 부분.
					var lines = self.debug_buffer.split('\n');
					var cmd = null;
					$.each(lines, function(i, line){
						if(line == '') return;
						
						if(regex_where.test(line)) {
							// 현재 라인 시작
							cmd = 1;
						}
						else if(cmd == 1) {
							// 현재 라인 처리
							var regex = /#\d .* (.*):(\d+)/;
							if(regex.test(line)) {
								var match = line.match(regex);
								var filename = match[1];
								var line_number = match[2];
								
								var windows = core.module.layout.workspace.window_manager.window;
								for (var i in windows) {
									var window = windows[i];
									if (window.project == self.current_debug_project 
											&& window.filename == filename) {
										window.editor.highlight_line(line_number);
									}
								}
							}
						}
						
						if(regex_locals.test(line)) {
							// local variable 시작
							cmd = 2;
							table_variable.initializeTable();
						}
						else if(cmd == 2) {
							// local variable 추가
							var variable = line.split(' = ');
							if (variable.length == 2) {
								table_variable.addRow({
									"variable": variable[0].trim(),
									"value": variable[1].trim()
								});
							}
						}
					});
					table_variable.refreshView();
				}
				self.debug_buffer = data;
			}
			else {
				self.debug_buffer += '\n'+data;
			}
		});
		
		$(debug_module).off("value_changed");
		$(debug_module).on("value_changed",function(e, data){
			self.terminal.send_command("p "+data.variable+"="+data.value+"\r");
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
		
		this.status_updated = false;
		
		var windows = core.module.layout.workspace.window_manager.window;
		for (var i in windows) {
			var window = windows[i];
			if (window.project == this.current_debug_project) {
				var filename = window.filename;
				
				if(!window.editor) continue;				
				var breakpoints = window.editor.breakpoints;
				if(breakpoints.length > 0){
//					self.terminal.send_command('clear\r');
					
					for(var i=0; i < breakpoints.length; i++) {
						var breakpoint = breakpoints[i];
						breakpoint += 1;
						breakpoint = filename+":"+breakpoint;
						self.terminal.send_command("break "+breakpoint+"\r");
					}
				}
				else {
					// no breakpoints
					this.status_updated = true;
				}
			}
		}
		
		switch (cmd.mode) {
		case 'init':
			self.terminal.send_command("gdb main\r"); break;
		case 'run':
			self.terminal.send_command("run\r"); break;
		case 'continue':
			self.terminal.send_command("continue\r"); break;
		case 'terminate':
			self.terminal.send_command("quit\r"); 
			table_variable.initializeTable();
			table_variable.refreshView();
			self.status_updated = true;
			break;
		case 'step_over':
			self.terminal.send_command("next\r"); break;
		case 'step_in':
			self.terminal.send_command("step\r"); break;
		case 'step_out':
			self.terminal.send_command("finish\r"); break;
		default : break;
		}
		
	},
	
	build: function (projectName, projectPath, callback) {
		var self=this;
		
		this.path_project = "";

		var buildOptions = "-g";
//		var buildOptions = $("#buildConfiguration").find('[name=plugin\\.c\\.buildOptions]').val();		
//		if(buildOptions == undefined){
//			buildOptions = core.dialogPreference.preference['plugin.c.buildOptions'];
//		}
//		
		var buildSource = "main.c";
//		var buildSource = $("#buildConfiguration").find('[name=plugin\\.c\\.buildSource]').val();		
//		if(buildSource == undefined){
//			buildSource = core.dialogPreference.preference['plugin.c.buildSource'];
//		}
//		
		var buildTarget = "main";
//		var buildTarget = $("#buildConfiguration").find('[name=plugin\\.c\\.buildTarget]').val();		
//		if(buildTarget == undefined){
//			buildTarget = core.dialogPreference.preference['plugin.c.buildTarget'];
//		}
		
		var cmd1 = "gcc "+buildSource+" -o "+this.path_project+buildTarget+" -Wall"+" "+ buildOptions;
		console.log(cmd1);
		core.module.layout.terminal.send_command(cmd1+'\r');
		
		if(callback) callback();
	},
	clean: function(){
		console.log("cpp clean");
	}
};