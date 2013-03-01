/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var fs = require('fs');
var walk = require('walk');
var rimraf = require('rimraf');
var EventEmitter = require("events").EventEmitter;
var exec = require('child_process').exec;

var projects = [];

var g_auth_project = require('../org.goorm.auth/auth.project');

module.exports = {
	do_new: function (query, evt) {

		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if ( query.project_type!=null && query.project_detailed_type !=null && query.project_author!=null && query.project_name!=null && query.project_desc!=null && query.use_collaboration ) {
			fs.readdir(__workspace+'/', function(err, files) {
				if (err!=null) {
					data.err_code = 10;
					data.message = "Server can not response";

					evt.emit("project_do_new", data);
				}
				else {
					var project_dir = query.project_author+'_'+query.project_name;
					if (files.hasObject(project_dir)) {
						data.err_code = 20;
						data.message = "Same project name is exist.";

						evt.emit("project_do_new", data);
					}
					else {
						fs.mkdir(__workspace+'/'+project_dir, '0777', function(err) {
							if (err!=null) {
								data.err_code = 30;
								data.message = "Cannot make directory";
		
								evt.emit("project_do_new", data);
							}
							else {
								var today = new Date();
								var today_month = parseInt(today.getMonth()) + 1;
								var date_string = today.getFullYear()+'/'+today_month+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
							
								var file_contents = {
									type: query.project_type,
									detailedtype: query.project_detailed_type,
									author: query.project_author,
									name: query.project_name,
									description: query.project_desc,
									date: date_string,
									collaboration: query.use_collaboration,
									plugins: query.plugins
								};
													 
								fs.writeFile(__workspace+'/'+project_dir+'/project.json', JSON.stringify(file_contents), function(err) {
									if (err!=null) {
										data.err_code = 40;
										data.message = "Can not make project file";
										
										evt.emit("project_do_new", data);
									}
									else {
										data.project_name = query.project_name;
										data.project_author = query.project_author;
										data.project_type = query.project_type;

										var project_db_data = {
											project_author : query.project_author,
											project_name : query.project_name,
											project_path : query.project_author+'_'+query.project_name,
											project_type : query.project_type
										}

										if(__service_mode){
											var project_permission_data = {
												project_path : __workspace + '/' + project_dir
											}

											evt.emit("project_change_permission", project_permission_data)
										}

										evt.emit("project_add_db", project_db_data);
										evt.emit("project_do_new", data);
									}
								});
							}
						});
					}
				}
			});	
		}
		else {
			data.err_code = 10;
			data.message = "Invalid query";

			evt.emit("project_do_new", data);
		}
	},
	
	do_delete: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if (query.project_path != null) {
			rimraf(__workspace+'/'+query.project_path, function(err) {
				if (err!=null) {
					data.err_code = 20;
					data.message = "Can not delete project";
					
					evt.emit("project_do_delete", data);
				}
				else {
					//success
					evt.emit("project_do_delete", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("project_do_delete", data);
		}		
/*
		rimraf(__path+query.path, function(err) {
		evt.emit("project_do_delete", err);			
		});
*/
		
	},
	
	do_import: function (query, file, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";	

		if (query.project_import_location!=null && file!=null) {
			var command = exec("unzip -o "+file.path+" -d " + __workspace + "/"+query.project_import_location, function (error, stdout, stderr) {
				if (error == null) {
					console.log(error);
					rimraf(file.path, function(err) {
						if (err!=null) {
						}
						else {
							// remove complete
						}
					});
					
					evt.emit("project_do_import", data);
				}
				else {
					data.err_code = 20;
					data.message = "Cannot extract zip file";
					
					evt.emit("project_do_import", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("project_do_import", data);			
		}
	},

	
	do_export: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";	

		if ( query.user!=null && query.project_path!=null && query.project_name!=null ) {
				
			fs.mkdir(__temp_dir+'/'+query.user, '0777', function(err) {

				if (err==null || err.errno == 47) {		//errno 47 is exist folder error
					//$tar cvzf filename.tar.gz file1
					var export_terminal_command;
					var export_file_extension;

					if(query.export_type == "zip"){
						export_terminal_command = "zip -r ";
						export_file_extension = ".zip";
					}
					else if(query.export_type == "tar"){

						export_terminal_command = "tar cvzf ";
						export_file_extension = ".tar";
					}
					
					var command = exec("cd " + __workspace +"; " + export_terminal_command + __temp_dir + "/"+query.user+"/"+query.project_name + export_file_extension + " ./"+query.project_path, function (error, stdout, stderr) {
						if (error == null) {
							data.path = query.user+'/'+query.project_name+export_file_extension;
							evt.emit("project_do_export", data);
						}
						else {
							data.err_code = 20;
							data.message = "Cannot make export file";
							
							evt.emit("project_do_export", data);
						}
					});
					
				}
				else {
					data.err_code = 30;
					data.message = "Cannot make directory";

					evt.emit("project_do_export", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("project_do_export", data);			
		}
	},
	
	get_list: function (project_option, evt) {
	
		var self = this;
		projects = [];
		
		var author = project_option['author'];
		var get_list_type = project_option['get_list_type'];

		var options = {
			followLinks: false
		};

		var is_empty = true;
		var owner_roots = [];

		function get_project_data(callback){
			if(get_list_type == 'collaboration_list'){
				g_auth_project.get_collaboration_list(author, function(__data){
					callback(__data);
				});
			}
			else{ // owner_list
				g_auth_project.get_owner_list(author, function(_data){
					callback(_data);
				});
			}
		}

		get_project_data(function(owner_project_data){
			for(var i=0; i<owner_project_data.length; i++){
				owner_roots.push(owner_project_data[i].project_path);
			}

			var walker = walk.walk(__workspace+'/', options);

			walker.on("directories", function (root, dirStatsArray, next) {
				is_empty = false;
				if (root==__workspace+'/' ) {

					var dir_count = 0;

					var evt_dir = new EventEmitter();
		
					evt_dir.on("get_list", function () {

						dir_count++;
						if (dir_count<dirStatsArray.length) {
							self.get_project_info(owner_roots, dirStatsArray[dir_count], evt_dir);						
						}
						else {
							evt.emit("project_get_list", projects);
						}
					});

					self.get_project_info(owner_roots, dirStatsArray[dir_count], evt_dir);
				}
				
				next();
			});
			
			walker.on("end", function () {
				if (is_empty) {
					evt.emit("project_get_list", projects);
				}
			});
		});
	},
	
	get_project_info: function (owner_roots, dirStatsArray, evt_dir) {
		if( owner_roots.indexOf(dirStatsArray.name) != -1 || owner_roots.indexOf('/'+dirStatsArray.name) != -1 ) {
			var project = {};
			project.name = dirStatsArray.name;

			fs.readFile(__workspace+'/'+project.name+"/project.json", 'utf-8', function (err, data) {
				if (err==null) {
					project.contents = JSON.parse(data);

					projects.push(project);
				}
				evt_dir.emit("get_list");
			});
		}
		else{
			evt_dir.emit("get_list");
		}
	},
	
	set_property: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if (query.project_path != null) {
			fs.writeFile(__workspace+'/'+query.project_path+"/project.json", query.data, 'utf-8', function (err) {
				if (err==null) {
					evt.emit("set_property", data);
				}
				else {
					data.err_code = 20;
					data.message = "Can not write project file.";
					evt.emit("set_property", data);
				}
			});
		}
		else {
			data.err_code = 10;
			data.message = "Invalid query";
			evt.emit("set_property", data);
		}
	},
	
	get_property: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if (query.project_path != null) {
			if(query.project_path == ""){
				evt.emit("get_property", data);
			}else{
				fs.readFile(__workspace+'/'+query.project_path+"/project.json", 'utf-8', function (err, file_data) {
					if (err==null) {
						data.contents = JSON.parse(file_data);
						evt.emit("get_property", data);
					}
					else {
						data.err_code = 20;
						data.message = "Can not open project.";
						evt.emit("get_property", data);
					}
				});
			}
		}
		else {
			data.err_code = 10;
			data.message = "Invalid query";
			evt.emit("get_property", data);
		}
	},
	
	do_clean: function (query, evt) {
		var self = this;
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if (query.project_list != null) {

			var total_count = query.project_list.length;
			var clean_count = 0;
			var evt_clean = new EventEmitter();

			evt_clean.on("do_delete_for_clean", function () {
				
				clean_count++;
				if (clean_count<total_count) {
					self.do_delete_for_clean(query.project_list[clean_count], evt_clean);						
				}
				else {
					evt.emit("project_do_clean", data);
				}
			});
			
			self.do_delete_for_clean(query.project_list[clean_count], evt_clean);
		}
		else {
			data.err_code = 10;
			data.message = "Invalide query";
			
			evt.emit("project_do_clean", data);
		}		
	},
	
	do_delete_for_clean: function (project_path, evt_clean) {
		rimraf(__workspace+'/'+project_path+"/build", function(err) {
			evt_clean.emit("do_delete_for_clean");
		});
	}
};
