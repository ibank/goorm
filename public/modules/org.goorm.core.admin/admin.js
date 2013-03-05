/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.admin = {
	user_manager: null,

	init: function () {
		var self = this;
		
		this.user_manager = org.goorm.core.admin.user_manager;
		this.user_manager.init();
	}
};
