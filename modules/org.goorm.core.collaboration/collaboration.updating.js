
// For collaboration event or log
// 

var event_emitter = require('events').EventEmitter;

module.exports = {
	last_update : {},
	
	init : function(workspace){
		if(workspace && !this.last_update[workspace])
			this.last_update[workspace] = [];
	},
	
	push : function(workspace, msg) {
		var self = this;
		
		if(this.last_update[workspace]){
			var evt = new event_emitter();
						
			evt.on('push_logs', function(evt, i){
				if(self.last_update[workspace][i]){
					if(self.last_update[workspace][i].user == msg.user){
						self.last_update[workspace][i].logs.push(msg);
					}
					else{
						evt.emit('push_logs', evt, ++i);
					}
				}
				else{
					self.last_update[workspace].push({'user':msg.user, 'logs':[]});
					self.last_update[workspace][0].logs.push(msg);
				}
			});
			evt.emit('push_logs', evt, 0);
		}
		else{
			this.last_update[workspace] = [];
			this.last_update[workspace].push({'user':msg.user, 'logs':[]});
			this.last_update[workspace][0].logs.push(msg);
		}
	},
	
	get_list : function(workspace, callback){
		var self = this;
		var evt = new event_emitter();
		var data = [];

		function get(workspace, i){
			if(self.last_update[workspace] && self.last_update[workspace][i]){
				var length = self.last_update[workspace][i].logs.length;
				return self.last_update[workspace][i].logs[length-1];
			}
			else
				return null;
		};
		
		evt.on('get_logs', function(evt, i){
			if(self.last_update[workspace] && self.last_update[workspace][i]){
				var target = self.last_update[workspace][i].user;
				data.push(get(workspace, i));
				evt.emit('get_logs', evt, ++i);
			}
			else{
				callback(data);
			}
		});
		evt.emit('get_logs', evt, 0);
	}
}