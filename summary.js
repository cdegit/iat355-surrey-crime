var fs = require('fs');

var years = {
	"2013": {
		"Jan": {}, 
		"Feb": {}, 
		"Mar": {}, 
		"Apr": {}, 
		"May": {}, 
		"June": {}, 
		"July": {}, 
		"Aug": {}, 
		"Sept": {}, 
		"Oct": {}, 
		"Nov": {}, 
		"Dec": {}
	},
	"2014": {
		"Jan": {}, 
		"Feb": {}, 
		"Mar": {}, 
		"Apr": {}, 
		"May": {}, 
		"June": {}, 
		"July": {}, 
		"Aug": {}, 
		"Sept": {}, 
		"Oct": {}, 
		"Nov": {}, 
		"Dec": {}
	},
};

for (year in years) {
	// create months
	for (month in years[year]) {
		years[year][month] = {
			"Break and Enter - Business": 0,
			"Break and Enter - Residence": 0,
			"Fatal/Injury Collision": 0,
			"Shoplifting": 0,
			"Theft from Motor Vehicle": 0,
			"Theft of Motor Vehicle": 0
		};
	}
}

//console.log(years)

fs.readFile("data/crime.json", "utf8", function(err, data) {
	// have months, within each month have spots for each crime type
	// add to appropriate place



	//console.log(data);
	var d = JSON.parse(data);

	d.forEach(function(crime) {
		//crime.shortMonth = months[+crime.month - 1];
		//console.log( years[crime.year.trim()][crime.shortMonth] )
		years[crime.year.trim()][crime.shortMonth][crime.type]++;
	});

	console.log(years)

	fs.writeFile("data/crime_summary.json", JSON.stringify(years));
});