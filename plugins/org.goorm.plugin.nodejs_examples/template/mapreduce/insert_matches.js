var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mapreduce_matches');

var Schema = mongoose.Schema;

var matchScheme = new Schema({
	scorers: Array,
	hometeam: String,
	awayteam: String
});

var matchModel = mongoose.model('Match', matchScheme); 


var matchData = [
	{scorers: ["Van Persie", "Van Persie", "Ki Sung Yueng"], hometeam: "ManUtd", awayteam: "Swansea"},
	{scorers: ["Park Ji Sung", "Ki Sung Yueng"], hometeam: "QPR", awayteam: "Swansea"},
	{scorers: ["Van Persie", "Wayne Rooney", "Park Ji Sung"], hometeam: "ManUtd", awayteam: "QPR"},
	{scorers: ["Ki Sung Yueng", "Ki Sung Yueng"], hometeam: "Swansea", awayteam: "Chelsea"},
];



for (var i=0; i < matchData.length; i++) {
	var match = new matchModel();
	
	match.scorers = matchData[i].scorers;
	match.hometeam = matchData[i].hometeam;
	match.awayteam = matchData[i].awayteam;
	
	match.save(function (err) {
		if (err) {
			throw err;
		}
	});
}

process.exit(1);