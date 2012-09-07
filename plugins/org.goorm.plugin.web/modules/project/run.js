var fs = require('fs'),
	walk = require('walk'),
	emitter,
	common = require(__path + "plugins/org.goorm.plugin.web/modules/common.js");

module.exports = {
	run : function(req, evt) {
		var workspace = __path + "workspace/" + req.data.project_path;
		var target_path = common.run_path + req.data.project_path;
		var run_path = target_path.split("temp_files").pop();
		console.log("runProject "+run_path);
		
		if(!fs.existsSync(__path+"temp_files")) {
			fs.mkdirSync(__path+"temp_files");
		}
		if(!fs.existsSync(__path+"temp_files/plugins")) {
			fs.mkdirSync(__path+"temp_files/plugins");
		}
		if(!fs.existsSync(__path+"temp_files/plugins/web")) {
			fs.mkdirSync(__path+"temp_files/plugins/web");
		}
		if(!fs.existsSync(target_path)) {
			fs.mkdirSync(target_path);
		}
		
		emittor = walk.walk(workspace);
		
		emittor.on('file', function (path, stat, next){
			var abs_path = (path+"/"+stat.name).replace(workspace,"");
			fs.readFile(path + "/" + stat.name, "utf-8" , function(err, data) {
				if (err) throw err;
				fs.writeFile(target_path + abs_path, data, function(err) {
					if (err) throw err;
					
				});
			});
			next();
		});
		
		emittor.on("directory", function (path, stat, next) {
		  // dirStatsArray is an array of `stat` objects with the additional attributes
		  // * type
		  // * error
		  // * name
			var abs_path = (path+"/"+stat.name).replace(workspace,"");
			fs.exists(target_path+abs_path, function(exists) {
				if(!exists) {
					fs.mkdirSync(target_path+abs_path);
				}
				next();
			});
			
			next();
		});
		
		emittor.on("end", function () {
			evt.emit("do_run_complete", {
				code : 200,
				message : "success",
				run_path : run_path
			});
		});

	}
};