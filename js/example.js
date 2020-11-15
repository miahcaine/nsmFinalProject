/******** Designer Maria Schwarz ********/


Casualties = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    //console.log(_data);

    // -------------------------------------------------------------------------
    // Initialize :)
    // -------------------------------------------------------------------------
    this.initVis();
}

Casualties.prototype.initVis = function(){
    var vis = this;

    // -------------------------------------------------------------------------
    // SVG Drawing area
    // -------------------------------------------------------------------------

    vis.margin = {top: 10, right: 20, bottom: 30, left: 20};
    vis.width = $("#"+vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = d3.min([650, $(window).height()-200 - vis.margin.top - vis.margin.bottom]);

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.color = d3.scale.quantize()
        .range(["#156b87", "#876315", "#543510", "#872815"])
        .domain(d3.extent([1,2]));

    // -------------------------------------------------------------------------
    // Initialize jitter for circle sizes
    // -------------------------------------------------------------------------

    vis.jitter = 0.6; // This will make sure that events happening in the same location will not overlap completely
    vis.normaldist = d3.random.normal(0,1);


    // -------------------------------------------------------------------------
    // Initialize Tooltip
    // -------------------------------------------------------------------------


    vis.tooltip = {
        element: null,
        init: function() {
            this.element = d3.select('body').append("div").attr("class", "ca_tooltip tooltip").style("opacity", 0);},
        show: function(t) {
            this.element.html(t).transition().duration(100).style("left", (d3.event.pageX + 20) + "px").style("top", (d3.event.pageY - 20) + "px").style("opacity", .9);},
        move: function() {
            this.element.transition().duration(30).ease("linear").style("left", (d3.event.pageX + 20) + "px").style("top", (d3.event.pageY - 20) + "px").style("opacity", .9);},
        hide: function() {
            this.element.transition().duration(100).style("opacity", 0)}};

    vis.tooltip.init();


    // -------------------------------------------------------------------------
    // Initialize pack layout
    // -------------------------------------------------------------------------

    vis.pack = d3.layout.pack()
        .sort(null)
        .size([vis.width, vis.height])
        .value(function(d){return 1+Math.abs((vis.jitter/2)*vis.normaldist());})
        .padding(1.5);


    vis.casualties = vis.svg.selectAll(".classall")
        //.data(vis.pack.nodes({children: vis.data}).slice(1), function(d){return d[""];})
        .data(vis.pack.nodes({children: vis.data}).slice(1), function(d){return d.id})
        .enter().append("circle")
        .attr("r", function(d) {return d.r; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        //.style("fill", function(d) { return vis.color(d.radius); })
        .attr("class", function(d){
            return "class"+ d.sex+" class"+ d.gender+" class"+ d.age+" class"+ d.allpeople+" class"+ d.deathcause ;
        })
        .attr("fill", "darkgrey")
        .attr("stroke", "darkgrey")
        .attr("stroke-width", "0.5")
        .attr("id", function(d, i) { return "c" + d.id; })
        .attr("rInit", function(d, i) { return d.r })
        .attr("strokeInit", function(d, i) { return "darkgrey" })
        .attr("fillInit", function(d, i) { return "darkgrey" });

    vis.casualties
        .on('mouseover', function (d,i) {
            this.parentNode.appendChild(this);
            if (!d.children) {
                //tipCirclePack.show(d)
                var selectedCircle = d3.select("#c" + d.id);
                selectedCircle
                    .attr("stroke", "white")
                    .transition().duration(50)
                    .attr("r", selectedCircle.attr("rInit") * 2)
                    .attr("fill", function(){return d3.rgb(selectedCircle.attr("fillInit")).darker(1);})
                    .attr("opacity" , 0.8);
            }
            vis.tooltip.show(function(){
                return "<p style='font-size: 1.2em;'><strong>"+ d.name+"</strong></p>" +
                    "<table>" +
                    "<tr> <td>"+ d.age+" - " + d.gender +"</td> <td></td></tr>" +
                    "<tr> <td>Location:</td> <td>"+ d.area+"</td></tr>" +
                    "<tr> <td>Province:</td> <td>"+ d.province+"</td></tr>" +
                    "<tr> <td>Death by:</td> <td>"+ d.cause_of_death+"</td></tr>" +
                    "</table>"
           }
           );

        })
        .on("mousemove", function (d, i) {vis.tooltip.move();})
        .on('mouseout', function (d,i) {
            var selectedCircle = d3.select("#c" + d.id);
            selectedCircle.transition()
                .attr("r", selectedCircle.attr("rInit"))
                .attr("stroke", selectedCircle.attr("strokeInit") )
                .attr("fill", selectedCircle.attr("fillInit") )
                .attr("opacity", 1);
            vis.tooltip.hide();
        });




    // -------------------------------------------------------------------------
    // Colorscale
    // -------------------------------------------------------------------------
    vis.colorScale = d3.scale.ordinal();

    // -------------------------------------------------------------------------
    // Dictionary with information needed for our transitions
    // -------------------------------------------------------------------------
    vis.graphinformation = {
        sex: {
            categories: ["adultfemale", "childfemale", "childmale", "adultmale"],
            colorrange: colorbrewer["RdBu"]["4"],
            size: {
                adultmale: [vis.width,vis.height*0.89],
                adultfemale: [vis.width,vis.height*0.29],
                childmale: [vis.width,vis.height*0.27],
                childfemale: [vis.width,vis.height*0.21]
            },
            transform: {
                adultmale: [100,vis.height*(1-0.89)/2],
                adultfemale: [-220,vis.height*(1-0.29)/2-170],
                childmale: [-250,vis.height*(1-0.27)/2],
                childfemale: [-200, vis.height*(1-0.21)/2+150]
            },
            names: {
                adultfemale: "Adult - Female",
                adultmale: "Adult - Male",
                childmale: "Boy",
                childfemale: "Girl"
            },
            recenter: 0,
            count: {
                adultfemale: vis.data.filter(function(d) {return d.sex=="adultfemale";}).length,
                adultmale: vis.data.filter(function(d) {return d.sex=="adultmale";}).length,
                childmale: vis.data.filter(function(d) {return d.sex=="childmale";}).length,
                childfemale: vis.data.filter(function(d) {return d.sex=="childfemale";}).length
            }
        },
        gender: {
            categories: ["Female", "Male"],
            colorrange: ['#ef8a62', '#67a9cf'],
            size: {
                Male: [vis.width,vis.height*0.93],
                Female: [vis.width, vis.height*0.384]
            },
            transform: {
                Male: [135,vis.height*(1-0.93)/2],
                Female: [-275,vis.height*(1-0.384)/2]
            },
            names: {
                Male: "Male",
                Female: "Female"
            },
            recenter: 0,
            count: {
                Male: vis.data.filter(function(d) {return d.gender=="Male";}).length,
                Female: vis.data.filter(function(d) {return d.gender=="Female";}).length
            }
        },
        age: {
            categories: ["Adult", "Child"],
            colorrange: ['lightgrey', '#67a9cf'],
            size: {
                Adult: [vis.width,vis.height*0.93],
                Child: [vis.width, vis.height*0.384]
            },
            transform: {
                Adult: [175,vis.height*(1-0.93)/2],
                Child: [-275,vis.height*(1-0.384)/2]
            },
            names: {
                Adult: "Adult",
                Child: "Child"
            },
            recenter: 0,
            count: {
                Adult: vis.data.filter(function(d) {return d.age=="Adult";}).length,
                Child: vis.data.filter(function(d) {return d.age=="Child";}).length
            }
        },
        allpeople: {
            categories: ["all"],
            colorrange: ['lightgrey'],
            size: {
                all: [vis.width,vis.height]
            },
            transform: {
                all: [-40,0]
            },
            names: {
                all: "Everyone"
            },
            recenter: 0,
            count: {
                all: vis.data.length
            }//(vis.width)*0.2
        }
    };



    // -------------------------------------------------------------------------
    // Legend definitions
    // -------------------------------------------------------------------------
    var legenditems = ["allpeople", "gender", "age", "sex"];
    legenditems.forEach(function(v){
        var svgwidth = $("#ca_all_legend").width();
        var svgheight = 300;
        var button1svg = d3.select("#ca_"+v+"_legend").append("svg")
            .attr("width", svgwidth)
            .attr("height", svgheight);

        button1svg.selectAll(".legendcircle"+v)
            .data(vis.graphinformation[v].categories)
            .enter().append("circle")
            .attr("class", function(){return "legendcircle legendcircle"+v;})
            .attr("cx", 12)
            .attr("cy", function(d,i){return 30*i+20;})
            .attr("r", 10)
            .attr("fill", function(d,i){return vis.graphinformation[v].colorrange[i];} )
            .attr("stroke", function(d,i){return vis.graphinformation[v].colorrange[i];} )
            .attr("stroke-width", 3 )
            .attr("stroke-opacity", 1 );


        button1svg.selectAll(".legendtext"+v)
            .data(vis.graphinformation[v].categories)
            .enter().append("text")
            .attr("class",function(){return "legendtext legendtext"+v;} )
            .attr("x", 32)
            .attr("y", function(d,i){return 30*i+20+5.5;})
            .attr("fill", "black")
            .text(function(d,i){
                return vis.graphinformation[v].names[d];} );
    });

    // -------------------------------------------------------------------------
    // Select-buttons
    // -------------------------------------------------------------------------
    vis.counter=1;
    vis.selectionMenu={1: "allpeople", 2: "gender", 3: "sex", 4: "age", 5:"deathcause"};

    $('#ca_buttons').hide();
    $('.ca_legend').hide();
    $('#ca_back').hide();
    $('#ca_forward').hide();
    $('#ca_startover').hide();

    $('#ca_forward').on('click', function(){
       vis.counter = vis.counter+1;
        vis.selectedValue = vis.selectionMenu[vis.counter];
        /*if (vis.counter==2) {$('#ca_back').show();}
        else {};*/
        if (vis.counter>4){
            $('#ca_forward').hide();
            $('#ca_'+vis.selectedValue+"_legend").show();}
        vis.updateVis();
    });

    $('.ca_button').on('click', function(){
        var panelId = $(this).attr('data-panelid');
        if (panelId != "ca_deathcause_legend"){
            $('.ca_legend').hide();
            $('#'+panelId).show();}
        vis.selectedValue = $(this).attr('selected_value');

        $(".ca_button").removeClass('selected');
        $(this).attr('class', 'btn btn-default ca_button selected');

        vis.updateVis();
    });

    $('#clicker2').on("click", function(){
        if (casualties.scrollcounter==0){
            casualties.scrollcounter +=1;
            casualties.updateVis();
            $('#clicker2').hide();
        }
    });

    $('#ca_startover').on("click", function(){
        vis.svg.selectAll('.narratives').transition().remove();
        vis.counter=1;
        vis.selectedValue=vis.selectionMenu[vis.counter];
        d3.select('#ca_startover').classed("lower", false);
        vis.updateVis();
        $('#ca_startover').hide();
        $('#ca_forward').hide();
        $('#ca_buttons').hide();
        $('.ca_legend').hide();
    });

    // -------------------------------------------------------------------------
    // Update vis
    // -------------------------------------------------------------------------
    vis.selectedValue=vis.selectionMenu[vis.counter];
    //vis.updateVis();
};


Casualties.prototype.updateVis = function(){
    var vis = this;

    //vis.selectedValue="deathcause";

    // -------------------------------------------------------------------------
    // Update pattern for dots (two cases: bar chart for death causes / clouds for other categ.)
    // -------------------------------------------------------------------------

    if (vis.selectedValue!="deathcause"){

        if (window.innerWidth < 1300){
            var recenter = 40;
        }
        else{
            var recenter=0;
        }

        d3.selectAll(".deathcauseaxis").remove();
        d3.selectAll(".ca_label").remove();
        //vis.selectedValue= "sex";
        var categories = vis.graphinformation[vis.selectedValue].categories;
        var colors = vis.graphinformation[vis.selectedValue].colorrange;
        var graphsize = vis.graphinformation[vis.selectedValue].size;

        if (vis.counter==1){
            var translation = {all: [vis.width*0.2,0]};
        }
        else {
            var translation = vis.graphinformation[vis.selectedValue].transform;
        }

        //var recenter = vis.graphinformation[vis.selectedValue].recenter;

        vis.colorScale.domain(categories).range(colors);

        categories.forEach(function(v){
            vis.pack.size(graphsize[v]);

            vis.svg.selectAll(".class"+v)
                .data(vis.pack.nodes({children: vis.data.filter(function(d){return d[vis.selectedValue]==v})}).slice(1), function(d){return d.id})
                .attr("fill", function(){return vis.colorScale(v)})
                .attr("stroke", function(){return vis.colorScale(v)})
                .transition()
                .duration(2500)
                .attr("r", function(d) {return d.r; })
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("transform", function(){return "translate("+(translation[v][0]+recenter)+","+translation[v][1]+")";})
                .attr("rInit", function(d, i) { return d.r })
                .attr("strokeInit", function(d, i) { return vis.colorScale(v)})
                .attr("fillInit", function(d, i) { return vis.colorScale(v)});

        });

        setTimeout(function(){
            d3.selectAll(".deathcauseaxis").remove();
            d3.selectAll(".ca_labels").remove();
        },2501);



    }
    else {
        var categories = ["Shooting", "Warplaneshelling", "Shelling", "Explosion", "KidnappingTortureExecution", "DetentionTortureExecution", "Other"];
        var categorynames1 = ["Shooting", "Warplane", "Shelling", "Explosion", "Kidnapping/", "Detention/", "Other"];
        var categorynames2 = ["", "Shelling", "", "", "Torture", "Torture", ""];

        // Change here!
        vis.radius = 1.5;
        vis.rowlength = 25;

        if (window.innerWidth < 1300){
            vis.xScaleSmall = d3.scale.linear().range([0,80]).domain([0,vis.rowlength-1]);
            var recenter = 100;
        }
        else{
            vis.xScaleSmall = d3.scale.linear().range([0,110]).domain([0,vis.rowlength-1]);
        }

        // Change here!
        vis.xScaleLarge=d3.scale.ordinal().rangePoints([0,vis.width-110]).domain(categories);
        vis.yScale= d3.scale.linear().range([vis.height-25,50]).domain([0,2800/vis.rowlength]);


        vis.labels = vis.svg.selectAll('.deathcauseaxis1').data(categories)
            .enter().append("text")
            .transition()
            .delay(2500)
            .attr("class", "x axis deathcauseaxis deathcauseaxis1")
            .attr("x", function(d){return vis.xScaleLarge(d)+ (vis.xScaleSmall.range()[1])/2;})
            .attr("y", vis.height-5)
            .attr("text-anchor", "middle")
            .text(function(d,i){return categorynames1[i];});

        vis.labels = vis.svg.selectAll('.deathcauseaxis2').data(categories)
            .enter().append("text")
            .transition()
            .delay(2500)
            .attr("class", "x axis deathcauseaxis deathcauseaxis2")
            .attr("x", function(d){return vis.xScaleLarge(d)+ (vis.xScaleSmall.range()[1])/2;})
            .attr("y", vis.height+12)
            .attr("text-anchor", "middle")
            .text(function(d,i){return categorynames2[i];});

        categories.forEach(function(v){
            vis.dots = vis.svg.selectAll(".class"+v)
                .data(vis.data.filter(function(d){return d[vis.selectedValue]==v}), function(d){return d.id});

            vis.dots
                .enter().append("circle")
                .attr("class", function(d){return "class"+ d.sex+" class"+ d.gender+" class"+ d.age+" class"+ d.allpeople+" class"+ d.deathcause;})
                .attr("fill", "darkgrey")
                .attr("stroke", "darkgrey")
                .attr("stroke-width", "0.5")
                .attr("id", function(d, i) { return "c" + d.id; })
                .attr("strokeInit", function(d, i) { return "darkgrey" })
                .attr("fillInit", function(d, i) { return "darkgrey" })
                .attr("transform", "translate(0,0)");

            vis.dots
                .attr("rInit", function(d, i) { return 2 })
                .transition()
                .duration(2500)
                .attr("r", function() {return vis.radius})
                .attr("cx", function(d,i) { return vis.xScaleLarge(v)+vis.xScaleSmall((i)-(Math.floor((i)/vis.rowlength)*vis.rowlength)); })
                .attr("cy", function(d,i) { return vis.yScale(Math.floor((i)/vis.rowlength)); })
                .attr("transform", "translate(0,0)");

            vis.svg.selectAll(".ca_labels"+v)
                .data([vis.data.filter(function(d){return d[vis.selectedValue]==v}).length])
                .enter().append("text")
                .transition()
                .delay(2500)
                .attr("fill", "white")
                //.attr("stroke", function(){return vis.colorScale(v)})
                .attr("class", function(){return "x axis deathcauseaxis deathcauselabels ca_labels ca_labels"+v;})
                //.transition()
                //.duration(2500)
                .attr("x", function(d){
                    return vis.xScaleLarge(v)+ (vis.xScaleSmall.range()[1])/2;})
                .attr("y", function(d){return vis.yScale(Math.floor((d)/vis.rowlength))-(vis.rowlength-5);} )
                .attr("text-anchor", "middle")
                .text(function(d,i){return d3.format(',d')(d);});
        });
    }


    // -------------------------------------------------------------------------
    // Storytelling elements
    // -------------------------------------------------------------------------

    var delay = 4000;
    if (vis.counter==1){
        setTimeout(function(){
            vis.labels = vis.svg
                .append("text")
                .attr("class", "narratives narrativessmall narratives1")
                .attr("x", function(d){return vis.width*0.25 + recenter })
                .attr("y", vis.height/2-90)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "From January to May 2016,";});

            vis.labels = vis.svg
                .append("text")
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function(d){return vis.width*0.25+ recenter })
                .attr("y", vis.height/2-30)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "at least " + d3.format(',d')(vis.graphinformation.allpeople.count.all)+ " people";});

            vis.labels = vis.svg
                .append("text")
                .attr("class", "narratives narrativesnbig narratives1")
                .attr("x", function(d){return vis.width*0.25 + recenter})
                .attr("y", vis.height/2+30)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "have lost their lives";});

            vis.labels = vis.svg
                .append("text")
                .attr("class", "narratives narrativesnbig narratives1")
                .attr("x", function(d){return vis.width*0.25+ recenter })
                .attr("y", vis.height/2+90)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "during the conflict.";});
        }, 2000);

        setTimeout(function(){
            vis.svg.selectAll('.narratives1').transition().remove();
            vis.labels = vis.svg
                .append("text")
                .transition()
                .delay(500)
                .attr("class", "narratives narrativessmall narratives2")
                .attr("x", function(d){return vis.width*0.25+ recenter })
                .attr("y", vis.height/2-30)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "Each dot represents";});
            vis.labels = vis.svg
                .append("text")
                .transition()
                .delay(500)
                .attr("class", "narratives narrativessmall narratives2")
                .attr("x", function(d){return vis.width*0.25+ recenter })
                .attr("y", vis.height/2+30)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "a life lost in 2016.";});
        }, 2*delay);

        setTimeout(function(){
            vis.svg.selectAll('.narratives2').transition().remove();
            vis.labels = vis.svg
                .append("text")
                .transition()
                .delay(500)
                .attr("class", "narratives narrativessmall narratives3")
                .attr("x", function(d){return vis.width*0.25 + recenter})
                .attr("y", vis.height/2-60)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "Hover over the dots";});
            vis.labels = vis.svg
                .append("text")
                .transition()
                .delay(500)
                .attr("class", "narratives narrativessmall narratives3")
                .attr("x", function(d){return vis.width*0.25+ recenter })
                .attr("y", vis.height/2+0)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "to learn more";});
            vis.labels = vis.svg
                .append("text")
                .transition()
                .delay(500)
                .attr("class", "narratives narrativessmall narratives3")
                .attr("x", function(d){return vis.width*0.25 + recenter})
                .attr("y", vis.height/2+60)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "about the person";});
        }, 3*(delay));

        setTimeout(function(){
            vis.svg.selectAll('.narratives3').transition().remove();
            vis.labels = vis.svg
                .append("text")
                .transition()
                .delay(500)
                .attr("class", "narratives narrativessmall narratives4")
                .attr("x", function(d){return vis.width*0.25-50 + recenter})
                .attr("y", vis.height/2-30)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "or click on the button.";});
            vis.labels = vis.svg
                .append("text")
                .transition()
                .delay(500)
                .attr("class", "narratives narrativessmall narratives4")
                .attr("x", function(d){return vis.width*0.25-50 + recenter})
                .attr("y", vis.height/2+30)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "to the right to proceed.";});
        }, 4*(delay));

        setTimeout(function(){
            vis.svg.selectAll('.narratives').transition().remove();
            $('#ca_forward').show();
            $('#ca_startover').show();
        }, 5*(delay))
    }

    else if (vis.counter==2){
        vis.svg.selectAll('.narratives').transition().remove();
        $('#ca_forward').hide();
        $('#ca_startover').hide();

        setTimeout(function(){
            vis.labels = vis.svg
                .append("text")
                .transition()
                .attr("class", "narratives narrativessmall narratives1")
                .attr("x", function(d){return vis.width/2 + 155+ recenter})
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .text(function(d,i){return d3.format(',d')(vis.graphinformation.gender.count.Male)+ " of the victims were male";});
        }, 2000);

        setTimeout(function(){
            // Female
            vis.labels = vis.svg
                .append("text")
                .transition().delay(0)
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function(d){return vis.width/2 -275 + recenter})
                .attr("y", vis.height/2+150)
                .attr("text-anchor", "middle")
                .text(function(d,i){return d3.format(',d')(vis.graphinformation.gender.count.Female)+ " were female";});

            setTimeout(function(){
                $('#ca_forward').show();
                $('#ca_startover').show();
            },500);


        }, 3500);
    }

    else if (vis.counter==3) {
        vis.svg.selectAll('.narratives').transition().remove();
        $('#ca_forward').hide();
        $('#ca_startover').hide();

        setTimeout(function () {
            // Adult male
            vis.labels = vis.svg
                .append("text")
                .transition()
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function (d) {return vis.width / 2 + 100+ recenter})
                //.attr("y", vis.height / 2)
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .text(function (d, i) {
                    return d3.format(',d')(vis.graphinformation.sex.count.adultmale)+ " men";
                });
        },2000);

        setTimeout(function(){
            // Adult female
            vis.labels = vis.svg
                .append("text")
                .transition()
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function (d) {
                    return vis.width / 2 + -370 + recenter
                })
                .attr("y", vis.height / 2 - 170)
                .attr("text-anchor", "middle")
                .text(function (d, i) {
                    return d3.format(',d')(vis.graphinformation.sex.count.adultfemale)+ " women";
                });
        }, 3000);

        setTimeout(function(){
            // Boys
            vis.labels = vis.svg
                .append("text")
                .transition()
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function (d) {
                    return vis.width / 2 - 370 + recenter
                })
                .attr("y", vis.height / 2)
                .attr("text-anchor", "middle")
                .text(function (d, i) {
                    return d3.format(',d')(vis.graphinformation.sex.count.childmale)+ " boys";
                });
        },4000);


        setTimeout(function(){
            // Girls
            vis.labels = vis.svg
                .append("text")
                .transition()
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function (d) {
                    return vis.width / 2 - 300+ recenter
                })
                .attr("y", vis.height / 2 + 150)
                .attr("text-anchor", "middle")
                .text(function (d, i) {
                    return d3.format(',d')(vis.graphinformation.sex.count.childfemale)+ " girls";
                });
            setTimeout(function(){
                $('#ca_forward').show();
                $('#ca_startover').show();
            },1000);
        },5000);
    }

    else if (vis.counter==4){
        vis.svg.selectAll('.narratives').transition().remove();
        $('#ca_forward').hide();
        $('#ca_startover').hide();

        setTimeout(function(){
            // Adults
            vis.labels = vis.svg
                .append("text")
                .transition()
                .duration(2000)
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function(d){return vis.width/2 + 175 + recenter})
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .text(function(d,i){return d3.format(',d')(vis.graphinformation.age.count.Adult)+ " adults";});},3000);

        setTimeout(function(){
            // Children
            vis.labels = vis.svg
                .append("text")
                .transition()
                .duration(2000)
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function(d){return vis.width/2 -275 + recenter})
                .attr("y", vis.height/2 - 120)
                .attr("text-anchor", "middle")
                .text(function(d,i){return d3.format(',d')(vis.graphinformation.age.count.Child)+ " children" +
                    "";})
            setTimeout(function(){
                $('#ca_forward').show();
                $('#ca_startover').show();
            },1000);
        }, 3500);

    }



    else if(vis.counter==5){
        vis.svg.selectAll('.narratives').transition().remove();

        $('#ca_startover').hide();

        setTimeout(function(){
            // Children
            vis.labels = vis.svg
                .append("text")
                .transition()
                .duration(1000)
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function(d){return vis.width/2 +205})
                .attr("y", vis.height/2-150)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "The majority of child victims";});

            vis.labels = vis.svg
                .append("text")
                .transition()
                .duration(1000)
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function(d){return vis.width/2 +205})
                .attr("y", vis.height/2-100)
                .attr("text-anchor", "middle")
                .text(function(d,i){return "have been caused through shelling";});

            vis.labels = vis.svg
                .append("text")
                .transition()
                .duration(1000)
                .attr("class", "narratives narrativesbig narratives1")
                .attr("x", function(d){return vis.width/2 +205 })
                .attr("y", vis.height/2-50 )
                .attr("text-anchor", "middle")
                .text(function(d,i){return "and warplane shelling";});
        },2000);

        setTimeout(function(){
            vis.svg.selectAll('.narratives').transition().remove();
            $('#ca_buttons').show();
            $('#ca_age_legend').show();
            d3.select('#ca_startover').classed("lower", true);
            $('#ca_startover').show();

            //$('#ca_age').attr('class', 'btn btn-default ca_button selected');
        },6000);

        vis.counter +=1;
    }

    else {vis.svg.selectAll('.narratives').transition().remove();}
};
