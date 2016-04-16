/*
 http://bl.ocks.org/mbostock/3734336
 http://techslides.com/demos/d3/d3-world-map-mouse-click-zoom.html
 */

// The SVG container
var width  = 960,
    height = 550,
    active,
    dalysHash = {},
    dalysInfo = [],
    dalysMappingTitles = {
      all : 'All Causes',
      communicable : 'Communicable & other Group I',
      injuries : 'Injuries',
      noncommunicable: 'Noncommunicable diseases'
    },
    excludeColor = "gray";

var colors = d3.scale.quantize()
    .range(colorbrewer.BrBG[9]);

var projection = d3.geo.mollweide()
                .translate([width/2, height/2])
                .scale(165);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");

var g = svg.append("g");

function click(d) {

  console.log(dalysHash[d.name]);

  if (active === d) return reset();
  g.selectAll(".active").classed("active", false);
  d3.select(this).classed("active", active = d);

  var b = path.bounds(d);
  g.transition().duration(750).attr("transform",
      "translate(" + projection.translate() + ")"
      + "scale(" + .75 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
      + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
  svg.selectAll("#sphere").transition().duration(750).attr("transform",
      "translate(" + projection.translate() + ")"
      + "scale(" + .75 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
      + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
}

function reset() {
  g.selectAll(".active").classed("active", active = false);
  g.transition().duration(750).attr("transform", "");
  svg.selectAll("#sphere").transition().duration(750).attr("transform", "");

}


var tip = d3.tip().attr('class', 'd3-tip').html(function(d){
  //tooltip-title
  var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
  $('.d3-tip.n').css({"top": (mouse[1])});
  //style='left:"+(mouse[0]+25)+"px;top:"+mouse[1]+"px'
  return "<div class='tooltip-title' >"+d.name+"</div>";
});
/* Invoke the tip in the context of your visualization */
svg.call(tip);

queue()
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.tsv, "data/world-country-names.tsv")
    .defer(d3.csv, "data/countrydalys.csv")
    .await(ready);

function ready(error, world, names, dalys) {

  var countries = topojson.feature(world, world.objects.countries).features,
      i = -1,
      n = countries.length;

  countries.forEach(function(d) {
    var tryit = names.filter(function(n) { return d.id == n.id; })[0];
    if (typeof tryit === "undefined"){
      d.name = "Unknown";
    } else {
      d.name = tryit.name;
    }
  });

  console.log(countries.filter(function(value){
    return value.code === "unknown";
  }));

var country = g.selectAll(".country").data(countries);

  country
   .enter()
    .append("path")
    .attr("class", "country")
      //.attr("title", function(d,i) { return d.name; })
      .attr("d", path)
      .attr("fill", excludeColor)
      .attr("class", "countries")
      .on("click", click);


    //Show/hide tooltip
  country
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  dalys.forEach(function(d) {
    //console.log(d);
    if( dalysHash[d.Country] === undefined ){
      dalysHash[d.Country] = {};
    }
    d['All Causes'] =+ d['All Causes'];
    d['Communicable & other Group I'] =+ d['Communicable & other Group I'];
    d['Injuries'] =+ d['Injuries'];
    d['Noncommunicable diseases'] =+ d['Noncommunicable diseases'];
    dalysHash[d.Country][d.Year] = {
      'all': d['All Causes'],
      'communicable': d['Communicable & other Group I'],
      'injuries': d['Injuries'],
      'noncommunicable': d['Noncommunicable diseases']
    };
  });
  dalysInfo = dalys;

  //console.log(dalysHash);
  updateChoropleth();
};

function updateChoropleth(year, type){

  if (year === undefined ){
    year = '2012';

  }

  if ( type === undefined ){
    type = 'all';
  }

  var selectedDalyInfo = dalysInfo.filter(function(value){
    return value.Year === year;
  });


  var extent = d3.extent(selectedDalyInfo, function(d) {
    return d[dalysMappingTitles[type]];
  });

  console.log(extent);
  console.log(selectedDalyInfo);


  colors.domain(extent);

  var countries = svg.selectAll("path.countries");

  countries
      .transition()
      .duration(1000)
      .attr("fill", function(d){
        if( dalysHash[d.name] !== undefined){
          if(isNaN(dalysHash[d.name][year][type])){
            return excludeColor;
          }else{
            return colors(dalysHash[d.name][year][type]);
          }
        }else{
          return excludeColor;
        }
      });
}

$('#dalys-info').on('change', function(){
  updateChoropleth('2012',$(this).val());
});