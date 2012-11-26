/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.window.manager = function () {
	this.window = null;
	this.tab = null;
	this.context_menu = null;
	this.list_menu = null;
	this.window_list_menu = null;
	this.workspace_container = null;
	this.window_list_container = null;
	this.index = 0;
	this.window_tabview = null;
	this.active_window = -1;
	this.maximized = false;
	this.window_list = null;
};

org.goorm.core.window.manager.prototype = {
	init: function(container) {
		var self = this;
		
		this.window = [];
		this.tab = [];
		this.context_menu = [];
		this.window_list_menu = [];
		this.workspace_container = container;
		
		this.window_list = [];

		$("#" + container).append("<div id='" + container + "_window_list'><div class='tab_max_buttons' style='float:right;'><div class='unmaximize_all window_button'></div> <div class='maximized_close window_button'></div></div><div class='tab_scroll' style='float:right;'><div class='tab_list_left window_button'></div><div class='window_list window_button'></div><div class='tab_list_right window_button'></div></div></div>");
		
		$(".unmaximize_all").click(function (e) {
			//self.cascade();
			
			self.unmaximize_all();
			
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
		
		$(".tab_max_buttons").hide();
		
		$(".maximized_close").click(function () {
			self.window[self.active_window].close();
		});
		
		$(".tab_list_left").click(function () {
			if(self.active_window > 0) {
				self.active_window--;
				self.window[self.active_window].activate();
			}
		});
		$(".tab_list_right").click(function () {
			if(self.active_window < self.index-1) {
				self.active_window++;
				self.window[self.active_window].activate();
			}
		});
		
		this.window_list_container = container + "_window_list";
		
		this.window_tabview = new YAHOO.widget.TabView(this.window_list_container);

		this.list_menu = new YAHOO.widget.Menu("window_list_menu");
		this.list_menu.render(document.body);
		
		this.context_menu[0] = new org.goorm.core.menu.context();
		this.context_menu[0].init("configs/menu/org.goorm.core.window/window.manager.html", "window.manager", container);
		
		this.context_menu[1] = new org.goorm.core.menu.context();
		this.context_menu[1].init("configs/menu/org.goorm.core.window/window.manager.tabview.html", "window.manager.tabview", container + "_window_list");
		
		//////////////////////////////////////////////////////////////////////////////////////////
		// window events
		//////////////////////////////////////////////////////////////////////////////////////////

		$("#" + container).click(function () {
			self.context_menu[0].cancel();
			self.context_menu[1].cancel();
			
			for(i=0; i<self.index; i++) {
				if (self.window[i].context_menu) {
					self.window[i].context_menu.cancel();
				}
				
				if (self.tab[i].context_menu) {
					self.tab[i].context_menu.cancel();					
				}
			}
			
		});
				
		$("#" + container + "_window_list").find(".window_list").click(function () {
			self.list_menu.show();
			
			$("#window_list_menu").css("z-index", 5);
			$("#window_list_menu").css("left", $("#" + container + "_window_list").find(".window_list").offset().left - $("#window_list_menu").width() + 10);
			$("#window_list_menu").css("top", $("#" + container + "_window_list").find(".window_list").offset().top + 10);	
		
			return false;
		});
		
		$(core).bind("edit_file_open", function(evt, data){
			var postdata = {
				workspace : data.workspace
			}
			
			$.post("/file/update_data", postdata, function(logs){
				var index = -1;
				if(logs.length > 0){
					for(var i=0; i<self.window.length; i++){
						var filepath = self.window[i].filepath + self.window[i].filename;
						if(filepath == logs[0].filepath){
							index = i;
							break;
						}
					}
					
					if(index != -1){
						for(var i=0; i<logs.length; i++){
							self.window[index].editor.collaboration.set_cursor(logs[i].message);
						}
					}
				}
			});
		});
		
		$(core).bind("goorm_load_complete", function () {
			if(!$.isEmptyObject(localStorage["workspace_window"])){
				var temp_window_list = $.parseJSON(localStorage["workspace_window"]);
				var count = 0;
				var active = 0;
				
				$(temp_window_list).each(function (i) {
					self.open(this.filepath, this.filename, this.filetype, this.editor);
					
					//TODO: sort by index
					
					//TODO: arrange windows with each position and size
					var current_window = self.window[self.index-1];
					
					current_window.left = this.left;
					current_window.top = this.top;
					current_window.width = this.width;
					current_window.height = this.height;
					current_window.status = this.status;
					current_window.project = this.project;
					
					if (this.status == "maximized") {						
						$("#" + current_window.container + "_c").offset({left:$("#" + current_window.workspace_container).offset().left - 1, top:$("#" + self.workspace_container).offset().top});
						$("#" + current_window.container + "_c").width($("#" + self.workspace_container).width());
						$("#" + current_window.container + "_c").height($("#" + self.workspace_container).height());
						
						$("#" + current_window.container).width($("#" + self.workspace_container).width());
						$("#" + current_window.container).height($("#" + self.workspace_container).height());
						
						$("#" + current_window.container).find(".ft").addClass("maximized_ft");
						
			            current_window.panel.cfg.setProperty("width", $("#" + self.workspace_container).width() + "px");
			            current_window.panel.cfg.setProperty("height", $("#" + self.workspace_container).height()+ "px");
						
						$(".tab_max_buttons").show();
						
						current_window.resize.lock();
						
						self.maximized = true;
					}
					else {
						$("#" + current_window.container + "_c").offset({left:this.left, top:this.top});
						$("#" + current_window.container + "_c").width(this.width);
						$("#" + current_window.container + "_c").height(this.height);
						
						$("#" + current_window.container).width(this.width);
						$("#" + current_window.container).height(this.height);
						
						current_window.panel.cfg.setProperty("width", this.width + "px");
			          current_window.panel.cfg.setProperty("height", this.height - 3 + "px");
						
						current_window.status = null;
						
						$(".tab_max_buttons").hide();
			
						current_window.resize.unlock();
					}
					
					current_window.resize_all();
					current_window.set_title();
				});
			}
		});
		
		$(core).bind("layout_resized", function () {
			if (self.maximized) {
				self.maximize_all();
			}
		});
		
		$(window).unload(function () {
			self.save_workspace();
		});
	},
	
	save_workspace: function() {
		var window_data = [];
		var self = this;
		$(this.window).each(function (i) {
			if (self.window[i].alive) {
				window_data.push({
					filepath: this.filepath,
					filename: this.filename,
					filetype: this.filetype,
					project: this.project,
					editor: this.type,
					left: this.left,
					top: this.top,
					width: this.width,
					height: this.height,
					index: this.index,
					status: this.status
				});
			}
		});

		localStorage["workspace_window"] = JSON.stringify(window_data);
	},

	open: function(filepath, filename, filetype, editor) {

		if (filetype == "pdf" || filetype == "jpg" || filetype == "jpeg" || filetype == "gif" || filetype == "png" || filetype == "doc" || filetype == "docx" || filetype == "ppt" || filetype == "pptx" || filetype == "xls" || filetype == "xlsx") {		
			var query = {
				filepath: filepath,
				filename: filename
			};
			
			$.get("file/get_file", query, function () {
				window.open("files/" + filepath + filename);
			});
		}
		else {
			var i = this.is_opened(filepath, filename);
			var project_name = filepath.split('/')[1];
			if(filepath[0] != '/') project_name = filepath.split('/')[0]
			var workspace = project_name.substring(parseInt(project_name.indexOf('_'))+1);
			
			if(i >= 0) {
				this.active_window = i;
				this.window[i].activate();
				
				// $(core).trigger('edit_file_open', {'workspace':workspace});
				
				return this.window[i];
			}
			else {
				this.add(filepath, filename, filetype, editor);
				
				if (this.maximized) {
					this.window[this.window.length - 1].maximize();
				}
				
				//$(core).trigger('edit_file_open', {'workspace':workspace});
				
				return this.window[this.window.length - 1];
			}
		}
	},
	
	find_by_filename: function (filepath, filename) {
		var result = null;
		
		$(this.window).each(function (i) {
			if (this.filepath == filepath && this.filename == filename) {
				result = this;
			}
		});
		
		return result;
	},
	
	is_opened: function (filepath, filename) {
		var self = this;
		var window_index = -1;
		var empty_windows = [];
		
		$(this.window).each(function (i) {
			if (this.filepath == null && this.filename == null) {
				empty_windows.push(i);
			}
		});
		
		$(empty_windows).each(function (i) {
			self.window.pop(this);
		});
		
		$(this.window).each(function (i) {
			var base = this.filepath;
			var target = filepath;
			
			if(filepath.length > this.filepath.length){
				base = filepath;
				target = this.filepath;
			}
			
			if ( base.indexOf(target) != -1 && this.filename == filename) {
				window_index = i;
			}
		});
		
		return window_index;
	},	

	add: function(filepath, filename, filetype, editor) {
		if(this.check_already_opened()) {
			m.s("warning", "This file is already opened!!", "window_manager");
		}
		else {
			var self = this;
			this.active_window = this.index;

			var title = filename;

			$("#"+this.workspace_container).append("<div id='filewindow"+this.index+"'></div>");
			
			this.window[this.index] = new org.goorm.core.window.panel();
			this.window[this.index].init("filewindow"+this.index, title, this.workspace_container, filepath, filename, filetype, editor);	
			
			this.tab[this.index] = new org.goorm.core.window.tab();
			this.tab[this.index].init("filewindow"+this.index, title, this.window_tabview, this.list_menu);			
			
			this.window[this.index].connect(this.tab[this.index]);
			this.tab[this.index].connect(this.window[this.index]);
			
			this.window[this.index].index = this.index;
			
			this.window[this.index].activate();				
			this.tab[this.index].activate();

			this.index++;
		}
	},
	
	maximize_all: function () {
		$(this.window).each(function (i) {
			this.maximize();
		});
		
		this.maximized = true;
	},
	
	unmaximize_all: function () {
		$(this.window).each(function (i) {
			this.unmaximize();
		});
		
		this.maximized = false;
	},
	
	check_already_opened: function(fullpath, filename) {
	},
		
	previous_window: function () {	
/*
		if (this.window[this.active_window-1]) {
			this.window[this.active_window-1].activate();
			this.active_window--;
		  
		 	if (this.window[this.active_window].type == "Editor") {
				this.window[this.active_window].editor.editor.focus();
			}
		}
*/
			if(this.active_window > 0) {
				this.active_window--;
				this.window[this.active_window].activate();
			}
	},

	next_window: function () {
/*
		if (this.window[this.active_window+1]) {
			this.window[this.active_window+1].activate();
			this.active_window++;
		  
		  	if (this.window[this.active_window].type == "Editor") {
				this.window[this.active_window].editor.editor.focus();
			}			  
		}
*/
			if(this.active_window < this.index-1) {
				this.active_window++;
				this.window[this.active_window].activate();
			}
	},
	
	hide_all_windows: function () {
		$(this.window).each(function (i) {
			$("#" + this.container + "_c").hide("fast");
			this.status = "minimized";	
		});
	},

	show_all_windows: function () {
		$(this.window).each(function (i) {
			$("#" + this.container + "_c").show("fast");
			this.status = null;	
			this.resize_all();
		});
	},
	
	save_all: function() {
		for (var i = 0; i < this.window.length; i++) {
			if(this.window[i].alive) {
				if (this.window[i].designer) {
					this.window[i].designer.save();
				}
				else if (this.window[i].editor) {
					this.window[i].editor.save();
				}
				
				var window_manager = core.module.layout.workspace.window_manager;
				
				window_manager.window[i].set_saved();
				window_manager.tab[i].set_saved();
			}
		}
	},
	
	cascade: function () {
		var count = 0;
		var width_ratio = 0.6;
		var height_ratio = 0.7;
		
		for (var i = 0; i < this.index; i++) {
			if(this.window[i].alive) {
				if(this.window[i].status=="maximized") {
					this.window[i].maximize();
					this.is_maxmizedd = true;
				}

				this.window[i].panel.left	= 4+(24*count);
				this.window[i].panel.top	= 29+(24*count);
				this.window[i].panel.width = $('#workspace').width() * width_ratio;
				this.window[i].panel.height = $('#workspace').height() * height_ratio;
				
				//m.s(this.window[i].designer.toSource());
				//if($('#filewindow'+i+'_c').find(".code_editor") != null) {
				if(this.window[i].designer){
					m.s(this.window[i].type);
					$('#filewindow'+i+'_c').find(".canvas_container").css('width', this.window[i].panel.width - 14 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".canvas_container").css('height', this.window[i].panel.height - 68 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".ruler_x").css('width', this.window[i].panel.width - 15 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".ruler_y").css('height', this.window[i].panel.height - 65 + 'px');
				}
								
				$('#filewindow'+i+'_c').css('left', this.window[i].panel.left + 'px');
				$('#filewindow'+i+'_c').css('top', this.window[i].panel.top + 'px');
				$('#filewindow'+i+'_c').css('z-index', i);

				this.window[i].panel.cfg.setProperty('left', this.window[i].panel.left + 'px');
				this.window[i].panel.cfg.setProperty('top', this.window[i].panel.top + 'px');

//				$('#filewindow'+i+'_c').find('.yui-panel').css('width', this.window[i].panel.width + 'px');
//				$('#filewindow'+i+'_c').find('.yui-panel').css('height', this.window[i].panel.height-22 + 'px');
				$('#filewindow'+i+'_c').css('width', this.window[i].panel.width + 'px');
				$('#filewindow'+i+'_c').css('height', this.window[i].panel.height + 'px');
				$('#filewindow'+i).children(".bd").height(this.window[i].panel.height - 50);
				$('#filewindow'+i).css('width', this.window[i].panel.width + 'px');
				$('#filewindow'+i).css('height', (this.window[i].panel.height - 2) + 'px');
				$('#filewindow'+i+'_c').children(".window_container").height(this.window[i].panel.height - 50);
				this.window[i].resize_all();
				this.window[i].refresh();
				count++;
			}
		}
		
		this.is_maxmizedd = false;
		
		$(".tab_max_buttons").hide();
		
		//this.window[this.active_window].activate();
	},
	
	tile_vertically: function () {
		var count = 0;
		var each_width = Math.floor(($('#workspace').width()-9) / this.count_alive_windows());
		var each_height = $('#workspace').height()-33;
			
		for (var i = 0; i < this.index; i++) {
			if(this.window[i].alive) {
				if(this.window[i].status=="maximized") {
					this.window[i].maximize();
					this.is_maxmizedd = true;
				}
				this.window[i].panel.left	= 4+(each_width*count);
				this.window[i].panel.top	= 29;
				this.window[i].panel.width	= each_width;
				this.window[i].panel.height	= each_height;
				
				if(this.window[i].designer){
					$('#filewindow'+i+'_c').find(".canvas_container").css('width', this.window[i].panel.width - 14 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".canvas_container").css('height', this.window[i].panel.height - 68 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".ruler_x").css('width', this.window[i].panel.width - 15 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".ruler_y").css('height', this.window[i].panel.height - 65 + 'px');
				}
				
				$('#filewindow'+i+'_c').css('left', this.window[i].panel.left + 'px');
				$('#filewindow'+i+'_c').css('top', this.window[i].panel.top + 'px');
				$('#filewindow'+i+'_c').css('width', this.window[i].panel.width + 'px');
				$('#filewindow'+i+'_c').css('height', this.window[i].panel.height + 'px');
				$('#filewindow'+i+'_c').css('z-index', i);

				this.window[i].panel.cfg.setProperty('left', this.window[i].panel.left + 'px');
				this.window[i].panel.cfg.setProperty('top', this.window[i].panel.top + 'px');

				$('#filewindow'+i+'_c').find('.yui-panel').css('width', this.window[i].panel.width + 'px');
				$('#filewindow'+i+'_c').find('.yui-panel').css('height', this.window[i].panel.height + 'px');
				$('#filewindow'+i+'_c').children('.yui-panel').children(".bd").height(this.window[i].panel.height - 50);
				$('#filewindow'+i+'_c').find(".window_container").find(".CodeMirror").height(this.window[i].panel.height - 50);
				this.window[i].resize_all();
				this.window[i].refresh();
				count++;
				
				$('#filewindow'+i).css('width', this.window[i].panel.width + 'px');
				$('#filewindow'+i).css('height', (this.window[i].panel.height - 2) + 'px');
			}
		}
		
				
		this.is_maxmizedd = false;
		$(".tab_max_buttons").hide();
	},
	
	tile_horizontally: function() {
		var count = 0;
		var each_width = $('#workspace').width()-9;
		var each_height = Math.floor(($('#workspace').height()-33) / this.count_alive_windows());
			
		for (var i = 0; i < this.index; i++) {
			if(this.window[i].alive) {
				if(this.window[i].status=="maximized") {
					this.window[i].maximize();
					this.is_maxmizedd = true;
				}
				this.window[i].panel.left	= 4;
				this.window[i].panel.top	= 29+(each_height*count);
				this.window[i].panel.width	= each_width;
				this.window[i].panel.height	= each_height;
				
				if(this.window[i].designer){
					m.s(this.window[i].type);
					$('#filewindow'+i+'_c').find(".canvas_container").css('width', this.window[i].panel.width - 14 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".canvas_container").css('height', this.window[i].panel.height - 68 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".ruler_x").css('width', this.window[i].panel.width - 15 + 'px');
			  	 	$('#filewindow'+i+'_c').find(".ruler_y").css('height', this.window[i].panel.height - 65 + 'px');
				}
				
				$('#filewindow'+i+'_c').css('left', this.window[i].panel.left + 'px');
				$('#filewindow'+i+'_c').css('top', this.window[i].panel.top + 'px');
				$('#filewindow'+i+'_c').css('width', this.window[i].panel.width + 'px');
				$('#filewindow'+i+'_c').css('height', this.window[i].panel.height + 'px');
				$('#filewindow'+i+'_c').css('z-index', i);

				this.window[i].panel.cfg.setProperty('left', this.window[i].panel.left + 'px');
				this.window[i].panel.cfg.setProperty('top', this.window[i].panel.top + 'px');

				$('#filewindow'+i+'_c').find('.yui-panel').css('width', this.window[i].panel.width + 'px');
				$('#filewindow'+i+'_c').find('.yui-panel').css('height', this.window[i].panel.height + 'px');
				$('#filewindow'+i+'_c').children('.yui-panel').children(".bd").height(this.window[i].panel.height - 50);
				$('#filewindow'+i+'_c').find(".window_container").find(".CodeMirror").height(this.window[i].panel.height - 50);
				this.window[i].resize_all();
				this.window[i].refresh();
				count++;
				
				$('#filewindow'+i).css('width', this.window[i].panel.width + 'px');
				$('#filewindow'+i).css('height', (this.window[i].panel.height - 2) + 'px');
			}
		}
			
		this.is_maxmizedd = false;
		$(".tab_max_buttons").hide();
	},
	
	hide_all_context_menu : function(){
		var self = this;
		
		for(var i=0; i<self.window.length; i++){
			self.window[i].context_menu.hide();
		}
	},
	
	count_alive_windows: function() {
		var count = 0;
		
		for (var i = 0; i < this.index; i++) {
			if(this.window[i].alive) {
				count++;
			}
		}
		
		return count;
	},
	
	delete_window_in_tab : function(target_index){
		if(this.tab && this.tab[target_index]){
			this.tab.splice(target_index, 1);
		}
	},
	
	decrement_index_in_window : function(close_index){
		var length = this.window.length;
		var workspace_container = this.workspace_container;
		
		for(var i = close_index+1; i < length; i++){
			var new_index = parseInt(i)-1;
			
			var new_container = "filewindow"+new_index;
			var new_container_c = "filewindow"+new_index+"_c";
			var new_container_h = "filewindow"+new_index+"_h";
			
			this.window[i].panel.dd.id = new_container_c;
			this.window[i].panel.dd.dragElId = new_container_c;
			this.window[i].panel.dd.handleElId = new_container_h;
			
			$("#"+workspace_container).find("#filewindow"+i).parent().attr("id", new_container_c);
			$("#"+workspace_container).find("#filewindow"+i).find("#filewindow"+i+"_h").attr("id", new_container_h);
			$("#"+workspace_container).find("#filewindow"+i).attr("id", new_container);
			
			this.window[i].container = new_container;
			this.window[i].index--;
		}
	},
	
	close_all: function() {
		var self = this;
		
		$(this.window).each(function (i) {
			this.is_saved = true;
			this.tab.is_saved = true;
			this.close();
		});
				
		this.index = 0;
		this.active_window = -1;
		
		this.window.remove(0, this.window.length-1);	
	}
	

};