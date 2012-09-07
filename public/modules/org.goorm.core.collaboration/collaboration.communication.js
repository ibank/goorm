/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.collaboration.communication = function () {
	this.userID = 0;
	this.userName = null;
	this.socket = null;
	this.predefined_colors = null;
  	this.assigned_colors = null;
  	this.updating_process_running = false;
  	this.update_queue = [];
  	this.project_id = null;
  	this.is_chat_on = null;
  	this.timer = null;
  	
  	this.socket = null;
};

org.goorm.core.collaboration.communication.prototype = {

	init: function (target) {
		var self = this;
		
		this.target = target;
		
		this.socket = io.connect();
 		
		$("#" + target).append("<div class='communication_user_container'>User </div>");
		$("#" + target).append("<div class='communication_message_container'></div>");
		$("#" + target).append("<div class='communication_message_input_container'><input id='input_chat_message' placeholder='Type your meessage...' style='width:90%;' /></div>");		
		
		$("#" + target + " #input_chat_message").keypress(function(evt){
			if((evt.keyCode || evt.which) == 13){
				evt.preventDefault();
				
				//message encoding to UTF-8
				var encodedMsg = encodeURIComponent($(this).val());
				
				if (self.socket.socket.connected) {
					self.socket.emit("message", '{"channel": "communication", "action":"send_message", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace": "'+ core.status.current_project_name +'", "message":"' + encodedMsg + '"}');
				} 
				else {
					alert.show("Collaboration server is not opened!");
				}

				$(this).val("");
			}
		});
		
		$(core).bind("layout_resized", function () {
			var layout_right_height = $(".yui-layout-unit-right").find(".yui-layout-wrap").height() - 25;
			$("#goorm_inner_layout_right").find(".communication_message_container").height(layout_right_height - 182);
		});
		
 		this.socket.on("communication_message", function (data) {
 			data = decodeURIComponent(data);
 			$("#" + self.target).find(".communication_message_container").append("<div>" + data + "</div>");
 			$("#" + self.target).find(".communication_message_container").scrollTop(parseInt($("#" + self.target).find(".communication_message_container").height()));
 		});
 		
 		this.socket.on("communication_someone_joined", function (data) {
 			data = JSON.parse(data);
 			
 			$("#" + self.target).find(".communication_message_container").append("<div>" + data.user + " joined this workspace!</div>");
 			$("#" + self.target).find(".communication_user_container").html(data.list.join("<br />"));
 		});
 		
 		this.socket.on("communication_someone_leaved", function (data) {
 			data = JSON.parse(data);
 			
 			$("#" + self.target).find(".communication_message_container").append("<div>" + data.user + " leaved this workspace!</div>");
 			$("#" + self.target).find(".communication_user_container").html(data.list.join("<br />"));
 		});
 		
 		this.socket.on('disconnect', function() {
 			self.leave();
 		});
 		
 		$(window).unload(function() {
 			self.leave();
 		});
	},
	
	clear: function () {
		$("#" + this.target).find(".communication_user_container").empty();
		$("#" + this.target).find(".communication_message_container").empty();
	},
	
	join: function () {
		this.socket.emit("join", '{"channel": "workspace", "action":"join_workspace", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace":"'+ core.status.current_project_name +'", "message":"hello"}');
	},
	
	leave: function () {
		this.socket.emit("leave", '{"channel": "workspace", "action":"leave_workspace", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace":"'+ core.status.current_project_name +'", "message":"goodbye"}');
		this.clear();
	},
	
	resize: function () {
		
	},
	
	set_chat_on: function () {
		
	},
	
	set_chat_off: function () {
		
		var self = this;
		
 		this.stop_listening();
 		this.is_chat_on = 0;
 		
 		return false;
	},
	
	get_clock_time: function () {
		var now    = new Date();
		var hour   = now.getHours();
		var minute = now.getMinutes();
		var second = now.getSeconds();
		var ap = "AM";
		
		if (hour   > 11) { ap = "PM";             }
		if (hour   > 12) { hour = hour - 12;      }
		if (hour   == 0) { hour = 12;             }
		if (hour   < 10) { hour   = "0" + hour;   }
		if (minute < 10) { minute = "0" + minute; }
		if (second < 10) { second = "0" + second; }
		
		var timeString = hour + ':' + minute + ':' + second + " " + ap;
	   	
		return timeString;
	}
};