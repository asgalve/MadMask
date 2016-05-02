
(function (window, document, undefined) {

L.Util.stripurl = function(url){
	return url.replace(/\/+$/, "");
};

L.Util.cleanUrl = function(url) {
	url = L.Util.trim(url);
	if (url[url.length - 1] !== "/") {
		url += "/";
	}
	return url;
}

L.MaskLayer = L.TileLayer.extend({});

L.maskLayer = function(dataseturl, maskurl, proxyurl, options){
	return new L.MaskLayer(dataseturl, maskurl, proxyurl, options);
}

L.MaskLayer.WMS = L.TileLayer.WMS.extend({
	initialize : function (datasetobj, maskobj, proxymaskbase, options) {
		/* Web location of the php code */
		var proxybaseurl = L.Util.stripurl(proxymaskbase);
		this._setUpdaterBase(proxybaseurl+'/main.php');
		this._proxybase = proxybaseurl;

		/* Set the php variables to the input urls */
		var dataseturl = datasetobj.url;
		var maskurl = maskobj.url;
		this.setURL(dataseturl, 'data');
		this.setURL(maskurl, 'mask');

		/* Set layer parameters independently of other WMS props */
		var datasetlyr = datasetobj.layer;
		var masklyr = maskobj.layer;
		this._masklayer = masklyr;
		this._datasetlayer = datasetlyr;

		var wmsParams = this._getDefaultWMSParams(),
		    tileSize = options.tileSize || this.options.tileSize;

		if (options.detectRetina && L.Browser.retina) {
			wmsParams.width = wmsParams.height = tileSize * 2;
		} else {
			wmsParams.width = wmsParams.height = tileSize;
		}

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i) && i !== 'crs') {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;
		var _dataWMSParams = L.extend({}, this.wmsParams);//L.extend({}, this.wmsParams);
		var _maskWMSParams = L.extend({}, this.wmsParams);
		_dataWMSParams["layers"] = datasetlyr;
		_maskWMSParams["layers"] = masklyr;
		_dataWMSParams["action"] = "set-data-params";
		_maskWMSParams["action"] = "set-mask-params";

		L.setOptions(this, options);

		this.setWMSParameters(_dataWMSParams, 'data');
		this.setWMSParameters(_maskWMSParams, 'mask');
		//TODO: subdomain support removed (oops)
	},
	getTileBBox: function (tilePoint) { // (Point, Number) -> String

		var map = this._map,
		tileSize = this.options.tileSize,

		nwPoint = tilePoint.multiplyBy(tileSize),
		sePoint = nwPoint.add([tileSize, tileSize]),

		nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
		se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
		bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
			[se.y, nw.x, nw.y, se.x].join(',') :
			[nw.x, se.y, se.x, nw.y].join(',');
		return bbox;
	},
	createTile: function (coords, done) {
		var tile = document.createElement('img');

		L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));
		L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile));

		if (this.options.crossOrigin) {
			tile.crossOrigin = '';
		}

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = '';
		
		var bbox = this.getTileBBox(coords);
		tile.src = this._proxybase + '/getMaskedTile.php?data-bbox=' + bbox + '&mask-bbox=' + bbox;

		//tile.src = this.getTileUrl(coords);
		//tile.src = "http://129.2.12.13:6080/arcgis/services/DevSummit2016/MaskMap_SSA/MapServer/WmsServer?service=WMS&request=GetMap&version=1.1.1&layers=3&styles=&format=image%2Fpng&transparent=false&srs=EPSG%3A4326&height=256&width=256&bbox=28.125,-11.25,33.75,-5.625";
		
		return tile;
	},
	setWMSParameters: function(params, layertype){
		//Take an object of wms parameters to store in the session
		//make sure the parameter is a valid object first
		if (typeof params !== "object" || Object.keys(params).length == 0){
			console.log("parameter type must be object");
			return;
		}

		var ltlower = layertype.toLowerCase();
		if (ltlower == 'data'){
			params.action = "update-data-params";
			var that = this;
			$.post(this._proxyUpdater, params, function(data, textStatus){})
				.done(function(){
					that.redraw();
				})
				.fail(function() {
				    console.log("could not post new data params.");
				});
		}else if(ltlower == 'mask'){
			params.action = "update-mask-params";
			var that = this;
			$.post(this._proxyUpdater, params, function(data, textStatus){})
				.done(function(){
					that.redraw();
				})
				.fail(function() {
				    console.log("could not post new mask params.");
				});
		}else{
			throw new Error('Could not set parameters. Is layertype in "data" or "mask"?');
		}
		return true;
	},
	setURL: function(url, layertype){
		/*
			Utility for changing the layer url in javascript. 
			layertype must be of "data" or "mask".
			_postURL sets the URL in php.
		*/
		var ltlower = layertype.toLowerCase();
		var strippedurl = L.Util.stripurl(url);
		if (ltlower == 'data'){
			this._dataseturl = strippedurl;
			this._postURL('data');
		}else if(ltlower == 'mask'){
			this._maskurl = strippedurl;
			this._postURL('mask');
		}else{
			throw new Error('Could not set url. Is layertype in "data" or "mask"?');
		}
		return true;
	},
	_setUpdaterBase: function(url){
		this._proxyUpdater = L.Util.stripurl(url);
	},
	_postURL: function(layertype){
		/*
			Send the updated URL to the php side.
			Only called by setURL functions.
		*/
		var ltlower = layertype.toLowerCase();
		if (ltlower == 'data'){
			$.post(this._proxyUpdater, {"action":"set-data-url", "url":this._dataseturl})
				.fail(function() {
				    console.log("could not post new data url.");
				});
		}else if(ltlower == 'mask'){
			$.post(this._proxyUpdater, {"action":"set-mask-url", "url":this._maskurl})
				.fail(function() {
				    console.log("could not post new mask url.");
				});
		}else{
			console.log('Could not set url. Is layertype in "data" or "mask"?');
		}
		return true;
	},
	_getDefaultWMSParams: function(){
		var defaultWmsParams = {
			service: 'WMS',
			request: 'GetMap',
			version: '1.1.1',
			layers: '',
			styles: '',
			format: 'image/png',
			transparent: true,
			srs: "EPSG:3857",
			height: '256',
			width: '256'
		};
		return defaultWmsParams;
	}
});

L.maskLayer.wms = function (datasetobj, maskobj, proxybase, options){
	return new L.MaskLayer.WMS(datasetobj, maskobj, proxybase, options);
};

L.MaskLayer.DynamicMapLayer = L.esri.DynamicMapLayer.extend({
	options : {},
	initialize: function(dataopts, maskopts, proxymaskbase) {
		this._setUpdaterBase(proxymaskbase+'/main.php');
		this._proxybase = L.Util.stripurl(proxymaskbase);;
		var top = this;
		var initopts = {"data":dataopts, "mask":maskopts};
		$.each(initopts, function(key, value){
			var defaultOpts = {
				updateInterval: 150,
		        layers: false,
		        layerDefs: false,
		        timeOptions: false,
		        format: "png24",
		        transparent: true,
		        f: "json"
		    };
		    top[key] = {};
		    top[key]["options"] = defaultOpts;
			value.url = L.Util.cleanUrl(value.url);
            top[key]["service"] = L.esri.mapService(value);
            top[key]["service"].addEventParent(top);
            if ((value.proxy || value.token) && value.f !== "json") {
                value.f = "json"
            }
            L.Util.setOptions(top[key], value);
		});
	},
	_update: function() {
        if (!this._map) {
            return;
        }
        var zoom = this._map.getZoom();
        var bounds = this._map.getBounds();
        if (this._animatingZoom) {
            return;
        }
        if (this._map._panTransition && this._map._panTransition._inProgress) {
            return;
        }
        if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
            return;
        }
        var dataparams = this._buildExportParams('data');
        var maskparams = this._buildExportParams('mask');
        this._requestExport(dataparams, maskparams, bounds);
    },
	//TO-DO: DynamicLayer setter/getters

    setURL: function(url, ltype) {
        this[ltype].options.url = L.Util.cleanUrl(url);
        return this
    },
    getLayers: function(ltype) {
        return this[ltype].options.layers
    },
    setLayers: function(layers, ltype) {
        this[ltype].options.layers = layers;
        return this
    },
    redraw: function(){
        this._update();
    },
    //TO-DO: Layer Defs, Time Options, Query, Identify, Find, PopupData
    _buildExportParams: function(ltype) {
        var bounds = this._map.getBounds();
        var size = this._map.getSize();
        var ne = this._map.options.crs.project(bounds.getNorthEast());
        var sw = this._map.options.crs.project(bounds.getSouthWest());
        var sr = parseInt(this._map.options.crs.code.split(":")[1], 10);
        var top = this._map.latLngToLayerPoint(bounds._northEast);
        var bottom = this._map.latLngToLayerPoint(bounds._southWest);
        if (top.y > 0 || bottom.y < size.y) {
            size.y = bottom.y - top.y
        }
        var params = {
            bbox: [sw.x, sw.y, ne.x, ne.y].join(","),
            size: size.x + "," + size.y,
            dpi: 96,
            format: this.options.format,
            transparent: this.options.transparent,
            bboxSR: sr,
            imageSR: sr
        };
        if (this[ltype].options.dynamicLayers) {
            params.dynamicLayers = this[ltype].options.dynamicLayers;
        }
        if (this[ltype].options.layers) {
            params.layers = "show:" + this[ltype].options.layers.join(",");
        }
        if (this[ltype].options.layerDefs) {
            params.layerDefs = JSON.stringify(this[ltype].options.layerDefs);
        }
        if (this[ltype].options.timeOptions) {
            params.timeOptions = JSON.stringify(this[ltype].options.timeOptions);
        }
        if (this[ltype].options.from && this.options.to) {
            params.time = this[ltype].options.from.valueOf() + "," + this[ltype].options.to.valueOf();
        }
        if (this[ltype].service.options.token) {
            params.token = this[ltype].service.options.token;
        }
        return params
    },
	_requestExport: function(dataprm, maskprm, bounds) {
		var top = this;
		dataprm.f = 'json';
		maskprm.f = 'json';

		var layersparams = {
			"action":"update-dmsl-params",
			"data-url":this.data.options.url,
			"data-params":$.param(dataprm),
			"mask-url":this.mask.options.url,
			"mask-params":$.param(maskprm)
		};
		console.log(this._proxyUpdater);
		$.post(this._proxyUpdater, layersparams, function(data, textstatus){
			var jsonparsed = JSON.parse(data);
			var du = jsonparsed.datahref;
			var mu = jsonparsed.maskhref;
			console.log(top._proxybase);
			var fullrequesturl = top._proxybase + '/getMaskedDMSLayer.php?data-layer-url=' +
				du + '&mask-layer-url=' + mu;
			top._renderImage(fullrequesturl, bounds);
		});
	},
	_buildRequestHtml: function(ltype, params){
		if (this[ltype].options.f === "json") {
			this[ltype].service.request("export", params, function(error, response) {
				if (error) {
					return;
				}
				return response.href;
			}, this);
		} else {
			params.f = "image";
			var href = this[ltype].options.url + "export" + L.Util.getParamString(params);
			return href;
		}
	},
	_setUpdaterBase: function(url){
		this._proxyUpdater = L.Util.stripurl(url);
	},
});

L.maskLayer.dynamicMapLayer = function (dataobj, maskobj, proxymaskbase) {
	return new L.MaskLayer.DynamicMapLayer(dataobj, maskobj, proxymaskbase);
}
}(window, document));