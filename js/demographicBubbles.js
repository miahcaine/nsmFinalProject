class DemographicBubbles {
  constructor(parentElement, data, percParent, is_stops) {
    this.parentElement = parentElement;
    this.data = data;
    console.log(this.data);

    // to display percent of demographic in DOM
    this.percParent = percParent;

    // to handle data differently depending on type of bubbles
    this.is_stops = is_stops;
    this.bubbleColor = d3.scaleSequential(d3.interpolatePurples);
    this.raceCode = 0;
    this.boroughCode = 2;
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.margin = { top: 0, bottom: 10, left: 20, right: 20 };
    vis.width = $(`#${vis.parentElement}`).width() + vis.margin.left + vis.margin.right;
    vis.height =
      $(`#${vis.parentElement}`).height() + vis.margin.top + vis.margin.bottom;

    vis.xCenter = (vis.width - vis.margin.left - vis.margin.right) / 2;
    vis.yCenter = (vis.height - vis.margin.top - vis.margin.bottom) / 2;
    vis.svg = d3
      .select(`#${vis.parentElement}`)
      .append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height);

    vis.wrangleData(vis.raceCode, vis.boroughCode, false);
  }
  wrangleData(raceCode, boroughCode, changed) {
    let vis = this;
    // create "data" for packed bubbles
    vis.nodes = Array.from({ length: 100 }, () => ({
      counted: false,
      x: Math.random() * (vis.width - vis.margin.left - vis.margin.right),
      y: Math.random() * (vis.height - vis.margin.top - vis.margin.bottom)
    }));
    // react to clicking filtering buttons
    if (changed) {
      if (boroughCode != -1){
        vis.boroughCode = boroughCode;
      }
      if (raceCode != -1){
        vis.raceCode = raceCode;
      }
    }
    // console.log("race code is", vis.raceCode);
    vis.dataByYear = {};
    vis.raceCodeObj = {
      0: "Total",
      1: "White Non Hispanic",
      2: "Black Non Hispanic",
      3: "Other Non Hispanic",
      4: "Hispanic"
    };

    vis.stopsRaceObj = {
      0 : [""],
      1 : ["W"],
      2 : ["B"],
      3 : ["Z", "A"],
      4 : ["P", "Q"]
    }

    vis.boroughObj = {
      2 : "New York City",
      3 : "Bronx",
      4 : "Brooklyn",
      5 : "Manhattan",
      6 : "Queens",
      7 : "Staten Island"
    }

    vis.stopsObj = {
      3 : 2,
      4 : 3,
      5 : 1,
      6 : 4,
      7 : 5
    }

    vis.selectedDemographic = vis.raceCodeObj[vis.raceCode];
    vis.selectedBorough = vis.boroughObj[vis.boroughCode];

      // if we do year filtering, this needs to change
      vis.selectedYear = 2006;
    
      // FIX THIS !!!!
    if (vis.is_stops) {
      let stopCount = 0;
      let totalStopCount = 0;
      for (var i = 0; i < vis.data[3].length; i++){
        // console.log("city is", vis.data[0][i].city);
        if (vis.boroughCode == 2){
          if (vis.stopsRaceObj[vis.raceCode].includes(vis.data[3][i].race)){
            stopCount++;
          }
          totalStopCount = vis.data[3].length;
        }

        else {
          if (vis.stopsRaceObj[vis.raceCode].includes(vis.data[3][i].race) && vis.data[3][i].city == vis.stopsObj[vis.boroughCode]){
            stopCount++;
          }
          else if (vis.data[3][i].city == vis.stopsObj[vis.boroughCode]){
            totalStopCount++;
          }
        }
        
      }
      // 
      // console.log("stop Count is", stopCount);
      // console.log("total Count is", totalStopCount);
      vis.demPerc = 100*(stopCount / totalStopCount);
      // console.log("demperc is", vis.demPerc);
      if (changed){
        $(`#${vis.percParent}`).text(`${vis.selectedDemographic} people make up ${vis.demPerc.toFixed()}% of the stops in ${vis.selectedBorough}.`);
      }
    } else {
      // find the selected borough
      for (var i = 0; i < vis.data.length; i++){
        if (vis.data[i][0]["County Code"] == vis.boroughCode){
          vis.selectedData = vis.data[i];
        }
      }
      vis.groupData = Array.from(
        d3.group(vis.selectedData, d => d.Year),
        ([key, value]) => ({ key, value })
      );
      vis.groupData.forEach(row => {
        vis.dataByYear[row.key] = row.value;
      });
      // console.log("final pop data", vis.dataByYear);

      // GET PERCENTAGES
      // filter to teens and adults, and add the whole population
      vis.totalPop = vis.dataByYear[vis.selectedYear][0]["Population"];
      vis.demPop = vis.dataByYear[vis.selectedYear][vis.raceCode]["Population"];
      vis.demPerc = (vis.demPop / vis.totalPop) * 100;
      if (changed){
        $(`#${vis.percParent}`).text(`${vis.selectedDemographic} people make up ${vis.demPerc.toFixed()}% of the population in ${vis.selectedBorough}.`);
      }
    }
    // console.log(vis.nodes);
    // associate bubbles with counted-ness????
    for (var i = 0; i < vis.demPerc.toFixed(); i++) {
      vis.nodes[i].counted = true;
    }

    vis.updateVis();
  }
  updateVis() {
    // create the circles
    let vis = this;
    // https://bl.ocks.org/officeofjane/a70f4b44013d06b9c0a973f163d8ab7a
    vis.simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength([-50]))
      .force(
        "x",
        d3
          .forceX()
          .strength([0.2])
          .x(vis.xCenter)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength([0.2])
          .y(vis.yCenter)
      )
      .force(
        "collision",
        d3.forceCollide().radius(d => 11)
      );
        // vis.simulation.tick(3);
    vis.bubbles = vis.svg.selectAll(".bubble").data(vis.nodes);
    vis.bubbles
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("r", 10)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", function(d) {
        if (d.counted == true) {
          return vis.bubbleColor(1);
        } else {
          return "gray";
        }
      })
      .style("fill-opacity", 0.7)
      .merge(vis.bubbles)
      .attr("class", "bubble")
      .attr("r", 7)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", function(d) {
        if (d.counted == true) {
          return vis.bubbleColor(1);
        } else {
          return "gray";
        }
      })
      .style("fill-opacity", 0.7);

    // vis.bubbles.exit().remove();

    vis.simulation
      .nodes(vis.nodes)
      .on("tick", function(d) {
        vis.bubbles.attr("cx", (d, i) => d.x);
        vis.bubbles.attr("cy", (d, i) => d.y);
      })
      .restart();
  }
}
