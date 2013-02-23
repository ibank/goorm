
org.goorm.core.auth.manage.dialog = function () {
	this.dialog = null;
};

org.goorm.core.auth.manage.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};