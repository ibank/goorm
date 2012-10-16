var common = require(__path+"plugins/org.goorm.plugin.cpp/modules/common.js");
var EventEmitter = require("events").EventEmitter;

module.exports = {
	do_new: function(req, res) {
		var evt = new EventEmitter();
		var new_project = require(common.path+"modules/project/new_project.js");
		/* req.data = 
		   { 
			project_type,
			project_detailed_type,
			project_author,
			project_name,
			project_about,
			use_collaboration
		   }
		*/
		
		evt.on("do_new_complete", function (data) {
			res.json(data);
		});
		
		new_project.do_new(req, evt);
	}
	
//	debug: function(req, evt) {
//		var debug = require(common.path+"modules/project/debug.js");
//		
//		if(req.mode == "init") {
//			debug.init(req, evt);
//		}
//		else if (req.mode == "close") {
//			debug.close();
//		}
//		else {
//			debug.debug(req, evt);
//		}
//	}
};