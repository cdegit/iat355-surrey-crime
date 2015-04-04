App.Views.crimeOverTime = Object.create(App.BaseView);

App.Views.crimeOverTime.markers = [];

App.Views.crimeOverTime.mapInit = function() {
	var that = this;
	crimeData.forEach(function(crime, index) {
		var tempMarker = new google.maps.Marker({
			position: new google.maps.LatLng(crime.latitude, crime.longitude),
			month: crime.shortMonth,
			year: crime.year,
			icon: that.utilities.getMarkerIcon( that.crimeColors[crime.type] )
		});

		tempMarker.setActive = function() {
			if (!tempMarker.active) {
				tempMarker.active = true;
				tempMarker.setIcon(that.utilities.getSelectedMarkerIcon( that.crimeColors[crime.type] ))
			} else {
				tempMarker.setIcon(that.utilities.getMarkerIcon( that.crimeColors[crime.type] ))
				tempMarker.active = false;
			}					
		};

		google.maps.event.addListener(tempMarker, "click", function(e){
			tempMarker.setActive();
			tempMarker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
		});
		that.markers.push(tempMarker);
	});

	var sub = events.subscribe('crime/month_selected', function(data) {
		// TODO: if not in month, should deselect
		that.markers.forEach(function(marker) {
			if (marker.month == data.month && marker.year == +data.year) {
				marker.setActive();
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
			}
		});
	});
};

App.Views.crimeOverTime.mapRender = function() {
	this.markers.forEach(function(marker) {
		marker.setMap(App.map);
	});
};

App.Views.crimeOverTime.mapClose = function() {
	this.markers.forEach(function(marker) {
		marker.setMap(null);
	});
};

// brewer colors! http://bl.ocks.org/mbostock/5577023
App.Views.crimeOverTime.crimeColors = {
	"Break and Enter - Business": "rgb(228, 26, 28)",
	"Break and Enter - Residence": "rgb(55, 126, 184)",
	"Fatal/Injury Collision": "rgb(77, 175, 74)",
	"Shoplifting": "rgb(152, 78, 163)",
	"Theft from Motor Vehicle": "rgb(255, 127, 0)",
	"Theft of Motor Vehicle": "rgb(255, 255, 51)"
};



App.Views.crimeOverTime.chartInit = function() {
	var barData = [];

	d3.tsv('data/crime_summary.tsv', function(data){
		for(key in data)
		{
			barData.push(data[key].Crime);
		}

		var margin = {top:30, right:30, bottom:120, left:80}

		var height = 400 - margin.top - margin.bottom,
			width = 600 - margin.left - margin.right,
			barWidth = 50,
			barOffset = 5;

		var tempColor;

		var yScale = d3.scale.linear()
					.domain([0, d3.max(barData)])
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

		var myChart = d3.select('#crime-chart')
			.style('width', "100%")
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate('+margin.left+', '+margin.top+')')
				.selectAll('rect').data(barData).enter()
				.append('rect')
					.style('fill', color)
					.attr({
						width: xScale.rangeBand(),
						height: 0,
						x: function(d,i){
							return xScale(i);
						},
						y: height
					})
					.on('mouseover', function(d){
						toolTip.transition()
							.style('opacity', 0.9);

						toolTip.html(d)
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
						var month = data[i].Month.split(" ")[0];
						var year = "20" + data[i].Month.split("'")[1];

						events.publish('crime/month_selected', { 
							month: month,
							year: year
						});
					});

		myChart.transition()
			.attr({
				height: function(d){
					return yScale(d);
				},
				y: function(d){
					return height - yScale(d);
				}
			})
			.delay(function(d, i){
				return i * 20;
			})
			.duration(1000)
			.ease('elastic');

		var vGuideScale = d3.scale.linear()
			.domain([0, d3.max(barData)])
			.range([height, 0]);

		var vAxis = d3.svg.axis()
			.scale(vGuideScale)
			.orient('left')
			.ticks(10);

		var vGuide = d3.select('svg')
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
				return data[d].Month;
			})
			.orient('bottom');

		var hGuide = d3.select('svg').append('g');

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

	    function color(d,i)
	    {
	    	if(i <= 11)
	    		return "blue";
	    	else
	    		return "red";
	    }								

	});
	
};

App.Views.crimeOverTime.chartRender = function() {
	d3.select("#crime-chart").style("display", "block");
};

App.Views.crimeOverTime.chartClose = function() {
	d3.select("#crime-chart").style("display", "none");
};