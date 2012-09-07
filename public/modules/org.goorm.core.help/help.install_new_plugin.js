/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
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
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.help.install_new_plugin.dialog();
		this.dialog.init({
			title:"Install New Plugins", 
			path:"configs/dialogs/org.goorm.core.help/help.install_new_plugin.html",
			width:600,
			height:400,
			modal:true,
			yes_text: "OK",
			no_text: "Close",
			buttons:this.buttons,
			success: function () {
				self.plugins_add_button = new YAHOO.widget.Button("plugins_add_button");
				self.select_all = new YAHOO.widget.Button("select_all");
				self.deselect_all = new YAHOO.widget.Button("deselect_all");
				self.install_new_plugin = new YAHOO.widget.Button("install_new_plugin");
				//TabView Init
				// self.tabview = new YAHOO.widget.TabView('help_install_new_pluginContents');
// 				
				// //TreeView Init
				// self.treeview = new YAHOO.widget.TreeView("help_install_new_pluginTreeview");
				// self.treeview.render();
				$("#div_install_new_plugins #install_new_plugin").click(function(){
					core.module.loading_bar.start("Install new plugins...");
					self.num=0;
					$("#div_install_new_list input:checkbox:checked").each(function(){
						self.num++;
					});
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
					if(url != ""){
						core.module.loading_bar.start("Loading, Please wait...");
						
						$.ajax({
							type: "POST",
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
//			type: "POST",
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
					type: "POST",
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
					, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alertError"] + error); }
				});
//			    
//			}
//			, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alertError"] + error); }
//		});
	}
};
