﻿
 //#region module
var schedule = require('node-schedule');
var async = require('async');
var squel = require("squel");
var moment = require('moment');
var mustache = require("mustache");

var fs = require('fs');

var utl = require('Utility.js');
var linq = require('linq.js');
var utl = require('Utility.js');
var irp = require('iReports.js');
var inout = require('inout_polygon.js');

var iBuildText = require('iGenTextFile.js');


var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());

var db_config = "master_config";


var start_time = ' ';
var end_time = ' ';


    //#endregion

function add_track_report_trip(para, callback) 
{
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

function ical_distance(lonlat_start,lonlat_end) {
        var r = utl.Split(lonlat_start, ',');
        var n = utl.Split(lonlat_end, ',');
        return irp.cal_distance(r[0], r[1], n[0], n[1]);
       // return res;
}

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
     // debugger;
      //  console.log(res_db[0].exists)
        callback(res_db[0].exists)
        return;
  });

}

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


function has_status_trip(data, callback)
{
    var x_res = linq.Enumerable.From(data)
    .Where(function (x) { return x.input_status == '2' })
    .Count()
    callback(x_res);
    return;
}

function driving_temp()
{
    
    this.start_date = '';
    this.end_date = '';
    this.time_use = '';

    this.start_lonlat = '';
    this.end_lonlat = '';
    this.modem_id = '';
    
    this.start_loc_th = '';
    this.end_loc_th = '';
    this.start_loc_en = '';
    this.end_loc_en = '';
    this.distance = '';
    this.start_mile='';
    this.end_mile='';
   
}


function find_open_service(data, input_status, gps_datetime, callback) {
    var x_res = linq.Enumerable.From(data)
       .Where(function (x) { return x.input_status == input_status })
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

//หาจุดสุดท้ายของข้อมูลที่ค่าเป็นศูนย์ 
function find_index_end_service(data,rownum, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return x.input_status == '0' })
    .Where(function (x) { return x.rownum > rownum })
    .Select(function (x) { return parseInt(x.rownum) })
   // .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

   // debugger;
     
     callback(x_end_rownum);
     return;
    
}



function find_index_start_service(data,status_engine_work,rownum, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return x.input_status == status_engine_work })
    .Where(function (x) { return x.rownum > rownum })
    .Select(function (x) { return parseInt(x.rownum) })
   // .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

   // debugger;
     
     callback(x_end_rownum);
     return;
    
}



    var i = 0;
    var modem_id = ''; //1010003020
    var res_ar = [];
    var open_datetime = '';
    var open_status = '';
    var open_rownumber = '';
    var open_start_lonlat = '';
    var open_start_loc_th = '';
    var open_start_loc_en = '';
    var cur_lon='';
    var cur_lat ='';
    var date_process ='';
    var start_date='';//'2017-01-08 00:00';
    var end_date='';//'2017-01-08 23:59';
    var harvester_name='';

    //start data 2016-12-06 






//modem_id,start_date,end_date
function get_data(para,callback)
{
  //  console.log('get_data '+i);
     res_ar = []; // very important clear before call again
     i = 0;
     open_datetime = '';
     open_status = '';
     open_rownumber = '';
     open_start_lonlat = '';
     open_start_loc_th = '';
     open_start_loc_en = '';
     cur_lon='';
     cur_lat ='';
     date_process ='';

    date_process = para.start_time;
    //142181256575
    var sql = " SELECT row_number() over (order by gps_datetime) as rownum ";
    sql += ",idate(gps_datetime::TIMESTAMP) as gps_datetime,input_status,lon||','||lat as lonlat ,lon,lat";
    sql += ",tambol||':'||amphur||':'||province as locations_th,etambol||':'||eamphur||':'||eprovince as locations_en ";
    sql +=",mileage,input_status as status,modem_id"
    sql +=" FROM ht_"+para.modem_id;
    sql +=" WHERE gps_datetime::TIMESTAMP >= '"+para.start_time+"' ";
    sql +=" AND gps_datetime::TIMESTAMP <='"+para.end_time+"' ";
    sql +=" ORDER BY gps_datetime::TIMESTAMP ASC";

  /* */
     ipm.db.dbname = para.db_name;
     db.get_rows(ipm, sql, function (rows) 
     {
         if(rows.length >0)
         {
             //check if this day is open system cutting ?
             has_status_trip(rows,function(has_found)
             {
                 if(has_found >0)
                 {
                    sup_process(rows,para,function(final_res)
                    {
                          console.log(final_res);
                          callback(final_res);
                          return;
                    });
                } 
                else
                {
                     callback([]);
                     return;
                }
                
            });
        
        }
        else
        {
            callback([]);
            return;
        }
        

     });
    
    
}

function sup_process(rows,para,callback)
{
  var status_engine_work = '2';

             if (i == 0)
             {
                 var temp = new driving_temp();
                 temp.start_date = rows[0].gps_datetime;

                 find_open_service(rows, status_engine_work, temp.start_date, function (xres)
                 {
                    // debugger;
                     // console.log(xres);
                     open_rownumber = xres.rownum; //- 1;

                     open_datetime = xres.gps_datetime;
                     open_status = xres.status;
                     temp.start_lonlat = xres.lonlat;
                     temp.start_loc_th = xres.locations_th;
                     temp.start_loc_en = xres.locations_en;
                    // temp.end_date = xres.gps_datetime;
                    temp.start_date = xres.gps_datetime;
                     temp.start_mile = xres.mileage;
                     

                     find_index_end_service(rows,open_rownumber,function(open_rownumber)
                     {
                        i = open_rownumber;
                        open_rownumber = open_rownumber -1 ;
                        
                        
                                find_close_service(rows, open_rownumber, function (xres)
                                {
                        
                                    if(xres !=undefined)
                                    {
                                        temp.modem_id = xres.modem_id;
                                        temp.end_date  = xres.gps_datetime;
                                                    
                                        temp.end_lonlat = xres.lonlat;
                                        temp.end_loc_th = xres.locations_th;
                                        temp.end_loc_en = xres.locations_en;
                            
                                        temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                        temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
                            
                                        temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                                        temp.end_mile = xres.mileage;
                                        res_ar.push(temp);
                            
                                                     
                                        sup_process(rows,para,function()
                                        {
                                            callback(true);
                                            return;
                                        });
                                    }else{

                                        
                                           debugger;
                                          // console.log(res_ar);
                                           index = rows.length -1;
         
                                           temp.modem_id = rows[index].modem_id;
                                           temp.end_date = rows[index].gps_datetime;
                                       
               
                                           temp.end_lonlat = rows[index].lonlat;
                                           temp.end_loc_th = rows[index].locations_th;
                                           temp.end_loc_en = rows[index].locations_en;
               
                                           temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                           temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
               
                                           temp.end_mile = rows[index].mileage;
            
                                           temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
               
                                           res_ar.push(temp);
         
       
                                        add_report_trip(para.id,res_ar,function()
                                        {
                                            callback(true);
                                            return;
                                        })
                                    }
                                  
                                                 
                                                 
                                });
                     })

                 

                 });
             } 
             else 
             { 
                 var temp = new driving_temp();

                 find_index_start_service(rows,status_engine_work,i,function(index)
                 {
                   

                        if(rows[index] !==undefined)
                        {
                            temp.start_date = rows[index].gps_datetime;
                            temp.status = rows[index].status;
                            temp.start_mile = rows[index].mileage;
           
                            temp.start_lonlat = rows[index].lonlat;
                            temp.start_loc_th = rows[index].locations_th;
                            temp.start_loc_en = rows[index].locations_en;

                            open_rownumber = rows[index].rownum;

                         
   
                       find_index_end_service(rows,index,function(open_rownumber)
                        {
                           i = open_rownumber;
                           open_rownumber = open_rownumber -1 ;
                           
                        
                           find_close_service(rows, open_rownumber, function (res_close) 
                           {
                               // 
                               if(res_close ===undefined)
                               {
                                  debugger;
                                 // console.log(res_ar);
                                  index = rows.length -1;

                                  temp.modem_id = rows[index].modem_id;
                                  temp.end_date = rows[index].gps_datetime;
                              
      
                                  temp.end_lonlat = rows[index].lonlat;
                                  temp.end_loc_th = rows[index].locations_th;
                                  temp.end_loc_en = rows[index].locations_en;
      
                                  temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                  temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
      
                                  temp.end_mile = rows[index].mileage;
   
                                  temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
      
                                  res_ar.push(temp);

                                  add_report_trip(para.id,res_ar,function()
                                  {
                                      callback(true);
                                      return;
                                  })

                               }
                               else
                               {

                                temp.modem_id = res_close.modem_id;
                                temp.end_date = res_close.gps_datetime;

                                temp.end_lonlat = res_close.lonlat;
                                temp.end_loc_th = res_close.locations_th;
                                temp.end_loc_en = res_close.locations_en;
    
                                temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
    
                                temp.end_mile = res_close.mileage;
 
                                temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
    
                                res_ar.push(temp);
 
                                     sup_process(rows,para,function()
                                    {
                                        callback(true);
                                        return;
                                    });
                               }
                            
                           
   
                           });
                        });
                       
                        }
                        else
                        {
                             debugger;
               
                             if(res_ar.length>0)
                             {
                                 console.log('add_report_trip '+para.modem_id+' = '+res_ar.length);
                                 //  console.log(para.modem_id);
                                 clear_data_now_by_id(para,function(xf)
                                 {
                                     add_report_trip(para.id,res_ar,function(res_y)
                                     {
                                         callback(res_y);
                                         return;
                                     })
                                 })
                             }
                             else
                             {
                                 callback([]);
                                 return;
                             }
   
                        }
                     


                 })

               

             }
         
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
        db.excute(ipm, sql, function (response) 
        {
            if (response == 'oK') 
            {
                para.complete = 1;
                para.message = response;
                /* */
                set_track_report_trip(para, function (xres) 
                {
                    if (xres == 'oK') 
                    {
                        callback(xres);
                        return;
                    }
                });
               
            }
            else {

                para.complete = 0;
                para.message = response;
                /* */
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
    //AND modem_id='1010005002' 
        // var date_gen_report = '2016-07-02'; //WHERE modem_id IN ('1010006001','1010006002','1010006003') AND modem_id='142181256688' db_name ='db_10026' AND
      //  var sql = "SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle WHERE  modem_id like '%14218%'   ORDER BY db_name";
        //WHERE modem_id='142181155695' 
        //WHERE db_name='db_10034' WHERE db_name='db_10034' WHERE db_name='db_10034' 
        var sql = "SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle WHERE modem_id LIKE '%14%' AND db_name LIKE '%db_1%'   ORDER BY db_name DESC";
        console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());
    
        //var date_gen_report = '2016-06-25';
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (res) 
        {
            if (res.length > 0) 
            {
                async.eachSeries(res, function (row, next) 
                {
                     //  debugger;
                    // console.log(row);
                    var para = { 'id': 1, 'db_name': row.db_name, 'modem_id': row.modem_id, 'start_time': date_gen_report + ' 00:00', 'end_time': date_gen_report + ' 23:59', 'date_gen_report': date_gen_report, 'message': '' }
    
                    add_track_report_trip(para, function (xid) 
                    {
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
                                else 
                                {
                                    next();
                                    console.log('ielse ' + xres);
                                }
        
                            });
                        }
                        else
                        {
                          console.log('no table on ' +para.db_name+' '+para.modem_id);
                          next();
                        }
                    });
    
    
                     });
             
                }, function () {
                    console.log('finish master');
                });
    
            }
        });
}
    
function clear_data_now_by_id(para,callback)
{
    var date_now = utl.format_date(para.start_time);
    var sql =" DELETE FROM rp_trip WHERE iymd(start_date)='"+date_now+"' AND modem_id= '"+para.modem_id+"' ";

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) 
    {
        //debugger;
        if (is_ok == 'oK') 
        {
            callback(true);
            return;
               
        }
        else
        {
            callback(false);
            return;
        }
    });
}

//http://www.codexpedia.com/javascript/nodejs-cron-schedule-examples/
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00;
rule.minute = 20;

//04 error 
//start('2019-09-04');

//#region
  
/*    */
schedule.scheduleJob(rule, function ()
{
    
    
    // var   date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
    // var date_now_before = date_now.subtract(1, 'days');

    // start_date = date_now.format('YYYY-MM-DD') + ' 00:00'
    // end_date = date_now.format('YYYY-MM-DD') + ' 06:59'
    var date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
    var date_now_before = date_now.subtract(1, 'days');

    start_date = date_now_before.format('YYYY-MM-DD')  //'2017-01-31 00:00:00'
   // end_date = date_now._i + ' 06:59'                             //'2017-02-01 06:59:00'

    console.log('PEC find total working  This runs at 06:10 every day. '+start_date);
    debugger;
   
          
              // console.log(s);
     start(start_date);
    

});






//#endregion
