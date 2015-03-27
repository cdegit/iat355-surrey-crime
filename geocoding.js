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

fs.readFile("crime2014.csv", "utf8", function(err, data) {
	data = data.split("\n");

	data.forEach(function(line, index, arr) {
		if (line !== "" && index !== 0) {
			var splitLine = line.split(",");

			if (splitLine[1] !== "") {
				addresses.push( splitLine[1] + " " + splitLine[2].trim() + ", Surrey, BC");
			} else {
				// ugh
				addresses.push(splitLine[2].split(" /").join().trim() + ", Surrey, BC");
			}
		}
	});

	addresses = addresses.slice(0, 50)
	console.log(addresses)

	geocoder.geocode(addresses[geoIndex], fetchNextAddress);
});

function fetchNextAddress(err, res) {
	if (err) {
		console.log(err);
		console.log(geoIndex);
		writeKML(); // write whatever we have
		return;
	}

	// do stuff with the result
	geocodedAddresses.push(res[0].longitude.toString() + ", " + res[0].latitude.toString() + ", 0");
	// console.log(res)

	geoIndex++;

	if (geoIndex < addresses.length) {
		geocoder.geocode(addresses[geoIndex], fetchNextAddress);
	} else {
		console.log(geocodedAddresses)
		writeKML();
	}
};


// needs to eventually write KML with this data, AND a new CSV with these coords? maybe??
// in theory don't need that CSV. in theory...

function writeKML() {
	var stream = fs.createWriteStream("crime2014.kml");
	stream.write('<?xml version="1.0" encoding="UTF-8"?>');
	stream.write('<kml xmlns="http://www.opengis.net/kml/2.2">');
	stream.write('<Document>');

	geocodedAddresses.forEach(function(address, index, arr) {
		stream.write('<Placemark>\n');
		stream.write('<name>Hello World</name>\n');
		stream.write('<description>Desc</description>\n');
		stream.write('<Point>\n');
		stream.write('<coordinates>' + address + '</coordinates>\n')
		stream.write('</Point>\n');
		stream.write('</Placemark>\n\n');
	});

	stream.write('</Document>');
	stream.write('</kml>');
	stream.end();
}