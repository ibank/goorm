/**
 * author: sung-tae ryu
 * email: xenoz0718@gmail.com
 * node.js book example, Freelec
 **/

var fs = require('fs');


module.exports = {

	load: function () {
		var data = fs.readFileSync(process.cwd() + "/workspace/untitled.txt");
		
		return data;
	},
	
	save: function (contents) {
		fs.writeFile(process.cwd() + "/workspace/untitled.txt", contents, function (err) {
			if (err) {
				throw err;
			}
		});
	}
};