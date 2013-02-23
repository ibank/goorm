
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Bingo!' });
};

exports.main = function(req, res){
	res.render('main', { title: 'Bingo!', username: req.query.username });
}