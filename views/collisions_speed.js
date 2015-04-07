App.Views.collisionsAndSpeed = Object.create(App.BaseView);

App.Views.collisionsAndSpeed.markers = [];

App.Views.collisionsAndSpeed.mapInit = function() {
	var that = this;
	crimeData.forEach(function(crime, index) {
		// Only display markers for collisions for this map
		if (crime.type == "Fatal/Injury Collision") {
			var tempMarker = new google.maps.Marker({
				position: new google.maps.LatLng(crime.latitude, crime.longitude),
				streetName: crime.addr,
				icon: that.utilities.getMarkerIcon( that.utilities.crimeColors[crime.type] )
			});

			tempMarker.setActive = function() {
				if (!tempMarker.active) {
					tempMarker.active = true;
					tempMarker.setIcon(that.utilities.getSelectedMarkerIcon( that.utilities.crimeColors[crime.type] ))
				} else {
					tempMarker.setIcon(that.utilities.getMarkerIcon( that.utilities.crimeColors[crime.type] ))
					tempMarker.active = false;
				}					
			};

			google.maps.event.addListener(tempMarker, "click", function(e){
				tempMarker.setActive();
				tempMarker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
			});
			that.markers.push(tempMarker);
		}
	});

	var sub = events.subscribe('collisions/street_selected', function(data) {
		that.markers.forEach(function(marker) {
			// had th's and nd's, which the street data doesn't have :(
			if (that.stripNumberSuffix(marker.streetName).indexOf(data.street) != -1) {
				marker.setActive();
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
			}
		});
	});
};

App.Views.collisionsAndSpeed.stripNumberSuffix = function(streetName) {
	var newStreetNumber = "";

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
					toolTip.transition()
						.style('opacity', 0.9);

					toolTip.html(d.streetName)
						.style('left', (d3.event.pageX - 35) + 'px')
						.style('top', (d3.event.pageY - 35) + 'px');

					tempColor = this.style.fill;
					d3.select(this)
						.style('opacity', 0.5)
						.style('fill', 'yellow');
				})
				.on('mouseout', function(d){
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