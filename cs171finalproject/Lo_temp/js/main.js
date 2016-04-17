

var sankeySort='category';

var radios = document.forms["sort-chooser"].elements["sort-chooser"];
for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function() {
        sankeySort = this.value;
        updateVisualization();
        console.log(sankeySort);
        
        //alert(this.value);
    }
}


var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 500 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scale.category10();

// append the svg canvas to the page
var sankey_svg_1 = d3.select("#sankey-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(0)
    .size([width, height]);

var path = sankey.link();

var graph;
var colorRef;

var link = sankey_svg_1.append("g")
        .selectAll(".link");

loadData()

function loadData() {

// load the data (using the timelyportfolio csv method)
  d3.csv("world_by_cause_2012_paired.csv", function(error, data) {

    //set up graph in same style as original example but empty
    graph = {"nodes" : [], "links" : []};

      data.forEach(function (d) {
        graph.nodes.push({ "name": d.source, "group": d.group });
        graph.nodes.push({ "name": d.target, "group": d.group });
        graph.links.push({ "source": d.source,
                           "target": d.target,
                           "group": d.group,
                           "value": +d.value });
       });

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

  })
};


function updateVisualization() {

      console.log(graph);
      d3.selectAll(".link").remove();
      d3.selectAll(".node").remove();



       function colorlookup(name, colorRef) {

        for (i = 0; i < colorRef.length; i++) {
          if (name == colorRef[i].name) {
             return colorRef[i].group;
             break;
          }
        }
       };

    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(4);

      d3.selectAll(".link")
       .data(graph.links)
       .exit()
       .remove(); 
  // add in the links
    link
        .data(graph.links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .style("fill", function(d) { 
          d.color = color(colorlookup(d.group, colorRef));
          return d3.rgb(d.color); 
        })
        .style("stroke", function(d) { 
          d.color = color(colorlookup(d.group, colorRef));
          return d3.rgb(d.color); 
        })
        .style("opacity", 0.3)
        //.style("stroke-opacity", 0.3)
        //.style("fill-opacity", 0.3)
        .sort(function(a, b) { return b.dy - a.dy; })
        ;

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
        return "translate(" + d.x + "," + d.y + ")"; })
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
          return d.color = color(colorlookup(d.name, colorRef));
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
          return d.value > 30000000;
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



    //links.exit().remove();

  /*
  // the function for moving the nodes
    function dragmove(d) {
      d3.select(this).attr("transform", 
          "translate(" + d.x + "," + (
                  d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
              ) + ")");
      sankey.relayout();
      link.attr("d", path);
    }
  */  
  };