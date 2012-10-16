/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.project.build.clean = function () {
	this.dialog = null;
	this.buttons = null;
	this.chat = null;
};

org.goorm.core.project.build.clean.prototype = {
	init: function () {
		
		var self = this;
				
		var handle_clean = function() { 
			var project_array = [];
			
			$("#build_clean_list input[type=checkbox]").each(function(){
				if($(this).is(":checked")){
					project_array.push($(this).val());
					if(core.module.plugin_manager.plugins["org.goorm.plugin."+$(this).attr("projectType")]!=undefined) {
						core.module.plugin_manager.plugins["org.goorm.plugin."+$(this).attr("projectType")].clean($(this).attr("name"));
					}
				}
			});
			
			// not selected, send
			if (project_array.length==0) {
				alert.show("Not Selected.");
				return false;
			}
			else {
				var postdata = {
					project_list: project_array
				};
				
				$.get("project/clean", postdata, function (data) {
					if(data.err_code==0) {
						core.module.layout.project_explorer.refresh();
						self.dialog.panel.hide();
					}
					else {
						alert.show(data.message);
					}
				});
			}			
		};

		var handle_cancel = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"Clean", handler:handle_clean, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.project.build.clean.dialog();
		this.dialog.init({
			title:"Build Clean", 
			path:"configs/dialogs/org.goorm.core.project/project.build.clean.html",
			width:400,
			height:400,
			modal:true,
			buttons:this.buttons,
			success: function () {
				self.button_select_all = new YAHOO.widget.Button("build_clean_select_all");
				self.button_deselect_all = new YAHOO.widget.Button("build_clean_unselect_all");
				
				$("#build_clean_select_all").click(function(){
					self.select_all();
				});
				$("#build_clean_unselect_all").click(function(){
					self.unselect_all();
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
		$("#build_clean_list input[type=checkbox]").attr("checked",true);
	},
	
	unselect_all: function(){
		$("#build_clean_list input[type=checkbox]").attr("checked",false);
	},

	project_list: function () {
		$("#build_clean_list").empty();
	
		$.get("project/get_list", null, function (data) {
			
			for(var i=0; i<data.length; i++) {
				var icon_str = "";
				icon_str += "<div style='height:18px;padding:2px;'>";
				icon_str += "<span class='checkbox'><input type='checkbox' name='"+data[i].name+"' value='"+data[i].name+"' projectType='"+data[i].contents.type+"' ";

				if (data[i].name == core.status.current_project_path) {
					icon_str += "checked='checked'";
				}
				
				icon_str += "id='claean_selector_" + data[i].name+"' class='claean_selectors'><label data-on data-off></label></span>";
				
				icon_str += "<label for='claean_selector_" + data[i].name+"' style='margin-left:4px;'>" + data[i].name + "</label>";
				icon_str += "</div>";
	
				$("#build_clean_list").append(icon_str);				
			}
		});
	}
};