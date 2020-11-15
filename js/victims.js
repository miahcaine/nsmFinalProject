/* * * * * * * * * * * * * *
*      class VictimsVis        *
* * * * * * * * * * * * * */


class VictimsVis {

    constructor(parentElement, dataArray) {
        this.parentElement = parentElement;
        this.dataSets = dataArray;

        this.initVis()

    }


    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = ($("#" + vis.parentElement).height()) - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("class", "bubble")

        vis.count = 0

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        // init final data structure in which both data sets will be merged into
        vis.groupedData = []

        vis.countBySex = {}
        vis.countByRace = {}
        vis.countByAge = {}
        vis.countByAgeRange = {
            "M": 0,
            "20": 0,
            "30": 0,
            "40": 0,
            "50": 0,
            "60": 0,
            "Z": 0,
        }
        vis.countByBuild = {}
        vis.totalVictims = 0

        for(let i=0; i < vis.dataSets.length; i++) {
            let dataByYear = vis.dataSets[i]

            for(let j=0; j < dataByYear.length; j++) {

                let sex = dataByYear[j].sex
                if (vis.countBySex.hasOwnProperty(sex)) {
                    vis.countBySex[sex] += 1
                } else {
                    vis.countBySex[sex] = 1
                }

                let race = dataByYear[j].race
                if (vis.countByRace.hasOwnProperty(race)) {
                    vis.countByRace[race] += 1
                } else {
                    vis.countByRace[race] = 1
                }

                let age = +dataByYear[j].age
                switch(true) {
                    case age == 0:
                        vis.countByAgeRange["Z"] += 1
                        break;
                    case age < 18 :
                        vis.countByAgeRange["M"] += 1
                        break;
                    case age < 30:
                        vis.countByAgeRange["20"] += 1
                        break;
                    case age < 40:
                        vis.countByAgeRange["30"] += 1
                        break;
                    case age < 50:
                        vis.countByAgeRange["40"] += 1
                        break;
                    case age < 60:
                        vis.countByAgeRange["50"] += 1
                        break;
                    case age < 101:
                        vis.countByAgeRange["60"] += 1
                        break;
                    default:
                        vis.countByAgeRange["Z"] += 1
                      break;
                }

                let build = dataByYear[j].build
                if (vis.countByBuild.hasOwnProperty(build)) {
                    vis.countByBuild[build] += 1
                } else {
                    vis.countByBuild[build] = 1
                }

                vis.totalVictims += 1



            }

        }

        // some data cleaning
        vis.countBySex["Z"] += vis.countBySex[" "]
        vis.countBySex[" "] = 0

        vis.countByRace["Z"] += vis.countByRace[" "]
        vis.countByRace[" "] = 0

        vis.countByBuild["Z"] += vis.countByBuild[" "]
        vis.countByBuild[" "] = 0

        

        vis.scale = d3.scaleTime()
            .range([0, 1000])
            .domain([0, vis.totalVictims])

        vis.sexDataSet = []
        let c1 = 0
        for (let property in vis.countBySex) {
            if (property == " ") {
                break;
            }
            let count = Math.round(vis.scale(vis.countBySex[property]))
            vis.countBySex[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"sex": property})
                // vis.sexDataSet.push({"children": countArr})
            }
            vis.sexDataSet.push({"children": countArr})
            
            c1 += 1
        }

        console.log("here");
        console.log(vis.sexDataSet)

        vis.raceDataSet = []
        vis.raceDataSet2 = []
        c1 = 0
        for (let property in vis.countByRace) {
            if (property == " ") {
                break;
            }
            let count = Math.round(vis.scale(vis.countByRace[property]))
            vis.countByRace[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"build": property})
                vis.raceDataSet2.push({"group": c1})
            }
            vis.raceDataSet.push({"children": countArr})
            c1 += 1
        }

       vis.ageRangeDataset = []
        for (let property in vis.countByAgeRange) {
            if (property == " ") {
                break;
            }
            let count = Math.round(vis.scale(vis.countByAgeRange[property]))
            vis.countByAgeRange[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"build": property})
            }
            vis.ageRangeDataset.push({"children": countArr})
        }

        vis.buildDataSet = []
        for (let property in vis.countByBuild) {
            if (property == " ") {
                break;
            }
            let count = Math.round(vis.scale(vis.countByBuild[property]))
            vis.countByBuild[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"build": property})
            }
            vis.buildDataSet.push({"children": countArr})
        }

        vis.nodes = []
        vis.nodes1 = []

        for (let i = 0; i < 1000; i++) {
            vis.nodes.push({"victims": 0})
        }

        console.log(vis.nodes)

        vis.updateVis()

    }




    updateVis(){
        let vis = this;

        vis.count += 1

        let dataset = {}

        console.log(vis.count)
        if (vis.count == 1) {
            dataset = {
                "children": vis.nodes
            };
        } else if (vis.count == 2) {
            dataset = {
                "children": vis.sexDataSet
            };
        } else if (vis.count == 3) {
            dataset = {
                "children": vis.raceDataSet
            };
        } else if (vis.count == 4) {
            dataset = {
                "children": vis.ageRangeDataset
            };
        } else if (vis.count == 5) {
            dataset = {
                "children": vis.buildDataSet
            };
        } else {
            
            dataset = {
                "children": vis.nodes
            };

        }
        

        console.log(dataset)
        let diameter = 550;

        console.log(vis.width)
        console.log(vis.height)
        let bubble = d3.pack(dataset)
            .size([diameter, diameter])
            .padding(10);

        let nodes = d3.hierarchy(dataset)
            .sum(function(d) { return 1; });
        
        let node = vis.svg.selectAll("circle")
            .data(bubble(nodes).descendants())

                
        node.enter()
            .append("circle")
            .attr("class", "node")
            .merge(node)
            .transition()
            .duration(1000)
            .filter(function(d){
                return  !d.children
            })
            .attr("cx", d=> d.x)
            .attr("cy", d=> d.y)
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return "black";
            });
    

        node.exit().remove()

        // let dataset = []
        // let data = [{ "name": "A", "group": 1 }, { "name": "B", "group": 1 }, { "name": "C", "group": 1 }, { "name": "D", "group": 1 }, { "name": "E", "group": 1 }, { "name": "F", "group": 1 },
        // { "name": "G", "group": 2 }, { "name": "H", "group": 2 }, { "name": "I", "group": 2 }, { "name": "J", "group": 2 }, { "name": "K", "group": 2 }, { "name": "L", "group": 2 },
        // { "name": "M", "group": 3 }, { "name": "N", "group": 3 }, { "name": "O", "group": 3 }]

        // console.log(vis.count)
        // if (vis.count == 1) {
        //     dataset = vis.nodes
        //     data = data = [{ "name": "A", "group": 3 }, { "name": "B", "group": 2 }, { "name": "A", "group": 1 }]

        // // } else if (vis.count == 2) {
        // //     dataset = {
        // //         "children": vis.sexDataSet
        // //     };
        // // } else if (vis.count == 3) {
        // //     dataset = {
        // //         "children": vis.raceDataSet
        // //     };
        // // } else if (vis.count == 4) {
        // //     dataset = {
        // //         "children": vis.ageRangeDataset
        // //     };
        // // } else if (vis.count == 5) {
        // //     dataset = {
        // //         "children": vis.buildDataSet
        // //     };
        // } else {
        //     console.log(vis.raceDataSet2)
        //     dataset = vis.raceDataSet2
        //     data = [{ "name": "C", "group": 3 }, { "name": "B", "group": 2 }, { "name": "A", "group": 1 }]

        // }

        

        // // A scale that gives a X target position for each group
        // let x = d3.scaleOrdinal()
        //     .domain([1, 2, 3, 4, 5, 6, 7])
        //     .range([50, 150, 250, 50, 150, 250, 350])
        
        // let y = d3.scaleOrdinal()
        //     .domain([1, 2, 3, 4, 5, 6, 7])
        //     .range([vis.height * 0.25, vis.height * 0.25, vis.height * 0.25, vis.height * 0.75, vis.height * 0.75, vis.height * 0.75, vis.height * 0.5])

        // // A color scale
        // let color = d3.scaleOrdinal()
        //     .domain([1, 2, 3, 4, 5, 6, 7])
        //     .range([ "#F8766D", "#00BA38", "#619CFF", "blue", "black", "pink", "yellow"])

        // // let node = vis.svg.append("g")
        // //     .selectAll("circle")
        // //     .data(data)

        // // node.enter()
        // //     .append("circle")
        // //     // .attr("class", "node")
        // //     // .merge(node)
        // //     .attr("r", 5)
        // //     .attr("cx", vis.width / 2)
        // //     .attr("cy", vis.height / 2)
        // //     .style("fill", function(d){ return color(d.group)})
        // //     .style("fill-opacity", 0.8)
        // //     .attr("stroke", "black")
        // //     .style("stroke-width", 4)

        // // // node.exit().remove()

        // let node = vis.svg
        //     .selectAll("circle")
        //     .data(dataset)

        // node.enter()
        //     .append("circle")
        //     .attr("class", "node")
        //     .merge(node)
        //     .attr("r", 3)
        //     .attr("cx", vis.width / 2)
        //     .attr("cy", vis.height / 2)
        //     .style("fill", function(d){ return color(d.group)})
        //     .style("fill-opacity", 0.8)
        //     .attr("stroke", "black")
        //     .style("stroke-width", 4)

        // node.exit().remove
            

        // // Features of the forces applied to the nodes:
        // var simulation = d3.forceSimulation()
        //     .force("x", d3.forceX().strength(0.5).x( function(d){ return x(d.group) } ))
        //     .force("y", d3.forceY().strength(0.1).y(  function(d){ return y(d.group) } ))
        //     .force("center", d3.forceCenter().x(vis.width / 2).y(vis.height / 2)) // Attraction to the center of the svg area
        //     .force("charge", d3.forceManyBody().strength(0)) // Nodes are attracted one each other of value is > 0
        //     .force("collide", d3.forceCollide().strength(.1).radius(5).iterations(1)) // Force that avoids circle overlapping

        // // Apply these forces to the nodes and update their positions.
        // // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        // simulation
        //     .nodes(dataset)
        //     .on("tick", function(d){
        //         node
        //             .attr("cx", function(d){ return d.x; })
        //             .attr("cy", function(d){ return d.y; })
        //     });


    }



}