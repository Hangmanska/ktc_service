//#region modules

var async = require('async');
var request = require('request');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var LINQ = require('node-linq').LINQ;
var mustache = require("mustache");
var squel = require("squel");
var urlencode = require('urlencode');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb.js');
var iutm = require('utm2latlon.js');
var iOut = require('out_of_service.js');
var iResend = require('resend_cat2crush');

var pg_query = new db.im2(db.get_configdb_global());
var pg_query2 = new db.im2(db.get_configdb_adminpoint());
var pg_config_dbu101279 = new db.im2(db.get_dbconfig_realtime());
var pg_config_HTT = new db.im2(db.get_dbconfig_htt());
var result = { "flag": false, "message": " " };
var dblink_HTT = 'dbname=HTT port=5432';
var dblink_dbu101279 = 'dbname=dbu_101279 port=5432';

//#endregion

//#region HTT01-01-1 

function get_htt1(req, res) {
    var query = "SELECT f_id,qt,ST_AsGeoJSON(wkt_geom) FROM htt1 ORDER BY CAST(gis_id as int) ASC LIMIT 100 OFFSET ((" + parseInt(req.params.page) + " * 100) - 100)";
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "f_id": "{{f_id}}",';
            strMustache += ' "qt": "{{qt}}",';
            strMustache += ' "geometry":  {{st_asgeojson}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';
            
            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');
            
            res.send(JSON.parse(final));
        } else {
            res.send('No-Query');
        }
    });
}

function upload_htt1(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var old_path = files.file.path;
        var file_size = files.file.size;
        var file_ext = files.file.name.split('.').pop();
        var index = old_path.lastIndexOf('/') + 1;
        var file_name = files.file.name;
        var new_path = path.join(__dirname, '/uploads/', file_name);
        
        fs.readFile(old_path, 'utf-8', function (err, data) {
            debugger;
            
            data = utl.Trim(data.toString())
            var array = data.toString().split('\n');
            
            var s = ' ';
            var i = 0;
            async.eachSeries(array, function (row, next) {
                row = row.replace(/, /g, '|');
                var r = row.split(',');
                //  debugger;
                if (i != 0) {
                    iutm.iUTMXYToLatLon(r[0], 48, function (latlon) {
                        // debugger;
                        s += "(ST_GeomFromText(" + latlon + ", 4326)," + utl.sqote(r[1]) + ", " + utl.sqote(r[2]) + ", " + utl.sqote(r[3]) + ", " + utl.sqote(r[4]) + ", " + utl.sqote(r[5]) + ", " + utl.sqote(r[6]) + ", " + utl.sqote(r[7]) + ", " + utl.sqote(r[8]) + ", " + utl.sqote(r[9]) + ", " + utl.sqote(r[10]) + ", " + utl.sqote(r[11]) + ", " + utl.sqote(r[12]) + ", " + utl.sqote(r[13]) + "),";
                        next();
                        i++
                    });

                } else {
                    next();
                    i++
                }


            }, function () {
                debugger;
                s = utl.iRmend(s);

                var sql = " INSERT INTO htt1 (wkt_geom,f_id,qt,area,gis_id,cane_type,sub_zone,zone_id,product_to,NAME,cane_width,car_name,x,y) VALUES " + s
                db.excute(pg_config_HTT, sql, function (response) {
                    if (response == 'oK') {
                        res.send('Insert-Complete');
                    } else {
                        res.send('Insert-failed');
                    }
                });
            });


        });
    });
}

function upload_HTT(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var old_path = files.file.path;
        var file_size = files.file.size;
        var file_ext = files.file.name.split('.').pop();
        var index = old_path.lastIndexOf('/') + 1;
        var file_name = files.file.name;
        var directory = path.join(__dirname, '/uploads/', file_name);
        var new_path = '/var/lib/pgsql/9.3/data/' + file_name;

        fs.readFile(old_path, function (err, data) {
            data = utl.Trim(data.toString());
            
            if (!containText(data, "\n")) { 
               data = utl.replaceAll('"POLYGON' , '\n"POLYGON', data);
            }

            var array = data.toString().split('\n');
            var stringCsv = array[0] + "\n";
            
            array.splice(0, 1);
            
            async.eachSeries(array, function (row, next) {
                row = row.replace(/, /g, '|');
                var Record = row.split(',');
                iutm.iUTMXYToLatLon(Record[0], 48, function (poly_a, poly_b) {
                    stringCsv += poly_b + "," + Record[1] + "," + Record[2] + "," + Record[3] + "," + Record[4] + "," + Record[5] + "," + Record[6] + "," + Record[7] + "," + Record[8] + "," + Record[9] + "," + Record[10] + "," + Record[11] + "," + Record[12] + "," + Record[13] + "\n";
                    next();
                });
            }, function () {
                debugger;
                stringCsv = utl.iRmend(stringCsv);
                fs.writeFile(new_path, stringCsv, function (err) {
                    var query = "COPY htt_test (wkt_geom,F_ID,QT,AREA,GIS_ID,CANE_TYPE,SUB_ZONE,ZONE_ID,PRODUCT_TO,NAME,CANE_WIDTH,CAR_NAME,geo_x,geo_y)";
                    query += " FROM " + utl.sqote(new_path) + " WITH CSV HEADER delimiter ','";

                    db.excute(pg_config_HTT, query, function (response) {
                        if (response == 'oK') {
                            dump_table(function (data) {
                                if (data == 'oK') { 
                                    res.send('Insert-Complete');
                                } else {
                                    res.send('Insert-Error');
                                } 
                            });
                        } else {
                            res.send(query);
                        }
                    });

                });
            });

        });

    });
}

function dump_table(callback) { 
        
    var query = "insert into htt1 (wkt_geom, f_id, qt, area, gis_id, cane_type, sub_zone, zone_id, product_to, name, cane_width, car_name, geo_x ,geo_y )";
    query += " SELECT";
    query += " ST_GeomFromText(wkt_geom,4326) as wkt_geom,";
    query += " f_id,";
    query += " qt,";
    query += " area,";
    query += " gis_id,";
    query += " cane_type,";
    query += " sub_zone,";
    query += " zone_id,";
    query += " product_to,";
    query += " name,";
    query += " cane_width,";
    query += " car_name,";
    query += " geo_x,";
    query += " geo_y";
    query += " FROM htt_test";
    

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') { 
            var query_truncate = "TRUNCATE TABLE htt_test RESTART IDENTITY";
            db.excute(pg_config_HTT, query_truncate, function (response) {
                callback('oK');
                return;
            });
        } else {
            callback('error');
            return;
        }
    });

}

function update_htt1(req, res) {
    var gis_id = req.body.gis_id;
    var qt = req.body.qt;
    var geometyEdit = JSON.parse(req.body.geometyEdit);
    var strPolygon = "{{#.}}";
    strPolygon += "{{lng}} {{lat}},";
    strPolygon += "{{/.}}";
    
    var result = mustache.render(strPolygon, geometyEdit);
    result += geometyEdit[0].lng + " " + geometyEdit[0].lat;
    result = "POLYGON((" + result + "))";
    
    var query = "UPDATE htt1 SET wkt_geom = ST_GeomFromText(" + utl.sqote(result) + ", 4326)";
    query += " WHERE  gis_id = " + utl.sqote(gis_id) + " AND qt = " + utl.sqote(qt);
    
    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            res.send('Update-Complete');
        } else {
            res.send('Update-failed');
        }
    });
}

function fillter_htt1(req, res) {
    var query = "SELECT f_id,qt,ST_AsGeoJSON(wkt_geom) FROM htt1 WHERE f_id = " + utl.sqote(req.params.f_id);
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "f_id": "{{f_id}}",';
            strMustache += ' "qt": "{{qt}}",';
            strMustache += ' "geometry":  {{st_asgeojson}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';
            
            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');
            
            res.send(JSON.parse(final));
        } else {
            res.send('No-Query');
        }
    });
}

exports.fillter_htt1 = fillter_htt1;
exports.get_htt1 = get_htt1;
exports.upload_htt1 = upload_htt1;
exports.upload_HTT = upload_HTT;
exports.update_htt1 = update_htt1;

// #endregion HTT01-01-1

// #region HTT01-02-1

function find_place(req, res) {
    //var s = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false';
    var s = 'http://www.dee-map.com/DeeMapWS_tdm/jsonSearch.jsp?query=' + urlencode(req.body.address) + '&start=0&limit=' + req.body.limit + '&mode=0&bbox=&dsrc=dee_map&radius=-1&grpid=-1';
    
    iGet(s, function (json) {
        json = JSON.parse(json);
        if (json.results == 0) {
            res.send('No-Query');
        } else {
            res.send(json);
        }
    });

}

function insert_htt2(req, res) {
    var query = squel.insert()
        .into('htt2')
        .set('name_point', req.body.namePosition)
        .set('lat', req.body.latPosition)
        .set('lng', req.body.lngPosition)
        .set('radius', parseInt(req.body.radiusPosition))
        .set('tambol', req.body.tamPosition)
        .set('amphur', req.body.ampPosition)
        .set('province', req.body.proPosition)
        .toString();
    
    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            res.send('Update-Complete');
        } else {
            res.send('Update-failed');
        }
    });
}

exports.find_place = find_place;
exports.insert_htt2 = insert_htt2;

// #endregion HTT01-02-1

//#region HTT01-03-1

function upload_htt3(req, res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    
    var upsertFc = function (object, callback) {
        var query_insert = squel.insert()
            .into('htt3')
            .set('iarea_polygon', object.st_geomfromtext)
            .set('iarea_size', object.sqm)
            .set('iarea_c_lon', object.lon)
            .set('iarea_c_lat', object.lat)
            .set('iarea_name', object.iarea_name)
            .toString();
        var query_update = squel.update()
            .table('htt3')
            .set('iarea_polygon', object.st_geomfromtext)
            .set('iarea_size', object.sqm)
            .set('iarea_c_lon', object.lon)
            .set('iarea_c_lat', object.lat)
            .where('iarea_name = ' + utl.sqote(object.iarea_name))
            .toString();

        utcp.upsert_template(query_insert, query_update, function (query) {
            db.excute(pg_config_HTT, query, function (response) {
                callback();
                return;
            });
        });
    }

    form.parse(req, function (err, fields, files) {
        var old_path = files.file.path;
        var file_size = files.file.size;
        var file_ext = files.file.name.split('.').pop();
        var index = old_path.lastIndexOf('/') + 1;
        var file_name = files.file.name;
        var new_path = path.join(__dirname, '/uploads/', file_name);
        
        fs.readFile(old_path, function (err, data) {

            data = utl.Trim(data.toString('utf-8'));
            var array = data.toString().split('\n');
            var i = 0;

            async.eachSeries(array, function (row, next) {
                row = row.replace(/, /g, '|');
                var r = row.split(',');
                if (i != 0) {
                    iutm.iUTMXYToLatLon(r[0], 48, function (latlon) {
                        var s = ' ';
                        s += "( WITH FID AS (SELECT ST_GeomFromText(" + latlon + ",4326)) ";
                        s += " SELECT ";
                        s += " (SELECT st_geomfromtext FROM FID) ";
                        s += " ,(SELECT ST_Area(st_geomfromtext)* POWER(0.3048,2)  FROM FID)as sqm ";
                        s += " ,(SELECT ST_X(st_astext(st_centroid(st_geomfromtext))) FROM FID) as lon ";
                        s += " ,(SELECT ST_Y(st_astext(st_centroid(st_geomfromtext))) FROM FID) as lat ";
                        s += " ," + utl.sqote(r[1]) + " as iarea_name ";
                        s += "  FROM FID )";
                        db.get_rows(pg_config_HTT, s, function (rows) {
                            upsertFc(rows[0], function () {
                                next();
                                i++;
                            });
                        });
                        
                    });
                } else {
                    next();
                    i++;
                }
            }, function () {
                update_location_htt3(function (isfin) {
                    if (isfin) { 
                        res.send('update-Complete');
                    } else {
                        res.send('update-Faile');
                    }
                });
            });
        });
    });
}

function update_location_htt3(callback) {
    var sql = "SELECT id_iarea as id,iarea_c_lat as lat,iarea_c_lon as lon FROM htt3";
    db.get_rows(pg_config_HTT, sql, function (array) {
        if (array.length > 0) {
            
            async.eachSeries(array, function (row, next) {
                call_adminPoint(row.lat, row.lon, function (r) {
                    if (r.length > 0) {
                        var query_update = squel.update()
                            .table('htt3')
                            .set('iarea_tambol', r[0].tam_tname)
                            .set('iarea_ampher', r[0].amp_tname)
                            .set('iarea_province', r[0].prov_tname)
                            .where('id_iarea = ' + utl.sqote(row.id))
                            .toString();
                        
                        db.excute(pg_config_HTT, query_update, function (response) {
                            next();
                        });
                    } else {
                        next();
                    }
                });
            }, function () {
                callback(true);
                return;
            });

        } else {
            callback(false);
            return;
        }
    });
}

function get_yard(req, res) {
    var query = "SELECT iarea_name,iarea_tambol,iarea_ampher,iarea_province,iarea_c_lat,iarea_c_lon,iarea_size";
    query += ",ST_AsGeoJSON(iarea_polygon)";
    query += ",st_xmin(iarea_polygon) as west";
    query += ",st_xmax(iarea_polygon) as east";
    query += ",st_ymax(iarea_polygon) as north";
    query += ",st_ymin(iarea_polygon) as south";
    query += " FROM htt3 WHERE iarea_name = " + utl.sqote(req.body.address);
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "west": {{west}},';
            strMustache += ' "east": {{east}},';
            strMustache += ' "north": {{north}},';
            strMustache += ' "south": {{south}},';
            strMustache += ' "area_name": "{{iarea_name}}",';
            strMustache += ' "area_tambol": "{{iarea_tambol}}",';
            strMustache += ' "area_ampher": "{{iarea_ampher}}",';
            strMustache += ' "area_province": "{{iarea_province}}",';
            strMustache += ' "area_lat": "{{iarea_c_lat}}",';
            strMustache += ' "area_lng": "{{iarea_c_lon}}",';
            strMustache += ' "area_size": "{{iarea_size}}",';
            strMustache += ' "geometry":  {{st_asgeojson}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';
            
            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');
            
            res.send(JSON.parse(final));
        } else {
            res.send('No-Query');
        }
    });
}

exports.upload_htt3 = upload_htt3;
exports.get_yard = get_yard;

//#endregion HTT01-03-1

// #region HTT02-01-1

function select_htt4(req, res) {
    var query = "SELECT * FROM htt4 WHERE harvester_number = " + utl.sqote(req.params.harvester_name);
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function register_htt4(req, res)
{
    var bp = req.body.bp == null ? '' : req.body.bp;
    var zone = req.body.zone == null ? '' : req.body.zone;
  
    var query_insert = squel.insert()
            .into('htt4')
            .set('bp', bp)
            .set('harvester_number', req.body.harvester_number)
            .set('name', req.body.name)
            .set('type', req.body.type)
            .set('brand', req.body.brand)
            .set('product', req.body.product)
            .set('blackbox_id', req.body.blackbox_id)
            .set('sim_id', req.body.sim_id)
            .set('zone', zone)
            .toString();
    var query_update = squel.update()
            .table('htt4')
            .set('bp', bp)
            .set('harvester_number', req.body.harvester_number)
            .set('name', req.body.name)
            .set('type', req.body.type)
            .set('brand', req.body.brand)
            .set('product', req.body.product)
            .set('blackbox_id', req.body.blackbox_id)
            .set('sim_id', req.body.sim_id)
            .set('zone', zone)
            .where('harvester_number = ' + utl.sqote(req.body.harvester_number))
            .toString();
    
    var update_TruckName = function () {
        var query = squel.update()
            .table('truck')
            .set('truck_name', req.body.harvester_number)
            .where('truck_id = (SELECT truck_id FROM blackbox WHERE blackbox_id = ' + utl.sqote(req.body.blackbox_id) + ')')
            .toString();

        db.excute(pg_config_dbu101279, query, function (response) {
            if (response == 'oK') {
                res.send('Update-Complete');
            } else {
                res.send('Update-failed');
            }
        });
    }
    
    utcp.upsert_template(query_insert, query_update, function (query) {
        db.excute(pg_config_HTT, query, function (response) {
            if (response == 'oK')
            {
                iOut.set_havester_or_truck(req.body.blackbox_id, 'harvester', function (fin) {
                    console.log('set register_harvester ' + fin);
                });
                
                update_TruckName();
                
            } else {
                res.send('Update-failed');
            }
        });
    });
}

function update_htt4(req, res) {
    var query = " UPDATE htt4 SET";
    query += " bp = mh.havest_bp_code,";
    query += " name = mh.havest_name,";
    query += " type = mh.havest_type,";
    query += " brand = mh.havest_brand,";
    query += " product = mh.havest_model,";
    query += " zone = mh.havest_zone_code";
    query += " FROM master_havester as mh";
    query += " WHERE harvester_number = mh.havest_vehicle_code";

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') { 
            res.send('Update-complete');
        } else {
            res.send('Update-failed');
        }
    });
}

function get_MasterHavest(req, res){
    var finish_a = false; var finish_b = false;
    var object = { "master_harvester": [] };
    var query_a = "SELECT havest_name,havest_type,havest_brand,havest_model,havest_zone_code,havest_bp_code FROM master_havester WHERE havest_vehicle_code = " + utl.sqote(req.params.harvester_name);
    
    var final = function () {
        if (finish_a) { 
            res.send(object);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.master_harvester = rows[0]; }
        final();
    });

}

function harvester_unregis(req, res) {
    
    var query = squel.update()
            .table('truck')
            .set('truck_name', req.body.blackbox_id)
            .where('truck_name = ' + utl.sqote(req.body.blackbox_id))
            .toString();
    
    db.excute(pg_config_dbu101279, query, function (response) {
        if (response == 'oK') {
            final();
        } else {
            res.send('Delete-failed');
        }
    });
       
    var final = function () {
        var query = "DELETE FROM htt4 WHERE harvester_number = " + utl.sqote(req.body.harvester_code);

        db.excute(pg_config_HTT, query, function (response) {
            if (response == 'oK') {
                res.send('Delete-Complate');
            } else {
                res.send('Delete-failed');
            }
        });
    }
    
}

exports.select_htt4 = select_htt4;
exports.register_htt4 = register_htt4;
exports.update_htt4 = update_htt4
exports.get_MasterHavest = get_MasterHavest;
exports.harvester_unregis = harvester_unregis;

// #endregion HTT02-01-1

// #region HTT02-02-1

function get_relation(req, res){
    var json = { "form": [], "table": [] , "count": 0 };
    var query_a = ''; var query_b = ''; var query_c = '';
    var step_one = false; var step_two = false; var step_tree = false;
    
    query_a += "SELECT DISTINCT ";
    query_a += "mh.havest_telephone,";
    query_a += "dh.year,";
    query_a += "htt4.name,";
    query_a += "htt4.harvester_number,";
    query_a += "htt4.type ";
    query_a += "FROM ";
    query_a += "detail_havester AS dh,";
    query_a += "master_havester AS mh,";
    query_a += "htt4 as htt4 ";
    query_a += "WHERE htt4.harvester_number = mh.havest_vehicle_code ";
    query_a += "AND htt4.harvester_number = dh.havest_vehicle_code ";
    query_a += "AND htt4.harvester_number = " + utl.sqote(req.body.harvester_code);

    query_b += " SELECT plot_code,get_gisid(plot_code) as gis_id FROM detail_havester WHERE havest_vehicle_code = " + utl.sqote(req.body.harvester_code);
    query_b += " LIMIT " + req.body.perpage + " OFFSET ((" + parseInt(req.body.page) + " * " + parseInt(req.body.perpage) + ") - " + parseInt(req.body.perpage) +")";
    
    query_c += " SELECT count(plot_code) FROM detail_havester WHERE havest_vehicle_code = " + utl.sqote(req.body.harvester_code);

    var final = function () {
        if (step_one == true && step_two == true && step_tree == true) {
            res.send(json);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        step_one = true;
        if (rows.length > 0) { json.form = rows[0]; }
        final();
    });

    db.get_rows(pg_config_HTT, query_b, function (rows) {
        step_two = true;
        if (rows.length > 0) { json.table = rows; }
        final();
    });

    db.get_rows(pg_config_HTT, query_c, function (rows) {
        step_tree = true;
        if (rows.length > 0) { json.count = parseInt(rows[0].count); }
        final();
    });
    

}

function get_fieldID(req, res){
    var query = "SELECT ST_AsGeoJSON(wkt_geom)";
    query += ",st_xmin(wkt_geom::geometry) as west";
    query += ",st_xmax(wkt_geom::geometry) as east";
    query += ",st_ymax(wkt_geom::geometry) as north";
    query += ",st_ymin(wkt_geom::geometry) as south";
    query += " FROM htt1 WHERE f_id = " + utl.sqote(req.body.fieldID);

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "west": {{west}},';
            strMustache += ' "east": {{east}},';
            strMustache += ' "north": {{north}},';
            strMustache += ' "south": {{south}},';
            strMustache += ' "geometry":  {{st_asgeojson}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';
            
            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');
            
            res.send(JSON.parse(final));

        } else {
            res.send('No-Query');
        }
    });
}

function get_norelation(req, res) { 
    var query = " SELECT harvester_number FROM htt4 WHERE harvester_number NOT IN (";
    query += " SELECT DISTINCT havest_vehicle_code FROM detail_havester";
    query += " WHERE havest_vehicle_code IN (SELECT harvester_number FROM htt4 ))";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.get_fieldID = get_fieldID;
exports.get_relation = get_relation;
exports.get_norelation = get_norelation;

// #endregion HTT02-02-1

// #region HTT02-03-1

function tracking_havester(req, res){
    
    var object = { "vehicle_all": 0, "vehicle_tracking": [] };
    var finish_a = false; var finish_b = false; var query_a = ''; var query_b = '';
    

    query_a += " SELECT count(*) as harvester_total FROM htt4";
    query_b += " SELECT";
    query_b += " ms_havester.harvester_number";
    query_b += " ,rec_now.blackbox_id";
    query_b += " ,r_lon,r_lat,r_time,_r_datasend,tambol,amphur,province,r_status";
    query_b += " ,htt_status_useability";
    query_b += " ,htt4.name,htt4.bp";
    query_b += " ,ms_havester.telephone";
    query_b += " FROM rec_now,truck,blackbox";
    query_b += " ,dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT harvester_number,blackbox_id,name,bp FROM htt4') as htt4 (harvester_number varchar(50), blackbox_id varchar(50), name varchar(255), bp varchar(10))";
    query_b += " ,dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT havest_vehicle_code,havest_telephone FROM master_havester') as ms_havester (harvester_number varchar(50),telephone varchar(20))";
    query_b += " WHERE blackbox.blackbox_id = rec_now.blackbox_id";
    query_b += " AND truck.truck_id = blackbox.truck_id";
    query_b += " AND htt4.blackbox_id=rec_now.blackbox_id";
    query_b += " AND ms_havester.harvester_number = htt4.harvester_number";
    
    var final = function () {
        if (finish_a && finish_b) {
            res.send(object);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.vehicle_all = rows[0].harvester_total; }
        final();
    });
    
    db.get_rows(pg_config_dbu101279, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) { object.vehicle_tracking = rows; }
        final();
    });
}

exports.tracking_havester = tracking_havester;

// #endregion HTT02-03-1

// #region HTT02-03-2

function working_havester(req, res){
    var object = { "vehicle_all": 0, "vehicle_working": [] };
    var finish_a = false; var finish_b = false; var query_a = ''; var query_b = '';
    
    query_a += "SELECT count(*) as harvester_total FROM htt4";
    query_b += "SELECT ms_havester.harvester_number";
    query_b += ",rec_now.blackbox_id,_r_datasend";
    query_b += ",r_lon,r_lat,tambol,amphur,province,r_status";
    query_b += ",lower(htt_status_operation) as htt_status_operation,htt4.name";
    query_b += ",ms_havester.telephone,htt_plotcode";
    query_b += ",htt_name_farmer,htt_phone_farmer";
    query_b += " FROM rec_now,truck,blackbox";
    query_b += ",dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT harvester_number,blackbox_id,name FROM htt4') as htt4 (harvester_number varchar(50), blackbox_id varchar(50), name varchar(255))";
    query_b += ",dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT havest_vehicle_code,havest_telephone FROM master_havester') as ms_havester (harvester_number varchar(50),telephone varchar(20))";
    query_b += " WHERE blackbox.blackbox_id = rec_now.blackbox_id";
    query_b += " AND truck.truck_id = blackbox.truck_id";
    query_b += " AND htt4.blackbox_id=rec_now.blackbox_id";
    query_b += " AND ms_havester.harvester_number = htt4.harvester_number ";
    query_b += " AND htt_status_useability !='out_of_service' ";

    var final = function () {
        if (finish_a && finish_b) { 
            res.send(object);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.vehicle_all = rows[0].harvester_total; }
        final();
    });

    db.get_rows(pg_config_dbu101279, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) { object.vehicle_working = rows; } 
        final();
    });
}

exports.working_havester = working_havester;

// #endregion HTT02-03-2

// #region HTT02-03-3

function havester_out_of_area(req, res) {
    var object = { "vehicle_all": 0, "vehicle_out_area": [] };
    var FinalA = false; var FinalB = false; var query_a = ''; var query_b = '';

    query_a += "SELECT count(*) as harvester_total FROM htt4";
    query_b += "SELECT ms_havester.harvester_number";
    query_b += ",rec_now.blackbox_id,_r_datasend";
    query_b += ",r_lon,r_lat,tambol,amphur,province,r_status";
    query_b += ",htt_workout_zone";
    query_b += ",htt4.name";
    query_b += ",ms_havester.telephone";
    query_b += ",htt_plotcode";
    query_b += ",htt_name_farmer,htt_phone_farmer";
    query_b += ",icount.harvester_total";
    query_b += " FROM rec_now,truck,blackbox";
    query_b += ",dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT harvester_number,blackbox_id,name FROM htt4') as htt4(harvester_number varchar(50), blackbox_id varchar(50), name varchar(255))";
    query_b += ",dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT havest_vehicle_code,havest_telephone FROM master_havester') as ms_havester (harvester_number varchar(50),telephone varchar(20))";
    query_b += ",dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT COUNT(bp) FROM htt4') as icount (harvester_total int)";
    query_b += " WHERE blackbox.blackbox_id = rec_now.blackbox_id";
    query_b += " AND truck.truck_id = blackbox.truck_id";
    query_b += " AND htt4.blackbox_id = rec_now.blackbox_id";
    query_b += " AND ms_havester.harvester_number = htt4.harvester_number";
    query_b += " AND htt_workout_zone = 'workout_zone'";
    
    var final = function (){
        if (FinalA && FinalB) {
            res.send(object);
        }
    }

    db.get_rows(pg_config_HTT, query_a, function (rows) {
        if (rows.length > 0) {
            object.vehicle_all = rows[0].harvester_total;
        } else {
            object.vehicle_all = 0;
        }
        FinalA = true;
        final();
    });

    db.get_rows(pg_config_dbu101279, query_b, function (rows) {
        if (rows.length > 0) {
            object.vehicle_out_area = rows;
        } else {
            object.vehicle_out_area = [];
        }
        FinalB = true;
        final();
    });
}

exports.havester_out_of_area = havester_out_of_area;

// #endregion HTT02-03-3

// #region HTT02-04-1

function isDay_usability(req, res) {
    var object = { "usability": [], "summary_lost": 0, "summary_active": 0 };
    var query_a = ""; var query_b = ""; var finish_a = false; var finish_b = false;

    query_a += " SELECT lost_date, lost_date_vehicle, lost_date_total, lost_date_diff";
    query_a += " FROM history_usability_harvester";
    query_a += " WHERE get_ymd2(lost_date) >= " + utl.sqote(req.params.start_time);
    query_a += " AND get_ymd2(lost_date) <= " + utl.sqote(req.params.end_time);
    
    query_b += " SELECT count(harvester_number) as summary_active";
    query_b += " ,(SELECT count(vehicle_name) FROM lost_vehicle WHERE get_ymd(start_lost) >= " + utl.sqote(req.params.start_time) + " AND get_ymd(end_lost) <= " + utl.sqote(req.params.end_time) + ")";
    query_b += " as summary_lost FROM htt4 WHERE harvester_number";
    query_b += " NOT IN (SELECT vehicle_name FROM lost_vehicle WHERE get_ymd(start_lost) >= " + utl.sqote(req.params.start_time) + " AND get_ymd(end_lost) <= " + utl.sqote(req.params.end_time) + ")";
    
    var final = function () {
        if (finish_a && finish_b) { 
            res.send(object);
        }
    }

    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.usability = rows }
        final();
    });

    db.get_rows(pg_config_HTT, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) {
            object.summary_lost = rows[0].summary_lost;
            object.summary_active = rows[0].summary_active
        }
        final();
    });
}

function isAll_usability(req, res) {
    var object = { "usability": [], "summary_lost": 0, "summary_active": 0 };
    var query_a = ""; var query_b = ""; var finish_a = false; var finish_b = false;
    
    query_a += " SELECT lost_date, lost_date_vehicle, lost_date_total, lost_date_diff";
    query_a += " FROM history_usability_harvester";
    
    query_b += " SELECT count(harvester_number) as summary_active";
    query_b += " ,(SELECT count(vehicle_name) FROM lost_vehicle)";
    query_b += " as summary_lost FROM htt4 WHERE harvester_number";
    query_b += " NOT IN (SELECT vehicle_name FROM lost_vehicle)";

    var final = function () {
        if (finish_a && finish_b) {
            res.send(object);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.usability = rows }
        final();
    });
    
    db.get_rows(pg_config_HTT, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) {
            object.summary_lost = rows[0].summary_lost;
            object.summary_active = rows[0].summary_active
        }
        final();
    });
}

function Day_usability(req, res) {

    var query = " SELECT DISTINCT vehicle_name";
    query += " ,count(vehicle_name) as total_vehicle";
    query += " ,datediff('hour', start_lost, end_lost) as summary_lost";
    query += " FROM lost_vehicle WHERE get_ymd(start_lost) =  " + utl.sqote(req.params.date);
    query += " AND vehicle_type = 'รถตัด'";
    query += " GROUP BY vehicle_name, start_lost, end_lost";
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query')
        }
    });

}

exports.isDay_usability = isDay_usability;
exports.isAll_usability = isAll_usability;
exports.Day_usability = Day_usability;

// #endregion HTT02-04-1

// #region HTT02-04-2

function isDay_performance(req, res) {
    var object = { "stop_sum": 0, "idle_sum": 0, "run_sum": 0, "cut_load_sum": 0, "performance": [] }; 
    var query = " SELECT date,stop,idle,run,cut_load,efficiency";
    query += " FROM history_performance_harvester";
    query += " WHERE date >= " + utl.sqote(req.params.start_time);
    query += " AND date <= " + utl.sqote(req.params.end_time);

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            object.performance = new LINQ(rows).Select(function (x) { return format_Performance(x) }).ToArray();
            object.stop_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.stop) }).Sum();
            object.idle_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.idle) }).Sum();
            object.run_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.run) }).Sum();
            object.cut_load_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.cut_load) }).Sum();
        }

        res.send(object);
    });
}

function isAll_performance(req, res) {
    var object = { "stop_sum": 0, "idle_sum": 0, "run_sum": 0, "cut_load_sum": 0, "performance": [] };
    var query = " SELECT date,stop,idle,run,cut_load,efficiency";
    query += " FROM history_performance_harvester";
    query += " ORDER BY date";

    db.get_rows(pg_config_HTT, query , function (rows) {
        if (rows.length > 0) {
            object.performance = new LINQ(rows).Select(function (x) { return format_Performance(x) }).ToArray();
            object.stop_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.stop) }).Sum();
            object.idle_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.idle) }).Sum();
            object.run_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.run) }).Sum();
            object.cut_load_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.cut_load) }).Sum();
        }

        res.send(object);
    });
}

function Day_performance(req, res) {
    var query = " WITH res as";
    query += " (";
    query += " SELECT harvester_number as vehicle_code";
    query += " ,blackbox_id";
    query += " ,get_min_max_cutting_time(blackbox_id, " + utl.sqote(req.params.date) + ") as x";
    query += " FROM htt4";
    query += " )";
    query += " SELECT vehicle_code,blackbox_id";
    query += " ,round(get_status_time(blackbox_id, get_minmax_format(x::text,1),get_minmax_format(x::text,2), '30')::int/ 60) as run";
    query += " ,round(get_status_time(blackbox_id, get_minmax_format(x::text,1),get_minmax_format(x::text,2), '31')::int/ 60) as idle";
    query += " ,round(get_status_time(blackbox_id, get_minmax_format(x::text,1),get_minmax_format(x::text,2), '33')::int/ 60) as stop";
    query += " ,round(get_cutting_time(blackbox_id,get_minmax_format(x::text,1),get_minmax_format(x::text,2))::int/ 60) as cut_load";
    query += " FROM res";
    query += " WHERE length(x::varchar) > 3";

    db.get_rows(pg_config_HTT, query, function (rows) {
        rows = new LINQ(rows).Select(function (x) { return format_DayPerformance(x) }).ToArray();
        res.send(rows);
    });
}

function format_DayPerformance(object) {
    object.run = object.run == null ? 0 : parseInt(object.run);
    object.idle = object.idle == null ? 0 : parseInt(object.idle);
    object.stop = object.stop == null ? 0 : parseInt(object.stop);
    object.cut_load = object.cut_load == null ? 0 : parseInt(object.cut_load);
    
    if ((object.idle + object.run) > 0) { 
        object.efficiency = Math.round((object.cut_load / (object.idle + object.run)) * 100);
    } else {
        object.efficiency = 0;
    }
    
    return object;
}

function format_Performance (object) {
    var month = '';
    var day = moment(object.date).format("DD");
    var year = parseInt(moment(object.date).format("YYYY")) + 543;
    switch (moment(object.date).format("MM")) {
        case "01": { month = "มกราคม" } break;
        case "02": { month = "กุมภาพันธ์" } break;
        case "03": { month = "มีนาคม" } break;
        case "04": { month = "เมษายน" } break;
        case "05": { month = "พฤษภาคม" } break;
        case "06": { month = "มิถุนายน" } break;
        case "07": { month = "กรกฎาคม" } break;
        case "08": { month = "สิงหาคม" } break;
        case "09": { month = "กันยายน" } break;
        case "10": { month = "ตุลาคม" } break;
        case "11": { month = "พฤศจิกายน" } break;
        case "12": { month = "ธันวาคม" } break;
    }
    
    return {
        "date": moment(object.date).format("YYYY-MM-DD"),
        "date_th": day + " " + month + " " + year,
        "stop": object.stop,
        "idle": object.idle,
        "run": object.run,
        "cut_load": object.cut_load,
        "efficiency": object.efficiency
    }
}

exports.isDay_performance = isDay_performance;
exports.isAll_performance = isAll_performance;
exports.Day_performance = Day_performance;

// #endregion HTT02-04-2

// #region HTT02-04-3

function get_report_harvester_history(req, res){
    
    // #region queryBug
    /*
     SELECT
     to_char(hh.start_record, 'DD-MM-YYYY HH24:MI') as start_record,
     to_char(hh.end_record, 'DD-MM-YYYY HH24:MI') as end_record,
     to_char(hh.date_record, 'DD-MM-YYYY HH24:MI') as date_record,
     round(hh.total_time / 60) as total_time,
     hh.start_lat,
     hh.start_lon,
     hh.status_type_start,
     hh.tambol_start,
     hh.amphur_start,
     hh.blackbox_id,
     hh.plot_code_start, 
     hh.zone_id_start, 
     hh.province_start,
     ST_AsGeoJSON(htt1.wkt_geom),
     htt1.f_id,
     htt1.type_polygon
     FROM history_status_havester as hh, htt1
     WHERE hh.blackbox_id = get_blackbox_id('K004791')
     AND hh.start_record >= '2016-01-04 07:00'
     AND hh.end_record <='2016-01-05 09:25'
     AND htt1.f_id = hh.plot_code_start
      
     */
    // #endregion queryBug
    

    var query = "";

    query += " SELECT";
    query += " to_char(hh.start_record, 'DD-MM-YYYY HH24:MI') as start_record,";
    query += " to_char(hh.end_record, 'DD-MM-YYYY HH24:MI') as end_record,";
    query += " to_char(hh.date_record, 'DD-MM-YYYY HH24:MI') as date_record,";
    query += " round(hh.total_time / 60) as total_time,";
    query += " hh.start_lat,";
    query += " hh.start_lon,";
    query += " hh.status_type_start,";
    query += " hh.tambol_start,";
    query += " hh.amphur_start,";
    query += " hh.blackbox_id,";
    query += " hh.plot_code_start, ";
    query += " hh.zone_id_start, ";
    query += " hh.province_start,";
    query += " ST_AsGeoJSON(htt1.wkt_geom),";
    query += " htt1.f_id,";
    query += " htt1.type_polygon"
    query += " FROM history_status_havester as hh, htt1";
    query += " WHERE hh.blackbox_id = get_blackbox_id(" + utl.sqote(req.params.havester_name) + ")";
    query += " AND hh.start_record >= " + utl.sqote(req.params.start_time);
    query += " AND hh.end_record <= " + utl.sqote(req.params.end_time);
    query += " AND htt1.f_id = hh.plot_code_start";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            set_report_harvester(rows, req.params.havester_name, function (report) { 
                res.send(report);
            });
        } else {
            res.send('No-Query');
        }
    });
}

function get_activity_harvester(req, res) {

    var object = { "harvester_activity": [], "truck_match": [], "area_cutting": [] }; 
    var query = ''; var query_a = ''; var query_b = ''; var query_c = '';
    var finish_a = false; var finish_b = false; var finish_c = false;
    
    var supQuery_c = " SELECT plot_code from cut_to_crushtime_log";
    supQuery_c += " WHERE to_date(cutting_time, 'YYYY-MM-DD') = " + utl.sqote(req.params.selectTime);
    supQuery_c += " AND harvester_name = " + utl.sqote(req.params.vihicle_code);
    
    query_a += " SELECT get_blackbox_id(" + utl.sqote(req.params.vihicle_code) +")";

    query_b += " SELECT truck_name,";
    query_b += " left(cutting_time, 19) as start_match,";
    query_b += " farm_leaving as finish_match,";
    query_b += " blackbox_id as blackbox_truck";
    query_b += " FROM cut_to_crushtime_log";
    query_b += " WHERE harvester_name = " + utl.sqote(req.params.vihicle_code);
    query_b += " AND to_date(cutting_time,'YYYY-MM-DD') = " + utl.sqote(req.params.selectTime);
    
    query_c += " SELECT f_id,ST_AsGeoJSON(wkt_geom),type_polygon FROM htt1";
    query_c += " WHERE f_id IN (" + supQuery_c + ")";
    
    var activity_harvester = function (value) {
        query += " SELECT r_status,idate(r_time) as r_time,";
        query += " r_lon, r_lat, tambol,";
        query += " amphur, province, substr(r_io,1,2) as r_io ";
        query += " FROM z" + value + "data";
        query += " WHERE to_char(r_time,'YYYY-MM-DD') = " + utl.sqote(req.params.selectTime);
        query += " ORDER BY r_time ASC";

        db.get_rows(pg_config_dbu101279, query, function (rows) {
            finish_a = true;
            if (rows.length > 0) { object.harvester_activity = rows; }
            final();
        });
    };

    var final = function () {
        if (finish_a && finish_b && finish_c) { 
            res.send(object);
        }
    }

    db.get_rows(pg_config_HTT, query_a, function (rows) { 
        activity_harvester(rows[0].get_blackbox_id);
    });

    db.get_rows(pg_config_HTT, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) { object.truck_match = rows; }
        final();
    });

    db.get_rows(pg_config_HTT, query_c, function (rows) {
        finish_c = true;
        var strMustache = '';
        if (rows.length > 0) {
            strMustache += '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "area_code": "{{f_id}}",';
            strMustache += ' "type_polygon": "{{type_polygon}}",';
            strMustache += ' "geometry":  {{st_asgeojson}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';
            
            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var theEnd = '{ "type":"FeatureCollection","features":[' + result + '] }';
            theEnd = JSON.parse(theEnd.replace(/&quot;/g, '"'));
            object.area_cutting = [theEnd];
        }
        final();
    });
}

function set_report_harvester(rows, vehicle, callback) {
    var harvester_lose = new LINQ(rows).Where(function (x) { return x.status_type_start == 88 }).ToArray();
    var harvester_stop = new LINQ(rows).Where(function (x) { return x.status_type_start == 33 }).ToArray();
    var harvester_idle = new LINQ(rows).Where(function (x) { return x.status_type_start == 31 }).ToArray();
    var harvester_run = new LINQ(rows).Where(function (x) { return x.status_type_start == 30 }).ToArray();
    var harvester_cutcane = new LINQ(rows).Where(function (x) { return x.status_type_start == 11 }).ToArray();
    
    var harvester_detail = {
        "vehicle_name": vehicle,
        "vehicle_lost": set_sumary(harvester_lose),
        "vehicle_stop": set_sumary(harvester_stop),
        "vehicle_idel": set_sumary(harvester_idle),
        "vehicle_run": set_sumary(harvester_run),
        "vehicle_cutcane": set_sumary(harvester_cutcane),
    }
    
    var data_return = {
        "harvester_detail": harvester_detail,
        "harvester_lose": harvester_lose,
        "harvester_stop": harvester_stop,
        "harvester_idle": harvester_idle,
        "harvester_run": harvester_run,
        "harvester_cutcane": harvester_cutcane
    };
    
    callback(data_return);
    return;

}

exports.get_report_harvester_history = get_report_harvester_history;
exports.get_activity_harvester = get_activity_harvester;

// #endregion HTT02-04-3

// #region HTT02-04-4

function isDay_outsize(req, res) { 
    var query = " SELECT idate(date_report) as date_report,total_harvester";
    query += " ,total_workout_zone, time_workout_zone";
    query += " FROM harvester_workout_zone_report";
    query += " WHERE date_report >= " + utl.sqote(req.params.start_time);
    query += " AND date_report <= " + utl.sqote(req.params.end_time);

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function isAll_outsize(req, res) { 
    var query = " SELECT idate(date_report) as date_report,total_harvester";
    query += " ,total_workout_zone, time_workout_zone";
    query += " FROM harvester_workout_zone_report";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function Day_outsize(req, res) { 
    var query = " SELECT get_harvester(blackbox_id) as harvester_code";
    query += " ,tambol_start, amphur_start, province_start, plot_code_start";
    query += " ,datediff ('hour', start_record, end_record) as work_out_total";
    query += " FROM history_status_havester";
    query += " WHERE status_type_start = '77'";
    query += " AND get_ymd(start_record) = " + utl.sqote(req.params.date);
    query += " AND length(plot_code_start) > 1";
    query += " AND datediff('hour', start_record, end_record) IS NOT NULL";
    query += " AND get_harvester(blackbox_id) IS NOT NULL";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.isDay_outsize = isDay_outsize;
exports.isAll_outsize = isAll_outsize;
exports.Day_outsize = Day_outsize;

// #endregion HTT02-04-4

// #region HTT02-04-5

function fuel_report_harvester(req, res) {
    var query = "";

    query += " SELECT idate(date_report) as dateTime";
    query += " ,fuel_collect,working_hour,avg_fuel";
    query += " FROM harvester_fuel_report";
    query += " WHERE harvester_name = " + utl.sqote(req.params.havester_name);
    query += " AND date_report >= " + utl.sqote(req.params.start_time);
    query += " AND date_report <= " + utl.sqote(req.params.end_time);

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.fuel_report_harvester = fuel_report_harvester;

// #endregion HTT02-04-5

// #region HTT03-01-1

function select_htt7(req, res){
    var query = "SELECT * FROM htt7 WHERE truck_number = " + utl.sqote(req.params.truck_name);

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function register_htt7(req, res) {
    
    var bp = req.body.bp == null ? '' : req.body.bp;
    var zone = req.body.zone == null ? '' : req.body.zone;

    var query_insert = squel.insert()
            .into('htt7')
            .set('bp', bp)
            .set('truck_number', req.body.truck_number)
            .set('name', req.body.name)
            .set('type', req.body.type)
            .set('brand', req.body.brand)
            .set('product', req.body.product)
            .set('truck_licen', req.body.truck_id)
            .set('truck_province', req.body.truck_province)
            .set('blackbox_id', req.body.blackbox_id)
            .set('sim_id', req.body.sim_id)
            .set('zone', zone)
            .toString();
    var query_update = squel.update()
            .table('htt7')
            .set('bp', bp)
            .set('truck_number', req.body.truck_number)
            .set('name', req.body.name)
            .set('type', req.body.type)
            .set('brand', req.body.brand)
            .set('product', req.body.product)
            .set('truck_licen', req.body.truck_id)
            .set('truck_province', req.body.truck_province)
            .set('blackbox_id', req.body.blackbox_id)
            .set('sim_id', req.body.sim_id)
            .set('zone', zone)
            .where('truck_number = ' + utl.sqote(req.body.truck_number))
            .toString();
    
    var update_TruckName = function () {
        var query = squel.update()
            .table('truck')
            .set('truck_name', req.body.truck_number)
            .where('truck_id = (SELECT truck_id FROM blackbox WHERE blackbox_id = ' + utl.sqote(req.body.blackbox_id) + ')')
            .toString();
        
        db.excute(pg_config_dbu101279, query, function (response) {
            if (response == 'oK') {
                res.send('Update-Complete');
            } else {
                res.send('Update-failed');
            }
        });
    }
    
    utcp.upsert_template(query_insert, query_update, function (query) {
        db.excute(pg_config_HTT, query, function (response) {
            if (response == 'oK') {
                
                iOut.set_havester_or_truck(req.body.blackbox_id, 'truck', function (fin) {
                    console.log('set register_truck '+fin);
                });

                update_TruckName();

            } else {
                res.send('Update-failed');
            }
        });
    });
}

function update_htt7(req, res) {
    var query = " UPDATE htt7 SET";
    query += " name = mt.truck_name,";
    query += " type = get_trucktype(mt.truck_vehicle_code),";
    query += " brand = mt.truck_brand,";
    query += " product = mt.truck_model,";
    query += " truck_licen = mt.truck_plate_licen,";
    query += " truck_province = mt.truck_province,";

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            res.send('Update-Complete');
        } else {
            res.send('Update-failed');
        }
    });
}

function get_MasterTruck(req, res){
    var finish_a = false;
    var object = { "master_truck": [] };
    var query = "SELECT truck_name, truck_model, truck_brand, get_trucktype(" + utl.sqote(req.params.truck_name) + ") as truck_type, truck_plate_licen, truck_province FROM master_truck WHERE truck_vehicle_code = " + utl.sqote(req.params.truck_name);
    
    var final = function () {
        if (finish_a) { 
            res.send(object);
        }
    }

    db.get_rows(pg_config_HTT, query, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.master_truck = rows[0]; }
        final();
    });
}

function truck_unregis(req, res) {
    
    var query = squel.update()
            .table('truck')
            .set('truck_name', req.body.blackbox_id)
            .where('truck_name = ' + utl.sqote(req.body.blackbox_id))
            .toString();
    
    db.excute(pg_config_dbu101279, query, function (response) {
        if (response == 'oK') {
            final();
        } else {
            res.send('Delete-failed');
        }
    });
    
    var final = function () {
        var query = "DELETE FROM htt7 WHERE truck_number = " + utl.sqote(req.body.truck_code);
        
        db.excute(pg_config_HTT, query, function (response) {
            if (response == 'oK') {
                res.send('Delete-Complate');
            } else {
                res.send('Delete-failed');
            }
        });
    }
    
}

exports.select_htt7 = select_htt7;
exports.register_htt7 = register_htt7;
exports.update_htt7 = update_htt7;
exports.get_MasterTruck = get_MasterTruck;
exports.truck_unregis = truck_unregis;

// #endregion HTT03-01-1

// #region HTT03-02-1

function get_relation_T_H(req, res){
    var json = { "form": [], "table": [] };
    var query_a = ''; var query_b = '';
    var step_one = false; var step_two = false;
    
    query_a += " SELECT DISTINCT";
    query_a += " htt7.bp,";
    query_a += " htt7.truck_number,";
    query_a += " htt7.name,";
    query_a += " htt7.type,";
    query_a += " htt7.truck_licen,";
    query_a += " htt7.truck_province,";
    query_a += " truck.truck_telephone,";
    query_a += " detail.year";
    query_a += " FROM";
    query_a += " htt7 as htt7,";
    query_a += " master_truck as truck,";
    query_a += " detail_truck as detail";
    query_a += " WHERE htt7.truck_number = truck.truck_vehicle_code";
    query_a += " AND htt7.truck_number = detail.truck_vehicle_code";
    query_a += " AND htt7.truck_number = " + utl.sqote(req.body.truck_name);
    query_a += " AND detail.company_code = " + utl.sqote(req.body.company);
    query_a += " AND detail.year = (SELECT year from master_factory_config WHERE is_master = true)";
    
    query_b += " SELECT DISTINCT";
    query_b += " dt.havest_vehicle_code,";
    query_b += " mh.havest_name";
    query_b += " FROM";
    query_b += " detail_truck AS dt,";
    query_b += " master_havester AS mh";
    query_b += " WHERE";
    query_b += " dt.havest_vehicle_code = mh.havest_vehicle_code";
    query_b += " AND dt.truck_vehicle_code = " + utl.sqote(req.body.truck_name);
    query_b += " AND dt.company_code = " + utl.sqote(req.body.company);
    query_b += " AND dt.year = (SELECT year from master_factory_config WHERE is_master = true)";
  
    var final = function () {
        if (step_one == true && step_two == true) {
            res.send(json);
        }
    }

    db.get_rows(pg_config_HTT, query_a, function (rows) {
        step_one = true;
        if (rows.length > 0) { json.form = rows[0]; }
        final();
    });
    
    db.get_rows(pg_config_HTT, query_b, function (rows) {
        step_two = true;
        if (rows.length > 0) { json.table = rows; }
        final();
    });

}

function get_norelation_T_H(req, res) { 
    var query = " SELECT truck_number FROM htt7 WHERE truck_number NOT IN (";
    query += " SELECT DISTINCT truck_vehicle_code FROM detail_truck";
    query += " WHERE truck_vehicle_code IN(SELECT truck_number FROM htt7))";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.get_relation_T_H = get_relation_T_H;
exports.get_norelation_T_H = get_norelation_T_H;

// #endregion HTT03-02-1

// #region HTT03-03-1

function tracking_truck(req, res){
    var object = { "vehicle_all": 0, "vehicle_tracking": [] };
    var finish_a = false; var finish_b = false; var query_a = ''; var query_b = '';
    
    query_a += " SELECT count(*) as truck_total FROM htt7";
    query_b += " SELECT htt7.truck_code";
    query_b += " ,truck.truck_name";
    query_b += " ,rec_now.blackbox_id,_r_datasend"
    query_b += " ,r_lon,r_lat,tambol,amphur,province,r_status";
    query_b += " ,htt_status_useability";
    query_b += " ,lower(htt_place) as htt_place,htt7.truck_telephone,htt7.name";
    query_b += " FROM rec_now,truck,blackbox";
    query_b += " ,dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT truck_number, blackbox_id, bp, name, truck_telephone FROM htt7, master_truck WHERE htt7.truck_number = master_truck.truck_vehicle_code') as htt7 (truck_code varchar(50),blackbox_id varchar(50),bp varchar(10),name varchar(255),truck_telephone varchar(20))";
    query_b += " WHERE blackbox.blackbox_id = rec_now.blackbox_id";
    query_b += " AND truck.truck_id = blackbox.truck_id";
    query_b += " AND htt7.blackbox_id = rec_now.blackbox_id";
    
    var final = function () {
        if (finish_a && finish_b) { 
            res.send(object);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.vehicle_all = rows[0].truck_total; }
        final();
    });

    db.get_rows(pg_config_dbu101279, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) { object.vehicle_tracking = rows; }
        final();
    });
}

exports.tracking_truck = tracking_truck;

// #endregion HTT03-03-1

// #region HTT03-03-2

function working_truck(req, res){
    
    var object = { "vehicle_all": 0, "vehicle_working": [] };
    var finish_a = false; var finish_b = false; var query_a = ''; var query_b = '';
    
    query_a += " SELECT count(*) as truck_total FROM htt7";
    query_b += " SELECT htt7.truck_code";
    query_b += " ,truck.truck_name";
    query_b += " ,htt7.blackbox_id,_r_datasend";
    query_b += " ,r_lon,r_lat,tambol,amphur,province,r_status";
    query_b += " ,lower(htt_status_operation) as htt_status_operation";
    query_b += " ,lower(htt_place) as htt_place";
    query_b += " ,htt7.bp,htt_plotcode";
    query_b += " ,htt7.name,htt7.truck_telephone";
    query_b += " ,get_name_framer(htt_plotcode) as framer_name";
    query_b += " FROM rec_now,truck,blackbox";
    query_b += " ,dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT truck_number,blackbox_id,bp,name,truck_telephone FROM htt7, master_truck WHERE htt7.truck_number = master_truck.truck_vehicle_code') as htt7(truck_code varchar(50), blackbox_id varchar(50), bp varchar(10), name varchar(255),truck_telephone varchar(20))";
    query_b += " WHERE blackbox.blackbox_id = rec_now.blackbox_id";
    query_b += " AND truck.truck_id = blackbox.truck_id";
    query_b += " AND htt7.blackbox_id = rec_now.blackbox_id";

    var final = function () {
        if (finish_a && finish_b) {
            res.send(object);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.vehicle_all = rows[0].truck_total; }
        final();
    });
    
    db.get_rows(pg_config_dbu101279, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) { object.vehicle_working = rows; }
        final();
    });
}

exports.working_truck = working_truck;

// #endregion HTT03-03-2

// #region HTT03-03-3

function truck_of_status(req, res){
    var object = { "vehicle_all": null, "vehicle_status": [] };
    var FinalA = false; var FinalB = false; var query_a = ''; var query_b = '';

    query_a += " SELECT count(*) as truck_total FROM htt7";
    query_b += " SELECT htt7.truck_code";
    query_b += " ,truck.truck_name";
    query_b += " ,htt7.blackbox_id,_r_datasend";
    query_b += " ,r_lon,r_lat,tambol,amphur,province,r_status";
    query_b += " ,lower(htt_status_truck) as htt_status_truck";
    query_b += " ,lower(htt_place) as htt_place";
    query_b += " ,htt7.bp";
    query_b += " ,htt7.name";
    query_b += " ,htt_plotcode,htt7.truck_telephone";
    query_b += " ,get_name_framer(htt_plotcode) as framer_name";
    query_b += " ,htt_cuttingtime";
    query_b += " ,htt_farm_leaving";
    query_b += " ,htt_park_outside";
    query_b += " ,htt_factory_leaving";
    query_b += " FROM rec_now,truck,blackbox";
    query_b += " ,dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT truck_number,blackbox_id,bp,name,truck_telephone FROM htt7, master_truck WHERE htt7.truck_number = master_truck.truck_vehicle_code') as htt7";
    query_b += " (truck_code varchar(50), blackbox_id varchar(50), bp varchar(10), name varchar(255),truck_telephone varchar(20))";
    query_b += " WHERE blackbox.blackbox_id = rec_now.blackbox_id";
    query_b += " AND truck.truck_id = blackbox.truck_id";
    query_b += " AND htt7.blackbox_id = rec_now.blackbox_id";

    var final = function () {
        if (FinalA && FinalB) {
            res.send(object);
        }
    }

    db.get_rows(pg_config_HTT, query_a, function (rows) {
        if (rows.length > 0) {
            object.vehicle_all = rows[0].truck_total;
        } else {
            object.vehicle_all = 0;
        }
        FinalA = true;
        final();
    });
    
    db.get_rows(pg_config_dbu101279, query_b, function (rows) {
        if (rows.length > 0) {
            object.vehicle_status = rows;
        } else {
            object.vehicle_status = [];
        }
        FinalB = true;
        final();
    });
}

exports.truck_of_status = truck_of_status;

// #endregion HTT03-03-3

// #region HTT03-04-1

function inDay_usability(req, res) { 
    var query = " SELECT lost_date";
    query += " , lost_date_vehicle";
    query += " , lost_date_total";
    query += " , lost_date_diff";
    query += " , get_trucktype3(lost_type) as lost_type";
    query += " FROM history_usability_truck";
    query += " WHERE lost_date >= " + utl.sqote(req.params.start_time);
    query += " AND lost_date <= " + utl.sqote(req.params.end_time);
    if (req.params.type != 'all') { query += " AND lost_type = " + utl.sqote(req.params.type); }
    query += " ORDER BY lost_date ASC"

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
    
}

function inAll_usability(req, res) {
    var query = " SELECT lost_date";
    query += " , lost_date_vehicle";
    query += " , lost_date_total";
    query += " , lost_date_diff";
    query += " , get_trucktype3(lost_type) as lost_type";
    query += " FROM history_usability_truck";
    if (req.params.type != 'all') { query += " WHERE lost_type = " + utl.sqote(req.params.type); }
    query += " ORDER BY lost_date ASC"
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function in_usability(req, res) { 
    var query = " SELECT DISTINCT vehicle_name";
    query += " , get_truckmodel (vehicle_name) as licen_vehicle";
    query += " , get_trucktype(vehicle_name) as type_vehicle";
    query += " , count(vehicle_name) as total_vehicle";
    query += " , datediff('hour', start_lost, end_lost) as summary_lost";
    query += " FROM lost_vehicle WHERE get_ymd(start_lost) = " + utl.sqote(req.params.date);
    query += " AND vehicle_type = 'รถบรรทุก'";
    query += " GROUP BY vehicle_name, start_lost, end_lost";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.inDay_usability = inDay_usability;
exports.inAll_usability = inAll_usability;
exports.in_usability = in_usability;

// #endregion HTT03-04-1

// #region HTT03-04-2

function inDay_performance(req, res) {
    var object = { "stop_sum": 0, "idle_sum": 0, "run_sum": 0, "wait_sum": 0, "performance": [] };
    var query = " SELECT date_start";
    query += " ,COALESCE (get_trucktype3(truck_type), 'ทั้งหมด') as truck_typeS";
    query += " ,stop, idle, run, wait, efficiency";
    query += " FROM history_performance_truck";
    query += " WHERE truck_type = " + utl.sqote(req.params.type);
    query += " AND date_start >= " + utl.sqote(req.params.start_time);
    query += " AND date_start <= " + utl.sqote(req.params.end_time);
    query += " ORDER BY date_start ASC";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            object.performance = rows;
            object.stop_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.stop) }).Sum();
            object.idle_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.idle) }).Sum();
            object.run_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.run) }).Sum();
            object.wait_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.wait) }).Sum();
        }
        res.send(object);
    });
}

function inAll_performance(req, res) {
    var object = { "stop_sum": 0, "idle_sum": 0, "run_sum": 0, "wait_sum": 0, "performance": [] };
    var query = " SELECT date_start";
    query += " ,COALESCE (get_trucktype3(truck_type), 'ทั้งหมด') as truck_typeS";
    query += " ,stop, idle, run, wait, efficiency";
    query += " FROM history_performance_truck";
    query += " WHERE truck_type = " + utl.sqote(req.params.type);
    query += " ORDER BY date_start ASC";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            object.performance = rows;
            object.stop_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.stop) }).Sum();
            object.idle_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.idle) }).Sum();
            object.run_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.run) }).Sum();
            object.wait_sum = new LINQ(object.performance).Select(function (x) { return parseInt(x.wait) }).Sum();
        }
        res.send(object);
    });
}

function in_performance(req, res) { 
    var query = " WITH res as(";
    query += " SELECT truck_number as vehicle_code";
    query += " ,blackbox_id";
    query += " FROM htt7";
    query += " )";
    query += " SELECT vehicle_code,blackbox_id";
    query += " ,SUM(get_status_zrep(blackbox_id," + utl.sqote(req.params.date) +",'33')::int / 60) as stop";
    query += " ,SUM(get_status_zrep(blackbox_id," + utl.sqote(req.params.date) + ",'31')::int / 60) as idle";
    query += " ,SUM(get_status_zrep(blackbox_id," + utl.sqote(req.params.date) + ", '30')::int / 60) as run";
    query += " ,SUM(get_waitting_time(vehicle_code," + utl.sqote(req.params.date) + ")::int) as watting";
    query += " ,get_trucktype(vehicle_code) as truck_type";
    query += " ,get_truckmodel(vehicle_code) as licen";
    query += " ,iround((SUM(get_waitting_time(vehicle_code, " + utl.sqote(req.params.date) + ")::int) + 0.1 / ";
    query += " ((SUM(get_status_zrep(blackbox_id, " + utl.sqote(req.params.date) + ",'31')::int / 60) + 0.1) + ";
    query += " (SUM(get_status_zrep(blackbox_id, " + utl.sqote(req.params.date) + ",'30')::int / 60) + 0.1)) * ";
    query += " 100) - 0.3, 2) as efficiency";
    query += " FROM res";
    query += " WHERE get_status_zrep(blackbox_id, " + utl.sqote(req.params.date) + ",'30')::int > 0";
    query += " AND get_waitting_time(vehicle_code, " + utl.sqote(req.params.date) + ")::int > 0 ";
    query += " GROUP BY vehicle_code,blackbox_id";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.inDay_performance = inDay_performance;
exports.inAll_performance = inAll_performance;
exports.in_performance = in_performance;

// #endregion HTT03-04-2

// #region HTT03-04-3

function get_report_truck_history(req, res) {
    var query = "";

    query += " SELECT";
    query += " to_char(hh.start_record, 'DD-MM-YYYY HH24:MI') as start_record,";
    query += " to_char(hh.end_record, 'DD-MM-YYYY HH24:MI') as end_record,";
    query += " to_char(hh.date_record, 'DD-MM-YYYY HH24:MI') as date_record,";
    query += " round(hh.total_time / 60) as total_time,";
    query += " hh.start_lat,";
    query += " hh.start_lon,";
    query += " hh.status_type_start,";
    query += " hh.tambol_start,";
    query += " hh.amphur_start,";
    query += " hh.blackbox_id,";
    query += " hh.plot_code_start, ";
    query += " hh.zone_id_start, ";
    query += " hh.province_start,";
    query += " ST_AsGeoJSON(htt1.wkt_geom),";
    query += " htt1.f_id,";
    query += " htt1.type_polygon";
    query += " FROM history_status_truck as hh, htt1";
    query += " WHERE hh.blackbox_id = get_blackbox_truck(" + utl.sqote(req.params.truck_name) + ")";
    query += " AND hh.start_record >= " + utl.sqote(req.params.start_time);
    query += " AND hh.end_record <= " + utl.sqote(req.params.end_time);
    query += " AND htt1.f_id = hh.plot_code_start";
    
    var step_next = function (data) {
        var query = " SELECT type, product FROM htt7 WHERE truck_number = " + utl.sqote(req.params.truck_name);

        db.get_rows(pg_config_HTT, query, function (rows) {
            if (rows.length > 0) { 
                var object = { "vehicle_name": req.params.truck_name, "vehicle_licen": rows[0].type, "vehicle_product": rows[0].product };
                
                set_report_truck(data, object, function (report) {
                    res.send(report);
                });
            } else {
                res.send('No-Query');
            }
        });
    }

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            step_next(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function get_activity_truck(req, res) {
    var object = { "truck_activity": [], "harvester_match": [] };
    var query = ''; var query_a = ''; var query_b = '';
    var finish_a = false; var finish_b = false;
    
    query_a += " SELECT get_blackbox_truck(" + utl.sqote(req.params.vihicle_code) + ")";
    
    query_b += " SELECT";
    query_b += " harvester_name, farm_leaving as finish_match,";
    query_b += " split_part(match_harvester_truck, ',', 1) as blackbox_harvester,"
    query_b += " left(cutting_time, 19) as start_match,";
    query_b += " f_id, st_AsGeoJSON(wkt_geom), type_polygon";
    query_b += " FROM htt1, cut_to_crushtime_log";
    query_b += " WHERE truck_name = " + utl.sqote(req.params.vihicle_code);
    query_b += " AND to_date(cutting_time, 'YYYY-MM-DD') =" + utl.sqote(req.params.selectTime);
    query_b += " AND f_id = plot_code";
    
    var activity_truck = function (value) {
        query += " SELECT r_status,idate(r_time) as r_time,";
        query += " r_lon, r_lat, tambol,";
        query += " amphur, province";
        query += " FROM z" + value + "data";
        query += " WHERE to_char(r_time,'YYYY-MM-DD') = " + utl.sqote(req.params.selectTime);
        query += " ORDER BY r_time ASC";
        
        db.get_rows(pg_config_dbu101279, query, function (rows) {
            finish_a = true;
            if (rows.length > 0) { object.truck_activity = rows; }
            final();
        });
    };
    
    var final = function () {
        if (finish_a && finish_b) {
            res.send(object);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        activity_truck(rows[0].get_blackbox_truck);
    });
    
    db.get_rows(pg_config_HTT, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) { object.harvester_match = rows; }
        final();
    });
   
}

function set_report_truck(rows, object, callback) {
    var truck_lose = new LINQ(rows).Where(function (x) { return x.status_type_start == 88 }).ToArray();
    var truck_stop = new LINQ(rows).Where(function (x) { return x.status_type_start == 33 }).ToArray();
    var truck_idle = new LINQ(rows).Where(function (x) { return x.status_type_start == 31 }).ToArray();
    var truck_run = new LINQ(rows).Where(function (x) { return x.status_type_start == 30 }).ToArray();
    var truck_load = new LINQ(rows).Where(function (x) { return x.status_type_start == 77 }).ToArray();

    var truck_detail = {
        "vehicle_name": object.vehicle_name,
        "vehicle_licen": object.vehicle_licen,
        "vehicle_type": object.vehicle_product,
        "vehicle_lost": set_sumary(truck_lose),
        "vehicle_stop": set_sumary(truck_stop),
        "vehicle_idel": set_sumary(truck_idle),
        "vehicle_run": set_sumary(truck_run),
        "vehicle_load": set_sumary(truck_load),
    }
    
    var data_return = {
        "truck_detail": truck_detail,
        "truck_lose": truck_lose,
        "truck_stop": truck_stop,
        "truck_idle": truck_idle,
        "truck_run": truck_run,
        "truck_load": truck_load
    };

    callback(data_return);
    return;

}

exports.get_report_truck_history = get_report_truck_history;
exports.get_activity_truck = get_activity_truck;

// #endregion HTT03-04-3

// #region HTT03-04-4

function inDay_waiting(req, res) {
    var object = { "infarm": 0, "parkOutsize": 0, "parkPrepare": 0, "parkInsize": 0, "waiting": [] };
    var query = " SELECT";
    query += " date,";
    query += " COALESCE(get_trucktype3(type), 'ทั้งหมด') as type,";
    query += " waiting_infarm,";
    query += " waiting_parkoutside,";
    query += " waiting_prepare,";
    query += " waiting_inside";
    query += " FROM history_waiting_truck WHERE";
    query += " date >= " + utl.sqote(req.params.start_time) + " AND date <= " + utl.sqote(req.params.end_time);
    query += " AND type = " + utl.sqote(req.params.type);

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            object.waiting = rows;
            object.infarm = new LINQ(rows).Select(function (x) { return parseInt(x.waiting_infarm) }).Sum();
            object.parkOutsize = new LINQ(rows).Select(function (x) { return parseInt(x.waiting_parkoutside) }).Sum();
            object.parkPrepare = new LINQ(rows).Select(function (x) { return parseInt(x.waiting_prepare) }).Sum();
            object.parkInsize = new LINQ(rows).Select(function (x) { return parseInt(x.waiting_inside) }).Sum();
        }
        res.send(object);
    });
}

function inAll_waiting(req, res) {
    var object = { "infarm": 0, "parkOutsize": 0, "parkPrepare": 0, "parkInsize": 0, "waiting": [] };
    var query = " SELECT";
    query += " date,";
    query += " COALESCE(get_trucktype3(type), 'ทั้งหมด') as type,";
    query += " waiting_infarm,";
    query += " waiting_parkoutside,";
    query += " waiting_prepare,";
    query += " waiting_inside";
    query += " FROM history_waiting_truck";
    query += " WHERE type = " + utl.sqote(req.params.type);
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            object.waiting = rows;
            object.infarm = new LINQ(rows).Select(function (x) { return parseInt(x.waiting_infarm) }).Sum();
            object.parkOutsize = new LINQ(rows).Select(function (x) { return parseInt(x.waiting_parkoutside) }).Sum();
            object.parkPrepare = new LINQ(rows).Select(function (x) { return parseInt(x.waiting_prepare) }).Sum();
            object.parkInsize = new LINQ(rows).Select(function (x) { return parseInt(x.waiting_inside) }).Sum();
        }
        res.send(object);
    });
}

exports.inDay_waiting = inDay_waiting;
exports.inAll_waiting = inAll_waiting;

// #endregion HTT03-04-4

// #region HTT03-04-5

function fuel_report_truck(req, res) {
    var query = "";
    
    query += " SELECT idate(date_report) as dateTime";
    query += " ,fuel_collect, working_hour, avg_fuel";
    query += " ,get_trucktype(truck_name) as truck_type";
    query += " ,get_truckmodel(truck_name) as licence";
    query += " FROM truck_fuel_report";
    query += " WHERE truck_name = " + utl.sqote(req.params.truck_name);
    query += " AND date_report >= " + utl.sqote(req.params.start_time);
    query += " AND date_report <= " + utl.sqote(req.params.end_time);
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.fuel_report_truck = fuel_report_truck;

// #endregion HTT03-04-5

// #region HTT03-04-6

function point_average(req, res) { 
    var query = " SELECT htt_truck_name,";
    query += " dlget_trucklicen(htt_truck_name) as truck_licence,";
    query += " htt_cuttingtime,";
    query += " htt_factorytime,";
    query += " get_zoneid(htt_plotcode) as htt_zone,";
    query += " htt_harvester_name,";
    query += " htt_plotcode,";
    query += " tambol,";
    query += " amphur,";
    query += " province,";
    query += " iROUND(fnCalcDistanceKM(r_lat, get_lat_factory()::FLOAT, r_lon, get_lng_factory()::FLOAT) , 3) as km";
    query += " FROM rec_now";
    query += " WHERE htt_cuttingtime IS NOT NULL";
    query += " AND to_char(now(), 'YYYY-MM-dd') = to_char(htt_cuttingtime, 'YYYY-MM-dd')";
    query += " AND htt_truck_name = " + utl.sqote(req.params.vehicle_code);

    db.get_rows(pg_config_dbu101279, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.point_average = point_average;

// #endregion HTT03-04-6

// #region HTT04-01-1

function check_status_cane(req, res) {
    var finish_a = false; var finish_b = false; var finish_c = false;
    var query_a = ''; var query_b = ''; var query_c = '';
    var object = { "vehicle_all": [], "cane_amount": [], "vehicle_list": [], "vehicle_mark": [] };
    var sql_linq_a = "SELECT htt7.blackbox_id FROM dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT blackbox_id FROM htt7') as htt7 (blackbox_id varchar(20))";
    var sql_linq_b = " dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT truck_type,truck_model,truck_name,truck_vehicle_code FROM master_truck') as truck(truck_type varchar(30), truck_model varchar(30), truck_name varchar(100), truck_vehicle_code varchar(50))";
    var sql_linq_c = " dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT vehicle_type_id,vehicle_type,total FROM master_vehicle_type WHERE company_code IN (SELECT company_code FROM master_factory_config WHERE is_master = true)' ) as truck_type (vehicle_type_id varchar(5),vehicle_type_name varchar(50),total varchar)";
    

    query_a += " SELECT count(blackbox_id), 'total' as truck_status FROM rec_now";
    query_a += " WHERE blackbox_id IN(" + sql_linq_a + ")";
    query_a += " UNION ALL";
    query_a += " SELECT count(blackbox_id), 'without' as truck_status FROM rec_now";
    query_a += " WHERE blackbox_id IN (" + sql_linq_a + ")";
    query_a += " AND htt_place = 'ROAD_WITHOUT_CANE'";
    query_a += " UNION ALL";
    query_a += " SELECT count(blackbox_id), 'within' as truck_status FROM rec_now";
    query_a += " WHERE blackbox_id IN (" + sql_linq_a + ")";
    query_a += " AND htt_place = 'ROAD_WITH_CANE'";
    
    query_b += " WITH Rows as"
    query_b += " ("
    query_b += " SELECT htt_place,";
    query_b += " SUM(get_size_loading(htt_truck_name) :: int)";
    query_b += " FROM rec_now";
    query_b += " WHERE blackbox_id IN(" + sql_linq_a + ")";
    query_b += " AND htt_place != 'ROAD_WITHOUT_CANE'";
    query_b += " GROUP BY htt_place";
    query_b += " )";
    query_b += " SELECT htt_place,sum FROM Rows";
    query_b += " UNION ALL";
    query_b += " SELECT 'SUMMARY_ALL',SUM(sum) FROM Rows";

   
    query_c += " SELECT htt_truck_name, htt_status_truck";
    query_c += " ,CASE WHEN htt_status_truck = 'EMPTY' THEN '0' ELSE truck_type.total end as total";
    query_c += " ,truck_type.vehicle_type_name"
    query_c += " ,truck.truck_model, truck_name";
    query_c += " ,r_lon, r_lat, tambol, amphur";
    query_c += " ,province, _r_datasend, htt_place";
    query_c += " ,r_time, r_status,blackbox_id";
    query_c += " FROM rec_now";
    query_c += " ," + sql_linq_b + "," + sql_linq_c;
    query_c += " WHERE htt_harvester_or_truck = '1'";
    query_c += " AND htt_truck_name IS NOT NULL";
    query_c += " AND truck.truck_vehicle_code = rec_now.htt_truck_name";
    query_c += " AND truck_type.vehicle_type_id = truck.truck_type";
    
    var final = function () {
        if (finish_a && finish_b && finish_c) {
            res.send(object);
        }
    }
    
    var list = function (ob) { 
        return {
            "htt_truck_name": ob.htt_truck_name,
            "htt_status_truck": ob.htt_status_truck,
            "total": ob.total,
            "vehicle_type_name": ob.vehicle_type_name,
            "truck_model": ob.truck_model,
            "truck_name": ob.truck_name,
            "tambol": ob.tambol,
            "amphur": ob.amphur,
            "htt_place": ob.htt_place
        };
    }
    
    var mark = function (ob) {
        return {
            "vehicle_code": ob.htt_truck_name,
            "owner_truck": ob.truck_name,
            "r_lon": ob.r_lon,
            "r_lat": ob.r_lat,
            "tambol": ob.tambol,
            "amphur": ob.amphur,
            "province": ob.amphur,
            "r_time": ob.r_time,
            "r_status": ob.r_status,
            "_r_datasend": ob._r_datasend,
            "blackbox_id": ob.blackbox_id
        };
    }
    
    db.get_rows(pg_config_dbu101279, query_a, function (rows) {
        finish_a = true;
        var strJson = { "total": 0, "without": 0, "within": 0 };
        if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                switch (rows[i].truck_status){
                    case 'total': { strJson.total = rows[i].count; } break;
                    case 'without': { strJson.without = rows[i].count; } break;
                    case 'within': { strJson.within = rows[i].count; } break;
                }
            }
            object.vehicle_all = strJson;
        }
        final();
    });
    
    db.get_rows(pg_config_dbu101279, query_b, function (rows) {
        finish_b = true; var summary_all = 0;
        var strJson = { "summary": 0, "fram": 0, "road": 0, "parkOutSide": 0, "parkInSide": 0, "parkPrePare": 0 };  
        if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                switch (rows[i].htt_place) {
                    case 'FARM': { strJson.fram = parseInt(rows[i].sum); } break;
                    case 'SUMMARY_ALL': { strJson.summary = parseInt(rows[i].sum); } break;
                    case 'ROAD_WITH_CANE': { strJson.road = parseInt(rows[i].sum); } break;
                    case 'PARK_INSIDE': { strJson.parkInSide = parseInt(rows[i].sum); } break;
                    case 'PARK_PREPARE': { strJson.parkPrePare = parseInt(rows[i].sum); } break;
                    case 'PARK_OUTSIDE': { strJson.parkOutSide = parseInt(rows[i].sum); } break;
                }
            }
            object.cane_amount = strJson;
        }
        final();
    });
    
    db.get_rows(pg_config_dbu101279, query_c, function (rows) {
        finish_c = true;
        if (rows.length > 0) {
            object.vehicle_list = new LINQ(rows).Select(function (x) { return list(x) }).ToArray();
            object.vehicle_mark = new LINQ(rows).Select(function (x) { return mark(x) }).ToArray();
        }
        final();
    });
    
}

function tracking_cane(req, res) {
    var query = '';

    query += " SELECT";
    query += " htt7.truck_number as vehicle_code,";
    query += " htt7.name as owner_truck,";
    query += " htt7.blackbox_id,";
    query += " recNow.r_status,";
    query += " recNow.r_lon,";
    query += " recNow.r_lat,";
    query += " recNow.r_time,";
    query += " recNow._r_datasend,";
    query += " recNow.tambol,";
    query += " recNow.amphur,";
    query += " recNow.province";
    query += " FROM htt7, dblink";
    query += " (";
    query += " 'dbname=dbu_101279 port=5432',";
    query += " 'SELECT r_status,r_lon,r_lat,r_time,_r_datasend,tambol,amphur,province,blackbox_id FROM rec_now'";
    query += " )";
    query += " as recNow";
    query += " ("
    query += " r_status varchar(3),";
    query += " r_lon varchar(20),";
    query += " r_lat varchar(20),";
    query += " r_time varchar(20),";
    query += " _r_datasend varchar(20),";
    query += " tambol varchar(100),";
    query += " amphur varchar(100),";
    query += " province varchar(100),";
    query += " blackbox_id varchar(20)";
    query += " )";
    query += " WHERE htt7.truck_number = " + utl.sqote(req.params.vehicle_code);
    query += " AND htt7.blackbox_id = recNow.blackbox_id";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows[0]);
        } else {
            res.send('No-Query');
        }
    });

}

exports.check_status_cane = check_status_cane;
exports.tracking_cane = tracking_cane;

// #endregion HTT04-01-1

// #region HTT04-01-2

function load_caneAmount(req, res) { 
    var query = "SELECT data_text::json ->> 'harvestVehicleCode' as harvester_code";
    query += " ,SUM(datediff('minute',(data_text::json ->> 'cuttingTimestamp')::timestamp,(get_framLeaving(data_text::json ->> 'transactionId')::timestamp))) / 60 as hours";
    query += " ,SUM(get_trucktotal(data_text::json ->> 'dlvVehicleCode')::int) as amount";
    query += " FROM save_ho_log";
    query += " WHERE to_char(date_create,'YYYY-MM-DD') = to_char(now(),'YYYY-MM-DD')";
    query += " AND get_framLeaving(data_text::json ->> 'transactionId') IS NOT NULL";
    query += " GROUP BY data_text::json ->> 'harvestVehicleCode'";

    db.get_rows(pg_config_HTT, query, function (rows) {
        res.send(rows);
    });
}

exports.load_caneAmount = load_caneAmount;

// #endregion HTT04-01-2

// #region HTT04-01-3

function cut_to_crush(req, res) {
    
    var query = "";
    query += " SELECT";
    query += " htt_transectionid,";
    query += " blackbox_id,";
    query += " htt_match_harvester_truck,";
    query += " htt_plotcode, ";
    query += " htt_cuttingtime, ";
    query += " htt_harvester_name, ";
    query += " htt_truck_name, ";
    query += " htt_factorytime,";
    query += " dlget_trucklicen(htt_truck_name) as truck_licence,";
    query += " dlget_trucktype(htt_truck_name) as truck_type,";
    query += " date_part('HOUR', htt_factorytime :: TIMESTAMP - htt_cuttingtime :: TIMESTAMP) as summary_time,";
    query += " dlget_res_cane(htt_transectionid) as message_cane"
    query += " FROM rec_now";
    query += " WHERE htt_cuttingtime IS NOT NULL";
    query += " AND to_char(now(), 'YYYY-MM-dd') = to_char(htt_cuttingtime, 'YYYY-MM-dd')";
    query += " ORDER BY htt_cuttingtime DESC";
    
    db.get_rows(pg_config_dbu101279, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function cut_to_crushS(req, res) {
    var query = "";
    
    query += " SELECT plot_code,";
    query += " cutting_time,";
    query += " harvester_name,";
    query += " factorytime,";
    query += " truck_name,";
    query += " truck_licence,";
    query += " truck_type,";
    query += " transectionid,";
    query += " summary_time,";
    query += " message_cane";
    query += " FROM cut_to_crushtime_log";
    query += " WHERE cutting_time >= " + utl.sqote(req.body.startTime);
    query += " AND cutting_time <= " + utl.sqote(req.body.endTime);
    query += " ORDER BY cutting_time ASC";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function resend_to_cane(req, res)
{
 
    var transectionID = req.params.transectionID
    iResend.resend_cut2crush(transectionID, function (res_cb) {
        res.send(req.params.transectionID+' '+res_cb);
    });
}

exports.cut_to_crush = cut_to_crush;
exports.cut_to_crushS = cut_to_crushS;
exports.resend_to_cane = resend_to_cane;

// #endregion HTT04-01-3

//#region Extra

function edit_settingTruck(req, res){
    var query = "UPDATE setting_truck SET truck_weight = " + utl.sqote(parseInt(req.params.weight_one)) + " WHERE truck_id = '1';";
    query += " UPDATE setting_truck SET truck_weight = " + utl.sqote(parseInt(req.params.weight_two)) + " WHERE truck_id = '2';";
    query += " UPDATE setting_truck SET truck_weight = " + utl.sqote(parseInt(req.params.weight_three)) + " WHERE truck_id = '3';";
    query += " UPDATE setting_truck SET truck_weight = " + utl.sqote(parseInt(req.params.weight_four)) + " WHERE truck_id = '4';";

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            res.send('Update-Complete');
        } else {
            res.send('Update-failed');
        }
    });
}

function truck_setting(req, res){
    var query = "SELECT * FROM master_vehicle_type";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function search_vehicle_lost(req, res){
    var type = req.body.type;
    var query = "SELECT * FROM lost_vehicle WHERE vehicle_type = " + utl.sqote(type) + " ORDER BY id DESC";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function insert_vehicle_lost(req, res){
    var query = squel.insert()
        .into('lost_vehicle')
        .set('vehicle_type', req.body.vehicle_type)
        .set('vehicle_name', req.body.vehicle_name)
        .set('vehicle_lost', req.body.vehicle_lost)
        .set('vehicle_status', req.body.vehicle_status)
        .set('vehicle_lost_other', req.body.vehicle_lost_other)
        .set('vehicle_zone', req.body.vehicle_zone)
        .set('comment_engineer', req.body.comment_engineer)
        .set('user_notification', req.body.user_notification)
        .set('start_lost', req.body.start_lost)
        .set('end_lost', req.body.end_lost)
        .set('time_notification', req.body.time_notification)
        .toString();

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            console.log(query);
            var sql = "SELECT id FROM lost_vehicle ORDER BY id DESC LIMIT 1";
            db.get_rows(pg_config_HTT, sql, function (rows) {
                console.log(rows[0].id + ' : ' + req.body.vehicle_type);
                iOut.start_out_of_service(req.body.vehicle_name, req.body.vehicle_type, req.body.start_lost, rows[0].id, function (value) { 
                    res.send('Insert-Complete');
                });
            });

        } else {
            res.send('Insert-failed');
        }
    });
}

function update_vehicle_lost(req, res){
    var query = squel.update()
        .table('lost_vehicle')
        .set('vehicle_type', req.body.vehicle_type)
        .set('vehicle_name', req.body.vehicle_name)
        .set('vehicle_lost', req.body.vehicle_lost)
        .set('vehicle_status', req.body.vehicle_status)
        .set('vehicle_lost_other', req.body.vehicle_lost_other)
        .set('vehicle_zone', req.body.vehicle_zone)
        .set('comment_engineer', req.body.comment_engineer)
        .set('user_notification', req.body.user_notification)
        .set('start_lost', req.body.start_lost)
        .set('end_lost', req.body.end_lost)
        .where('id = ' + utl.sqote(req.body.id))
        .toString();

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            res.send('Update-Complete');
        } else {
            res.send('Update-failed');
        }
    });
}

function report_vehicle_lost(req, res){
    var query = "SELECT * FROM lost_vehicle WHERE";
    query += " vehicle_type = " + utl.sqote(req.body.type);
    if (req.body.zone != 'All' && req.body.zone != '' && req.body.zone != null) {
        query += " AND vehicle_zone = " + utl.sqote(req.body.zone);
    }
    if (req.body.status != 'All' && req.body.status != '' && req.body.status != null) {
        query += " AND vehicle_status = " + utl.sqote(req.body.status);
    }
    if (req.body.timeS != '') {
        query += " AND start_lost >= " + utl.sqote(req.body.timeS);
    }
    if (req.body.timeE != '') {
        query += " AND end_lost <= " + utl.sqote(req.body.timeE);
    }
    

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.edit_settingTruck = edit_settingTruck;
exports.truck_setting = truck_setting;
exports.search_vehicle_lost = search_vehicle_lost;
exports.insert_vehicle_lost = insert_vehicle_lost;
exports.update_vehicle_lost = update_vehicle_lost;
exports.report_vehicle_lost = report_vehicle_lost;

//#endregion

// #region plugin

function containText(data, it) {
    return data.indexOf(it) != -1;
}

function call_adminPoint(lat, lng, callback) {
    var query = 'SELECT';
    query += ' "ADMIN_CODE" AS admin_code,';
    query += ' "TAM_TNAME" AS tam_tname,';
    query += ' "AMP_TNAME" AS amp_tname,';
    query += ' "PROV_TNAME" AS prov_tname,';
    query += ' "TAM_ENAME" AS tam_ename,';
    query += ' "AMP_ENAME" AS amp_ename,';
    query += ' "PROV_ENAME" AS prov_ename';
    query += ' FROM tambon WHERE ST_Contains(the_geom, ST_SetSRID(ST_Point(' + utl.sqote(lng) + ',' + utl.sqote(lat) + '), 4326)) LIMIT 1';
    
    db.get_rows(pg_query2, query, function (rows) {
        if (rows.length > 0) {
            callback(rows);
            return;
        } else {
            callback('No-Query');
            return;
        }
    });
}

function count_table(req, res) {
    var query = "SELECT count(" + req.body.value + ") FROM " + req.body.table;
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        res.send(rows[0]);
    });
}

function set_sumary(Array){
    if (Array.length > 0) {
        var sum = new LINQ(Array).Select(function (x) { return parseInt(x.total_time) }).Sum();
        return sum;
    } else {
        return 0;
    }
}

function iGet(url, callback) {
    request({
        uri: url,
        method: "GET",
    }, function (error, response, body) {
        
        if (error) {
            console.log("err iPost : " + error.message);
        }
        callback(body);
        return;
    });
}

function iPost(url, JsonBody, callback) {
    request({
        uri: url,
        json: true,
        method: "POST",
        body: JsonBody
    }, function (error, response, body) {
        
        if (error) {
            console.log("err iPost : " + error.message);
        }
        callback(body);
        return;
    });
}

function get_harvester(req, res)
{
    var query = "SELECT DISTINCT havest_vehicle_code FROM master_havester";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function get_harvester_register(req, res) {
    var query = "SELECT harvester_number as harvester_code FROM htt4";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) { 
            res.send(rows);
        } else {
            res.send([]);
        }
    });
}

function get_all_field(req, res){
    var query = "SELECT array_to_string(array(SELECTf_id FROM htt1), ',') AS fieldID";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function get_truck(req, res){
    var query = "SELECT truck_vehicle_code FROM master_truck";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function get_truck_register(req, res) {
    var query = "SELECT truck_number as truck_code FROM htt7";

    db.get_rows(pg_config_HTT, query, function (rows) { 
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send([]);
        }
    });
}

function get_zone(req, res){
    var query = "SELECT zone FROM master_zone ORDER BY zone_id";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function get_blackbox(req, res) {
    var query = "";
    
    query += " SELECT blackbox_id, truck_radio_id";
    query += " FROM blackbox";
    query += " WHERE blackbox_id NOT IN (SELECT blackbox_id FROM dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT DISTINCT blackbox_id from htt4') as htt4 (blackbox_id varchar(20)))";
    query += " AND blackbox_id NOT IN (SELECT blackbox_id FROM dblink(" + utl.sqote(dblink_HTT) + ", 'SELECT DISTINCT blackbox_id from htt7') as htt7 (blackbox_id varchar(20)))";

    db.get_rows(pg_config_dbu101279, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

function get_importanArea(req, res) { 
    var query = "SELECT iarea_name,ST_AsGeoJSON(iarea_polygon) FROM htt3";
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "area_name": "{{iarea_name}}",';
            strMustache += ' "geometry":  {{st_asgeojson}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';
            
            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            
            var final = "[" + result + "]";

            final = final.replace(/&quot;/g, '"');
           
            
            res.send(final);
        } else {
            res.send('No-Query');
        }
    });
}

function reletion_tracking(req, res) {
    
    var finish_a = false; var finish_b = false; var query_a = ''; var query_b = ''; var sql_linq = ''; var sql_linq2 = '';
    var object = { "Plot_relation": [], "Vehicle_relation": [] };
    
    switch (req.params.sql_colum) {
        case 'truck_vehicle_code': {
            query_a += " SELECT st_asgeojson(wkt_geom),f_id FROM htt1";
            query_a += " WHERE f_id IN (SELECT plot_code FROM detail_havester WHERE havest_vehicle_code =  get_harvester_by_truckcode(" + utl.sqote(req.params.vehicle_code) + "))";
            //sql_linq += " get_harvestercode(blackbox_id) as harvester_name,";
            //sql_linq += " get_owner_harvester(htt_harvester_name) as name";
            //sql_linq += " FROM rec_now";
            //sql_linq += " WHERE htt_truck_name = " + utl.sqote(req.params.vehicle_code);
            //sql_linq += " AND htt_harvester_or_truck = '0'";
            query_b += " WITH xresult as";
            query_b += " (";
            query_b += " SELECT";
            query_b += " left(htt_match_harvester_truck, 12) as blackbox_id";
            query_b += " FROM rec_now";
            query_b += " WHERE htt_truck_name = " + utl.sqote(req.params.vehicle_code);
            query_b += " AND htt_harvester_name IS NOT NULL";
            query_b += " )";
            query_b += " SELECT blackbox_id";
            query_b += " ,r_lon";
            query_b += " ,r_lat";
            query_b += " ,r_time";
            query_b += " ,_r_datasend";
            query_b += " ,tambol";
            query_b += " ,amphur";
            query_b += " ,province";
            query_b += " ,r_status ";
            query_b += " ,get_owner_harvester(htt_harvester_name) as name";
            query_b += " ,get_harvestercode(blackbox_id) as truck_name";
            query_b += " FROM rec_now WHERE blackbox_id IN ( SELECT blackbox_id FROM xresult)";

        } break;
        case 'havest_vehicle_code': {
            query_a += " SELECT st_asgeojson(wkt_geom),f_id FROM htt1";
            query_a += " WHERE f_id IN (SELECT plot_code FROM detail_havester WHERE havest_vehicle_code = " + utl.sqote(req.params.vehicle_code) + ") ";
            //sql_linq += " get_truckcode(blackbox_id) as truck_name,";
            //sql_linq += " get_owner_truck(htt_truck_name) as name";
            //sql_linq += " FROM rec_now";
            //sql_linq += " WHERE htt_harvester_name = " + utl.sqote(req.params.vehicle_code);
            //sql_linq += " AND htt_harvester_or_truck = '1'";

            query_b += " WITH xxresult as (";
            query_b += " WITH xresult as (";
            query_b += " SELECT right(htt_match_harvester_truck,12) as blackbox_id_truck";
            query_b += " ,left(htt_match_harvester_truck,12) as blackbox_id_harvester,htt_match_harvester_truck";
            query_b += " FROM rec_now WHERE htt_harvester_name = " + utl.sqote(req.params.vehicle_code);
            query_b += " AND length(right(htt_match_harvester_truck,12)) > 0";
            query_b += " )";
            query_b += " SELECT";
            query_b += " r_lon";
            query_b += " ,r_lat";
            query_b += " ,r_time";
            query_b += " ,_r_datasend";
            query_b += " ,tambol";
            query_b += " ,amphur";
            query_b += " ,province";
            query_b += " ,r_status";
            query_b += " ,blackbox_id";
            //query_b += " ,rc.htt_match_harvester_truck";
            //query_b += " ,rc.htt_harvester_or_truck";
            query_b += " ,xresult.blackbox_id_truck";
            query_b += " ,xresult.blackbox_id_harvester";
            query_b += " ,left(rc.htt_match_harvester_truck,12) as xxx";
            query_b += " ,get_owner_truck(rc.htt_truck_name) as name";
            query_b += " ,get_truckcode(xresult.blackbox_id_truck) as truck_name";
            query_b += " FROM rec_now as rc, xresult";
            query_b += " WHERE rc.blackbox_id = xresult.blackbox_id_truck";
            query_b += " )";
            query_b += " SELECT * FROM xxresult WHERE xxx = get_blackbox_harvester(" + utl.sqote(req.params.vehicle_code) + ")";
        } break;
    }
    
    
    
    //query_b += " SELECT";
    //query_b += " blackbox_id,";
    //query_b += " r_lon,";
    //query_b += " r_lat,";
    //query_b += " r_time,";
    //query_b += " _r_datasend,";
    //query_b += " tambol,";
    //query_b += " amphur,";
    //query_b += " province,";
    //query_b += " r_status,";
    //query_b += sql_linq;
    
    
    var ended = function () {
        if (finish_a && finish_b) { 
            res.send(object);
        }
    }

    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "plot_name": "{{f_id}}",';
            strMustache += ' "geometry":  {{st_asgeojson}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';
            
            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');
            object.Plot_relation = [JSON.parse(final)];
            
        }

        ended();
    });

    db.get_rows(pg_config_dbu101279, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) { 
            object.Vehicle_relation = rows;
        }

        ended();
    });

}

function non_register_gps(req, res) {
    var object = { "list_regis": [], "list_noregis": [] };
    var finish_a = false; var finish_b = false;
    var query_a = ''; var query_b = '';

    switch (req.params.type_vehicle){
        case 'harvester': {
            query_a += "SELECT * FROM htt4";
            query_b += "SELECT havest_vehicle_code,havest_model FROM master_havester WHERE havest_vehicle_code NOT IN (SELECT harvester_number FROM htt4)";
        } break;
        case 'truck': {
            query_a += "SELECT truck_number,name,type,brand,product,truck_licen,truck_province,blackbox_id,sim_id FROM htt7";
            query_b += "SELECT truck_vehicle_code,truck_model FROM master_truck WHERE truck_vehicle_code NOT IN (SELECT truck_number FROM htt7)";
        } break;
    }
    
    var final = function () {
        if (finish_a && finish_b) { 
            res.send(object);
        }
    }
    
    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) { object.list_regis = rows; }
        final();
    });
    
    db.get_rows(pg_config_HTT, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) { object.list_noregis = rows; } 
        final();
    });
}

function view_register(req, res) {
    var query_a = "";

    query_a += " SELECT";
    query_a += " rec_now.blackbox_id,";
    query_a += " rec_now.htt_truck_name,";
    query_a += " rec_now.htt_harvester_name,";
    query_a += " rec_now.htt_harvester_or_truck,";
    query_a += " blackbox.truck_id,";
    query_a += " blackbox.truck_radio_id";
    query_a += " FROM rec_now,blackbox";
    query_a += " WHERE rec_now.blackbox_id = " + utl.sqote(req.params.blackbox_code);
    query_a += " AND blackbox.blackbox_id = " + utl.sqote(req.params.blackbox_code);
    

    db.get_rows(pg_config_dbu101279, query_a, function (rows) {
        res.send(rows);
    });

}

function bound_relation_area(req, res) {
    var object = { "harvester_cutting": [], "human_cutting": [] };
    var query_a = ""; var query_b = ""; var strMustache = ""; var finish_a = false; var finish_b = false;

    query_a += " SELECT ST_AsGeoJSON(wkt_geom),f_id FROM htt1 WHERE";
    query_a += " ST_Contains(ST_MakeEnvelope(" + utl.sqote(req.body.Eastlng) + ", " + utl.sqote(req.body.Eastlat) + ", " + utl.sqote(req.body.Westlng) + ", " + utl.sqote(req.body.Westlat) + ", 4326), wkt_geom)";
    query_a += " AND factory_name = " + utl.sqote(req.body.Factory);
    query_a += " AND type_polygon = '1'";
    
    query_b += " SELECT ST_AsGeoJSON(wkt_geom),f_id FROM htt1 WHERE";
    query_b += " ST_Contains(ST_MakeEnvelope(" + utl.sqote(req.body.Eastlng) + ", " + utl.sqote(req.body.Eastlat) + ", " + utl.sqote(req.body.Westlng) + ", " + utl.sqote(req.body.Westlat) + ", 4326), wkt_geom)";
    query_b += " AND factory_name = " + utl.sqote(req.body.Factory);
    query_b += " AND type_polygon = '2'";
    
    strMustache += '{{#.}}';
    strMustache += '{';
    strMustache += ' "type": "Feature",';
    strMustache += ' "area_code": "{{f_id}}",';
    strMustache += ' "geometry":  {{st_asgeojson}}';
    strMustache += '}';
    strMustache += ',';
    strMustache += '{{/.}}';
    
    var final = function () {
        if (finish_a && finish_b) { 
            res.send(object);
        }
    }

    db.get_rows(pg_config_HTT, query_a, function (rows) {
        finish_a = true;
        if (rows.length > 0) {
            var result = mustache.render(strMustache, rows);
            var text = '{ "type":"FeatureCollection","features":[' + utl.iRmend(result) + '] }';
            var ended = text.replace(/&quot;/g, '"');
            object.harvester_cutting = [JSON.parse(ended)];
        }
        final();
    });

    db.get_rows(pg_config_HTT, query_b, function (rows) {
        finish_b = true;
        if (rows.length > 0) {
            var result = mustache.render(strMustache, rows);
            var text = '{ "type":"FeatureCollection","features":[' + utl.iRmend(result) + '] }';
            var ended = text.replace(/&quot;/g, '"');
            object.human_cutting = [JSON.parse(ended)];
        }
        final();
    });
}

function activity_match_vehicle(req, res) {
    var query = " SELECT r_status, idate(r_time) as r_time,";
    query += " r_lon, r_lat, tambol, amphur, province";
    query += " FROM z" + req.body.blackbox_code + "data";
    query += " WHERE r_time >= " + utl.sqote(req.body.start_match);
    query += " AND r_time <= " + utl.sqote(req.body.finish_match);
    
    db.get_rows(pg_config_dbu101279, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send('No-Query');
        }
    });
}

exports.non_register_gps = non_register_gps;
exports.get_zone = get_zone;
exports.get_blackbox = get_blackbox;
exports.get_all_field = get_all_field;
exports.count_table = count_table;
exports.get_harvester = get_harvester;
exports.get_harvester_register = get_harvester_register;
exports.get_truck = get_truck;
exports.get_truck_register = get_truck_register;
exports.get_importanArea = get_importanArea;
exports.reletion_tracking = reletion_tracking;
exports.view_register = view_register;
exports.bound_relation_area = bound_relation_area;
exports.activity_match_vehicle = activity_match_vehicle;

// #endregion plugin

// #region CaneGis-Service for havester

function add_master_harvester(req, res) {

    var query_insert = squel.insert()
        .into('master_havester')
        .set('havest_vehicle_code', req.body.harvest_vehicle_code)
        .set('havest_name', req.body.harvester_name)
        .set('havest_type', req.body.harvester_type)
        .set('havest_brand', req.body.harvester_brand)
        .set('havest_model', req.body.harvester_model)
        .set('havest_telephone', req.body.harvester_telephone)
        .set('havest_bp_code', req.body.harvester_bp_code)
        .set('havest_zone_code', req.body.harvester_zone_code)
        .set('company_code', req.body.company_code)
        .toString();
    var query_update = squel.update()
        .table('master_havester')
        .set('havest_name', req.body.harvester_name)
        .set('havest_type', req.body.harvester_type)
        .set('havest_brand', req.body.harvester_brand)
        .set('havest_model', req.body.harvester_model)
        .set('havest_telephone', req.body.harvester_telephone)
        .set('havest_bp_code', req.body.harvester_bp_code)
        .set('havest_zone_code', req.body.harvester_zone_code)
        .set('company_code', req.body.company_code)
        .where('havest_vehicle_code = ' + utl.sqote(req.body.harvest_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();
    
    utcp.upsert_template(query_insert, query_update, function (sql) { 
        db.excute(pg_config_HTT, sql, function (response) {
            if (response == 'oK') {
                result.flag = true; result.message = "insert";
                res.send(result);
            } else {
                result.flag = false; result.message = "insert";
                res.send(result);
            }
        });
    });

    
}

function set_master_harvester(req, res) {
    var query = squel.update()
        .table('master_havester')
        .set('havest_name', req.body.harvester_name)
        .set('havest_type', req.body.harvester_type)
        .set('havest_brand', req.body.harvester_brand)
        .set('havest_model', req.body.harvester_model)
        .set('havest_telephone', req.body.harvester_telephone)
        .set('company_code', req.body.company_code)
        .where('havest_vehicle_code = ' + utl.sqote(req.body.harvest_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            result.flag = true; result.message = "update";
            res.send(result);
        } else {
            result.flag = false; result.message = "update";
            res.send(result);
        }
    });
        
}

function del_master_harvester(req, res) {
    var query = squel.delete()
        .from('master_havester')
        .where('havest_vehicle_code = ' + utl.sqote(req.body.harvest_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            result.flag = true; result.message = "delete";
            res.send(result);
        } else {
            result.flag = false; result.message = "delete";
            res.send(result);
        }
    });
}

function add_listDetail_harvester(req, res) {
    
    var strQuery = function (object, callback) {
        var query_insert = squel.insert()
            .into('detail_havester')
            .set('havest_vehicle_code', object.harvest_vehicle_code)
            .set('plot_code', object.plot_code)
            .set('company_code', object.company_code)
            .set('year', object.year)
            .toString();
        var query_update = squel.update()
            .table('detail_havester')
            .set('havest_vehicle_code', object.harvest_vehicle_code)
            .set('plot_code', object.plot_code)
            .set('company_code', object.company_code)
            .set('year', object.year)
            .where('havest_vehicle_code = ' + utl.sqote(object.harvest_vehicle_code))
            .where('company_code = ' + utl.sqote(object.company_code))
            .where('plot_code = ' + utl.sqote(object.plot_code))
            .where('year = ' + utl.sqote(object.year))
            .toString();

        utcp.upsert_template(query_insert, query_update, function (sql) {
            db.excute(pg_config_HTT, sql, function (response) {
                callback()
                return;
            });
        });
    }

    async.eachSeries(req.body, function (row, next) {
        strQuery(row, function () { 
            next();
        });
    }, function () {
        result.flag = true; result.message = "insert";
        res.send(result);
    });
}

function add_detail_harvester(req, res) {

    var query_insert = squel.insert()
        .into('detail_havester')
        .set('havest_vehicle_code', req.body.harvest_vehicle_code)
        .set('plot_code', req.body.plot_code)
        .set('company_code', req.body.company_code)
        .set('year', req.body.year)
        .toString();
    var query_update = squel.update()
        .table('detail_havester')
        .set('havest_vehicle_code', req.body.harvest_vehicle_code)
        .set('plot_code', req.body.plot_code)
        .set('company_code', req.body.company_code)
        .set('year', req.body.year)
        .where('havest_vehicle_code = ' + utl.sqote(req.body.harvest_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .where('plot_code = ' + utl.sqote(req.body.plot_code))
        .where('year = ' + utl.sqote(req.body.year))
        .toString();
    
    utcp.upsert_template(query_insert, query_update, function (sql) { 
        db.excute(pg_config_HTT, sql, function (response) {
            if (response == 'oK') {
                result.flag = true; result.message = "insert";
                res.send(result);
            } else {
                result.flag = false; result.message = "insert";
                res.send(result);
            }
        });
    });
    
}

function set_detail_harvester(req, res) {
    var query = squel.update()
        .table('detail_havester')
        .set('plot_code', req.body.plot_code)
        .set('company_code', req.body.company_code)
        .set('year', req.body.year)
        .where('havest_vehicle_code = ' + utl.sqote(req.body.harvest_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();

    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            result.flag = true; result.message = "update";
            res.send(result);
        } else {
            result.flag = false; result.message = "update";
            res.send(result);
        }
    });
}

function del_detail_harvester(req, res) {
    var query = squel.delete()
        .from('detail_havester')
        .where('havest_vehicle_code = ' + utl.sqote(req.body.harvest_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();
    
    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            result.flag = true; result.message = "delete";
            res.send(result);
        } else {
            result.flag = false; result.message = "delete";
            res.send(result);
        }
    });
}

function list_master_harvester(req, res) {

    var query = "SELECT havest_vehicle_code as harvest_vehicle_code ";
    query += ",havest_name as harvest_name ";
    query += ",havest_type as harvest_type ";
    query += ",havest_brand as harvest_brand ";
    query += ",havest_model as harvest_model ";
    query += ",havest_telephone as harvest_telephone ";
    query += ",company_code,havest_bp_code as harvest_bp_code,havest_zone_code as harvest_zone_code FROM master_havester";

    db.get_rows(pg_config_HTT, query, function (rows) {
        res.send(rows);
    });
}

function list_detail_harvester(req, res) {
    var query = "SELECT havest_vehicle_code as harvest_vehicle_code,plot_code,company_code,year FROM detail_havester";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send([]);
        }
    });
}

exports.add_master_harvester = add_master_harvester;
exports.set_master_harvester = set_master_harvester;
exports.del_master_harvester = del_master_harvester;
exports.add_listDetail_harvester = add_listDetail_harvester;
exports.add_detail_harvester = add_detail_harvester;
exports.set_detail_harvester = set_detail_harvester;
exports.del_detail_harvester = del_detail_harvester;
exports.list_master_harvester = list_master_harvester;
exports.list_detail_harvester = list_detail_harvester;

// #endregion CaneGis-Service for havester

// #region CaneGis-Service for truck

function add_master_truck(req, res) {

    var query_insert = squel.insert()
        .into('master_truck')
        .set('truck_vehicle_code', req.body.delivery_vehicle_code)
        .set('truck_name', req.body.delivery_name)
        .set('truck_type', req.body.vehicle_type_id)
        .set('truck_plate_licen', req.body.delivery_plate_licen)
        .set('truck_province', req.body.delivery_province)
        .set('truck_telephone', req.body.delivery_telephone)
        .set('truck_brand', req.body.delivery_brand)
        .set('truck_model', req.body.delivery_model)
        .set('company_code', req.body.company_code)
        .toString();
    var query_update = squel.update()
        .table('master_truck')
        .set('truck_name', req.body.delivery_name)
        .set('truck_type', req.body.vehicle_type_id)
        .set('truck_plate_licen', req.body.delivery_plate_licen)
        .set('truck_province', req.body.delivery_province)
        .set('truck_telephone', req.body.delivery_telephone)
        .set('truck_brand', req.body.delivery_brand)
        .set('truck_model', req.body.delivery_model)
        .where('truck_vehicle_code = ' + utl.sqote(req.body.delivery_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();
    
    utcp.upsert_template(query_insert, query_update, function (sql) { 
        db.excute(pg_config_HTT, sql, function (response) {
            if (response == 'oK') {
                result.flag = true; result.message = "insert";
                res.send(result);
            } else {
                result.flag = false; result.message = "insert";
                res.send(result);
            }
        });
    });

    
}

function set_master_truck(req, res) {
    debugger;
    var query = squel.update()
        .table('master_truck')
        .set('truck_name', req.body.delivery_name)
        .set('truck_type', req.body.vehicle_type_id)
        .set('truck_plate_licen', req.body.delivery_plate_licen)    
        .set('truck_province', req.body.delivery_province)
        .set('truck_telephone', req.body.delivery_telephone)
        .set('truck_brand', req.body.delivery_brand)
        .set('truck_model', req.body.delivery_model)
        .set('company_code', req.body.company_code)
        .where('truck_vehicle_code = ' + utl.sqote(req.body.delivery_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();
    
   // console.log(" doo "+query);
    db.excute(pg_config_HTT, query, function (response) {
        debugger;
        if (response == 'oK') {
            result.flag = true; result.message = "update";
            res.send(result);
        } else {
            result.flag = false; result.message = "update";
            res.send(result);
        }
    });
}

function del_master_truck(req, res) {
    var query = squel.delete()
        .from('master_truck')
        .where('truck_vehicle_code = ' + utl.sqote(req.body.delivery_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();
    
    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            result.flag = true; result.message = "delete";
            res.send(result);
        } else {
            result.flag = false; result.message = "delete";
            res.send(result);
        }
    });
}

function add_detail_truck(req, res) {

    var query_insert = squel.insert()
        .into('detail_truck')
        .set('truck_vehicle_code', req.body.delivery_vehicle_code)
        .set('havest_vehicle_code', req.body.harvest_vehicle_code)
        .set('company_code', req.body.company_code)
        .set('year', req.body.year)
        .toString();
    var query_update = squel.update()
        .table('detail_truck')
        .set('truck_vehicle_code', req.body.delivery_vehicle_code)
        .set('havest_vehicle_code', req.body.harvest_vehicle_code)
        .set('company_code', req.body.company_code)
        .set('year', req.body.year)
        .where('truck_vehicle_code = ' + utl.sqote(req.body.delivery_vehicle_code))
        .where('havest_vehicle_code = ' + utl.sqote(req.body.harvest_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .where('year = ' + utl.sqote(req.body.year))
        .toString();
    
    utcp.upsert_template(query_insert, query_update, function (sql) { 
        db.excute(pg_config_HTT, sql, function (response) {
            if (response == 'oK') {
                result.flag = true; result.message = "insert";
                res.send(result);
            } else {
                result.flag = false; result.message = "insert";
                res.send(result);
            }
        });
    });

}

function set_detail_truck(req, res) {
    var query = squel.update()
        .table('detail_truck')
        .set('havest_vehicle_code', req.body.havest_vehicle_code)
        .set('company_code', req.body.company_code)
        .set('year', req.body.year)
        .where('truck_vehicle_code = ' + utl.sqote(req.body.delivery_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();
    
    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            result.flag = true; result.message = "update";
            res.send(result);
        } else {
            result.flag = false; result.message = "update";
            res.send(result);
        }
    });
}

function del_detail_truck(req, res) {
    var query = squel.delete()
        .from('detail_truck')
        .where('truck_vehicle_code = ' + utl.sqote(req.body.delivery_vehicle_code))
        .where('company_code = ' + utl.sqote(req.body.company_code))
        .toString();
    
    db.excute(pg_config_HTT, query, function (response) {
        if (response == 'oK') {
            result.flag = true; result.message = "delete";
            res.send(result);
        } else {
            result.flag = false; result.message = "delete";
            res.send(result);
        }
    });
}

function list_master_truck(req, res) {
    var query = "SELECT * FROM master_truck";
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send([]);
        }
    });
}

function list_detail_truck(req, res) {
    var query = "SELECT truck_vehicle_code,havest_vehicle_code as harvest_vehicle_code,company_code,year  FROM detail_truck";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
            res.send([]);
        }
    });
}

exports.add_master_truck = add_master_truck;
exports.set_master_truck = set_master_truck;
exports.del_master_truck = del_master_truck;
exports.add_detail_truck = add_detail_truck;
exports.set_detail_truck = set_detail_truck;
exports.del_detail_truck = del_detail_truck;
exports.list_master_truck = list_master_truck;
exports.list_detail_truck = list_detail_truck;

// #endregion CaneGis-Service for truck

// #region CaneGis-Service for master_vehicle

function add_master_vehicle_type(req, res) {
    /*
    var query_insert = squel.insert()
        .into('master_vehicle_type')
        .set('vehicle_type_id', req.body.vehicle_type_id)
        .set('vehicle_type', req.body.vehicle_type)
        .set('total', req.body.total)
        .set('company_code', req.body.company_code)
        .toString();
    var query_update = squel.update()
        .table('master_vehicle_type')
        .set('master_vehicle_type', req.body.bp)
        .set('vehicle_type_id', req.body.harvester_number)
        .set('vehicle_type', req.body.name)
        .set('total', req.body.type)
        .set('company_code', req.body.brand)
        .where('vehicle_type_id = ' + utl.sqote(req.body.harvester_number))
        .toString();
    */
    var query_insert = squel.insert()
     .into('master_vehicle_type')
     .set('vehicle_type_id', req.body.vehicle_type_id)
     .set('vehicle_type', req.body.vehicle_type)
     .set('total', req.body.total)
     .set('company_code', req.body.company_code)
     .toString();

    var query_update = squel.update()
    .table('master_vehicle_type')
    //.set('vehicle_type_id', req.body.vehicle_type_id)
    .set('vehicle_type', req.body.vehicle_type)
    .set('total', req.body.total)
    .set('company_code', req.body.company_code)
    .where('vehicle_type_id = ' + utl.sqote(req.body.vehicle_type_id))
    .toString();

    utcp.upsert_template(query_insert, query_update, function (query) {
        db.excute(pg_config_HTT, query, function (response) {
            if (response == 'oK') {
                result.flag = true; result.message = "insert";
                res.send(result);
            } else {
                result.flag = ""; result.message = "";
                res.send(result);
            }
        });
    });
}

function list_master_vehicle_type(req, res) {
    var query = "SELECT * FROM  master_vehicle_type";
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        } else {
           // result.flag = ""; result.message = "";
            res.send([]);
        }
    });

}

exports.add_master_vehicle_type = add_master_vehicle_type;
exports.list_master_vehicle_type = list_master_vehicle_type;

// #endregion

// #region HTT-LOGIN

function get_login(req, res) {
    
    var query = "SELECT * FROM htt_account WHERE account_name = " + utl.sqote(req.params.name) + " AND account_pass = " + utl.sqote(req.params.pass);
  /*
    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            res.send('success-login');
        } else {
            res.send('notfound-login');
        }
    });
  */
    // var t = { 'status_login': 'success-login' };
        
       var result = { 'status_login': 'success-login','status_rule':'admin'}
       res.send(result);
   // res.send(t);
}

exports.get_login = get_login;

// #endregion HTT-LOGIN


/*
setTimeout(function () {
   
}, 1000);
*/