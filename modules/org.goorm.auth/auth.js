
var EventEmitter = require("events").EventEmitter;
var list = ["google", "github", "facebook", "twitter", "password"];

module.exports = {
	get_list : function(){
		return list;
	},

	get_user_data : function(session, callback){
		var available_list = this.get_list();
		var evt = new EventEmitter();
		var is_ret = true;

		if (session.auth && session.auth.loggedIn) {
			evt.on("auth_get_info", function(evt, i){
				if(available_list[i]){
					var type = available_list[i];
					if(session.auth[type] && is_ret){
						is_ret = false;

						callback(session.auth[type].user);
					}
					else{
						evt.emit("auth_get_info", evt, ++i);
					}
				}
				else{
					callback({});
				}
			});
			
			evt.emit("auth_get_info", evt, 0);
		}
		else{
			callback({});
		}
	}
}