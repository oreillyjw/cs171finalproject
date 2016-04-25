

var allCategories = ['All Causes'];
var allAges = ['All ages (total) years'];
//there are some double spaces in original group names. They are removed in data cleaning.
var ageGroups = ['0-27 days','1-59 months','5-14 years','15-29 years', '30-49 years','50-69 years','60-69 years', '70+ years']
var lv1 = ['Communicable & other Group I', 'Noncommunicable diseases', 'Injuries'];
var lv4 = ['Syphilis','Chlamydia','Gonorrhoea','Trichomoniasis','Other STDs',
            'Whooping cough','Diphtheria','Measles','Tetanus','Malaria',
            'Trypanosomiasis','Chagas disease','Schistosomiasis','Leishmaniasis',
            'Lymphatic filariasis','Onchocerciasis','Leprosy','Dengue','Trachoma',
            'Rabies','Ascariasis','Trichuriasis','Hookworm disease'];

//Causes without any lower level causes. No overlapping. Lv 4 excluded
var cat1 = ['Tuberculosis',
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
'Other nutritional deficiencies'],
cat2 = ['Mouth and oropharynx cancers',
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
'Edentulism'],
cat3 = ['Road injury',
'Poisonings',
'Falls',
'Fire, heat and hot substances',
'Drowning',
'Exposure to forces of nature',
'Other unintentional injuries',
'Self-harm',
'Interpersonal violence',
'Collective violence and legal intervention'];
var endCauses = cat1.concat(cat2).concat(cat3);

//listen to user input
var stackType = d3.select("#stack-type").property("value");
var stackYear = d3.select("#stack-year").property("value");
var stackData = d3.select("#stack-data").property("value");

d3.select("#stack-type").on("change", function (d) {updateVisualization();});
d3.select("#stack-year").on("change", function (d) {initialize();});
d3.select("#stack-data").on("change", function (d) {initialize();});

/*
d3.select("#stack-type").on("change", function (d) {
    stackType = d3.select("#stack-type").property("value");
    updateVisualization();
});*/


var margin = {top: 20, right: 30, bottom: 30, left: 50};
var width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeBands([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(function(d) { 
        if (stackType == "zero") {
            return d3.format(".2s")(d).replace('M', 'mil'); 
        } else {
            return d3.format(".0%")(d);
        }
    });

var c1 = d3.scale.ordinal()
    .domain(cat1.reverse())
    .range(colorbrewer.Greens[9].slice(1,8));
var c2 = d3.scale.ordinal()
    .domain(cat2.reverse())
    .range(colorbrewer.Blues[9].slice(1,8));
var c3 = d3.scale.ordinal()
    .domain(cat3.reverse())
    .range(colorbrewer.Reds[9].slice(1,8));


var stack = d3.layout.stack()
    .values(function(d) { return d.values; })
    .x(function(d) { return d.dims.AGEGROUP; })
    .y(function(d) { return d.Value; });

var nest = d3.nest()
    .key(function(d) { return d.dims.GHECAUSES; });

var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return x(d.dims.AGEGROUP); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

var svg = d3.select("#stack-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var gx = svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0," + height + ")");

var gy = svg.append("g")
    .attr("class", "axis y-axis");

var tooltip = d3.select("#stack-chart")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", "50px")
    .style("left", width + "px");

var vertical = d3.select("#stack-chart")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", height+ margin.top +"px")
        .style("top", margin.top + "px")
        .style("bottom", margin.bottom + "px")
        .style("left", "0px")
        .style("background", "black");

initialize();

var graphdata;

function initialize() {
    
    stackYear = d3.select("#stack-year").property("value");
    stackData = d3.select("#stack-data").property("value");


    d3.json('data/DALY_2000_2012/'+stackData, function(data) {

    //cleaning data
    var mainCat = lv1[0];
    data.fact.forEach(function (d) {

        //add main category
        if (d.dims.GHECAUSES == lv1[1]) {
            mainCat = lv1[1];
        } else if (d.dims.GHECAUSES == lv1[2]) {
            mainCat = lv1[2];
        };
        d.dims.CATEGORY = mainCat;

        //only keep the first value when 2 values are in the same cell
        //this does not work with json, need to fix
        d.Value = d.Value.split(" ")[0];
        //convert numbers
        d.Value = parseInt(d.Value.replace(/,/g, ''), 10);
        // convert NAN to 0
        if (isNaN(d.Value)) {
            d.Value = 0;
        };
        d.dims.YEAR = +d.dims.YEAR;
        d.dims.AGEGROUP = d.dims.AGEGROUP.replace('  ', ' ');

    });

    //filter year
    data.fact = data.fact.filter(function(d) {
        return +d.dims.YEAR == +stackYear;
    });


    // filter causes
    data.fact = data.fact.filter(function(d) {
        // keep all causes and main cause cateogires, remove lv4
        //return allCategories.indexOf(d.dims.GHECAUSES) == -1 && lv4.indexOf(d.dims.GHECAUSES) == -1;

        //only keep end causes, no overlapping (no lv 4)
        return endCauses.indexOf(d.dims.GHECAUSES) != -1;

        //only keep lv 1 causes
        //return lv1.indexOf(d.dims.GHECAUSES) != -1;
    })

    //filter ages
    data.fact = data.fact.filter(function(d) {
        // only keep specific age groups
        return ageGroups.indexOf(d.dims.AGEGROUP) != -1;
        // only keep all ages group
        //return ageGroups.indexOf(d.dims.AGEGROUP) == -1;
    });

    //combine gender dataf
    var females = [], males = [], combined = [], dupeCheck;
    //data.fact.forEach(function(d){
    for (i = 0; i < data.fact.length; i++) {
        var d = data.fact[i];
        //check for duplicates
        if (dupeCheck == d.dims.SEX+d.dims.GHECAUSES+d.dims.AGEGROUP+d.dims.YEAR) {continue;};

        dupeCheck = d.dims.SEX+d.dims.GHECAUSES+d.dims.AGEGROUP+d.dims.YEAR;

        if (d.dims.SEX == 'Male') {
            males.push(d);
        } else if (d.dims.SEX == "Female") {
            females.push(d);
        }

    };
    for (i = 0; i < females.length; i++) { 
        females[i].dims.FEMALE = females[i].Value;
        females[i].dims.MALE = males[i].Value;
        females[i].Value = females[i].dims.FEMALE + females[i].dims.MALE;
        delete females[i].dims.SEX;
        combined.push(females[i]);
    };

    graphdata = combined;

    //console.log(graphdata);

    updateVisualization();

    })
};

function updateVisualization() {

    stackType = d3.select("#stack-type").property("value");

    stack.offset(stackType);
    var layers = stack(nest.entries(graphdata));
    //set scales
    //x.domain(d3.extent(graphdata, function(d) { return d.dims.AGEGROUP; }));
    x.domain(ageGroups);
    y.domain([0, d3.max(graphdata, function(d) { return d.y0 + d.y; })]);

    gx.transition().duration(600).call(xAxis)
    .selectAll('text')
        .attr("transform", "translate(-50, 0)");

    gy.transition().duration(600).call(yAxis);

    function addCommas(intNum) {
        return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');};

    var l = svg.selectAll(".layer").data(layers);
    
    l.enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) {
            //console.log(d);
            return area(d.values); })
        .style("fill",             
            function(d) {
                if (d.values[0].dims.CATEGORY == lv1[0]) {
                    return c1(d.values[0].dims.GHECAUSES);
                } else if (d.values[0].dims.CATEGORY == lv1[1]) {
                    return c2(d.values[0].dims.GHECAUSES);
                } else {
                    return c3(d.values[0].dims.GHECAUSES);
                };
            })
        .attr("opacity", 1)
        .on("mouseover", function(d, i) {
            svg.selectAll(".layer").transition()
                .duration(250)
                .attr("opacity", function(d, j) {
                    return j != i ? 0.7 : 1;
        })})

        .on("mousemove", function(d, i) {
            console.log(d);
            mousex = d3.mouse(this);
            mousex = mousex[0];

            var domain = x.domain(),
            range = x.range();
            order = d3.bisect(range, mousex+50)-1;
            age = domain[order];

            d3.select(this)
            .classed("hover", true)
            .attr("stroke", "black")
            .attr("stroke-width", "2px")
            ,tooltip.html(
                "<p><b>" + d.key + "</b><br>Age Group: " + age + "</p>" +
                "<p>Cause DALY: " + addCommas(d.values[order].Value) + 
                "<br>Female: " + addCommas(d.values[order].dims.FEMALE) + " (" + (d.values[order].dims.FEMALE/d.values[order].Value*100).toFixed(2) + "%)"+ 
                "<br>Male: " + addCommas(d.values[order].dims.MALE) + " (" + (d.values[order].dims.MALE/d.values[order].Value*100).toFixed(2) + "%)"+ 

                "</p>"
            ).style("visibility", "visible");
        })

        .on("mouseout", function(d, i) {
            svg.selectAll(".layer")
            .transition()
            .duration(250)
            .attr("opacity", "1");
            d3.select(this)
            .classed("hover", false)
            .attr("stroke-width", "0px")
            ,tooltip.style("visibility", "hidden");
        });

    l.style("opacity", 0.5)
        .transition()
        .duration(600)
        .style("opacity", 1.0)
        .attr("class", "layer")
        .attr("d", function(d) {return area(d.values); })
        .style("fill",             
            function(d) {
                if (d.values[0].dims.CATEGORY == lv1[0]) {
                    return c1(d.values[0].dims.GHECAUSES);
                } else if (d.values[0].dims.CATEGORY == lv1[1]) {
                    return c2(d.values[0].dims.GHECAUSES);
                } else {
                    return c3(d.values[0].dims.GHECAUSES);
                };
            })
        .attr("opacity", 1);

    l.exit().remove();


    d3.select("#stack-chart")
        .on("mousemove", function(){  
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){  
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px")});
};