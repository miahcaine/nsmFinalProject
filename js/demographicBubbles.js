class DemographicBubbles {
  constructor(parentElement, data, percParent, is_stops) {
    this.parentElement = parentElement;
    this.data = data;
    
    // to display percent of demographic in DOM
    this.percParent = percParent;
    
    // to handle data differently depending on type of bubbles
    this.is_stops = is_stops;
    if (is_stops){
      this.stopData = getStopCounts(this.data);
    }
    else {
      this.popObj = getPopCounts(this.data);
      console.log("pop object", this.popObj);
    }
    this.bubbleColor = d3.scaleSequential(d3.interpolateBlues);
    this.raceCode = 0;
    this.boroughCode = 2;
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.margin = { top: 20, bottom: 20, left: 20, right: 20 };
    vis.width = $(`#${vis.parentElement}`).width() - vis.margin.left - vis.margin.right;
    vis.height =
      $(`#${vis.parentElement}`).height() - vis.margin.top - vis.margin.bottom;

    vis.xCenter = (vis.width) / 2;
    vis.yCenter = (vis.height) / 2;
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
      x:vis.xCenter,
      y: vis.yCenter
      // x: Math.random() * (vis.width - vis.margin.left - vis.margin.right),
      // y: Math.random() * ((vis.height - vis.margin.bottom) - vis.margin.top) + vis.margin.top
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
      2 : "Total",
      3 : "BRONX",
      4 : "BROOKLYN",
      5 : "MANHATTAN",
      6 : "QUEENS",
      7 : "STATEN ISLAND"
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
    let stopCount, totalStopCount;
    if (vis.is_stops) {
      if (changed){
        stopCount = vis.stopData[vis.raceCode][vis.selectedBorough];
        totalStopCount = vis.stopData[1][vis.selectedBorough] + vis.stopData[2][vis.selectedBorough] + vis.stopData[3][vis.selectedBorough]
                         + vis.stopData[4][vis.selectedBorough];
      } else {
        stopCount = 1;
        totalStopCount = 1;
      }
      vis.demPerc = 100 * (stopCount / totalStopCount);
      if (changed){
        if (vis.boroughCode == 2){
          vis.selectedBorough = "New York City";
        } else {
          let fixTitle = vis.selectedBorough.toLowerCase().split(" ");
          if (fixTitle.length > 1){
            let temp1 = fixTitle[0][0].toUpperCase() + fixTitle[0].slice(1);
            let temp2 = fixTitle[1][0].toUpperCase() + fixTitle[1].slice(1);
            vis.selectedBorough = [temp1,temp2].join(" ");
          } else {
            vis.selectedBorough = fixTitle[0][0].toUpperCase() + fixTitle[0].slice(1);
          }
        }
        $(`#${vis.percParent}`).text(`${vis.selectedDemographic} people make up ${((vis.demPerc)).toFixed()}% of the stops in ${vis.selectedBorough}.`);
      }
    } else {
      if (changed){
        vis.demPop = vis.popObj[vis.raceCode][vis.boroughObj[vis.boroughCode]];
        vis.totalPop = vis.popObj[1][vis.boroughObj[vis.boroughCode]] + vis.popObj[2][vis.boroughObj[vis.boroughCode]] 
                      + vis.popObj[3][vis.boroughObj[vis.boroughCode]] + vis.popObj[4][vis.boroughObj[vis.boroughCode]];
      } else {
        vis.demPop = 1;
        vis.totalPop = 1;
      }

      // GET PERCENTAGE
      vis.demPerc = (vis.demPop / vis.totalPop) * 100;
      if (changed){
        if (vis.boroughCode == 2){
          vis.selectedBorough = "New York City";
        } else {
          let fixTitle = vis.selectedBorough.toLowerCase().split(" ");
          if (fixTitle.length > 1){
            let temp1 = fixTitle[0][0].toUpperCase() + fixTitle[0].slice(1);
            let temp2 = fixTitle[1][0].toUpperCase() + fixTitle[1].slice(1);
            vis.selectedBorough = [temp1,temp2].join(" ");
          } else {
            vis.selectedBorough = fixTitle[0][0].toUpperCase() + fixTitle[0].slice(1);
          }
        }
        $(`#${vis.percParent}`).text(`${vis.selectedDemographic} people make up ${((vis.demPerc)).toFixed()}% of the population in ${vis.selectedBorough}.`);
      }
    }
    // associate bubbles with counted-ness????
    for (var i = 0; i < vis.demPerc.toFixed(); i++) {
      vis.nodes[i].counted = true;
    }

    vis.updateVis();
  }
  updateVis() {
    // create the circles
    let vis = this;
    vis.simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength([-15]))
      .force(
        "x",
        d3
          .forceX()
          .strength([0.15])
          .x(vis.xCenter)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength([0.15])
          .y(vis.yCenter)
      )
      .force(
        "collision",
        d3.forceCollide().radius(d => 4)
      );
        // vis.simulation.tick(3);
    vis.bubbles = vis.svg.selectAll(".bubble").data(vis.nodes);
    vis.bubbles
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("r", 8)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", function(d) {
        if (d.counted == true) {
          return vis.bubbleColor(1);
        } else {
          return "#DCDCDC";
        }
      })
      // .style("fill-opacity", 0.7)
      .merge(vis.bubbles)
      .attr("class", "bubble")
      .attr("r", 8)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", function(d) {
        if (d.counted == true) {
          return vis.bubbleColor(1);
        } else {
          return "#DCDCDC";
        }
      })
      .style("fill-opacity", 0.7);

    vis.simulation
      .nodes(vis.nodes)
      .on("tick", function(d) {
        vis.bubbles.attr("cx", (d, i) => d.x);
        vis.bubbles.attr("cy", (d, i) => d.y);
      })
      .restart();

      vis.bubbles.exit().remove();
  }
}
