App.Views.collisionsAndSpeed = Object.create(App.BaseView);

App.Views.collisionsAndSpeed.markers = [];

App.Views.collisionsAndSpeed.mapInit = function() {
	var that = this;
	crimeData.forEach(function(crime, index) {
		// Only display markers for collisions for this map
		if (crime.type == "Fatal/Injury Collision") {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(crime.latitude, crime.longitude),
				streetName: crime.addr,
				type: crime.type,
				icon: that.utilities.getMarkerIcon( that.utilities.crimeColors[crime.type] )
			});

			marker.setActive = function() {
				if (!marker.active) {
					marker.active = true;
					marker.setIcon(that.utilities.getSelectedMarkerIcon( that.utilities.crimeColors[crime.type] ))
				} else {
					marker.setIcon(that.utilities.getNonSelectedMarkerIcon( that.utilities.crimeColors[crime.type] ))
					marker.active = false;
				}					
			};

			//sets every other icon to be transparent
			marker.setNonActive = function() {
				if (!marker.active) {
					marker.nonActive = true;
					marker.setIcon(that.utilities.getNonSelectedMarkerIcon( that.utilities.crimeColors[crime.type] ))
				} 
			};

			//resets all the icons to their default state
			marker.resetIcons = function() {
				marker.nonActive = false;
				marker.setIcon(that.utilities.getMarkerIcon( that.utilities.crimeColors[crime.type] ))
			};

			google.maps.event.addListener(marker, "click", function(e){
				if (!marker.nonActive) {
					marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);

					if (App.map.tooltip.currentMarker != marker) {
						that.utilities.showMapTooltip(marker, function() {
							var content = "";
							content += "<h2>" + marker.type + "</h2>";
							return content;
						});
					} else {
						that.utilities.hideMapTooltip();
					}
				}
			});
			that.markers.push(marker);
		}
	});


	that.selectedStreets = [];

	var sub = events.subscribe('collisions/street_selected', function(data) {
		// toggle whether or not the street is selected
		if (that.selectedStreets.indexOf(data.street) == -1) {
			that.selectedStreets.push(data.street);
		} else {
			that.selectedStreets.splice( that.selectedStreets.indexOf(data.street), 1 );
		}

		that.markers.forEach(function(marker) {
			// had th's and nd's, which the street data doesn't have :(
			if (that.stripNumberSuffix(marker.streetName).indexOf(data.street) != -1) {
				marker.setActive();
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
			}
			else{
				//every other marker is set to transparent
				marker.setNonActive();
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 0);

				if (App.map.tooltip.currentMarker == marker) {
					that.utilities.hideMapTooltip();
				}
			}
		});

		// if no streets are selected, reset all markers to their default state
		if(that.selectedStreets.length == 0)
		{
			that.markers.forEach(function(marker) {
				marker.resetIcons();
			});
		}
	});
};

App.Views.collisionsAndSpeed.stripNumberSuffix = function(streetName) {
	var newStreetNumber = streetName;

	if (streetName.indexOf("TH") != -1) {
		newStreetNumber = streetName.slice(0, streetName.indexOf("TH")) + streetName.slice(streetName.indexOf("TH") + 2, streetName.length);
	}

	if (streetName.indexOf("ND") != -1) {
		newStreetNumber = streetName.slice(0, streetName.indexOf("ND")) + streetName.slice(streetName.indexOf("ND") + 2, streetName.length);
	}

	return newStreetNumber;
}

App.Views.collisionsAndSpeed.mapRender = function() {
	this.markers.forEach(function(marker) {
		marker.setMap(App.map);
	});
};

App.Views.collisionsAndSpeed.mapClose = function() {
	this.markers.forEach(function(marker) {
		marker.setMap(null);
	});
};

App.Views.collisionsAndSpeed.chartInit = function() {
	var that = this;
	var barData = [];

	for (street in streetsAndCollisionsData) {
		if(streetsAndCollisionsData[street].count > 5)
		barData.push( streetsAndCollisionsData[street] );
	}


	var margin = {top:30, right:30, bottom:120, left:80}

	var height = 400 - margin.top - margin.bottom,
		width = 600 - margin.left - margin.right,
		barWidth = 50,
		barOffset = 5;

	var tempColor;

	var yScale = d3.scale.linear()
				.domain([0, 40])
				.range([0, height]);

	var xScale = d3.scale.ordinal()
				.domain(d3.range(0, barData.length))
				.rangeBands([0, width], 0.2, 0.2);

	var toolTip = d3.select('body').append('div')
		.style({
			position: 'absolute',
			padding: '0 10px',
			background: 'white',
			opacity: 0
		});

	var myChart = d3.select('#collision-and-speed-chart')
		.style('width', "100%")
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate('+margin.left+', '+margin.top+')')
			.selectAll('rect').data(barData).enter()
			.append('rect')
				.style('fill', that.utilities.crimeColors["Fatal/Injury Collision"])
				.attr({
					width: xScale.rangeBand(),
					height: 0,
					x: function(d,i){
						return xScale(i);
					},
					y: height
				})
				.on('mouseover', function(d, i){
					/*events.publish('collisions/street_selected', { 
						street: d.streetName
					});*/

					toolTip.transition()
						.style('opacity', 0.9);

					toolTip.html("Collisions: "+d.count+" / Road Speed: "+d.speed)
						.style('left', (d3.event.pageX - 35) + 'px')
						.style('top', (d3.event.pageY - 35) + 'px');

					tempColor = this.style.fill;
					d3.select(this)
						.style('opacity', 0.5)
						.style('fill', 'yellow');
				})
				.on('mouseout', function(d){
					/*events.publish('collisions/street_selected', { 
						street: d.streetName
					});*/

					d3.select(this)
						.style('opacity', 1)
						.style('fill', tempColor);

					toolTip.transition()
						.style('opacity', 0);

					toolTip.html(d)
						.style('left', '-10px')
						.style('top', '-10px');
				})
				.on('click', function(d, i) {
					events.publish('collisions/street_selected', { 
						street: d.streetName
					});
				});

	myChart.transition()
		.attr({
			height: function(d){
				return yScale(d.count);
			},
			y: function(d){
				return height - yScale(d.count);
			}
		})
		.delay(function(d, i){
			return i * 20;
		})
		.duration(1000)
		.ease('elastic');

	var vGuideScale = d3.scale.linear()
		.domain([0, 40])
		.range([height, 0]);

	var vAxis = d3.svg.axis()
		.scale(vGuideScale)
		.orient('left')
		.ticks(10);

	var vGuide = d3.select('#collision-and-speed-chart')
		.append('g');

	vAxis(vGuide);

	vGuide.attr('transform', 'translate('+margin.left+', '+margin.top+')');

	vGuide.selectAll('path')
		.style({fill: 'none', stroke: "#000"});

	vGuide.selectAll('line')
		.style({stroke: '#000'});

	var hAxis = d3.svg.axis()
		.scale(xScale)
		.tickFormat(function(d){
			return barData[d].streetName;
		})
		.orient('bottom');

	var hGuide = d3.select('#collision-and-speed-chart').append('g');

	hAxis(hGuide);
	hGuide.attr('transform', 'translate('+margin.left+', '+(height+margin.top)+')');

	hGuide.selectAll('path')
		.style({
			fill: 'none', 
			stroke: "#000"
		});

	hGuide.selectAll('line')
		.style({stroke: '#000'});

	hGuide.selectAll('text')
		.style("text-anchor", "end")
		.attr({
			dx: "-.8em",
			dy: ".15em",
			transform: function(d) {
            	return "rotate(-65)" 
            }
		});								
	
};

App.Views.collisionsAndSpeed.chartRender = function() {
	d3.select("#collision-and-speed-chart").style("display", "block");
};

App.Views.collisionsAndSpeed.chartClose = function() {
	d3.select("#collision-and-speed-chart").style("display", "none");
};