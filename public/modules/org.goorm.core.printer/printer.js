/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.printer = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
};

org.goorm.core.printer.prototype = {
	init: function () {
		var self = this;
		
		var handle_print = function() { 
			var print_window = window.open("", "", "width=1000, height=700, scrollbars=yes");
			print_window.document.write("<div id='print_contents'></div>");
			self.set_contents(print_window);
			print_window.focus();
			
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};		
		
		this.buttons = [
						{text:"Print", handler:handle_print, isDefault:true},
						{text:"Cancel", handler:handle_cancel}
						]; 
						 
		this.dialog = new org.goorm.core.printer.dialog();
		this.dialog.init({
			title:"Print", 
			path:"configs/dialogs/org.goorm.core.printer/printer.html",
			width:620,
			height:450,
			modal:true,
			buttons:this.buttons,
			success: function () {

			}			
		});
		this.dialog = this.dialog.dialog;
	}, 
	
	show: function () {
		this.set_preview_contents($("#print_preview"));
		//$(document).find("#print_preview").html($(document).find(".activated").parent().find(".CodeMirror-lines").html());
		this.dialog.panel.show();
		
	},
	
	set_contents: function (target) {
		var window_manager = core.module.layout.workspace.window_manager;
		
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
			var design_print = new org.goorm.core.printer.design();
			
			//$(target).find("#print_contents").html("fuck");
						
			design_print.init($(target.document).find("#print_contents"), window_manager.window[window_manager.active_window].designer.canvas.width, window_manager.window[window_manager.active_window].designer.canvas.height, 1, window_manager.window[window_manager.active_window].designer.canvas);
			design_print.draw();
			target.print();
		}
	},
	
	set_preview_contents: function (target) {
		var window_manager = core.module.layout.workspace.window_manager;
		
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
