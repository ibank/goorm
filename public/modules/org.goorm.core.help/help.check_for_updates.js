/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
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
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>",  handler:handle_ok}]; 
						 
		this.dialog = new org.goorm.core.help.check_for_updates.dialog();
		this.dialog.init({
			title:"Checking updates", 
			path:"configs/dialogs/org.goorm.core.help/help.check_for_updates.html",
			width:500,
			height:300,
			modal:true,
			yes_text: "<span localization_key='ok'>OK</span>",
			no_text: "<span localization_key='close'>Close</span>",
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
		var url = "http://goorm.io/api/get_goorm_info";
		var current_version = core.env.version;
//		var index=0;
		core.module.loading_bar.start("Loading updates...");
		$("#div_check_for_update").html("goorm IDE Current Version : "+current_version+"<br>");
		
		// Get official version
		$.ajax({
			url: url,			
			type: "GET",
			dataType: "jsonp",
			timeout: 5000,
			success: function(json) {
				console.log(json);
				json = JSON.parse(json);
				console.log(json);
			    var official_version =  json.version;
			    if(official_version) {
					$("#div_check_for_update").append(
							"Official Version : <span style='color:red;'>"+official_version+"</span>"
							);
					if(current_version != official_version){
						$("#div_check_for_update").append("<p>Update : <a href='http://goorm.io' target='_blank'>http://goorm.io</a></p>");
					}
			    }
			    else {
			    	alert.show(core.module.localization.msg["alert_error"] + "unknown version");
			    }
				
			    // Get current version
//			    $.ajax({
//					type: "POST",
//					dataType: "xml",
//					url: "configs/goorm.xml",
//					success: function(xml) {
//						var numberOfPlugins = 0;
//						for (var i in core.dialog.preference.plugin){
//							numberOfPlugins++;
//						}
//						// Get plugin version
//						for (var name in core.dialog.preference.plugin){
//							var plugin = core.dialog.preference.plugin[name];
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
//								, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alert_error"] + error);}
//							});
//						}
//					}
//					, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alert_error"] + error); }
//				});
			}
			, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alert_error"] + error); }
			, complete: function(){
				core.module.loading_bar.stop();
			}
		});
		

	}
};
