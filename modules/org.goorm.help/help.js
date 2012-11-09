module.exports = {
	send_to_bug_report: function (query, evt) {
		var postdata = {}
		postdata.board_id='ide_bugreport';
		postdata.subject='server on log';
		postdata.content='';
		//postdata.extra='';
		postdata.notice=false;
		
		var server_info = {};
		server_info.os = os.type()+" "+os.release();
		var ori_cpus = os.cpus();
		var cpus = [];
		for (k in ori_cpus) {
			cpus.push(ori_cpus[k].model+" : "+ori_cpus[k].speed);
		}
		server_info.cpus = cpus;
		server_info.memory = os.totalmem();
		var interfaces = os.networkInterfaces();
		var addresses = [];
		for (k in interfaces) {
		    for (k2 in interfaces[k]) {
		        var address = interfaces[k][k2];
		        if (address.family == 'IPv4' && !address.internal) {
		            addresses.push(address.address);
		        }
		    }
		}
		server_info.ip_address=addresses;
		server_info.start= new Date();
		postdata.content = JSON.stringify(server_info);
		//postdata.extra = JSON.stringify(server_info);
						
		var options = {
			host: 'www.goorm.org',
			port: 80,
			path: '/api/article/write',
			method: 'POST'
		};
	
		var req = http.request(options, function(res) {
			var data = "";
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function() {
				//console.log(data);
			});
			
		});
		
		req.on('error', function(e) {
		});
		//console.log(JSON.stringify(postdata));
		req.write(JSON.stringify(postdata));
		req.end();				
	},
	
	get_readme_markdown: function () {
		var input = require("fs").readFileSync(__path + '/README.md', 'utf8');
		var output = require("markdown").markdown.toHTML(input);
		
		return {html:output}; 
	}
};