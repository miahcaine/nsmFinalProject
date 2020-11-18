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

        vis.countBySex = {}
        vis.countByRace = {}
        vis.countByAge = {}
        vis.countByAgeRange = {
            "30below": 0,
            "30above": 0,
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
                    case age < 30:
                        vis.countByAgeRange["30below"] += 1
                        break;
                    case age >= 30:
                        vis.countByAgeRange["30above"] += 1
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
        delete vis.countBySex[" "]

        vis.countByRace["Z"] += vis.countByRace[" "]
        vis.countByRace["Z"] += vis.countByRace["U"]
        vis.countByRace["Z"] += vis.countByRace["X"]
        delete vis.countByRace[" "]
        delete vis.countByRace["U"]
        delete vis.countByRace["X"]

        vis.countByBuild["Z"] += vis.countByBuild[" "]
        vis.countByBuild[" "] = 0
        delete vis.countByBuild[" "]



        // scale number of victims to 1000
        vis.scale = d3.scaleLinear()
            .range([0, 1000])
            .domain([0, vis.totalVictims])

        vis.sexPacks = []
        vis.sexArr = []
        for (let property in vis.countBySex) {
            let count = Math.round(vis.scale(vis.countBySex[property]))
            vis.countBySex[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"sex": property})
                vis.sexArr.push(property)
            }
            vis.sexPacks.push(countArr)
            
        }

        vis.racePacks = []
        vis.raceArr = []
        
        for (let property in vis.countByRace) {
            let count = Math.round(vis.scale(vis.countByRace[property]))
            vis.countByRace[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"race": property})
                vis.raceArr.push(property)
            }
            vis.racePacks.push(countArr)
            
        }

        vis.ageRangePacks = []
        vis.ageRangeArr = []
        for (let property in vis.countByAgeRange) {
            console.log(property)

            let count = Math.round(vis.scale(vis.countByAgeRange[property]))
            vis.countByAgeRange[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"ageRange": property})
                vis.ageRangeArr.push(property)
            }
            vis.ageRangePacks.push(countArr)
            
        }

        vis.buildPacks = []
        vis.buildArr = []
        for (let property in vis.countByBuild) {
            let count = Math.round(vis.scale(vis.countByBuild[property]))
            vis.countByBuild[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"build": property})
                vis.buildArr.push(property)
            }
            vis.buildPacks.push(countArr)
            
        }

        vis.buildArr.push("U")

        // initialize first 1000 nodes
        vis.nodes = [[]]

        for (let i = 0; i < 1000; i++) {
            vis.nodes[0].push({
                "allstops": "allstopsall",
                "sex": "sex"+vis.sexArr[i],
                "race": "race"+vis.raceArr[i],
                "ageRange": "ageRange"+vis.ageRangeArr[i],
                "build": "build"+vis.buildArr[i],
                "id": i
            })
        }

        // init Vis
        vis.pack = d3.pack()
            .size([vis.width, vis.height])
            .padding(1.5)

        vis.nodesData = d3.hierarchy({children: vis.nodes[0]})
            .sum(function(d) { return 1; });


        vis.realNodes = vis.svg.selectAll(".classallstopsall")
            .data(vis.pack(vis.nodesData).descendants().slice(1), function(d){return d.id})
            .enter()
            .append("circle")
            .filter(function(d){
                return  !d.children
            })
            .attr("cx", d=> d.x)
            .attr("cy", d=> d.y)
            .attr("r", function(d) {
                return d.r;
            })
            .attr("class", function(d){
                return "class"+ d.data.sex + " class"+ d.data.allstops + " class"+ d.data.race + " class"+ d.data.ageRange 
                + " class"+ d.data.build ;
            })
            .style("fill", function(d,i) {
                return "black";
            })

        console.log(vis.countByRace)

        // initialize data structure to aid in visualizations
        vis.graphinformation = {
            "sex": {
                categories: ["M", "F", "Z"],
                size: {
                    M: [vis.height * 0.9,vis.height* 0.9],
                    F: [vis.height* .2 ,vis.height* .2],
                    Z: [vis.height* .2,vis.height* .2],
                },
                transform: {
                    M: [(vis.width / 8),0],
                    F: [(vis.width / 2),vis.height * 0.5],
                    Z: [(vis.width / 1.5),vis.height * 0.5],
                },
                recenter: 0,
                data: vis.sexPacks,
                indices: {
                    0: "M", 
                    1: "F",
                    2: "Z"
                }

            },
            "allstops": {
                categories: ["all"],
                size: {
                    all: [vis.height,vis.height]
                },
                transform: {
                    all: [(vis.width / 2) - (vis.height / 2),0]
                },
                recenter: 0,
                data: vis.nodes,
                indices: {
                    0: "all"
                }
            },
            "race": {
                categories: ["A", "B", "I", "P", "Q", "W", "Z"],
                size: {
                    A: [vis.height,vis.height*0.15],
                    B: [vis.height,vis.height*0.7],
                    I: [vis.height,vis.height*0.05],
                    P: [vis.height,vis.height*0.2],
                    Q: [vis.height,vis.height*0.4],
                    W: [vis.height,vis.height*0.25],
                    Z: [vis.height,vis.height*0.25],
                },
                transform: {
                    A: [(vis.width / 2.5),vis.height * 0.5],
                    B: [0,0],
                    I: [(vis.width / 2.5),vis.height * 0.7],
                    P: [0,0],
                    Q: [(vis.width / 4),vis.height * 0.25],
                    W: [(vis.width / 3.25),0],
                    Z: [(vis.width / 2.5),vis.height * 0.25],
                },
                recenter: 0,
                data: vis.racePacks,
                indices: {
                    0: "A", 
                    1: "B",
                    2: "I",
                    3: "P", 
                    4: "Q",
                    5: "W",
                    6: "Z", 

                }
            },
            "ageRange": {
                categories: ["30below", "30above", "Z"],
                size: {
                    "30below": [vis.height*0.8,vis.height*0.8],
                    "30above": [vis.height*0.6,vis.height*0.6],
                    "Z": [vis.height*0.25,vis.height*0.25],
                },
                transform: {
                    "30below": [0,0],
                    "30above": [(vis.width / 3),vis.height * 0.2],
                    "Z": [(vis.width / 1.5),vis.height * 0.4]
                },
                recenter: 0,
                data: vis.ageRangePacks,
                indices: {
                    0: "30below", 
                    1: "30above",
                    2: "Z", 

                }
            },
            "build": {
                categories: ["H", "M", "T", "U", "Z"],
                size: {
                    "H": [vis.height,vis.height*0.25],
                    "M": [vis.height,vis.height*0.25],
                    "T": [vis.height,vis.height*0.25],
                    "U": [vis.height,vis.height*0.25],
                    "Z": [vis.height,vis.height*0.25],
                },
                transform: {
                    "H": [0,0],
                    "M": [100,100],
                    "T": [200,200],
                    "U": [300,300],
                    "Z": [100,300],
                },
                recenter: 0,
                data: vis.buildPacks,
                indices: {
                    0: "H", 
                    1: "M",
                    2: "T",
                    3: "U", 
                    4: "Z",
                }
            }
        };

       

        vis.updateVis()

    }




    updateVis(){
        let vis = this;

        vis.count += 1

        let dataset = {}
        let data;
        let selected;

        if ((vis.count % 5) == 1) {
            selected = "allstops"
        } else if ((vis.count % 5) == 2) {
            selected = "sex"
        } else if ((vis.count % 5) == 3){
            selected = "ageRange"
        } else if ((vis.count % 5) == 4){
            selected = "race"
        } else {
            selected = "allstops"
        }

        

        let categories = vis.graphinformation[selected].categories
        let graphsize = vis.graphinformation[selected].size;
        let useThis = vis.graphinformation[selected];

        (useThis.data).forEach((element, index) => {

            
            let name = vis.graphinformation[selected].indices[index]
            vis.pack.size(vis.graphinformation[selected].size[name]);

            console.log(selected)
            console.log(name)
            console.log(vis.graphinformation[selected])

            let nodes = d3.hierarchy({children: vis.nodes[0].filter(function(d){
                return d[selected]==(selected+name)
            })})
                .sum(function(d) { return 1; });



            vis.svg.selectAll(".class"+selected+name)
                .data(vis.pack(nodes).descendants().slice(1))
                .transition()
                .duration(1000)
                .filter(function(d){
                            return  !d.children
                        })
                .attr("r", function(d) {return d.r; })
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("transform", function(){
                            return "translate("+
                            (useThis["transform"][name][0])+
                            ","+useThis.transform[name][1]+")";
                        })


        });
        

    }

    // let node = vis.svg.selectAll(".class"+selected+name)
            //     .data(vis.pack(nodes).descendants().slice(1))


            // node
            //     .transition()
            //     .duration(1000)
            //     .filter(function(d){
            //         return  !d.children
            //     })
            //     .attr("cx", d=> d.x)
            //     .attr("cy", d=> d.y)
            //     .attr("r", function(d) {
            //         return d.r;
            //     })
            //     .style("fill", function(d,i) {
            //         return "black";
            //     })
            //     .attr("transform", function(){
            //         return "translate("+
            //         (useThis["transform"][name][0])+
            //         ","+useThis.transform[name][1]+")";
            //     })
                
            // node.exit().remove()



}