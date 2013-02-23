
/*
 * GET home page.
 */
 
var Mongolian = require('mongolian');

var ObjectId = require("mongolian").ObjectId

var server = new Mongolian;

var db = server.db('rst_memo');

var memo = db.collection('memo');


exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.load = function(req, res) {	
	memo.find().toArray(function (err, array) {
	
		for (var i=0; i<array.length; i++) {
			var _id = array[i]._id.toString();
			
			delete array[i]._id.bytes;
			array[i]._id = _id;
		}
	
		res.json(array);
	});
};

exports.write = function(req, res) {
	var author = req.body.author;
	var contents = req.body.contents;
	
	memo.insert({
		author: author,
		contents: contents,
		date: new Date
	});
	
	res.json({status: "SUCCESS"});
};

exports.del = function(req, res) {
	var _id = req.body._id;

	memo.remove({'_id': new ObjectId(_id)}, function(err, result) {
		console.log(result);
		if (err) {
			throw err;
		}
		else {
			res.json({status: "SUCCESS"});
		}
	});
};

exports.modify = function(req, res) {
	var _id = req.body._id;
	var contents = req.body.contents;
	
	memo.update({'_id': new ObjectId(_id)}, {"$set": {"contents": contents}}, function(err, data) {
		if (err) {
			throw err;
		}
		else {
			res.json({status: "SUCCESS"});
		}
	});
};