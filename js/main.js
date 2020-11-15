function showNextVis(sectionID) {

    $("#" + sectionID).fadeIn();
    document.getElementById(sectionID).scrollIntoView({ behavior: 'smooth', block: 'start', });
}

function showVis2(sectionID) {
    $("#" + sectionID).fadeIn();
    document.getElementById(sectionID).scrollIntoView({ behavior: 'smooth', block: 'start', });
    myMapVis = new MapVis('map-vis', precinctData, stopsData, [40.7128, - 74.0060])
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
];

Promise.all(promises)
    .then( function(data){ initMainVis(data) })
    .catch( function (err){console.log(err)} );

let precinctData = []
let stopsData = []
let myMapVis

function initMainVis(dataArray) {
    console.log(dataArray)

    precinctData = dataArray[0]

    stopsData = dataArray.slice(1,4)

}