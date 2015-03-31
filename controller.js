d3.select("#resize-handle").on("dragend", function() {
    var width = parseInt(d3.select(".vis-content").style("width")) - 20;

    var graphWidth = width - d3.event.x;

    if (graphWidth < 0) {
        graphWidth = 0;
    }

    App.resizeVis(d3.event.x, graphWidth);
});

d3.select("select").on("change", function() {
    App.clearView();

    var selected = d3.select(d3.event.target).property("value");

    App.setView(selected);
});