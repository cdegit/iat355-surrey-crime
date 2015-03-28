App.Views.crimeOverTime = {
	map: {
		kmlLayer: new google.maps.KmlLayer(
	    {   
	        url: 'https://raw.githubusercontent.com/cdegit/iat355-surrey-crime/master/data/crime2013.kml?token=ACubUusFqD6-hhwSkiukcGskxzP9qHoXks5VHkTlwA%3D%3D',
	        preserveViewport: true,
	        suppressInfoWindows: true,
	        map: null
	    }),
		clickCallback: function() {
			console.log("clickin' crime")
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