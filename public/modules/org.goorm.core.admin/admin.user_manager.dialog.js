


org.goorm.core.admin.user_manager.dialog = function () {
	this.dialog = null;
};

org.goorm.core.admin.user_manager.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};