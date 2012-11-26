/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.menu.action = function() {

};

org.goorm.core.menu.action.prototype = {
	init : function() {
		//////////////////////////////////////////////////
		//Main Menu : File
		//////////////////////////////////////////////////
		$("a[action=new_project]").unbind("click");
		$("a[action=new_project]").click(function() {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=all]").trigger("click"); 
		});

		$("a[action=new_file_goorm_project]").unbind("click");
		$("a[action=new_file_goorm_project]").click(function() {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=goormp]").trigger("click");
		});

		$("a[action=new_file_file]").unbind("click");
		$("a[action=new_file_file]").click(function() {
			core.dialog.new_file.show("");
		});

		$("a[action=new_file_folder]").unbind("click");
		$("a[action=new_file_folder]").click(function() {
			core.dialog.new_folder.show("");
		});

		$("a[action=new_file_textfile]").unbind("click");
		$("a[action=new_file_textfile]").click(function() {
			core.dialog.new_untitled_textfile.show("");
		});

		$("a[action=new_file_other]").unbind("click");
		$("a[action=new_file_other]").click(function() {
			core.dialog.new_other_file.show("");
		});

		$("a[action=open_project]").unbind("click");
		$("a[action=open_project]").click(function() {
			core.dialog.open_project.show();
		});

		$("a[action=open_file]").unbind("click");
		$("a[action=open_file]").click(function() {
			core.dialog.open_file.show();
		});

		$("a[action=exit]").unbind("click");
		$("a[action=exit]").click(function() {

			confirmation.init({
				title : "Do you want exit?",
				message : core.module.localization.msg['confirmation_exit'],
				yes_text : core.module.localization.msg['confirmation_yes'],
				no_text : core.module.localization.msg['confirmation_no'],
				yes : function() {
						localStorage['user'] = "";
						location.href = '/';
				},
				no : function() {

				}
			});

			confirmation.panel.show();
		});

		$("a[action=open_url]").unbind("click");
		$("a[action=open_url]").click(function() {
			core.dialog.open_url.show();
		});

		$("a[action=close_file]").unbind("click");
		$("a[action=close_file]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window]) {
				window_manager.window[window_manager.active_window].close();
			}
		});

		$("a[action=close_all]").unbind("click");
		$("a[action=close_all]").click(function() {
			core.module.layout.workspace.window_manager.close_all();
		});

		$("a[action=save_file]").unbind("click");
		$("a[action=save_file]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if (window_manager.active_window<0) {
				alert.show(core.module.localization.msg['alert_file_not_opened']);
			}
			else {
				if(window_manager.window[window_manager.active_window].designer != undefined) {
					window_manager.window[window_manager.active_window].designer.save();
				} else if(window_manager.window[window_manager.active_window].editor != undefined) {
					window_manager.window[window_manager.active_window].editor.save();
				}
			}
		});

		$("a[action=save_all_file]").unbind("click");
		$("a[action=save_all_file]").click(function() {
			core.module.layout.workspace.window_manager.save_all();
		});

		$("a[action=save_as_file]").unbind("click");
		$("a[action=save_as_file]").click(function() {
			core.dialog.save_as_file.show();
		});

		$("a[action=move_file]").unbind("click");
		$("a[action=move_file]").click(function() {
			core.dialog.move_file.show("");
		});

		$("a[action=rename_file]").unbind("click");
		$("a[action=rename_file]").click(function() {
			core.dialog.rename_file.show();
		});

		$("a[action=delete_file]").unbind("click");
		$("a[action=delete_file]").click(function() {
			if(core.status.selected_file) {
				confirmation.init({
					title : "Delete",
					// message : "<span localization_key='confirmation_delete_file'>Do you want to delete this file?</span>",
					// yes_text : "<span localization_key='yes'>Yes</span>",
					// no_text : "<span localization_key='no'>No</span>",
					message : core.module.localization.msg['confirmation_delete_file'],
					yes_text : core.module.localization.msg['confirmation_yes'],
					no_text : core.module.localization.msg['confirmation_no'],
					yes : function() {
						var postdata = {
							filename : core.status.selected_file
						};
						console.log(postdata);
						$.get("file/delete", postdata, function(data) {
							m.s("delete: " + core.status.selected_file);
							core.module.layout.project_explorer.refresh();
						});
					},
					no : function() {
						confirmation.panel.hide();
					}
				});
	
				confirmation.panel.show();
			}

		});

		$("a[action=refresh_project_directory]").unbind("click");
		$("a[action=refresh_project_directory]").click(function() {
			core.module.layout.project_explorer.refresh();
		});

		$("a[action=print]").unbind("click");
		$("a[action=print]").click(function() {

			core.dialog.print.show();

			//window.open("./module/org.goorm.core.printer/print.html", "", "width=500, height=300, scrollbars=yes");
		});

		$("a[action=switch_workspace]").unbind("click");
		$("a[action=switch_workspace]").click(function() {
			core.dialog.switch_workspace.show();
		});

		$("a[action=import_file]").unbind("click");
		$("a[action=import_file]").click(function() {
			core.dialog.import_file.show();
		});

		$("a[action=export_file]").unbind("click");
		$("a[action=export_file]").click(function() {
			core.dialog.export_file.show();
		});

		$("a[action=property]").unbind("click");
		$("a[action=property]").click(function() {
			core.dialog.property.show();
		});
		//////////////////////////////////////////////////
		//Main Menu : Edit
		//////////////////////////////////////////////////
		$("a[action=do_undo]").unbind("click");
		$("a[action=do_undo]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.undo();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.undo();
			}
		});

		$("a[action=do_redo]").unbind("click");
		$("a[action=do_redo]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.redo();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.redo();
			}
		});

		$("a[action=do_cut]").unbind("click");
		$("a[action=do_cut]").click(function() {
			//core.dialog.preference.preference['preference.editor.use_clipboard'];
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.cut();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.cut();
			}
		});

		$("a[action=do_copy]").unbind("click");
		$("a[action=do_copy]").click(function() {

			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.copy();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.copy();
			}
		});

		$("a[action=do_paste]").unbind("click");
		$("a[action=do_paste]").click(function() {

			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.paste();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.paste();
			}
		});

		$("a[action=do_delete]").unbind("click");
		$("a[action=do_delete]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas._delete();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.do_delete();
			}
		});

		$("a[action=preference]").unbind("click");
		$("a[action=preference]").click(function() {
			core.dialog.preference.show();
		});

		$("a[action=do_find]").unbind("click");
		$("a[action=do_find]").click(function() {
			core.dialog.find_and_replace.show();
		});

		$("a[action=do_find_next]").unbind("click");
		$("a[action=do_find_next]").click(function() {

			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.do_delete();
			} else if(window_manager.window[window_manager.active_window].editor) {
				core.dialog.find_and_replace.find("next");
			}
		});

		$("a[action=do_find_previous]").unbind("click");
		$("a[action=do_find_previous]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				//window_manager.window[window_manager.active_window].designer.canvas.do_delete();
			} else if(window_manager.window[window_manager.active_window].editor) {
				core.dialog.find_and_replace.find("previous");
			}
		});
		
		$("a[action=auto_formatting]").unbind("click");
		$("a[action=auto_formatting]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				//window_manager.window[window_manager.active_window].designer.canvas.do_delete();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.auto_formatting();
			}
		});
		
		$("a[action=comment_selected]").unbind("click");
		$("a[action=comment_selected]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				//window_manager.window[window_manager.active_window].designer.canvas.do_delete();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.comment_selection();
			}
		});
		
		$("a[action=uncomment_selected]").unbind("click");
		$("a[action=uncomment_selected]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				//window_manager.window[window_manager.active_window].designer.canvas.do_delete();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.uncomment_selection();
			}
		});

		$("a[action=select_all]").unbind("click");
		$("a[action=select_all]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;

			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.select_all();
			} else if(window_manager.window[window_manager.active_window].editor) {
				window_manager.window[window_manager.active_window].editor.select_all();
			}
		});
		
		$("a[action=use_clipboard]").unbind("click");
		$("a[action=use_clipboard]").click(function() {
			
			if(core.preference['preference.editor.use_clipboard'] == "true") {
				$(this).find("img").removeClass("toolbar_buttonPressed");
				core.preference['preference.editor.use_clipboard'] = "false";
				localStorage['preference.editor.use_clipboard'] = "false";
			} else {
				$(this).find("img").addClass("toolbar_buttonPressed");
				core.preference['preference.editor.use_clipboard'] = "true";
				localStorage['preference.editor.use_clipboard'] = "true";
			}

		});
		
		$("a[action=search]").unbind("click");
		$("a[action=search]").click(function() {
			core.dialog.search.show();
		});
		//////////////////////////////////////////////////
		//Main Menu : Design
		//////////////////////////////////////////////////
		$("a[action=align_left]").unbind("click");
		$("a[action=align_left]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.align_left();
				}
			}
		});

		$("a[action=align_right]").unbind("click");
		$("a[action=align_right]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.align_right();
				}
			}
		});

		$("a[action=align_top]").unbind("click");
		$("a[action=align_top]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.align_top();
				}
			}
		});

		$("a[action=align_bottom]").unbind("click");
		$("a[action=align_bottom]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.align_bottom();
				}
			}
		});

		$("a[action=align_horizontally_center]").unbind("click");
		$("a[action=align_horizontally_center]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.align_horizontally_center();
				}
			}
		});

		$("a[action=align_vertically_center]").unbind("click");
		$("a[action=align_vertically_center]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.align_vertically_center();
				}
			}
		});

		$("a[action=bring_to_front]").unbind("click");
		$("a[action=bring_to_front]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.bring_to_front();
				}
			}
		});

		$("a[action=send_to_back]").unbind("click");
		$("a[action=send_to_back]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.send_to_back();
				}
			}
		});

		$("a[action=bring_forward]").unbind("click");
		$("a[action=bring_forward]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.bring_forward();
				}
			}
		});

		$("a[action=send_backward]").unbind("click");
		$("a[action=send_backward]").click(function() {
			if(!$(this).hasClass('disabled')) {
				if(core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer) {
					core.module.layout.workspace.window_manager.window[core.module.layout.workspace.window_manager.active_window].designer.canvas.send_backward();
				}
			}
		});

		$("a[action=canvas_setting]").unbind("click");
		$("a[action=canvas_setting]").click(function() {
			var window_manager = core.module.layout.workspace.window_manager;
			if(window_manager.window[window_manager.active_window].designer) {
				window_manager.window[window_manager.active_window].designer.canvas.dialog.panel.show();
			}
		});
		//////////////////////////////////////////////////
		//Main Menu : Project
		//////////////////////////////////////////////////
		$("a[action=run]").unbind("click");
		$("a[action=run]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(1);
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].run(core.status.current_project_path);
			}
		});

		$("a[action=remote_run]").unbind("click");
		$("a[action=remote_run]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {
				// Android
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].remote_run(core.status.current_project_path);
			}
		});

		$("a[action=generate]").unbind("click");
		$("a[action=generate]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {

				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].generate();
			}
		});

		$("a[action=generate_all]").unbind("click");
		$("a[action=generate_all]").click(function() {

		});

		$("a[action=build_project]").unbind("click");
		$("a[action=build_project]").click(function() {
			if(!$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(1);
				core.dialog.build_project.show();
			}
			// if(core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type]!=undefined) {
			//
			// // C, Web
			//
			// core.module.plugin_manager.plugins["org.goorm.plugin."+core.status.current_project_type].build(core.status.current_project_path);
			// }
		});

		$("a[action=build_all]").unbind("click");
		$("a[action=build_all]").click(function() {
			if(!$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(1);
				core.dialog.build_all.show();
			}
		});

		$("a[action=build_clean]").unbind("click");
		$("a[action=build_clean]").click(function() {
			if(!$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(1);
				core.dialog.build_clean.show();
			}
		});

		$("a[action=build_configuration]").unbind("click");
		$("a[action=build_configuration]").click(function() {
			core.dialog.build_configuration.show();
		});

		$("a[action=import_project]").unbind("click");
		$("a[action=import_project]").click(function() {
			core.dialog.import_project.show();
		});

		$("a[action=export_project]").unbind("click");
		$("a[action=export_project]").click(function() {
			core.dialog.export_project.show();
		});

		$("a[action=delete_project]").unbind("click");
		$("a[action=delete_project]").click(function() {
			core.dialog.delete_project.show();
		});

		$("a[action=show_properties]").unbind("click");
		$("a[action=show_properties]").click(function() {
			core.dialog.project_property.show();
		});
		
		//////////////////////////////////////////////////
		//Main Menu : Debug
		//////////////////////////////////////////////////
		$("a[action=debug]").unbind("click");
		$("a[action=debug]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug(core.status.current_project_path);
			}
		});
		
		$("a[action=debug_continue]").unbind("click");
		$("a[action=debug_continue]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
						mode : "continue",
						project_path : core.status.current_project_path
				}
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			}
		});
		
		$("a[action=debug_terminate]").unbind("click");
		$("a[action=debug_terminate]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
						mode : "terminate",
						project_path : core.status.current_project_path
				}
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			}
		});
		
		$("a[action=debug_step_over]").unbind("click");
		$("a[action=debug_step_over]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
						mode : "step_over",
						project_path : core.status.current_project_path
				}
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			}
		});
		
		$("a[action=debug_step_in]").unbind("click");
		$("a[action=debug_step_in]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
						mode : "step_in",
						project_path : core.status.current_project_path
				}
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			}
		});
		
		$("a[action=debug_step_out]").unbind("click");
		$("a[action=debug_step_out]").click(function() {
			if(core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type] != undefined
			&& !$(this).hasClass('yuimenuitemlabel-disabled')) {
				core.module.layout.inner_bottom_tabview.selectTab(0);
				var cmd = {
						mode : "step_out",
						project_path : core.status.current_project_path
				}
				core.module.plugin_manager.plugins["org.goorm.plugin." + core.status.current_project_type].debug_cmd(cmd);
			}
		});
		
		//////////////////////////////////////////////////
		//Main Menu : Collaboration
		//////////////////////////////////////////////////
		$("a[action=join_project]").unbind("click");
		$("a[action=join_project]").click(function() {
			core.dialog.join_project.show();
		});

		$("a[action=collaboration_settings]").unbind("click");
		$("a[action=collaboration_settings]").click(function() {
			core.dialog.collaboration_settings.show();
		});

		$("a[action=chat_on_off]").unbind("click");
		$("a[action=chat_on_off]").click(function() {
			
			if(core.chat_on==true) {
				
				core.chat_on = false;
				core.module.layout.communication.set_chat_off();
				$(".is_chat_on").html("Chat Off");
				$("a[action=chat_on_off]").find("img").removeClass("toolbar_buttonPressed");

				$("a[action=chat_on_off]").each(function(i) {
					if($(this).attr("status") == "enable") {
						$(this).parent().hide();
					} else if($(this).attr("status") == "disable") {
						$(this).parent().show();
					}
				});
			} else {
				
				core.chat_on = true;
				//core.module.layout.chat.init();
				core.module.layout.communication.set_chat_on();
				$(".is_chat_on").html("Chat On");
				$("a[action=chat_on_off]").find("img").addClass("toolbar_buttonPressed");

				$("a[action=chat_on_off]").each(function(i) {
					if($(this).attr("status") == "enable") {
						$(this).parent().show();
					} else if($(this).attr("status") == "disable") {
						$(this).parent().hide();
					}
				});

				core.module.layout.inner_right_tabview.selectTab(2);
			}

		});

		$("a[action=collaboration_edit_on_off]").unbind("click");
		$("a[action=collaboration_edit_on_off]").click(function() {
			
			if(core.flag.collaboration_on) {
				core.flag.collaboration_on = false;
				$(".is_collaboration_on").html("Collaboration Off");

				$("a[action=collaboration_edit_on_off]").find("img").removeClass("toolbar_buttonPressed");

				$("a[action=collaboration_edit_on_off]").each(function(i) {
					if($(this).attr("status") == "enable") {
						$(this).parent().hide();
					} else if($(this).attr("status") == "disable") {
						$(this).parent().show();
					}
				});
				for(var i = 0; i < core.module.layout.workspace.window_manager.index; i++) {
					if(core.module.layout.workspace.window_manager.window[i].alive) {
						var editor = core.module.layout.workspace.window_manager.window[i].editor;
						if(editor != null) {
							editor.collaboration.set_edit_off();
						}
					}
				}
			} else {
				core.flag.collaboration_on = true;
				$(".is_collaboration_on").html("Collaboration On");

				$("a[action=collaboration_edit_on_off]").find("img").addClass("toolbar_buttonPressed");

				$("a[action=collaboration_edit_on_off]").each(function(i) {
					if($(this).attr("status") == "enable") {
						$(this).parent().show();
					} else if($(this).attr("status") == "disable") {
						$(this).parent().hide();
					}
				});
				for(var i = 0; i < core.module.layout.workspace.window_manager.index; i++) {
					if(core.module.layout.workspace.window_manager.window[i].alive) {
						var editor = core.module.layout.workspace.window_manager.window[i].editor;
						if(editor != null) {
							editor.load(editor.filepath, editor.filename, editor.filetype);
						}
					}
				}
			}
		});

		$("a[action=collaboration_draw_on_off]").unbind("click");
		$("a[action=collaboration_draw_on_off]").click(function() {
			if(core.collaboration_draw_on) {
				core.collaboration_draw_on = false;
				$("a[action=collaboration_draw_on_off]").find("img").removeClass("toolbar_buttonPressed");

				$("a[action=collaboration_draw_on_off]").each(function(i) {
					if($(this).attr("status") == "enable") {
						$(this).parent().hide();
					} else if($(this).attr("status") == "disable") {
						$(this).parent().show();
					}
				});
				for(var i = 0; i < core.module.layout.workspace.window_manager.index; i++) {
					if(core.module.layout.workspace.window_manager.window[i].alive) {
						var designer = core.module.layout.workspace.window_manager.window[i].designer;
						if(designer != null) {
							designer.canvas.set_collaboration_off();
						}
					}
				}
			} else {
				core.collaboration_draw_on = true;
				$("a[action=collaboration_draw_on_off]").find("img").addClass("toolbar_buttonPressed");

				$("a[action=collaboration_draw_on_off]").each(function(i) {
					if($(this).attr("status") == "enable") {
						$(this).parent().show();
					} else if($(this).attr("status") == "disable") {
						$(this).parent().hide();
					}
				});
				for(var i = 0; i < core.module.layout.workspace.window_manager.index; i++) {
					if(core.module.layout.workspace.window_manager.window[i].alive) {
						var designer = core.module.layout.workspace.window_manager.window[i].designer;
						if(designer != null) {
							designer.load(designer.filepath, designer.filename, designer.filetype);
						}
					}
				}

			}
		});

		$("a[action=collaborationSettings]").unbind("click");
		$("a[action=collaborationSettings]").click(function() {
			core.dialog.collaboration_settings.show();
		});
		//////////////////////////////////////////////////
		//Main Menu : window
		//////////////////////////////////////////////////
		$("a[action=new_main_window]").unbind("click");
		$("a[action=new_main_window]").click(function() {
			core.new_main_window();
		});

		var terminal_count = 0;
		$("a[action=new_terminal_window]").unbind("click");
		$("a[action=new_terminal_window]").click(function() {
			terminal_count++;
			core.module.layout.workspace.window_manager.open("/", "terminal" + terminal_count, "terminal", "Terminal");
		});

		$("a[action=previous_window]").unbind("click");
		$("a[action=previous_window]").click(function() {
			core.module.layout.workspace.window_manager.previous_window();
		});

		$("a[action=next_window]").unbind("click");
		$("a[action=next_window]").click(function() {
			core.module.layout.workspace.window_manager.next_window();
		});

		$("a[action=left_layout_toggle]").unbind("click");
		$("a[action=left_layout_toggle]").click(function() {
			if(core.module.layout.layout.getUnitByPosition("left")._collapsed) {
				core.module.layout.layout.getUnitByPosition("left").expand();
			} else {
				core.module.layout.layout.getUnitByPosition("left").collapse();
			}
		});

		$("a[action=left_project_explorer_show]").unbind("click");
		$("a[action=left_project_explorer_show]").click(function() {
			if(core.module.layout.layout.getUnitByPosition("left")._collapsed) {
				core.module.layout.layout.getUnitByPosition("left").expand();
			}
			core.module.layout.left_tabview.selectTab(0);
		});


		$("a[action=left_tool_box_show]").unbind("click");
		$("a[action=left_tool_box_show]").click(function() {
			core.module.layout.left_tabview.selectTab(1);
		});

		$("a[action=right_layout_toggle]").unbind("click");
		$("a[action=right_layout_toggle]").click(function() {
			if(core.module.layout.inner_layout.getUnitByPosition("right")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("right").expand();
			} else {
				core.module.layout.inner_layout.getUnitByPosition("right").collapse();
			}
		});

		$("a[action=right_communication_show]").unbind("click");
		$("a[action=right_communication_show]").click(function() {
			if(core.module.layout.inner_layout.getUnitByPosition("right")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("right").expand();
			}
			core.module.layout.inner_right_tabview.selectTab(0);
		});

		$("a[action=right_slide_show]").unbind("click");
		$("a[action=right_slide_show]").click(function() {
			if(core.module.layout.inner_layout.getUnitByPosition("right")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("right").expand();
			}
			core.module.layout.inner_right_tabview.selectTab(1);
		});

		$("a[action=right_chat_show]").unbind("click");
		$("a[action=right_chat_show]").click(function() {
			core.module.layout.inner_right_tabview.selectTab(2);
		});

		$("a[action=bottom_layout_toggle]").unbind("click");
		$("a[action=bottom_layout_toggle]").click(function() {
			if(core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			} else {
				core.module.layout.inner_layout.getUnitByPosition("bottom").collapse();
			}
		});

//		$("a[action=bottom_message_show]").unbind("click");
//		$("a[action=bottom_message_show]").click(function() {
//			core.module.layout.inner_bottom_tabview.selectTab(0);
//		});

		$("a[action=bottom_debug_show]").unbind("click");
		$("a[action=bottom_debug_show]").click(function() {
			if(core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			}
			core.module.layout.inner_bottom_tabview.selectTab(0);
		});

		$("a[action=bottom_console_show]").unbind("click");
		$("a[action=bottom_console_show]").click(function() {
			if(core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			}
			core.module.layout.inner_bottom_tabview.selectTab(1);
		});

		$("a[action=bottom_search_show]").unbind("click");
		$("a[action=bottom_search_show]").click(function() {
			if(core.module.layout.inner_layout.getUnitByPosition("bottom")._collapsed) {
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			}
			core.module.layout.inner_bottom_tabview.selectTab(2);
		});

		$("a[action=toggle_full_workspace]").unbind("click");
		$("a[action=toggle_full_workspace]").click(function() {
			if(core.module.layout.layout.getUnitByPosition("left")._collapsed) {
				core.module.layout.layout.getUnitByPosition("left").expand();
				core.module.layout.inner_layout.getUnitByPosition("right").expand();
				core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
			} else {
				core.module.layout.layout.getUnitByPosition("left").collapse();
				core.module.layout.inner_layout.getUnitByPosition("right").collapse();
				core.module.layout.inner_layout.getUnitByPosition("bottom").collapse();
			}
		});

		$("a[action=hide_all_windows]").unbind("click");
		$("a[action=hide_all_windows]").click(function() {
			core.module.layout.workspace.window_manager.hide_all_windows();
		});

		$("a[action=show_all_windows]").unbind("click");
		$("a[action=show_all_windows]").click(function() {
			core.module.layout.workspace.window_manager.show_all_windows();
		});

		$("a[action=cascade]").unbind("click");
		$("a[action=cascade]").click(function() {
			core.module.layout.workspace.window_manager.cascade();
		});

		$("a[action=tile_vertically]").unbind("click");
		$("a[action=tile_vertically]").click(function() {
			core.module.layout.workspace.window_manager.tile_vertically();
		});

		$("a[action=tile_horizontally]").unbind("click");
		$("a[action=tile_horizontally]").click(function() {
			core.module.layout.workspace.window_manager.tile_horizontally();
		});
		//////////////////////////////////////////////////
		//Main Menu : Help
		//////////////////////////////////////////////////
		$("a[action=help_contents]").unbind("click");
		$("a[action=help_contents]").click(function() {
			core.dialog.help_contents.show();
		});

		$("a[action=helpSearch]").unbind("click");
		$("a[action=helpSearch]").click(function() {
			core.dialog.help_search.show();
		});

		$("a[action=helpTipsAndTricks]").unbind("click");
		$("a[action=helpTipsAndTricks]").click(function() {
			core.dialog.help_tips_and_tricks.show();
		});

		$("a[action=help_check_for_updates]").unbind("click");
		$("a[action=help_check_for_updates]").click(function() {
			core.dialog.help_check_for_updates.show();
		});

		$("a[action=help_install_new_plugin]").unbind("click");
		$("a[action=help_install_new_plugin]").click(function() {
			core.dialog.help_install_new_plugin.show();
		});

		$("a[action=help_about]").unbind("click");
		$("a[action=help_about]").click(function() {
			core.dialog.help_about.show();
		});

		$("a[action=help_bug_report]").unbind("click");
		$("a[action=help_bug_report]").click(function() {
			core.dialog.help_bug_report.show();
		});
		//////////////////////////////////////////////////
		//Context Menu : File
		//////////////////////////////////////////////////
		$("a[action=new_file_file_context]").unbind("click");
		$("a[action=new_file_file_context]").click(function() {
			core.dialog.new_file.show("context");
		});

		$("a[action=open_context]").unbind("click");
		$("a[action=open_context]").click(function() {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if(filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			
			var filepath = core.status.selected_file.replace(filename, "");

			if(filetype)
				core.module.layout.workspace.window_manager.open(filepath, filename, filetype);
		});

		$("a[action=open_default_editor]").unbind("click");
		$("a[action=open_default_editor]").click(function() {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if(filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			if(filetype)
				core.module.layout.workspace.window_manager.open(filepath, filename, filetype);
		});

		$("a[action=open_text_editor]").unbind("click");
		$("a[action=open_text_editor]").click(function() {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if(filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			if(filetype)
				core.module.layout.workspace.window_manager.open(filepath, filename, filetype, "Editor");
		});

		$("a[action=open_code_editor]").unbind("click");
		$("a[action=open_code_editor]").click(function() {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if(filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			if(filetype)
				core.module.layout.workspace.window_manager.open(filepath, filename, filetype, "Editor");
		});

		$("a[action=open_vim_editor]").unbind("click");
		$("a[action=open_vim_editor]").click(function() {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if(filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			if(filetype) {
				var editor = core.module.layout.workspace.window_manager.open(filepath, filename, filetype, "Editor").editor;
				editor.set_option({"vim_mode":true});
			}
		});
		
		$("a[action=open_ui_designer]").unbind("click");
		$("a[action=open_ui_designer]").click(function() {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if(filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			if(filetype)
				core.module.layout.workspace.window_manager.open(filepath, filename, filetype, "Designer");
		});

		$("a[action=open_uml_designer]").unbind("click");
		$("a[action=open_uml_designer]").click(function() {
			var filename = (core.status.selected_file.split("/")).pop();
			var filetype = null;
			if(filename.indexOf(".") != -1)
				filetype = (filename.split(".")).pop();
			var filepath = core.status.selected_file.replace(filename, "");

			if(filetype)
				core.module.layout.workspace.window_manager.open(filepath, filename, filetype, "Designer");
		});

		$("a[action=move_context]").unbind("click");
		$("a[action=move_context]").click(function() {
			core.dialog.move_file.show("context");
		});

		$("a[action=rename_context]").unbind("click");
		$("a[action=rename_context]").click(function() {
			core.dialog.rename_file.show("context");
		});

		$("a[action=delete_context]").unbind("click");
		$("a[action=delete_context]").click(function() {
			confirmation.init({
				title : "Delete",
				message : core.module.localization.msg['confirmation_delete_file'],
				yes_text : core.module.localization.msg['confirmation_yes'],
				no_text : core.module.localization.msg['confirmation_no'],
				yes : function() {
					var postdata = {
						filename : core.status.selected_file
					};
					$.get("file/delete", postdata, function(data) {
						console.log(data);
						m.s("delete: " + core.status.selected_file);
						core.module.layout.project_explorer.refresh();
					});
				},
				no : function() {
					confirmation.panel.hide();
				}
			});

			confirmation.panel.show();
		});
		//////////////////////////////////////////////////
		//Context Menu : Folder
		//////////////////////////////////////////////////
		$("a[action=new_file_folder_context]").unbind("click");
		$("a[action=new_file_folder_context]").click(function(e) {
			core.dialog.new_folder.show("context");
		});

		$("a[action=new_file_textfile_context]").unbind("click");
		$("a[action=new_file_textfile_context]").click(function(e) {
			core.dialog.new_untitled_textfile.show("context");
		});

		$("a[action=folder_open_context]").unbind("click");
		$("a[action=folder_open_context]").click(function(e) {
			var target = $("#project_treeview").find(".ygtvfocus")[0];

			core.module.layout.project_explorer.treeview.getNodeByElement(target).expand();
		});
		
		//////////////////////////////////////////////////
		//Context Menu : SCM
		//////////////////////////////////////////////////
		$("a[action=scm_checkout]").unbind("click");
		$("a[action=scm_checkout]").click(function(e) {
			core.module.layout.inner_bottom_tabview.selectTab(1);
			core.module.scm.checkout();
		});

		$("a[action=scm_commit]").unbind("click");
		$("a[action=scm_commit]").click(function(e) {
			core.module.layout.inner_bottom_tabview.selectTab(1);
			core.module.scm.commit() && core.module.scm.commit().show();
		});

		$("a[action=scm_update]").unbind("click");
		$("a[action=scm_update]").click(function(e) {
			core.module.layout.inner_bottom_tabview.selectTab(1);
			core.module.scm.update();
		});
		
		$("a[action=scm_revert]").unbind("click");
		$("a[action=scm_revert]").click(function(e) {
			core.module.layout.inner_bottom_tabview.selectTab(1);
			core.module.scm.revert();
		});
		//////////////////////////////////////////////////
		//Plugin Menu Action
		//////////////////////////////////////////////////

		/*
		for(var i = 0; i < core.module.plugin_manager.list.length; i++) {
			
			var plugin_name = core.module.plugin_manager.list[i].name;

			// if(core.module.plugin_manager.plugins[plugin_name] != undefined) {
				if(core.module.plugin_manager.plugins[plugin_name].add_menu_action()){
					core.module.plugin_manager.plugins[plugin_name].add_menu_action();
				}
			// }
			// if(core.module.plugin_manager.plugins[core.module.plugin_manager.list[i].plugin_name].add_menu_action())
				// core.module.plugin_manager.plugins[core.module.plugin_manager.list[i].plugin_name].add_menu_action();
		}
		*/
		
		/////////////////////////////////////////////////
		// User
		/////////////////////////////////////////////////
		$("a[action=account_manage]").unbind("click");
		$("a[action=account_manage]").click(function(e) {
			core.dialog.user_manager.show();
		});
		
		$("a[action=account_profile]").unbind("click");
		$("a[action=account_profile]").click(function(e) {
			core.module.auth.profile_panel_show();
		});

		$("a[action=account_logout]").unbind("click");
		$("a[action=account_logout]").click(function(e) {
			if(confirm(core.module.localization.msg["alert_confirm_logout"])){
				$.post('/auth/logout', function(result){
					if(result) location.href = '/';
				})
			}
		});
	}
}