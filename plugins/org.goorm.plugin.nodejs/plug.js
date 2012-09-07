/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.plugin.nodejs = function () {
	this.name = "nodejs";
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

org.goorm.plugin.nodejs.prototype = {
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
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='nodejsp'><div class='project_type_icon'><img src='/org.goorm.plugin.nodejs/images/nodejs.png' class='project_icon' /></div><div class='project_type_title'>nodejs Project</div><div class='project_type_description'>nodejs Project using GNU Compiler Collection</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all nodejsp' description='  Create New Project for nodejs' projecttype='nodejs'><img src='/org.goorm.plugin.nodejs/images/nodejs_console.png' class='project_item_icon' /><br /><a>nodejs Project</a></div>");
		
		$(".project_dialog_type").append("<option value='c'>nodejs Projects</option>");
		
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
			project_about,
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
		
		var classpath = "";
		var classname = "main.js";

		var cmd1 = "node "+classpath+" "+classname;
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
		
		this.debug_port = null;
		this.status_updated = false;
		var debug_buffer = null;
		var timeouts = [];

		var flags = {
			"started" : 	false,
			"terminated" : 	false,
			"connected" :	false,
			"prompt" :		false
		}
		
		// command receive
		$(core.module.debug).off("terminal_msg");
		$(core.module.debug).on("terminal_msg", function (e, data) {
//			var regex_locals = /Local variables:/;
			var regex_where = /backtrace/;
			var regex_ndb = /debug>/;
			
			if(/program terminated/.test(data)) {
				flags.terminated = true;
			}
			// ndb ready
			else if(/connecting[\. ]*ok/.test(data)) {
				flags.connected = true;
			}
			else if(regex_ndb.test(data)) {
				flags.prompt = true;
			}
				
			if(flags.terminated) {
				// 커넥션 끊겼을시 처리
//				self.terminal.send_command("quit\r");
				table_variable.initializeTable();
				table_variable.refreshView();
				
				// timeout 제거
				while(timeouts.length > 0) {
					clearTimeout(timeouts.pop());
				}
				
				$.get("/remove_port", {"port":self.debug_port});
				
				// highlight 제거
				var windows = core.module.layout.workspace.window_manager.window;
				for (var i in windows) {
					var window = windows[i];
					if(window.editor)
						window.editor.clear_highlight();
				}
				flags.terminated = false;
			}
			else if (!flags.started && flags.connected && flags.prompt) {
				console.log("nodejs","ready");
				self.debug_cmd({
					"mode":"run",
					"project_path":path
				});
				flags.started = true;
				flags.connected = false;
				flags.prompt = false;
			}
			// 명령어가 실행된 뒤 현재라인과 변수를 불러온다.
			else if (flags.started && self.status_updated === false && flags.prompt) {
				self.terminal.send_command("backtrace\r");
//				var t1 = setTimeout(function(){
//					
//				}, 200);
				
//				var t2 = setTimeout(function(){
//					self.terminal.send_command("locals\r");
//				}, 200);
				
//				timeouts.push(t1);
//				timeouts.push(t2);
				self.status_updated = true;
				flags.prompt = false;
			}
			
//			console.log(data);
			
			// ndb명령어가 실행되면 다음 ndb명령까지 데이터를 모은다.
			if(regex_ndb.test(data)) {
				if(debug_buffer != null) {
					
					// 현재 라인 처리하는 부분.
					var lines = debug_buffer.split('\n');
					var cmd = null;
					$.each(lines, function(i, line){
						if(line == '') return;
						
						if(regex_where.test(line)) {
							// 현재 라인 시작
							console.log("@catch","where");
							cmd = 1;
						}
						else if(cmd == 1) {
							// 현재 라인 처리
							var regex = /#0 (.*):([\d]+):([\d]+)/;
							if(regex.test(line)) {
								var match = line.match(regex);
								console.log(match);
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
						}
						
//						if(regex_locals.test(line)) {
//							// local variable 시작
//							console.log("@catch","locals");
//							cmd = 2;
//							table_variable.initializeTable();
//						}
//						else if(cmd == 2) {
//							// local variable 추가
//							var variable = line.split(' = ');
//							table_variable.addRow({"variable":variable[0].trim(),"value":variable[1].trim()});
//						}
//						console.log('line',line);
//						console.log('cmd',cmd);
					});
					table_variable.refreshView();
				}
				debug_buffer = data;
//				console.log(2,debug_buffer);
			}
			else {
				debug_buffer += '\n'+data;
//				console.log(4,data);
			}
		});
		
		$(debug_module).off("value_changed");
		$(debug_module).on("value_changed",function(e, data){
			self.terminal.send_command("set "+data.variable+"="+data.value+"\r");
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
		
		if (cmd.mode == "init") {
			$.getJSON("/alloc_port", {
				"process_name": "node debug"
			}, function(result){
				self.debug_port = result.port;
				self.terminal.send_command("node debug --port=" + result.port + " main.js\r");
			})
		}
		else {
			// set break points
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i = 0; i < windows.length; i++) {
				var window = windows[i];
				var remains = [];
				
				if (window.project == this.current_debug_project) {
					var filename = window.filename;
					
					if (window.editor === null) 
						continue;
					var breakpoints = window.editor.breakpoints;
					for (var j = 0; j < self.breakpoints.length; j++) {
						remains.push(self.breakpoints[j]);
					}
					
					if (breakpoints.length > 0) {
						for (var j = 0; j < breakpoints.length; j++) {
							var breakpoint = breakpoints[j];
							breakpoint += 1;
							breakpoint = "'" + filename + "', " + breakpoint;
							var result = remains.inArray(breakpoint);
							if (result == -1) {
								console.log("nodejs", "setBreakpoint(" + breakpoint + ")");
								self.terminal.send_command("setBreakpoint(" + breakpoint + ")\r");
								self.breakpoints.push(breakpoint);
							}
							else {
								remains.remove(result);
							}
						}
					}
					else {
						// no breakpoints
//						this.status_updated = true;
					}
					
					for (var j = 0; j < remains.length; j++) {
						var result = self.breakpoints.inArray(remains[j]);
						if (result != -1) {
							self.breakpoints.remove(result);
							self.terminal.send_command("clearBreakpoint(" + remains[j] + ")\r");
						}
					}
				}
			}
			
			switch (cmd.mode) {
				case 'run':
					//			self.terminal.send_command("run\r"); 
					break;
				case 'continue':
					self.terminal.send_command("cont\r");
					break;
				case 'terminate':
					self.terminal.send_command("quit\r");
					table_variable.initializeTable();
					table_variable.refreshView();
					self.status_updated = true;
					$.get("/remove_port", {
						"port": self.debug_port
					});
					break;
				case 'step_over':
					self.terminal.send_command("next\r");
					break;
				case 'step_in':
					self.terminal.send_command("step\r");
					break;
				case 'step_out':
					self.terminal.send_command("out\r");
					break;
				default:
					break;
			}
		}
		
	},
	
	build: function (projectName, projectPath, callback) {
		var self=this;
		
		console.log("build not needed for nodejs.");
		
		if(callback) callback();
	},
	clean: function(){
		console.log("nodejs clean");
	}
};