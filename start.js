for (view in App.Views) {
    App.Views[view].chart.init();
}

App.resizeVis(1, 1);
App.setView("crimeOverTime");
