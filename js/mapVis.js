/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, precinctData, stopsData, coordinates) {
        this.parentElement = parentElement;
        this.precinctData = precinctData;
        this.stopsData = stopsData;
        this.coordinates = coordinates

        this.colorGradient = d3.scaleSequential(d3.interpolatePurples);

        this.initVis()
    }

    initVis() {
        let vis = this;

        // // If the images are in the directory "/img":
		// L.Icon.Default.imagePath = 'images/';
		 
		vis.map = L.map(vis.parentElement).setView(vis.coordinates, 10);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16
        }).addTo(vis.map);

        // disable zooming and dragging
        vis.map.dragging.disable();
        vis.map.removeControl(vis.map.zoomControl)
        vis.map.scrollWheelZoom.disable();
        vis.map.doubleClickZoom.disable(); 


    
        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;
        console.log('Map Vis Wrangle Data')

        // group data together
        vis.groupedData = []

        for(let i=0; i < vis.stopsData.length; i++) {
            let dataByYear = vis.stopsData[i]

            for(let j=0; j < dataByYear.length; j++) {

                vis.groupedData.push(
                    {
                        pct: +dataByYear[j].pct,
                        year: dataByYear[j].year,
                        dateStop: dataByYear[j].datestop,
                    }
                )
            }
        }

        let dataByPrecinct = Array.from(d3.group(vis.groupedData, d =>d.pct), ([key, value]) => ({key, value}))

        vis.processedPrecinctData = {}
        vis.totalStopsByPrecinct = {}

        // iterate over each precinct and clean up data
        dataByPrecinct.forEach( pct => {
            let dataByYear = Array.from(d3.group(vis.groupedData, d =>d.year), ([key, value]) => ({key, value}))
            let precinctByYear = []
            let totalStops = 0
            
            dataByYear.forEach( year => {
                let stopsNum = year.value.length
                totalStops += stopsNum
        
                precinctByYear.push (
                    {year: year.key, date: year.key, stopsCount: stopsNum}
                )
            });
            vis.totalStopsByPrecinct[pct.key] = totalStops
            vis.processedPrecinctData[pct.key] = precinctByYear
        });

        vis.updateVis()
    }



    updateVis(){
        let vis = this;

        console.log('Map Vis Update Vis')

        let precincts = L.geoJson(vis.precinctData, {
            style: stylePrecinct,
            weight: 5,
            fillOpacity: 0.7,
            onEachFeature: onEachPrecinct,
        }).addTo(vis.map);

        function onEachPrecinct(feature, layer) {
            layer.on({
                click: whenClicked
            });
        }

        function stylePrecinct(feature) {
            let pct = feature.properties.precinct
            return { color: vis.colorGradient(vis.totalStopsByPrecinct[+pct]) };

        }

        function whenClicked(e) {
            stopsTimelineVis.updateByPrecinct(e.target.feature.properties.precinct)
          }



        }
            
}