/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var mongoose_module = require('mongoose');
Schema = mongoose_module.Schema;	//global
global.__use_mongodb = true;
mongoose = mongoose_module.createConnection('mongodb://localhost/goorm_ide');	//global

var express = require('express')
  , routes = require('./routes')
  , socketio = require('socket.io')
  , http = require('http')
  , colors = require('colors')
  , everyauth = require('everyauth')
  , fs = require('fs');

mongoose.on('error', function(err){
	global.__use_mongodb = false;
	console.log('\nmongoDB connection error. Is the "mongod" turned off?'.red);
	console.log(err);
});

// mongoose.on('error', console.error.bind(console, '\nmongoDB connection error!!!\nIs the "mongod" turned off? : '.red));

//everyauth.debug = true;

var goorm = module.exports = express();
var g_terminal = require("./modules/org.goorm.core.terminal/terminal");
var g_collaboration = require("./modules/org.goorm.core.collaboration/collaboration");
var g_utility = require("./modules/org.goorm.core.utility/utility");
var g_port_manager = require("./modules/org.goorm.core.utility/utility.port_manager");
var g_configs_social = require("./configs/social");

global.__path = __dirname+"/";

var server = null;
var io = null;
var config_data = {
	workspace: undefined,
	temp_dir: undefined,
	social_key: undefined
};

var users = []

console.log("goormIDE:: loading config...".yellow);

if (fs.existsSync(process.env.HOME + '/.goorm/config.json')) {
	var data = fs.readFileSync(process.env.HOME + '/.goorm/config.json', 'utf8');
	if (data != "") {
		config_data = JSON.parse(data);
	}
}

if (config_data.workspace != undefined) {
	global.__workspace = config_data.workspace;
}
else {
	global.__workspace = __path + "workspace/";
}

if (config_data.temp_dir != undefined) {
	global.__temp_dir = config_data.temp_dir;
}
else {
	global.__temp_dir = __path + "temp_files/";
}

if (config_data.social_key != undefined) {
	global.__social_key = config_data.social_key;
	global.__social_key['possible_list'] = [];
}
else {
	global.__social_key = {};
	global.__social_key['possible_list'] = [];
}


console.log("--------------------------------------------------------".grey);
console.log("workspace_path: " + __workspace);
console.log("temp_dir_path: " + __temp_dir);

console.log();
console.log("goormIDE:: starting...".yellow);
console.log("--------------------------------------------------------".grey);

function check_auth(req, res, next){
	//console.log("has session : %s", req.loggedIn);
/*
	if (req.loggedIn) {
		//console.log("this user is logged in");
		next();
	}
	else {
		res.redirect('/auth/google');
	}
*/
	next();
}

g_configs_social.init(everyauth);

if(global.__social_key.google) g_configs_social.attach_google(global.__social_key.google);
if(global.__social_key.facebook) g_configs_social.attach_facebook(global.__social_key.facebook);
if(global.__social_key.github) g_configs_social.attach_github(global.__social_key.github);
if(global.__social_key.twitter) g_configs_social.attach_twitter(global.__social_key.twitter);

// Configuration
goorm.configure(function(){
	goorm.set('views', __dirname + '/views');
	goorm.set('view engine', 'jade');
	//goorm.use(express.favicon(__dirname + '/public/favicon.ico'));
	//goorm.use(express.logger('dev'));
	goorm.use(express.bodyParser({ keepExtensions: true, uploadDir: __temp_dir }));
	goorm.use(express.cookieParser('rnfmadlek'));
	goorm.use(express.session());
	goorm.use(everyauth.middleware(goorm))
	goorm.use(express.methodOverride());
	goorm.use(goorm.router);
	goorm.use(express.static(__dirname + '/public'));
	goorm.use(express.static(__dirname + '/plugins'));
	goorm.use(express.static(__dirname + '/stencils'));
	goorm.use(express.static(__temp_dir));
});


goorm.configure('development', function(){
  goorm.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

goorm.configure('production', function(){
  goorm.use(express.errorHandler());
});

// goorm.all('*', function(req, res, next){
	// res.header("Access-Control-Allow-Origin", "*");
	// res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	// res.header("Access-Control-Allow-Headers", "origin, x-requested-with, x-file-name, content-type, cache-control, Authorization");
	// res.header('Access-Control-Allow-Credentials', 'true');
// 	
	// if( req.method.toLowerCase() === "options" ) {
        // res.send( 200 );
    // }
    // else {
        // next();
    // }	
// });

// Routes
goorm.get('/', check_auth, routes.index);

//for project
goorm.get('/project/new', check_auth, routes.project.do_new);
goorm.get('/project/load', check_auth, routes.project.do_load);
goorm.get('/project/save', check_auth, routes.project.do_save);
goorm.get('/project/delete', check_auth, routes.project.do_delete);
goorm.get('/project/get_list', check_auth, routes.project.get_list);
goorm.post('/project/import', check_auth, routes.project.do_import);
goorm.get('/project/export', check_auth, routes.project.do_export);
goorm.get('/project/clean', check_auth, routes.project.do_clean);
goorm.get('/project/get_property', check_auth, routes.project.get_property);
goorm.get('/project/set_property', check_auth, routes.project.set_property);

//for SCM
goorm.get('/scm', check_auth, routes.scm);

//for plugin
goorm.get('/plugin/get_list', check_auth, routes.plugin.get_list);
goorm.get('/plugin/install', check_auth, routes.plugin.install);
goorm.get('/plugin/new', check_auth, routes.plugin.do_new);
goorm.get('/plugin/debug', check_auth, routes.plugin.debug);
goorm.get('/plugin/run', check_auth, routes.plugin.run);

//for filesystem
goorm.get('/file/new', check_auth, routes.file.do_new);
goorm.get('/file/new_folder', check_auth, routes.file.do_new_folder);
goorm.get('/file/new_untitled_text_file', check_auth, routes.file.do_new_untitled_text_file);
goorm.get('/file/new_other', check_auth, routes.file.do_new_other);
goorm.get('/file/load', check_auth, routes.file.do_load);
goorm.get('/file/save', check_auth, routes.file.do_save);
goorm.get('/file/save_as', check_auth, routes.file.do_save_as);
goorm.get('/file/delete', check_auth, routes.file.do_delete);
goorm.get('/file/get_contents', check_auth, routes.file.get_contents);
goorm.get('/file/get_url_contents', check_auth, routes.file.get_url_contents);
//goorm.get('/file/put_contents', check_auth, routes.file.put_contents);
goorm.post('/file/put_contents', check_auth, routes.file.put_contents);
goorm.get('/file/get_nodes', check_auth, routes.file.get_nodes);
goorm.get('/file/get_dir_nodes', check_auth, routes.file.get_dir_nodes);
goorm.get('/file/get_file', check_auth, routes.file.get_file);
goorm.post('/file/import', check_auth, routes.file.do_import);
goorm.get('/file/export', check_auth, routes.file.do_export);
goorm.get('/file/move', check_auth, routes.file.do_move);
goorm.get('/file/rename', check_auth, routes.file.do_rename);
goorm.get('/file/get_property', check_auth, routes.file.get_property);
goorm.get('/file/search_on_project', check_auth, routes.file.do_search_on_project);

//for shell
goorm.get('/terminal/exec', check_auth, routes.terminal.exec);

//for preference
goorm.get('/preference/save', check_auth, routes.preference.save);
goorm.get('/preference/ini_parser', check_auth, routes.preference.ini_parser);
goorm.get('/preference/ini_maker', check_auth, routes.preference.ini_maker);
goorm.get('/preference/workspace_path', check_auth, function(req, res) {
	res.json({"path": global.__workspace});
});
goorm.get('/preference/get_server_info', check_auth, routes.preference.get_server_info);
goorm.get('/preference/get_goorm_info', check_auth, routes.preference.get_goorm_info);
goorm.get('/preference/put_filetypes', check_auth, routes.preference.put_filetypes);

//for theme
goorm.get('/theme/get_list', check_auth, routes.theme.get_list);
goorm.get('/theme/get_contents', check_auth, routes.theme.get_contents);
goorm.get('/theme/put_contents', check_auth, routes.theme.put_contents);

//for help
goorm.get('/help/get_readme_markdown', check_auth, routes.help.get_readme_markdown);
goorm.get('/help/send_to_bug_report', check_auth, routes.help.send_to_bug_report);

//for Auth
goorm.get('/auth/get_info', check_auth, routes.auth.get_info);
goorm.post('/auth/login', routes.auth.login);
goorm.post('/auth/logout', routes.auth.logout);
goorm.post('/auth/signup', routes.auth.signup);
goorm.post('/auth/signup/check', routes.auth.signup.check);

// for admin
goorm.get('/auth/check_admin', routes.admin.check);
goorm.get('/admin/get_config', check_auth, routes.admin.get_config);
goorm.post('/admin/set_config', check_auth, routes.admin.set_config);
goorm.post('/admin/user/add', check_auth, routes.admin.user_add);
goorm.post('/admin/user/del', check_auth, routes.admin.user_del);
goorm.post('/admin/user/avail_blind', check_auth, routes.admin.user_avail_blind);

// for users
goorm.post('/user/get', routes.user.get);
goorm.post('/user/get/list', routes.user.list);
goorm.post('/user/set', routes.user.set);

//for download and upload
goorm.get('/download', check_auth, routes.download);

//for Social API
goorm.get('/social/login', routes.social.login);
goorm.get('/social/list', routes.social.possible_list);
goorm.all('/social/twitter', check_auth, routes.social.twitter);

goorm.get('/alloc_port', check_auth, function(req, res) {
	// req : port, process_name
	res.json(g_port_manager.alloc_port(req.query));
});

goorm.get('/remove_port', check_auth, function(req, res) {
	// req : port
	res.json(g_port_manager.remove_port(req.query));
});

//for history
// goorm.post('/history/add_snapshot', check_auth, routes.history.add_snapshot);
goorm.post('/history/get_history', check_auth, routes.history.get_history);

goorm.get('/db/is_open', function(req, res){
	var dbname = req.query.dbname;
	var is_open = eval('global.__use_'+dbname);
	
	res.json(is_open);
})

server = http.createServer(goorm).listen(9999, function(){
		console.log("goorm IDE server listening on port %d in %s mode", server.address().port, goorm.settings.env);
		console.log("Open your browser and connect to");
		console.log("'http://localhost:9999' or 'http://[YOUR IP/DOMAIN]:9999'");
	});

// everyauth.helpExpress(goorm);
		
io = socketio.listen(server);

g_terminal.start(io);
g_collaboration.start(io);

g_port_manager.alloc_port({ "port": 9999,
	"process_name": "goorm" 
});

