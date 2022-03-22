
    //http://leafletjs.com/reference.html#circle

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
var url = require('url');
var process = require('child_process');

var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');

//var iutm = require('utm2latlon.js');
//var iOut = require('out_of_service.js');
//var iResend = require('resend_cat2crush');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var Report = require('./backend_reports.js');

var db_config = "master_config";
var db_unregis = "db_temp";
var jwtTokenSecret = 'hangman';
var port_recivedata = 6000;
//#endregion

 //#region Model Status Server
function get_server_status(req, res) {
    process.exec('df -h', function (err, resp) {
        res.end(resp);
    });
}

function get_server_all_info(req, res) {
    process.exec('uname -a', function (err, resp) {
        // console.log(resp);
        res.jsonp(resp);
    });
}

function get_server_mem_info(req, res) {

    process.exec('cat /proc/meminfo', function (err, resp) {
        // console.log(resp);
        // res.jsonp(resp);
        var s = resp;
        s = utl.replaceAll(s, ' ', '');
        s = utl.replaceAll(s, 'kB', '');
        res.end(s);

    });
}

function clr_memory() {

    process.exec('sync; echo 3 > /proc/sys/vm/drop_caches', function (err, resp) {
        // console.log(resp);
        res.jsonp(resp);
    });
}

//#endregion


function tracking_realtime(req, res)
{
   // debugger;
   // var tt = req.headers["x-access-token"];
    Isauthenticate(req, res, function () {
        debugger;
        // console.log('tracking_realtime ' + req.body.fleetid);
        var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname, "vehicle_tracking": [] };
        var sql = '';

        //#region sample
        /*
           // 	, driver_id, driver_prefix, driver_name, 
           //driver_surname, driver_personalcard, driver_type, driver_no, 
           //driver_branch, driver_sex, driver_birthcard, driver_expirecard, 


SELECT row_number() OVER (ORDER BY r.modem_id) as id,r.modem_id,get_vehiclename(r.modem_id) as vehicle_name,
		   idate(gps_datetime)as gps_datetime,  lon, lat, speed
,get_speed_limit(r.modem_id) as speedmax, direction, 
        altitude, satelites, message_id, input_status, output_status, 
       analog_input1, analog_input2, mileage, tambol, etambol, amphur, 
       eamphur, province, eprovince
      , idate(time_server_fin)as time_server, angle, oil_percent, oil_liter
      , status,status||'_'||angle as heading,status||'_'||angle as status_angle,get_model_device(r.modem_id) as model_device
    FROM	realtime as r, setup_vehicle as sv
    WHERE	r.modem_id=sv.modem_id
    AND sv.fleetcode=get_fleetid('demoktc')
    ORDER BY r.modem_id ASC 
         */

        //#endregion


        sql += " SELECT row_number() OVER (ORDER BY r.modem_id) as id,r.modem_id ";
        sql += ",get_vehiclename(r.modem_id) as vehicle_name ,get_carlicence(r.modem_id) as car_licence";
        sql += ",idate(gps_datetime)as gps_datetime,  lon, lat, speed,get_speed_limit(r.modem_id) as speedmax, direction ";
        sql += ",altitude, satelites, message_id, input_status, output_status ";
        sql += ",analog_input1, analog_input2, mileage";
        sql += ", tambol, etambol, amphur,eamphur, province, eprovince";
        sql += ", idate(time_server_fin)as time_server, angle, oil_percent, oil_liter";
        sql += ", status,status||'_'||angle as heading,get_model_device(r.modem_id) as model_device,status||'_'||angle as status_angle";
        sql += " FROM	realtime as r, setup_vehicle as sv";
        sql += " WHERE	r.modem_id=sv.modem_id";
        sql += " AND sv.fleetcode=get_fleetid(" + utl.sqote(object.fleetname) + ")";
        sql += " ORDER BY r.modem_id ASC ";


        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (rows) {
            if (rows.length > 0) {
                object.vehicle_tracking = rows;
                res.send(object);
            } else {
                var r = {"vehicle_tracking": []};
                res.send(r);
            }
        });
    });
}

function tracking_realtime_ocsb(req, res) {
    // debugger;
    // var tt = req.headers["x-access-token"];
    Isauthenticate(req, res, function () {
        debugger;
        // console.log('tracking_realtime ' + req.body.fleetid);
        var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname, "vehicle_tracking": [] };
        var sql = '';


        sql += "WITH result as ( SELECT row_number() OVER (ORDER BY r.modem_id) as id,r.modem_id ";
        sql += ",get_vehiclename(r.modem_id) as vehicle_name ,get_carlicence(r.modem_id) as car_licence";
        sql += ",idate(gps_datetime)as gps_datetime,  lon, lat, speed,get_speed_limit(r.modem_id) as speedmax, direction ";
        sql += ",altitude, satelites, message_id, input_status, output_status ";
        sql += ",analog_input1, analog_input2, mileage";
        sql += ", tambol, etambol, amphur,eamphur, province, eprovince";
        sql += ", idate(time_server_fin)as time_server, angle, oil_percent, oil_liter";
        sql += ", CASE CAST(input_status as int) WHEN 5 THEN '3' ELSE status END status,status||'_'||angle as heading,get_model_device(r.modem_id) as model_device,status||'_'||angle as status_angle,camera_url";
        sql += " FROM	realtime as r, setup_vehicle as sv";
        sql += " WHERE	r.modem_id=sv.modem_id";
        sql += " AND sv.fleetcode=get_fleetid(" + utl.sqote(object.fleetname) + ") )";
        sql += " (SELECT * FROM result WHERE camera_url !='' ORDER BY get_vehiclename(modem_id)) UNION ALL ";    
        sql += " (SELECT * FROM result WHERE  camera_url IS NULL ORDER BY vehicle_name) "

    
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (rows) {
            if (rows.length > 0) {
                object.vehicle_tracking = rows;
                res.send(object);
            } else {
                var r = { "vehicle_tracking": [] };
                res.send(r);
            }
        });
    });
}

function tracking_history(req, res)
{
    //#region
    /*
SELECT row_number() OVER (ORDER BY gps_datetime) as id,gps_datetime,lon,lat,speed,satelites,altitude
,message_id,analog_input1,analog_input2
,round (abs((SELECT mileage FROM ht_1010001004 WHERE gps_datetime >='2016-06-21 00:00' LIMIT 1)-mileage)::DECIMAL,2)::text
 ,tambol, etambol, amphur,eamphur, province, eprovince,status,status||'_'||angle as heading
 FROM ht_1010001004 
WHERE gps_datetime >='2016-06-21 00:00' 
AND gps_datetime <='2016-06-21 23:59' ORDER BY gps_datetime
     */
    //#endregion

    debugger;
    Isauthenticate(req, res, function ()
    {
        var db_name = req.body.fleetid; //'db_10001';
        var modem_id = req.body.modemid; //'1010001004';
        var start = req.body.start; // '2016-06-04 00:00';
        var stop = req.body.stop; //'2016-06-04 23:59';
        var tb_name = "ht_" + modem_id;

        var sql = "";
        sql += " SELECT row_number() OVER (ORDER BY gps_datetime) as id,modem_id,idate(gps_datetime) as gps_datetime,lon,lat,speed,satelites,altitude";
        sql += " ,message_id,analog_input1,analog_input2";
        sql += " ,round (abs((SELECT mileage FROM " + tb_name + " WHERE gps_datetime >=" + utl.sqote(start) + " LIMIT 1)-mileage)::DECIMAL,2)::text as mileage,tambol, etambol, amphur,eamphur, province, eprovince,status,status||'_'||angle as heading, 'UECO' as model_device";
        sql += " FROM " + tb_name;
        sql += " WHERE gps_datetime >= " + utl.sqote(start);
        sql += " AND gps_datetime <=" + utl.sqote(stop);

        ipm.db.dbname = db_name;
        db.get_rows(ipm, sql, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });
    });
}

function get_vehicle_byfleet(req, res) {

    //#region
    /*
     SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name 
FROM	realtime as r,master_vehicle as msv, setup_vehicle as sv,master_fleet as mf 
WHERE	r.modem_id=sv.modem_id 
AND sv.fleetcode=(SELECT id FROM master_fleet WHERE fleetname='demoktc') 
AND mf.id=sv.fleetcode 
 AND sv.vehicleid=msv.vehicleid 
 ORDER BY r.modem_id ASC 
     */
    //#endregion

    Isauthenticate(req, res, function () {
        debugger;
        var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };

        var sql = "";
        sql += " SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name ";
        sql += " FROM	realtime as r,master_vehicle as msv, setup_vehicle as sv,master_fleet as mf ";
        sql += " WHERE	r.modem_id=sv.modem_id ";
        sql += " AND sv.fleetcode=(SELECT id FROM master_fleet WHERE fleetname=" + utl.sqote(object.fleetname) + ") ";
        sql += " AND mf.id=sv.fleetcode ";
        sql += " AND sv.vehicleid=msv.vehicleid ";
        sql += " ORDER BY r.modem_id ASC ";

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });
    });
}


function encode_pws(pws, callback)
{
    bcrypt.hash(pws, null, null, function (err, hash) {
        // Store hash in your password DB.
        //console.log(hash);
        callback(hash);
        return;
    });
}

function decode_pws(pws, hash, callback)
{
    bcrypt.compare(pws, hash, function (err, res) {
        // res === true
        // console.log(res);
        callback(res);
        return;
    });
}

//https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
function authenticate(req, res)
{
   //console.log(req.body.user);
   // req.body.password
    debugger;
    //var user = 'demoktc'
    //var pwd = '1234';
    var user = req.body.user;
    var pwd = req.body.pass;

    //var token = jwt.sign(user, key, {
    //    expiresInMinutes: 1440 // expires in 24 hours
    //});

    var sql = "SELECT id,fleetid,fleetname,password as hash,token,get_rolename(role::int)as role  FROM master_fleet WHERE fleetname=" + utl.sqote(user);//+ " AND password=" + utl.sqote(pwd);
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {

        // if user is found and password is right
        // create a token
        if (rows.length > 0)
        {
            var hash = rows[0].hash;
            decode_pws(pwd, hash, function (xres)
            {
                    debugger;
                    // console.log(xres);
                    if (xres == true)
                    {
                        var token = jwt.sign({ user: user }, jwtTokenSecret, { expiresIn: '1d' });

                        var result = {
                            success: true, message: 'Pass to authenticate token.',
                            fleetname: rows[0].fleetname,
                            fleetid: rows[0].fleetid,
                            role: rows[0].role,
                            token: token
                        };

                        var sql = "UPDATE master_fleet SET token=" + utl.sqote(token) + " WHERE id=" + utl.sqote(rows[0].id) + ";";
                        ipm.db.dbname = db_config;
                        db.excute(ipm, sql, function (is_ok) {
                            res.send(result);
                        });
                    }
                    else
                    {
                        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                    }
                });

        } else {
            // res.send(object);
            return res.json({ success: false, message: 'Failed to authenticate token.' });
        }
    });


}

function Isauthenticate(req, res,next)
{
    debugger;
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token)
    {
        // verifies secret and checks exp
        //var key ='hangman' 
        //App.get('jwtTokenSecret')
        jwt.verify(token, jwtTokenSecret, function (err, decoded) {
            if (err) {
                if (err.message == 'jwt expired') {
                    //  res.end('Access token has expired', 400);
                    return res.json({ success: false, message: 'Access token has expired' });
                }
                else {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                }
            }
            else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    }
    else
    {

        if (req.originalUrl == '/api/get_login')//'/api/authenticate'
        {
            next();
        }
        else
        {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }

    }
}

function logout(req, res)
{
    Isauthenticate(req, res, function ()
    {
        debugger;
        // console.log('tracking_realtime ' + req.body.fleetid);
     var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };
      //  var object = { "db_name": 'db_10001', 'fleetname': 'demoktc' };
        var sql = '';
        sql += " SELECT id,fleetid,fleetname FROM master_fleet WHERE fleetname= " + utl.sqote(object.fleetname);
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (rows)
        {
            if (rows.length > 0)
            {
                var sql = "UPDATE master_fleet SET token='' WHERE id=" + utl.sqote(rows[0].id) + ";";
                ipm.db.dbname = db_config;
                db.excute(ipm, sql, function (is_ok) {
                    res.json({ success: true, message: 'Completed logout.' });
                });
          
            }
            else
            {
                return res.json({ success: false, message: 'Failed to logout.' });
            }

        });
    });
}

function set_note(req, res)
{
    Isauthenticate(req, res, function () {
        debugger;
          var fleet_id = req.body.fleetid;
          var modem_id = req.body.modem_id; //'1010001001'; //
          var message = req.body.message;//'tstst';//
      //  console.log('set_note ' + modem_id + ' ' + message);
    // SELECT modem_id,idate(now()::TIMESTAMP) as timenow,status,speed,satelites,mileage,lon,lat,tambol,etambol,amphur,eamphur,province,eprovince  ,angle,oil_percent,oil_liter,heading  FROM realtime  WHERE modem_id= '1010001001'

        var sql = "";
        sql += "SELECT modem_id,idate(now()::TIMESTAMP) as timenow,status,speed,satelites,mileage,lon,lat,tambol,etambol,amphur,eamphur,province,eprovince ";
        sql += " ,angle,oil_percent,oil_liter,heading ";
        sql += " FROM realtime ";
        sql += " WHERE modem_id= " + utl.sqote(modem_id);
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (ar)
        {
            if (ar.length > 0)
            {
                ar =ar[0];
              //  console.log(JSON.stringify(ar[0]));

                 var sql_insrt_note = squel.insert()
               .into("note_details")
               .set("fleetid", fleet_id)
               .set("modem_id", ar.modem_id)
               .set("datenote", ar.timenow)
               .set("message", message)
               .set("lon", ar.lon)
               .set("lat", ar.lat)
               .set("speed", ar.speed)
               .set("heading", ar.heading)
               .set("satelites", ar.satelites)
               .set("status", ar.status)
               .set("tambol", ar.tambol)
               .set("amphur", ar.amphur)
               .set("province", ar.province)
               .set("etambol", ar.etambol)
               .set("eamphur", ar.eamphur)
               .set("eprovince", ar.eprovince)
               .set("angle", ar.angle)
                .set("oil_percent", ar.oil_percent)
                .set("oil_liter", ar.oil_liter)
                .toString();
     
                 ipm.db.dbname = db_config;
                 db.excute(ipm, sql_insrt_note, function (is_ok)
                 {
                     debugger;
                     res.json({ success: true, message: 'Completed set note.' });
                 });
              
            }
            else
            {
                res.json({ success: false, message: 'Not Completed set note.' });
            }
        });
    });
}

//#region  Geom

function add_geom(req, res)
{
    debugger;
   Isauthenticate(req, res, function ()
    {

    var db_name = req.body.fleetid; //'db_10001';//
    var station_name = req.body.station_name; // 'swf';//
    var station_type = req.body.station_type;//'1';//
    var geom = req.body.geom; //
    var fleet_name = req.body.fleetname;//'demoktc';//
    var type_geom = JSON.parse(geom);
    var res_type = type_geom.features[0].geometry.type;

       // var geom = '{ "type": "FeatureCollection", "features": [{"type":"Feature","properties":{"radius":933.7352180462822},"geometry":{"type":"Point","coordinates":[100.33882141113281,13.865413684661691]}}] }'
     //   var geom = '{ "type": "FeatureCollection", "features": [{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[100.30963897705078,13.767897510377683],[100.30963897705078,13.784236397354777],[100.32817840576172,13.784236397354777],[100.32817840576172,13.767897510377683],[100.30963897705078,13.767897510377683]]]}}] }'
    //  var type_geom = geom;
    // console.log(geo);
       

        is_point_over_limit(db_name, fleet_name, function (result)
        {

            if (result.can_save_point)
            {

                if (res_type == 'Point')
                {
                    var t = type_geom.features[0];
                    var radius = t.properties.radius;
                    var lng = t.geometry.coordinates[0];
                    var lat = t.geometry.coordinates[1];
                    var ar = { 'fleetid': db_name, 'station_type': station_type, 'station_name': station_name, 'geom': 'POINT(' + lng + ' ' + lat + ')', 'radius': radius };

                    var sql = squel.insert()
                     .into("station_customer")
                     .set("fleet_id", ar.fleetid)
                     .set("date_create", utl.timenow())
                     .set("station_name", ar.station_name)
                     .set("geom", ar.geom)
                     .set("radius", ar.radius)
                     .set("station_type", ar.station_type)
                     .toString();

                    sql=sql+' returning station_id as id ';

                   // INSERT INTO station_customer (fleet_id, date_create, station_name, geom, radius, station_type) VALUES ('db_10001', '2016-10-13 15:00:26', 'swf', 'POINT(100.33882141113281 13.865413684661691)', 933.7352180462822, '1')

                    ipm.db.dbname = db_config;
                    db.excute_cb(ipm, sql, function (row_id)
                    {
                        debugger;
                        if (row_id != 'ERROR')
                        {
                            res.json({ success: true, message: 'Complete add customer_contract.', 'id': row_id });
                        }
                        else
                        {
                            res.json({ success: false, message: 'Not Complete add customer_contract.','id':'0' });
                        }
                    });

                }
                else
                {
                    // var q ="(WITH data AS (SELECT '" + geom + "'::json AS fc) SELECT ST_AsText(ST_GeomFromGeoJSON(feat->>'geometry')) AS geom FROM ( SELECT json_array_elements(fc->'features') AS feat FROM data) AS f })"
                    var q = '( WITH data AS (SELECT ' + utl.sqote(geom) + '::json AS fc) ';
                    q += ' SELECT ';
                    q += '  ST_AsText(ST_GeomFromGeoJSON(feat->>' + utl.sqote('geometry') + ')) AS geom ';
                    q += ' FROM ( ';
                    q += ' SELECT json_array_elements(fc->' + utl.sqote('features') + ') AS feat ';
                    q += ' FROM data ';
                    q += ' ) AS f) ';

                    var ar = { 'fleetid': db_name, 'station_type': station_type, 'station_name': station_name, 'radius': '{"radius": 0}' };

                    var sql = '  INSERT INTO station_customer (fleet_id, date_create, station_name, geom, radius,station_type) ';
                    sql += '  VALUES (' + utl.sqote(ar.fleetid) + ',' + utl.sqote(utl.timenow()) + ',' + utl.sqote(ar.station_name) + ' ';
                    sql += ',' + q + ',' + utl.sqote('0');
                    sql += ',' + utl.sqote(ar.station_type) + ' ) returning station_id as id';


                    ipm.db.dbname = db_config;
                    db.excute_cb(ipm, sql, function (row_id)
                    {
                        debugger;
                        if (row_id != 'ERROR')
                        {
                            res.json({ success: true, message: 'Complete add customer_contract.', 'id': row_id });
                        } else {
                            res.json({ success: false, message: 'Not Complete add customer_contract.', 'id': '0' });
                        }
                    });

                }

            }
            else
            {
                res.json({ success: false, message: 'Not Complete over limit ' + result.now_total_point_customer });
            }

          // var data= '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-105.0625991821289,39.72831341029745],[-105.029296875,39.733594087452055],[-105.02689361572266,39.71801492641796],[-105.05435943603516,39.70903550610645],[-105.07255554199219,39.71748675758025],[-105.0625991821289,39.72831341029745]]]}}]} "{ "type":"FeatureCollection","features":[{"type":"Feature","properties":{"radius":8357.958217218129},"geometry":{"type":"Point","coordinates":[100.46585083007812,14.380146021094024]}}] }'

        });

    });
}

function is_point_over_limit(fleet_id,fleet_name,callback)
{
    //#region
    /*
     SELECT count(station_id)
FROM station_customer
WHERE fleet_id='db_10001' 
UNION ALL
(SELECT keep_point
FROM master_fleet 
WHERE fleetid='db_10001' 
AND fleetname='demoktc')
     */
    //#endregion

  var sql= " SELECT count(station_id) FROM station_customer WHERE fleet_id="+utl.sqote(fleet_id);
  sql+=" UNION ALL "
  sql += " (SELECT keep_point FROM master_fleet WHERE fleetid=" + utl.sqote(fleet_id) + " AND fleetname=" + utl.sqote(fleet_name) + ") ";
  var can_save_point = true;
  var result = {'can_save_point':true,'now_total_point_customer':0}

  ipm.db.dbname = db_config;
  db.get_rows(ipm, sql, function (rows)
  {
     // debugger;
      if (rows.length > 0)
      {
          var _now_total_point_customer = parseInt(rows[0]['count']);
          var _limit_package = parseInt(rows[1]['count']);

          if (_now_total_point_customer > _limit_package)
          {
            
              result.can_save_point = false;
              result.now_total_point_customer = _now_total_point_customer;
              callback(result);
              return;
          }
          else
          {
              result.now_total_point_customer = _now_total_point_customer;
              callback(result);
          }
      }
      else
      {
          result.now_total_point_customer = _now_total_point_customer;
          callback(result);
      }
  });

}


    //http://jsfiddle.net/FranceImage/pcqsne4z/
function get_geom(req, res)
{
    debugger;
    var db_name = req.body.fleetid; //'db_10001';
    //{ "type":"FeatureCollection","features":[{"type":"Feature","properties":{"radius":8357.958217218129},"geometry":{"type":"Point","coordinates":[100.46585083007812,14.380146021094024]}}] }'
    var sql = ' ';
    sql += " SELECT station_id,station_type,station_name,radius,ST_AsGeoJSON(geom) as geom  FROM station_customer WHERE fleet_id=" + utl.sqote(db_name);
    //debugger;
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            //#region
            /*
             "type": "FeatureCollection",
                "features": [
                    {
                    "type": "Feature",
                    "id": "test2",
                    "properties": {
                        "radius": 500
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                        100.546016693115,
                       13.7573099688453
                        ]
                    }
                }
             */
            //#endregion
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "station_id": "{{station_id}}",';
            strMustache += ' "station_type": "{{station_type}}",';
            strMustache += ' "station_name": "{{station_name}}",';
            strMustache += ' "properties": {"radius": {{radius}} },';
            strMustache += ' "geometry":  {{geom}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';

            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');

            res.send(JSON.parse(final));
        }
        else {
            res.send([]);
        }
    });
}

function set_geom(req, res) {
    // debugger;
    //var geom = '{ "type": "FeatureCollection", "features": [{ "type": "Feature", "station_id": "5", "station_name": "กรมทหารราบที่11", "properties": { "radius": 0 }, "geometry": { "type": "Polygon", "coordinates": [[[100.600605010986, 13.8639970755196], [100.603222846985, 13.868705184286], [100.607171058655, 13.8665386328218], [100.606741905212, 13.8657053384119], [100.607814788818, 13.8649970358114], [100.603566169739, 13.8577055598928], [100.604338645935, 13.8575805611667], [100.606784820557, 13.8560805712061], [100.60643076896667, 13.855663905609084], [100.60436010360716, 13.85508057251768], [100.60323357582092, 13.854809738798743], [100.60328722000122, 13.854559738162546], [100.601892471313, 13.854247236989], [100.600991249084, 13.85283055973], [100.599403381348, 13.853413898471], [100.600090026855, 13.8556639056091], [100.59730052948, 13.8572055645847], [100.597214698792, 13.8575805611667], [100.596013069153, 13.8587472133276], [100.595755577087, 13.8590805414401], [100.598931312561, 13.8643303960955], [100.600261688232, 13.8639137453008], [100.600605010986, 13.8639970755196]]] } }] }';

    //var x = ['{ "type": "FeatureCollection", "features": [{ "type": "Feature", "station_id": "3", "station_name": "aaa", "properties": { "radius": 500 }, "geometry": { "type": "Point", "coordinates": [100.500869750977, 13.7367170795724] } }] }'
    //   ,
    // '{ "type": "FeatureCollection", "features": [{ "type": "Feature", "station_id": "16", "station_name": "test", "properties": { "radius": 2777.6003183696444 }, "geometry": { "type": "Point", "coordinates": [100.438213348389, 13.654444219406] } }] }'
    //];

    var geom = req.body.geom_data;//x;//
    var sql = '';
    if (geom.length > 1)
    {

        async.eachSeries(geom, function (xgom, next)
        {
            var xrow = JSON.parse(xgom);
            var res_type = xrow.features[0].geometry.type;
            var station_id = xrow.features[0].station_id;

            var q = '( WITH data AS (SELECT ' + utl.sqote(xgom) + '::json AS fc) ';
            q += ' SELECT ';
            q += '  ST_AsText(ST_GeomFromGeoJSON(feat->>' + utl.sqote('geometry') + ')) AS geom ';
            q += ' FROM ( ';
            q += ' SELECT json_array_elements(fc->' + utl.sqote('features') + ') AS feat ';
            q += ' FROM data ';
            q += ' ) AS f) ';

            if (res_type == 'Point')
            {
                var radius = xrow.features[0].properties.radius;

                sql += " UPDATE station_customer SET radius=" + utl.sqote(radius) + ",geom=" + q + " WHERE station_id=" + utl.sqote(station_id) + '; ';
                next();
            }
            else
            {

                sql += " UPDATE station_customer SET geom=" + q + " WHERE station_id=" + utl.sqote(station_id) + '; ';
                next();
            }

        }, function () {
            // debugger;
            ipm.db.dbname = db_config;
            db.excute(ipm, sql, function (is_ok) {
                //   debugger;
                if (is_ok == 'oK') {
                    res.json({ success: true, message: 'Complete set_geom.' });
                } else {
                    res.json({ success: false, message: 'Not Complete set_geom.' });
                }
            });
        });
    }
    else {
        var ar = JSON.parse(geom);
        var res_type = ar.features[0].geometry.type;
        var station_id = ar.features[0].station_id;

        var q = '( WITH data AS (SELECT ' + utl.sqote(geom) + '::json AS fc) ';
        q += ' SELECT ';
        q += '  ST_AsText(ST_GeomFromGeoJSON(feat->>' + utl.sqote('geometry') + ')) AS geom ';
        q += ' FROM ( ';
        q += ' SELECT json_array_elements(fc->' + utl.sqote('features') + ') AS feat ';
        q += ' FROM data ';
        q += ' ) AS f) ';


        if (res_type == 'Point') {
            var radius = ar.features[0].properties.radius;

            sql = " UPDATE station_customer SET radius=" + utl.sqote(radius) + ",geom=" + q + " WHERE station_id=" + utl.sqote(station_id) + '; ';

        } else {
            sql = " UPDATE station_customer SET geom=" + q + " WHERE station_id=" + utl.sqote(station_id) + '; ';
        }

        ipm.db.dbname = db_config;
        db.excute(ipm, sql, function (is_ok) {
            debugger;
            if (is_ok == 'oK') {
                res.json({ success: true, message: 'Complete set_geom.' });
            } else {
                res.json({ success: false, message: 'Not Complete set_geom.' });
            }
        });
    }


}

function del_geom(req, res) {
    var geom = req.body.geom_data;

    if (geom.length > 1) {
        var sql = ' ';
        async.eachSeries(geom, function (xgom, next) {

            var xrow = JSON.parse(xgom);
            //  var res_type = xrow.features[0].geometry.type;
            var station_id = xrow.features[0].station_id;

            sql += " DELETE FROM station_customer  WHERE station_id=" + utl.sqote(station_id) + ';';
            next();
        }, function () {
            // debugger;
            ipm.db.dbname = db_config;
            db.excute(ipm, sql, function (is_ok) {
                //   debugger;
                if (is_ok == 'oK') {
                    res.json({ success: true, message: 'Complete set geom.' });
                } else {
                    res.json({ success: false, message: 'Not Complete set geom.' });
                }
            });
        });

    } else {

        var ar = JSON.parse(geom);
        var res_type = ar.features[0].geometry.type;
        var station_id = ar.features[0].station_id;

        var sql = "DELETE FROM station_customer  WHERE station_id=" + utl.sqote(station_id);

        ipm.db.dbname = db_config;
        db.excute(ipm, sql, function (is_ok) {
            debugger;
            if (is_ok == 'oK') {
                res.json({ success: true, message: 'Complete del geom.' });
            } else {
                res.json({ success: false, message: 'Not Complete del geom' });
            }
        });
    }
}

function zone_test(req, res) {


    var bicycleRental = {
        "type": "FeatureCollection",
        "features": [
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -104.9998241,
                        39.7471494
                    ]
                },
                "type": "Feature",
                "properties": {
                    "popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
                },
                "id": 51
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -104.9983545,
                        39.7502833
                    ]
                },
                "type": "Feature",
                "properties": {
                    "popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
                },
                "id": 52
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -104.9963919,
                        39.7444271
                    ]
                },
                "type": "Feature",
                "properties": {
                    "popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
                },
                "id": 54
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -104.9960754,
                        39.7498956
                    ]
                },
                "type": "Feature",
                "properties": {
                    "popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
                },
                "id": 55
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -104.9933717,
                        39.7477264
                    ]
                },
                "type": "Feature",
                "properties": {
                    "popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
                },
                "id": 57
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -104.9913392,
                        39.7432392
                    ]
                },
                "type": "Feature",
                "properties": {
                    "popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
                },
                "id": 58
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -104.9788452,
                        39.6933755
                    ]
                },
                "type": "Feature",
                "properties": {
                    "popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
                },
                "id": 74
            }
        ]
    };

    res.send(bicycleRental);
}

function base_geom() {
    this.station_name = '';
    this.station_type = '';
    this.bound1 = '';
    this.bound2 = '';
}

function split_box(s) {
    //var s = '100.438213348389,13.654444219406|100.438213348389,13.654444219406';
    var ar = s.split('|');
    var x1 = set_format(ar[0]);
    var x2 = set_format(ar[1]);
    var res = { 'bound1': x1, 'bound2': x2 };
   // var res = 'bound1:' + x1 + ',bound2:' + x2 ;
    return res;
}

function set_format(x) {
    var xar = x.split(',');
    var lon = xar[0];
    var lat = xar[1];

    var res = '[' + lat + ',' + lon + ']';
    return res;
}

    //http://www.bostongis.com/postgis_extent_expand_buffer_distance.snippet
    //http://stackoverflow.com/questions/238260/how-to-calculate-the-bounding-box-for-a-given-lat-lng-location
    /*
     st_setsrid( st_makebox2d( st_makepoint(5.53,47.23), st_makepoint(15.38,54.96)), 4326)
    http://tools.geofabrik.de/calc/#type=geofabrik_standard&bbox=5.538062,47.236312,15.371071,54.954937&tab=1&proj=EPSG:4326&places=2
     */
function list_geom(req, res) {
    debugger;
   var db_name = req.body.fleetid; //'db_10001';
   //var db_name ='db_10001';
    /*
     SELECT station_name,station_type,st_astext(st_centroid(geom)) as pont_center
,ST_Area(geom)*POWER(0.3048,2) As sqm
,POWER(radius,2) * pi()--3.141592653589793
,radius
 FROM station_customer WHERE fleet_id='db_10001'
     */
    //SELECT station_name,station_type,st_astext(st_centroid(geom)) as pont_center FROM station_customer WHERE fleet_id='db_10001'

    //,ST_X(st_astext (st_centroid(geom))) AS lon,ST_Y(st_astext (st_centroid(geom))) AS lat FROM station_customer WHERE fleet_id=" + utl.sqote(db_name);
    //debugger;

    
   var sql = ' ';
    /*
    sql += " SELECT station_name,station_type";
    sql += " ,replace(replace(replace(box(ST_Extent(geom)::geometry)::text, '(', ''),'),', '|'),')','') as boxs";
    sql += " FROM station_customer WHERE fleet_id=" + utl.sqote(db_name) + " GROUP BY station_name,station_type "
   */

    sql += "  SELECT  ";
    sql += "  station_name,station_type ";
    sql += " ,replace(replace(replace(box(ST_Buffer(geom::geography, radius)::geometry)::text, '(', ''),'),', '|'),')','') as boxs ";
    sql += "  FROM station_customer  ";
    sql += " WHERE fleet_id=" + utl.sqote(db_name) + "";
    sql += " AND radius >0  ";

    sql += " UNION ALL ";

    sql += "  SELECT ";
    sql += " station_name,station_type ";
    sql += " ,replace(replace(replace(box(ST_Extent(geom)::geometry)::text, '(', ''),'),', '|'),')','') as boxs";
    sql += " FROM station_customer  ";
    sql += " WHERE fleet_id=" + utl.sqote(db_name) + "";
    sql += " AND radius =0 ";
    sql += " GROUP BY station_name,station_type ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        if (rows.length > 0)
        {
          //  res.send(rows);
            var final = [];
           // var xres = {'station_name':'','station_type':'','pont_center':''}
            async.eachSeries(rows, function (row, next)
            {
                var xres = new base_geom();
                xres.station_name = row.station_name;
                xres.station_type = row.station_type;
                var xx = split_box(row.boxs);
                xres.bound1 = xx.bound1;//utl.replaceAll('"','',split_box(row.boxs));
                xres.bound2 = xx.bound2;
                final.push(xres);


                next();
            }, function () {

                /*
                var strMustache = '{{#.}}';
                strMustache += '{';
                strMustache += '"station_name":"{{station_name}}" ';
                strMustache += ',"station_type":"{{station_type}}" ';
                strMustache += ',"bound1":{{bound1}} ';
                strMustache += ',"bound2":{{bound2}} ';
                strMustache += '}';
                strMustache += ',';
                strMustache += '{{/.}}';

                var result = mustache.render(strMustache, final);
                */
              //  console.log(result);
              //   result = utl.iRmend(result);
             //   res.send(JSON.stringify(final));
                // res.send(result);

               //  result = result.replace(/&quot;/g, '"');
               //  res.send(JSON.parse(result));
                res.send(final);
               // res.send(result);
            });
        }
        else {
            res.send([]);
        }
    });
}

function get_poi(req, res)
{

    var swlng1 = '103.888';
    var nelon2 = '104.534';
    var nelat2 = '16.057';
    var swlat1 = '15.673';
    var zoom_level = req.body.zoom_level;
   // debugger;
    var sql = " SELECT name_t,name_e,ST_AsGeoJSON(st_point(lon,lat)) as geom,poi_type as icon FROM poi ";
    sql += " WHERE (lon >" + utl.sqote(swlng1) + " AND lon < " + utl.sqote(nelon2) + ") ";
    sql += " AND (lat <= " + utl.sqote(nelat2) + " AND lat >= " + utl.sqote(swlat1) + ") AND minzoom=" + utl.sqote(zoom_level); //limit 100";

    ipm.db.dbname = 'admin_point';
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            /*
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  -38.3613558,
                  -8.8044875
                ]
              },
              "properties": {
                "Ordem": "193",
                "Eixo": "Leste",
                "Meta": "1L",
                "Municipio": "Petrolândia",
                "Estado": "PE",
                "Nome da Comunidade": "Agrovila 4"
              }
             */
            //res.send(rows);

            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "icon": "{{icon}}",';
            strMustache += ' "properties": {"name_t": "{{name_t}}","name_e": "{{name_e}}" },';
            strMustache += ' "geometry":  {{geom}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';

            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');

            res.send(JSON.parse(final));
        }
        else
        {
            res.send([]);
        }
    });

}

    //#endregion

//#region notify

function add_notify(req, res)
{
    // Isauthenticate(req, res, function () {
    var b = req.body;
    var ar = {
        'fleetid': b.fleetid, 'fleetname': b.fleetname
         , 'email': b.email, 'over_speed': b.over_speed
         , 'atenna_disconnect': b.atenna_disconnect
         , 'hard_acceleration': b.hard_acceleration, 'power_lost': b.power_lost
         , 'message': ''
    };

    //#region test
    /*
     debugger;
     var ar = {
         'fleetid': 'db_10001', 'fleetname': 'demoktc'
     , 'email': 'hangman@gmail.com', 'over_speed': '1'
     , 'atenna_disconnect': '1'
     , 'hard_acceleration': '0', 'power_lost': '1'
      ,'message':''
     } 
    */
    //#endregion


    var sql_insrt = squel.insert()
   .into("master_config_notify")
   .set("fleetid", ar.fleetid)
   .set("fleetname", ar.fleetname)
   .set("email", ar.email)
   .set("over_speed", ar.over_speed)
   .set("atenna_disconnect", ar.atenna_disconnect)
   .set("hard_acceleration", ar.hard_acceleration)
   .set("power_lost", ar.power_lost)
   .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql_insrt, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete add config_notify.' });
        }
        else {
            ar.message = is_ok.message;
            add_error_message(ar, function (res_add) {
                debugger;
                res.json({ success: false, message: 'Not Complete add config_notify.' });
            });
        }
    });

    //  });
}

function get_notify(req, res) {
    // " SELECT email,over_speed,atenna_disconnect,hard_acceleration,power_lost  FROM master_config_notify  WHERE fleetid ='db_10001' ";
    // Isauthenticate(req, res, function () {
    var fleetid = req.body.fleetid;
    // var fleetid = 'db_10001';//
    var sql = '';
    sql += "  SELECT id,email,over_speed,atenna_disconnect,hard_acceleration,power_lost ";
    sql += " FROM master_config_notify  ";
    sql += " WHERE fleetid =" + utl.sqote(fleetid);

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });

    //  });
}

function set_notify(req, res) {
    // Isauthenticate(req, res, function () {
    var b = req.body;

    var ar = {
        'id': b.id, 'fleetid': b.fleetid, 'fleetname': b.fleetname
     , 'email': b.email, 'over_speed': b.over_speed
     , 'atenna_disconnect': b.atenna_disconnect
     , 'hard_acceleration': b.hard_acceleration, 'power_lost': b.power_lost
     , 'message': ''
    };

    var sql = squel.update()
    .table("master_config_notify")
   .set("fleetid", ar.fleetid)
   .set("fleetname", ar.fleetname)
   .set("email", ar.email)
   .set("over_speed", ar.over_speed)
   .set("atenna_disconnect", ar.atenna_disconnect)
   .set("hard_acceleration", ar.hard_acceleration)
   .set("power_lost", ar.power_lost)
   .where('id = ' + utl.sqote(ar.id))
   .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete set config_notify.' });
        }
        else {
            ar.message = is_ok.message;
            add_error_message(ar, function (res_add) {
                debugger;
                res.json({ success: false, message: 'Not Complete set config_notify.' });
            });
        }
    });

    //  });
}

function del_notify(req, res) {
    // Isauthenticate(req, res, function () {
    var b = req.body;
    var ar = { 'fleetid': b.fleetid, 'fleetname': b.fleetname, 'id': b.id, 'message': '' };

    var sql = " DELETE FROM master_config_notify WHERE id=" + utl.sqote(ar.id);
    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete del config_notify.' });
        } else {
            ar.message = is_ok.message;
            add_error_message(ar, function (res_add) {
                debugger;
                res.json({ success: false, message: 'Not Complete dell config_notify.' });
            });
        }
    });

    //  });
}



function get_noti_details(req, res)
{
    //#region
    /*
    SELECT date_event,message_th,message_en,colour 
    FROM noti_details 
    WHERE is_read='0'
    AND fleetid='db_10001'
    ORDER BY date_event DESC 
    */
    //#endregion
    //Isauthenticate(req, res, function ()
    //{

     var fleet_id = req.body.fleetid;
    debugger;
      // var fleet_id = 'db_10001'
       var sql1 = ""; 
        sql1 += " SELECT date_event,message_th,message_en,colour,lon,lat FROM noti_details ";
        sql1 += " WHERE is_read='0' AND fleetid=" + utl.sqote(fleet_id);
        sql1 += " ORDER BY date_event DESC ";

        var message_json = {'total_unread':0,'data':[]}


        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                // res.send(rows);
                message_json.data = rows;
                message_json.total_unread = rows.length-1;
                res.send(message_json);
            }
            else {
                res.send(message_json);
            }
        });
   // });
}

function clr_noti_details(req, res)
{
    var fleet_id = req.body.fleetid;

    var sql =" UPDATE noti_details SET is_read='1' WHERE is_read='0' AND fleetid=" + utl.sqote(fleet_id);

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete set clr_notify.' });
        }
        else {
            res.json({ success: false, message: 'Not Complete add clr_notify.' });
        }
    });
}

 //#endregion

//#region Setting

//#region vehicle info

function get_vehicle_info(req, res)
{
    //#region
    /*
   
 SELECT mcv.modem_id,mcv.sim,mcv.vehiclename,mcv.carlicence,mcv.speedmax,mcv.idlestop,mcv.chassesno
,mcv.vehicle_model_id,mcv.vehicle_color_id 
,mcv.fuelempty,mcv.fuelfull,mcv.fueltank
,mcv.oil_level as km_per_lite
 FROM master_config_vehicle as mcv,setup_vehicle as sv 
 WHERE	sv.fleetcode=get_fleetid('demoktc') 
 AND sv.modem_id= mcv.modem_id 
    */
    //#endregion
   

    var b = req.body;
    var ar = { 'fleetid': b.fleetid, 'fleetname': b.fleetname}
   // var ar = { 'fleetid': 'db_10001', 'fleetname': 'demoktc' };

    var sql = "";
    sql += " SELECT mcv.modem_id,mcv.sim,mcv.vehiclename,mcv.carlicence,mcv.speedmax,mcv.idlestop,mcv.chassesno ";
    sql += " ,mcv.vehicle_model_id,mcv.vehicle_color_id ";
    sql += " ,mcv.fuelempty,mcv.fuelfull,mcv.fueltank,mcv.oil_level as km_per_lite ";
    sql += " ,x.xvehiclebrandid as vbrand_id,x.xVehicletypeid as vtype_id,'1' as sim_brand ";
    sql += " FROM master_config_vehicle as mcv,setup_vehicle as sv ";
    sql += " ,fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x ";
    sql += " WHERE	sv.fleetcode=get_fleetid(" + utl.sqote(ar.fleetname) + ") ";
    sql += " AND sv.modem_id= mcv.modem_id ORDER BY mcv.modem_id ASC";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });

}

function set_vehicle_info(req, res)
{
 
    var b = req.body;
    var ar = {
        'fleetid': b.fleetid, 'fleetname': b.fleetname, 'modem_id': b.modem_id
         , 'vehiclename': b.vehiclename, 'carlicence': b.carlicence ,"sim": b.sim
         , 'speedmax': b.speedmax, 'idlestop': b.idlestop, "km_per_lite": b.km_per_lite, 'fueltank': b.fueltank
         , "vbrand_id": b.vbrand_id, 'vehicle_model_id': b.vehicle_model_id, "vtype_id": b.vtype_id
         , 'vehicle_color_id': b.vehicle_color_id, "sim_brand": b.sim_brand
         , 'message': ''
    };
    
    /*
    var ar = {
        "fleetid": "db_10001", "fleetname": "demoktc", "modem_id": "1010001017"
        , "vehiclename": "1ฒบ-7235", "carlicence": "1ฒบ-7235", "sim": "1234567890"
        , "speedmax": "80", "idlestop": "10", "km_per_lite": "3.5", "fueltank": "0"
        , "vbrand_id": "1", "vehicle_model_id": "97", "vtype_id": "2"
        , "vehicle_color_id": "11", "sim_brand": "1"
    }
    */

    debugger;
    var sql = squel.update()
    .table("master_config_vehicle")
    .set("sim", ar.sim)
	.set("vehiclename", ar.vehiclename)
	.set("carlicence", ar.carlicence)
	.set("speedmax", ar.speedmax)
	.set("idlestop", ar.idlestop)
   // .set("chassesno", ar.chassesno)
    .set("vehicle_model_id", ar.vehicle_model_id)
    .set("vehicle_color_id", ar.vehicle_color_id)
    //.set("fuelempty", ar.fuelempty)
    .set("oil_level", ar.km_per_lite)
    .set("fueltank", ar.fueltank)
    .where('modem_id = ' + utl.sqote(ar.modem_id))
    .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete set vehicle_info.' });
        }
        else {
            ar.message = is_ok.message;
            add_error_message(ar, function (res_add) {
                debugger;
                res.json({ success: false, message: 'Not Complete set vehicle_info.' });
            });
        }
    });
}


//#region sub vehecle info

function get_brand_vehicle(req, res)
{
    var sql = "SELECT vehiclebrandid as id,vehiclebrand as brand_name FROM master_vehicle_brand";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

function get_detail_vehicle(req, res)
{
    //#region
    /*
SELECT 
vb.vehiclebrandid,vb.vehiclebrand,vm.vehiclemodelid,vm.vehiclemodel_name
,vt.Vehicletypeid,vt.vehicletype
,vm.emptygauge,vm.fullgauge,vm.oiltank
,x.xvehiclebrandid as vbrand_id,x.xVehicletypeid as vtype_id,'1' as sim_brand
FROM master_vehicle_brand as vb,master_vehicle_model as vm
,master_vehicle_type as vt
,fn_tb_getbrand_vehicle(vm.vehiclemodelid::INTEGER) as x
WHERE vb.vehiclebrandid = vm.vehiclebrandid
AND vm.vehicletypeid=vt.vehicletypeid
ORDER BY vb.vehiclebrandid ASC 
     */
    //#endregion

  //  var brand_id = '1';//req.body.brand_id;


    var sql = "";
    sql += " SELECT ";
    sql += "  vb.vehiclebrandid,vb.vehiclebrand,vm.vehiclemodelid,vm.vehiclemodel_name ";
    sql += " ,vt.Vehicletypeid,vt.vehicletype ";
    sql += " ,vm.emptygauge,vm.fullgauge,vm.oiltank ";
    sql += " ,x.xvehiclebrandid as vbrand_id,x.xVehicletypeid as vtype_id,'1' as sim_brand ";
    sql += " FROM master_vehicle_brand as vb,master_vehicle_model as vm ";
    sql += " ,master_vehicle_type as vt ";
    sql += " ,fn_tb_getbrand_vehicle(vm.vehiclemodelid::INTEGER) as x ";
    sql += " WHERE vb.vehiclebrandid = vm.vehiclebrandid ";
    sql += " AND vm.vehicletypeid=vt.vehicletypeid ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

function get_color(req, res) {
    var sql = "SELECT vehiclecolorid as id,vehiclecolor as color_th,vehiclecolor_e as color_en FROM master_vehicle_color ";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }

    });
}

//#endregion

//#endregion

//#region set password
function set_password(req, res)
{
    Isauthenticate(req, res, function () {
        var b = req.body;

        var ar = {
            'fleetid': b.fleetid, 'fleetname': b.fleetname, 'old_pwd': b.old_pwd
            , 'new_pwd': b.new_pwd, 'confirm_pwd': b.confirm_pwd
        };

        //var ar = {
        //    'fleetid': 'db_10001', 'fleetname': 'demoktc', 'old_pwd': '1234'
        //   , 'new_pwd': '1234', 'confirm_pwd': '1234'
        //};


        debugger;
        var sql = "SELECT password FROM master_fleet WHERE fleetid=" + utl.sqote(ar.fleetid) + " AND fleetname=" + utl.sqote(ar.fleetname);
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (rows) {
            if (rows.length > 0) {
                //res.send(rows);
                var _hash = rows[0]['password']
                decode_pws(ar.old_pwd, _hash, function (xres) {
                    if (xres == true) {
                        if (ar.new_pwd == ar.confirm_pwd) {
                            encode_pws(ar.new_pwd, function (hash) {
                                debugger;
                                var sql = "UPDATE master_fleet SET password=" + utl.sqote(hash) + " WHERE fleetname=" + utl.sqote(ar.fleetname) + " AND fleetid=" + utl.sqote(ar.fleetid) + " ";
                               // ipm.db.dbname = db_config;
                                db.excute(ipm, sql, function (is_ok) {
                                    if (is_ok == 'oK') {
                                        res.json({ success: true, message: 'Complete set password.' });
                                    } else {
                                        res.json({ success: false, message: 'Not Complete set password.' });
                                    }
                                });
                            });
                        }
                        else {
                            res.json({ success: false, message: 'Not Complete set password.' });
                        }


                    }
                    else {
                        res.json({ success: false, message: 'Not Collect old password.' });
                    }
                });
            }
            else {
                res.json({ success: false, message: 'Not Complete set password.' });
            }
        });

    });
}
//#endregion

 //#region user contract

function add_customer_contract(req, res)
{
    debugger;
  var b = req.body;
    var ar = {
        'fleetid': b.fleetid, 'fleetname': b.fleetname
        , 'contact_name': b.contact_name, 'contact_lastname': b.contact_lastname, 'mobile_phone': b.mobile_phone
        , 'job_position': b.job_position, 'email': b.email
    }


  //  console.log(JSON.stringify(ar));

    //var ar = {
    //    'fleetid': 'db_10001', 'fleetname': 'demoktc', 'custname_th': 'ไทย ทราโฟ แมนูแฟคเจอริ่ง2', 'custname_en': 'thai trafo manufacturing'
    //    , 'address': '', 'telephone': 'สนงใหญ่ 022952121ระยอง038-886331-5', 'fax': '02-2165788'
    //    , 'contact_name': 'ประภารัตน์ ตรีวิบูลย์2', 'mobile_phone': '086-3100073', 'job_postition': 'IT'
    //}

    var sql_insrt = squel.insert()
     .into("master_customer")
     .set("fleetid", ar.fleetid)
     .set("fleetname", ar.fleetname)
     .set("contact_name", ar.contact_name)
     .set("contact_lastname", ar.contact_lastname)
     .set("mobile_phone", ar.mobile_phone)
     .set("job_position", ar.job_position)
     .set("email", ar.email)
     .toString();

    //.set("custname_th", ar.custname_th)
    //.set("custname_en", ar.custname_en)
    // .set("address", ar.address)
    // .set("telephone", ar.telephone)
    // .set("fax", ar.fax)
    //.set("province_install", ar.province_install)
     
    ipm.db.dbname = db_config;
    db.excute(ipm, sql_insrt, function (is_ok)
    {
        debugger;
        if (is_ok == 'oK')
        {
            get_lastid_customer(function (id)
            {
                res.json({ success: true, message: 'Complete add customer_contract.','id':id });
            })
          
        } else {
            res.json({ success: false, message: 'Not Complete add customer_contract.', 'id': '0' });
        }
    });
}

function get_lastid_customer(callback)
{
   var sql= 'SELECT id FROM master_customer ORDER BY id DESC LIMIT 1';
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            callback(rows[0].id);
            return;
        }
    });
 }

function get_customer_contract(req, res)
{
    //#region
    /*
     SELECT id, fleetid, fleetname, custname_th, custname_en, address, telephone 
 ,fax, contact_name,contact_lastname, mobile_phone, job_position,email,province_install 
  FROM master_customer  
  WHERE fleetid='db_10001'
     */
    //#endregion

    var fleetid = req.body.fleetid;//'db_10001';//
    var sql = '';
    sql += " SELECT id, fleetid, fleetname,contact_name,contact_lastname, mobile_phone,job_position,email";
    sql += "  FROM master_customer  ";
    sql += "  WHERE fleetid=" + utl.sqote(fleetid);

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

function set_customer_contract(req, res)
{
    var b = req.body;
    var ar = {
        'id': b.id, 'fleetid': b.fleetid, 'fleetname': b.fleetname
        , 'telephone': b.telephone, 'contact_name': b.contact_name, 'contact_lastname': b.contact_lastname, 'mobile_phone': b.mobile_phone
        , 'job_position': b.job_position
        ,'email':b.email
    }

    debugger;
    //var ar = {
    //    'id':1,'fleetid': 'db_10001', 'fleetname': 'demoktc', 'custname_th': 'ไทยเท ทราโฟ แมนูแฟคเจอริ่ง2', 'custname_en': 'thai trafo manufacturing'
    //    , 'address': '', 'telephone': 'สนงใหญ่ 022952121ระยอง038-886331-5', 'fax': '02-2165788'
    //    , 'contact_name': 'ประภารัตน์ ตรีวิบูลย์2', 'mobile_phone': '086-3100073', 'job_postition': 'IT'
    //}

    var sql_update = squel.update()
     .table("master_customer")
     .set("fleetid", ar.fleetid)
     .set("fleetname", ar.fleetname)
     //.set("custname_th", ar.custname_th)
     //.set("custname_en", ar.custname_en)
    // .set("address", ar.address)
    // .set("telephone", ar.telephone)
    // .set("fax", ar.fax)
     .set("contact_name", ar.contact_name)
     .set("contact_lastname", ar.contact_lastname)
     .set("mobile_phone", ar.mobile_phone)
     .set("job_position", ar.job_position)
     .set("email", ar.email)
     .where('id = ' + utl.sqote(ar.id))
     .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql_update, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete set customer_contract.' });
        } else {
             res.json({ success: false, message: 'Not Complete set customer_contract.' });
        }
    });
}

function del_customer_contract(req, res)
{
  var id = req.body.id;
   //var id = '3';
   var sql_del = " DELETE FROM master_customer WHERE id=" + utl.sqote(id);
   ipm.db.dbname = db_config;
   db.excute(ipm, sql_del, function (is_ok) {
       debugger;
       if (is_ok == 'oK') {
           res.json({ success: true, message: 'Complete del customer_contract.' });
       } else {
           res.json({ success: false, message: 'Not Complete del customer_contract.' });
       }
   });

}

    //#endregion

function get_company(req, res) 
{
    var fleetid = req.body.fleetid;//'db_10001';//
    var sql =" SELECT company_id,company_name,location_address ";
    sql +=" ,contract_number,fax,location_install,fleetid ";
    sql +=" FROM master_company  WHERE fleetid=" + utl.sqote(fleetid);

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        if (rows.length > 0)
        {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

function set_company(req, res)
{

    var b = req.body;
    var ar = {
        'fleet_id': b.fleetid, 'fleetname': b.fleetname
        , 'company_name': b.company_name, 'location_address': b.location_address
        , 'contract_number': b.contract_number, 'location_install': b.location_install
        , 'fax': b.fax , 'company_id': b.company_id
    }

    var sql_update = squel.update()
     .table("master_company")
     .set("company_name", ar.company_name)
     .set("location_address", ar.location_address)
     .set("location_install", ar.location_install)
     .set("contract_number", ar.contract_number)
     .set("fax", ar.fax)
     .where('company_id = ' + utl.sqote(ar.company_id))
     .where('fleetid = ' + utl.sqote(ar.fleet_id))
     .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql_update, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete set company.' });
        } else {
            res.json({ success: false, message: 'Not Complete set company.' });
        }
    });
}

//#endregion

//#region driver


function add_driver(req, res)
{
    //SELECT vehiclename,carlicence,mcv.speedmax,mcv.idlestop
    //FROM master_config_vehicle as mcv
    //,setup_vehicle as sv
    //WHERE	sv.fleetcode=get_fleetid('demoktc')
    //AND sv.modem_id= mcv.modem_id

    var b = req.body;
    var ar = {
        'fleetid': b.fleetid, 'fleetname': b.fleetname
        , 'firstname': b.firstname, 'lastname': b.lastname
        , 'birthday': b.birthday, 'issuedate': b.issuedate, 'expiredate': b.expiredate
        , 'personalcard': b.personalcard, 'phonenumber': b.phonenumber
        , 'address': b.address,'division' :b.division
    }

    //var ar = {
    //    'fleetid': 'db_10001', 'fleetname': 'demoktc'
    //   , 'prefix': '', 'firstname': 'สมควร', 'lastname': 'ด่วนดี'
    //  , 'birthday': '2016-08-19 14:18:14.22' , 'issuedate': '2016-08-19 14:18:14.22' , 'expiredate': '2016-08-19 14:18:14.22'
    //   , 'personalcard': '12322434311', 'phonenumber': '0855674556'
    //}


    var sql_insrt = squel.insert()
     .into("master_drivers")
    // .set("driver_prefix", ar.prefix)
     .set("driver_firstname", ar.firstname)
     .set("driver_lastname", ar.lastname)
     .set("driver_birthday", ar.birthday)
     .set("driver_issuedate", ar.issuedate)
     .set("driver_expiredate", ar.expiredate)
     .set("driver_personalcard", ar.personalcard)
     .set("driver_phonenumber", ar.phonenumber)
     .set("driver_address", ar.address)
     .set("driver_division", ar.division)
     .set("fleetid", ar.fleetid)
     .set("modem_id", ar.fleetname)
     .toString();


    ipm.db.dbname = db_config;
    db.excute(ipm, sql_insrt, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete add customer_contract.' });
        } else {
            res.json({ success: false, message: 'Not Complete add customer_contract.' });
        }
    });
}

function get_driver(req, res)
{

    /*
     
 SELECT driver_firstname,driver_lastname 
 ,idate(driver_birthday) as driver_birthday
,idate(driver_issuedate) as driver_issuedate,idate(driver_expiredate) as driver_expiredate 
,driver_personalcard,driver_phonenumber,driver_address,driver_division 
,get_carlicence(vehicle_useage) as carlicence,get_vehiclename(vehicle_useage) as vehiclename,vehicle_useage as modem_id 
  FROM master_drivers 
 WHERE fleetid='db_10001'
     */

    var fleetid = req.body.fleetid;//'db_10001';//

    var sql = " SELECT driver_firstname,driver_lastname ";
    sql += " ,idate(driver_birthday) as driver_birthday "
    sql += ",idate(driver_issuedate) as driver_issuedate,idate(driver_expiredate) as driver_expiredate ";
    sql += ",driver_personalcard,driver_phonenumber,driver_address,driver_division ";
    sql += ",get_carlicence(vehicle_useage) as carlicence,get_vehiclename(vehicle_useage) as vehiclename,vehicle_useage as modem_id ";
    sql += " FROM master_drivers ";
    sql += " WHERE fleetid=" + utl.sqote(fleetid);

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });

}

function get_sim(req, res) {
    var sql = "SELECT id,brand_sim FROM master_sim";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

//#endregion

function add_new_subfleet(req, res)
{
   

    var b = req.body;
    var ar = {'fleetid': b.fleetid, 'subfleetid': b.subfleetid, 'fleetname': b.fleetname,'password': b.password}


    //var ar = {    'fleetid': 'db_10001', 'subfleetid': 'รถแจ้งซ่อม', 'fleetname': 'demodev',  'password': 'demodev' }

    var b = {'dbname': b.fleetid, 'dtmdemo': utcp.now(), 'dtmsign': utcp.now(),'role':'0'};


    encode_pws(ar.password, function (res_pws) {
        debugger;
        ar.password = res_pws;
        fin();
    });

    function fin()
    {
        debugger;
        var sql_insrt = squel.insert()
         .into("master_fleet")
         .set("fleetid", ar.fleetid)
         .set("subfleetid", ar.subfleetid)
         .set("fleetname", ar.fleetname)
         .set("password", ar.password)
         .set("portnum", port_recivedata)
         .set("dbname", b.dbname)
          .set("dtmdemo", b.dtmdemo)
         .set("dtmsign", b.dtmsign)
         .set("role", b.role)
         .toString();

         /**/
        ipm.db.dbname = db_config;
        db.excute(ipm, sql_insrt, function (is_ok) {
            callback(is_ok);
            return;
        });
         
    }

}



function list_fleet(req, res)
{
    var b = req.body;
    var fleetid = b.fleetid;
    var sql = "SELECT id as fleet_code,fleetname,subfleetid FROM master_fleet WHERE fleetid=" + utl.sqote(fleetid);
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

function move_to_subfleet()
{
    var ar = [
      { "modem_id": '1010001001', "fleet_code": "1" }
    , { "modem_id": '1010001002', "fleet_code": "1" }
    , { "modem_id": '1010001003', "fleet_code": "1" }
    ];






}


function add_error_message(ar,callback)
{
    debugger;
    ar.message = utl.replaceAll("'",'',ar.message);
    //error_mssage
    var sql_insrt = squel.insert()
 .into("error_mssage")
 .set("fleetid", ar.fleetid)
 .set("fleetname", ar.fleetname)
 .set("error_message", ar.message)
 .set("error_time", utl.timenow())
 .toString();


    ipm.db.dbname = db_config;
    db.excute(ipm, sql_insrt, function (is_ok)
    {
        callback(is_ok);
        return;
    });
}

function get_province(req, res) {
    var sql = "SELECT id,tname,ename FROM master_province ORDER BY id";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

function get_position(req, res)
{

}

//#region exports
//exports.get_login = get_login;
exports.tracking_realtime = tracking_realtime;
exports.tracking_realtime_ocsb = tracking_realtime_ocsb;

exports.tracking_history = tracking_history;
exports.authenticate = authenticate;
exports.get_vehicle_byfleet = get_vehicle_byfleet;
exports.Isauthenticate = Isauthenticate;
exports.logout = logout;
exports.set_note = set_note;


exports.get_vehicle_info = get_vehicle_info;
exports.set_vehicle_info = set_vehicle_info;

exports.get_brand_vehicle = get_brand_vehicle;
exports.get_detail_vehicle = get_detail_vehicle;
exports.get_color = get_color;
exports.get_sim = get_sim;


exports.set_password = set_password;

exports.add_customer_contract = add_customer_contract;
exports.get_customer_contract = get_customer_contract;
exports.set_customer_contract = set_customer_contract;
exports.del_customer_contract = del_customer_contract;

exports.add_notify = add_notify;
exports.get_notify = get_notify;
exports.set_notify = set_notify;
exports.del_notify = del_notify;
exports.get_noti_details = get_noti_details;
exports.clr_noti_details = clr_noti_details;

exports.get_server_status = get_server_status;
exports.get_server_all_info = get_server_all_info;
exports.get_server_mem_info = get_server_mem_info;

exports.get_company = get_company;
exports.set_company = set_company;

exports.get_driver = get_driver;
exports.add_driver = add_driver;


exports.add_new_subfleet = add_new_subfleet;
exports.list_fleet = list_fleet;


exports.get_province = get_province;

exports.zone_test = zone_test;



exports.add_geom = add_geom;
exports.get_geom = get_geom;
exports.set_geom = set_geom;
exports.del_geom = del_geom;
exports.list_geom = list_geom;

exports.get_poi = get_poi;
//#endregion

function test() {

   // tracking_history(' ', ' ');

    //  logout(' ', ' ');
  //  set_note(' ', ' ');
    // test_encode_pws()
    //add_customer_contract(' ', ' ');
   // set_customer_contract(' ', ' ');
    // authenticate(' ', ' ');
    // change_password(' ', ' ');
    // add_notify(' ', ' ');
    // set_password(' ', ' ');
    //  set_geom(' ', ' ');
    // get_noti_details(' ', ' ');
    //is_point_over_limit('db_10001', 'demoktc', function (can_save_point)
    //{
    //    debugger;
    //    console.log(can_save_point);
    //});
    add_geom(' ', ' ');
}

function test_encode_pws()
{
    var hash = '$2a$10$YdeqSlc5CZjph9Ipemz2BuRcnxJcGz0Ia3vxHqaMtgJJ5cWzq6hvy';
    var Password = 'demosale';
    encode_pws(Password, function (xres) {
        debugger;
        console.log(xres);
    });

    //decode_pws(Password, hash, function (xres) {
    //    debugger;
    //    console.log(xres);
    //});
}


//#region admin
function addmin_add_masterfleet(req, res)
{

    //var b = req.body;
    //var ar = { 'fleetid': b.fleetid, 'subfleetid': b.subfleetid, 'fleetname': b.fleetname, 'password': b.password }


    var ar = { 'fleetid': 'db_10002', 'subfleetid': 'ร้านนพรัตน์20', 'fleetname': 'nopparat20', 'password': 'nopparat20' }

    var b = { 'dbname': ar.fleetid, 'dtmdemo': utcp.now(), 'dtmsign': utcp.now(), 'role': '1' };


    encode_pws(ar.password, function (res_pws) {
        debugger;
        ar.password = res_pws;
        fin();
    });

    function fin() {
        debugger;
        var sql_insrt = squel.insert()
         .into("master_fleet")
         .set("fleetid", ar.fleetid)
         .set("subfleetid", ar.subfleetid)
         .set("fleetname", ar.fleetname)
         .set("password", ar.password)
         .set("portnum", port_recivedata)
         .set("dbname", b.dbname)
          .set("dtmdemo", b.dtmdemo)
         .set("dtmsign", b.dtmsign)
         .set("role", b.role)
         .toString();

        /**/
        ipm.db.dbname = db_config;
        db.excute(ipm, sql_insrt, function (is_ok) {
            console.log(is_ok);
            //callback(is_ok);
            //return;
        });

    }

}

//#endregion

/*
setTimeout(function () {
    // debugger;
    test();
    // test_split();
    // list_geom(' ',' ');
    //x 100.700093507767	y 13.9107822647441
    //var x = getCoordinatesSquare(60.160907899975, 100.700093507767, 13.9107822647441);
    //get_poi(' ', ' ');
    // add_driver(' ', ' ');
    // add_new_subfleet()
    //set_vehicle_info(' ',' ');

    //get_lastid_customer(function(x){  
    //   console.log(x);
    //});

    // addmin_add_masterfleet('','');

}, 1000);
*/

//#region Timeout
 
    //http://61.91.14.253:9002/tracking_realtime
    //http://localhost:9002/tracking_realtime

    //curl http://localhost:9002/get_login/1234/ssss
    //http://61.91.14.253:9002/get_login/1234/ssss

    //http://61.91.14.253:9002/get_login
    /*
        {
        'user': 'K009999',
        'pass': 'นายยงยุทธ เจริญศิลป์'
        }
     */
    //#endregion


 /*
http://gis.stackexchange.com/questions/60700/postgis-select-by-lat-long-bounding-box
Your data is not in lat/lon, so you need to push your box into the coordinate space of your data:

SELECT *
FROM mytable
WHERE 
  mytable.geom && 
  ST_Transform(ST_MakeEnvelope(minLon, minLat, maxLon, maxLat, 4326), 2223);
   
*/


    //http://stackoverflow.com/questions/33232008/javascript-calcualate-the-geo-coordinate-points-of-four-corners-around-a-cente
function getCoordinatesSquare(distance_to_center, x, y) {
    var points = [];
    var dx = distance_to_center * Math.sin(Math.PI / 4);
    var dy = distance_to_center * Math.cos(Math.PI / 4);

    points[0] = [x - dx, y - dy]; // (x1, y1)
    points[1] = [x - dx, y + dy]; // (x2, y2)
    points[2] = [x + dx, y + dy]; // (x3, y3)
    points[3] = [x + dx, y - dy]; // (x4, y4)

    return points;
}


    //https://www.google.com/maps?q=10.7974591091468,106.648697331548

 //#region
    /*
    function get_login(req, res)
    {
        debugger;
      //  var parsed_url = url.parse(req.url, true);
    
        var user = req.body.user;
        var pws = req.body.pass;
        console.log(user + ' ' + pws);
        var query = "SELECT * FROM htt_account WHERE account_name = " + utl.sqote(req.params.name) + " AND account_pass = " + utl.sqote(req.params.pass);
    
        
          db.get_rows(pg_config_HTT, query, function (rows) {
              if (rows.length > 0) {
                  res.send('success-login');
              } else {
                  res.send('notfound-login');
              }
          });
        
        // var t = { 'status_login': 'success-login' };
    
        var result = { 'status_login': 'success-login', 'status_rule': 'admin' }
        res.send(result);
        // res.send(t);
    }
    */
    //#endregion