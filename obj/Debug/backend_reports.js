// JavaScript source code
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
var url = require('url')

var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');

//var iutm = require('utm2latlon.js');
//var iOut = require('out_of_service.js');
//var iResend = require('resend_cat2crush');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());

var db_config = "master_config";
var db_unregis = "db_temp";
var jwtTokenSecret = 'hangman';
//#endregion

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

 
function get_report_over_speed_all_event(req, res)
{
    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //
    var start_time = req.body.start; // '2016-06-04 00:00';
    var end_time = req.body.stop; //'2016-06-04 23:59';

    var speed_max = 80;//default

    //var start_time = '2016-06-04 00:00';
    //var end_time = '2016-06-04 23:59';
    //var modem_id = '1010001004';
    //var db_name = 'db_10001';

    var sql1 = "SELECT speedmax FROM master_config_vehicle WHERE modem_id=" + utl.sqote(modem_id);
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) {
        debugger;
        if (rows.length > 0) {
            speed_max = rows[0]['speedmax'];
            dostep1();
        } else {
            dostep1();
        }
        
    });

    //#region
    /*
SELECT idate(gps_datetime) as gps_datetime,lon||','||lat as lonlat,speed,tambol||':'||amphur||':'||province as locations_th,etambol||':'||eamphur||':'||eprovince as locations_en
 FROM ht_1010001004 
WHERE gps_datetime >='2016-06-04 00:00' 
AND gps_datetime <='2016-06-04 23:59' 
AND speed >= '80' AND status = '3' AND satelites > 0 ORDER BY gps_datetime
     */
    //#endregion

    function dostep1() {
        var sql = ' ';
        sql += " SELECT idate(gps_datetime) as gps_datetime,lon||','||lat as lonlat,speed,tambol||':'||amphur||':'||province as locations_th,etambol||':'||eamphur||':'||eprovince as locations_en FROM ht_" + modem_id + " ";
        sql += " WHERE gps_datetime >=" + utl.sqote(start_time) + " AND gps_datetime <=" + utl.sqote(end_time) + " ";
        sql += " AND speed >= " + utl.sqote(speed_max) + " AND status = '3' AND satelites > 0 ORDER BY gps_datetime  "

        ipm.db.dbname = db_name;
        db.get_rows(ipm, sql, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });
    }

}

function get_report_over_speed(req, res)
{
    Isauthenticate(req, res, function ()
   {
    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001002';
    var start = req.body.start; // '2016-06-04 00:00';
    var stop = req.body.stop; //'2016-06-04 23:59';

    var sql1 = ' '; var sql2 = ' ';

    //#region
    /*
     SELECT to_char(start_date, 'HH24:MI') as start_date,start_loc_th,start_loc_en,start_lonlat 
    ,to_char(end_date, 'HH24:MI') as end_date,end_loc_th,end_loc_en,end_lonlat 
    ,TO_CHAR((timeuse ||'minute')::interval, 'HH24:MI') as timeuse,distance,maxspeed,avgspeed 
     FROM rp_over_speed  
    WHERE modem_id='1010001002'
    AND start_date >= '2016-07-01'
     AND end_date <='2016-07-04'
    AND distance > 0
     */
    //#endregion

    var sql1 = "";
    sql1 += " SELECT timeonly(start_date) as start_date,start_loc_th,start_loc_en,start_lonlat ";
    sql1 += "  ,timeonly(end_date) as end_date,end_loc_th,end_loc_en,end_lonlat ";
    sql1 += " ,itime_use(timeuse) as timeuse,distance,maxspeed,avgspeed ";
    sql1 += "  FROM rp_over_speed  ";
    sql1 += "  WHERE modem_id=" + utl.sqote(modem_id);
    sql1 += "  AND start_date>= " + utl.sqote(start);
    sql1 += "  AND end_date <=" + utl.sqote(stop);
    sql1 += "  AND distance > 0 ";


    sql2 += " SELECT  ";
    sql2 += " itime_use(SUM(timeuse)) as timeuse ";
    sql2 += ",SUM(distance) as distance ";
    sql2 += "  FROM rp_over_speed  ";
    sql2 += "  WHERE modem_id=" + utl.sqote(modem_id);
    sql2 += "  AND start_date>= " + utl.sqote(start);
    sql2 += "  AND end_date <=" + utl.sqote(stop);
    sql2 += "  AND distance > 0 ";

    //console.log(sql1);
   // console.log(sql2);

    get_row_sum(sql1, sql2, function (xres) {
        debugger;
      //  console.log(xres.rows.length);
        res.send(xres);
    });

   });
}


function get_report_trip(req, res)
{

//#region
 /*
SELECT modem_id,cast(start_date as varchar),cast(end_date as varchar),start_loc_th,end_loc_th
,start_loc_en,end_loc_en,start_lonlat,end_lonlat
,cast(timeuse as varchar) as timeuse
,cast(distance as varchar)as distance
,(distance / get_oil_level('1010001004')) as fuel
FROM rp_trip
WHERE modem_id='1010001004'
AND start_date>='2016-06-24 00:00'
AND end_date <='2016-06-25 23:59'

UNION  ALL

SELECT 
'' as modem_id,'' as start_date,'' as end_date,'' as start_loc_th,'' as end_loc_th
,'' as start_loc_en,'' as end_loc_en,'' as start_lonlat,'' as end_lonlat
,to_char((SUM(timeuse) ||'minute')::interval, 'HH24:MI') as timeuse
,cast(SUM(distance) as varchar)as distance
,cast(SUM(distance) / get_oil_level('1010001004')as varchar) as fuel
FROM rp_trip
WHERE modem_id='1010001004'
AND start_date>='2016-06-24 00:00'
AND end_date <='2016-06-25 23:59'
*/
//#endregion

    var db_name = req.body.fleetid; //'db_10001';//
    var modem_id = req.body.modemid; //'1010001004';//
    var start_time = req.body.start; //'2016-06-24 00:00';// 
    var end_time = req.body.stop; //'2016-06-25 23:59';//

    var para = { 'fleetid': db_name, 'modem_id': modem_id, 'start_time': start_time, 'end_time': end_time };

    Gen_report_trip(para, function (xres) {
        debugger;
        res.send(xres);
    });

}

function Gen_report_trip(para,callback)
{

    var sql1 = ' '; var sql2 = ' ';
    debugger;
    sql1 += "SELECT modem_id,timeonly(start_date) as start_date,timeonly(end_date) as end_date  ,start_loc_th,end_loc_th ";
    sql1 += " ,start_loc_en,end_loc_en,start_lonlat,end_lonlat ";
    sql1 += " ,itime_use(timeuse) as timeuse ";
    sql1 += " ,distance as distance ";
    sql1 += " ,(distance / get_oil_level(" + utl.sqote(para.modem_id) + ")) as fuel ";
    sql1 += " FROM rp_trip ";
    sql1 += " WHERE modem_id=" + utl.sqote(para.modem_id);
    sql1 += " AND start_date>=" + utl.sqote(para.start_time) + " ";
    sql1 += " AND end_date <=" + utl.sqote(para.end_time) + " ";


    sql2 += " SELECT  ";
    sql2 += " itime_use(SUM(timeuse)) as timeuse ";
    sql2 += ",SUM(distance) as distance ";
    sql2 += ",SUM(distance) / get_oil_level(" + utl.sqote(para.modem_id) + ") as fuel ";
    sql2 += " FROM rp_trip ";
    sql2 += " WHERE modem_id=" + utl.sqote(para.modem_id);
    sql2 += " AND start_date>=" + utl.sqote(para.start_time) + " ";
    sql2 += " AND end_date <=" + utl.sqote(para.end_time) + " ";

    get_row_sum(sql1, sql2, function (xres) 
    {
        debugger;
        // res.send(xres);
        callback(xres);
        return;
    });
}

function get_report_trip_monthly(req, res)
{
//#region
/*
 
        SELECT idmy(start_date) as start_date
        ,to_char(min(start_date), 'HH24:MI') as start_time
        ,to_char(max(end_date), 'HH24:MI') as end_time
        ,to_char((SUM(timeuse) ||'minute')::interval, 'HH24:MI') as timeuse
        ,SUM(distance) as distance
        ,(SUM(distance) / get_oil_level('1010001004')) as fuel
        ,cast(MIN(start_mile) as VARCHAR) as start_mile
        ,cast(MAX(end_mile) as VARCHAR) as end_mile
         FROM rp_trip
        WHERE modem_id='1010001004'
        AND iym(start_date)='2016-06'
        GROUP BY idmy(start_date)
        ORDER BY idmy(start_date) ASC

    SELECT start_date,start_time,end_time,timeuse,distance,fuel,start_mile,end_mile
    FROM res ORDER BY CASE WHEN start_date = '' THEN 2 ELSE 1 END,start_date
 */
    //#endregion

    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001004';
    var year_month = req.body.year_month; // '2016-06';


    var sql1 = ' '; var sql2 = ' ';
    sql1 += "  SELECT idmy(start_date) as start_date ";
    sql1 += "  ,timeonly(min(start_date)) as start_time ";
    sql1 += "  ,timeonly(max(end_date)) as end_time ";
    sql1 += "  ,itime_use(SUM(timeuse)) as timeuse ";
    sql1 += "  ,SUM(distance) as distance ";
    sql1 += "  ,(SUM(distance) / get_oil_level(" + utl.sqote(modem_id) + ")) as fuel ";
    sql1 += "  ,cast(MIN(start_mile) as VARCHAR) as start_mile ";
    sql1 += "  ,cast(MAX(end_mile) as VARCHAR) as end_mile ";
    sql1 += "  FROM rp_trip ";
    sql1 += "  WHERE modem_id="+ utl.sqote(modem_id);
    sql1 += "  AND iym(start_date)="+ utl.sqote(year_month);
    sql1 += "  GROUP BY idmy(start_date) ORDER BY idmy(start_date) ASC ";



    sql2 += " SELECT  ";
    sql2 += " itime_use(SUM(timeuse)) as timeuse";
    sql2 += ",SUM(distance) as distance ";
    sql2 += ",SUM(distance) / get_oil_level(" + utl.sqote(modem_id) + ") as fuel ";
    sql2 += " FROM rp_trip ";
    sql2 += " WHERE modem_id=" + utl.sqote(modem_id);
    sql2 += " AND iym(start_date)=" + utl.sqote(year_month)+" ";

 //   sql += "  SELECT start_date,start_time,end_time,timeuse,distance,fuel,start_mile,end_mile ";
  //  sql += "  FROM res ORDER BY CASE WHEN start_date = '' THEN 2 ELSE 1 END,start_date ";

    get_row_sum(sql1, sql2, function (xres) {
        debugger;
        res.send(xres);
    });

}


function get_report_idling(req, res)
{
   Isauthenticate(req, res, function ()
   {
        var db_name = req.body.fleetid; //'db_10001';
        var modem_id = req.body.modemid; //'1010001004';
        var start = req.body.start; // '2016-06-04 00:00';
        var stop = req.body.stop; //'2016-06-04 23:59';

        //#region
        /*
    SELECT modem_id,start_date,end_date,start_loc_th,end_loc_th
    ,start_loc_en,end_loc_en,timeuse,lonlat
     FROM rp_idleling
    WHERE modem_id='1010001001'
    AND start_date>='2016-06-04 00:00'
    AND end_date <='2016-06-04 23:59'
    AND timeuse >get_idlestop(modem_id)
         */
        //#endregion

        var sql1 = ' '; var sql2 = ' ';
        sql1 += "   SELECT modem_id,iymd(start_date) as date,timeonly(start_date) as start_date,timeonly(end_date) as end_date,start_loc_th,end_loc_th ";
        sql1 += ", start_loc_en,end_loc_en,itime_use(timeuse) as timeuse,lonlat ";
        sql1 += "  FROM rp_idleling ";
        sql1 += "  WHERE modem_id=" + utl.sqote(modem_id);
        sql1 += "  AND start_date>=" + utl.sqote(start);
        sql1 += "  AND end_date <=" + utl.sqote(stop);
        sql1 += "  AND timeuse >= get_parkingstop(modem_id) ";

        sql2 += " SELECT  ";
        sql2 += " itime_use(SUM(timeuse)) as timeuse ";
        sql2 += "  FROM rp_idleling ";
        sql2 += "  WHERE modem_id=" + utl.sqote(modem_id);
        sql2 += "  AND start_date>=" + utl.sqote(start);
        sql2 += "  AND end_date <=" + utl.sqote(stop);
        sql2 += "  AND timeuse >= get_idlestop(modem_id) ";


        get_row_sum(sql1, sql2, function (xres) {
            debugger;
            res.send(xres);
        });

    });
}

function get_report_idling_monthly(req, res)
{
    //#region
    /*
SELECT 	iymd (start_date) AS Day
,COUNT(id) AS Times
,SUM(timeuse) AS SumTime
,itime_use(SUM(timeuse)) as toal_timeuse
,fn_rp_idleling_c30min(modem_id,to_char(start_date,'YYYY-MM-dd'),30) as count_idle_30min
,to_char(x.xstart_date,'HH24:MI') as start_time
,to_char(x.xend_date,'HH24:MI') as end_time
,x.xtimeuse as max_timeuse
,x.xstart_loc_th,x.xend_loc_th,x.xstart_loc_en,x.xend_loc_en,x.xlonlat
FROM rp_idleling
,fn_tb_idling_month(modem_id,to_char(start_date,'YYYY-MM-dd')) as x
WHERE to_char(start_date,'YYYY-MM')='2016-06'
AND modem_id='1010001006'
AND timeuse > get_idlestop(modem_id) 
GROUP BY iymd (start_date),count_idle_30min
,x.xstart_date,x.xend_date
,x.xtimeuse
,x.xstart_loc_th,x.xend_loc_th,x.xstart_loc_en,x.xend_loc_en,x.xlonlat
ORDER BY Day

     SELECT to_char(start_date,'YYYY-MM-DD') AS Day
	,COUNT(id) AS Times
	,SUM(timeuse) AS SumTime
    ,to_char((SUM(timeuse) ||'minute')::interval, 'HH24:MI') as timeuse
    ,get_idlestop(modem_id) as idle
    ,fn_rp_idleling_c30min(modem_id,to_char(start_date,'YYYY-MM-dd'),30) as count_idle_30min
    FROM rp_idleling
    WHERE to_char(start_date,'YYYY-MM')='2016-06'
    AND modem_id='1010001006'
    AND timeuse > get_idlestop(modem_id) 
    GROUP BY to_char(start_date,'YYYY-MM-DD'),idle,count_idle_30min
    ORDER BY Day


      SELECT start_date,end_date
  ,start_loc_th,end_loc_th
	,start_loc_en,end_loc_en
  ,lonlat
	FROM rp_idleling
	WHERE  modem_id='1010001006'
	AND to_char(start_date,'YYYY-MM-DD')= '2016-06-22'
	ORDER BY timeuse DESC LIMIT 1

    SELECT timeuse,start_date,end_date
,to_char((timeuse ||'minute')::interval, 'HH24:MI') as timeuse
 FROM rp_idleling
WHERE  modem_id='1010001006'
AND to_char(start_date,'YYYY-MM-DD')='2016-06-22'
AND timeuse > get_idlestop(modem_id) 


    SELECT
	idate (gps_datetime) AS gps_datetime,
	lon || ',' || lat AS lonlat,
	tambol || ':' || amphur || ':' || province AS locations_th,
	etambol || ':' || eamphur || ':' || eprovince AS locations_en
	,speed,status,message_id
FROM
	ht_1010001006
WHERE
	gps_datetime >= '2016-06-22 00:00'
AND gps_datetime <= '2016-06-22 23:59'
--AND status = '2'
AND satelites > 0 
ORDER BY gps_datetime

    */

    //#endregion
    debugger;
    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001004';
    var year_month = req.body.year_month; // '2016-06';
    var sql1 = ' '; 

    sql1 += "  SELECT iymd(start_date) AS Day  ";
    sql1 += ",COUNT(id) AS Times ";
    sql1 += ",SUM(timeuse) AS SumTime ";
    sql1 += ",itime_use(SUM(timeuse)) as total_timeuse ";
    sql1 += ",fn_rp_idleling_c30min(modem_id,to_char(start_date,'YYYY-MM-dd'),30) as count_idle_30min ";
    sql1 += ",timeonly(x.xstart_date) as start_time ";
    sql1 += ",timeonly(x.xend_date) as end_time ";
    sql1 += ",itime_use(x.xtimeuse) as max_timeuse ";
    sql1 += ",x.xstart_loc_th,x.xend_loc_th,x.xstart_loc_en,x.xend_loc_en,x.xlonlat ";
    sql1 += "FROM rp_idleling ";
    sql1 += ",fn_tb_idling_month(modem_id,to_char(start_date,'YYYY-MM-dd')) as x ";
    sql1 += " WHERE to_char(start_date,'YYYY-MM')="+ utl.sqote(year_month);
    sql1 += " AND modem_id=" + utl.sqote(modem_id);
    sql1 += " AND timeuse > get_idlestop(modem_id) "; 
    sql1 += " GROUP BY iymd(start_date),count_idle_30min ";
    sql1 += ",x.xstart_date,x.xend_date ";
    sql1 += ",x.xtimeuse ";
    sql1 += ",x.xstart_loc_th,x.xend_loc_th,x.xstart_loc_en,x.xend_loc_en,x.xlonlat ";
    sql1 += " ORDER BY Day ";

    debugger;
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });

}



function get_report_summary_vehicle_monthly(req, res)
{
    //#region
    /*

     select idmy(tdate::timestamp) as st_date
,COALESCE(x1.xcount,'0') as ovsp_count
,COALESCE(x1.xdistance,'0') as ovsp_distance
,x2.distance as idle_distance
,COALESCE(x2.toal_timeuse,'00:00') as idle_timeuse
,COALESCE(x3.xdistance,'0') as trip_distance
,COALESCE(x3.xfuel,'0') as trip_fuel
,x4 as inout 
from generate_series('2016-07-01'::date,'2016-07-08'::date, '1 day'::interval) as tdate
,fn_tb_sum_overspeed('1010001004',iymd(tdate::timestamp)) as x1
,fn_tb_sum_idleling('1010001004',iymd(tdate::timestamp)) as x2
,fn_tb_sum_trip('1010001004',iymd(tdate::timestamp)) as x3
,fn_tb_sum_inout_geom('1010001004',iymd(tdate::timestamp)) as x4

      */
//#endregion
debugger;
    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001004';
    var year_month = req.body.year_month; // '2016-06';
    var sql1 = ' '; var sql2 = ' ';

    var date_start = year_month+'-01'
    var date_end = moment(year_month).endOf('month').format('YYYY-MM-DD');

    sql1 += "select iymd(tdate::timestamp) as st_date ";
    sql1 += ",COALESCE(x1.xcount,'0') as ovsp_count ";
    sql1 += ",COALESCE(x1.xdistance,'0') as ovsp_distance ";
    sql1 += ",x2.distance as idle_distance ";
    sql1 += ",COALESCE(x2.toal_timeuse,'00:00') as idle_timeuse ";
    sql1 += ",COALESCE(x3.xdistance,'0') as trip_distance ";
    sql1 += ",COALESCE(x3.xfuel,'0') as trip_fuel ";
    sql1 += ",x4 as inout ";
    sql1 += "from generate_series(" + utl.sqote(date_start) + "::date," + utl.sqote(date_end) + "::date, '1 day'::interval) as tdate ";
    sql1 += ",fn_tb_sum_overspeed(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x1 ";
    sql1 += ",fn_tb_sum_idleling(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x2 ";
    sql1 += ",fn_tb_sum_trip(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x3 ";
    sql1 += ",fn_tb_sum_inout_geom(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x4 ";


    sql2 += "SELECT COALESCE(SUM(x1.xcount),'0') as ovsp_count ";
    sql2 += ",COALESCE(SUM(x1.xdistance),'0') as ovsp_distance ";
    sql2 += ",SUM(x2.distance) as idle_distance ";
    sql2 += ",fn_tb_svm_sum_idle_footer(" + utl.sqote(modem_id) + "," + utl.sqote(date_start) + "," + utl.sqote(date_end) + ") as idle_timeuse ";
    sql2 += ",COALESCE(SUM(x3.xdistance),'0') as trip_distance ";
    sql2 += " ,COALESCE(SUM(x3.xfuel),'0') as trip_fuel ";
    sql2 += ",SUM(x4) as inout ";
    sql2 += " from generate_series(" + utl.sqote(date_start) + "::date," + utl.sqote(date_end) + "::date, '1 day'::interval) as tdate ";
    sql2 += ",fn_tb_sum_overspeed(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x1 ";
    sql2 += " ,fn_tb_sum_idleling(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x2 ";
    sql2 += ",fn_tb_sum_trip(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x3 ";
    sql2 += ",fn_tb_sum_inout_geom(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x4 ";

    ipm.db.dbname = db_config;
    get_row_sum(sql1, sql2, function (xres) {
        debugger;
        res.send(xres);
    });
    
}

function get_report_summary_by_group_monthly(req, res)
{
    var db_name = req.body.fleetid; //'db_10001';
    var year_month = req.body.year_month; // '2016-06';
    var sql1 = ' '; 

    //#region
    /*
     SELECT vehiclename as vehicle_name
,modem_id
,COALESCE(x1.xdistance,'0') as trip_distance
,COALESCE(x1.xfuel,'0') as trip_fuel
,x2.xcount as ovsp_time,x2.xdistance as ovsp_distance
,x3.distance as idle_distance,COALESCE(x3.total_timeuse,'00:00') as idle_total_timeuse
,x4.xcount as inout 
    FROM	master_config_vehicle
    ,fn_tb_sum_trip_by_month(modem_id,'2016-07') as x1
    ,fn_tb_sum_overspeed_by_month(modem_id,'2016-07') as x2
    ,fn_tb_sum_idleling_by_month(modem_id,'2016-07') as x3
		,fn_tb_sum_inout_geom_by_month(modem_id,'2016-07') as x4
    WHERE	 db_name='db_10001'
    ORDER BY modem_id ASC 
    */
    //#endregion

    sql1 += " SELECT vehiclename as vehicle_name,modem_id ";
    sql1 += " ,COALESCE(x1.xdistance,'0') as trip_distance ";
    sql1 += " ,COALESCE(x1.xfuel,'0') as trip_fuel ";
    sql1 += " ,x2.xcount as ovsp_time,COALESCE(x2.xdistance,'0')  as ovsp_distance ";
    sql1 += ",x3.distance as idle_distance,COALESCE(x3.total_timeuse,'00:00') as idle_total_timeuse ";
    sql1 += ",x4.xcount as inout ";
    sql1 += " FROM	master_config_vehicle ";
    sql1 += ",fn_tb_sum_trip_by_month(modem_id," + utl.sqote(year_month) + ") as x1 ";
    sql1 += ",fn_tb_sum_overspeed_by_month(modem_id,"+ utl.sqote(year_month)+") as x2 ";
    sql1 += ",fn_tb_sum_idleling_by_month(modem_id," + utl.sqote(year_month) + ") as x3 ";
    sql1 += ",fn_tb_sum_inout_geom_by_month(modem_id," + utl.sqote(year_month) + ") as x4 ";
    sql1 += " WHERE	 db_name=" + utl.sqote(db_name) + " ORDER BY modem_id ASC ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}


function get_report_parking(req, res)
{
    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001004';
    var start = req.body.start; // '2016-06-04 00:00';
    var stop = req.body.stop; //'2016-06-04 23:59';

    //#region
    /*
   SELECT modem_id
,to_char(start_date, 'HH24:MI') as start_date --itimeonly(start_date)
,to_char(end_date, 'HH24:MI') as end_date
,start_loc_th,end_loc_th,start_loc_en,end_loc_en,itime_use(timeuse) as timeuse,start_lonlat,end_lonlat 
FROM rp_parking 
WHERE modem_id='1010001004'
AND start_date>='2016-07-01 00:00'
AND end_date <='2016-07-10 23:59'
AND timeuse >= get_parkingstop(modem_id)

 SELECT  
itime_use(SUM(timeuse)) as timeuse 
  FROM rp_parking 
 WHERE modem_id='1010001004'
AND start_date>='2016-07-01 00:00'
AND end_date <='2016-07-10 23:59'
  AND timeuse >= get_parkingstop(modem_id)

     */
    //#endregion

    var sql1 = ' '; var sql2 = ' ';
    sql1 += "   SELECT modem_id,iymd(start_date) as date,to_char(start_date, 'HH24:MI') as start_date,to_char(end_date, 'HH24:MI')  as end_date";
    sql1 += " ,start_loc_th,end_loc_th,start_loc_en,end_loc_en,itime_use(timeuse) as timeuse,start_lonlat,end_lonlat ";
    sql1 += "  FROM rp_parking ";
    sql1 += "  WHERE modem_id=" + utl.sqote(modem_id);
    sql1 += "  AND start_date>=" + utl.sqote(start);
    sql1 += "  AND end_date <=" + utl.sqote(stop);
    sql1 += "  AND timeuse >= get_parkingstop(modem_id) ";

    sql2 += " SELECT  ";
    sql2 += " itime_use(SUM(timeuse)) as timeuse ";
    sql2 += "  FROM rp_parking ";
    sql2 += "  WHERE modem_id=" + utl.sqote(modem_id);
    sql2 += "  AND start_date>=" + utl.sqote(start);
    sql2 += "  AND end_date <=" + utl.sqote(stop);
    sql2 += "  AND timeuse >= get_parkingstop(modem_id) ";


    get_row_sum(sql1, sql2, function (xres) {
        debugger;
        res.send(xres);
    });
}

function get_report_parking_monthly(req, res) {
    //#region
    /*
    SELECT iymd(start_date) AS Day
,COUNT(id) AS Times
,SUM(timeuse) AS SumTime
,itime_use(SUM(timeuse)) as timeuse
,fn_rp_parking_c30min(modem_id,iymd(start_date),get_parkingstop(modem_id)) as parkingstop_time
,timeonly(x.xstart_date)as start_time
,timeonly(x.xend_date)as end_time
,itime_use(x.xtimeuse)as max_timeuse
,x.xstart_loc_th,x.xend_loc_th,x.xstart_loc_en,x.xend_loc_en
,x.xstart_lonlat ,x.xend_lonlat
    FROM rp_parking
   ,fn_tb_parking_month(modem_id,iymd(start_date)) as x
    WHERE to_char(start_date,'YYYY-MM')='2016-07'
    AND modem_id='1010001004'
    AND timeuse > get_parkingstop(modem_id) 
    GROUP BY iymd(start_date),parkingstop_time
,x.xstart_date,x.xend_date,x.xtimeuse
,x.xstart_loc_th,x.xend_loc_th,x.xstart_loc_en,x.xend_loc_en
,x.xstart_lonlat ,x.xend_lonlat
    ORDER BY Day
    */
    //#endregion

    debugger;
    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001004';
    var year_month = req.body.year_month; // '2016-06';
    var sql1 = ' '; 

    sql1 += " SELECT iymd(start_date) AS Day ";
    sql1 += ",COUNT(id) AS Times ";
    sql1 += ",SUM(timeuse) AS SumTime ";
    sql1 += ",itime_use(SUM(timeuse)) as timeuse ";
    sql1 += ",fn_rp_parking_c30min(modem_id,iymd(start_date),get_parkingstop(modem_id)) as parkingstop_time ";
    sql1 += ",timeonly(x.xstart_date)as start_time ";
    sql1 += ",timeonly(x.xend_date)as end_time ";
    sql1 += ",itime_use(x.xtimeuse)as max_timeuse ";
    sql1 += ",x.xstart_loc_th,x.xend_loc_th,x.xstart_loc_en,x.xend_loc_en ";
    sql1 += ",x.xstart_lonlat ,x.xend_lonlat ";
    sql1 += " FROM rp_parking ";
    sql1 += ",fn_tb_parking_month(modem_id,iymd(start_date)) as x ";
    sql1 += " WHERE to_char(start_date,'YYYY-MM')=" + utl.sqote(year_month);
    sql1 += " AND modem_id= "+ utl.sqote(modem_id);
    sql1 += " AND timeuse > get_parkingstop(modem_id)  ";
    sql1 += " GROUP BY iymd(start_date),parkingstop_time ";
    sql1 += ",x.xstart_date,x.xend_date,x.xtimeuse ";
    sql1 += ",x.xstart_loc_th,x.xend_loc_th,x.xstart_loc_en,x.xend_loc_en ";
    sql1 += ",x.xstart_lonlat ,x.xend_lonlat ";
    sql1 += "ORDER BY Day ";

    debugger;
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}


function get_report_inout_geom(req, res)
{

    //#region
    /*
         SELECT idmy(enter_time) as enter_date
        ,to_char(enter_time, 'HH24:MI') as enter_time
		,idmy(leave_time) as leave_date
        ,to_char(leave_time, 'HH24:MI') as leave_time
,itime_use(timeuse) as timeuse
,geom_name,gmt.type_name_th,gmt.type_name_en
,start_loc_th,end_loc_th,start_loc_en,end_loc_en,start_lonlat,end_lonlat 
         FROM rp_enter_geom as rp,master_station_type as gmt
        WHERE modem_id='1010001001'
		AND gmt.type_id=rp.geom_type::int
        AND iymd(enter_time)>='2016-07-14'
		AND iymd(leave_time) <='2016-07-30'
     */
    //#endregion

    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001004';
    var start = req.body.start; // '2016-06-01 00:00';
    var stop = req.body.stop; //'2016-06-30 23:59';

    var sql1 = ' '; 
    sql1 += "  SELECT iymd(enter_time) as enter_date ";
    sql1 += "  ,to_char(enter_time, 'HH24:MI') as enter_time ";
    sql1 += " ,iymd(leave_time) as leave_date ";
    sql1 += " ,to_char(leave_time, 'HH24:MI') as leave_time ";
    sql1 += "  ,itime_use(timeuse) as timeuse ";
    sql1 += "  ,geom_name,gmt.type_name_th,gmt.type_name_en ";
    sql1 += "  ,start_loc_th,end_loc_th,start_loc_en,end_loc_en,start_lonlat,end_lonlat  ";
    sql1 += "  FROM rp_enter_geom as rp,master_station_type as gmt ";
    sql1 += "  WHERE modem_id="+utl.sqote(modem_id);
    sql1 += "  AND gmt.type_id=rp.geom_type::int ";
    sql1 += "  AND iymd(enter_time)>=" + utl.sqote(start);
    sql1 += "  AND iymd(leave_time) <=" + utl.sqote(stop);

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });

}

function get_report_inout_geom_by_group_monthly(req, res)
{
    //#regeion
    /*
     SELECT vehiclename as vehicle_name
,modem_id
,x4.xcount as total_inout 
,itime_use(fn_tb_sum_inout_timeuse_geom_by_month(modem_id,'2016-07')) as total_timeuse
,fn_tb_sum_inout_geom_by_month_and_type(modem_id,'2016-07','1') as inout_station
,fn_tb_sum_inout_geom_by_month_and_type(modem_id,'2016-07','2') as inout_allow_zone
,fn_tb_sum_inout_geom_by_month_and_type(modem_id,'2016-07','3') as inout_notallow_zone
,itime_use(fn_tb_sum_inout_timeuse_geom_by_month_type(modem_id,'2016-07','1')) as timeuse_station
,itime_use(fn_tb_sum_inout_timeuse_geom_by_month_type(modem_id,'2016-07','2')) as timeuse_allow_zone
,itime_use(fn_tb_sum_inout_timeuse_geom_by_month_type(modem_id,'2016-07','3')) as timeuse_notallow_zone
FROM	master_config_vehicle
,fn_tb_sum_inout_geom_by_month(modem_id,'2016-07') as x4
WHERE	 db_name='db_10001'
ORDER BY modem_id ASC 
     */
    //#endregion

    var db_name = req.body.fleetid; //'db_10001';
    var year_month = req.body.year_month; // '2016-06';
    var sql1 = ' '; 

    sql1 += " SELECT vehiclename as vehicle_name ";
    sql1 += "  ,modem_id "
    sql1 += " ,x4.xcount as total_inout  "
    sql1 += " ,itime_use(fn_tb_sum_inout_timeuse_geom_by_month(modem_id," + utl.sqote(year_month) + ")) as total_timeuse "
    sql1 += " ,fn_tb_sum_inout_geom_by_month_and_type(modem_id," + utl.sqote(year_month) + ",'1') as inout_station "
    sql1 += " ,fn_tb_sum_inout_geom_by_month_and_type(modem_id," + utl.sqote(year_month) + ",'2') as inout_allow_zone "
    sql1 += " ,fn_tb_sum_inout_geom_by_month_and_type(modem_id," + utl.sqote(year_month) + ",'3') as inout_notallow_zone "
    sql1 += " ,itime_use(fn_tb_sum_inout_timeuse_geom_by_month_type(modem_id," + utl.sqote(year_month) + ",'1')) as timeuse_station "
    sql1 += " ,itime_use(fn_tb_sum_inout_timeuse_geom_by_month_type(modem_id," + utl.sqote(year_month) + ",'2')) as timeuse_allow_zone "
    sql1 += " ,itime_use(fn_tb_sum_inout_timeuse_geom_by_month_type(modem_id," + utl.sqote(year_month) + ",'3')) as timeuse_notallow_zone "
    sql1 += " FROM	master_config_vehicle "
    sql1 += " ,fn_tb_sum_inout_geom_by_month(modem_id," + utl.sqote(year_month) + ") as x4 "
    sql1 += " WHERE	 db_name=" + utl.sqote(db_name);
    sql1 += " ORDER BY modem_id ASC  "


    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

//#region maintanace

function get_report_maintanace_oil(req, res)
{
    /*
    SELECT get_vehiclename(r.modem_id) as vehicle_name
    ,mileage as now_mileage
    ,mcv.maintance_oil_lastcheck as lastcheck
    ,mcv.maintance_oil_duecheck as duecheck
    ,case WHEN mileage-mcv.maintance_oil < 0 THEN 'left' ELSE 'over' end as status
    ,ABS(mileage-mcv.maintance_oil) as leftmileage
    ,mcv.maintance_oil_check_every as check_every
    FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv
    WHERE r.modem_id=mcv.modem_id
    AND r.modem_id=sv.modem_id
    AND sv.fleetcode=get_fleetid('nopparat20')
    ORDER BY r.modem_id ASC
    */
    debugger;
    Isauthenticate(req, res, function ()
    {
        var json = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };
        // console.log(JSON.stringify(t));

        //var object = { "db_name": 'db_10001', 'fleetname': 'demoktc' };

        var sql1 = ' ';
        sql1 += " SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name ";
        sql1 += ",mileage as now_mileage ";
        sql1 += ",mcv.maintance_oil_lastcheck as lastcheck ";
        sql1 += ",mcv.maintance_oil_duecheck as duecheck ";
        sql1 += ",case WHEN mileage-mcv.maintance_oil < 0 THEN 'left' ELSE 'over' end as status ";
        sql1 += ",ABS(mileage-mcv.maintance_oil) as leftmileage ";
        sql1 += ",mcv.maintance_oil_check_every as check_every ";
        sql1 += " FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv ";
        sql1 += " WHERE r.modem_id=mcv.modem_id ";
        sql1 += "AND r.modem_id=sv.modem_id ";
        sql1 += "AND sv.fleetcode=get_fleetid(" + utl.sqote(json.fleetname) + ") ";
        sql1 += " ORDER BY r.modem_id ASC ";

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });
    });
}

function get_report_maintanace_tyre(req, res)
{
    /*
SELECT get_vehiclename(r.modem_id) as vehicle_name
,mileage as now_mileage
,mcv.maintance_tyre_lastcheck as lastcheck
,mcv.maintance_tyre_duecheck as duecheck
,case WHEN mileage-mcv.maintance_tyre < 0 THEN 'left' ELSE 'over' end as status
,ABS(mileage-mcv.maintance_tyre) as leftmileage
,mcv.maintance_tyre_check_every as check_every
 FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv
WHERE r.modem_id=mcv.modem_id
AND r.modem_id=sv.modem_id
AND sv.fleetcode=get_fleetid('nopparat20')
ORDER BY r.modem_id ASC

    */
    Isauthenticate(req, res, function () {
        var json = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };
        //var object = { "db_name": req.body.fleetid, 'fleetname': 'nopparat20' };

        var sql1 = ' ';
        sql1 += " SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name ";
        sql1 += ",mileage as now_mileage ";
        sql1 += ",mcv.maintance_tyre_lastcheck as lastcheck ";
        sql1 += ",mcv.maintance_tyre_duecheck as duecheck ";
        sql1 += ",case WHEN mileage-mcv.maintance_tyre < 0 THEN 'left' ELSE 'over' end as status ";
        sql1 += ",ABS(mileage-mcv.maintance_tyre) as leftmileage ";
        sql1 += ",mcv.maintance_tyre_check_every as check_every ";
        sql1 += " FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv ";
        sql1 += " WHERE r.modem_id=mcv.modem_id ";
        sql1 += " AND r.modem_id=sv.modem_id ";
        sql1 += " AND sv.fleetcode=get_fleetid(" + utl.sqote(json.fleetname) + ") ";
        sql1 += " ORDER BY r.modem_id ASC ";

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });
    });
}

//#endregion

//#region other report รายงานอื่นๆ

function get_report_tow_alert(req, res)
{
    //SELECT * FROM ht_1010001002 WHERE message_id='177'
    /*
       SELECT modem_id,idate(gps_datetime),lon,lat
    ,tambol,amphur,province
	,etambol,eamphur,eprovince
     FROM ht_1010001002
    WHERE gps_datetime >='2016-05-29 00:00'
    AND gps_datetime <='2016-08-29 23:59'
    AND message_id='193'
     */

 //   Isauthenticate(req, res, function () {

        var db_name = req.body.fleetid; //'db_10001';
        var modem_id = req.body.modemid; //'1010001002';
        var start = req.body.start; // '2016-06-04 00:00';
        var stop = req.body.stop; //'2016-06-04 23:59';
        var tb_name = 'ht_' + modem_id
        var sql1 = ' '; 

        sql1 += " SELECT modem_id,idate(gps_datetime),lon,lat ";
        sql1 += " ,tambol,amphur,province,etambol,eamphur,eprovince ";
        sql1 += "  FROM "+tb_name;
        sql1 += " WHERE gps_datetime >=" + utl.sqote(start);
        sql1 += " AND gps_datetime <=" + utl.sqote(stop);
        sql1 += " AND message_id='177' ";

        ipm.db.dbname = db_name;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });

   // });
}

function get_report_enter_low_power_mode(req, res)
{
    //SELECT * FROM ht_1010001002 WHERE message_id='193'
    //Enter low power mode report

   // Isauthenticate(req, res, function () {
        var db_name = req.body.fleetid; //'db_10001';
        var modem_id = req.body.modemid; //'1010001002';
        var start = req.body.start; // '2016-06-04 00:00';
        var stop = req.body.stop; //'2016-06-04 23:59';
        var tb_name = 'ht_' + modem_id
        var sql1 = ' ';

        sql1 += " SELECT modem_id,idate(gps_datetime),lon,lat ";
        sql1 += " ,tambol,amphur,province,etambol,eamphur,eprovince ";
        sql1 += "  FROM " + tb_name;
        sql1 += " WHERE gps_datetime >=" + utl.sqote(start);
        sql1 += " AND gps_datetime <=" + utl.sqote(stop);
        sql1 += " AND message_id='193' ";

        ipm.db.dbname = db_name;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });

   // });
}

function get_report_note_details(req, res)
{
    //#region
    /*
    SELECT modem_id,idate(datenote),message,lon,lat
    ,tambol,amphur,province
	,etambol,eamphur,eprovince
     FROM note_details 
    WHERE modem_id='1010001001'
    AND datenote >='2016-06-04 00:00'
    AND datenote <='2016-06-30 23:59'

     */
    //#endregion

    Isauthenticate(req, res, function (){

        var db_name = req.body.fleetid; //'db_10001';
        var modem_id = req.body.modemid; //'1010001004';
        var start = req.body.start; // '2016-06-01 00:00';
        var stop = req.body.stop; //'2016-06-30 23:59';

        var sql1 = ' ';
        sql1 += " SELECT modem_id,idate(datenote),message,lon,lat ";
        sql1 += " ,tambol,amphur,province,etambol,eamphur,eprovince ";
        sql1 += " FROM note_details ";
        sql1 += " WHERE modem_id=" + utl.sqote(modem_id);
        sql1 += " AND datenote >=" + utl.sqote(start);
        sql1 += " AND datenote <=" + utl.sqote(stop);

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });
    });
}

//#endregion


function get_row_sum(sql1, sql2, callback)
{

    ipm.db.dbname = db_config;
    var detail = { 'rows': '', 'sum': '' };
    var a = false; var b = false;
   
        db.get_rows(ipm, sql1, function (row) {
            if (row.length > 0)
            {
                a = true;
                detail.rows = row;
                next();
            }
            else
            {
                a = true;
                detail.rows = [];
                next();
            }
        });
  
        db.get_rows(ipm, sql2, function (row) {
            if (row.length > 0) {
               b = true;
                detail.sum = row;
                next();
            }
            else {
                b = true;
                detail.sum = [];
                next();
            }
        });

        function next()
        {
            if (a && b) {
                callback(detail);
                return;
            }
        }
  }

  

//#region exports
exports.get_report_over_speed = get_report_over_speed;

exports.get_report_idling = get_report_idling;
exports.get_report_idling_monthly = get_report_idling_monthly;

exports.get_report_over_speed_all_event = get_report_over_speed_all_event;

exports.get_report_trip = get_report_trip;
exports.get_report_trip_monthly = get_report_trip_monthly;

exports.get_report_parking = get_report_parking;
exports.get_report_parking_monthly = get_report_parking_monthly;

exports.get_report_summary_vehicle_monthly = get_report_summary_vehicle_monthly;
exports.get_report_summary_by_group_monthly = get_report_summary_by_group_monthly;

exports.get_report_inout_geom = get_report_inout_geom;
exports.get_report_inout_geom_by_group_monthly = get_report_inout_geom_by_group_monthly;

exports.get_report_enter_low_power_mode = get_report_enter_low_power_mode;
exports.get_report_tow_alert = get_report_tow_alert;
exports.get_report_note_details = get_report_note_details;

exports.get_row_sum = get_row_sum;

exports.get_report_maintanace_oil = get_report_maintanace_oil;
exports.get_report_maintanace_tyre = get_report_maintanace_tyre;
    //#endregion

exports.Gen_report_trip = Gen_report_trip;

/*
setTimeout(function () {
//    debugger;
    //    get_report_trip('','');
    get_report_over_speed_all_event('', '');

    .ToString(',');
}, 1000);
*/

