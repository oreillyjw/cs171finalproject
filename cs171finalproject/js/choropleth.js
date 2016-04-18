/*
 http://bl.ocks.org/mbostock/3734336
 http://techslides.com/demos/d3/d3-world-map-mouse-click-zoom.html
 http://eyeseast.github.io/visible-data/2013/08/27/responsive-legends-with-d3/
 */

ChoroplethMap = function(_parentElement, _worldData, __worldNames, _dalysInfo, _dalysHash) {

  this.parentElement = _parentElement;
  this.worldData = _worldData;
  this.worldNames = __worldNames;
  this.dalysHash = _dalysHash;
  this.dalysInfo = _dalysInfo;

  this.initVis();
};

ChoroplethMap.prototype.initVis = function() {

  var vis = this;

  vis.margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  vis.width  = 960;
  vis.height = 550;
  vis.active = false;
  vis.year = '2012';
  vis.type = 'all';
  vis.legendSize = 60;
  vis.excludeColor = "gray";

  vis.colors = d3.scale.quantize()
          .range(colorbrewer.RdPu[9]);

  vis.projection = d3.geo.mollweide()
      .translate([vis.width/2, vis.height/2])
      .scale(165);

  vis.path = d3.geo.path()
      .projection(vis.projection);

  vis.svg = d3.select("#" + vis.parentElement ).append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height);

  vis.svg.append("rect")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .on("click", vis.reset);

  vis.svg.append("defs").append("path")
      .datum({type: "Sphere"})
      .attr("id", "sphere")
      .attr("d", vis.path);

  vis.svg.append("use")
      .attr("class", "fill")
      .attr("xlink:href", "#sphere");

  vis.g = vis.svg.append("g");

  var tip = d3.tip().attr('class', 'd3-tip').html(function(d){
    //tooltip-title
    var mouse = d3.mouse(vis.svg.node()).map( function(d) { return parseInt(d); } );
    $('.d3-tip.n').css({"top": (mouse[1])});
    return "<div class='tooltip-title' >"+d.name+"</div>";
  });
  /* Invoke the tip in the context of your visualization */
  vis.svg.call(tip);


  var countries = topojson.feature(vis.worldData , vis.worldData.objects.countries).features,
      i = -1,
      n = countries.length;

  countries.forEach(function(d) {
    var tryit = vis.worldNames.filter(function(n) { return d.id == n.id; })[0];
    if (typeof tryit === "undefined"){
      d.name = "Unknown";
    } else {
      d.name = tryit.name;
    }
  });

  var country = vis.g.selectAll(".country").data(countries);

  country
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", vis.path)
      .attr("fill", vis.excludeColor)
      .attr("class", "countries")
      .on("click", vis.click);

  //Show/hide tooltip
  country
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  vis.wrangleData();
};


ChoroplethMap.prototype.wrangleData = function() {
  var vis = this;

  vis.displayData = vis.dalysInfo.filter(function(value){
    return value.Year === vis.year;
  });

  vis.updateVis();
};


ChoroplethMap.prototype.updateVis = function() {
  var vis = this;

  var extent = d3.extent(vis.displayData, function(d) {
    return d[dalysMappingTitles[vis.type]];
  });

  vis.colors.domain(extent);

  var countries = vis.svg.selectAll("path.countries");

  countries
      .transition()
      .duration(1000)
      .attr("fill", function(d){
        if( vis.dalysHash[d.name] !== undefined){
          if(isNaN(vis.dalysHash[d.name][vis.year][vis.type])){
            return vis.excludeColor;
          }else{
            return vis.colors(vis.dalysHash[d.name][vis.year][vis.type]);
          }
        }else{
          return vis.excludeColor;
        }
      });
  $('#legend > .list-inline').remove();
  var legend = d3.select('#legend')
      .append('ul')
      .attr('class', 'list-inline');

  var keys = legend.selectAll('li.key')
      .data(vis.colors.range());

  keys.enter().append('li')
      .attr('class', 'key')
      .style('border-top-color', String)
      .text(function(d) {
        var r = vis.colors.invertExtent(d);
        return formatNumber(formatNumberWhole(r[0]));
      });
};


ChoroplethMap.prototype.click = function(d) {

  var countrySelected = this;

  if (choroplethMap.active === d) return choroplethMap.reset();
  console.log(choroplethMap.dalysHash[d.name]);
  if(choroplethMap.dalysHash[d.name] !== undefined){
    $('#subGraph-line').show();
    $('#no-data-message').hide();
    lineGraph.country = d.name;
    $('.linetype').remove();
    lineGraph.wrangleData();
  }else{
    $(".missing-country").text(d.name);
    $('#subGraph-line').hide();
    $('#no-data-message').show();
  }


  choroplethMap.g.selectAll(".active").classed("active", false);
  d3.select(countrySelected).classed("active", choroplethMap.active = d);

  var b = choroplethMap.path.bounds(d),
      scale = .5 / Math.max((b[1][0] - b[0][0]) / choroplethMap.width, (b[1][1] - b[0][1]) / choroplethMap.height),
      translate = -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 ;

  choroplethMap.g.transition().duration(750).attr("transform",
      "translate(" + choroplethMap.projection.translate() + ")"
      + "scale(" + scale + ")"
      + "translate(" + translate +  ")");
  choroplethMap.svg.selectAll("#sphere").transition().duration(750).attr("transform",
      "translate(" + choroplethMap.projection.translate() + ")"
      + "scale(" + scale + ")"
      + "translate(" + translate + ")");
};

ChoroplethMap.prototype.reset = function() {
  choroplethMap.g.selectAll(".active").classed("active", choroplethMap.active = false);
  choroplethMap.g.transition().duration(750).attr("transform", "");
  choroplethMap.svg.selectAll("#sphere").transition().duration(750).attr("transform", "");
};