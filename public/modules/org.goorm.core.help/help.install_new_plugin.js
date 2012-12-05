/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.help.install_new_plugin = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
	this.num = 0;
};

org.goorm.core.help.install_new_plugin.prototype = {
	init: function () {
		var self = this;
		
		var handle_ok = function() { 
			this.hide(); 
		};

		var handle_cancel = function() { 
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.help.install_new_plugin.dialog();
		this.dialog.init({
			localization_key:"title_install_new_plugins",
			title:"Install New Plugins", 
			path:"configs/dialogs/org.goorm.core.help/help.install_new_plugin.html",
			width:600,
			height:400,
			modal:true,
			// yes_text: "<span localization_key='ok'>OK</span>",
			// no_text: "<span localization_key='close'>Close</span>",			buttons:this.buttons,
			success: function () {
				self.plugins_add_button = new YAHOO.widget.Button("plugins_add_button", {label:'<span localization_key="dialog_help_install_new_plugins_add">Add...</span>'});
				self.select_all = new YAHOO.widget.Button("select_all", {label:'<span localization_key="common_select_all">Select All</span>'});
				self.deselect_all = new YAHOO.widget.Button("deselect_all", {label:'<span localization_key="common_deselect_all">Deselect All</span>'});
				self.install_new_plugin = new YAHOO.widget.Button("install_new_plugin", {label:'<span localization_key="dialog_help_install_new_plugins_install">Install</span>'});
				//TabView Init
				// self.tabview = new YAHOO.widget.TabView('help_install_new_pluginContents');
// 				
				// //TreeView Init
				// self.treeview = new YAHOO.widget.TreeView("help_install_new_pluginTreeview");
				// self.treeview.render();
				$("#div_install_new_plugins #install_new_plugin").click(function(){
					self.num=0;
					$("#div_install_new_list input:checkbox:checked").each(function(){
						self.num++;
					});
					if(self.num){
						core.module.loading_bar.start("Install new plugins...");
					}
					else {
						alert.show("No plugin selected");
					}
					$("#div_install_new_list input:checkbox:checked").each(function(){
						var url = $(this).val();
						setTimeout(function(){
							self.install_plugin(url);
						}
						,10);
					});
				});
				
				$("#div_install_new_plugins #select_all").click(function(){
					$("#div_install_new_list input:checkbox").each(function(){
						$(this).attr("checked","checked");
					});
				});
				
				$("#div_install_new_plugins #deselect_all").click(function(){
					$("#div_install_new_list input:checkbox").each(function(){
						$(this).attr("checked","");
					});
				});
				
				$("#div_install_new_plugins #selectbox").change(function(){
					var xml = null;
					var url = $(this).val();
					if(url && url != ""){
						core.module.loading_bar.start("Loading, Please wait...");
						
						$.ajax({
							type: "get",
							data: "path="+url,
							url: "file/get_url_contents",
							success: function(data) {
								xml = $.parseXML(data);
								$("#div_install_new_list").html("");
								$(xml).find("xml").each(function(){
									$(this).find("plugin").each(function(){
										$("#div_install_new_list").append('<input type="checkbox" name="'+$(this).attr("name")+'" value="'+$(this).attr("url")+'"> '+$(this).attr("name")+'<br>');
									});
								});
								core.module.loading_bar.stop();
							}
							, error: function(xhr, status, error) { 
								 
							}
						});
					}
					else {
						$("#div_install_new_list").html("");
					}
				});
			}			
		});
		this.dialog = this.dialog.dialog;
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * This operates the initialization tasks for layout, actions, plugins...
	 * @method show 
	 * @return void
	 **/
	show: function () {
		var self=this;
		this.dialog.panel.show();

	},
	install_plugin:function(pluginUrl){
		var self=this;
		var path = pluginUrl;
		
//		var fileList = new Array();
//		var folderList = new Array();
//		$.ajax({
//			url: url,			
//			type: "get",
//			data: "path="+path,
//			success: function(data) {
//				
//			    var xml = $.parseXML(data);
//			    var packageName =  $(xml).find("package").text();
//			    
//			    $(xml).find("resources").each(function(){
//			    	$(this).find("file").each(function(){
//			    		var pos = $(this);
//			    		var name=pos.text();
//			    		
//			    		pos= pos.parent();
//			    					    		
//			    		while(pos[0].tagName != "resources"){
//			    			name = pos.attr("name")+"/"+name;
//			    			pos= pos.parent();
//			    		}
//			    		
//			    		fileList.push(name);
//			    	});
//			    	$(this).find("folder").each(function(){
//			    		var pos = $(this);
//			    		var name=pos.attr("name");
//			    		
//			    		pos = pos.parent();
//			    		
//			    		while(pos[0].tagName != "resources"){
//			    			name = pos.attr("name")+"/"+name;
//			    			pos= pos.parent();
//			    		}
//			    		folderList.push(name);
//			    	});
//			    	
//			    });
//			    
//			    
//			    var data = {
//			    		"pluginUrl" : pluginUrl,
//			    		"packageName" : packageName,
//			    		"fileList" : fileList,
//			    		"folderList" : folderList
//			    };
//			    YAHOO.lang.JSON.useNativeStringify = true;
//			    var dataString = YAHOO.lang.JSON.stringify(data);
			    
			    $.ajax({
					url: "plugin/install",			
					type: "get",
					data: "path="+path,
					//async:false,
					success: function(data) {
						self.num--;
						
						if(self.num == 0){
							alert.init({
								title: "Install new plugins", 
								message: data,
								image_url: ""
							});
							alert.panel.show();
							
							core.module.loading_bar.stop();
						}
					}
					, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alert_error"] + error); }
				});
//			    
//			}
//			, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alert_error"] + error); }
//		});
	}
};
