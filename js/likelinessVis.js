class LikelinessVis {
  constructor(parentElement, data) {
    this.parentElement = parentElement;
    this.data = data;

    this.race = "";
    this.age = "";
    this.sex = "";
    this.build = "";

    this.sqColor = d3.scaleSequential(d3.interpolatePurples);

    console.log(this.data);
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
    vis.ageObj = {
      0: [12, 17],
      1: [18, 30],
      2: [31, 45],
      3: [46, 60],
      4: [61, 80]
    };
    vis.stopPerc = 0;
    let totalStopCnt = 0;
    let matchingStopCnt = 0;

    vis.struct = Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => 0)
    );
    // console.log(vis.struct);
    if (changed) {
      vis.race = race;
      vis.ageLow = vis.ageObj[age][0];
      vis.ageHi = vis.ageObj[age][1];
      vis.sex = sex;
      vis.build = build;
      // console.log(race, age, sex, build);

      for (var i = 0; i < vis.data.length; i++) {
        for (var j = 0; j < vis.data[i].length; j++) {
          if (
            vis.data[i][j].race == vis.race &&
            vis.data[i][j].sex == vis.sex &&
            vis.data[i][j].age >= vis.ageLow &&
              vis.data[i][j].age <= vis.ageHi &&
            vis.data[i][j].build == vis.build
          ) {
            matchingStopCnt++;
          }
        }
        totalStopCnt += vis.data[i].length;
      }
      vis.stopPerc = (100 * (matchingStopCnt / totalStopCnt)).toFixed(); // make whole
      $("#likeliness-perc").text(
        `Every ${vis.stopPerc} out of every 100 stops have this description.`
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
    // console.log("the struct is", vis.struct);
    vis.updateVis(vis.struct);
  }

  updateVis(struct) {
    let vis = this;

    vis.padding = 15;
    vis.boxSz = 30;
    let row = vis.svg
      .selectAll("g")
      .data(struct)
      .enter()
      .append("g")
      .attr("transform",(d, i) =>{
          // console.log("before merge", d);
          return `translate(${vis.margin.left}, ${i * (vis.boxSz + vis.padding) + vis.margin.top})`
        });

    row.selectAll("rect")
      .data(function(d) {
        console.log(d);
        return d;
      })
      .join(
        enter => enter.append("rect")
        .attr("fill", (d, i) => {
          console.log("in enter", d[i]);
          if (d[i] == 1) {
            return vis.sqColor(1);
          } else {
            return "gray";
          }})
        .attr("width", vis.boxSz)
        .attr("height", vis.boxSz),
        update => update.attr("fill", (d, i) => {
          console.log("in update", d[i]);
          if (d[i] == 1) {
            return vis.sqColor(1);
          } else {
            return "gray";
          }})
        )
      // .enter()
      // .append("rect")
      .attr("x", (d, i) => {return i * (vis.boxSz + vis.padding);})
      // .attr("width", vis.boxSz)
      // .attr("height", vis.boxSz)
      // .attr("fill", (d, i) => {
      //   if (d[i] == 1) {
      //     return vis.sqColor(1);
      //   } else {
      //     return "gray";
      //   }
      // })
      // .merge(row)
      // .attr("x", (d, i) => {return i * (vis.boxSz + vis.padding);})
      // .attr("width", vis.boxSz)
      // .attr("height", vis.boxSz)
      // .attr("fill", (d, i) => {
      //   if (d[i] == 1) {
      //     return vis.sqColor(1);
      //   } else {
      //     return "gray";
      //   }
      // });
    // row.exit().remove();
    console.log("hello");
  }
}
