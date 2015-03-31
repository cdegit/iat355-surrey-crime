App.BaseView = {
	utilities: {
		// circle path: http://stackoverflow.com/a/10477334/3670758
		baseMarker: {
		    path: 'M 0 0 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0',
		    fillOpacity: 1,
		    scale: 0.5,
		    strokeWeight: 1,
		    strokeColor: 'black',
		    strokeOpacity: 0.25
		},
		baseSelectedMarker: {
		    path: 'M 0 0 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0',
		    fillOpacity: 1,
		    scale: 0.5,
		    strokeWeight: 2,
		    strokeColor: 'black',
		    strokeOpacity: 0.75
		},
		getMarkerIcon: function(color) {
			var icon = Object.create(this.baseMarker);
			icon.fillColor = color;
			return icon;
		},
		getSelectedMarkerIcon: function(color) {
			var icon = Object.create(this.baseSelectedMarker);
			icon.fillColor = color;
			return icon;
		}
	},
};