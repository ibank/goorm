/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var fs = require('fs'),
	walk = require('walk'),
	emitter,
	common = require(__path + "plugins/org.goorm.plugin.java/modules/common.js");

module.exports = {
	do_new : function(req, evt) {
		var workspace = __workspace + "/" + req.data.project_author + "_" + req.data.project_name;
		var template = common.path + "template";
		var uid = parseInt(req.uid);
		var gid = parseInt(req.gid);
		
		emittor = walk.walk(template);
		
		emittor.on('file', function (path, stat, next){
			var abs_path = (path+"/"+stat.name).replace(template,"");
			fs.readFile(path + "/" + stat.name, "utf-8" , function(err, data) {
				if (err) throw err;
//				console.log(data);
				data = data.replace("{PROJECTNAME}", req.data.project_name);
				fs.writeFile(workspace + abs_path, data, function(err) {
					if (err) throw err;
					if(uid && gid) {
						fs.chownSync(workspace+abs_path, uid, gid);
					}
				});
			});
			next();
		});
		
		emittor.on("directory", function (path, stat, next) {
		  // dirStatsArray is an array of `stat` objects with the additional attributes
		  // * type
		  // * error
		  // * name
			var abs_path = (path+"/"+stat.name).replace(template,"");
			fs.exists(workspace+abs_path, function(exists) {
				if(!exists) {
					fs.mkdirSync(workspace+abs_path);
					if(uid && gid) {
						fs.chownSync(workspace+abs_path, uid, gid);
					}
				}
				next();
			});
			
			next();
		});
		
		emittor.on("end", function () {
			fs.chmodSync(workspace+"/make", 755);
			evt.emit("do_new_complete", {
				code : 200,
				message : "success"
			});
		});

	}
};