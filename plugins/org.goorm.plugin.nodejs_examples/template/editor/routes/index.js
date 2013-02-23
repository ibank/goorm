/**
 * author: sung-tae ryu
 * email: xenoz0718@gmail.com
 * node.js book example, Freelec
 **/
 
var file = require('../modules/file')

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};


exports.get_file_contents = function(req, res){
	//var path = req.query.path;
	
	res.send(file.load());
};

exports.put_file_contents = function(req, res){
	var contents = req.body.contents;
	
	res.send(file.save(contents));
};