
org.goorm.core.collaboration.notification.dialog = function () {
	this.dialog = null;
};

org.goorm.core.collaboration.notification.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};
