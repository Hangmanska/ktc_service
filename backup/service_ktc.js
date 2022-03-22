
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

//var iutm = require('utm2latlon.js');
//var iOut = require('out_of_service.js');
//var iResend = require('resend_cat2crush');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());

var db_config = "master_config";
var db_unregis = "db_temp";

//#endregion


function tracking_realtime(req, res)
{
    var object = { "vehicle_all": 0, "vehicle_tracking": [] };
    var sql = '';

    //#region sample
    /*
SELECT modem_id,modem_id as vehicle_name,
		  idate(gps_datetime)as gps_datetime,  lon, lat, speed, direction, 
        altitude, satelites, message_id, input_status, output_status, 
       analog_input1, analog_input2, mileage, tambol, etambol, amphur, 
       eamphur, province, eprovince, driver_id, driver_prefix, driver_name, 
       driver_surname, driver_personalcard, driver_type, driver_no, 
       driver_branch, driver_sex, driver_birthcard, driver_expirecard, 
        idate(time_server_fin)as time_server, angle, oil_percent, oil_liter, 
       fleet_id,status,status||heading as heading
  FROM realtime
WHERE fleet_id='db_10001'
     */
    //#endregion
    
    sql += " SELECT modem_id,get_vehicle_name(modem_id) as vehicle_name,";
    sql += " idate(gps_datetime)as gps_datetime, lon, lat, speed, direction, ";
    sql += " altitude, satelites as sat, message_id, input_status, output_status, ";
    sql += " analog_input1, analog_input2, mileage, tambol, etambol, amphur, ";
    sql += " eamphur, province, eprovince, driver_id, driver_prefix, driver_name, ";
    sql += " driver_surname, driver_personalcard, driver_type, driver_no,";
    sql += " driver_branch, driver_sex, driver_birthcard, driver_expirecard,";
    sql += " idate(time_server_fin)as time_server, angle, oil_percent, oil_liter,";
    sql += " fleet_id,status,status||heading as heading "
    sql += " FROM realtime WHERE fleet_id='db_10001' ORDER BY modem_id ASC";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {

        if (rows.length > 0) {
            object.vehicle_tracking = rows;
            res.send(object);
        } else {
            res.send(object);
        }
    });
  
}

function get_login(req, res) {
    debugger;
    var user = req.body.user;
    var pws = req.body.pass;
    console.log(user + ' ' + pws);
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

    var result = { 'status_login': 'success-login', 'status_rule': 'admin' }
    res.send(result);
    // res.send(t);
}

exports.get_login = get_login;
exports.tracking_realtime = tracking_realtime;

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