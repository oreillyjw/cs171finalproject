

var sankeySort='category';

var radios = document.forms["sort-chooser"].elements["sort-chooser"];
for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function() {
        sankeySort = this.value;
        updateVisualization();
        console.log(sankeySort);
    }
}

var margin = {top: 50, right: 10, bottom: 50, left: 10},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d); },
    color2 = d3.scale.ordinal().range(["#2ca02c", "#1f77b4", "#d62728"]);

// append the svg canvas to the page
var sankey_svg_1 = d3.select("#sankey-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + (-20) + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(2)
    .size([width, height]);

var path = sankey.link();

var graph;
var colorRef;

var sankeyLookup;

//listen to user input
var sankeyYear = d3.select("#sankey-year").property("value");
var sankeyData = d3.select("#sankey-data").property("value");
var sankeyAge = d3.select("#sankey-age").property("value");
var sankeySex = d3.select("#sankey-sex").property("value");


d3.select("#sankey-age").on("change", function (d) {loadData();});
d3.select("#sankey-sex").on("change", function (d) {loadData();});
d3.select("#sankey-year").on("change", function (d) {loadData();});
d3.select("#sankey-data").on("change", function (d) {loadData();});

var link = sankey_svg_1.append("g")
    .selectAll(".link");
//Female -145
loadData();

function loadData() {
    sankeyYear = d3.select("#sankey-year").property("value");
    sankeyData = d3.select("#sankey-data").property("value");
    sankeyAge = d3.select("#sankey-age").property("value");
    sankeySex = d3.select("#sankey-sex").property("value");
    sankeySex = 'Female';
    console.log(sankeySex);
    //lookup table

    var lookup = {};
    d3.csv("data/world_by_cause_2012_paired.csv", function(error, data) {
        data.forEach(function (d) {lookup[d.target] = [d.source, d.group];});
        sankeyLookup = lookup;
    });


    d3.json("data/DALY_2000_2012/"+sankeyData, function(error, data) {

        data.fact.forEach(function (d) {
            //clean data
            d.dims.YEAR = +d.dims.YEAR;
            d.dims.AGEGROUP = d.dims.AGEGROUP.replace('  ', ' ');
            d.Value = parseInt(d.Value.replace(/,/g, ''), 10);
            // convert NAN to 0
            if (isNaN(d.Value)) {d.Value = 0;};
        });

        //filter facts
        //TODO age & Sex filter does not work
        data.fact = data.fact.filter(function(d) {return +d.dims.YEAR == +sankeyYear;});
        data.fact = data.fact.filter(function(d) {
            if (d.dims.AGEGROUP == sankeyAge) {
                console.log(d.dims.AGEGROUP, sankeyAge)}
            return d.dims.AGEGROUP == sankeyAge;
        });
        data.fact = data.fact.filter(function(d) {return d.dims.SEX == sankeySex;});

        console.log("json", data.fact);
        graph = {"nodes" : [], "links" : []};
        data.fact.forEach(function (d) {



            if (Object.keys(sankeyLookup).indexOf(d.dims.GHECAUSES) != -1 && d.Value !=0){
                graph.nodes.push({ "name": d.dims.GHECAUSES, "group": sankeyLookup[d.dims.GHECAUSES][1] });
                graph.nodes.push({ "name": sankeyLookup[d.dims.GHECAUSES][0], "group": sankeyLookup[d.dims.GHECAUSES][1] });
                graph.links.push({ "source": sankeyLookup[d.dims.GHECAUSES][0],
                    "target": d.dims.GHECAUSES,
                    "group": sankeyLookup[d.dims.GHECAUSES][1],
                    "value": d.Value });
            };
        });

        //logic: load separate hierachy lookup file, load json, filter data
        //go through each cause and cross reference hierachy lookup file to see if they are target nodes, if so push value
        //lookup table structure {target cause: [source cause, group]}

        colorRef = graph.nodes;

        // return only the distinct / unique nodes
        graph.nodes = d3.keys(d3.nest()
            .key(function (d) { return d.name; })
            .map(graph.nodes));

        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        //now loop through each nodes to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = { "name": d };
        });

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(4);

        updateVisualization();
    });

};


function updateVisualization() {

    console.log("graph", graph);
    d3.selectAll(".link").remove();
    d3.selectAll(".node").remove();

    function colorlookup(name, colorRef) {
        for (i = 0; i < colorRef.length; i++) {
            if (name == colorRef[i].name) {
                return colorRef[i].group;
                break;
            }
        }
    }

    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(4);

    console.log("214");
    d3.selectAll(".link")
        .data(graph.links)
        .exit()
        .remove();
    console.log("220");
console.log(graph.links);

    // add in the links
    link
        .data(graph.links)
        .enter().append("path")
        .attr("class", function(d){
            return "link " + d.target.name.replace(/[^a-z]/gi, '').toLowerCase();
        })
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .style("fill", function(d) {
            d.color = color2(colorlookup(d.group, colorRef));
            return d3.rgb(d.color);
        })
        .style("stroke", function(d) {
            d.color = color2(colorlookup(d.group, colorRef));
            return d3.rgb(d.color);
        })
        .style("opacity", 0.3)
        //.style("stroke-opacity", 0.3)
        //.style("fill-opacity", 0.3)
        .sort(function(a, b) { return b.dy - a.dy; })
    ;

    console.log("240");

    // add the link titles
    link.append("title")
        .text(function(d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value); });

    // add in the nodes
    var node = sankey_svg_1.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            var y = d.y,
                x  = d.x;
            if (isNaN(y)){
                y = 0;
            }
            return "translate(" + x + "," + y + ")"; })
    /*
     .call(d3.behavior.drag()
     .origin(function(d) { return d; })
     .on("dragstart", function() {
     this.parentNode.appendChild(this); })
     .on("drag", dragmove))*/
        ;

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
            return d.color = color2(colorlookup(d.name, colorRef));
        })
        .style("stroke", function(d) {
            return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) {
            return d.name + "\n" + format(d.value); });

    // add in the title for the nodes
    node.append("text")
        //only display cause text for DALY > #
        .filter(function(d){
            return d.value > d3.mean(graph.nodes, function(d) { return d.value; })/1.65;
        })
        .attr("x", -6)
        .attr("y", function(d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .style("font-size","10px") //TODO: change font size based on node size
        .attr("font-family", "sans-serif")
        .filter(function(d) {
            return d.x < width / 3;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");
}