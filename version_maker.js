/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
var commander = require('commander')
  , fs = require('fs')
  , exec = require('child_process').exec;

fs.readFile(__dirname+"/info_goorm.json", "utf8", function(err, contents) {
	if (err!=null) {
		console.log("Can not find file:info_goorm.json");
	}
	else {
		var goorm_data = {};
		goorm_data.version = "";
		goorm_data.url = "http://www.goorm.io";
		goorm_data.lib = [];
		goorm_data.lib.push( { "name" : "YUI", "version" : "2.9.0" });
		goorm_data.lib.push( { "name" : "jQuery", "version" : "1.7.2" });
		goorm_data.lib.push( { "name" : "jQuery UI", "version" : "1.8.12" });
		goorm_data.lib.push( { "name" : "CodeMirror", "version" : "2.32.0" });

		var contents_obj = JSON.parse(contents);
		var prev_version = contents_obj.version.split(".");
		var print_message = 'version(exist: '+prev_version[0]+"."+prev_version[1]+"."+prev_version[2]+'): ';
		commander.prompt(print_message, function(version){
			
			var child = exec('svn info',
				function (error, stdout, stderr) {
					if (error == null) {
						goorm_data.version = version+".r"+stdout.split(": ")[5].slice(0,3);
					}

					fs.writeFileSync(__dirname +  '/info_goorm.json', JSON.stringify(goorm_data));
					console.log("Goorm info is updated...");
				}
			);
			
			fs.writeFileSync(__dirname +  '/info_goorm.json', JSON.stringify(goorm_data));
			process.stdin.destroy();
		});
	}
});