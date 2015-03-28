App.Views.parking = {
	map: {
		kmlLayer: new google.maps.KmlLayer(
	    {   
	        url: 'https://raw.githubusercontent.com/cdegit/iat355-surrey-crime/master/data/parking.kml?token=ACubUifc8Rhjl8oVQvDf1ofQ9hP1pBKXks5VHlaMwA%3D%3D',
	        preserveViewport: true,
	        suppressInfoWindows: true,
	        map: null
	    }),
		clickCallback: function() {
			
		}
	},
	chart: {
		data: {},
		render: function() {
			
		},
		close: function() {
			
		}
	}
};