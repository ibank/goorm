/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module project
 **/

org.goorm.core.project._new.dialog = function () {
	this.dialog = null;
};

org.goorm.core.project._new.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog.wizard();
		this.dialog.init(option);
		
		return this;
	}
};