
org.goorm.core.collaboration.invite.dialog = function () {
	this.dialog = null;
};

org.goorm.core.collaboration.invite.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};
