#! /usr/bin/env node

/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
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
  , http = require('http')
  , querystring = require('querystring');

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
				console.log('      -d, --daemon           run the goorm server as a daemon using the forever module...');
				console.log('      -p, --port [PORT NUM]  run the goorm server with port which you want...');
				console.log('');
				console.log('      $ node goorm.js start -d');
				console.log('      $ goorm start --daemon');
				console.log('      $ node goorm.js start -p 9999');
				console.log('      $ goorm start --port 9999');
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
				console.log('      -t, --temp-directory  set the temporary directory. default value is "temp_files"');
				console.log('');
				console.log('      $ node goorm.js set -t temp');
				console.log('      $ goorm set --temp-directory temp_files');
				console.log('');
				console.log('      $ node goorm.js set -f appId,appSecret');
				console.log('      $ goorm set --api-key-facebook appId,appSecret');
				console.log('');
				console.log('      $ node goorm.js set -b consumerKey,consumerSecret');
				console.log('      $ goorm set --api-key-twitter consumerKey,consumerSecret');
				console.log('');
				console.log('      $ node goorm.js set -g appId,appSecret');
				console.log('      $ goorm set --api-key-google appId,appSecret');
				console.log('');
				console.log('      $ node goorm.js set -h appId,appSecret');
				console.log('      $ goorm set --api-key-github appId,appSecret');
				console.log('');
				console.log('      $ node goorm.js set -d clientId');
				console.log('      $ goorm set --api-key-google_drive clientId');
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
				
				var print_message = 'Do you want to send server information to developer?(yes/no) ';
				commander.confirm(print_message, function(arg){
					process.stdin.pause();
					
					if(arg) {
						send_log("server update", command_update);
					}
					else {
						command_update();
					}
				});
			});
			
		commander
			.command('start [option]')
			.option('-d, --daemon', 'run the goorm server as a daemon using the forever module...')
			.option('-p, --port [PORT NUM]', 'run the goorm server with port which you want...')
			.option('-s, --send-info [Y/N],', 'send server information to developer...')
			.option('-h, --home [HOME Directory]', 'set HOME directory in server')
			.option('--service', 'run the goorm server as a service mode...')
			.action(function (env, options) {
				var process_options = [];
				process_options.push(options.port);
				process_options.push(options.home);
				var service_mode = false;

				function start_process(){
					if (options.daemon) {							
						forever.startDaemon(__dirname+'/server.js', {
							'env': { 'NODE_ENV': 'production' },
							'spawnWith': { env: process.env },
							'options': process_options
						});
						console.log("goormIDE server is started...");
					}
					else {
						forever.start(__dirname+'/server.js', {'options': process_options});
					}
				}
				
				if(options.service){
					service_mode = true;
					process_options.push(service_mode);
				}
				
				if(options['sendInfo']){
					var send = options['sendInfo'];
					if(send == 'y' || send == 'yes' || send == 'Y' || send == 'Yes'){
						send_log("server start", function() {});
					}

					start_process();
				}
				else{
					var print_message = 'Do you want to send server information to developer?(yes/no) ';
					commander.confirm(print_message, function(arg){
						process.stdin.pause();

						if(arg) {
							send_log("server start", function() {});
						}

						start_process();
					});
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
			.option('-f, --api-key-facebook [app_id],[app_secret]', 'Set the facebook app key(please do not enter whitespace.)')
			.option('-b, --api-key-twitter [consumer_key],[consumer_secret]', 'Set the twitter app key(please do not enter whitespace.)')
			.option('-g, --api-key-google [app_id],[app_secret]', 'Set the google app key(please do not enter whitespace.)')
			.option('-h, --api-key-github [app_id],[app_secret]', 'Set the github app key(please do not enter whitespace.)')
			.option('-d, --api-key-google_drive [client_id]', 'Set the google drive app key')
			.option('--set-uid [uid]', 'Set uid')
			.option('--set-gid [gid]', 'Set gid')
			.action(function (env, options) {	
				if (!fs.existsSync(process.env.HOME + '/.goorm/')) {
					fs.mkdirSync(process.env.HOME + '/.goorm/');
					fs.writeFileSync(process.env.HOME + '/.goorm/config.json', "", 'utf8');
				}
				else if(!fs.existsSync(process.env.HOME + '/.goorm/config.json')){
					fs.writeFileSync(process.env.HOME + '/.goorm/config.json', "", 'utf8');
				}
				
				if (fs.existsSync(process.env.HOME + '/.goorm/')) {
					var config_data = {};
					var raw_config_data = fs.readFileSync(process.env.HOME + '/.goorm/config.json', 'utf8');
					if(raw_config_data && typeof(raw_config_data) != 'object' ) config_data = JSON.parse(fs.readFileSync(process.env.HOME + '/.goorm/config.json', 'utf8'));
					
					var workspace = config_data.workspace || process.env.PWD + '/' + "workspace/";
					var temp_dir = config_data.temp_dir || process.env.PWD + '/' + "temp_files/";
					var social_key = config_data.social_key || {};
					var uid = config_data.uid || null;
					var gid = config_data.gid || null;
					
					if (options.workspace)	 {	
						workspace = options.workspace || process.env.PWD + '/' + "workspace/";
						
						if (!fs.existsSync(workspace)) {
							fs.mkdirSync(workspace);
						}
						else {
							console.log("That directory already exists!");
						}
					}
					
					if (options['tempDirectory'])	 {	
						temp_dir = options['tempDirectory'] || process.env.PWD + '/' + "temp_files/";
						
						if (!fs.existsSync(temp_dir)) {
							fs.mkdirSync(temp_dir);
						}
						else { 
							console.log("That directory already exists!");
						}
					}
					
					if (options['setUid'])	 {	
						uid = options['setUid'] || null;
					}
					if (options['setGid'])	 {	
						gid = options['setGid'] || null;
					}
					
					if(options['apiKeyFacebook'])	{
						if(!social_key['facebook']) social_key['facebook'] = {};
						
						var raw_keys = options['apiKeyFacebook'].replace(" ", "");
						var data = raw_keys.split(",");
						
						social_key['facebook']['appId'] = data[0] || social_key['facebook']['appId'] || "";
						social_key['facebook']['appSecret'] = data[1] || social_key['facebook']['appSecret'] || "";
					}
					
					if(options['apiKeyTwitter'])	{
						if(!social_key['twitter']) social_key['twitter'] = {};
						
						var raw_keys = options['apiKeyTwitter'].replace(" ", "");
						var data = raw_keys.split(",");
						
						social_key['twitter']['consumerKey'] = data[0] || social_key['twitter']['consumerKey'] || "";
						social_key['twitter']['consumerSecret'] = data[1] || social_key['twitter']['consumerSecret'] || "";
					}
					
					if(options['apiKeyGoogle'])	{
						if(!social_key['google']) social_key['google'] = {};
						
						var raw_keys = options['apiKeyGoogle'].replace(" ", "");
						var data = raw_keys.split(",");
						
						social_key['google']['appId'] = data[0] || social_key['google']['appId'] || "";
						social_key['google']['appSecret'] = data[1] || social_key['google']['appSecret'] || "";
					}
					
					if(options['apiKeyGithub'])	{
						if(!social_key['github']) social_key['github'] = {};
						
						var raw_keys = options['apiKeyGithub'].replace(" ", "");
						var data = raw_keys.split(",");
						
						social_key['github']['appId'] = data[0] || social_key['github']['appId'] || "";
						social_key['github']['appSecret'] = data[1] || social_key['github']['appSecret'] || "";
					}


					if(options['apiKeyGoogle_drive'])	{
						if(!social_key['google_drive']) social_key['google_drive'] = {};
						
						var raw_keys = options['apiKeyGoogle_drive'].replace(" ", "");
						
						social_key['google_drive']['client_id'] = raw_keys || social_key['google_drive']['client_id'] || "";
					}
					
					
					if(workspace && workspace[workspace.length - 1] != '/') workspace = workspace + '/';
					if(temp_dir && temp_dir[temp_dir.length - 1] != '/') temp_dir = temp_dir + '/';
					
					var config_data = {
						workspace: workspace,
						temp_dir: temp_dir,
						social_key : social_key,
						uid : uid,
						gid : gid
					};
			
					fs.writeFileSync(process.env.HOME +  '/.goorm/config.json', JSON.stringify(config_data), 'utf8');
					console.log("goormIDE: your configs are successfully added!");
				}
			})
		
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

function send_log(title, callback) {

	var ori_data = {};
	ori_data.board_id='ide_log';
	ori_data.subject=title;
	ori_data.content='';
	ori_data.language='ko';
	
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
	
	var contents = "";
	contents += "<b>OS : </b>"+server_info.os+"<br/>";
	contents += "<b>CPU : </b>"+server_info.cpus+"<br/>";
	contents += "<b>MEMORY : </b>"+server_info.memory+"<br/>";
	contents += "<b>IP : </b>"+server_info.ip_address;
	ori_data.content = contents;

	var post_data = querystring.stringify(ori_data);
	
	var post_options = {
		host: 'www.goorm.io',
		port: '80',
		path: '/api/article/write',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};
	
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		
		var data = "";
		
		res.on('data', function (chunk) {
			data += chunk;
		});
		
		res.on('end', function() {
			console.log("Information was sent.");
			callback();
		});		
	});
	
	post_req.on('error', function(e) {
	});
	
	post_req.write(post_data);
	post_req.end();
}

function command_update() {
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
			process.stdin.destroy();
		}
	);
}
