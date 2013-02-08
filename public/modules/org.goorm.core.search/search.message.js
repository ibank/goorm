/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.search.message = function () {

};

org.goorm.core.search.message.prototype = {
	m: function (fromLine, fromCh, toLine, toCh, text) {
		var color = "#333";
		
		$("#search").prepend(this.make_message(fromLine, fromCh, toLine, toCh, text, color));
	},
	
	make_message: function (fromLine, fromCh, toLine, toCh, text, color) {
		var message = "<div class='search_message' fline='" + fromLine + "' fch='" + fromCh + "' tline='" + toLine + "' tch='" + toCh + "'><font color=" + color + ">";
		message += "[" + (core.status.selected_file.split("/")).pop();
		message += ":" + fromLine+1 + "]: ";
		// var encoded_text = this.html_encode(text);
		// var temp_message = encoded_text.slice(0, fromCh) + "<u>" + encoded_text.slice(fromCh, toCh) + "</u>" + encoded_text.slice(toCh);
		var encoded_text = this.html_encode(text.slice(0, fromCh) + "[underLineInsert]" + text.slice(fromCh, toCh) + "[/underLineInsert]" + text.slice(toCh));
		var temp_message = encoded_text.replace(this.html_encode("[underLineInsert]"), "<span style='text-decoration:none; border-bottom:1px solid red;'>");
		temp_message = temp_message.replace(this.html_encode("[/underLineInsert]"), "</span>");
		message += temp_message;
		message += "  (from " + core.status.current_project_name + ")";
		message += "</font>";
		message += "<br>";
		return message;
	},
	
	replace_all: function (fromLine, fromCh, toLine, toCh, fromText, toText) {
		var color = "#333";
		
		$("#search").prepend(this.make_replace_all_message(fromLine, fromCh, toLine, toCh, fromText, toText, color)); 
	},
	
	make_replace_all_message: function (fromLine, fromCh, toLine, toCh, fromText, toText, color) {
		var message = "<div class='search_message' fline='" + fromLine + "' fch='" + fromCh + "' tline='" + toLine + "' tch='" + toCh + "'><font color=" + color + ">";
		message += "[" + (core.status.selected_file.split("/")).pop();
		message += ":" + fromLine + " (" + fromCh + "~" + toCh + ")]: ";
		message += this.html_encode(fromText) + " -> " + this.html_encode(toText);
		message += "  (from " + core.status.current_project_name + ")";
		message += "</font>";
		message += "<br>";
		return message;
	},

	clean: function () {
		$("#search").html("");
	},
	
	html_encode: function (s)	{
	  var el = document.createElement("div");
	  el.innerText = el.textContent = s;
	  s = el.innerHTML;
	  delete el;
	  return s;
	}
};