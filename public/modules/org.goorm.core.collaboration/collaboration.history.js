/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/**
 * File history management module
 * server module : modules/org.goorm.core.collaboration/collaboration.history.js
 * some algorithms, values, or scheme must be synchronized with server-side js.
 * @author : roland87
 */

org.goorm.core.collaboration.history = function () {
	this.socket = null;
	
	/**
	* QUEUE_MAX = size of circular queue + 1
	* must be synchronized with server-side js
	* /modules/org.goorm.core.collaboration/collaboration.history.js
	*/
	this.QUEUE_MAX = 30; 
	this.queue_front = 0;
	this.queue_rear = 0;
	this.queue_count = 0;
	this.circular_queue = [];		// stores list of snapshots
	this.selected_row_idx = -1;
	this.selected_snapshot = null;
	
	this.editor = null;
	this.target = null;
	this.user = null;
	
	this.str_selection = "";
	this.char_left = "";	// for Backspace
	this.char_right = "";	// for Del
	this.str_line = "";		// for Ctrl+D
	this.pressed_key = null;
	this.latest_version = "";
	this.mode = "latest";	// toggled with "history"
	
	this.last_init_load = "";
	this.wait_for_loading = true;
	this.activated = false; // true => get history from server when editor initialized.
	this.filename = ""; 
	this.friends_snapshot_buffer = [];
	
	//localization string cache
	this.string_userid = "User ID";
	this.string_time = "Time";
	this.string_events = "Events";
	this.string_delay = "Delay";
	
	this.history_datatable = null;
	
	//playback control
	this.pause_flag = false;
	this.timer = null;
	this.btn_activated = false;
};

org.goorm.core.collaboration.history.prototype = {
	resize : function(){
		var layout_right_height = $(".yui-layout-unit-right").find(".yui-layout-wrap").height() - 25;
		$("#history_container").height(layout_right_height - 90);
	},
	init: function(){
		var self = this;
		$(core).bind("layout_resized", self.resize);
 		$(window).unload(function() {
 			self.leave();
 		});
 		//$("#history").html("<div id='history_player_control'><select id='history_selectbox'><option value='200' selected localization_key='history_speed_veryfast'>Very Fast</option><option value='600' localization_key='history_speed_fast'>Fast</option><option value='1000' selected localization_key='history_speed_normal'>Normal</option><option value='1400' localization_key='history_speed_slow'>Slow</option><option value='1800' localization_key='history_speed_veryslow'>Very Slow</select><button id='btn_history_play'><img src='images/icons/context/play.png'></button><button id='btn_history_pause'><img src='images/icons/context/pause.png'></button><button id='btn_history_stop'><img src='images/icons/context/stop.png'></button></div><div class='history_item history_header history_selected' localization_key='now'>Now</div><div id='history_container'></div><div id='history_bottom' class='main_toolbar'><span localization_key='history_delay'>Delay(sec) </span><input type='text' id='txt_history_delay'/> <a tooltip='history_save' title='save'><div id='btn_history_save' class='toolbar_button save' style=\"background:url('configs/toolbars/org.goorm.core.file/image/save.png') no-repeat;background-position: center;\"></div></a><a tooltip='history_delete' title='delete'><div id='btn_history_delete' class='toolbar_button delete' style=\"background:url('configs/toolbars/org.goorm.core.edit/image/delete.png') no-repeat;background-position: center;\"></div></a></div>");
 		$("#history").html("<div id='history_player_control'><select id='history_selectbox'><option value='200' selected localization_key='history_speed_veryfast'>Very Fast</option><option value='600' localization_key='history_speed_fast'>Fast</option><option value='1000' selected localization_key='history_speed_normal'>Normal</option><option value='1400' localization_key='history_speed_slow'>Slow</option><option value='1800' localization_key='history_speed_veryslow'>Very Slow</select><button id='btn_history_play'><img src='images/icons/context/play.png'></button><button id='btn_history_pause'><img src='images/icons/context/pause.png'></button><button id='btn_history_stop'><img src='images/icons/context/stop.png'></button></div><div class='history_item history_header history_selected' localization_key='now'>Now</div><div id='history_container'></div><div id='history_bottom' class='main_toolbar'><a tooltip='history_delete' title='delete'><div id='btn_history_delete' class='toolbar_button delete' style=\"background:url('configs/toolbars/org.goorm.core.edit/image/delete.png') no-repeat;background-position: center;\"></div></a></div>");
 		
 		/**
 		* Playback Button Event Handlers
 		*/
 		ged=self;
 		new YAHOO.widget.Button("btn_history_play", {
 			onclick: {
 				fn:function(){
 					if (self.btn_activated == false) return;
 					if (self.selected_row_idx == -1) self.selected_row_idx = self.circular_queue.length;
 					var playback = function() {
 						clearTimeout(self.timer);
 						if(self.selected_row_idx == -1) return;
 						self.selected_row_idx--;
 						if(self.selected_row_idx == -1){
 							$("#history .history_header").click(); // "now" button click
 						} else {
 							var delay = (self.selected_snapshot!=null) ? self.selected_snapshot.delay * 1000 : 0;
							var apply = function(ev){
								if(ev.text.length == 0) ev.text.push("");
								self.editor.replaceRange(ev.text.join("\n"), ev.from, ev.to);
								if(ev.next) apply(ev.next);
							}
							//play start
	 						self.timer = setTimeout(function(){
		 						$(self.history_datatable.getTrEl(self.selected_row_idx)).click();
								var snapshot = self.circular_queue[self.queue_front + ((self.circular_queue.length - 1 - self.selected_row_idx + self.QUEUE_MAX) % self.QUEUE_MAX)];
								var j = 0;
								//typing effect
								self.timer = setInterval(function(){
									apply(snapshot.buffer[j++]);
									if (j == snapshot.buffer.length) {
										//play next snapshot
										clearTimeout(self.timer);
										if(self.selected_row_idx==0)
				 							self.timer = setTimeout(playback, Number($("#history_selectbox").attr("value")) + self.selected_snapshot.delay * 1000);
				 						else
				 							self.timer = setTimeout(playback, Number($("#history_selectbox").attr("value")));
									}
								}, Number($("#history_selectbox").attr("value")) / snapshot.buffer.length * 0.5);
	 						}, delay);
 						}
					}
 					self.timer = setTimeout(playback, Number($("#history_selectbox").attr("value")));
				}
			}
		});
 		new YAHOO.widget.Button("btn_history_pause", {
 			onclick: {
 				fn:function(){
 					clearTimeout(self.timer);
				}
			}
		});
 		new YAHOO.widget.Button("btn_history_stop", {
 			onclick: {
 				fn:function(){
 					self.selected_row_idx = -1;
 					if (self.btn_activated == false) return;
 					$("#history .history_header").click(); // "now" button click
				}
			}
		});
		$("#btn_history_save").unbind('click');
		$("#btn_history_save").bind('click', function () {
			if (self.selected_row_idx == -1) return;
			self.socket.emit('message', JSON.stringify({
				channel: 'history',
				filepath: self.filename,
				action: 'set_delay',
				index: self.selected_snapshot.index,
				delay: Number ($('#txt_history_delay').attr('value'))
			}));
		});
		$("#btn_history_delete").unbind('click');
		$("#btn_history_delete").bind('click', function () {
			if (self.selected_row_idx == -1) return;
			self.socket.emit('message', JSON.stringify({
				channel: 'history',
				filepath: self.filename,
				action: 'merge',
				index: self.selected_snapshot.index
			}));
		});
		
		var history_column_defs = [
		    { key: "committer", label: self.string_userid, sortable: false},
		    { key: "time", label: self.string_time, sortable: false},
		    { key: "count", label: self.string_events, sortable: false},
		    { key: "delay", label: self.string_delay, sortable: false, editor: new YAHOO.widget.TextboxCellEditor({ validator: YAHOO.widget.DataTable.validateNumber, disableBtns: true } )}
		];
		var history_data_source = new YAHOO.util.DataSource();
		history_data_source.responseSchema = {
		    fields: [
		        { key: "committer" },
		        { key: "time" },
		        { key: "count" },
		        { key: "delay" },
		        { key: "index" }
		    ]
		};
		self.history_datatable = new YAHOO.widget.DataTable("history_container", history_column_defs, history_data_source);
		var columns = $("#history_container thead span");
		if(columns.length>0){
			$(columns[0]).attr("localization_key", "userid");
			$(columns[1]).attr("localization_key", "time");
			$(columns[2]).attr("localization_key", "event");
			$(columns[3]).attr("localization_key", "delay");
		}
		
		self.string_userid = $("#history_container [localization_key=userid]").text() || "User ID";
		self.string_time = $("#history_container [localization_key=time]").text() || "Time";
		self.string_events = $("#history_container [localization_key=event]").text() || "Event";
		self.string_delay = $("#history_container [localization_key=delay]").text() || "Delay";
		
		/**
		* describes history item click click listener.
		* restores actions.
		*/
		var history_item_click_listener = function(oldest, latest){
		
			// initializes views
			self.enable_now_button();
			var div = $(this);
			$('#history .history_selected').removeClass("history_selected");
			div.addClass("history_selected");
			
			if(self.mode=="history"){
				self.editor.setValue(self.latest_version);
			}else{
				self.mode = "history";
				self.editor.setOption("readOnly",true);
			}
			
			// restores events
			var restore = function(ev){
				if(ev.text.length==0) ev.text.push("");
				self.editor.replaceRange(ev.before
					, {ch:Number(ev.from.ch), line:Number(ev.from.line)}
					, {
						line:Number(ev.from.line)+Number(ev.text.length)-1
						, ch:(ev.text.length==1)?Number(ev.from.ch) + ev.text[ev.text.length-1].length : ev.text[ev.text.length-1].length
					});
			}
			
			for(var i = (latest - 1 + self.QUEUE_MAX) % self.QUEUE_MAX;
					i != (oldest - 1 + self.QUEUE_MAX) % self.QUEUE_MAX;
					i = (--i + self.QUEUE_MAX) % self.QUEUE_MAX){
				var buf = self.circular_queue[i].buffer;
				for(var j=buf.length-1; j>=0; j--){
					if(buf[j].before=="" && buf[j].from.line!=buf[j].to.line) buf[j].before="\n";
					if(!buf[j].before) buf[j].before="";
					if(buf[j].next){
						if(!buf[j].next.before) buf[j].next.before="";
						restore(buf[j].next);
						restore(buf[j]);
					}else{
						restore(buf[j]);
					}
					//is it the last snapshot?
					if((i-1+self.QUEUE_MAX)%self.QUEUE_MAX == (oldest - 1 + self.QUEUE_MAX) % self.QUEUE_MAX){
						//clean up markers
						if (j == buf.length-1) {
							for (var k=0; k<self.editor.lineCount(); k++) {
								self.editor.setLineClass(k, "");
							}
						}
						//mark up modified lines
						for (var k=buf[j].from.line; k<=buf[j].to.line; k++) {
							self.editor.setLineClass(k, "history_line_marker", "history_line_marker");
						}
						self.editor.markText(buf[j].from, buf[j].to, "history_ch_marker");
					}
				}
			}
		};
		self.history_datatable.set("selectionMode", "single");
		
		//attach event handler
		self.history_datatable.subscribe("rowClickEvent", function(oArgs){
			var target = oArgs.target,
				record = this.getRecord(target);
			var snapshot = record.getData();
			history_item_click_listener(snapshot.oldest, snapshot.latest);
			self.selected_row_idx = oArgs.target.rowIndex - 2;
			self.selected_snapshot = snapshot;
			$("#txt_history_delay").attr("value", snapshot.delay);
			$("#txt_history_delay").attr("disabled", null);
			self.history_datatable.onEventSelectRow(oArgs);
		});
		
		self.history_datatable.subscribe("cellClickEvent",self.history_datatable.onEventEditCell);
		self.history_datatable.subscribe("cellMouseoverEvent",self.history_datatable.onEventHighlightCell);
		self.history_datatable.subscribe("cellMouseoutEvent",self.history_datatable.onEventUnhighlightCell);
		
	        // Hook into custom event to customize save-flow of "radio" editor 
        self.history_datatable.subscribe("editorSaveEvent", function(oArgs) { 
			if (self.selected_row_idx == -1) return;
			self.socket.emit('message', JSON.stringify({
				channel: 'history',
				filepath: self.filename,
				action: 'set_delay',
				index: self.selected_snapshot.index,
				delay: Number (oArgs.newData)
			}));
        }); 
		
		self._set_now_status();
	},
	
	flush_friends_snapshot_buffer: function(){
		var self = this;
		var ev;
		var apply = function(ev){
			if(ev.text.length == 0) ev.text.push("");
			self.editor.replaceRange(ev.text.join("\n"), ev.from, ev.to);
		}
		for(var i=0; i<self.friends_snapshot_buffer.length; i++){
			var snapshot = self.friends_snapshot_buffer[i];
			for(var j=0; j<snapshot.buffer.length; j++){
				ev = snapshot.buffer[j];
				apply(ev);
				if(ev.next) apply(ev.next);
				self.queue_push(snapshot);
			}
		}
		self.friends_snapshot_buffer = [];
		self.update_history_tab();
	},

	update_selection: function(){
		var cur = this.editor.getCursor();
		if(this.editor.somethingSelected()) this.str_selection = this.editor.getSelection();
		this.str_line = this.editor.getLine(cur.line);
		this.char_left = this.editor.getRange({line:cur.line, ch:cur.ch-1}, cur);
		this.char_right = this.editor.getRange(cur, {line:cur.line, ch:cur.ch+1});
	},
	
	deactivated: function () {
		if(this.filename == "") return;
		var self = this;
 		self.selected_row_idx = -1;
 		$("#history .history_header").click(); // "now" button click
		self.history_datatable.getRecordSet().reset();
		self.history_datatable.render();
		$("#btn_history_play").unbind('click');
		$("#btn_history_pause").unbind('click');
		$("#btn_history_stop").unbind('click');
		$("#history .history_header").unbind('click');
		$("#history_save").unbind('click');
		$("#history_delete").unbind('click');
		this.filename = "";
		self._set_now_status();
		this.socket.removeAllListeners("history_message");
		clearTimeout(self.timer);	//stop playback
		self.btn_activated = false;
		self.leave();
	},
	
	init_history: function(parent){
		this.leave();
		var self = this;
		this.parent = parent;
		this.target = parent.target;
		this.editor = parent.editor;
		
		$("#history .history_header").unbind('click');
		
		this.filename = this.parent.filepath + this.parent.filename;
		if(this.filename.slice(0,1)!="/") this.filename = "/" + this.filename;
		
		//init history
		this.buffer=[];
		this.circular_queue=[];
		this.queue_front=0;
		this.queue_rear=0;
		this.queue_count=0;
		clearTimeout(self.timer);
		self.mode="latest";

		/**
		 * Socket Message Event Handler
		 */
		this.socket = this.parent.collaboration.socket;
		this.join();
		this.socket.removeAllListeners("history_message");
 		this.socket.on("history_message", function (raw_data) {
			var data = JSON.parse(raw_data);
 			if (data.action == 'snapshot') {
 				/**
 				*	snapshot received
 				*/
 				var snapshot = data.snapshot;
				if (snapshot.filename != self.filename) return;
				if (self.mode == "history") {
					self.friends_snapshot_buffer.push(snapshot);		//when you looking history...
				} else {
		 			self.queue_push(snapshot);
		 			self.update_history_tab();
				}
			} else if (data.action == 'set_delay') {
 				/**
 				*	set_delay received
 				*/
				if (data.filename != self.filename) return;
				for (var i = self.queue_front; i != self.queue_rear; i = (i+1) % self.QUEUE_MAX){
					var unit = self.circular_queue[i];
					if (unit.index == data.index){
						self.circular_queue[i].delay = data.delay;
						break;
					}
				};
				for (var i = 0; i < self.queue_count; i++) {
					var record = self.history_datatable.getRecord(i);
					if (record.getData().index == data.index) {
						record.setData("delay", data.delay);
						self.history_datatable.refreshView();
						break;
					}
				}
			} else if (data.action == 'merge') {
 				/**
 				*	merge
 				*/
				if (data.filename != self.filename) return;
 				var selected_idx_old = -1;
 				if (self.mode == 'history') selected_idx_old = self.selected_row_idx;
 				$("#history .history_header").click(); // "now" button click
				self.refresh_from_server(function(){
					if (selected_idx_old != -1) $(self.history_datatable.getTrEl(selected_idx_old)).click();
				});
 			}
		});
		this.socket.removeAllListeners("disconnect");
 		this.socket.on('disconnect', function(){
 			self.leave();
 		});
		
		self.resize();
		self.refresh_from_server();
	},
	
	refresh_from_server: function (callback) {
		var self = this;
		self.queue_front = 0;
		self.queue_rear = 0;
		self.queue_count = 0;
		self.circular_queue = [];		// stores list of snapshots
		self.selected_row_idx = -1;
		self.selected_snapshot = null;
		
		$.ajax({
			url: "history/get_history",
			type: "POST",
			data: {filename:self.filename},
			dataType: "json",
			success: function(result){
				var history = result.history;
				
				for(var i=0; i<history.length; i++){
					var snapshot = history[i];
					snapshot.time = snapshot.time.slice(0,19);
					self.queue_push(snapshot);
				};
				self.btn_activated = true;
				self.update_history_tab();
				if (callback) callback();
			},
			error: function(data, status, err){
				console.log(data, status, err);
			}
		});
	},
	
	queue_push: function(snapshot){
		var self = this;
		this.latest_version = this.editor.getValue();
		this.circular_queue[this.queue_rear] = snapshot;
		this.queue_rear = ++this.queue_rear % this.QUEUE_MAX;
		if(this.queue_count==this.QUEUE_MAX-1){
			this.queue_front = ++this.queue_front % this.QUEUE_MAX;
		}else{
			this.queue_count += 1;
		}
	},
	
	update_history_tab: function(){
		var self = this;
		self.history_datatable.getRecordSet().reset();
		self.history_datatable.render();
		for (var i = self.queue_front; i != self.queue_rear; i = (i+1) % self.QUEUE_MAX){
			var unit = self.circular_queue[i];
			self.history_datatable.addRow({
				committer: unit.committer.join(",")
				, time: unit.time.slice(0,19)
				, count: unit.buffer.length
				, oldest: i
				, latest: self.queue_rear
				, index: unit.index
				, delay: unit.delay
			}, 0);
		};
		self._set_now_status();
	},
	
	enable_now_button: function(){
		var self = this;
		// Now button
		$("#history .history_header").unbind("click");
		$("#history .history_header").bind("click", function(){
			self.selected_row_idx = -1;
			if(self.btn_activated == false) return;
			$('#history .history_selected').removeClass("history_selected");
			$("#history .history_header").addClass("history_selected");
			$("#history .history_header").unbind("click");
			
			self.editor.setValue(self.latest_version);
			//clean up markers
			for (var k=0; k<self.editor.lineCount(); k++) {
				self.editor.setLineClass(k, "");
			}
			
			self.flush_friends_snapshot_buffer();
			self.editor.setOption("readOnly",false);
			self.mode = "latest";
			self._set_now_status();
			clearTimeout(self.timer);	//stop playback
		});
	},
	
	_set_now_status: function () {
		self.selected_row_idx = -1;
		self.selected_snapshot = null;
		$("#txt_history_delay").attr("value", "");
		$("#txt_history_delay").attr("disabled", "true");
	},

	// socket
	join: function () {
		if(core.user.id && this.socket){
			this.socket.emit("join", '{"channel": "filepath", "filename":"'+ this.filename +'", "user":"' + core.user.id + '", "sessionid":"' + this.socket.socket.sessionid + '"}');
		}
	},
	leave: function () {
		if(core.user.id && this.socket){
			this.socket.emit("leave", '{"channel": "filepath", "filename":"'+ this.filename +'", "user":"' + core.user.id + '", "sessionid":"' + this.socket.socket.sessionid + '", "nick":"'+core.user.nick+'", "workspace": "'+ core.status.current_project_path +'"}');
		}
		clearTimeout(this.timer);	//stop playback
	}
}