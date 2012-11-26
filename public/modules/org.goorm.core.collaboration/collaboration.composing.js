/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.collaboration.composing = function () {
	this.target = null;
	this.objects = null;
	this.userID = 0;
	this.socket = null;
	this.predefinedColors = null;
	this.assignedColors = null;
	this.updating_process_running = false;
	this.update_queue = [];
	this.diff_worker = null;
	this.patch_worker = null;
	this.object_uuids = null;
	this.file_id = null;
	this.is_collaboration_on = null;
	this.panel = null;
	this.left = null;
	this.top = null;
	this.auto_save_timer = null;
	this.status=0;
	this.timer = null;
};

org.goorm.core.collaboration.composing.prototype = {
	init: function (target) {
		
		var self = this;
		this.target = target;
		
		this.file_id = this.target.parent.filename;
		
		this.objects = this.target.objects;
		
		this.update_queue = [];
		
		this.predefinedColors = ["#FFCFEA", "#E8FF9C", "#FFCC91", "#42C0FF", "#A7FF9E", "#7DEFFF", "#BABDFF", "#FFD4EB", "#AAFF75", "#FF9EAB", "#DCFF91", "#8088FF"];
		this.assignedColors = {};
		
		this.socket = io.connect();
 		
 		/* 		
 		this.diff_worker = new Worker('module/org.goorm.core.collaboration/collaboration.design.worker.diff.js');
 		this.patch_worker = new Worker('module/org.goorm.core.collaboration/collaboration.design.worker.patch.js');
 		*/
 		
/*
 		this.diff_worker.onmessage = function(ev){
			var uuid = ev.data.id;
		    var content = ev.data.changes;
		
		    // send the diff to server via the open socket
		    //if(ev.data != "send_snapshot")
		    var line_msg = {"uuid": uuid, "content": content };
		    socket.send('{ "channel":"design", "action": "modify_line", "identifier": "' + self.identifier +'", "message": ' + JSON.stringify(line_msg) + '}');
		    
		};
		
		this.patch_worker.onmessage = function(ev){
			var patching_uuid = ev.data[0];
			var patch_user_id = ev.data[1];
			var changed_content = ev.data[2];
			var modifying_line = $("[data-uuid=" + patching_uuid + "]");
		
			if(changed_content != ""){
				$(modifying_line).html(changed_content);
		      
				//update the stored line in hash
				stored_lines[patching_uuid] = {"content": changed_content}
			}
		}
*/
		
		this.auto_save_timer = null;  
		
		var check_for_updates = function () {
			
			while(self.update_queue.length > 0 && self.updating_process_running == false) {
				var current_update = self.update_queue.shift(); 
				
/*
				if(current_update["channel"] != "chat"){
					if(!self.playback_mode && (current_update["payload"]["user"] == self.userID)){
						clearTimeout(self.auto_save_timer);
						self.auto_save_timer = setTimeout(function(){
							//self.socket.send('{"channel": "design","action":"autoSaved", "identifier":"'+self.identifier+'", "message":""}');
							self.target.parent.save();
						},5000);
						return false;
					}
				}
*/
				
				self.updating_process_running = true;
				
				self.apply_update(current_update.action, current_update);
			}
		};
		
		
		$(this).bind("add", function (evt, object) {
			if (object.properties.is_drawing_finished) {
				var object_data = {
					type: object.type,
					shape_name: object.shape_name,
					properties: {
						focus: object.properties.focus,
						is_dragging: object.properties.is_dragging,
						is_drawing_finished: object.properties.is_drawing_finished,
						selected_node: object.properties.selected_node,
						sx: object.properties.sx,
						sy: object.properties.sy,
						ex: object.properties.ex,
						ey: object.properties.ey,
						previous_x: object.properties.previous_x,
						previous_y: object.properties.previous_y,
						id: object.properties.id,
						name: object.properties.name,
						x: object.properties.x,
						y: object.properties.y,
						width: object.properties.width,
						height: object.properties.height,
						dashed: object.properties.dashed,
						connector: object.properties.connector,
						attribute_list: object.properties.attribute_list
					} 
				};
				
				object_data.shape = {};
				object_data.shape.properties = {};
				
				$.each(object.shape.properties, function (key, value) {
					eval("object_data.shape.properties." + key + " = '" + encodeURIComponent(value) + "';");
				});
				
				self.socket.emit("message", '{"channel": "composing", "action":"add_object", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "workspace": "'+ core.status.current_project_name +'", "filepath":"' + self.filepath + '", "message": { "object": ' + JSON.stringify(object_data) + ' }}');
			}
		});
		
		$(this).bind("modify", function (evt, object) {
			if (object != null && object != undefined) {
				object.properties.status = "none";
				
				var inner_node = [];
				
				$(object.properties.inner_node).each(function(){
					inner_node.push({x:object.x, y:object.y});
				});
				
				var object_data = {
					type: object.type,
					shape_name: object.shape_name,
					properties: {
						focus: object.properties.focus,
						is_dragging: object.properties.is_dragging,
						is_drawing_finished: object.properties.is_drawing_finished,
						selected_node: object.properties.selected_node,
						sx: object.properties.sx,
						sy: object.properties.sy,
						ex: object.properties.ex,
						ey: object.properties.ey,
						previous_x: object.properties.previous_x,
						previous_y: object.properties.previous_y,
						id: object.properties.id,
						name: object.properties.name,
						x: object.properties.x,
						y: object.properties.y,
						width: object.properties.width,
						height: object.properties.height,
						dashed: object.properties.dashed,
						inner_node: inner_node,
						connector: object.properties.connector,
						attribute_list: object.properties.attribute_list
					}
				};
				
				object_data.shape = {};
				object_data.shape.properties = {};
					
				$.each(object.shape.properties, function (key, value) {	
					eval("object_data.shape.properties." + key + " = '" + encodeURIComponent(value) + "';");
				});
				
				self.socket.emit("message", '{"channel": "composing", "action":"modify_object", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "workspace": "'+ core.status.current_project_name +'", "filepath":"' + self.filepath + '", "message": { "object": ' + JSON.stringify(object_data) + ' }}');
			}
		});
		
		$(this).bind("remove", function (evt, object_id) {
			var object_data = {
				properties: {
					id: object_id
				}
			};
		
			self.socket.emit("message", '{"channel": "composing", "action":"remove_object", "user":"' + core.user.id + '", "nick":"'+core.user.nick+'", "workspace": "'+ core.status.current_project_name +'", "filepath":"' + self.filepath + '", "message": { "object": ' + JSON.stringify(object_data) + ' }}');
		});
		
		this.timer = window.setInterval(check_for_updates, 500);
		
		//Set Callback Function for Listening from Collaboration Server 
		this.socket.on("composing_message", function (data) {
			if(!data) {
 				return false;
 			}

			var received_msg = JSON.parse(data);
			
			if(received_msg.channel == "composing" && 
			   received_msg.user != core.user.id &&
			   received_msg.filepath == self.filepath) {
			
				switch(received_msg.action){
					case "add_object":
						self.update_queue.push(received_msg);
						break;
					case "modify_object":
						self.update_queue.push(received_msg);
						break;
					case "remove_object":
						self.update_queue.push(received_msg);
						break;			
					default:
						console.log("invalid update");
				 }
			}
			
		});
	},
	
	set_filepath: function () {
		this.filepath = this.target.parent.filepath + this.target.parent.filename;
	},
	
	apply_update: function (action, update) {
		switch(action){
			case "add_object":
				this.add_object(update);
				break;
			case "modify_object":
				this.modify_object(update);
				break;
			case "remove_object":
				this.remove_object(update);
				break;
			default:
				console.log("invalid update");
		};
	},
	
/*
	set_user_panel: function(){
		var self = this;
		
		$(this.target.target).append("<div class='div_design_collaboration_user_container'></div>");
		
		this.panel = new YAHOO.widget.Panel(
				$(this.target.target).find(".div_design_collaboration_user_container")[0], { 
				width: 200,
				height: 90,
				visible: true, 
				underlay: "none",
				close: false,
				autofillheight: "body",
				draggable: true,
				constraintoviewport: true
			} 
		);	
		
		//////////////////////////////////////////////////////////////////////////////////////////
		// window setting
		//////////////////////////////////////////////////////////////////////////////////////////	
		
		this.panel.setHeader("<div style='overflow:auto' class='titlebar'><div style='float:left; font-size:9px;'>User</div><div class='window_buttons'><img src='images/icons/context/closebutton.png' class='close window_button' /></div></div>");
		this.panel.setBody("<div class='designCollaborationUserContainer' style='overflow-y:scroll;height:65px;padding-left:5px'></div>");
		this.panel.render();
		
		$(this.target.target).find(".div_design_collaboration_user_container").parent().css("left", 70);
		$(this.target.target).find(".div_design_collaboration_user_container").parent().css("top", 55);
		
		this.left = 70;
		this.top = 55;
		this.panel.dragEvent.subscribe(function(i,e){
			if(e[0] =="endDrag") {
				var movedLeft = $(self.target.target).scrollLeft();
				var movedTop = $(self.target.target).scrollTop();
				
				self.left = parseInt($(self.target.target).find(".div_design_collaboration_user_container").parent().css("left")) - movedLeft;
				self.top = parseInt($(self.target.target).find(".div_design_collaboration_user_container").parent().css("top")) - movedTop;
			}
		});
		
		$(this.target.target).scroll(function () {
			var movedLeft = $(this).scrollLeft();
			var movedTop = $(this).scrollTop();
			
			if(movedTop+$(this).height() > $(this).find(".space").height()+14) {
				$(this).scrollTop($(this).find(".space").height()-$(this).height()+14);
			}
			else {
				$(this).find(".div_design_collaboration_user_container").parent().css("left", movedLeft + self.left);
				$(this).find(".div_design_collaboration_user_container").parent().css("top", movedTop + self.top);
			}
		});
	},
	
	add_user: function (id) {
		var new_user_li = $("<div id='user-" + id + "'></div>");
	    this.assignedColors[id] = this.predefinedColors.pop();
	
	    new_user_li.append("<span class='user_color' style='background-color:" + this.assignedColors[id] + "; color: " + this.assignedColors[id] + "'>.</span>");
	    new_user_li.append("<span class='user_name'>User-" + id + "</span>");
	    $(this.target.target).find(".designCollaborationUserContainer").append(new_user_li);
	},
	
	removeUser: function (id) {
		$("div").find(".designCollaborationUserContainer").find("#user-" + id).remove();
	},
*/
	
	add_object: function (data) {
		var self = this;
		
		var object = eval(data.message.object);
		var add_object_available = true;
		
		$(self.objects).each(function (i) {
			//if (this.data_uuid)	{			
				//if (this.data_uuid == object.data_uuid || this.properties.id == object.properties.id) {
				if (this.properties.id == object.properties.id) {
					add_object_available = false;
					
					return false;
				}
			//}
		});
		
		if (add_object_available) {
			this.target.add(object.type, object.shape_name);			
			this.set_properties(self.objects[self.objects.length-1], object);			
			this.target.draw();

			this.object_uuids.push(object.data_uuid);
		}
		
		
		this.updating_process_running = false;
	},

	set_properties: function (target, source) {
		target.type = source.type;
		target.shape_name = source.shape_name;
		target.data_uuid = source.data_uuid;
		
		target.properties.focus = source.properties.focus;
		target.properties.is_dragging = source.properties.is_dragging;
		target.properties.is_drawing_finished = source.properties.is_drawing_finished;
		target.properties.selected_node = source.properties.selected_node;
		target.properties.sx = source.properties.sx;
		target.properties.sy = source.properties.sy;
		target.properties.ex = source.properties.ex;
		target.properties.ey = source.properties.ey;
		target.properties.previous_x = source.properties.previous_x;
		target.properties.previous_y = source.properties.previous_y;
		target.properties.id = source.properties.id;
		target.properties.name = source.properties.name;
		target.properties.x = source.properties.x;
		target.properties.y = source.properties.y;
		target.properties.width = source.properties.width;
		target.properties.height = source.properties.height;
		target.properties.dashed = source.properties.dashed;
		
		//console.log(source.properties.inner_node);
		
		target.properties.inner_node = [];
		
		$(source.properties.inner_node).each(function() {
			target.properties.inner_node.push({x:this.x, y:this.y});
		});
		
		target.properties.connector = source.properties.connector;
		target.properties.attribute_list = source.properties.attribute_list;
				
		if(source.shape.properties != null){
			$.each(source.shape.properties, function (key, value) {						
				eval("target.shape.properties." + key + " = '" + decodeURIComponent(value) + "';");
			});
		}
		
		target.shape.set_shape();
		target.shape.show();
	},

	modify_object: function (data) {
		var object = eval(data.message.object);
		var index = -1;
		
		$(this.target.objects).each(function (i) {
			//if (this.data_uuid == object.data_uuid && this.properties.id == object.properties.id) {
			if (this.properties.id == object.properties.id && index < 0) {
				index = i;
			}
		});
		
		
		if (index > -1) {
			this.set_properties(this.target.objects[index], object);
			this.target.draw();
		}
		
		this.updating_process_running = false;
		
		
	},
	
	remove_object: function (data) {
		var self = this;
		
		var id = data.message.object.properties.id;
		
		$(this.target.objects).each(function (i) {				
			if (this.properties.id == id) {
				this.remove();
				//self.object_uuids.pop(uuid);
		
				return false;
			}
		});
		
		this.updating_process_running = false;
	}
};