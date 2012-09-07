/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.project.build.project = function () {
	this.dialog = null;
	this.buttons = null;
	this.button_select_all = null;	
	this.button_deselect_all = null;
	this.is_repeat = null
};

org.goorm.core.project.build.project.prototype = {

	init: function () {
		
		var self = this;
		
		self.is_repeat = false;
				
		var handle_open = function() {
			$("#build_project_list input[type=checkbox]").each(function(){
				var list = this;
				if($(list).is(":checked")){
				
					var window_manager = core.module.layout.workspace.window_manager;
					var did_save = false;
					var target_window = -1;
					var temp_filename = "";

					if ( !self.is_repeat ) {
						$(window_manager.window).each(function (i) {
							if( ("../../project/"+$(list).attr("project_path")) ==  this.filepath && !this.isSaved ) {
								temp_filename = this.filename;
								did_save = true;
								target_window = i;
							}
						});
					}

					if ( did_save && !self.is_repeat ) {

						confirmation_save.init({
							title: core.module.localization.msg["confirmation_save_title2"],
							message: "\""+temp_filename+"\" "+core.module.localization.msg["confirmation_save_message2"],
							yes_text: core.module.localization.msg["confirmation_yes"],
							cancel_text: core.module.localization.msg["confirmation_cancel"],
							no_text: core.module.localization.msg["confirmation_no"],
							yes: function () {
								self.is_repeat = true;							
								window_manager.window[target_window].editor.save();
								handle_open();
								self.dialog.panel.hide();
							}, cancel: function () {
								self.is_repeat = false;							
								return false;
								self.dialog.panel.hide();
							}, no: function () {
								self.is_repeat = true;
								handle_open();
								self.dialog.panel.hide();
							}
						});
						
						confirmation_save.panel.show();
					}
					else {
						if (self.is_repeat) {
							confirmation_save.panel.hide();
						}
						
						self.is_repeat = false;
						if(!$.isEmptyObject(core.module.plugin_manager.plugins["org.goorm.plugin."+$(list).attr("projectType")])) {
							core.module.plugin_manager.plugins["org.goorm.plugin."+$(list).attr("projectType")].build($(list).attr("project_name"),$(list).attr("project_path"));
						}
						else {
							alert.show("Cannot find plugin to build project!");
						}
					}
				}
			});
			this.hide(); 
		};

		var handle_cancel = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"Build", handler:handle_open, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.project.build.project.dialog();
		this.dialog.init({
			title:"Build Project", 
			path:"configs/dialogs/org.goorm.core.project/project.build.project.html",
			width:400,
			height:400,
			modal:true,
			buttons:this.buttons,
			success: function () {
				self.button_select_all = new YAHOO.widget.Button("build_project_select_all");
				self.button_deselect_all = new YAHOO.widget.Button("build_project_deselect_all");
				
				$("#build_project_select_all").click(function(){
					self.select_all();
				});
				$("#build_project_deselect_all").click(function(){
					self.deselect_all();
				});
			}
		});
		this.dialog = this.dialog.dialog;
		
		//this.dialog.panel.setBody("AA");
		

	},

	show: function () {
		this.project_list();
		this.dialog.panel.show();
	},

	select_all: function(){
		$("#build_project_list input[type=checkbox]").attr("checked",true);
	},
	
	deselect_all: function(){
		$("#build_project_list input[type=checkbox]").attr("checked",false);
	},

	project_list: function () {
		$("#build_project_list").empty();
	
		$.get("project/get_list", "", function (data) {
			
			var list = eval(data);
			$.each(list, function(index, project) {
				if(!$.isEmptyObject(core.module.plugin_manager.plugins["org.goorm.plugin."+project.contents.type])) {
					if(core.module.plugin_manager.plugins["org.goorm.plugin."+project.contents.type].build){
						var temp = "";
						temp += "<div id='selector_" + project.name + "' value='" + project.name + "' class='select_div' style='height:14px;'>";
						temp += "<div style='float:left;'>";
						temp += "<input type='checkbox' name='"+project.name+"' project_path='"+project.name+"' project_name='"+project.contents.name+"' projectType='"+project.contents.type+"'";
						
						if (project.name == core.status.current_project_path) {
							temp += "checked";
						}
						
						temp += "></div> ";
						temp += "<div style='float:left; padding-top:1px; padding-left:5px;'>" + project.name + "</div>";
						temp += "</div>";
		
						$("#build_project_list").append(temp);
						
						$("#selector_" + project.name).click(function () {
							$(this).find("input").attr("checked", !$(this).find("input").attr("checked"));
						});
					}
				}
			});	
		});
	}
};