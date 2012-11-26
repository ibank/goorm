

org.goorm.core.admin = function() {
	this.user_manager = null;
};

org.goorm.core.admin.prototype = {
	init: function () {
		var self = this;
		
		this.user_manager = new org.goorm.core.admin.user_manager();
		this.user_manager.init();
	}
}