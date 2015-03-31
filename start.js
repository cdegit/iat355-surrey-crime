for (view in App.Views) {
	App.Views[view].mapInit();
    App.Views[view].chartInit();
}

App.resizeVis(1, 1);
App.setView("crimeOverTime");
