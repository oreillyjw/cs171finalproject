/*
 http://www.htmlgoodies.com/beyond/javascript/article.php/3471341
 */
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
        noncommunicable: 'Noncommunicable diseases',

        'Noncommunicable diseases':'noncommunicable',
        'Injuries' :  'injuries',
        'Communicable & other Group I': 'communicable',
        'All Causes': 'all'
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
    if( choroplethMap.year !== $(this).text()) {
        choroplethMap.year = $(this).text();
        choroplethMap.wrangleData();
        $(".daly-year").html("<b>Year</b>: " + $(this).text());
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

$('.reset-button > .btn.btn-danger').on('click', function(){
    choroplethMap.reset()
});


