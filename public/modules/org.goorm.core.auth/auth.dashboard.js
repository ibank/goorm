
org.goorm.core.auth.dashboard = function () {
	this.socket = null;
	this.ip = null;
	this.access_time = null;
}

org.goorm.core.auth.dashboard.prototype = {
	init : function(){
		// this.socket = io.connect('http://localhost:3000');
	},

	access : function(){
		var self = this;
		var data = {
			'id' : core.user.id,
			'type' : core.user.type,
			'access_time' : new Date()
		}

		this.socket.emit('access', JSON.stringify(data));
	}
}