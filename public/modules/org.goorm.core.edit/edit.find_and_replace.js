/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.edit.find_and_replace = {
	dialog: null,
	buttons: null,
	editor: null,
	last_pos: null,
	last_query: null,
	marked: [],
	match_case: false,
	ignore_whitespace: false,
	use_regexp: false,
	replace_cursor: null,
	matched_file_list: [],

	init : function() {
		var self = this;
		this.buttons = [{
			text : "<span localization_key='find'>Find</span>",
			handler : function() {
				self.find();
			}
		}, {
			text : "<span localization_key='find_all'>Find All</span>",
			handler : function() {
				self.find_all();
			}
		}, {
			text : "<span localization_key='replace_and_find'>Replace/Find</span>",
			handler : function() {
				self.handle_replace_and_find();
			}
		}, {
			text : "<span localization_key='replace'>Replace</span>",
			handler : function() {
				self.handle_replace();
			}
		}, {
			text : "<span localization_key='replace_all'>Replace All</span>",
			handler : function() {
				self.handle_replace_all();
			}
		}, {
			text : "<span localization_key='close'>Close</span>",
			handler : function() {
				self.hide();
			}
		}];

		this.dialog = org.goorm.core.edit.find_and_replace.dialog;
		this.dialog.init({
			localization_key: "title_find_replace",
			title : "Find/Replace",
			path : "configs/dialogs/org.goorm.core.edit/edit.find_and_replace.html",
			width : 550,
			height : 300,
			modal : false,
			buttons : this.buttons,
			draggable : true,
			success : function() {
				$("#find_query_inputbox, #replace_query_inputbox").keydown(function(e) {
					var ev = e || event;
					
					if(ev.keyCode == 27) {
						// esc key
						self.hide();
					}
					
					if(ev.keyCode == 13) {
						self.find();

						e.stopPropagation();
						e.preventDefault();
						return false;
					}
				});

				self.dialog.panel.hideEvent.subscribe(function(e) {
					self.unmark();
				});
				
				// Checkbox event handler
				$("#match_case").change(function() {
					if($("#match_case")[0].checked == true)
						self.match_case = true;
					else
						self.match_case = false;
				});

				$("#match_case_checkbox_name").click(function() {
					if($("#match_case")[0].checked == true) {
						$("#match_case")[0].checked = false;
						self.match_case = false;
					} else {
						$("#match_case")[0].checked = true;
						self.match_case = true;
					}
				});

				$("#ignore_whitespace").change(function() {
					if($("#ignore_whitespace")[0].checked == true)
						self.ignore_whitespace = true;
					else
						self.ignore_whitespace = false;
				});

				$("#ignore_whitespace_checkbox_name").click(function() {
					if($("#ignore_whitespace")[0].checked == true) {
						$("#ignore_whitespace")[0].checked = false;
						self.ignore_whitespace = false;
					} else {
						$("#ignore_whitespace")[0].checked = true;
						self.ignore_whitespace = true;
					}
				});

				$("#use_regexp").change(function(e) {
					if($("#use_regexp")[0].checked == true) {
						self.use_regexp = true;
						$("#match_case")[0].disabled = true;
						$("#ignore_whitespace")[0].disabled = true;
					} else {
						self.use_regexp = false;
						$("#match_case")[0].disabled = false;
						$("#ignore_whitespace")[0].disabled = false;
					}
				});

				$("#use_regexp_checkbox_name").click(function() {
					if($("#use_regexp")[0].checked == true) {
						$("#use_regexp")[0].checked = false;
						self.use_regexp = false;
						$("#match_case")[0].disabled = false;
						$("#ignore_whitespace")[0].disabled = false;
					} else {
						$("#use_regexp")[0].checked = true;
						self.use_regexp = true;
						$("#match_case")[0].disabled = true;
						$("#ignore_whitespace")[0].disabled = true;
					}
				});
			}
		});

		this.dialog = this.dialog.dialog;

	},

	find : function(direction) {
		var window_manager = core.module.layout.workspace.window_manager;

	// Get current active_window's editor
	if(window_manager.window[window_manager.active_window].editor) {
		// Get current active_window's CodeMirror editor
		var editor = window_manager.window[window_manager.active_window].editor.editor;
		// Get input query of this dialog
		var keyword = $("#find_query_inputbox").val();
		// Call search function of org.goorm.core.file.findReplace with keyword and editor			
		this.search(keyword, editor, direction);
	}

	},

	find_all : function() {

		var window_manager = core.module.layout.workspace.window_manager;
		// Get current active_window's editor
		if(window_manager.window[window_manager.active_window].editor) {
			// Get current active_window's CodeMirror editor
			var editor = window_manager.window[window_manager.active_window].editor.editor;
			// Get input query of this dialog
			var keyword = $("#find_query_inputbox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			this.search_all(keyword, editor);
		}
	},

	handle_replace_and_find : function() {

		var window_manager = core.module.layout.workspace.window_manager;
		// Get current active_window's editor
		if(window_manager.window[window_manager.active_window].editor) {
			// Get current active_window's CodeMirror editor
			var editor = window_manager.window[window_manager.active_window].editor.editor;
			// Get input query and replacing word of this dialog
			var keyword1 = $("#find_query_inputbox").val();
			var keyword2 = $("#replace_query_inputbox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			this.replace(keyword1, keyword2, editor);
			this.search(keyword1, editor);
			//this.replace_search(keyword1, keyword2, editor);
		}
	},

	handle_replace : function() {

		var window_manager = core.module.layout.workspace.window_manager;
		// Get current active_window's editor
		if(window_manager.window[window_manager.active_window].editor) {
			// Get current active_window's CodeMirror editor
			var editor = window_manager.window[window_manager.active_window].editor.editor;
			// Get input query and replacing word of this dialog
			var keyword1 = $("#find_query_inputbox").val();
			var keyword2 = $("#replace_query_inputbox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			
			this.replace(keyword1, keyword2, editor);
		}
	},

	handle_replace_all : function() {

		var window_manager = core.module.layout.workspace.window_manager;
		// Get current active_window's editor
		if(window_manager.window[window_manager.active_window].editor) {
			// Get current active_window's CodeMirror editor
			var editor = window_manager.window[window_manager.active_window].editor.editor;
			// Get input query and replacing word of this dialog
			var keyword1 = $("#find_query_inputbox").val();
			var keyword2 = $("#replace_query_inputbox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			this.replace_all(keyword1, keyword2, editor);
		}
	},
	search : function(keyword, editor, direction) {
		if(!keyword)
			return;
		var text = keyword;
		var caseFold = true;
		var self = this; 
		
		if(this.use_regexp == true)
			text = RegExp(keyword, "g");
		else {
			if(this.match_case == true)
				caseFold = false;
			if(this.ignore_whitespace == true)
				text = text.replace(/\s*/g, '');
		}

		this.unmark();

		if(this.last_query != text)
			this.last_pos = null;

		var cursor = editor.getSearchCursor(text, this.last_pos ? this.last_pos : editor.getCursor(), caseFold);
		var window_manager = core.module.layout.workspace.window_manager;
		
		if(direction == "previous") {
			cursor.findPrevious();
			if(!cursor.findPrevious()) {
				//첫번재 match 단어에서 previous 시

				if($("#find_on_workspace")[0].checked == true){
					for( var i = 0 ; i < window_manager.window.length; i++){
						if(window_manager.active_window == 0){
							window_manager.window[window_manager.window.length - 1].activate();	
						}
						else{
							window_manager.window[(window_manager.active_window - 1) % window_manager.window.length].activate();
						}

						editor = window_manager.window[window_manager.active_window].editor.editor;

						for( cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
						}
						cursor.findPrevious();
						if(editor.getSearchCursor(text, null, caseFold).findNext()) {
							break;
						}
					}
				}

				else{
					for( cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
					}
					cursor.findPrevious();
					if(!editor.getSearchCursor(text, null, caseFold).findNext()) {
						return;
					}
				}
			}
		} else {
			if(!cursor.findNext()) {
				//마지막 match 단어에서 next 시

				if($("#find_on_workspace")[0].checked == true){
					for( var i = 0 ; i < window_manager.window.length; i++){
						window_manager.window[(window_manager.active_window + 1) % window_manager.window.length].activate();

						editor = window_manager.window[window_manager.active_window].editor.editor;

						cursor = editor.getSearchCursor(text, null, caseFold);
						if(cursor.findNext()){
							break;
						}
					}
				}

				else{
					cursor = editor.getSearchCursor(text, null, caseFold);
					if(!cursor.findNext()){
						return;
					}
				}
				
			}
		}

		editor.setSelection(cursor.from(), cursor.to());
		this.replace_cursor = cursor;
		this.last_query = text;
		this.last_pos = cursor.to();
	},
	/* 트리뷰 만들어줘야됌 */
	search_all : function(keyword, editor) {

		if(!keyword)
			return;
		var text = keyword;
		var caseFold = true;

		if(this.use_regexp == true)
			text = RegExp(keyword, "g");
		else {
			if(this.match_case == true)
				caseFold = false;
			if(this.ignore_whitespace == true)
				text = text.replace(/\s*/g, '');
		}
		var nodes = {};
		var window_manager = core.module.layout.workspace.window_manager;

		var searchedWords = [];

		this.unmark();
		core.dialog.search.query = keyword;
		
		if($("#find_on_workspace")[0].checked == true){

			for( var i = 0 ; i < window_manager.window.length; i++){
				window_manager.window[(window_manager.active_window + 1) % window_manager.window.length].activate();

				var node = {};
				node.filename = window_manager.window[window_manager.active_window].filename;
				node.filetype = window_manager.window[window_manager.active_window].filetype;
				node.filepath = window_manager.window[window_manager.active_window].filepath;
				node.matched_line = 1;
				node.expanded = false;
				node.type = "html";
				node.html = "";
				node.children = [];
		
				nodes[node.filepath+node.filename] = node;
			}

			for( var i = 0 ; i < window_manager.window.length; i++){
				window_manager.window[(window_manager.active_window + 1) % window_manager.window.length].activate();
				editor = window_manager.window[window_manager.active_window].editor.editor;

				var cursor = editor.getSearchCursor(text, null, caseFold);
				if(!cursor.findNext()){
					delete nodes[window_manager.window[window_manager.active_window].filepath+window_manager.window[window_manager.active_window].filename];
					continue;
				}
				// search all matched words and set background of them yellow
				for(cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
					this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));
					
					var node = {};
		
					node.filename = window_manager.window[window_manager.active_window].filename;
					node.filetype = window_manager.window[window_manager.active_window].filetype;
					node.filepath = window_manager.window[window_manager.active_window].filepath;
					node.matched_line = cursor.from().line+1;
					node.expanded = false;
					node.type = "html";
					node.html = "<span style=\"color: #666; font-weight:bold;\">Line: " + node.matched_line +  "</span> - <span style=\"color: #808080\">" + window_manager.window[window_manager.active_window].editor.editor.getLine(node.matched_line-1) + "</span>";
		
					nodes[node.filepath+node.filename].children.push(node);
				}
			}

			for (key in nodes){
				nodes[key].matched_line = nodes[key].children[0].matched_line;
				nodes[key].html = "<div class='node'>" 
								+ "<img src=images/icons/filetype/" + "etc" + ".filetype.png class=\"directory_icon file\" style=\"margin: 0px 3px 0 2px !important; float:left\"/>"
								+ nodes[key].filepath + nodes[key].filename
								+ "<div class=\"matched_lines_cnt\" style=\"float:right; background: #99acc4; color: white; width: 14px; height: 14px; text-align:center; -webkit-border-radius:3px; -moz-border-radius:3px; border-radius:3px; margin: 1px 10px 0px;\">" + nodes[key].children.length + "</div>"
								+ "<div class=\"fullpath\" style=\"display:none;\">" + nodes[key].filepath + nodes[key].filename + "</div>"
								+ "</div>";
			}

			core.dialog.search.set_search_treeview($.isEmptyObject(nodes)? null : nodes);
		}
		else{
			var node = {};
			node.filename = window_manager.window[window_manager.active_window].filename;
			node.filetype = window_manager.window[window_manager.active_window].filetype;
			node.filepath = window_manager.window[window_manager.active_window].filepath;
			node.matched_line = 1;
			node.expanded = false;
			node.type = "html";
			node.html = "";
			node.children = [];
	
			nodes[node.filepath+node.filename] = node;
			
			var cursor = editor.getSearchCursor(text, null, caseFold);
			if(!cursor.findNext()){
				core.dialog.search.set_search_treeview(null);
				return;
			}
			// search all matched words and set background of them yellow
			for(cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
				this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));
				var temp = {
					fline : cursor.from().line,
					fch : cursor.from().ch,
					tline : cursor.to().line,
					tch : cursor.to().ch
				};
				
				var node = {};
	
				node.filename = window_manager.window[window_manager.active_window].filename;
				node.filetype = window_manager.window[window_manager.active_window].filetype;
				node.filepath = window_manager.window[window_manager.active_window].filepath;
				node.matched_line = cursor.from().line+1;
				node.expanded = false;
				node.type = "html";
				node.html = "<span style=\"color: #666; font-weight:bold;\">Line: " + node.matched_line +  "</span> - <span style=\"color: #808080\">" + window_manager.window[window_manager.active_window].editor.editor.getLine(node.matched_line-1) + "</span>";
	
				nodes[node.filepath+node.filename].children.push(node);
	
				searchedWords.push(temp);
			}

			for (key in nodes){
				nodes[key].matched_line = nodes[key].children[0].matched_line;
				nodes[key].html = "<div class='node'>" 
								+ "<img src=images/icons/filetype/" + "etc" + ".filetype.png class=\"directory_icon file\" style=\"margin: 0px 3px 0 2px !important; float:left\"/>"
								+ nodes[key].filepath + nodes[key].filename
								+ "<div class=\"matched_lines_cnt\" style=\"float:right; background: #99acc4; color: white; width: 14px; height: 14px; text-align:center; -webkit-border-radius:3px; -moz-border-radius:3px; border-radius:3px; margin: 1px 10px 0px;\">" + nodes[key].children.length + "</div>"
								+ "<div class=\"fullpath\" style=\"display:none;\">" + nodes[key].filepath + nodes[key].filename + "</div>"
								+ "</div>";
			}
			
			core.dialog.search.set_search_treeview(nodes);
		}
		// print messages in reverse order (becuase getSearchCursor search text from the end to the start of the document)
		for(var i = searchedWords.length - 1; i > -1; i--) {
			core.module.search.m(searchedWords[i].fline, searchedWords[i].fch, searchedWords[i].tline, searchedWords[i].tch, editor.getLine(searchedWords[i].fline));
		}

		// this.dialog.panel.hide();

		// highlight the selected word on the editor with gray background
		$(".search_message").click(function() {
			$(".search_message").css("background-color", "");
			$(this).css("background-color", "#fff8dc");

			var fLine = parseInt($(this).attr("fline"));
			var fCh = parseInt($(this).attr("fch"));
			var tLine = parseInt($(this).attr("tline"));
			var tCh = parseInt($(this).attr("tch"));

			var from = {
				line : fLine,
				ch : fCh
			};
			var to = {
				line : tLine,
				ch : tCh
			};
			editor.setSelection(from, to);
		});
	},

	replace_search : function(keyword1, keyword2, editor) {

		if(!keyword1)
			return;
		var text = keyword1, replace = keyword2;
		var caseFold = true;

		if(this.use_regexp == true)
			text = RegExp(keyword1, "g");
		else {
			if(this.match_case == true)
				caseFold = false;
			if(this.ignore_whitespace == true)
				text = text.replace(/\s*/g, '');
		}

		this.unmark();

		for(var cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
			this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));
		}

		if(this.last_query != text)
			this.last_pos = null;

		var cursor = editor.getSearchCursor(text, editor.getCursor() || this.last_pos, caseFold);

		if(!cursor.findNext()) {
			cursor = editor.getSearchCursor(text, null, caseFold);

			if(!cursor.findNext())
				return;
		}

		editor.setSelection(cursor.from(), cursor.to());
		this.last_query = text;
		this.last_pos = cursor.to();

	},

	replace : function(keyword1, keyword2, editor) {
		if(!keyword1)
			return;

		var text = keyword1, replace = keyword2;
		var caseFold = true;

		if(this.use_regexp == true)
			text = RegExp(keyword1, "g");
		else {
			if(this.match_case == true)
				caseFold = false;
			if(this.ignore_whitespace == true)
				text = text.replace(/\s*/g, '');
		}

		this.unmark();
		
		var cursor = editor.getSearchCursor(text, this.last_pos, caseFold);
		
		cursor.findPrevious();
		editor.replaceRange(replace, cursor.from(), cursor.to());
	},

	replace_all : function(keyword1, keyword2, editor) {

		if(!keyword1)
			return;
		var text = keyword1, replace = keyword2;
		var caseFold = true;

		if(this.use_regexp == true)
			text = RegExp(keyword1, "g");
		else {
			if(this.match_case == true)
				caseFold = false;
			if(this.ignore_whitespace == true)
				text = text.replace(/\s*/g, '');
		}

		// Activate search tab and clean it.
		core.module.layout.inner_bottom_tabview.selectTab(3);
		core.module.search.clean();

		this.unmark();
		for(var cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
			editor.replaceRange(replace, cursor.from(), cursor.to());
			core.module.search.replace_all(cursor.from().line, cursor.from().ch, cursor.to().line, cursor.to().ch, text, replace);
		}

		this.dialog.panel.hide();

		// highlight the selected word on the editor with gray background
		$(".search_message").click(function() {

			$(".search_message").css("background-color", "");
			$(this).css("background-color", "#fff8dc");

			var fLine = parseInt($(this).attr("fline"));
			var fCh = parseInt($(this).attr("fch"));
			var tLine = parseInt($(this).attr("tline"));
			var tCh = parseInt($(this).attr("tch"));

			var from = {
				line : fLine,
				ch : fCh
			};
			var to = {
				line : tLine,
				ch : fCh + replace.length
			};
			editor.setSelection(from, to);
		});
	},

	unmark : function() {
		for(var i = 0; i < this.marked.length; ++i)this.marked[i].clear();
		this.marked.length = 0;
	},

	show : function() {

		this.dialog.panel.show();

		var window_manager = core.module.layout.workspace.window_manager;

		// Get current active_window's editor
		if(window_manager.window[window_manager.active_window].editor != undefined) {
			// Get current active_window's CodeMirror editor
			var editor = window_manager.window[window_manager.active_window].editor.editor;
			
			if (editor.getSelection()!="") {
				$("#find_query_inputbox").val(editor.getSelection());
			}
		}

		//$("#find_query_inputbox").focus();
		$("#find_query_inputbox").select();
	},

	hide : function() {
		this.dialog.panel.hide();
	}
};
