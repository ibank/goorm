/**
 * author: sung-tae ryu
 * email: xenoz0718@gmail.com
 * node.js book example, Freelec
 **/

var collaboration = {
	/*
this.target = null;
	this.diff_worker = null;
	this.patch_worker = null;
	socket = null;
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
*/
	updating_process_running: false,
	task_queue: [],
	

	init: function() {
		var self = this;
		
		socket = io.connect();
		
  		this.task_queue = [];
  		this.removed_lines_uuids = [];
 		
 		this.user = "test";

		var check_for_updates = function() {
			while(self.task_queue.length > 0 && self.updating_process_running == false) {
				var current_update = self.task_queue.shift(); 
				
				self.updating_process_running = true;
				
				self.apply_update(current_update.action, current_update.message);
			}
		};
 		
 		this.timer = window.setInterval(check_for_updates, 500);

 		socket.on("communication_message", function (data) {
 			console.log(data);
 			data = decodeURIComponent(data);
			
			data = ((data.replace(/&/g, '&amp;')).replace(/\"/g, '&quot;')).replace(/\'/g, '&#39;'); 
			data = data.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			
 			$("#messages").append("<div class='message'>" + data + "</div>");
 			$("#messages").scrollTop($("#messages").height());

 		});

		socket.on("editing_message", function (data) {
 			if(!data) {
 				return false;
 			}

			var received_msg = JSON.parse(data);
			
			if(received_msg.channel == "editing" && 
			   received_msg.username != username &&
			   received_msg.filepath == filepath) {
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
		
		socket.on("someone_joined", function (data) {
 			data = JSON.parse(data);
 			$("#user_list").empty();
 			
 			for(var i=0; i<data.length; i++){
 				var username = data[i];

 				$("#user_list").append('<div class="user">' + username + '</div>');
 			}
 			
 			$("#messages").append("<div class='alarm'>" + username + " joined this workspace!</div>");

 		});
 		
 		socket.on("someone_leaved", function (data) {
 			//data = JSON.parse(data);

 			$("#messages").append("<div class='alarm'>" + data + " leaved this workspace!</div>");
 			// $("#" + self.target).find(".communication_user_container").html(data.list.join("<br />"));
 		});
		
		socket.on("refresh_userlist", function (data) {
 			data = JSON.parse(data);
 			$("#user_list").empty();
 			
 			for(var i=0; i<data.length; i++){
 				var username = data[i];

 				$("#user_list").append('<div class="user">' + username + '</div>');
 			}
 		});
		
		setInterval(function() {
			$(".CodeMirror-scroll").find(".cursor").each(function (i) {
				if ($(this).css('visibility') == 'hidden') {
					$(this).css('visibility', 'visible');
				} else {
					$(this).css('visibility', 'hidden');
				}
			});
		}, 600);
		
		$("#input input").keypress(function(evt){
			if((evt.keyCode || evt.which) == 13){
				evt.preventDefault();
				
				self.message_process($(this).val());
				$(this).val("");
			}
		});
		
		$(window).unload(function() {
 			self.leave();
 		});
	},

	update_change: function(data){
		var self = this;

		if(socket != null){
			if (socket.socket.connected) {
				socket.emit("message", '{"channel": "editing", "action":"change", "username":"' + username + '", "filepath":"' + filepath + '", "message":' + JSON.stringify(data) + '}');
				
				clearTimeout(this.auto_save_timer);
				var action = function(){
					//self.parent.save();
				}
				this.auto_save_timer = setTimeout(action, 5000);
			}
		}
	},

	update_cursor: function(data) {
		var self = this;
		if(socket != null){
			if (socket.socket.connected) {
				data.username = username;
				
				socket.emit("message", '{"channel": "editing", "action":"cursor", "username":"' + username + '", "filepath":"' + filepath + '", "message":' + JSON.stringify(data) + '}');
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
	
	change: function(message){
		var self = this;

		if (message.username != username) {
			var textStr = "";
			
			for(var i=0; i < message.text.length; i++){
				if(i != 0 && message.text[0] != "\n" ){
					textStr+="\n";
				}
				textStr += message.text[i];
			}
			editor.codemirror.replaceRange(textStr, message.from, message.to);

			if(message.next){
				message.next.user = message.user;
				self.change(message.next);
			}
		}
		
		this.updating_process_running = false;
	},
	
	set_cursor: function(message) {
		console.log(message);
		
		if(message.username != username){
			var coords = editor.codemirror.charCoords({line:message.line, ch:message.ch});
			var scroll = editor.codemirror.getScrollInfo();
			
			var top = parseInt(coords.top) - parseInt($(".CodeMirror-scroll").offset().top) + scroll.top;
			var left = parseInt(coords.left) - parseInt($(".CodeMirror-scroll").offset().left)  + scroll.left;

			console.log(coords);
			console.log(scroll);

			var username = message.username;
			
			if ($(".CodeMirror-scroll").find(".username_" + username).length > 0) {
				$(".CodeMirror-scroll").find(".username_" + username).css("top", top - 8);
				$(".CodeMirror-scroll").find(".username_" + username).css("left", left + 5);
				
				$(".CodeMirror-scroll").find(".cursor_" + username).css("top", top);
				$(".CodeMirror-scroll").find(".cursor_" + username).css("left", left);
			}
			else {
				$(".CodeMirror-scroll").prepend("<span class='username_" + username + " username' style='top:" + (top - 8) + "px; left:" + (left + 5) + "px;'>" + username + "</span>");
				$(".CodeMirror-scroll").prepend("<span class='cursor_" + username + " cursor' style='top:" + top + "px; left:" + left + "px;'></span>");
				
				var red = Math.floor(Math.random()*206) - Math.floor(Math.random()*30);
				var green = Math.floor(Math.random()*206) - Math.floor(Math.random()*30);
				var blue = Math.floor(Math.random()*206) - Math.floor(Math.random()*30);
				
				var light_red = (red + 90 >= 255)? 255 : red + 90;
				var light_green = (red + 90 >= 255)? 255 : green + 90;
				var light_blue = (red + 90 >= 255)? 255 : blue + 90;
				
				var color = '#' + red.toString(16) + green.toString(16) + blue.toString(16);
				var light_color = '#' + light_red.toString(16) + light_green.toString(16) + light_blue.toString(16);
				
				$(".CodeMirror-scroll").find(".username_" + username).css("background-color", light_color);
				$(".CodeMirror-scroll").find(".username_" + username).css("border-color", color);
				$(".CodeMirror-scroll").find(".username_" + username).css("color", color);
				$(".CodeMirror-scroll").find(".cursor_" + username).css("border-color", color);
			}
		}

		this.updating_process_running = false;
	},
	
	generate_uuid: function(){
		var padid = "1";

		var userid = username;

		var d = new Date();
		var timestamp = $.map([d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
		d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()], function(n, i) {
			return (n < 10) ? "0"+n : n;
		}).join("");

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
	
	join: function () {
		socket.emit("join", '{"channel": "workspace", "action":"join", "username":"' + username + '", "message":"hello"}');
	},
	
	leave: function () {
		socket.emit("leave", '{"channel": "workspace", "action":"leave", "username":"' + username + '", "message":"goodbye"}');
	},
	
	message_process : function(message){
		var self = this;
		
		if (socket.socket.connected) {
		
			console.log(message);
			
			var encodedMsg = encodeURIComponent(message);
			
			socket.emit("message", '{"channel": "chat", "action":"send_message", "username":"' + username + '", "message":"' + encodedMsg + '"}');
		}
	}
};
