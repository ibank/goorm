/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.project.build.all = function () {
	this.dialog = null;
	this.buttons = null;

};

org.goorm.core.project.build.all.prototype = {
	init: function () {
		
		var self = this;
				
		var handle_open = function() {
			var obj = {}; 
			$("#build_all_list input[type=hidden]").each(function(){
				var status = $(this).parent().find(".buildStatus");
				obj[$(this).attr("name")] = status;
				var plugin = core.module.plugin_manager.plugins["org.goorm.plugin."+$(this).attr("projectType")];
				if(plugin.build) {
					status.html("<img src='./images/org.goorm.core.utility/loading.gif' width='16' height='16' align='top'>building");
					plugin.build($(this).attr("name"),function(){
						status.html("<img src='./images/org.goorm.core.dialog/dialog_notice.png' width='16' height='16' align='top'>complete");
					});
				}
			});
		};

		var handle_cancel = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='build'>Build</span>", handler:handle_open, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.project.build.all.dialog();
		this.dialog.init({
			localization_key:"title_build_all",
			title:"Build All", 
			path:"configs/dialogs/org.goorm.core.project/project.build.all.html",
			width:400,
			height:370,
			modal:true,
			buttons:this.buttons,
			success: function () {
			}
		});
		this.dialog = this.dialog.dialog;
		
		//this.dialog.panel.setBody("AA");
	},
	
	show: function () {
		this.project_list();
		this.dialog.panel.show();
	},

	project_list: function () {
		$("#build_all_list").empty();
			
		var data = core.workspace; 
		for(var name in data) {
			if(!$.isEmptyObject(core.module.plugin_manager.plugins["org.goorm.plugin."+data[name].type])) {
				if(core.module.plugin_manager.plugins["org.goorm.plugin."+data[name].type].build){
					var icon_str = "";
					icon_str += "<div id='selector_" + name + "' value='" + name + "'>";
					icon_str += "<input type='hidden' name='"+name+"' project_path='"+name+"' project_name='"+data[name].name+"' projectType='"+data[name].type+"'>";
					icon_str += name;
					icon_str += "<div style='float:right' class='buildStatus'></div>";
					icon_str += "</div>";
		
					$("#build_all_list").append(icon_str);
				}
			}
		}
	}
};