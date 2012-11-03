/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.terminal.message = function () {

};

org.goorm.core.terminal.message.prototype = {

	m: function (text, from) {
		var header = "[MSG] ";
		var color = "black";
	
		$("#terminal").prepend(this.make_message(header, color, text, from)); 
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
		$("#terminal").html("");
	}
};