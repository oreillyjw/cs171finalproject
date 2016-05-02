/*
 Citations:
    http://bl.ocks.org/mbostock/3734336
    http://techslides.com/demos/d3/d3-world-map-mouse-click-zoom.html
    http://eyeseast.github.io/visible-data/2013/08/27/responsive-legends-with-d3/
    http://bl.ocks.org/linssen/7352810
 */

/*
New Object Creation
*/
ChoroplethMap = function(_parentElement, _worldData, __worldNames, _dalysInfo, _dalysHash) {

  this.parentElement = _parentElement;
  this.worldData = _worldData;
  this.worldNames = __worldNames;
  this.dalysHash = _dalysHash;
  this.dalysInfo = _dalysInfo;

  this.initVis();
};

/*
 Initialize the basis Map
*/
ChoroplethMap.prototype.initVis = function() {

  var vis = this;

  vis.margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 10
  };
  vis.width  = 575;
  vis.height = 400;
  vis.active = false;
  vis.year = $("#dalys-year-radio > a.active").text();
  vis.type = 'all';
  vis.legendSize = 60;
  vis.excludeColor = "gray";

  // Setup color schema
  vis.colors = d3.scale.quantize()
          .range(colorbrewer.RdPu[8]);

  vis.projection = d3.geo.mollweide()
      .translate([vis.width/2 + 2.5, vis.height/2])
      .scale(100);

  vis.path = d3.geo.path()
      .projection(vis.projection);

  vis.svg = d3.select("#" + vis.parentElement ).append("svg")
      .attr("width", vis.width + 10)
      .attr("height", vis.height);


  $('#map').css({'width': vis.width + 18});

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
      if (vis.dalysHash[d.name]){
          return "<div class='tooltip-title' >"+d.name+"<br><b>"+dalysMappingTitles[vis.type]+": </b>"
              +formatNumber(formatNumberWhole(vis.dalysHash[d.name][vis.year][vis.type]))+"</div>";
      }else{
          return "<div class='tooltip-title' >"+d.name+"</div>";
      }
  });
  /* Invoke the tip in the context of your visualization */
  vis.svg.call(tip);


  var countries = topojson.feature(vis.worldData , vis.worldData.objects.countries).features,
      i = -1,
      n = countries.length;

  countries.forEach(function(d) {
    var thisCountry = vis.worldNames.filter(function(n) { return d.id == n.id; })[0];
    if (typeof thisCountry === "undefined"){
      d.name = "Unknown";
    } else {
      d.name = thisCountry.name;
    }
  });

  var country = vis.g.selectAll(".country").data(countries);

  country
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", vis.path)
      .attr("fill", vis.excludeColor) // Set default color
      .on("click", vis.click)
      .attr('class', function(d){
        // Create standard classes to easily find country
        return "countries " + d.name.replace(/[^a-z]/gi, '').toLowerCase();
      });

  //Show/hide tooltip
  country
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  vis.wrangleData();
};

/*
 Wrangle and reparse the data to get what is needed.
*/
ChoroplethMap.prototype.wrangleData = function() {
  var vis = this;

  vis.displayData = vis.dalysInfo.filter(function(value){
      return value.Year === vis.year // Check year of the vis
      && activeCountries.indexOf(value.Country) === -1; // Check to see what countries should be dynamically excluded
  });

  vis.updateVis();
};

/*
  Updated the visualization of the map
*/
ChoroplethMap.prototype.updateVis = function() {
  var vis = this;

  var extent = d3.extent(vis.displayData, function(d) {
    return d[dalysMappingTitles[vis.type]];
  });

  if( vis.type === 'lifeexpectancy'){
    vis.colors.domain(extent);
  }else{
    vis.colors.domain([Math.floor(extent[0]/1000)*1000,Math.ceil(extent[1]/1000)*1000]); // round the numbers
  }

  var countries = vis.svg.selectAll("path.countries");

  //Setup what color each country should be
  countries
      .transition()
      .duration(1000)
      .attr("fill", function(d){
        if( vis.dalysHash[d.name] !== undefined && activeCountries.indexOf(d.name) === -1){
          if(isNaN(vis.dalysHash[d.name][vis.year][vis.type])){
            return vis.excludeColor;
          }else{
            return vis.colors(vis.dalysHash[d.name][vis.year][vis.type]);
          }
        }else{
          return vis.excludeColor;
        }
      });
  // Remove old legend
  $('#legend > .list-inline').remove();
  var legend = d3.select('#legend')
      .append('ul')
      .attr('class', 'list-inline');

  // setup new legend
  var keys = legend.selectAll('li.key')
      .data(vis.colors.range());

  keys.enter().append('li')
      .attr('class', 'key')
      .style('border-top-color', String)
      .append("div")
      .attr('class', 'text')
      .text(function(d) {
        var r = vis.colors.invertExtent(d);
        return formatNumber(formatNumberWhole(r[0]));
      });
};

/*
  When a country is clicked on zoom into that country.
  And trigger and update all other views
*/
ChoroplethMap.prototype.click = function(d) {

  var countrySelected = this;

  if (choroplethMap.active === d) return choroplethMap.reset();

  if(choroplethMap.dalysHash[d.name] !== undefined){
      if(lineGraphType === "Graph" ){
          $('#subGraph-line, #dalys-linegraph-radio').show();
      }else{
          $('#subGraph-table, #dalys-linegraph-radio').show();
      }

      $('#no-data-message').hide();
      // Dispaly correct country in the lineGraph
      lineGraph.country = d.name;
      $('.linetype').remove();
      lineGraph.wrangleData();

      // Reset the Scatter plot Matrix
      if(scatterMatrix.brushEnabled ){
          scatterMatrix.brush.clear();
      }

      // highlight the selected Country and set hidden or fade out the none selected country
      scatterMatrix.svg.selectAll("circle").classed("hidden",function(k){
          return k.Country !== d.name;
      });

      scatterMatrix.svg.selectAll("circle").classed("highlight",function(k){
          return k.Country === d.name;
      });

  }else{
      // Country does not have
      $(".missing-country").text(d.name);
      if(lineGraphType === "Graph" ){
          $('#subGraph-line, #dalys-linegraph-radio').hide();
      }else{
          $('#subGraph-table, #dalys-linegraph-radio').hide();
      }
      $('#no-data-message').show();
  }


   // Zoom into country
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

// Reset the choropleth zooming and unselect scatter plot matrix
ChoroplethMap.prototype.reset = function() {
    choroplethMap.g.selectAll(".active").classed("active", choroplethMap.active = false);
    choroplethMap.g.transition().duration(750).attr("transform", "");
    choroplethMap.svg.selectAll("#sphere").transition().duration(750).attr("transform", "");
    scatterMatrix.resetSelection();
};
