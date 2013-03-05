/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.printer = {
	dialog: null,
	buttons: null,
	tabview: null,
	treeview: null,
	print_window: null,

	init: function () {
		var self = this;
		
		var handle_print = function() { 
			self.print_window = window.open("", "", "width=800, height=600, scrollbars=yes");
	
			self.print_window.document.write("<script src='/lib/net.codemirror.code/lib/codemirror.js'></script>");
			self.print_window.document.write("<script src='/lib/net.codemirror.code/lib/util/runmode.js'></script>");
			self.print_window.document.write("<script src='/lib/net.codemirror.code/mode/xml/xml.js'></script>");
			
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/lib/codemirror.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/theme/default.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/theme/neat.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/theme/elegant.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/theme/night.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/css/docs.css'>");
	
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/mode/clike/clike.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/mode/css/css.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/mode/diff/diff.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/mode/haskell/haskell.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/mode/javascript/javascript.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/mode/rst/rst.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/mode/stex/stex.css'>");
			self.print_window.document.write("<link rel='stylesheet' href='/lib/net.codemirror.code/mode/xml/xml.css'>");
	
			self.print_window.document.write("<pre id='print_contents' class='cm-s-default'></pre>");

			self.set_contents(self.print_window);
			self.print_window.focus();

			this.hide();
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};		
		
		this.buttons = [
						{text:"<span localization_key='print'>Print</span>", handler:handle_print, isDefault:true},
						{text:"<span localization_key='cancel'>Cancel</span>", handler:handle_cancel}
						];
						 
		this.dialog = org.goorm.core.printer.dialog;
		this.dialog.init({
			localization_key:"title_print",
			title:"Print", 
			path:"configs/dialogs/org.goorm.core.printer/printer.html",
			width:300,
			height:200,
			modal:true,
			buttons:this.buttons,
			success: function () {

			}
		});
		this.dialog = this.dialog.dialog;
	}, 
	
	show: function () {
		var window_manager = core.module.layout.workspace.window_manager;
		if (window_manager.window[window_manager.active_window]) {
			this.set_preview_contents($("#print_preview"));
			//$(document).find("#print_preview").html($(document).find(".activated").parent().find(".CodeMirror-lines").html());
			this.dialog.panel.show();
		}
		else {
			alert.show(core.module.localization.msg['alert_print_file_error']);
		}
	},
	
	set_contents: function (target) {
		var window_manager = core.module.layout.workspace.window_manager;
		
		if (window_manager.window[window_manager.active_window].editor) {
			var code = window_manager.window[window_manager.active_window].editor.editor.getValue();
			var mode = window_manager.window[window_manager.active_window].editor.mode;

			setTimeout(function(){
				CodeMirror.runMode(code, mode, target.document.getElementById("print_contents"));
				target.print();
			}, 500);
		}
		else if (window_manager.window[window_manager.active_window].designer) {
			var design_print = new org.goorm.core.printer.design();
						
			design_print.init($(target.document).find("#print_contents"), window_manager.window[window_manager.active_window].designer.canvas.width, window_manager.window[window_manager.active_window].designer.canvas.height, 1, window_manager.window[window_manager.active_window].designer.canvas);
			design_print.draw();
			target.print();
		}
	},
	
	set_preview_contents: function (target) {
		var window_manager = core.module.layout.workspace.window_manager;
		
		if(window_manager.active_window == -1)
			return;
		
		if (window_manager.window[window_manager.active_window].editor) {
			/*
			var ContentsText = $(opener.document).find(".activated").parent().find(".CodeMirror-lines").html();
		  
			if(ContentsText != "") {
				document.body.innerHTML = ContentsText;
				window.print();
			}
			else {
			}
			*/
		}
		else if (window_manager.window[window_manager.active_window].designer) {
			var design_print = new org.goorm.core.printer.design.preview();
									
			design_print.init($(target).find("#print_contents"), window_manager.window[window_manager.active_window].designer.canvas.width, window_manager.window[window_manager.active_window].designer.canvas.height, 150/window_manager.window[window_manager.active_window].designer.canvas.width, window_manager.window[window_manager.active_window].designer.canvas);
			design_print.draw();
		}
	}
};
