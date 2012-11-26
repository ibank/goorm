var EventEmitter = require("events").EventEmitter,
	exec = require('child_process').exec;

module.exports = {
	status: function(req, res) {
		var child = exec('svn status '+req.path,
			function (error, stdout, stderr) {
				var result = {"files":{}};
				var lines = stdout.split("\n");
				for(var i=0; i < lines.length; i++) {
					if(lines[i] != ""){
						var matches = lines[i].match(/(.)\s*(.*)/);
						var type = matches[1];
						var path = matches[2].split(req.repository).pop();
						result.files[path] = {"type":type};
					}
				}
				res.json(JSON.stringify(result));
		});
	}
};

