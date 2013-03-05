
org.goorm.core.project.share.dialog = {
	dialog: null,

	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};