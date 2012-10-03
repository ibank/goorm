var fs = require("fs");
var rimraf = require('rimraf');

//var g_env = require("../configs/env.js");

var g_file = require("../modules/org.goorm.core.file/file");
var g_preference = require("../modules/org.goorm.core.preference/preference");
var g_project = require("../modules/org.goorm.core.project/project");
var g_terminal = require("../modules/org.goorm.core.terminal/terminal");
var g_theme = require("../modules/org.goorm.core.theme/theme");
var g_plugin = require("../modules/org.goorm.plugin/plugin");
var g_member_service = require("../modules/org.goorm.core.member/member_service");

var EventEmitter = require("events").EventEmitter;

/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'goormIDE' })
};


/*
 * API : Project
 */

exports.project = function(req, res){
	res.send(null);
};

exports.project.do_new = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("project_do_new", function (data) {
		res.json(data);
	});
	
	g_project.do_new(req.query, evt);
};

exports.project.do_load = function(req, res){
	res.send(null);
};

exports.project.do_save = function(req, res){
	res.send(null);
};

exports.project.do_delete = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("project_do_delete", function (data) {
		res.json(data);
	});

	g_project.do_delete(req.query, evt);
};

exports.project.get_list = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("project_get_list", function (data) {
		res.json(data);
	});
	
	g_project.get_list(evt);
};

exports.project.do_import = function(req, res){
	var evt = new EventEmitter();

	evt.on("project_do_import", function (data) {
		res.json(data);
	});

	g_project.do_import(req.body, req.files.file, evt);
};

exports.project.do_export = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("project_do_export", function (data) {
		res.json(data);
	});
	
	g_project.do_export(req.query, evt);
};

exports.project.do_clean = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("project_do_clean", function (data) {
		res.json(data);
	});
	
	g_project.do_clean(req.query, evt);
};

exports.project.get_property = function(req, res){
	var evt = new EventEmitter();
	evt.on("get_property", function (data) {
		res.json(data);
	});
	
	g_project.get_property(req.query, evt);
};


/*
 * API : Plugin
 */

exports.plugin = function(req, res){
	res.send(null);
};

exports.plugin.get_list = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("plugin_get_list", function (data) {
		res.json(data);
	});

	g_plugin.get_list(evt);
};

exports.plugin.do_new = function(req, res){
	g_plugin.do_new(req.query, res);
};

exports.plugin.generate = function(req, res){
	g_plugin.generate(req.query, res);
};

exports.plugin.build = function(req, res){
	g_plugin.build(req.query, res);
};

exports.plugin.clean = function(req, res){
	g_plugin.clean(req.query, res);
};

exports.plugin.run = function(req, res){
	g_plugin.run(req.query, res);
};

/*
 * API : File System
 */

exports.file = function(req, res){
	res.send(null);
};

exports.file.do_new = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("file_do_new", function (data) {
		res.json(data);
	});

	g_file.do_new(req.query, evt);
};

exports.file.do_new_folder = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("file_do_new_folder", function (data) {
		res.json(data);
	});

	g_file.do_new_folder(req.query, evt);
};

exports.file.do_new_other = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("file_do_new_other", function (data) {
		res.json(data);
	});

	g_file.do_new_other(req.query, evt);
};


exports.file.do_new_untitled_text_file = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_do_new_untitled_text_file", function (data) {
		res.json(data);
	});

	g_file.do_new_untitled_text_file(req.query, evt);
};

exports.file.do_load = function(req, res){
	res.send(null);
};

exports.file.do_save_as = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("file_do_save_as", function (data) {
		res.json(data);
	});

	g_file.do_save_as(req.query, evt);
};

exports.file.do_delete = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_do_delete", function (data) {
		res.json(data);
	});

	g_file.do_delete(req.query, evt);
};


exports.file.get_contents = function(req, res){
	var path = req.query.path;

	fs.readFile(__path + path, "utf8", function(err, data) {
		res.json(data);
	});
};

exports.file.get_url_contents = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_get_url_contents", function (data) {
		res.json(data);
	});

	g_file.get_url_contents(req.query.path, evt);
};

exports.file.put_contents = function(req, res){

	var evt = new EventEmitter();

	evt.on("file_put_contents", function (data) {
		res.json(data);
	});

	g_file.put_contents(req.query, evt);
};

exports.file.get_nodes = function(req, res){
	var evt = new EventEmitter();
	var path = req.query.path;
	path = path.replace(/\/\//g, "/");

	res.setHeader("Content-Type", "application/json");
	
	evt.on("got_nodes", function (data) {
		try {
			res.send(JSON.stringify(data));
			res.end();
		}
		catch (exception) {
			throw exception;
		}
	});
	
	g_file.get_nodes(__path + 'workspace/' + path, evt);
};

exports.file.get_dir_nodes = function(req, res){
	var evt = new EventEmitter();
	var path = req.query.path;
	path = path.replace(/\/\//g, "/");

	res.setHeader("Content-Type", "application/json");
	
	evt.on("got_dir_nodes", function (data) {
		try {
			//console.log(JSON.stringify(data));
			res.send(JSON.stringify(data));
			res.end();
		}
		catch (exception) {
			throw exception;
		}
	});
	
	g_file.get_dir_nodes(__path + 'workspace/' + path, evt);
};

exports.file.do_move = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_do_move", function (data) {
		res.json(data);
	});

	g_file.do_move(req.query, evt);
};

exports.file.do_rename = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_do_rename", function (data) {
		res.json(data);
	});

	g_file.do_rename(req.query, evt);
};

exports.file.get_property = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_get_property", function (data) {
		res.json(data);
	});

	g_file.get_property(req.query, evt);
};

exports.file.do_export = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_do_export", function (data) {
		res.json(data);
	});

	g_file.do_export(req.query, evt);
};

exports.file.do_import = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_do_import", function (data) {
		res.json(data);
	});

	g_file.do_import(req.body, req.files.file, evt);
};


/*
 * API : Terminal
 */

exports.terminal = function(req, res){
	res.send(null);
};

exports.terminal.exec = function(req, res){
	var evt = new EventEmitter();
	var command = req.query.command;
	
	console.log(command);
	res.setHeader("Content-Type", "application/json");
	
	evt.on("executed_command", function (data) {
		try {
			res.send(JSON.stringify(data));
			res.end();
		}
		catch (exception) {
			throw exception;
		}
	});
	
	g_terminal.exec(command, evt);
};

/*
 * API : Preference
 */

exports.preference = function(req, res){
	res.send(null);
};

exports.preference.save = function(req, res){
	res.send(null);
};

exports.preference.ini_parser = function(req, res){
	res.send(null);
};

exports.preference.ini_maker = function(req, res){
	res.send(null);
};

/*
 * API : Theme
 */
exports.theme = function(req, res){
	res.send(null);
};

exports.theme.get_list = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("theme_get_list", function (data) {
/* 		res.json(data[1].contents.title); */
		res.json(data);
	});
	
	g_theme.get_list(evt);

};
exports.theme.get_contents = function(req, res){
	var path = req.query.path;

	fs.readFile(__path + path, "utf8", function(err, data) {
		res.json(data);
	});
};
exports.theme.put_contents = function(req, res){
	var evt = new EventEmitter();

	evt.on("theme_put_contents", function (data) {
		res.json(data);
	});

	g_theme.put_contents(req.query, evt);
	/* 	res.send(null); */
};

/*
 * Download and Upload
 */
 
exports.download = function(req, res) {
	
	res.download(__path+'temp_files/'+req.query.file, function(err) {
		
		rimraf(__path+'temp_files/'+req.query.file, function(err) {
			if (err!=null) {
			}
			else {
				// download and remove complete
			}
		});

		
	}, function (err) {
		// ...
	});
};


/*************************
 * 로그인 관련
 *************************/
//id/pw 로그인
exports.member = {};
exports.member.login = function(req, res){
	g_member_service.login(req, function(result) { 
		res.send(result); 
	});
/*
	req.logout(); //소셜로그인 되어있던게 있으면 로그아웃 시킴
	service.member.login(req, function(result){ res.json(result); });
*/
};
//로그아웃
exports.member.logout = function(req, res){
	res.send("member logout");
/*
	service.member.logout(req, function(result){ 
		res.json(result); 
	}); 
*/
};
//현재 로그인 상태 (로그인한 계정의 정보)
exports.member.login_status = function(req, res){
	res.send("member login status");
/*
	service.member.get_login_status(req, function(result){ 
		res.json(result); 
	}); 
*/
};
