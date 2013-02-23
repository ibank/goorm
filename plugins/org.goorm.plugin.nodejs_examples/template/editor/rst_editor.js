#! /usr/bin/env node

var forever = require('forever')
	, commander = require('commander');


commander
	.command('start [option]')
	.option('-d, --daemon', 'run the server as a daemon using the forever module...')
	.action(function (env, options) {
		if (options.daemon) {
			forever.startDaemon(__dirname+'/app.js', {
				'env': { 'NODE_ENV': 'production' },
				'spawnWith': { env: process.env }
			});
			console.log("Realtime Editor server is started...");
		}
		else {
			forever.start(__dirname+'/app.js', []);
		}
	});

commander
	.command('restart')
	.action(function (env, options) {
		forever.stopAll();
		forever.startDaemon(__dirname+'/app.js', {
			'env': { 'NODE_ENV': 'production' },
			'spawnWith': { env: process.env }
		});
		
		console.log("Realtime Editor server is restarted...");
	});
	
commander
	.command('stop')
	.action(function (env, options) {
		forever.stopAll();
		
		console.log("Realtime Editor server is stopped...");
	});


commander.parse(process.argv);