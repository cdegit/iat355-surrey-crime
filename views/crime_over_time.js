App.Views.crimeOverTime = Object.create(App.BaseView);

App.Views.crimeOverTime.markers = [];

var month;

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
			type: "Break and Enter - Business",
			points: [] // one point for each month, in order
		},
		{
			type: "Break and Enter - Residence",
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
			type: "Theft from Motor Vehicle",
			points: [] 
		},
		{
			type: "Theft of Motor Vehicle",
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
	var bTheftFromCar = true;
	var bTheftOfCar = true;
	var bCollision = true;
	var bShoplifting = true;
	var bBeBusiness = true;
	var bBeResidence = true;

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
	d3.select("[name=theftFromCar]")
	.on("change", function(){
	    bTheftFromCar = this.checked
	    setupChart(chart2014, crime2014LineData, 2014);
		setupChart(chart2013, crime2013LineData, 2013);
	})

	d3.select("[name=theftOfCar]")
	.on("change", function(){
	    bTheftOfCar = this.checked
	    setupChart(chart2014, crime2014LineData, 2014);
		setupChart(chart2013, crime2013LineData, 2013)
	})

	d3.select("[name=collision]")
	.on("change", function(){
	    bCollision = this.checked
	    setupChart(chart2014, crime2014LineData, 2014);
		setupChart(chart2013, crime2013LineData, 2013)
	})

	d3.select("[name=shoplifting]")
	.on("change", function(){
	    bShoplifting = this.checked
	    setupChart(chart2014, crime2014LineData, 2014);
		setupChart(chart2013, crime2013LineData, 2013)
	})

	d3.select("[name=beBusiness]")
	.on("change", function(){
	    bBeBusiness = this.checked
	    setupChart(chart2014, crime2014LineData, 2014);
		setupChart(chart2013, crime2013LineData, 2013)
	})

	d3.select("[name=beResidence]")
	.on("change", function(){
	    bBeResidence = this.checked
	    setupChart(chart2014, crime2014LineData, 2014);
		setupChart(chart2013, crime2013LineData, 2013)
	})

	function setupChart(chart, data, year) {

		chart.selectAll("polyline")
    		.remove()

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

		//filters
		chart.selectAll("polyline")
		    .data(data)
		    .filter(function(d, i){
		        if(d["type"] == "Theft from Motor Vehicle" && !bTheftFromCar ||
		         d["type"] == "Theft of Motor Vehicle" && !bTheftOfCar ||
		         d["type"] == "Fatal/Injury Collision" && !bCollision ||
		         d["type"] == "Shoplifting" && !bShoplifting ||
		         d["type"] == "Break and Enter - Business" && !bBeBusiness ||
		         d["type"] == "Break and Enter - Residence" && !bBeResidence)
		        	return true;
		        else
		        	return false;
		    })
		    .attr({
		        opacity: 0
		    })

		//legend circles
		var svg = d3.select("svg");
	    var legend = svg.append("g")

	    legend.append("circle")
	    .attr({
	        cx: 750,
	        cy: 45,
	        r: 5,
	        fill: "rgb(255, 127, 0)"
	    })
	    
	    legend.append("circle")
	    .attr({
	        cx: 750,
	        cy: 65,
	        r: 5,
	        fill: "rgb(255, 255, 51)"
	    })	
	    
	    legend.append("circle")
	    .attr({
	        cx: 750,
	        cy: 85,
	        r: 5,
	        fill: "rgb(77, 175, 74)"
	    })

	    legend.append("circle")
	    .attr({
	        cx: 750,
	        cy: 105,
	        r: 5,
	        fill: "rgb(152, 78, 163)"
	    })

	    legend.append("circle")
	    .attr({
	        cx: 750,
	        cy: 125,
	        r: 5,
	        fill: "rgb(228, 26, 28)"
	    })

	    legend.append("circle")
	    .attr({
	        cx: 750,
	        cy: 145,
	        r: 5,
	        fill: "rgb(55, 126, 184)"
	    })

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
				if (d3.event.pageX >= tick.getBoundingClientRect().left && d3.event.pageX <= tick.getBoundingClientRect().right) {
					// position the marker over the line for this tick
					d3.select("#month-selection").style( "left", $(tick).find("line").position().left );
					d3.select("#month-selection").style( "display", "block" );

					month = findMonth(i);

					return false;
				}
			});
		});

		chart.selectAll("polyline")
    	.data(data)
		.on("mouseover", showGraphToolTip);

		


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

	//show tool tip on hover
	function showGraphToolTip(d)
	{
		if(checkVisible(d))
		{
			d3.select("#graphToolTip")
		    .html("<b>Details</b><hr/>"+
		          "<b>Crime Type</b>: " + d["type"] +
		          "<br/><b>Amount</b>: " + month
		    )
		    .style({
		        "display": "block",
		        "left": d3.event.pageX + "px",
		        "top": d3.event.pageY + "px"
		    })
		}
	}

	//hide tool tip on click 
	function hideGraphToolTip()
	{
		d3.select("#graphToolTip")
    	.style("display", "none")
	}

	//find the month that is being highlighted
	function findMonth(i)
	{
		switch(i) {
		    case 0:
		        return "January";
		        break;
		    case 1:
		        return "February";
		        break;
		    case 2:
		        return "March";
		        break;
		    case 3:
		        return "April";
		        break;
		    case 4:
		        return "May";
		        break;
		    case 5:
		        return "June";
		        break;
		    case 6:
		        return "July";
		        break;
		    case 7:
		        return "August";
		        break;
		    case 8:
		        return "September";
		        break;
		    case 9:
		        return "October";
		        break;
		    case 10:
		        return "November";
		        break;
		    case 11:
		        return "December";
		        break;
		    default:
		        return "January";
		}
	}

	//check if the crime has been filtered out
	function checkVisible(d)
	{
		switch(d["type"]) {
		    case "Theft from Motor Vehicle":
		        return bTheftFromCar;
		        break;
		    case "Theft of Motor Vehicle":
		        return bTheftOfCar;
		        break;
		    case "Fatal/Injury Collision":
		        return bCollision;
		        break;
		    case "Shoplifting":
		        return bShoplifting;
		        break;
		    case "Break and Enter - Business":
		        return bBeBusiness;
		        break;
		    case "Break and Enter - Residence":
		        return bBeResidence;
		        break;
		    default:
		        return true;
		}
	}
};


App.Views.crimeOverTime.chartRender = function() {
	d3.select("#crime-chart").style("display", "block");
};

App.Views.crimeOverTime.chartClose = function() {
	d3.select("#crime-chart").style("display", "none");
	d3.select("#month-selection").style( "display", "none" );
};