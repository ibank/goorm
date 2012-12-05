/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/**
 * File history management module is below.
 * This module is programmed by Yoon-seop Choe.
 * server module : modules/org.goorm.core.collaboration/collaboration.history.js
 * some algorithms, values, or scheme should be synched with server module.
 **/

org.goorm.core.collaboration.history = function () {
	this.socket = null;
	
	// this.buffer=[];				// stores list of snapshot's compositions
	this.circular_queue=[];		// stores list of snapshots
	this.queue_max=10;			// size of circular queue + 1.     synch with server.
	this.queue_front=0;
	this.queue_rear=0;
	this.queue_count=0;
	
	// this.timer=null;	// when time consumed, call snapshot().
	this.editor=null;
	this.target=null;
	this.user=null;
	
	this.str_selection="";
	this.char_left="";	// for Backspace
	this.char_right="";	// for Del
	this.str_line="";	// for Ctrl+D
	this.pressed_key=null;
	this.latest_version="";
	this.mode="latest";	// switched with "history"
	
	this.last_init_load = "";
	this.wait_for_loading = true;
	this.activated = false; // true => get history from server when editor initialized.
	this.filename = ""; 
	this.friends_snapshot_buffer = [];
};

org.goorm.core.collaboration.history.prototype = {
	resize : function(){
		var layout_right_height = $(".yui-layout-unit-right").find(".yui-layout-wrap").height() - 25;
		$("#history_container").height(layout_right_height - 27);
	},
	init: function(){
		var self = this;
		$(core).bind("layout_resized", self.resize);
 		$(window).unload(function() {
 			self.leave();
 		});
	},
	
	flush_friends_snapshot_buffer: function(){
		var self = this;
		var ev;
		var apply = function(ev){
			// console.log(ev);
			if(ev.text.length==0) ev.text.push("");
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
	
	init_history: function(parent){
		this.leave();
		var self = this;
		this.parent = parent;
		this.target = parent.target;
		this.editor = parent.editor;
		
		$("#history").html("<div class='history_item history_header history_selected' localization_key='now'>Now</div><div id='history_container'></div>");
		$("#history .history_header").unbind('click');
		
		this.filename = this.parent.filepath + this.parent.filename;
		if(this.filename.slice(0,1)!="/") this.filename = "/" + this.filename;
		
		//init history
		this.buffer=[];
		this.circular_queue=[];
		this.queue_front=0;
		this.queue_rear=0;
		this.queue_count=0;
		$("#history_container").empty();
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
				self.update_history_tab();
			},
			error: function(data, status, err){
				console.log(data, status, err);
			}
		});
		self.mode="latest";

		/**
		 * Socket Message Event Handler
		 */
		this.socket = this.parent.collaboration.socket;
		this.join();
		this.socket.removeAllListeners("history_message");
 		this.socket.on("history_message", function (data) {
			var snapshot = JSON.parse(data);
			// console.log("snapshot", snapshot);
			if(snapshot.filename != self.filename) return;
			if(self.mode=="history"){
				self.friends_snapshot_buffer.push(snapshot);		//when you looking history...
			}else{
	 			self.queue_push(snapshot);
	 			self.update_history_tab();
			}
		});
		this.socket.removeAllListeners("disconnect");
 		this.socket.on('disconnect', function(){
 			self.leave();
 		});
 		
 		self.resize();
	},
	
	queue_push: function(snapshot){
		var self = this;
		this.latest_version = this.editor.getValue();
		this.circular_queue[this.queue_rear] = snapshot;
		this.queue_rear = ++this.queue_rear % this.queue_max;
		if(this.queue_count==this.queue_max-1){
			this.queue_front = ++this.queue_front % this.queue_max;
		}else{
			this.queue_count += 1;
		}
	},
	
	update_history_tab: function(){
		var self = this;
		/* update history item list */
		$("#history_container").empty();
		
		var history_item_click_listener = function(oldest, latest){
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
			
			var restore = function(ev){
				if(ev.text.length==0) ev.text.push("");
				self.editor.replaceRange(ev.before
					, {ch:Number(ev.from.ch), line:Number(ev.from.line)}
					, {
						line:Number(ev.from.line)+Number(ev.text.length)-1
						, ch:(ev.text.length==1)?Number(ev.from.ch) + ev.text[ev.text.length-1].length : ev.text[ev.text.length-1].length
					});
			}
			for(var i = (latest - 1 + self.queue_max) % self.queue_max;
					i != (oldest - 1 + self.queue_max) % self.queue_max;
					i = (--i + self.queue_max) % self.queue_max){
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
					if((i-1+self.queue_max)%self.queue_max == (oldest - 1 + self.queue_max) % self.queue_max){
						for(var k=buf[j].from.line; k<=buf[j].to.line; k++){
							self.editor.setLineClass(k, "history_line_marker", "history_line_marker");
							// self.editor.markText(buf[j].from, buf[j].to, "history_ch_marker");
							// self.editor.setMarker(k, " ", "history_line_marker");
						}
						self.editor.markText(buf[j].from, buf[j].to, "history_ch_marker");
					}
				}
			}
		};
		
		var history_column_defs = [
		    { key: "committer", label: "User ID", sortable: false},
		    { key: "time", label: "Time", sortable: false},
		    { key: "count", label: "Event", sortable: false}
		];
		
		var history_data_source = new YAHOO.util.DataSource();
		history_data_source.responseSchema = {
		    fields: [
		        { key: "committer" },
		        { key: "time" },
		        { key: "count" }
		    ]
		};
		history_data_source.responseSchema = {
			fields: ["committer","time","count","snapshot"]
		};
		
		var history_datatable = new YAHOO.widget.DataTable("history_container", history_column_defs, history_data_source);
		var columns = $("#history_container thead span");
		if(columns.length>0){
			$(columns[0]).attr("localization_key", "userid");
			$(columns[1]).attr("localization_key", "time");
			$(columns[2]).attr("localization_key", "event");
		}
		
		// console.log(self.circular_queue);
		
		for(var i=self.queue_front; i!=self.queue_rear; i = (i+1) % self.queue_max){
			var unit = self.circular_queue[i];
			history_datatable.addRow({
				committer: unit.committer.join(",")
				, time: unit.time.slice(0,19)
				, count: unit.buffer.length
				, oldest: i
				, latest: self.queue_rear
			}, 0);
		};
		history_datatable.set("selectionMode", "single");
		history_datatable.subscribe("rowClickEvent", function(oArgs){
			var target = oArgs.target,
				record = this.getRecord(target);
			history_item_click_listener(record.getData().oldest, record.getData().latest);
			// console.log("record:",record);
			history_datatable.onEventSelectRow(oArgs);
		});
	},
	
	enable_now_button: function(){
		var self = this;
		$("#history .history_header").unbind("click");
		$("#history .history_header").bind("click", function(){
			$('#history .history_selected').removeClass("history_selected");
			$("#history .history_header").addClass("history_selected");
			$("#history .history_header").unbind("click");
			
			self.editor.setValue(self.latest_version);
			self.flush_friends_snapshot_buffer();
			self.editor.setOption("readOnly",false);
			self.mode = "latest";
		});
	},

	// socket
	join: function () {
		if(core.user.id && this.socket){
			// console.log("joined", core.user.id, this.filename);
			this.socket.emit("join", '{"channel": "history", "filename":"'+ this.filename +'", "userid":"' + core.user.id + '"}');
		}
	},
	leave: function () {
		if(core.user.id && this.socket){
			// console.log("leaved", core.user.id, this.filename);
			this.socket.emit("leave", '{"channel": "history", "filename":"'+ this.filename +'", "userid":"' + core.user.id + '"}');
		}
	}
}