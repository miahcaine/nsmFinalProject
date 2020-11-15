function showNextVis(sectionID) {

    $("#" + sectionID).fadeIn();
    document.getElementById(sectionID).scrollIntoView({ behavior: 'smooth', block: 'start', });
}

// load data using promises
let mapPromises = [
    d3.json("sf_data/precinct/precincts.json"),
];

Promise.all(mapPromises)
    .then( function(data){ initMapVis(data) })
    .catch( function (err){console.log(err)} );

let mapData = []
let myMapVis
// initMapVis
function initMapVis(dataArray) {
    console.log(dataArray)

    // activity 2, force layout
    mapData = dataArray[0]

}

function showVis2(sectionID) {
    $("#" + sectionID).fadeIn();
    document.getElementById(sectionID).scrollIntoView({ behavior: 'smooth', block: 'start', });
    myMapVis = new MapVis('vis-2', mapData, [40.7128, - 74.0060])
}
