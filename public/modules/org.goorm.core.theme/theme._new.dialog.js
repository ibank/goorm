org.goorm.core.theme._new.dialog = function () {
	
	this.dialog = null;
};

org.goorm.core.theme._new.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}

};