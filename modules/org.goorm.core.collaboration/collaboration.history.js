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

/**
* 	Database Schema Description
*/
var snapshot_fields = {
    filename: {type:String, index:true}
    , index: Number
    , buffer: Array
    , time: {type:String, index:true}
    , committer: Array
    , delay: Number
}
var queue_fields = {
	filename: {type:String, index:true}
	, project_path: {type:String, index:true}
	, front: Number
	, rear: Number
	, count: Number
}
var info_fields = {
	version: Number
}
var snapshot_schema = new Schema(snapshot_fields);
var queue_schema = new Schema(queue_fields);
var info_schema = new Schema(info_fields);
var db = {
	snapshot : mongoose.model('history_snapshot', snapshot_schema)
	, queue : mongoose.model('history_queue', queue_schema)
	, info : mongoose.model('history_info', info_schema)
}

var QUEUE_MAX = 30;		// synch with client
var files = {};			//array of {users, committer, timer}. users are array of userid.

/**
*	Database Helper (DB Version Management)
*/
var db_version = 6;

db.info.findOne({}, function (err, old_info) {
	if (old_info != null && old_info.version != db_version) {
		// on upgrade : phase 1 - clean up
		db.info.remove({}, function (err) { if (err) console.log("history db version clean up(info) failed : ", err); });
		db.snapshot.remove({}, function (err) { if (err) console.log("history db version clean up(snapshot) failed : ", err); });
		db.queue.remove({}, function (err) { if (err) console.log("history db version clean up(queue) failed : ", err); });
	}
	if (old_info == null || old_info.version != db_version) {
		// on create / on upgrade : phase 2 - create information
		var new_info = new db.info({version: db_version});
		new_info.save(function (err) {
			if (err) console.log("history db version create failed : ", err);
		});
		console.log("history db updated".yellow);
	}
});

/**
*	Main
*/
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
		if (msg.filename.slice(0,1)!="/") msg.filename = "/" + msg.filename;
		// socket.get("filename", function(err, name){
			// console.log("leave".red, msg.filename);
		// });
		socket.leave("."+msg.filename);
		if (!files[msg.filename]) return;
		if (files[msg.filename].users.length == 1){
			// you are the last people
			delete files[msg.filename];	 // destroy all
		}else{
			// another people is editing
			var index = -1;
			index = files[msg.filename].users.inArray(msg.userid);
			if (index > -1) files[msg.filename].users.remove(index);	// just leave
		}
	}
	, msg: function(socket, msg) {
		if (msg.filepath.slice(0,1) != "/") msg.filepath = "/" + msg.filepath;
		if (msg.action!="change" || !files[msg.filepath]) return;
		var self = this;
		
		if (files[msg.filepath].timer!=null) clearTimeout(files[msg.filepath].timer); // when continuing typing
		files[msg.filepath].buffer.push(msg.message);	// save event
		if (files[msg.filepath].committer.inArray(msg.user) < 0) {
			files[msg.filepath].committer.push(msg.user);
		}
		
		files[msg.filepath].timer = setTimeout(function(){	// when you stop a typing,
			if (files[msg.filepath]) {
				var date = new Date();
				var formatted = date.getFullYear() + "-" + ("0"+date.getMonth()).slice(-2) + "-" + ("0"+date.getDate()).slice(-2)
			 				+ " " + ("0"+date.getHours()).slice(-2) + ":" + ("0"+date.getMinutes()).slice(-2) + ":" + ("0"+date.getSeconds()).slice(-2)
			 				+ " " + ("000"+date.getMilliseconds()).slice(-3);
				var snapshot = {
					filename: msg.filepath
					, committer: files[msg.filepath].committer
					, buffer: files[msg.filepath].buffer
					, time: formatted
					, index: 0
					, delay: 0
				}
				self.add_snapshot(snapshot, function (err) {
					if (!err) {
						socket.broadcast.to("."+snapshot.filename).emit("history_message", JSON.stringify({action: 'snapshot', snapshot: snapshot}));
						socket.emit("history_message", JSON.stringify({action: 'snapshot', snapshot: snapshot}));
						files[msg.filepath].buffer = [];
						files[msg.filepath].committer = [];
					} else console.log("history snapshot failed".red);
				});
			}
		}, 1000);
	}
	
	, command_msg: function (socket, msg) {
		if (msg.filepath.slice(0,1) != "/") msg.filepath = "/" + msg.filepath;
		if (!files[msg.filepath]) return;
		var self = this;
		if (msg.action == 'set_delay') {
			/**
			*	set_delay
			*/
			db.snapshot.update({filename: msg.filepath, index: msg.index}, {$set: {delay: msg.delay}}, function (err) {
				if (!err) {
					var history_message = {
						action: 'set_delay',
						filename: msg.filepath, 
						index: msg.index, 
						delay: msg.delay
					}
					socket.broadcast.to("."+msg.filepath).emit("history_message", JSON.stringify(history_message));
					socket.emit("history_message", JSON.stringify(history_message));
				} else console.log("history set_delay failed.".red);
			});
		} else if (msg.action == 'merge') {
			/**
			*	merge
			*/
			if (msg.filepath.slice(0,1) != "/") msg.filepath = "/" + msg.filepath;
			db.snapshot
			.find({filename: msg.filepath})
			.select('filename index committer time buffer delay')
			.sort('time')
			.exec(function(err, snapshots){
				if (!err) {
					var buffer = null;
					var committer = null;
					for (var i=snapshots.length-1; i >= 0; i--) {
						var snapshot = snapshots[i];
						if (snapshot.index == msg.index) {
							// delete target
							buffer = snapshot.buffer;
							committer = snapshot.committer;
							snapshot.remove();
						} else if (snapshot.index == (msg.index - 1 + QUEUE_MAX) % QUEUE_MAX) {
							// merge target
							committer.forEach(function (person) {
								if (snapshot.committer.inArray(person) < 0) snapshot.committer.push(person);
							});
							snapshot.buffer = snapshot.buffer.concat(buffer);
							//snapshot.index = (snapshot.index - 1 + QUEUE_MAX) % QUEUE_MAX;
							snapshot.save();
							break;
						} else {
							snapshot.index = (snapshot.index - 1 + QUEUE_MAX) % QUEUE_MAX;
							snapshot.save();
						}
					}
					db.queue.findOne({filename: msg.filepath}, function(err, queue) {
						if (!err) {
							queue.count--;
							queue.rear = (queue.rear - 1 + QUEUE_MAX) % QUEUE_MAX;
							queue.save();
						} else console.log("history merge failed.".red);
					});
					var history_message = {
						action: 'merge',
						filename: msg.filepath
					}
					socket.broadcast.to("."+msg.filepath).emit("history_message", JSON.stringify(history_message));
					socket.emit("history_message", JSON.stringify(history_message));
				} else console.log("history merge failed.".red);
			});
			
			
		}
	}
	
	, add_snapshot: function (snapshot_data, callback) {
		if (snapshot_data.filename.slice(0,1) != "/") snapshot_data.filename = "/" + snapshot_data.filename;
		db.queue.findOne({filename: snapshot_data.filename}, function(err, queue) {
			if (err) { callback(err); return; }
			if (!queue) {	//if there is no queue yet, create new one.
				queue = new db.queue({
					filename: snapshot_data.filename
					, project_path: "/" + snapshot_data.filename.split("/",2)[1]
					, front: 0
					, rear: 0
					, count: 0
				});
			}
			/* circular queue push algorithm */
			snapshot_data.index = queue.rear;
			var snapshot = new db.snapshot(snapshot_data);
			//console.log("snapshot added to index ", snapshot.index);
			queue.rear = ++queue.rear % QUEUE_MAX;
			if (queue.count == QUEUE_MAX-1) {
				db.snapshot.remove({filename:snapshot_data.filename, index:queue.front}, function(err){});	// delete old one
				queue.front = ++queue.front % QUEUE_MAX;
			} else {
				queue.count += 1;
			}
			snapshot.save(function(err, snapshot){
				if (!err) {
					queue.save(function(err, queue){ callback(err); });
				} else callback(err);
			});
		});
	}
	/* socket end */
	
	, empty_file_history: function(filename){
		if(filename.slice(0,1)!="/") filename = "/" + filename;
		// console.log("history file empty".red, filename);
		db.queue.remove({filename:filename}, function(err){ if(err)console.log("[history] empty_file_history queue remove failure".red, err); });
		db.snapshot.remove({filename:filename}, function(err){ if(err)console.log("[history] empty_file_history snapshot remove failure".red, err); });
	}
	
	, empty_project_history: function(project_path){
		if(project_path.slice(0,1)!="/") project_path = "/" + project_path;
		// console.log("history project empty".red, project_path)
		db.queue.remove({project_path:project_path}, function(err){ if(err)console.log("[history] empty_project_history queue remove failure".red, err); });
		db.snapshot.remove({project_path:project_path}, function(err){ if(err)console.log("[history] empty_project_history snapshot remove failure".red, err); });
	}
	
	, get_history: function(filename, callback){
		if (filename.slice(0,1)!="/") filename = "/" + filename;
		db.snapshot
		.find({filename:filename})
		.select('filename index committer time buffer delay')
		.sort('time')
		.exec(function(err, snapshots){
			// console.log("history list".red, filename, snapshots);
			callback(snapshots);
		});
	}
};
