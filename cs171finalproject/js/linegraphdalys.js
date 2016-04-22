/*
 http://bl.ocks.org/ZJONSSON/3918369
 https://github.com/jay3dec/MultiLineChart_D3
 */

LineGraph = function(_parentElement, _worldData, __worldNames, _dalysInfo, _dalysHash) {

    this.parentElement = _parentElement;
    this.worldData = _worldData;
    this.worldNames = __worldNames;
    this.dalysHash = _dalysHash;
    this.dalysInfo = _dalysInfo;
    this.dalyCategoryType = 'all';
    this.country = "Afghanistan";

    this.initVis();
};


LineGraph.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 60, right: 40, bottom: 60, left: 60};
    vis.width = 250;
    vis.height = 250;
    vis.type = 'all';
    vis.allDalysDisplay = [ 'All Causes', 'Communicable & other Group I', 'Injuries', 'Noncommunicable diseases'];

    vis.svg = d3.select("#" + vis.parentElement ).append("svg")
        .attr("width", vis.width +335)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.x = d3.time.scale()
        .range([0, vis.width]);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    vis.svg.append("g")
        .attr("class", "x-axis axis axis-title")
        .attr("transform", "translate(0," + vis.height + ")")
        .append("text")
        .attr("transform", "translate("+(vis.width+10)+",30)")
        .attr("class", "x-axis axis-title")
        .style("text-anchor", "end")
        .text("YEAR")
        .style("font-size", "12px");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0,0)")
        .append("text")
        .attr("transform", "translate(5,-30)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("class", "y-axis axis-title")
        .style("text-anchor", "end");

    vis.line = d3.svg.line()
        .x( function(d){ return vis.x(d.DateYear);})
        .y(function(d){ return vis.y(d.Dalys);})
        .interpolate("basis");


    vis.wrangleData();
};

LineGraph.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = vis.dalysInfo.filter(function(value){
        return value.Country === vis.country;
    });
    vis.updateVis();
};

LineGraph.prototype.updateVis = function() {
    var vis = this;

    $("text.title").remove();
    vis.svg.append("text")
        .attr("class", "title")
        .attr("x", vis.width/2)
        .attr("y", 0 - (vis.margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size","14px")
        .text(vis.country);


    color.domain(
        d3.keys(vis.displayData[0])
            .filter(function(key) {
                console.log();
                return vis.allDalysDisplay.indexOf(key) !== -1; })
    );

    var dalys = color.domain().map(function(dalyType) {
        return {
            dalyType : dalyType,
            values: vis.displayData.map(function(d) {
                return {DateYear: d.DateYear, Dalys: d[dalyType]};
            })
        };
    });

    var displayValues = d3.extent(vis.displayData, function(d) {return d.DateYear; });

    vis.x.domain(displayValues);

    vis.y.domain([
        0, d3.max(dalys, function(c) { return d3.max(c.values, function(v) { return v.Dalys; }); })
    ]);


    var yBarAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    var xBarAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .tickValues(displayValues)
        .tickFormat(d3.time.format("%Y"));


    vis.svg.selectAll("g.x-axis")
        .transition()
        .duration(800)
        .call(xBarAxis);

    vis.svg.selectAll("g.y-axis")
        .transition()
        .duration(800)
        .call(yBarAxis)
        .selectAll("text.y-axis.axis-title")
        .text("DALYs¹")
        .style("font-size", "12px");

    vis.dataPoints = [];
    dalys.forEach(function(d){
        d.values.forEach(function(k){
            vis.dataPoints.push({Dalys: k.Dalys, DateYear: k.DateYear, dalyType: d.dalyType});
        });
    });

    vis.drawCircles();
    // Loop through each symbol / key
    var daly = vis.svg.selectAll(".line")
        .data(dalys)
        .attr("class", "line");

    daly.enter()
        .append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return vis.line(d.values); })
        .style("stroke-width", 3)
        .attr("data-legend",function(d) { return d.dalyType;})
        .attr("data-legend-color",function(d) { return color(d.dalyType);})
        .style("stroke", function(d) { return color(d.dalyType); })
        .attr("class", function(d) {
            return "linetype " + dalysMappingTitles[d.dalyType];
        })
        .on('mouseover', function(d){
            $("." + dalysMappingTitles[d.dalyType]).attr("class", "linetype active "+ dalysMappingTitles[d.dalyType]);
        })
        .on('mouseout', function(d){
            $("." + dalysMappingTitles[d.dalyType] ).attr("class", "linetype "+ dalysMappingTitles[d.dalyType]);
        });

    vis.drawLegend();


};

LineGraph.prototype.drawCircles = function() {
    var vis = this;

    var circles = vis.svg.selectAll("circle")
        .data(vis.dataPoints);

    circles.enter().append("circle")
        .attr("class", "tooltip-circle")
        .style("fill", function(d) { return color(d.dalyType); });

    circles
        .transition()
        .duration(550)
        .attr("cx", function(k){
            return vis.x(k.DateYear);
        })
        .transition()
        .duration(550)
        .attr("cy", function(k){
            return vis.y(k.Dalys);
        })
        .attr("r", 8)
        .attr("class", function(d) {
            return "linetype " + dalysMappingTitles[d.dalyType];
        });

    circles
        .on('mouseover', function(d){
            $("." + dalysMappingTitles[d.dalyType]).attr("class", "linetype active "+ dalysMappingTitles[d.dalyType]);
        })
        .on('mouseout', function(d){
            $("." + dalysMappingTitles[d.dalyType]).attr("class", "linetype "+ dalysMappingTitles[d.dalyType]);
        });
    circles.exit().remove();
};

LineGraph.prototype.drawLegend = function() {
    var vis = this;

    legend = vis.svg.append("g")
        .attr("class","legend")
        .attr("transform","translate("+(vis.width+35)+",0)")
        .style("font-size","12px")
        .call(d3.legend);

    legend
        .style("font-size","15px")
        .attr("data-style-padding",15)
        .call(d3.legend);
};
