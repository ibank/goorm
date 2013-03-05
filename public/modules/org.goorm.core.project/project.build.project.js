/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.project.build.project = {
	dialog: null,
	buttons: null,
	button_select_all: null,	
	button_deselect_all: null,
	is_repeat: null,
	is_onclick: false,
	handle_build_for_run : null,
	flag : false,

	init: function () {
		
		var self = this;

		self.is_repeat = false;
				
		var handle_build = function(flag) {


			//console.log('----',flag);
			//self.flag=flag;
			if(flag=='run'){
				
		
				self.project_list();
				self.is_onclick = false;
				this.dialog.panel.show();
				this.dialog.panel.hide();
				//console.log( $("#build_project_list").find('label') );
				var arr= $("#build_project_list").find('label');
				for(var i=0; i< arr.length ;i++){
						if(   $(arr[i]).text()==core.status.current_project_path      ){
					
					//	console.log(    $(arr[i]).parent()   );
						$( $(arr[i]).parent().find('input')[0] ).attr("checked","checked");
					}}
			
			}




			if($("#build_project_list input[type=checkbox]:checked").length == 0){
				var result = {result:false, code:3};
				core.module.project.display_error_message(result, 'alert');
				return false;
			}


			$("#build_project_list input[type=checkbox]:checked").each(function(){
				var list = this;
				var window_manager = core.module.layout.workspace.window_manager;
				var did_save = true;
				var target_window = -1;
				var temp_filename = "";

				if ( !self.is_repeat ) {
					$(window_manager.window).each(function (i) {
						// if( ("../../project/"+$(list).attr("project_path")) ==  this.filepath && !this.isSaved ) {
							// temp_filename = this.filename;
							// did_save = true;
							// target_window = i;
						
						if( $(list).attr("project_path") ==  this.project && !this.is_saved ) {
							temp_filename = this.filename;
							did_save = false;
							target_window = i;
						}
					});
				}

				if ( !did_save && !self.is_repeat ) {
					confirmation_save.init({
						// title: core.module.localization.msg["confirmation_build"].value,
						title: 'Build...',
						message: "\""+temp_filename+"\" "+core.module.localization.msg["confirmation_build_message"].value,
						yes_text: core.module.localization.msg["confirmation_yes"].value,
						cancel_text: core.module.localization.msg["confirmation_cancel"].value,
						no_text: core.module.localization.msg["confirmation_no"].value,
						yes: function () {
							self.is_repeat = true;							
							window_manager.window[target_window].editor.save();
							handle_build();
							self.dialog.panel.hide();
						}, cancel: function () {
							self.is_repeat = false;							
							return false;
							self.dialog.panel.hide();
						}, no: function () {
							self.is_repeat = true;
							handle_build();
							self.dialog.panel.hide();
						}
					});
					
					confirmation_save.panel.show();
				}
				else {
					if (self.is_repeat) {
						confirmation_save.panel.hide();
					}
					
					//self.is_repeat = false;
					
					if(!self.is_onclick){
						if(!$.isEmptyObject(core.module.plugin_manager.plugins["org.goorm.plugin."+$(list).attr("projectType")])) {
							core.module.plugin_manager.plugins["org.goorm.plugin."+$(list).attr("projectType")].build($(list).val(), function(data){
								//console.log('build result',data);
								self.flag=data;
								if(flag=='run'  && self.flag){
									core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].run(core.status.current_project_path);
								}
							});

							// self.is_onclick = true;
							//self.flag=true;
							self.dialog.panel.hide();
						}
						else{
							self.flag=false;
							alert.show("Could not find a plugin to build this project");
						}
					}
					else{
						self.is_onclick = false;
					}
				}

			
			});

			

			if(self.flag==true){
				return true;
			}else if(self.flag==false){
				return false;
			}
			this.hide();
		};

		var handle_cancel = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='build'>Build</span>", handler:handle_build, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = org.goorm.core.project.build.project.dialog;
		this.dialog.init({
			localization_key:"title_build_project",
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
		self.handle_build_for_run=handle_build;
	},

	show: function () {
		var self = this;
		
		this.project_list();
		self.is_onclick = false;
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
	
		var data = core.workspace; 
		for(var name in data) {
			if(!$.isEmptyObject(core.module.plugin_manager.plugins["org.goorm.plugin."+data[name].type])) {
				if(core.module.plugin_manager.plugins["org.goorm.plugin."+data[name].type].build){
					var temp = "";
					temp += "<div style='height:18px;padding:2px;'>";
					temp += "<span class='checkbox'><input type='checkbox' name='"+name+"' value='"+name+"' projectType='"+data[name].type+"' ";
					
					if (name == core.status.current_project_path) {
						temp += "checked='checked'";
					}
					
					temp += "id='claean_selector_" + name+"' class='claean_selectors'><label data-on data-off></label></span>";
					temp += "<label for='claean_selector_" + name+"' style='margin-left:4px;'>" + name + "</label>";
					temp += "</div>";
	
					$("#build_project_list").append(temp);
					
					$("#selector_" + name).click(function () {
						$(this).find("input").attr("checked", !$(this).find("input").attr("checked"));
					});
				}
			}
		}
	}
};