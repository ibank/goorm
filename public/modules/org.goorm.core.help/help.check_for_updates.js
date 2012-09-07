/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.help.check_for_updates = function () {
	this.dialog = null;
	this.buttons = null;
	this.current_version = null;
	this.official_version = null;
	this.official_url = null;
};

org.goorm.core.help.check_for_updates.prototype = {
	init: function () {
		var self = this;
		
		var handle_ok = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK",  handler:handle_ok}]; 
						 
		this.dialog = new org.goorm.core.help.check_for_updates.dialog();
		this.dialog.init({
			title:"Checking updates", 
			path:"configs/dialogs/org.goorm.core.help/help.check_for_updates.html",
			width:500,
			height:300,
			modal:true,
			yes_text: "OK",
			no_text: "Close",
			buttons:this.buttons,
			success: function () {
			}			
		});
		this.dialog = this.dialog.dialog;
	},
	
	show: function () {
		this.dialog.panel.show();
		this.check_update();
	},
	
	check_update : function (){
		var self=this;
		var url = "file/get_contents";
		var path = "http://skima.skku.edu/~moyara/goorm.xml";
		var index=0;
		$("#div_check_for_update").html("");
		core.module.loading_bar.start("Loading updates...");
		
		$(this).bind("cursorLoadingComplete", function () {
			core.module.loading_bar.stop();
		});
		
		// Get official version
		$.ajax({
			url: url,			
			type: "GET",
			data: "path="+path,
			success: function(data) {
			    var xml = $.parseXML(data);
			    self.official_version =  $(xml).find("version").text();
			    self.official_url =  $(xml).find("url").text();
			    
			    // Get current version
			    $.ajax({
					type: "POST",
					dataType: "xml",
					url: "configs/goorm.xml",
					success: function(xml) {
						self.current_version = $(xml).find("version").text();
						$("#div_check_for_update").append(
								"&lt;goorm&gt; Current Version : "+self.current_version+" / "
								+"Official Version : <span style='color:red;'>"+self.official_version+"</span><br>"
								);
						if(self.current_version != self.official_version){
							$("#div_check_for_update").append("Update : <a href="+self.official_url+">"+self.official_url+"<br>");
						}
						var numberOfPlugins = 0;
						for (var i in core.dialog.preference.plugin){
							numberOfPlugins++;
						}
						// Get plugin version
						for (var name in core.dialog.preference.plugin){
							var plugin = core.dialog.preference.plugin[name];
//							$.ajax({
//								url: url,		
//								type: "POST",
//								data: "path="+plugin.url+"/config.xml",
//								success: function(data) {					
//								    var xml = $.parseXML(data);
//								    var official_version =  $(xml).find("version").text();
//								    var official_url =  $(xml).find("url").text();
//								    
//								    if(official_version != plugin.version && official_version){
//								    	$("#div_check_for_update").append(
//								    		"&lt;Plugin&gt; " + name
//							    			+ "("+plugin.version+") : new version "
//											+"<span style='color:red;'>"+official_version+"</span><br>"
//											+"<a href="+official_url+">"+official_url+"</a><br>"
//								    	);
//								    }
//								    index++;
//								    
//								    if(index == numberOfPlugins){
//								    	$(self).trigger("cursorLoadingComplete");
//								    }
//								}
//								, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alertError"] + error);}
//							});
						}
					}
					, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alertError"] + error); }
				});
			}
			, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alertError"] + error); }
		});
		

	}
};
