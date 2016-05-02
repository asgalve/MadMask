/*Location for the masking PHP code*/
var proxybase = "http://cropmonitor.org/madmask";

/*Set up for the WMS masking layer*/
var wmsdataopts = {
    "url":"http://cropmonitor.org/arcgis/services/DevSummit2016/NASAUMD_NDVI_Anomaly/MapServer/WMSServer",
    "layer":"97"
};
var wmsmaskopts = { //setting both values to null returns an unmaked version of the data layer
    "url":"null", 
    "layer":"null"
}
var addtlopts = {//other WMS parameters to assign. transparent must be set to true.
    "srs":"EPSG:4326", 
    "transparent":"true"
}
var maskedLayer = L.maskLayer.wms(wmsdataopts, wmsmaskopts, proxybase, addtlopts);

/*Set up for the dynamic map service layer*/
var dmslmaskopts = {
    url: "http://129.2.12.51:6080/arcgis/rest/services/DevSummit2016/Crop_Masks_DS/MapServer",
    opacity : 1,
    layers :[2], 
    transparent: true //must be set to true
};
var dmsldataopts = {
    url: "http://cropmonitor.org/arcgis/rest/services/DevSummit2016/NASAUMD_NDVI_Anomaly/MapServer",
    opacity : 1,
    layers :[2], 
    transparent: true //must be set to true
};

var dmsllayer = L.maskLayer.dynamicMapLayer(dmsldataopts, dmslmaskopts, proxybase);

/*Map toggle setup*/
//Global Extent
var globalSW = L.latLng(-90.0, -180.0),
    globalNE = L.latLng(90.0, 180.0),
    globalbounds = L.latLngBounds(globalSW, globalNE);

//Tanzania Extnet
var tanSW = L.latLng(-12.0, 30.0),
    tanNE = L.latLng(-2.0, 40.0),
    tanbounds = L.latLngBounds(tanSW, tanNE);

//Set the map extent and zoom boundaries
function setViewerExtent(ext){
    if (ext == 'tz'){
        map.setMaxBounds(tanbounds);
        map.fitBounds(tanbounds);
        map.setMinZoom(5);
        map.setZoom(5);
    }else if (ext == 'global'){
        map.setMaxBounds(globalbounds);
        map.fitBounds(globalbounds);
        map.setZoom(2);
        map.setMinZoom(2);
    }else{
        console.log("extent identifier not found");
    }  
}

//Toggle between layer types
function showLayer(type){
    if (type == 'dmsl'){
        if ("_map" in maskedLayer) maskedLayer.removeFrom(map);
        if (!("_map" in dmsllayer) || dmsllayer._map == null ) dmsllayer.addTo(map);
        dmsllayer.redraw();
    }else if(type == 'wms'){
        if ("_map" in dmsllayer) dmsllayer.removeFrom(map);
        if (!("_map" in maskedLayer) || maskedLayer._map == null )  maskedLayer.addTo(map);
        //maskedLayer.redraw();
    }else{
        console.log('layer type not valid');
    }
}

function updateCropMonitorLayer(isnull){
    var dataurl = $("#cm_sat_prod_title").attr("data-dataurl");
    var datalayer = $("#cm_sat_prod_date").attr("data-datalayer");
    if (isnull === true){
        var maskurl = "null";
        var masklayer = "null";
    }else{
        var maskurl = "http://129.2.12.51:6080/arcgis/services/DevSummit2016/Crop_Masks_DS/MapServer/WmsServer";
        var masklayer = $("#cm_crop_mask").attr("data-masklayer");
    }

    //Set the urls to use for the mask and data based on the user input
    maskedLayer.setURL(dataurl, 'data');
    maskedLayer.setURL(maskurl, 'mask');

    //Set the layers to use for the mask and data based on the user input
    maskedLayer.setWMSParameters({"layers":datalayer}, 'data');
    maskedLayer.setWMSParameters({"layers":masklayer}, 'mask');

    //Display the layers and refocus the map
    showLayer('wms'); 
    setViewerExtent('global');
}

function updateCropMonitorDMSL(isnull){
    var dataurl = $("#cm_dmls_prod_title").attr("data-dataurl");
    var datalayer = $("#cm_dmls_date").attr("data-datalayer");
    var maskurl = "http://129.2.12.51:6080/arcgis/rest/services/DevSummit2016/Crop_Masks_DS/MapServer/";
    var masklayer = $("#cm_dmls_crop_mask").attr("data-masklayer");

    //Set the urls to use for the mask and data based on the user input
    dmsllayer.setURL(dataurl, 'data');
    dmsllayer.setURL(maskurl, 'mask');

    //Set the layers to use for the mask and data based on the user input
    dmsllayer.setLayers([datalayer], 'data');
    dmsllayer.setLayers([masklayer], 'mask');

    //Display the layers and refocus the map
    showLayer('dmsl');
    setViewerExtent('global');
}

function updateGLAMLayer(isnull){
    var dataurl = $("#glam_prod").attr("data-dataurl");
    var datalayer = $("#glam_layer_date").attr("data-datalayer");
    if (isnull === true){
        var maskurl = "null";
        var masklayer = "null";
    }else{
        var maskurl = "http://cropmonitor.org/arcgis/services/DevSummit2016/MaskMap_SSA/MapServer/WMSServer";
        var masklayer = $("#glam_crop_mask").attr("data-masklayer");
    }

    //Set the urls to use for the mask and data based on the user input
    maskedLayer.setURL(dataurl, 'data');
    maskedLayer.setURL(maskurl, 'mask');

    //Set the layers to use for the mask and data based on the user input
    maskedLayer.setWMSParameters({"layers":datalayer}, 'data');
    maskedLayer.setWMSParameters({"layers":masklayer}, 'mask');

    //Display the layers and refocus the map
    showLayer('wms');
    setViewerExtent('tz');
}