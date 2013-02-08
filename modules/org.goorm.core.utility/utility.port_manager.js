/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

var port_list = [];
var port_init = 10001;
//{ "port": 9999,
//	"process_name": "goorm" }

module.exports = {
	alloc_port: function(portItem){
		// port, process_name
		if(!portItem.process_name) portItem.process_name = "goorm_unknown";
		if(!portItem.port) portItem.port = port_init;
		
		var has_port = false;
		
		// search port is already allocated.
		for(var i =0; i < port_list.length; i++) {
			var port = port_list[i];
			
			if (portItem.port == port.port) {
				has_port = true;
				break;
			}
		}
		
		if(!has_port) {
			port_list.push(portItem);
			return portItem;
		}
		
		var port = this.new_port();
		portItem.port = port;
		port_list.push(portItem);
		return portItem;
	},
	
	new_port: function() {
		// allocate port
		var alloc_flag = true;
		for(var i = port_init; i <= 65535; i++) {
			alloc_flag = true;
			for (var j = 0; j < port_list.length; j++) {
				if(port_list[j].port == i) {
					alloc_flag = false;
					break;
				}
			}
			if(alloc_flag === true) {
				return i;
			}
		}
	},
	
	remove_port: function(req) {
		var port = req.port;
		for (var i = 0; i < port_list.length; i++) {
			if(port_list[i].port == port) {
				port_list.remove(i);
			}
		}

		return 1;
	}
}