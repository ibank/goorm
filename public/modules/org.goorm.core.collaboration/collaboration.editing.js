/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.collaboration.editing = function () {
	this.target = null;
	this.diff_worker = null;
	this.patch_worker = null;
	this.socket = null;
	this.previous_text = null;
	this.task_queue = [];	
	this.removed_lines_uuids = [];
	this.user = null;
	this.updating_process_running = false;
	this.playback_mode = false;
	this.take_diffs = true;
	this.stored_lines = {};
	this.contents = null;
	this.editor = null;
	this.parent = null;
	this.filename = null;
	this.filepath = null;
	this.identifier = null;
	this.auto_save_timer=null;
	this.status = 0;
	this.timer = null;
};

org.goorm.core.collaboration.editing.prototype = {
	init: function(parent) {
		var self = this;
		this.parent = parent;
		this.target = parent.target;
		
		this.socket = io.connect();
		
  		this.task_queue = [];
  		this.removed_lines_uuids = [];
 		
 		this.user = core.user.first_name + "_" + core.user.last_name;

		var check_for_updates = function() {
			while(self.task_queue.length > 0 && self.updating_process_running == false) {
				var current_update = self.task_queue.shift(); 
				
				self.updating_process_running = true;
				
				self.apply_update(current_update.action, current_update.message);
			}
		};
 		
 		this.timer = window.setInterval(check_for_updates, 500);
 		this.set_collaboration_data("!refresh");
 		
		this.socket.on("editing_message", function (data) {
 			if(!data) {
 				return false;
 			}

			var received_msg = JSON.parse(data);
			
			if(received_msg.channel == "editing" && 
			   received_msg.user != core.user.first_name + "_" + core.user.last_name &&
			   received_msg.filepath == self.filepath) {
				switch(received_msg.action){
					case "change":
						self.task_queue.push(received_msg);
						break;
					case "cursor":
						self.task_queue.push(received_msg);
						break;
					default:
						
				}
			}
		});
		
		this.socket.on("editing_someone_leaved", function (name) {
			console.log(name + " leaved...");
			$(self.target).find(".CodeMirror-scroll").find(".user_name_" + name).remove();
			$(self.target).find(".CodeMirror-scroll").find(".user_cursor_" + name).remove();
		});
		
		$(this.target).find("[id='collaboration.editing']").keydown(function(evt) {
			//don't delete the beyond p
			if(evt.keyCode == 8 || evt.keyCode == 46){
				var editing_lines = $(self.target).find("[id='collaboration.editing']").find("div").find("p");
				if(editing_lines.length == 1 && $(editing_lines[0]).html() == ""){
					$(editing_lines[0]).html("&nbsp;");
					return false; 
				}
			} 
		});
		
		setInterval(function() {
			$(self.target).find(".CodeMirror-scroll").find(".user_cursor").each(function (i) {
				if ($(this).css('visibility') == 'hidden') {
					$(this).css('visibility', 'visible');
				} else {
					$(this).css('visibility', 'hidden');
				}
			});
		}, 600);
		
	},

	set_editor: function(editor){
		this.editor = editor;
	},
	
	set_filepath: function () {
		this.filepath = this.parent.filepath + this.parent.filename;
	},
	
	update_change: function(data){
		var self = this;

		if(this.socket != null){
			if (self.socket.socket.connected) {
				data.user = core.user.first_name + "_" + core.user.last_name;
				self.socket.emit("message", '{"channel": "editing", "action":"change", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace": "'+ core.status.current_project_name +'", "filepath":"' + self.filepath + '", "message":' + JSON.stringify(data) + '}');
				
				clearTimeout(this.auto_save_timer);
				this.auto_save_timer = setTimeout(function(){
					self.parent.save();
				},5000);
			}
			else {
				// alert.show("Disconnected to collaboration server");				alert.show(core.module.localization.msg['alert_collaboration_server_notconnected']);
				return false;
			}
		}
	},
	
	update_cursor: function(data) {
		var self = this;
		if(this.socket != null){
			if (self.socket.socket.connected) {
				data.user = core.user.first_name + "_" + core.user.last_name;
				self.socket.emit("message", '{"channel": "editing", "action":"cursor", "user":"' + core.user.first_name + "_" + core.user.last_name + '", "workspace": "'+ core.status.current_project_name +'", "filepath":"' + self.filepath + '", "message":' + JSON.stringify(data) + '}');
			}
			else {
				// alert.show("Disconnected to collaboration server");				alert.show(core.module.localization.msg['alert_collaboration_server_notconnected']);
				return false;
			}
		}
	},

	apply_update: function(action, update){
		switch(action) {
			case "change":
				this.change(update);
				break;
			case "cursor":
				this.set_cursor(update);
				break;
			default:
				console.log("invalid update");
		};
	},
	
	set_cursor: function(message) {
		if (message.user != core.user.first_name + "_" + core.user.last_name) {
			var coords = this.editor.charCoords({line:message.line, ch:message.ch});
			var top = parseInt(coords.y) - parseInt($(this.target).find(".CodeMirror-scroll").offset().top);
			var left = parseInt(coords.x) - parseInt($(this.target).find(".CodeMirror-scroll").offset().left);
			
			if ($(this.target).find(".CodeMirror-scroll").find(".user_name_" + message.user).length > 0) {
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + message.user).css("top", top - 8);
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + message.user).css("left", left + 5);
				
				$(this.target).find(".CodeMirror-scroll").find(".user_cursor_" + message.user).css("top", top);
				$(this.target).find(".CodeMirror-scroll").find(".user_cursor_" + message.user).css("left", left);
			}
			else {
				$(this.target).find(".CodeMirror-scroll").prepend("<span class='user_name_" + message.user + " user_name' style='top:" + (top - 8) + "px; left:" + (left + 5) + "px;'>" + message.user + "</span>");
				$(this.target).find(".CodeMirror-scroll").prepend("<span class='user_cursor_" + message.user + " user_cursor' style='top:" + top + "px; left:" + left + "px;'></span>");
				
				var red = Math.floor(Math.random()*206) - Math.floor(Math.random()*30);
				var green = Math.floor(Math.random()*206) - Math.floor(Math.random()*30);
				var blue = Math.floor(Math.random()*206) - Math.floor(Math.random()*30);
				
				var light_red = (red + 90 >= 255)? 255 : red + 90;
				var light_green = (red + 90 >= 255)? 255 : green + 90;
				var light_blue = (red + 90 >= 255)? 255 : blue + 90;
				
				var color = '#' + red.toString(16) + green.toString(16) + blue.toString(16);
				var light_color = '#' + light_red.toString(16) + light_green.toString(16) + light_blue.toString(16);
				
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + message.user).css("background-color", light_color);
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + message.user).css("border-color", color);
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + message.user).css("color", color);
				
				$(this.target).find(".CodeMirror-scroll").find(".user_cursor_" + message.user).css("border-color", color);
			}
		}

		this.updating_process_running = false;
	},
	
	change: function(message){
		var self = this;

		if (message.user != core.user.first_name + "_" + core.user.last_name) {
			var textStr = "";
			
			for(var i=0; i < message.text.length; i++){
				if(i != 0 && message.text[0] != "\n" ){
					textStr+="\n";
				}
				textStr += message.text[i];
			}
			this.editor.replaceRange(textStr, message.from, message.to);

			if(message.next){
				message.next.user = message.user;
				self.change(message.next);
			}

			/*
			var from_coords = this.editor.charCoords({line:message.from.line, ch:message.from.ch});
			var from_top = parseInt(from_coords.y) - parseInt($(this.target).find(".CodeMirror-scroll").offset().top);
			var from_left = parseInt(from_coords.x) - parseInt($(this.target).find(".CodeMirror-scroll").offset().left);
			
			var to_coords = this.editor.charCoords({line:message.to.line, ch:message.to.ch});
			var to_top = parseInt(to_coords.y) - parseInt($(this.target).find(".CodeMirror-scroll").offset().top);
			var to_left = parseInt(to_coords.x) - parseInt($(this.target).find(".CodeMirror-scroll").offset().left);
			
			var color = $(this.target).find(".CodeMirror-scroll").find(".user_name_" + message.user).css("color");
			var width = from_left - to_left;
			var height = from_top - to_top;
			
			console.log("--------------------------------------");
			console.log(from_top);
			console.log(from_left);
			console.log(to_top);
			console.log(to_left);
			console.log(color);
			console.log(width);
			console.log(height);
			
			$(this.target).find(".CodeMirror-scroll").prepend("<span class='user_modifying_" + message.user + " user_modifying' style='top:" + from_top + "px; left:" + from_left + "px; width:" + width + "px; height:" + height + "px; background-color: " + color  +";'></span>");
			
			$(this.target).find(".CodeMirror-scroll").find(".user_modifying_" + message.user).hide("fast", function () {
				$(self.target).find(".CodeMirror-scroll").find(".user_modifying_" + message.user).remove();
			});
			*/
		}
		
		this.updating_process_running = false;
	},

	generate_uuid: function(){
		//get the pad id
		var padid = "1";
	
		//get the user id
		var userid = this.user;
	
		//get the current timestamp (in UTC)
		var d = new Date();
		var timestamp = $.map([d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
		d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()], function(n, i) {
			return (n < 10) ? "0"+n : n;
		}).join("");
		//combine them and generate the UUID
		//format: padid_userid_timestamp
		return padid + "_" + userid + "_" + timestamp;
	}, 
	
	set_collaboration_data: function(contents) {
		var self = this;
	
		if(contents) {
			if(contents == "!refresh") {
      			this.set_collaboration_data(this.contents);
      			return false;
      		}
      		
	      	var original_contents = contents.split("\n");
	      	var result = "";
	      	
	      	$(original_contents).each(function (i){
	      		result += "<p id='line" + (i+1) + "' data-uuid='" + self.generate_uuid() + "'>" + this + "</p>";
	      	});
	      	
	      	$(this.target).find("[id='collaboration.editing']").find("div").html(result);
	      	
	      	this.contents = contents;
      	}
      	else {
    		$(this.target).find("[id='collaboration.editing']").find("div").html("<p id='line1' data-uuid='" + this.generate_uuid() + "'>&nbsp;</p>");
		}

	}
	
};
