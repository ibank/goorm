
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , socketio = require('socket.io')
  , path = require('path')
  , redis = require('redis');

var app = express();
var server = null;
var io = null;

var subscriber = redis.createClient();
var publisher = redis.createClient();


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
app.get('/users', user.list);


server = http.createServer(app);
io = socketio.listen(server);


var users = [];

io.set('log level', 0);
io.sockets.on('connection', function (socket) {

	socket.on('join', function (raw_msg) {
		var msg = JSON.parse(raw_msg);
		var channel = "";
		
		if(msg["channel"] != undefined) {
			channel = msg["channel"];
		}
		
		socket.join(msg.workspace);
		socket.set('workspace', msg.workspace);
		
		users.push(msg.username);
		index = users.length - 1;
		
		socket.broadcast.emit("someone_joined", JSON.stringify(users));
		socket.emit("someone_joined", JSON.stringify(users));
	});
	
	socket.on('message', function (raw_msg) {
		var msg = JSON.parse(raw_msg);
		var channel = "";
		
		if(msg["channel"] != undefined) {
			channel = msg["channel"];
		}
		
		if (channel == "chat") {
			var chatting_message = msg.username + " : " + msg.message;
			
			publisher.publish('chat', chatting_message);
		}
	});
	
	socket.on('leave', function (raw_msg) {
		var msg = JSON.parse(raw_msg);
		
		socket.leave(msg.workspace);
		
		users.removeByValue(msg.username);
		socket.broadcast.emit("someone_leaved", msg.username);
		socket.broadcast.emit("refresh_userlist", JSON.stringify(users));
	});
	
	
	subscriber.on('message', function (channel, message) {
		socket.emit("communication_message", message);
	});
	
	subscriber.subscribe('chat');
}); 

io.sockets.on('close', function (socket) {
	subscriber.unsubscribe();
	publisher.close();
	subscriber.close();
});


server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


