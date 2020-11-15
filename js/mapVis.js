/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, precinctData, coordinates) {
        this.parentElement = parentElement;
        this.precinctData = precinctData;
        this.coordinates = coordinates

        // define colors
        this.colors = ['#fddbc7','#f4a582','#d6604d','#b2182b']

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


        


        

    
        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;


        vis.updateVis()
    }



    updateVis(){
        let vis = this;

        let precincts = L.geoJson(vis.precinctData, {
            // style: styleBorough,
            weight: 5,
            fillOpacity: 0.7,
            onEachFeature: onEachPrecinct
        }).addTo(vis.map);

        function onEachPrecinct(feature, layer) {
            layer.on({
                click: whenClicked
            });
        }

        function whenClicked(e) {
            console.log(e);
          }



        }
            
}