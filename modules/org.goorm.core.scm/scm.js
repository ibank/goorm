
var sys = require('sys');
var spawn = require('child_process').spawn;
var scm_module;
module.exports = scm_module = {
	init: function(scm) {
		var scm_module;
		switch(scm){
		case "svn" :
			scm_module = require("./scm.svn");
			break;
		case "git" : 
		default :
			scm_module = require("./scm.git");
		}
		return scm_module;
	},
	index: function(req, res) {
		/* req {
		 * 		scm	// git, svn
		 * 		,mode // status
		 * 		,repository
		 * 		,path
		 * }
		 */
		
		// select scm module
		var scm = this.init(req.scm);
		switch(req.mode) {
		case "status": scm.status(req, res);
			break;
		}
	}
//	status: function(req, scm) {
//		scm.status(req.repository, req.path);
//	}
};

