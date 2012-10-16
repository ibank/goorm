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
		$.ajax({
			type: 'get', 
			dataType: "json",
			url: "configs/server.json", 
			success: function(json) {
				$("#server_os").append(json.OS_version);
				$("#apache_version").append(json.Apache_version);
				$("#php_version").append(json.PHP_version);
				$("#redis_version").append(json.Redis_version);
				$("#node_version").append(json.Node_version);
			}
		});
		
		$.ajax({
			type: 'get', 
			dataType: "json",
			url: "configs/goorm.json", 
			success: function(json) {
				$("#core_version").append(json.version);
				$.each(json.lib, function(index, lib){
					var version = lib.version;
					switch(lib.name) {
					case "YUI" : $("#yui_version").append(version);break;
					case "jQuery" : $("#jquery_version").append(version);break;
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
