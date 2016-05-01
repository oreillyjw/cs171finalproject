Project Overview

---
### Project Website
* http://oreillyjw.github.io/cs171finalproject/

---
### Screencast
* -Youtube Link-

---
### Features

* Country 
    * Filters
        * Years
            * Only show one year data at a time
            * 2000/2012
        * Info Types:
            * All Cause (DALY)
            * Communicable & Other Group I (DALY)
            * Injuires (DALY)
            * Noncommunicable Diseases (DALY)
            * Life Expectancy 
        * Remove Country/Countries
            * Add a Country to remove from Choropleth and Scatterplot matrix.
    * Graphs
        * Choropleth
            * Click on country to zoom in
            * Click on same country selected, or reset zoom to zoom out
        * Line Graph
            * Shows data depending on what filter is selected 
            * Toggle to show table of raw data for given country.
        * Scatter Plot Matrix  
            * There is a switch
                * Selecting an area and burshing which will brush all graphs in matrix
                * Selecting a point in any graph will bring all of its data to the line graph, zoom into the countries locationin the choropleth,
                 and will highlight the country in the graphs of the scatterplot matrix.
    * Other
        * Search for a Country and then once you find an available country, choropleth will zoom on the country you selected, 
        Line Graph will change to the country you select, and scatter plot will highlight the country searched on
* Region

---
### Code Break Down

* css
    * bootstrap.min.css (Downloaded)
    * colorbrewer.css (Downloaded)
    * fastselect.min.css (Downloaded)
    * font-awesome.min.css (Downloaded)
    * jquery-ui.css (Downloaded)
    * style.css
        * Created by Lo and Jonathon 
* data
    * countrydalys.csv (Data Used for Choropleth/Line Graph and Scatter Plot Matrix)
    * healthdatabycountry.csv (Data Used for Choropleth/Line Graph and Scatter Plot Matrix)
    * lifeexpectancy.csv (Data Used for Choropleth/Line Graph and Scatter Plot Matrix)
    * region_top_level_data.csv (Data Used for Choropleth/Line Graph and Scatter Plot Matrix)
    * sankey_lookup.csv (Data Used for Sankey and Stacked Area Graph)
    * world-110m.json (Data Used for Choropleth)
    * world-country-names.tsv (Data Used for Choropleth)
    * DALY_2000_2012 (Data Used for Sankey and Stacked Area Graph)
          * Age-standardized by country.xml
          * World Bank Income Groups High Income.xml
          * World Bank income groups Low income.xml
          * World Bank income groups Lower middle income.xml
          * World Bank income groups Upper middle income.xml
          * World Bank regions East Asia and Pacific.xml
          * World Bank regions Europe and Central Asia.xml
          * World Bank regions High income.xml
          * World Bank regions Latin America and Caribbean.xml
          * World Bank regions Middle East and North Africa.xml
          * World Bank regions South Asia.xml
          * World Bank regions Sub-Saharan Africa.xml
          * World by Cause.xml
* fonts
* img
* js
    * choropleth.js (Created by Jonathon)
        * Created to display the world map when the country tab is selected. 
    * d3 ( Downloaded d3 libraries )
        * d3.geo.projection.v0.min.js
        * d3.js
        * d3.legend-color.js
        * d3.legend.js
        * d3.min.js
        * d3.sankey.js
        * d3.tip.js
    * linegraphdalys.js (Created by Jonathon)
    * main.js (Created by Jonathon)
    * otherThirdParty (Downloaded libraries)
        * bootstrap.min.js
            * Used for layout bootstrap
        * colorbrewer.js
            * Used for colors in the choropleth graph. 
        * fastselect.js
            * Used for the multi-select filter for countries to remove. 
        * highlight.min.js
        * jquery-ui.js
            * Used to change pages
        * jquery.min.js
            * Basic jquery selector package
        * queue.min.js
            * Used to load the all files necessary for processing
        * topojson.js
    * sankey.js (Created by Lo/ Updated by Jonathon)
    * scatterplotmatrix.js (Created by Jonathon)
    * stack.js (Created by Lo)
