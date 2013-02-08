/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

// client module : public/modules/org.goorm.core.collaboration/collaboration.history.js
// some scheme / value / algorithm should be synched with client module.
var colors = require('colors')

var snapshot_fields = {
    filename: {type:String, index:true}
    , index: Number
    , buffer: Array
    , time: {type:String, index:true}
    , committer: Array
}
var queue_fields = {
	filename: {type:String, index:true}
	, project_path: {type:String, index:true}
	, front: Number
	, rear: Number
	, count: Number
}
var snapshot_schema = new Schema(snapshot_fields);
var queue_schema = new Schema(queue_fields)
var db = {
	snapshot : mongoose.model('history_snapshot', snapshot_schema)
	, queue : mongoose.model('history_queue', queue_schema)
}

var queue_max = 10;	// synch with client
var files = {};	//array of {users, committer, timer}. users are array of userid.

module.exports = {
	/* socket start */
	join: function (socket, msg) {
		if(msg.filename.slice(0,1)!="/") msg.filename = "/" + msg.filename;
		socket.join("." + msg.filename);
		socket.set('filename', msg.filename);
		
		// console.log("join".red, msg.filename);
		
		if(!files[msg.filename]){
			// there is no one who is opening this file!
			files[msg.filename] = {users:[msg.userid], timer:null, committer:[], buffer:[]};
		}else{
			// someone already opened this file.
			files[msg.filename].users.push(msg.userid);	//just join
		}
	}
	, leave: function (socket, msg) {
		if(msg.filename.slice(0,1)!="/") msg.filename = "/" + msg.filename;
		// socket.get("filename", function(err, name){
			// console.log("leave".red, msg.filename);
		// });
		socket.leave("."+msg.filename);
		if(!files[msg.filename]) return;
		if (files[msg.filename].users.length == 1){
			// you are the last people
			delete files[msg.filename];	 // destroy all
		}else{
			// another people is editing
			var index = -1;
			index = files[msg.filename].users.inArray(msg.userid);
			if(index>-1) files[msg.filename].users.remove(index);	// just leave
		}
	}
	, msg: function(socket, msg){
		if(msg.filepath.slice(0,1)!="/") msg.filepath = "/" + msg.filepath;
		if(msg.action!="change" || !files[msg.filepath]) return;
		var self = this;
		if(msg.filepath.slice(0,1)!="/") msg.filepath = "/" + msg.filepath;
		// console.log("history msg".red, msg);
		
		if(files[msg.filepath].timer!=null) clearTimeout(files[msg.filepath].timer); // when continuing typing
		files[msg.filepath].buffer.push(msg.message);	// save event
		if(files[msg.filepath].committer.inArray(msg.user)<0){
			files[msg.filepath].committer.push(msg.user);
		}
		
		files[msg.filepath].timer = setTimeout(function(){	// when you stop a typing,
			if(files[msg.filepath]){
				var date = new Date();
				var formatted = date.getFullYear() + "-" + ("0"+date.getMonth()).slice(-2) + "-" + ("0"+date.getDate()).slice(-2)
			 				+ " " + ("0"+date.getHours()).slice(-2) + ":" + ("0"+date.getMinutes()).slice(-2) + ":" + ("0"+date.getSeconds()).slice(-2)
			 				+ " " + ("000"+date.getMilliseconds()).slice(-3);
				var snapshot = {
					filename: msg.filepath
					, committer: files[msg.filepath].committer
					, buffer: files[msg.filepath].buffer
					, time: formatted
				}
				self.add_snapshot(socket, snapshot);
				socket.broadcast.to("."+snapshot.filename).emit("history_message", JSON.stringify(snapshot));
				socket.emit("history_message", JSON.stringify(snapshot));
				
				// console.log("snapshot".red, snapshot);
				
				files[msg.filepath].buffer = [];
				files[msg.filepath].committer = [];
			}
		}, 1000);
	}
	
	, add_snapshot: function(socket, snapshot_data){
		if(snapshot_data.filename.slice(0,1)!="/") snapshot_data.filename = "/" + snapshot_data.filename;
		db.queue.findOne({filename:snapshot_data.filename}, function(err, queue){
			var snapshot = new db.snapshot(snapshot_data);
			if(!queue){	//if there is no queue yet, create new one.
				queue = new db.queue({
					filename: snapshot_data.filename
					, project_path: "/" + snapshot_data.filename.split("/",2)[1]
					, front: 0
					, rear: 0
					, count: 0
				});
			}
			/* circular queue push algorithm */
			snapshot.index = queue.rear;
			queue.rear = ++queue.rear % queue_max;
			if(queue.count==queue_max-1){
				db.snapshot.remove({filename:snapshot_data.filename, index:queue.front}, function(err){});	// delete old one
				queue.front = ++queue.front % queue_max;
			}else{
				queue.count += 1;
			}
			snapshot.save(function(err, snapshot){ });
			queue.save(function(err, queue){ });
		});
	}
	/* socket end */
	
	, empty_file_history: function(filename){
		if(filename.slice(0,1)!="/") filename = "/" + filename;
		// console.log("history file empty".red, filename);
		db.queue.remove({filename:filename}, function(err){ if(err)console.log("[history] empty_file_history queue remove failure", err); });
		db.snapshot.remove({filename:filename}, function(err){ if(err)console.log("[history] empty_file_history snapshot remove failure", err); });
	}
	
	, empty_project_history: function(project_path){
		if(project_path.slice(0,1)!="/") project_path = "/" + project_path;
		// console.log("history project empty".red, project_path)
		db.queue.remove({project_path:project_path}, function(err){ if(err)console.log("[history] empty_project_history queue remove failure", err); });
		db.snapshot.remove({project_path:project_path}, function(err){ if(err)console.log("[history] empty_project_history snapshot remove failure", err); });
	}
	
	, get_history: function(filename, callback){
		if(filename.slice(0,1)!="/") filename = "/" + filename;
		db.snapshot
		.find({filename:filename})
		.select('filename committer time buffer')
		.sort('time')
		.exec(function(err, snapshots){
			// console.log("history list".red, filename, snapshots);
			callback(snapshots);
		});
	}
};
