var fs = require('fs');
var common = require(__path + "plugins/org.goorm.plugin.cpp/modules/common.js");

module.exports = {
	do_new : function(req, evt) {
		var workspace = __path + "workspace/" + req.data.project_author + "_" + req.data.project_name;
		fs.readFile(common.path + 'template/template.main.c', function(err,	data) {
			if (err) throw err;
			fs.writeFile(workspace + "/main.c", data, function(err) {
				if (err) throw err;
				evt.emit("do_new_complete", {
					code : 200,
					message : "success"
				});
			});
		});
	}
};