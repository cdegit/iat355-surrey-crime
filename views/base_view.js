App.BaseView = {
	utilities: {
		// circle path: http://stackoverflow.com/a/10477334/3670758
		baseMarker: {
		    path: 'M 0 0 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0',
		    fillOpacity: 1,
		    scale: 0.35,
		    strokeWeight: 1,
		    strokeColor: 'black',
		    strokeOpacity: 0.25
		},
		baseSelectedMarker: {
		    path: 'M 0 0 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0',
		    fillOpacity: 1,
		    scale: 0.35,
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
		},
		// brewer colors! http://bl.ocks.org/mbostock/5577023
		crimeColors: {
			"Break and Enter - Business": "rgb(228, 26, 28)",
			"Break and Enter - Residence": "rgb(55, 126, 184)",
			"Fatal/Injury Collision": "rgb(77, 175, 74)",
			"Shoplifting": "rgb(152, 78, 163)",
			"Theft from Motor Vehicle": "rgb(255, 127, 0)",
			"Theft of Motor Vehicle": "rgb(255, 255, 51)"
		},
		showMapTooltip: function(marker, contentCallback) {
			// generate tooltip content
			var content = contentCallback();
			App.map.tooltip.setContent(content);

			App.map.tooltip.open(App.map, marker);
			App.map.tooltip.currentMarker = marker;
		},
		hideMapTooltip: function() {
			App.map.tooltip.close();
			App.map.tooltip.currentMarker = null;
		}
	},
};