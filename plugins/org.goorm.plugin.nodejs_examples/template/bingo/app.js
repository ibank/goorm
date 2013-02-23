
/**
* Module dependencies.
*/

var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path')
, socketio = require('socket.io');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/main', routes.main);
app.get('/users', user.list);

var server = http.createServer(app);

var io = socketio.listen(server);


var users = {};
var user_count = 0;
var turn_count = 0;

io.sockets.on('connection', function (socket) {
	
	socket.on('join', function (data) {
		var username = data.username;
		
		socket.username = username;
		
		users[user_count] = {};
		users[user_count].name = username;
		users[user_count].turn = false;
		
		io.sockets.emit('update_users', users);
		
		user_count++;
	});
	
	socket.on('game_start', function (data) {
		socket.broadcast.emit("game_started", data);
		users[turn_count].turn = true;
		
		io.sockets.emit('update_users', users);
	});
	
	socket.on('select', function (data) {
		socket.broadcast.emit("check_number", data);
		
		users[turn_count].turn = false;
		turn_count++;
		if (turn_count >= user_count) {
			turn_count = 0;
		}
		users[turn_count].turn = true;
		
		io.sockets.emit('update_users', users);
	});
	
	socket.on('disconnect', function () {
		delete users[socket.username];
	
		io.sockets.emit('update_users', users);
		
		user_count--;
	});
});


server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});