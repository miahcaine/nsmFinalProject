let boroughBubbles, sfBubbles, likelinessVis;

function changeBubbles(){
  testCount++;
  boroughBubbles.wrangleData(testCount%5, true);
}

function Vis1() {
    myRadialVis = new RadialVis('radial-vis', stopsData, crimeNumbersData, NYCPopulationData)
}
    
function showVis2() {
    myMapVis = new MapVis('map-vis', precinctData, stopsData, [40.7128, - 74.0060])
    stopsTimelineVis = new TimelineVis('stops-timeline-vis', stopsData)
}

function showVis3() {
    myVictimsVis = new VictimsVis('victims-vis', globalData);
}

function updateVis3(selectedValue) {
  myVictimsVis.updateBySelectedValue(selectedValue)
}

function showVis4() {
  boroughBubbles = new DemographicBubbles("borough-bubbles", populationData, "borough-perc", false);
  stopBubbles = new DemographicBubbles("sf-bubbles", stopsData, "sf-perc", true);
}

function showVis5(){
  likelinessVis = new LikelinessVis("likeliness-vis", stopsData);
}

function updateVis5 (){
  var race = document.getElementById("race-select").value;
  var age = document.getElementById("age-select").value;
  var sex = document.getElementById("sex-select").value;
  var build = document.getElementById("build-select").value;
  likelinessVis.wrangleData(race, age, sex, build, true);
}

function cleanRow(row){
  row["Age Group Code"] = +row["Age Group Code"];
  row["County Code"] = +row["County Code"];
  row["Gender Code"] = +row["Gender Code"];
  row["Population"] = +row["Population"];
  row["Race Ethnicity Code"] = +row["Race Ethnicity Code"];
  row["Year"] = +row["Year"];
  return row;
}

function changeRace(code, type){
  boroughBubbles.wrangleData(code, -1, true);
  stopBubbles.wrangleData(code, -1, true);
}

function changeBorough(code, type){
  boroughBubbles.wrangleData(-1, code, true);
  stopBubbles.wrangleData(-1, code, true);
}

function hideDataLoader() {
  document.getElementById("data-loading-section").style.display = "none";
}

// load data using promises
let promises = [
    d3.json("sf_data/precinct/precincts.json"),
    d3.csv("sf_data/precinct/precincts.csv"),
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
    // // NYC population
    // d3.csv("sf_data/population/nyc_population_data.csv"),
    // County population
    d3.csv("sf_data/population/bronx_population_data.csv", row => cleanRow(row)),
    d3.csv("sf_data/population/kings_population_data.csv", row => cleanRow(row)),
    d3.csv("sf_data/population/new_york_population_data.csv", row => cleanRow(row)),
    d3.csv("sf_data/population/queens_population_data.csv", row => cleanRow(row)),
    d3.csv("sf_data/population/richmond_population_data.csv", row => cleanRow(row)),
    d3.csv("sf_data/population/nyc_population_data.csv", row => cleanRow(row)),
];

Promise.all(promises)
    .then( function(data){
        initMainVis(data)
        Vis1();
        showVis2();
        showVis3();
        showVis4();
        showVis5();
        hideDataLoader();
    })
    .catch( function (err){console.log(err)} );

let globalData = []
let precinctData = []
let stopsData = []
let crimeNumbersData = []
let NYCPopulationData;
let populationData;
let myRadialVis;

// nneka's vis
let myMapVis, 
myVictimsVis,
stopsTimelineVis,
stopBubbles;

function initMainVis(dataArray) {
    globalData = dataArray

    precinctData = dataArray.slice(0,2)

    stopsData = dataArray.slice(2,16)

    crimeNumbersData = dataArray.slice(16,20)

    NYCPopulationData = dataArray[dataArray.length - 1]

    populationData = dataArray.slice(20, dataArray.length)
 
}


// select option for timeline + map
let selectPrecinct = document.querySelector('#precinctSelect');

selectPrecinct.addEventListener('change', (event) => {
  let pct = event.target.value
  if (pct == "all") {
    stopsTimelineVis.resetVis()
    myMapVis.resetMap()
  } else {
    stopsTimelineVis.updateByPrecinct(pct)
    myMapVis.hightlightCurrentSelection(pct)
  }
});

$(".vis-4-race").click(function(){
  $(".vis-4-race").removeClass("active")
  $(this).toggleClass("active");
});
$(".vis-4-bor").click(function(){
  $(".vis-4-bor").removeClass("active")
  $(this).toggleClass("active");
});

// React to 'brushed' event and update all bar charts
function brushed() {
	
	let selectionRange = d3.brushSelection(d3.select(".brush").node());
  let selectionDomain = selectionRange.map(stopsTimelineVis.x.invert)
  
	myMapVis.onUpdateByYear(selectionDomain)

}