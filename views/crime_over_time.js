App.Views.crimeOverTime = Object.create(App.BaseView);

App.Views.crimeOverTime.markers = [];

// function for initializing the map view
App.Views.crimeOverTime.mapInit = function() {
	// the value of this will be different for the callback functions, so use the magic of closures
	var that = this; 

	// for each entry in the crime dataset, create a marker and give its all the necessary functions
	crimeData.forEach(function(crime, index) {
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(crime.latitude, crime.longitude),
			month: crime.shortMonth,
			year: crime.year,
			type: crime.type, 
			address: crime.addr,
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

		// if the marker is clicked, toggle the tooltip
		google.maps.event.addListener(marker, "click", function(e){
			// if the marker is active, toggle the tooltip
			if (!marker.nonActive) {
				// bring the marker to the front so we can see it
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
				
				if (App.map.tooltip.currentMarker != marker) {
					that.utilities.showMapTooltip(marker, function() {
						var content = "";
						content += "<h2>" + marker.type + "</h2>";
						content += "<div><strong>Date:</strong> " + marker.month + ", " + marker.year + "</div>";
						content += "<div><strong>Location:</strong> " + marker.address + "</div>";
						return content;
					});
				} else {
					that.utilities.hideMapTooltip();
				}
			}
		});

		// add the marker to the set of markers
		that.markers.push(marker);
	});


	that.selectedMonths = [];

	// if a month is selected, either toggle its markers
	var sub = events.subscribe('crime/month_selected', function(data) {
		// toggle whether or not the month is selected
		if (that.selectedMonths.indexOf(data.month + data.year) == -1) {
			that.selectedMonths.push(data.month + data.year);
		} else {
			that.selectedMonths.splice( that.selectedMonths.indexOf(data.month + data.year), 1 );
		}

		// for each marker, if in a selected month set it to active
		// else set it to nonActive
		that.markers.forEach(function(marker) {
			if (marker.month == data.month && marker.year == +data.year) {
				marker.setActive();
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
			}
			else{
				//every other icon is set to transparent
				marker.setNonActive();
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 0);

				// if this marker is being hidden, hide the tooltip
				if (App.map.tooltip.currentMarker == marker) {
					that.utilities.hideMapTooltip();
				}
			}
		});

		// if no month is selected, reset all markers to their default state
		if(that.selectedMonths.length == 0)
		{
			that.markers.forEach(function(marker) {
				marker.resetIcons();
			});
		}
	});

	// if a crime is filtered, toggle its visibility 
	events.subscribe('crime/crime_filtered', function(data) {
		that.markers.forEach(function(marker) {
			if (marker.type == data.type) {
				if (data.visible) {
					marker.setMap(App.map);
				} else {
					marker.setMap(null);
				}
			}
		});
	});
};

// show the map
App.Views.crimeOverTime.mapRender = function() {
	this.markers.forEach(function(marker) {
		marker.setMap(App.map);
	});
};

// hide the map
App.Views.crimeOverTime.mapClose = function() {
	this.markers.forEach(function(marker) {
		marker.setMap(null);
	});
};

// initialize the chart
App.Views.crimeOverTime.chartInit = function() {
	var that = this;

	// get all the data set up
	// d3 expects an array so give it an array

	var crimeLineData = [
		{
			type: "Theft from Motor Vehicle",
			points: [] // one point for each month, in order
		},
		{
			type: "Theft of Motor Vehicle",
			points: [] 
		},
		{
			type: "Fatal/Injury Collision",
			points: [] 
		},
		{
			type: "Shoplifting",
			points: [] 
		},
		{
			type: "Break and Enter - Business",
			points: []
		},
		{
			type: "Break and Enter - Residence",
			points: [] 
		},
	];

	// create deep copies of crimeLineData
	var crime2013LineData = JSON.parse( JSON.stringify( crimeLineData ) );
	var crime2014LineData = JSON.parse( JSON.stringify( crimeLineData ) );

	// now that the objects are set up, fill them with data
	populateLineData(crime2013LineData, 2013);
	populateLineData(crime2014LineData, 2014);

	function populateLineData(lineData, year) {
		for(month in crimeSummaryData[year])
		{
			for (crimeType in lineData) {
				lineData[crimeType].points.push( crimeSummaryData[year][month][lineData[crimeType].type] );
			}
		}
	}

	// keep track of whether a crime is visible
	var crimeVisible = { 
		"Break and Enter - Business": true,
		"Break and Enter - Residence": true,
		"Fatal/Injury Collision": true,
		"Shoplifting": true,
		"Theft from Motor Vehicle": true,
		"Theft of Motor Vehicle": true
	};

	var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

	var margin = {top:30, right:30, bottom:50, left:100};

	var height = 200 - margin.top - margin.bottom,
		width = 400 - margin.left - margin.right,
		barWidth = 50,
		barOffset = 5;

	var yScale = d3.scale.linear()
		.domain([30, 0])
		.range([0, height]);

	var xScale = d3.scale.ordinal()
		.domain(d3.range(0, months.length))
		.rangeBands([0, width], 0.2, 0.2);

	var toolTip = d3.select('body').append('div')
		.style({
			position: 'absolute',
			padding: '0 10px',
			background: 'white',
			opacity: 0
		});

	var chart2013 = d3.select('#crime-chart')
		.style('width', "100%")
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr("id", "crime-over-time-2013");

	var chart2014 = d3.select('#crime-chart')
		.append('g')
		.attr("id", "crime-over-time-2014")
		.attr('transform', 'translate('+ 350 +', '+ 0 +')');

	// set up each chart
	setupChart(chart2013, crime2013LineData, 2013);
	setupChart(chart2014, crime2014LineData, 2014);

	// set up the events needed for both charts
	
	// if a checkbox is changed, toggle visiblity of that crime
	d3.selectAll("#legendCheck input[type=checkbox]")
		.on("change", function(){
		    crimeVisible[this.value] = this.checked;
		    updateChart(chart2013, crime2013LineData);
		    updateChart(chart2014, crime2014LineData);
			
			// notify the map that a crime has been filtered
			events.publish('crime/crime_filtered', {
				type: this.value,
				visible: this.checked
			});
		});

	// hide the tooltip when you click its close button
	d3.select("#graphToolTipClose").on("click", hideGraphToolTip);

	// draw the charts and add events
	function setupChart(chart, data, year) {
		chart
			.append('g')
				.attr('transform', 'translate('+ 110 +', '+margin.top+')')
				.selectAll('polyline')
				.data(data)
				.enter()
				.append('polyline')
				.attr({
					fill: "none",
					stroke: function(d) {
						return that.utilities.crimeColors[d.type];
					},
					points: function(d) {
						var points = "";

						// add a point on the polyline for each value in points
						d.points.forEach(function(point, index) {
							points += " " + xScale(index) + "," + yScale(point);
						});

						return points;
					},
					opacity: 1
				});

		// underneath the polylines, draw a bunch of bars
		// these will be used to show when a month is selected
		var monthBars = chart
			.append('g')
				.attr('transform', 'translate('+ 110 +', '+margin.top+')')
				.selectAll('rect')
				.data(months)
				.enter()
				.append('rect')
				.attr({
					class: "month-bar",
					x: function(d, i) {
						return xScale(i) - 4;
					},
					y: 0,
					width: 9,
					height: 120	
				});

		// draw the axes

		var vGuideScale = d3.scale.linear()
			.domain([0, 30])
			.range([height, 0]);

		var vAxis = d3.svg.axis()
			.scale(vGuideScale)
			.orient('left')
			.ticks(10);

		var vGuide = chart.append('g');

		vAxis(vGuide);

		vGuide.attr('transform', 'translate('+margin.left+', '+margin.top+')')
			.append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("x", height/-2)
	        .attr("y", -45)
	        .attr("dy", ".71em")
	        .style("text-anchor", "middle")
	        .style("font-size","16px")
	        .text("Number of Crimes");

		vGuide.selectAll('path')
			.style({fill: 'none', stroke: "#000"});

		vGuide.selectAll('line')
			.style({stroke: '#000'});

		var hAxis = d3.svg.axis()
			.scale(xScale)
			.tickFormat(function(d){
				return months[d];
			})
			.orient('bottom');

		var hGuide = chart.append('g');

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

		hGuide.selectAll('.tick')
			.attr("data-month", function(d, i) {
				return months[i];
			})
		
		// add title to chart
		chart.append('text')
			.text(year)
			.attr('transform', 'translate('+ 220 +', '+margin.top+')')
			.attr('text-anchor', 'middle');

		

		// add events to chart

		// when the mouse moves this chart, we want to highlight the month the mouse is currently over
		chart.on("mousemove", function(d,i) {
			$(this).find("[data-month]").each(function(monthIndex, tick) {
				// check if the mouse is within the bounding rect for this tick
				// if so, move the marker to this tick
				
				if (d3.event.pageX >= tick.getBoundingClientRect().left && d3.event.pageX <= tick.getBoundingClientRect().right) {
					// position the marker over the line for this tick
					d3.select("#month-selection").style( "left", $(tick).find("line").position().left );
					d3.select("#month-selection").style( "display", "block" );

					// show the tooltip for this month
					showGraphToolTip(data, monthIndex, year, $(tick).find("line").position().left, tick.getBoundingClientRect().bottom);

					// break out of the loop - don't need to check any other months
					return false;
				}
			});
		});

		// on click, we want to select this month
		chart.on("click", function() {
			$(this).find("[data-month]").each(function(i, tick) {
				// check if the mouse is within the bounding rect for this tick
				if (d3.event.pageX >= tick.getBoundingClientRect().left && d3.event.pageX <= tick.getBoundingClientRect().right && d3.event.pageY <= tick.getBoundingClientRect().bottom) {
					// select this month
					events.publish('crime/month_selected', {
						month: months[i],
						year: year
					});

					// select the bar for this month
					// and display it if the month is selected
					chart.select(".month-bar:nth-child(" + (i + 1) + ")")
						.classed("month-bar-selected", that.selectedMonths.indexOf(months[i] + year) != -1);

					// break out of the loop - don't need to check any other months
					return false;
				}
			});
		});
	}

	// shows or hides crimes
	function updateChart(chart, data) {
		chart.selectAll("polyline")
		    .data(data)
		    .attr("opacity", function(d, i){
		    	if( crimeVisible[d["type"]] ) {
		        	return 1;
		        } else {
		        	return 0;
		        }
		    });
	}

	//show tool tip on hover
	function showGraphToolTip(d, monthIndex, year, xPos, yPos)
	{
		// provide presets for the location, just in case it isn't provided
		var x = xPos || d3.event.pageX;
		var y = yPos || d3.event.pageY;

		var tooltip = d3.select("#graphToolTip");

		tooltip.select("h2").text(getMonthLongName(monthIndex) + ", " + year);

		// for each data entry in the table, fill it with the appropriate data
		tooltip.selectAll(".tooltip-entry").each(function(data, i) {
			d3.select(this).style("color", that.utilities.crimeColors[d[i]["type"]] );
			d3.select(this).select(".tooltip-type").text( d[i]["type"] );
			d3.select(this).select(".tooltip-data").text( d[i]["points"][monthIndex] );
		});

	    tooltip.style({
	        "display": "block",
	        "left": x + "px",
	        "top": y + "px"
	    })
	}

	//hide tool tip on click 
	function hideGraphToolTip()
	{
		d3.select("#graphToolTip")
    	.style("display", "none")
	}

	//find the month that is being highlighted
	function getMonthLongName(i)
	{
		longMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return longMonths[i];
	}
};


// display the chart
App.Views.crimeOverTime.chartRender = function() {
	d3.select("#crime-chart").style("display", "block");
	d3.select("#legendCheck")
	.style({
        "display": "block"
    })

};

// hide the chart
App.Views.crimeOverTime.chartClose = function() {
	d3.select("#crime-chart").style("display", "none");
	d3.select("#month-selection").style( "display", "none" );
	d3.select("#legendCheck").style({ "display": "none" });
    d3.select("#graphToolTip").style("display", "none")
};