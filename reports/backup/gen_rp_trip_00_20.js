
//#region modules
var schedule = require('node-schedule');
var timespan = require('timespan');
var async = require('async');
var moment = require('moment');
var squel = require("squel");
var mustache = require("mustache");

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var iBuildText = require('iGenTextFile.js');
var linq = require('linq.js');
var utl = require('Utility.js');
var irp = require('iReports.js');

var db_config = "master_config";
//https://jsonformatter.curiousconcept.com/

//#endregion


//#region structure
function driving_temp()
{
    this.modem_id = '';
    this.start_date = '';
    this.end_date = '';

    this.time_use = '';
    this.start_loc_th = '';
    this.end_loc_th = '';
    this.start_loc_en = '';
    this.end_loc_en = '';


    this.distance = 0;
    this.start_mile = 0;
    this.end_mile = 0;
    this.start_lonlat = '';
    this.end_lonlat = '';

    this.oil_level = 0;
    this.speed = 0;
}
//#endregion


//#region track report trip

function add_track_report_trip(para, callback) {
    var query = squel.insert()
        .into('track_rp_trip')
        .set('modem_id', para.modem_id)
        .set('date_report', para.date_gen_report)
        .set('start_process', irp.timenow())
        .set('message', para.message)
        .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, query, function (response) {
        if (response == 'oK') {
            var sql = "SELECT id FROM track_rp_trip ORDER BY id DESC LIMIT 1";
            db.get_rows(ipm, sql, function (row) {
                if (row.length > 0) {
                    var id = row[0].id
                    callback(id);
                    return;
                }
            });
        } else {
            callback(0);
            return;
        }

    });
}

function set_track_report_trip(para, callback) {
    debugger;
    var query = squel.update()
       .table('track_rp_trip')
       .set('end_process', irp.timenow())
       .set('message', para.message)
       .set('is_complete', para.complete)
      .where('id = ' + utl.sqote(para.id))
      .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, query, function (response) {
        if (response == 'oK') {
            callback(response);
            return;
        }
        else {
            callback([]);
            return;
        }
    });
}

function set_track_report(para, callback)
{
    set_track_report_trip(para, function (xres)
    {
        if (xres == 'oK') {
            callback(xres);
            return;
        } else {
            callback([]);
            return;
        }
    });
}

//#endregion


//#region spacial algorithm
function get_engine_start_first(para,callback)
{

    //#region
    /*
   SELECT gps_datetime,speed,status,message_id
 FROM ht_1010001002 
WHERE gps_datetime >='2016-06-24 00:00' 
AND gps_datetime <='2016-06-24 23:59' 
AND satelites >'0'
AND message_id ='11'
ORDER BY gps_datetime DESC
LIMIT 1
     */
//#endregion

    //,speed,status,message_id
   // debugger;
    var tb_name = 'ht_' + para.modem_id
    var date_process = moment(para.date_gen_report).subtract(1, "days").format("YYYY-MM-DD");
    var start_date = date_process + ' 00:00';
    var end_date = date_process + ' 23:59';
    var sql = ' ';
    sql += " SELECT idate(gps_datetime) as gps_datetime,mileage,lon||','||lat as lonlat,tambol||':'||amphur||':'||province as locations_th,etambol||':'||eamphur||':'||eprovince as locations_en  FROM " + tb_name;
    sql += " WHERE gps_datetime >="+utl.sqote(start_date);
    sql += " AND gps_datetime <=" + utl.sqote(end_date);
    sql += " AND satelites >'0' AND message_id ='11' ";
    sql += " ORDER BY gps_datetime DESC LIMIT 1 ";

    ipm.db.dbname = para.db_name;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            // var res = rows[0]['gps_datetime'];
           // debugger;
            callback(rows);
            return;
        }
        else
        {
            console.log('empty data');
            callback([]);
            return;
        
        }
    });
}

function is_start_engine_overnight(para,start_first, callback)
{
    //#region
    /*
     SELECT COUNT(speed) FROM ht_1010001002 
WHERE gps_datetime >='2016-06-25 00:00' 
AND gps_datetime <='2016-06-25 07:07:40'  
AND speed > 0
     */
    //#endregion

    var tb_name = 'ht_' + para.modem_id
    var dt_process = para.date_gen_report + ' 00:00'
    var sql = ' ';
    sql += " SELECT COUNT(speed) FROM " + tb_name;
    sql += " WHERE gps_datetime >="+utl.sqote(dt_process);
    sql += " AND gps_datetime <=" + utl.sqote(start_first) + " AND speed > 0  ";

    ipm.db.dbname = para.db_name;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
          //  debugger;
            if (rows[0]['count'] > 0)
            {
                get_engine_start_first(para, function (xres)
                {
                   // debugger;
                    callback(xres);
                    return;
                });

            }
            else {
                callback([]);
                return;
            }
        }
        else {
            console.log('empty data');
            callback([]);
            return;
        }
    });
}

function ical_distance(lonlat_start,lonlat_end) {
    var r = utl.Split(lonlat_start, ',');
    var n = utl.Split(lonlat_end, ',');
    return irp.cal_distance(r[0], r[1], n[0], n[1]);
   // return res;
}

    //#endregion

function has_table(modem_id,db_name,callback)
{
    /*
    SELECT EXISTS (
   SELECT 1
   FROM   information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name = 'ht_142181053379'
   );
    */

  var sql="  SELECT EXISTS ( ";
  sql+="  SELECT 1 ";
  sql+="  FROM   information_schema.tables ";
  sql+="  WHERE  table_schema = 'public' ";
  sql+="  AND    table_name = 'ht_"+modem_id+"' ";
  sql+="  ) ";

  ipm.db.dbname = db_name;
  db.get_rows(ipm, sql, function (res_db)
  {
      debugger;
      //  console.log(res_db[0].exists)
        callback(res_db[0].exists)
        return;
  });

}

function get_data(para, callback)
{
    var tb_name = 'ht_' + para.modem_id
  //  var start_date = date_process + ' 00:00';
  //  var end_date = date_process + ' 23:59';

    var sql = ' ';
    sql += " SELECT idate(gps_datetime) as gps_datetime,mileage,speed,status,message_id ";
    sql += " ,lon||','||lat as lonlat,tambol||':'||amphur||':'||province as locations_th,etambol||':'||eamphur||':'||eprovince as locations_en FROM " + tb_name;
    sql += " WHERE gps_datetime >=" + utl.sqote(para.start_time) + "  AND gps_datetime <="+utl.sqote(para.end_time);
    sql += " AND message_id in('11','193')  ORDER BY gps_datetime ASC ";

    var start_first = true;
    var res_ar = [];
    var i = 1;

    ipm.db.dbname = para.db_name;
    db.get_rows(ipm, sql, function (rows)
    {
        if (rows.length > 0)
        {
            //callback(rows);
            //return;
            async.eachSeries(rows, function (row, next)
            {
                var temp = new driving_temp();
       

                var cur_gps_datetime = row.gps_datetime;
                var cur_mileage = row.mileage;
                var cur_lonlat = row.lonlat;
                var cur_modem_id = para.modem_id;
                var cur_loc_th = row.locations_th;
                var cur_loc_en = row.locations_en;

                if (start_first)
                {
                    start_first = false;
                    is_start_engine_overnight(para, row.gps_datetime, function (xfirst)
                    {
                        if (xfirst.length > 0)
                        {
                            var first_time = xfirst[0]['gps_datetime'];

                            temp.start_lonlat = xfirst[0]['lonlat'];
                            temp.end_lonlat = cur_lonlat;
                            temp.start_mile = xfirst[0]['mileage'];
                            temp.end_mile = cur_mileage;


                            temp.modem_id = cur_modem_id;
                            temp.start_date = first_time;
                            temp.end_date = cur_gps_datetime;

                            temp.time_use = irp.diff_min(first_time, cur_gps_datetime);
                            temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                          //  temp.oil_level = (temp.distance / para.oil_level).toFixed(3);

                            temp.start_loc_th = xfirst[0]['locations_th'];
                            temp.end_loc_th = cur_loc_th;

                            temp.start_loc_en = xfirst[0]['locations_en'];
                            temp.end_loc_en = cur_loc_en;

                            res_ar.push(temp);
                            i++;
                            next();

                        }
                        else
                        {
                            i++;
                            next();
                        }
                    });

                }
                else
                {
                    debugger;
                    if (i <= rows.length-1)
                    {
                        var next_gps_datetime = rows[i]['gps_datetime'];
                        var next_mileage = rows[i]['mileage'];
                        var next_lonlat = rows[i]['lonlat'];
                        var next_loc_th = rows[i]['locations_th'];
                        var next_loc_en = rows[i]['locations_en'];


                        temp.start_lonlat = cur_lonlat;
                        temp.end_lonlat = next_lonlat;

                        temp.start_mile = cur_mileage;
                        temp.end_mile = next_mileage;


                        temp.modem_id = cur_modem_id;
                        temp.start_date = cur_gps_datetime;
                        temp.end_date = next_gps_datetime;

                        temp.time_use = irp.diff_min(cur_gps_datetime, next_gps_datetime);
                        temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                      //  temp.oil_level = (temp.distance / para.oil_level).toFixed(3);
                        //(temp.end_mile - temp.start_mile).toFixed(2);

                        temp.start_loc_th = cur_loc_th;
                        temp.end_loc_th = next_loc_th;

                        temp.start_loc_en = cur_loc_en;
                        temp.end_loc_en = next_loc_en;

                        res_ar.push(temp);

                        i++;
                        next();
                    }
                    else
                    {
                      
                       // debugger;
                        console.log('fin ' + i);
                        next();
                    }

                }

            }, function ()
            {
               // debugger;
                console.log('finish');
                var x_res = linq.Enumerable.From(res_ar)
                .Where(function (x) { return parseFloat(x.distance) > '0.0' })
                .ToArray();

             //  iBuildText.build_text('c:\\trip_report2.txt', JSON.stringify(x_res))
                // console.log(JSON.parse(res_ar));
                if (x_res.length > 0) 
                {
                    add_report_trip(para.id, x_res, function (xrr) 
                    {
                        callback(xrr);
                        return
                    });
                }
                else
                {
                    debugger;
                    para.complete = 1;
                    para.message = 'filter distance data = zero length cal ' + res_ar.length;
                    set_track_report_trip(para, function (xres)
                    {
                        console.log(para.message);
                        if (xres == 'oK') {
                            callback([]);
                            return;
                        }
                    });
                   
                }
            });
        }
        else
        {

            var xpara = { 'id': para.id, 'message': 'no data', 'complete': 0 };
            set_track_report(xpara, function (xres) {
                callback(xres);
                return
            });
        }
    });

}

function add_report_trip(id, res, callback)
{
    debugger;
    var strMustache = '{{#.}}';
    strMustache += "('{{modem_id}}','{{start_date}}','{{end_date}}','{{start_loc_th}}','{{end_loc_th}}','{{start_loc_en}}','{{end_loc_en}}' ";
    strMustache += ",'{{start_mile}}','{{end_mile}}','{{distance}}','{{time_use}}','{{start_lonlat}}','{{end_lonlat}}'";
    strMustache += "),";
    strMustache += '{{/.}}';

    var result_val = mustache.render(strMustache, res);
    result_val = utl.iRmend(result_val);
    var sql = " INSERT INTO rp_trip(modem_id,start_date,end_date,start_loc_th,end_loc_th,start_loc_en,end_loc_en";
    sql += ",start_mile,end_mile,distance,timeuse,start_lonlat,end_lonlat) VALUES " + result_val;


    //  iBuildText.build_text('c:\\sql_x.txt', sql)
    
    if (res.length > 0)
    {
        var para = { 'id': id, 'message': '', 'complete': 0 };

        ipm.db.dbname = db_config;
        db.excute(ipm, sql, function (response) {
            if (response == 'oK') {
                para.complete = 1;
                para.message = response;
                set_track_report_trip(para, function (xres) {
                    if (xres == 'oK') {
                        callback(xres);
                        return;
                    }
                });
            }
            else {

                para.complete = 0;
                para.message = response;
                set_track_report_trip(para, function (xres) {
                    if (xres == 'oK') {
                        callback([]);
                        return;
                    }
                });
            }
        });
    }
    else
    {
        console.log('empty data');
        callback([]);
        return;
    }
}

function start(date_gen_report) 
{

    // var date_gen_report = '2016-07-02'; //WHERE modem_id IN ('1010006001','1010006002','1010006003') 
    // WHERE db_name='db_10004'
    var sql = "SELECT modem_id,db_name,speedmax,track_every,oil_level  FROM master_config_vehicle WHERE modem_id not like '%14218%'  ORDER BY modem_id  ";
    //WHERE modem_id= '1110011086' ORDER BY modem_id
    console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());

    //var date_gen_report = '2016-06-25';
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) {
        if (res.length > 0) {
            async.eachSeries(res, function (row, next) {
                //   debugger;
                // console.log(row);
                var para = { 'id': 1, 'db_name': row.db_name, 'modem_id': row.modem_id, 'start_time': date_gen_report + ' 00:00', 'end_time': date_gen_report + ' 23:59', 'date_gen_report': date_gen_report, 'message': '', 'oil_level': row.oil_level }

                add_track_report_trip(para, function (xid) {
                    para.id = xid;

                    has_table(para.modem_id,para.db_name,function(has_table)
                    {
                        if(has_table)
                        {
                            get_data(para, function (xres) 
                            {
                                if (xres != null) 
                                {
                                    next();
                                    console.log(xres+' '+ row.modem_id);
                                }
                                else 
                                {
                                    next();
                                    console.log('ielse ' + xres+' '+ row.modem_id);
                                }

                            });
                       }
                       else
                       {
                        console.log('no table on ' +para.db_name);
                        next();
                       }
                    });
                });


            }, function () {
                console.log('finish master');
            });
        } else {
            console.log('empty data'+' '+ row.modem_id);
        }
    });

}

//#region job start at 00:20

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00;
rule.minute = 20;

schedule.scheduleJob(rule, function () {
 

    //var date_gen_report = moment().format("YYYY-MM-DD");
    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    start(date_gen_report);

});

    //#endregion


//#region test

//start('2019-03-01');
/*
setTimeout(function ()
{
    //get_engine_start_first('db_10001', '1010001002', '2016-06-25', function (xres) {
    //    debugger;
    //    console.log(xres);
    //});
    start('2019-02-01');

}, 1000);

*/

//#endregion

//#region
    /*
    
function coutPage(Row, valueDev) {
    debugger;
    Row = parseInt(Row);
    var count_Dev = parseInt(Row / valueDev);
    var count_Mod = Row % valueDev;

    if (count_Mod > 0) {
        Row = parseInt(count_Dev + 1);
    }
    else
    {
        if (count_Mod == 0) {
            Row = 1;
        }
        else {
            Row = Row;
        }
    }
    var res = { 'total_page': count_Dev, 'row_per_page': valueDev, 'last_page': count_Mod }
    return res;
}

function start2()
{
    console.log(coutPage(24, 10));
}

      SELECT gps_datetime,lon,lat,speed,status,satelites,altitude
,message_id,analog_input1,analog_input2
,mileage,tambol,amphur,province
,heading
 FROM ht_1010001002 
WHERE gps_datetime >='2016-06-23 00:00' 
AND gps_datetime <='2016-06-23 23:59' 
--AND status ='1' 
AND satelites >'0'
AND message_id ='11'
 */
//#endregion

