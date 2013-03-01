/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
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
	this.last_command = null;
	
	this.default_prompt = /bash-\d\.\d(\#|\$)/;
	 
	this.stdout = "";
	this.prompt = null;
	this.command_ready = true;
	this.running_queue = false;
	this.debug_endstr = null;
	this.platform = "darwin";

	this.temp_stdout = "";
	
	this.arrowed = false;
	this.arrowed_string = "";
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
		$(target).append("<div id='results' style='word-wrap:break-word'></div>");
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
				
				//var command = $(this).val();

				
				var msg = {
					index: self.index,
					command: "\r",
					special_key: true
				};
				
				if (self.arrowed_string != "") {					
					$(self.target).find("#results").find("pre:last").append(self.arrowed_string);
					self.arrowed_string = "";
				}
				
				
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
				

/*
				if(self.check_command($(this).val())){
					self.is_command = false;
					
					if(self.platform == 'linux') {
						$(self.target).find('#results').append(msg.command);
					}
					
					self.socket.emit("pty_execute_command", JSON.stringify(msg));
				}
*/

/*
				self.last_command = msg.command;
				self.history.push(msg.command);
				self.history_count = self.history.length;
				
				self.tabbed = false;
				self.tabbed_str = "";
*/
			}
			else if (event.keyCode == '40') { //Down Arrow
				var msg = {
					index: self.index,
					command: '\033[B',
					special_key: true
				};
				
				self.arrowed = true;
				
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
			}
			else if (event.keyCode == '38') { //Up Arrow
				var msg = {
					index: self.index,
					command: '\033[A',
					special_key: true
				};
				
				self.arrowed = true;
				
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
			}
			else if (event.keyCode == '9') { //Tab
				event.preventDefault();
				
				$(self.target).find("#prompt_input").val("");
				
				var msg = {
					index: self.index,
					command: $(this).val() + '\x09',
					special_key: true
				};
				
/*
				if (self.tabbed) {
					msg.command = msg.command.replace(self.tabbed_str, "");
				}
				
*/
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
			}
			else if (event.keyCode == '8') { //Backspace
				var msg = {
					index: self.index,
					command: '\x08',
					special_key: true
				};
				
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
			}
			else if ((event.keyCode == '99' || event.keyCode == '67') && event.ctrlKey) { //Ctrl + C
				event.preventDefault();
				
				var msg = {
					index: self.index,
					command: '\x03',
					special_key: true
				};
				
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
			}
			else if ((event.keyCode == '120' || event.keyCode == '88') && event.ctrlKey) { //Ctrl + X
				event.preventDefault();
				
				var msg = {
					index: self.index,
					command: '\x18',
					special_key: true
				};
				
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
			}
			else if ((event.keyCode == '122' || event.keyCode == '90') && event.ctrlKey) { //Ctrl + Z
				event.preventDefault();
				
				var msg = {
					index: self.index,
					command: '\x1A',
					special_key: true
				};
				
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
			}
		});
		
		$(target).find("#prompt_input").keypress(function (event) {
			if (event.keyCode == '13') {
			}
			else if (event.keyCode == '9') { //Tab
			}
			else if (event.keyCode == '8') { //Backspace
			}
			else if ((event.keyCode == '99' || event.keyCode == '67') && event.ctrlKey) { //Ctrl + C
			}
			else if ((event.keyCode == '120' || event.keyCode == '88') && event.ctrlKey) { //Ctrl + X
			}
			else if ((event.keyCode == '122' || event.keyCode == '90') && event.ctrlKey) { //Ctrl + Z
			}
			else {
				var msg = {
					index: self.index,
					command: String.fromCharCode(event.keyCode),
					special_key: true
				};
			
				self.socket.emit("pty_execute_command", JSON.stringify(msg));
			}
		});
		
		$(target).click(function () {
			$(self.target).find("#prompt_input").focus();
		});
		
		
		
		
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
				self.default_prompt = /bash-\d\.\d(\#|\$)/;
			}
			else if (data.platform == "linux") {
				self.default_prompt = /.*@.*:.*(\#|\$)/;
			}
			self.platform = data.platform;
			core.env.os = data.platform;
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

				stdout = stdout.split("[00m").join("");
				//stdout = stdout.split("[0m").join(" ");
				stdout = stdout.split("[C").join("");

				
				//if (mode != 1) {
					if (stdout.indexOf('[K') == -1) {
						stdout = stdout.replace(/\^/g, "\^");
						stdout = stdout.replace(/\:/g, "\:");
						stdout = stdout.replace(/\</g, "&lt;");
						stdout = stdout.replace(/\</g, "&gt;");
						
						self.temp_stdout += stdout;
					}
					
					if (stdout.indexOf("\u001b") > -1) {
						self.temp_stdout = self.temp_stdout.substring(0, self.temp_stdout.length-1);
					}
/*
				}
				else if (self.temp_stdout == "") {
					self.temp_stdout += stdout;
				}
*/
				
				stdout = stdout.split("[K").join("");
				
				//console.log(stdout.charCodeAt(0).toString(16));
				//if (mode == 1 || /\n/.test(stdout) || stdout.indexOf('$') > -1) {
				self.work_queue(stdout);

				if (/\n/.test(stdout) || stdout.indexOf('$') > -1) {
					
					if(msg.terminal_name == "debug") {
						if(self.debug_endstr && self.debug_endstr.test(self.temp_stdout)) {
							$(core.module.debug).trigger("debug_end");
							self.command_queue = [];
						}
					}
					
					if (self.temp_stdout.indexOf('$') > -1) {
						
						var prev_command =  "";
						
						if (self.temp_stdout.indexOf('\n') > -1) {
							self.temp_stdout = self.temp_stdout.split('\n');
							
							prev_command = self.temp_stdout.shift();
							
							self.temp_stdout = self.temp_stdout.join('\n');
						}
						
						
						self.temp_stdout = self.temp_stdout.replace('[H', '').replace('[2J', '');
						
						self.temp_stdout = self.temp_stdout.replace(/\[\d[A-Z]/g, '');
					
						var prevalue = self.temp_stdout.split('$')[1];
						

						if (self.temp_stdout.split('$')[0] != "") {
							self.temp_stdout = self.temp_stdout.split('$')[0] + "$";
							self.temp_stdout = self.transform_bash_to_html(self.temp_stdout + "");
						}
						
						
						
						
						$(self.target).find("#results").find("pre:last").append(prev_command);
						
						$(self.target).find("#results").append(self.temp_stdout);
						
						var from = (self.in_panel ? "panel" : "layout");
						
						self.resize_all(from);
						
						
						if (typeof prevalue == "string" && prevalue.length > 0) {
							self.temp_stdout = prevalue;
						}
						else {
							self.temp_stdout = "";
						}
						
						if (!(stdout.indexOf('[K') > -1)) {
//							if(self.platform == "darwin") {
								$(self.target).find("#prompt_input").appendTo($(self.target).find("#results pre:last"));
//							}
//							else if(self.platform == "linux") {
//								$(self.target).find("#prompt_input").appendTo($(self.target).find("#results"));
//							}
						}
						
						//console.log("prevalue: '" + prevalue + "'");
						$(self.target).find("#prompt_input").val(prevalue);
							
						
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
					}
					else if ((self.temp_stdout.charCodeAt(self.temp_stdout.length-1).toString(16) == "20" || self.temp_stdout[self.temp_stdout.length-1] == "\n") && self.temp_stdout.length > 1 && self.temp_stdout.indexOf("\n") > 0) {
						self.temp_stdout = self.transform_bash_to_html(self.temp_stdout + "");
						
						//console.log(self.temp_stdout);
						
						var array_temp_stdout = self.temp_stdout.split("</pre>");
						var temp_stdout1 = array_temp_stdout.shift().split("<pre>").join("");
						var temp_stdout2 = array_temp_stdout.join("</pre>");
						
						//console.log(temp_stdout1);
						//console.log(temp_stdout2);
						
						$(self.target).find("#results pre:last").append(temp_stdout1);
						$(self.target).find("#results").append(temp_stdout2);
						//$(self.target).find("#results").height($(self.target).find("#results").height() + $(self.target).find("#results pre:last").height());
						
						self.temp_stdout = "";
						
						//$(self.target).find("#results pre:last").remove();
						//$(self.target).find("#results pre:last").append("&nbsp;");
						$(self.target).find("#prompt_input").appendTo($(self.target).find("#results pre:last"));
						
						$(self.target).find("#prompt_input").val("");
						$(self.target).find("#prompt_input").focus();
						
						var from = (self.in_panel ? "panel" : "layout");
						
						self.resize_all(from);
					
						$(self.target).parent().parent().scrollTop(parseInt($(self.target).height()));
					}
					
				}
				else {
					if (self.arrowed == true && self.temp_stdout != " ") {
						if (self.temp_stdout.charCodeAt(0).toString(16) == "8") {
							self.temp_stdout = self.remove_backspaces(self.temp_stdout);
						}
						
						if (self.temp_stdout[0] != " " && self.platform != 'linux') {
							self.temp_stdout = " " + self.temp_stdout;
						}
						
						//console.log("'" + self.temp_stdout + "'");
						
						$(self.target).find("#prompt_input").val(self.temp_stdout);
						$(self.target).find("#prompt_input").focus();
						
						
						self.arrowed = false;
						self.arrowed_string = self.temp_stdout;
						
						self.temp_stdout = "";
					}
					else if (self.temp_stdout != "\u0007") {
						
						self.temp_stdout = self.temp_stdout.split('\u0007').join("");

						self.temp_stdout = unescape(escape(self.temp_stdout).split("%1B").join(""));

						$(self.target).find("#prompt_input").val(self.temp_stdout);

						var str = "l";
					}

				}
			}
		}
		
		var pop_command = function(target_stdout){
			var temp_stdout = target_stdout;
			
			if(!self.is_command && self.last_command && self.last_command != "" && target_stdout.match(self.last_command)){
				var position = target_stdout.indexOf(self.last_command);
				var new_stdout = target_stdout.substring(0, position-1) + target_stdout.substring(position + self.last_command.length, target_stdout.length)

				temp_stdout = new_stdout
				self.is_command = true;
			}
			
			return temp_stdout;
		}
		
		this.socket.on("pty_command_result", function(msg) {
			if(self.platform == 'linux' && msg.stdout.indexOf(']0;') > -1) {
				msg.stdout = msg.stdout.substring(0, msg.stdout.indexOf(']0;')) + msg.stdout.substring(msg.stdout.indexOf('['), msg.stdout.length);
			}

			result(msg);
			
/*
			if (timeout) {
				clearTimeout(timeout);
			}
			
			timeout = setTimeout(function(){
				if(self.temp_stdout != "") {
					result(msg);
				}
			},500);
*/
		});
		
		$(core).bind("layout_resized", function () {
			self.resize_all("layout");
		});
		
		$(document).bind(this.terminal_name + "_resized", function () {
			self.resize_all("panel");
			
			if (self.index > 0) {
				self.resize_terminal();
			}
		});

		$(document).bind(this.terminal_name + "_closed",  function () {
			var msg = {
				index: self.index,
				workspace: core.status.current_project_path,
				terminal_name: self.terminal_name
			};
			
			self.socket.emit("terminal_leave", JSON.stringify(msg));
		});
		
		$(window).bind("unload", function () {
			var msg = {
				index: self.index,
				workspace: core.status.current_project_path,
				terminal_name: self.terminal_name
			};
			
			self.socket.emit("terminal_leave", JSON.stringify(msg));
		});
		
		this.resize_all();
		
		var cols = 80;
		
		if (this.in_panel) {
			cols = parseInt(parseInt($(this.target).width() - 10) / 6);
		}
		else {
			cols = parseInt(parseInt($(this.target).parent().parent().width() - 10) / 6);
		}
		
		this.socket.emit("terminal_join", '{"timestamp": "' + this.timestamp + '", "cols": "' + cols + '", "workspace": "'+ core.status.current_project_path +'", "terminal_name":"' + this.terminal_name + '", "uid":'+core.user.uid+', "gid":'+core.user.gid+'}');
		
		
		// context menu
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init(
			"configs/menu/org.goorm.core.terminal/terminal.context.html", 
			"terminal.context", 
			self.target, self.timestamp, null,
			function () {
                // clear terminal
                var item_clear = $(self.context_menu.menu.element).find("a[action=do_terminal_clear]");
                item_clear.mouseover( function (e) {
                     item_clear.addClass("yuimenuitem-selected");
                });
                item_clear.mouseout( function (e) {
                    item_clear.removeClass("yuimenuitem-selected");
                });
                
                $(self.context_menu.menu.element).find("a[action=do_terminal_clear]").unbind("click");
                $(self.context_menu.menu.element).find("a[action=do_terminal_clear]").click( function (e) {
					$(self.target).find("#welcome").remove();
					var els = $(self.target).find("#results > pre");
					for(var i = 0; i < els.length-1; i++){
						$(els[i]).remove();
					}
					
					// only prompt (some cases, result texts are mixed with prompt)
					els = $(self.target).find("#results > pre > span").children();
					var prompt = "";
                    if(els.length == 0){
                       prompt = $(self.target).find("#results > pre > span").html();
                    }else{
                       for(var i = els.length-2; i < els.length; i++){
                          prompt += ((els[i]!=undefined) ? els[i].outerHTML : "") + "&nbsp;";
					   }
                    }
					$(self.target).find("#results > pre > span").empty().html(prompt);
					
                    $(self.target).find("#prompt_input").focus();
                    $(self.context_menu.menu.element).css("visibility", "hidden");
                    $(self.context_menu.menu.element).css("top", "");
                    $(self.context_menu.menu.element).css("left", "");
                                                                                            
				});    
                               
                var from = (self.in_panel ? "panel" : "layout");
                self.resize_all(from);
                
                // for localized context menu,
                var language = "";
                if (localStorage.getItem("language") == null) {
                     if (core.server_language == "client") {
                          if (navigator.language == "ko") {
                               language = "kor";
                          } else {
                               language = "us";
                          }
                     } else {
                          language = core.server_language;
                     }
                     core.module.localization.change_language(language);
                } else {
                    core.module.localization.change_language(localStorage.getItem("language"));
                }
			}
		);
	},
	
	remove_backspaces: function (string) {
		string = string.substring(1, string.length);
		
		if (string.charCodeAt(0).toString(16) == "8") {
			string = this.remove_backspaces(string);
		}
		
		return string;
	},
	
	resize_terminal: function () {
		var cols = 80;
		
		if (this.in_panel) {
			cols = parseInt(parseInt($(this.target).width() - 10) / 6);
		}
		else {
			cols = parseInt(parseInt($(this.target).parent().parent().width() - 10) / 6);
		}
		
		var msg = {
			index: this.index,
			cols: cols
		};

		this.socket.emit("terminal_resize", JSON.stringify(msg));
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

//		console.log(this.stdout);
		// prompt가 도착하면 command_ready를 활성화
		if(this.prompt.test(this.stdout)){
			this.command_ready = true;
		}
		
		if(this.command_ready == true) {
//			console.log(this.stdout);
			this.command_ready = false;
			var item = this.command_queue.shift();
			if(item) {
				if (item.command) {
					this.socket.emit("pty_execute_command", JSON.stringify(item.command));
					this.stdout = "";
				}
				else if (item.callback) {
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
		data = data + "";

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

		if(data[0] == '\r') {
			data[0] = "\n";
		}


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

					if (words[j] != "" && words[j] != " ") {
						var spaces = "";

						var length = 0;
						var temp = words[j].match(this.ansi_color_code_regexp);

						if ($.isArray(temp)) {
							length = temp.length;
						}

						if (length > 0) {
							var ansi_color_code = words[j].match(this.ansi_color_code_regexp);
							var word = [];
								

							words[j] = (words[j]+"").split(ansi_color_code[0]);
							var temp = words[j].shift();
							word.push(words[j].shift());

							for (var l=1; l<ansi_color_code.length; l++) {
								var temp_arr = word[word.length-1].split(ansi_color_code[l]);

								word.pop();

								for (var k=0; k<temp_arr.length; k++) {
									word.push(temp_arr[k]);
								}

							}


							var new_word = temp;

							for (var l=0; l<ansi_color_code.length; l++) {
								new_word += "<span style='";

								for (var k=0; k<this.ansi_color_codes.length; k++) {
									if (ansi_color_code[l].indexOf(this.ansi_color_codes[k].key) > -1) { 
										new_word += this.ansi_color_codes[k].css;
									}
								}

								//var word = words[j].replace(this.ansi_color_code_regexp, '');//.split(' ');
								
								//var value = word.pop();
								//spaces = word.join('&nbsp;');
								
	
								var value = "";

								if (word[l] != undefined) {
									value = word[l].split(' ').join('&nbsp;');
								}

								if (value[value.length-1] == '\n') {
									value = value.splice(0, value.length-1);
								}

								new_word += "'>" + value + "</span>" + '&nbsp;';
								
								/*
								if (words.length > 1) {
									new_word = "<td style='width:" + 100/words.length + "%;'>" + new_word + "</td>";
								}
								*/
							}

								
							//words[j] = spaces + new_word;
								
							words[j] = new_word;
						}
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
						data[i] = "<pre><span>" + data[i] + "</span></pre>";
				//	}
				}
			}


		}


		//this.prompt_length = data[data.length - 1].replace(/(<([^>]+)>)/ig, "").split('&nbsp;').join('').length;
	
		data = data.join("");
		
		return data;
	},
	
	resize_all: function (from) {	
		if (this.in_panel && from == "panel") {
			var panel_width = $(this.target).parent().width() - 10;
			var panel_height = $(this.target).parent().height() - 10;
			var target_height = $(this.target).find("#results").height() + 20;
			var prompt_width = $(this.target).find("#results").find("pre:last").find("span").width();

			if(this.platform == "linux") {
				prompt_width = 0;

				$(this.target).find("#results").find("pre:last").find("span").find("span").each(function (i) {
					prompt_width += $(this).width();
				});
			}

			if (panel_width - prompt_width < 80) {
				prompt_width = 0;
			}

			$(this.target).find("#prompt_input").width(panel_width - prompt_width - 40);
		
			/*

			if (target_height > panel_height) {
				$(this.target).height(panel_height);
			}
			else {
				$(this.target).height(target_height);
			}
*/
		}
		else if (from == "layout" && this.terminal_name != "debug") {
			var layout_bottom_width = $(".yui-layout-unit-bottom").find(".yui-layout-wrap").width() - 20;
			var layout_bottom_height = $(".yui-layout-unit-bottom").find(".yui-layout-wrap").height() - 36;
			var target_height = $(this.target).find("#results").height() + 20;
			var prompt_width = $(this.target).find("#results").find("pre:last").find("span").width();


			if(this.platform == "linux") {
				prompt_width = 0;

				$(this.target).find("#results").find("pre:last").find("span").find("span").each(function (i) {
					prompt_width += $(this).width();
				});
			}

			if (layout_bottom_width - prompt_width < 80) {
				prompt_width = 0;
			}

			
			
			$(this.target).find("#prompt_input").width(layout_bottom_width - prompt_width - 40);
			
			if (target_height < layout_bottom_height) {
				$(this.target).height(layout_bottom_height);
			}
			else {
				$(this.target).height(target_height);
			}
		}
	},
	
	check_command: function(command) {
		var self = this;
		if(command == "vi" ||command == "vim" || /(vim|vi) /.test(command)) {
			var matches = command.match(/;?(vim|vi) (.*);?/);

			if(!matches) {
			}
			else {
				var file = (matches.length>2) ? matches[2] : null;
				if(!file){
				}
				else {
					self.send_command("pwd", null, function(data){
						var lines = data.split("\n");
						var path = lines[1].split(core.preference.workspace_path).pop();
						path = path.trim();
						var filetype = null;
						if(file.indexOf(".") != -1)
							filetype = (file.split(".")).pop();
						var editor = core.module.layout.workspace.window_manager.open(path+"/", file, filetype).editor;
						editor.set_option({"vim_mode":true});
					});
				}
			}
			
			$(self.target).find("#prompt_input").val('');
			
			return false;
		}
		else {
			return true;
		}
	}
};
