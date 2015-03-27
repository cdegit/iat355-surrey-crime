function drawMap() {
    var mapProperties = {
        center:new google.maps.LatLng(49.1833, -122.85),
        zoom:11,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("gMap"), mapProperties);


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
        url: 'https://gist.githubusercontent.com/cdegit/429beb50906a82107f8a/raw/f2f9337df8ed45d12de7f848dec348c168301580/crime2014.kml',
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