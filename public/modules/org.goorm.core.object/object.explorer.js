/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.object.explorer = function () {
	this.target = null;
	this.treeview_object = null;
};

org.goorm.core.object.explorer.prototype = {
	init: function (target, objects) {
		
		var self = this;
		
		this.target = target;
		
		self.treeview_object = new YAHOO.widget.TreeView(this.target, objects);

		/*
		self.treeview_project.subscribe("dblClickEvent", function(nodedata) {	
			if(nodedata.node.data.cls == "file") {
				var filename = nodedata.node.data.filename;
				var filetype = nodedata.node.data.filetype;
				var filepath = nodedata.node.data.parentLabel;
					
				self.window_manager.open(filepath, filename, filetype);
			}
		});
		*/
		
		
		self.treeview_project.render();
		
	}
};