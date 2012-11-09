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

var usersByGoogleId = {};

everyauth.everymodule
	.findUserById( function (id, callback) {
		callback(null, usersById[id]);
	});
  
everyauth.google
	.appId('1004367875263.apps.googleusercontent.com')
	.appSecret('TD_H4GLh0X8LKcjIIzp07Bgc')
	.scope('https://www.googleapis.com/auth/userinfo.profile') // What you want access to
	.handleAuthCallbackError( function (req, res) {
		
	})
	.findOrCreateUser(function (sess, accessToken, extra, googleUser) {
		googleUser.refreshToken = extra.refresh_token;
		googleUser.expiresIn = extra.expires_in;
		return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
	})
	.redirectPath('/');


// Configuration
goorm.configure(function(){
	goorm.set('views', __dirname + '/views');
	goorm.set('view engine', 'jade');
	goorm.use(express.bodyParser({ keepExtensions: true, uploadDir: __temp_dir }));
	goorm.use(express.cookieParser());
	goorm.use(express.methodOverride());
	goorm.use(express.session({secret: 'htuayreve'}));
	goorm.use(everyauth.middleware())
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
goorm.get('/project/new', routes.project.do_new);
goorm.get('/project/load', routes.project.do_load);
goorm.get('/project/save', routes.project.do_save);
goorm.get('/project/delete', routes.project.do_delete);
goorm.get('/project/get_list', routes.project.get_list);
goorm.post('/project/import', routes.project.do_import);
goorm.get('/project/export', routes.project.do_export);
goorm.get('/project/clean', routes.project.do_clean);
goorm.get('/project/get_property', routes.project.get_property);
goorm.get('/project/set_property', routes.project.set_property);


//for plugin
goorm.get('/plugin/get_list', routes.plugin.get_list);
goorm.get('/plugin/install', routes.plugin.install);
goorm.get('/plugin/new', routes.plugin.do_new);
goorm.get('/plugin/debug', routes.plugin.debug);
goorm.get('/plugin/run', routes.plugin.run);

//for filesystem
goorm.get('/file/new', routes.file.do_new);
goorm.get('/file/new_folder', routes.file.do_new_folder);
goorm.get('/file/new_untitled_text_file', routes.file.do_new_untitled_text_file);
goorm.get('/file/new_other', routes.file.do_new_other);
goorm.get('/file/load', routes.file.do_load);
goorm.get('/file/save', routes.file.do_save);
goorm.get('/file/save_as', routes.file.do_save_as);
goorm.get('/file/delete', routes.file.do_delete);
goorm.get('/file/get_contents', routes.file.get_contents);
goorm.get('/file/get_url_contents', routes.file.get_url_contents);
goorm.get('/file/put_contents', routes.file.put_contents);
goorm.get('/file/get_nodes', routes.file.get_nodes);
goorm.get('/file/get_dir_nodes', routes.file.get_dir_nodes);
goorm.post('/file/import', routes.file.do_import);
goorm.get('/file/export', routes.file.do_export);
goorm.get('/file/move', routes.file.do_move);
goorm.get('/file/rename', routes.file.do_rename);
goorm.get('/file/get_property', routes.file.get_property);

//for shell
goorm.get('/terminal/exec', routes.terminal.exec);

//for preference
goorm.get('/preference/save', routes.preference.save);
goorm.get('/preference/ini_parser', routes.preference.ini_parser);
goorm.get('/preference/ini_maker', routes.preference.ini_maker);
goorm.get('/preference/workspace_path', function(req, res) {
	res.json({"path": global.__workspace+'/'});
});

//for theme
goorm.get('/theme/get_list', routes.theme.get_list);
goorm.get('/theme/get_contents', routes.theme.get_contents);
goorm.get('/theme/put_contents', routes.theme.put_contents);

//for help
goorm.get('/help/get_readme_markdown', routes.help.get_readme_markdown);

//for Auth
goorm.get('/auth/get_info', routes.auth.get_info);

//for download and upload
goorm.get('/download', routes.download);



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

goorm.get('/alloc_port', function(req, res) {
	// req : port, process_name
	res.json(g_port_manager.alloc_port(req.query));
});

goorm.get('/remove_port', function(req, res) {
	// req : port
	res.json(g_port_manager.remove_port(req.query));
});



function check_auth(req, res, next){
	console.log("has session : %s", req.loggedIn);
	next();
}



server = http.createServer(goorm).listen(9999, function(){
		console.log("goorm IDE server listening on port %d in %s mode", server.address().port, goorm.settings.env);
		console.log("Open your browser and connect to");
		console.log("'http://localhost:9999' or 'http://[YOUR IP/DOMAIN]:9999'");
	});
	
io = socketio.listen(server);

g_terminal.start(io);
g_collaboration.start(io);

g_port_manager.alloc_port({ "port": 9999,
	"process_name": "goorm" 
});

