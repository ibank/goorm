/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var fs = require('fs');
var walk = require('walk');
var EventEmitter = require("events").EventEmitter;
var rimraf = require('rimraf');
var http = require('http');
var exec = require('child_process').exec;

var root_dir = ""; // project root
var target_dir = ""; // target root
var file_type = [];

var g_auth_project = require('../org.goorm.auth/auth.project');

module.exports = {
	init: function () {
		fs.readdir(__path+"public/images/icons/filetype/", function(err, files) {
			for(var i=0; i<files.length; i++) {
				if (files[i].indexOf("filetype")>-1) {
					file_type.push(files[i]);
				}
			}
		});
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
			
			fs.exists(__workspace+'/'+path, function(exists) {

				if (exists && query.new_anyway=="false") {
					data.err_code = 99;
					data.message = "exist file";
					evt.emit("file_do_new", data);					
				}
				else {
					fs.writeFile(__workspace+'/'+path, "", function(err) {
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
			fs.exists(__workspace+'/'+query.path, function(exists) {
				if (exists) {
					data.err_code = 20;
					data.message = "Exist folder";

					evt.emit("file_do_new_folder", data);
				}
				else {
					fs.mkdir(__workspace+'/'+query.current_path+'/'+query.folder_name, '0777', function(err) {

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
			fs.readdir(__workspace+'/'+query.current_path, function(err, files) {
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
					
					fs.writeFile(__workspace+'/'+query.current_path+'/'+temp_file_name+i+'.txt', "", function(err) {
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
			fs.exists(__workspace+'/'+query.path, function(exists) {
				if (exists) {
					data.err_code = 20;
					data.message = "Exist file";

					evt.emit("file_do_new_other", data);
				}
				else {
					fs.writeFile(__workspace+'/'+query.current_path+'/'+query.file_name, "", function(err) {
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

		fs.writeFile(__workspace+'/'+query.path, query.data, function(err) {
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
		
	get_nodes: function (nodes_data, evt, type) {
		var self = this;
	
		var evt_dir = new EventEmitter();
		var path = nodes_data['path'];
		var author = nodes_data['author'];

		var nodes = [];
		
		if(!type)
			root_dir = path.replace(__workspace+'/', "") + "/";	// project root
		target_dir = path.replace(__workspace+'/', "") + "/";	// target root

		evt_dir.on("got_dir_nodes_for_get_nodes", function (dirs) {
			var options = {
				followLinks: false
			};

			var walker = walk.walk(path, options);
			
			walker.on("files", function (root, file_stats, next) {
				if (root.indexOf("\/\.")==-1) {			
					for (var i=0; i < file_stats.length; i++) {
						if (file_stats[i].name.indexOf("\.") != 0 ) {
							var temp_filename = file_stats[i].name;
							var file_path = file_stats[i].name.split('.').pop() + ".filetype.png";

							var extension;

							if (file_type.indexOf(file_path)==-1) {
								extension = "etc";
							}
							else {
								extension = temp_filename.split('.').pop();
							}

							var node = {};
							node.filename = temp_filename;
							node.root = root.replace(__workspace+'/', "") + "/";
							node.parent_label = node.root;
							node.project_path = root_dir;
							node.cls = "file";
							node.expanded = false;
							node.sortkey = 1 + node.filename;
							node.type = "html";	
							node.html = "<div class='node'>" 
										+ "<img src=images/icons/filetype/" + extension + ".filetype.png class=\"directory_icon file\" />"
										+ node.filename
										+ "<div class=\"fullpath\" style=\"display:none;\">" + node.root + node.filename + "</div>"
									  + "</div>";
							node.children = [];
							node.filetype = extension;
							
							if(node.root && (node.root.split('/').length == 2 || node.root.split('/').length == 3) && node.filename == 'project.json')
								continue;
							
							nodes.push(node);
						}
					}
				}
				next();
			});
			
			walker.on("end", function () {
				tree = self.make_dir_tree(target_dir, dirs);
				tree = self.make_file_tree(tree, nodes);

				evt.emit("got_nodes", tree);
			});
		
		});
		
		var dir_data = {
			path : path,
			author : author
		}

		this.get_dir_nodes(dir_data, evt_dir);
	},
	
	get_dir_nodes: function (dir_data, evt) {
		var self = this;
		
		var path = dir_data['path'];
		var author = dir_data['author'];

		var options = {
			followLinks: false
		};
		
		var dirs = [];

		var root_dirs = [];
		var owner_roots = [];

		var __root = path.replace(__workspace+'/', "") + "/"
		var is_all_project = (__root == '/') ? true : false;

		root_dir = path.replace(__workspace+'/', "").split('/')[0];
		if(root_dir[root_dir.length-1] != '/') root_dir += '/'

		if(is_all_project){
			g_auth_project.get_collaboration_list(author, function(owner_project_data){
				for(var i=0; i<owner_project_data.length; i++){
					owner_roots.push(owner_project_data[i].project_path);
				}

				var root_walker = walk.walk(path, options);
				var is_root = true;

				root_walker.on("directories", function (root, dir_stats_array, next){
					if(is_root){
						is_root = false;

						for(var i=0; i<dir_stats_array.length; i++){
							if( owner_roots.indexOf(dir_stats_array[i].name) != -1 || owner_roots.indexOf('/'+dir_stats_array[i].name) != -1 ) {
								var dir = {};
								dir.root = root.replace(__workspace+'/', "") + '/';
								dir.name = dir_stats_array[i].name;
								dir.parent_label = dir.root;
								dir.cls = "dir";
								dir.expanded = false;
								dir.sortkey = 0 + dir.name;
								dir.type = "html";
								dir.html = "<div class='node'>" 
											+ "<img src=images/icons/filetype/folder.filetype.png class=\"directory_icon folder\" />"
											+ dir.name
											+ "<div class=\"fullpath\" style=\"display:none;\">" + dir.root + dir.name + "</div>"
										 + "</div>";
								dir.children = [];
								dirs.push(dir);

								root_dirs.push(dir_stats_array[i].name);
							}
						}
						next();
					}
					else{
						next();
					}
				})

				root_walker.on('end', function(){
					var node_evt = new EventEmitter();

					node_evt.on("get_owner_nodes", function(_node_evt, i){
						if(root_dirs[i]){
							var node_path = __workspace + '/' + root_dirs[i];

							var node_walker = walk.walk(node_path, options);

							node_walker.on("directories", function(root, dir_stats_array, next){
								if (root.indexOf("\/\.")==-1) {
									for (var i=0; i < dir_stats_array.length; i++) {
										if (dir_stats_array[i].name.indexOf("\.") != 0 ) {				
											var dir = {};
											dir.root = target_dir + root.replace(__workspace+'/', "") + "/";
											dir.name = dir_stats_array[i].name;
											dir.parent_label = dir.root;
											dir.cls = "dir";
											dir.expanded = false;
											dir.sortkey = 0 + dir.name;
											dir.type = "html";
											dir.html = "<div class='node'>" 
														+ "<img src=images/icons/filetype/folder.filetype.png class=\"directory_icon folder\" />"
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

							node_walker.on("end", function(){
								_node_evt.emit('get_owner_nodes', _node_evt, ++i);				
							})
						}
						else{
							tree = self.make_dir_tree(root_dir, dirs);

							// root directory for get_dir_nodes only
							var dir_tree = {};
							var dir_tree_name = root_dir;
							if(dir_tree_name && dir_tree_name[dir_tree_name.length-1] == '/') dir_tree_name = dir_tree_name.substring(0, dir_tree_name.length-1);
							
							dir_tree.root = "";
							//dir_tree.name = root_dir.replace(/\//g, "");
							dir_tree.name = dir_tree_name;
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
										+ "<img src=images/icons/filetype/folder.filetype.png class=\"directory_icon folder\" />"
										+ temp_label
										+ "<div class=\"fullpath\" style=\"display:none;\">" + dir_tree.root + dir_tree.name + "</div>"
									 + "</div>";
							dir_tree.children = tree;

							evt.emit("got_dir_nodes", dir_tree);
							evt.emit("got_dir_nodes_for_get_nodes", dirs);
						}
					});

					node_evt.emit('get_owner_nodes', node_evt, 0);				
				});
			});
		}
		else{
			g_auth_project.get_collaboration_list(author, function(owner_project_data){
				for(var i=0; i<owner_project_data.length; i++){
					owner_roots.push(owner_project_data[i].project_path);
				}

				var __root = path.replace(__workspace+'/', "")
				if(__root[0] == '/') __root = __root.substring(1, __root.length);
				if(__root.indexOf('/') != -1) __root = __root.split('/')[0];

				if(owner_roots.indexOf(__root) != -1){
					var walker = walk.walk(path, options);

					walker.on("directories", function (root, dir_stats_array, next) {
						if (root.indexOf("\/\.")==-1) {
							for (var i=0; i < dir_stats_array.length; i++) {
								if (dir_stats_array[i].name.indexOf("\.") != 0 ) {				
									var dir = {};
									dir.root = root.replace(__workspace+'/', "") + "/";
									dir.name = dir_stats_array[i].name;
									dir.parent_label = dir.root;
									dir.cls = "dir";
									dir.expanded = false;
									dir.sortkey = 0 + dir.name;
									dir.type = "html";
									dir.html = "<div class='node'>" 
												+ "<img src=images/icons/filetype/folder.filetype.png class=\"directory_icon folder\" />"
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
						var dir_tree_name = root_dir;
						if(dir_tree_name && dir_tree_name[dir_tree_name.length-1] == '/') dir_tree_name = dir_tree_name.substring(0, dir_tree_name.length-1);
						
						dir_tree.root = "";
						//dir_tree.name = root_dir.replace(/\//g, "");
						dir_tree.name = dir_tree_name;
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
									+ "<img src=images/icons/filetype/folder.filetype.png class=\"directory_icon folder\" />"
									+ temp_label
									+ "<div class=\"fullpath\" style=\"display:none;\">" + dir_tree.root + dir_tree.name + "</div>"
								 + "</div>";
						dir_tree.children = tree;
						
						evt.emit("got_dir_nodes", dir_tree);
						evt.emit("got_dir_nodes_for_get_nodes", dirs);
					});
				}		
			});
		}
	},
	
	make_dir_tree: function (root, dirs) {
		var tree = [];
		var rest = [];
				
		for (var i=0; i<dirs.length; i++) {
			if (dirs[i].root == root || dirs[i].root == root + '/') {
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
				if (files[j].root == target_dir) {
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
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if (query.filename != null) {
			rimraf(__workspace+'/'+query.filename, function(err) {
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
			var path = __workspace+'/'+query.ori_path;
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
			var ori_full = __workspace+'/'+query.ori_path+"/"+query.ori_file;
			var dst_full = __workspace+'/'+query.dst_path+"/"+query.dst_file;
			fs.rename(ori_full, dst_full, function (err) {

				if (err!=null) {
					data.err_code = 20;
					data.message = "Can not move file";
					
					evt.emit("file_do_move", data);
				}
				else {
					
					data.path = query.dst_path;
					data.file = query.dst_file;
	
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

			fs.rename(file.path, __workspace+'/'+query.file_import_location_path+"/"+file.name, function (err) {
				if (err==null) {
					evt.emit("file_do_import", data);
				}
				else {
					data.err_code = 20;
					data.message = "Cannot import a file";
					
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
			fs.mkdir(__temp_dir+'/'+query.user, '0777', function(err) {
				if (err==null || err.errno == 47) {		//errno 47 is exist folder error
					
					var command = exec("cp " + __workspace+'/'+query.path+'/'+query.file+" "+__temp_dir+'/'+query.user+'/'+query.file, function (error, stdout, stderr) {
						if (error == null) {
data.path = query.user+'/'+query.file;
									evt.emit("file_do_export", data);						}
						else {
							data.err_code = 20;
							data.message = "Cannot export file";
							
							evt.emit("file_do_export", data);
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
			
			fs.stat(__workspace+'/'+query.path, function (err, stats) {
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
			
			fs.exists(__workspace+'/'+path, function(exists) {
				if (exists && query.save_anyway=="false") {
					data.err_code = 99;
					data.message = "exist file";
					evt.emit("file_do_save_as", data);					
				}
				else {
					fs.writeFile(__workspace+'/'+path, query.data, function(err) {
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
	
	get_file: function (filepath, filename, evt) {
		if(!fs.existsSync(__temp_dir)) {
			fs.mkdirSync(__temp_dir);
		}
		if(!fs.existsSync(__temp_dir + "/files")) {
			fs.mkdirSync(__temp_dir + "/files");
		}
		if(!fs.existsSync(__temp_dir + "/files/" + filepath)) {
			fs.mkdirSync(__temp_dir + "/files/" + filepath);
		}
		
		this.copy_file_sync(__workspace + filepath + filename, __temp_dir + "/files/" + filepath + filename);
		
		evt.emit("got_file", {result:true});
	},
	
	copy_file_sync : function(srcFile, destFile) {
		BUF_LENGTH = 64*1024;
		buff = new Buffer(BUF_LENGTH);
		fdr = fs.openSync(srcFile, 'r');
		fdw = fs.openSync(destFile, 'w');
		bytesRead = 1;
		pos = 0;
		while (bytesRead > 0) {
			bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
			fs.writeSync(fdw,buff,0,bytesRead);
			pos += bytesRead;
		}
		fs.closeSync(fdr);
		fs.closeSync(fdw);
	},
		
	do_search_on_project: function (query, evt) {
		var self = this;
		var nodes = {};
		var find_query = query.find_query;
		var project_path = query.project_path;
		var grep_option = query.grep_option;
		var invert_match  = " | grep -v \"/.svn\" | grep -v \"Binary\" | grep -v \"file.list\" | grep -v \"project.json\" | grep -v \".classpath\"";

		var command = exec("grep " + find_query + " " + __workspace.slice(0, -1) + project_path + grep_option + invert_match, function (error, stdout, stderr) {
			if (error == null) {
				var matched_files_list = stdout.split(/\n/);
				matched_files_list.pop();

				for(var idx = 0; idx < matched_files_list.length; idx++){
					var node = {};
					node.filename = matched_files_list[idx].split(":")[0].match(/[^/]*$/)[0];
					node.filetype = matched_files_list[idx].replace(/(\/[a-zA-Z0-9_-]+)+\/?/, "").split(":")[0]
					node.filepath = matched_files_list[idx].split(":")[0].replace(__workspace, "").replace(node.filename, "");
					node.matched_line = 1;
					node.expanded = false;
					node.type = "html";
					node.html = "";
					node.children = [];

					nodes[node.filepath+node.filename] = node;
				}

				for(var idx = 0; idx < matched_files_list.length; idx++){
					var node = {};

					node.filename = matched_files_list[idx].split(":")[0].match(/[^/]*$/)[0];
					node.filetype = matched_files_list[idx].replace(/(\/[a-zA-Z0-9_-]+)+\/?/, "").split(":")[0]
					node.filepath = matched_files_list[idx].split(":")[0].replace(__workspace, "").replace(node.filename, "");
					node.matched_line = matched_files_list[idx].replace(/(\/[a-zA-Z0-9_-]+)+\/?.[a-z]+\:/, "").split(":")[0];
					node.expanded = false;
					node.type = "html";
					node.html = "<span style=\"color: #666; font-weight:bold;\">Line: " + node.matched_line +  "</span> - <span style=\"color: #808080\">" + matched_files_list[idx].replace(/(\/[a-zA-Z0-9_-]+)+\/?.[a-z]+\:\d+\:/, "") + "</span>";

					nodes[node.filepath+node.filename].children.push(node);
				}
				
				for (key in nodes){
					nodes[key].matched_line = nodes[key].children[0].matched_line;
					nodes[key].html = "<div class='node'>" 
									+ "<img src=images/icons/filetype/" + "etc" + ".filetype.png class=\"directory_icon file\" style=\"margin: 0px 3px 0 2px !important; float:left\"/>"
									+ nodes[key].filepath + nodes[key].filename
									+ "<div class=\"matched_lines_cnt\" style=\"float:right; background: #99acc4; color: white; width: 14px; height: 14px; text-align:center; -webkit-border-radius:3px; -moz-border-radius:3px; border-radius:3px; margin: 1px 10px 0px;\">" + nodes[key].children.length + "</div>"
									+ "<div class=\"fullpath\" style=\"display:none;\">" + nodes[key].filepath + nodes[key].filename + "</div>"
									+ "</div>";
				}

				evt.emit("file_do_search_on_project", nodes);
			}

			else{
				evt.emit("file_do_search_on_project", null);
			}
		});
	}
};
