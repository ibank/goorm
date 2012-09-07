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
		
		// debug탭 초기화
		table_variable.initializeTable();
		table_variable.refreshView();
		
		this.breakpoints = [];
		
//		// debug start!
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
		
		this.status_updated = false;
		this.data_buffer = null;
		this.debug_buffer = null;
		this.timeouts = [];

		if(this.started == true) {
			this.started = false;
			return;
		}
		this.started = false;
		
		
		// command receive
		$(core.module.debug).on("terminal_msg", function (e, data) {
//			data = JSON.parse(data);
//			if(data.terminal_name != "debug") return;
//			data = data.stdout;
			
			// buffering
			// datacode 10 : \n
//			if(data.charCodeAt(data.length-1) != 10) {
//				if(self.data_buffer === null){
//					self.data_buffer = data;
//				}
//				else {
//					self.data_buffer += data;
//				}
//				return ;
//			}
//			else {
//				if(self.data_buffer !== null){
//					data = self.data_buffer + data;
//					self.data_buffer = null;
//				}
//			}
//			console.log(1,data);
			
			var regex_locals = /Local variables:/;
			var regex_where = /where/;
			var regex_jdb = /main\[[\d]\]/;
			
			if(/application exited/.test(data)) {
			// 커넥션 끊겼을시 처리
//				self.terminal.send_command("exit\r");
				table_variable.initializeTable();
				table_variable.refreshView();
				
				// timeout 제거
				while(self.timeouts.length > 0) {
					clearTimeout(self.timeouts.pop());
				}
				
				// highlight 제거
				var windows = core.module.layout.workspace.window_manager.window;
				for (var i in windows) {
					var window = windows[i];
					if(window.editor)
						window.editor.clear_highlight();
				}
			}
			// jdb ready
			else if(self.started === false && /Initializing jdb/.test(data)) {
				self.debug_cmd({
					"mode":"run",
					"project_path":path
				});
				self.started = true;
			}
			// 명령어가 실행된 뒤 현재라인과 변수를 불러온다.
			else if (self.started === true && self.status_updated === false && regex_jdb.test(data)) {
				self.terminal.send_command("where\r");
//				var t1 = setTimeout(function(){
//					
//				}, 200);
				
				var t2 = setTimeout(function(){
					self.terminal.send_command("locals\r");
				}, 200);
				
//				self.timeouts.push(t1);
				self.timeouts.push(t2);
				self.status_updated = true;
			}
			
			// jdb명령어가 실행되면 다음 jdb명령까지 데이터를 모은다.
			if(regex_jdb.test(data)) {
				if(self.debug_buffer != null) {
					
					// 현재 라인 처리하는 부분.
					var lines = self.debug_buffer.split('\n');
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
						}
						
						if(regex_locals.test(line)) {
							// local variable 시작
							console.log("@catch","locals");
							cmd = 2;
							table_variable.initializeTable();
						}
						else if(cmd == 2) {
							// local variable 추가
							var variable = line.split(' = ');
							table_variable.addRow({"variable":variable[0].trim(),"value":variable[1].trim()});
						}
//						console.log('line',line);
//						console.log('cmd',cmd);
					});
					table_variable.refreshView();
				}
				self.debug_buffer = data;
//				console.log(2,self.debug_buffer);
			}
			else {
				self.debug_buffer += '\n'+data;
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
		
		if(cmd.mode == "init") {
			self.terminal.send_command("jdb -classpath src/project/ main\r");
		}
		
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
							self.terminal.send_command("stop at "+breakpoint+"\r");
							self.breakpoints.push(breakpoint);
						}
						else {
							remains.remove(result);
						}
					}
				}
				else {
					// no breakpoints
					this.status_updated = true;
				}
				
				for(var j=0; j < remains.length; j++) {
					var result = self.breakpoints.inArray(remains[j]);
					if(result != -1) {
						self.breakpoints.remove(result);
						self.terminal.send_command("clear "+remains[j]+"\r");
					}
				}
			}
		}
		
		switch (cmd.mode) {
		case 'run':
			self.terminal.send_command("run\r"); break;
		case 'continue':
			self.terminal.send_command("cont\r"); break;
		case 'terminate':
			self.terminal.send_command("exit\r"); 
			table_variable.initializeTable();
			table_variable.refreshView();
			self.status_updated = true;
			break;
		case 'step_over':
			self.terminal.send_command("next\r"); break;
		case 'step_in':
			self.terminal.send_command("step\r"); break;
		case 'step_out':
			self.terminal.send_command("step up\r"); break;
		default : break;
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
		core.module.layout.terminal.send_command(cmd1+'\r');
		
		if(callback) callback();
	},
	clean: function(){
		console.log("java clean");
	}
};