/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.utility.statusbar = function () {
	this.progressbar = null
};

org.goorm.core.utility.statusbar.prototype = {
	
	init: function () {
		this.progressbar = new YAHOO.widget.ProgressBar({
			minValue: 0,
			maxValue: 100,
			value: 0,
			height: 15,
			width: 100
		}).render("goorm_progress_bar");
	},
	
	start: function () {
		$("#goorm_statusbar_message").html("Loading...");
		$("#goorm_loading_indicator").html("<img src='images/org.goorm.core.utility/loading.gif' />");
	},
	
	stop: function () {
		$("#goorm_statusbar_message").html("");
		$("#goorm_loading_indicator").html("");
	},
	
	s: function (text, from) {
		var header = "Success";
		var color = "blue";
	
		$("#goorm_statusbar_message").prepend(this.make_message(header, color, text, from)); 
	},
	
	f: function (text, from) {
		var header = "Fail";
		var color = "#f66";
		
		$("#goorm_statusbar_message").prepend(this.make_message(header, color, text, from)); 
	},
	
	w: function (text, from) {
		var header = "Warning";
		var color = "orange";
		
		$("#goorm_statusbar_message").prepend(this.make_message(header, color, text, from)); 
	},
	
	er: function (text, from) {
		var header = "Error";
		var color = "red";
		
		$("#goorm_statusbar_message").prepend(this.make_message(header, color, text, from)); 
	},
	
	ev: function (text, from) {
		var header = "Event";
		var color = "sky";
		
		$("#goorm_statusbar_message").prepend(this.make_message(header, color, text, from)); 
	},
	
	a: function (text, from) {
		var header = "Alarm";
		var color = "black";
		
		$("#goorm_statusbar_message").prepend(this.make_message(header, color, text, from)); 
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
		$("#goorm_statusbar_message").html("");
	}
};