var fs = require('fs'),
	walk = require('walk'),
	emitter,
	common = require(__path + "plugins/org.goorm.plugin.nodejs/modules/common.js");

module.exports = {
	copyFileSync : function(srcFile, destFile) {
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
	do_new : function(req, evt) {
		var self = this;
		var workspace = __workspace + "/" + req.data.project_author + "_" + req.data.project_name;
		var template = common.path + "template";
		if(req.data.project_detailed_type) {
			template += "/"+req.data.project_detailed_type;
		}
		
		emittor = walk.walk(template);
		
		emittor.on('file', function (path, stat, next){
			var abs_path = (path+"/"+stat.name).replace(template,"");
			self.copyFileSync(path + "/" + stat.name, workspace + abs_path);
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
				}
				next();
			});
			
			next();
		});
		
		emittor.on("end", function () {
			fs.readFile(workspace+"/project.json", 'utf-8', function (err, file_data) {
				var contents = JSON.parse(file_data);
				contents.plugins = req.data.plugins;
				contents.detailedtype = req.data.project_detailed_type;
				fs.writeFile(workspace+"/project.json", JSON.stringify(contents), 'utf-8', function (err) {
					if (err==null) {
						evt.emit("do_new_complete", {
							code : 200,
							message : "success"
						});
					}
				});
			});
		});

	}
};