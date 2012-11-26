
var EveryAuth = null;
var usersById = {};
var nextUserId = 0;

var usersByGoogleId = {};
var usersByFbId = {};
var usersByGitHubId = {};
var usersByTwitId = {};

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

module.exports = {
	init : function(everyauth){
		EveryAuth = everyauth;
		
		EveryAuth.everymodule.findUserById( function (id, callback) {
			callback(null, usersById[id]);
		});
		
		EveryAuth.everymodule.moduleErrback( function (err) {
			console.log('Error :: ', err);
		});
	},
	
	attach_google : function(google_config){
		EveryAuth.google
			.appId(google_config.appId)
			.appSecret(google_config.appSecret)
			.scope("https://www.googleapis.com/auth/userinfo.profile") // What you want access to
			.handleAuthCallbackError( function (req, res) {
				
			})
			.findOrCreateUser(function (sess, accessToken, extra, googleUser) {
				googleUser.refreshToken = extra.refresh_token;
				googleUser.expiresIn = extra.expires_in;
				
				return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
			})
			.redirectPath('/social/login?type=google');
			
		console.log('[Social Login] google');
	},
	
	attach_facebook : function(facebook_config){
		EveryAuth.facebook
			.appId(facebook_config.appId)
			.appSecret(facebook_config.appSecret)
			.handleAuthCallbackError( function (req, res) {
		
			})
			.findOrCreateUser(function (sess, accessToken, extra, fbUser) {
				fbUser.refreshToken = extra.refresh_token;
				fbUser.expiresIn = extra.expires_in;
				return usersByFbId[fbUser.id] || (usersByFbId[fbUser.id] = addUser('facebook', fbUser));
			})
			.redirectPath('/');

		console.log('[Social Login] facebook');
	},
	
	attach_twitter : function(twitter_config){
		EveryAuth.twitter
			.consumerKey(twitter_config.consumerKey)
			.consumerSecret(twitter_config.consumerSecret)
			.handleAuthCallbackError( function (req, res) {
				
			})
			.findOrCreateUser(function (sess, accessToken, extra, twitterUser) {
				twitterUser.refreshToken = extra.refresh_token;
				twitterUser.expiresIn = extra.expires_in;
				return usersByTwitId[twitterUser.id] || (usersByTwitId[twitterUser.id] = addUser('twitter', twitterUser));
			})
			.redirectPath('/social/login?type=twitter');

		console.log('[Social Login] twitter');
	},
	
	attach_github : function(github_config){
		EveryAuth.github
			.appId(github_config.appId)
			.appSecret(github_config.appSecret)
			.scope("user repe")
			.handleAuthCallbackError( function (req, res) {
				
			})
			.findOrCreateUser(function (sess, accessToken, extra, githubUser) {
				githubUser.refreshToken = extra.refresh_token;
				githubUser.expiresIn = extra.expires_in;
				return usersByGitHubId[githubUser.id] || (usersByGitHubId[githubUser.id] = addUser('github', githubUser));
			})
			.redirectPath('/social/login?type=github');

		console.log('[Social Login] github');
	}
}
