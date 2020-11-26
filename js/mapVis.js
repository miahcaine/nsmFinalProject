/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, precinctData, stopsData, coordinates) {
        this.parentElement = parentElement;
        this.precinctData = precinctData;
        this.stopsData = stopsData;
        this.coordinates = coordinates

        this.colorGradient = d3.scaleSequential(d3.interpolateBlues);

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

        vis.precincts = []

        for(let i = 0; i < vis.precinctData.features.length; i++) {

            let pct = vis.precinctData.features[i].properties.precinct;
        
            vis.precincts.push(pct)
        }

        vis.precincts.sort(function(a, b){return a.key - b.key});

        console.log(vis.precincts)


        vis.updateVis()
    }



    updateVis(){
        let vis = this;

        console.log('Map Vis Update Vis')

        // let p = d3.precisionPrefix(1e5, 1.3e6)
        // let f = d3.formatPrefix("." + p, 1.3e6);
        let formatThousands = d3.formatPrefix(",.0", 1e3);

        let precincts = L.geoJson(vis.precinctData, {
            style: stylePrecinct,
            weight: 5,
            fillOpacity: 0.7,
            onEachFeature: onEachPrecinct,
        }).addTo(vis.map);

        function onEachPrecinct(feature, layer) {
            layer.on({
                click: onPrecinctClick
            });

            layer.bindPopup("Precinct " + feature.properties.precinct + ": " + formatThousands(vis.totalStopsByPrecinct[feature.properties.precinct]) + " stops");
			layer.on('mouseover', function() { layer.openPopup(); });
            layer.on('mouseout', function() { layer.closePopup(); });
        }

        function stylePrecinct(feature) {
            let pct = feature.properties.precinct
            return { fillColor: vis.colorGradient(vis.totalStopsByPrecinct[+pct]), color: 'white', weight: 1 };

        }

        function onPrecinctClick(e) {
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
            div.innerHTML += '<br><br><div class="legend-text" ><div style="display: inline-block" >0</div>' + '<div style="display: inline-block" >' + formatThousands(vis.maxStops) + "</div></div>"
            return div;
        };
        
        legend.addTo(vis.map);

        let dropdown = L.control({position: 'topleft'});

        dropdown.onAdd = function (map) {

            let div = L.DomUtil.create('div', 'form-group')

            // div.innerHTML += '<label for="selectPrecinct">Example select</label>';
            div.innerHTML += '<select class="form-control" id="selectPrecinct">'

            for (let i = 0; i < vis.precincts.length; i++) {
                div.innerHTML +=
                   '<option>1</option>';
            }

            div.innerHTML += '</select>';
        }

        dropdown.addTo(vis.map)

        vis.map.on('click', function(){stopsTimelineVis.resetVis()});
    

        
        }
            
}