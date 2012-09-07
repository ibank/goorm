/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.layout.startpage = function () {
	this.pushbutton = null;
};

org.goorm.core.layout.startpage.prototype = {
	init: function (target) {
		var self = this;
		
		this.pushbutton = [];
		 
		$("#" + target).append("<div id='startpage_container'>abcde</div>");
		
		var url = "file/get_contents";
			
		$.ajax({
			url: url,			
			type: "GET",
			data: "path=../../config/startpage.html",
			success: function(data) {
				
				$("#startpage_container").html(data);
				
				self.pushbutton = new YAHOO.widget.Button($("#startpage_container").find("#closeButton").get(0));
				
				$("#startpage_container").find("#closeButton").click(function () {
					$("#startpage_container").hide();
				});
			}
		});
	}
};