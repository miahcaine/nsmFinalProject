/* * * * * * * * * * * * * *
*          TimelineVis          *
* * * * * * * * * * * * * */


class TimelineVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.parseDate = d3.timeParse("%m%d%Y");
        this.parseDateSlash = d3.timeParse("%m/%d/%Y");
        this.formatTime = d3.timeFormat("%m/%d/%Y");

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
		vis.x = d3.scaleLinear()
            .range([0, vis.width])

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(5);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")");

		vis.svg.append("g")
			.attr("class", "y-axis axis");

        
    
        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;
        console.log("wrangle")

        // group data together
        vis.groupedData = []

        for(let i=0; i < vis.displayData.length; i++) {
            let dataByYear = vis.displayData[i]

            for(let j=0; j < dataByYear.length; j++) {

                let date = ""

                if (dataByYear[j].datestop.length == 7) {
                    date = "0" + dataByYear[j].datestop
                } else {
                    date = dataByYear[j].datestop
                }
                vis.groupedData.push(
                    {
                        // pct: +dataByYear[j].pct,
                        year: dataByYear[j].year,
                        // dateStop: vis.parseDate(date)
                    }
                )
            }
        }

        console.log(vis.groupedData)
        

        // // consolidate by date
        // let countDataByDate = d3.rollup(vis.groupedData,leaves=>leaves.length,d=>vis.formatTime(d.dateStop))
        // vis.countDataByDate = Array.from(countDataByDate, ([key, value]) => ({key, value}))

		// // (2) Sort data by day
		// for (let i = 0; i < vis.countDataByDate.length; i++) {
        //     vis.countDataByDate[i].key = vis.parseDateSlash(vis.countDataByDate[i].key)
			
        // }
        
        // // filter out bad values
        // vis.countDataByDate = vis.countDataByDate.filter(function(value, index, arr){ 
        //     let minDate = vis.parseDateSlash("01/01/2003")
        //     let maxDate = vis.parseDateSlash("12/31/2016")
        //     return value.key >= minDate && value.key <= maxDate;
        // });

        // vis.countDataByDate.sort(function(a, b){return a.key - b.key});

        // same thing for years
        let countDataByYear = d3.rollup(vis.groupedData,leaves=>leaves.length,d=>+d.year)
        vis.countDataByYear = Array.from(countDataByYear, ([key, value]) => ({key, value}))

		for (let i = 0; i < vis.countDataByYear.length; i++) {
            vis.countDataByYear[i].key = vis.countDataByYear[i].key     
        }
        vis.countDataByYear = vis.countDataByYear.filter(function(value, index, arr){ 
            let minDate = 2003
            let maxDate = 2016
            return value.key >= minDate && value.key <= maxDate;
        });        

        

        vis.updateVis()
    }



    updateVis(){
        let vis = this;

        
        // Scales and axes
		vis.x.domain(d3.extent(vis.countDataByYear, function(d) { return d.key; }));
		vis.y.domain([0, d3.max(vis.countDataByYear, d=>d.value)])

		// SVG area path generator
		vis.area = d3.area()
			.x(function(d) { return vis.x(d.key); })
			.y0(vis.height)
			.y1(function(d) { return vis.y(d.value); });

        // Draw area by using the path generator
        vis.svg.selectAll("path").remove()
		vis.svg.append("path")
			.datum(vis.countDataByYear)
            .attr("fill", "#cce5df")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .transition()
            .duration(2500)
			.attr("d", vis.area);

		// // Initialize brush component
		// vis.brush = d3.brushX()
		// 	.extent([[0,0], [vis.width, vis.height]])
		// 	.on("brush", brushed)

		// // Append brush component here
		
		// vis.svg.append("g")
		// 	.attr("class", "x brush")
		// 	.call(vis.brush)
		// .selectAll("rect")
		// 	.attr("y", -6)
		// 	.attr("height", vis.height + 7)


		// Append x-axis
		vis.svg.select('.x-axis')
			.call(vis.xAxis);

		vis.svg.select('.y-axis')
			.call(vis.yAxis);


        }

    updateByPrecinct(pct) {
        let vis = this;

        vis.displayData = []

        for(let i=0; i < vis.data.length; i++) {
            let dataByYear = vis.data[i]

            let filteredData = dataByYear.filter(function(value){ 
                // console.log(value.pct)
                // console.log(pct)
                return value.pct == pct
            });

            vis.displayData.push(filteredData)

        }
        console.log(vis.data)
        console.log(vis.displayData)

        vis.wrangleData()

    }
            
}