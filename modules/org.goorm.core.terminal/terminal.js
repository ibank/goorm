var pty = require('../../libs/pty/pty.js');


module.exports = {
	start: function (io) {
		var self = this;
		
		io.set('log level', 0);
		io.sockets.on('connection', function (socket) {
			var term = [];
			
			socket.on('terminal_join', function (msg) {
				msg = JSON.parse(msg);
				
				socket.join(msg.workspace + '/' + msg.terminal_name);
				
				console.log("Joined: " + msg.workspace + '/' + msg.terminal_name);
				
				term.push(pty.spawn('bash', [], {
					name: 'xterm-color',
					cols: 80,
					rows: 30,
					cwd: process.env.HOME,
					env: process.env
				}));
				
				term[term.length-1].on('data', function (data) {
					var result = {};
					result.stdout = data;
					result.terminal_name = msg.terminal_name;
					//evt.emit("executed_command", result);
					//console.log(data);
//					console.log("on data : " + msg.workspace + '/' + msg.terminal_name);
					socket.emit("pty_command_result", result);
					//io.sockets.in(msg.workspace + '/' + msg.terminal_name).emit("pty_command_result", result);
				});
				
				console.log("Terminal Count: " + term.length);
				
				var data = {
					index: term.length - 1,
					timestamp: msg.timestamp
				};
				
				socket.to().emit("terminal_index", JSON.stringify(data));
			});
			
			socket.on('terminal_leave', function (msg) {
				msg = JSON.parse(msg);
				
				socket.leave(msg.workspace + '/' + msg.terminal_name);
			});

			socket.on('pty_execute_command', function (msg) {
				console.log("#execute command");
				console.log(msg);
				msg = JSON.parse(msg);
				
				self.exec(term[msg.index], msg.command);
			});
			
			socket.on('change_project_dir', function (msg) {
				console.log(msg);
				msg = JSON.parse(msg);
				
				term[msg.index].write("cd " + global.__path + "workspace/" + msg.project_path  + "\r");
				socket.to().emit("on_change_project_dir", msg);
			});
			

			
			
		});
	},
	
	exec: function (term, command) {
		if (term != undefined && term != null) {
			if (command.indexOf('\t') > -1) { //TAB
				term.write(command);
			}
			else {
				term.write(command + ' \r');
			}
		}
		else {
			console.log("terminal object is empty...");
		}
	}
};
