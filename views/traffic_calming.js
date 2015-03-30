App.Views.trafficCalming = {
	map: {
		kmlLayer: new google.maps.KmlLayer(
	    {   
	        url: 'https://raw.githubusercontent.com/cdegit/iat355-surrey-crime/master/data/traffic_calming.kml?token=ACubUv1XPeOOPBAf0X4RC-pzc4Ki21xlks5VHlaVwA%3D%3D',
	        preserveViewport: true,
	        suppressInfoWindows: true,
	        map: null
	    }),
		clickCallback: function() {
			
		}
	},
	chart: {
		data: {},
		init: function() {

		},
		render: function() {

		},
		close: function() {
			
		}
	}
};