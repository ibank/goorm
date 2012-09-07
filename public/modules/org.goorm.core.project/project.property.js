/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.project.property = function () {
	this.dialog = null;
	this.tabview = null;
	this.treeview = null;
	this.buttons = null;
	this.manager = null;
	this.property = null;
	this.plugin = null;
};

org.goorm.core.project.property.prototype = {
	init: function () { 
		var self = this;
		this.manager = new org.goorm.core.project.property.manager();
		this.manager.xml_parser("configs/project/property/default.xml");
		this.xml=this.manager.xml;
		
		this.property = {};
		this.plugin = {};
		
		this.dialog = new org.goorm.core.project.property.dialog();
		
		// Handler for OK button
		var handle_ok = function() {
			var valid = 1;
			
			// For input elements, validate values and put them into 'postdata'
			$("#property_tabview").find("input").each(function(){
				
				var input = $(this);
				if ($(this).attr("validate")){
					var validate = $(this).attr("validate").split(',');
					
					// Check validation criteria
					for (var i=0;i<validate.length;i++){
						if (valid) valid = self.manager.validate(input, validate[i]);
						else return false;
					}
				}
				if(valid){
					if($(this).attr("type") == "checkbox"){
						if($(this).attr("checked") == true){
							self.property[$(this).attr("name")]="true";
						}
						else {
							self.property[$(this).attr("name")]="false";
						}
					}
					else {
						self.property[$(this).attr("name")]=$(this).val();
					}
				}
			});
			// For textarea elements, validate values and put them into 'postdata'
			$("#property_tabview").find("textarea").each(function(){
				var str = $(this).val();
				
				if(valid){
					self.property[$(this).attr("name")]=$(this).val();
				}
			});
			
			$("#property_tabview").find("select").each(function(){
				self.property[$(this).attr("name")]=$(this).text();
			});
			// If all values are valid, call php function to save them in project.xml
			if(valid) {
				self.save_project_xml();
				this.hide();
			}
		};

		var handle_cancel = function() { 
			this.hide();
			self.set_before(); 
		};
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.project.property.dialog();
		this.dialog.init({
			title:"Project Property", 
			path:"configs/dialogs/org.goorm.core.project/project.property.html",
			width:700,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				// On the right side of dialog
				self.manager.create_treeview(self.xml);

				// Plugin setting
				for (var i=0;i < core.module.plugin_manager.list.length; i++){
										
					var plugin_name=core.module.plugin_manager.list[i].plugin_name;
					//self.manager.xml_parser('plugins/' + plugin_name + '/config.xml');
					plugin_name = $(self.manager.xml).find("plugin").attr("name");
				
					self.plugin[plugin_name] = new self.manager.plugin(core.module.plugin_manager.list[i].plugin_name);
					self.plugin[plugin_name].xml = self.manager.xml;
				}
					
				$("#property_tabview #Information").show();

				// TreeView labelClick function
				self.manager.treeview.subscribe("clickEvent", function(nodedata){
					var label = nodedata.node.label;
					label = label.replace(/[/#. ]/g,"");
					
					$("#property_tabview").children().hide();
					$("#property_tabview #property_"+label).show();
				});
			}
		});
		this.dialog = this.dialog.dialog;
		
	},
	
	show: function () {
		var self = this;
		if(core.status.current_project_path != null && core.status.current_project_path != ""){
			this.set_project_information();
			this.dialog.panel.show();
		}
	},
	
	refresh_toolbox: function () {

		$(".toolsets").hide();
		
		var active_file_type = null;
		
		if (core.module.layout.workspace.window_manager.active_window > -1) {
			active_file_type = core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].filetype;
		}



		if(core.status.current_project_type) {
			for (var value in core.module.plugin_manager.plugins) {
				if ("org.goorm.plugin." + core.status.current_project_type.toLowerCase() == value) {
					
					if(core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type.toLowerCase()].refresh_toolbox) {				
							core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type.toLowerCase()].refresh_toolbox();
							if(toolbox_button_menu)
								toolbox_button_menu.set("label", core.module.plugin_manager.plugins[value].toolbox_name);
					}else{
						$("#"+core.status.current_project_type.toLowerCase()+"_toolset").show();
					}
					
					break;
				}
			}
		}		
		else if(active_file_type) {
			for (var value in core.module.plugin_manager.plugins) {
				if (typeof(core.module.plugin_manager.plugins[value].filetypes)!="undefined") {
					if(core.module.plugin_manager.plugins[value].filetypes.indexOf(active_file_type) > -1) {
						if(core.module.plugin_manager.plugins["org.goorm.plugin."+core.module.plugin_manager.plugins[value].name].refresh_toolbox) {				
							core.module.plugin_manager.plugins["org.goorm.plugin."+core.module.plugin_manager.plugins[value].name].refresh_toolbox();
						}else{
							$("#"+core.module.plugin_manager.plugins[value].name+"_toolset").show();
						}
						
						//toolbox_button_menu.set("label", core.module.plugin_manager.plugins[value].toolbox_name);
						break;
					}
				}
			}
		}
	},
	
	set_project_information: function () {
		var self=this;
		this.property = {};
		
		var postdata = {
			project_path: core.status.current_project_path
		};
							
		$.get("project/get_property", postdata, function (data) {
			if (data.err_code == 0) {
				// need.... fucking
			}
			else {
				alert.show(data.message);
			}
		});
/*
		this.get_property(this.xml);			
			
		// Get the contents of project.xml and put them into repective HTML elements
		$.ajax({
			type: "POST",
			dataType: "xml",
			url: "project/" + core.status.current_project_path + "/project.xml",
			success: function (xml) {
				
				$("#property_tabview").text("");
				
				$(xml).find("PROJECT").each(function(){
					$(this).children().each(function(){
						self.property[$(this)[0].tagName] = $(this).text();
					});
				});
				
				self.manager.create_tabview(self.xml);
				// Plugin setting
				var plugin_node = self.manager.treeview.getNodeByProperty("label","Plugin");
				self.manager.treeview.removeChildren(plugin_node);
				for (var name in self.plugin){
					if(name == self.property['TYPE']){
						$(self.plugin[name].xml).find("project").each(function(){
							$(this).find("property").each(function(){
								if(self.property[$(this).attr("name")] == null){
									self.property[$(this).attr("name")] = $(this).attr("default");
									self.plugin[name].property[$(this).attr("name")] = $(this).attr("default");
								}
								else {
									self.plugin[name].property[$(this).attr("name")] = self.property[$(this).attr("name")];
								}
							});
						});
						
						self.manager.add_treeview(plugin_node,self.plugin[name].xml);
						self.manager.treeview.render();
						self.manager.create_tabview(self.plugin[name].xml);
						
						// Set build configuration
						core.dialog.build_configuration.set_build_config();
					}

					else {
						self.plugin[name].property = {};
					}
				}
				
				// TreeView labelClick function
				self.manager.treeview.subscribe("labelClick", function(node){
					var label = node.label;
					label = label.replace(/[/#. ]/g,"");
					
					$("#property_tabview").children().hide();
					$("#property_tabview #property_"+label).show();
				});
				
				self.set_before();
				
				self.refresh_toolbox();
			}
		});
*/
	},
	set_before: function(){
		var self=this;
		$("#property_tabview").find("input").each(function(){
			if(self.property[$(this).attr("name")]!=null){
				if($(this).attr("type") == "checkbox"){
					if(self.property[$(this).attr("name")] == "true")
						$(this).attr("checked",true);
					else $(this).attr("checked",false);
				}
				else{
					$(this).val(self.property[$(this).attr("name")]);
				}
			}
		});
		$("#property_tabview").find("textarea").each(function(){
			if(self.property[$(this).attr("name")]!=null){
				$(this).val(self.property[$(this).attr("name")]);
			}
		});
		$("#property_tabview").find("select").each(function(){
			if(self.property[$(this).attr("name")]!=null){
				$(this).children("option[value = " + self.property[$(this).attr("name")] + "]").attr("selected", "ture");
				$(this).val(self.property[$(this).attr("name")]);
			}
		});
	},
	
	get_property: function (xml) {
		var self=this;
		$(xml).find("project").each(function(){
			if ($(this).find("property").length > 0) {
				$(this).find("property").each(function(){
					self.property[$(this).attr("name")] = $(this).attr("default");
				});
			}
		});
	},
	
	save_project_xml: function(callback){
		var self=this;
		self.property['project_path'] = core.status.current_project_path;
		var str = JSON.stringify(self.property);
		
		$.ajax({
			type: "POST",
			data: "data="+str,
			url: "./module/org.goorm.core.project/project.property.ok.php",
			success: function (data) {
				if(typeof callback == "function")
					callback();
			}
		});
	}
};