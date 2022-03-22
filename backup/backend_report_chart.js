
//#region
var mustache = require("mustache");
var timespan = require('timespan');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());


var db_config = "master_config";
var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db_config = "master_config";
//#endregion

    //1010001030

function HOUR(min) {
    var ts = timespan.fromMinutes(min);
    //  console.log(ts);
    var result = 0;
    utl.is_undefined(ts, function (is_true) {
        if (is_true) {
            result = '0 days  0 hr 0 mi'; //0
        } else {
            result =ts.days + ' days '+ ts.hours + ' hr' + ts.minutes+' mi';
        }
    })

    return result;
}

function track_speed(req, res) {
    //#region
    /*
 SELECT DISTINCT gps_datetime
 ,speed
  ,tambol||amphur||province as tloc , etambol||eamphur||eprovince as eloc,status
  FROM ht_1010001030
 WHERE  gps_datetime >= '2016-09-09 00:00'
 AND gps_datetime <='2016-09-09 23:59'
ORDER BY gps_datetime
     */
    //#endregion

    debugger;
    // Isauthenticate(req, res, function () {
    var db_name = req.body.fleetid; //'db_10001'; //
    var modem_id = req.body.modemid; //'1010001030';// 
    var start = req.body.start; // '2016-09-09 00:00';//
    var stop = req.body.stop; //'2016-09-09 23:59';//
    var tb_name = "ht_" + modem_id;

    //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
    var sql = "";
    sql += " SELECT DISTINCT gps_datetime";
    sql += " ,speed";
    //sql += " ,tambol || amphur || province as tloc , etambol||eamphur||eprovince as eloc,status";
    sql += ",tambol||':'||amphur||':'||province as tloc ";
    sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
    sql += ",status";
    sql += " FROM " + tb_name;
    sql += " WHERE  gps_datetime >= " + utl.sqote(start);
    sql += " AND gps_datetime <=" + utl.sqote(stop);
    sql += " ORDER BY gps_datetime ";
    //speed >0

    /*
    [{
    "name": "Month",
    "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }, {
        "name": "Revenue",
        "data": [23987, 24784, 25899, 25569, 25897, 25668, 24114, 23899, 24987, 25111, 25899, 23221]
    }, {
        "name": "Overhead",
        "data": [21990, 22365, 21987, 22369, 22558, 22987, 23521, 23003, 22756, 23112, 22987, 22897]
    }]
     */

    ipm.db.dbname = db_name;
    db.get_rows(ipm, sql, function (rows) {
         debugger;
        if (rows.length > 0) {
           
          //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
            var strMustache1 = '{{#.}}';
            strMustache1 += '"{{gps_datetime}}"';
            strMustache1 += ',';
            strMustache1 += '{{/.}}';

            var strMustache2 = '{{#.}}';
            strMustache2 += '{{speed}}';
            strMustache2 += ',';
            strMustache2 += '{{/.}}';

            var strMustache3 = '{{#.}}';
            strMustache3 += '"{{tloc}}"';
            strMustache3 += ',';
            strMustache3 += '{{/.}}';

            var strMustache4 = '{{#.}}';
            strMustache4 += '"{{eloc}}"';
            strMustache4 += ',';
            strMustache4 += '{{/.}}';

            var result1 = mustache.render(strMustache1, rows);
            var result2 = mustache.render(strMustache2, rows);
            var result3 = mustache.render(strMustache3, rows);
            var result4 = mustache.render(strMustache4, rows);

            result1 = utl.iRmend(result1);
            result1 = '{ "name":"time","data":[' + result1 + '] }';
            result1 = result1.replace(/&quot;/g, '"');

            result2 = utl.iRmend(result2);
            result2 = '{ "speed":"xspeed","data":[' + result2 + '] }';
            result2 = result2.replace(/&quot;/g, '"');

            result3 = utl.iRmend(result3);
            result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
            result3 = result3.replace(/&quot;/g, '"');

            result4 = utl.iRmend(result4);
            result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
            result4 = result4.replace(/&quot;/g, '"');

            res.send('['+result1 +','+ result2+','+ result3+','+ result4+']');
        }
        else {
            res.send([]);
        }
    });
   
}

function utilization_vehicle_by_month(req, res)
{
    var db_name = req.body.fleetid; //'db_10001'; //
    var modem_id = req.body.modemid; //'1010002003';// 
    var start = req.body.start; // '2016-09';//
    var stop = req.body.stop; //'2016-09-09 23:59';//

    /* sample

SELECT COALESCE(SUM(timeuse),'0') as sum FROM rp_trip WHERE modem_id='1010005002' AND start_date >='2017-06-01 00:00' AND start_date <='2017-06-30 23:59'
 UNION ALL 
SELECT COALESCE(SUM(timeuse),'0') as sum  FROM rp_parking WHERE modem_id='1010005002' AND start_date >='2017-06-01 00:00' AND start_date <='2017-06-30 23:59'
 UNION ALL 
SELECT COALESCE(SUM(timeuse),'0') as sum  FROM rp_idleling WHERE modem_id='1010005002' AND start_date >='2017-06-01 00:00' AND start_date <='2017-06-30 23:59'
     */

    var sql = "";
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_trip WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);
    sql += " UNION ALL ";
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_parking WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);
    sql += " UNION ALL ";
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_idleling WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);

    debugger;
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
        if (rows.length > 0)
        {
            var run = parseInt(rows[0]['sum']);
            var park = parseInt(rows[1]['sum']);
            var idle = parseInt(rows[2]['sum']);
            var sum = run + park + idle;

            var prun = ((run / sum) * 100);

            var ppark = ((park / sum) * 100);

            var pidle = ((idle / sum) * 100);

            var result = [{
                  'running': prun, 'parking': ppark, 'ideling': pidle
                , 'total_running': HOUR(run), 'total_parking': HOUR(park), 'total_ideling': HOUR(idle)
            }];



            res.send(result);
            // console.log(rows);
        }
        else
        {
            res.send([]);
        }
    });
}

function new_utilization_vehicle(req, res)
{
    
    var db_name = req.body.fleetid; //'db_10001'; //
    var modem_id = req.body.modemid; //'1010002003';// 
    var start = req.body.start; // '2016-09';//
    var stop = req.body.stop; //'2016-09-09 23:59';//
   /*
    var db_name = 'db_10001'; //
    var modem_id ='1010002003';// 
    var start = req.body.start; // '2016-09';//
    var stop = req.body.stop; //'2016-09-09 23:59';//
    */

    var sql = "";
    sql += " WITH resx as ( ";
    sql += " SELECT date_trunc('day', dd):: date as datex ";
    sql += " FROM generate_series ";
    sql += "( to_char('"+start+"'::timestamp,'YYYY-MM-DD')::timestamp ";
    sql += "  , to_char('"+stop+"'::timestamp,'YYYY-MM-DD')::timestamp ";
    sql += "  , '1 day'::interval) dd ";
    sql += " ) ";
    
    sql += " SELECT idate(datex) as datetime ";
    sql += " ,fn_rp_trip_graph('"+modem_id+"',datex::varchar) as trip_timeuse ";
    sql += " ,fn_rp_parking_graph('"+modem_id+"',datex::varchar) as parking_timeuse ";
    sql += " ,fn_rp_idleling_graph('"+modem_id+"',datex::varchar) as idleling_timeuse ";
    sql += " FROM resx ";

    debugger;
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
        if (rows.length > 0)
        {
            res.send(rows);
        }else{
            res.send([]);
        }
    });
}

function status_vehicle(req, res)
{
    debugger;
    // Isauthenticate(req, res, function () {
    var db_name = req.body.fleetid; //'db_10001'; //
    var modem_id = req.body.modemid; //'1010001030';// 
    var start = req.body.start; // '2016-09-09 00:00';//
    var stop = req.body.stop; //'2016-09-09 23:59';//
    var tb_name = "ht_" + modem_id;

    //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
    var sql = "";
    if(db_name !='db_10036')
    {
        sql += " SELECT DISTINCT gps_datetime";
        // sql += ", CASE WHEN status ='1' THEN '#FC5050' WHEN status ='2' THEN '#F6EA27' WHEN status ='3' THEN '#ADCE59' END as status";
         sql += ",tambol||':'||amphur||':'||province as tloc ";
         sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
         sql += ",status";
         sql += " FROM " + tb_name;
         sql += " WHERE  gps_datetime >= " + utl.sqote(start);
         sql += " AND gps_datetime <=" + utl.sqote(stop);
         sql += " ORDER BY gps_datetime ";
    }
    else
    {
        sql += " SELECT DISTINCT gps_datetime";
        // sql += ", CASE WHEN status ='1' THEN '#FC5050' WHEN status ='2' THEN '#F6EA27' WHEN status ='3' THEN '#ADCE59' END as status";
         sql += ",tambol||':'||amphur||':'||province as tloc ";
         sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
         sql += ",CASE   WHEN CAST(analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as status";
         sql += " FROM " + tb_name;
         sql += " WHERE  gps_datetime >= " + utl.sqote(start);
         sql += " AND gps_datetime <=" + utl.sqote(stop);
         sql += " ORDER BY gps_datetime ";
    }
  
 
    //speed >0

    /*
    [{
    "name": "Month",
    "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }, {
        "name": "Revenue",
        "data": [23987, 24784, 25899, 25569, 25897, 25668, 24114, 23899, 24987, 25111, 25899, 23221]
    }, {
        "name": "Overhead",
        "data": [21990, 22365, 21987, 22369, 22558, 22987, 23521, 23003, 22756, 23112, 22987, 22897]
    }]
     */

    ipm.db.dbname = db_name;
    db.get_rows(ipm, sql, function (rows) {
        debugger;
        if (rows.length > 0) {

            //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
            var strMustache1 = '{{#.}}';
            strMustache1 += '"{{gps_datetime}}"';
            strMustache1 += ',';
            strMustache1 += '{{/.}}';

            var strMustache2 = '{{#.}}';
            strMustache2 += '{{status}}';
            strMustache2 += ',';
            strMustache2 += '{{/.}}';

            var strMustache3 = '{{#.}}';
            strMustache3 += '"{{tloc}}"';
            strMustache3 += ',';
            strMustache3 += '{{/.}}';

            var strMustache4 = '{{#.}}';
            strMustache4 += '"{{eloc}}"';
            strMustache4 += ',';
            strMustache4 += '{{/.}}';

            var result1 = mustache.render(strMustache1, rows);
            var result2 = mustache.render(strMustache2, rows);
            var result3 = mustache.render(strMustache3, rows);
            var result4 = mustache.render(strMustache4, rows);

            result1 = utl.iRmend(result1);
            result1 = '{ "name":"time","data":[' + result1 + '] }';
            result1 = result1.replace(/&quot;/g, '"');

            result2 = utl.iRmend(result2);
            result2 = '{ "status":"xstatus","data":[' + result2 + '] }';
            result2 = result2.replace(/&quot;/g, '"');

            result3 = utl.iRmend(result3);
            result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
            result3 = result3.replace(/&quot;/g, '"');

            result4 = utl.iRmend(result4);
            result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
            result4 = result4.replace(/&quot;/g, '"');

            res.send('[' + result1 + ',' + result2 + ',' + result3 + ',' + result4 + ']');
        }
        else {
            res.send([]);
        }
    });
 }


function utilization_test(req, res)
{
    var db_name = 'db_10005'; //req.body.fleetid; //
    var modem_id = '1010005002';// req.body.modemid; //
    var start = '2017-06-01 00:00';// req.body.start; // 
    var stop = '2017-06-30 23:59';//req.body.stop; //

    /* sample

SELECT SUM(timeuse) FROM rp_trip WHERE modem_id='1010005002' AND start_date >='2017-06-01 00:00' AND start_date <='2017-06-30 23:59'
 UNION ALL 
SELECT COALESCE(SUM(timeuse),'0')  FROM rp_parking WHERE modem_id='1010005002' AND start_date >='2017-06-01 00:00' AND start_date <='2017-06-30 23:59'
 UNION ALL 
SELECT COALESCE(SUM(timeuse),'0')  FROM rp_idleling WHERE modem_id='1010005002' AND start_date >='2017-06-01 00:00' AND start_date <='2017-06-30 23:59'
 
     */

    var sql = "";
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_trip WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);
    sql += " UNION ALL ";
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_parking WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);
    sql += " UNION ALL ";
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_idleling WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);

    debugger;
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        debugger;
        if (rows.length > 0) {
            var run = parseInt(rows[0]['sum']);
            var park = parseInt(rows[1]['sum']);
            var idle = parseInt(rows[2]['sum']);
            var sum = run + park + idle;

            var prun = ((run / sum) * 100);

            var ppark = ((park / sum) * 100);

            var pidle = ((idle / sum) * 100);

            var result = [{
                'running': prun, 'parking': ppark, 'ideling': pidle
                , 'total_running': HOUR(run), 'total_parking': HOUR(park), 'total_ideling': HOUR(idle)
            }];



            res.send(result);
            // console.log(rows);
        }
        else {
            res.send([]);
        }
    });
}


exports.track_speed = track_speed;
exports.status_vehicle = status_vehicle;
exports.utilization_vehicle_by_month = utilization_vehicle_by_month;
exports.new_utilization_vehicle = new_utilization_vehicle;

exports.utilization_test = utilization_test;


    /*   
setTimeout(function () {
    //    debugger;
      //  track_speed('', '');
   // utilization_vehicle_by_month('', '');
   utilization_test('', '');
 }, 1000);
 */