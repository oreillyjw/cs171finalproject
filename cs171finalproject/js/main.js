/*
 http://www.htmlgoodies.com/beyond/javascript/article.php/3471341
 http://jqueryui.com/autocomplete/
 http://dbrekalo.github.io/fastselect/
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
    activeCountries = [],
    activeCategories =  [ 'All Causes', 'Communicable & other Group I', 'Injuries', 'Noncommunicable diseases',  'Life Expectancy'],
    healthDataHash = {},
    lineGraphType = 'Graph',
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
$('.multipleSelect').fastselect();
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

                    if (lifeExpecancyHash[d.Region] !== undefined ) {
                        d['Life Expectancy'] = lifeExpecancyHash[d.Region][d.Year]['lifeExpectancy'];

                    }
                    d['DateYear'] = formatDate.parse(d['Year']);
                });

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
                        'lifeexpectancy' :  d['Life Expectancy'],
                        'tepgdp': d['Total expenditure on health as a percentage of gross domestic product'],


                    };

                });

                createVis();
            }
        });
}
function createVis(){
    choroplethMap = new ChoroplethMap("map", worldData, worldNames, countryDalys, countryDalysHash);
    lineGraph = new LineGraph("subGraph-line", worldData, worldNames, countryDalys, countryDalysHash, regionDalys, regionDalysHash, lifeExpecancyHash);
    scatterMatrix = new ScatterMatrix("scatter-matrix", countryDalys, countryDalysHash, regionDalys, regionDalysHash, lifeExpecancyHash);

}

$(".daly-year").html("<b>Year</b>: " + $("#dalys-year-radio > a.active").text());
$(".daly-type").html("<b>DALY Type</b>: " + dalysMappingTitles[$("input:radio[name='dalysType']:checked").val()]);

$("input[name='dalysType']").on('click', function(){
    var val = $(this).val();
    if( choroplethMap.type !== val){
        if ( val === 'all'){
            lineGraph.allDalysDisplay =  [ 'All Causes', 'Communicable & other Group I',
                'Injuries', 'Noncommunicable diseases',  'Life Expectancy'
            ];
        }else{
            lineGraph.allDalysDisplay = [ dalysMappingTitles[val] ];
        }
        choroplethMap.type = val;
        choroplethMap.wrangleData();
        $(".daly-type").html("<b>DALY Type</b>: " + dalysMappingTitles[$("input:radio[name='dalysType']:checked").val()]);

        $('.linetype').remove();
        lineGraph.wrangleData();

    }
});


$('button[name="apply-dalys"]').on('click',function(){
    activeCountries = [];
    $('.fstChoiceItem').each(function(i,d){
        activeCountries.push($(d).attr('data-text'));
    });

    $('#scatter-matrix > svg').remove();
    scatterMatrix.wrangleData();
    choroplethMap.wrangleData();
});


$("#dalys-year-radio > a ").on('click', function(){
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

$("#dalys-linegraph-radio > a").on('click', function(){
    var type = $(this).text();

    lineGraphType = type;
    if ( type === "Graph" ){
        $('#subGraph-table').hide();
        $('#subGraph-line, #dalys-linegraph-radio').show();
    }else{
        $('#subGraph-line').hide();
        $('#subGraph-table, #dalys-linegraph-radio').show();
    }
});

$("input[name='scatter-bursh']").on('click', function() {
    $('#scatter-matrix > svg').remove();
    scatterMatrix.brushEnabled = $(this).is(":checked");
    scatterMatrix.wrangleData();
});


$("#page-radio > a").on('click', function(){
    var type = $(this).text();
    if( type === 'Region/Income Group' ){

        $('.container[data-page="1"]').hide();

        $('.container[data-page="2"]').show();
        stackedArea.updateVis();
    }else{
        $('.container[data-page="1"]').show();
        $('.container[data-page="2"]').hide();
    }
});


/*

Slideshow controls
 */

$('.modal-footer > .btn').on('click', function(){
    var numberOfSlides = 3;

    var array = $('.modal-body.active').attr('class').split("-");
    var currentNum = parseInt(array[array.length -1]);
    /*
    Parse slide number
     */
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

    changeCircle(currentNum);
});


/*
 modified from http://codepen.io/vistar/pen/JdVzor
 */
var changeCircle = function(stage){

    var deg = -88,
        deg2 = deg;
    if(stage >= 1){
        $("#infoModal .btn-prev").hide();
        $("#infoModal .btn-next").show();
        $("#infoModal .btn-dismiss").hide();
    }

    if(stage >= 2){
        deg2 = -55;
        $("#infoModal .btn-prev").show();
        $("#infoModal .btn-next").show();
        $("#infoModal .btn-dismiss").hide();

    }
    var deg3 = deg2;
    if( stage >= 3){
        deg3 = 0;
        $("#infoModal .btn-prev").show();
        $("#infoModal .btn-next").hide();
        $("#infoModal .btn-dismiss").show();

    }

    $('.box2').css('-webkit-transform', 'rotate(' + deg3   +'deg)')
        .css('-moz-transform', 'rotate(' + deg3   +'deg)')
        .css('-ms-transform', 'rotate(' + deg3   +'deg)');

    $('.box1').css('-webkit-transform', 'rotate(' + deg2   +'deg)')
        .css('-moz-transform', 'rotate(' + deg2   +'deg)')
        .css('-ms-transform', 'rotate(' + deg2   +'deg)');

    $('.box').css('-webkit-transform', 'rotate(' + deg   +'deg)')
        .css('-moz-transform', 'rotate(' + deg   +'deg)')
        .css('-ms-transform', 'rotate(' + deg   +'deg)');

};

changeCircle(1);


$('.reset-button > .btn.btn-danger').on('click', function(){
    choroplethMap.reset()
});

$(function() {
    var availableTags = [
        "Afghanistan",
        "Albania",
        "Algeria",
        "Angola",
        "Argentina",
        "Armenia",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bhutan",
        "Bolivia (Plurinational State of)",
        "Bosnia and Herzegovina",
        "Botswana",
        "Brazil",
        "Brunei Darussalam",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cabo Verde",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Colombia",
        "Comoros",
        "Congo",
        "Costa Rica",
        "Cote d'Ivoire",
        "Croatia",
        "Cuba",
        "Cyprus",
        "Czech Republic",
        "Democratic People's Republic of Korea",
        "Democratic Republic of the Congo",
        "Denmark",
        "Djibouti",
        "Dominican Republic",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Ethiopia",
        "Fiji",
        "Finland",
        "France",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Greece",
        "Guatemala",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Honduras",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran (Islamic Republic of)",
        "Iraq",
        "Ireland",
        "Israel",
        "Italy",
        "Jamaica",
        "Japan",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kuwait",
        "Kyrgyzstan",
        "Lao People's Democratic Republic",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Lithuania",
        "Luxembourg",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Mauritania",
        "Mauritius",
        "Mexico",
        "Mongolia",
        "Montenegro",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nepal",
        "Netherlands",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "Norway",
        "Oman",
        "Pakistan",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Poland",
        "Portugal",
        "Qatar",
        "Republic of Korea",
        "Republic of Moldova",
        "Romania",
        "Russian Federation",
        "Rwanda",
        "Saudi Arabia",
        "Senegal",
        "Serbia",
        "Sierra Leone",
        "Singapore",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "South Africa",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Swaziland",
        "Sweden",
        "Switzerland",
        "Syrian Arab Republic",
        "Tajikistan",
        "Thailand",
        "The former Yugoslav republic of Macedonia",
        "Timor-Leste",
        "Togo",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "United Republic of Tanzania",
        "United States of America",
        "Uruguay",
        "Uzbekistan",
        "Venezuela (Bolivarian Republic of)",
        "Vietnam",
        "Yemen",
        "Zambia",
        "Zimbabwe"
    ];
    $( "#country" ).autocomplete({
        source: availableTags
    });
});

$( "#country-search-box" ).submit(function( event ) {
    event.preventDefault();
    var country = $('#country').val().replace(/[^a-z]/gi, '').toLowerCase();
    if ( $('#map .'+country).val() !== undefined ){
        $('.search-country-not-found').hide();
        $('#map .'+country).d3Click();
    }else{
        $('.search-country-not-found').show();
    }
});

$('.fa.fa-search').on('click', function(){
    var country = $('#country').val().replace(/[^a-z]/gi, '').toLowerCase();
    $('#map .'+country).d3Click();
});

/*
 http://stackoverflow.com/questions/9063383/how-to-invoke-click-event-programmatically-in-d3
 */
jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
        var evt = new MouseEvent("click");
        e.dispatchEvent(evt);
    });
};

$('.reset-filters-country').on('click', function(){
    $("input[name='dalysType'][value='all']").prop("checked", true).click();
    $('.fstChoiceRemove').each(function(i,d){
        $(d).click();
    });
    $('button[name="apply-dalys"]').click();
    $('div.reset-button > button').click();
    lineGraph.country = "World";
    $('.linetype').remove();
    lineGraph.wrangleData();

});


