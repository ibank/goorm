/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.shortcut.manager = function () {

};

org.goorm.core.shortcut.manager.prototype = {
	init: function () {

		//Prevent Backspace Key
		$(document).bind('keydown', 'Backspace', function (e) {
			
			if (core.status.focus_on_editor) {
				
			}
			else if (core.focusOnInputBox) {
				
			}
			else {
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
			
		});
			 
		$(document).bind('keyup', function (e) {
			core.status.keydown = false;
		  	
		  	if (e.keyCode != 27 && e.keyCode != 13) {
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		});
		
		$("input").keyup(function (e) {
			var ev = e || event;
			
		  	if (e.keyCode == 27 && e.keyCode == 13) {
				$(document).trigger(e);
				
				e.stopPropagation();
				e.preventDefault();
				return false;				
			}
		});

		//////////////////////////////////////////////////
		//Main Menu Selection
		//////////////////////////////////////////////////
					
		//Main Menu Selection
		$(document).bind('keydown', "Alt", function (e) {
			//core.module.layout.mainmenu.setInitialSelection();
			core.module.layout.mainmenu.focus();
		  
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
	
		//////////////////////////////////////////////////
		//Main Menu : File
		//////////////////////////////////////////////////
			
		//New Project
		$(document).bind('keydown', 'Alt+N', function (e) {

			core.dialog.new_project.show();
			
			core.module.layout.mainmenu.blur();

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		
		
		//Open Project
		$(document).bind('keydown', 'Ctrl+O', function (e) {
			
			core.dialog.open_project.show();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Open File
		$(document).bind('keydown', 'Ctrl+Shift+O', function (e) {
			
			core.dialog.open_file.show();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});

		//Close
		$(document).bind('keydown', 'Alt+X', function (e) {
			var active_window = core.module.layout.workspace.window_manager.active_window;
			core.module.layout.workspace.window_manager.window[active_window].close();

			core.module.layout.mainmenu.blur();
		
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Close All
		$(document).bind('keydown', 'Alt+Shift+X', function (e) {
			var window_manager = core.module.layout.workspace.window_manager;
			window_manager.close_all();

			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Save
		$(document).bind('keydown', 'Ctrl+S', function (e) {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.save();
			}
			else if (window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.save();
			}

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Save as File
		$(document).bind('keydown', 'Ctrl+Shift+S', function (e) {

			core.dialog.save_as_file.show();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Save All
		$(document).bind('keydown', 'Alt+Ctrl+S', function (e) {
			core.module.layout.workspace.window_manager.save_all();

			core.module.layout.mainmenu.blur();

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Move
		$(document).bind('keydown', 'Ctrl+Shift+M', function (e) {

			if(core.status.selected_file){
				core.dialog.move_file.show("context");
			}

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
	
		//Rename
		$(document).bind('keydown', 'Ctrl+Shift+R', function (e) {
			
			if(core.status.selected_file){
				core.dialog.rename_file.show("context");
			}
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Refresh
		$(document).bind('keydown', 'Ctrl+R', function (e) {

			core.module.layout.project_explorer.refresh();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Print
		$(document).bind('keydown', 'Ctrl+P', function (e) {
			
			core.dialog.print.show();

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
				
		//////////////////////////////////////////////////
		//Main Menu : Edit
		//////////////////////////////////////////////////
		
		//Undo
		$(document).bind('keydown', 'Ctrl+Z', function (e) {

			var window_manager = core.module.layout.workspace.window_manager;
			
			if (window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.undo();
			}

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Redo
		$(document).bind('keydown', 'Ctrl+Y', function (e) {

			var window_manager = core.module.layout.workspace.window_manager;
			
			if (window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.redo();
			}

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		
		//Cut
		$(document).bind('keydown', 'Ctrl+X', function (e) {

			var window_manager = core.module.layout.workspace.window_manager;
			
			if (window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.cut();
				
				e.stopPropagation();
				e.preventDefault();
				return false;	
			}
			else {
				if(core.preference['preference.editor.use_clipboard']=="false"){
					$("a[action=do_cut]").trigger("click");
					e.stopPropagation();
					e.preventDefault();
					return false;				
				}
			}
			
		});
		//Copy
		$(document).bind('keydown', 'Ctrl+C', function (e) {

			var window_manager = core.module.layout.workspace.window_manager;
			
			if (window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.copy();
				
				e.stopPropagation();
				e.preventDefault();
				return false;	
			}
			else {
				if(core.preference['preference.editor.use_clipboard']=="false"){
					$("a[action=do_copy]").trigger("click");
					e.stopPropagation();
					e.preventDefault();
					return false;		
				}
			}


		});
		//Paste
		$(document).bind('keydown', 'Ctrl+V', function (e) {

			var window_manager = core.module.layout.workspace.window_manager;
			
			if (window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.paste();
				
				e.stopPropagation();
				e.preventDefault();
				return false;	
			}
			else {
				if(core.dialog.preference.preference['preference.editor.use_clipboard']=="false"){
					$("a[action=do_paste]").trigger("click");
					e.stopPropagation();
					e.preventDefault();
					return false;
				}		
			}
			
		});
		//Delete
		$(document).bind('keydown', 'Del', function (e) {

			var window_manager = core.module.layout.workspace.window_manager;

			if (typeof window_manager.window[window_manager.active_window]!="undefined" && typeof window_manager.window[window_manager.active_window].designer!="undefined") {
				window_manager.window[window_manager.active_window].designer.canvas._delete();
				
				e.stopPropagation();
				e.preventDefault();
				return false;	
			}
			else {
				$("a[action=delete_file]").trigger("click");
				e.stopPropagation();
				e.preventDefault();
				return false;		
			}
		});
		

		//Select All
		$(document).bind('keydown', 'Ctrl+A', function (e) {

			$("a[action=select_all]").trigger("click");
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
				
		//Find and Replace
		$(document).bind('keydown', 'Ctrl+F', function (e) {

			var window_manager = core.module.layout.workspace.window_manager;
			
			if (window_manager.window[window_manager.active_window].editor) {
				core.dialog.find_and_replace.show();
			}
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Find Next
		$(document).bind('keydown', 'Ctrl+G', function (e) {
			var window_manager = core.module.layout.workspace.window_manager;
			
			if (window_manager.window[window_manager.active_window].editor&&!core.status.keydown) {
				core.dialog.find_and_replace.find("next");
				core.status.keydown=true;
			}
			
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Find Previous
		$(document).bind('keydown', 'Ctrl+Shift+G', function (e) {

			var window_manager = core.module.layout.workspace.window_manager;
			
			if (window_manager.window[window_manager.active_window].editor&&!core.status.keydown) {
				core.dialog.find_and_replace.find("previous");
				core.status.keydown=true;
			}
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
	
		//Open Preference
		$(document).bind('keydown', 'Alt+P', function (e) {

			core.dialog.preference.show();
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});

		//////////////////////////////////////////////////
		//Main Menu : Edit
		//////////////////////////////////////////////////
		
		//Run
		$(document).bind('keydown', 'Ctrl+F5', function (e) {
			if(core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type]!=undefined) {
				core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type].run(core.status.current_project_path);
			}

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Debug
		$(document).bind('keydown', 'F7', function (e) {
			if(core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type]!=undefined) {
				core.module.layout.inner_bottom_tabview.selectTab(1);
				core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type].debug(core.status.current_project_path);
			}

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		
		//Build Project
		$(document).bind('keydown', 'F5', function (e) {
			if(core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type]!=undefined) {
				core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type].build(core.status.current_project_path);
			}
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		
		//Clean
		$(document).bind('keydown', 'Ctrl+Del', function (e) {

			core.dialog.build_clean.show();

			e.stopPropagation();
			e.preventDefault();
			return false;
		});		
				
				
		//////////////////////////////////////////////////
		//Main Menu : Collaboration
		//////////////////////////////////////////////////
		
		//Open Join the Project
		$(document).bind('keydown', 'Ctrl+J', function (e) { // core에서 init 안되어있음

			core.dialog.join_project.show();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
				
		//////////////////////////////////////////////////
		//Main Menu : window
		//////////////////////////////////////////////////
			
		//Previous window
		$(document).bind('keydown', 'Alt+Shift+left', function (e) {
			if (!core.status.keydown) {
			      core.module.layout.workspace.window_manager.previous_window();
			      core.status.keydown = true;
			}
			
			core.module.layout.mainmenu.blur();
		  
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
	 
		//Next window
		$(document).bind('keydown', 'Alt+Shift+right', function (e) {
		 	if (!core.status.keydown) {
				core.module.layout.workspace.window_manager.next_window();
				core.status.keydown = true;
			}
			
			core.module.layout.mainmenu.blur();
		  
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
	  
		//Left Layout Show/Hide
		$(document).bind('keydown', 'Alt+Shift+L', function (e) {
			if (!core.status.keydown) {
				if (core.module.layout.layout.getUnitByPosition("left")._collapsed) {
					core.module.layout.layout.getUnitByPosition("left").expand();
				}
				else {
					core.module.layout.layout.getUnitByPosition("left").collapse();
				}
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Left Layout Show/Hide
		$(document).bind('keydown', 'Alt+Shift+1', function (e) {
			if (!core.status.keydown) {
				core.module.layout.left_tabview.selectTab(0);
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Left Layout Toggle Project Explorer
		$(document).bind('keydown', 'Alt+Shift+2', function (e) {
			if (!core.status.keydown) {
				core.module.layout.left_tabview.selectTab(1);
			}
			
			core.module.layout.mainmenu.blur();

			e.stopPropagation();
			e.preventDefault();
			return false;
		});

		//Left Layout Show/Hide
		$(document).bind('keydown', 'Alt+Shift+R', function (e) {
			if (!core.status.keydown) {
				if (core.module.layout.inner_layout.getUnitByPosition("right")._collapsed) {
					core.module.layout.inner_layout.getUnitByPosition("right").expand();
				}
				else {
					core.module.layout.inner_layout.getUnitByPosition("right").collapse();
				}
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});	
		
		//Right Layout Toggle Toolbox
		$(document).bind('keydown', 'Alt+Shift+3', function (e) {
			if (!core.status.keydown) {
				core.module.layout.inner_right_tabview.selectTab(0);
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Right Layout Show/Hide
		$(document).bind('keydown', 'Alt+Shift+4', function (e) {
			if (!core.status.keydown) {
				core.module.layout.inner_right_tabview.selectTab(1);
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Right Layout Toggle Properties
		$(document).bind('keydown', 'Alt+Shift+5', function (e) {
			if (!core.status.keydown) {
				core.module.layout.inner_right_tabview.selectTab(2);
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Bottom Layout Show/Hide
		$(document).bind('keydown', 'Alt+Shift+B', function (e) {
			if (!core.status.keydown) {
				if (core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
					core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
				}
				else {
					core.module.layout.inner_layout.getUnitByPosition("bottom").collapse();
				}
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});			
		
		//Right Layout Toggle Object Explorer
		$(document).bind('keydown', 'Alt+Shift+6', function (e) {
			if (!core.status.keydown) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Bottom Layout Show/Hide
		$(document).bind('keydown', 'Alt+Shift+7', function (e) {
			if (!core.status.keydown) {
				core.module.layout.inner_bottom_tabview.selectTab(1);
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Bottom Layout Toggle Messages
		$(document).bind('keydown', 'Alt+Shift+8', function (e) {
			if (!core.status.keydown) {
				core.module.layout.inner_bottom_tabview.selectTab(2);
			}
			
			core.module.layout.mainmenu.blur();

			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		//Bottom Layout Toggle Generator
		$(document).bind('keydown', 'Alt+Shift+9', function (e) {
			if (!core.status.keydown) {
				core.module.layout.inner_bottom_tabview.selectTab(3);
			}

			core.module.layout.mainmenu.blur();
	
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		$(document).bind('keydown', 'Alt+Shift+W', function (e) {
			if (!core.status.keydown) {
				$($("a[action=toggle_full_workspace]").get(0)).trigger("click");
				core.status.keydown = true;
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
				
		//Hide All window
		$(document).bind('keydown', 'Alt+Shift+H', function (e) {
			if (!core.status.keydown) {
				core.module.layout.workspace.window_manager.hide_all_windows();
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
				
		//Show All window
		$(document).bind('keydown', 'Alt+Shift+S', function (e) {
			if (!core.status.keydown) {
				core.module.layout.workspace.window_manager.show_all_windows();
			}
			
			core.module.layout.mainmenu.blur();
			
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		
		
	}
};