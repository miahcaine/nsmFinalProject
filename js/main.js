function showNextVis(sectionID) {

    $("#" + sectionID).fadeIn();
    document.getElementById(sectionID).scrollIntoView({ behavior: 'smooth', block: 'start', });
}