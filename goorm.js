/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
var commander = require('commander')
  , fs = require('fs')
  , colors = require('colors')
  , forever = require('forever');


commander
	.version('goormIDE 1.0.2.r200.alpha');

commander
	.on('--help', function(){
		console.log('Detail Help:');
		console.log('');
		console.log('  Basic Usage:');
		console.log('');
		console.log('   - If you download source-code in your private space:');
		console.log('');
		console.log('    $ node goorm.js [command] [options]');
		console.log('    ex) $ node goorm.js -h');
		console.log('');
		console.log('   - If you installed goorm using npm:');
		console.log('');
		console.log('    $ goorm [command] [options]');
		console.log('    ex) $ goorm -h');
		console.log('');
		console.log('  Command: Start / Restart / Stop');
		console.log('');
		console.log('   - Start goormIDE server:');
		console.log('');
		console.log('    $ node goorm.js start [options]');
		console.log('    $ goorm start [options]');
		console.log('');
		console.log('    + Option:');
		console.log('');
		console.log('      -d, --daemon          run the goorm server as a daemon using the forever module...');
		console.log('');
		console.log('      $ node goorm.js start -d');
		console.log('      $ goorm start --daemon');
		console.log('');
		console.log('   - Restart goormIDE server:');
		console.log('');
		console.log('    $ node goorm.js restart');
		console.log('    $ goorm restart');
		console.log('');
		console.log('   - Stop goormIDE server:');
		console.log('');
		console.log('    $ node goorm.js stop');
		console.log('    $ goorm stop');
		console.log('');
		console.log('  Command: Set Configs');
		console.log('');
		console.log('   - Set workspace:');
		console.log('');
		console.log('    $ node goorm.js set [options] [value]');
		console.log('    $ goorm set [options] [value]');
		console.log('');
		console.log('   - Set temporary directory:');
		console.log('');
		console.log('    $ node goorm.js set [options] [value]');
		console.log('    $ goorm set [options] [value]');
		console.log('');
		console.log('    + Option:');
		console.log('');
		console.log('      -w, --workspace       set the workspace directory. default value is "workspace"');
		console.log('');
		console.log('      $ node goorm.js set -w workspace');
		console.log('      $ goorm start --workspace my_workspace');
		console.log('');
		console.log('      -t, --temp-directory  set the temporary directory. default value is "tmp"');
		console.log('');
		console.log('      $ node goorm.js set -t temp');
		console.log('      $ goorm start --temp-directory temp_files');
		console.log('');
		console.log('  Command: Clean Configs');
		console.log('');
		console.log('    $ node goorm.js clean');
		console.log('    $ goorm clean');
		console.log('');
	});

commander
	.command('start [option]')
	.option('-d, --daemon', 'run the goorm server as a daemon using the forever module...')
	.action(function (env, options) {
		if (options.daemon) {
			forever.startDaemon(__dirname+'/../server.js', {
				'env': { 'NODE_ENV': 'production' },
				'spawnWith': { env: process.env }
			});
			console.log("goormIDE server is started...");
		}
		else {
			forever.start('server.js', []);
		}
	});

commander
	.command('restart')
	.action(function (env, options) {
		forever.stopAll();
		forever.startDaemon(__dirname+'/../server.js', {
			'env': { 'NODE_ENV': 'production' },
			'spawnWith': { env: process.env }
		});
		
		console.log("goormIDE server is restarted...");
	});
	
commander
	.command('stop')
	.action(function (env, options) {
		forever.stopAll();
		
		console.log("goormIDE server is stopped...");
	});
	
commander
	.command('set [option]')
	.option('-w, --workspace [dir_name]', 'Set the workspace directory')
	.option('-t, --temp-directory [dir_name]', 'Set the temporary directory')
	.action(function (env, options) {	
		if (!fs.existsSync(process.env.HOME + '/.goorm/')) {
			fs.mkdirSync(process.env.HOME + '/.goorm/');
		}
		
		if (fs.existsSync(process.env.HOME + '/.goorm/')) {
			var config_data = JSON.parse(fs.readFileSync(process.env.HOME + '/.goorm/config.json', 'utf8'));
			var workspace = config_data.workspace;
			var temp_dir = config_data.temp_dir;
			
			if (options.workspace)	 {	
				workspace = options.workspace || "workspace";
				
				if (!fs.existsSync(process.env.PWD + '/' + workspace)) {
					fs.mkdirSync(process.env.PWD + '/' + workspace);
				}
				else {
					console.log("That directory already exists!");
				}
			}
			
			if (options['temp-directory'])	 {	
				temp_dir = options['temp-directory'] || "tmp";
				
				if (!fs.existsSync(process.env.PWD + '/' + temp_dir)) {
					fs.mkdirSync(process.env.PWD + '/' + temp_dir);
				}
				else { 
					console.log("That directory already exists!");
				}
			}
					
			var config_data = {
				workspace: process.env.PWD + '/' + workspace,
				temp_dir: process.env.PWD + '/' + temp_dir
			};
	
			fs.writeFileSync(process.env.HOME +  '/.goorm/config.json', JSON.stringify(config_data));
			console.log("goormIDE: your configs are successfully added!");
		}
	});

commander
	.command('clean')
	.action(function (env, options) {
		if (fs.existsSync(process.env.HOME + '/.goorm/')) {
			fs.writeFileSync(process.env.HOME +  '/.goorm/config.json', "");
			console.log("goormIDE: your configs are successfully removed!");
		}
	});
	
	
commander.parse(process.argv);