// init global Data array
let globalData = []

// init global variables & switches
let myVictimsVis;


function showNextVis(sectionID) {

    $("#" + sectionID).fadeIn();
    document.getElementById(sectionID).scrollIntoView({ behavior: 'smooth', block: 'start', });
}

function showVis4() {
    $("#victims-sec").fadeIn();
    document.getElementById("victims-sec").scrollIntoView({ behavior: 'smooth', block: 'start', });
    myVictimsVis = new VictimsVis('vis-4', globalData);
}

// load data using promises
let promises = [
    d3.csv("sf_data/stops/2003.csv"),
    // d3.csv("sf_data/stops/2004.csv"),
    // d3.csv("sf_data/stops/2005.csv"),
    // d3.csv("sf_data/stops/2006.csv"),
    // d3.csv("sf_data/stops/2007.csv"),
    // d3.csv("sf_data/stops/2008.csv"),
    // d3.csv("sf_data/stops/2009.csv"),
    // d3.csv("sf_data/stops/2010.csv"),
    // d3.csv("sf_data/stops/2011.csv"),
    // d3.csv("sf_data/stops/2012.csv"),
    // d3.csv("sf_data/stops/2013.csv"),
    // d3.csv("sf_data/stops/2014.csv"),
    // d3.csv("sf_data/stops/2015.csv"),
    // d3.csv("sf_data/stops/2016.csv"),
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function initMainPage(dataArray) {
    globalData = dataArray
    console.log(dataArray)
    // myVictimsVis = new VictimsVis('vis-1', dataArray);
}

function updateVis4() {
    myVictimsVis.updateVis()
}