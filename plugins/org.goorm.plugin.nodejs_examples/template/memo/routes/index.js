
/*
 * GET home page.
 */
 
var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/rst_memo');
var Schema = mongoose.Schema;

var Memo = new Schema({
	author: String,
	contents: String,
	date: Date
});

var memoModel = mongoose.model('Memo', Memo);

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.load = function(req, res) {
	memoModel.find({}, function(err, data) {
		res.json(data);
	});
};

exports.write = function(req, res) {
	var author = req.body.author;
	var contents = req.body.contents;
	var date = Date.now();
	
	var memo = new memoModel();
	
	memo.author = author;
	memo.contents = contents;
	memo.date = date;
	memo.comments = [];
	
	memo.save(function (err) {
		if (err) {
			throw err;
		}
		else {
			res.json({status: "SUCCESS"});
		}
	});
};

exports.del = function(req, res) {
	var _id = req.body._id;
	
	memoModel.remove({_id: _id}, function(err, result) {
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
	
	
	memoModel.findOne({_id: _id}, function(err, memo) {
		if (err) {
			throw err;
		}
		else {
			memo.contents = contents;
			
			memo.save(function (err) {
				if (err) {
					throw err;
				}
				else {
					res.json({status: "SUCCESS"});
				}
			});
		}
	});
};