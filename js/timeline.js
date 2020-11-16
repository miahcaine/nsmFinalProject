/* * * * * * * * * * * * * *
*          TimelineVis          *
* * * * * * * * * * * * * */


class TimelineVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.parseDate = d3.timeParse("%_m%d%Y");

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

        // Scales
        let x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        let y = d3.scaleLinear()
            .range([vis.height, 0]);

        // Axes
        let yAxis = d3.axisLeft().scale(y)
        let yAxisGroup = vis.svg.append("g")
            .attr("class", "axis y-axis")
                
        let xAxis = d3.axisBottom().scale(x)
        let xAxisGroup = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + (vis.height) + ")")

        
    
        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        // group data together
        vis.groupedData = []

        for(let i=0; i < vis.data.length; i++) {
            let dataByYear = vis.data[i]

            for(let j=0; j < dataByYear.length; j++) {

                vis.groupedData.push(
                    {
                        pct: +dataByYear[j].pct,
                        year: dataByYear[j].year,
                        dateStop: vis.parseDate(dataByYear[j].datestop)
                    }
                )
            }
        }

        console.log(vis.groupedData)

        // let dataByData = Array.from(d3.group(vis.groupedData, d =>d.pct), ([key, value]) => ({key, value}))

        // vis.processedPrecinctData = {}
        // vis.totalStopsByPrecinct = {}
        // vis.stopsByYear = {}

        // // iterate over each precinct and clean up data
        // dataByPrecinct.forEach( pct => {
        //     let dataByYear = Array.from(d3.group(vis.groupedData, d =>d.year), ([key, value]) => ({key, value}))
        //     let precinctByYear = []
        //     let totalStops = 0
            
        //     dataByYear.forEach( year => {
        //         let stopsNum = year.value.length
        //         totalStops += stopsNum
        
        //         precinctByYear.push (
        //             {year: year.key, date: year.key, stopsCount: stopsNum}
        //         )
        //     });
        //     vis.totalStopsByPrecinct[pct.key] = totalStops
        //     vis.processedPrecinctData[pct.key] = precinctByYear
        // });

        // console.log(vis.processedPrecinctData)
        // console.log(vis.totalStopsByPrecinct)

        // vis.updateVis()
    }



    updateVis(){
        let vis = this;

        console.log(vis.processedPrecinctData.map(d=> d.year))
        // console.log(y.domain([0, d3.max(vis.totalStopsByPrecinct, d => d.)]))

        x.domain(data.map(d=> d.year))
	    y.domain([0, d3.max(data, d => d[value])])



        }
            
}