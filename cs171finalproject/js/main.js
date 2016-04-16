
var choroplethMap,
    worldData,
    worldNames,
    dalys,
    dalysHash = {};


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
                });

                createVis();
            }
        });
}
function createVis(){
    choroplethMap = new ChoroplethMap("map", worldData, worldNames, dalys, dalysHash);

}



$('#dalys-info').on('change', function(){
    choroplethMap.year = '2012';
    choroplethMap.type = $(this).val();
    choroplethMap.updateVis();
});