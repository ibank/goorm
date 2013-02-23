/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.search = function() {
	this.dialog = null;
	this.buttons = null;
	this.last_pos = null;
	this.last_query = null;
	this.marked = [];
	this.match_case = false;
	this.ignore_whitespace = false;
	this.use_regexp = false;
	this.replace_cursor = null;
	this.matched_file_list = [];
	this.treeview = null;
};

org.goorm.core.search.prototype = {
	init : function() {
		var self = this;

		this.buttons = [{
			text : "<span localization_key='find'>Find</span>",
			handler : function() {
				self.search();
			},
			isDefault:true
		}, {
			text : "<span localization_key='close'>Close</span>",
			handler : function() {
				self.hide();
			}
		}];

		this.dialog = new org.goorm.core.search.dialog();
		this.dialog.init({
			localization_key:"title_search",
			title : "Search",
			path : "configs/dialogs/org.goorm.core.search/search.html",
			width : 550,
			height : 245,
			modal : false,
			buttons : this.buttons,
			draggable : true,
			success : function() {
				$("#search_project_explorer").append("<div id='search_project_selector' style='width: 460px; float: right'></div>");
				$("#search_project_selector").append("<label class='selectbox'><select id='search_project_selectbox' style='width: 220px;'></select></label>")
		
				$("#search_project_selectbox").change(function() {
					//self.on_project_selectbox_change($(this).val());
				});

				$("#search_query_inputbox").keydown(function(e) {
					var ev = e || event;

					if(ev.keyCode == 13) {
						self.search();

						e.stopPropagation();
						e.preventDefault();
						return false;
					}
				});

				self.dialog.panel.hideEvent.subscribe(function(e) {
					self.unmark();
				});
				// Checkbox event handler
				$("#search_match_case").change(function() {
					if($("#search_match_case")[0].checked == true)
						self.match_case = true;
					else
						self.match_case = false;
				});

				$("#search_match_case_checkbox_name").click(function() {
					if($("#search_match_case")[0].checked == true) {
						$("#search_match_case")[0].checked = false;
						self.match_case = false;
					} else {
						$("#search_match_case")[0].checked = true;
						self.match_case = true;
					}
				});

				$("#search_ignore_whitespace").change(function() {
					if($("#search_ignore_whitespace")[0].checked == true)
						self.ignore_whitespace = true;
					else
						self.ignore_whitespace = false;
				});

				$("#search_ignore_whitespace_checkbox_name").click(function() {
					if($("#search_ignore_whitespace")[0].checked == true) {
						$("#search_ignore_whitespace")[0].checked = false;
						self.ignore_whitespace = false;
					} else {
						$("#search_ignore_whitespace")[0].checked = true;
						self.ignore_whitespace = true;
					}
				});

				$("#search_use_regexp").change(function(e) {
					if($("#search_use_regexp")[0].checked == true) {
						self.use_regexp = true;
						$("#search_match_case")[0].checked = false;
						$("#search_match_case")[0].disabled = true;
						$("#search_ignore_whitespace")[0].checked = false;
						$("#search_ignore_whitespace")[0].disabled = true;
					} else {
						self.use_regexp = false;
						$("#search_match_case")[0].disabled = false;
						$("#search_ignore_whitespace")[0].disabled = false;
					}
				});

				$("#search_use_regexp_checkbox_name").click(function() {
					if($("#search_use_regexp")[0].checked == true) {
						$("#search_use_regexp")[0].checked = false;
						self.use_regexp = false;
						$("#search_match_case")[0].disabled = false;
						$("#search_ignore_whitespace")[0].disabled = false;
					} else {
						$("#search_use_regexp")[0].checked = true;
						self.use_regexp = true;
						$("#search_match_case")[0].checked = false;
						$("#search_match_case")[0].disabled = true;
						$("#search_ignore_whitespace")[0].checked = false;
						$("#search_ignore_whitespace")[0].disabled = true;
					}
				});
			}
		});

		this.dialog = this.dialog.dialog;

	},

	search : function() {
		var self = this; 
		if($("#search_project_selectbox option:selected").attr("value") == "null"){
			return;
		}
		var keyword = $("#search_query_inputbox").val();
		if(!keyword)
			return;

		var grep_option = " -r -n";
		var text = keyword;
		var caseFold = true;

		
		if(this.use_regexp == true){
			grep_option += " -E";
		}
		else {
			if(this.match_case == true){
				caseFold = false;
			}
			else{
				grep_option += " -i";
			}
			
			if(this.ignore_whitespace == true)
				text = text.replace(/\s*/g, '');
		}
		text = "\"" + text + "\"";
		
		self.get_matched_file(text, grep_option);

	},
	set_search_treeview : function(data) {
		var self = this;

		core.module.layout.inner_bottom_tabview.selectTab(2);
		var window_manager = core.module.layout.workspace.window_manager;

		if(data){
			var sorting_data = [];
			for (key in data){
				sorting_data.push(data[key]);
			}
			self.treeview = new YAHOO.widget.TreeView("search_treeview", sorting_data);

			self.treeview.subscribe("clickEvent", function(nodedata) { 
				var filename = nodedata.node.data.filename;
				var filetype = nodedata.node.data.filetype;
				var filepath = nodedata.node.data.filepath;
				var matched_line = nodedata.node.data.matched_line;
				if(window_manager.active_window != -1)
					window_manager.window[window_manager.active_window].editor.clear_highlight();

				var window = window_manager.open(filepath, filename, filetype);

				setTimeout(function(){
					window.editor.editor.focus();
					window.editor.highlight_line(matched_line);
				}, 200);
			});

			self.treeview.subscribe("dblClickEvent", function(nodedata) { return false; });
			self.treeview.render();
			
/* 			self.treeview.subscribe("expandComplete", function () {}); */
		}
		else{
			window_manager.window[window_manager.active_window].editor.clear_highlight();

			$("#search_treeview").empty();
			var html = "<div class='node' style='font-size: 11px; padding: 2px 5px;'>" + core.module.localization.msg['notice_no_matched_fild'] + "</div>";
			$("#search_treeview").append(html);
		}
	},
	get_matched_file : function(text, grep_option) {
		var self = this;
		var postdata = {
			find_query: text,
			project_path: $("#search_project_selectbox option:selected").attr("value"),
			grep_option: grep_option
		};
		self.matched_file_list = [];
		// 해당 프로젝트안 모든 파일에 대해 검색, 존재할경우 파일 경로 반환
		$.get("file/search_on_project", postdata, function (data) {
			self.set_search_treeview(data);
		});	

	},

	unmark : function() {
		for(var i = 0; i < this.marked.length; ++i)this.marked[i].clear();
		this.marked.length = 0;
	},

	show : function() {
		this.make_search_project_selectbox();
		this.dialog.panel.show();
	},

	hide : function() {
		this.dialog.panel.hide();
	},
	
	make_search_project_selectbox: function() {
		var self = this;
		$("#search_project_selectbox").empty();
		
		$("#search_project_selectbox").append("<option value='null' localization_key='dialog_search_project_select_guide' selected>"+core.module.localization.msg['notice_search_select_project']+"</option>");
		
		var max_num = parseInt($("#search_project_selector").width()/8);
		
		if(core.module.layout.project_explorer.project_data){
			for(var project_idx=0; project_idx<core.module.layout.project_explorer.project_data.length; project_idx++) {
				var temp_name = core.module.layout.project_explorer.project_data[project_idx].name;
	
				if(temp_name.length > max_num) {
					temp_name = temp_name.substring(0, max_num-1);
					temp_name += " …";
				}			
	
				if (core.module.layout.project_explorer.project_data[project_idx].name == core.status.current_project_path) {
					$("#search_project_selectbox").append("<option value='/"+core.module.layout.project_explorer.project_data[project_idx].name+"' selected>"+temp_name+"</option>");
				}
				else {
					$("#search_project_selectbox").append("<option value='/"+core.module.layout.project_explorer.project_data[project_idx].name+"'>"+temp_name+"</option>");
				}
			}

			$("#search_project_selectbox").append("<option value=''>All Projects</option>");
		}
	}
};
