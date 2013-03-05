/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.device = {
	init: function () {
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		// Get the device type / osType / is_touchable_device
		//////////////////////////////////////////////////////////////////////////////////////////////////////

		var is_ipad = navigator.userAgent.match(/iPad/i) != null;
		var is_iphone = navigator.userAgent.match(/iPhone/i) != null;
		var is_ipod = navigator.userAgent.match(/iPod/i) != null;
		var is_android = navigator.userAgent.match(/Android/i) != null;
		var is_webos = navigator.userAgent.match(/webOS/i) != null;
		
		
		var result = {};

		if(is_ipad) {
			$('.device_type').html("iPad");
			
			this.type = "iPad";
			this.os = "iOS";
		}
		else if(is_iphone) {
			$('.device_type').html("iPhone");
			
			this.type = "iPhone";
			this.os = "iOS";			
		}
		else if(is_ipod) {		
			$('.device_type').html("iPod");
			
			this.type = "iPod";
			this.os = "iOS";			
		}
		else if(is_android) {		
			$('.device_type').html("iPod");
			
			this.type = "Android";
			this.os = "Android";			
		}	
		else if(is_webos) {		
			$('.device_type').html("webOS");
			
			this.type = "webOS";
			this.os = "webOS";			
		}		
		else {
			$('.device_type').html("PC");
			
			this.type = "PC";
			
			if (navigator.appVersion.indexOf("Win") != -1) {
				this.os = "windows";
			}
			if (navigator.appVersion.indexOf("Mac") != -1) {
				this.os = "MacOS";
			}
			if (navigator.appVersion.indexOf("X11") != -1) {
				this.os = "UNIX";
			}
			if (navigator.appVersion.indexOf("Linux") != -1) {
				this.os = "Linux";
			}
		}
	}
};