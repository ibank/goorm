var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' exit');
	});
	
	cluster.on('online', function(worker) {
		console.log("worker %s (%s) online", worker.id, worker.process.pid);
	});
	
	cluster.on('listening', function(worker, address) {
		console.log("worker %s listening %s:%s", worker.id, address.address, address.port);
	});
} else {
	var server = require('./app');
	server.listen(3000);
}
