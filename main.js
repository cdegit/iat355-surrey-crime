var views = {
    crimeOverTime: {
        map: {
            kmlLayer: {},
            callback: function () {}
        },
        chart: {
            data: {},
            callback: function() {}
        }
    },
    parking: {
        map: {
            kmlLayer: {},
            callback: function () {}
        },
        chart: {
            data: {},
            callback: function() {}
        }
    },
    trafficCalming: {
        map: {
            kmlLayer: {},
            callback: function () {}
        },
        chart: {
            data: {},
            callback: function() {}
        }
    },
};

var mapProperties = {
    center:new google.maps.LatLng(49.1833, -122.85),
    zoom:11,
    mapTypeId:google.maps.MapTypeId.ROADMAP
};
var map = new google.maps.Map(document.getElementById("gMap"), mapProperties);

function initKMLLayers() {
    views.crimeOverTime.map.kmlLayer = new google.maps.KmlLayer(
    {   
        url: 'https://raw.githubusercontent.com/cdegit/iat355-surrey-crime/master/data/crime2013.kml?token=ACubUusFqD6-hhwSkiukcGskxzP9qHoXks5VHkTlwA%3D%3D',
        preserveViewport: true,
        map: null
    });

    views.parking.map.kmlLayer = new google.maps.KmlLayer(
    {   
        url: 'https://raw.githubusercontent.com/cdegit/iat355-surrey-crime/master/data/parking.kml?token=ACubUifc8Rhjl8oVQvDf1ofQ9hP1pBKXks5VHlaMwA%3D%3D',
        preserveViewport: true,
        map: null
    });

    views.trafficCalming.map.kmlLayer = new google.maps.KmlLayer(
    {   
        url: 'https://raw.githubusercontent.com/cdegit/iat355-surrey-crime/master/data/traffic_calming.kml?token=ACubUv1XPeOOPBAf0X4RC-pzc4Ki21xlks5VHlaVwA%3D%3D',
        preserveViewport: true,
        map: null
    });
}

function drawMap() {
    var styles = [
    {
        stylers: [
            { hue: "#00ffe6" },
            { saturation: -20 }
        ]
    },{
        featureType: "road",
        elementType: "geometry",
        stylers: [
            { lightness: 100 },
            { visibility: "simplified" }
        ]
    },{
        featureType: "road",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
        ]
    }];

    map.setOptions({styles: styles});
}

initKMLLayers();

views.crimeOverTime.map.kmlLayer.setMap(map);

$(drawMap)

resizeVis(1, 1);

d3.select("#resize-handle").on("dragend", function() {
    var width = parseInt(d3.select(".vis-content").style("width")) - 20;

    var graphWidth = width - d3.event.x;

    if (graphWidth < 0) {
        graphWidth = 0;
    }

    resizeVis(d3.event.x, graphWidth);
});

function resizeVis(mapSize, chartSize) {
    d3.select("#gMap").style({"flex-grow": mapSize});
    d3.select("#chart").style({"flex-grow": chartSize});

    // wait for the animation to finish
    setTimeout(function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center); 
    }, 300);
}

d3.select("select").on("change", function() {
    for (view in views) {
        views[view].map.kmlLayer.setMap(null);
    }

    var select = d3.select(d3.event.target);
    views[select.property("value")].map.kmlLayer.setMap(map);
});