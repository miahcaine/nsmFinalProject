/* * * * * * * * * * * * * *
*          RadialVis          *
* * * * * * * * * * * * * */


class RadialVis {

    constructor(parentElement, stopsData, crimeNumbersData, populationData) {
        this.parentElement = parentElement;
        this.stopsData = stopsData;
        this.crimeNumbersData = crimeNumbersData;
        this.populationData = populationData;
        this.displayData = [];

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
            vis.height = 700 - vis.margin.top - vis.margin.bottom;


        vis.blobs = {
            width: 500,				//Width of the circle
            height: 500,				//Height of the circle
            margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
            levels: 3,				//How many levels or inner circles should there be drawn
            maxValue: 0, 			//What is the value that the biggest circle will represent
            labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
            opacityArea: 0.2, 	//The opacity of the area of the blob
            dotRadius: 4, 			//The size of the colored circles of each blog
            opacityCircles: 0.1, 	//The opacity of the circles of each blob
            strokeWidth: 2, 		//The width of the stroke around each blob
            roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
            // color: d3.scale.category10()	//Color function
        };

        //Put all of the options into a variable called blobs
        if('undefined' !== typeof options){
            for(var i in options){
                if('undefined' !== typeof options[i]){ blobs[i] = options[i]; }
            }//for i
        }//if

        ///////////////////////////////////////////////////////
        ////////// Create the container SVG and g /////////////
        ///////////////////////////////////////////////////////

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        // identify the top five most suspected crimes in a stop and frisk
        console.log("this is wrangleData in RadialVis")

        // (1) Group data by crime and count number of occurrences for each stop and frisk
        // for now, just stick with 2003
        let countStopsByCrime = d3.rollup(vis.stopsData[0],leaves=>leaves.length,d=>d.crimsusp);
        let countStopsByCrimeArray = Array.from(countStopsByCrime, ([crime, value]) => ({crime, value}));

        vis.topCrimSusp = countStopsByCrimeArray.sort(function(a,b)
        {return b.value - a.value});

        vis.topFiveCrimSusp = vis.topCrimSusp.slice(0,5);

        console.log(vis.topFiveCrimSusp);

        // identify the crime rates for the top five most suspected crimes in a stop and frisk

        // total population in NYC in 2003
        vis.totalNYCPop = vis.populationData[0].Population;

        console.log(vis.crimeNumbersData);

        // initialize empty array for total crime numbers for top five most suspected crimes
        vis.topFiveCrimeNumbers = [];

        // for each of the four "categories" of crimes (i.e. major felony)
        vis.crimeNumbersData.forEach(crimeCategory => {
            // for each of the "types" of crimes within each category
            crimeCategory.forEach(crimeType => {
                // for each of the top five most suspected crimes in a stop and frisk
                vis.topFiveCrimSusp.forEach(d => {
                    if (crimeType.OFFENSE == d.crime) {
                        vis.topFiveCrimeNumbers.push(crimeType["2003"]);
                    }
                })
            })
        })

        console.log(vis.topFiveCrimeNumbers);

        // vis.topFiveCrimeNumbers = vis.topFiveCrimeNumbers.map(d => {return +d;})

        let i;
        for (i = 0; i < 3; i++) {
            console.log(vis.topFiveCrimeNumbers[i]);
            vis.topFiveCrimeNumbers[i] = vis.topFiveCrimeNumbers[i].replace(/,/g, "");
        }

        console.log(vis.topFiveCrimeNumbers);

        // calculate crime rates (number of crimes per 100,000 individuals)
        vis.topFiveCrimeRates = []

        for (i = 0; i < 5; i++) {
            let crimeRate = vis.topFiveCrimeNumbers[i]/vis.totalNYCPop * 100000;
            vis.topFiveCrimeRates.push(crimeRate);
        }

        console.log(vis.topFiveCrimeRates);

        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        vis.blobs.maxValue = d3.max(vis.topFiveCrimeRates)
        console.log(vis.blobs.maxValue);


        vis.labels = vis.topFiveCrimSusp;	//Names of each axis (label)
        vis.labelTotal = vis.topFiveCrimSusp.length; //The number of different axes
        vis.radius = Math.min(vis.blobs.width/2, vis.blobs.height/2); //Radius of the outermost circle
        vis.format = d3.format('%');			 	//Percentage formatting
        vis.angleSlice = Math.PI * 2 / vis.labelTotal;		//The width in radians of each "slice"

        //Scale for the radius
        vis.rScale = d3.scaleLinear()
            .range([0, vis.radius])
            .domain([0, vis.blobs.maxValue]);


        /////////////////////////////////////////////////////////
        ////////// Glow filter for some extra pizzazz ///////////
        /////////////////////////////////////////////////////////

        //Filter for the outside glow
        vis.filter = vis.svg.append('defs').append('filter').attr('id','glow')
        vis.feGaussianBlur = vis.filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur')
        vis.feMerge = vis.filter.append('feMerge')
        vis.feMergeNode_1 = vis.feMerge.append('feMergeNode').attr('in','coloredBlur')
        vis.feMergeNode_2 = vis.feMerge.append('feMergeNode').attr('in','SourceGraphic')

        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////

        //Wrapper for the grid & axes
        vis.axisGrid = vis.svg.append("g")
            .attr("class", "axisWrapper")
            .attr("transform", "translate(300,300)");

        //Draw the background circles
        vis.axisGrid.selectAll(".levels")
            .data(d3.range(1,(vis.blobs.levels+1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d, i){return vis.radius/vis.blobs.levels*d;})
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", vis.blobs.opacityCircles)
            .style("filter" , "url(#glow)");

        //Text indicating at what % each level is
        vis.axisGrid.selectAll(".axisLabel")
            .data(d3.range(1,(vis.blobs.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function(d){return -d*vis.radius/vis.blobs.levels;})
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
            .text(function(d,i) { return Math.round(vis.blobs.maxValue * d/vis.blobs.levels); });

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        vis.axis = vis.axisGrid.selectAll(".axis")
            .data(vis.labels)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        vis.axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){return vis.rScale(vis.blobs.maxValue*1.1) * Math.cos(vis.angleSlice*i - Math.PI/2);})
            .attr("y2", function(d, i){ return vis.rScale(vis.blobs.maxValue*1.1) * Math.sin(vis.angleSlice*i - Math.PI/2); })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        vis.axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function(d, i){ return vis.rScale(vis.blobs.maxValue * vis.blobs.labelFactor) * Math.cos(vis.angleSlice*i - Math.PI/2); })
            .attr("y", function(d, i){ return vis.rScale(vis.blobs.maxValue * vis.blobs.labelFactor) * Math.sin(vis.angleSlice*i - Math.PI/2); })
            .text(function(d){return d.crime})
            // .call(wrap, vis.blobs.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        vis.testData = [300, 250, 200, 150, 100];

        // function for area outline paths
        vis.radialLine = d3.lineRadial()
            .curve(d3.curveCardinalClosed)
            .angle(function(d,i) {
                return i*vis.angleSlice;
            })
            .radius(function(d) {
                return vis.rScale(d);
            })

        //Create a wrapper for the blobs
        // TODO: change vis.testData back
        vis.blobWrapper = vis.svg.selectAll(".radarWrapper")
            .data(vis.testData)
            .enter().append("g")
            .attr("class", "radarWrapper")
            .attr("transform", "translate(300,300)");

        //Append the backgrounds
        vis.blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", function(d,i) { return vis.radialLine(vis.testData); })
            .style("fill", "steelblue")
            .style("fill-opacity", vis.blobs.opacityArea)
            .on('mouseover', function (d,i){
                //Dim all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", 0.1);
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.7);
            })
            .on('mouseout', function(){
                //Bring back all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", vis.blobs.opacityArea);
            });


        // Create the outlines
        vis.blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function(d,i) {
                // return vis.radialLine(d);
                // console.log(d);
                // console.log(i*vis.angleSlice);
                console.log(vis.radialLine(vis.testData));
                return vis.radialLine(vis.testData);
            })
            .style("stroke-width", vis.blobs.strokeWidth + "px")
            .style("stroke", "steelblue")
            .style("fill", "none")
            .style("filter" , "url(#glow)");

        /////////////////////////////////////////////////////////
        //////////////// Draw the time slider ///////////////////
        /////////////////////////////////////////////////////////

        // make array of years
        vis.dataTime = [];

        let i;
        for (i = 0; i < 14; i++) {
            let year = i + 2003;
            vis.dataTime.push(year);
        }

        // create the slider
        vis.sliderTime = d3
            .sliderBottom()
            .min(d3.min(vis.dataTime))
            .max(d3.max(vis.dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(300)
            .tickValues(vis.dataTime)
            .tickFormat(d3.format("d"))
            .on('onchange', val => {
                d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
            });

        vis.gTime = d3
            .select('div#slider-time')
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');

        vis.gTime.call(vis.sliderTime);

        d3.select('p#value-time').text(d3.format("d")(vis.sliderTime.value()));



    }
}