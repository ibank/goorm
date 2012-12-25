/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
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
  	this.context_menu = [];
  	this.notification = null;
  	
  	this.selected_user = null;
  	this.user_list = [];
  	this.message_state = null;
  	this.message_interface_data = {};
};

org.goorm.core.collaboration.communication.prototype = {

	init: function (target) {
		var self = this;
		
		this.target = target;
		
		this.socket = io.connect();
 		
		$("#" + target).append("<div class='communication_user_container'>User </div>");
		$("#" + target).append("<div class='communication_message_container'></div>");
		$("#" + target).append("<div class='communication_message_input_container'><input id='input_chat_message' placeholder='Type your message...' style='width:90%;' /></div>");
		$("#" + target +' .communication_message_input_container').append("<div class='communication_message_social_area'></div>");
		
		$("#" + target + " #input_chat_message").keyup(function(evt){
			self.message_interface($(this).val(), evt);
		});
		
		$("#" + target + " #input_chat_message").keypress(function(evt){
			if((evt.keyCode || evt.which) == 13){
				evt.preventDefault();
				
				self.message_process($(this).val());
				$(this).val("");
			}
		});
		
		$(core).bind("layout_resized", function () {
			var layout_right_height = $(".yui-layout-unit-right").find(".yui-layout-wrap").height() - 25;
			$("#goorm_inner_layout_right").find(".communication_message_container").height(layout_right_height - 182);
		});
		
 		this.socket.on("communication_message", function (data) {
 			data = decodeURIComponent(data);
			
			data = ((data.replace(/&/g, '&amp;')).replace(/\"/g, '&quot;')).replace(/\'/g, '&#39;'); 
			data = data.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			
			self.notification.notify(data);
			
 			$("#" + self.target).find(".communication_message_container").append("<div class='communication_message_content'>" + data + "</div>");
 			var room = $("#" + self.target).find(".communication_message_container");
 			$(room).scrollTop(room.height());

 			if(core.module.layout.inner_layout.getUnitByPosition("right")._collapsed){
 				self.notification.show();
 			}
 			else if($('#goorm_inner_layout_right .selected span').attr('localization_key') != 'communication'){
 				$('#goorm_inner_layout_right').find('[localization_key="communication"]').addClass("glowing");
 			}
 		});
 		
 		this.socket.on("communication_whisper_message", function(data) {
 			data = decodeURIComponent(data);
 			
			data = ((data.replace(/&/g, '&amp;')).replace(/\"/g, '&quot;')).replace(/\'/g, '&#39;'); 
			data = data.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			
			self.notification.notify(data);
			
 			$("#" + self.target).find(".communication_message_container").append("<div class='communication_message_content'>" + data + "</div>");
 			var room = $("#" + self.target).find(".communication_message_container");
 			$(room).scrollTop(room.height());

 			if(core.module.layout.inner_layout.getUnitByPosition("right")._collapsed){
 				self.notification.show();
 			}
 			else if($('#goorm_inner_layout_right .selected span').attr('localization_key') != 'communication'){
 				$('#goorm_inner_layout_right').find('[localization_key="communication"]').addClass("glowing");
 			}
 		});
 		
 		this.socket.on("communication_someone_joined", function (data) {
 			data = JSON.parse(data);
 			$("#" + self.target).find(".communication_user_container").empty();
 			self.user_list = data.list;
 			
 			for(var i=0; i<data.list.length; i++){
 				var user_data = data.list[i].split(',');
 				var user_id = user_data[0];
 				var user_nick = user_data[1];
 				var user_type = user_data[2];

				var item_id = "communication_user_item"+i
 				var user_item = '<div id="'+item_id+'" class="communication_user_item" user_id="'+user_id+'" user_type="'+user_type+'" user_nick="'+user_nick+'">'+user_nick+'</div>';
 				
 				self.attach_context_menu(i, item_id);
 				$("#" + self.target).find(".communication_user_container").append(user_item);
 			}
 			
 			$("#" + self.target).find(".communication_message_container").append("<div>" + data.nick + " joined this workspace!</div>");
 			// $("#" + self.target).find(".communication_user_container").html(data.list.join("<br />"));
 		});
 		
 		this.socket.on("communication_someone_leaved", function (data) {
 			data = JSON.parse(data);
 			$("#" + self.target).find(".communication_user_container").empty();
 			self.user_list = data.list;
 			
 			for(var i=0; i<data.list.length; i++){
 				var user_data = data.list[i].split(',');
 				var user_id = user_data[0];
 				var user_nick = user_data[1];
 				var user_type = user_data[2];

				var item_id = "communication_user_item"+i
 				var user_item = '<div id="'+item_id+'" class="communication_user_item" user_id="'+user_id+'" user_type="'+user_type+'" user_nick="'+user_nick+'">'+user_nick+'</div>';

 				self.attach_context_menu(i, item_id);
 				$("#" + self.target).find(".communication_user_container").append(user_item);
 			}

 			$("#" + self.target).find(".communication_message_container").append("<div>" + data.nick + " leaved this workspace!</div>");
 			// $("#" + self.target).find(".communication_user_container").html(data.list.join("<br />"));
 		});
 		
 		this.socket.on('disconnect', function() {
 			self.leave();
 		});
 		
 		$(window).unload(function() {
 			self.leave();
 		});
 		
 		$(document).on({
 			mouseenter : function(){
 				$(this).addClass('communication_user_select')
 			},
 			mouseleave : function(){
 				$(this).removeClass('communication_user_select')
 			}
 		}, ".communication_user_item")
 		
 		this.notification = new org.goorm.core.collaboration.notification();
 		this.notification.init();
	},
	
	clear: function () {
		$("#" + this.target).find(".communication_user_container").empty();
		$("#" + this.target).find(".communication_message_container").empty();
	},
	
	join: function () {
		if(core.user.id != null)
			this.socket.emit("join", '{"channel": "workspace", "action":"join_workspace", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "type":"'+core.user.type+'", "workspace":"'+ core.status.current_project_name +'", "message":"hello"}');
	},
	
	leave: function () {
		this.socket.emit("leave", '{"channel": "workspace", "action":"leave_workspace", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "type":"'+core.user.type+'", "workspace":"'+ core.status.current_project_name +'", "message":"goodbye"}');
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
	},
	
	attach_context_menu : function(i, trigger){
		var self = this;
		
		if(this.context_menu[i]) this.context_menu[i].menu.destroy();
		
		this.context_menu[i] = new org.goorm.core.menu.context();
		this.context_menu[i].init("configs/menu/org.goorm.core.collaboration/collaboration.communication.user.html", "user.context", trigger, "user_context"+i, null, function(){
			$("a[action=account_profile_context]").unbind("click");
			$("a[action=account_profile_context]").click(function(e) {
				var user = core.module.layout.communication.selected_user;
				if(user){
					core.module.auth.show_profile(user.id, user.type);
				}
			});
			
			$("a[action=account_user_whisper]").unbind("click");
			$("a[action=account_user_whisper]").click(function(e) {
				var communication = core.module.layout.communication;
				var user = communication.selected_user;
				if(user){
					var target_user = user.id+','+user.nick+','+user.type;
					
					communication.message_state = 'whisper';
					communication.message_interface_data['whisper'] = {
						'target_user' : target_user
					}
					$("#" + communication.target + " #input_chat_message").val('[To. '+user.nick+'] ')
					$("#" + communication.target + " #input_chat_message").focus();
				}
			});
			
			self.context_menu[i].menu.subscribe('show', function(){
				var user_id = $('.communication_user_select').attr('user_id');
				var user_nick = $('.communication_user_select').attr('user_nick')
				var user_type = $('.communication_user_select').attr('user_type')
				
				self.selected_user = {
					'id' : user_id,
					'nick' : user_nick,
					'type' : user_type
				};
			}, null, null)
			
			self.context_menu[i].menu.subscribe('hide', function(){
				self.selected_user = null;
			}, null, null);
		});
	},
	
	message_interface : function(message, evt){
		var self = this;
		
		function get_user_index(target, type){
			var user_list = self.user_list;
			var type_number = -1;
			
			if(type == 'id'){
				type_number = 0;
			}
			else if(type == 'nick'){
				type_number = 1;
			}
			
			for(var i=0; i<user_list.length; i++){
				var data = user_list[i].split(',');
				if(data[type_number] == target){
					return i;
				}
			}
			
			return -1;
		}
		
		if(message == ""){
			this.message_state = null;
			this.message_interface_data = {};
		}
		else if(message[0] == '/'){
			switch(message[1]){
				case 'w':
					self.message_state = 'whisper';
					break;
				
				default:
					self.message_state = null;
					break;
			}
		}
		
		if(self.message_state){
			if(self.message_state == 'whisper'){
				if((evt.keyCode || evt.which) == 32){ // space key
					var messages = message.split(' ');
					var user_index = get_user_index(messages[1], 'id')
					
					if(messages.length == 3 && ( user_index != -1)){
						self.message_interface_data['whisper'] = {
							'target_user' : self.user_list[user_index]
						}
						
						$("#" + self.target + " #input_chat_message").val('[To. '+messages[1]+'] ');
					}
				}
			}
		}
	},
	
	message_process : function(message){
		var self = this;
		
		if (self.socket.socket.connected) {
			if(self.message_state){
				if(self.message_state == 'whisper'){
					var sessionid = self.socket.socket.sessionid;
					var message = message.substring(message.indexOf(']')+1)
					var encodedMsg = encodeURIComponent(message);
					
					self.socket.emit("message", '{"channel": "communication", "action":"send_whisper_message", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "workspace": "'+ core.status.current_project_name +'", "message":"' + encodedMsg + '", "sessionid":"'+sessionid+'", "target_user":"'+self.message_interface_data['whisper'].target_user+'"}');
				}
			}
			else{
				//message encoding to UTF-8
				var encodedMsg = encodeURIComponent(message);
				
				self.socket.emit("message", '{"channel": "communication", "action":"send_message", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "workspace": "'+ core.status.current_project_name +'", "message":"' + encodedMsg + '"}');
			}
		}
		else {
			alert.show(core.module.localization.msg['alert_collaboration_server_notconnected']);
		}
	}
};