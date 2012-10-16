/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module utility
 **/

/**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class statusbar
 * @extends utility
 **/
org.goorm.core.utility.loadingbar = function () {
	/**
	 * This presents the current browser version
	 * @property loadingBar
	 * @type Object
	 * @default null
	 **/
	this.loadingBar = null
	
	this.counter = 0;
};

org.goorm.core.utility.loadingbar.prototype = {
	
	/**
	 * This function is an goorm core initializating function.  
	 * @constructor 
	 **/
	init: function () {
		var self= this;
		this.loadingBar = new YAHOO.widget.Panel("wait",  
						{ 
							width:"240px", 
						 	fixedcenter:true, 
						 	close:false, 
						 	draggable:false, 
						 	zIndex:9999,
						 	modal:true,
						 	visible:false
						} 
					);

		this.loadingBar.setHeader("");
		this.loadingBar.setBody('<img src="images/org.goorm.core.utility/loading_bar.gif" />');
		this.loadingBar.render("goormDialogContainer");
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method startLoading 
	 **/
	startLoading: function (str) {
		this.loadingBar.setHeader(str);
		this.loadingBar.show();
		this.counter++;
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method stopLoading 
	 **/
	stopLoading: function () {
		this.counter--;
		if(this.counter == 0) {
			this.loadingBar.hide();
		}
	}
};