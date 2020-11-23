let boroughBubbles, sfBubbles, likelinessVis;

let testCount = 1;

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

  // let stopData = aggStops();

  // TODO: add back once stop data is fixed
  // stopBubbles = new DemographicBubbles("sf-bubbles", stopsData, "sf-perc", "sf-dem", true);
});

function changeBubbles(){
  testCount++;
  boroughBubbles.wrangleData(testCount%5, true);
}

function showNextVis(sectionID) {
  //
  $("#" + sectionID).fadeIn();
  document
    .getElementById(sectionID)
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function Vis1() {
    myRadialVis = new RadialVis('radial-vis', stopsData, crimeNumbersData, populationData)
}
    
function showVis2(sectionID) {
    $("#" + sectionID).fadeIn();
    document.getElementById(sectionID).scrollIntoView({ behavior: 'smooth', block: 'start', });
    myMapVis = new MapVis('map-vis', precinctData, stopsData, [40.7128, - 74.0060])
    stopsTimelineVis = new TimelineVis('stops-timeline-vis', stopsData)
}

function showVis4() {
    $("#victims-sec").fadeIn();
    document.getElementById("victims-sec").scrollIntoView({ behavior: 'smooth', block: 'start', });
    myVictimsVis = new VictimsVis('victims-vis', globalData);
    
}

function updateVis4(selectedValue) {
  myVictimsVis.updateBySelectedValue(selectedValue)
}

// load data using promises
let promises = [
    d3.json("sf_data/precinct/precincts.json"),
    d3.csv("sf_data/stops/2003.csv"),
    d3.csv("sf_data/stops/2004.csv"),
    d3.csv("sf_data/stops/2005.csv"),
    d3.csv("sf_data/stops/2006.csv"),
    d3.csv("sf_data/stops/2007.csv"),
    d3.csv("sf_data/stops/2008.csv"),
    d3.csv("sf_data/stops/2009.csv"),
    d3.csv("sf_data/stops/2010.csv"),
    d3.csv("sf_data/stops/2011.csv"),
    d3.csv("sf_data/stops/2012.csv"),
    d3.csv("sf_data/stops/2013.csv"),
    d3.csv("sf_data/stops/2014.csv"),
    d3.csv("sf_data/stops/2015.csv"),
    d3.csv("sf_data/stops/2016.csv"),
    // raw numbers of crimes/arrests
    d3.csv("sf_data/arrests/majorFelonies.csv"),
    d3.csv("sf_data/arrests/misdemeanors.csv"),
    d3.csv("sf_data/arrests/nonMajorFelonies.csv"),
    d3.csv("sf_data/arrests/violations.csv"),
    // NYC population
    d3.csv("sf_data/population/nyc_population_data.csv"),
];

Promise.all(promises)
    .then( function(data){
        initMainVis(data)
        Vis1();
    })
    .catch( function (err){console.log(err)} );

let globalData = []
let precinctData = []
let stopsData = []
let crimeNumbersData = []
let populationData;
let myRadialVis;
let myMapVis,
myVictimsVis,
stopsTimelineVis;

function initMainVis(dataArray) {
    console.log("dataArray here:")
    console.log(dataArray)

    globalData = dataArray

    precinctData = dataArray[0]

    stopsData = dataArray.slice(1,15)

    crimeNumbersData = dataArray.slice(5,9)

    populationData = dataArray[9]
}
