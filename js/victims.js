/* * * * * * * * * * * * * *
*        VictimsVis        *
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
            .call(responsivefy)

        // Define number of nodes
        vis.totalNodes = 1000

        // Default to show all nodes
        vis.selected = 'allstops'

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        // Initialize mappings to count by each demographic
        vis.countBySex = {}
        vis.countByRace = {}
        vis.countByAge = {}
        vis.countByAgeRange = {
            "12_17": 0,
            "18_30": 0,
            "31_45": 0,
            "46_60": 0,
            "61_80": 0,
            "Z": 0,
        }
        vis.countByBuild = {}
        vis.totalVictims = 0

        // Go through data and populate dictionaries
        for(let i=0; i < vis.dataSets.length; i++) {
            let dataByYear = vis.dataSets[i]

            for(let j=0; j < dataByYear.length; j++) {

                // Sex
                let sex = dataByYear[j].sex
                if (vis.countBySex.hasOwnProperty(sex)) {
                    vis.countBySex[sex] += 1
                } else {
                    vis.countBySex[sex] = 1
                }

                // Race
                let race = dataByYear[j].race
                if (vis.countByRace.hasOwnProperty(race)) {
                    vis.countByRace[race] += 1
                } else {
                    vis.countByRace[race] = 1
                }

                // Age
                let age = +dataByYear[j].age
                switch(true) {
                    case age <= 17 && age >= 12:
                        vis.countByAgeRange["12_17"] += 1
                        break;
                    case age <= 30 && age >= 18:
                        vis.countByAgeRange["18_30"] += 1
                        break;
                    case age <= 45 && age >= 31:
                        vis.countByAgeRange["31_45"] += 1
                        break;
                    case age <= 60 && age >= 46:
                        vis.countByAgeRange["46_60"] += 1
                        break;
                    case age <= 80 && age >= 61:
                        vis.countByAgeRange["61_80"] += 1
                        break;
                    default:
                        vis.countByAgeRange["Z"] += 1
                      break;
                }

                // Build
                let build = dataByYear[j].build
                if (vis.countByBuild.hasOwnProperty(build)) {
                    vis.countByBuild[build] += 1
                } else {
                    vis.countByBuild[build] = 1
                }

                // Increment Total Victims Count
                vis.totalVictims += 1
                
            }
        }


        // some data cleaning - consolidate undefined / missing / other entries
        vis.countBySex["Z"] += vis.countBySex[" "]
        vis.countBySex["Z"] += vis.countBySex[undefined]
        delete vis.countBySex[" "]
        delete vis.countBySex[undefined]

        vis.countByRace["Z"] += vis.countByRace[" "]
        vis.countByRace["Z"] += vis.countByRace["U"]
        vis.countByRace["Z"] += vis.countByRace["X"]
        vis.countByRace["Z"] += vis.countByRace[undefined]
        delete vis.countByRace[" "]
        delete vis.countByRace["U"]
        delete vis.countByRace["X"]
        delete vis.countByRace[undefined]

        vis.countByBuild["Z"] += vis.countByBuild[" "]
        vis.countByBuild["Z"] += vis.countByBuild[undefined]
        delete vis.countByBuild[" "]
        delete vis.countByBuild[undefined]

        // scale number of victims to 1000
        vis.scale = d3.scaleLinear()
            .range([0, vis.totalNodes])
            .domain([0, vis.totalVictims])

        // Create arrays (of size 1000) for each statistic: each element corresponds to a trait: ex: ["M", "F", "M", "F"]

        // Create array for sex
        vis.sexArr = []
        for (let property in vis.countBySex) {
            let count = Math.round(vis.scale(vis.countBySex[property]))
            vis.countBySex[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"sex": property})
                vis.sexArr.push(property)
            }
        }

        // Create array for race
        vis.raceArr = []
        for (let property in vis.countByRace) {
            let count = Math.round(vis.scale(vis.countByRace[property]))
            vis.countByRace[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"race": property})
                vis.raceArr.push(property)
            }    
        }

        // Create array for age range
        vis.ageRangeArr = []
        for (let property in vis.countByAgeRange) {
            let count = Math.round(vis.scale(vis.countByAgeRange[property]))
            vis.countByAgeRange[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"ageRange": property})
                vis.ageRangeArr.push(property)
            }   
        }

        // Create array for build
        vis.buildArr = []
        for (let property in vis.countByBuild) {
            let count = Math.round(vis.scale(vis.countByBuild[property]))
            vis.countByBuild[property] = count
            let countArr = []
            for (let i = 0; i < count; i++ ) {
                countArr.push({"build": property})
                vis.buildArr.push(property)
            }  
        }
        // Some more data cleaning
        vis.buildArr.push("U")

        // initialize first 1000 nodes using first data structure
        vis.nodes = [[]]

        for (let i = 0; i < vis.totalNodes; i++) {
            vis.nodes[0].push({
                "allstops": "allstopsall",
                "sex": "sex"+vis.sexArr[i],
                "race": "race"+vis.raceArr[i],
                "ageRange": "ageRange"+vis.ageRangeArr[i],
                "build": "build"+vis.buildArr[i],
                "id": i
            })
        }

        // Variables for bubble pack vis -> helps randomizee te look
        vis.normaldist = Math.random

        // init Vis
        vis.pack = d3.pack()
            .size([vis.width, vis.height])
            .padding(1.5)

        // Data for each node
        vis.nodesData = d3.hierarchy({children: vis.nodes[0]})
            .sum(function(d){return 1+vis.normaldist();});

        // Draw each node
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


        // Define sizes for each circle pack and size between each circle pack for data structure beloew
        let sizesBySex = [[vis.height * 0.68,vis.height* 0.68], [vis.height* .2 ,vis.height* .26], [vis.height* .144,vis.height* .144]]
        let sizesByRace = [[vis.height * 0.144,vis.height*0.144], [vis.height * 0.56,vis.height*0.56], [vis.height * 0.056,vis.height*0.056],
                [vis.height * 0.192,vis.height*0.192], [vis.height *0.36,vis.height*0.36], [vis.height *0.24,vis.height*0.24], 
                [vis.height *0.16,vis.height*0.16]]
        let sizesByAgeRange = [[vis.height*0.296,vis.height*0.296], [vis.height*0.56,vis.height*0.56], [vis.height*0.344,vis.height*0.344],
                [vis.height*0.216,vis.height*0.216], [vis.height*0.08,vis.height*0.08], [vis.height*0.096,vis.height*0.096]]
        let sizesByBuild = [[vis.height*0.216,vis.height*0.216], [vis.height*0.56,vis.height*0.56], [vis.height*0.4,vis.height*0.4], 
                            [vis.height*0.04,vis.height*0.04], [vis.height*0.096,vis.height*0.096]]

        let sizeBtwnRace = 50
        let sizeBtwnBuild = 120;
        let sizeBtwnAge = 50
        let sizeBtwnSex = 150

        // initialize data structure to aid in visualizations

        // for each statistic, need to record categories, size of each bubble, location of each bubble, label names, count, 
        // supplementary text, and other stuff
        vis.graphinformation = {
            "sex": {
                categories: ["M", "F", "Z"],
                size: {
                    M: sizesBySex[0],
                    F: sizesBySex[1],
                    Z: sizesBySex[2],
                },
                transform: {
                    M: [0,vis.height - sizesBySex[0][0]],
                    F: [sizesBySex[0][0] + sizeBtwnSex,vis.height - sizesBySex[1][0]],
                    Z: [sizesBySex[0][0] + sizesBySex[1][0] + (sizeBtwnSex * 2),vis.height - sizesBySex[2][0]],
                },
                indices: {
                    0: "M", 
                    1: "F",
                    2: "Z"
                },
                names: {
                    M: ["Male"],
                    F: ["Female"],
                    Z: ["Recorded","Not", "Other/" ]
                },
                sum: {
                    M: vis.countBySex["M"],
                    F: vis.countBySex["F"],
                    Z: vis.countBySex["Z"],
                },
                text: "Almost 90% of those stopped were men."

            },
            "allstops": {
                categories: ["all"],
                size: {
                    all: [vis.height * 0.8,vis.height * 0.8]
                },
                transform: {
                    all: [(vis.width / 2) - ((vis.height * 0.8) / 2),vis.height * 0.15]
                },
                indices: {
                    0: "all"
                },
                names: {
                    all: ["All Stops"],
                },
                sum: {
                    all: vis.totalNodes,
                },
                text:  ""
            },
            "race": {
                categories: ["A", "B", "I", "P", "Q", "W", "Z"],
                size: {
                    A: sizesByRace[0],
                    B: sizesByRace[1],
                    I: sizesByRace[2],
                    P: sizesByRace[3],
                    Q: sizesByRace[4],
                    W: sizesByRace[5],
                    Z: sizesByRace[6]
                },
                transform: {
                    A: [sizesByRace[1][0] + sizesByRace[4][0] + sizesByRace[5][0] + sizesByRace[3][0] + sizesByRace[6][0] + (sizeBtwnRace * 5),vis.height - sizesByRace[0][0]],
                    B: [0,vis.height - sizesByRace[1][0]],
                    I: [sizesByRace[1][0] + sizesByRace[4][0] + sizesByRace[5][0] + sizesByRace[3][0] + sizesByRace[6][0] + sizesByRace[0][0] + (sizeBtwnRace * 6),vis.height - (sizesByRace[2][0] * 2)],
                    P: [sizesByRace[1][0] + sizesByRace[4][0] + sizesByRace[5][0] + (sizeBtwnRace * 3),vis.height - sizesByRace[3][0]],
                    Q: [sizesByRace[1][0] + sizeBtwnRace,vis.height - sizesByRace[4][0]],
                    W: [sizesByRace[1][0] + sizesByRace[4][0] + (sizeBtwnRace * 2),vis.height - sizesByRace[5][0]],
                    Z: [sizesByRace[1][0] + sizesByRace[4][0] + sizesByRace[5][0] + sizesByRace[3][0] + (sizeBtwnRace * 4),vis.height - sizesByRace[6][0]],
                },
                indices: {
                    0: "A", 
                    1: "B",
                    2: "I",
                    3: "P", 
                    4: "Q",
                    5: "W",
                    6: "Z", 
                },
                names: {
                    A: ["Islander","Pacific", "Asian/"],
                    B: ["Black"],
                    I: ["American", "Native"],
                    P: ["Black-Hispanic"],
                    Q: ["White-Hispanic"],
                    W: ["White"],
                    Z: ["Recorded","Not", "Other/" ],
                },
                sum: {
                    A: vis.countByRace["A"],
                    B: vis.countByRace["B"],
                    I: vis.countByRace["I"],
                    P: vis.countByRace["P"],
                    Q: vis.countByRace["Q"],
                    W: vis.countByRace["W"],
                    Z: vis.countByRace["Z"],
                },
                text: "More than half of those stopped were Black."
            },
            "ageRange": {
                categories: ["12_17", "18_30", "31_45", "46_60", "61_80", "Z"],
                size: {
                    "12_17": sizesByAgeRange[0],
                    "18_30": sizesByAgeRange[1],
                    "31_45": sizesByAgeRange[2],
                    "46_60": sizesByAgeRange[3],
                    "61_80": sizesByAgeRange[4],
                    "Z": sizesByAgeRange[5],
                },
                transform: {
                    "12_17": [0,vis.height - sizesByAgeRange[0][0]],
                    "18_30": [sizesByAgeRange[0][0] + sizeBtwnAge,vis.height - sizesByAgeRange[1][0]],
                    "31_45": [sizesByAgeRange[0][0] + sizesByAgeRange[1][0] + (sizeBtwnAge * 2),vis.height - sizesByAgeRange[2][0]],
                    "46_60": [sizesByAgeRange[0][0] + sizesByAgeRange[1][0] + sizesByAgeRange[2][0] 
                                + (sizeBtwnAge * 3),vis.height - sizesByAgeRange[3][0]],
                    "61_80": [sizesByAgeRange[0][0] + sizesByAgeRange[1][0] + sizesByAgeRange[2][0] + sizesByAgeRange[3][0] 
                                + (sizeBtwnAge * 4),vis.height - sizesByAgeRange[4][0]],
                    "Z": [sizesByAgeRange[0][0] + sizesByAgeRange[1][0] + sizesByAgeRange[2][0] + sizesByAgeRange[3][0] + sizesByAgeRange[4][0] 
                                + (sizeBtwnAge * 5),vis.height - sizesByAgeRange[5][0]],

                },
                indices: {
                    0: "12_17", 
                    1: "18_30",
                    2: "31_45", 
                    3: "46_60", 
                    4: "61_80",
                    5: "Z", 

                },
                names: {
                    "12_17": ["12 - 17"],
                    "18_30": ["18 - 30"],
                    "31_45": ["31 - 45"],
                    "46_60": ["46 - 60"],
                    "61_80": ["61 - 80"],
                    "Z": ["Recorded","Not", "Other/" ],
                },
                sum: {
                    "12_17": vis.countByAgeRange["12_17"],
                    "18_30": vis.countByAgeRange["18_30"],
                    "31_45": vis.countByAgeRange["31_45"],
                    "46_60": vis.countByAgeRange["46_60"],
                    "61_80": vis.countByAgeRange["61_80"],
                    "Z": vis.countByAgeRange["Z"] - 2,
                },
                text: "More than half of those stopped were young."
            },
            "build": {
                categories: ["H", "M", "T", "U", "Z"],
                size: {
                    "H": sizesByBuild[0],
                    "M": sizesByBuild[1],
                    "T": sizesByBuild[2],
                    "U": sizesByBuild[3],
                    "Z": sizesByBuild[4],
                },
                transform: {
                    "H": [sizesByBuild[3][0] + sizesByBuild[2][0] + (sizeBtwnBuild * 2.5),vis.height - sizesByBuild[0][0]],
                    "M": [sizesByBuild[3][0] + (sizeBtwnBuild * 1.5),vis.height - sizesByBuild[1][0]],
                    "T": [0,vis.height - sizesByBuild[2][0]],
                    "U": [sizesByBuild[3][0] + sizesByBuild[2][0] + sizesByBuild[0][0] + (sizeBtwnBuild * 3.25),vis.height - (sizesByBuild[3][0] * 1.5)],
                    "Z": [sizesByBuild[3][0] + sizesByBuild[2][0] + sizesByBuild[0][0] + sizesByBuild[3][0] + (sizeBtwnBuild * 4), vis.height - (sizesByBuild[4][0] )],
                },
                indices: {
                    0: "H", 
                    1: "M",
                    2: "T",
                    3: "U", 
                    4: "Z",
                },
                names: {
                    "H": ["Heavy"],
                    "M": ["Medium"],
                    "T": ["Thin"],
                    "U": ["Muscular"],
                    "Z": ["Recorded","Not", "Other/" ],
                },
                sum: {
                    "H": vis.countByBuild["H"],
                    "M": vis.countByBuild["M"],
                    "T": vis.countByBuild["T"],
                    "U": vis.countByBuild["U"],
                    "Z": vis.countByBuild["Z"],
                },
                text: "More than half of those stopped had a medium body composition."
            }
        };

        // Update Vis
        vis.updateVis()

    }


    updateVis(){
        let vis = this;

        // clear all current text
        vis.svg.selectAll(".label-dem").text("")
        vis.svg.selectAll('.label-dem').remove();
        vis.svg.selectAll('.label-dem-number').remove();

        // determine categories
        let categories = vis.graphinformation[vis.selected].categories

        // Foor each category (bubble):
        // 1. Draw circles
        // 2. Move bubble to prooper location
        // 3. Draw labels
        categories.forEach((name, index) => {

            // Determine bubble size
            vis.pack.size(vis.graphinformation[vis.selected].size[name]);

            // define nodes
            let nodes = d3.hierarchy({children: vis.nodes[0].filter(function(d){return d[vis.selected]==(vis.selected+name)})})
                .sum(function(d){return 1+vis.normaldist();});

            // transition nodes
            vis.svg.selectAll(".class"+vis.selected+name)
                .data(vis.pack(nodes).descendants().slice(1))
                .transition()
                .duration(1000)
                .filter(function(d){
                            return  !d.children
                        })
                .attr("r", function(d) {
                    return d.r; 
                })
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("transform", function(){
                            return "translate("+
                            (vis.graphinformation[vis.selected]["transform"][name][0])+
                            ","+vis.graphinformation[vis.selected].transform[name][1]+")";
                        })

            // Draw labels
            let labelNames = vis.graphinformation[vis.selected].names[name]
            let showText = vis.selected !== "allstops"

            for (let i = 0; i < labelNames.length; i++) {
                vis.svg
                    .append("text")
                    .attr("class", "label-dem")
                    .attr("x", vis.graphinformation[vis.selected]["transform"][name][0] + vis.graphinformation[vis.selected]["size"][name][0]/2)
                    .attr("y", (vis.graphinformation[vis.selected].transform[name][1] - (20 * (i + 2)) ))
                    .transition()
                    .delay(1100)
                    .text(showText ? labelNames[i] : "");  
            }

            vis.svg
                .append("text")
                .attr("class", "label-dem-number")
                .attr("x", vis.graphinformation[vis.selected]["transform"][name][0] + vis.graphinformation[vis.selected]["size"][name][0]/2)
                .attr("y", (vis.graphinformation[vis.selected].transform[name][1] - (20) ))
                .transition()
                .delay(1100)
                .text(showText ? ((vis.graphinformation[vis.selected].sum[name] * 100) / vis.totalNodes) + "%" : "");

        });

        // Draw supplementary text after bubbles are placed
        d3.select('#victims-supplementary-text').text(" ");
        d3.select("#victims-supplementary-text")
            .transition()
            .delay(1100)
            .text(vis.graphinformation[vis.selected].text)
        

    }

    updateBySelectedValue(selectedValue) {
        let vis = this;
        
        // Get selected value and update vis
        vis.selected = selectedValue
        vis.updateVis()
    }

}
