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

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);
		 
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
                    }
                )
            }
        }

        let dataByPrecinct = Array.from(d3.group(vis.groupedData, d =>d.pct), ([key, value]) => ({key, value}))


        vis.totalStopsByPrecinct = {}
        vis.processedPrecinctData = {}
        vis.maxStops = Number.MIN_SAFE_INTEGER

        // iterate over each precinct and clean up data
        dataByPrecinct.forEach( pct => {
            let dataByYear = Array.from(d3.group(pct.value, d =>d.year), ([key, value]) => ({key, value}))
            let precinctByYear = []
            let totalStops = 0
            
            dataByYear.forEach( year => {
                let stopsNum = year.value.length
                totalStops += stopsNum
        
                precinctByYear.push (
                    {year: year.key, stopsCount: stopsNum}
                )
            });
            vis.totalStopsByPrecinct[pct.key] = totalStops
            vis.processedPrecinctData[pct.key] = precinctByYear
            vis.maxStops = Math.max(vis.maxStops, totalStops)
        });

        vis.colorGradient.domain([0, vis.maxStops])

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

            layer.bindPopup("Precinct " + feature.properties.precinct + ": " + vis.totalStopsByPrecinct[feature.properties.precinct] + " total stops");
			layer.on('mouseover', function() { layer.openPopup(); });
            layer.on('mouseout', function() { layer.closePopup(); });
        }

        function stylePrecinct(feature) {
            let pct = feature.properties.precinct
            return { fillColor: vis.colorGradient(vis.totalStopsByPrecinct[+pct]), color: 'white', strokeWidth: 1 };

        }

        function whenClicked(e) {
            stopsTimelineVis.updateByPrecinct(e.target.feature.properties.precinct)
          }



    
    
        let legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {
        
            var div = L.DomUtil.create('div', 'info legend'),
                colors = [0]
                for (let i = 1; i < 101; i++){
                    colors.push((i / 100) * vis.maxStops)
                }

        
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < colors.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + vis.colorGradient(colors[i]) + '"></i>';
            }
            div.innerHTML += '<br><br><div class="legend-text" ><div style="display: inline-block" >0</div>' + '<div style="display: inline-block" >' + d3.format((".0k", 1e3))(vis.maxStops) + "</div></div>"
            return div;
        };
        
        legend.addTo(vis.map);
    

        
        }
            
}