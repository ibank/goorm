var goorm_admin_config = {
	'general_signup_config' : Boolean,
	'social_login_config' : Boolean
};

var Admin_config = mongoose.model('admin_config', new Schema(goorm_admin_config));
var g_auth_manager = require('../org.goorm.auth/auth.manager.js')

module.exports = {
	init_config : function(callback){
		Admin_config.find({}, function(err, result){
			if(result && result.length > 0){
				callback({
					code : 20,
					result : false
				});
			}
			else{
				var doc = new Admin_config();
				doc['general_signup_config'] = true;
				doc['social_login_config'] = true;
				
				doc.save(function(err){
					if(!err){
						callback({
							result : true
						})
					}
					else{
						callback({
							code :21,
							result : false
						})
					}
				})
			}
		})
	},
	
	get_config : function(callback){
		Admin_config.findOne({}, function(err, config){
			if(!err) callback(config);
			else{
				console.log('Get admin config [fail]', err);
				callback(null);
			}
		});
	},
	
	set_config : function(config, callback){
		for(var attrname in goorm_admin_config){
			if(config[attrname] && config[attrname] == 'true') config[attrname] = true;
			else if(config[attrname] && config[attrname] == 'false') config[attrname] = false;
		}
		
		console.log(config);
		
		Admin_config.update({}, config, null, function(err){
			if(!err) callback(true);
			else callback(false);
		})
	}
}
