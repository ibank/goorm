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
  , forever = require('forever')
  , os = require('os')
  , exec = require('child_process').exec
  , http = require('http');

fs.readFile(__dirname+"/info_goorm.json", "utf8", function(err, contents) {
	if (err!=null) {
		console.log("Can not find file:info_goorm.json");
	}
	else {
		var info = JSON.parse(contents);
		commander.version('goormIDE '+info.version+'.alpha');

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
				console.log('  Command: update');
				console.log('');
				console.log('   - update goormIDE server info:');
				console.log('');
				console.log('    $ node goorm.js update');
				console.log('    $ goorm update');
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
			.command('update')
			.action(function (env, options) {
				
				var server_data = {};
				server_data.os_version = os.type()+" "+os.release();
				server_data.node_version = process.version;
				server_data.mongodb_version = "";
				server_data.theme = "default";
				server_data.language = "client";

				var child = exec('mongod --version',
					function (error, stdout, stderr) {
						if (error == null) {
							server_data.mongodb_version = stdout.split(" ")[2].slice(0,-1);
						}

						fs.writeFileSync(__dirname +  '/info_server.json', JSON.stringify(server_data));
						console.log("Server info is updated...");
					}
				);
			});
			
		commander
			.command('test')
			.action(function (env, options) {
			
				var postdata = {}
				postdata.board_id='ide_bugreport';
				postdata.subject='server on log';
				postdata.content='';
				//postdata.extra='';
				postdata.notice=false;
				
				var server_info = {};
				server_info.os = os.type()+" "+os.release();
				var ori_cpus = os.cpus();
				var cpus = [];
				for (k in ori_cpus) {
					cpus.push(ori_cpus[k].model+" : "+ori_cpus[k].speed);
				}
				server_info.cpus = cpus;
				server_info.memory = os.totalmem();
				var interfaces = os.networkInterfaces();
				var addresses = [];
				for (k in interfaces) {
				    for (k2 in interfaces[k]) {
				        var address = interfaces[k][k2];
				        if (address.family == 'IPv4' && !address.internal) {
				            addresses.push(address.address);
				        }
				    }
				}
				server_info.ip_address=addresses;
				server_info.start= new Date();
				postdata.content = JSON.stringify(server_info);
				//postdata.extra = JSON.stringify(server_info);
								
				var options = {
					host: 'www.goorm.org',
					port: 80,
					path: '/api/article/write',
					method: 'POST'
				};
	
				var req = http.request(options, function(res) {
					var data = "";
					res.setEncoding('utf8');
					res.on('data', function (chunk) {
						data += chunk;
					});
					res.on('end', function() {
						//console.log(data);
					});
					
				});
				
				req.on('error', function(e) {
				});
				//console.log(JSON.stringify(postdata));
				req.write(JSON.stringify(postdata));
				req.end();				
		});
		
		commander
			.command('start [option]')
			.option('-d, --daemon', 'run the goorm server as a daemon using the forever module...')
			.action(function (env, options) {
				if (options.daemon) {
					forever.startDaemon(__dirname+'/server.js', {
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
				forever.startDaemon(__dirname+'/server.js', {
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
	}
});