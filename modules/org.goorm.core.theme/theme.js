/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var fs = require('fs');
var walk = require('walk');
var rimraf = require('rimraf');
var EventEmitter = require("events").EventEmitter;
var exec = require('child_process').exec;

var themes = [];

module.exports = {
	init: function () {
	
	},
	
	get_list: function (evt) {
		var self = this;
		themes = [];

		var options = {
			followLinks: false
		};
		var walker = walk.walk(__path+"public/configs/themes", options);
		
		walker.on("directories", function (root, dirStatsArray, next) {
			var count = dirStatsArray.length;
			if (root==__path+"public/configs/themes" ) {
				var dir_count = 0;
				var evt_dir = new EventEmitter();

				evt_dir.on("get_list", function () {
					dir_count++;

					if (dir_count<dirStatsArray.length) {
						self.get_theme_info(dirStatsArray[dir_count], evt_dir);
					}
					else {
						evt.emit("theme_get_list", themes);
					}
				});
				self.get_theme_info(dirStatsArray[dir_count], evt_dir);
			}			
			next();
		});
		
		walker.on("end", function () {
		});
	},
	
	get_theme_info: function (dirStatsArray, evt_dir) {
		var theme = {};
		theme.name = dirStatsArray.name;

		fs.readFile(__path+"public/configs/themes/"+theme.name+"/theme.json", 'utf-8', function (err, data) {
			if (err==null) {
				theme.contents = JSON.parse(data);
				//theme.contents.title
				themes.push(theme);
			}
			evt_dir.emit("get_list");
		});
	},
	
	put_contents: function (query, evt) {
		var data = {};

		fs.writeFile(__path+'public/configs/themes/'+query.path, query.data, function(err) {
			if (err!=null) {
				data.err_code = 10;
				data.message = "Can not save";
	
				evt.emit("theme_put_contents", data);
			}
			else {
				data.err_code = 0;
				data.message = "saved";
	
				evt.emit("theme_put_contents", data);
			}
		});
	}
};
