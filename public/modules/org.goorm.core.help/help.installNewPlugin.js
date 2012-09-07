/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module help
 **/

/**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class installNewPlugin
 * @extends help
 **/
org.goorm.core.help.installNewPlugin = function () {
	/**
	 * This presents the current browser version
	 * @property dialog
	 **/
	this.dialog = null;
	
	/**
	 * The array object that contains the information about buttons on the bottom of a dialog 
	 * @property buttons
	 * @type Object
	 * @default null
	 **/
	this.buttons = null;
	
	/**
	 * This presents the current browser version
	 * @property tabView
	 **/
	this.tabView = null;
	
	/**
	 * This presents the current browser version
	 * @property treeView
	 **/
	this.treeView = null;
	
	this.num = 0;
};

org.goorm.core.help.installNewPlugin.prototype = {
	/**
	 * This function is an goorm core initializating function.  
	 * @constructor 
	 **/
	
	init: function () {
		var self = this;
		
		var handleOk = function() { 
			
			this.hide(); 
		};

		var handleCancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK", handler:handleOk, isDefault:true},
						 {text:"Cancel",  handler:handleCancel}]; 
						 
		this.dialog = new org.goorm.core.help.installNewPlugin.dialog();
		this.dialog.init({
			title:"Install New Plugins", 
			path:"configs/dialogs/org.goorm.core.help/help.installNewPlugin.html",
			width:600,
			height:400,
			modal:true,
			yesText: "OK",
			noText: "Close",
			buttons:this.buttons,
			success: function () {
				self.pluginsAddButton = new YAHOO.widget.Button("pluginsAddButton");
				self.selectAll = new YAHOO.widget.Button("selectAll");
				self.deselectAll = new YAHOO.widget.Button("deselectAll");
				self.btInstallNewPlugin = new YAHOO.widget.Button("btInstallNewPlugin");
				//TabView Init
				// self.tabView = new YAHOO.widget.TabView('helpInstallNewPluginContents');
// 				
				// //TreeView Init
				// self.treeView = new YAHOO.widget.TreeView("helpInstallNewPluginTreeview");
				// self.treeView.render();
				$("#divInstallNewPlugins #btInstallNewPlugin").click(function(){
					core.loadingBar.startLoading("Install new plugins...");
					self.num=0;
					$("#divInstallNewPluginList input:checkbox:checked").each(function(){
						self.num++;
					});
					$("#divInstallNewPluginList input:checkbox:checked").each(function(){
						var url = $(this).val();
						setTimeout(function(){
							self.installPlugin(url);
						}
						,10);
					});
				});
				
				$("#divInstallNewPlugins #selectAll").click(function(){
					$("#divInstallNewPluginList input:checkbox").each(function(){
						$(this).attr("checked","checked");
					});
				});
				
				$("#divInstallNewPlugins #deselectAll").click(function(){
					$("#divInstallNewPluginList input:checkbox").each(function(){
						$(this).attr("checked","");
					});
				});
				
				$("#divInstallNewPlugins #selectbox").change(function(){
					var xml = null;
					var url = $(this).val();
					if(url != ""){
						core.loadingBar.startLoading("Loading, Please wait...");
						
						$.ajax({
							type: "POST",
							data: "path="+url,
							url: "file/get_url_contents",
							success: function(data) {
								xml = $.parseXML(data);
								$("#divInstallNewPluginList").html("");
								$(xml).find("xml").each(function(){
									$(this).find("plugin").each(function(){
										$("#divInstallNewPluginList").append('<input type="checkbox" name="'+$(this).attr("name")+'" value="'+$(this).attr("url")+'"> '+$(this).attr("name")+'<br>');
									});
								});
								core.loadingBar.stopLoading();
							}
							, error: function(xhr, status, error) { console.log(error); }
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
	installPlugin:function(pluginUrl){
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
								imageURL: ""
							});
							alert.panel.show();
							
							core.loadingBar.stopLoading();
						}
					}
					, error: function(xhr, status, error) {alert.show(core.localization.msg["alertError"] + error); }
				});
//			    
//			}
//			, error: function(xhr, status, error) {alert.show(core.localization.msg["alertError"] + error); }
//		});
	}
};
