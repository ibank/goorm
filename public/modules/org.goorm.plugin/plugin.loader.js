/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.plugin.loader = function () {
	
};

org.goorm.plugin.loader.prototype = {
	
	init: function () {
	},
	
	load: function (path) {
		$.getScript('plugins/' + 'org.goorm.core.design.uml' + '/plug.js', function () {
			var plug = new org.goorm.core.design.uml();
			
			plug.init();
		});
	},
	
	attach: function () {
	
	},
	
	detach: function () {
		
	}
	
};