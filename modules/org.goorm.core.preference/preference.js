/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var fs = require('fs');

module.exports = {
	init: function () {
	
	},
	
	get_server_info: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";
		data.info = __path;

		fs.readFile(__path+"info_server.json", "utf8", function(err, contents) {
			if (err!=null) {
				data.err_code = 40;
				data.message = "Cannot find target file";
			
				evt.emit("preference_get_server_info", data);
			}
			else {
				data.info = JSON.parse(contents);
				evt.emit("preference_get_server_info", data);
			}
		});
	},
	
	get_goorm_info: function (query, evt) {
		var data = {};
		data.err_code = 0;
		data.message = "process done";
		data.info = __path;

		fs.readFile(__path+"info_goorm.json", "utf8", function(err, contents) {
			if (err!=null) {
				data.err_code = 40;
				data.message = "Cannot find target file";
			
				evt.emit("preference_get_goorm_info", data);
			}
			else {
				data.info = JSON.parse(contents);
				evt.emit("preference_get_goorm_info", data);
			}
		});
	},
	
	put_filetypes: function (query, evt) {
		var data = {};

		fs.writeFile(__path+'public/configs/filetype/filetype.json', query.data, function(err) {
			if (err!=null) {
				data.err_code = 10;
				data.message = "Can not save";
	
				evt.emit("preference_put_filetypes", data);
			}
			else {
				data.err_code = 0;
				data.message = "saved";
	
				evt.emit("preference_put_filetypes", data);
			}
		});
	}
};
