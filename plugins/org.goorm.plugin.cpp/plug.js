/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.plugin.cpp = function () {
	this.name = "cpp";
	this.mainmenu = null;
	this.debug_con = null;
	this.current_debug_project = null;
	this.terminal = null;
	this.preference = null;
};

org.goorm.plugin.cpp.prototype = {
	init: function () {
		this.add_project_item();
		
		this.mainmenu = core.module.layout.mainmenu;
		
		//this.debugger = new org.goorm.core.debug();
		//this.debug_message = new org.goorm.core.debug.message();
		
		this.cErrorFilter = /[A-Za-z]* error: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.cWarningFilter = /[A-Za-z]* warning: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.lineFilter = /:[0-9]*:/;
		
		this.add_mainmenu();
		
		this.add_menu_action();
		
		//core.dictionary.loadDictionary("plugins/org.uizard.plugin.c/dictionary.json");
		
		this.preference = core.preference.plugins['org.goorm.plugin.cpp'];
	},
	
	add_project_item: function () {
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project_type='cpp'><div class='project_type_icon'><img src='/org.goorm.plugin.cpp/images/cpp.png' class='project_icon' /></div><div class='project_type_title'>C/C++ Project</div><div class='project_type_description'>C/C++ Project using GNU Compiler Collection</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all cpp' description='  Create New Project for C' project_type='cpp' plugin_name='org.goorm.plugin.cpp'><img src='/org.goorm.plugin.cpp/images/cpp_console.png' class='project_item_icon' /><br /><a>C Console Project</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all cpp' description='  Create New Project for C++' project_type='cpp' plugin_name='org.goorm.plugin.cpp'><img src='/org.goorm.plugin.cpp/images/cpp_console.png' class='project_item_icon' /><br /><a>C++ Console Project</a></div>");
		
		$(".project_dialog_type").append("<option value='cpp'>C/C++ Projects</option>").attr("selected", "");


	},
	
	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_cpp\" localizationKey='file_new_cpp_project'>C/C++ Project</a></li>");
		//this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_cpp]").unbind("click");
		$("a[action=new_file_cpp]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project_type=cpp]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project_type=cpp]").position().top - 100);
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
		case "C Console Project": 
			data.project_detailed_type="c";
			data.plugins["org.goorm.plugin.cpp"]["plugin.dart.main"] = "main";
			break;
		case "C++ Console Project": 
			data.project_detailed_type="cpp";
			data.plugins["org.goorm.plugin.cpp"]["plugin.dart.main"] = "main";
			break;
		default:
			data.project_detailed_type="c";
			data.plugins["org.goorm.plugin.cpp"]["plugin.dart.main"] = "main";
		}
		var send_data = {
				"plugin" : "org.goorm.plugin.cpp",
				"uid" : core.user.uid,
				"gid" : core.user.gid,
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
		var property = core.property.plugins['org.goorm.plugin.cpp'];
		
		var classpath = property['plugin.cpp.build_path'];
		var classname = property['plugin.cpp.main'];

		var cmd1 = "./"+classpath+classname;
		core.module.layout.terminal.send_command(cmd1+'\r', null, function(result){

			var reg = /(.*)\w(.*)/g;
			var message = result.replace(cmd1, "").match(reg);
			message.pop();
			if(/No such file or directory/g.test(message)||/그런 파일이나 디렉터리가 없습니다/g.test(message)) {
				// 실행 실패
				//alert.show(core.module.localization.msg['alert_plugin_run_error']);
			
				core.module.project.build.project.handle_build_for_run('run');


			}
			else {
				// 아무 메시지도 안떴으면 성공.
				notice.show(core.module.localization.msg['alert_plugin_run_success']);
			}
		});
	},
	
	debug: function (path) {
		var self = this;
		var property = core.property.plugins['org.goorm.plugin.cpp'];
		var table_variable = core.module.debug.table_variable;
		var debug_module = core.module.debug;
		this.terminal = core.module.layout.workspace.window_manager.open("/", "debug", "terminal", "Terminal").terminal;
		this.current_debug_project = path;
		this.prompt = /\(gdb\) $/;
		this.terminal.debug_endstr = /exited normally/;
		
		// debug탭 초기화
		table_variable.initializeTable();
		table_variable.refreshView();
		
		this.breakpoints = [];
		
		// debug start!
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
		
		$(debug_module).off("value_changed");
		$(debug_module).on("value_changed",function(e, data){
			self.terminal.send_command("p "+data.variable+"="+data.value+"\r", self.prompt);
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
		var property = core.property.plugins['org.goorm.plugin.cpp'];
		var table_variable = core.module.debug.table_variable;
		
		var workspace = core.preference.workspace_path;
		var projectName = core.status.current_project_path+"/";
		var mainPath = property['plugin.cpp.main'];
		var buildPath = property['plugin.cpp.build_path'];
		
//		if(this.terminal === null) {
//			console.log("no connection!");
//			var result = {result:false, code:6};
//			core.module.project.display_error_message(result, 'alert');
//			return ;
//		}
		
		switch (cmd.mode) {
		case 'init':
			self.terminal.flush_command_queue();
			self.terminal.send_command("gdb "+workspace+projectName+buildPath+mainPath+" --quiet\r", null);
			self.set_breakpoints();
			self.terminal.send_command("run\r", self.prompt, function(){
				self.debug_get_status();
			});
			break;
		case 'continue':
			self.set_breakpoints();
			self.terminal.send_command("continue\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		case 'terminate':
			self.terminal.flush_command_queue();
			self.terminal.send_command("quit\r", self.prompt);
			setTimeout(function(){
				self.terminal.send_command("y\r", /(Exit|Quit) anyway\?/);
				self.terminal.flush_command_queue();
			}, 500);
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
			self.terminal.send_command("finish\r", self.prompt, function(){
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

		// Timing Problem by nys
		//
		setTimeout(function(){
			self.terminal.send_command("info locals\r", self.prompt, function(local_terminal_data){
				self.set_debug_variable(local_terminal_data);
			});
		}, 500)
	},
	
	set_currentline: function(terminal_data){
		var self = this;
		var lines = terminal_data;
//		var lines = terminal_data.split('\n');
		
		// clear highlight lines
		var windows = core.module.layout.workspace.window_manager.window;
		for (var i in windows) {
			var window = windows[i];
			if (window.project == self.current_debug_project) {
				window.editor && window.editor.clear_highlight();
			}
		}

//		$.each(lines, function(i, line){
			if(lines == '') return;
			// 현재 라인 처리
			var regex = /at ((.*)\/)?(.*):(\d+)/;
			
			if(regex.test(lines)) {
				var match = lines.match(regex);
				var filepath = match[2];
				var filename = match[3];
				var line_number = match[4];
				
				var windows = core.module.layout.workspace.window_manager.window;
								
				for (var j=0; j<windows.length; j++) {
					var window = windows[j];
					
					if (window.project == self.current_debug_project 
							&& window.filename == filename){
						
						if(filepath && filepath.search(window.filepath.substring(0, window.filepath.length-1)) > -1) {
							window.editor.highlight_line(line_number);
						}
						else if (!filepath) {
							window.editor.highlight_line(line_number);
						}
					}
				}
			}
//		});
	},

	set_debug_variable: function(terminal_data){
		var lines = terminal_data.split('\n');
		var locals = {};
		var table_variable = core.module.debug.table_variable;
		
		// var analysis = {
		// 	get_type : function(line){
		// 		if(/=/.test(line)){
		// 			var variable = line.slice(0, line.indexOf(" = "));
		// 			var word = line.slice(line.indexOf(" = ")+3, line.length);
		// 			if(word){
		// 				if(/^{/.test(word)){
		// 					return {
		// 						'type' : 'array',
		// 						'variable' : variable,
		// 						'data' : word
		// 					}
		// 				}
		// 				else if(/^0x/.test(word)){
		// 					return {
		// 						'type' : 'pointer',
		// 						'variable' : variable,
		// 						'data' : line
		// 					}
		// 				}
		// 				else{
		// 					return {
		// 						'type' : 'number',
		// 						'variable' : variable,
		// 						'data' : line
		// 					}
		// 				}
		// 			}
		// 		}
		// 		else{
		// 			if(/^0x/.test(line)){
		// 				return {
		// 					'type' : 'pointer',
		// 					'value' : line
		// 				}
		// 			}
		// 			else{
		// 				return {
		// 					'type' : 'number',
		// 					'value' : line
		// 				}
		// 			}
		// 		}
		// 	},

		// 	get_value : function(word){
		// 		var variable = word.split(' = ');
		// 		console.log(variable);
		// 		return {
		// 			'variable' : variable[0].trim(),
		// 			'value' : variable[1].trim()
		// 		}
		// 	},

		// 	array_process : function(word){
		// 		var self = this;

		// 		word = word.replace("{", "");
		// 		word = word.replace("}", "");

		// 		var array = {};
		// 		var words = word.split(',').map(function(o){ return o.trim(); });

		// 		$.each(words, function(i, __word){
		// 			var __word_type = self.get_type(__word);
		// 			array[i] = __word_type;
		// 		});

		// 		return array;
		// 	},

		// 	pointer_process : function(word){
		// 		var self = this;
		// 		var data = self.get_value(word);

		// 		return {
		// 			'type' : 'pointer',
		// 			'value' : data.value
		// 		}
		// 	},

		// 	number_process : function(word){
		// 		var self = this;
		// 		var data = self.get_value(word);

		// 		return {
		// 			'type' : 'number',
		// 			'value' : data.value
		// 		}
		// 	},

		// 	start : function(lines){
		// 		var self = this;

		// 		$.each(lines, function(i, line){
		// 			if(line == '' || /info locals/.test(line) || /gdb/.test(line)) return;

		// 			var word = self.get_type(line);
		// 			switch(word.type){
		// 				case 'array':
		// 					locals[word.variable] = self.array_process(word.data);
		// 					break;

		// 				case 'pointer':
		// 					locals[word.variable] = self.pointer_process(word.data);
		// 					break;

		// 				case 'number':
		// 					locals[word.variable] = self.number_process(word.data);
		// 					break;

		// 				default:
		// 					break;
		// 			}
		// 		});
		// 	},

		// 	push : function(table_variable){

		// 	}
		// }


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
		for (var i in windows) {
			var window = windows[i];
			if (window.project == this.current_debug_project) {
				var filename = window.filename;
				
				if(!window.editor) continue;				
				var breakpoints = window.editor.breakpoints;
				if(breakpoints.length > 0){
					self.terminal.send_command('clear\r', self.prompt);
					
					for(var i=0; i < breakpoints.length; i++) {
						var breakpoint = breakpoints[i];
						breakpoint += 1;
						breakpoint = filename+":"+breakpoint;
						self.terminal.send_command("break "+breakpoint+"\r", self.prompt);
					}
				}
				else {
					// no breakpoints
				}
			}
		}
	},
	
	build: function (projectName,callback) {
		var build_result=false;
		var self=this;
		var workspace = core.preference.workspace_path;
		var property = core.property;
		if(projectName) {
			core.workspace[projectName] && (property = core.workspace[projectName])
		}
		else {
			var projectName = core.status.current_project_path;
		}
		var plugin = property.plugins['org.goorm.plugin.cpp'];
		var sourcePath = " "+workspace+projectName+"/"+plugin['plugin.cpp.source_path'];
		var buildOptions = " "+plugin['plugin.cpp.build_option'];
		var buildPath = " "+workspace+projectName+"/"+plugin['plugin.cpp.build_path']+plugin['plugin.cpp.main'];
		
		var cmd = workspace+projectName+"/"+"make"+sourcePath+buildPath+buildOptions;
		
		core.module.layout.terminal.send_command(cmd+'\r', null, function(result){
			if(/Build Complete/g.test(result)){
				notice.show(core.module.localization.msg['alert_plugin_build_success']);
				build_result=true;

			}
			else {
				alert.show(core.module.localization.msg['alert_plugin_build_error']);
				build_result=false;
			}
			core.module.layout.project_explorer.refresh();
			
			if(callback)callback(build_result);
		});
		
		
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
		var plugin = property.plugins['org.goorm.plugin.cpp'];
		var buildPath = plugin['plugin.cpp.build_path'];
		core.module.layout.terminal.send_command("rm -rf "+workspace+project_name+"/"+buildPath+"* \r", null, function(){
			core.module.layout.project_explorer.refresh();
		});
	}
};