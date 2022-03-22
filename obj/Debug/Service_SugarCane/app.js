var app = angular.module('myApp', [
    'ngRoute',
    'ngSanitize',
    'ngCsv',
    'ng-fusioncharts',
    'ui.bootstrap.modal',
    'ui.bootstrap',
    'ui.select',
    'blockUI',
    'datePicker',
    'anguFixedHeaderTable',
    'leaflet-directive'
]);

/* app config */

app.config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when('/HOME-PAGE', { templateUrl: '../page/HTT-HOME.html', controller: 'HOME-PAGE' });
    /*- end home provider -*/
    $routeProvider.when('/HTT01-01-1', { templateUrl: '../page/HTT01-01-1.html', controller: 'HTT01-01-1' });
    $routeProvider.when('/HTT01-02-1', { templateUrl: '../page/HTT01-02-1.html', controller: 'HTT01-02-1' });
    $routeProvider.when('/HTT01-03-1', { templateUrl: '../page/HTT01-03-1.html', controller: 'HTT01-03-1' });
    /*- end HTT01 provider -*/
    $routeProvider.when('/HTT02-01-1', { templateUrl: '../page/HTT02-01-1.html', controller: 'HTT02-01-1' });
    $routeProvider.when('/HTT02-02-1', { templateUrl: '../page/HTT02-02-1.html', controller: 'HTT02-02-1' });
    $routeProvider.when('/HTT02-03-1', { templateUrl: '../page/HTT02-03-1.html', controller: 'HTT02-03-1' });
    $routeProvider.when('/HTT02-03-2', { templateUrl: '../page/HTT02-03-2.html', controller: 'HTT02-03-2' });
    $routeProvider.when('/HTT02-03-3', { templateUrl: '../page/HTT02-03-3.html', controller: 'HTT02-03-3' });
    $routeProvider.when('/HTT02-04-1', { templateUrl: '../page/HTT02-04-1.html', controller: 'HTT02-04-1' });
    $routeProvider.when('/HTT02-04-2', { templateUrl: '../page/HTT02-04-2.html', controller: 'HTT02-04-2' });
    $routeProvider.when('/HTT02-04-3', { templateUrl: '../page/HTT02-04-3.html', controller: 'HTT02-04-3' });
    $routeProvider.when('/HTT02-04-4', { templateUrl: '../page/HTT02-04-4.html', controller: 'HTT02-04-4' });
    $routeProvider.when('/HTT02-04-5', { templateUrl: '../page/HTT02-04-5.html', controller: 'HTT02-04-5' });
    /*- end HTT02 provider -*/
    $routeProvider.when('/HTT03-01-1', { templateUrl: '../page/HTT03-01-1.html', controller: 'HTT03-01-1' });
    $routeProvider.when('/HTT03-02-1', { templateUrl: '../page/HTT03-02-1.html', controller: 'HTT03-02-1' });
    $routeProvider.when('/HTT03-03-1', { templateUrl: '../page/HTT03-03-1.html', controller: 'HTT03-03-1' });
    $routeProvider.when('/HTT03-03-2', { templateUrl: '../page/HTT03-03-2.html', controller: 'HTT03-03-2' });
    $routeProvider.when('/HTT03-03-3', { templateUrl: '../page/HTT03-03-3.html', controller: 'HTT03-03-3' });
    $routeProvider.when('/HTT03-04-1', { templateUrl: '../page/HTT03-04-1.html', controller: 'HTT03-04-1' });
    $routeProvider.when('/HTT03-04-2', { templateUrl: '../page/HTT03-04-2.html', controller: 'HTT03-04-2' });
    $routeProvider.when('/HTT03-04-3', { templateUrl: '../page/HTT03-04-3.html', controller: 'HTT03-04-3' });
    $routeProvider.when('/HTT03-04-4', { templateUrl: '../page/HTT03-04-4.html', controller: 'HTT03-04-4' });
    $routeProvider.when('/HTT03-04-5', { templateUrl: '../page/HTT03-04-5.html', controller: 'HTT03-04-5' });
    $routeProvider.when('/HTT03-04-6', { templateUrl: '../page/HTT03-04-6.html', controller: 'HTT03-04-6' });
    /*- end HTT03 provider -*/
    $routeProvider.when('/HTT04-01-1', { templateUrl: '../page/HTT04-01-1.html', controller: 'HTT04-01-1' });
    $routeProvider.when('/HTT04-01-2', { templateUrl: '../page/HTT04-01-2.html', controller: 'HTT04-01-2' });
    $routeProvider.when('/HTT04-01-3', { templateUrl: '../page/HTT04-01-3.html', controller: 'HTT04-01-3' });
    /*- end HTT04 provider -*/
    $routeProvider.when('/HTT-EXTRA-01', { templateUrl: '../page/HTT-EXTRA-01.html', controller: 'HTT-EXTRA-01' });
    $routeProvider.when('/HTT-EXTRA-02', { templateUrl: '../page/HTT-EXTRA-02.html', controller: 'HTT-EXTRA-02' });
    $routeProvider.when('/HTT-EXTRA-03', { templateUrl: '../page/HTT-EXTRA-03.html', controller: 'HTT-EXTRA-03' });
    $routeProvider.when('/HTT-EXTRA-04', { templateUrl: '../page/HTT-EXTRA-04.html', controller: 'HTT-EXTRA-04' });
    $routeProvider.when('/HTT-EXTRA-05', { templateUrl: '../page/HTT-EXTRA-05.html', controller: 'HTT-EXTRA-05' });


    $routeProvider.when('/TEST', { templateUrl: '../page/TEST.html', controller: 'HTT-TEST' });
    /*- end HTT-EXTRA provider -*/
    $routeProvider.otherwise({ redirectTo: '/HOME-PAGE' });
    /*- end redirectTo provider -*/

});

/* app service */

app.service('$iService', function (leafletBoundsHelpers, $http) {

    // #region $webService
    this.url = function () {
      //  return 'http://localhost:9002/';
        return 'http://203.151.4.8:9002/';
    }

    this.host = function () {
       //return 'http://localhost:9001/';
        return 'http://203.151.4.8:9001/';
    }

    this.year = function () {
        return "5758";
    }
    // #endregion $webService

    // #region $map
    this.TemplateMap = function () {
        var templateMap = {
            defaults: {
                //tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                tilelayer: 'http://www.dee-map.com/geoserver/gwc/service/wms/dtc',
                maxZoom: 18,
                //zoomControlPosition: 'topright'
            },
            thailand: {
                lat: 16.48354,
                lng: 102.124187,
                zoom: 15
            },
            layers: {
                baselayers: {
                    DTC: {
                        name: 'DTC',
                        type: 'wms',
                        url: 'http://www.dee-map.com/geoserver/gwc/service/wms/dtc',
                        visible: true,
                        layerOptions: {
                            layers: 'Dee-Map',
                            format: 'image/png8',
                            maxZoom: 18,
                            minZoom: 0,
                            buffer: 0,
                            visibility: true,
                            isBaseLayer: true,
                            isDefaultLayer: true,
                            numZoomLevels: 18,
                            wrapDateLine: true,
                            transitionEffect: 'resize'
                        }
                    },
                    googleHybrid: {
                        name: 'Google',
                        layerType: 'HYBRID',
                        type: 'google'
                    }
                }

            },
            markers: new Array(),
            bounds: [],
            paths: {},
            geojson: {},
            legend: {
                "position": 'bottomleft',
                "colors": ['blue', 'red', 'yellow', 'green', '#FE642E'],
                "labels": ["ลานใน", "ลานนอก", "ลานเตรียม", "แปลงรถตัด", "แปลงคนตัด"]
            }
        }
        return templateMap;
    }

    this.OriginMap = function () {
        var osm = L.tileLayer.wms("http://www.dee-map.com/geoserver/gwc/service/wms/dtc", {
            layers: 'Dee-Map',
            format: 'image/png8',
            maxZoom: 18,
            minZoom: 0,
            buffer: 0,
            visibility: true,
            isBaseLayer: true,
            isDefaultLayer: true,
            numZoomLevels: 18,
            wrapDateLine: true,
            transitionEffect: 'resize'
        });

        return new L.Map('iMap', { layers: [osm], center: new L.LatLng(16.48354, 102.124187), zoom: 13 });
    }

    this.swap_ar = function (ar_latlng, callback) {
        for (var i = 0; i < ar_latlng[0].length; i++) {
            ar_latlng[0][i] = this.swap(ar_latlng[0][i], 1, 0);
        }
        callback(ar_latlng);
        return;
    }

    this.swap = function (input, index_A, index_B) {

        var temp = input[index_A];

        input[index_A] = input[index_B];
        input[index_B] = temp;
        return input;
    }

    this.isvalid_latlng = function (lat, lng) {
        var b = false;
        var dlng = parseFloat(lng);
        var dlat = parseFloat(lat);
        try {
            if (dlng <= -180 || dlng <= 180 && dlat > 0.0 || dlng > 0.0) {
                if (dlat <= -90 || dlat <= 90) {
                    b = true;
                }
            }
        } catch (e) {

            b = false;
        }

        return b;
    }

    this.Lat = function () {
        return 16.48354;
    }

    this.Lng = function () {
        return 102.124187;
    }

    this.Zoom = function () {
        return 13;
    }

    this.setPark_area = function (value) {
        var JsonStr = '';

        switch (value.area_name) {
            case 'ลานใน':
                JsonStr = {
                    "Park_inside": {
                        "data": { "features": [value], "type": "FeatureCollection" },
                        "style": {
                            "fillColor": 'blue',
                            "weight": 2,
                            "opacity": 1,
                            "color": 'white',
                            "dashArray": '3',
                            "fillOpacity": 0.7
                        },
                        "onEachFeature": function (feature, layer) {
                            var Thename = 'ลานใน';
                            var popupString = '<div class="popup">' + Thename + '</div>';
                            layer.bindPopup(popupString);
                        }
                    }
                }
                break;
            case 'ลานนอก':
                JsonStr = {
                    "Park_outside": {
                        "data": { "features": [value], "type": "FeatureCollection" },
                        "style": {
                            "fillColor": 'red',
                            "weight": 2,
                            "opacity": 1,
                            "color": 'white',
                            "dashArray": '3',
                            "fillOpacity": 0.7
                        },
                        "onEachFeature": function (feature, layer) {
                            var Thename = 'ลานนอก';
                            var popupString = '<div class="popup">' + Thename + '</div>';
                            layer.bindPopup(popupString);
                        }
                    }
                }
                break;
            case 'ลานเตรียม':
                JsonStr = {
                    "park_prepare": {
                        "data": { "features": [value], "type": "FeatureCollection" },
                        "style": {
                            "fillColor": 'yellow',
                            "weight": 2,
                            "opacity": 1,
                            "color": 'white',
                            "dashArray": '3',
                            "fillOpacity": 0.7
                        },
                        "onEachFeature": function (feature, layer) {
                            var Thename = 'ลานเตรียม';
                            var popupString = '<div class="popup">' + Thename + '</div>';
                            layer.bindPopup(popupString);
                        }
                    }
                }
                break;
        }

        return JsonStr;
    }

    this.setCutting_area = function (value, type) {
        var JsonStr = '';

        switch (type) {
            case '1': {
                JsonStr = {
                    "harvester_cutting": {
                        "data": value,
                        "style": {
                            "fillColor": 'green',
                            "weight": 2,
                            "opacity": 1,
                            "color": 'white',
                            "dashArray": '3',
                            "fillOpacity": 0.7
                        },
                        "onEachFeature": function (feature, layer) {
                            var popupString = '<div class="popup">เลขที่แปลง : ' + feature.area_code + '</div>';
                            layer.bindPopup(popupString);
                        }
                    }
                }
            } break;
            case '2': {
                JsonStr = {
                    "human_cutting": {
                        "data": value,
                        "style": {
                            "fillColor": '#FE642E',
                            "weight": 2,
                            "opacity": 1,
                            "color": 'white',
                            "dashArray": '3',
                            "fillOpacity": 0.7
                        },
                        "onEachFeature": function (feature, layer) {
                            var popupString = '<div class="popup">เลขที่แปลง : ' + feature.area_code + '</div>';
                            layer.bindPopup(popupString);
                        }
                    }
                }
            } break;
            default: {
                JsonStr = {
                    "harvester_cutting": {
                        "data": value,
                        "style": {
                            "fillColor": 'green',
                            "weight": 2,
                            "opacity": 1,
                            "color": 'white',
                            "dashArray": '3',
                            "fillOpacity": 0.7
                        },
                        "onEachFeature": function (feature, layer) {
                            var popupString = '<div class="popup">เลขที่แปลง : ' + feature.area_code + '</div>';
                            layer.bindPopup(popupString);
                        }
                    }
                }
            } break;
        }

        return JsonStr;
    }
    // #endregion $map

    // #region $chart
    this.chart_pie3D = function (chartName, object) {
        var charts = {
                chart:{
                    caption: chartName,
                    //subcaption: "Last Year",
                    startingangle: "120",
                    showlabels: "0",
                    showlegend: "1",
                    enablemultislicing: "0",
                    slicingdistance: "15",
                    showpercentvalues: "1",
                    showpercentintooltip: "0",
                    plottooltext: "Age group : $label Total visit : $datavalue",
                    theme: "fint"
                },
                data: object
        }
        return charts;
    }
    // #endregion $chart

    // #region $count
    this.coutPage = function (Row, valueDev) {
        Row = parseInt(Row);
        var count_Dev = parseInt(Row / valueDev);
        var count_Mod = Row % valueDev;
        if (count_Mod > 0) {
            Row = parseInt(count_Dev + 1);
        } else {
            if (count_Mod == 0) {
                Row = 1;
            } else {
                Row = Row;
            }
        }

        return Row;
    }

    this.countTable = function (json, callback) {
        $http.post(this.url() + 'count_table', json)
            .success(function (data) {
                if (data.count > 0) {
                    callback(data.count);
                } else {
                    callback(0);
                }
                return;

            })
            .error(function (data) {
                callback(0);
                return;
            });
    }
    // #endregion $count

    // #region $parseBounds
    this.Bounds = function (north, east, south, west) {
        var t = leafletBoundsHelpers.createBoundsFromArray([[north, east], [south, west]]);
        return t;
    }
    // #endregion $parseBounds

    // #region $fileUpload
    this.fileUpload = function (file, uploadUrl, callback) {
        var DataForm = new FormData();
        DataForm.append('file', file);

        $http.post(uploadUrl, DataForm, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        })
        .success(function (data) {
            callback(data);
            return;
        })
        .error(function () {
            callback('NO-Upload');
            return;
        });
    }
    // #endregion $fileUpload

    // #region $parseTime
    this.check_timeQuery = function (value) {
        if (value != '') {
            if (moment(value).isValid()) {
                return value;
            } else {
                return 'notTime';
            }
        } else {
            return null;
        }
    }

    this.timeStyle_A = function (time_A, time_B) {
        if (time_A != 'Invalid date' && time_B != 'Invalid date') {
            var splitTime = time_A.split('-');
            var year = localStorage.language == 'En' ? parseInt(splitTime[0]) : parseInt(splitTime[0]) + 543;
            var day = parseInt(splitTime[2]);
            var month;
            switch (parseInt(splitTime[1])) {
                case 1: month = localStorage.language == 'En' ? 'January' : 'มกราคม'; break;
                case 2: month = localStorage.language == 'En' ? 'February' : 'กุมภาพันธ์'; break;
                case 3: month = localStorage.language == 'En' ? 'March' : 'มีนาคม'; break;
                case 4: month = localStorage.language == 'En' ? 'April' : 'เมษายน'; break;
                case 5: month = localStorage.language == 'En' ? 'May' : 'พฤษภาคม'; break;
                case 6: month = localStorage.language == 'En' ? 'June' : 'มิถุนายน'; break;
                case 7: month = localStorage.language == 'En' ? 'July' : 'กรกฎาคม'; break;
                case 8: month = localStorage.language == 'En' ? 'August' : 'สิงหาคม'; break;
                case 9: month = localStorage.language == 'En' ? 'September' : 'กันยายน'; break;
                case 10: month = localStorage.language == 'En' ? 'October' : 'ตุลาคม'; break;
                case 11: month = localStorage.language == 'En' ? 'November' : 'พฤศจิกายน'; break;
                case 12: month = localStorage.language == 'En' ? 'December' : 'ธันวาคม'; break;
            }

            var point = localStorage.language == 'En' ? ' O`clock' : ' น.';

            var timeCreate = day + ' ' + month + ' ' + year + ' / ' + time_B + point;
        } else {
            var timeCreate = '';
        }

        return timeCreate;

    }

    this.timeStyle_B = function (value) {
        return Math.floor(value / 60);
    }

    this.timeStyle_C = function (time_A, time_B) {
        if (time_A != 'Invalid date' && time_B != 'Invalid date') {
            var splitTime = time_A.split('-');
            var year = parseInt(splitTime[0]) + 543;
            var day = parseInt(splitTime[2]);
            var month;
            switch (parseInt(splitTime[1])) {
                case 1: month = 'มกราคม'; break;
                case 2: month = 'กุมภาพันธ์'; break;
                case 3: month = 'มีนาคม'; break;
                case 4: month = 'เมษายน'; break;
                case 5: month = 'พฤษภาคม'; break;
                case 6: month = 'มิถุนายน'; break;
                case 7: month = 'กรกฎาคม'; break;
                case 8: month = 'สิงหาคม'; break;
                case 9: month = 'กันยายน'; break;
                case 10: month = 'ตุลาคม'; break;
                case 11: month = 'พฤศจิกายน'; break;
                case 12: month = 'ธันวาคม'; break;
            }

            var point = ' น.';

            var timeCreate = day + ' ' + month + ' ' + year + ' / ' + time_B + point;
        } else {
            var timeCreate = '';
        }

        return timeCreate;

    }

    this.timeStyle_E = function (value) {
        var day = moment(value).format('DD');
        var month = parseInt(moment(value).format('MM'));
        var year = parseInt(moment(value).format('YYYY')) + 543;

        switch (month) {
            case 1: month = 'มกราคม'; break;
            case 2: month = 'กุมภาพันธ์'; break;
            case 3: month = 'มีนาคม'; break;
            case 4: month = 'เมษายน'; break;
            case 5: month = 'พฤษภาคม'; break;
            case 6: month = 'มิถุนายน'; break;
            case 7: month = 'กรกฎาคม'; break;
            case 8: month = 'สิงหาคม'; break;
            case 9: month = 'กันยายน'; break;
            case 10: month = 'ตุลาคม'; break;
            case 11: month = 'พฤศจิกายน'; break;
            case 12: month = 'ธันวาคม'; break;
        }

        var timeCreate = day + ' ' + month + ' ' + year;

        return timeCreate;

    }

    this.timeStyle_F = function (value) {
        var day = moment(value).format('DD');
        var month = parseInt(moment(value).format('MM'));
        var year = parseInt(moment(value).format('YYYY')) + 543;
        var time = moment(value).format('HH:mm');

        switch (month) {
            case 1: month = 'มกราคม'; break;
            case 2: month = 'กุมภาพันธ์'; break;
            case 3: month = 'มีนาคม'; break;
            case 4: month = 'เมษายน'; break;
            case 5: month = 'พฤษภาคม'; break;
            case 6: month = 'มิถุนายน'; break;
            case 7: month = 'กรกฎาคม'; break;
            case 8: month = 'สิงหาคม'; break;
            case 9: month = 'กันยายน'; break;
            case 10: month = 'ตุลาคม'; break;
            case 11: month = 'พฤศจิกายน'; break;
            case 12: month = 'ธันวาคม'; break;
        }

        var timeCreate = day + ' ' + month + ' ' + year + ' ' + time + ' น.';

        return timeCreate;
    }
    // #endregion $parseTime

    // #region $startGet
    this.get_zone = function (callback) {
        $http.get(this.url() + 'get_zone')
            .success(function (data) {
                if (data != 'No-Query') {
                    var zone = []; var Row = null; var td = 0;
                    var DevRow = data.length / 2; var ModRow = data.length % 2;
                    if (ModRow > 0) { Row = parseInt(DevRow + 1); } else { Row = parseInt(DevRow); }

                    for (var i = 0; i < Row; i++) {
                        var sum = i + td + 1;
                        if (sum <= data.length) { zone.push({ "td1": data[i + td].zone, "td2": data[sum].zone }); } else { zone.push({ "td1": data[i + td].zone, "td2": '' }); }
                        td++;
                    }

                    callback(zone);
                    return;
                } else {
                    callback(null);
                    return;
                }
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_blackbox = function (callback) {
        $http.get(this.url() + 'get_blackbox')
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_havester = function (callback) {
        $http.get(this.url() + 'get_harvester')
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(Enumerable.From(data).Select(function (x) { return x.havest_vehicle_code }).ToArray());
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_truck = function (callback) {
        $http.get(this.url() + 'get_truck')
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(Enumerable.From(data).Select(function (x) { return x.truck_vehicle_code }).ToArray());
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_NoneRegister = function (vehicle_type, callback) {
        $http.get(this.url() + 'non_register_gps/' + vehicle_type)
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_trackingHavest = function (callback) {
        //  console.log('get_trackingHavest' + 'localStorage.rule' + localStorage.rule);
        //    $http.get(this.url() + 'tracking_havester')

        $http.get(this.url() + 'tracking_havester/' + localStorage.rule)
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_workingHavest = function (callback) {
        $http.get(this.url() + 'working_havester/' + localStorage.rule)
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_outofAreaH = function (callback) {
        $http.get(this.url() + 'havester_out_of_area/' + localStorage.rule)
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_trackingTruck = function (callback) {
        $http.get(this.url() + 'tracking_truck/' + localStorage.rule)
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_workingTruck = function (callback) {
        $http.get(this.url() + 'working_truck/' + localStorage.rule)
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_truckofStatus = function (callback) {
        $http.get(this.url() + 'truck_of_status/' + localStorage.rule)
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_importanArea = function (callback) {
        $http.get(this.url() + 'get_importanArea')
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_reletion_tracking = function (vehicle_code, sql_colum, callback) {
        $http.get(this.url() + 'reletion_tracking/' + vehicle_code + '/' + sql_colum)
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_cut_to_crush = function (callback) {
        $http.get(this.url() + 'cut_to_crush')
            .success(function (data) {
                if (data != 'No-Query') {
                    callback(data);
                } else {
                    callback(null);
                }
                return;
            })
            .error(function (data) {
                callback(null);
                return;
            });
    }

    this.get_parameter = function (service_name, callback) {
        $http.get(service_name)
            .success(function (data) {
                callback(data);
                return;
            })
            .error(function (error) {
                callback([]);
                return;
            });
    }

    this.post_parameter = function (service_name, StrJson, callback) {
        $http.post(service_name, StrJson)
            .success(function (data) {
                callback(data);
                return;
            })
            .error(function () {
                callback('No-Query');
                return;
            });
    }
    // #endregion $startGet

    // #region $language
    this.ThaiLanguage = function () {
        return {
            "main_menu": {
                "menu_HEAD": ["ภาษา","ออกจากระบบ","เมนู", "มอนิเตอร์รถ"],
                "menu_A": ["ระบบจัดการ","จัดการพื้นที่แปลง","จุดพิกัดที่น่าสนใจ","จัดการพื้นที่โรงงาน"],
                "menu_B": ["ระบบรถตัด", "ลงทะเบียน GPS รถตัด", "แปลงตัดของรถ", "การติดตาม", "ด้านการใช้งาน", "ด้านการปฎิบัติงาน", "ด้านปฎิบัติงานนอกพื้นที่", "การรายงาน", "ด้านการใช้งาน", "ด้านการปฎิบัติงาน", "ด้านการทำงานย้อนหลัง", "ด้านการตัดนอกพื้นที่", "ด้านเชื้อเพลิง"],
                "menu_C": ["ระบบรถบรรทุก", "ลงทะเบียน GPS รถบรรทุก", "การจับคู่กับรถตัด", "การติดตาม", "ข้อมูลการใช้งาน", "ข้อมูลการปฎิบัติงาน", "สถานะของรถ", "การรายงาน", "รายงานการใช้งาน", "รายงานการปฎิบัติงาน", "การทำงานย้อนหลัง", "รายงานการรอคอย", "รายงานเชื้อเพลิง", "รายงานระยะทางเฉลี่ย"],
                "menu_D": ["ระบบอ้อย", "อ้อยในรถบรรทุก และ พื้นที่", "ปริมาณอ้อยสะสม", "Cut to Crush Time"],
                "menu_E": ["ระบบเพิ่มเติม","การใช้งานรถบรรทุก","แจ้งข้อมูลรถตัดเสีย","รายงานรถตัดเสีย","แจ้งรถบรรทุกเสีย","รายงานรถบรรทุกเสีย"]
            },
            /* HTT01 */
            "HTT01_01_1": {
                "modal": ["ยืนยันการแก้ไข", "แปลงที่ทำการแก้ไข", "หมายเลขโคว", "ตกลง", "ยกเลิก"],
                "content": ["พื้นที่แปลง", "ฟอร์ม - อัพโหลด", "นำเข้า - พื้นที่แปลง", "อัพโหลด","แผนที่","รายการพื้นที่","หมายเลขแปลง...", "บันทึก", "ล้าง"],
                "table": ["ลำดับ","หมายเลขแปลง","หมายเลขโควต้า"]
            },
            "HTT01_02_1": {
                "modal": ["เงื่อนไขผิดพลาด", "กรุณาระบุชื่อพิกัดที่ต้องการค้นหา", "ผลการค้นหา", "ไม่พบข้อมูลสถานที่", "การบันทึก > สำเร็จ", "ระบบบันทึกข้อมูลเสร็จสิ้น", "การบันทึก > ล้มเหลว", "การบันทึกข้อมูลล้มเหลว"],
                "content": ["จุดที่น่าสนใจ","ค้นหาพิกัด","จำนวน","จำนวนการค้นหา","มาตราฐาน","แผนที่", "แก้ไข", "ล้าง", "ฟอร์มรายละเอียด", "บันทึก"],
                "table": ["ลำดับ.", "ชื่อสถานที่"],
                "form": ["ชื่อสถานที่", "ละติจูด", "ลองติจูด", "รัศมี", "ตำบล", "อำเภอ", "จังหวัด"]
            },
            "HTT01_03_1": {
                "content": ["พื้นที่สำคัญ", "ฟอร์ม - อัพโหลด", "นำเข้า - พื้นที่สำคัญ", "อัพโหลด", "แผนที่", "ค้นหาพื้นที่ ...", "รายละเอียดพื้นที่"],
                "form": ["ชื่อพื้นที่", "ละติจูด", "ลองติดจูด", "ขนาดพื้นที่", "ตำบล", "อำเภอ", "จังหวัด"]
            },
            /* HTT02 */
            "HTT02_01_1": {
                "content": ["ลงทะเบียน GPS รถตัด", "ไม่ลงทะเบียน", "ฟอร์ม - ลงทะเบียน", "บันทึก", "ลงทะเบียน", "รถที่ยังไม่ลงทะเบียน", "รถที่ลงทะเบียน", "ลงทะเบียน GPS", "ยกเลิกการลงทะเบียน", "อัพเดทข้อมูลลงทะเบียน", "อัพเดทข้อมูล"],
                "table": ["ลำดับ.", "รหัสรถตัด", "รุ่น"],
                "form": ["BP เจ้าของรถตัด", "เขต", "รหัสรถตัด", "ชื่อ-สกุล เจ้าของรถ", "ประเภทกลุ่มรถตัด", "ยี่่ห้อ", "รุ่น", "หมายเลขกล่อง GPS", "หมายเลขซิม", "...เลือกรหัสรถตัด...", "...เลือกรหัสกล่อง..."]
            },
            "HTT02_02_1": {
                "content": ["พื้นที่แปลงตัดของรถตัด", "...ค้นหาข้อมูลรถตัด...", "รายละเอียด - รถตัด", "รายละเอียด - พื้นที่", "ฟอร์ม", "แผนที่", "รายการพื้นที่", "รายละเอียด - รถตัดที่ไม่จับคู่"],
                "table": ["หมายเลขแปลง","พิกัดแปลง"],
                "form": ["ปีการผลิต","วันที่","รหัสรถตัด","ชื่อ-สกุล เจ้าของรถตัด","เบอร์โทรศัพท์","ประเภทกลุ่มรถตัด"]
            },
            "HTT02_03_1": {
                "content": ["ติดตามสถานะรถตัด / ด้านการใช้งาน", "อัพเดทในอีก : ", "...ค้นหาข้อมูล..."],
                "table": ["รถตัดทั้งหมด", "พร้อมใช้งาน", "เสีย", "รหัสรถตัด", "สถานะ", "รายละเอียด", "ตำแหน่ง", "เจ้าของรถตัด", "เบอร์โทรศัพท์"],
                "graph": ["กราฟ : สถานะการใช้งาน", "พร้อมใช้งาน", "รถเสีย"]
            },
            "HTT02_03_2": {
                "content": ["ติดตามสถานะรถตัด / ด้านการปฏิบัติงาน", "อัพเดทในอีก : ", "...ค้นหารหัสรถตัด..."],
                "table": ["รถตัดทั้งหมด", "จอดดับเครื่อง", "จอดติดเครื่อง", "กำลังเดินทาง", "กำลังตัดอ้อยลำเลียง", "หมายเลขรถตัด", "สถานะ", "รายละเอียด", "ตำแหน่ง","หมายเลขแปลง","เจ้าของแปลง","เบอร์โทรศัพท์","เจ้าของรถตัด"],
                "graph": ["กราฟ : สถานะการปฏิบัติงาน", "จอดดับเครื่อง", "จอดติดเครื่อง", "กำลังเดินทาง", "กำลังตัดอ้อยลำเลียง"]
            },
            "HTT02_03_3": {
                "content": ["รถตัดปฏิบัติงานนอกพื้นที่", "...ค้นหารหัสรถตัด...", "อัพเดทในอีก : "],
                "table": ["รถตัดทั้งหมด", "ปฏิบัติงานนอกพื้นที่", "หมายเลขรถตัด", "สถานะ", "รายละเอียด", "หมายเลขแปลง", "เจ้าของแปลง", "เบอร์โทรศัพท์", "เจ้าของรถตัด" ]
            },
            "HTT02_04_1": {
                "content": ["รายงานสรุปสถานะรถตัด / ด้านการใช้งาน", "ช่วงเวลา", "เวลาเริ่ม", "เวลาสิ้นสุด", "รูปแบบ", "ข้อมูลรายวัน", "ข้อมูลรายสะสม", "รายงานสถานะรถตัดด้านการใช้งาน ณ วันที่", "ออกรายงาน", "ออก"],
                "table": ["วันที่", "จำนวนรถตัดที่เสีย", "จำนวนครั้งที่เสียรวม", "ระยะเวลาเสียรวม (ชม.)", "ลำดับ.", "รหัสรถตัด", "จำนวนครั้งที่เสียรวม", "ระยะเวลาเสียรวม"],
                "graph": ["กราฟ : สรุปรายงานสถาะรถตัดด้านการใช้งาน", "พร้อมใช้งาน", "รถเสีย"]
            },
            "HTT02_04_2": {
                "content": ["รายงานสรุปสถานะรถตัด / ด้านการปฏิบัติงาน", "ช่วงเวลา", "เวลาเริ่ม", "เวลาสิ้นสุด", "รูปแบบ", "ข้อมูลรายวัน", "ข้อมูลรายสะสม", "รายงานสถานะรถตัดด้านการปฏิบัติงาน ณ วันที่", "ออกรายงาน", "ออก"],
                "table": ["วันที่", "รวม (ชม.)", "จอดดับเครื่อง", "จอดติดเครื่อง", "กำลังเดินทาง", "ตัดอ้อยลำเลียง", "ประสิทธิภาพ", "ลำดับ.", "รหัสรถตัด"],
                "graph": ["กราฟ : สถานะรถ", "กราฟ : สถานะการตัดอ้อยลำเลียง", "จอดดับเครื่อง", "จอดติดเครื่อง", "กำลังเดินทาง", "ตัดอ้อยลำเลียง", "อื่น ๆ"]
            },
            "HTT02_04_3": {
                "content_history": ["รายงานตรวจสอบสถานะรถตัด / ด้านการทำงานย้อนหลัง", "รหัสรถตัด", "เริ่มต้น", "สิ้นสุด", "รถเสียชำรุด", "รถจอดดับเครื่อง", "รถจอดติดเครื่อง", "รถกำลังเดินทาง", "รถตัดอ้อยลำเลียง"],
                "table_history": ["รหัสรถตัด", "เวลาสะสมที่เสีย (ชม.)", "จอดดับเครื่องรวม (ชม.)", "จอดติดเครื่องรวม (ชม.)", "เดินทางรวม (ชม.)", "ตัดอ้อยลำเลียงรวม (ชม.)", "ลำดับ.", "เริ่มเวลาบันทึก", "วันที่บันทึก", "เวลาเลิกบันทึก", "รวมเวลา", "ตำบล", "อำเภอ", "เลขแปลง", "เขต", "แผนที่"],
                "content_activity": ["รหัสรถตัด", "ช่วงเวลา"],
                "table_activity": ["ลำดับ.", "ลำดับกิจกรรม (รถตัด)", "รถบรรทุกที่มาจับคู่", "ลำดับกิจกรรม (รถบรรทุก)"]
            },
            "HTT02_04_4": {
                "content": ["รายงานการใช้รถตัดนอกพื้นที่กำหนด", "ช่วงเวลา", "เวลาเริ่ม", "เวลาสิ้นสุด", "รูปแบบ", "ข้อมูลรายวัน", "ข้อมูลรายสะสม", "รายงานการใช้รถตัดนอกพื้นที่ที่กำหนด ณ ช่วงวันที่", "ออกรายงาน", "ออก"],
                "table": ["วันที่", "ปฎิบัติงานนอกพื้นที่", "(ชม.)", "จำนวนรถตัดรวมที่", "จำนวนครั้งรวมที่", "ระยะเวลารวมที่", "ลำดับ.", "รหัสรถตัด", "ระยะเวลาที่ปฏิบัติงานนอกพื้นที่ (ชม.)", "ตำแหน่ง", "หมายเลขแปลง"]
            },
            "HTT02_04_5": {
                "content": ["รายงานสรุปการใช้เชื้อเพลิงของรถตัด", "ช่วงเวลา", "เวลาเริ่ม", "เวลาสิ้นสุด", "รหัสรถตัด"],
                "table": ["วันที่", "ปริมาณการใช้", "ระยะเวลาในการ", "เฉลี่ยอัตตราการใช้", "เชื้อเพลิงสะสม (ลิตร)", "ทำงานสะสม (ชม.)", "เชื้อเพลิง (ลิตร/ชม.)"]
            },
            /* HTT03 */
            "HTT03_01_1": {
                "content": ["ลงทะเบียน GPS รถบรรทุก", "ไม่ลงทะเบียน", "ฟอร์ม - ลงทะเบียน", "บันทึก", "ลงทะเบียน", "รถที่ยังไม่ลงทะเบียน", "รถที่ลงทะเบียน", "ลงทะเบียน GPS", "ยกเลิกการลงทะบียน", "อัพเดทข้อมูลลงทะเบียน", "อัพเดทข้อมูล"],
                "table": ["ลำดับ.", "รหัสรถบรรทุก", "รุ่น"],
                "form": ["รหัสรถบรรทุก", "ชื่อ-สกุล เจ้าของรถ", "ประเภทรถบรรทุก", "ยี่ห้อ", "รุ่น", "ทะเบียนรถ", "จังหวัด", "หมายเลขกล่อง GPS", "หมายเลขซิม", "...เลือกรหัสรถบรรทุก...", "...เลือกหมายเลขกล่อง..."]
            },
            "HTT03_02_1": {
                "content": ["การจับคู่กับรถตัด", "...ค้นหาข้อมูลรถบรรทุก...", "รายละเอียด - รถบรรทุก", "รายละเอียด - รถบรรทุกที่ไม่จับคู่", "ฟอร์ม", "รายการรถตัด", "ไม่มีการจับคู่"],
                "table": ["ลำดับ.", "รหัสรถบรรทุก", "รหัสรถตัด", "ชื่อ-สกุล เจ้าของรถ"],
                "form": ["ปีการผลิต", "วันที่", "รหัสรถบรรทุก", "ชื่อ-สกุล เจ้าของรถบรรทุก", "เบอร์โทรศัพท์", "ประเภทรถบรรทุก", "ทะเบียนรถ", "จังหวัด"]
            },
            "HTT03_03_1": {
                "content": ["ติดตามสถานะรถบรรทุก / ด้านการใช้งาน", "อัพเดทในอีก : ", "...ค้นหาข้อมูล..."],
                "table": ["รถบรรทุกทั้งหมด", "พร้อมใช้งาน", "เสีย", "ลำดับ.", "รหัสรถบรรทุก", "ทะเบียนรถ", "สถานะ", "รายละเอียด", "ตำแหน่ง", "เจ้าของรถบรรทุก", "เบอร์โทรศัพท์"],
                "graph": ["กราฟ : สถานะการใช้งาน", "พร้อมใช้งาน", "รถเสีย"]
            },
            "HTT03_03_2": {
                "content": ["ติดตามสถานะรถบรรทุก / ด้านการปฏิบัติงาน", "อัพเดทในอีก : ", "...ค้นหาข้อมูล..."],
                "table": ["รถบรรทุกทั้งหมด", "จอดดับเครื่อง", "จอดติดเครื่อง", "กำลังเดินทาง", "กำลังรับอ้อย", "ลำดับ.", "รหัสรถบรรทุก", "ทะเบียนรถ", "สถานะ", "รายละเอียด", "ตำแหน่ง", "หมายเลขแปลง", "เจ้าของแปลง", "เจ้าของรถบรรทุก", "เบอร์โทรศัพท์"],
                "graph": ["กราฟ : สถานะรถ", "กราฟ : สถานะการรับอ้อย", "จอดดับเครื่อง", "จอดติดเครื่อง", "กำลังเดินทาง", "กำลังรับอ้อย", "รถบรรทุกทั้งหมด"]
            },
            "HTT03_03_3": {
                "content": ["ตรวจสอบสถานะการบรรทุก", "อัพเดทในอีก : ", "...ค้นหาข้อมูล..."],
                "table": ["รถบรรทุกทั้งหมด", "ขนส่งเที่ยวหนัก (คัน)", "ขนส่งเที่ยวเปล่า (คัน)", "ลำดับ.", "รหัสรถบรรทุก", "ทะเบียนรถ", "สถานะ", "รายละเอียด", "ตำแหน่ง", "หมายเลขแปลง", "เจ้าของแปลง", "เจ้าของรถบรรทุก", "เบอร์โทรศัพท์", "รับอ้อยในไร่", "ออกจากไร่", "จอดลานนอก", "ออกจากโรงงาน"],
                "graph": ["กราฟ : สถานะการบรรทุก", "ขนส่งเที่ยวหนัก", "ขนส่งเที่ยวเปล่า"]
            },
            "HTT03_04_1": {
                "content": ["รายงานสรุปสถานะรถบรรทุก / ด้านการใช้งาน", "ช่วงเวลา", "เวลาเริ่ม", "เวลาสิ้นสุด", "ประเภท", "ทั้งหมด", "รถสิบล้อ", "รถสิบล้อพ่วง", "รถสาลี่", "รถเทรลเลอร์", "รูปแบบ", "ข้อมูลรายวัน", "ข้อมูลรายสะสม"],
                "table": ["วันที่", "ประเภท", "จำนวนรถบรรทุกที่เสีย", "จำนวนครั้งที่เสียรวม", "ระยะเวลาที่เสียรวม (ชม.)"],
                "graph": ["กราฟ : สถานะการใช้งาน", "พร้อมใช้งาน", "รถเสีย"]
            },
            "HTT03_04_2": {
                "content": ["รายงานสรุปสถานะรถบรรทุก / ด้านการปฏิบัติงาน", "ช่วงเวลา", "เวลาเริ่ม", "เวลาสิ้นสุด", "ประเภท", "ทั้งหมด", "รถสิบล้อ", "รถสิบล้อพ่วง", "รถสาลี่", "รถเทรลเลอร์", "รูปแบบ", "ข้อมูลรายวัน", "ข้อมูลรายสะสม", "รายงานสถานะรถบรรทุกด้านการปฏิบัติงาน ณ ช่วงวันที่", "ออกรายงาน", "ออก"],
                "table": ["วันที่", "ประเภท", "รวม (ชม.)", "จอดดับเครื่อง", "จอดติดเครื่อง", "กำลังเดินทาง", "กำลังรับอ้อย", "ประสิทธิภาพ", "รหัสรถบรรทุก", "ทะเบียนรถ"],
                "graph": ["กราฟ : สถานะรถ", "จอดดับเครื่อง", "จอดติดเครื่อง", "กำลังเดินทาง", "กราฟ : สถานะการรับอ้อย", "กำลังรับอ้อย", "รถบรรทุกทั้งหมด"]
            },
            "HTT03_04_3": {
                "content_history": ["รายงานตรวจสอบสถานะรถบรรทุก / ด้านการทำงานย้อนหลัง", "รหัสรถบรรทุก", "เริ่มต้น", "สิ้นสุด", "รถเสียชำรุด", "รถจอดดับเครื่อง", "รถจอดติดเครื่อง", "รถกำลังเดินทาง", "รถรับอ้อยรวม"],
                "table_history": ["รหัสรถบรรทุก", "ทะเบียนรถ", "ประเภท", "เวลาสะสมที่เสีย (ชม.)", "จอดดับเครื่องรวม (ชม.)", "จอดติดเครื่องรวม (ชม.)", "เดินทางรวม (ชม.)", "รถรับอ้อยรวม (ชม.)", "ลำดับ.", "เริ่มเวลาบันทึก", "วันที่บันทึก", "เวลาเลิกบันทึก", "รวมเวลา", "ตำบล", "อำเภอ", "เลขแปลง", "เขต", "แผนที่"],
                "content_activity": ["รหัสรถบรรทุก", "ช่วงเวลา"],
                "table_activity": ["ลำดับ.", "ลำดับกิจกรรม (รถบรรทุก)", "รถตัดที่มีการจับคู่", "ลำดับกิจกรรม (รถตัด)"]
            },
            "HTT03_04_4": {
                "content": ["รายงานการรอคอยของรถบรรทุกตามจุดต่าง ๆ", "ช่วงเวลา", "เวลาเริ่ม", "เวลาสิ้นสุด", "ประเภท", "ทั้งหมด", "รถสิบล้อ", "รถสิบล้อพ่วง", "รถสาลี่", "รถเทรลเลอร์", "รูปแบบ", "ข้อมูลรายวัน", "ข้อมูลรายสะสม"],
                "table": ["วันที่", "ประเภท", "เวลารวมรอในไร่ (ชม.)", "เวลารวมรอลานนอก (ชม.)", "เวลารวมรอลานเตรียม (ชม.)", "เวลารวมรอลานใน (ชม.)"],
                "graph": ["กราฟ : สถานะการรอคอย", "รอในไร่", "รอลานนอก", "รอลานเตรียม", "รอลานใน"]
            },
            "HTT03_04_5": {
                "content": ["รายงานสรุปการใช้เชื้อเพลิงของรถบรรทุก", "ช่วงเวลา", "เวลาเริ่ม", "เวลาสิ้นสุด", "รหัสรถบรรทุก"],
                "table": ["วันที่", "ทะเบียนรถ", "ประเภทรถ", "ปริมาณการใช้", "เชื้อเพลิงสะสม (ลิตร)", "ระยะเวลาในการ", "ทำงานสะสม (ชม.)", "เฉลี่ยอัตตราการใช้", "เชื้อเพลิง (ลิตร/ชม.)"],
            },
            "HTT03_04_6": {
                "content": ["รายงาน", "ระยะทางเฉลี่ยจากจุดรับอ้อยถึงโรงงาน", "รหัสรถบรรทุก", "ค้นหารถ"],
                "table": ["รหัสรถบรรทุก", "วันที่เริ่ม", "วันสิ้นสุด", "เขต", "รหัสรถตัด", "ทะเบียนรถ", "เลขแปลง", "ตำแหน่ง", "ระยะทาง GPS"]
            },
            /* HTT04 */
            "HTT04_01_1": {
                "content": ["อ้อยในรถบรรทุก และ พื้นที่", "อัพเดทในอีก : ", "ตาราง : ปริมาณอ้อย (ตัน)", "...ค้นหาข้อมูล..."],
                "table": ["รถบรรทุกทั้งหมด", "ขนส่งเที่ยวหนัก (คัน)", "เดินรถเที่ยวเปล่า (คัน)", "ทั้งหมด", "ในไร่", "บนถนน", "ลานนอก", "ลานเตรียม", "	ลานใน", "ลำดับ.", "รหัสรถบรรทุก", "ทะเบียนรถ", "ประเภท", "สถานะ", "รายละเอียด", "ตำแหน่ง", "ปริมาณอ้อย (ตัน)", "เจ้าของรถบรรทุก", "เบอร์โทรศัพท์"],
                "graph": ["กราฟ : สถานะอ้อยในแต่ละสถานที่", "ไร่", "ถนน", "ลานนอก", "ลานเตรียม", "ลานใน"],
            },
            "HTT04_01_2": {
                "content": ["ปริมาณอ้อยสะสมรายวัน ที่เกิดจากรถตัด", "...ค้นหาข้อมูล..."],
                "table": ["รหัสรถตัด", "ระยะเวลาสะสมการตัด (ชม.)", "ปริมาณอ้อยสะสมรายวัน (ตัน)"]
            },
            "HTT04_01_3": {
                "content": ["ตรวจสอบเวลาใบสั่งตัด", "วันปัจจุบัน", "ระบุวัน", "...ค้นหาข้อมูล...", "...เวลาเริ่มต้น...", "...เวลาสิ้นสุด..."],
                "table": ["ลำดับ.", "เลขแปลง", "เวลาที่เริ่มตัดอ้อย", "รหัสรถตัด", "เวลาถึงโรงงาน", "รหัสรถบรรทุก", "ทะเบียนรถ", "ประเภท", "รหัสใบสั่งตัด", "เวลารวม", "ผลลัพธ์ใบสั่งตัด", "ส่งข้อมูลใหม่"]
            },
            /* HTTEXTRA */
            "EXTRA_01": {
                "content": ["การใช้งานรถบรรทุก"],
                "table": ["รหัสประเภท", "ชนิดของรถ", "ปริมาณบรรทุก (ตัน)", "หน่วยงาน"]
            },
            "EXTRA_02": {
                "content": ["การแจ้งเสีย", "แก้ไขการแจ้งเสีย", "ฟอร์ม - ข้อมูล", "บันทึก"],
                "table": ["ลำดับ.", "รถที่แจ้ง", "สาเหตุ"],
                "form": ["ปรถเภทรถ", "เขต", "รหัสรถตัด", "ประเภทการเสีย", "สถานะ", "อาการที่เสีย", "ความเห็นจากช่าง", "ผู้แจ้งข้อมูล", "วันที่รถเสีย", "ซ่อมเสร็จ"]
            },
            "EXTRA_03": {
                "content": ["รายงานสถานะรถตัดเสีย", "เริ่ม", "ถึง", "เขต", "สถานะ"],
                "table": ["ลำดับ.", "รหัสรถตัด", "ประเภท", "เขต", "ประเภทการเสีย", "อาการที่เสีย", "ความเห็นจากช่าง", "วันที่แจ้ง", "วันที่เสีย", "วันที่ซ่อมเสร็จ", "ผู้แจ้ง", "สถานะ"]
            },
            "EXTRA_04": {
                "content": ["การแจ้งเสีย", "แก้ไขการแจ้งเสีย", "ฟอร์ม - ข้อมูล", "บันทึก"],
                "table": ["ลำดับ.", "รถที่แจ้ง", "สาเหตุ"],
                "form": ["ปรถเภทรถ", "เขต", "รหัสรถบรรทุก", "ประเภทการเสีย", "สถานะ", "อาการที่เสีย", "ความเห็นจากช่าง", "ผู้แจ้งข้อมูล", "วันที่รถเสีย", "ซ่อมเสร็จ"]
            },
            "EXTRA_05": {
                "content": ["รายงานสถานะรถบรรทุกเสีย", "เริ่ม", "ถึง", "เขต", "สถานะ"],
                "table": ["ลำดับ.", "รหัสรถรถบรรทุก", "ประเภท", "เขต", "ประเภทการเสีย", "อาการที่เสีย", "ความเห็นจากช่าง", "วันที่แจ้ง", "วันที่เสีย", "วันที่ซ่อมเสร็จ", "ผู้แจ้ง", "สถานะ"]
            }
        }
    }

    this.EnglishLanguage = function () {
        return {
            "main_menu": {
                "menu_HEAD": ["Language", "Log Out","Menu", "Monitor"],
                "menu_A": ["Setup & Configuration", "Upload Area", "Interesting Area", "Important Area"],
                "menu_B": ["Harvester Monitor", "Register Gps", "Harvester Area", "Tracking", "Usability Tracking", "Performance Tracking", "Outsize Tracking", "Report", "Usability Report", "Performance Report", "History Report", "Outsize Report", "Fuel Report"],
                "menu_C": ["Transportation Tracking", "Register Gps", "Match for Harvester", "Tracking", "Usability Tracking", "Performance Tracking", "Truck Status", "Report", "Usability Report", "Performance Report", "History Report", "Harvester/Waiting Report", "Fuel Report", "Point Average"],
                "menu_D": ["Inbound Cane", "Check cane truck & Area", "Tracking Cane amount", "Cut to Crush Time"],
                "menu_E": ["Extra Module", "Use Truck", "Harvester Lost", "Report Harvester Lost", "Truck Lost", "Report Truck Lost"]
            },
            /* HTT01 */
            "HTT01_01_1": {
                "modal": ["Confirm Edit", "Plot edit", "Quota ID", "Confirm", "Cancle"],
                "content": ["Plot Area", "Form - Upload", "import - plot area", "Upload", "Area Map", "List Area", "Plot ID...", "Save", "Clear"],
                "table": ["No.", "Plot ID", "Quota ID"]
            },
            "HTT01_02_1": {
                "modal": ["Not Found", "Please identify the coordinates to search.", "Search Results", "Position not Found", "INSERT > Complete", "System have the save Position.", "INSERT > Failed", "System don't save Position."],
                "content": ["Interesting Area", "Search Position ...", "Limit", "Limit search", "default", "Area Map", "Edit", "Clear", "Form Detail", "Save"],
                "table": ["No.", "Place name"],
                "form": ["Place Name", "Latitude", "Longitude", "Radius", "Tambol", "Amphur", "Province"]
            },
            "HTT01_03_1": {
                "content": ["Important Area", "Form - Upload", "import - field area", "Upload", "Area Map", "Search Position ...", "Form Detail"],
                "form": ["Field Name", "Latitude", "Longitude", "Radius", "Tambol", "Amphur", "Province"]
            },
            /* HTT02 */
            "HTT02_01_1": {
                "content": ["Register GPS / Harvester", "No Register", "Form - Register", "Save", "Register", "No Register", "Register", "Register GPS", "UnRegister GPS", "Update Register", "Update"],
                "table": ["No.", "Harvester Code", "Model"],
                "form": ["BP - harvester owner", "zone", "Harvester Code", "Name - harvester owner", "Harvester type", "Brand", "Model", "Number GPS", "Number Sim", "...select Harvester code...", "...select GPS code..."]
            },
            "HTT02_02_1": {
                "content": ["Plot cutting for Harvester", "...search harvester code...", "Harvester Detail", "Plot Detail", "Form", "Map", "List Plot", "Harvester no Match"],
                "table": ["Plot Code", "Zone"],
                "form": ["Production year", "Date", "Harvester Code", "Harvester owner", "Telephone Number", "Harvester type"]
            },
            "HTT02_03_1": {
                "content": ["Tracking Harvestr / Usability", "Real-time Update : ", "...Sort Data..."],
                "table": ["Harvester All", "Ready", "Lost", "Harvester Code", "Status", "Detail", "Position", "Harvester owner", "Telephone"],
                "graph": ["Chart : Status usability", "Ready", "Lost"]
            },
            "HTT02_03_2": {
                "content": ["Tracking Harvester / Performance", "Real-time Update : ", "...search harvester code..."],
                "table": ["Harvester All", "Stop Ideling", "Ideling", "Runing", "Cutting & Loading", "Harvester Code", "Status", "Detail", "Position", "Plot Code", "Plot owner", "Telephone", "Harvester owner"],
                "graph": ["Chart : Status performance", "Stop Ideling", "Ideling", "Runing", "Cutting & Loading"]
            },
            "HTT02_03_3": {
                "content": ["Harvester Out of Area", "...search harvester code...", "Real-time Update : "],
                "table": ["Harvester All", "Out of Area", "Harvester Code", "Status", "Detail", "Plot Code", "Famer Owner", "Telephone", "Harvester Owner"]
            },
            "HTT02_04_1": {
                "content": ["Report Harvester status / Usability", "duration", "StartTime", "FinishTime", "Format", "Data for day", "Data for all", "Report status at", "Export", "Close"],
                "table": ["Date", "Harvester Lost", "Summary Lost (Amount.)", "Summary Lost (Hours.)", "No.", "Harvester Code", "Summary Lost (Amount.)", "Summary Lost (Hours.)"],
                "graph": ["Graph : Report Harvester status for Usability", "Ready", "Lost"]
            },
            "HTT02_04_2": {
                "content": ["Report Harvester status / Performance", "duration", "StartTime", "FinishTime", "Format", "Data for day", "Data for all", "Report status at", "Export", "Close"],
                "table": ["Date", "sum (hour.)", "Stop", "Idling stop", "Running", "Cut Loading", "Performance", "No.", "harvester Code"],
                "graph": ["Graph : Report Vehicle", "Graph : Status Cut Loading", "Stop", "Idling stop", "Running", "Cut Loading", "Other"]
            },
            "HTT02_04_3": {
                "content_history": ["Report Harvester status / History", "Harvester Code", "StartTime", "FinishTime", "Vehicle Lost", "Vehicle stop", "Vehicle idling", "Vehicle running", "Vehicle cutting and loading"],
                "table_history": ["Harvester Code", "Lost total (hour.)", "Stop total  (hour.)", "Idling total (hour.)", "Running total (hour.)", "cutting and loading total (hour.)", "No.", "Time stamp", "Day stamp", "Cancle Time stamp", "Total", "Tambpn", "Amphur", "Plot Code", "Zone", "Map"],
                "content_activity": ["Harvester Code", "Duration"],
                "table_activity": ["No.", "Order activity (Harvester)", "Truck Match", "Order activity (Truck)"]

            },
            "HTT02_04_4": {
                "content": ["Report Harvester status / Workout Zone", "duration", "StartTime", "FinishTime", "Format", "Data for day", "Data for all", "Report status at", "Export", "Close"],
                "table": ["Date", "Workout Zone", "(hour.)", "Sum Harvester at", "Sum at", "Sum Time at", "No.", "Harvester Code", "Duration Workout zone (hour.)", "Position", "Plot Code"]
            },
            "HTT02_04_5": {
                "content": ["Report Harvester status / Usability Fuel", "duration", "StartTime", "FinishTime", "Harvester Code"],
                "table": ["Date", "Consumption", "During", "Average Utilization", "Fuel rating (liter)", "Work cumulative (hour.)", "Fuel (liter/hour.)"]
            },
            /* HTT03 */
            "HTT03_01_1": {
                "content": ["Register GPS / Truck", "No Register", "Form - Register", "Save", "Register", "No Register", "Register", "Register GPS", "UnRegister GPS", "Update Register", "Update"],
                "table": ["No.", "Truck Code", "Model"],
                "form": ["Truck Code", "Name - truck owner", "Truck type", "Brand", "Model", "Plate Licen", "Province", "Number GPS", "Number Sim", "...select Harvester code...", "...select GPS code..."]
            },
            "HTT03_02_1": {
                "content": ["Match for Harvester", "...search truck code...", "Truck Detail", "Truck no Match", "Form", "List Harvester", "Not Match"],
                "table": ["No.", "Truck Code", "Harvester Code", "Harvester Owner"],
                "form": ["Production year", "Date", "Truck Code", "Truck owner", "Telephone Number", "Truck type", "Licen", "Province"]
            },
            "HTT03_03_1": {
                "content": ["Tracking Truck / Usability", "Real-time Update : ", "...Sort Data..."],
                "table": ["Truck All", "Ready", "Lost", "No.", "Truck Code", "Licen", "Status", "Detail", "Position", "Truck owner", "Telephone"],
                "graph": ["Chart : Status usability", "Ready", "Lost"]
            },
            "HTT03_03_2": {
                "content": ["Tracking Truck / Performance", "Real-time Update : ", "...Sort Data..."],
                "table": ["Truck All", "Stop Ideling", "Ideling", "Runing", "Cane Loading", "No.", "Truck Code", "Licen", "Status", "Detail", "Position", "Plot Code", "Plot owner", "Truck owner", "Telephone"],
                "graph": ["Chart : Status truck", "Chart : Status cane", "Stop Ideling", "Ideling", "Runing", "Cane Loading", "Truck All"]
            },
            "HTT03_03_3": {
                "content": ["Truck Status", "Real-time Update : ", "...Sort Data..."],
                "table": ["Truck All", "Road with cane", "Road without cane", "No.", "Truck Code", "Licen", "Status", "Detail", "Position", "Plot Code", "Plot owner",
                    "Truck owner", "Telephone", "Cutting & Loading", "Farm Leaving", "Park Outside", "Factory Leaving"],
                "graph": ["Chart : Status truck loading", "Road with cane", "Road without cane"]
            },
            "HTT03_04_1": {
                "content": ["Report Truck status / Usability", "duration", "StartTime", "FinishTime", "Type", "All", "Truck", "Tow Truck", "Barrow", "Trailer Car", "Format", "Data for day", "Data for all"],
                "table": ["Date", "Type", "Lost total", "Summary Lost (Amount.)", "Summary Lost (Hours.)"],
                "graph": ["Graph : Report Truck status for Usability", "Ready", "Lost"]
            },
            "HTT03_04_2": {
                "content": ["Report Truck status / Performance", "duration", "StartTime", "FinishTime", "Type", "All", "Truck", "Tow Truck", "Barrow", "Trailer Car", "Format", "Data for day", "Data for all", "Report status at", "Export", "Close"],
                "table": ["Date", "Type", "sum (hour.)", "Stop", "Idling stop", "Running", "Cane Loading", "Performance", "Truck Code", "License"],
                "graph": ["Graph : Report Vehicle", "Stop", "Idling stop", "Running", "Graph : Cane Loading", "Cane Loading", "Vehicle All"]
            },
            "HTT03_04_3": {
                "content_history": ["Report Truck status / History", "Truck Code", "StartTime", "FinishTime", "Vehicle Lost", "Vehicle stop", "Vehicle idling", "Vehicle running", "Vehicle Cane Loading"],
                "table_history": ["Truck Code", "License", "Type", "Lost total (hour.)", "Stop total  (hour.)", "Idling total (hour.)", "Running total (hour.)", "Cane Loading total (hour.)", "No.", "Time stamp", "Day stamp", "Cancle Time stamp", "Total", "Tambon", "Amphur", "Plot Code", "Zone", "Map"],
                "content_activity": ["Truck Code", "Duration"],
                "table_activity": ["No.", "Order activity (Truck)", "Harvester Match", "Order activity (Harvester)"]
            },
            "HTT03_04_4": {
                "content": ["Report Truck status / Waiting", "duration", "StartTime", "FinishTime", "Type", "All", "Truck", "Tow Truck", "Barrow", "Trailer Car", "Format", "Data for day", "Data for all"],
                "table": ["Date", "Type", "Waiting in Farm (hour.)", "Waiting in ParkOutSize (hour.)", "Waiting in ParkPrepare (hour.)", "Waiting in ParkInSize (hour.)"],
                "graph": ["Graph : Report Waiting", "Farm", "ParkOutSize", "ParkPrepare", "ParkInSize"]
            },
            "HTT03_04_5": {
                "content": ["Report Truck status / Usability Fuel", "duration", "StartTime", "FinishTime", "Truck Code"],
                "table": ["Date", "Licens", "Type", "Fuel", "Consumption (liter)", "Duration of", "Work collection (hour.)", "Average fuel", "(liter/hour.)"],
            },
            "HTT03_04_6": {
                "content": ["Report", "Average Distance, from getcane to factory", "Truck Code", "Search Vehicle"],
                "table": ["Truck Code", "StartTime", "FinishTime", "Zone", "Harvester Code", "License", "Plot Code", "Position", "Distance GPS"]
            },
            /* HTT04 */
            "HTT04_01_1": {
                "content": ["Check cane truck & Area", "Real-time Update : ", "table : cane amount (metric ton)", "...Sort Data..."],
                "table": ["Truck All", "Road with cane", "Road without cane", "All", "Fram", "Road", "Park Outside", "Park Prepare", "Park Inside", "No.", "Truck Code", "Licen", "Type", "Status", "Detail", "Position", "Cane Amount", "Truck owner", "Telephone"],
                "graph": ["Chart : Status cane in area", "Fram", "Road", "Park Outside", "Park Prepare", "Park Inside"],
            },
            "HTT04_01_2": {
                "content": ["Cane Amount For Harvester Cutting", "...Sort Data..."],
                "table": ["Truck Code", "Time Cutting (hours.)", "Cane for Day (metric ton)"]
            },
            "HTT04_01_3": {
                "content": ["Cut to Crush Time", "Now", "Select", "...Filter Data...", "...Start Time...", "...Finish Time..."],
                "table": ["Trip No.", "Plot Code", "Cutting Time", "Harvester Code", "In Factory", "Truck Code", "Licen", "Type", "Transection ID.", "Total", "Result", "Resend."]
            },
            /* HTTEXTRA */
            "EXTRA_01": {
                "content": ["Use Truck"],
                "table": ["Type Code.", "Type", "Truck for Load (metric ton)", "Company"]
            },
            "EXTRA_02": {
                "content": ["Notify Lost", "Edit Lost", "Form - Detail", "Save"],
                "table": ["No.", "Vehicle", "cause"],
                "form": ["Type Vehicle", "Zone", "Harvester Code", "Type Lost", "Status", "About Lost", "Mechanic Comment", "User Notify", "Start Lost", "End Lost"]
            },
            "EXTRA_03": {
                "content": ["Report Harvester Lost", "start", "to", "zone", "status"],
                "table": ["No.", "Harvester Code", "Type", "Zone", "Type Lost", "About Lost", "Mechanic Comment", "Notification", "Start Lost", "End Lost", "User Notify", "Status"]
            },
            "EXTRA_04": {
                "content": ["Notify Lost", "Edit Lost", "Form - Detail", "Save"],
                "table": ["No.", "Vehicle", "cause"],
                "form": ["Type Vehicle", "Zone", "Truck Code", "Type Lost", "Status", "About Lost", "Mechanic Comment", "User Notify", "Start Lost", "End Lost"]
            },
            "EXTRA_05": {
                "content": ["Report Truck Lost", "start", "to", "zone", "status"],
                "table": ["No.", "Truck Code", "Type", "Zone", "Type Lost", "About Lost", "Mechanic Comment", "Notification", "Start Lost", "End Lost", "User Notify", "Status"]
            }
        }
    }
    // #endregion

    // #region $etc
    this.status_return = function (text) {
        var str = null;
        switch (text) {
            case 'ready': { str = "พร้อมใช้งาน"; } break;
            case 'out_of_service': { str = "รถเสียเสีย"; } break;
            case 10: { str = "เปิดอุปกรณ์"; } break;
            case 11: { str = "ปิดอุปกรณ์"; } break;
            case 30: { str = 'รถวิ่ง'; } break;
            case 31: { str = 'จอดไม่ดับเครื่อง'; } break
            case 32: { str = 'จอดไม่ดับเครื่อง'; } break;
            case 33: { str = 'จอดดับเครื่อง'; } break;
            case 34: { str = 'สตาร์ทรถ'; } break;
            case 35: { str = 'IG ขาด'; } break;
            case 40: { str = 'แจ้งเตือน'; } break;
            case 41: { str = 'ความเร็วเกิน'; } break;
            case 50: { str = 'รายงานตัว'; } break;
            case 53: { str = 'เบรกกะทันหัน'; } break;
            case 54: { str = 'ออกตัวกะชาก'; } break;
            case 55: { str = 'รูดบัตรเข้า'; } break;
            case 56: { str = 'รูดบัตรออก'; } break;
            case 59: { str = 'ฝ่าฝืนจุดอันตราย'; } break;
            case 47: { str = 'ความเร็วรอบเกิน'; } break;
            default: { str = '——' } break;
        }

        return str;
    }

    this.status_HTT03_03_3 = function (value) {
        return value == 'hard' ? 'เที่ยวหนัก' : 'เที่ยวเปล่า';
    }

    this.position_status_HTT03_03_3 = function (value) {
        switch(value){
            case 'farm': { return 'ไร่'; } break;
            case 'road': { return 'ถนน'; } break;
            case 'park_outside': { return 'ลานนอก'; } break;
            case 'park_prepare': { return 'ลานเตรียม'; } break;
            case 'park_inside': { return 'ลานใน'; } break;
            case 'road_without_cane': { return 'รถเบา'; } break;
            case 'road_with_cane': { return 'อยู่บนถนน'; } break;
        }
    }

    this.check_nowTime_color = function (time) {
        if (time != null) {
            var now = moment().format('DD-MM-YYYY');
            var toTime = moment(time).format('DD-MM-YYYY');
            var color = now == toTime ? 'text-success' : 'text-danger';

            return {
                "time": moment(time).format('DD-MM-YYYY HH:mm'),
                "color": color
            }
        } else {
            return {
                "time": '',
                "color": ''
            }
        }
    }

    this.image_return = function (text) {
        var str = null;
        switch(text){
            case 33: { str = 'red' } break;
            case 34: { str = 'red' } break;
            case 41: { str = 'pink' } break;
            case 30: { str = 'green' } break;
            case 31: { str = 'yellow' } break;
            case 32: { str = 'yellow' } break;
            default: { str = 'gray' } break;
        }
        return str;
    }

    this.iconMark_panel = function (text) {
        var str = null;
        switch (text) {
            case '1': { str = 'red' } break;
            case '2': { str = 'red' } break;
            case '3': { str = 'yellow' } break;
            case '4': { str = 'green' } break;
            case '5': { str = 'green' } break;
        }
        return str;
    }

    this.containText = function (data, it) {
        return data.indexOf(it) != -1;
    }
    // #endregion $etc

});

/* app directive */

app.directive('fileModel', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    }
});

app.directive('pageButton', function () {
    return {
        restrict: 'E',
        templateUrl: '../template/page-button.html'
    }
});

app.directive('mainTemplate', function () {
    return {
        restrict: 'E',
        templateUrl: '../template/main-template.html'
    }
});

app.directive('currentTime', function ($interval, $iService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            element.on('$destroy', function () {
                $interval.cancel(timeoutId);
            });


            var updateTime = function () {
                element.text($iService.timeStyle_A(moment().format('YYYY-M-D'), moment().format('HH:mm:ss')));
            }

            var timeoutId = $interval(function () {
                updateTime();
            }, 1000);
        }
    }
});

app.directive('trackingHarvesterTruck', function ($interval, $iService) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {

            element.on('$destroy', function () {
                stopDirective();
            });

            scope.cooldown = 60;

            var tracking = '';

            var startDirective = function () {
                tracking = $interval(function () {
                    if (scope.cooldown > 0) {
                        scope.cooldown = scope.cooldown - 1;
                    } else {
                        stopDirective();
                        scope.cooldown = 60;
                        event();
                    }
                }, 1000);
            }

            var stopDirective = function () {
                $interval.cancel(tracking);
            }

            var event = function () {
                scope.run_realtime(function () {
                    startDirective();
                });
            }

            event();
        }
    }
});

app.directive('trackingRealTime', function ($interval, $iService) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {

            element.on('$destroy', function () {
                stopDirective();
            });

            var TheDirective = '';

            var startDirective = function () {
                TheDirective = $interval(function () {
                    if (scope.updateRealtime == 0) {
                        stopDirective();
                        EventStop();
                    } else {
                        scope.updateRealtime = scope.updateRealtime - 1;
                    }
                }, 1000);
            }

            var stopDirective = function () {
                $interval.cancel(TheDirective);
            }

            var EventStop = function (callback) {
                scope.updateRealtime = 60;
                scope.run_realtime(function () {
                    startDirective();
                });
            }

            EventStop();
        }
    }
});

app.directive('caneAmount', function ($interval, $iService) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {

            element.on('$destroy', function () {
                stopDirective();
            });

            var TheDirective = '';

            var startDirective = function () {
                TheDirective = $interval(function () {
                    if (scope.updateRealtime > 0) {
                        scope.updateRealtime = scope.updateRealtime - 1;
                    } else {
                        stopDirective();
                        EventStop();
                    }
                }, 1000);
            }

            var stopDirective = function () {
                $interval.cancel(TheDirective);
            }

            var EventStop = function (callback) {
                scope.updateRealtime = 60;
                scope.run_realtime(function () {
                    startDirective();
                });
            }

            EventStop();

        }
    }
});

app.directive('cutToCrush', function ($interval) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {

            element.on('$destroy', function () {
                stopCutToCrush();
            });

            scope.cooldown = 60;

            var CutToCrush = '';

            var startCutToCrush = function () {
                CutToCrush = $interval(function () {
                    if (scope.check_search) {
                        if (scope.cooldown > 0) {
                            scope.cooldown = scope.cooldown - 1;
                        } else {
                            stopCutToCrush();
                            scope.cooldown = 60;
                            event();
                        }
                    } else {
                        scope.cooldown = 60;
                    }
                }, 1000);
            }

            var stopCutToCrush = function () {
                $interval.cancel(CutToCrush);
            }

            var event = function () {
                scope.load_CutToCrush(function () {
                    startCutToCrush();
                });
            }

            
            event();
        }
    }
});

/* app factory */

app.factory('$iExcel', function ($window) {
    var uri = 'data:application/vnd.ms-excel;base64;charset=utf-8,';
    var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
    var base64 = function (s) { return $window.btoa(unescape(encodeURIComponent(s))); };
    var format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };

    return {
        tableToExcel: function (tableId, worksheetName) {
            var table = $(tableId);
            var ctx = { worksheet: worksheetName, table: table.html() };
            var href = uri + base64(format(template, ctx));
            return href;
        }
    };
});

/* app run */

app.run(function ($rootScope, $timeout) {

    $rootScope.account_name = localStorage.account_name;

    $rootScope.account_pass = localStorage.account_pass;

    $timeout(function () {
        if (localStorage.remember == 'false') { localStorage.account_name = ''; localStorage.account_pass = ''; }
        localStorage.language = localStorage.language == null ? 'En' : localStorage.language;
    });

});