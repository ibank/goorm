

org.goorm.core.auth.signup.dialog = function () {
	this.dialog = null;
};

org.goorm.core.auth.signup.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};