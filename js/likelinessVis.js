class LikelinessVis {
  constructor(parentElement, data) {
    this.parentElement = parentElement;
    this.data = data;

    this.race = "";
    this.age = "";
    this.sex = "";
    this.build = "";

    this.sqColor = d3.scaleSequential(d3.interpolateBlues);

    console.log("boxes data is", this.data);
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.margin = { top: 0, bottom: 10, left: 20, right: 20 };
    vis.width =
      $(`#${vis.parentElement}`).width() + vis.margin.left + vis.margin.right;
    vis.height =
      $(`#${vis.parentElement}`).height() + vis.margin.top + vis.margin.bottom;

    vis.svg = d3
      .select(`#${vis.parentElement}`)
      .append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height);

    vis.wrangleData(vis.race, vis.age, vis.sex, vis.build, false);
  }

  wrangleData(race, age, sex, build, changed) {
    
    let vis = this;
    vis.changed = changed;

    vis.struct = Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => 0)
    );
    if (changed) {
      let counts = getTotalStopCount(vis.data, race, age, sex, build);
      let matchingStopCnt = counts[0];
      let totalStopCnt = counts[1];
      vis.stopPerc = (100 * (matchingStopCnt / totalStopCnt)).toFixed();
      $("#likeliness-perc").text(
        `${vis.stopPerc} out of every 100 stops have this description.`
      );        
    }
    let counter = 0;
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {
        if (counter < vis.stopPerc) {
          vis.struct[i][j] = 1;
          counter++;
        }
      }
    }
    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.padding = 15;
    vis.boxSz = 30;
    vis.svg
        .selectAll("g")
        .data(vis.struct)
        .enter()
        .append("g")
        .attr("transform",(d, i) =>{
            return `translate(${vis.margin.left}, ${i * (vis.boxSz + vis.padding) + vis.margin.top})`
          });
    let row = vis.svg.selectAll("g")
          .data(vis.struct)
          .attr("transform",(d, i) =>{
              return `translate(${vis.margin.left}, ${i * (vis.boxSz + vis.padding) + vis.margin.top})`
            });

    row.selectAll("rect")
      .data(function(d, i) {
        return d;
      })
      .enter()
      .append("rect")
      .attr("x", (d, i) => {return i * (vis.boxSz + vis.padding);})
      .attr("width", vis.boxSz)
      .attr("height", vis.boxSz);

      row.selectAll("rect")
      .data(function(d, i) {
        return d;
      }).transition().duration(500)
      .attr("fill", (d, i) => {
        if (d == 1) {
          return vis.sqColor(1);
        } else {
          return "#DCDCDC";
        }
      });
    row.exit().remove();
  }
}
