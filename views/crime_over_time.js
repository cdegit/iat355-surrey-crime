App.Views.crimeOverTime = Object.create(App.BaseView);

App.Views.crimeOverTime.markers = [];

//global variable to keep what month and crimeIndex is being highlighted
//I could only get the crime type from using mouseover and the month from using mousemove
var months = "January", crimeIndex = 0;

App.Views.crimeOverTime.mapInit = function() {
	var that = this;
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

		google.maps.event.addListener(marker, "click", function(e){
			if (!marker.nonActive) {
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
		that.markers.push(marker);
	});


	that.selectedMonths = [];

	var sub = events.subscribe('crime/month_selected', function(data) {
		// toggle whether or not the street is selected
		if (that.selectedMonths.indexOf(data.month + data.year) == -1) {
			that.selectedMonths.push(data.month + data.year);
		} else {
			that.selectedMonths.splice( that.selectedMonths.indexOf(data.month + data.year), 1 );
		}

		that.markers.forEach(function(marker) {
			if (marker.month == data.month && marker.year == +data.year) {
				marker.setActive();
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
			}
			else{
				//every other icon is set to transparent
				marker.setNonActive();
				marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 0);

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

	//filter booleans
	var crimeVisible = { 
		"Break and Enter - Business": true,
		"Break and Enter - Residence": true,
		"Fatal/Injury Collision": true,
		"Shoplifting": true,
		"Theft from Motor Vehicle": true,
		"Theft of Motor Vehicle": true
	};

	var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

	var margin = {top:30, right:30, bottom:50, left:80};

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

	var chart2014 = d3.select('#crime-chart')
		.style('width', "100%")
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr("id", "crime-over-time-2014");

	var chart2013 = d3.select('#crime-chart')
		.append('g')
		.attr("id", "crime-over-time-2013")
		.attr('transform', 'translate('+ 350 +', '+ 0 +')');

	setupChart(chart2014, crime2014LineData, 2014);
	setupChart(chart2013, crime2013LineData, 2013);

	//checkboxes
	d3.selectAll("#legendCheck input[type=checkbox]")
		.on("change", function(){
		    crimeVisible[this.value] = this.checked;
		    updateChart(chart2014, crime2014LineData);
			updateChart(chart2013, crime2013LineData);

			events.publish('crime/crime_filtered', {
				type: this.value,
				visible: this.checked
			});
		});

	function setupChart(chart, data, year) {
		chart
			.append('g')
				.attr('transform', 'translate('+ 90 +', '+margin.top+')')
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

						d.points.forEach(function(point, index) {
							points += " " + xScale(index) + "," + yScale(point);
						});

						return points;
					},
					opacity: 1
				});

		var vGuideScale = d3.scale.linear()
			.domain([0, 30])
			.range([height, 0]);

		var vAxis = d3.svg.axis()
			.scale(vGuideScale)
			.orient('left')
			.ticks(10);

		var vGuide = chart.append('g');

		vAxis(vGuide);

		vGuide.attr('transform', 'translate('+margin.left+', '+margin.top+')');

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
		chart.on("mousemove", function(d,i) {
			$(this).find("[data-month]").each(function(i, tick) {
				// check if the mouse is within the bounding rect for this tick
				// if so, move the marker to this tick
				findMonthAndCrimeAmount(i);
				

				if (d3.event.pageX >= tick.getBoundingClientRect().left && d3.event.pageX <= tick.getBoundingClientRect().right) {
					// position the marker over the line for this tick
					d3.select("#month-selection").style( "left", $(tick).find("line").position().left );
					d3.select("#month-selection").style( "display", "block" );

					showGraphToolTip(data, year, $(tick).find("line").position().left, tick.getBoundingClientRect().bottom);

					return false;
				}
			});
		});

		d3.select("#chart").on("click", function() {
			hideGraphToolTip();
			// for whatever reason have to listen on this element
			// listening on anything lower down just doesn't work
			// event doesn't seem to bubble up? 

			$(this).find("[data-month]").each(function(i, tick) {
				// check if the mouse is within the bounding rect for this tick
				if (d3.event.pageX >= tick.getBoundingClientRect().left && d3.event.pageX <= tick.getBoundingClientRect().right && d3.event.pageY <= tick.getBoundingClientRect().bottom) {
					// select this month
					events.publish('crime/month_selected', {
						month: $(tick).data("month"),
						year: year
					});

					return false;
				}
			});
		});
	}

	function updateChart(chart, data) {
		//filters
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
	function showGraphToolTip(d, year, xPos, yPos)
	{
		var x = xPos || d3.event.pageX;
		var y = yPos || d3.event.pageY;

		var tooltip = d3.select("#graphToolTip");

		tooltip.select("h2").text(month + ", " + year);

		// for each data entry in the table, fill it with the appropriate data
		tooltip.selectAll(".tooltip-entry").each(function(data, i) {
			d3.select(this).select(".tooltip-type").text( d[i]["type"] );
			d3.select(this).select(".tooltip-data").text( d[i]["points"][crimeIndex] );
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
	function findMonthAndCrimeAmount(i)
	{
		longMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		month = longMonths[i];
		crimeIndex = i;
	}
};


App.Views.crimeOverTime.chartRender = function() {
	d3.select("#crime-chart").style("display", "block");
	d3.select("#legendCheck")
	.style({
        "display": "block"
    })

};

App.Views.crimeOverTime.chartClose = function() {
	d3.select("#crime-chart").style("display", "none");
	d3.select("#month-selection").style( "display", "none" );
	d3.select("#legendCheck").style({ "display": "none" });
    d3.select("#graphToolTip").style("display", "none")
};