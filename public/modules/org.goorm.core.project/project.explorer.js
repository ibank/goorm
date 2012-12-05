/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.project.explorer = function () {
	this.target = null;
	this.treeview = null;
	this.context_menu_file = null;
	this.context_menu_folder = null;	
	this.context_menu_project = null;	
	this.current_tree_data = null;	
	this.current_project = null;
	this.project_data = null;
};

org.goorm.core.project.explorer.prototype = {
	init: function () {
		var self = this;

		$("#project_explorer").prepend("<div id='project_selector'></div>");
		$("#project_selector").append("<label class='selectbox'><select id='project_selectbox'></select></label>")

		$("#project_selectbox").change(function() {
			self.on_project_selectbox_change($(this).val());
		});

/*
		$.get("project/get_list", "", function (data) {
			core.workspace = {};
			for(var i in data) {
				data[i].name && (core.workspace[data[i].name] = data[i].contents)
			}
			self.project_data = data;
//			self.make_project_selectbox();
		});
*/

		$("#project_explorer").append("<div id='project_treeview' style='overflow-x:hidden'></div>");
		
		if(!core.status.current_project_path) core.status.current_project_path = "";
		
		var postdata = {
			kind: "project",
			path: "" + core.status.current_project_path
		};
		
		$.get("file/get_nodes", postdata, function (data) {
			if (data != null) {
				var sorting_data = eval(data);

				self.sort_project_treeview(sorting_data);

				self.treeview = new YAHOO.widget.TreeView("project_treeview", sorting_data);

				self.current_tree_data = self.treeview.getTreeDefinition();
	
				self.treeview.subscribe("clickEvent", function(nodedata) { return false; });
	
				self.treeview.subscribe("dblClickEvent", function(nodedata) {
					if(nodedata.node.data.cls == "file") {
						var filename = nodedata.node.data.filename;
						var filetype = nodedata.node.data.filetype;
						var filepath = nodedata.node.data.parent_label;
												
						core.module.layout.workspace.window_manager.open(filepath, filename, filetype);
					}
					else if(nodedata.node.data.cls == "dir") {
						if (nodedata.node.expanded) {
							nodedata.node.collapse();
						}
						else { 
							nodedata.node.expand();
						}
					}
				});
				
	
				self.treeview.render();
				//self.treeview_project.expandAll();
				
				
				//$("#project_treeview").prepend("<div class='project_name'>" + core.current_project_name + "</div>");
				
				
				self.treeview.subscribe("expandComplete", function () {
					self.refresh_context_menu();
					self.current_tree_data = self.treeview.getTreeDefinition();
				});
				
				
				self.set_context_menu();
			}			
		});
		
		$(core).bind("goorm_load_complete",function(){
			self.current_project = {};
			
			if(!$.isEmptyObject(localStorage["current_project"])){
				self.current_project = $.parseJSON(localStorage["current_project"]);
				if(self.current_project.current_project_name != ""){
					core.dialog.open_project.open(self.current_project.current_project_path, self.current_project.current_project_name, self.current_project.current_project_type);
				}
			}
			
			self.refresh();
		});
	},
	
	refresh: function(event_emitting) {
		var self = this;
		
		event_emitting = typeof event_emitting !== 'undefined' ? event_emitting : true;
			
		$.get("project/get_list", "", function (data) {
			self.project_data = data;	
			self.make_project_selectbox();
			
			core.workspace = {};
			for(var i in data) {
				data[i].name && (core.workspace[data[i].name] = data[i].contents);
			}
		});
		

		var temp_project_path = core.status.current_project_path;
		
/*
		if ( temp_project_path == "" ) {
			$("#project_treeview").empty();
			$("#project_treeview").css("background-color", "#CCC");
			$("#project_treeview").append("<div style='text-align:center;padding-top:50%;'>Project not opened</div>");
		}
		else {
*/

			$("#project_treeview").css("background-color", "#FFF");

			var postdata = {
				kind: "project",
				path: "" + temp_project_path
			};

			$.get("file/get_nodes", postdata, function (data) {
				if (data != null) {
					// Root 폴더 생성
					if(temp_project_path != "") {
						var project_root = [{
							cls: "dir",
							expanded: true,
							html: "<div class='node'><img src=images/icons/filetype/folder.filetype.png class='directory_icon file' />"+temp_project_path+"<div class='fullpath' style='display:none;'>/"+temp_project_path+"</div></div>",
							name: temp_project_path,
							parent_label: "/",
							root: "/",
							sortkey: "0",
							type : "html"
						}];
						
						project_root[0].children = eval(data);
						var sorting_data = project_root;
					}
					else {
						var sorting_data = eval(data);
					}
					

					self.sort_project_treeview(sorting_data);	
					
					self.treeview.removeChildren(self.treeview.getRoot(), true);
					
					self.expand_treeview(self.current_tree_data, sorting_data);
					
					self.treeview.buildTreeFromObject(sorting_data);
		
					self.treeview.render();
					
					self.refresh_context_menu();
					
					if (event_emitting) {
						$(core).trigger("project_explorer_refreshed");
					}
				}
			});
/*
		}
*/
	},
	
	expand_treeview: function (source, target) {
		var self = this;		
		$(source).each(function (i) {
			if (this.expanded == true && this.cls == "folder") {
				var object = this;
				$(target).each(function (j) {
					if (object.filename == this.filename && this.cls == "folder") {
						this.expanded = true;
						
						self.expand_treeview(object.children, this.children);
					}	
				});
			}
		});
	},
	
	make_project_selectbox: function() {
		var self = this;

		$("#project_selectbox").empty();
		
		$("#project_selectbox").append("<option value='' selected>Select Project</option>");
		
		var max_num = parseInt($("#project_selector").width()/8);

		if(self.project_data){
			for(var project_idx=0; project_idx<self.project_data.length; project_idx++) {
				var temp_name = self.project_data[project_idx].name;
				

	
				if(temp_name.length > max_num) {
					temp_name = temp_name.substring(0, max_num-2);
					temp_name += "…";
				}


				
				if (self.project_data[project_idx].name == core.status.current_project_path) {
					$("#project_selectbox").append("<option value='"+project_idx+"' selected>"+temp_name+"</option>");
				}
				else {
					$("#project_selectbox").append("<option value='"+project_idx+"'>"+temp_name+"</option>");
				}
			}
		}
	},
		
	on_project_selectbox_change: function (project_idx) {
		var self = this;
		// need modify. NullA
		
		if (project_idx!="") {
			
			self.current_project.current_project_path =  self.project_data[project_idx].name;
			self.current_project.current_project_name = self.project_data[project_idx].contents.name;
			self.current_project.current_projectType = self.project_data[project_idx].contents.type;
			core.dialog.open_project.open(self.current_project.current_project_path, self.current_project.current_project_name, self.current_project.current_projectType);
		}
		else {
		
			core.current_project_name = "";
			core.status.current_project_path = "";
			core.current_projectType = "";
			self.current_project.current_project_path = "";
			self.current_project.current_project_name = "";
			self.current_project.current_projectType = "";
			core.dialog.open_project.open(self.current_project.current_project_path, self.current_project.current_project_name, self.current_project.current_projectType);
		}
		
	},
	
	sort_project_treeview: function (sorting_data) { 				
		/*
		s.quick_sort(sorting_data);
		
		for(i=0; i<sorting_data.length; i++) {
			if(sorting_data[i].children) {
				s.quick_sort(sorting_data[i].children);
			}
		}
		*/
	},	
	
	set_context_menu: function() {
		var self = this;

		self.context_menu_file = new org.goorm.core.menu.context();
		self.context_menu_file.init("configs/menu/org.goorm.core.project/project.explorer.file.html", "project.explorer.file", "", null, null);
		
		self.context_menu_folder = new org.goorm.core.menu.context();
		self.context_menu_folder.init("configs/menu/org.goorm.core.project/project.explorer.folder.html", "project.explorer.folder", "", null, null);

		self.context_menu_project = new org.goorm.core.menu.context();
		self.context_menu_project.init("configs/menu/org.goorm.core.project/project.explorer.html", "project.explorer", "", null, null);
		
		self.refresh_context_menu();

		//$(core).trigger("layout_loaded");
	},
	
	refresh_context_menu: function () {
		var self = this;

		$("#project_treeview").unbind("mousedown");
		$("#project_treeview").mousedown(function (e) {
			
			self.context_menu_file.hide()
			self.context_menu_project.hide();
			self.context_menu_folder.hide();
			
			$("#project_treeview").find(".ygtvfocus").removeClass("ygtvfocus");
				
			if (e.which == 3) {
				
				var offset = 0;
					
				if ( ($(window).height() - 36) < (e.clientY + $("div[id='project.explorer']").height()) ) {
					offset = e.clientY + $("div[id='project.explorer']").height() - $(window).height() + 36;
				};
				
				self.context_menu_project.show();
				$("div[id='project.explorer']").css("left", e.clientX);
				$("div[id='project.explorer']").css("top", e.clientY - offset);				
			}
			
			core.status.selected_file = null;
			
			e.stopPropagation();
			e.preventDefault();
			return false;			
		});


		$("#project_treeview").find(".ygtvcell").unbind("mousedown");		
		$("#project_treeview").find(".ygtvcell").mousedown(function (e) {
			
			self.context_menu_project.hide();
			self.context_menu_file.hide();
			self.context_menu_folder.hide();
			
			if ($(this).hasClass("ygtvfocus") == false) {
				$("#project_treeview").find(".ygtvfocus").removeClass("ygtvfocus");
				
				if ($(this).hasClass("ygtvcontent")) {
					$(this).prev().addClass("ygtvfocus");
					$(this).addClass("ygtvfocus");		
				}
			}

			core.status.selected_file = $(this).find(".fullpath").html();
			
			if (e.which == 3) {
				if ($(this).find("img").hasClass("file")) {
					var offset = 0;
					
					if ( ($(window).height() - 36) < (e.clientY + $("div[id='project.explorer.file']").height()) ) {
						offset = e.clientY + $("div[id='project.explorer.file']").height() - $(window).height() + 36;
					};
					
					self.context_menu_file.show();
					
					$("div[id='project.explorer.file']").css("left", e.clientX);
					$("div[id='project.explorer.file']").css("top", e.clientY - offset);
				}
				else if ($(this).find("img").hasClass("folder")) {
					var offset = 0;
					
					if ( ($(window).height() - 36) < (e.clientY + $("div[id='project.explorer.folder']").height()) ) {
						offset = e.clientY + $("div[id='project.explorer.folder']").height() - $(window).height() + 36;
					};

					self.context_menu_folder.show();
					
					$("div[id='project.explorer.folder']").css("left", e.clientX);
					$("div[id='project.explorer.folder']").css("top", e.clientY - offset);				
				}
			}
			
			e.stopPropagation();
			e.preventDefault();
			return false;			
		});
		
		
		core.module.action.init();
	}
	
};