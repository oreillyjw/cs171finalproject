/*
 https://bl.ocks.org/mbostock/4063663
 http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
*/

ScatterMatrix = function(_parentElement, _countryDalysInfo, _countryDalysHash, _regionDalysInfo, _regionsDalysHash, _lifeExpectancy ) {

    this.parentElement = _parentElement;
    this.countryDalysInfo = _countryDalysInfo;
    this.countryDalysHash = _countryDalysHash;
    this.regionDalysInfo = _regionDalysInfo;
    this.regionsDalysHash = _regionsDalysHash;
    this.lifeExpectancy = _lifeExpectancy;

    this.initVis();
};

ScatterMatrix.prototype.initVis = function() {

    var vis = this;
    vis.brushCell;
    vis.brushEnabled = false;
    vis.margin = {
        top: 0,
        right: 0,
        bottom: 80,
        left: 90
    };

    vis.displayOutliers = false;

    vis.year = $("#dalys-year-radio > a.active").text();

    vis.columnsToDisplay  = [ 'Country', 'Europe and Central Asia','High Income'];
    // 'Latin America and Caribbean','Middle East and North Africa', 'South Asia', 'Sub-Saharan Africa', 'World']
    vis.infoToDisplay = ['Noncommunicable diseases','Injuries','All Causes','Communicable & other Group I'
        , 'Life Expectancy'
        ,'Total expenditure on health as a percentage of gross domestic product'
        //, 'DateYear'
    ];
    vis.axisLabels = {
        'Total expenditure on health as a percentage of gross domestic product' : 'Health Expenditure ²',
        'Life Expectancy' : 'Life Expectancy',
        'Communicable & other Group I' : 'Communicable',
        'All Causes' : 'All Causes',
        'Injuries' : 'Injuries',
        'Noncommunicable diseases' : 'Noncommunicable'
    };

    vis.padding = 19.5;//60
    vis.width = 1000;
    vis.size = 125;

    vis.xtime = d3.time.scale()
        .range([vis.padding / 2, vis.size - vis.padding / 2]);

    vis.x = d3.scale.linear()
        .range([vis.padding / 2, vis.size - vis.padding / 2]);

    vis.ytime = d3.time.scale()
        .range([vis.padding / 2, vis.size - vis.padding / 2]);

    vis.y = d3.scale.linear()
        .range([vis.size - vis.padding / 2, vis.padding / 2]);

    vis.xAxistime = d3.svg.axis()
        .scale(vis.xtime)
        .orient("bottom")
        .ticks(2);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .ticks(4);

    vis.yAxistime = d3.svg.axis()
        .scale(vis.ytime)
        .orient("left")
        .ticks(2);

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left")
        .ticks(5);



    vis.wrangleData();
};

ScatterMatrix.prototype.wrangleData = function() {
    var vis = this;

    if ( vis.brushEnabled ){
        vis.brush = d3.svg.brush()
            .x(vis.x)
            .y(vis.y)
            .on("brushstart", vis.brushstart)
            .on("brush", function(p){
                vis.brushmove(vis,p);
            })
            .on("brushend", function(p){
                vis.brushend(vis);
            });
    }

    vis.displayDataHash = vis.countryDalysInfo.filter(function(value){
        if ( vis.displayOutliers ){
            return value.Year === vis.year;
        }else{
            return value.Year === vis.year
                && activeCountries.indexOf(value.Country) === -1;
        }

    });

    vis.displayData = {};
    vis.displayDataHash.forEach(function(d){
            for(var key in d) {
                if (vis.displayData[key] === undefined) {
                    vis.displayData[key] = [];
                }
                vis.displayData[key].push(d[key]);
            }
        }
    );
    if ( vis.brushEnabled ) {
        vis.brush.clear();
    }

    vis.updateVis();
};



ScatterMatrix.prototype.updateVis = function() {
    var vis = this;

    vis.n = vis.infoToDisplay.length;

    vis.displayValuesX = d3.extent(vis.displayDataHash, function(d) {return d.DateYear; });


    vis.xAxis
        .tickSize(vis.size * vis.n);

    vis.xAxistime
        .tickSize(vis.size * vis.n)
        .tickFormat(d3.time.format("%Y"))
        .tickValues(vis.displayValuesX);

    vis.yAxis.tickSize(-vis.size * vis.n);


    vis.yAxistime.tickSize(-vis.size * vis.n)
        .tickFormat(d3.time.format("%Y"))
        .tickValues(vis.displayValuesX);

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.size * vis.n + vis.padding + 10 + vis.margin.left)
        .attr("height", vis.size * vis.n + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.padding / 2 + ")");


    vis.svg.selectAll(".x.axis")
        .data(vis.infoToDisplay)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) {

            return "translate(" + (vis.n - i - 1) * vis.size + ",0)"; })
        .each(function(d) {
            if ( d === "DateYear"){
                vis.xtime.domain(d3.extent(vis.displayData[d]));
                d3.select(this).call(vis.xAxistime);
            }else{
                vis.x.domain(d3.extent(vis.displayData[d]));
                d3.select(this).call(vis.xAxis)
                .selectAll("text")
                .attr("dx", "55em")
                .attr("dy", "-7em")
                .attr("y", "608")
                    .attr('text-anchor', 'end')
                .attr("transform", "rotate(45)" )
                ;
            }
        })
        .append("text")
        .attr("transform", "translate("+((vis.padding * 2) + 25)+","+((vis.size * vis.n) + vis.margin.bottom -vis.padding)+")")
        .attr("class", "x-axis axis-title")
        .style("text-anchor", "middle")
        .text(function(d){
            return vis.axisLabels[d];
        })
        .style("font-size", "12px");


    vis.svg.selectAll(".y.axis")
        .data(vis.infoToDisplay)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * vis.size + ")"; })
        .each(function(d) {
            if ( d === "DateYear"){
                vis.ytime.domain(d3.extent(vis.displayData[d]));
                d3.select(this).call(vis.yAxistime);
            }else{
                vis.y.domain(d3.extent(vis.displayData[d]));
                d3.select(this).call(vis.yAxis);
            }

        })
        .append("text")
        .attr("transform", "translate(-46,60), rotate(-90)")
        .attr("class", "y-axis axis-title")
        .style("text-anchor", "middle")
        .text(function(d){
            return vis.axisLabels[d];
        })
        .style("font-size", "12px");


    vis.tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    vis.cell = vis.svg.selectAll(".cell")
        .data(vis.cross(vis.infoToDisplay, vis.infoToDisplay))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) {
            return "translate(" +(vis.n - d.i - 1) * vis.size + "," +
                d.j * vis.size   + ")"; })
        .each(function(p){ return vis.plot(this,p); });

    //// Titles for the diagonal.
    vis.cell.filter(function(d) {
        return d.i === 0 || d.j === 0; }).append("text")
        .attr("x", vis.padding)
        .attr("y", vis.padding)
        .attr("dy", ".71em");

    if ( vis.brushEnabled ){
        vis.cell.call(vis.brush);
    }


};

ScatterMatrix.prototype.plot = function(that, p) {

    var cell = d3.select(that),
        vis = this;

    if ( p.x === "DateYear"){
        vis.xtime.domain(d3.extent(vis.displayData[p.x]));
    }else{
        vis.x.domain(d3.extent(vis.displayData[p.x]));
    }

    if ( p.y === "DateYear"){
        vis.ytime.domain(d3.extent(vis.displayData[p.y]));
    }else{
        vis.y.domain(d3.extent(vis.displayData[p.y]));
    }


    cell.append("rect")
        .attr("class", "frame")
        .attr("x", vis.padding / 2)
        .attr("y", vis.padding / 2)
        .attr("width", vis.size - vis.padding)
        .attr("height", vis.size - vis.padding);

    cell.selectAll("circle")
        .data(vis.displayDataHash)
        .enter().append("circle")
        .attr("cx", function(d) {
            if ( d[p.y] != undefined && d[p.x] != undefined ){
                if (p.x === "DateYear") {
                    return vis.xtime(d[p.x]);
                } else {
                    return vis.x(d[p.x]);
                }
            }
        })
        .attr("cy", function(d) {
            if ( d[p.y] != undefined && d[p.x] != undefined ){

                    if (p.y === "DateYear") {
                        return vis.ytime(d[p.y]);
                    } else {
                        return vis.y(d[p.y]);
                    }
            }
        })
        .attr("r", 3)
        .style("fill", function(d) {
            if ( d[p.y] != undefined && d[p.x] != undefined  ) {
                return color(p.x);
            }else{
                return 'none';
            }
        })
        .attr('class', function(d){
            return d.Country.replace(/[^a-z]/gi, '').toLowerCase() + " " +
                p.x.replace(/[^a-z]/gi, '').toLowerCase() + "-1 " +
                p.y.replace(/[^a-z]/gi, '').toLowerCase() + "-1";
        })
        .on('mouseover', function(d){
            vis.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            vis.tooltip.html(
                "<div><b>Country:</b> "+ d.Country +"</div>"
                +"<div><b>Year:</b> "+ d.Year +"</div>"
                +"<div><b>"+ p.x +":</b> "+ formatNumber(formatNumberWhole(d[p.x])) +"</div>"
                +"<div><b>"+ p.y +":</b> "+ formatNumber(formatNumberWhole(d[p.y])) +"</div>"
                )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 28) + "px");
        })
        .on('mouseout', function(d){
            vis.tooltip.transition()
                .duration(500)
                .style("opacity", 0)
        })
        .on('click', function(d){
            var country = d.Country.replace(/[^a-z]/gi, '').toLowerCase();
            $('#map .'+country).d3Click();
        });

};

ScatterMatrix.prototype.cross = function(a, b) {
    var vis = this;
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
};

ScatterMatrix.prototype.brushstart = function(p) {
    var vis = this;

    scatterMatrix.svg.selectAll(".highlight").classed("highlight", false);

    if (scatterMatrix.brushCell !== vis) {
        scatterMatrix.brush.clear();
        d3.select(scatterMatrix.brushCell).call(scatterMatrix.brush.clear());
        if ( p.x === "DateYear"){
            scatterMatrix.xtime.domain(d3.extent(scatterMatrix.displayData[p.x]));
        }else{
            scatterMatrix.x.domain(d3.extent(scatterMatrix.displayData[p.x]));
        }

        if ( p.y === "DateYear"){
            scatterMatrix.ytime.domain(d3.extent(scatterMatrix.displayData[p.y]));
        }else{
            scatterMatrix.y.domain(d3.extent(scatterMatrix.displayData[p.y]));
        }
        scatterMatrix.brushCell = vis;
    }
};

// Highlight the selected circles.
ScatterMatrix.prototype.brushmove = function(vis,p) {
    var that = this;
    var e = vis.brush.extent();
    vis.svg.selectAll("circle").classed("hidden", function(d) {
        return e[0][0] > d[p.x] || d[p.x] > e[1][0]
            || e[0][1] > d[p.y] || d[p.y] > e[1][1];
    });
};

// If the brush is empty, select all circles.
ScatterMatrix.prototype.brushend = function(vis) {
    var that = this;
    if (vis.brush.empty()) vis.svg.selectAll(".hidden").classed("hidden", false);
};

ScatterMatrix.prototype.resetSelection = function(){
    var vis = this;
    vis.svg.selectAll(".hidden").classed("hidden", false);
    if ( vis.brush ){
        vis.brush.clear();
    }
};