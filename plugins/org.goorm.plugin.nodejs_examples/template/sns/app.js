
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , everyauth = require('everyauth')
  , path = require('path');


//everyauth.debug = true;

var app = express();

var usersById = {};
var nextUserId = 0;

var usersByGoogleId = {};

var check_auth = function (req, res, next){
	if (!req.loggedIn) {
		res.redirect('/auth/google');
	}

	next();
};

var addUser = function (source, sourceUser) {
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
};

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth.google
  .appId('1004367875263-dc41pml04smi23886m69n3cikrirlkj1.apps.googleusercontent.com')
  .appSecret('lftRuZq9tBUPVPCRm96tPNFb')
  .scope('https://www.googleapis.com/auth/userinfo.profile')
  .handleAuthCallbackError( function (req, res) {
    
  })
  .findOrCreateUser( function (session, accessToken, extra, googleUser) {
    googleUser.refreshToken = extra.refresh_token;
    googleUser.expiresIn = extra.expires_in;

    return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
  })
  .redirectPath('/');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  
  app.use(express.cookieParser('znzlvktj'));
  app.use(express.session());
  app.use(everyauth.middleware(app))
  
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', check_auth, routes.index);
app.get('/users', check_auth, user.list);
app.get('/load', check_auth, routes.load);
app.post('/write', check_auth, routes.write);
app.post('/like', check_auth, routes.like);
app.post('/unlike', check_auth, routes.unlike);
app.post('/comment', check_auth, routes.comment);
app.post('/del', check_auth, routes.del);
app.post('/modify', check_auth, routes.modify);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
