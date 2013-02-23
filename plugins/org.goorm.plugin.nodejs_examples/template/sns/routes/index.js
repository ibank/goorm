
/*
 * GET home page.
 */
 
var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/rst_sns');
var Schema = mongoose.Schema;

var Post = new Schema({
	author: String,
	picture: String,
	contents: String,
	date: Date,
	like: Number,
	comments: Array
});

var postModel = mongoose.model('Post', Post);



exports.index = function(req, res){ 
	if (req.session.auth) {
		var name = req.session.auth.google.user.name;
		var picture = req.session.auth.google.user.picture;

		res.render('index', { name: name, picture: picture });
	}
	else {
		res.render('index', { name: "", picture: "" });
	}
};

exports.load = function(req, res) {
	postModel.find({}, function(err, data) {
		res.json(data);
	});
};

exports.write = function(req, res) {
	var author = req.body.author;
	var picture = req.body.picture;
	var contents = req.body.contents;
	var date = Date.now();
	
	var post = new postModel();
	
	post.author = author;
	post.picture = picture;
	post.contents = contents;
	post.date = date;
	post.like = 0;
	post.comments = [];
	
	post.save(function (err) {
		if (err) {
			throw err;
		}
		else {
			res.json({status: "SUCCESS"});
		}
	});
};

exports.like = function(req, res) {
	var _id = req.body._id;
	var contents = req.body.contents;
	
	
	postModel.findOne({_id: _id}, function(err, post) {
		if (err) {
			throw err;
		}
		else {
			post.like++;
			
			post.save(function (err) {
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

exports.unlike = function(req, res) {
	var _id = req.body._id;
	var contents = req.body.contents;
	
	
	postModel.findOne({_id: _id}, function(err, post) {
		if (err) {
			throw err;
		}
		else {
			if (post.like > 0) {
				post.like--;
				
				post.save(function (err) {
					if (err) {
						throw err;
					}
					else {
						res.json({status: "SUCCESS"});
					}
				});
			}
		}
	});
};

exports.del = function(req, res) {
	var _id = req.body._id;
	
	postModel.remove({_id: _id}, function(err, result) {
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
	
	
	postModel.findOne({_id: _id}, function(err, post) {
		if (err) {
			throw err;
		}
		else {
			post.contents = contents;
			
			post.save(function (err) {
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

exports.comment = function(req, res) {
	var _id = req.body._id;
	var author = req.body.author;
	var comment = req.body.comment;
	var date = Date.now();

	postModel.findOne({_id: _id}, function(err, post) {
		if (err) {
			throw err;
		}
		else {
			post.comments.push({author: author, comment: comment, date: date});
			
			post.save(function (err) {
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