/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.layout = function () {
	this.layout = null;
	this.inner_layout = null;
	this.left_tabview = null;
	this.inner_right_tabview = null;
	this.inner_bottom_tabview = null;
	this.inner_center_tabview = null;
	this.table_properties = null;
	this.treeview_project = null;
	this.mainmenu = null;
	this.toolbar = null;
	this.workspace = null;
	this.startpage = null;
	this.window_manager = null;
	this.communication = null;
	this.console = null;
	this.tab_project = null;
	this.tab_toolbox = null;
};

org.goorm.core.layout.prototype = {

	init: function(container) {
		
		var self = this;
		
		var left_width = 250;
		var right_width = 350;
		var bottom_height = 200;
		
		if (parseInt(localStorage['layout_left_width']) > 0) {
			left_width = parseInt(localStorage['layout_left_width']);
		}
		
		if (parseInt(localStorage['layout_right_width']) > 0) {
			right_width = parseInt(localStorage['layout_right_width']);
		}
		
		if (parseInt(localStorage['layout_bottom_height']) > 0) {
			bottom_height = parseInt(localStorage['layout_bottom_height']);
		}
		
		//Set layout
		this.layout = new YAHOO.widget.Layout({
			units:
			[
				{ position: 'top', height: 62, maxHeight:150, body: container+'_top', scroll: null, zIndex: 2, gutter: '0px 0px 0px 0px' },
				{ position: 'left', width: left_width, body: container+'_left', animate: false, scroll: false, zIndex: 1, resize: true, gutter: '0px 0px 0px 0px', collapse: true, minWidth: 200 },
				{ position: 'center', body: container+'_center_inner_layout', scroll: false },
				{ position: 'bottom', height:30, body: container+'_bottom', scroll: false, gutter: '0px 0px 0px 0px' }
			]
		});

		this.layout.on('render', function() {
			//Set main menu
			self.attach_mainmenu(container + "_mainmenu"); 
			
			self.attach_toolbar(container + "_main_toolbar"); 
			
			//Set nested inner layout
			var el = self.layout.getUnitByPosition('center').get('wrap');
			
			self.inner_layout = new YAHOO.widget.Layout(el, {
				parent: self.layout,
				units:
				[
					{ position: 'right', width: right_width, resize: true, scroll: false, body: container+'_inner_layout_right', animate: false, gutter: '0px 0px 0px 0px', collapse: true },
					{ position: 'bottom', height: bottom_height, body: container+'_inner_layout_bottom', animate: false, scroll: false, resize: true, gutter: '0px 0px 0px 0px', collapse: true },
					{ position: 'center', body: container+'_inner_layout_center', scroll: false }
				]
			});

			self.inner_layout.on('render', function() {
				self.layout.getUnitByPosition("left").on("endResize", function() {
					localStorage['layout_left_width'] = core.module.layout.layout._units.left._configs.width.value;
				});
				
				self.layout.getUnitByPosition("left").on("beforeCollapse", function() {
					localStorage['layout_left_width'] = core.module.layout.layout._units.left._configs.width.value;
				});
				
				self.layout.getUnitByPosition("left").on("collapse", function() {
					localStorage['layout_left_collapse'] = true;
				});
				
				self.layout.getUnitByPosition("left").on("expand", function() {
					localStorage['layout_left_collapse'] = false;
					//core.module.layout.layout._units.left._configs.width.value = localStorage['layout_left_width'];
				});

				self.inner_layout.getUnitByPosition("right").on("endResize", function() {
					localStorage['layout_right_width'] = core.module.layout.inner_layout._units.right._configs.width.value;
				});
				
				self.inner_layout.getUnitByPosition("right").on("beforeCollapse", function() {
					localStorage['layout_right_width'] = core.module.layout.inner_layout._units.right._configs.width.value;
				});
				
				self.inner_layout.getUnitByPosition("right").on("collapse", function() {
					localStorage['layout_right_collapse'] = true;
				});
				
				self.inner_layout.getUnitByPosition("right").on("expand", function() {
					localStorage['layout_right_collapse'] = false;
				});
				
				self.inner_layout.getUnitByPosition("bottom").on("endResize", function() {
					localStorage['layout_bottom_height'] = core.module.layout.inner_layout._units.bottom._configs.height.value;
				});
				
				self.inner_layout.getUnitByPosition("bottom").on("beforeCollapse", function() {
					localStorage['layout_bottom_height'] = core.module.layout.inner_layout._units.bottom._configs.height.value;
				});
				
				self.inner_layout.getUnitByPosition("bottom").on("collapse", function() {
					localStorage['layout_bottom_collapse'] = true;
				});
				
				self.inner_layout.getUnitByPosition("bottom").on("expand", function() {
					localStorage['layout_bottom_collapse'] = false;
					//core.module.layout.inner_layout._units.bottom._configs.height.value = localStorage['layout_bottom_height'];
				});
				
				self.inner_layout.getUnitByPosition('center').on("resize", self.resize_all);
				
				$(core).trigger("layout_loaded");
			});

			self.inner_layout.on("start_resize", function() {
				$(".dummyspace").css("z-index", 999);
			});
			
			self.inner_layout.render();
			
			if (localStorage['layout_left_collapse'] == "true") {
				self.layout.getUnitByPosition("left").collapse();
			}
			
			if (localStorage['layout_right_collapse'] == "true") {
				self.inner_layout.getUnitByPosition("right").collapse();
			}
			
			if (localStorage['layout_bottom_collapse'] == "true") {
				self.inner_layout.getUnitByPosition("bottom").collapse();
			}
		});

		
		//////////////////////////////////////////////////////////////////////////////////////////
		// Left
		//////////////////////////////////////////////////////////////////////////////////////////
		
		//Left TabView
		this.left_tabview = new YAHOO.widget.TabView(container+'_left');
		
		//Project Explorer Tab
		this.attach_project_explorer(this.left_tabview);
		
		//Tool Box
		this.attach_toolbox(this.left_tabview);
		
		//////////////////////////////////////////////////////////////////////////////////////////
		// Right
		//////////////////////////////////////////////////////////////////////////////////////////
				
		//Right TabView
		this.inner_right_tabview = new YAHOO.widget.TabView(container+'_inner_layout_right');
		
		//Properties Tab
		this.attach_properties(this.inner_right_tabview);
		
		//Object Explorer Tab
		this.attach_object_explorer(this.inner_right_tabview);
		
		//Communication Tab
		this.attach_communication(this.inner_right_tabview);
		
		//Slide Show Tab
		this.attach_slide(this.inner_right_tabview);
		
		//////////////////////////////////////////////////////////////////////////////////////////
		// Bottom
		//////////////////////////////////////////////////////////////////////////////////////////
				
		//Bottom TabView
		this.inner_bottom_tabview = new YAHOO.widget.TabView(container+'_inner_layout_bottom');
		
		//Message Tab
		this.attach_message(this.inner_bottom_tabview);
		
		//Debug Tab
		this.attach_debug(this.inner_bottom_tabview);
		
		//Terminal Tab
		this.attach_terminal(this.inner_bottom_tabview);
		
		//Search Tab
		this.attach_search(this.inner_bottom_tabview);
		
		//////////////////////////////////////////////////////////////////////////////////////////
		// Center
		//////////////////////////////////////////////////////////////////////////////////////////
		
		this.workspace = new org.goorm.core.layout.workspace();
		this.workspace.init(container+'_inner_layout_center');
		
		//this.startpage = new org.goorm.core.layout.startpage();
		//this.startpage.init(container+'inner_layoutCenter');
		
		//////////////////////////////////////////////////////////////////////////////////////////
		// Final
		//////////////////////////////////////////////////////////////////////////////////////////

		this.layout.render();
		
		
		$(window).resize(function(){
			self.resize_all();
			self.layout.getUnitByPosition("top").set("height", $("#goorm_mainmenu").height() + $("#goorm_main_toolbar").height() + 7);
			
			$(core).trigger("layout_resized");
		});
	},

	attach_mainmenu: function(container) {
		this.mainmenu = new YAHOO.widget.MenuBar(container, { 
			autosubmenudisplay: false, 
			hidedelay: 750, 
			lazyload: true ,
			effect: {  
				effect: YAHOO.widget.ContainerEffect.FADE, 
				duration: 0.15 
			}
		});

		this.mainmenu.render();
	
	},
	
	attach_project_explorer: function(target) {
		var self = this;
		
		//this.tab_project = new YAHOO.widget.Tab({ label: "Project" +"&nbsp;"+ " <img src='images/icons/context/closebutton.png' class='close button' />", content: "<div id='project_explorer' class='directory_treeview'></div>" });
		this.tab_project = new YAHOO.widget.Tab({ label: "Project", content: "<div id='project_explorer' class='directory_treeview'></div>" });

		//attaching tab element
		target.addTab(this.tab_project);
		
		//close button click event assign
		/*
		$(this.tab_project.get("labelEl")).find(".close").click(function() {
			self.detach_project_explorer();
			
			return false;
		});
		*/
		
		this.project_explorer = new org.goorm.core.project.explorer();
		this.project_explorer.init();
	},
	
	detach_project_explorer: function() {
		 this.left_tabview.removeTab(this.tab_project);

		 delete this;
	},
	
	attach_toolbox: function(target) {
		var self = this;
		
		//this.tab_toolbox = new YAHOO.widget.Tab({ label: "Tool Box" +"&nbsp;"+ " <img src='images/icons/context/closebutton.png' class='close button' />", content: "<div id='toolbox'></div>" });
		this.tab_toolbox = new YAHOO.widget.Tab({ label: "Tool Box", content: "<div id='toolbox'></div>" });

		//attaching tab element
		target.addTab(this.tab_toolbox);

/*
		//For Test Codes
		$("#toolbox").append("<div id='toolLine' style='cursor:pointer; width:100%; height:20px; border-bottom:1px solid #ccc;'>Line Tool</div>");
		$("#toolbox").append("<div id='toolSquare' style='cursor:pointer; width:100%; height:20px; border-bottom:1px solid #ccc;'>Square Tool</div>");
		
		$("#toolLine").click(function () {
			self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line");
			self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
		});
		$("#toolSquare").click(function () {
			self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square");	
			self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");		
		});	
*/
	},
	
	detach_toolbox: function() {
		this.left_tabview.removeTab(this.tab_toolbox);
		
		delete this;
	},
	
	attach_object_explorer: function(target) {
		//attaching tab element
		target.addTab(new YAHOO.widget.Tab({ label: "Object", content: "<div id='object_explorer'><div id='object_tree'></div></div>" }));
	},
	
	attach_properties: function(target) {
		//attaching tab element
		target.addTab(new YAHOO.widget.Tab({ label: "Properties", content: "<div id='properties'></div>" }));
		
		var properties = new org.goorm.core.object.properties();
		
		this.table_properties = properties.init("properties");
	},
	
	attach_message: function(target) {
		//attaching tab element
		target.addTab(new YAHOO.widget.Tab({ label: "Message", content: "<div id='message'></div>" }));
	},
	
	attach_toolbar: function(target) {
		/*
		this.toolbar = new org.goorm.core.toolbar();
		this.toolbar.add("../../configs/toolbars/org.goorm.core.file/file.toolbar.html", "file.toolbar", target);
		this.toolbar.add("../../configs/toolbars/org.goorm.core.edit/edit.toolbar.html", "edit.toolbar", target);
		this.toolbar.add("../../configs/toolbars/org.goorm.core.window/window.toolbar.html", "window.toolbar", target);
		this.toolbar.add("../../configs/toolbars/org.goorm.core.design/design.toolbar.html", "design.toolbar", target);
		*/
		
		var context_menu = new org.goorm.core.menu.context();
		context_menu.init("configs/menu/org.goorm.core.toolbar/toolbar.html", "menu.context.toolbar", target);
		
		$(core).trigger("context_menu_complete");
	},
	
	attach_debug: function(target) {
		//attaching tab element
		target.addTab(new YAHOO.widget.Tab({ label: "Debug", content: "<div id='debug'></div>" }));
		
		this.debug = new org.goorm.core.debug();
		this.debug.init();
		core.module.debug = this.debug;
	},
	
	attach_communication: function(target) {
		//attaching tab element
		target.addTab(new YAHOO.widget.Tab({ label: "Communication", content: "<div id='communication' class='layout_right_communication_tab'></div>" }));

/*
		$("#communication").append("<div class='communication_user_container' style='height:100px; border-bottom:1px #CCC solid; padding:5px;'></div>");		
		$("#communication").append("<div class='communication_message_container' style='height:200px; border-bottom:1px #CCC solid; padding:5px;'></div>");
		$("#communication").append("<div class='communication_message_input_container' style='height:50px; border-bottom:1px #CCC solid; padding:5px; background-color:#EFEFEF; text-align:center;'><input value='Chatting Message' style='width:90%;' /></div>");
*/
		//$("#communication").append("<iframe src='http://localhost:8001/?room=11' width=99% height=300>");
		this.communication = new org.goorm.core.collaboration.communication();
		this.communication.init("communication");
	},
	
	show_communication: function(project_id) {
		$(".layout_right_communication_tab").parent("div").attr("id",project_id);
		this.communication.init(project_id);
	},
	
	attach_slide: function(target) {
		//attaching tab element
		target.addTab(new YAHOO.widget.Tab({ label: "Slide", content: "<div id='slide' class='layout_right_slide_tab'></div>" }));

		
	},
	
	attach_terminal: function(target) {
		//attaching tab element
		//$(core).bind("preference_loading_complete", function () {
			
			target.addTab(new YAHOO.widget.Tab({ label: "Terminal", content: "<div id='terminal' width='100%'></div>" }));
		//});
		
		this.terminal = new org.goorm.core.terminal();
		this.terminal.init($("#terminal"), "default_terminal", false);
	},
	
	attach_search: function(target) {
		//attaching tab element
		target.addTab(new YAHOO.widget.Tab({ label: "Search", content: "<div id='search' width='100%'></div>" }));
	},
	
	refresh_terminal: function() {
/*
		this.inner_bottom_tabview.removeTab(this.inner_bottom_tabview.getTab(2));
		//attaching tab element
*/
	},
	
	resize_all: function() {
		var layout_left_height = $(".yui-layout-unit-left").find(".yui-layout-wrap").height() - 22;		
		$("#goorm_left").find(".yui-content").height(layout_left_height);
		$("#goorm_left").find("#project_explorer").height(layout_left_height-6);
		$("#goorm_left").find("#project_treeview").height(layout_left_height-35);
		
		var project_selector_width = $(".yui-layout-unit-left").find(".yui-layout-wrap").find("#project_selector").width();
		$("#goorm_left").find("#project_selectbox").width(project_selector_width-19);
		$("#goorm_left").find("#project_selectbox").next().width(project_selector_width-10);
		//$("#goorm_left").find("#project_selectbox").find("button").width(project_selector_width-18);
		
		$("#goorm_left").find("#toolbox_selectbox").width(project_selector_width-19);
		$("#goorm_left").find("#toolbox_selectbox").next().width(project_selector_width-10);
		
		
		var layout_right_height = $(".yui-layout-unit-right").find(".yui-layout-wrap").height() - 25;
		$("#goorm_inner_layout_right").find(".yui-content").height(layout_right_height);
		
		var layout_bottom_height = $(".yui-layout-unit-bottom").find(".yui-layout-wrap").height() - 26;
		$("#goorm_inner_layout_bottom").find(".yui-content").height(layout_bottom_height);
		
		var layout_center_height = $("#workspace").parent().parent().height();
		$("#goorm_inner_layout_center").find("#workspace").height(layout_center_height);

		$(".dummyspace").css("z-index", 0);

		
		$(core).trigger("layout_resized");

		/*
		var divChatContentsHeight = $(".yui-layout-unit-bottom").find(".yui-layout-wrap").height() - 90;
		$("#goorm_inner_layout_bottom").find("#divChatContents").height(divChatContentsHeight);
		
			
		var divPropertiesValueColumnWidth = $("#divProperties").width() - 113;
		
		$("#divProperties").find("table").find("div").each(function(i) {
			if(i == 1) {
				if($(this).hasClass("yui-dt-liner")) {
					$(this).width(divPropertiesValueColumnWidth);
				}
			}
		});
		*/
			
		//$("#properties").find("table").width($("#properties").width());
		/*
		$("#properties").find("table").find("th").each(function(i) {
			if($(this).parent().hasClass("yui-dt-first")) {
				$(this).width("20%");
			}
			else {
				$(this).width("80%");
			}
		});
		*/
	}
};
