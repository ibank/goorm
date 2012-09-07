/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.utility.message = function () {

};

org.goorm.core.utility.message.prototype = {
	
	s: function (text, from) {
		var header = "Success";
		var color = "#000099";
	
		$("#message").prepend(this.make_message(header, color, text, from)); 
	},
	
	f: function (text, from) {
		var header = "Fail";
		var color = "#f66";
		
		$("#message").prepend(this.make_message(header, color, text, from)); 
	},
	
	w: function (text, from) {
		var header = "Warning";
		var color = "orange";
		
		$("#message").prepend(this.make_message(header, color, text, from)); 
	},
	
	er: function (text, from) {
		var header = "Error";
		var color = "red";
		
		$("#message").prepend(this.make_message(header, color, text, from)); 
	},
	
	ev: function (text, from) {
		var header = "Event";
		var color = "sky";
		
		$("#message").prepend(this.make_message(header, color, text, from)); 
	},
	
	a: function (text, from) {
		var header = "Alarm";
		var color = "black";
		
		$("#message").prepend(this.make_message(header, color, text, from)); 
	},
	
	make_message: function (header, color, text, from) {	
		var message = "<font color=" + color + ">";
		message += header + ": ";
		message += text;
		message += "</font>";
		message += "<font color='gray'>";
		message += " (from " + from + ")";
		message += "</font>";
		message += "<br>";
		
		return message;
	},

	clean: function () {
		$("#message").html("");
	}
};