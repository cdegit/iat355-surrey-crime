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

fs.readFile("data/crime2013.csv", "utf8", function(err, data) {
	data = data.split("\n");

	data.forEach(function(line, index, arr) {
		if (line !== "" && index !== 0) {
			var splitLine = line.split(",");
			addresses.push(splitLine[1] + ", Surrey, BC");
		}
	});

	addresses = addresses.slice(0, 100)
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
	var stream = fs.createWriteStream("data/crime2013.kml");
	stream.write('<?xml version="1.0" encoding="UTF-8"?>');
	stream.write('<kml xmlns="http://www.opengis.net/kml/2.2">');
	stream.write('<Document>');

	writeIcons(stream);

	geocodedAddresses.forEach(function(address, index, arr) {
		stream.write('<Placemark>\n');
		stream.write('<styleUrl>#type_breakAndEnter</styleUrl>');
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

function writeIcons(stream) {
	stream.write('<Style id="type_breakAndEnter">');
	stream.write('<IconStyle><Icon>');
	stream.write('<href>' + 'https://raw.githubusercontent.com/cdegit/iat355-surrey-crime/master/assets/marker_blue.png?token=ACubUqY_cHn_3ml9qPvIa5ozxVw4NTbEks5VI1nZwA%3D%3D' + '</href>');
	stream.write('</Icon></IconStyle></Style>\n');
}