var fs = require('fs'),
	walk = require('walk'),
	emitter,
	common = require(__path + "plugins/org.goorm.plugin.web/modules/common.js");

module.exports = {
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
	
	run : function(req, evt) {
		var self = this;
		var workspace = __workspace + "/" + req.data.project_path;
		var target_path = common.run_path + req.data.project_path;
		var run_path = target_path.split("temp_files").pop();
		
		if(!fs.existsSync(__temp_dir)) {
			fs.mkdirSync(__temp_dir);
		}
		if(!fs.existsSync(__temp_dir + "/plugins")) {
			fs.mkdirSync(__temp_dir + "/plugins");
		}
		if(!fs.existsSync(__temp_dir + "/plugins/web")) {
			fs.mkdirSync(__temp_dir + "/plugins/web");
		}
		if(!fs.existsSync(target_path)) {
			fs.mkdirSync(target_path);
		}
		
		emitter = walk.walk(workspace);
		
		emitter.on('file', function (path, stat, next){
			var abs_path = (path + "/"+stat.name).replace(workspace,"");
			self.copy_file_sync(path + "/" + stat.name, target_path + abs_path);
			next();
		});
		
		emitter.on("directory", function (path, stat, next) {
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
		
		emitter.on("end", function () {
			evt.emit("do_run_complete", {
				code : 200,
				message : "success",
				run_path : run_path
			});
		});
	}
};