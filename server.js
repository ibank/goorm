/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var express = require('express')
  , routes = require('./routes')
  , socketio = require('socket.io')
  , http = require('http')
  , colors = require('colors')
  , everyauth = require('everyauth')
  , fs = require('fs');

//everyauth.debug = true;

var goorm = module.exports = express();
var g_terminal = require("./modules/org.goorm.core.terminal/terminal");
var g_collaboration = require("./modules/org.goorm.core.collaboration/collaboration");
var g_utility = require("./modules/org.goorm.core.utility/utility");
var g_port_manager = require("./modules/org.goorm.core.utility/utility.port_manager");

global.__path = __dirname+"/";

var server = null;
var io = null;
var config_data = {
	workspace: undefined,
	temp_dir: undefined
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

if (config_data.__temp_dir != undefined) {
	global.__temp_dir = config_data.temp_dir;
}
else {
	global.__temp_dir = __path + "temp_files/";
}

console.log("--------------------------------------------------------".grey);
console.log("workspace_path: " + __workspace);
console.log("temp_dir_path: " + __temp_dir);

console.log();
console.log("goormIDE:: starting...".yellow);
console.log("--------------------------------------------------------".grey);


var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

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

var usersByGoogleId = {};
var usersByFbId = {};
var usersByGitHubId = {};

everyauth.everymodule
	.findUserById( function (id, callback) {
		callback(null, usersById[id]);
	});
  
everyauth.google
	.appId('1004367875263-qrh830opk4ulvkvb1cgt7n8d50b3ibqo.apps.googleusercontent.com')
	.appSecret('ovHVH8DPbMCQN6Pic_be6lQ4')
	.scope('https://www.googleapis.com/auth/userinfo.profile') // What you want access to
	.handleAuthCallbackError( function (req, res) {
		
	})
	.findOrCreateUser(function (sess, accessToken, extra, googleUser) {
		googleUser.refreshToken = extra.refresh_token;
		googleUser.expiresIn = extra.expires_in;
		
		return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
	})
	.redirectPath('/');

everyauth.facebook
	.appId('429685707079692')
	.appSecret('81d9562b7909b0e84c1f3148af376da2')
	.handleAuthCallbackError( function (req, res) {
		
	})
	.findOrCreateUser(function (sess, accessToken, extra, fbUser) {
		fbUser.refreshToken = extra.refresh_token;
		fbUser.expiresIn = extra.expires_in;
		return usersByFbId[fbUser.id] || (usersByFbId[fbUser.id] = addUser('facebook', fbUser));
	})
	.redirectPath('/');

everyauth.github
	.appId('f5ededd9912bef7ff86a')
	.appSecret('a2caf9c899af5782f0fad7c487b15f66980a2518')
	.scope('user repo')
	.handleAuthCallbackError( function (req, res) {
		
	})
	.findOrCreateUser(function (sess, accessToken, extra, githubUser) {
		githubUser.refreshToken = extra.refresh_token;
		githubUser.expiresIn = extra.expires_in;
		return usersByGitHubId[githubUser.id] || (usersByGitHubId[githubUser.id] = addUser('github', githubUser));
	})
	.redirectPath('/');


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
goorm.get('/file/put_contents', check_auth, routes.file.put_contents);
goorm.get('/file/get_nodes', check_auth, routes.file.get_nodes);
goorm.get('/file/get_dir_nodes', check_auth, routes.file.get_dir_nodes);
goorm.post('/file/import', check_auth, routes.file.do_import);
goorm.get('/file/export', check_auth, routes.file.do_export);
goorm.get('/file/move', check_auth, routes.file.do_move);
goorm.get('/file/rename', check_auth, routes.file.do_rename);
goorm.get('/file/get_property', check_auth, routes.file.get_property);

//for shell
goorm.get('/terminal/exec', check_auth, routes.terminal.exec);

//for preference
goorm.get('/preference/save', check_auth, routes.preference.save);
goorm.get('/preference/ini_parser', check_auth, routes.preference.ini_parser);
goorm.get('/preference/ini_maker', check_auth, routes.preference.ini_maker);
goorm.get('/preference/workspace_path', check_auth, function(req, res) {
	res.json({"path": global.__workspace+'/'});
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

//for Auth
goorm.get('/auth/get_info', check_auth, routes.auth.get_info);

//for download and upload
goorm.get('/download', check_auth, routes.download);



/*************************
 * 로그인 관련
 *************************/
//id/pw 로그인
/* goorm.post('/member/login', routes.member.login); */
//로그아웃
/* goorm.get('/member/logout', routes.member.logout); */
//현재 로그인 상태 (로그인한 계정의 정보)
/* goorm.get('/member/login_status', routes.member.login_status); */
/*************************/

goorm.get('/alloc_port', check_auth, function(req, res) {
	// req : port, process_name
	res.json(g_port_manager.alloc_port(req.query));
});

goorm.get('/remove_port', check_auth, function(req, res) {
	// req : port
	res.json(g_port_manager.remove_port(req.query));
});



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

