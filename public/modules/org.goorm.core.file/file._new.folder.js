/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.file._new.folder = function () {
	this.dialog = null;
	this.buttons = null;
	this.dialog_explorer = null;
};

org.goorm.core.file._new.folder.prototype = {
	init: function () { 
		var self = this;
		
		var handle_ok = function() {
		
			var data = self.dialog_explorer.get_data();

			if(data.path=="" || data.name=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);
				// alert.show("Folder name is empty. Please fill it...");
				return false;
			}
			else {
				var postdata = {
					current_path: data.path,
					folder_name: data.name
				};

				$.get("file/new_folder", postdata, function (data) {
					if (data.err_code==0) {
						core.module.layout.project_explorer.refresh();
					}
					else {
						alert.show(data.message);
					}
				});
			}
			
			this.hide();
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 

		this.dialog = new org.goorm.core.file._new.folder.dialog();
		this.dialog.init({
			localization_key:"title_new_folder",
			title:"New folder", 
			path:"configs/dialogs/org.goorm.core.file/file._new.folder.html",
			width:400,
			height:500,
			modal:true,
			buttons:this.buttons, 
			success: function () {

			}
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_explorer = new org.goorm.core.dialog.explorer();
		
		//this.dialog.panel.setBody("AA");
	},
	
	show: function (context) {
		var self = this;

		self.dialog_explorer.init("#folder_new", true);
		
		this.dialog.panel.show();
	},
	
	expand: function(tree_div, src){
		var self = this;
		var nodes = src.split('/');
		
		var target_parent = "";
		var target_name = "";

		function get_node_by_path(node){
			if(node.data.parent_label == target_parent && node.data.name == target_name) return true;
			else return false;
		}
		
		for(var i=0; i<nodes.length; i++){
			target_name = nodes[i];
			
			var target_node = self.dialog_explorer.treeview.getNodesBy(get_node_by_path);
			if(target_node){
				target_node = target_node.pop();
				target_node.expand();
			}
			
			target_parent	+=	nodes[i] + '/'
		}	}
};