

org.goorm.core.auth.profile.dialog = function () {
	this.dialog = null;
};

org.goorm.core.auth.profile.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};