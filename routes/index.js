/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var fs = require("fs");
var rimraf = require('rimraf');


//var g_env = require("../configs/env.js");

var g_file = require("../modules/org.goorm.core.file/file");
var g_preference = require("../modules/org.goorm.core.preference/preference");
var g_project = require("../modules/org.goorm.core.project/project");
var g_scm = require("../modules/org.goorm.core.scm/scm");
var g_terminal = require("../modules/org.goorm.core.terminal/terminal");
var g_theme = require("../modules/org.goorm.core.theme/theme");
var g_plugin = require("../modules/org.goorm.plugin/plugin");
var g_help = require("../modules/org.goorm.help/help");
var g_auth = require("../modules/org.goorm.auth/auth");
var g_auth_manager = require("../modules/org.goorm.auth/auth.manager");
var g_auth_project = require("../modules/org.goorm.auth/auth.project");
var g_admin = require("../modules/org.goorm.admin/admin");
var g_social = require("../modules/org.goorm.auth/social");
var g_history = require("../modules/org.goorm.core.collaboration/collaboration.history");
var g_message = require("../modules/org.goorm.core.collaboration/collaboration.message");
var g_collaboration = require("../modules/org.goorm.core.collaboration/collaboration");
//by sim
var g_edit = require("../modules/org.goorm.core.edit/edit");
//by sim

var EventEmitter = require("events").EventEmitter;

/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'goormIDE' });
	g_file.init();
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

	evt.on("project_add_db", function (data) {
		g_auth.get_user_data(req.session, function(user_data){
			data.author_id = user_data.id;
			data.author_type = user_data.type;

			g_auth_project.add(data);
		})
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
	g_auth_project.remove(req.query);
	g_history.empty_project_history(req.query.project_path);
};

exports.project.get_list = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("project_get_list", function (data) {
		res.json(data);
	});

	g_auth.get_user_data(req.session, function(user_data){
		req.query['author'] = {
			author_id : user_data.id,
			author_type : user_data.type
		}

		g_project.get_list(req.query, evt);
	});
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

exports.project.set_property = function(req, res){
	var evt = new EventEmitter();
	evt.on("set_property", function (data) {
		res.json(data);
	});
	
	g_project.set_property(req.query, evt);
};

/*
 * API : SCM
 */
exports.scm = function(req, res){
	g_scm.index(req.query, res);
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

exports.plugin.extend_function = function(req, res) {
	g_plugin.extend_function(req.query, res);	
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
	g_history.empty_file_history(req.query.filename);
};


exports.file.get_contents = function(req, res){
	var path = req.query.path;

	fs.readFile(__path + path, "utf8", function(err, data) {
		res.json(data);
	});
};

exports.file.get_contents2 = function(req, res){
	var path = req.query.path;

	fs.readFile(__path + path, "base64",function(err, data) {
		res.send(data);
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

	// g_file.put_contents(req.query, evt);
	g_file.put_contents(req.body, evt);
};

exports.file.get_nodes = function(req, res){
	var evt = new EventEmitter();
	var path = req.query.path;
	var type = req.query.type || null;
	path = path.replace(/\/\//g, "/");

	//res.setHeader("Content-Type", "application/json");

	evt.on("got_nodes", function (data) {
		try {
			res.json(data);
			//res.send(JSON.stringify(data));
			//res.end();
		}
		catch (exception) {
			throw exception;
		}
	});

	g_auth.get_user_data(req.session, function(user_data){
		var nodes_data = {
			path : __workspace+'/' + path,
			author : {
				author_id : user_data.id,
				author_type : user_data.type
			}
		};

		g_file.get_nodes(nodes_data, evt, type);
	});
};

exports.file.get_dir_nodes = function(req, res){
	var evt = new EventEmitter();
	var path = req.query.path;
	path = path.replace(/\/\//g, "/");


	//res.setHeader("Content-Type", "application/json");
	
	evt.on("got_dir_nodes", function (data) {
		try {
			//console.log(JSON.stringify(data));
			res.json(data);
			
			//res.send(JSON.stringify(data));
			//res.end();
		}
		catch (exception) {
			throw exception;
		}
	});
	
	g_auth.get_user_data(req.session, function(user_data){
		req.query.path = __workspace+'/' + path;
		req.query['author'] = {
			author_id : user_data.id,
			author_type : user_data.type
		}

		g_file.get_dir_nodes(req.query, evt);
	});
};

exports.file.get_file = function(req, res){
	var evt = new EventEmitter();
	var filepath = req.query.filepath;
	var filename = req.query.filename;
	filepath = filepath.replace(/\/\//g, "/");

	//res.setHeader("Content-Type", "application/json");
	
	evt.on("got_file", function (data) {
		try {
			//console.log(JSON.stringify(data));
			res.json(data);
			
			//res.send(JSON.stringify(data));
			//res.end();
		}
		catch (exception) {
			throw exception;
		}
	});
	
	g_file.get_file(filepath, filename, evt);
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

exports.file.do_search_on_project = function(req, res){
	var evt = new EventEmitter();

	evt.on("file_do_search_on_project", function (data) {
		res.send(data);
	});
	
	g_file.do_search_on_project(req.query, evt);
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
		
	evt.on("executed_command", function (data) {
		try {
			res.json(data);
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

exports.preference.get_server_info = function(req, res){
	var evt = new EventEmitter();

	evt.on("preference_get_server_info", function (data) {
		res.json(data);
	});

	g_preference.get_server_info(req.query, evt);
};

exports.preference.get_goorm_info = function(req, res){
	var evt = new EventEmitter();

	evt.on("preference_get_goorm_info", function (data) {
		res.json(data);
	});

	g_preference.get_goorm_info(req.query, evt);
};
exports.preference.put_filetypes = function(req, res){
	var evt = new EventEmitter();

	evt.on("preference_put_filetypes", function (data) {
		res.json(data);
	});

	g_preference.put_filetypes(req.query, evt);
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
 * API : Help
 */
exports.help = function(req, res){
	res.send(null);
};

exports.help.get_readme_markdown = function(req, res){
	var data = g_help.get_readme_markdown(req.query.language);
	
	res.json(data);
};

exports.help.send_to_bug_report = function(req, res) {
	var evt = new EventEmitter();
	
	evt.on("help_send_to_bug_report", function (data) {
		res.json(data);
	});
	
	g_help.send_to_bug_report(req.query, evt);
}

/*
 * API : Auth
 */
exports.auth = function(req, res){
	res.send(null);
};
 
exports.auth.get_info = function(req, res){
	g_auth.get_user_data(req.session, function(user_data){
		res.json(user_data);
	});
};

exports.auth.login = function(req, res){
	g_auth_manager.login(req.body, req, function(result){
		res.json(result);
	});
}

exports.auth.login.duplicate = function(req, res){
	g_auth_manager.disconnect_user_and_login(req.body, function(data){
		res.json(true);
	})
}

exports.auth.logout = function(req, res){
	g_auth_manager.logout(req, function(result){
		res.json(result);
	});
}

exports.auth.signup = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("auth_check_user_data", function (data) {
		if(data.result){
			g_auth_manager.register(req, function(result){
				res.json({
					'type' : 'signup',
					'data' : result
				});
			});
		}
		else{
			res.json({
				'type' : 'check',
				'data' : data
			});
		}
	});
	
	g_auth_manager.check(req.body, evt);
};

exports.auth.signup.check = function(req, res){
	var evt = new EventEmitter();

	evt.on("auth_check_user_data", function (data) {
		res.json(data);
	});

	g_auth_manager.check(req.body, evt);
};

exports.admin = function(req, res){
	res.json(null);
}

exports.admin.check = function(req, res){
	g_auth_manager.check_admin(function(result){
		res.json(result);
	});
}

exports.admin.get_config = function(req, res){
	g_admin.get_config(function(config){
		res.json(config);
	});
}

exports.admin.set_config = function(req, res){
	g_admin.set_config(req.body, function(result){
		res.json(result);
	});
}

exports.admin.user_add = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("auth_check_user_data", function (data) {
		if(data.result){
			g_auth_manager.user_add(req.body, function(result){
				res.json({
					'type' : 'signup',
					'data' : result
				});
			});
		}
		else{
			res.json({
				'type' : 'check',
				'data' : data
			});
		}
	});
	
	g_auth_manager.check(req.body, evt);
}

exports.admin.user_del = function(req, res){
	g_auth_manager.remove(req.body, function(result){
		res.json(result);
	});
}

exports.admin.user_avail_blind = function(req, res){
	g_auth_manager.avail_blind(req.body, function(result){
		res.json(result);
	});
}

exports.user = function(req, res){
	res.json(null);
}

exports.user.get = function(req, res){
	g_auth_manager.user_get(req.body, function(data){
		res.json(data);
	});
}

exports.user.set = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("auth_set_check_user_data", function (data) {
		if(data.result){
			g_auth_manager.user_set(req, function(result){
				res.json({
					'type' : 'set',
					'data' : result // true, false
				});
			});
		}
		else{
			res.json({
				'type' : 'check',
				'data' : data // code, result
			});
		}
	});

	var type = (req.body.type).toLowerCase();
	
	if(req.session.auth && req.session.auth.loggedIn && req.body.id == req.session.auth[type].user.id){
		g_auth_manager.set_check(req.body, evt);
	}
	else{
		var data = {
			'result' : false,
			'code' : 4 // no session or id unmatch
		}
		
		res.json({
			'type' : 'check',
			'data' : data
		});
	}
		
}

exports.user.list = function(req, res){
	g_auth_manager.get_list(function(data){
		res.json(data);
	});
}

exports.user.project = function(req, res){
	res.json(null);
}

exports.user.project.get = function(req, res){
	g_auth_project.get(req.query, function(data){
		res.json(data);
	})
}

exports.user.project.list = function(req, res){
	g_auth_project.get_all_list(req.query, function(data){
		res.json(data);
	})
}

exports.user.project.list.no_co_developers = function(req, res){
	g_auth_manager.get_match_list(req.query, function(user_list){
		req.query.user_list = user_list;

		g_auth_project.get_no_co_developers_list(req.query, function(data){
			res.json(data);
		})
	})
}

exports.user.project.collaboration = function(req, res){
	res.json(null);
}

exports.user.project.collaboration.push = function(req, res){
	g_auth_project.push(req.body, function(data){
		res.json(data);
	})
}

exports.user.project.collaboration.pull = function(req, res){
	g_auth_project.pull(req.body, function(data){
		res.json(data);
	})
}

exports.user.project.collaboration.invitation = function(req, res){
	res.json(null);
}

exports.user.project.collaboration.invitation.push = function(req, res){
	g_auth_project.invitation_push(req.body, function(data){
		res.json(data);
	})	
}

exports.user.project.collaboration.invitation.pull = function(req, res){
	g_auth_project.invitation_pull(req.body, function(data){
		res.json(data);
	})	
}


exports.message = function(req, res){
	res.json(null);
}

exports.message.get = function(req, res){
	g_auth.get_user_data(req.session, function(user_data){
		req.query.user_id = user_data.id;
		req.query.user_type = user_data.type;

		g_message.get(req.query, function(data){
			res.json(data);
		});
	})
}

exports.message.list = function(req, res){
	g_auth.get_user_data(req.session, function(user_data){
		req.query.user_id = user_data.id;
		req.query.user_type = user_data.type;

		g_message.get_list(req.query, function(data){
			res.json(data);
		});
	})
}

exports.message.list.receive = function(req, res){
	g_auth.get_user_data(req.session, function(user_data){
		req.query.user_id = user_data.id;
		req.query.user_type = user_data.type;

		g_message.get_receive_list(req.query, function(data){
			res.json(data);
		});
	})
}

exports.message.list.unchecked = function(req, res){
	g_auth.get_user_data(req.session, function(user_data){
		req.query.user_id = user_data.id;
		req.query.user_type = user_data.type;

		g_message.get_unchecked(req.query, function(data){
			res.json(data);
		});
	})
}

exports.message.edit = function(req, res){
	g_message.edit(req.body, function(data){
		res.json(data);
	});
}

exports.message.check = function(req, res){
	req.body.checked = true;

	g_message.edit(req.body, function(data){
		res.json(data);
	});
}

/*
 * Download and Upload
 */
 
exports.download = function(req, res) {
	
	res.download(__temp_dir+'/'+req.query.file, function(err) {
		
		rimraf(__temp_dir+'/'+req.query.file, function(err) {
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

/*
 * Social
 */

exports.social = function(req, res){
	res.send(null);
};

exports.social.login = function(req, res){
	var social_type = req.query.type;
	if(!social_type) res.redirect('/');
	
	var g_social_m = new g_social(social_type);
	g_social_m.login(req, function(result){
		res.redirect('/');
	});
};

exports.social.possible_list = function(req, res){
	var list = global.__social_key['possible_list'] || [];
	res.json(list);
};

exports.social.twitter = function(req, res){
	var method = req.route.method;
	var api_root = req.body.api_root;
	var data = req.body.data;

	var g_social_m = new g_social('twitter');
	g_social_m.load(req.session.auth['twitter'], method, api_root, data, function(result){
		res.json(result);
	});
};


/*
* Cloud
*/

exports.cloud = function(req, res){
	res.send(null);
};

exports.cloud.google_drive = function(req, res){
	res.json(global.__social_key.google_drive)
}

/*
 * API : History
 */

exports.history = {};
exports.history.get_history = function(req, res){
	g_history.get_history(req.body.filename, function(history){
		res.json({"history":history});
	});
};

exports.edit = function(req,res){
	res.send(null);
}

exports.edit.get_dictionary = function(req, res){
	var evt = new EventEmitter();
	
	evt.on("edit_get_dictionary", function (data) {
		res.json(data);
	});

	g_edit.get_dictionary(req.query, evt);
};