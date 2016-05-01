/*
d3.select("#stack-type").on("change", function (d) {
    stackType = d3.select("#stack-type").property("value");
    updateVisualization();
});*/


StackedArea = function(_parentElement){
    this.parentElement = _parentElement;

    this.allCategories = ['All Causes'];
    this.allAges = ['All ages (total) years'];
//there are some double spaces in original group names. They are removed in data cleaning.
    this.ageGroups = ['0-27 days','1-59 months','5-14 years','15-29 years', '30-49 years','50-69 years','60-69 years', '70+ years'];
    this.lv1 = ['Communicable & other Group I', 'Noncommunicable diseases', 'Injuries'];
    this.lv4 = ['Syphilis','Chlamydia','Gonorrhoea','Trichomoniasis','Other STDs',
        'Whooping cough','Diphtheria','Measles','Tetanus','Malaria',
        'Trypanosomiasis','Chagas disease','Schistosomiasis','Leishmaniasis',
        'Lymphatic filariasis','Onchocerciasis','Leprosy','Dengue','Trachoma',
        'Rabies','Ascariasis','Trichuriasis','Hookworm disease'];

//Causes without any lower level causes. No overlapping. Lv 4 excluded
    this.cat1 = ['Tuberculosis',
            'STDs excluding HIV',
            'HIV/AIDS',
            'Diarrhoeal diseases',
            'Childhood-cluster diseases',
            'Meningitis',
            'Encephalitis',
            'Acute hepatitis B',
            'Acute hepatitis C',
            'Parasitic and vector diseases',
            'Intestinal nematode infections',
            'Other infectious diseases',
            'Lower respiratory infections',
            'Upper respiratory infections',
            'Otitis media',
            'Maternal conditions',
            'Preterm birth complications',
            'Birth asphyxia and birth trauma',
            'Neonatal sepsis and infections',
            'Other neonatal conditions',
            'Protein-energy malnutrition',
            'Iodine deficiency',
            'Vitamin A deficiency',
            'Iron-deficiency anaemia',
            'Other nutritional deficiencies'];

    this.cat2 = ['Mouth and oropharynx cancers',
            'Oesophagus cancer',
            'Stomach cancer',
            'Colon and rectum cancers',
            'Liver cancer',
            'Pancreas cancer',
            'Trachea, bronchus, lung cancers',
            'Melanoma and other skin cancers',
            'Breast cancer',
            'Cervix uteri cancer',
            'Corpus uteri cancer',
            'Ovary cancer',
            'Prostate cancer',
            'Bladder cancer',
            'Lymphomas, multiple myeloma',
            'Leukaemia',
            'Other malignant neoplasms',
            'Other neoplasms',
            'Diabetes mellitus',
            'Endocrine, blood, immune disorders',
            'Unipolar depressive disorders',
            'Bipolar disorder',
            'Schizophrenia',
            'Alcohol use disorders',
            'Drug use disorders',
            'Anxiety disorders',
            'Eating disorders',
            'Pervasive developmental disorders',
            'Childhood behavioural disorders',
            'Idiopathic intellectual disability',
            'Other mental and behavioural disorders',
            "Alzheimer's disease and other dementias",
            "Parkinson's disease",
            'Epilepsy',
            'Multiple sclerosis',
            'Migraine',
            'Non-migraine headache',
            'Other neurological conditions',
            'Glaucoma',
            'Cataracts',
            'Refractive errors',
            'Macular degeneration',
            'Other vision loss',
            'Other hearing loss',
            'other sense organ disorders',
            'Rheumatic heart disease',
            'Hypertensive heart disease',
            'Ischaemic heart disease',
            'Stroke',
            'Cardiomyopathy, myocarditis, endocarditis',
            'Other circulatory diseases',
            'Chronic obstructive pulmonary disease',
            'Asthma',
            'Other respiratory diseases',
            'Peptic ulcer disease',
            'Cirrhosis of the liver',
            'Appendicitis',
            'Other digestive diseases',
            'Kidney diseases',
            'Hyperplasia of prostate',
            'Urolithiasis',
            'Other genitourinary diseases',
            'Infertility',
            'Gynecological diseases',
            'Skin diseases',
            'Rheumatoid arthritis',
            'Osteoarthritis',
            'Gout',
            'Back and neck pain',
            'Other musculoskeletal disorders',
            'Neural tube defects',
            'Cleft lip and cleft palate',
            "Down's syndrome",
            'Congenital heart anomalies',
            'Other chromosomal anomalies',
            'Other congenital anomalies',
            'Dental caries',
            'Periodontal disease',
            'Edentulism'];
    this.cat3 = ['Road injury',
            'Poisonings',
            'Falls',
            'Fire, heat and hot substances',
            'Drowning',
            'Exposure to forces of nature',
            'Other unintentional injuries',
            'Self-harm',
            'Interpersonal violence',
            'Collective violence and legal intervention'];

    this.endCauses = this.cat1.concat(this.cat2).concat(this.cat3);

    this.initVis();
};

StackedArea.prototype.initVis = function() {

    var vis = this;

    //listen to user input
    //vis.stackType = d3.select("#stack-type").property("value");
    vis.stackYear = d3.select("#region-year").property("value");
    vis.stackData = d3.select("#region-data").property("value");
    vis.stackSex = d3.select("#region-sex").property("value");

    vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.x = d3.scale.ordinal().rangeBands([0, vis.width]);
    vis.y = d3.scale.linear().range([vis.height, 0]);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left")
        .tickFormat(function(d) {
            if (vis.stackType == "zero") {
                return d3.format(".2s")(d).replace('M', 'mil');
            } else {
                return d3.format(".0%")(d);
            }
        });

    vis.c1 = d3.scale.ordinal()
        .domain(vis.cat1.reverse())
        .range(colorbrewer.Greens[9].slice(1,8));
    vis.c2 = d3.scale.ordinal()
        .domain(vis.cat2.reverse())
        .range(colorbrewer.Blues[9].slice(1,8));
    vis.c3 = d3.scale.ordinal()
        .domain(vis.cat3.reverse())
        .range(colorbrewer.Reds[9].slice(1,8));
    // for three main categories
    vis.c0 = d3.scale.ordinal()
        //.domain(vis.lv1)
        .domain(['Injuries', 'Noncommunicable diseases', 'Communicable & other Group I'])
        .range(["#2ca02c", "#1f77b4", "#d62728"].reverse());
        //.range(['#41ab5d','#2171b5', '#fb6a4a'].reverse());


    vis.stack = d3.layout.stack()
        .values(function(d) { return d.values; })
        .x(function(d) { return d.dims.AGEGROUP; })
        .y(function(d) { return d.Value; });

    vis.nest = d3.nest()
        .key(function(d) { return d.dims.GHECAUSES; });

    vis.area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return vis.x(d.dims.AGEGROUP); })
        .y0(function(d) { return vis.y(d.y0); })
        .y1(function(d) { return vis.y(d.y0 + d.y); });

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.gx = vis.svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.gy = vis.svg.append("g")
        .attr("class", "axis y-axis");

    vis.tooltip = d3.select("#stack-chart")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "150px")
        .style("left", vis.width-vis.margin.right+10 + "px");

    vis.vertical = d3.select("#stack-chart")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", vis.height+ vis.margin.top +"px")
        .style("top", (vis.margin.top - 10) + "px")
        .style("bottom", vis.margin.bottom + "px")
        .style("left", "0px")
        .style("background", "black");

    vis.graphdata;

    vis.updateVis();
};

StackedArea.prototype.updateVis = function() {

    console.log("in update vis", this);

    var vis = this;
    
    vis.stackYear = d3.select("#region-year").property("value");
    vis.stackData = d3.select("#region-data").property("value");
    vis.stackSex = d3.select("#region-sex").property("value");


    d3.json('data/DALY_2000_2012/'+vis.stackData, function(data) {

    //cleaning data
    var mainCat = vis.lv1[0];
    data.fact.forEach(function (d) {

        //add main category
        if (d.dims.GHECAUSES == vis.lv1[1]) {
            mainCat = vis.lv1[1];
        } else if (d.dims.GHECAUSES == vis.lv1[2]) {
            mainCat = vis.lv1[2];
        }
        d.dims.CATEGORY = mainCat;

        //only keep the first value when 2 values are in the same cell
        //this does not work with json, need to fix
        d.Value = d.Value.split(" ")[0];
        //convert numbers
        d.Value = parseInt(d.Value.replace(/,/g, ''), 10);
        // convert NAN to 0
        if (isNaN(d.Value)) {
            d.Value = 0;
        }
        d.dims.YEAR = +d.dims.YEAR;
        d.dims.AGEGROUP = d.dims.AGEGROUP.replace('  ', ' ');

    });

    //filter year
    data.fact = data.fact.filter(function(d) {
        return +d.dims.YEAR == +vis.stackYear;
    });


    // filter causes
    data.fact = data.fact.filter(function(d) {
        // keep all causes and main cause cateogires, remove lv4
        //return allCategories.indexOf(d.dims.GHECAUSES) == -1 && lv4.indexOf(d.dims.GHECAUSES) == -1;

        //only keep end causes, no overlapping (no lv 4)
        return vis.endCauses.indexOf(d.dims.GHECAUSES) != -1;

        //only keep lv 1 causes
        //return lv1.indexOf(d.dims.GHECAUSES) != -1;
    });

    //filter ages
    data.fact = data.fact.filter(function(d) {
        // only keep specific age groups
        return vis.ageGroups.indexOf(d.dims.AGEGROUP) != -1;
        // only keep all ages group
        //return ageGroups.indexOf(d.dims.AGEGROUP) == -1;
    });

    //combine gender dataf
    var females = [], males = [], combined = [], dupeCheck;
    //data.fact.forEach(function(d){
    for (i = 0; i < data.fact.length; i++) {
        var d = data.fact[i];
        //check for duplicates
        if (dupeCheck == d.dims.SEX+d.dims.GHECAUSES+d.dims.AGEGROUP+d.dims.YEAR) {continue;}

        dupeCheck = d.dims.SEX+d.dims.GHECAUSES+d.dims.AGEGROUP+d.dims.YEAR;

        if (d.dims.SEX == 'Male') {
            males.push(d);
        } else if (d.dims.SEX == "Female") {
            females.push(d);
        }

    }
    for (i = 0; i < females.length; i++) { 
        females[i].dims.FEMALE = females[i].Value;
        females[i].dims.MALE = males[i].Value;
        females[i].BOTH = females[i].dims.FEMALE + females[i].dims.MALE;
        if (vis.stackSex == "Female") {
            females[i].Value = females[i].dims.FEMALE;
        } else if (vis.stackSex == "Male") {
            females[i].Value = females[i].dims.MALE;
        } else {
            females[i].Value = females[i].dims.FEMALE + females[i].dims.MALE;
        };
        delete females[i].dims.SEX;
        combined.push(females[i]);
    }

    vis.graphdata = combined;

    vis.buildPaths();

    })
};

StackedArea.prototype.buildPaths = function() {

    var vis = this;
    //vis.stackType = d3.select("#stack-type").property("value");

    vis.stack.offset(vis.stackType);
    var layers = vis.stack(vis.nest.entries(vis.graphdata));
    //set scales
    //x.domain(d3.extent(graphdata, function(d) { return d.dims.AGEGROUP; }));
    vis.x.domain(vis.ageGroups);
    vis.y.domain([0, d3.max(vis.graphdata, function(d) { return d.y0 + d.y; })]);

    vis.gx.transition().duration(600).call(vis.xAxis)
    .selectAll('text')
        .attr("transform", "translate(-50, 0)");

    vis.gy.transition().duration(600).call(vis.yAxis);

    function addCommas(intNum) {
        return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');}

    var l = vis.svg.selectAll(".layer").data(layers);
    
    l.enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) {
            //console.log(d);
            return vis.area(d.values); })
        .style("fill",             
            function(d) {
                if (d.values[0].dims.CATEGORY == vis.lv1[0]) {
                    return vis.c1(d.values[0].dims.GHECAUSES);
                } else if (d.values[0].dims.CATEGORY == vis.lv1[1]) {
                    return vis.c2(d.values[0].dims.GHECAUSES);
                } else {
                    return vis.c3(d.values[0].dims.GHECAUSES);
                }
            })
        .attr("opacity", 1)
        .on("mouseover", function(d, i) {
            vis.svg.selectAll(".layer").transition()
                .duration(250)
                .attr("opacity", function(d, j) {
                    return j != i ? 0.7 : 1;
        })})

        .on("mousemove", function(d, i) {
            //console.log(d);
            mousex = d3.mouse(this);
            mousex = mousex[0];

            var domain = vis.x.domain(),
            range = vis.x.range();
            order = d3.bisect(range, mousex+50)-1;
            age = domain[order];

            d3.select(this)
            .classed("hover", true)
            .attr("stroke", "black")
            .attr("stroke-width", "2px");
            vis.tooltip.html(
                "<p><b>" + d.key + "</b><br>Age Group: " + age + "</p>" +
                "<p>Cause DALY: " + addCommas(d.values[order].BOTH) + 
                "<br>Female: " + addCommas(d.values[order].dims.FEMALE) + " (" + (d.values[order].dims.FEMALE/d.values[order].Value*100).toFixed(1) + "%)"+ 
                "<br>Male: " + addCommas(d.values[order].dims.MALE) + " (" + (d.values[order].dims.MALE/d.values[order].Value*100).toFixed(1) + "%)"+ 

                "</p>"
            ).style("visibility", "visible");
        })

        .on("mouseout", function(d, i) {
            vis.svg.selectAll(".layer")
            .transition()
            .duration(250)
            .attr("opacity", "1");
            d3.select(this)
            .classed("hover", false)
            .attr("stroke-width", "0px");
            vis.tooltip.style("visibility", "hidden");
        });

    l.style("opacity", 0.5)
        .transition()
        .duration(600)
        .style("opacity", 1.0)
        .attr("class", "layer")
        .attr("d", function(d) {return vis.area(d.values); })
        .style("fill",             
            function(d) {
                if (d.values[0].dims.CATEGORY == vis.lv1[0]) {
                    return vis.c1(d.values[0].dims.GHECAUSES);
                } else if (d.values[0].dims.CATEGORY == vis.lv1[1]) {
                    return vis.c2(d.values[0].dims.GHECAUSES);
                } else {
                    return vis.c3(d.values[0].dims.GHECAUSES);
                }
            })
        .attr("opacity", 1);

    l.exit().remove();

    vis.legend = vis.svg.append("g")
        .attr("class","legendOrdinal")
        .attr("transform", "translate(" + (vis.width-vis.margin.right*2) + "," + (vis.height*.9) + ")");

    var legendOrdinal = d3.legend.color()
        .shape("path", d3.svg.symbol().type("square").size(150)())
        .shapePadding(1)
        .scale(vis.c0);
    
    vis.svg.select(".legendOrdinal")
        .style("font-size","12px")
        .call(legendOrdinal);

    d3.select("#stack-chart")
        .on("mousemove", function(){  
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vis.vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){  
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vis.vertical.style("left", mousex + "px")});


};

var stackedArea = new StackedArea('stack-chart');
//$("#stack-type").on("change", function (d) {stackedArea.buildPaths();});
$("#region-year").on("change", function (d) {stackedArea.updateVis();});
$("#region-data").on("change", function (d) {stackedArea.updateVis();});
$("#region-sex").on("change", function (d) {stackedArea.updateVis();});


stackedArea.stackType = "zero";
var radiostack = document.forms["stack-type"].elements["stack-type"];
for(var i = 0, max = radiostack.length; i < max; i++) {
    radiostack[i].onclick = function() {
        stackedArea.stackType = this.value;
        stackedArea.buildPaths();
        //stackedArea.updateVis();
        
    }
};
