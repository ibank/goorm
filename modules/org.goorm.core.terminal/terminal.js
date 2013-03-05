/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var pty = require('../../libs/pty/pty.js');

var os = require('os');
var platform = null;
if(/darwin/.test(os.platform())) {
	platform = "darwin";
}
else if(/linux/.test(os.platform())) {
	platform = "linux";
}
else {
}

module.exports = {
	start: function (io) {
		var self = this;
		
		io.set('log level', 0);
		io.sockets.on('connection', function (socket) {
			var term = [];
			
			socket.on('terminal_join', function (msg) {
				msg = JSON.parse(msg);
			
				socket.join(msg.workspace + '/' + msg.terminal_name);
				
				term.push(pty.spawn('bash', [], {
					name: 'xterm-color',
					cols: parseInt(msg.cols),
					rows: 30,
					cwd: process.env.HOME,
					env: process.env
				}));
				
				var toHex = function (str) {
				    var hex = '';
				    for(var i=0;i<str.length;i++) {
				        hex += ' 0x'+str.charCodeAt(i).toString(16);
				    }
				    return hex;
				}
				
				term[term.length-1].on('data', function (data) {
					var result = {};
					result.stdout = data;
					result.terminal_name = msg.terminal_name;
					
//					console.log("on data : " + msg.workspace + '/' + msg.terminal_name);
					// console.log("data: " + data);
					// console.log("hex: " + toHex(data));
					
					//console.log(result.stdout);
					
					socket.emit("pty_command_result", result);
//					io.sockets.in(msg.workspace + '/' + msg.terminal_name).emit("pty_command_result", result);
				});

				var data = {
					index: term.length - 1,
					timestamp: msg.timestamp
				};
				
				socket.to().emit("terminal_index", JSON.stringify(data));
				socket.to().emit("platform", JSON.stringify({"platform":platform}));
			});
			
			socket.on('terminal_resize', function (msg) {
				msg = JSON.parse(msg);

				if (term[msg.index] != undefined) {
					term[msg.index].resize(parseInt(msg.cols), 30);
				}
			});
			
			socket.on('terminal_leave', function (msg) {
				msg = JSON.parse(msg);
				
				socket.leave(msg.workspace + '/' + msg.terminal_name);
				
				if (term[msg.index] != undefined) {
					term[msg.index].destroy();
					term[msg.index].kill('SIGTERM');
				}
			});

			socket.on('pty_execute_command', function (msg) {
				msg = JSON.parse(msg);
				self.exec(term[msg.index], msg.command, msg.special_key);
			});
			
			socket.on('change_project_dir', function (msg) {
				msg = JSON.parse(msg);
				
				if (term[msg.index] != undefined) {
					term[msg.index].write("cd " + __workspace + msg.project_path  + "\r");
					socket.to().emit("on_change_project_dir", msg);
				}
			});
			
		});
	},
	
	exec: function (term, command, special_key) {
		if (term != undefined && term != null) {
			if (special_key) { //Special Key
				term.write(command);
			}
			else {
				term.write(command);
			}
		}
		else {
			console.log("terminal object is empty...");
		}
	}
};
