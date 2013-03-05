/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.project.property = {
	dialog: null,
	tabview: null,
	treeview: null,
	buttons: null,
	manager: null,
	property: null,
	plugin: null,
	firstShow: true,

	init: function () { 
		var self = this;
		
		this.manager = org.goorm.core.project.property.manager;
		
		this.property = {};

		this.init_dialog();
		
		$(core).on("on_project_open", function(){
			self.firstShow = true;
			// property 로드
			self.load_property(core.status.current_project_path, function(contents){
				self.property = contents || {};
				core.property = self.property;
				self.property.plugins || (self.property.plugins = {});
				if(contents){
					// 프로젝트에 사용하는 플러그인만 출력.
					var node = self.manager.treeview.getNodeByProperty("html", "<span localization_key='plugin'>Plugin</span>");
					var last_node;
					for (var i=0; i < node.children.length; i++) {
						var plugin = node.children[i];
						if(plugin.html.toLowerCase() == contents.type.toLowerCase()) {
							$("#"+plugin.contentElId).prev().removeClass("ygtvln").addClass("ygtvtn")
							.parent().show();
							last_node = $("#"+plugin.contentElId);
							
							// 플러그인 프로퍼티가 지정되지 않은경우 프리퍼런스에서 자동으로 가져온다.
							for(var name in core.preference.plugins) {
								if(self.property.plugins[name] === undefined && name.search("org.goorm.plugin."+contents.type.toLowerCase()) != -1) {
									self.property.plugins[name] = core.preference.plugins[name];
								}
							}
						}
						else {
							$("#"+plugin.contentElId).prev().removeClass("ygtvln").addClass("ygtvtn")
							.parent().hide();
						}
					}
					last_node && last_node.prev().removeClass("ygtvtn").addClass("ygtvln");
					
					self.fill_dialog();
					
					$("#property_tabview > *").hide();
					$("#property_tabview #property_Information").show();
				}
			});
			
			$("#property_tabview .yui-navset").hide();
		});
	},
	
	show: function () {
		var self = this;
		if(core.status.current_project_path != ""){
			this.dialog.panel.show();
//			this.set_before();
			if(this.firstShow){
				$("#property_tabview > div").hide();
				$("#property_tabview #property_Information").show();
				this.firstShow=false;
			}
		}
		else {
			var result = {result:false, code:5};
			core.module.project.display_error_message(result, 'alert');
		}
	},
	
	refresh_toolbox: function () {

//		$(".toolsets").hide();
//		
//		var active_file_type = null;
//		
//		if (core.module.layout.workspace.window_manager.active_window > -1) {
//			active_file_type = core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].filetype;
//		}
//
//		if(core.status.current_project_type) {
//			for (var value in core.module.plugin_manager.plugins) {
//				if ("org.goorm.plugin." + core.status.current_project_type.toLowerCase() == value) {
//					
//					if(core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type.toLowerCase()].refresh_toolbox) {				
//							core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type.toLowerCase()].refresh_toolbox();
//							if(toolbox_button_menu)
//								toolbox_button_menu.set("label", core.module.plugin_manager.plugins[value].toolbox_name);
//					}else{
//						$("#"+core.status.current_project_type.toLowerCase()+"_toolset").show();
//					}
//					
//					break;
//				}
//			}
//		}		
//		else if(active_file_type) {
//			for (var value in core.module.plugin_manager.plugins) {
//				if (typeof(core.module.plugin_manager.plugins[value].filetypes)!="undefined") {
//					if(core.module.plugin_manager.plugins[value].filetypes.indexOf(active_file_type) > -1) {
//						if(core.module.plugin_manager.plugins["org.goorm.plugin."+core.module.plugin_manager.plugins[value].name].refresh_toolbox) {				
//							core.module.plugin_manager.plugins["org.goorm.plugin."+core.module.plugin_manager.plugins[value].name].refresh_toolbox();
//						}else{
//							$("#"+core.module.plugin_manager.plugins[value].name+"_toolset").show();
//						}
//						
//						//toolbox_button_menu.set("label", core.module.plugin_manager.plugins[value].toolbox_name);
//						break;
//					}
//				}
//			}
//		}
	},
	
	// save current property(core.property) to project.json
	save: function(callback) {
		var path = core.status.current_project_path, 
			property = core.property;
			
		property.description = property.description.replace(/&(lt|gt);/g, function (strMatch, p1){
			return (p1 == "lt")? "<" : ">";
		});
		property.description = property.description.replace(/<\/?[^>]+(>|$)/g, "");
		
		$.get("project/set_property", {project_path: path, data:JSON.stringify(property)}, function (data) {
			if (data.err_code == 0) {
				$.extend(true, core.workspace[path], property);
				callback && callback();
			}
			else {
				alert.show(data.message);
			}
		});
	},
	
	apply: function(){
		this.read_dialog();
		$(core).trigger("on_property_confirmed");
	},
	
	restore_default: function(){
		var self=this;
		var target = "#property_tabview";
		var restore_object = {};
		var flag=0;
		
		this.fill_dialog();
	},
	
	// dialog에 있는 property를 모두 읽어들인다.
	read_dialog: function() {
		var target="#property_tabview";
		
		var targets = $(target).children('div');
		
		var key = null;
		$.each(targets, function(index, div){
			if($(targets[index]).attr('plugin') == 'null') {
				key = core.property;
			}
			else {
				key = core.property.plugins[$(targets[index]).attr('plugin')];
				
				if(key === undefined) return ;
			}
				
			$(targets[index]).find("input").each(function(){
				if($(this).attr("name") != undefined){
					var value;
					if($(this).attr("type") == "checkbox"){
						value = ($(this).attr("checked") == "checked") ? true : false;
					}
					else if($(this).attr("type") == "radio"){
						if($(this).attr("checked") == "checked"){
							value = $(this).val();
						}
						else {
							return ;
						}
					}
					else {
						value = $(this).val();
					}
					key[$(this).attr("name")] = value;
				}
			});
			
			$(targets[index]).find("textarea").each(function(){
				if($(this).attr("name") != undefined){
					key[$(this).attr("name")] = $(this).val();
				}
			});
			
			$(targets[index]).find("select").each(function(){
				if($(this).attr("name") != undefined){
					key[$(this).attr("name")] = $(this).children("option:selected").val();
				}
			});
		});
	},
	
	fill_dialog: function () {
		var target="#property_tabview";
		
		var targets = $(target).children('div');
		
		var key = null;
		
		$.each(targets, function(index, div){
			var plugin_name = $(targets[index]).attr('plugin');
			if($(targets[index]).attr('plugin') == 'null') {
				key = core.property;
			}
			else {
				key = core.property.plugins[plugin_name];
				if(key === undefined) return ;
			}
			
			$(targets[index]).find("input").each(function(){
				if(key[$(this).attr("name")]){
					if($(this).attr("type") == "checkbox"){
						if(key[$(this).attr("name")] == "true" || key[$(this).attr("name")] == true)
							$(this).attr("checked",true);
					}
					else if($(this).attr("type") == "radio"){
						if(key[$(this).attr("name")] == $(this).val())
							$(this).attr("checked",true);
					}
					else{
						$(this).val(key[$(this).attr("name")]);
					}
				}
			});
			$(targets[index]).find("textarea").each(function(){
				if(key[$(this).attr("name")] !== null){
					$(this).val(key[$(this).attr("name")]);
				}
			});
			$(targets[index]).find("select").each(function(){
				if(key[$(this).attr("name")] !== null){
					$(this).children("option[value = " + key[$(this).attr("name")] + "]").attr("selected", "true");
					$(this).val(key[$(this).attr("name")]);
				}
			});
		});
	},
	
	// project.json파일을 읽어온다.
	load_property: function(path, callback) {
		var self = this;
		$.get("project/get_property", {project_path: path}, function (data) {
			if (data.err_code == 0) {
				callback && callback(data.contents);
			}
			else {
				alert.show(data.message);
			}
		});
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
	
	init_dialog: function() {
		var self = this;
		// Handler for OK button
		var handle_ok = function() {
			self.apply();
			self.save(function(){
				core.module.layout.project_explorer.refresh();
			});
			
			this.hide();
			
			self.fill_dialog();
		};

		var handle_cancel = function() { 
			self.set_before(); 
			this.hide();
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = org.goorm.core.project.property.dialog;
		this.dialog.init({
			localization_key:"title_project_property",
			title:"Project Property", 
			path:"configs/dialogs/org.goorm.core.project/project.property.html",
			width:700,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				$.getJSON("configs/dialogs/org.goorm.core.project/tree.json", function(json){
					// construct basic tree structure
					self.manager.create_treeview(json);
					self.manager.create_tabview(json);

					// load plugin tree
					load_plugin_tree();

					// TreeView labelClick function
					self.manager.treeview.subscribe("clickEvent", function(nodedata){
						var label = nodedata.node.html;
						label = label.replace(/[/#. ]/,"");
						if(/localization_key/.test(label)) label = $('#'+nodedata.node.contentElId).children().attr('tab_action');
						$("#property_tabview > *").hide();
						$("#property_tabview #property_"+label).show();
					});
					
					self.grid_opacity_slider = YAHOO.widget.Slider.getHorizSlider("grid_opacity_sliderBg", "grid_opacity_slider_thumb", 0, 200, 20);
					self.grid_opacity_slider.animate = true;
					self.grid_opacity_slider.getRealValue = function() {
						return ((this.getValue()/200).toFixed(1));
					}
					self.grid_opacity_slider.subscribe("change", function(offsetFromStart) {
						$("#grid_opacity_slider_value").val(self.grid_opacity_slider.getRealValue());
						$("#grid_opacity_slider_value_text").text((self.grid_opacity_slider.getRealValue()*100)+"%");
					});
					
					// $(core).bind('dialog_localization', function(){
						// for(var i=0; i<self.manager.localization_ids.length; i++){
							// var local_target = self.manager.localization_ids[i];
							// $('#'+local_target.id).attr('localization_key', local_target.localization_key);
						// }
					// });
				});
			}
		});
		
		var set_dialog_button = function(){
			// set Apply, restore_default Button
			$("#property_tabview").find(".apply").each(function(i){
				$(this).attr("id","property_applyBt_"+i);
				new YAHOO.widget.Button("property_applyBt_"+i,{onclick:{fn:function(){
					self.apply($("#property_tabview #property_applyBt_"+i).parents(".yui-navset").attr("id"));
				}}, label:'<span localization_key="apply">Apply</span>' });
			});
			
			$("#property_tabview").find(".restore_default").each(function(i){
				$(this).attr("id","property_restore_defaultBt_"+i);
				new YAHOO.widget.Button("property_restore_defaultBt_"+i,{onclick:{fn:function(){
					self.restore_default($("#property_tabview #property_restore_defaultBt_"+i).parents(".yui-navset").attr("id"));
				}}, label:'<span localization_key="restore_default">Restore Default</span>' });
			});
		};
		
		var load_plugin_tree = function(){
			var plugin_node = null,
				plugin_list = core.module.plugin_manager.list,
			    plugin_count = plugin_list.length;
				
			// load plugin tree.json
			$.each(core.module.plugin_manager.list, function(index, plugin){
				var plugin_name = plugin.name;
				$.getJSON("/" + plugin_name + "/tree.json", function(json){
					if (plugin_node === null) {
						plugin_node = self.manager.treeview.getNodeByProperty("html", "<span localization_key='plugin'>Plugin</span>");
					}
					if (json && json.property) {
						// construct basic tree structure
						self.manager.add_treeview(plugin_node, json.property);
						self.manager.add_tabview(json.property, plugin_name);
						self.manager.treeview.render();
						self.manager.treeview.expandAll();
					}
				}).complete(function(){
					if(--plugin_count == 0) {
						// when all plugin tree loaded, render dialog buttons.
						set_dialog_button();
					}
				});
			});
		};
		
		this.dialog = this.dialog.dialog;
	}
};