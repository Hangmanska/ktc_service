
 //#region module
//var schedule = require('node-schedule');
var async = require('async');
var squel = require("squel");
var moment = require('moment');
var mustache = require("mustache");
var schedule = require('node-schedule');

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
    .Where(function (x) { return x.rownum ==  parseInt(rownum)  })
    .FirstOrDefault();
    callback(x_res);
    return;
}

//หาจุดสุดท้ายของข้อมูลที่ค่าเป็นศูนย์ 
function find_index_end_service(data,rownum, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return x.input_status == '0' })
    .Where(function (x) { return x.rownum > parseInt(rownum) })
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
    .Where(function (x) { return x.rownum > parseInt(rownum) })
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
    console.log(para);

     res_ar = []; // very important clear before call again
     i=0;
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
//  console.log(para.modem_id);
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
                            
                                                     
                                        sup_process(rows,para,function(res_x)
                                        {
                                            callback(res_x);
                                            return;
                                        });
                                    }
                                    else
                                    {

                                        
                                        // debugger;
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
         
       
                                        add_report_trip(para.id,res_ar,function(res_x)
                                        {
                                            callback(res_x);
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
                            index  = index -1;  //fix bug 

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

                                        add_report_trip(para.id,res_ar,function(res_x)
                                        {
                                            callback(res_x);
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
        
                                            sup_process(rows,para,function(res_x)
                                            {
                                                callback(res_x);
                                                return;
                                            });
                                    }
                                    
                                });
                            });
                       
                        }
                        else
                        {
                           //  debugger;
                            if(res_ar.length>0)
                            {
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
        //var para = { 'id': id, 'message': '', 'complete': 0 };

        ipm.db.dbname = db_config;
        db.excute(ipm, sql, function (response) 
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
    else
    {
       // console.log('empty data add_report_trip');
        callback([]);
        return;
    }
}


function start(date_gen_report,fleet_name) 
{
    var sql = " SELECT mcv.modem_id,db_name,mcv.speedmax,track_every ";
    sql += " FROM master_config_vehicle as mcv,setup_vehicle as sv ";
    sql += " WHERE sv.modem_id = mcv.modem_id AND sv.fleetid = mcv.db_name ";
    sql += " AND sv.fleetcode = get_fleetid('"+fleet_name+"') "

      //  var sql = "SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle WHERE db_name='db_10034'   ORDER BY db_name DESC";
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

function is_process_now(para,callback)
{
 
var datenow = utl.timenow();
var xdatenow =  utl.format_date(datenow);
//console.log('is_process_now '+para)

var vstart = utl.format_date(para.start_time);
var vstop = utl.format_date(para.end_time);
  //if(true)// 
  if(vstart == xdatenow || vstop == xdatenow)
   {

  //var para = { 'id': 1, 'db_name': para.db_name, 'modem_id': para.modem_id, 'start_time':'2019-05-06 00:00', 'end_time': '2019-05-06 23:59', 'date_gen_report': datenow, 'message': '' }

  
        clear_data_now_by_id(para,function(xres)
        {
        // console.log('clear_data_now_by_id '+xres);
            if(xres)
            {
                    start_process(para,function(is_ok)
                    {
                        callback(true);
                        return;
                    });
            }
            else
            {
                callback(false);
                return;
            }
            
        });

   }
   else
   {
        callback(false);
        return;
   }

}

function start_process(para,callback)
{
    i = 0;
/*
var db_name = 'db_10033';//req.body.fleetid; 
var modem_id = '142190463035'; //req.body.modemid; //

var start_date = '2019-05-31 00:00' //req.body.start;
var stop_date ='2019-05-31 23:59' // req.body.stop;
*/
//console.log(JSON.stringify(req.body))

//var para = { 'id': 1, 'db_name': db_name, 'modem_id': modem_id, 'start_time':start_date , 'end_time': stop_date , 'message': '' }

    has_table(para.modem_id,para.db_name,function(has_table)
    {
        if(has_table)
        {
            get_data(para, function (xres) 
            {
                if (xres != null) 
                {
                    callback(xres);
                    return;
                }
                else 
                {
                    callback(xres);
                    return;
                }

            });
        }
    });


}

//exports.is_process_now = is_process_now;

/*
var para = { 'id': 1, 'db_name': 'db_10033', 'modem_id': '142190463035', 'start_time':'2019-08-03 00:00' , 'end_time': '2019-08-03 23:59' , 'message': '' }
start_process(para,function(x){
    console.log(x);
});
*/

//start('2019-09-16','KSC')
//start('2019-08-30','KSC')

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00;
rule.minute = 20;

schedule.scheduleJob(rule, function () {
 

    //var date_gen_report = moment().format("YYYY-MM-DD");
    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    start(date_gen_report,'KSC');

});

//142181155724 32-MT0093
//142181155732 32-MT0094
//142181256576 32-MT0090
