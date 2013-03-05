/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.preference = {
	dialog: null,
	tabview: null,
	treeview: null,
	buttons: null,
	manager: null,
	ini: null,
	plugin: null,
	preference: null,
	firstShow: true,
	grid_opacity_slider: null,	
	preference_default: null,

	init: function () {
		
		var self = this;
		this.manager = org.goorm.core.preference.manager;
		this.manager.init();
		
		this.dialog = org.goorm.core.preference.dialog;
		
		this.load_default();
		
//		console.log("default preference load complete");
//		this.manager.ini_parser();
//		this.ini = this.manager.ini;
//		
//		this.manager.xml_parser("configs/preferences/default.xml");
//		this.xml=this.manager.xml;
//		
//		this.plugin = {};
//		
//		this.preference = {};
//		
//		this.get_preference(this.xml);
//		
	},
	
	load_default: function() {
		var self = this;
		// read default preference file
		this.manager.get_default_file("configs/preferences/default.json", function(json){
			self.preference = json;
			core.preference = json;
			self.preference_default = $.extend(true, {}, json);
			self.load();
			
			$.get('/preference/workspace_path', function(data){
				self.preference.workspace_path = data.path;
			});
		});
	},
	
	load_preference: function(path) {
		this.manager.get_default_file(path, function(json){
			$.extend(true, core.preference, json);
		});
	},
	
	// load from localStorage
	load: function() {
		$.each(core.preference, function(key, value){
			if(!$.isEmptyObject(localStorage[key])){
				if(key != "plugins"){
					core.preference[key] = localStorage[key];
				}
				else {
					core.preference[key] = JSON.parse(localStorage[key]);
				} 
			}
		});
		localStorage['workspace'] && (core.preference['workspace'] = JSON.parse(localStorage['workspace']))
	},
	
	// save current preferences(core.preference) to localStorage or share.json
	save: function() {
		$.each(core.preference, function(key, value){
			if (key == "share") {
				
			}
			else {
				if(typeof value == "object") {
					localStorage[key] = JSON.stringify(value);
				}
				else {
					localStorage[key] = value;
				}
			}
		});
	},
	
	apply: function(id){
		var self=this;
		var target="#preference_tabview";
		if(id){
			target+= " #"+id;
		}
		core.module.theme.load_css();
		this.read_dialog(core.preference);
			
		// Save changes of the information about file types into filetype.json
/*
		$.get("preference/put_filetypes", { data: core.filetypes }, function (data) {
			
		});
*/
//			self.get_preference(self.xml);
//			self.get_plugin_preference();
		$(core).trigger("on_preference_confirmed");
		
		$(core.module.layout.workspace.window_manager.window).each(function(i) {
			if(this.alive && this.designer) {
				if(self.preference["preference.designer.show_preview"]=="true") {
					this.designer.canvas.toolbar.is_preview_on = false;
				}
				else {
					this.designer.canvas.toolbar.is_preview_on = true;
				}
				this.designer.canvas.toolbar.toggle_preview();
				
				if(self.preference["preference.designer.show_grid"]=="true") {
					this.designer.canvas.toolbar.is_grid_on = false;
				}
				else {
					this.designer.canvas.toolbar.is_grid_on = true;
				}
				this.designer.canvas.toolbar.toggle_grid();
				
				if(self.preference["preference.designer.show_ruler"]=="true") {
					this.designer.canvas.toolbar.is_ruler_on = false;
				}
				else {
					this.designer.canvas.toolbar.is_ruler_on = true;
				}
				this.designer.canvas.toolbar.toggle_ruler();
				
				if(self.preference["preference.designer.snap_to_grid"]=="true") {
					this.designer.canvas.snap_to_grid = false;
				}
				else {
					this.designer.canvas.snap_to_grid = true;
				}
				this.designer.canvas.toolbar.toggle_snap_to_grid();
				
				this.designer.canvas.toolbar.change_grid_unit(self.preference["preference.designer.grid_unit"]);
				
				this.designer.canvas.toolbar.change_grid_opacity(self.preference["preference.designer.grid_opacity"]);
				
				this.designer.canvas.toolbar.change_ruler_unit(self.preference["preference.designer.ruler_unit"]);
	
			}
		});
	},
	
	restore_default: function(id){
		var self=this;
		if(id=="Theme"){//테마기본설정
			core.module.theme.current_theme=core.module.theme.theme_data[3];
			//$("#theme_selectbox").val(3);
			 core.module.theme.on_theme_selectbox_change(3);
			core.module.theme.get_theme_contents(3);
			core.module.theme.get_theme_contents(3);

		}else{
//		var target = "#preference_tabview #"+id;
		var target = "#preference_tabview";
		var restore_object = {};
		var flag=0;
		}
//		$(self.xml).find("item[label="+id+"] ini").each(function(){
//			restore_object[$(this).attr("name")] = $(this).attr("default");
//			flag++;
//		});
//		$(self.xml).find("item[label="+id+"] preference").each(function(){
//			restore_object[$(this).attr("name")] = $(this).attr("default");
//			flag++;
//		});
//		if(!flag){
//			for(var plugin_name in this.plugin){
//				if(!flag){
//					$(self.plugin[plugin_name].xml).find("item[label="+id+"] ini").each(function(){
//						restore_object[$(this).attr("name")] = $(this).attr("default");
//						flag++;
//					});
//					$(self.plugin[plugin_name].xml).find("item[label="+id+"] preference").each(function(){
//						restore_object[$(this).attr("name")] = $(this).attr("default");
//						flag++;
//					});
//				}
//			}
//		}
		
		this.fill_dialog(self.preference_default);
	},
	
	// dialog에 있는 preference요소를 모두 읽어들인다.
	read_dialog: function(preference) {
		var target="#preference_tabview";
		
		var targets = $(target).children('div');
		
		var key = null;
		$.each(targets, function(index, div){
			if($(targets[index]).attr('plugin') == 'null') {
				key = preference;
			}
			else {
				key = preference.plugins[$(targets[index]).attr('plugin')];
			}
				
			$(targets[index]).find("input").each(function(){
				var value;
				if($(this).attr("type") == "checkbox"){
					value = ($(this).attr("checked") == "checked") ? true : false;
				}
				else {
					value = $(this).val();
				}
				key[$(this).attr("name")] = value;
			});
			
			$(targets[index]).find("textarea").each(function(){
				key[$(this).attr("name")] = $(this).val();
			});
			
			$(targets[index]).find("select").each(function(){
				key[$(this).attr("name")] = $(this).children("option:selected").val();
			});
		});
	},
	
	fill_dialog: function(preference) {
		var target="#preference_tabview";
		
		var targets = $(target).children('div');
		
		var key = null;
		$.each(targets, function(index, div){
			if($(targets[index]).attr('plugin') == 'null') {
				key = preference;
			} else {
				key = preference.plugins[$(targets[index]).attr('plugin')];
			}
			
			$(targets[index]).find("input").each(function(){
				if(key[$(this).attr("name")] !== null){
					if($(this).attr("type") == "checkbox"){
						
						if(key[$(this).attr("name")] == "true" || key[$(this).attr("name")] == true) {
							$(this).attr("checked",true);
						}
//						else $(this).attr("checked",);
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

	show: function () {
		var self=this;
		this.dialog.panel.show();
		this.set_before();
		if(this.firstShow){
			$("#preference_tabview #System").show();
			this.firstShow=false;
		}
		core.module.localization.before_language = localStorage.getItem("language");
	},

	set_before: function(){
		this.load();
		this.fill_dialog(core.preference);		
	},
		
	init_dialog: function () {
		var self = this;
		var handle_ok = function() {
			self.apply();
			self.save();
			this.hide();
		};

		var handle_cancel = function() { 

			if (core.module.localization.before_language != localStorage.getItem("language")) {
				core.module.localization.change_language(core.module.localization.before_language, true);
			}
		
			self.set_before();
			this.hide();
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}];
		
		this.dialog.init({
			localization_key:"title_preference",
			title:"Preference", 
			path:"configs/dialogs/org.goorm.core.preference/preference.html",
			width:700,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				// create default dialog tree and tabview
				$.getJSON("configs/dialogs/org.goorm.core.preference/tree.json", function(json){
					// construct basic tree structure
					self.manager.create_treeview(json);
					self.manager.create_tabview(json);

					// load plugin tree
					load_plugin_tree();

					// TreeView labelClick function
					self.manager.treeview.subscribe("clickEvent", function(nodedata){
						var label = nodedata.node.html;
						label = label.replace(/[/#. ]/,"");
						label = label.replace(/\s/g, '');
						if(/localization_key/.test(label)) label = $('#'+nodedata.node.contentElId).children().attr('tab_action');
						
						$("#preference_tabview > *").hide();
						$("#preference_tabview #"+label).show();

						// File_Type이 클릭될 떄에는 항상 오른쪽 칸이 refresh되도록 설정
						if (/FileType/.test(label)) {
							$(".filetype_list").find("div").first().trigger('click');
						}
						
						if (/Designer/.test(label)) {
							self.grid_opacity_slider.setValue(parseInt($("#grid_opacity_slider_value").val()*200));
							$("#grid_opacity_slider_value_text").text(($("#grid_opacity_slider_value").val()*100)+"%");	
						}
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
					
					var info = org.goorm.core.preference.info;
					info.init();
					
					var filetype = org.goorm.core.preference.filetype;
					filetype.init();
					
					var language = org.goorm.core.preference.language;
					language.init();
					
					// $(core).bind('dialog_localization', function(){
						// for(var i=0; i<self.manager.localization_ids.length; i++){
							// var local_target = self.manager.localization_ids[i];
							// $('#'+local_target.id).attr('localization_key', local_target.localization_key);
						// }
					// });
					
					$(core).trigger("preference_loading_complete");
					console.log("preference dialogs load complete");
				});
				
//				// set username, password for svn
//				/*
//				$.post("plugins/org.goorm.plugin.svn/svn.config.json", function(data) {
//					var configData = eval(data);
//					$('#svn_username').val(configData[0].username);
//					$('#svn_password').val(configData[0].password);
//				});
//				*/
//
			}
		});
		
		var set_dialog_button = function(){
			// set Apply, restore_default Button
			$("#preference_tabview").find(".apply").each(function(i){
				$(this).attr("id","applyBt_"+i);
				new YAHOO.widget.Button("applyBt_"+i,{onclick:{fn:function(){
					self.apply($("#preference_tabview #applyBt_"+i).parents(".yui-navset").attr("id"));
				}}, label:'<span localization_key="apply">Apply</span>' });
			});
			
			$("#preference_tabview").find(".restore_default").each(function(i){
				$(this).attr("id","restore_defaultBt_"+i);
				new YAHOO.widget.Button("restore_defaultBt_"+i,{onclick:{fn:function(){
					self.restore_default($("#preference_tabview #restore_defaultBt_"+i).parents(".yui-navset").attr("id"));
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
					if (json && json.preference) {
						// construct basic tree structure
						self.manager.add_treeview(plugin_node, json.preference);
						self.manager.add_tabview(json.preference, plugin_name);
						self.manager.treeview.render();
						self.manager.treeview.expandAll();
						
						self.preference.plugins[plugin_name] || (self.preference.plugins[plugin_name] = {});
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