/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, precinctData, stopsData, coordinates) {
        this.parentElement = parentElement;
        this.precinctData = precinctData[0];
        this.precinctByBorough = precinctData[1];
        this.stopsData = stopsData;
        this.displayData = stopsData;
        this.coordinates = coordinates;

        this.colorGradient = d3.scaleSequential(d3.interpolateBlues);

        this.formatThousands = d3.formatPrefix(",.0", 1e3);

        this.initVis()
    }

    initVis() {
        let vis = this;


		// Map of NYC - Leaflet 
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

        // Variables for keeping track of selected precinct
        vis.prevHighlight = undefined
        vis.currSelected = undefined
    
        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;
        console.log('Map Vis Wrangle Data')

        // group data together
        vis.groupedData = []

        for(let i=0; i < vis.displayData.length; i++) {
            let dataByYear = vis.displayData[i]

            for(let j=0; j < dataByYear.length; j++) {

                vis.groupedData.push(
                    {
                        pct: +dataByYear[j].pct,
                        year: dataByYear[j].year,
                    }
                )
            }
        }

        // Group Data By Precinct
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

        // Get Precinct Names
        vis.precinctNames = []

        for(let i = 0; i < vis.precinctData.features.length; i++) {
            let pct = vis.precinctData.features[i].properties.precinct;
            vis.precinctNames.push(+pct)
        }

        vis.precinctNames = vis.precinctNames.sort(function(a, b){return a - b});

        vis.precinctToBorough = {}
        for (let i = 0; i < vis.precinctByBorough.length; i++) {
            vis.precinctToBorough[vis.precinctByBorough[i].pct] = vis.precinctByBorough[i].borough;
        }

        console.log(vis.precinctToBorough)



        // Update Vis
        vis.updateVis()
    }



    updateVis(){
        let vis = this;

        console.log('Map Vis Update Vis')

        // Keep track of precinct layers
        vis.layers = {};

        vis.precincts = L.geoJson(vis.precinctData, {
            style: stylePrecinct,
            weight: 5,
            fillOpacity: 0.7,
            onEachFeature: onEachPrecinct,
        }).addTo(vis.map);

        // Actions for each precinct
        function onEachPrecinct(feature, layer) {
            layer.bindPopup();
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: onPrecinctClick,
            });
            vis.layers[feature.properties.precinct] = layer;
        }

        // Style Precinct
        function stylePrecinct(feature) {

            let pct = feature.properties.precinct

            return { 
                fillColor: vis.colorGradient(vis.totalStopsByPrecinct[+pct]), 
                color: 'white', 
                weight: 1 
            };

        }

        // On Precinct Click
        function onPrecinctClick(e) {
            let layer = e.target;
            let pct = e.target.feature.properties.precinct

            // Close Popup - Won't work without this line!
            layer.closePopup();

            // Update Visualization for Updated Precinct
            stopsTimelineVis.updateByPrecinct(pct)

            selectPrecinct.value = pct

            if (vis.prevHighlight && vis.prevHighlight !== pct) {
                vis.precincts.resetStyle(vis.layers[vis.prevHighlight]);
            } 

            // Update variables for keeping track of selected precinct
            vis.currSelected = pct
            vis.prevHighlight = pct
        }

        // Highlight Feature for when exploring on map (different from when user clicks on map)
        function highlightFeature(e) {
            var layer = e.target;
        
            layer.setStyle({
                weight: 5,
                color: 'white',
                dashArray: '',
                fillOpacity: 0.7
            });
        
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }

            vis.info.update(layer.feature.properties);

        }

        // Reset feature for when exploring on map (different from when user clicks on map)
        function resetHighlight(e) {
            let pct = e.target.feature.properties.precinct

            // Don't reset if the currently selected precinct
            if (vis.currSelected !== pct) {
                vis.precincts.resetStyle(e.target);
                vis.info.update();
            }

            // If there is a currently selected precinct update the displating information
            if (vis.currSelected) {

                vis.info.update(vis.layers[vis.currSelected].feature.properties);

            }
        }

        // Information about Precinct
        vis.info = L.control();

        vis.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        vis.info.update = function (props) {
            this._div.innerHTML = '<h4>NYC Precinct Stops</h4>' +  (props ?
                '<b>Precinct ' + props.precinct + ' - ' + vis.precinctToBorough[props.precinct] + '</b><br />' + vis.formatThousands(vis.totalStopsByPrecinct[props.precinct]) + ' stops'
                : 'Hover over a precinct');
        };

        vis.info.addTo(vis.map);


        // Legend
        vis.legend = L.control({position: 'bottomright'});

        vis.legend.onAdd = function (map) {
        
            var div = L.DomUtil.create('div', 'info legend'),
                colors = [0]
                for (let i = 1; i < 101; i++){
                    colors.push((i / 100) * vis.maxStops)
                }

            for (var i = 0; i < colors.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + vis.colorGradient(colors[i]) + '"></i>';
            }
            div.innerHTML += '<br><br><div class="legend-text" ><div style="display: inline-block" >0</div>' + '<div style="display: inline-block" >' + vis.formatThousands(vis.maxStops) + "</div></div>"
            return div;
        };
        
        vis.legend.addTo(vis.map);

        // Update Select Box
        let html = '<option value="all">All Precincts</option>'

        for (let i = 0; i < vis.precinctNames.length; i++) {
            html += '<option value="' + vis.precinctNames[i] + '">' + vis.precinctNames[i] + ' - ' + vis.precinctToBorough[vis.precinctNames[i]] +'</option>';
        }


        d3.select('#precinctSelect').html(html);
        
        }

    
    hightlightCurrentSelection(pct){
        let vis = this;

        if (vis.prevHighlight) {
            vis.precincts.resetStyle(vis.layers[vis.prevHighlight]);
        } 
        
        vis.prevHighlight = pct
        vis.currSelected = pct

        vis.layers[pct].setStyle({
            weight: 5,
            color: 'white',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            vis.layers[pct].bringToFront();
        }

        vis.info.update(vis.layers[pct].feature.properties);
    }

    resetMap() {

        let vis = this;

        if (vis.prevHighlight) {
            vis.precincts.resetStyle(vis.layers[vis.prevHighlight]);
        } 

        vis.info.update();

    }

    onUpdateByYear(selectionDomain) {
        let vis = this
        let yearBegin = parseInt(selectionDomain[0])
        let beginIndex = yearBegin - 2003
        let yearEnd = parseInt(selectionDomain[1])
        let endIndex = yearEnd - 2003

        vis.displayData = vis.stopsData.slice(beginIndex, endIndex + 1)

        vis.map.removeControl(vis.info);
        vis.map.removeControl(vis.legend);

        vis.wrangleData()

        console.log(yearBegin)
        console.log(yearEnd)

    }
            
}