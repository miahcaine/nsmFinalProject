/* * * * * * * * * * * * * *
*          RadialVis          *
* * * * * * * * * * * * * */


class RadialVis {

    constructor(parentElement, stopsData, crimeNumbersData, populationData) {
        this.parentElement = parentElement;
        this.stopsData = stopsData;
        this.crimeNumbersData = crimeNumbersData;
        this.populationData = populationData;

        this.initVis()
    }

    initVis() {
        let vis = this;

        // set margin, width, height of visualization
        vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right + 100,
            vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;


        // set properties of blobs for radial plot
        vis.blobs = {
            width: 500,				//Width of the circle
            height: 500,				//Height of the circle
            margin: {top: 30, right: 30, bottom: 30, left: 30}, //The margins of the SVG
            levels: 5,				//How many levels or inner circles should there be drawn
            maxValue: 0, 			//What is the value that the biggest circle will represent
            labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
            opacityArea: 0.05, 	//The opacity of the area of the blob
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
            }
        }

        // initialize svg canvas
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .call(responsivefy)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // create data for time slider
        vis.dataTime = d3.range(0, 14).map(function(d) {
            return new Date(2003 + d, 10, 3);
        });

        // create the slider
        vis.sliderTime = d3
            .sliderBottom()
            .min(d3.min(vis.dataTime))
            .max(d3.max(vis.dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(400)
            .tickValues(vis.dataTime)
            .tickFormat(d3.timeFormat("%Y"));

        vis.gTime = d3
            .select('div#slider-time')
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');

        vis.gTime.call(vis.sliderTime);

        d3.select('p#value-time').text(d3.timeFormat("%Y")(vis.sliderTime.value()));

        vis.value_time = d3.timeFormat("%Y")(vis.sliderTime.value());

        vis.sliderTime
            .on('onchange', val => {
                d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
                vis.value_time = d3.timeFormat("%Y")(vis.sliderTime.value());
                vis.updateVis();
            });

        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        // identify the top five most suspected crimes in a stop and frisk
        console.log("this is wrangleData in RadialVis")

        // isolate only the major felonies
        vis.majorFeloniesRaw = vis.crimeNumbersData[0];
        console.log(vis.majorFeloniesRaw);

        // two-dimensional arrays of felonies grouped by year
        vis.majorFeloniesFinal = [];

        // group by year
        let i, j;
        // loop through 2003-2016
        for (j = 2003; j < 2017; j++) {
            // temporary array grouping by year
            vis.majorFeloniesFiltered = [];
            // loop through the seven major felonies per year
            for (i = 0; i < 7; i++) {
                // convert each string to int
                vis.majorFeloniesRaw[i][j.toString()] = +vis.majorFeloniesRaw[i][j.toString()].replace(/,/g, '');
                // add object to array
                vis.majorFeloniesFiltered.push({'offense': vis.majorFeloniesRaw[i]["OFFENSE"],
                    'value': vis.majorFeloniesRaw[i][j.toString()],
                    'percent_change':
                        ((vis.majorFeloniesRaw[i][j.toString()] - vis.majorFeloniesRaw[i]["2003"])/
                            vis.majorFeloniesRaw[i]["2003"] * 100)});
            }
            vis.majorFeloniesFinal.push(vis.majorFeloniesFiltered);
        }

        // identify greatest absolute value; in this dataset, most negative value is greater than most positive value
        vis.blobs.maxValue = Math.abs(d3.min(vis.majorFeloniesFinal, d => d3.min(_.pluck(d, 'percent_change'))) * 2);
        console.log(vis.blobs.maxValue);

        // set additional blob properties
        vis.labels = [];
        vis.majorFeloniesFinal[0].forEach(d => {
            //Names of each axis (label)
            if (d.offense == "MURDER & NON-NEGL. MANSLAUGHTER") {
                vis.labels.push("MURDER & NON-NEGLIGIBLE MANSLAUGHTER")
            }
            else {
                vis.labels.push(d.offense);
            }
        })
        vis.labelTotal = vis.labels.length; //The number of different axes
        vis.radius = Math.min(vis.blobs.width/2, vis.blobs.height/2); //Radius of the outermost circle
        vis.format = d3.format('.0%');			 	//Percentage formatting with no decimals
        vis.angleSlice = Math.PI * 2 / vis.labelTotal;		//The width in radians of each "slice"

        // scale for the radius
        vis.rScale = d3.scaleLinear()
            .range([0, vis.radius])
            .domain([-100, 25]);

        // defining glow filter for blobs
        vis.filter = vis.svg.append('defs').append('filter').attr('id','glow')
        vis.feGaussianBlur = vis.filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur')
        vis.feMerge = vis.filter.append('feMerge')
        vis.feMergeNode_1 = vis.feMerge.append('feMergeNode').attr('in','coloredBlur')
        vis.feMergeNode_2 = vis.feMerge.append('feMergeNode').attr('in','SourceGraphic')

        // drawing background "axis"
        // wrapper for the circles and axes
        vis.axisGrid = vis.svg.append("g")
            .attr("class", "axisWrapper")
            .attr("transform", "translate(350,300)");

        // draw the background circles
        vis.axisGrid.selectAll(".levels")
            .data(d3.range(1,(vis.blobs.levels+1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d){return vis.radius/vis.blobs.levels*d;})
            .style("fill", "#CDCDCD")
            .style("stroke", function(d,i) {
                if (i == 1) {
                    return "red";
                }
                else {
                    return "#CDCDCD";
                }
            })
            .style("fill-opacity", vis.blobs.opacityCircles)
            .style("filter" , "url(#glow)");

        // labels for each level
        vis.axisGrid.selectAll(".axisLabel")
            .data(d3.range(1,(vis.blobs.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 0)
            .attr("y", function(d){return -d*vis.radius/vis.blobs.levels - 5;})
            .attr("dy", "0.4em")
            .style("font-size", "15px")
            .attr("fill", function(d, i) {
                if (i == 1) {
                    return "red";
                }
                else {
                    return "#737373"
                }
            })
            .text(function(d,i){
                return vis.format(((-25 * i) +25)/100);
            })

        // draw the straight axis lines from the center
        vis.axis = vis.axisGrid.selectAll(".axis")
            .data(vis.labels)
            .enter()
            .append("g")
            .attr("class", "axis");
        // append the lines
        vis.axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){return vis.radius * Math.cos(vis.angleSlice*i - Math.PI/2);})
            .attr("y2", function(d, i){ return vis.radius * Math.sin(vis.angleSlice*i - Math.PI/2); })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        // add the labels at each axis
        vis.axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function(d, i){
                if (i == 6) {
                    return (vis.radius * 1.5) * Math.cos(vis.angleSlice*i - Math.PI/2)
                }
                else {
                    return (vis.radius * 1.3) * Math.cos(vis.angleSlice*i - Math.PI/2)
                }
            })
            .attr("y", function(d, i){
                return (vis.radius * 1.1) * Math.sin(vis.angleSlice*i - Math.PI/2)
            })
            .text(function(d) {
                return d;
            })

        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        // define index in terms of 0-13
        vis.majorFeloniesIndex = vis.value_time - 2003;

        vis.majorFeloniesValues = [];

        // isolate only values from two-dimensional array
        let i;
        // loop through 2003-2016
        for (i = 0; i < 14; i++) {
            vis.majorFeloniesFiltered = _.pluck(vis.majorFeloniesFinal[i], 'value');

            vis.majorFeloniesFiltered = vis.majorFeloniesFiltered.map(function(d, i) {
                return ((d - vis.majorFeloniesFinal[0][i].value)/vis.majorFeloniesFinal[0][i].value * 100);
            })

            vis.majorFeloniesValues.push(vis.majorFeloniesFiltered);
        }

        // drawing blobs
        // function for area outline paths
        vis.radialLine = d3.lineRadial()
            .curve(d3.curveCardinalClosed)
            .angle(function(d,i) {
                return i*vis.angleSlice;
            })
            .radius(function(d) {
                return vis.rScale(d);
            })

        // draw blob background/fill
        vis.blobBackground = vis.svg.selectAll(".radarArea")
            .data(vis.majorFeloniesValues[vis.majorFeloniesIndex]);

        vis.blobBackground
            .enter().append("path")
            .attr("class", "radarArea")
            .merge(vis.blobBackground)
            .attr("transform", "translate(350,300)")
            .attr("d", function(d,i) { return vis.radialLine(vis.majorFeloniesValues[vis.majorFeloniesIndex]); })
            .style("fill", "steelblue")
            .style("fill-opacity", vis.blobs.opacityArea)
            .on('mouseover', function (d,i){
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.3);
            })
            .on('mouseout', function(){
                //Bring back all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", vis.blobs.opacityArea);
            });
        vis.blobBackground.exit().remove();

        // draw blob outer outline
        vis.blobOutlines = vis.svg.selectAll(".radarStroke")
            .data(vis.majorFeloniesValues[vis.majorFeloniesIndex]);

        vis.blobOutlines.enter()
            .append("path")
            .attr("class", "radarStroke")
            .merge(vis.blobOutlines)
            .attr("transform", "translate(350,300)")
            .attr("d", function(d,i) {
                return vis.radialLine(vis.majorFeloniesValues[vis.majorFeloniesIndex]);
            })
            .style("stroke-width", vis.blobs.strokeWidth + "px")
            .style("stroke", "steelblue")
            .style("fill", "none")
            .style("filter" , "url(#glow)");
        vis.blobOutlines.exit().remove();

        // draw white blob dots to accentuate data points
        vis.blobDots = vis.svg.selectAll(".radarDot")
            .data(vis.majorFeloniesValues[vis.majorFeloniesIndex]);

        vis.blobDots.enter()
            .append("circle")
            .attr("class", "radarDot")
            .merge(vis.blobDots)
            .attr("transform", "translate(350,300)")
            .attr("cx", function(d, i) {
                return Math.abs(vis.rScale(vis.majorFeloniesValues[vis.majorFeloniesIndex][i]))
                    * Math.cos(vis.angleSlice*i - Math.PI/2)
            })
            .attr("cy", function(d, i) {
                return Math.abs(vis.rScale(vis.majorFeloniesValues[vis.majorFeloniesIndex][i]))
                    * Math.sin(vis.angleSlice*i - Math.PI/2)
            })
            .attr("r", "5px")
            .attr("fill", "white")
            .attr("stroke", "#CDCDCD")
            .on("mouseover", function(event, d) {
                if (d > 0) {
                    document.getElementById("percent-change-1").innerHTML +=
                        "<span style='color: red;'>+"+ vis.format(d/100) +"</span>"
                }
                else if (d ==0){
                    document.getElementById("percent-change-1").innerHTML +=
                        "<span style='color: orange;'>"+ vis.format(d/100) +"</span>"
                }
                else {
                    document.getElementById("percent-change-1").innerHTML +=
                        "<span style='color: green;'>"+ vis.format(d/100) +"</span>"
                }
            })
            .on("mouseout", function(event, d) {
                document.getElementById("percent-change-1").innerHTML = "Percent Change: "
            });
        vis.blobDots.exit().remove();
    }
}