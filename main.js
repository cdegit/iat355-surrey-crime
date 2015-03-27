var mapProperties = {
    center:new google.maps.LatLng(49.1833, -122.85),
    zoom:11,
    mapTypeId:google.maps.MapTypeId.ROADMAP
};
var map = new google.maps.Map(document.getElementById("gMap"), mapProperties);

function drawMap() {
    // var marker=new google.maps.Marker({
    //     position: mapProperties.center,
    // });

    // marker.setMap(map);

    var goldStar = {
        path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        fillColor: 'yellow',
        fillOpacity: 0.8,
        scale: 1,
        strokeColor: 'gold',
        strokeWeight: 14
    };


    var ctaLayer = new google.maps.KmlLayer(
    {   
        url: 'https://raw.githubusercontent.com/cdegit/iat355-surrey-crime/master/data/crime2013.kml?token=ACubUusFqD6-hhwSkiukcGskxzP9qHoXks5VHkTlwA%3D%3D',
        preserveViewport: true,
        icon: goldStar
    });
    ctaLayer.setMap(map);

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