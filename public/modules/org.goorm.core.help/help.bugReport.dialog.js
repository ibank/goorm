/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module help
 **/

/**
 * This is an goorm code generator.  
 * <br>goorm starts with this code generator.
 * @class about.dialog
 * @extends about
 **/
org.goorm.core.help.about.dialog = function () {
	/**
	 * This presents the current browser version
	 * @property dialog
	 **/
	this.dialog = null;
};

org.goorm.core.help.about.dialog.prototype = {
	/**
	 * This function is an goorm core initializating function.  
	 * @constructor 
	 * @param {String} option The option. 
	 **/
	init: function (option) {
		this.dialog = new org.goorm.core.dialog();
		this.dialog.init(option);
		
		return this;
	}
};
