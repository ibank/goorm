/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.edit = function () {
	this.target = null;
	this.editor = null;
	this.find_and_replace = null;
	this.filepath = null;
	this.filename = null;
	this.filetype = null;
	this.string_props = null;
	this.array_props = null;
	this.func_props = null;
	this.keywords = null;
	this.collaboration = null;
	this.theme = "elegant"; //"default", "neat", "elegant", "night", "cobalt"
	this.mode = "htmlmixed";
	this.indent_unit = 2;
	this.indent_with_tabs = true;
	this.show_line_numbers = true;
	this.first_line_number = 1;
	this.undo_depth = 40;
	this.highlight_current_cursor_line = true;
	this.current_cursor_line = null; // for cursor line
	
	this.highlighted_line = null; // for debuging
	this.preference = null;
	this.context_menu = null;
	this.timestamp = null;	
	this.fromCh = null;
	this.toCh = null;
	this.breakpoints = [];
	this.vim_mode = false;
	this.fold_func = null;

	this.history_ch = null;
	this.history_line=null;
};

org.goorm.core.edit.prototype = {
	init: function (target, title, filepath) {
		var self = this;
		this.target = target;
		this.title = title;
		
		var dont_update_first = false;
		
		var enter_key = false; // onChange can't get enter_key
		
		this.collaboration = new org.goorm.core.collaboration.editing();
		
		this.preference = core.preference;
		
		this.dictionary = new org.goorm.core.edit.dictionary();
		this.timestamp = new Date().getTime();
		
		$(target).append("<textarea class='code_editor'>Loading Data...</textarea>");
		//$(target).append("<textarea class='clipboardBuffer'></textarea>");
		
		this.fold_func = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
		
		
		
		this.object_tree = new YAHOO.widget.TreeView("object_tree");
		
		this.editor = CodeMirror.fromTextArea($(target).find(".code_editor")[0], {

			lineNumbers: true,
			lineWrapping: true,
			wordWrap: true,
			matchBrackets: true,
			extraKeys: {
				"Ctrl-Q": function(cm) {
					fold_func(cm, cm.getCursor().line);
					self.reset_breakpoints();
				},
				"'>'": function(cm) { 
					cm.closeTag(cm, '>');
				},
				"'/'": function(cm) {
					cm.closeTag(cm, '/'); 
				},
				"Ctrl-Space": function(cm) {
				
					var cursor = cm.getCursor(); 
					var token = cm.getTokenAt(cursor);
					
					self.dictionary.search(token.string);
					
					self.dictionary.show(cm);
					
				}
			},
			onScroll: function(i ,e) {
				if($(self.target).find(".dictionary_box").css("display") == "block") {
					self.dictionary.hide();
					self.editor.focus();
				}
			},
			onKeyEvent: function(i, e) {
				/* HISTORY start */
				if(e.type=="keydown"){
					var only = !self.editor.somethingSelected();
					if(e.keyCode==8 && only) self.history.pressed_key = "backspace";
					else if(e.keyCode==46 && only) self.history.pressed_key = "del";
					else if(e.keyCode==68 && (e.ctrlKey || e.metaKey) ) self.history.pressed_key = "ctrl+d";
					else{
						self.history.pressed_key = "other";
						if(only) self.history.str_selection=self.history.char_right;
					}
				}
				/* HISTORY end */
				
				if ($(self.target).find(".dictionary_box").css("display") == "block" && e.type == "keyup" && e.keyCode != 8 && e.keyCode != 32) {
					
					var cursor = self.editor.getCursor();
					var token = self.editor.getTokenAt(cursor);
					
					self.dictionary.search(token.string);
					self.dictionary.show(self.editor);
				}
				
				if( (e.type == "keydown" && e.keyIdentifier == "Enter") || (e.type == "keydown" && e.keyIdentifier == "Down")){
					var cursor_position = parseInt(self.editor.getCursor().line) * 16;
					var container_height = $(self.target).find('.CodeMirror-lines').height();

					var cursor = self.editor.getCursor();
					var token = self.editor.getTokenAt(cursor);
					var cursor_pos = self.editor.charCoords({line:cursor.line, ch:cursor.ch}, "local");
					
					
					// if(cursor_position >= container_height)
					// self.editor.scrollTo(parseInt(self.editor.getScrollInfo().x), parseInt(self.editor.getScrollInfo().y)+16);
					
				}
				
				if(e.type == "keydown" && e.keyIdentifier == "Enter"){
					enter_key = true;
					self.toCh = self.editor.getCursor(false);
					self.fromCh = self.editor.getCursor(true);
					return false;
				}
				
				if (e.ctrlKey || e.metaKey || e.altKey) {
					if ( e.keyCode != 67 && e.keyCode != 86 && e.keyCode != 88 ) {
						
						var evt = $.Event('keydown');
						evt.which = e.which;
						evt.keyCode = e.keyCode;
						evt.ctrlKey = e.ctrlKey;
						evt.metaKey = e.metaKey;
						evt.altKey = e.altKey;
						evt.shiftKey = e.shiftKey;
						
						$(document).trigger(evt);
						
						e.stopPropagation();
						e.preventDefault();
						return false;
					}
				}
				
			},
			onChange: function(i, e, a){	// i = CodeMirror object, e = change informations
				if(self.history.mode == "history") return;
				if(dont_update_first){
					if(self.collaboration.updating_process_running == false){
						var ev = e;
						if(ev.from.ch!=ev.to.ch || ev.from.line != ev.to.line){
							if(self.history.pressed_key == "backspace"){
								ev.before = self.history.char_left;
							}else if(self.history.pressed_key == "del"){
								ev.before = self.history.char_right;
							}else if(self.history.pressed_key == "ctrl+d"){
								ev.before = self.history.str_line;
							}else{
								ev.before = self.history.str_selection;
							}
						}
						self.history.update_selection();
						self.monitoring_lines(e);
						self.collaboration.update_change(ev);
						
						// if(enter_key == true) {
							// var line = self.editor.getLine(ev.to.line);

							// ev.text[0]="\n";
							// ev.from.line = self.fromCh.line;
							// ev.to.line = self.toCh.line;
							// ev.from.ch = self.fromCh.ch;
							// ev.to.ch = self.toCh.ch;
							// self.collaboration.update_change(ev);
							// ev.text[0]=line;
							// ev.from.line = ev.to.line+1;
							// ev.to.line = ev.to.line+1;
							// if(self.fromCh.line != self.toCh.line){
								// ev.from.line = self.editor.getCursor().line;
								// ev.to.line = self.editor.getCursor().line;
							// }
							// ev.to.ch = 99999;
							// ev.from.ch = 0;
							
							// var indent = self.editor.getCursor().ch;
							// for(var i=0; i < indent; i++){
								// ev.text[0]+=" ";
							// }
							
							// enter_key = false;
						// }
						// else {
							// self.collaboration.update_change(ev);
						// }
						//self.editor.getCursor();
					}
				}
				else{
					dont_update_first = true;
				}
			  	
			  	var window_manager = core.module.layout.workspace.window_manager;
			  	
			  	window_manager.window[window_manager.active_window].set_modified();
			  	window_manager.tab[window_manager.active_window].set_modified();
			},
			onCursorActivity: function () {
				//by sim
				if(!(self.editor.getCursor().line==self.history_line && self.editor.getCursor().ch==self.history_ch+1)){
					$('.dictionary_box').hide();
				}
				self.history_ch=self.editor.getCursor().ch;
				self.history_line=self.editor.getCursor().line;
				//by sim

				if (self.highlight_current_cursor_line) {
					self.editor.setLineClass(self.current_cursor_line, null, null);
					self.current_cursor_line =	self.editor.setLineClass(self.editor.getCursor().line, "current_line", "activeline");
				}
				
				//$("#" + self.target + " .CodeMirror-gutter-text pre .current_line").removeClass("current_line");
				// $(self.target).find(".CodeMirror-gutter-text pre").removeClass("current_line");
				// $(self.target).find(".CodeMirror-gutter-text pre:nth-child(" + (self.editor.getCursor().line + 1) + ")").addClass("current_line");
				
				 $(self.target).parent().parent().find(".ft").find(".editor_message").html("Line: " + (parseInt(self.editor.getCursor().line) + 1) + " | Col: " + self.editor.getCursor().ch);
				
				self.collaboration.update_cursor({
					line: self.editor.getCursor().line,
					ch: self.editor.getCursor().ch
				});
				
				self.editor.matchHighlight("CodeMirror-matchhighlight");
				self.history.update_selection();	// for HISTORY...
				
				var window_manager = core.module.layout.workspace.window_manager;
				window_manager.window[window_manager.active_window].activate();
			},
			onFocus: function () {
				core.status.focus_on_editor = true;
				
				if (self.filetype == "js") {
					//self.analyze();
				}
				else {
					delete self.object_tree;
					$("#object_tree").empty();
				}
				
				var window_manager = core.module.layout.workspace.window_manager;
				window_manager.window[window_manager.active_window].activate();
			},
			onBlur: function () {
				core.status.focus_on_editor = false;
			},
			onGutterClick: function(cm, n) {
				var info = cm.lineInfo(n);
				
				if ($(self.target).find(".CodeMirror-gutter-text pre:eq(" + n + ")").find(".breakpoint").length > 0) {
					$(self.target).find(".CodeMirror-gutter-text pre:eq(" + n + ")").find(".breakpoint").remove();
					
					self.breakpoints = self.breakpoints.unique();
					var index = self.breakpoints.inArray(n);
					self.breakpoints.remove(index, index);
				}
				else if($(self.target).find(".CodeMirror-gutter-text pre:eq(" + n + ")").find('.folding_icon_minus').length == 0){
					$(self.target).find(".CodeMirror-gutter-text pre:eq(" + n + ")").prepend("<span class='breakpoint'>●</span>");
					
					self.breakpoints = self.breakpoints.unique();
					self.breakpoints.push(n);
				}
				
				self.fold_func(cm, n);
				self.set_foldable();
				
				var window_manager = core.module.layout.workspace.window_manager;
				window_manager.window[window_manager.active_window].activate();
			},
			onUpdate: function () {
				self.set_foldable();
				self.reset_breakpoints();
				self.highlight_line(self.highlighted_line);
			}
		});

		///////////////////////////////////////////////////
		//for assistant authentic, also filepath 
		//////////////////////////////////////////////////
		self.window_manager = core.module.layout.workspace.window_manager; 
		$(self.window_manager).trigger('window_open',{"filepath": filepath});
		
		$(target).mousedown(function (e) {
			var window_manager = core.module.layout.workspace.window_manager;
			window_manager.window[window_manager.active_window].activate();

			self.context_menu.menu.hide();

			e.stopPropagation();
			e.preventDefault();
			return false;
		});

		if (this.highlight_current_cursor_line) {
			this.current_cursor_line = this.editor.setLineClass(0, "activeline");
		}
				
		//this.collaboration.set_editor(this.editor);
		this.set_dictionary();
		
		this.collaboration.init(this);
		this.collaboration.set_editor(this.editor);
		
		this.set_option();
		
		this.history = core.module.layout.history;
		
		//this.mode = "htmlmixed";
		//this.editor.set_option("mode", this.mode);

		//this.toggle_fullscreen_editing();
		
		//var findReplace = new org.goorm.core.edit.find_and_replace(this.editor, $(target).find(".code_editor")[0]);
		//this.find_and_replace = new org.goorm.core.edit.find_and_replace();
		//this.find_and_replace.init(this.editor);
		//this.find_and_replace.init(this.editor, $(target));
		
		$(target).keypress(function (e) {
			if (!(e.which == 115 && e.ctrlKey)) return true;

			self.save();
			
			e.preventDefault();
			return false;
		});
		
		
		$(core).bind("on_preference_confirmed", function () {
			self.set_option();
		});
		
		$(this.target).click(function () {
			self.dictionary.hide();
		});
		
		
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init("configs/menu/org.goorm.core.edit/edit.context.html", "edit.context", this.target, this.timestamp, null, function () {
			core.module.action.init();

			var language = "";
			if(localStorage.getItem("language")==null) {
				if (core.server_language=="client") {
					if(navigator.language=="ko") {
						language = "kor";
					}
					else {
						language = "us";
					}
				}
				else {
					language = core.server_language;
				}
				
				core.module.localization.change_language(language);
			}
			else {
				core.module.localization.change_language(localStorage.getItem("language"));
			}
			
			core.module.clipboard.init_context(self.context_menu);
		});
		
//		$(this.target).find(".CodeMirror-lines div:first").append("<div class='highlight_line'></div>");
	},
	
	highlight_line: function (line) {
		var self = this;
		if(this.editor && line){
			var cursor_pos = this.editor.charCoords({line:(line-1), ch:0}, "local");
			if(self.highlighted_line) this.editor.setLineClass(self.highlighted_line, null, null);
			this.editor.setLineClass((line-1), null, "highlight_line");

			this.highlighted_line = line;
			//$(this.target).find(".CodeMirror-lines div:last").find("pre:eq(" + (line-1) + ")").addClass("highlight_line");
		}
//		$(this.target).find('.highlight_line').css("top", cursor_pos.y);
//		$(this.target).find('.highlight_line').css("height", height);
//		$(this.target).find('.highlight_line').show();
//		
		
/*
		$(this.target).find(".CodeMirror-lines div:first div:last pre").removeClass("highlight");
		$(this.target).find(".CodeMirror-lines div:first div:last pre:nth-child(" + line + ")").addClass("highlight");
*/
	},
	
	clear_highlight: function () {
		var self = this;
		if(this.highlighted_line){
			var line = this.highlighted_line-1;
			this.highlighted_line = null;
			this.editor.setLineClass(line, null, null);
			
		}
//		$(this.target).find(".CodeMirror-lines .highlight_line").removeClass("highlight_line");
	},
	
	set_foldable: function () {
		var self = this;
		
		if (this.editor) {
			$(this.target).find(".CodeMirror-gutter-text").find("pre").find(".folding_icon_minus").remove();
			//$(this.target).find(".CodeMirror-gutter-text").find("pre").find(".folding_icon").remove();
			$(this.target).find(".CodeMirror-gutter-text").find("pre").find("div").addClass("folding_icon");
			$(this.target).find(".CodeMirror-gutter-text").find("pre").find("div.folding_icon").html("");
			
			$(this.target).find(".CodeMirror-gutter-text").find("pre").each(function (i) {
				if (self.editor.getLine(i).indexOf("{") > -1) {
					$(this).prepend("<div class='folding_icon_minus'></div>");
				}
				

				if ($(this).text() == "") {
					$(this).find(".folding_icon_minus").hide();
				}
			});
		}
		
		
		//fold_func(cm, n);
	},
	
	resize_all: function () {

	},
	
	analyze: function () {
		var self = this;
		
		delete self.object_tree;
		self.object_tree = new YAHOO.widget.TreeView("object_tree");

		var root = self.object_tree.getRoot();
		
		var tree = [];

		var index = 1;
		var inspecting = true;
		var total_line = self.editor.lineCount();
		
		var position = self.editor.posFromIndex(index);
		var token = self.editor.getTokenAt(position);
		
		var inspecting_index = 0;
		var inspecting_depth = 0;
		
		var current_parent = root;
		var past_parent = root;
		
		var nodes = [];
		
		while (inspecting) {
			
			if (token.string.replace(/ /g, "").replace(/\t/g, "").replace(/\n/g, "") != "" && token.className != "comment") {
				if (token.className == null && (token.string == "=" || token.string == ":")) {
					token.className = "assignment";
				}
				
				if (token.string.indexOf("{") > -1) {
					token.className = "block_start";
					
					past_parent = current_parent;
					current_parent = nodes[nodes.length - 1];
					
					inspecting_depth++;
				}
				else if (token.string.indexOf("}") > -1) {
					token.className = "block_end";
					
					current_parent = past_parent;
					
					inspecting_depth--;
				}
				
				if (token.string.indexOf("(") > -1) {
					token.className = "bracket_start";
				}
				else if (token.string.indexOf(")") > -1) {
					token.className = "bracket_end";
				}
				
				if (token.className == null && token.string == "[") {
					token.className = "square_bracket_start";
				}
				else if (token.className == null && token.string == "]") {
					token.className = "square_bracket_end";
				}
				
				if (token.className == null && token.string == ",") {
					token.className = "comma";
				}
				
				if (token.className == null && (token.string == "+" || token.string == "-" || token.string == "/" || token.string == "*" || token.string == "%" || token.string == "." || token.string == "++" || token.string == "--")) {
					token.className = "operator";
				}
				
				if (token.className == null && (token.string == "==" || token.string == "!=" || token.string == "!" || token.string == "===" || token.string == "&&" || token.string == "||")) {
					token.className = "logical_operator";
				}
				
				if (token.className == null && token.string == ";") {
					token.className = "semicolon";
				}
				
				if (token.className == "variable" || token.className == "variable-2" || token.className == "block_start") {
					var string = token.string;
					if (token.className == "block_start") {
						string = "<span class='block_start'></span>";
					}
					
					nodes.push(new YAHOO.widget.HTMLNode(string, current_parent, true));
					nodes[nodes.length - 1].type = token.className;
				}
				
				if (token.className == "property") {
					nodes[nodes.length - 1].html += "." + token.string;
				}
				
				if (token.className == "assignment") {
					nodes[nodes.length - 1].html += " : ";
				}
				
				if (token.className == "bracket_start") {
					nodes[nodes.length - 1].html += "<span style='color:red;'> <- </span>";
				}
				
				if (token.className == "keyword") {
					nodes[nodes.length - 1].html += "<span style='color:purple;'>" + token.string + "</span>";
				}
				
				if (token.className == "string") {
					nodes[nodes.length - 1].html += "<span style='color:gray;'>" + token.string + "</span>";
				}
				
				if (token.className == "atom") {
					nodes[nodes.length - 1].html += "<span style='color:blue;'>" + token.string + "</span>";
				}
				
				if (token.className == "def") {
					nodes[nodes.length - 1].html += " <span style='color:darkgray;'>" + token.string + "</span>";
				}
			}
			
			index += (token.end - token.start);
			
			if (token.end - token.start == 0) {
				index++;
			}
			
			position = self.editor.posFromIndex(index);
			token = self.editor.getTokenAt(position);
			
			if (position.line == total_line - 1 && position.ch == token.end) {
				inspecting = false;
			}
		}
		
		
		self.object_tree.render();
	},

	set_option: function(options) {
		options || (options = {})
		this.indent_unit = (options.indent_unit)? options.indent_unit : parseInt(this.preference["preference.editor.indent_unit"]);
		this.indent_with_tabs = (options.indent_with_tabs)? options.indent_with_tabs : this.preference["preference.editor.indent_with_tabs"];
		this.show_line_numbers = (options.show_line_numbers)? options.show_line_numbers : this.preference["preference.editor.show_line_numbers"];
		this.first_line_number = (options.first_line_number)? options.first_line_number : parseInt(this.preference["preference.editor.first_line_number"]);
		this.undo_depth = (options.undo_depth)? options.undo_depth : parseInt(this.preference["preference.editor.undo_depth"]);
		this.highlight_current_cursor_line = (options.highlight_current_cursor_line)? options.highlight_current_cursor_line : this.preference["preference.editor.highlight_current_cursor_line"];
		this.theme = (options.theme)? options.theme : this.preference["preference.editor.theme"];
		this.vim_mode = (options.vim_mode)? options.vim_mode : false;
		
		//////////////////////////////////////////////////////////////
		//Edit Settings
		//////////////////////////////////////////////////////////////
		if (this.vim_mode) {
			this.editor.setOption("keyMap", "vim");
		}
		if (this.indent_unit != undefined) {
			this.editor.setOption("indentUnit", this.indent_unit);
		}
		if (this.indent_with_tabs != undefined) {
			this.editor.setOption("indentWithTabs", this.indent_with_tabs);
		}
		if (!this.highlight_current_cursor_line) {
			this.editor.setLineClass(this.current_cursor_line, null, null);
		}
//		deprecated tabMode
//		if (this.tab_mode != undefined) {
//			this.editor.setOption("tabMode", this.tab_mode);		
//		}
//		deprecated enterMode
//		if (this.enter_mode != undefined) {
//			this.editor.setOption("enterMode", this.enter_mode);
//		}
		if (this.show_line_numbers != undefined) {
			this.editor.setOption("lineNumbers", this.show_line_numbers);
		}
		if (this.first_line_number != undefined || this.first_line_number != NaN) {
			this.editor.setOption("firstLineNumber", this.first_line_number);
		}
		if (this.undo_depth != undefined || this.undo_depth != NaN) {
			this.editor.setOption("undoDepth", this.undo_depth);
		}
		if (this.theme != undefined) {
			$("<link>").attr("rel","stylesheet").attr("type","text/css").attr("href","/lib/net.codemirror.code/theme/"+this.theme+".css").appendTo("head");
			this.editor.setOption("theme", this.theme);
		}
	},
	
	load: function (filepath, filename, filetype) {
		var self = this;

		var url = "file/get_contents";

		if (filetype == "url"){
			filename = "";
			url = "file/get_url_contents";
		}
		
		var path = filepath + "/" + filename;
		
		this.filepath = filepath;
		this.filename = filename;
		this.filetype = filetype;
		
		var i = 0;
		this.interval = window.setInterval(function () {
			if (i<100) { 
				statusbar.progressbar.set('value', i+=10);
			} 
			else {
				window.clearInterval(self.interval);
			}
		}, 100);
		
		statusbar.start();

		var temp_path = "";
		
		if (filetype == "url") {
			temp_path = filepath;
		}
		else {
			temp_path = "workspace/"+filepath+"/"+filename;
		}

		var postdata = {
			path: temp_path
		};
		
		$.get(url, postdata, function (data) {
			
			if(data) self.editor.setValue(data);
			else self.editor.setValue("");
			
			self.history.latest_version = data;
		
			//self.collaboration.init(self.target,self);
			
			/*
			if(core.flag.collaboration_on == true){
				self.collaboration.set_edit_on();
			}
			*/
			
			self.collaboration.set_filepath();
			
			statusbar.progressbar.set('value', 100);
			
			if(self.interval) {
				window.clearInterval(self.interval);
			}
			
			self.editor.clearHistory();
			
			self.set_foldable();
			
			if (filetype != "url") {
				self.dictionary.init(self.target, self.editor, self.filetype);
			}
			
			statusbar.stop();

		  	var window_manager = core.module.layout.workspace.window_manager;
			
		  	window_manager.window[window_manager.active_window].set_saved();
		  
			window_manager.tab[window_manager.active_window].set_saved();
			self.on_activated();
		});
	},
	
	save: function (option) {
		
		var self = this;
		
		var url = "file/put_contents";
		var path = this.filepath + "/" + this.filename;
		
		var data = this.editor.getValue();
		
		var send_data = {
			path: path,
			data: data
		};
		
		
		var target_project_name=path.split("/")[0];
		var target_project_type
		
		var tmpdata=core.workspace;

	
		if(core.status.current_project_path!="") //project should be chosen in select box
		{
			if($('#building_after_save_option:checked').length!=0){
				core.property.building_after_save_option=true;
				send_data.build=true;

				for(var name in tmpdata){
					if(target_project_name==name){
						target_project_type=tmpdata[name].type;
						break;
					}
				}
			}else{
				core.property.building_after_save_option=false;
				send_data.build=false;
			}
		}


		// $.get(url, send_data, function (data) {
		$.post(url, send_data, function (data) {
			if(core.flag.collaboration_on == true){
				self.collaboration.socket.send('{"channel": "edit","action":"autoSaved", "identifier":"'+self.collaboration.identifier+'", "message":""}');
			}
		  
		  	var date = new Date();
		  	var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
			
			m.s("Save Complete! (" + time + ")", "editor");
		  
		  	var window_manager = core.module.layout.workspace.window_manager;

		  	window_manager.window[window_manager.active_window].set_saved();
		  
			window_manager.tab[window_manager.active_window].set_saved();
			
			if (option=="close") {
				window_manager.window[window_manager.active_window].close();
			}
			//this is auto build after save
			if(core.status.current_project_path!="") //project should be chosen in select box
			{
				if(core.property.building_after_save_option==true && core.status.current_project_path==target_project_name){
					core.module.plugin_manager.plugins["org.goorm.plugin."+target_project_type].build(target_project_name);
				}
			}
		});

	},

	get_contents: function () {
		var self = this;
		
		return self.editor.getValue();
	},
	
	set_dictionary: function () {
		this.string_props = ("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight " +
                     "toUpperCase toLowerCase split concat match replace search").split(" ");
		this.array_props = ("length concat join splice push pop shift unshift slice reverse sort indexOf " +
							"lastIndexOf every some filter for_each map reduce reduceRight ").split(" ");
		this.func_props = "prototype apply call bind".split(" ");
		this.keywords = ("break case catch continue debugger default delete do else false finally for function " +
						  "if in instanceof new null return switch throw true try typeof var void while with").split(" ");
	},
	
	stop_event: function () {
		if (this.preventDefault) {this.preventDefault(); this.stopPropagation();}
		else {this.return_value = false; this.cancel_bubble = true;}
	},
	
	add_stop: function (event) {
		if (!event.stop) event.stop = this.stop_event;
		return event;
	},

	for_each: function (arr, f) {
		for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
	},
	
	set_mode: function (mode) {
		this.mode = mode;
		this.editor.setOption("mode", mode);
	},
	
	toggle_fullscreen_editing: function () {
        var editor_div = $(this.target).find('.CodeMirror-scroll');
        if (!editor_div.hasClass('fullscreen')) {
            this.toggle_fullscreen_editing.beforeFullscreen = { height: editor_div.height(), width: editor_div.width() }
            editor_div.addClass('fullscreen');
            editor_div.height('100%');
            editor_div.width('100%');
            this.editor.refresh();
        }
        else {
            editor_div.removeClass('fullscreen');
            editor_div.height(this.toggle_fullscreen_editing.beforeFullscreen.height);
            editor_div.width(this.toggle_fullscreen_editing.beforeFullscreen.width);
            this.editor.refresh();
        }
    },

	undo: function () {
		this.editor.undo();
	},
	
	redo: function () {
		this.editor.redo();
	},
	
	cut: function () {
		this.copy();
		this.editor.replaceSelection("");
		/*
		var selection = this.editor.getSelection();
		$(this.target).find(".clipboardBuffer").text(selection);
				
		
		var evt = $.Event('keydown');
		evt.which = 88;
		evt.keyCode = 88;
		evt.ctrlKey = true;
		//evt.altKey = true;
		
		//evt.keyIdentifier = "U+0043";
		//evt.currentTarget = null;
		//evt.srcElement = $(this.target).find(".CodeMirror").find("div:first").find("textarea:first")[0];
				
		$(this.target).find(".clipboardBuffer")[0].focus();
		$(this.target).find(".clipboardBuffer")[0].select();
		//$(this.target).find(".CodeMirror").find("div:first").find("textarea:first").trigger(evt);
		$(this.target).find(".clipboardBuffer").trigger(evt);
		//$(this.editor.getWrapperElement()).trigger(evt);
		
		*/
	},
		
	copy: function () {
		var selection = this.editor.getSelection();
		localStorage["clipboard"] = selection;
	},
	
	paste: function () {
		this.editor.replaceSelection(localStorage["clipboard"]);
	},
	
	do_delete: function () {
		this.editor.replaceSelection("");
	},
	
	select_all: function () {
		this.editor.setSelection({"line":0,"ch":0},{"line":this.editor.lineCount(),"ch":0});
	},
	
	get_selected_range: function () {
		return { from: this.editor.getCursor(true), to: this.editor.getCursor(false) };
	},
	
	auto_formatting: function () {
		var range = this.get_selected_range();
		this.editor.autoFormatRange(range.from, range.to);
	},
	
	comment_selection: function () {
		var range = this.get_selected_range();
		this.editor.commentRange(true, range.from, range.to);
	},
	
	uncomment_selection: function () {
		var range = this.get_selected_range();
		this.editor.commentRange(false, range.from, range.to);
	},
	
	monitoring_lines: function(e){
		var self = this;
		
		var is_line_deleted = false;
		var is_line_added = false;
		
		if(e.text.length == 1 && e.text[0] == "") is_line_deleted = true;
		if(e.text.length == 2 && e.text[1] == "") is_line_added = true;
		
		if(is_line_deleted){
			var delete_line;
			
			if((e.to.line - e.from.line) == 0){ // 0 line deleted
				return
			}
			else if((e.to.line - e.from.line) == 1){ // 1 line deleted
				if(parseInt(self.highlighted_line)-1 == e.to.line){
					self.clear_highlight();
				}
				
				// breakpoints
				var target_line_position = self.breakpoints.indexOf(e.to.line);
				delete_line = 1;
				
				if(target_line_position != -1){
					self.breakpoints.splice(target_line_position, 1);
				}
			}
			else{ // multi line deleted
				var start_line = e.to.line - 1;
				var end_line = e.from.line;
				delete_line = end_line - start_line;
				
				for(var target_line=start_line; target_line>end_line; target_line--){
					//highlights
					if(parseInt(self.highlighted_line)-1 == target_line){
						self.clear_highlight();
					}

					// breakpoints
					var position = self.breakpoints.indexOf(target_line);
					if(position != -1)
						self.breakpoints.splice(position, 1);
				}
			}
			
			//highlight
			if(self.highlighted_line && parseInt(self.highlighted_line)-1 > e.to.line){
				var temp_line = self.highlighted_line;
				// self.clear_highlight()
				self.highlight_line((parseInt(temp_line)-delete_line));
			}
			
			for(var target_line = 0; target_line<self.breakpoints.length; target_line++){
				if(self.breakpoints[target_line] >=  e.to.line) self.breakpoints.splice(target_line, 1, (parseInt(self.breakpoints[target_line]) - delete_line))
			}
		}
		else if(is_line_added){
			var start_line
			
			if(e.from.ch > 0) start_line = e.to.line + 1;
			else start_line = e.to.line;
			
			//highlight
			if(self.highlighted_line && parseInt(self.highlighted_line)-1 >= start_line){
				var temp_line = self.highlighted_line;
				// self.clear_highlight()
				self.highlight_line((parseInt(temp_line)+1));
			}
			
			// breakpoints
			for(var i=0; i<self.breakpoints.length; i++){
				var line = self.breakpoints[i];
				
				if(line >= start_line) self.breakpoints.splice( i, 1, (parseInt(line)+1) );
			}
		}
	},
	
	reset_breakpoints : function(){
		var self = this;
		this.breakpoints = this.breakpoints.unique();
		
		$(self.target).find('.breakpoint').parent().each(function(i, e){
			var n = parseInt(($(this).text()).substring(1)) - 1;
			if(n && self.breakpoints.indexOf( n ) == -1)
				$(self.target).find(".CodeMirror-gutter-text pre:eq(" + n + ")").find(".breakpoint").remove();
		});
		
		for(var i=0; i<self.breakpoints.length; i++){
			var base = $(self.target).find(".CodeMirror-gutter-text pre:eq(" + parseInt(self.breakpoints[i]) + ")").html();
			
			if( (base.indexOf((self.breakpoints[i] + 1).toString()) != -1) && (base.indexOf('●') == -1) )
				$(self.target).find(".CodeMirror-gutter-text pre:eq(" + parseInt(self.breakpoints[i]) + ")").prepend("<span class='breakpoint'>●</span>");
		}
	},
	
	line_refresh : function(){
		var self = this;
		
		this.editor.refresh();
		this.reset_breakpoints();
		this.highlight_line(self.highlighted_line);
	},
	
	on_activated : function(){
		var self = this;
		//check duplication of activation, invalid activation, etc.
		if(this.history.wait_for_loading == true) return;
		if((this.filepath + this.filename) == this.history.last_init_load) this.history.activated = true;
		if(this.history.activated == false) return;
		if(this.history.filename == "/" + this.filepath + this.filename) return;

		// valid activation! manipulation start!
		this.history.deactivated();
		this.history.init_history(this)
		this.editor.setOption("readOnly",false);
		$(self.window_manager).trigger('window_open',{"filepath": this.filepath,"filename":this.filename});
	}
};
