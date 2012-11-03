/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.utility.loading_bar = function () {
	this.loading_bar = null
	this.counter = 0;
};

org.goorm.core.utility.loading_bar.prototype = {
	init: function () {
		var self= this;
		this.loading_bar = new YAHOO.widget.Panel("wait",  
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

		this.loading_bar.setHeader("");
		this.loading_bar.setBody('<img src="images/org.goorm.core.utility/loading_bar.gif" />');
		this.loading_bar.render("goorm_dialog_container");
	},
	
	start: function (str) {
		this.loading_bar.setHeader(str);
		this.loading_bar.show();
		this.counter++;
	},
	
	stop: function () {
		this.counter--;
		if(this.counter == 0) {
			this.loading_bar.hide();
		}
	}
};