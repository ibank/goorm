var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mapreduce_matches');

Schema = mongoose.Schema;

var matchScheme = new Schema({
	scorers: Array,
	hometeam: String,
	awayteam: String
});

mongoose.model('Match', matchScheme); 


var Match = mongoose.model('Match'); 

var map = function () {
	this.scorers.forEach(function (element) {
		emit(element, { count: 1});
	});
};

var reduce = function (key, values) {
	var total = 0;
	for (var i=0; i<values.length; i++) {
		total += values[i].count;
	}
	
	return { goal: total };
};

var command = {
	mapreduce: "matches",
	map: map.toString(),
	reduce: reduce.toString(),
//	sort: {score: 1},
	out: "scorers"
};

mongoose.connection.on('open', function() {
	mongoose.connection.db.executeDbCommand(command, function(err, dbres) {
		mongoose.connection.db.collection('scorers', function(err, collection) {
			collection.find({}).sort({"value":-1}).toArray(function (err, result) {
				if (err) {
					console.log(err);
				}
				else {
					console.log(result);
					
					process.exit(1);
				}
			});
		});
	});
});
