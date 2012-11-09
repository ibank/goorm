/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.debug.message = function () {

};

org.goorm.core.debug.message.prototype = {
	
	m: function (color, text, from, line_no, filename) {
		var self = this;
		
		var header = "[" + filename + ":" + line_no +"] ";
	
		$("#debug").prepend(this.make_message(header, color, text, from, line_no, filename)); 
		$("#debug").find("div:first").click(function() {
			var line_no = $(this).attr("line_no");
			var filename = $(this).attr("filename");
			
			if (line_no != "" && filename != "") {
				self.highlight(line_no, filename);
			}
		});		
	},
	
	highlight: function (line_no, filename) {
		var window_manager = core.module.layout.workspace.window_manager;

		for (var i=0; i<window_manager.index; i++) {
			if (window_manager.window[i].filename == filename) {
				window_manager.window[i].editor.editor.focus();
				window_manager.window[i].editor.editor.set_cursor(parseInt(line_no)-1, 0);
				break;
			}
		}
	},
	
	make_message: function (header, color, text, from, line_no, filename) {	
		var message = "<div class='debug_tab_line_selection' line_no='" + line_no + "' filename='" + filename + "'><font color=" + color + ">";
		message += header + ": ";
		message += text;
		message += "</font>";
		message += "<font color='gray'>";
		message += " (from " + from + ")";
		message += "</font></div>";
		
		return message;
	},

	clean: function () {
		core.module.layout.inner_bottom_tabview.selectTab(1);
		var message = "<pre>";
		message += "Project clean complete";
		message += "</pre>";
		
		$("#debug").prepend(message);
	}
};