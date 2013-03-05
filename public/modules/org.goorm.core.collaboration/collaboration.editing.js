/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
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
	this.cursor_location = [];
	this.is_collaborating = null;
};

org.goorm.core.collaboration.editing.prototype = {
	init: function(parent) {
		var self = this;
		this.parent = parent;
		this.target = parent.target;
		
		this.socket = io.connect();
		
  		this.task_queue = [];
  		this.removed_lines_uuids = [];
 		
 		this.user = core.user.id;

		var check_for_updates = function() {
			while(self.task_queue.length > 0 && self.updating_process_running == false) {
				var current_update = self.task_queue.shift(); 
				
				self.updating_process_running = true;
				
				self.apply_update(current_update.action, current_update.message);
			}
		};
 		
 		this.timer = window.setInterval(check_for_updates, 500);
 		this.set_collaboration_data("!refresh");
 		
		// initialize other's cursors
		this.socket.on("editing_get_cursors", function (cursors) {
			if (cursors == undefined || cursors == null) return;
			for (var i = 0; i < cursors.length; i++) {
				self.task_queue.push(cursors[i]);
			}
		});
		
		this.socket.on("editing_message", function (data) {
			
 			if(!data) {
 				return false;
 			}

			var received_msg = JSON.parse(data);

			if(received_msg.channel == "editing" && 
			   received_msg.user != core.user.id &&
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
			//console.log("someone leaved in editing", name);
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
			if (core.sharing_cursor) {
				$(self.target).find(".CodeMirror-scroll").find(".user_cursor").each(function (i) {
					if ($(this).css('visibility') == 'hidden') {
						$(this).css('visibility', 'visible');
					} else {
						$(this).css('visibility', 'hidden');
					}
				});
			}
		}, 600);
		
		this.check_collaboration();
	},

	set_editor: function(editor){
		this.editor = editor;
	},
	
	set_filepath: function () {
		this.filepath = this.parent.filepath + this.parent.filename;
	},
	
	update_change: function(data){
		if(core.module.layout.history.mode == "history") return;
		var self = this;

		if(this.socket != null){
			if (self.socket.socket.connected) {
				data.user = core.user.id;
				data.nick = core.user.nick;
				self.socket.emit("message", '{"channel": "editing", "action":"change", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "workspace": "'+ core.status.current_project_path +'", "filepath":"' + self.filepath + '", "message":' + JSON.stringify(data) + '}');
				
				clearTimeout(this.auto_save_timer);
				var action = function(){
					if(core.module.layout.history.mode=="history") {
						clearTimeout(self.auto_save_timer);
						self.auto_save_timer = setTimeout(action, 5000);
					}else{
						if(self.is_collaborating){
							self.parent.save();
						}
					}
				}
				this.auto_save_timer = setTimeout(action, 5000);
			}
			else {
				// alert.show("Disconnected to collaboration server");
				alert.show(core.module.localization.msg['alert_collaboration_server_notconnected']);
				return false;
			}
		}
	},
	
	update_cursor: function(data) {
		var self = this;
		if(this.socket != null){
			if (self.socket.socket.connected) {
				data.user = core.user.id;
				data.nick = core.user.nick;
				self.socket.emit("message", '{"channel": "editing", "action":"cursor", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "workspace": "'+ core.status.current_project_path +'", "filepath":"' + self.filepath + '", "message":' + JSON.stringify(data) + '}');
			}
			else {
				// alert.show("Disconnected to collaboration server");
				alert.show(core.module.localization.msg['alert_collaboration_server_notconnected']);
				return false;
			}
		}
	},

	apply_update: function(action, update){
		switch(action) {
			case "change":
				if(core.module.layout.history.mode != "history") this.change(update);
				break;
			case "cursor":
				this.set_cursor(update);
				break;
			default:
				console.log("invalid update");
		};
	},
	
	set_cursor: function(message) {
		if(message.user != core.user.id && core.sharing_cursor){
			var coords = this.editor.charCoords({line:message.line, ch:message.ch});
			var scroll = this.editor.getScrollInfo();
			
			var top = parseInt(coords.y) - parseInt($(this.target).find(".CodeMirror-scroll").offset().top) + scroll.y;
			var left = parseInt(coords.x) - parseInt($(this.target).find(".CodeMirror-scroll").offset().left)  + scroll.x;

			var user_name = message.nick;
			
			if ($(this.target).find(".CodeMirror-scroll").find(".user_name_" + user_name).length > 0) {
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + user_name).css("top", top - 8);
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + user_name).css("left", left + 5);
				
				$(this.target).find(".CodeMirror-scroll").find(".user_cursor_" + user_name).css("top", top);
				$(this.target).find(".CodeMirror-scroll").find(".user_cursor_" + user_name).css("left", left);
			}
			else {
				$(this.target).find(".CodeMirror-scroll").prepend("<span class='user_name_" + user_name + " user_name' style='top:" + (top - 8) + "px; left:" + (left + 5) + "px;'>" + user_name + "</span>");
				$(this.target).find(".CodeMirror-scroll").prepend("<span class='user_cursor_" + user_name + " user_cursor' style='top:" + top + "px; left:" + left + "px;'></span>");
				
				var light_color = $("#communication .communication_user_item[user_nick='" + user_name +  "'] .communication_user_item_color_box").css("background-color");
				var color = $("#communication .communication_user_item[user_nick='" + user_name +  "'] .communication_user_item_color_box").css("border-color");
				
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + user_name).css("background-color", light_color);
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + user_name).css("border-color", color);
				$(this.target).find(".CodeMirror-scroll").find(".user_name_" + user_name).css("color", color);
				
				$(this.target).find(".CodeMirror-scroll").find(".user_cursor_" + user_name).css("border-color", color);
			}
		}

		this.updating_process_running = false;
	},
	
	change: function(message){
		var self = this;
		
		if (message.user != core.user.id) {
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

	},
	
	check_collaboration: function(){
		var self = this;
		if(!self.parent.filepath) return ;
		var project = self.parent.filepath.split("/").shift();
		
		if(core.status.current_project_path != project) {
			self.is_collaborating = false;
		}
		else {
			self.is_collaborating = true;
		}
		
		return self.is_collaborating;
	}
};
