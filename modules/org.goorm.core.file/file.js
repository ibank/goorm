var fs = require('fs');
var walk = require('walk');
var EventEmitter = require("events").EventEmitter;
var rimraf = require('rimraf');
var http = require('http');

var root_dir = "";

module.exports = {
	init: function () {
	
	},
	
	do_new: function (query, evt) {
		var self = this;
		
		var data = {};
		data.err_code = 0;
		data.message = "process done";
		
		if ( query.path!=null && query.new_anyway ) {
			var path = query.path;
			if(query.type!="") {
				path += "."+query.type;
			}
			
			fs.exists(__path+'workspace/'+path, function(exists) {

				if (exists && query.new_anyway=="false") {
					data.err_code = 99;
					data.message = "exist file";
					evt.emit("file_do_new", data);					
				}
				else {
					fs.writeFile(__path+'workspace/'+path, "", function(err) {
						if (err!=null) {
							data.err_code = 40;
							data.message = "Can not make project file";
							
							evt.emit("file_do_new", data);
						}
						else {	
							evt.emit("file_do_new", data);
						}
					});
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalid query";
			evt.emit("file_do_new", data);
		}
	},
	
	do_new_folder: function (query, evt) {
		var self = this;
		
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if ( query.current_path!=null && query.folder_name!=null ) {
			fs.exists(__path+'workspace/'+query.path, function(exists) {
				if (exists) {
					data.err_code = 20;
					data.message = "Exist folder";

					evt.emit("file_do_new_folder", data);
				}
				else {
					fs.mkdir(__path+'workspace/'+query.current_path+'/'+query.folder_name, '0777', function(err) {

						if (err!=null) {
							data.err_code = 30;
							data.message = "Cannot make directory";
	
							evt.emit("file_do_new_folder", data);
						}
						else {
							evt.emit("file_do_new_folder", data);
						}
					});
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalid query";
			evt.emit("file_do_new_folder", data);
		}
	},
	
	do_new_untitled_text_file: function (query, evt) {
		var self = this;
		
		var data = {};
		data.err_code = 0;
		data.message = "process done";
		
		if ( query.current_path!=null ) {
			fs.readdir(__path+'workspace/'+query.current_path, function(err, files) {
				if (err!=null) {
					data.err_code = 10;
					data.message = "Server can not response";

					evt.emit("file_do_new_untitled_text_file", data);
				}
				else {
					var temp_file_name = "untitled";
					var i=1;
					
					while(1) {
						if (files.hasObject(temp_file_name+i+".txt")) {
						}
						else {
							break;
						}
						i++;
					}
					
					fs.writeFile(__path+'workspace/'+query.current_path+'/'+temp_file_name+i+'.txt', "", function(err) {
						if (err!=null) {
							data.err_code = 40;
							data.message = "Can not make project file";
							
							evt.emit("file_do_new_untitled_text_file", data);
						}
						else {
							//data.

							evt.emit("file_do_new_untitled_text_file", data);
						}
					});
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalid query";
			evt.emit("file_do_new_untitled_text_file", data);
		}
	},
	
	do_new_other: function (query, evt) {
		var self = this;
		
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if ( query.current_path!=null && query.file_name!=null ) {
			fs.exists(__path+'workspace/'+query.path, function(exists) {
				if (exists) {
					data.err_code = 20;
					data.message = "Exist file";

					evt.emit("file_do_new_other", data);
				}
				else {
					fs.writeFile(__path+'workspace/'+query.current_path+'/'+query.file_name, "", function(err) {
						if (err!=null) {
							data.err_code = 40;
							data.message = "Can not make file";
							
							evt.emit("file_do_new_other", data);
						}
						else {
							evt.emit("file_do_new_other", data);
						}
					});
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalid query";
			evt.emit("file_do_new_other", data);
		}
	},
	
	put_contents: function (query, evt) {

		var data = {};

		fs.writeFile(__path+'/workspace/'+query.path, query.data, function(err) {
			if (err!=null) {
				data.err_code = 10;
				data.message = "Can not save";
	
				evt.emit("file_put_contents", data);
			}
			else {
				data.err_code = 0;
				data.message = "saved";
	
				evt.emit("file_put_contents", data);
			}
		});		
	},
		
	get_nodes: function (path, evt) {
		var self = this;
		
		var evt_dir = new EventEmitter();
				
		var nodes = [];
		
		root_dir = path.replace(__path + "workspace/", "") + "/";

		evt_dir.on("got_dir_nodes_for_get_nodes", function (dirs) {
			var options = {
				followLinks: false
			};

			var walker = walk.walk(path, options);
			
			walker.on("files", function (root, file_stats, next) {
				if (root.indexOf("\/\.")==-1) {			
					for (var i=0; i < file_stats.length; i++) {
						if (file_stats[i].name.indexOf("\.") != 0 ) {
							var node = {};
							node.root = root.replace(__path + "workspace/", "") + "/";
							node.filename = file_stats[i].name;
							node.parent_label = node.root;
							node.project_path = root_dir;
							node.cls = "file";
							node.expanded = false;
							node.sortkey = 1 + node.filename;
							node.type = "html";
							
							var extension = node.filename.split('.').pop();
							if (extension == node.filename) {
								extension = "etc";
							}
							node.html = "<div class='node'>" 
										+ "<img src=images/icons/filetype/" + extension + ".filetype.png class=\"directory_icon file\" />"
										+ node.filename
										+ "<div class=\"fullpath\" style=\"display:none;\">" + node.root + node.filename + "</div>"
									  + "</div>";
							node.children = [];
							node.filetype = extension;
							nodes.push(node);
						}
					}
				}
				next();
			});
			
			walker.on("end", function () {
				tree = self.make_dir_tree(root_dir, dirs);
				tree = self.make_file_tree(tree, nodes);				
				evt.emit("got_nodes", tree);
			});
		
		});
		
		this.get_dir_nodes(path, evt_dir);
	},
	
	get_dir_nodes: function (path, evt) {
		var self = this;
		
		var options = {
			followLinks: false
		};
		
		var dirs = [];
		
		var walker = walk.walk(path, options);
		
		walker.on("directories", function (root, dir_stats_array, next) {
			if (root.indexOf("\/\.")==-1) {
				for (var i=0; i < dir_stats_array.length; i++) {
					if (dir_stats_array[i].name.indexOf("\.") != 0 ) {				
						var dir = {};
						dir.root = root.replace(__path + "workspace/", "") + "/";
						dir.name = dir_stats_array[i].name;
						dir.parent_label = dir.root;
						dir.cls = "dir";
						dir.expanded = true;
						dir.sortkey = 0 + dir.name;
						dir.type = "html";
						dir.html = "<div class='node'>" 
									+ "<img src=images/icons/filetype/folder.filetype.png class=\"directory_icon file\" />"
									+ dir.name
									+ "<div class=\"fullpath\" style=\"display:none;\">" + dir.root + dir.name + "</div>"
								 + "</div>";
						dir.children = [];
						dirs.push(dir);
					}
				}
			}
			next();
		});
		
		walker.on("end", function () {
			tree = self.make_dir_tree(root_dir, dirs);
			
			// root directory for get_dir_nodes only
			var dir_tree = {};
			dir_tree.root = "";
			dir_tree.name = root_dir.replace(/\//g, "");
			dir_tree.parent_label = dir_tree.root;
			dir_tree.cls = "dir";
			dir_tree.expanded = true;
			dir_tree.sortkey = 0 + dir_tree.name;
			dir_tree.type = "html";

			var temp_label = dir_tree.name;
			if (dir_tree.name=="") {
				temp_label="workspace";
			}

			dir_tree.html = "<div class='node'>" 
						+ "<img src=images/icons/filetype/folder.filetype.png class=\"directory_icon file\" />"
						+ temp_label
						+ "<div class=\"fullpath\" style=\"display:none;\">" + dir_tree.root + dir_tree.name + "</div>"
					 + "</div>";
			dir_tree.children = tree;
			
			evt.emit("got_dir_nodes", dir_tree);
			evt.emit("got_dir_nodes_for_get_nodes", dirs);
		});
	},
	
	make_dir_tree: function (root, dirs) {
		var tree = [];
		var rest = [];
				
		for (var i=0; i<dirs.length; i++) {
			if (dirs[i].root == root) {
				tree.push(dirs[i]);
			}
			else {
				rest.push(dirs[i]);
			}
		}
		
		for (var i=0; i<tree.length; i++) {
			var children = this.make_dir_tree(root + tree[i].name + '/', rest);
			tree[i].children = children;
		}
		
		return tree;
	},
	
	make_file_tree: function (tree, files) {
		if (tree != undefined) {
			var marked = [];

			// files on root
			for (var j=0; j<files.length; j++) {
				if (files[j].root == root_dir) {
					marked.push(j);
					tree.push(files[j]);
				}
			}
			
			for (var i=0; i<tree.length; i++) {
				for (var j=0; j<files.length; j++) {
					if (!marked.hasObject(j) && tree[i].root + tree[i].name + '/' == files[j].root) {
						marked.push(j);
						tree[i].children.push(files[j]);
					}
				}
			}
			
			var rest_files = [];
			
			for (var j=0; j<files.length; j++) {
				if (!marked.hasObject(j)) {
					rest_files.push(files[j]);
				}
			}
			
			for (var i=0; i<tree.length; i++) {
				if (tree[i].children.length > 0) {
					tree[i].children.join(this.make_file_tree(tree[i].children, rest_files));
				}
			}
			
			return tree;
		}
		else {
			return null;
		}
	},
	
	do_delete: function (query, evt) {
		console.log(query);
		var data = {};
		data.err_code = 0;
		data.message = "process done";
		
		if (query.filename != null) {
			rimraf(__path+"workspace/"+query.filename, function(err) {
				if (err!=null) {
					data.err_code = 20;
					data.message = "Can not delete file";
					
					evt.emit("file_do_delete", data);
				}
				else {
					//success
					evt.emit("file_do_delete", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("file_do_delete", data);
		}		
/*
		rimraf(__path+query.path, function(err) {
		evt.emit("project_do_delete", err);			
		});
*/
		
	},
	
	do_rename: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";
				
		if (query.ori_path != null && query.ori_name != null && query.dst_name != null) {
			var path = __path+"workspace/"+query.ori_path;
			fs.rename(path+query.ori_name, path+query.dst_name, function (err) {

				data.path = query.ori_path;
				data.file = query.dst_name;

				evt.emit("file_do_rename", data);
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("file_do_rename", data);
		}				
	},
	
	do_move: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if (query.ori_path != null && query.ori_file != null && query.dst_path != null && query.dst_file != null) {
			var ori_full = __path+"workspace/"+query.ori_path+"/"+query.ori_file;
			var dst_full = __path+"workspace/"+query.dst_path+"/"+query.dst_file;
			fs.rename(ori_full, dst_full, function (err) {

				if (err!=null) {
					data.err_code = 20;
					data.message = "Can not move file";
					
					evt.emit("file_do_move", data);
				}
				else {
					
					data.path = query.dst_path;
					data.file = query.dst_name;
	
					evt.emit("file_do_move", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("file_do_move", data);
		}				
	},
	
	do_import: function (query, file, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";	

		if (query.file_import_location_path!=null && file!=null) {

			fs.rename(file.path, __path+"workspace/"+query.file_import_location_path+"/"+file.name, function (err) {
				if (err==null) {
					evt.emit("file_do_import", data);
				}
				else {
					data.err_code = 20;
					data.message = "Cannot extract zip file";
					
					evt.emit("file_do_import", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("file_do_import", data);			
		}
	},

	
	do_export: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";
		
		if ( query.user!=null && query.path!=null && query.file!=null ) {
			fs.mkdir(__path+'temp_files/'+query.user, '0777', function(err) {
				if (err==null || err.errno == 47) {		//errno 47 is exist folder error
					fs.readFile(__path + 'workspace/'+query.path+'/'+query.file, "utf8", function(err, contents) {
						if (err!=null) {
							data.err_code = 40;
							data.message = "Cannot find target file";
	
							evt.emit("file_do_export", data);
						}
						else {
							fs.writeFile(__path+'temp_files/'+query.user+'/'+query.file, contents, function(err) {
								if (err!=null) {
									data.err_code = 10;
									data.message = "Can not save";
						
									evt.emit("file_do_export", data);
								}
								else {
									data.path = query.user+'/'+query.file;
									evt.emit("file_do_export", data);
								}
							});		
						}
					});
				}
				else {
					data.err_code = 30;
					data.message = "Cannot make directory";

					evt.emit("file_do_export", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("file_do_export", data);
		}				
		
	},
	
	get_url_contents: function (path, evt) {//file_get_url_contents
		var data = "";
		http.get(path, function(res) {
			res.on("data", function(chunk) {
				data += chunk;
			});
			
			res.on("end", function() {
				evt.emit("file_get_url_contents", data);
			});
		}).on("error", function(e) {
			data = "Got error: " + e.message;
			evt.emit("file_get_url_contents", data);
		});
	},
	
	get_property: function (query, evt) {

		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if ( query.path!=null ) {
			
			fs.stat(__path+"workspace/"+query.path, function (err, stats) {
				if ( err == null ) {
				
					var temp_path = query.path.split("/");
					var path = "";
					for (var i=0; i<temp_path.length-1; i++) {
						path += temp_path[i]+"/"
					}
				
					data.filename = temp_path[temp_path.length-1];
					data.filetype = temp_path[temp_path.length-1].split(".")[1];
					data.path = path;
					data.size = stats.size;
					data.atime = stats.atime;
					data.mtime = stats.mtime;
					
					evt.emit("file_get_property", data);
				}
				else {
					data.err_code = 20;
					data.message = "Can not find target file";
					
					evt.emit("file_get_property", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";

			evt.emit("file_get_property", data);			
		}				
	},
	
	do_save_as: function (query, evt) {
		var self = this;
		
		var data = {};
		data.err_code = 0;
		data.message = "process done";
		
		if ( query.path!=null && query.save_anyway ) {
			var path = query.path;
			if(query.type!="") {
				path += "."+query.type;
			}
			
			fs.exists(__path+'workspace/'+path, function(exists) {
				if (exists && query.save_anyway=="false") {
					data.err_code = 99;
					data.message = "exist file";
					evt.emit("file_do_save_as", data);					
				}
				else {
					fs.writeFile(__path+'workspace/'+path, query.data, function(err) {
						if (err!=null) {
							data.err_code = 40;
							data.message = "Can not save file";
							
							evt.emit("file_do_save_as", data);
						}
						else {	
							evt.emit("file_do_save_as", data);
						}
					});
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalid query";
			evt.emit("file_do_save_as", data);
		}
	},
};
