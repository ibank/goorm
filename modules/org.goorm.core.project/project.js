var fs = require('fs');
var walk = require('walk');
var rimraf = require('rimraf');
var EventEmitter = require("events").EventEmitter;
var exec = require('child_process').exec;

var projects = [];

module.exports = {
	do_new: function (query, evt) {

		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if ( query.project_type!=null && query.project_detailed_type !=null && query.project_author!=null && query.project_name!=null && query.project_about!=null && query.use_collaboration ) {
			fs.readdir(__path+'workspace/', function(err, files) {
				if (err!=null) {
					data.err_code = 10;
					data.message = "Server can not response";

					evt.emit("project_do_new", data);
				}
				else {
					var project_dir = query.project_author+'_'+query.project_name;
					if (files.hasObject(project_dir)) {
						data.err_code = 20;
						data.message = "Exist project";

						evt.emit("project_do_new", data);
					}
					else {
						fs.mkdir(__path+'/workspace/'+project_dir, '0777', function(err) {
							if (err!=null) {
								data.err_code = 30;
								data.message = "Cannot make directory";
		
								evt.emit("project_do_new", data);
							}
							else {
								var today = new Date();
								var date_string = today.getFullYear()+'/'+today.getMonth()+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
							
								var file_contents = '{"type": "'+query.project_type+'", "detailedtype": "'+query.project_detailed_type+'", "author": "'+query.project_author+'", "name": "'+query.project_name+'", "about": "'+query.project_about+'", "date": "'+date_string+'", "collaboration": "'+query.use_collaboration+'"}';

								fs.writeFile(__path+'workspace/'+project_dir+'/project.json', file_contents, function(err) {
									if (err!=null) {
										data.err_code = 40;
										data.message = "Can not make project file";
										
										evt.emit("project_do_new", data);
									}
									else {
										data.project_name = query.project_name;
										data.project_author = query.project_author;
										data.project_type = query.project_type;

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
			rimraf(__path+"workspace/"+query.project_path, function(err) {
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
			var command = exec("unzip -o "+file.path+" -d workspace/"+query.project_import_location, function (error, stdout, stderr) {
				if (error == null) {
				
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
				
			fs.mkdir(__path+"temp_files/"+query.user, '0777', function(err) {

				if (err==null || err.errno == 47) {		//errno 47 is exist folder error

					var command = exec("cd workspace; zip -r ../temp_files/"+query.user+"/"+query.project_name+".zip ./"+query.project_path, function (error, stdout, stderr) {
						if (error == null) {
							data.path = query.user+'/'+query.project_name+".zip";
							evt.emit("project_do_export", data);
						}
						else {
							data.err_code = 20;
							data.message = "Cannot make zip file";
							
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
	
	get_list: function (evt) {
	
		var self = this;
		projects = [];
		
		var options = {
			followLinks: false
		};
				
		var walker = walk.walk(__path+"workspace", options);

		walker.on("directories", function (root, dirStatsArray, next) {

			var count = dirStatsArray.length;
			if (root==__path+"workspace" ) {
				var dir_count = 0;

				var evt_dir = new EventEmitter();
	
				evt_dir.on("get_list", function () {
					dir_count++;
					if (dir_count<dirStatsArray.length) {
						self.get_project_info(dirStatsArray[dir_count], evt_dir);						
					}
					else {
						evt.emit("project_get_list", projects);
					}
				});
				
				self.get_project_info(dirStatsArray[dir_count], evt_dir);
			}
			
			next();
		});
		
		walker.on("end", function () {
		});
	},
	
	get_project_info: function (dirStatsArray, evt_dir) {
		var project = {};
		project.name = dirStatsArray.name;

		fs.readFile(__path+"workspace/"+project.name+"/project.json", 'utf-8', function (err, data) {
			if (err==null) {
				project.contents = JSON.parse(data);

				projects.push(project);
			}
			evt_dir.emit("get_list");
		});
	},
	
	set_property: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";

		if (query.project_path != null) {
			fs.writeFile(__path+"workspace/"+query.project_path+"/project.json", query.data, 'utf-8', function (err) {
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
			fs.readFile(__path+"workspace/"+query.project_path+"/project.json", 'utf-8', function (err, file_data) {
				if (err==null) {
					data.contents = JSON.parse(file_data);
					evt.emit("get_property", data);
				}
				else {
					data.err_code = 20;
					data.message = "Can not read project file.";
					evt.emit("get_property", data);
				}
			});
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
		console.log(query.project_list);
		if (query.project_list != null) {

			var total_count = query.project_list.length;
			var clean_count = 0;
			var evt_clean = new EventEmitter();
console.log(total_count+" "+clean_count);
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
		console.log(project_path+"pre");
		rimraf(__path+"workspace/"+project_path+"/build", function(err) {
			console.log(project_path+"post");
			evt_clean.emit("do_delete_for_clean");
		});
	}
};
