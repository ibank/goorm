org.goorm.core.browser = function() {
	this.name = "";
	this.version = 0;
};

org.goorm.core.browser.prototype = {
	init: function() {
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		// Get the Browser Information
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		
		var user_agent = navigator.userAgent.toLowerCase();
 
		// Figure out what browser is being used
		$.browser = {
			version: (user_agent.match( /.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/ ) || [])[1],
			chrome: /chrome/.test( user_agent ),
			safari: /webkit/.test( user_agent ) && !/chrome/.test( user_agent ),
			opera: /opera/.test( user_agent ),
			msie: /msie/.test( user_agent ) && !/opera/.test( user_agent ),
			mozilla: /mozilla/.test( user_agent ) && !/(compatible|webkit)/.test( user_agent )
		};
		
		
		if($.browser.mozilla)
			this.name = "Firefox";
		else if($.browser.msie)
			this.name = "IE";
		else if($.browser.opera)
			this.name = "Opera";
		else if($.browser.chrome)
			this.name = "Chrome";
		else if($.browser.safari)
			this.name = "Safari";
		else
			this.name = "Unknown";
			

		this.version = $.browser.version;
				
		  
		$('.browser_name').html(this.name + " " + this.version);
	}
};