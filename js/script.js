// This script demonstrates some simple things one can do with leaflet.js


var map = L.map('map').setView([40.71,-73.93], 11);

// set a tile layer to be CartoDB tiles 
var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(CartoDBTiles);

// add in OSM Mapnik tiles
var OSMMapnikTiles = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',{
  attribution: 'Map Data and Tiles &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'
});
// do not add to the map just yet, but add varible to the layer switcher control 

// add in MapQuest Open Aerial layer
var MapQuestAerialTiles = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',{
  attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
});


// create global variables we can use for layer controls
var neighborhoodsGeoJSON;
var publichousingrparegionGeoJSON; 

// start the chain reaction by running the addpublichousingrparegion function
addpublichousingrparegion();

// use jQuery get geoJSON to grab geoJson layer, parse it, then plot it on the map
// because of the asynchronous nature of Javascript, we'll wrap each "getJSON" call in a function, and then call each one in turn. This ensures our layer will work  

function addpublichousingrparegion() {
    // let's add public housing data
    $.getJSON( "geojson/publichousingrparegion.geojson", function( data ) {
        // ensure jQuery has pulled all data out of the geojson file
        var publichousingrparegion = data;

        // publichousing dots
        var publichousingrparegionPointToLayer = function (feature, latlng){
            var publichousingrparegionMarker = L.circle(latlng, 25, {
                stroke: false,
                fillColor: '#ffffcc',
                fillOpacity: 0.5
            });
            
            return publichousingrparegionMarker;  
        }

        var publichousingrparegionClick = function (feature, layer) {

            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Name:</strong> " + feature.properties.PROJECT_NA + "<br /><strong>Units:</strong> " + feature.properties.TOTAL_UNIT);
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        publichousingrparegionGeoJSON = L.geoJson(publichousingrparegion, {
            pointToLayer: publichousingrparegionPointToLayer,
            onEachFeature: publichousingrparegionClick
        });

        // don't add the public housing layer to the map yet

        // run our next function to bring in the Pawn Shop data
        addNeighborhoodData();


    });

}

function addNeighborhoodData() {

    // let's add neighborhood data
    $.getJSON( "geojson/NYC_neighborhood_data.geojson", function( data ) {
        // ensure jQuery has pulled all data out of the geojson file
        var neighborhoods = data;

        // neighborhood choropleth map
        // let's use % in unemployment to color the neighborhood map
        var UnempRateStyle = function (feature){
            var value = feature.properties.UnempRate;
            var fillColor = null;
            if(value >= 0 && value <=0.05){
                fillColor = "#fee5d9";
            }
            if(value >0.05 && value <=0.1){
                fillColor = "#fcbba1";
            }
            if(value >0.1 && value<=0.15){
                fillColor = "#fc9272";
            }
            if(value > 0.15 && value <=0.2){
                fillColor = "#fb6a4a";
            }
            if(value > 0.2 && value <=0.25) { 
                fillColor = "#de2d26";
            }
            if(value > 0.25) { 
                fillColor = "#a50f15";
            }
     

            var style = {
                weight: 1,
                opacity: .1,
                color: 'white',
                fillOpacity: 0.6,
                fillColor: fillColor
            };

            return style;
        }

        var UnempRateClick = function (feature, layer) {
            var percent = feature.properties.UnempRate * 100;
            percent = percent.toFixed(0);
            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Neighborhood:</strong> " + feature.properties.NYC_NEIG + "<br /><strong>Percent Unemployment: </strong>" + percent + "%");
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        neighborhoodsGeoJSON = L.geoJson(neighborhoods, {
            style: UnempRateStyle,
            onEachFeature: UnempRateClick
        });

        // now lets add the data to the map in the order that we want it to appear

        // neighborhoods on the bottom
        neighborhoodsGeoJSON.addTo(map);

        // Public Housing dots on top
        publichousingrparegionGeoJSON.addTo(map);

        // now create the layer controls!
        createLayerControls(); 

    });

}

function createLayerControls(){

    // add in layer controls
    var baseMaps = {
        "CartoDB": CartoDBTiles,
        "OSM Mapnik": OSMMapnikTiles,
        "Mapquest Aerial": MapQuestAerialTiles
    };

    var overlayMaps = {
        "Public Housing": publichousingrparegionGeoJSON,
        "Unemployment Map": neighborhoodsGeoJSON
    };

    // add control
    L.control.layers(baseMaps, overlayMaps).addTo(map);

}


