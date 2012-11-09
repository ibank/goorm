/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.edit.find_and_replace = function() {
	this.dialog = null;
	this.buttons = null;
	this.editor = null;
	this.last_pos = null;
	this.last_query = null;
	this.marked = [];
	this.match_case = false;
	this.ignore_whitespace = false;
	this.use_regexp = false;
	this.replace_cursor = null;
};

org.goorm.core.edit.find_and_replace.prototype = {
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

		this.dialog = new org.goorm.core.edit.find_and_replace.dialog();
		this.dialog.init({
			title : "Find/Replace",
			path : "configs/dialogs/org.goorm.core.edit/edit.find_and_replace.html",
			width : 550,
			height : 300,
			modal : false,
			buttons : this.buttons,
			draggable : true,
			success : function() {
				$("#find_query_inputbox").keydown(function(e) {
					var ev = e || event;

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

		if(direction == "previous") {
			cursor.findPrevious();
			if(cursor.findPrevious() == false) {
				for( cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
				}
				cursor.findPrevious();
				if(!editor.getSearchCursor(text, null, caseFold).findNext()) {
					return;
				}
			}
		} else {
			if(!cursor.findNext()) {
				cursor = editor.getSearchCursor(text, null, caseFold);

				if(!cursor.findNext())
					return;
			}
		}

		editor.setSelection(cursor.from(), cursor.to());
		this.replace_cursor = cursor;
		this.last_query = text;
		this.last_pos = cursor.to();
	},

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

		// Activate search tab and clean it.
		core.module.layout.inner_bottom_tabview.selectTab(3);
		core.module.search.clean();

		var searchedWords = [];

		this.unmark();
		// search all matched words and set background of them yellow
		for(var cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
			this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));
			var temp = {
				fline : cursor.from().line,
				fch : cursor.from().ch,
				tline : cursor.to().line,
				tch : cursor.to().ch
			};
			searchedWords.push(temp);
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
		if(window_manager.window[window_manager.active_window].editor) {
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
