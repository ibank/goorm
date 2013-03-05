/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.scm = {
	scm: null,
	dialogs: null,

	init: function(){
		this.dialogs = {};
		this.scm = {
			"git":{
				"add": function(repository, filepath){
					var git_dir = "--git-dir="+repository+"/.git --work-tree="+repository;
					return "git "+git_dir+" add "+filepath;
				},
				"rm": function(repository, filepath){
					var git_dir = "--git-dir="+repository+"/.git --work-tree="+repository;
					return "git "+git_dir+" rm "+filepath;
				},
				"checkout": function(URL, repository){
					return "git clone "+URL+" "+repository;
				},
				"commit": function(repository, message){
					var git_dir = "--git-dir="+repository+"/.git --work-tree="+repository;
					return "git "+git_dir+" commit -m '"+message+"'";
				},
				"update": function(repository, filepath){
					var git_dir = "--git-dir="+repository+"/.git --work-tree="+repository;
					return "git "+git_dir+" fetch "+filepath;
				},
				"revert": function(repository, filepath){
					var git_dir = "--git-dir="+repository+"/.git --work-tree="+repository;
					return "git "+git_dir+" reset;git "+git_dir+" clean -e project.json -fd "+filepath+";git "+git_dir+" checkout "+filepath;
				},
				"push": function(repository){
					var git_dir = "--git-dir="+repository+"/.git --work-tree="+repository;
					return "git "+git_dir+" push";
				}
			},
			"svn":{
				"add": function(repository, filepath){
					return "svn add "+filepath;
				},
				"rm": function(repository, filepath){
					return "svn rm "+filepath;
				},
				"checkout": function(URL, repository){
					var id = $("#scm_user").val();
					id = "--username "+id;
					return "svn co "+URL+" "+repository;
				},
				"commit": function(repository, message){
					return "svn commit "+repository+" -m '"+message+"'";
				},
				"update": function(repository, filepath){
					return "svn update "+filepath;
				},
				"revert": function(repository, filepath){
					return "svn revert "+filepath+" -R";
				},
				"push": function(){
					return "";
				}
			}
		}
		
		this._init_dialogs();
		
		// scm authentication 정보가 project.json에 저장되면 앙댐
		$(core).on("on_property_confirmed", function(){
			core.preference.workspace || (core.preference.workspace = {})
			var workspace = core.preference.workspace;
			var project = core.status.current_project_path;
			workspace[project] || (workspace[project] = {})
			workspace[project].scm || (workspace[project].scm = {})
			
			workspace[project].scm.user = $("#scm_user").val();
			workspace[project].scm.password = $("#scm_password").val();
			core.module.preference.save();
		});
		
		// 
		
		// property setting
		$(core).on("on_project_open", function(){
			core.preference.workspace || (core.preference.workspace = {})
			var workspace = core.preference.workspace;
			var project = core.status.current_project_path;
			workspace[project] || (workspace[project] = {})
			workspace[project].scm || (workspace[project].scm = {})

			$("#scm_user").val(workspace[project].scm.user);
			$("#scm_password").val(workspace[project].scm.password);
		})
		
	},
	checkout: function(){
		var terminal = core.module.layout.terminal;
		var scm = this._check_type(core.property['scm_type']);
		if(!scm) return ;
		
		var repository_name = core.property['scm_path'];
		var repository = core.preference.workspace_path+core.status.current_project_path+"/"+repository_name;
		var URL = core.property['scm_URL'];
		var cmd = scm.checkout(URL, repository);
		terminal.send_command(cmd, null, function(){
			core.module.layout.project_explorer.refresh();
			core.dialog.project_property.save();
		});
	},
	commit: function(){
		var self = this;
		var scm = this._check_type(core.property['scm_type']);
		if(!scm) return ;
		
		// set variables
		var repository_name = core.property['scm_path'];
		var repository = core.preference.workspace_path+core.status.current_project_path+"/"+repository_name;
		
		return {
			show: function(){
				var file = core.status.selected_file;
				if(!file) return ;
				var path = core.preference.workspace_path+file;
				
				var req = {
					"scm":	core.property['scm_type'],
					"mode": "status",
					"repository": repository,
					"path": path
				};
				
				// clear dialog
				$("#scm_commit_comment").val('');
				$("#scm_commit_files").html('<table style="width:100%"><tr><th width=20>&nbsp;</th><th width="10%"><b>status</b></th><th><b>path</b></th>');
				$("#scm_commit_files table th").css('border-bottom', "1px solid #999").css('padding','3px');
				
				// get status to select commit list
				$.getJSON("/scm", req, function (data) {
//					console.log(data);
					data = JSON.parse(data);
					var files = data.files;
					for(var name in files){
						var type = (files[name].type && files[name].type != "?")? files[name].type : "A";
						$("#scm_commit_files table").append("<tr><td><input type='checkbox' name='"+name+"' scm_type='"+type+"' checked='checked'></td><td align=center>"+type+"</td><td>"+name+"</td>");
					}
					$("#scm_commit_files table td").css('padding','3px');
					
					self.dialogs["commit"].panel.show();
				});
			},
			handle_ok: function(){
				var terminal = core.module.layout.terminal;
				var is_commit = false;
				$("#scm_commit_files input[type=checkbox]:checked").each(function(){
					var path = repository+"/"+$(this).attr("name");
					var cmd = null;
					if($(this).attr("scm_type") == "D") {
						cmd = scm.rm(repository, path);
					}
					else {
						cmd = scm.add(repository, path);
					}
					terminal.send_command(cmd);
					
					is_commit = true;
				});
				
				if(is_commit){
					var message = $("#scm_commit_comment").val();
					var cmd = scm.commit(repository, message);
					terminal.send_command(cmd);
				}
				
				var cmd = scm.push(repository);
				if(cmd != ""){
					terminal.send_command(cmd);
				}
				
//				var userid = core.property["scm_user"];
//				terminal.send_command(userid, /Username.*:/g);
//				
//				var userpass = core.property["scm_password"];
//				terminal.send_command(userpass, /Password.*:/g);
			}
		}
	},
	update: function(){
		var terminal = core.module.layout.terminal;
		var scm = this._check_type(core.property['scm_type']);
		var file = core.status.selected_file;
		if(!scm || !file) return ;
		
		var repository_name = core.property['scm_path'];
		var repository = core.preference.workspace_path+core.status.current_project_path+"/"+repository_name;
		var path = core.preference.workspace_path+file;
		
		var cmd = scm.update(repository, path);
		terminal.send_command(cmd, null, function(){
			core.module.layout.project_explorer.refresh();
		});
	},
	revert: function(){
		var terminal = core.module.layout.terminal;
		var scm = this._check_type(core.property['scm_type']);
		var file = core.status.selected_file;
		if(!scm || !file) return ;
		
		var repository_name = core.property['scm_path'];
		var repository = core.preference.workspace_path+core.status.current_project_path+"/"+repository_name;
		var path = core.preference.workspace_path+file;
		
		var cmd = scm.revert(repository, path);
		terminal.send_command(cmd, null, function(){
			core.module.layout.project_explorer.refresh();
		});
	},
	_check_type: function(type) {
		if(this.scm[type]) {
			return this.scm[type];
		}
		else { 
			alert.show("There isn't repository for Git/SVN");
			return null;
		}
	},
	_init_dialogs: function(){
		var self=this;
		
		/*
		 * commit dialog
		 */
		var handle_ok = function() {
			self.commit().handle_ok();
			this.hide(); 
		};
		var handle_cancel = function() { 
			this.hide(); 
		};
		var buttons = [ {text:"<span localization_key='ok'>OK</span>",  handler:handle_ok},
		                 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
		var dialog = new org.goorm.core.dialog();
		dialog.init({
			localization_key:"title_commit",
			title:"Commit", 
			path:"configs/dialogs/org.goorm.core.scm/scm.commit.html",
			width:500,
			height:400,
			modal:true,
			yes_text: "<span localization_key='ok'>OK</span>",
			no_text: "<span localization_key='close'>Close</span>",
			buttons: buttons,
			success: function () {
				$("#scm_commit_selectall").click(function(){
					$("#scm_commit_files input[type=checkbox]").attr('checked',true);
				});
				$("#scm_commit_deselectall").click(function(){
					$("#scm_commit_files input[type=checkbox]").attr('checked',false);
				});
			}			
		});
		this.dialogs["commit"] = dialog;
	}
};