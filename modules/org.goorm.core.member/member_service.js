/*

var reg_email = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i; 
var reg_id_pw = /^[a-z0-9_]{4,20}$/;
var g_member_dao = require("./member_dao");
module.exports = {
	login: function(req, callback){
		if(req.body.auth_type=='password'){
			if(req.body.id == "" || req.body.pw == ""){ 
				callback({err:{code:3, message: "아이디 또는 패스워드가 입력되지 않았습니다."}}); 
				return; 
			} 
			g_member_dao.get(req.body.id, function(member){
				if(member && !member.deleted){
					if(req.body.pw==member.pw){

						member.auth_type = "password";
						member.loggedin = true;
						delete member.pw;
						delete member.deleted;
						req.session.user = member;
						console.log('req.session.user : ', member);
						callback({err: false, info: member});
					}else{
						callback({err: {code:1, message: "패스워드가 일치하지 않습니다."}});
					}
				}else{
					callback({err: {code:2, message: "존재하지 않는 회원입니다."}});
				}

			});
		}else{		
			if(!req.user){	
				callback({err: {code:4, message: "소셜로그인이 이루어지지 않았습니다."}});
			}else{
				g_member_dao.get(req.body.auth_type + req.user[req.body.auth_type].id, function(member){
					if(member && !member.deleted){
						member.auth_type = req.body.auth_type;
						member = create_login_status(member);
						switch(member.auth_type){
							case 'facebook':
								break;
							case 'twitter':
								member.id = 'twitter' + req.user.twitter.id;
								member.name = req.user.twitter.name;
								member.nick = req.user.twitter.screen_name;
								break;
							case 'google':
								member.id = 'google' + req.user.google.id;
								member.nick = member.name = req.user.google.name;
								break;
						}
						req.session.user = member;
						console.log('req.session.user : ', member);
						callback({err: false, info: member});
					}else{
						callback({err: {code:2, message: "존재하지 않는 회원입니다."}});
					}
				});
			}
		}
	}
	
	,logout: function(req, callback){
		req.session.destroy();
		if(req.loggedIn) req.logout();	//소셜로그인
		callback({err: false, message:"성공적으로 로그아웃 되었습니다."});
	}
	
	,get_login_status: function(req, callback){
		if(req.session.user){
	
			callback(req.session.user);
		}else{
			var auth_type='password';
			if(req.user){
				console.log('req.user:', req.user);
				if(req.user.twitter) auth_type='twitter';
				if(req.user.facebook) auth_type='facebook';
				if(req.user.google) auth_type='google';
			}
			switch(auth_type){
				case 'password':	
					callback({
						loggedin	: false
						, auth_type	: 'password'
						});
					break;
				case 'facebook':
					callback({
						loggedin	: false
						, auth_type	: 'facebook'
						, id		: req.user.facebook.id
					});
					break;
				case 'twitter':
					callback({
						loggedin	: false
						, auth_type	: 'twitter'
						, id		: req.user.twitter.id
						, nick		: req.user.twitter.screen_name
						, name		: req.user.twitter.name
						, picture	: req.user.twitter.profile_image_url
					});
					break;
				case 'google':
					callback({
						loggedin	: false
						, auth_type	: 'google'
						, id		: req.user.google.id
						, nick		: req.user.google.name
						, name		: req.user.google.name
					});
					break;
			}
		}
	}
		
	,everyauth_init: function(everyauth, conf){
		var usersById = {};
		var nextUserId = 0;
		
		function addUser (source, sourceUser) {
		  var user;
		  if (arguments.length === 1) {
		    user = sourceUser = source;
		    user.id = ++nextUserId;
		    console.log(usersById);
		    return usersById[nextUserId] = user;
		  } else { 
		    user = usersById[++nextUserId] = {id: nextUserId};
		    user[source] = sourceUser;
		    console.log(usersById);
		    return user;
		  }
		}
		
		var usersByFbId = {};
		var usersByTwitId = {};
		var usersByGoogleId = {};
		
		everyauth.everymodule
		  .findUserById( function (id, callback) {
		    callback(null, usersById[id]);
		  });
		
		everyauth.facebook
			.myHostname('http://localhost:3000')
		    .appId(conf.fb.appId)
		    .appSecret(conf.fb.appSecret)
		    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
		      return usersByFbId[fbUserMetadata.id] ||
		        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
		    })
		    .redirectPath('/cms/member/social_login/facebook');
		
		everyauth.twitter
		    .consumerKey(conf.twit.consumerKey)
		    .consumerSecret(conf.twit.consumerSecret)
		    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {

		      return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
		    })
		    .redirectPath('/cms/member/social_login/twitter');
		
		everyauth.google
		  .appId(conf.google.clientId)
		  .appSecret(conf.google.clientSecret)
		  .scope('https://www.googleapis.com/auth/userinfo.profile https://www.google.com/m8/feeds/')
		  .findOrCreateUser( function (sess, accessToken, extra, googleUser) {
		    googleUser.refreshToken = extra.refresh_token;
		    googleUser.expiresIn = extra.expires_in;

		    return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
		  })
		  .redirectPath('/cms/member/social_login/google');
	}
}
*/