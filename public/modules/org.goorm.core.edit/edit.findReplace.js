/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module edit
 **/

/**
 * This offers functionality about find/replace .
 * @class findReplace
 * @extends edit
 **/
org.goorm.core.edit.findReplace = function() {
	/**
	 * Dialog of find/replace function.
	 * @property dialog
	 * @type Object
	 * @default null
	 **/
	this.dialog = null;
	/**
	 * Buttons at the bottom of dialog.
	 * @property buttons
	 * @type Object
	 * @default null
	 **/
	this.buttons = null;
	/**
	 * The active editor.
	 * @property editor
	 * @type Object
	 * @default null
	 **/
	this.editor = null;
	/**
	 * Next position of last searched words.
	 * @property lastPos
	 * @type Object
	 * @default null
	 **/
	this.lastPos = null;
	/**
	 * Last query user enterred.
	 * @property lastQuery
	 * @type Object
	 * @default null
	 **/
	this.lastQuery = null;
	/**
	 * Array for searched word to be marked.
	 * @property marked
	 * @type Array
	 * @default null
	 **/
	this.marked = [];
	/**
	 * Value of checkbox 'matchCase'.
	 * @property matchCase
	 * @type Object
	 * @default false
	 **/
	this.matchCase = false;
	/**
	 * Value of checkbox 'ignoreWhitespace'.
	 * @property ignoreWhitespace
	 * @type Object
	 * @default false
	 **/
	this.ignoreWhitespace = false;
	/**
	 * Value of checkbox 'useRE'.
	 * @property useRE
	 * @type Object
	 * @default false
	 **/
	this.useRE = false;
	/**
	 * Last cursor in the editor for replace or replace/search.
	 * @property replaceCursor
	 * @type Object
	 * @default null
	 **/
	this.replaceCursor = null;
};
/**
 * This offers functionality about find/replace .
 * @class findReplace
 **/
org.goorm.core.edit.findReplace.prototype = {

	/**
	 * This function is an initializating function for findReplace class.
	 * @constructor
	 **/
	init : function() {
		var self = this;
		this.buttons = [{
			text : "Find",
			handler : function() {
				self.find();
			}
		}, {
			text : "Find All",
			handler : function() {
				self.findAll();
			}
		}, {
			text : "Replace/Find",
			handler : function() {
				self.handleReplaceF();
			}
		}, {
			text : "Replace",
			handler : function() {
				self.handleReplace();
			}
		}, {
			text : "Replace All",
			handler : function() {
				self.handleReplaceAll();
			}
		}, {
			text : "Close",
			handler : function() {
				self.hide();
			}
		}];

		this.dialog = new org.goorm.core.edit.findReplace.dialog();
		this.dialog.init({
			title : "Find/Replace",
			path : "configs/dialogs/org.goorm.core.edit/edit.findReplace.html",
			width : 550,
			height : 300,
			modal : false,
			buttons : this.buttons,
			draggable : true,
			success : function() {
				$("#findQueryInputBox").keydown(function(e) {
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
				$("#matchCase").change(function() {
					if($("#matchCase")[0].checked == true)
						self.matchCase = true;
					else
						self.matchCase = false;
				});

				$("#matchCaseCheckBoxName").click(function() {
					if($("#matchCase")[0].checked == true) {
						$("#matchCase")[0].checked = false;
						self.matchCase = false;
					} else {
						$("#matchCase")[0].checked = true;
						self.matchCase = true;
					}
				});

				$("#ignoreWhitespace").change(function() {
					if($("#ignoreWhitespace")[0].checked == true)
						self.ignoreWhitespace = true;
					else
						self.ignoreWhitespace = false;
				});

				$("#ignoreWhitespaceCheckBoxName").click(function() {
					if($("#ignoreWhitespace")[0].checked == true) {
						$("#ignoreWhitespace")[0].checked = false;
						self.ignoreWhitespace = false;
					} else {
						$("#ignoreWhitespace")[0].checked = true;
						self.ignoreWhitespace = true;
					}
				});

				$("#useRE").change(function(e) {
					if($("#useRE")[0].checked == true) {
						self.useRE = true;
						$("#matchCase")[0].disabled = true;
						$("#ignoreWhitespace")[0].disabled = true;
					} else {
						self.useRE = false;
						$("#matchCase")[0].disabled = false;
						$("#ignoreWhitespace")[0].disabled = false;
					}
				});

				$("#useRECheckBoxName").click(function() {
					if($("#useRE")[0].checked == true) {
						$("#useRE")[0].checked = false;
						self.useRE = false;
						$("#matchCase")[0].disabled = false;
						$("#ignoreWhitespace")[0].disabled = false;
					} else {
						$("#useRE")[0].checked = true;
						self.useRE = true;
						$("#matchCase")[0].disabled = true;
						$("#ignoreWhitespace")[0].disabled = true;
					}
				});
			}
		});

		this.dialog = this.dialog.dialog;

	},
	/**
	 * @method find
	 **/
	find : function(direction) {
		var windowManager = core.mainLayout.workSpace.windowManager;
		// Get current activeWindow's editor
		if(windowManager.window[windowManager.activeWindow].editor) {
			// Get current activeWindow's CodeMirror editor
			var editor = windowManager.window[windowManager.activeWindow].editor.editor;
			// Get input query of this dialog
			var keyword = $("#findQueryInputBox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			this.search(keyword, editor, direction);
		}
	},
	/**
	 * @method findAll
	 **/
	findAll : function() {

		var windowManager = core.mainLayout.workSpace.windowManager;
		// Get current activeWindow's editor
		if(windowManager.window[windowManager.activeWindow].editor) {
			// Get current activeWindow's CodeMirror editor
			var editor = windowManager.window[windowManager.activeWindow].editor.editor;
			// Get input query of this dialog
			var keyword = $("#findQueryInputBox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			this.searchAll(keyword, editor);
		}
	},
	/**
	 * @method handleReplaceF
	 **/
	handleReplaceF : function() {

		var windowManager = core.mainLayout.workSpace.windowManager;
		// Get current activeWindow's editor
		if(windowManager.window[windowManager.activeWindow].editor) {
			// Get current activeWindow's CodeMirror editor
			var editor = windowManager.window[windowManager.activeWindow].editor.editor;
			// Get input query and replacing word of this dialog
			var keyword1 = $("#findQueryInputBox").val();
			var keyword2 = $("#replaceQueryInputBox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			this.replace(keyword1, keyword2, editor);
			this.search(keyword1, editor);
			//this.replaceSearch(keyword1, keyword2, editor);
		}
	},
	/**
	 * @method handleReplace
	 **/
	handleReplace : function() {

		var windowManager = core.mainLayout.workSpace.windowManager;
		// Get current activeWindow's editor
		if(windowManager.window[windowManager.activeWindow].editor) {
			// Get current activeWindow's CodeMirror editor
			var editor = windowManager.window[windowManager.activeWindow].editor.editor;
			// Get input query and replacing word of this dialog
			var keyword1 = $("#findQueryInputBox").val();
			var keyword2 = $("#replaceQueryInputBox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			this.replace(keyword1, keyword2, editor);
		}
	},
	/**
	 * @method handleReplaceAll
	 **/
	handleReplaceAll : function() {

		var windowManager = core.mainLayout.workSpace.windowManager;
		// Get current activeWindow's editor
		if(windowManager.window[windowManager.activeWindow].editor) {
			// Get current activeWindow's CodeMirror editor
			var editor = windowManager.window[windowManager.activeWindow].editor.editor;
			// Get input query and replacing word of this dialog
			var keyword1 = $("#findQueryInputBox").val();
			var keyword2 = $("#replaceQueryInputBox").val();
			// Call search function of org.goorm.core.file.findReplace with keyword and editor
			this.replaceAll(keyword1, keyword2, editor);
		}
	},
	/**
	 * @method search
	 **/
	search : function(keyword, editor, direction) {
		if(!keyword)
			return;
		var text = keyword;
		var caseFold = true;

		if(this.useRE == true)
			text = RegExp(keyword, "g");
		else {
			if(this.matchCase == true)
				caseFold = false;
			if(this.ignoreWhitespace == true)
				text = text.replace(/\s*/g, '');
		}

		this.unmark();

		for(var cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
			this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));
		}

		if(this.lastQuery != text)
			this.lastPos = null;

		var cursor = editor.getSearchCursor(text, this.lastPos ? this.lastPos : editor.getCursor(), caseFold);

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
		this.replaceCursor = cursor;
		this.lastQuery = text;
		this.lastPos = cursor.to();
	},
	/**
	 * @method searchAll
	 **/
	searchAll : function(keyword, editor) {

		if(!keyword)
			return;
		var text = keyword;
		var caseFold = true;

		if(this.useRE == true)
			text = RegExp(keyword, "g");
		else {
			if(this.matchCase == true)
				caseFold = false;
			if(this.ignoreWhitespace == true)
				text = text.replace(/\s*/g, '');
		}

		// Activate search tab and clean it.
		core.mainLayout.innerBottomTabView.selectTab(3);
		core.searchTab.clean();

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
			core.searchTab.m(searchedWords[i].fline, searchedWords[i].fch, searchedWords[i].tline, searchedWords[i].tch, editor.getLine(searchedWords[i].fline));
		}

		this.dialog.panel.hide();

		// highlight the selected word on the editor with gray background
		$(".searchMessage").click(function() {

			$(".searchMessage").css("background-color", "");
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
	/**
	 * @method replaceSearch
	 **/
	replaceSearch : function(keyword1, keyword2, editor) {

		if(!keyword1)
			return;
		var text = keyword1, replace = keyword2;
		var caseFold = true;

		if(this.useRE == true)
			text = RegExp(keyword1, "g");
		else {
			if(this.matchCase == true)
				caseFold = false;
			if(this.ignoreWhitespace == true)
				text = text.replace(/\s*/g, '');
		}

		this.unmark();

		for(var cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
			this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));
		}

		if(this.lastQuery != text)
			this.lastPos = null;

		var cursor = editor.getSearchCursor(text, editor.getCursor() || this.lastPos, caseFold);

		if(!cursor.findNext()) {
			cursor = editor.getSearchCursor(text, null, caseFold);

			if(!cursor.findNext())
				return;
		}

		editor.setSelection(cursor.from(), cursor.to());
		this.lastQuery = text;
		this.lastPos = cursor.to();

	},
	/**
	 * @method replace
	 **/
	replace : function(keyword1, keyword2, editor) {
		if(!keyword1)
			return;

		var text = keyword1, replace = keyword2;
		var caseFold = true;

		if(this.useRE == true)
			text = RegExp(keyword1, "g");
		else {
			if(this.matchCase == true)
				caseFold = false;
			if(this.ignoreWhitespace == true)
				text = text.replace(/\s*/g, '');
		}

		this.unmark();
		var cursor = editor.getSearchCursor(text, this.lastPos, caseFold);
		cursor.findPrevious();
		editor.replaceRange(replace, cursor.from(), cursor.to());
	},
	/**
	 * @method replaceAll
	 **/
	replaceAll : function(keyword1, keyword2, editor) {

		if(!keyword1)
			return;
		var text = keyword1, replace = keyword2;
		var caseFold = true;

		if(this.useRE == true)
			text = RegExp(keyword1, "g");
		else {
			if(this.matchCase == true)
				caseFold = false;
			if(this.ignoreWhitespace == true)
				text = text.replace(/\s*/g, '');
		}

		// Activate search tab and clean it.
		core.mainLayout.innerBottomTabView.selectTab(3);
		core.searchTab.clean();

		this.unmark();
		for(var cursor = editor.getSearchCursor(text, null, caseFold); cursor.findNext(); ) {
			editor.replaceRange(replace, cursor.from(), cursor.to());
			core.searchTab.mReplaceAll(cursor.from().line, cursor.from().ch, cursor.to().line, cursor.to().ch, text, replace);
		}

		this.dialog.panel.hide();

		// highlight the selected word on the editor with gray background
		$(".searchMessage").click(function() {

			$(".searchMessage").css("background-color", "");
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
	/**
	 * @method unmark
	 **/
	unmark : function() {
		for(var i = 0; i < this.marked.length; ++i)this.marked[i].clear();
		this.marked.length = 0;
	},
	/**
	 * @method show
	 **/
	show : function() {

		this.dialog.panel.show();

		var windowManager = core.mainLayout.workSpace.windowManager;

		// Get current activeWindow's editor
		if(windowManager.window[windowManager.activeWindow].editor) {
			// Get current activeWindow's CodeMirror editor
			var editor = windowManager.window[windowManager.activeWindow].editor.editor;
			$("#findQueryInputBox").val(editor.getSelection());
		}

		//$("#findQueryInputBox").focus();
		$("#findQueryInputBox").select();
	},
	/**
	 * @method hide
	 **/
	hide : function() {
		this.dialog.panel.hide();
	}
};
