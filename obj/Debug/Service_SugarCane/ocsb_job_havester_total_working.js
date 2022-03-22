
 //#region module
var schedule = require('node-schedule');
var async = require('async');
var squel = require("squel");
var moment = require('moment');
//var _ = require('underscore');
var mustache = require("mustache");

var fs = require('fs');
//var copyFrom = require('pg-copy-streams').from;
//var jCutloading = require('job_load_cutting_loadding.js');
var utl = require('Utility.js');
var linq = require('linq.js');
var utl = require('Utility.js');
var irp = require('iReports.js');
var inout = require('inout_polygon.js');
//var find_place = require('iAdmin_point.js');

//var dtc2cane = require('dtc2cane.js');

var db = require('iConnectdb_ktc.js');

var iconn = require('conn_sugar_cane.js');
var pg_htt = new db.im2(iconn.get_dbconfig_htt());
var pg_realtime = new db.im2(iconn.get_dbconfig_realtime());

var ipm = new db.im2(iconn.get_dbconfig_realtime());

var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10003";

var start_time = ' ';
var end_time = ' ';
var min_tracking = 1;
    //#endregion

function process_start(ar, callback)
{
    var s = ' ';
    if (days == 0) {
        s = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
        s = s.subtract(1, 'days');

    } else if (days > 0) {
        s = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
        s = s.subtract(days, 'days');
    }

    start_time = s.format('YYYY-MM-DD') + ' 00:00:00'
    end_time = s.format('YYYY-MM-DD') + ' 23:59:59'

}

function get_havester(callback)
{
    //harvester_number,
    var sql = "SELECT blackbox_id FROM htt4";
    db.get_rows(pg_htt, sql, function (res)
    {
        debugger;
        if (res.length > 0)
        {
           // console.log(res);
            callback(res);
            return;
        }
    });
}


function driving_temp()
{
    this.modem_id = '';
    this.status = '';
    this.time_use = '';

    this.start_date = '';
    this.end_date = '';

  

    this.start_loc_th = '';
    this.end_loc_th = '';
    this.start_loc_en = '';
    this.end_loc_en = '';

    this.start_lonlat = '';
    this.end_lonlat = '';

    this.plot_code='';
    this.harvester_name='';
    this.que='';
    this.zone_id = '';
   
}


    //datediff
    //2015-04-23
    //#region sample
    /*
SELECT idate(start_time)as start_record,idate(end_time)as end_record
,CASE WHEN status <> '10' THEN  DateDiff('minute',start_time,end_time)::int  ELSE get_cutting_time(blackbox_id,idate(start_time),idate(end_time))::int END  as total_time
,start_lat,start_lon,end_lat,end_lon,blackbox_id
,CASE WHEN status <> '10' THEN status ELSE '11' END as status_type_start
,idate(now()::TIMESTAMP) as date_record 
,stam_tname as tambol_start,samp_tname as amphur_start,sprov_tname as province_start,etam_tname as tambol_end,eamp_tname as amphur_end,eprov_tname as province_end,' ' as plot_code,' ' as zone_id 
 FROM z189600105030rep  
 WHERE cast(start_time as varchar(10))='2015-12-23'
 AND status IN ('30','31','33','10')  --('10')--
 AND get_cutting_time(blackbox_id,idate(start_time),idate(end_time))::int >0
     */
    //#endregion

function get_data_harvester(blackbox_id, date,callback)
{
    //,status,speed,satelites,analog_input1,tambol,amphur,province
    var sql = " SELECT idate(gps_datetime) as gps_datetime,input_status"
   sql+=",CASE  WHEN CAST(input_status as int)=5 OR CAST(input_status as int)=3 THEN '4' ELSE status END status,"
   sql+=" ,lat,lon,tambol,amphur,province";
   sql+=" FROM ht_1010003004 ";
   sql+=" WHERE gps_datetime >= '2016-12-19 00:00' ";
   sql+=" AND gps_datetime <='2016-12-19 23:59' ";
  // sql+=" AND input_status='5' ";
   sql+=" ORDER BY gps_datetime ASC ";

   var res_ar = [];
   var is_open = true;
   var i = 0;
   debugger;
   ipm.db.dbname = db_owner;
   db.get_rows(ipm, sql, function (res)
   {
       debugger;
       var end_loop = res.length;

              //  for (var i = 0; i < end_loop; i++)
       async.eachSeries(res, function (rows, next)
       {
           if (i != end_loop - 1)
           {
               var i_next = i + 1;

               var cur_lon = rows['lon'];
               var cur_lat = rows['lat'];
               var cur_dt = rows['gps_datetime'];
               var next_dt = res[i_next]['gps_datetime'];
               var res_diff = irp.diff_min(cur_dt, next_dt);

               if (res_diff > min_tracking)
               {
                   if (i == 0)
                   {
                       var temp = new driving_temp();
                       temp.modem_id = blackbox_id;
                       temp.start_date = cur_dt;
                       temp.end_date = cur_dt;

                       is_infarm_buffer(blackbox_id, cur_lon, cur_lat, 15, function (xres)
                       {
                           debugger;
                           if(xres.lenght>0)
                            {
                               if (xres[0].is_workout_zone)
                               {
                                   temp.plot_code = xres[0].plot_code;
                                   temp.harvester_name = xres[0].harvester_name;
                                   temp.que = xres[0].que;
                                   temp.zone_id = xres[0].zone_id;
                                   temp.lat = cur_lat;
                                   temp.lon = cur_lon;
                                   res_ar.push(temp);
                                   // return;
                                   // console.log(xres[0]);
                                   next();
                               }
                               else
                               {
                                   next();
                               }
                           }
                       });


                   }
                   else
                   {
                       if (is_open == false)
                       {
                           temp.end_date = cur_dt;
                           //   temp.end_loc_th = cur_loc_th;
                           //   temp.end_loc_en = cur_loc_en;
                           temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                           //   temp.lonlat = cur_lonlat;

                           if (i_next < end_loop - 1) {
                               var next_2 = res[i_next + 1]['gps_datetime'];

                               irp.is_continute(next_dt, next_2, function (is_cont)
                               {
                                   if (is_cont == false)
                                   {
                                       var temp = new driving_temp();
                                       temp.modem_id = para.modem_id;


                                       temp.start_date = next_dt;
                                       temp.end_date = next_dt;
                                       //temp.lonlat = rows[i_next]['lonlat'];
                                       //temp.start_loc_th = res_db[i_next]['locations_th'];
                                       //temp.end_loc_th = temp.start_loc_th;
                                       //temp.start_loc_en = res_db[i_next]['locations_en'];
                                       //temp.end_loc_en = temp.start_loc_en;
                                       temp.time_use = 0;
                                       res_ar.push(temp);
                                   }
                               });

                               next();
                               is_open = true;
                           }
                           else {
                               debugger;
                               console.log('stop ' + i_next);
                               // iBuildText.build_text('c:\\over_speed8.txt', JSON.stringify(res_ar))
                           }

                       }
                   }


                   //temp.start_loc_th = cur_loc_th;
                   //temp.end_loc_th = cur_loc_th;
                   //temp.start_loc_en = cur_loc_en;
                   //temp.end_loc_en = cur_loc_en;
                   //temp.time_use = 0;//diff_min(cur_dt, next_dt);
                   //temp.lonlat = cur_lonlat;
                   //res_ar.push(temp);
               }
               else
               {

                   if (is_open) 
                     {
                       var temp = new driving_temp();
                       temp.modem_id = blackbox_id;
                       temp.start_date = cur_dt;
                       //temp.start_loc_th = cur_loc_th;
                       //temp.start_loc_en = cur_loc_en;
                       //temp.lonlat = cur_lonlat;

                       is_infarm_buffer(blackbox_id, cur_lon, cur_lat, 15, function (xres) {
                           debugger;
                           if(xres.length >0)
                             {
                               if (xres[0].is_workout_zone) 
                                   {
                                   temp.plot_code = xres[0].plot_code;
                                   temp.harvester_name = xres[0].harvester_name;
                                   temp.que = xres[0].que;
                                   temp.zone_id = xres[0].zone_id;

                                   return;
                                   // console.log(xres[0]);
                               }
                           }
                       });

                      
                       res_ar.push(temp);
                       is_open = false;
                        next();
                   }
               }

           }
           else {
               debugger;
               if (res_ar.length > 0) {

               }
           }
       });
   });

   

}


function find_5_first_step(data,callback){
    var x_res = linq.Enumerable.From(data)
       .Where(function (x) { return x.input_status == 5 })
       .FirstOrDefault();
    // .Select(function (x) { return x.geometry })
    // .ToArray();
    callback(x_res);
    return;
}



function find_5_step2(data, gps_datetime, callback) {
    debugger;
    var x_res = linq.Enumerable.From(data)
       .Where(function (x) { return x.input_status == 5 })
       .Where(function (x) { return x.gps_datetime >= gps_datetime })
       .FirstOrDefault();
    // .Select(function (x) { return x.geometry })
    // .ToArray();
    callback(x_res);
    return;
}


function is_next_pto_open(data,index,callback)
{
     var x_res = linq.Enumerable.From(data)
       .Where(function (x) { return x.rownum == index })
       .Where(function (x) { return x.input_status == 5 })
       .Count();
       callback(x_res);
      return;
}



function find_open_service(data, status, gps_datetime, callback) {
    var x_res = linq.Enumerable.From(data)
       .Where(function (x) { return x.status != status })
       .Where(function (x) { return x.gps_datetime >= gps_datetime })
       .FirstOrDefault();
    callback(x_res);
    return;
}

function find_close_service(data, rownum, callback)
{
    var x_res = linq.Enumerable.From(data)
    .Where(function (x) { return x.rownum == rownum })
    .FirstOrDefault();
    callback(x_res);
    return;
}

    var i = 0;
    var blackbox_id = '1010003004';
    var res_ar = [];

function get_data_harvester2()
{
     var sql = " SELECT row_number() over (order by gps_datetime) as rownum ";
     sql += ",idate(gps_datetime) as gps_datetime,input_status,lon||','||lat as lonlat ,lon,lat";
     sql += ",tambol||':'||amphur||':'||province as locations_th,etambol||':'||eamphur||':'||eprovince as locations_en ";
    sql+=",CASE  WHEN CAST(input_status as int)=5 OR CAST(input_status as int)=3 THEN '4' ELSE status END status"
    sql+=" FROM ht_1010003004  ";
    sql+=" WHERE gps_datetime >= '2016-12-19 00:00'  ";
    sql+=" AND gps_datetime <='2016-12-19 23:59'  ";
    sql+=" ORDER BY gps_datetime ";


    var start_job = true;
     ipm.db.dbname = db_owner;
     db.get_rows(ipm, sql, function (rows) 
     {
         var open_datetime = '';
         var open_status = '';
         var open_rownumber = '';
         var open_start_lonlat = '';
         var open_start_loc_th = '';
         var open_start_loc_en = '';

         sup_process(rows);

         /*
         while(start_job)
         {
             if (i == 0)
             {
                 var temp = new driving_temp();
                 temp.start_date = rows[0].gps_datetime;
                 temp.status = rows[0].status;

                 open_start_lonlat = rows[0].lonlat;
                 open_start_loc_th = rows[0].locations_th;
                 open_start_loc_en = rows[0].locations_en;

                 find_open_service(rows, temp.status, temp.start_date, function (xres)
                 {
                     debugger;
                     // console.log(xres);
                     open_rownumber = xres.rownum - 1;
                     open_datetime = xres.gps_datetime;
                     open_status = xres.status;
                     temp.start_lonlat = open_start_lonlat;
                     temp.start_loc_th = open_start_loc_th;
                     temp.start_loc_en = open_start_loc_en;

                     i = open_rownumber;

                     find_close_service(rows, open_rownumber, function (xres)
                     {


                         temp.modem_id = blackbox_id;
                         temp.end_date = xres.gps_datetime;
                        
                         temp.end_lonlat = xres.lonlat;
                         temp.end_loc_th = xres.locations_th;
                         temp.end_loc_en = xres.locations_en;

                         temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                         res_ar.push(temp);

                         
                     });

                 });
             } 
             else 
             { 
                 var temp = new driving_temp();
                 temp.start_date = open_datetime;
                 temp.status = open_status;

                 temp.start_lonlat = open_start_lonlat;
                 temp.start_loc_th = open_start_loc_th;
                 temp.start_loc_en = open_start_loc_en;

             

                 find_open_service(rows, temp.status, temp.start_date, function (xres) {
                    // debugger;
                     // console.log(xres);
                     open_rownumber = xres.rownum - 1;
                     open_datetime = xres.gps_datetime;
                     open_status = xres.status;
                     i = open_rownumber;

                     find_close_service(rows, open_rownumber, function (xres) 
                     {
                        // debugger;
                         temp.modem_id = blackbox_id;
                         temp.end_date = xres.gps_datetime;

                         temp.end_lonlat = xres.lonlat;
                         temp.end_loc_th = xres.locations_th;
                         temp.end_loc_en = xres.locations_en;

                         temp.time_use = irp.diff_min(temp.start_date, temp.end_date);

                         if (open_status == '4')
                         {
                             var cur_lon = xres.lon;
                             var cur_lat = xres.lat;

                             is_infarm_buffer(blackbox_id, cur_lon, cur_lat, 15, function (xxres)
                             {
                                 debugger;
                                 //if (xres.length > 0)
                                 //{
                                     if (xxres[0].is_workout_zone)
                                     {
                                         temp.plot_code = xxres[0].plot_code;
                                         temp.harvester_name = xxres[0].harvester_name;
                                         temp.que = xxres[0].que;
                                         temp.zone_id = xxres[0].zone_id;

                                         res_ar.push(temp);

                                     }

                                // }
                             });
                         } 
                         else
                         {

                             res_ar.push(temp);
                         }
                     });

                 });
                 
             }
         }
            */  
    
     });
    
}

function sup_process(rows)
{
         var open_datetime = '';
         var open_status = '';
         var open_rownumber = '';
         var open_start_lonlat = '';
         var open_start_loc_th = '';
         var open_start_loc_en = '';

        
             if (i == 0)
             {
                 var temp = new driving_temp();
                 temp.start_date = rows[0].gps_datetime;
                 temp.status = rows[0].status;

                 open_start_lonlat = rows[0].lonlat;
                 open_start_loc_th = rows[0].locations_th;
                 open_start_loc_en = rows[0].locations_en;

                 find_open_service(rows, temp.status, temp.start_date, function (xres)
                 {
                     debugger;
                     // console.log(xres);
                     open_rownumber = xres.rownum - 1;
                     open_datetime = xres.gps_datetime;
                     open_status = xres.status;
                     temp.start_lonlat = open_start_lonlat;
                     temp.start_loc_th = open_start_loc_th;
                     temp.start_loc_en = open_start_loc_en;

                     i = open_rownumber;

                     find_close_service(rows, open_rownumber, function (xres)
                     {


                         temp.modem_id = blackbox_id;
                         temp.end_date = xres.gps_datetime;
                        
                         temp.end_lonlat = xres.lonlat;
                         temp.end_loc_th = xres.locations_th;
                         temp.end_loc_en = xres.locations_en;

                         temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                         res_ar.push(temp);

                         sup_process(rows);
                         
                     });

                 });
             } 
             else 
             { 
                 var temp = new driving_temp();
                 temp.start_date = open_datetime;
                 temp.status = open_status;

                 temp.start_lonlat = open_start_lonlat;
                 temp.start_loc_th = open_start_loc_th;
                 temp.start_loc_en = open_start_loc_en;

             

                 find_open_service(rows, temp.status, temp.start_date, function (xres) {
                    // debugger;
                     // console.log(xres);
                     open_rownumber = xres.rownum - 1;
                     open_datetime = xres.gps_datetime;
                     open_status = xres.status;
                     i = open_rownumber;

                     find_close_service(rows, open_rownumber, function (xres) 
                     {
                        // debugger;
                         temp.modem_id = blackbox_id;
                         temp.end_date = xres.gps_datetime;

                         temp.end_lonlat = xres.lonlat;
                         temp.end_loc_th = xres.locations_th;
                         temp.end_loc_en = xres.locations_en;

                         temp.time_use = irp.diff_min(temp.start_date, temp.end_date);

                         if (open_status == '4')
                         {
                             var cur_lon = xres.lon;
                             var cur_lat = xres.lat;

                             is_infarm_buffer(blackbox_id, cur_lon, cur_lat, 15, function (xxres)
                             {
                                 debugger;
                                 //if (xres.length > 0)
                                 //{
                                     if (xxres[0].is_workout_zone)
                                     {
                                         temp.plot_code = xxres[0].plot_code;
                                         temp.harvester_name = xxres[0].harvester_name;
                                         temp.que = xxres[0].que;
                                         temp.zone_id = xxres[0].zone_id;

                                         res_ar.push(temp);

                                         sup_process(rows);

                                     }

                                // }
                             });
                         } 
                         else
                         {

                             res_ar.push(temp);

                             sup_process(rows);
                         }
                     });

                 });
                 
             }
         
}

/*
 find_5_first_step(res,function(xres)
         {
             debugger;
             var next_index = xres.rownum + 1;
             is_next_pto_open(res,next_index,function(is_pto_open){
                 if(is_pto_open==1)
                  {
                     
                  }
                 else
                 {
                    var xtime = xres.gps_datetime
                    find_5_step2(res, xtime, function (rows)
                    {
                         debugger;
                         console.log(rows);
                     });
                 }
             });
             
         });
 */

function is_infarm_buffer(blackbox_id, lon, lat, meter_radius, callback) 
{
    //lon = 102.195250325693;
    //lat = 16.4149841094033;
    inout.is_inconfig_polygon_buffer(blackbox_id, lon, lat, meter_radius, function (res) {
        callback(res);
        return;
    })

}

/*
  db.get_rows(pg_realtime, sql, function (res)
    {
        debugger;
        if (res.length > 0)
        {
            // console.log(res);

            async.eachSeries(res, function (row, next)
            {
                var step1 = false;
                if (row.province_start === "undefined") {
                    find_place.call_adminPoint(row.start_lon, row.start_lat, function (place) {
                        //  debugger;
                        // console.log(place);
                        if (place.length > 0) {
                            row.stam_tname = place[0]['tambol_start'];
                            row.samp_tname = place[0]['amphur_start'];
                            row.sprov_tname = place[0]['province_start']
                        }
                        step1 = true;
                        is_fin();
                    });
                } else {
                    step1 = true;
                    is_fin();
                }

                function is_fin() {
                    if (step1) {
                        //   row.start_lon = 102.195250325693
                        //  row.start_lat = 16.4149841094033
                        inout.is_inconfig_polygon(blackbox_id, row.start_lon, row.start_lat, function (inzone) {
                                debugger;
                             if (inzone.length > 0)
                             {
                                row.plot_code = inzone[0].plot_code
                                row.zone_id = inzone[0].zone_id
                             }
                            next();
                        });
                    }

                }

            }, function () {
                debugger;
                //  console.log(JSON.stringify(res))
                var strMustache = '{{#.}}';
                strMustache += "('{{start_record}}','{{end_record}}','{{total_time}}','{{start_lat}}','{{start_lon}}','{{end_lat}}','{{end_lon}}','{{blackbox_id}}','{{status_type_start}}'";
                strMustache += ",'{{date_record}}','{{tambol_start}}','{{amphur_start}}','{{province_start}}','{{tambol_end}}','{{amphur_end}}','{{province_end}}','{{plot_code}}','{{zone_id}}'";
                strMustache += "),";
                strMustache += '{{/.}}';

                var result = mustache.render(strMustache, res);
                result = utl.iRmend(result);
                var sql = " INSERT INTO history_status_havester(start_record, end_record, total_time, start_lat, start_lon,";
                sql += " end_lat, end_lon, blackbox_id, status_type_start, date_record,";
                sql += " tambol_start, amphur_start, province_start, tambol_end, amphur_end,";
                sql += " province_end, plot_code_start, zone_id_start) VALUES " + result;

                db.excute(pg_htt, sql, function (response) {
                    if (response == 'oK') {
                        callback(true);
                        return;
                    }
                    else {
                        callback(true);
                        return;
                    }
                });

                // console.log(JSON.stringify(res))

            });
        }
        else
        {
            callback(true);
            return;
        }
    });
 */



//#region
/*
 
SELECT start_time
,end_time
,start_lat
,start_lon
,end_lat
,end_lon
,blackbox_id
,status 
,idate(now())
,stam_tname
,samp_tname
,sprov_tname
,etam_tname
,eamp_tname
,eprov_tname
,status
FROM z104090169333rep 
WHERE cast(start_time as varchar(10))='2015-04-23'
AND status IN ('30','31','33')
 */
//#endregion

    //for generate_report driving stop ideling from table zrep
/**/
setTimeout(function ()
{
    //get_zrepdata_harvester('189600105030', '2015-12-23', function (xres) {
    //    debugger;
    //    console.log(xres);
    //})
    //get_data_harvester('1010003004', '2015-12-23', function (xres)
    //{

    //});

    get_data_harvester2();

}, 1000);

//#region
    /*
setTimeout(function ()
{

    /// var date_now = moment().format("YYYY-MM-DD");
    var date_now = '2015-09-14'
    debugger;
    get_havester(function (data) {
        async.eachSeries(data, function (row, next)
        {
            //console.log(row.blackbox_id);
            //  date_now = '2015-11-27'
            get_zrepdata(row.blackbox_id, date_now, function (r) {
                if (r == true) {
                    next();
                }
            });

        }, function () {
            console.log('start get_harvest_vehicle_working_log && get_delivery_vehicle_working_log');
            dtc2cane.get_harvest_vehicle_working_log();
            dtc2cane.get_delivery_vehicle_working_log();
            // dtc2cane.get_harvest_vehicle_working_log();
           // dtc2cane.get_delivery_vehicle_working_log();
        });
    });

}, 1000);
*/

    //#endregion


//http://www.codexpedia.com/javascript/nodejs-cron-schedule-examples/
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 23;
rule.minute = 59;

//#region
  
/*
schedule.scheduleJob(rule, function ()
{
    console.log('Harvester Midnight This runs at 23:59 every day.');

    var date_now = moment().format("YYYY-MM-DD");
    //var date_now = '2015-12-02'
   
    debugger;

    dtc2cane.get_oil_harvester(date_now, function (res_oil_harvester) {
        console.log('res_oil_harvester '+res_oil_harvester);
    });

    dtc2cane.get_oil_truck(date_now, function (res_oil_truck) {
        console.log('res_oil_harvester ' + res_oil_truck);
    });


    get_havester(function (data)
    {
        async.eachSeries(data, function (row, next) {
            //console.log(row.blackbox_id);
            //  date_now = '2015-11-27'
            get_zrepdata_harvester(row.blackbox_id, date_now, function (r) {
                if (r == true) {
                    next();
                }
            });

        }, function () {
            console.log('start get_harvest_vehicle_working_log ');
           // dtc2cane.get_harvest_vehicle_working_log();
     
        });
    });
   



});

    */


//#endregion
