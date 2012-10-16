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
 * @class checkForUpdates
 * @extends help
 **/
org.goorm.core.help.checkForUpdates = function () {
	/**
	 * This presents the current browser version
	 * @property dialog
	 * @type Number
	 * @default null
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
	this.currentVersion = null;
	
	this.officialVersion = null;
	this.officialUrl = null;
};

org.goorm.core.help.checkForUpdates.prototype = {
	/**
	 * This function is an goorm core initializating function.  
	 * @constructor
	 * @param {Object} input This is input. 
	 **/
	
	init: function () {
		var self = this;
		
		var handleOk = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK",  handler:handleOk}]; 
						 
		this.dialog = new org.goorm.core.help.checkForUpdates.dialog();
		this.dialog.init({
			title:"Checking updates", 
			path:"configs/dialogs/org.goorm.core.help/help.checkForUpdates.html",
			width:500,
			height:300,
			modal:true,
			yesText: "OK",
			noText: "Close",
			buttons:this.buttons,
			success: function () {
				
			}			
		});
		this.dialog = this.dialog.dialog;
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method show 
	 **/
	show: function () {
		this.dialog.panel.show();
		this.checkUpdate();
	},
	checkUpdate : function (){
		var self=this;
		var url = "file/get_contents";
		var path = "http://skima.skku.edu/~moyara/goorm.xml";
		var index=0;
		$("#divCheckForUpdate").html("");
		core.loadingBar.startLoading("Loading updates...");
		
		$(this).bind("cursorLoadingComplete", function () {
			core.loadingBar.stopLoading();
		});
		
		// Get official version
		$.ajax({
			url: url,			
			type: "GET",
			data: "path="+path,
			success: function(data) {
			    var xml = $.parseXML(data);
			    self.officialVersion =  $(xml).find("version").text();
			    self.officialUrl =  $(xml).find("url").text();
			    
			    // Get current version
			    $.ajax({
					type: "POST",
					dataType: "xml",
					url: "configs/goorm.xml",
					success: function(xml) {
						self.currentVersion = $(xml).find("version").text();
						$("#divCheckForUpdate").append(
								"&lt;goorm&gt; Current Version : "+self.currentVersion+" / "
								+"Official Version : <span style='color:red;'>"+self.officialVersion+"</span><br>"
								);
						if(self.currentVersion != self.officialVersion){
							$("#divCheckForUpdate").append("Update : <a href="+self.officialUrl+">"+self.officialUrl+"<br>");
						}
						var numberOfPlugins = 0;
						for (var i in core.dialogPreference.plugin){
							numberOfPlugins++;
						}
						// Get plugin version
						for (var name in core.dialogPreference.plugin){
							var plugin = core.dialogPreference.plugin[name];
//							$.ajax({
//								url: url,		
//								type: "POST",
//								data: "path="+plugin.url+"/config.xml",
//								success: function(data) {					
//								    var xml = $.parseXML(data);
//								    var officialVersion =  $(xml).find("version").text();
//								    var officialUrl =  $(xml).find("url").text();
//								    
//								    if(officialVersion != plugin.version && officialVersion){
//								    	$("#divCheckForUpdate").append(
//								    		"&lt;Plugin&gt; " + name
//							    			+ "("+plugin.version+") : new version "
//											+"<span style='color:red;'>"+officialVersion+"</span><br>"
//											+"<a href="+officialUrl+">"+officialUrl+"</a><br>"
//								    	);
//								    }
//								    index++;
//								    
//								    if(index == numberOfPlugins){
//								    	$(self).trigger("cursorLoadingComplete");
//								    }
//								}
//								, error: function(xhr, status, error) {alert.show(core.localization.msg["alertError"] + error);}
//							});
						}
					}
					, error: function(xhr, status, error) {alert.show(core.localization.msg["alertError"] + error); }
				});
			}
			, error: function(xhr, status, error) {alert.show(core.localization.msg["alertError"] + error); }
		});
		

	}
};
