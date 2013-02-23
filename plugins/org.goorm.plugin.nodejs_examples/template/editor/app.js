/**
 * author: sung-tae ryu
 * email: xenoz0718@gmail.com
 * node.js book example, Freelec
 **/

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io')
  , collaboration = require('./modules/collaboration');

var app = express();
var server = null;
var io = null;

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
app.get('/get_file_contents', routes.get_file_contents);
app.post('/put_file_contents', routes.put_file_contents);


server = http.createServer(app);
io = socketio.listen(server);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

collaboration.start(io);