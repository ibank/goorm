/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.plugin.uml = function () {
	this.name = "uml";
	this.filetypes = "uml|ui";
	this.toolbox_name = "UML 2.0";
	this.stencil_css = "org.goorm.stencil.uml/stencil.uml.css";
	this.window_manager = null;
	this.mainmenu = null;
};

org.goorm.plugin.uml.prototype = {
	init: function () {
	
		
		var self = this;
	
		this.window_manager = core.module.layout.workspace.window_manager;
		
		this.mainmenu = core.module.layout.mainmenu;
		
		
		this.add_toolbox();
		
		//Loading CSS
		this.load_css();
		
		//Add Project Item
		this.add_project_item();
		
		//Add Toolbar
		this.add_toolbar();
		
		//Add Main Menu
		this.add_mainmenu();
		
		//Add Menu Action
		this.add_menu_action();
		
		//Add Context Menu
		this.add_context_menu();
	},
	
	new_project : function(project_name, project_author, project_type, project_detailed_type, project_path) {

		var postdata = {
	    		"project_name" : project_name,
	    		"project_author" : project_author,
	    		"project_type" : project_type,
	    		"project_detailed_type" : project_detailed_type,
	    		"project_path" : project_path
	    };
	    
		$.post("org.goorm.plugin.uml/new_project.php", postdata, function (data) {
			var receivedData = eval("("+data+")");
			
			if(receivedData.errCode==0) {
				core.mainLayout.projectExplorer.refresh();
			}
			else {
				alert.show(receivedData.errCode + " : " + receivedData.message);
			}
		});

	},

	load_css: function () {
		$("head").append("<link>");
	    var css = $("head").children(":last");
	    css.attr({
	    	rel:  "stylesheet",
	    	type: "text/css",
	    	href: this.stencil_css
	    });
	},

	add_project_item: function () {

		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project_type='uml'><div class='project_type_icon'><img src='org.goorm.plugin.uml/images/uml.png' class='project_icon' /></div><div class='project_type_title'>UML Project</div><div class='project_type_description'>Unified Modeling Language Project</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all uml' description='  Create New UML Project for Class Diagram' project_type='uml'><img src='org.goorm.plugin.uml/images/class_diagram.png' class='project_item_icon' /><br /><a>Class Diagram</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all uml' description='  Create New UML Project for State Diagram' project_type='uml'><img src='org.goorm.plugin.uml/images/sequence_diagram.png' class='project_item_icon' /><br /><a>State Diagram</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all uml' description='  Create New UML Project for Sequence Diagram' project_type='uml'><img src='org.goorm.plugin.uml/images/state_diagram.png' class='project_item_icon' /><br /><a>Sequence Diagram</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all uml' description='  Create New UML Project for Component Diagram' project_type='uml'><img src='org.goorm.plugin.uml/images/state_diagram.png' class='project_item_icon' /><br /><a>Component Diagram</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all uml' description='  Create New UML Project for Activity Diagram' project_type='uml'><img src='org.goorm.plugin.uml/images/state_diagram.png' class='project_item_icon' /><br /><a>Activity Diagram</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all uml' description='  Create New UML Project for UseCase Diagram' project_type='uml'><img src='org.goorm.plugin.uml/images/state_diagram.png' class='project_item_icon' /><br /><a>UseCase Diagram</a></div>");	
	
		$(".project_dialog_type").append("<option value='uml'>UML Project</option>").attr("selected", "");
	},
	
	add_toolbar: function () {
		
	},
	
	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_uml\" localizationKey='file_new_uml_project'>UML Project</a></li>");
		//this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_uml]").unbind("click");
		$("a[action=new_file_uml]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project_type=uml]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project_type=uml]").position().top - 100);
		});	
	},
	
	add_context_menu: function () {
		
	},
	
	add_toolbox: function () {
		var self = this;

		$("#toolbox_selectbox").append("<option value='"+self.name+"'>" + self.toolbox_name + "</option>");
		console.log(self.toolbox_name);
		
		$("#toolbox").append("<div id='uml_toolset' class='toolsets'><div id='tool_uml_title' class='tool_title'>UML Tool</div></div>");
		
		
		//Title : General		
		$("#uml_toolset").append("<div id='too_uml_general' class='tool_category category_icon'>General</div>");
		
		//General Tool : Label
		$("#uml_toolset").append("<a href='#' action='add_uml_general_label'><div id='too_uml_general_Label' class='tool_item item_icon_square'>Label</div></a>");
		
		//General Tool : Note
		$("#uml_toolset").append("<a href='#' action='add_uml_general_node'><div id='too_uml_general_Note' class='tool_item item_icon_square'>Note</div></a>");
		
		//General Tool : Package
		$("#uml_toolset").append("<a href='#' action='add_uml_general_package'><div id='too_uml_general_Package' class='tool_item item_icon_square'>Package</div></a>");
		
		
		
		//Title : Class Diagram		
		$("#uml_toolset").append("<div id='tool_uml_class_diagram' class='tool_category category_icon'>Class Diagram</div>");
		
		//Class Diagram Tool : Class
		$("#uml_toolset").append("<a href='#' action='add_uml_class_diagram_class'><div id='tool_uml_class_diagram_Class' class='tool_item item_icon_square'>Class</div></a>");
		
		//Class Diagram Tool : Package
		$("#uml_toolset").append("<a href='#' action='add_uml_class_diagram_package'><div id='tool_uml_class_diagram_Package' class='tool_item item_icon_square'>Package</div></a>");
		
		//Class Diagram Tool : Association
		$("#uml_toolset").append("<a href='#' action='add_uml_class_diagram_association'><div id='tool_uml_class_diagram_Association' class='tool_item item_icon_line'>Association</div></a>");
		
		//Class Diagram Tool : Inheritance
		$("#uml_toolset").append("<a href='#' action='add_uml_class_diagram_inheritance'><div id='tool_uml_class_diagram_Inheritance' class='tool_item item_icon_line'>Inheritance</div></a>");
		
		//Class Diagram Tool : Aggregation
		$("#uml_toolset").append("<a href='#' action='add_uml_class_diagram_aggregation'><div id='tool_uml_class_diagram_Aggregation' class='tool_item item_icon_line'>Aggregation</div></a>");
		
		//Class Diagram Tool : Composition
		$("#uml_toolset").append("<a href='#' action='add_uml_class_diagram_composition'><div id='tool_uml_class_diagram_Composition' class='tool_item item_icon_line'>Composition</div></a>");
		
		//Class Diagram Tool : Interface
		$("#uml_toolset").append("<a href='#' action='add_uml_class_diagram_interface'><div id='tool_uml_class_diagram_interface' class='tool_item item_icon_line'>Interface</div></a>");
		
		
		
		//Title : Component Diagram
		$("#uml_toolset").append("<div id='tool_uml_component_diagram' class='tool_category category_icon'>Component Diagram</div>");
		
		//Component Diagram Tool : Component
		$("#uml_toolset").append("<a href='#' action='add_uml_component_diagram_component'><div id='tool_uml_ComponentDiagram_Component' class='tool_item item_icon_square'>Component</div></a>");
		
		//Component Diagram Tool : Node
		$("#uml_toolset").append("<a href='#' action='add_uml_component_diagram_node'><div id='tool_uml_ComponentDiagram_Node' class='tool_item item_icon_square'>Node</div></a>");
		
		//Component Diagram Tool : Artifact
		$("#uml_toolset").append("<a href='#' action='add_uml_component_diagram_artifact'><div id='tool_uml_ComponentDiagram_Artifact' class='tool_item item_icon_square'>Artifact</div></a>");
				
		
		
		//Title : State Diagram		
		$("#uml_toolset").append("<div id='tool_uml_state_diagram' class='tool_category category_icon'>State Diagram</div>");
		
		//State Diagram Tool : State
		$("#uml_toolset").append("<a href='#' action='add_uml_state_diagram_state'><div id='tool_uml_state_diagram_state' class='tool_item item_icon_square'>State</div></a>");
		
		//State Diagram Tool : Start
		$("#uml_toolset").append("<a href='#' action='add_uml_state_diagram_start'><div id='tool_uml_state_diagram_start' class='tool_item item_icon_square'>Start</div></a>");
		
		//State Diagram Tool : End
		$("#uml_toolset").append("<a href='#' action='add_uml_state_diagram_end'><div id='tool_uml_state_diagram_end' class='tool_item item_icon_square'>End</div></a>");
		
		//State Diagram Tool : Transition
		$("#uml_toolset").append("<a href='#' action='add_uml_state_diagram_transition'><div id='tool_uml_class_diagram_interface' class='tool_item item_icon_line'>Transition</div></a>");
		
		
		
		//Title : Sequence Diagram		
		$("#uml_toolset").append("<div id='tool_uml_sequence_diagram' class='tool_category category_icon'>Sequence Diagram</div>");
		
		//Sequence Diagram Tool : Timeline
		$("#uml_toolset").append("<a href='#' action='add_uml_sequence_diagram_timeline'><div id='tool_uml_sequence_diagram_timeline' class='tool_item item_icon_square'>Timeline</div></a>");
		
		//Sequence Diagram Tool : Actor
		$("#uml_toolset").append("<a href='#' action='add_uml_sequence_diagram_Actor'><div id='tool_uml_sequence_diagram_actor' class='tool_item item_icon_square'>Actor</div></a>");
		
		//Sequence Diagram Tool : Sequence
		$("#uml_toolset").append("<a href='#' action='add_uml_sequence_diagram_sequence'><div id='tool_uml_sequence_diagram_sequence' class='tool_item item_icon_square'>Sequence</div></a>");
		
		//Sequence Diagram Tool : Initialize
		$("#uml_toolset").append("<a href='#' action='add_uml_sequence_diagram_initialize'><div id='tool_uml_sequence_diagram_initialize' class='tool_item item_icon_line'>Initialize</div></a>");
		
		//Sequence Diagram Tool : Return
		$("#uml_toolset").append("<a href='#' action='add_uml_sequence_diagram_return'><div id='tool_uml_sequence_diagram_return' class='tool_item item_icon_line'>Return</div></a>");
		
		//Sequence Diagram Tool : Asynchronous
		$("#uml_toolset").append("<a href='#' action='add_uml_sequence_diagram_asynchronous'><div id='tool_uml_sequence_diagram_asynchronous' class='tool_item item_icon_line'>Asynchronous</div></a>");
		
		//Sequence Diagram Tool : Synchronous
		$("#uml_toolset").append("<a href='#' action='add_uml_sequence_diagram_synchronous'><div id='tool_uml_sequence_diagram_synchronous' class='tool_item item_icon_line'>Synchronous</div></a>");
		
		
		
		//Title : Activity Diagram		
		$("#uml_toolset").append("<div id='tool_uml_activity_diagram' class='tool_category category_icon'>Activity Diagram</div>");
		
		//Activity Diagram Tool : Start
		$("#uml_toolset").append("<a href='#' action='add_uml_activity_diagram_start'><div id='tool_uml_activity_diagram_start' class='tool_item item_icon_square'>Start</div></a>");
		
		//Activity Diagram Tool : End
		$("#uml_toolset").append("<a href='#' action='add_uml_activity_diagram_end'><div id='tool_uml_activity_diagram_end' class='tool_item item_icon_square'>End</div></a>");

		//Activity Diagram Tool : Activity
		$("#uml_toolset").append("<a href='#' action='add_uml_activity_diagram_activity'><div id='tool_uml_activity_diagram_end' class='tool_item item_icon_square'>Activity</div></a>");
		
		//Activity Diagram Tool : Parallel_Vertical
		$("#uml_toolset").append("<a href='#' action='add_uml_activity_diagram_parallel_vertical'><div id='tool_uml_activity_diagram_ParallelVertical' class='tool_item item_icon_square'>Parallel(Vertical)</div></a>");
		
		//Activity Diagram Tool : Parallel_Horizontal
		$("#uml_toolset").append("<a href='#' action='add_uml_activity_diagram_parallel_horizontal'><div id='tool_uml_activity_diagram_parallel_horizontal' class='tool_item item_icon_square'>Parallel(Horizontal)</div></a>");
		
		//Activity Diagram Tool : ControlFlow
		$("#uml_toolset").append("<a href='#' action='add_uml_activity_diagram_control_flow'><div id='tool_uml_activity_diagram_control_flow' class='tool_item item_icon_line'>ControlFlow</div></a>");
		
		
		
		//Title : Usecase Diagram		
		$("#uml_toolset").append("<div id='tool_uml_usecase_diagram' class='tool_category category_icon'>Use Case Diagram</div>");
		
		//Usecsae Diagram Tool : Usecase
		$("#uml_toolset").append("<a href='#' action='add_uml_usecase_diagram_usecase'><div id='tool_uml_usecase_diagram_usecase' class='tool_item item_icon_square'>Use case</div></a>");
		
		//Usecsae Diagram Tool : Usecase_round
		$("#uml_toolset").append("<a href='#' action='add_uml_usecase_diagram_usecase_round'><div id='tool_uml_usecase_diagram_usecase_round' class='tool_item item_icon_square'>Use case(round)</div></a>");
		
		//Usecsae Diagram Tool : Extends
		$("#uml_toolset").append("<a href='#' action='add_uml_usecase_diagram_extends'><div id='tool_uml_usecase_diagram_extends' class='tool_item item_icon_line'>Extends</div></a>");
		
		//Usecsae Diagram Tool : Includes
		$("#uml_toolset").append("<a href='#' action='add_uml_usecase_diagram_includes'><div id='tool_uml_usecase_diagram_includes' class='tool_item item_icon_line'>Includes</div></a>");
		
		
		
		//Add Fuctions
		//Genral : Label
		$("a[action=add_uml_general_label]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/general.label";
			console.log(self.window_manager.window[self.window_manager.active_window]);
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Genral : Note
		$("a[action=add_uml_general_node]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/general.note";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Genral : Package
		$("a[action=add_uml_general_package]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/general.package";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		
		
		//Class Diagram : Class
		$("a[action=add_uml_class_diagram_class]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/classdiagram.class";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Class Diagram : Packabe
		$("a[action=add_uml_class_diagram_package]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/classdiagram.package";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Class Diagram : Association
		$("a[action=add_uml_class_diagram_association]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/classdiagram.association";
			//classdiagram.association
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Class Diagram : Inheritance
		$("a[action=add_uml_class_diagram_inheritance]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/classdiagram.inheritance";
			//classdiagram.inheritance
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Class Diagram : Aggregation
		$("a[action=add_uml_class_diagram_aggregation]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/classdiagram.aggregation";
			//classdiagram.aggregation
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Class Diagram : Composition
		$("a[action=add_uml_class_diagram_composition]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/classdiagram.composition";
			//classdiagram.composition
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Class Diagram : Interface
		$("a[action=add_uml_class_diagram_interface]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/classdiagram.interface";
			//classdiagram.interface
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter, {dashed:true});	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		
		
		//Component Diagram : Component
		$("a[action=add_uml_component_diagram_component]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/componentdiagram.component";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Component Diagram : Node
		$("a[action=add_uml_component_diagram_node]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/componentdiagram.node";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Component Diagram : Artifact
		$("a[action=add_uml_component_diagram_artifact]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/componentdiagram.artifact";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});		
			


		//State Diagram : State
		$("a[action=add_uml_state_diagram_state]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/statediagram.state";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//State Diagram : Start		
		$("a[action=add_uml_state_diagram_start]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/statediagram.start";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});
		
		//State Diagram : End
		$("a[action=add_uml_state_diagram_end]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/statediagram.end";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});
		
		//State Diagram : Transition
		$("a[action=add_uml_state_diagram_transition]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/statediagram.transition";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
	
		
		//Sequence Diagram : Timeline
		$("a[action=add_uml_sequence_diagram_timeline]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/sequencediagram.timeline";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Sequence Diagram : Actor
		$("a[action=add_uml_sequence_diagram_Actor]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/sequencediagram.actor";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter, {proportion:[2,3]});	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Sequence Diagram : Actor
		$("a[action=add_uml_sequence_diagram_sequence]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/sequencediagram.sequence";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Sequence Diagram : Initialize
		$("a[action=add_uml_sequence_diagram_initialize]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/sequencediagram.initialize";
			//sequencediagram.initialize
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter, {dashed:true});	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Sequence Diagram : Return
		$("a[action=add_uml_sequence_diagram_return]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/sequencediagram.return";
			//sequencediagram.return
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter, {dashed:true});	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Sequence Diagram : Asynchronous
		$("a[action=add_uml_sequence_diagram_asynchronous]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/sequencediagram.asynchronous";
			//sequencediagram.asynchronous
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Sequence Diagram : Synchronous
		$("a[action=add_uml_sequence_diagram_synchronous]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/sequencediagram.synchronous";
			//sequencediagram.synchronous
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		
		
		//Activity diagram : Start
		$("a[action=add_uml_activity_diagram_start]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/activitydiagram.start";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});
		
		//Activity diagram : End
		$("a[action=add_uml_activity_diagram_end]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/activitydiagram.end";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});
		
		//Activity diagram : Activity
		$("a[action=add_uml_activity_diagram_activity]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/activitydiagram.activity";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});
		
		//Activity diagram : Parallel_Vertical
		$("a[action=add_uml_activity_diagram_parallel_vertical]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/activitydiagram.parallel_vertical";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});
		
		//Activity diagram : Parallel_Horizontal
		$("a[action=add_uml_activity_diagram_parallel_horizontal]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/activitydiagram.parallel_horizontal";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});
		
		//Activity Diagram : ControlFlow
		$("a[action=add_uml_activity_diagram_control_flow]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/activitydiagram.controlflow";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Usecase Diagram : Usecase(box)
		$("a[action=add_uml_usecase_diagram_usecase]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/usecasediagram.usecase";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Usecase Diagram : Usecase(round)
		$("a[action=add_uml_usecase_diagram_usecase_round]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/usecasediagram.usecase_round";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("square", shape_adapter);	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("square");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});
		
		//Usecase Diagram : Extends
		$("a[action=add_uml_usecase_diagram_extends]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/usecasediagram.extends";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter, {dashed:true});	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
		//Usecase Diagram : Includes
		$("a[action=add_uml_usecase_diagram_includes]").click(function () {
			var shape_adapter = "org.goorm.stencil.uml/usecasediagram.includes";
			
			if (self.window_manager.window[self.window_manager.active_window].designer) {
				self.window_manager.window[self.window_manager.active_window].designer.canvas.add("line", shape_adapter, {dashed:true});	
				self.window_manager.window[self.window_manager.active_window].designer.canvas.set_drawing_mode("line");
			}
			else {
				m.er("Active window does not have a desginer!", "plugin: design.uml");
			}
		});	
		
	},
	
	refreshtoolbox: function(){
		$("#uml_toolset").show();
		$("#uml_toolset").children().each(function(){
			//$(this).css("display","none");
			$(this).css("display","block");
		});
		
/*
		$("#uml_toolset #too_uml_general").css("display","block")
			.next().css("display","block")
			.next().css("display","block")
			.next().css("display","block");
			
		switch (core.dialogProjectProperty.property['DETAILEDTYPE']){
			case "Class Diagram" :
				$("#uml_toolset #tool_uml_class_diagram").css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block");
				break;
			case "State Diagram" :
				$("#uml_toolset #tool_uml_state_diagram").css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block");
				break; 
			case "Sequence Diagram" :
				$("#uml_toolset #tool_uml_sequence_diagram").css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block");
				break;
			case "Component Diagram" :
				$("#uml_toolset #tool_uml_componentDiagram").css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block");
				break;
			case "Activity Diagram" :
				$("#uml_toolset #tool_uml_activity_diagram").css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block");
				break; 
			case "UseCase Diagram" :
				$("#uml_toolset #tool_uml_usecase_diagram").css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block")
					.next().css("display","block");
				break;
		}
*/
	}
};