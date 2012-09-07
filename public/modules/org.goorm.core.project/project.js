/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.project = function () {
	this.treeview = null;
};

org.goorm.core.project.prototype = {
	make_treeview: function(target) {
		
		this.treeview = new YAHOO.widget.TreeView(target, this.get_directories_and_files("type", "url"));
	
				//projectProperties.files = sorting_data;
				
				/*
				self.treeview.subscribe("dblClickEvent", function(nodedata) {	
					if(nodedata.node.data.cls == "file") {
						var filename = nodedata.node.data.filename;
						var filetype = nodedata.node.data.filetype;
						var fullpath = nodedata.node.data.parentLabel;
						
						window_manager.add(filename, filetype, fullpath);
						//window_manager.show();
						//messageManager.write("alarm", directory, "adsf");
					}
				});
				*/
					
		this.treeview.render();
		this.treeview.expandAll();
	},
	
	refresh_treeview: function() {
		this.treeview.refresh();
		
	},
	
	get_directories_and_files: function(type, url) {
		
		var postdata = {
			type: type,
			url: url,
			kind: "directoriesAndFiles"
		};
		
		var result = null;
		
		$.get("file/get_contents", postdata, function (data) {
			
				var sort_function = function (x,y) {
					return ((x.cls > y.cls) ? -1 : ((x.cls < y.cls) ? 1 : 0 ));
				};
				
				var quick_sort = function (data) { 				
					data.sort(sort_function);
					
					for(i=0; i<data.length; i++) {
						if(data[i].children) {
							quick_sort(data[i].children);
						}
					}
				};
				
				result = eval(data);
				quick_sort(result);
		});
		
		return result;		
	}
};