function initMap() {
	var properties = {
	    center:new google.maps.LatLng(49.13, -122.8),
	    zoom:11,
	    mapTypeId:google.maps.MapTypeId.ROADMAP
	}

	App.map = new google.maps.Map(document.getElementById("gMap"), properties);

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
    }];

    App.map.setOptions({styles: styles});

    App.map.tooltip = new google.maps.InfoWindow();
    App.map.tooltip.currentMarker = null;
}

initMap();
