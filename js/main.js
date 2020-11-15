function showNextVis(sectionID) {

    $("#" + sectionID).fadeIn();
    document.getElementById(sectionID).scrollIntoView({ behavior: 'smooth', block: 'start', });
}

function showVis4() {
    $("#victims-sec").fadeIn();
    document.getElementById("victims-sec").scrollIntoView({ behavior: 'smooth', block: 'start', });
    myVictimsVis = new VictimsVis('vis-4', globalData);
}



