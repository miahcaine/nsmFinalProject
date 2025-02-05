/* * * * * * * * * * * * * *
*        TimelineVis       *
* * * * * * * * * * * * * */


class TimelineVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        // Data formatters
        this.parseDate = d3.timeParse("%m%d%Y");
        this.parseDateSlash = d3.timeParse("%m/%d/%Y");
        this.formatTime = d3.timeFormat("%m/%d/%Y");
        this.formatThousands = d3.format(",");

        // Colors
        this.colorGradient = d3.scaleSequential(d3.interpolateBlues);

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 100, bottom: 20, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .call(responsivefy)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Title Area
        vis.title = vis.svg
            .append("g")
            .attr("transform", "translate(" + (vis.width / 2) + ",-" + (vis.margin.top/2) + ")")
            .append("text")
            .attr("class", "timeline-title")
            .text("Daily Number of Stops")

        // Scales and axes
		vis.x = d3.scaleLinear()
            .range([0, vis.width])

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(vis.displayData.length)
            .tickFormat(d3.format(".0f"));

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .ticks(5)
            
        vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")");

		vis.svg.append("g")
			.attr("class", "y-axis axis");

        vis.pct = undefined

        // SVG area path generator
        vis.area = d3.area()
            .curve(d3.curveCardinal)
			.x(function(d) { return vis.x(d.key); })
			.y0(vis.height)
			.y1(function(d) { return vis.y(d.value); });
    
        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        // group data together
        vis.groupedData = []

        for(let i=0; i < vis.displayData.length; i++) {
            let dataByYear = vis.displayData[i]

            for(let j=0; j < dataByYear.length; j++) {

                vis.groupedData.push(
                    {
                        year: dataByYear[j].year,
                    }
                )
            }
        }
        
        // consolidate data by year and sort
        let countDataByYear = d3.rollup(vis.groupedData,leaves=>leaves.length,d=>+d.year)
        vis.countDataByYear = Array.from(countDataByYear, ([key, value]) => ({key, value}))

        vis.countDataByYear = vis.countDataByYear.filter(function(value, index, arr){ 
            let minDate = 2003
            let maxDate = 2016
            return value.key >= minDate && value.key <= maxDate;
        });        

        vis.countDataByYear.sort(function(a, b){return a.key - b.key});

        // Update Visualization
        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        // Scales and axes
		vis.x.domain(d3.extent(vis.countDataByYear, function(d) { return d.key; }));
		vis.y.domain([0, d3.max(vis.countDataByYear, d=>d.value)])

        // Draw area by using the path generator
        vis.svg.selectAll("path").remove()
		vis.svg.append("path")
			.datum(vis.countDataByYear)
            .attr("fill", vis.colorGradient(.9))
            .attr("stroke", vis.colorGradient(1))
            .attr("stroke-width", 1.5)
            .transition()
            .duration(2500)
			.attr("d", vis.area);

		// Append x-axis
		vis.svg.select('.x-axis')
			.call(vis.xAxis);

		vis.svg.select('.y-axis')
            .call(vis.yAxis);        

        // define tooltipElement
        let tooltipElements = vis.svg.append("g")
            .attr("class", "tooltip-group")
            .style("display", 'none');

        // draw tooltip line
        let line = tooltipElements.append("line")
            .attr("class", "line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", vis.height);

        let stopsText = tooltipElements.append("text")
            .attr('class', 'tooltip-stops')

        let yearText = tooltipElements.append("text")
            .attr('class', 'tooltip-year')

        // create an svg rectange for mouseover events
        let rect = vis.svg.append("rect")
            .attr("width", vis.width + 2)
            .attr("height", vis.height)
            .attr('fill-opacity', 0)
            .attr("x", 1)
            .attr('y', 0)
            .on("mouseover", function(event,d){
                tooltipElements.style('display', null)
            })
            .on("mouseout", function(event,d){
                tooltipElements.style('display', 'none')
            })
            .on("mousemove", function(event,d){
                mousemove(event)
            })
    
        // function that moves the tooltip position to its most accurate spot
        function mousemove(event) {

            // get index of the current x position
            let xPos = d3.pointer(event)[0]
            let date = vis.x.invert(xPos)
            let dateParsed = parseInt(vis.x.invert(xPos))

            // draw new line and render new text
            line.attr("x1", vis.x(date))
                .attr("x2", vis.x(date))
            
            // define base year (precinct 121 is an outlier)
            let yearBase = 2003
            if (+vis.pct === 121) {
                yearBase = 2013
            }

            // Add text to tooltip
            stopsText.text(vis.formatThousands(vis.countDataByYear[dateParsed - yearBase].value) + " stops")
                    .attr('x', vis.x(date) + 10)
                    .attr('y', 10)

            yearText.text(dateParsed)
                        .attr('x', vis.x(date) + 10)
                        .attr('y', 30)
        }

    }

    // Update Visualization by Precinct
    updateByPrecinct(pct) {
        let vis = this;

        vis.displayData = []
        vis.pct = pct

        // Filter Data
        for(let i=0; i < vis.data.length; i++) {
            let dataByYear = vis.data[i]

            let filteredData = dataByYear.filter(function(value){ 
                return value.pct == pct
            });

            vis.displayData.push(filteredData)

        }
       
        // Update axes, title, disclaimer
        if (+pct === 121) {
            vis.xAxis
                .ticks(4)
            d3.select("#disclaimerPrecinct121").text("*Precinct 121 only has data from 2013 to 2016")
            vis.title.text("Daily Number of Stops for Precinct " + pct + "*")
            
        } else {
            vis.xAxis
                .ticks(vis.displayData.length)
            d3.select("#disclaimerPrecinct121").text("")
            vis.title.text("Daily Number of Stops for Precinct " + pct)
        }

        vis.wrangleData()

    }

    // Reset Visualization
    resetVis() {

        let vis = this;

        // Reset data, precinct, axes, title, disclaimer
        vis.displayData = vis.data
        vis.pct = undefined
        vis.xAxis
            .ticks(vis.displayData.length)
        vis.title.text("Daily Number of Stops")
        d3.select("#disclaimerPrecinct121").text("")


        vis.wrangleData()
        
    }
            
}
