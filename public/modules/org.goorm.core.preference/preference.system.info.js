/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.core.preference.info = function (){
	this.browser = name;
	this.version = 0;
	this.version = 3.0;
	this.is_ipad = false;
	this.os=null;
};

org.goorm.core.preference.info.prototype = {
	init : function() {
		var self = this;
		
		$.get("/preference/get_server_info", null, function(data) {
			if(data.err_code==0) {
				$("#server_os").append(data.info.os_version);
				$("#node_version").append(data.info.node_version);
				$("#mongodb_version").append(data.info.mongodb_version);
			}
		});
		
		$.get("/preference/get_goorm_info", null, function(data) {
			if(data.err_code==0) {
				core.env.version = data.info.version;
				$('.goorm_version').html("goorm IDE " + core.env.version);
				$("#core_version").append(data.info.version);
				$.each(data.info.lib, function(index, lib){
					var version = lib.version;
					switch(lib.name) {
					case "YUI" : $("#yui_version").append(version);break;
					case "jQuery" : $("#jquery_version").append(version);break;
					case "jQuery UI" : $("#jqueryui_version").append(version);break;
					case "CodeMirror" : $("#codemirror_version").append(version);break;
					}
				});
			}
		});
		
		if (navigator.appVersion.indexOf("Win")!=-1) 
			this.os="windows";
		else if (navigator.appVersion.indexOf("Mac")!=-1) 
			this.os="MacOS";
		else if (navigator.appVersion.indexOf("X11")!=-1) 
			this.os="UNIX";
		else if (navigator.appVersion.indexOf("Linux")!=-1) 
			this.os="Linux";
		else
			this.os="Unknown";
		
		if($.browser.mozilla)
			this.browser = "Firefox";
		else if($.browser.msie)
			this.browser = "IE";
		else if($.browser.opera)
			this.browser = "Opera";
		else if($.browser.chrome)
			this.browser = "Chrome";
		else if($.browser.safari)
			this.browser = "Safari";
		else
			this.browser = "Unknown";

		this.version = $.browser.version;
		
		//Need for device identification
		this.is_ipad = navigator.userAgent.match(/iPad/i) != null;
		
		$("#cos").append(this.os);
		$("#browser").append(this.browser+" ("+this.version+")");		
		if(this.is_ipad) {
			$("#device").append("iPad");
		}
		else {
			$("#device").append("PC");

		}
		
	}
};
