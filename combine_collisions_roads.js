// first step: read in both files
// just use crime.json for crime, then only dealing with json yay!
// next: in crime.json, look only at collisions
// combine all at same location
// then search through road_centerlines.json for that road

var fs = require('fs');

var streetsAndCollisions = {};

fs.readFile("data/crime.json", "utf8", function(err, data) {
	var crimeData = JSON.parse(data);

	fs.readFile("data/road_centrelines.json", "utf8", function(err, data) {
		var roadData = JSON.parse(data).features;
	
		crimeData.forEach(function(crime, index) {
			if (crime.type == "Fatal/Injury Collision") {
				var splitAddr = crime.addr.split(",");

				if (splitAddr.length == 3) {
					if (splitAddr[0].indexOf("/") == -1) {
						var streetName = stripNumberSuffix(splitAddr[0].split(" ")[1]) + " " + splitAddr[0].split(" ")[2];
						addStreet(streetName);
					} else {
						// one entry for each of these roads
						splitAddr[0].split(" / ").forEach(function(street) {
							formatAndAddStreet(street);
						});
					}
				} else {
					// one entry for each of these roads
					formatAndAddStreet(splitAddr[0]);
					formatAndAddStreet(splitAddr[1]);
				}

			}
		});

		roadData.forEach(function(road, index) {
			if (road.properties["ROAD_NAME"]) {
					// king george blvd doesn't come out correctly, so add it manually
					// only bother with this one because tons of collisions happened here
					if (road.properties["ROAD_NAME"] == "King George Blvd") {
						streetsAndCollisions["KING GEORGE"].speed = road.properties["SPEED"];
					}
				if (streetsAndCollisions[road.properties["ROAD_NAME"].toUpperCase()]) {
					streetsAndCollisions[road.properties["ROAD_NAME"].toUpperCase()].speed = road.properties["SPEED"];
				}
			}
		});

		for (entry in streetsAndCollisions) {
			streetsAndCollisions[entry].streetName = entry;
			
			if (!streetsAndCollisions[entry].speed) {
				delete streetsAndCollisions[entry];
			}
		}

		console.log(streetsAndCollisions)
		fs.writeFile("data/streets_and_collisions.json", JSON.stringify(streetsAndCollisions));
	});
});

function formatAndAddStreet(street) {
	var streetName = stripNumberSuffix(street.split(" ")[0]) + " " + street.split(" ")[1];
	addStreet(streetName);
}

function stripNumberSuffix(streetNumber) {
	if (streetNumber.indexOf("TH") != -1) {
		streetNumber = streetNumber.slice(0, streetNumber.indexOf("TH"));
	}

	if (streetNumber.indexOf("ND") != -1) {
		streetNumber = streetNumber.slice(0, streetNumber.indexOf("ND"));
	}

	return streetNumber;
}

function addStreet(street) {
	if (!streetsAndCollisions[street]) {
		streetsAndCollisions[street] = {};
		streetsAndCollisions[street].count = 0;
	}

	streetsAndCollisions[street].count++;
}
