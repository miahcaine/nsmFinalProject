let boroughBubbles, sfBubbles, likelinessVis;

// borough bubble data
d3.csv("sf_data/population/bronx_population_data.csv", row => {
  row["Age Group Code"] = +row["Age Group Code"];
  row["County Code"] = +row["County Code"];
  row["Gender Code"] = +row["Gender Code"];
  row["Population"] = +row["Population"];
  row["Race Ethnicity Code"] = +row["Race Ethnicity Code"];
  row["Year"] = +row["Year"];
  return row;
}).then(data => {
  boroughBubbles = new DemographicBubbles("borough-bubbles", data, "borough-perc", "borough-dem", false);
  let stopData = aggStops();
  // TODO: add back once stop data is fixed
//   demBubbles = new DemographicBubbles("sf-bubbles", stopData, "sf-perc", "sf-dem", true);
});

function aggStops() {
  let retData = [];
  // TODO: aggregate all stop years into retData
  // for (var i = 2003; i < 2016; i++){
  d3.csv(`sf_data/stops/2003.csv`).then(data => {
    retData.push(data);
  });
  // }
  return retData;
}

function showNextVis(sectionID) {
  //
  $("#" + sectionID).fadeIn();
  document
    .getElementById(sectionID)
    .scrollIntoView({ behavior: "smooth", block: "start" });
}
