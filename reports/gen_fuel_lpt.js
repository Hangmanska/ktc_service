
//#region
var mustache = require("mustache");
var timespan = require('timespan');
var async = require('async');
var moment = require('moment');
var schedule = require('node-schedule');
//var pm2 = require('pm2');


var linq = require('linq.js');
var db = require('iConnectdb_ktc.js');

var iconn = require('conn_sugar_cane.js');
var pg_htt = new db.im2(iconn.get_dbconfig_htt());
var ipm = new db.im2(iconn.get_dbconfig_realtime());

var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10003";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db_config = "master_config";

  var res_ar = [];
  var open_rownumber = 0;
  var gps_datetime='';
  var x_index =0;
  var do_process = true;
  var gb_lastday='';
  var gb_minute =5;
//#endregion

    //1010001030

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

function minus_datetime(start,callback)
{

    var date_now= moment(moment(start+' 00:00:00').format('YYYY-MM-DD'))
      date_now = date_now.subtract(1, 'days');

     var start = date_now.format('YYYY-MM-DD') + ' 00:00'
     var stop = date_now.format('YYYY-MM-DD') + ' 23:59'
     var res={'start':start,'stop':stop};
     callback(res);
     return;
}

function minus_time_minute(time,callback)
{
    var date_now = moment(moment(time).format('YYYY-MM-DD HH:mm'))
    var stop = moment(moment(time).format('YYYY-MM-DD HH:mm')).subtract(1, 'minutes');
    var start = date_now.subtract(gb_minute, 'minutes');

  
        start = start.format('YYYY-MM-DD HH:mm');
        stop = stop.format('YYYY-MM-DD HH:mm');
    var res={'start':start,'stop':stop};
    callback(res);
    return;

}

function get_data_back(db_name,tb_name,start,stop,callback){

    var date_now = moment(moment(start).format('YYYY-MM-DD HH:mm'))
    var _start =  date_now = date_now.subtract(1, 'days');
    _start = _start.format('YYYY-MM-DD HH:mm');
    gb_lastday = _start;

    var  _stop = moment(moment(stop).format('YYYY-MM-DD HH:mm'))
   // _stop =  _stop.subtract(1, 'days');
    _stop = _stop.format('YYYY-MM-DD HH:mm');

        var sql = "";
        sql += " SELECT ";
        sql += "idate(gps_datetime) as gps_datetime ";
        sql += ",oil_percent as fuel_percentage";
        sql += " FROM " + tb_name;
        sql += " WHERE  gps_datetime >= " + utl.sqote(_start);
        sql += " AND gps_datetime <=" + utl.sqote(_stop);
        sql += " AND status !='1' ORDER BY gps_datetime ";
    
         var temp ='';
    
        ipm.db.dbname = db_name;//db_owner;
        db.get_rows(ipm, sql, function (rows) 
        {
             
            if (rows.length > 0) 
            { 
                callback(rows);
                return;
            }else{
                callback(null);
                return;
            }
        });
    
}


function ocsb_excute(sql,db_con,callback)
{
     ipm.db.dbname = db_con;
     db.excute(ipm, sql, function (response) 
     {
        if (response == 'oK') 
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

function get_avg_lastday(data_ht,lastday)
{
    lastday = moment(lastday).format("YYYY-MM-DD");
    var data_res = linq.Enumerable.From(data_ht)
 
    .Where(function (x) { return moment(x.gps_datetime).format("YYYY-MM-DD") == lastday })
    .Select(function (x) { return { "fuel_percentage" : parseFloat(x.fuel_percentage),'gps_datetime': x.gps_datetime }   })
    .OrderByDescending("$.gps_datetime")
    .Take(gb_minute)
    .ToArray();

    if(data_res.length>0)
    {
        var xx = linq.Enumerable.From(data_res)
        .Select(function (x) { return parseFloat(x.fuel_percentage)  })
        .Average();
         return xx;
    }
    else
    {
        return 0;
    }
  
}
 
//fuel_avg
function get_avg_fuel(data_ht,start,stop,callback)
{
   // var row_num = null
    var xx = linq.Enumerable.From(data_ht)
   .Where(function (x) { return x.gps_datetime >= start })
   .Where(function (x) { return x.gps_datetime <= stop })
  .Select(function (x) { return { "fuel_percentage" : parseFloat(x.fuel_percentage),'gps_datetime': x.gps_datetime }   })
  .ToArray();

    if(xx.length==0)
    { 

       xx = get_avg_lastday(data_ht,gb_lastday);
       var avg_min = xx.toFixed(2);
       callback(avg_min);
       return 
    }
    else
    {
        debugger;  
        var avg_min = linq.Enumerable.From(xx)
        .Select(function (x) { return parseFloat(x.fuel_percentage)  })
       .Average();

       avg_min = avg_min.toFixed(2);
       callback(avg_min);
       return 
    }


}

function calculate_fuel(db_name,modem_id,start,stop,callback) 
{
    //#region
    /*
SELECT 
idate(gps_datetime) as gps_datetime,status,input_status
,analog_input1
,round (((analog_input1::DECIMAL -0.3000)*100 / 3.9 -0.300),2)::text  as fuel_percentage
 FROM ht_1010003020
WHERE gps_datetime >='2016-12-21 00:00:00'
AND gps_datetime <='2016-12-21 23:59:00'
ORDER BY gps_datetime ASC 
     */
    //#endregion

  // debugger;
    // Isauthenticate(req, res, function () {
   // var db_name = 'db_10003'; //req.body.fleetid; //
  //  var modem_id = '1010003016';// req.body.modemid; //
   // var start =  '2017-01-08 00:00';//req.body.start; //
   // var stop = '2017-01-08 23:59';//req.body.stop; //

   has_table(modem_id,db_name,function(has_x)
   {
        if(has_x)
        {
            var tb_name = "ht_" + modem_id;
            var index_next = 1;
        
            //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
            var sql = "";
            sql += " SELECT DISTINCT row_number() over (order by gps_datetime) as rownum ";
            sql += ",idate(gps_datetime) as gps_datetime ,status";

            sql += ",oil_percent as fuel_percentage";
            sql += " FROM " + tb_name;
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop);
            sql += " ORDER BY gps_datetime ";
        
             var temp ='';
        
            ipm.db.dbname = db_name;//db_owner;
            db.get_rows(ipm, sql, function (rows) 
            {
                 
                if (rows.length > 0) 
                { 
                    //debugger;
                    get_data_back(db_name,tb_name,start,stop,function(res_back)
                    {
                        if(res_back!=null)
                        {
                            var res={'dt_now':rows,'dt_ht':res_back};
                            callback(res);
                        }
                        else
                        {
                            console.log('+++ no data +++')
                            callback(false);
                            return;
                        }
                        
                    })
                  
                }
                else 
                {
                   // res.send([]);
                   console.log('+++ finish no data +++')
                   callback(true);
                    return;
                }
            });
        }
        else
        {
            console.log('+++ no table +++'+modem_id)
            callback(true);
            return;
        }
   })

   
   
}

function final_update_result(tb_name,res_ar,callback)
{
      async.eachSeries(res_ar, function (row, next)
       {
//debugger;
            var oil_percent = (100 - row.fuel_percentage_change);
            var x_time_min = row.start_service;
            var x_time_max= row.end_service;

            //debugger;

            update_fuel_zero(tb_name,oil_percent,x_time_min,x_time_max,function(xres)
            {
              next();                      
            });

                                        
         },function()
        {
           // debugger;
            console.log('+++ finish +++')
            callback(true);
            return;
        });

}

function update_oil_by_avg(db_name,tb_name,time,avg_oil,callback)
{
     var sql ="UPDATE "+tb_name+" SET fuel_avg="+utl.sqote(avg_oil)+" WHERE gps_datetime ="+utl.sqote(time);

     ocsb_excute(sql,db_name,function(res_ex1)
     {
        // console.log(res_ex1)
     
         callback(res_ex1)
         return;
     });
}

//AND modem_id='1110014020'
//AND modem_id='1110014045' AND modem_id='1110014026'  AND db_name ='db_10014'
function get_all_vehicle_calculate_diff_fuel(start_date)
{
    //to_char(now(), 'YYYY-MM-DD') is_fuel_invert='0' AND
  // var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";ORDER BY db_name is_calculate_fuel='1'  AND  modem_id='1010006003' AND db_name='db_10003' modem_id='1010006001' AND
   //var sql= "SELECT modem_id,db_name FROM master_config_vehicle WHERE is_calculate_fuel='1'  AND db_name !='db_10003'   ORDER BY db_name ; ";
   var sql= "SELECT modem_id,db_name FROM master_config_vehicle WHERE is_lpt_calgraph='1'   ORDER BY modem_id ; ";
   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (xres_ar) 
    {
            var date_now=moment(moment(start_date+' 00:00:00').format('YYYY-MM-DD'))
            var start = date_now.format('YYYY-MM-DD') + ' 00:00'
            var stop = date_now.format('YYYY-MM-DD') + ' 23:59'
         // debugger;
             async.eachSeries(xres_ar, function (row, inext)
             {
                
                // console.log(row.modem_id,row.date_process);
             
             //   var start =  '2017-01-07 00:00';//req.body.start; //
              //  var stop = '2017-01-07 23:59';//req.body.stop; //
      
                
            // var date_now='';
            // date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
            // date_now = date_now.subtract(1, 'days');
         
            //  console.log(date_now);
            var db_name = row.db_name;
            var modem_id = row.modem_id;
            var tb_name = "ht_" + modem_id;
            //clear global varialble
           res_ar = [];
           open_rownumber = 0;
           gps_datetime='';
           x_index =0;
           var current_row =0;
           do_process = true;
           db_owner = db_name;

            console.log('db_name '+db_name+' modemid '+modem_id+' start '+start+' stop '+stop)
          //  next();
           
            //update_oil_first_start
            /* */
 
                        calculate_fuel(db_name,modem_id,start,stop,function(is_data)
                        {
                            //res={'dt_now':rows,'dt_ht':res_back};
                            //debugger;
                            if(is_data!=false)
                            {
                                async.eachSeries(is_data.dt_now, function (row, inext)
                                {
                                    
                                    minus_time_minute(row.gps_datetime,function(xres)
                                    {
                                        
                                          get_avg_fuel(is_data.dt_ht,xres.start,xres.stop,function(avg_10min)
                                          {
                                            console.log(avg_10min);
                                            update_oil_by_avg(db_name,tb_name,row.gps_datetime,avg_10min,function(x)
                                            {
                                                inext();
                                            })
                                          })
                                    })
                                },function(){
                                      
                                     console.log('finish  vehicle '+modem_id);
                                });
                            }
                           
                          
                        });
               
           

             },function(){
                  
                 console.log('finish all vehicle');
             });
            
    });

}



// setTimeout(function () {
//     get_all_vehicle_calculate_fuel();
// }, 1000);

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00//23;
rule.minute = 30//59;

/*   
pm2.connect(function(err) 
{
    if (err) throw err;

  setTimeout(function worker() {
    console.log("Restarting app...");
    pm2.restart('gen_fuel_vehicle_standard', function() {});
     setTimeout(worker, 1000); 
  }, 60 * 60 * 1000);
     //setTimeout(worker, 60 * 60 * 1000);
});
 */
//#region
  
/*    */
schedule.scheduleJob(rule, function ()
{
    
    var date_now='';
       date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
       date_now = date_now.subtract(1, 'days');

    //start_date = date_now.format('YYYY-MM-DD') + ' 00:00'
   // end_date = date_now.format('YYYY-MM-DD') + ' 23:59'

  var xdate = date_now.format('YYYY-MM-DD');

   console.log('Calculate Fuel  This runs at 00:30 every day. ');
    debugger;

    get_all_vehicle_calculate_fuel(xdate);

});

/*
//2018-10-23 error
//'2018-11-20' 2018-11-25 1110014035 ค้าง update_oil_first_start true */
setTimeout(function () {
       debugger; 


    var xdate =  '2020-03-13';//req.body.start; //2018-11-17'

 
 //update_oil_first_start

    get_all_vehicle_calculate_diff_fuel(xdate);
/*
   minus_time_minute('2020-03-12 06:33:01',function(xres)
   {
        console.log(xres);
   })
   */

 }, 1000);





 //UPDATE  master_config_vehicle SET is_lpt_calgraph='1' WHERE modem_id='1010006004'