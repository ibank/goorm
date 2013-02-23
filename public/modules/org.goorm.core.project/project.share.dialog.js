
org.goorm.core.project.share.dialog = function () {
	this.dialog = null;
};

org.goorm.core.project.share.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};