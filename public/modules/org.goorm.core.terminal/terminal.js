/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/



org.goorm.core.terminal = function () {
	this.target = null;
	this.history = [];
	this.history_count = 0;
	this.socket = null;
	this.ansi_color_codes = [
		{key: '30', css: 'color:#000000;'},
		{key: '31', css: 'color:#FF8888;'},
		{key: '32', css: 'color:#88FF88;'},
		{key: '33', css: 'color:yellow;'},
		{key: '34', css: 'color:#8888FF;'},
		{key: '35', css: 'color:#FF33FF;'},
		{key: '36', css: 'color:cyan;'},
		{key: '37', css: 'color:white;'},
		{key: '01', css: 'font-weight:bold;'},
		{key: '04', css: 'text-decoration:underline;'},
		{key: '40', css: 'background-color:black;'},
		{key: '41', css: 'background-color:#FF8888;'},
		{key: '42', css: 'background-color:#88FF88;'},
		{key: '43', css: 'background-color:yellow;'},
		{key: '44', css: 'background-color:#8888FF;'},
		{key: '45', css: 'background-color:#FF33FF;'},
		{key: '46', css: 'background-color:cyan;'},
		{key: '47', css: 'background-color:white;'}
	];
	this.ansi_color_code_regexp = /\[([0-9][0-9];?)* ?m/g;
	this.bash_text_reset = /\[0*m/g;
	
	this.user = "";
	this.server = "";
	this.path = "";
	
	this.prompt_length = 0;
	
	//this.timestamp = "";
	
	this.in_panel = false;
	
	this.terminal_name = "";
	
	this.index = -1;
	
	this.timestamp = null;
	
	this.command_queue = null;
	
	this.default_prompt = /bash-\d\.\d\$/;
	 
	this.stdout = "";
	this.prompt = null;
	this.command_ready = true;
	this.running_queue = false;
	this.debug_endstr = null;
	this.platform = "darwin";
};

org.goorm.core.terminal.prototype = {
	init: function (target, terminal_name, in_panel) {
		var self = this;
		
		this.target = target;
		
		this.socket = io.connect();
		this.in_panel = in_panel;
		this.terminal_name = terminal_name;
		this.timestamp = new Date();
		this.command_queue = [];
		
		$(target).addClass('terminal');
		$(target).append("<div id='welcome'>welcome to goorm terminal :)</div>");
		$(target).append("<div id='results'></div>");
		$(target).append("<span id='prompt'><input id='prompt_input' class='prompt_input' /></div></span>");
		
		self.timestamp = (new Date()).getTime();
		//$(target).find("#results").append("<div id='result_" + self.timestamp + "'>");
		//$(target).find("#result_" + self.timestamp).append("<span id='prompt_user'>" + self.user+ "</span>@<span id='prompt_server'>" + self.server + "</span>:<span id='prompt_path'>" + self.path + "</span>$ <input id='prompt_input' />");
		
		//$(target).find("#prompt").html("<span id='prompt_user'>" + this.user+ "</span>@<span id='prompt_server'>" + this.server + "</span>:<span id='prompt_path'>" + this.path + "</span>$ <input id='prompt_input' />");
		
		//self.socket.emit("pty_execute_command", "");
		
		$(target).find("#prompt_input").keydown(function (event) {
			if (event.keyCode == '13') {
				event.preventDefault();

				//self.exec(command);
				
				//self.timestamp = (new Date()).getTime();
				//$(target).find("#results").append("<div id='result_" + self.timestamp + "'></div>");
				//$(target).find("#result_" + self.timestamp).append("<span id='prompt_user'>" + self.user+ "</span>@<span id='prompt_server'>" + self.server + "</span>:<span id='prompt_path'>" + self.path + "</span>$ ");
				
				var msg = {
					index: self.index,
					command: $(this).val()
				};
				
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
				
				self.history.push(msg.command);
				self.history_count = self.history.length - 1;
			}
			else if (event.keyCode == '40') { //Down Arrow
				if (self.history_count < self.history.length - 1) {
					self.history_count++;
				}
				
				$(self.target).find("#prompt_input").val(self.history[self.history_count]);
			}
			else if (event.keyCode == '38') { //Up Arrow
				if (self.history_count > 0) {
					self.history_count--;
				}
				
				$(self.target).find("#prompt_input").val(self.history[self.history_count]);
			}
			else if (event.keyCode == '9') { //Tab
				event.preventDefault();
				
				var msg = {
					index: self.index,
					command: $(this).val() + '\x09'
				};
				
				self.socket.emit("pty_execute_command", msg);
			}
			else if ((event.keyCode == '99' || event.keyCode == '67') && event.ctrlKey) { //Ctrl + C
				event.preventDefault();
				
				var msg = {
					index: self.index,
					command: $(this).val() + '\x03'
				};
				
				self.socket.emit("pty_execute_command", '\x03');
			}
			else if ((event.keyCode == '120' || event.keyCode == '88') && event.ctrlKey) { //Ctrl + X
				event.preventDefault();
				
				var msg = {
					index: self.index,
					command: $(this).val() + '\x18'
				};
				
				self.socket.emit("pty_execute_command", '\x18');
			}
			else if ((event.keyCode == '122' || event.keyCode == '90') && event.ctrlKey) { //Ctrl + Z
				event.preventDefault();
				
				var msg = {
					index: self.index,
					command: $(this).val() + '\x1A'
				};
				
				self.socket.emit("pty_execute_command", '\x1A');
			}
		});
		
		$(target).click(function () {
			$(self.target).find("#prompt_input").focus();
		});
		
		var temp_stdout = "";
		
		
		$(this).bind("got_index", function () {
			var msg = {
				index: self.index,
				project_path: core.status.current_project_path
			};
		
			self.socket.emit("change_project_dir", JSON.stringify(msg));
		});
		
		this.socket.on("on_change_project_dir", function (data) {
			$(self).trigger("terminal_ready");
		});
		
		this.socket.on("platform", function(data) {
			data = JSON.parse(data);
			if(data.platform == "darwin") {
				self.default_prompt = /bash-\d\.\d\$/;
			}
			else if (data.platform == "linux") {
				self.default_prompt = /.*@.*:.*$/;
			}
			self.platform = data.platform;
		});
		
		this.socket.on("terminal_index", function (data) {
			data = JSON.parse(data);
			
			if (self.index == -1 && self.timestamp == data.timestamp) {
				self.index = parseInt(data.index);
				
				$(self).trigger("got_index");
			}
		});
		
		var timeout = null;
		var result = function (msg, mode) {
			
			if (msg.terminal_name == self.terminal_name) {
				var stdout = msg.stdout;
				temp_stdout += stdout;
				
				if (mode == 1 || /\n/.test(stdout) || stdout.indexOf('$') > -1) {
					if(msg.terminal_name == "debug") {
						if(self.debug_endstr && self.debug_endstr.test(temp_stdout)) {
							$(core.module.debug).trigger("debug_end");
							self.command_queue = [];
						}
					}
					self.work_queue(temp_stdout);
					
					temp_stdout = temp_stdout.replace('[H', '').replace('[2J', '');
					
					temp_stdout = temp_stdout.replace(/\[\d[A-Z]/g, '');
					temp_stdout = self.transform_bash_to_html(temp_stdout);
					$(self.target).find("#results").append(temp_stdout);
					
					temp_stdout = "";
				}
				
				if(self.platform == "darwin") {
					$(self.target).find("#prompt_input").appendTo($(self.target).find("#results pre:last"));
				}
				else if(self.platform == "linux") {
					$(self.target).find("#prompt_input").appendTo($(self.target).find("#results"));
				}

				
				$(self.target).find("#prompt_input").val("");
				$(self.target).find("#prompt_input").focus();
				
				$(self.target).parent().parent().scrollTop(parseInt($(self.target).height()));
				
				if (stdout.indexOf('[2J') > -1) {
					var pre_count = $(self.target).find("#results pre").length;
					
					$(self.target).find("#results pre").each(function (i) {
						if (pre_count - 1 > i) {
							$(this).remove();
						}
					});
				}
				
				var from = (self.in_panel ? "panel" : "layout");
				
				self.resize_all(from);
			}
		}
		
		this.socket.on("pty_command_result", function(msg){
			result(msg);
			if(timeout) clearTimeout(timeout);
			timeout = setTimeout(function(){
				if(temp_stdout != "") {
					result(msg, 1);
				}
			},500);
		});
		
		this.socket.emit("terminal_join", '{"timestamp": "' + this.timestamp + '", "workspace": "'+ core.status.current_project_name +'", "terminal_name":"' + this.terminal_name + '"}');
		
		$(core).bind("layout_resized", function () {
			self.resize_all("layout");
		});
		
		$(this.target).bind("panel_resize", function () {
			self.resize_all("panel");
		});
		
		$(this.target).bind("panel_close", function () {
			self.socket.emit("terminal_leave", '{"workspace": "'+ core.status.current_project_name +'", "terminal_name":"' + self.terminal_name + '"}');
		});
		
		
		this.resize_all();
	},
	
	change_project_dir: function () {
		var self = this;
		
		if (this.index != -1) {
			var msg = {
				index: self.index,
				project_path: core.status.current_project_path
			};
		
			self.socket.emit("change_project_dir", JSON.stringify(msg));
		}
	},
	
	send_command: function (command, prompt, callback) {
		var msg = {
			index: this.index,
			command: command
		};
		if(!prompt) prompt = this.default_prompt;
		this.command_queue.push({"prompt":prompt, "command": msg});

		if (callback) {
			this.command_queue.push({
				"prompt": prompt,
				"callback": callback
			});
		}
		
//		console.log("cmd length:", this.command_queue.length);
		core.test = this.command_queue;
		if (this.command_queue.length < 3 ) {
			this.work_queue();
		}
	},
	
	flush_command_queue: function(){
		this.command_queue = [];
	},
	
	work_queue: function(stdout){
		var self = this;
		
		if(stdout){
			this.stdout += stdout;
		}

		if (this.command_queue === undefined || this.command_queue.length == 0) {
			this.command_queue = [];
			return;
		}
		
		if (this.running_queue) return;
		else this.running_queue = true;
		
		if(!this.prompt) this.prompt = this.default_prompt;
		this.prompt = this.command_queue[0].prompt;

		// prompt가 도착하면 command_ready를 활성화
		if(this.prompt.test(this.stdout)){
			this.command_ready = true;
		}
//		console.log('#', this.command_queue.length, this.command_ready, this.prompt, this.prompt.test(this.stdout));
		
		if(this.command_ready == true) {
			this.command_ready = false;
			var item = this.command_queue.shift();
			if(item) {
//				console.log(this.prompt);
				if (item.command) {
//					console.log("##", item.command);
					this.socket.emit("pty_execute_command", JSON.stringify(item.command));
					this.stdout = "";
				}
				else if (item.callback) {
//					console.log(this.stdout);
					item.callback(this.stdout);
				}
			}
		}
		
		this.running_queue = false;
		if(this.command_queue.length > 0) {
			setTimeout(function(){
				self.work_queue();
			}, 500);
		}
	},
	
	set_prompt: function (data) {
		data = data.replace(']0;', '');
		data = data.split('[')[0];
		data = data.split('@');
		this.user = data[0];
		this.server = data[1].split(':')[0];
		this.path = data[1].split(':')[1];

		$(this.target).find("#prompt").find("#prompt_user").html(this.user);
		$(this.target).find("#prompt").find("#prompt_server").html(this.server);
		$(this.target).find("#prompt").find("#prompt_path").html(this.path);
		
		return this.user + "@" + this.server + ":" + this.path + "$ ";
	},
	
	transform_bash_to_html: function (data) {		
		data = data.split("\n");
		
		for (var i=0; i<data.length; i++) {
			
			if (data[i].indexOf(']0;') > -1) {
				data[i] = this.set_prompt(data[i]);
			}
			else {
				var words = data[i].split(this.bash_text_reset);
				
				var new_words = '';
				/*
				if (words.length > 1) {
					new_words += "<table style='width:100%;'><tr>";
				}
				*/
				
				for (var j=0; j<words.length; j++) {
				
					var spaces = "";
					
					//console.log(words[j] + " / " + this.ansi_color_code_regexp.test(words[j]));
					if (this.ansi_color_code_regexp.test(words[j])) {
						var ansi_color_code = words[j].match(this.ansi_color_code_regexp);
						
						var new_word = "<span style='";
						
						for (var k=0; k<this.ansi_color_codes.length; k++) {
							if (ansi_color_code[0].indexOf(this.ansi_color_codes[k].key) > -1) { 
								new_word += this.ansi_color_codes[k].css;
							}
						}

						var word = words[j].replace(this.ansi_color_code_regexp, '');//.split(' ');
						
						//var value = word.pop();
						//spaces = word.join('&nbsp;');
						
						var value = word.split(' ').join('&nbsp;');
						//console.log(value);
						new_word += "'>" + value + "</span>" + '&nbsp;';
						
						/*
						if (words.length > 1) {
							new_word = "<td style='width:" + 100/words.length + "%;'>" + new_word + "</td>";
						}
						*/
						

						
						//words[j] = spaces + new_word;
						
						words[j] = new_word;
					} 
						
					words[j] = words[j].split('\t').join('&#9;');
				}
				
				
				
				new_words += words.join("");
				
				/*
				if (words.length > 1) {
					new_words += "</tr></table>";
				}
				*/
				
				data[i] = new_words.replace(this.ansi_color_code_regexp, '');
				
				if (data[i].replace(/ */g, "") != "\r") {
				//	if (data[i].indexOf("&#9;") > -1) {
						data[i] = "<pre>" + data[i] + "</pre>";
				//	}
				}
			}


		}
		
		this.prompt_length = data[data.length - 1].length;

		data = data.join("");
		
		return data;
	},
	
	resize_all: function (from) {
		if (self.in_panel && from == "panel") {
			var panel_width = $(this.target).parent().width() - 20;
			var panel_height = $(this.target).parent().height() - 50;
			var target_height = $(this.target).find("#results").height() + 20;
			var prompt_width = (this.prompt_length + 2) * 9;
			
			$(this.target).find("#prompt_input").width(panel_width - prompt_width);
			
			if (target_height < panel_height) {
				$(this.target).height(panel_height);
			}
			else {
				$(this.target).height(target_height);
			}
		}

		else if (from == "layout" && this.terminal_name != "debug") {
			var layout_bottom_width = $(".yui-layout-unit-bottom").find(".yui-layout-wrap").width() - 20;
			var layout_bottom_height = $(".yui-layout-unit-bottom").find(".yui-layout-wrap").height() - 36;
			var target_height = $(this.target).find("#results").height() + 20;
			var prompt_width = (this.prompt_length + 2) * 9;
			
			$(this.target).find("#prompt_input").width(layout_bottom_width - prompt_width);
			
			if (target_height < layout_bottom_height) {
				$(this.target).height(layout_bottom_height);
			}
			else {
				$(this.target).height(target_height);
			}
		}
	}
};