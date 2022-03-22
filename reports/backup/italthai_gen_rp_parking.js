
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
    this.speed_st = '';

    this.distance = 0;
    this.start_mile = 0;
    this.end_mile = 0;
    this.start_lonlat = '';
    this.end_lonlat = '';
}
//#endregion

//#region track report

function add_track_report_parking(para,callback)
{
    var query = squel.insert()
        .into('track_rp_parking')
        .set('modem_id', para.modem_id)
        .set('date_report', para.date_gen_report)
        .set('start_process', irp.timenow())
        .set('message', para.message)
        .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            var sql = "SELECT id FROM track_rp_parking ORDER BY id DESC LIMIT 1";
            db.get_rows(ipm, sql, function (row)
            {
                if (row.length > 0)
                {
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

function set_track_report_parking(para, callback)
{
    var query = squel.update()
       .table('track_rp_parking')
       .set('end_process', irp.timenow())
       .set('message', para.message)
       .set('is_complete', para.complete)
      .where('id = ' + utl.sqote(para.id))
      .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            callback(response);
            return;
        }
        else {
            callback([]);
            return;
        }
    });
}

function set_track_report(para, callback) {
    set_track_report_parking(para, function (xres) {
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

function get_data(para,callback) 
{
    try
    {
        var sql = ' ';
        sql += " SELECT DISTINCT to_char(gps_datetime :: TIMESTAMP, 'YYYY-MM-DD HH24:MI') AS gps_datetime,lon||','||lat as lonlat,speed,mileage,tambol||':'||amphur||':'||province as locations_th,etambol||':'||eamphur||':'||eprovince as locations_en FROM ht_" + para.modem_id + " ";
        sql += " WHERE gps_datetime::TIMESTAMP >=" + utl.sqote(para.start_time) + " AND gps_datetime::TIMESTAMP <=" + utl.sqote(para.end_time) + " ";
        sql += " AND status = '1' AND satelites > 0 ORDER BY gps_datetime  "

        var res_ar = [];
        var is_open = true;
        var mintrack = 1;

        //comment for future track secound
        /*
        if (para.track_every >= 60)
        {
           mintrack = para.track_every = para.track_every / 60
        }
        */



        ipm.db.dbname = para.db_name;
        db.get_rows(ipm, sql, function (res_db)
        {
            debugger;
            if (res_db.length > 0) {

                var end_loop = res_db.length;

                for (var i = 0; i < end_loop; i++)
                {
                    if (i != end_loop - 1)
                    {
                        var i_next = i + 1;

                        var cur_dt = res_db[i]['gps_datetime'];
                        var next_dt = res_db[i_next]['gps_datetime'];
                        var cur_lonlat = res_db[i]['lonlat'];


                        var cur_mile = res_db[i]['mileage'];
                        var cur_speed = res_db[i]['speed'];
                        var cur_loc_th = res_db[i]['locations_th'];
                        var cur_loc_en = res_db[i]['locations_en'];

                        var res_diff = irp.diff_min(cur_dt, next_dt);//diff_min(cur_dt, next_dt);


                        //#region

                        if (res_diff > mintrack) 
                        {
                            if (i == 0) 
                            {
                                var temp = new driving_temp();
                                temp.modem_id = para.modem_id;
                                temp.speed_st = para.speed_max;

                                temp.start_date = cur_dt;
                                temp.end_date = cur_dt;
                                temp.avg_speed = cur_speed;
                                temp.max_speed = cur_speed;
                                temp.start_loc_th = cur_loc_th;
                                temp.end_loc_th = cur_loc_th;
                                temp.start_loc_en = cur_loc_en;
                                temp.end_loc_en = cur_loc_en;
                                temp.time_use = 0;//diff_min(cur_dt, next_dt);
                                temp.start_lonlat = cur_lonlat;
                                temp.end_lonlat = cur_lonlat;
                                res_ar.push(temp);
                            }
                            else
                            {
                                if (is_open == false) {


                                    temp.end_date = cur_dt;
                                    temp.end_loc_th = cur_loc_th;
                                    temp.end_loc_en = cur_loc_en;
                                    temp.time_use = irp.diff_min(temp.start_date, temp.end_date); // diff_min(temp.start_date, temp.end_date);
                                    temp.end_mile = cur_mile;
                                    temp.distance = (temp.end_mile - temp.start_mile).toFixed(2);
                                    temp.end_lonlat = cur_lonlat;


                                    //  debugger;
                                    if (i_next < end_loop - 1) {
                                        var next_2 = res_db[i_next + 1]['gps_datetime'];

                                        irp.is_continute(next_dt, next_2, function (is_cont) {
                                            if (is_cont == false) {
                                                var temp = new driving_temp();
                                                temp.modem_id = para.modem_id;
                                                temp.speed_st = para.speed_max;

                                                temp.start_date = next_dt;
                                                temp.end_date = next_dt;
                                                temp.start_lonlat = res_db[i_next]['lonlat'];
                                                temp.end_lonlat = temp.start_lonlat;
                                                temp.max_speed = res_db[i_next]['speed'];
                                                temp.avg_speed = temp.max_speed
                                                temp.start_loc_th = res_db[i_next]['locations_th'];
                                                temp.end_loc_th = temp.start_loc_th;
                                                temp.start_loc_en = res_db[i_next]['locations_en'];
                                                temp.end_loc_en = temp.start_loc_en;
                                                temp.time_use = 0;
                                                res_ar.push(temp);
                                            }
                                        });

                                        is_open = true;
                                    } else {
                                        debugger;
                                        console.log('stop ' + i_next);
                                        // iBuildText.build_text('c:\\over_speed8.txt', JSON.stringify(res_ar))
                                    }
                                }
                            }
                        }
                        else {
                            if (is_open) {
                                var temp = new driving_temp();
                                temp.modem_id = para.modem_id;
                                temp.speed_st = para.speed_max;
                                temp.lonlat = cur_lonlat;

                                temp.start_date = cur_dt;
                                temp.start_loc_th = cur_loc_th;
                                temp.start_loc_en = cur_loc_en;
                                temp.start_mile = cur_mile;
                                temp.start_lonlat = cur_lonlat;

                                res_ar.push(temp);
                                is_open = false;
                            }
                        }

                        //#endregion


                    }
                    else {
                       // debugger;
                        if (res_ar.length > 0)
                        {
                            console.log('finish');
                            var idx_last = res_ar.length - 1;
                            if (res_ar[idx_last].end_date == '') {
                                debugger;
                                var i = end_loop - 1;
                                var next_dt = res_db[i]['gps_datetime'];
                                var cur_mile = res_db[i]['mileage'];
                                var cur_speed = res_db[i]['speed'];
                                var cur_loc_th = res_db[i]['locations_th'];
                                var cur_loc_en = res_db[i]['locations_en'];
                                var res_diff = irp.diff_min(cur_dt, next_dt); //diff_min(cur_dt, next_dt);
                                temp.end_lonlat = res_db[i]['lonlat'];

                                temp.end_date = next_dt;
                                temp.end_loc_th = cur_loc_th;
                                temp.end_loc_en = cur_loc_en;
                                temp.time_use = irp.diff_min(temp.start_date, temp.end_date); // diff_min(temp.start_date, temp.end_date);
                                temp.end_mile = cur_mile;
                                temp.distance = (temp.end_mile - temp.start_mile).toFixed(2);


                                add_report_parking(para.id, res_ar, function (xrr) {
                                    callback(xrr);
                                    return
                                });
                            }
                            else {
                                // 
                                add_report_parking(para.id, res_ar, function (xrr) {
                                    callback(xrr);
                                    return
                                });
                                //  console.log(JSON.stringify(res_ar));

                            }
                        } else {
                            console.log('no data');
                     
                            var xpara = { 'id': para.id, 'message': 'no data', 'complete': 0 };
                            set_track_report(xpara, function (xres) {
                                callback(xres);
                                return
                            });
                        }

                    }
                }

            } else {
                console.log('no data2');
                var xpara = { 'id': para.id, 'message': 'no data2', 'complete': 0 };
                set_track_report(xpara, function (xres) {
                    callback(xres);
                    return
                });
            }

        });

    }
    catch (er)
    {
        debugger;
        console.log(er);
        callback([]);
        return
    }
}

function add_report_parking(id,res, callback) {
    debugger;

    var x_res = linq.Enumerable.From(res)
        .Where(function (x) { return parseInt(x.time_use) > 0 })
        .ToArray();

    var strMustache = '{{#.}}';
    strMustache += "('{{modem_id}}','{{start_date}}','{{end_date}}','{{start_loc_th}}','{{end_loc_th}}','{{start_loc_en}}','{{end_loc_en}}' ";
    strMustache += ",'{{start_mile}}','{{end_mile}}','{{distance}}','{{time_use}}','{{start_lonlat}}','{{end_lonlat}}'";
    strMustache += "),";
    strMustache += '{{/.}}';

    var result_val = mustache.render(strMustache, x_res);
    result_val = utl.iRmend(result_val);
    var sql = " INSERT INTO rp_parking(modem_id, start_date, end_date,start_loc_th,end_loc_th,start_loc_en,end_loc_en";
    sql += ",start_mile,end_mile,distance,timeuse,start_lonlat,end_lonlat) VALUES " + result_val;

    if (x_res.length > 0) {
        //  iBuildText.build_text('c:\\sql_x.txt', sql)

        var para = { 'id': id, 'message': '', 'complete': 0 };

        /*  */
        ipm.db.dbname = db_config;
        db.excute(ipm, sql, function (response) {
            if (response == 'oK') {
                para.complete = 1;
                para.message = response;
                set_track_report_parking(para, function (xres) {
                    if (xres == 'oK') {
                        callback(xres);
                        return;
                    }
                });
            }
            else {

                para.complete = 0;
                para.message = response;
                set_track_report_parking(para, function (xres) {
                    if (xres == 'oK') {
                        callback([]);
                        return;
                    }
                });
            }
        });
    }
    else {
        console.log('empty data');
        callback([]);
        return;
    }
  
}

function start(date_gen_report)
{
    console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());
    //  var sql = "SELECT modem_id,db_name,'"+date_process+"' as date_process  FROM master_config_vehicle WHERE db_name='db_10036' ";
        //var date_gen_report = '2016-06-25';
        var sql = "SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle WHERE db_name='db_10036'  ORDER BY modem_id";
        
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (res) {
            if (res.length > 0) {
                async.eachSeries(res, function (row, next) {
                    debugger;
                    // console.log(row);
                    var para = { 'id': 1, 'db_name': row.db_name, 'modem_id': row.modem_id, 'speed_max': row.speedmax, 'track_every': row.track_every, 'start_time': date_gen_report + ' 00:00', 'end_time': date_gen_report + ' 23:59', 'date_gen_report': date_gen_report, 'message': '' }
    
                    add_track_report_parking(para, function (xid) {
                        para.id = xid;
                        has_table(para.modem_id,para.db_name,function(has_table)
                        {
                            if(has_table)
                            {
                              get_data(para, function (xres)
                             {
                              if (xres != null) {
                                next();
                                console.log(xres);
                               } else {
                                next();
                                console.log('ielse ' + xres);
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
    
    
                });
            } else {
                console.log('empty data');
            }
        });
}

//#region job start at 00:30

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00;
rule.minute = 30;


schedule.scheduleJob(rule, function ()
{
   // console.log('Harvester Midnight This runs at 23:59 every day.');

    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    start(date_gen_report);
});

//#endregion

//#region Test

function start_manual(date_gen_report,callback)
{
   // var date_gen_report = '2020-10-14';  
    //var sql = "SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle WHERE db_name='db_10034'  ORDER BY modem_id";
    var sql = "SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle WHERE db_name='db_10036' AND modem_id='143200385206' ORDER BY modem_id";
   
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {
                debugger;
                // console.log(row);
                var para = { 'id': 1, 'db_name': row.db_name, 'modem_id': row.modem_id, 'speed_max': row.speedmax, 'track_every': row.track_every, 'start_time': date_gen_report + ' 00:00', 'end_time': date_gen_report + ' 23:59', 'date_gen_report': date_gen_report, 'message': '' }

                add_track_report_parking(para, function (xid) {
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
                                    console.log(xres);
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
                callback(true);
                return;
            });
        } else {
            console.log('empty data');
            callback(true);
            return;
        }
    });

}

var datetimer_start =17;
function doit()
{
    var start_date = '2020-11-'+datetimer_start;
    start_manual(start_date,function(is_fin)
    {
        if(is_fin)
        {
            if(datetimer_start < 19)
            {
                console.log(datetimer_start);
                datetimer_start++;
                doit();
            }
            else
            {
               
               console.log('fin');
            }
           
        }
    });
}

//doit();

/*
setTimeout(function () {

    // var para = { 'db_name': 'db_10001', 'modem_id': '1010001004', 'speed_max': 80, 'track_every': 60, 'start_time': '2016-06-21 00:00', 'end_time': '2016-06-21 23:59' }
    //WHERE modem_id='1010001004'
    start();
}, 1000);

 */
//#endregion

//#region
/*
SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle ORDER BY modem_id

 WHERE CONVERT(VARCHAR(10),DateTime,20)='''+@StartDate+'''
AND (ReportID = 101 OR Status >1) AND Satellite > 0 AND Mileage <> 0
ORDER BY DateTime'
SELECT gps_datetime,lat,lon,status
 FROM ht_1010001001
WHERE modem_id='1010001001'
AND gps_datetime>='2016-06-21 00:00'
AND gps_datetime <='2016-06-22 23:59'
AND (message_id = '101' OR status >'1')
 AND satelites > 0 AND mileage <> 0
 */
//#endregion