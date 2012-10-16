org.goorm.core.theme._css.dialog = function () {
	
	this.dialog = null;
};

org.goorm.core.theme._css.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}

};