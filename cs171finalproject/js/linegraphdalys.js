/*
 http://bl.ocks.org/ZJONSSON/3918369
 https://github.com/jay3dec/MultiLineChart_D3
 */

LineGraph = function(_parentElement, _worldData, __worldNames, _dalysInfo, _dalysHash, _regionDalysInfo, _regionsDalysHash, _lifeExpectancy ) {

    this.parentElement = _parentElement;
    this.worldData = _worldData;
    this.worldNames = __worldNames;
    this.dalysHash = _dalysHash;
    this.dalysInfo = _dalysInfo;
    this.regionDalysInfo = _regionDalysInfo;
    this.regionsDalysHash = _regionsDalysHash;
    this.lifeExpectancy = _lifeExpectancy;
    this.country = "World";

    this.initVis();
};


LineGraph.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 10, bottom: 150, left: 90};
    vis.width = 350;
    vis.height = 300;
    vis.type = 'all';

    vis.allDalysDisplay = activeCategories;

    vis.svg = d3.select("#" + vis.parentElement ).append("svg")
        .attr("width", vis.width + 125)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.x = d3.time.scale()
        .range([0, vis.width]);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    vis.y2 = d3.scale.linear()
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

    vis.line2 = d3.svg.line()
        .x(function(d) { return vis.x(d.DateYear); })
        .y(function(d) { return vis.y2(d.Dalys); });

    vis.wrangleData();
};

LineGraph.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = vis.dalysInfo.filter(function(value){
        return value.Country === vis.country;
    });

    if( vis.displayData.length === 0 ){
        vis.displayData = vis.regionDalysInfo.filter(function(value){
            return value.Region === vis.country;
        });
    }

    vis.updateVis();
};

LineGraph.prototype.updateVis = function() {
    var vis = this;

    $('.y-axis2').remove();
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


    var y1Dalys = dalys.filter(function(key){
        return key.dalyType !== 'Life Expectancy';
    });

    var displayValues = d3.extent(vis.displayData, function(d) {return d.DateYear; });

    vis.x.domain(displayValues);

    vis.y.domain([
        0, d3.max(y1Dalys, function(c) { return d3.max(c.values, function(v) { return v.Dalys; }); })
    ]);

    var yBarAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    var xBarAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .tickValues(displayValues)
        .tickFormat(d3.time.format("%Y"));

    var y2Dalys = dalys.filter(function(key){
        return key.dalyType === 'Life Expectancy';
    });

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

    if ( vis.allDalysDisplay.indexOf('Life Expectancy') > -1){
        vis.svg.append("g")
            .attr("class", "y-axis2 axis age")
            .attr("transform", "translate("+vis.width+",0)")
            .append("text")
            .attr("transform", "translate(5,-30)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .attr("class", "y-axis2 axis-title age")
            .style("text-anchor", "end");

        vis.y2.domain([
            0, d3.max(y2Dalys, function(c) { return d3.max(c.values, function(v) { return v.Dalys; }); })
        ]);

        var y2BarAxis = d3.svg.axis()
            .scale(vis.y2)
            .orient("right");

        vis.svg.selectAll("g.y-axis2")
            .transition()
            .duration(800)
            .call(y2BarAxis)
            .selectAll("text.y-axis2.axis-title")
            .text("Age")
            .style("font-size", "12px");

        vis.displaySecondAxis = true;
    }else{
        vis.displaySecondAxis = false;
    }

    vis.drawCircles();
    // Loop through each symbol / key
    var daly = vis.svg.selectAll(".line")
        .data(y1Dalys)
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


    if( vis.displaySecondAxis){
        var daly2 = vis.svg.selectAll(".line")
            .data(y2Dalys)
            .attr("class", "line");

        daly2.enter().append("path")        // Add the valueline2 path.
            .attr("d", function(d) {
                return vis.line2(d.values); })
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
    }

    vis.drawLegend();
    vis.renderTable();


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
            if (k.dalyType === 'Life Expectancy'){
                return vis.y2(k.Dalys);
            }else{
                return vis.y(k.Dalys);
            }
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

    $('.legend').remove();
    legendthis = vis.svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(62.5,366)")
        .style("font-size","12px")
        .call(d3.legendthis);

    legendthis
        .style("font-size","15px")
        .attr("data-style-padding",15)
        .call(d3.legendthis)
        .attr("x",0);
};

LineGraph.prototype.renderTable = function(){
    var vis = this;

    vis.displayData.forEach(function(d){
        if (d['Region'] !== undefined ){
            $('.dalyType-location').text(d['Region'])
        }else{
            $('.dalyType-location').text(d['Country'])
        }

        for ( var key in d){
            if( dalysMappingTitles[key] !== undefined ){
                $('.dalyType-'+dalysMappingTitles[key] + '-'+d['Year']).text(formatNumber(formatNumberWhole(d[key])));
            }
        }
    });
};

