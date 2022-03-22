
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
var min_idle = 1;

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
    this.lonlat = '';
}

//#endregion

//#region track process

function add_track_report_idleling(para, callback)
{
    var query = squel.insert()
        .into('track_rp_idleling')
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
            var sql = "SELECT id FROM track_rp_idleling ORDER BY id DESC LIMIT 1";
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

function set_track_report_idleling(para, callback)
{
    var query = squel.update()
       .table('track_rp_idleling')
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
    set_track_report_idleling(para, function (xres) {
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


function get_data(para,callback) 
{
    try
    {
        var quer_filter_is_driving = '';

        quer_filter_is_driving = " SELECT COUNT(speed) FROM ht_" + para.modem_id + " 	WHERE gps_datetime >=" + utl.sqote(para.start_time) + "	AND gps_datetime <=" + utl.sqote(para.end_time) + " AND status ='3' ";

        var sql = ' ';
        sql += " SELECT idate(gps_datetime) as gps_datetime,lon||','||lat as lonlat,tambol||':'||amphur||':'||province as locations_th,etambol||':'||eamphur||':'||eprovince as locations_en FROM ht_" + para.modem_id + " ";
        sql += " WHERE gps_datetime >=" + utl.sqote(para.start_time) + " AND gps_datetime <=" + utl.sqote(para.end_time) + " ";
        sql += "  AND status = '2' AND satelites > 0 ";
        sql += " AND (" + quer_filter_is_driving + ") > 0";
        sql += " ORDER BY gps_datetime  "

        var res_ar = [];
        var is_open = true;
     

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
            if (res_db.length > 0)
            {

                var end_loop = res_db.length;

                for (var i = 0; i < end_loop; i++)
                {
                    if (i != end_loop - 1)
                    {
                        var i_next = i + 1;

                        var cur_dt = res_db[i]['gps_datetime'];
                        var next_dt = res_db[i_next]['gps_datetime'];

                        var cur_lonlat = res_db[i]['lonlat'];
                        var cur_loc_th = res_db[i]['locations_th'];
                        var cur_loc_en = res_db[i]['locations_en'];
                        var res_diff = irp.diff_min(cur_dt, next_dt); // diff_min(cur_dt, next_dt);


                        //#region

                        if (res_diff > min_idle)
                        {
                            if (i == 0)
                            {
                                var temp = new driving_temp();
                                temp.modem_id = para.modem_id;
                                temp.start_date = cur_dt;
                                temp.end_date = cur_dt;
                                temp.start_loc_th = cur_loc_th;
                                temp.end_loc_th = cur_loc_th;
                                temp.start_loc_en = cur_loc_en;
                                temp.end_loc_en = cur_loc_en;
                                temp.time_use = 0;//diff_min(cur_dt, next_dt);
                                temp.lonlat = cur_lonlat;
                                res_ar.push(temp);
                            }
                            else
                            {
                                if (is_open == false)
                                {
                                    temp.end_date = cur_dt;
                                    temp.end_loc_th = cur_loc_th;
                                    temp.end_loc_en = cur_loc_en;
                                    temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                    temp.lonlat = cur_lonlat;


                                    //  debugger;
                                    if (i_next < end_loop - 1)
                                    {
                                        var next_2 = res_db[i_next + 1]['gps_datetime'];

                                        irp.is_continute(next_dt, next_2, function (is_cont)
                                        {
                                            if (is_cont == false)
                                            {
                                                var temp = new driving_temp();
                                                temp.modem_id = para.modem_id;


                                                temp.start_date = next_dt;
                                                temp.end_date = next_dt;
                                                temp.lonlat = res_db[i_next]['lonlat'];
                                                temp.start_loc_th = res_db[i_next]['locations_th'];
                                                temp.end_loc_th = temp.start_loc_th;
                                                temp.start_loc_en = res_db[i_next]['locations_en'];
                                                temp.end_loc_en = temp.start_loc_en;
                                                temp.time_use = 0;
                                                res_ar.push(temp);
                                            }
                                        });

                                        is_open = true;
                                    }
                                    else {
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
                                temp.start_date = cur_dt;
                                temp.start_loc_th = cur_loc_th;
                                temp.start_loc_en = cur_loc_en;
                                temp.lonlat = cur_lonlat;

                                res_ar.push(temp);
                                is_open = false;
                            }
                        }

                        //#endregion


                    }
                    else
                    {
                        debugger;
                        if (res_ar.length > 0)
                        {
                            console.log('finish');
                            var idx_last = res_ar.length - 1;
                            if (res_ar[idx_last].end_date == '')
                            {
                                debugger;
                                var i = end_loop - 1;
                                var next_dt = res_db[i]['gps_datetime'];

                                var cur_loc_th = res_db[i]['locations_th'];
                                var cur_loc_en = res_db[i]['locations_en'];
                                var res_diff = irp.diff_min(cur_dt, next_dt);//diff_min(cur_dt, next_dt);

                                temp.lonlat = res_db[i]['lonlat'];
                                temp.end_date = next_dt;
                                temp.end_loc_th = cur_loc_th;
                                temp.end_loc_en = cur_loc_en;
                                temp.time_use = irp.diff_min(temp.start_date, temp.end_date);// diff_min(temp.start_date, temp.end_date);

                                var x_res = linq.Enumerable.From(res_ar)
                                .Where(function (x) { return x.time_use >= 1 })
                                .ToArray();

                                add_report_idleling(para.id, x_res, function (xrr) {
                                    callback(xrr);
                                    return
                                });
                            }
                            else
                            {
                                // 


                                var x_res = linq.Enumerable.From(res_ar)
                                .Where(function (x) { return x.time_use >= 1 })
                                .ToArray();

                                debugger;
          
                                add_report_idleling(para.id, x_res, function (xrr)
                                {
                                    callback(xrr);
                                    return
                                });
                       
                            }
                        }
                        else
                        {
                            console.log('no data');
                            var xpara = { 'id': para.id, 'message': 'no data', 'complete': 0 };
                            set_track_report(xpara, function (xres) {
                                callback(xres);
                                return
                            });
                        }

                    }
                }

            }
            else
            {
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



function add_report_idleling(id, res, callback)
{
    debugger;
    var strMustache = '{{#.}}';
    strMustache += "('{{modem_id}}','{{start_date}}','{{end_date}}','{{start_loc_th}}','{{end_loc_th}}','{{start_loc_en}}','{{end_loc_en}}'";
    strMustache += ",'{{time_use}}','{{lonlat}}'";
    strMustache += "),";
    strMustache += '{{/.}}';

    var result_val = mustache.render(strMustache, res);
    result_val = utl.iRmend(result_val);
    var sql = " INSERT INTO rp_idleling(modem_id, start_date, end_date,start_loc_th,end_loc_th,start_loc_en,end_loc_en,timeuse,lonlat) VALUES " + result_val;


  //  iBuildText.build_text('c:\\sql_x.txt', sql)
    if (res.length > 0)
    {
    var para = { 'id': id, 'message': '', 'complete': 0 };

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (response) {
        if (response == 'oK') {
            para.complete = 1;
            para.message = response;
            set_track_report_idleling(para, function (xres) {
                if (xres == 'oK') {
                    callback(xres);
                    return;
                }
            });
        }
        else {

            para.complete = 0;
            para.message = response;
            set_track_report_idleling(para, function (xres) {
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

function start(date_gen_report) {

    console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());

  // var date_gen_report = '2016-09-24';
    //WHERE modem_id='1010001017'
    var sql = "SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle   ORDER BY modem_id";
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

                add_track_report_idleling(para, function (xid) {
                    para.id = xid;
                    get_data(para, function (xres) {
                        if (xres != null) {
                            next();
                            console.log(xres);
                        } else {
                            next();
                            console.log('ielse ' + xres);
                        }

                    });
                });

            }, function () {
                console.log('final finish ');
            });
        } else {
            console.log('empty data');
        }
    });
}

//#region job start at 00:40

/**/
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00;
rule.minute = 40;

schedule.scheduleJob(rule, function () {
   // console.log('Harvester Midnight This runs at 23:59 every day.');
    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    start(date_gen_report);
   
});


    //#endregion



 //#region Test


   
 /*
setTimeout(function () {
    console.log('start');
    start('2016-09-25');

}, 1000);
  
SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle ORDER BY modem_id

SELECT gps_datetime,lon,lat,speed,mileage,status
 FROM ht_1010001004 
WHERE gps_datetime >='2016-06-04 00:00' 
AND gps_datetime <='2016-06-04 23:59' 
AND status = '2' 
AND satelites > 0
ORDER BY gps_datetime  


    
    */
    //#endregion