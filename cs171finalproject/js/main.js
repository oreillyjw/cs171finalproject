
var choroplethMap,
    lineGraph,
    worldData,
    worldNames,
    dalys,
    dalysHash = {},
    dalysMappingTitles = {
        all : 'All Causes',
        communicable : 'Communicable & other Group I',
        injuries : 'Injuries',
        noncommunicable: 'Noncommunicable diseases'
    },
    color = d3.scale.category10(),
    formatDate = d3.time.format("%Y"),
    formatNumber = d3.format("0,000"),
    formatNumberWhole = d3.format(".0f");


loadData();

$("#myModal").modal('show');

function loadData(){
    queue()
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.tsv, "data/world-country-names.tsv")
        .defer(d3.csv, "data/countrydalys.csv")
        .await(function(error, json, tsv, csv) {
            if (!error) {

                worldData = json;
                worldNames = tsv;
                dalys = csv;

                dalys.forEach(function (d) {
                //console.log(d);
                    if (dalysHash[d.Country] === undefined) {
                        dalysHash[d.Country] = {};
                    }
                    d['All Causes'] = +d['All Causes'];
                    d['Communicable & other Group I'] = +d['Communicable & other Group I'];
                    d['Injuries'] = +d['Injuries'];
                    d['Noncommunicable diseases'] = +d['Noncommunicable diseases'];
                    dalysHash[d.Country][d.Year] = {
                        'all': d['All Causes'],
                        'communicable': d['Communicable & other Group I'],
                        'injuries': d['Injuries'],
                        'noncommunicable': d['Noncommunicable diseases']
                    };
                    d['DateYear'] = formatDate.parse(d['Year']);
                });

                createVis();
            }
        });
}
function createVis(){
    choroplethMap = new ChoroplethMap("map", worldData, worldNames, dalys, dalysHash);
    lineGraph = new LineGraph("subGraph-line", worldData, worldNames, dalys, dalysHash);
}



$('#dalys-info').on('change', function(){
    choroplethMap.year = '2012';
    choroplethMap.type = $(this).val();
    choroplethMap.wrangleData();
    $('.linetype').remove();

    lineGraph.country =lineGraph.country;
    lineGraph.updateVis();
});


/*
Slideshow controls
 */

$('.modal-footer > .btn').on('click', function(){
    var numberOfSlider = 2;
    console.log($('.modal-body.active').attr('class'));
    var array = $('.modal-body.active').attr('class').split("-");
    /*
    Parse slide number
     http://www.htmlgoodies.com/beyond/javascript/article.php/3471341
     */
    //var slideNum -
    if ($(this).hasClass("btn-prev")){
        console.log();

    }else{
        console.log($('.modal-body.active'));
    }
});