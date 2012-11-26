var EventEmitter = require("events").EventEmitter,
	git = require("gift");

module.exports = {
	clone: function(io, src, target){
		var git = spawn("git", ['clone','-v','--progress','https://github.com/sentientwaffle/gift.git','../../test']);
		git.stdout.on('data', function(data) {
			sys.puts(data);
		});
		git.stderr.on('data', function(data) {
			sys.puts(data);
		});
		git.on('exit', function(data) {
			sys.puts("finished");
		});
	},
	status: function(req, res) {
		repo=git(req.repository);
		repo.status(function(err, status){
			res.json(status);
		});
	}
};