var App = {};
App.Views = {};
App.Models = {};
App.currentView = null;


App.resizeVis = function (mapSize, chartSize) {
    d3.select("#gMap").style({"flex-grow": mapSize});
    d3.select("#chart").style({"flex-grow": chartSize});

    // wait for the animation to finish
    setTimeout(function() {
        var center = App.map.getCenter();
        google.maps.event.trigger(App.map, "resize");
        App.map.setCenter(center); 
    }, 300);
}

App.clearView = function() {
    if (App.currentView != null) {
        App.currentView.chartClose();
        App.currentView.mapClose();
    }
}

App.setView = function(view) {
    App.currentView = App.Views[view];

    App.Views[view].mapRender();
    App.Views[view].chartRender();
}
