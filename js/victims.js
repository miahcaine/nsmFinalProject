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
        vis.height = ($("#" + vis.parentElement).height() / 2) - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("class", "bubble")
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        // init final data structure in which both data sets will be merged into
        vis.groupedData = []

        vis.countByRace = {
            "male": 0,
            "female": 0,
            "unknwon": 0
        }

        for(let i=0; i < vis.dataSets.length; i++) {
            let dataByYear = vis.dataSets[i]

            for(let j=0; j < dataByYear.length; j++) {

                vis.groupedData.push(
                    {
                        weight: +dataByYear[j].weight,
                        sex: dataByYear[j].sex,
                        race: dataByYear[j].race,
                        height_ft: +dataByYear[j].ht_feet,
                        height_inch: +dataByYear[j].ht_inch,
                        hair_color: dataByYear[j].haircolr,
                        eye_color: dataByYear[j].eyecolor,
                        build: dataByYear[j].build,
                        age: +dataByYear[j].age
                    }
                )



            }

        }

        console.log(vis.groupedData)


        vis.updateVis()

    }


    updateVis(){
        let vis = this;

        let dataset = {
            "children": vis.groupedData.slice(0,10)
        };

        let diameter = 450;

        let bubble = d3.pack(dataset)
            .size([diameter, diameter])
            .padding(10);

        let nodes2 = d3.hierarchy(dataset)
            .sum(function(d) { return 1; });
        //
        // let node = vis.svg.selectAll(".node")
        //     .data(bubble(nodes).descendants())
        //     .enter()
        //     .filter(function(d){
        //         return  !d.children
        //     })
        //     .append("g")
        //     .attr("class", "node")
        //     .attr("transform", function(d) {
        //         return "translate(" + d.x + "," + d.y + ")";
        //     });
        //
        //
        // node.append("circle")
        //     .attr("r", function(d) {
        //         return d.r;
        //     })
        //     .style("fill", function(d,i) {
        //         return "black";
        //     });

        let time_so_far = 0;
        let nodes = bubble(nodes2).descendants()

        // Circle for each node.
        const circle = vis.svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", d => d.color);

        // Ease in the circles.
        circle.transition()
            .delay((d, i) => i * 5)
            .duration(800)
            .attrTween("r", d => {
                const i = d3.interpolate(0, d.r);
                return t => d.r = i(t);
            });

        const simulation = d3.forceSimulation(nodes)
            .force("x", d => d3.forceX(d.x))
            .force("y", d => d3.forceY(d.y))
            .force("cluster", forceCluster())
            .force("collide", forceCollide())
            .alpha(.09)
            .alphaDecay(0);

        simulation.on("tick", () => {
            circle
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("fill", d => "blue");
        });

        function timer() {
            nodes.forEach(function (o, i) {
                o.timeleft -= 1;
                if (o.timeleft == 0 && o.istage < o.stages.length - 1) {
                    // Decrease count for previous group.
                    groups[o.group].cnt -= 1;
                    // Update current node to new group.
                    o.istage += 1;
                    o.group = o.stages[o.istage].grp;
                    o.timeleft = o.stages[o.istage].duration;
                    // Increment count for new group.
                    groups[o.group].cnt += 1;
                }
            });
            // Increment time.
            time_so_far += 1;
            d3.select("#timecount .cnt").text(time_so_far);
            // Update counters.
            vis.svg.selectAll('.grpcnt').text(d => groups[d].cnt);
            // Do it again.
            d3.timeout(timer, 500);
        } // @end timer()

        // Start things off after a few seconds.
        d3.timeout(timer, 2000);

        function forceCluster() {
            const strength = .15;
            let nodes;

            function force(alpha) {
                const l = alpha * strength;
                for (const d of nodes) {
                    d.vx -= (d.x) * l;
                    d.vy -= (d.y) * l;
                }
            }
            force.initialize = _ => nodes = _;

            return force;
        }

        function forceCollide() {
            const alpha = 0.2; // fixed for greater rigidity!
            const padding1 = 10; // separation between same-color nodes
            const padding2 = 50; // separation between different-color nodes
            let nodes;
            let maxRadius;

            function force() {
                const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
                for (const d of nodes) {
                    const r = d.r + maxRadius;
                    const nx1 = d.x - r, ny1 = d.y - r;
                    const nx2 = d.x + r, ny2 = d.y + r;

                    quadtree.visit((q, x1, y1, x2, y2) => {
                        if (!q.length) do {
                            if (q.data !== d) {
                                const r = d.r + q.data.r + (d.group === q.data.group ? padding1 : padding2);
                                let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
                                if (l < r) {
                                    l = (l - r) / l * alpha;
                                    d.x -= x *= l, d.y -= y *= l;
                                    q.data.x += x, q.data.y += y;
                                }
                            }
                        } while (q = q.next);
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                }
            }

            force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.r) + Math.max(padding1, padding2);

            return force;
        }
    }



}