var fs = require('fs');

var geocoderProvider = 'google';
var httpAdapter = 'https';
var extra = {
	apiKey: 'AIzaSyBI3VQ72nzHoQ19CPwRLyISwkO7zMsYrKo'
};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

var addresses = [];
var geocodedAddresses = [];

var geoIndex = 0;

// fs.readFile("crime2014.csv", "utf8", function(err, data) {
// 	data = data.split("\n");

// 	data.forEach(function(line, index, arr) {
// 		if (line !== "" && index !== 0) {
// 			var splitLine = line.split(",");

// 			if (splitLine[1] !== "") {
// 				addresses.push( splitLine[1] + " " + splitLine[2].trim() + ", Surrey, BC");
// 			} else {
// 				// ugh
// 				addresses.push(splitLine[2].split(" /").join().trim() + ", Surrey, BC");
// 			}
// 		}
// 	});

// 	addresses = addresses.slice(0, 50)
// 	console.log(addresses)

// 	geocoder.geocode(addresses[geoIndex], fetchNextAddress);
// });

fs.readFile("data/random_crime2013.csv", "utf8", function(err, data) {
	data = data.split("\n");

	data.forEach(function(line, index, arr) {
		if (line !== "" && index !== 0) {
			var splitLine = line.split(",");
			addresses.push({
				addr: splitLine[1] + ", Surrey, BC",
				type: splitLine[0],
				month: splitLine[2],
				year: splitLine[3]
			});
		}
	});

	addresses = addresses.slice(0, 200)
	console.log(addresses)

	geocoder.geocode(addresses[geoIndex].addr, fetchNextAddress);
});

function fetchNextAddress(err, res) {
	if (err) {
		console.log(err);
		console.log(geoIndex);
		writeJson(); // write whatever we have
		return;
	}

	// do stuff with the result
	var newAddress = addresses[geoIndex];
	newAddress.longitude = res[0].longitude.toString();
	newAddress.latitude = res[0].latitude.toString();
	geocodedAddresses.push( newAddress );

	geoIndex++;

	if (geoIndex < addresses.length) {
		geocoder.geocode(addresses[geoIndex].addr, fetchNextAddress);
	} else {
		console.log(geocodedAddresses)
		writeJson();
	}
};

function writeJson() {
	var stream = fs.createWriteStream("data/crime2013.json");
	console.log(JSON.stringify( geocodedAddresses ))
	stream.write(JSON.stringify( geocodedAddresses ));
	stream.end();
}
