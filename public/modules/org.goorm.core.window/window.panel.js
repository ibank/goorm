/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.window.panel = function () {
	this.panel = null;
	this.resize = null;
	this.context_menu = null;
	this.container = null;
	this.workspace_container = null;
	this.tab = null;
	this.editor = null;
	this.designer = null;
	this.terminal = null;
	this.title = null;
	this.type = null;
	this.status = null;
	this.filepath = null;
	this.filename = null;
	this.filetype = null;
	this.left = null;
	this.top = null;
	this.width = null;
	this.height = null;
	this.alive = null;
	this.is_first_maximize = null;
	this.is_saved = null;
	this.project = null;
	this.index = 0;
};

org.goorm.core.window.panel.prototype = {
	init: function(container, title, workspace_container, filepath, filename, filetype, editor) {
		var self = this;
		
		this.is_saved = true;
		
		this.container = container;
		this.workspace_container = workspace_container;

		if(filetype == "" || filetype == "etc") {
			filetype = "txt";
		}
		else if(filetype == "url"){
			this.type = "codemirror_editor";
			filename = filepath;
		}
		
		this.filepath = filepath;
		this.filename = filename;
		this.filetype = filetype;

		for (var i=0; i<core.filetypes.length; i++) {
			if (filetype==core.filetypes[i].file_extension) {
				editor = core.filetypes[i].editor;
				break;
			}			
		}
		
		if(!editor) editor = 'Editor';
		
		this.project = core.status.current_project_path;
		
		this.alive = true;
		this.is_first_maximize = true;

		var window_count = core.module.layout.workspace.window_manager.window.length;
		var target_active_window = core.module.layout.workspace.window_manager.active_window - 1;
		
		var new_x;
		var new_y;
		
		if(target_active_window == -1){
			new_x = $(".yui-layout-unit-center").position().left + 5;
			new_y = $(".yui-layout-unit-center").position().top + 30;
		}
		else{
			var target_container = core.module.layout.workspace.window_manager.window[target_active_window].container;
			new_x = $('#'+target_container).offset().left + 30;
			new_y = $('#'+target_container).offset().top + 30;
		}
		
		this.panel = new YAHOO.widget.Panel(
			container, { 
				// x: $(".yui-layout-unit-center").position().left + 5 + window_count * 24, 
				// y: $(".yui-layout-unit-center").position().top + 30 + window_count * 24, 
				x : new_x,
				y : new_y,
				width: parseInt($("#" + self.workspace_container).width()/2),
				height: parseInt($("#" + self.workspace_container).height()/2), 
				visible: true, 
				underlay: "none",
				close: false,
				autofillheight: "body",
				draggable: true,
				constraintoviewport: true,
				context: ["showbtn", "tl", "bl"]
			} 
		);	

		
		//////////////////////////////////////////////////////////////////////////////////////////
		// window setting
		//////////////////////////////////////////////////////////////////////////////////////////	
		
		this.title = title;
		this.panel.setHeader("<div style='overflow:auto' class='titlebar'><div class='window_title' style='float:left'>"+this.title+"</div><div class='window_buttons'><div class='minimize window_button'></div> <div class='maximize window_button'></div> <div class='close window_button'></div></div></div>");
		this.panel.setBody("<div class='window_container'></div>");
		this.panel.setFooter("<div class='.footer'>footer</div>");
		this.panel.render();
		this.status = "unmaximized";
		//this.filename = filename;
		this.left = $("#"+container).css("left");
		this.top = $("#"+container).css("top");
		this.width = parseInt($("#" + self.workspace_container).width()/1.3);
		this.height = parseInt($("#" + self.workspace_container).height()/1.5);

		$("#" + this.container).width(this.width);
		$("#" + this.container).height(this.height);

		// Due to file type, create proper tool.
		if (editor == "Editor") {

			this.type = "Editor";

			//var mode = core.filetypes[this.inArray(this.filetype)].mode;
			var mode;

			if (this.filetype=="url") {
				mode = core.filetypes[this.inArray("html")].mode;
			}
			else {
				mode = core.filetypes[this.inArray(this.filetype)].mode;
			}

			this.editor = new org.goorm.core.edit();
			this.editor.init($("#"+container).find(".window_container"));
			this.editor.load(this.filepath, this.filename, this.filetype);
			this.editor.set_mode(mode);

		}
		else if (editor == "Designer") {
			this.type = "Designer";
			this.designer = new org.goorm.core.design();
			this.designer.init($("#"+container).find(".window_container")[0], this.title);
			this.designer.load(this.filepath, this.filename, this.filetype);
		}
		else if (editor == "Terminal") {
			this.type = "Terminal";
			
			this.title = "Terminal";
			
			this.terminal = new org.goorm.core.terminal();
			this.terminal.init($("#"+container).find(".window_container")[0], this.filename, true);
			
			$("#"+container).find(".window_container").css("overflow", "auto");
			
			this.panel.setFooter("");
		}	
		else if (this.inArray(this.filetype) > -1) {
			this.type = core.filetypes[this.inArray(this.filetype)].editor;
			 	
			if (this.type == "Editor") {
				var mode = core.filetypes[this.inArray(this.filetype)].mode;
				
				this.editor = new org.goorm.core.edit();
				this.editor.init($("#"+container).find(".window_container"));
				this.editor.load(this.filepath, this.filename, this.filetype);
				this.editor.set_mode(mode);
			}
			else if (this.type == "Designer") {
				this.designer = new org.goorm.core.design();
				this.designer.init($("#"+container).find(".window_container")[0], this.title);
				this.designer.load(this.filepath, this.filename, this.filetype);
			}
			else if (this.type == "Rule_Editor") {
				this.rule_editor = new org.goorm.core.rule.edit();
				this.rule_editor.init($("#"+container).find(".window_container")[0], this.title);
				this.rule_editor.load(this.filepath, this.filename, this.filetype);
			}
		}
		else { // default txt
			var mode = 'text/javascript';
			
			this.editor = new org.goorm.core.edit();
			this.editor.init($("#"+container).find(".window_container"));
			this.editor.load(this.filepath, this.filename, 'txt');
			this.editor.set_mode(mode);
		}


		
		this.set_footer(); //native function to call the this.panel.setFooter()		
		
		this.resize_all();
		
		
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init("configs/menu/org.goorm.core.window/window.panel.titlebar.html", "window.panel.titlebar", $("#"+container).find(".titlebar"), this.title);
		
		this.resize = new YAHOO.util.Resize(container+"_c", {
			handles: 'all',
			minWidth: 100,
			minHeight: 100,
			status: false,
			proxy: false, 
		});

		this.resize.on("startResize", function(args) {
			if (this.cfg.get_property("constraintoviewport")) { 
				var D = YAHOO.util.Dom; 
				
				var clientRegion = D.getClientRegion(); 
				var elRegion = D.getRegion(this.element); 
				
				self.resize.set("maxWidth", clientRegion.right - elRegion.left - YAHOO.widget.Overlay.VIEWPORT_OFFSET); 
				self.resize.set("maxHeight", clientRegion.bottom - elRegion.top - YAHOO.widget.Overlay.VIEWPORT_OFFSET); 
			} 
			else { 
				self.resize.set("maxWidth", null); 
				self.resize.set("maxHeight", null); 
			} 
			
			self.activate();
		}, this.panel, true);
		
		this.resize.on("resize", function(args) {
			var panel_width = args.width;
			var panel_height = args.height;
	
			if(panel_width != 0) {
            	this.cfg.setProperty("width", panel_width + "px");
			}
			if(panel_height != 0) {
            	this.cfg.setProperty("height", panel_height + "px");
			}
			
			self.resize_all();
		}, this.panel, true);
		
		this.resize.on("endResize", function(args) {
			self.width = $("#" + self.container + "_c").width();
			self.height = $("#" + self.container + "_c").height();
		
			self.resize_all();
			self.refresh();
			
			$(document).trigger(self.filename + "_resized");
		}, this.panel, true);
		
		
		
		
		//////////////////////////////////////////////////////////////////////////////////////////
		// window events
		//////////////////////////////////////////////////////////////////////////////////////////
		
		//window body click event assign
		$("#"+container).click(function() {
			self.window_body_click();
			
			return false;
		});
		
		//title bar click event assign
		$("#"+container).find("#"+container+"_h").find(".titlebar").click(function() {
			core.module.layout.workspace.window_manager.hide_all_context_menu();
			return false;
		});
		
		//title bar mousedown event assign
		$("#"+container).find("#"+container+"_h").find(".titlebar").mousedown(function() {
			self.activate();
		});
		
		//title bar mouseup event assign
		$("#"+container).find("#"+container+"_h").find(".titlebar").mouseup(function() {
			self.left = $("#" + self.container + "_c").offset().left;
			self.top = $("#" + self.container + "_c").offset().top;
		});
		
		//title bar dbl click event assign
		$("#"+container).find("#"+container+"_h").find(".titlebar").dblclick(function() {
			core.module.layout.workspace.window_manager.maximize_all();
			
			return false;
		});
		
		//minimize button click event assign
		$("#"+container).find(".minimize").click(function() {
			self.minimize();
			
			return false;
		});

		//maxmize button click event assign
		$("#"+container).find(".maximize").click(function() {
			core.module.layout.workspace.window_manager.maximize_all();
			
			return false;
		});
				
		//close button click event assign
		$("#"+container).find(".close").click(function() {
			self.close();
			
			return false;
		});
		
		this.plug();
		
		core.dialog.project_property.refresh_toolbox();
		
		$(core).bind("on_project_open", function () {
			self.set_title();
		});
		
		setTimeout(function(){
			self.init_context_event();
		}, 500)
	},
	
	connect: function(tab) {
		this.tab = tab;
	},
	
	window_body_click: function() {
		this.activate();
	},
	
	titlebar_click: function() {
		this.activate();
	},
	
	set_modified: function() {
	 	var titlebar = $("#" + this.container).find(".titlebar").find("div:first").html();
	  	titlebar = titlebar.replace(" *", "");
		$("#" + this.container).find(".titlebar").find("div:first").html(titlebar + " *");
		
		this.is_saved = false;
	},
	
	set_saved: function() {
		var titlebar = $("#" + this.container).find(".titlebar").find("div:first").html();
	  	$("#" + this.container).find(".titlebar").find("div:first").html(titlebar.replace(" *", ""));
	  	
	  	this.is_saved = true;
	},
	
	maximize: function () {
		if (this.left == 0 || this.left == null) {
			this.left = $("#" + this.container + "_c").offset().left;
		}
		if (this.top == 0 || this.top == null) {
			this.top = $("#" + this.container + "_c").offset().top;
		}
		if (this.width == 0 || this.width == null) {
			this.width = $("#" + this.container + "_c").width();
		}
		if (this.height == 0 || this.height == null) {
			this.height = $("#" + this.container + "_c").height();
		}
		
		$("#" + this.container + "_c").offset({left:$("#" + this.workspace_container).offset().left - 1, top:$("#" + this.workspace_container).offset().top});
		$("#" + this.container + "_c").width($("#" + this.workspace_container).width());
		$("#" + this.container + "_c").height($("#" + this.workspace_container).height());
		
		$("#" + this.container).width($("#" + this.workspace_container).width());
		$("#" + this.container).height($("#" + this.workspace_container).height());
		
		$("#" + this.container).find(".ft").addClass("maximized_ft");
		
        this.panel.cfg.setProperty("width", $("#" + this.workspace_container).width() + "px");
        this.panel.cfg.setProperty("height", $("#" + this.workspace_container).height()+ "px");
		
		this.status = "maximized";

		$(".tab_max_buttons").show();
		
		this.resize.lock();
		this.resize_all();
		this.refresh();
	},
	
	unmaximize: function () {
		$("#" + this.container + "_c").offset({left:this.left, top:this.top});
		$("#" + this.container + "_c").width(this.width);
		$("#" + this.container + "_c").height(this.height);
		
		$("#" + this.container).width(this.width);
		$("#" + this.container).height(this.height);
		
		$("#" + this.container).find(".ft").removeClass("maximized_ft");
		
		this.panel.cfg.setProperty("width", this.width + "px");
        this.panel.cfg.setProperty("height", this.height - 3 + "px");
		
		this.status = null;
		
		$(".tab_max_buttons").hide();
		
		this.resize.unlock();
		this.resize_all();
		this.refresh();
			
		this.left = 0;
		this.top = 0;
		this.width = 0;
		this.height = 0;
	},	

	minimize: function () {
		var self = this;
		
		if(this.status != "minimized") {			
			$("#" + self.container + "_c").hide("fast");
			
			this.status = "minimized";	
		}
		else {
			$("#" + self.container + "_c").show("slow");
			
			this.status = null;
		}
		
		this.resize_all();
		this.refresh();		
		this.activate();				
	},
	
	close: function() {
		var self = this;
		
		var window_manager = core.module.layout.workspace.window_manager;
		
		// clear highlight
		if(this.type == 'Terminal'){
			var project = this.project;
			for(var i=0; i<window_manager.window.length; i++){
				var target_window = window_manager.window[i];
				if(target_window.project == project && target_window.editor ) target_window.editor.clear_highlight();
			}
		}
		
		if(this.is_saved) {
			
			$(document).trigger(this.filename + "_closed");		
		
			this.alive = false;
			//delete core.module.layout.workspace.window_manager.window_list.windows[this.filepath+this.filename];

			this.filename = null;
			this.filetype = null;
	
			$("#" + this.container).parent().remove();
			
			this.context_menu.remove();
	
			if(this.tab) {
				this.tab.window = null;
				this.tab.close();
			}
			
/*
			if (this.type == "Editor") {
				if(core.flag.collaboration_on)
				this.editor.collaboration.set_edit_off();
			}
			else if (this.type == "Designer") {
				if(core.flag.collaboration_draw_on)
				this.designer.designer.canvas.set_collaboration_off();
			}
*/
			
		
//			for (var i = core.module.layout.workspace.window_manager.index-1; i > -1; i--) {
//				var cnt = 0;
//				if(core.module.layout.workspace.window_manager.window[i].alive) {
//					cnt++;
//					core.module.layout.workspace.window_manager.active_window = i;
//					core.module.layout.workspace.window_manager.window[i].activate();
//					break;
//				}
//				if(cnt == 0) {
//					core.module.layout.workspace.window_manager.active_window = -1;
//					$(".tab_max_buttons").hide();
//				}
//			}
			
			window_manager.window.remove(this.index, this.index);
			window_manager.index--;
			window_manager.active_filename = "";
			
			$("#history_container").empty();
			$("#history .history_header").unbind('click');
			$("#history").empty();
			
			var new_window = window_manager.window.length-1;
			if (new_window != -1) {
				window_manager.window[new_window].activate();
			}
			else {
				$(".tab_max_buttons").hide();
			}
			window_manager.active_window = new_window;
			core.module.layout.history.filename = "";
			
			delete this;
		}
		else {
			confirmation_save.init({
				// title: core.module.localization.msg["confirmation_save"].value,
				message: "\""+this.filename+"\" "+core.module.localization.msg["confirmation_save_message"],
				yes_text: core.module.localization.msg["confirmation_yes"],
				cancel_text: core.module.localization.msg["confirmation_cancel"],
				no_text: core.module.localization.msg["confirmation_no"],

				title: "Close...", 
				// message: "<span localization_key='confirmation_save_message'> has been modified. Save changes?</span>",
				// yes_text: "<span localization_key='yes'>Yes</span>",
				// cancel_text: "<span localization_key='cancel'>Cancel</span>",
				// no_text: "<span localization_key='no'>No</span>",
				yes: function () {
					self.editor.save("close");
				}, cancel: function () {
				}, no: function () {
					self.is_saved = true;
					self.tab.is_saved = true;
					self.close();
				}
			});
			
			confirmation_save.panel.show();
		}
	},
	
	show: function() {
		this.context_menu.hide();
		$("#" + this.container + "_c").show();
	},
	
	hide: function() {
		this.context_menu.hide();
		$("#" + this.container + "_c").hide();
	},	
	
	activate: function() {
		var self = this;
		if(self.editor && self.editor.filename){
			if(core.module.layout.workspace.window_manager.active_filename
				!=(self.editor.filepath + self.editor.filename)){
				core.module.layout.workspace.window_manager.active_filename = self.editor.filepath + self.editor.filename;
				self.editor.on_activated();
			}
		}
		core.module.layout.workspace.window_manager.active_window = this.index;

		//core.dialog.project_property.refresh_toolbox();
		$("#"+this.workspace_container).find(".activated").each(function(i) {
			$(this).removeClass("activated");
		});
		
		$("#"+this.workspace_container).find(".yui-panel-container").each(function(i) {
			$(this).css("z-index", "2");
		});
		
		$("#" + this.container).find(".hd").addClass("activated");
		$("#" + this.container).parent().css("z-index", "3");
		
		this.tab.activate();
		this.context_menu.hide();
		//core.dialog.project_property.refresh_toolbox();
	},
	
	set_title: function(contents) {
		if (contents == undefined) {
			if (this.project != core.status.current_project_path) {
				this.title = this.filepath + this.filename;
				$("#" + this.container + "_c").find(".window_title").html(this.title);
			}
			else {
				this.title = this.filename;
				$("#" + this.container + "_c").find(".window_title").html(this.title);
			}
		}
	},
	
	set_body: function(contents) {

	},
	
	set_footer: function(contents) {
		if(this.type == "Editor") {
			this.panel.setFooter("<div class='editor_message'>Line: 0 | Col: 0</div>");
		}
		else if(this.type == "Designer") {
			this.panel.setFooter("<div class='designer_message'></div><div class='mouse_position_view'>(0, 0)</div>");
		}
		else if(this.filetype == "url") {
			this.panel.setFooter("<div class='editor_message'>Line: 0 | Col: 0</div>");
		}
	},
		
	on_resize: function () {
					
		//if(this.status != "maximized") {		
			//this.width = this.panel.cfg.get_property("width");
			//this.height = this.panel.cfg.get_property("height");
		//}
		
		/*
		if($("#code_editor_filewindow"+i+"Container").get(0)) {
			code_editor_load_callback("code_editor_filewindow"+i+"Container");
		}
		
		if($("#codeViewer_filewindow"+i+"Container").get(0)) {
			codeViewer_load_callback("codeViewer_filewindow"+i+"Container");
		}
		
		if($("#generatedCode_filewindow"+i+"Container").get(0)) {
			generatedCode_load_callback("generatedCode_filewindow"+i+"Container");
		}
		*/
	},
	
	resize_all: function() {
		var height = $("#"+this.container).find(".bd").height();
		$("#"+this.container).find(".window_container").height(height);
			
		if(this.type == "Editor") {
			//$('#filewindow'+i+'_c').find(".window_container").find(".CodeMirror").height(this.window[i].panel.height - 50);
			//$("#"+this.container).find(".window_container").height($("#"+this.container).height() - 53);
			$("#"+this.container).find(".window_container").find(".CodeMirror").height(height);
			$("#"+this.container).find(".window_container").find(".CodeMirror").find(".CodeMirror-scroll").css("height","100%");//height($("#"+this.container).height()-53);
			$("#"+this.container).find(".window_container").find(".CodeMirror").find(".CodeMirror-scroll").children("div").height("100%");
			$("#"+this.container).find(".window_container").find(".CodeMirror-gutter").height(height);
			
		}
		else if(this.type == "Terminal") {
			$("#"+this.container).find(".window_container").height(height - 10);
			
			this.terminal.resize_all();
		}
		else if(this.type == "Designer") {
			this.designer.resize_all();
		}
		
		// this.context_menu.hide();
	},
	
	refresh : function(){
		this.context_menu.hide();
		if(this.editor) this.editor.line_refresh();
	},
	
	init_context_event : function(){
		var self = this;
		
		$('[id="'+self.context_menu.name+'"]').find(".minimize").click(function(){
			self.minimize();
			self.context_menu.hide()
			
			return false;
		})
		
		$('[id="'+self.context_menu.name+'"]').find(".maximize").click(function(){
			core.module.layout.workspace.window_manager.maximize_all();
			self.context_menu.hide()
			
			return false;
		})

		$('[id="'+self.context_menu.name+'"]').find(".close").click(function(){
			self.close();
			self.context_menu.hide()
			
			return false;
		})
	},
	
	inArray: function(keyword) {
		for (var i = 0; i < core.filetypes.length; i++) {
			if (core.filetypes[i].file_extension == keyword){
				return i;
			}
		}
		
		for (var i = 0; i < core.filetypes.length; i++) {
			if (core.filetypes[i].file_extension == "txt"){
				return i;
			}
		}
		
		return 12;
	},
	
	plug: function() {
		$(core).trigger("window_panel_plug");
	}
};