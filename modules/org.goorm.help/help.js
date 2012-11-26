var http = require('http');
var querystring = require('querystring');

module.exports = {
	send_to_bug_report: function (query, evt) {
		var return_data = {};
		return_data.err_code = 0;
		return_data.message = "process done";

		var ori_data = {};
		ori_data.board_id='ide_bugreport';
		ori_data.subject=query.title;
		ori_data.content='';
		ori_data.language='ko';
		
		var temp_data = {};
		temp_data.author = query.author;
		temp_data.email = query.email;
		temp_data.version = query.version;
		temp_data.module = query.module;
		
		var contents = "";
		contents += "<b>User : </b>"+query.author+"("+query.email+")<br/>";
		contents += "<b>Version : </b>"+query.version+"<br/>";
		contents += "<b>Module : </b>"+query.module+"<br/>";
		contents += "<b>Explanation : </b>"+query.explanation;
		ori_data.content = contents;
		
		var post_data = querystring.stringify(ori_data);
		
		var post_options = {
			host: 'www.goorm.org',
			port: '80',
			path: '/api/article/write',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': post_data.length
			}
		};
		
		var post_req = http.request(post_options, function(res) {
			res.setEncoding('utf8');
			
			var data = "";
			
			res.on('data', function (chunk) {
				data += chunk;
			});
			
			res.on('end', function() {
				evt.emit("help_send_to_bug_report", return_data);
			});		
		});
		
		post_req.on('error', function(e) {
		});
		
		post_req.write(post_data);
		post_req.end();
	},
	
	get_readme_markdown: function () {
		var input = require("fs").readFileSync(__path + '/README.md', 'utf8');
		var output = require("markdown").markdown.toHTML(input);
		
		return {html:output}; 
	}
};