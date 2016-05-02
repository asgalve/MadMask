


/********************************************************************************/
/*																				*/
/*																				*/
/*				CROP MONITOR WMS												*/
/*																				*/
/*																				*/
/********************************************************************************/

$.get("http://cropmonitor.org/arcgis/rest/services/DevSummit2016?f=pjson", function(data, textStatus){
		var json = JSON.parse(data);
		var lyrs = json.services;
		$.each(lyrs, function(index, value){
			var arrValues = value.name.split("/");
			var arrNames = arrValues[1].replace("_", " ").split(" ");
			if (arrNames[1] != 'SSA'){
				var nameArray = arrNames[1].replace("_", " ").split(" ");
				var name_display = nameArray[0];
				if (nameArray[0] == "CHIRPS") name_display = nameArray[1];
				$("#CM_eoData").append('<li id ="'+arrValues[1]+'"><a href="javascript:void(0);" onclick="javascript:updateEOdata(\''+arrValues[1]+'\',\''+name_display+'\');">'+name_display+'</a></li>');
				$("#CM_DMLS_data").append('<li id ="'+arrValues[1]+'"><a href="javascript:void(0);" onclick="javascript:updateEODMLSdata(\''+arrValues[1]+'\',\''+name_display+'\');">'+name_display+'</a></li>');
			}	

		});
	$('#cm_sat_prod_title').addClass('btn-active');
	$('#cm_dmls_prod_title').addClass('btn-active');
	
	}	

);


function updateEODMLSdata(str_val,str_name){
	$("#CM_DMLS_layerDate").html('');
	$("#cm_dmls_prod_title").html(str_name);
	$('#cm_dmls_date').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#cm_dmls_date_dropdown').show();
	$('#cm_dmls_prod_title').attr('data-dataurl','http://cropmonitor.org/arcgis/rest/services/DevSummit2016/'+str_val+'/MapServer');
	$('#cm_dmls_date').addClass('btn-active');
	resetControls("DMSL");
	$.get("http://cropmonitor.org/arcgis/rest/services/DevSummit2016/"+str_val+"/MapServer?f=pjson", function(data, textStatus){
		var json = JSON.parse(data);
		var lyrs = json.layers;
		var number_layers = lyrs.length -1;
		var dateArray = new Array();
		$.each(lyrs, function(index, value){
			var name = value.name;
			var id = value.id;
			if (str_name != 'SSA'){
				var year = name.substring(name.length - 8, name.length - 4);
				var month = name.substring(name.length - 14, name.length - 12);
				var day = name.substring(name.length - 11, name.length - 9);
				var fullDate = name.substring(name.length - 14, name.length - 4);
				dateArray.push(fullDate);
				$("#CM_DMLS_layerDate").append('<li><a id="'+fullDate+'" class ="eo-product-layer" onclick="javascript:updateDMLSLayer(\''+fullDate+'\')" href="javascript:void(0);" data-id-layer='+id +'>'+fullDate+'</a></li>');
			}
		});
	});
}

function updateEOdata(str_val,str_name){
	$("#CM_eoLayer").html('');
	$("#cm_sat_prod_title").html(str_name);
	//$('#cm_sat_prod_date_dropdown').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#cm_sat_prod_date_dropdown').show();
	$('#cm_sat_prod_date').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#cm_sat_prod_title').attr('data-dataurl','http://cropmonitor.org/arcgis/services/DevSummit2016/'+str_val+'/MapServer/WMSServer');
	$('#cm_sat_prod_date').addClass('btn-active');
	resetControls("CMWMS");
	$.get("http://cropmonitor.org/arcgis/rest/services/DevSummit2016/"+str_val+"/MapServer?f=pjson", function(data, textStatus){
		var json = JSON.parse(data);
		var lyrs = json.layers;
		var number_layers = lyrs.length -1;
		var dateArray = new Array();
		$.each(lyrs, function(index, value){
			var name = value.name;
			var id = value.id;
			if (str_name != 'SSA'){
				var year = name.substring(name.length - 8, name.length - 4);
				var month = name.substring(name.length - 14, name.length - 12);
				var day = name.substring(name.length - 11, name.length - 9);
				var fullDate = name.substring(name.length - 14, name.length - 4);
				dateArray.push([year+month+day, fullDate,id]);
			}
		});
		$.each(dateArray.sort(), function(index, value){
			var fdate = value[1];
			var fid = value[2];
			$("#CM_eoLayer").append('<li><a id="'+fdate+'" class ="eo-product-layer" onclick="javascript:updateLayer(\''+fdate+'\')" href="javascript:void(0);" data-id-layer='+(number_layers - fid) +'>'+fdate+'</a></li>');
		});
	});
}

function updateLayer(ele_id){
	$("#cm_sat_prod_date").html(ele_id);
	$('#cm_sat_prod_date').attr('data-datalayer',$('#'+ele_id).attr("data-id-layer"));
	$('#cm_crop_mask_dropdown').show();
	$('#cm_crop_mask').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#cm_crop_mask').addClass('btn-active');
	checkControls('CMWMS');

	
}

function updateDMLSLayer(ele_id){
	$("#cm_dmls_date").html(ele_id);
	$('#cm_dmls_date').attr('data-datalayer',$('#'+ele_id).attr("data-id-layer"));
	$('#cm_dmls_crop_mask_dropdown').show();
	$('#cm_dmls_crop_mask').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#cm_dmls_crop_mask').addClass('btn-active');
	checkControls('DMSL');
	
	
}

/********************************************************************************/
/*																				*/
/*				CROP MONITOR CROP MASKS											*/
/*																				*/
/********************************************************************************/


function updateCM_CropMasks(JSON_file){

	$.getJSON ('../files/'+JSON_file+'.json', function(json){
		var lyrs = json.layers;
		var number_layers = lyrs.length -1; 
		$.each(lyrs, function(index, value){
			var id = value.id;
			var name = value.name.replace("_", " ").replace(".tif", "");
			var splitted_name = name.split(" ");
			$("#CM_cropMasks").append('<li><a href="javascript:void(0);" onclick="javascript:updateCropMaskCM(\''+splitted_name[1].replace("_", " ")+'\', '+(number_layers - id)+')">'+splitted_name[1].replace("_", " ")+'</a></li>');
			$("#CM_DMLS_cropMasks").append('<li><a href="javascript:void(0);" onclick="javascript:updateCropMaskCMDMLS(\''+splitted_name[1].replace("_", " ")+'\', '+id+')">'+splitted_name[1].replace("_", " ")+'</a></li>');
		});
	});
}

function updateCropMaskCM(crop_name, crop_id){
	$('#cm_crop_mask').attr('data-masklayer',crop_id);
	$("#cm_crop_mask").html(crop_name);
	$('#go_crop_monitor').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#go_crop_monitor').addClass('btn-active');
}


function updateCropMaskCMDMLS(crop_name, crop_id){
	$('#cm_dmls_crop_mask').attr('data-masklayer',crop_id);
	$("#cm_dmls_crop_mask").html(crop_name);
	$('#go_cm_dmls').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#go_cm_dmls').addClass('btn-active');
}

/********************************************************************************/
/*																				*/
/*				GLAM TANZANIA CROP MASKS										*/
/*																				*/
/********************************************************************************/

$.get("http://cropmonitor.org/arcgis/rest/services/DevSummit2016/MaskMap_SSA/MapServer?f=pjson", function(data, textStatus){
		var json = JSON.parse(data);
		var lyrs = json.layers;
		var number_layers = lyrs.length -1; 
		$.each(lyrs, function(index, value){
			var id = value.id;
			var name = value.name.replace("_", " ").replace(".tif", "");
			$("#GLAM_cropMasks").append('<li><a href="javascript:void(0);" onclick="javascript:updateCropMaskGLAM(\''+name+'\', '+(number_layers - id)+')">'+name+'</a></li>');
		});

	}	
);

/********************************************************************************/
/*																				*/
/*				GLAM TANZANIA DATA LAYERS										*/
/*																				*/
/********************************************************************************/

function updateCropMaskGLAM(crop_name, crop_id){
	$('#glam_crop_mask').attr('data-masklayer',crop_id);
	console.log(crop_id);
	$("#glam_crop_mask").html(crop_name);
	$('#go_glam').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#go_glam').addClass('btn-active');
}


function updateGLAMProduct(JSON_file, type, day_n, JSON_name){
	$('#glam_layer_date').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#glam_layer_date_dropdown').show();
	$("#GLAM_layerDate").html('');
	$("#glam_prod").html(JSON_name);
	$('#glam_prod').attr('data-dataurl','http://pekko.geog.umd.edu/glam/wms/tanzania/v3/p'+day_n+'/'+type+'');
	$('#glam_layer_date').addClass('btn-active');
	resetControls("GLAMWMS");

	$.getJSON ('../files/'+JSON_file+'.json', function(json){
		var lyrs = json.layers;
		
		var number_layers = lyrs.length -1; 
		$.each(lyrs, function(index, value){
			var name = value.name;
			var title = value.title;
			var arr = title.split('.');
			
			var year = arr[1].substring(0,4);
			var day = arr[1].substring(4,7);
			var fichDate = dateFromDay(year,day);
			//(number_layers - id)
			$("#GLAM_layerDate").append('<li><a id = "'+name+'" href="javascript:void(0);" onclick="javascript:updateLayerGLAM(\''+name+'\', \''+fichDate+'\')" data-id-layer="'+name+'">'+fichDate+'</a></li>');
		});
	});
}

function updateLayerGLAM (ele_id, fichDate){
	$("#glam_layer_date").html(fichDate);
	$('#glam_layer_date').attr('data-datalayer',ele_id);
	$('#glam_crop_mask').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
	$('#glam_crop_mask_dropdown').show();
	$('#glam_crop_mask').addClass('btn-active');
	checkControls('GLAMWMS');
}

var map = L.map('map', {
    center: [15, 0],
    zoom: 3,
    boxZoom: false,
    maxZoom: 7, 
    crs:L.CRS.EPSG4326
});

L.esri.tiledMapLayer({
  url: 'http://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer'
}).addTo(map);


/* Adds a LOGO on the map 'bottomright' corner of it. */
var logoLegend = L.control({position: 'bottomright'});

logoLegend.onAdd = function (map) {
var div = L.DomUtil.create('div', 'logo legend');
    div.innerHTML +=
    '<img src="../img/madMask/geoglam.png" alt="geoglam" width="120" height="auto">';
return div;
};

logoLegend.addTo(map);

var logoLegend2 = L.control({position: 'bottomleft'});

logoLegend2.onAdd = function (map) {
var div = L.DomUtil.create('div', 'logo legend');
    div.innerHTML +=
    '<img src="../img/madMask/MadMask.png" alt="geoglam" width="120" height="auto">';
return div;
};

logoLegend2.addTo(map);

/********************************************************************************/
/*																				*/
/*				CUSTOM METHODS													*/
/*																				*/
/********************************************************************************/


$( window ).load(function() {
	disableControls();
	updateCM_CropMasks("crop_monitor_crop_masks");
	$('#glam_prod').addClass('btn-active');
	
	$("#GLAM_data").append('<li><a href="javascript:void(0);" onclick="javascript:updateGLAMProduct(\'NDVI_08_Terra_Tanzania\',\'raster\', 32,\'NDVI Terra 8 Days\')">NDVI Terra 8 Days</a></li>');
	$("#GLAM_data").append('<li><a href="javascript:void(0);" onclick="javascript:updateGLAMProduct(\'NDVI_16_Aqua_Tanzania\',\'raster\', 16, \'NDVI Aqua 16 Days\')">NDVI Aqua 16 Days</a></li>');
	$("#GLAM_data").append('<li><a href="javascript:void(0);" onclick="javascript:updateGLAMProduct(\'NDVI_08_Terra_median_Tanzania\', \'stat\', 32, \'NDVI 8 Days Median\')">NDVI 8 Days Median</a></li>');
	$("#GLAM_data").append('<li><a href="javascript:void(0);" onclick="javascript:updateGLAMProduct(\'NDVI_16_Terra_median_Tanzania\',\'stat\', 16, \'NDVI 16 Days Median\')">NDVI 16 Days Median</a></li>');
});


function dateFromDay(year, day){
  var date = new Date(year, 0); // initialize a date in `year-01-01`
  var endDate = new Date(date.setDate(day));
  return endDate.toString().substring(4, 16); // add the number of days
}



/* Collapse Panels */

function collapsePanels(){
	$('#collapse-eodata-link').addClass('collapsed');
	$('#collapse-eodata-link').attr("aria-expanded", "false");
	$('#collapse-eodata').attr("aria-expanded", "false");
	console.log("hola");
}

$( "#go_crop_monitor" ).click(function() {
	updateCropMonitorLayer();
	console.log("Mad Mask time!");
});

$( "#go_glam" ).click(function() {
	updateGLAMLayer();
	console.log("Mad Mask time!");
});

$( "#go_cm_dmls" ).click(function() {
	updateCropMonitorDMSL();
	console.log("Mad Mask time!");
});

$( "#go_crop_monitor_nomask" ).click(function() {
	updateCropMonitorLayer(true);
	console.log("Mad Mask time!");
});

$( "#go_glam_nomask" ).click(function() {
	updateGLAMLayer(true);
	console.log("Mad Mask time!");
});

$( "#go_cm_dmls_nomask" ).click(function() {
	updateCropMonitorDMSL();
	console.log("Mad Mask time!");
});
$( "#crop_monitor_heading" ).click(function() {
	if ($('#crop_monitor_icon').hasClass("glyphicon-menu-down")){
		$('#crop_monitor_icon').removeClass("glyphicon-menu-down");
		$('#crop_monitor_icon').addClass("glyphicon-menu-up");
	}else{
		$('#crop_monitor_icon').removeClass("glyphicon-menu-up");
		$('#crop_monitor_icon').addClass("glyphicon-menu-down");
	}
	$('#glam_icon').removeClass("glyphicon-menu-up");
	$('#glam_icon').addClass("glyphicon-menu-down");
	$('#cm_dmls_icon').removeClass("glyphicon-menu-up");
	$('#cm_dmls_icon').addClass("glyphicon-menu-down");
});

$( "#glam_heading" ).click(function() {
	if ($('#glam_icon').hasClass("glyphicon-menu-down")){
		$('#glam_icon').removeClass("glyphicon-menu-down");
		$('#glam_icon').addClass("glyphicon-menu-up");
	}else{
		$('#glam_icon').removeClass("glyphicon-menu-up");
		$('#glam_icon').addClass("glyphicon-menu-down");
		
	}
	$('#crop_monitor_icon').removeClass("glyphicon-menu-up");
	$('#crop_monitor_icon').addClass("glyphicon-menu-down");
	$('#cm_dmls_icon').removeClass("glyphicon-menu-up");
	$('#cm_dmls_icon').addClass("glyphicon-menu-down");
});


$( "#cm_dmls_heading" ).click(function() {
	if ($('#cm_dmls_icon').hasClass("glyphicon-menu-down")){
		$('#cm_dmls_icon').removeClass("glyphicon-menu-down");
		$('#cm_dmls_icon').addClass("glyphicon-menu-up");
	}else{
		$('#cm_dmls_icon').removeClass("glyphicon-menu-up");
		$('#cm_dmls_icon').addClass("glyphicon-menu-down");
		
	}
	$('#crop_monitor_icon').removeClass("glyphicon-menu-up");
	$('#crop_monitor_icon').addClass("glyphicon-menu-down");
	$('#glam_icon').removeClass("glyphicon-menu-up");
	$('#glam_icon').addClass("glyphicon-menu-down");
});


function disableControls () {
	$('#cm_sat_prod_date_dropdown').hide();
	$('#cm_sat_prod_date').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#cm_crop_mask').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#cm_crop_mask_dropdown').hide();
	$('#go_crop_monitor').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	

	$('#cm_dmls_date_dropdown').hide();
	$('#cm_dmls_date').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#cm_dmls_crop_mask').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#cm_dmls_crop_mask_dropdown').hide();
	$('#go_cm_dmls').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);

	$('#glam_layer_date').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#glam_layer_date_dropdown').hide();
	$('#glam_crop_mask').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#glam_crop_mask_dropdown').hide();
	$('#go_glam').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	
}

function resetControls(type){
	switch (type) {
		case 'DMSL':
			$('#go_cm_dmls').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
			$('#cm_dmls_date').html('Product Date');
			$('#cm_dmls_date').attr('data-datalayer','');	
			$('#go_cm_dmls').removeClass('btn-active');
			break;
		case 'CMWMS':
			$('#go_crop_monitor').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
			$('#cm_sat_prod_date').html('Product Date');
			$('#cm_sat_prod_date').attr('data-datalayer','');	
			$('#go_crop_monitor').removeClass('btn-active');
			break;
		case 'GLAMWMS':
			$('#go_glam').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
			$('#glam_layer_date').html('Layer Date');
			$('#glam_layer_date').attr('data-datalayer','');	
			$('#go_glam').removeClass('btn-active');
			break;
	}
}


function resetCMcontrols(){
	$('#go_crop_monitor').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#cm_sat_prod_date').html('Product Date');
	$('#cm_sat_prod_date').attr('data-datalayer','');	
	$('#go_crop_monitor').removeClass('btn-active');
}

function resetCMDMSLcontrols(){
	$('#go_cm_dmls').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#cm_dmls_date').html('Product Date');
	$('#cm_dmls_date').attr('data-datalayer','');	
	$('#go_cm_dmls').removeClass('btn-active');
}

function resetGLAMcontrols(){
	$('#go_glam').attr("disabled","disabled").css("cursor", "default").fadeTo(200,0.6);
	$('#glam_layer_date').html('Layer Date');
	$('#glam_layer_date').attr('data-datalayer','');	
	$('#go_glam').removeClass('btn-active');
}

function checkControls(type){
	switch (type) {
		case 'DMSL':
			if ( $('#cm_dmls_crop_mask').attr("data-masklayer") != "") {
				$('#go_cm_dmls').addClass('btn-active');
				$('#go_cm_dmls').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
			}
			break;
		case 'CMWMS':
			if ( $('#cm_crop_mask').attr("data-masklayer") != "") {
				$('#go_crop_monitor').addClass('btn-active');
				$('#go_crop_monitor').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
			}
			break;
		case 'GLAMWMS':
			if ( $('#glam_crop_mask').attr("data-masklayer") != "") {
				$('#go_glam').addClass('btn-active');
				$('#go_glam').attr("disabled",false).css("cursor", "pointer").fadeTo(500,1);
			}
			break;
	}
}