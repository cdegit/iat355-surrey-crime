var barData = [];

/*for(var i = 0; i < 50; i++)
{
	barData.push(Math.round(Math.random()*30+1))
}*/

d3.tsv('Crime_Summary.tsv', function(data){

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

	/*var colors = d3.scale.linear()
				.domain([0, barData.length*.33, barData.length*.66, barData.length])
				.range(['#FFB832', '#C61C6F', '#268BD2', '#85992C']);*/

	var yScale = d3.scale.linear()
				.domain([0, d3.max(barData)])
				.range([0, height]);

	var xScale = d3.scale.ordinal()
				.domain(d3.range(0, barData.length))
				.rangeBands([0, width], 0.2, 0.2);

	var toolTip = d3.select('body').append('div')
				.style('position', 'absolute')
				.style('padding', '0 10px')
				.style('background', 'white')
				.style('opacity', 0);

	var myChart = d3.select('#chart')
					.append('svg')
						.style('background', '#E7E0CB')
						.attr('width', width + margin.left + margin.right)
						.attr('height', height + margin.top + margin.bottom)
						.append('g')
							.attr('transform', 'translate('+margin.left+', '+margin.top+')')
							.selectAll('rect').data(barData).enter()
							.append('rect')
								.style('fill', color)
								.attr('width', xScale.rangeBand())
								.attr('height', 0)
								.attr('x', function(d,i){
									return xScale(i);
								})
								.attr('y', height)
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
								});

	myChart.transition()
		.attr('height', function(d){
			return yScale(d);
		})
		.attr('y', function(d){
			return height - yScale(d);
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
				// .tickValues(xScale.domain().filter(function(d, i){
				// 	console.log(barData.length);
				// 	console.log(i);
				// 	return !(i % (barData.length/5));
				// }));

	var hGuide = d3.select('svg').append('g');

	hAxis(hGuide);
	hGuide.attr('transform', 'translate('+margin.left+', '+(height+margin.top)+')');

	hGuide.selectAll('path')
		.style({fill: 'none', stroke: "#000"});

	hGuide.selectAll('line')
		.style({stroke: '#000'});

	hGuide.selectAll('text')
		.style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-65)" 
            });

    function color(d,i)
    {
    	if(i <= 11)
    		return "blue";
    	else
    		return "red";
    }
});

/*barData.sort(function compareNumbers(a,b){
	return a-b;
});*/

