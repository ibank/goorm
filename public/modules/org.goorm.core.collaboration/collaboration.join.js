/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.org/License
 * version: 1.0.0
 **/

org.goorm.core.collaboration.join = function () {
	this.dialog = null;
	this.buttons = null;	
	this.tabview = null;
	this.treeview = null;
	this.chat = null;
};

org.goorm.core.collaboration.join.prototype = {
	
	init: function () { 
		var self = this;
		var handleJoin = function() { 
			var self2=this;
			if($("#join_project_contents #project_list .selector_project").hasClass('selected_button')){
				$("#join_project_contents #project_list .selected_button").each(function(){
					self.chat.set_chat_off();
					core.dialog.open_project.open($(this).attr("project_path"),$(this).attr("project_name"),$(this).attr("projectType"));
					if (!core.flag.collaboration_on) {
						$("a[action=collaboration_edit_on_off]").click();
					}
					if (!core.collaboration_draw_on) {
						$("a[action=collaboration_draw_on_off]").click();
					}
					self2.hide();
				});
			}else{
				alert.show(core.module.localization.msg["alert_collaboration_select"]);
			}
		};

		var handle_cancel = function() { 
			this.hide(); 
			if(self.chat) self.chat.set_chat_off();
		};
		
		this.buttons = [ {text:"<span localization_key='join'>Join</span>", handler:handleJoin, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}];
							 
		this.dialog = new org.goorm.core.collaboration.join.dialog();
		this.dialog.init({
			localization_key:"title_join_online_project",
			title:"Join Online Project", 
			path:"configs/dialogs/org.goorm.core.collaboration/collaboration.join.html",
			width:700,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				//TabView Init
				self.tabview = new YAHOO.widget.TabView('join_project_contents');
				
				//TreeView Init
				self.treeview = new YAHOO.widget.TreeView("join_project_treeview");
				self.treeview.render();
				
				$("#join_project_contents").children("div").css("padding","0px");
			}
		});
		this.dialog = this.dialog.dialog;
		
		//this.dialog.panel.setBody("AA");
	},
	
	show: function () {
		var self=this;
		this.dialog.panel.show();
		
		self.chat = new org.goorm.core.collaboration.chat();
		self.chat.init("chat_join_online_project");
		$("#join_project_contents #project_list").html('');
		self.add_project_list();
		if(!this.chat.is_chat_on){
			this.chat.set_chat_on();
		}	
	},
		
	add_project_list: function () {
		var postdata = {
			kind: "project",
			project_name: "",
			folder_only: "false"
		};
		
		$.post("file/get_nodes", postdata, function (data) {
			
			var sort_function = function (x,y) {
				return ((x.cls > y.cls) ? -1 : ((x.cls < y.cls) ? 1 : 0 ));
			};
			
			var sort_project_treeview = function (sorting_data) { 				
				sorting_data.sort(sort_function);
				
				for(i=0; i<sorting_data.length; i++) {
					if(sorting_data[i].children) {
						sort_project_treeview(sorting_data[i].children);
					}
				}
			};
			
			var sorting_data = eval(data);
			
			var counter = 0;
			for(var name in sorting_data) {
				if(sorting_data[name].cls=="folder") {
					var icon_str = "";
					var url = {path : "../../project/" +  sorting_data[name].filename + "/project.xml"};
					counter++;
					$.get("file/get_contents", url , function (xml) {
						if(xml){
							if($(xml).find("COLLABORATION").text() == "true"){
								var project_name = $(xml).find("AUTHOR").text()+"_"+$(xml).find("NAME").text();
								icon_str = "<div id='selector_" + project_name + "' project_path='" + project_name + "' project_name='" + $(xml).find("NAME").text() + "' projectType='"+ $(xml).find("TYPE").text() +"' class='selector_project'>";
								icon_str += "<div style='padding-left:65px; padding-top:20px;'>";
								icon_str += project_name;
								icon_str += "</div>";
								icon_str += "</div>";
								$("#join_project_contents #project_list").append(icon_str);
							}
						}
						counter--;
						if(counter ==0){
							$("#join_project_contents #project_list .selector_project").click(function() {
								$("#join_project_contents #project_list .selector_project").removeClass("selected_button");
								$(this).addClass("selected_button");
							});
						}
					});
				}
			}
		});
	}
};