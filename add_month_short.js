var fs = require('fs');

var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

fs.readFile("data/crime2013.json", "utf8", function(err, data) {
	console.log(data);
	var d = JSON.parse(data);
	d.forEach(function(crime) {
		crime.shortMonth = months[+crime.month];
	});

	fs.writeFile("data/crime2013.json", JSON.stringify(d));
});