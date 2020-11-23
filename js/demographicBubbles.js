class DemographicBubbles {
  constructor(parentElement, data, percParent, demParent, is_stops) {
    this.parentElement = parentElement;
    this.data = data;

    // to display percent of demographic in DOM
    this.percParent = percParent;
    this.demParent = demParent;

    // to handle data differently depending on type of bubbles
    this.is_stops = is_stops;
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.margin = { top: 0, bottom: 10, left: 20, right: 20 };
    vis.width = 400;
    $(`#${vis.parentElement}`).width() + vis.margin.left + vis.margin.right;
    // console.log($(`#${vis.parentElement}`).width());
    vis.height =
      $(`#${vis.parentElement}`).height() + vis.margin.top + vis.margin.bottom;

    vis.xCenter = (vis.width - vis.margin.left - vis.margin.right) / 2;
    vis.yCenter = (vis.height - vis.margin.top - vis.margin.bottom) / 2;
    vis.svg = d3
      .select(`#${vis.parentElement}`)
      .append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height);

    vis.wrangleData();
  }
  wrangleData(raceCode, changed) {
    let vis = this;
    if (changed) {
      vis.raceCode = raceCode;
    } else {
      vis.raceCode = 1;
    }
    vis.dataByYear = {};
    // TODO: fix for stop data
    if (vis.is_stops) {
      var x = 1;
      // total population percentages
    } else {
      vis.groupData = Array.from(
        d3.group(vis.data, d => d.Year),
        ([key, value]) => ({ key, value })
      );
      vis.groupData.forEach(row => {
        vis.dataByYear[row.key] = row.value;
      });
      // console.log("final pop data", vis.dataByYear);

      // GET PERCENTAGES
      // should we filter out the < 1 Age Group??
      vis.raceCodeObj = {
        0: "Total",
        1: "White Non Hispanic",
        2: "Black Non Hispanic",
        3: "Other Non Hispanic",
        5: "Hispanic"
      };
      vis.selectedDemographic = vis.raceCodeObj[vis.raceCode];
      vis.selectedYear = 2003;
      vis.totalPop = vis.dataByYear[vis.selectedYear][0]["Population"];
      vis.demPop = vis.dataByYear[vis.selectedYear][vis.raceCode]["Population"];
      console.log(vis.totalPop);
      console.log(vis.demPop);
    }
    vis.demPerc = (vis.demPop / vis.totalPop) * 100;
    $(`#${vis.percParent}`).text(vis.demPerc.toFixed());
    $(`#${vis.demParent}`).text(vis.selectedDemographic);
    // create "data" for packed bubbles
    vis.nodes = Array.from({ length: 100 }, () => ({
      counted: false,
      x: Math.random() * (vis.width - vis.margin.left - vis.margin.right),
      y: Math.random() * (vis.height - vis.margin.top - vis.margin.bottom)
    }));

    // associate bubbles with counted-ness????
    for (var i = 0; i < vis.demPerc.toFixed(); i++) {
      vis.nodes[i].counted = true;
    }

    vis.updateVis();
  }

  updateVis() {
    // create the circles
    let vis = this;

    console.log(vis.nodes);

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
          return "blue";
        } else {
          return "gray";
        }
      })
      .style("fill-opacity", 0.7)
      .merge(vis.bubbles)
      .attr("class", "bubble")
      .attr("r", 10)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", function(d) {
        if (d.counted == true) {
          return "blue";
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
