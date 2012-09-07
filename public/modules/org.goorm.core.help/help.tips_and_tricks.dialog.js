/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.help.tips_and_tricks.dialog = function () {
	this.dialog = null;
};

org.goorm.core.help.tips_and_tricks.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog.wizard();
		this.dialog.init(option);
		
		return this;
	}
};
