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

var numberToGeocode = 500;

if (process.argv[2]) {
	if (process.argv[2] == "2013") {
		var newFile = "data/crime2013.json";
		convert2013data();
	} else if (process.argv[2] == "2014") {
		var newFile = "data/crime2014.json"; 
		convert2014data();
	}
}

function convert2014data() {
	fs.readFile("data/random_crime2014.csv", "utf8", function(err, data) {
		data = data.split("\n");

		data.forEach(function(line, index, arr) {
			if (line !== "" && index !== 0) {
				var splitLine = line.split(",");

				if (splitLine[1] !== "") {
					addresses.push({
						addr: splitLine[1] + " " + splitLine[2].trim() + ", Surrey, BC",
						type: splitLine[0],
						month: splitLine[3],
						year: splitLine[4]
					});
				} else {
					addresses.push({
						addr: splitLine[2].split(" /").join().trim() + ", Surrey, BC",
						type: splitLine[0],
						month: splitLine[3],
						year: splitLine[4]
					});
				}
			}
		});

		addresses = addresses.slice(0, numberToGeocode)
		console.log(addresses)

		geocoder.geocode(addresses[geoIndex].addr, fetchNextAddress);
	});
}

function convert2013data() {
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

		addresses = addresses.slice(0, numberToGeocode)
		console.log(addresses)

		geocoder.geocode(addresses[geoIndex].addr, fetchNextAddress);
	});
}

function fetchNextAddress(err, res) {
	if (err) {
		console.log(err);
		console.log(geoIndex);
		writeJson(); // write whatever we have
		return;
	}

	if (res.length == 0) {
		console.log("...huh")
		return;
	}

	console.log(res)

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
	var stream = fs.createWriteStream(newFile);
	console.log(JSON.stringify( geocodedAddresses ))
	stream.write(JSON.stringify( geocodedAddresses ));
	stream.end();
}
