/*
 http://www.htmlgoodies.com/beyond/javascript/article.php/3471341
 */
var choroplethMap,
    lineGraph,
    scatterMatrix,
    worldData,
    worldNames,
    countryDalys,
    countryDalysHash = {},
    regionDalys,
    regionDalysHash = {},
    lifeExpecancyHash = {},
    healthDataHash = {},
    dalysMappingTitles = {
        all : 'All Causes',
        communicable : 'Communicable & other Group I',
        injuries : 'Injuries',
        noncommunicable: 'Noncommunicable diseases',
        lifeexpectancy : 'Life Expectancy',
        'tepgdp' : 'Total expenditure on health as a percentage of gross domestic product',
        'ggepte' : 'General government expenditure on health as a percentage of total expenditure on health',
        'pehpteh' :'Private expenditure on health as a percentage of total expenditure on health',
        'gdeptge' : 'General government expenditure on health as a percentage of total government expenditure',
        'erhpte' : 'External resources for health as a percentage of total expenditure on health',
        'ssepgeh' : 'Social security expenditure on health as a percentage of general government expenditure on health',
        'ofppe' : 'Out-of-pocket expenditure as a percentage of private expenditure on health' ,
        'ofpte' : 'Out-of-pocket expenditure as a percentage of total expenditure on health',
        'pppeh' : 'Private prepaid plans as a percentage of private expenditure on health',

        'Noncommunicable diseases':'noncommunicable',
        'Injuries' :  'injuries',
        'Communicable & other Group I': 'communicable',
        'All Causes': 'all',
        'Life Expectancy' : 'lifeexpectancy',
        'Total expenditure on health as a percentage of gross domestic product': 'tepgdp',
        'General government expenditure on health as a percentage of total expenditure on health': 'ggepte',
        'Private expenditure on health as a percentage of total expenditure on health': 'pehpteh',
        'General government expenditure on health as a percentage of total government expenditure' : 'gdeptge',
        'External resources for health as a percentage of total expenditure on health' : 'erhpte',
        'Social security expenditure on health as a percentage of general government expenditure on health' : 'ssepgeh',
        'Out-of-pocket expenditure as a percentage of private expenditure on health': 'ofppe',
        'Out-of-pocket expenditure as a percentage of total expenditure on health' : 'ofpte',
        'Private prepaid plans as a percentage of private expenditure on health' : 'pppeh'


    },

    color = d3.scale.category10(),
    formatDate = d3.time.format("%Y"),
    formatNumber = d3.format("0,000"),
    formatNumberWhole = d3.format(".0f");

$("#infoModal").modal('show');

loadData();

function loadData(){
    queue()
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.tsv, "data/world-country-names.tsv")
        .defer(d3.csv, "data/countrydalys.csv")
        .defer(d3.csv, "data/region_top_level_data.csv")
        .defer(d3.csv, "data/lifeexpectancy.csv")
        .defer(d3.csv, "data/healthdatabycountry.csv")
        .await(function(error, json, tsv, countryCsv, regionCsv, lifeExpectancyCsv, healthDataCsv ) {
            if (!error) {

                worldData = json;
                worldNames = tsv;
                countryDalys = countryCsv;
                regionDalys = regionCsv;

                lifeExpectancyCsv.forEach(function(d){
                    if (lifeExpecancyHash[d.Country] === undefined) {
                        lifeExpecancyHash[d.Country] = {};
                    }

                    d["2000"] =+ d["2000"];
                    d["2012"] =+ d["2012"];

                    lifeExpecancyHash[d.Country]["2000"] = {
                        'lifeExpectancy' : d["2000"]
                    };
                    lifeExpecancyHash[d.Country]["2012"] = {
                        'lifeExpectancy' : d["2012"]
                    };
                });
                //console.log(lifeExpecancyHash);

                regionDalys.forEach(function(d){
                    if (regionDalysHash[d.Region] === undefined) {
                        regionDalysHash[d.Region] = {};
                    }
                    regionDalysHash[d.Region][d.Year] = {
                        'all':  d['All Causes'] = +d['All Causes'],
                        'communicable':d['Communicable & other Group I'] = +d['Communicable & other Group I'],
                        'injuries': d['Injuries'] = +d['Injuries'],
                        'noncommunicable':d['Noncommunicable diseases'] = +d['Noncommunicable diseases'],
                    };
                    d['DateYear'] = formatDate.parse(d['Year']);
                });
                //console.log(regionDalysHash);
                healthDataCsv.forEach(function(d){
                    if (healthDataHash[d.Country] === undefined) {
                        healthDataHash[d.Country] = {};
                    }
                    healthDataHash[d.Country][d.Year] = {
                        'tepgdp' : d['Total expenditure on health as a percentage of gross domestic product'] =+ d['Total expenditure on health as a percentage of gross domestic product'],
                        'ggepte' : d['General government expenditure on health as a percentage of total expenditure on health'] =+ d['General government expenditure on health as a percentage of total expenditure on health'],
                        'pehpteh' : d['Private expenditure on health as a percentage of total expenditure on health'] =+ d['Private expenditure on health as a percentage of total expenditure on health'],
                        'gdeptge' : d['General government expenditure on health as a percentage of total government expenditure'] =+ d['General government expenditure on health as a percentage of total government expenditure'],
                        'erhpte' : d['External resources for health as a percentage of total expenditure on health'] =+ d['External resources for health as a percentage of total expenditure on health'],
                        'ssepgeh' : d['Social security expenditure on health as a percentage of general government expenditure on health'] =+ d['Social security expenditure on health as a percentage of general government expenditure on health'],
                        'ofppe' : d['Out-of-pocket expenditure as a percentage of private expenditure on health' ] =+ d['Out-of-pocket expenditure as a percentage of private expenditure on health' ],
                        'ofpte' : d['Out-of-pocket expenditure as a percentage of total expenditure on health'] =+  d['Out-of-pocket expenditure as a percentage of total expenditure on health'] ,
                        'pppeh' : d['Private prepaid plans as a percentage of private expenditure on health'] =+ d['Private prepaid plans as a percentage of private expenditure on health'],
                    };

                });

                console.log(healthDataHash);

                countryDalys.forEach(function (d) {
                    if (countryDalysHash[d.Country] === undefined) {
                        countryDalysHash[d.Country] = {};
                    }

                    if (healthDataHash[d.Country] !== undefined ){
                        d['Total expenditure on health as a percentage of gross domestic product'] = healthDataHash[d.Country][d.Year]['tepgdp'];
                        d['General government expenditure on health as a percentage of total expenditure on health'] = healthDataHash[d.Country][d.Year]['ggepte'];
                        d['Private expenditure on health as a percentage of total expenditure on health'] = healthDataHash[d.Country][d.Year]['pehpteh'];
                        d['General government expenditure on health as a percentage of total government expenditure'] = healthDataHash[d.Country][d.Year]['gdeptge'];
                        d['External resources for health as a percentage of total expenditure on health' ] = healthDataHash[d.Country][d.Year]['erhpte'];
                        d['Social security expenditure on health as a percentage of general government expenditure on health'] = healthDataHash[d.Country][d.Year]['ssepgeh'];
                        d['Out-of-pocket expenditure as a percentage of private expenditure on health'] = healthDataHash[d.Country][d.Year]['ofppe'];
                        d['Out-of-pocket expenditure as a percentage of total expenditure on health'] = healthDataHash[d.Country][d.Year]['ofpte'];
                        d['Private prepaid plans as a percentage of private expenditure on health'] = healthDataHash[d.Country][d.Year]['pppeh'];
                    }

                    d['Life Expectancy'] = lifeExpecancyHash[d.Country][d.Year]['lifeExpectancy'];
                    d['DateYear'] = formatDate.parse(d['Year']);



                    countryDalysHash[d.Country][d.Year] = {
                        'all': d['All Causes'] = +d['All Causes'],
                        'communicable':  d['Communicable & other Group I'] = +d['Communicable & other Group I'],
                        'injuries':  d['Injuries'] = +d['Injuries'],
                        'noncommunicable': d['Noncommunicable diseases'] = +d['Noncommunicable diseases'],
                        'lifeexpectancy' :  d['Life Expectancy']
                    };

                });



                createVis();
            }
        });
}
function createVis(){
    choroplethMap = new ChoroplethMap("map", worldData, worldNames, countryDalys, countryDalysHash);
    lineGraph = new LineGraph("subGraph-line", worldData, worldNames, countryDalys, countryDalysHash);
    scatterMatrix = new ScatterMatrix("scatter-matrix", countryDalys, countryDalysHash, regionDalys, regionDalysHash, lifeExpecancyHash);

}

$(".daly-year").html("<b>Year</b>: " + $("#dalys-year-radio > a.active").text());
$(".daly-type").html("<b>DALY Type</b>: " + dalysMappingTitles[$("input:radio[name='dalysType']:checked").val()]);

$("input[name='dalysType']").on('click', function(){
    if( choroplethMap.type !== $(this).val()){
        choroplethMap.type = $(this).val();
        choroplethMap.wrangleData();
        $(".daly-type").html("<b>DALY Type</b>: " + dalysMappingTitles[$("input:radio[name='dalysType']:checked").val()]);
    }
});

$("#dalys-year-radio > a ").on('click', function(){
    console.log("click");
    console.log($(this).text());
    var year = $(this).text();
    if( choroplethMap.year !== year) {
        choroplethMap.year = year;
        choroplethMap.wrangleData();
        $(".daly-year").html("<b>Year</b>: " + year);
        $('#scatter-matrix > svg').remove();
        scatterMatrix.year = year;
        scatterMatrix.wrangleData();
    }
});

/*
Slideshow controls
 */

$('.modal-footer > .btn').on('click', function(){
    var numberOfSlides = 3;
    console.log($('.modal-body.active').attr('class'));
    var array = $('.modal-body.active').attr('class').split("-");
    var currentNum = parseInt(array[array.length -1]);
    /*
    Parse slide number
     */
    //var slideNum -
    if ($(this).hasClass("btn-prev")){
        currentNum=currentNum-1;
        if( currentNum === 0){
            currentNum = numberOfSlides;
        }
        $('.modal-body.active').hide().removeClass('active');
        $('.modal-body.modal-'+ currentNum).show().addClass('active');

    }else{
        currentNum=currentNum+1;
        if( currentNum === numberOfSlides + 1){
            currentNum = 1;
        }
        $('.modal-body.active').removeClass('active').hide();
        $('.modal-body.modal-'+ currentNum).addClass('active').show();
    }
});


$('input[name*="outliers"]').on('click',function(){
    console.log($(this).is(":checked"));
    $('#scatter-matrix > svg').remove();
    scatterMatrix.displayOutliers = $(this).is(":checked");
    scatterMatrix.wrangleData();
});


$('.reset-button > .btn.btn-danger').on('click', function(){
    choroplethMap.reset()
});


