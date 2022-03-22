
//#region
var mustache = require("mustache");
var timespan = require('timespan');
var async = require('async');
var moment = require('moment');
var schedule = require('node-schedule');

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
//#endregion

    //1010001030

function driving_temp()
{
    this.start_rownum='';
    this.end_rownum='';
    this.start_service = '';
    this.end_service = '';
    this.fuel_percentage_change ='';
   
}


function HOUR(min) {
    var ts = timespan.fromMinutes(min);
    //  console.log(ts);
    var result = 0;
    utl.is_undefined(ts, function (is_true) {
        if (is_true) {
            result = 0;
        } else {
            result =ts.days + ' days '+ ts.hours + ' hr' + ts.minutes+' mi';
        }
    })

    return result;
}

function find_fuel_before_change(data, callback)
{
   // debugger;
     var x_res = linq.Enumerable.From(data)
     .Where(function (x) { return parseInt(x.input_status) == 0 })
     .Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
     .ToArray();

     callback(x_res);
    return;
}

function find_open_service(data, x_index, callback) 
{   
    var json_result={'gps_datetime':'','rownum':'','oil_percent_beforechange':''};
    

//find id < 0 
  var x_id = null;
     x_id = linq.Enumerable.From(data)
    .Where(function (x) { return parseFloat(x.fuel_percentage) <= 0 })
    .Where(function (x) { return parseInt(x.rownum) > x_index })
    .FirstOrDefault();

    if(x_id !==undefined)
   {
            var x_res = null;
        x_res = linq.Enumerable.From(data)
        .Where(function (x) { return x.input_status > 0})
        .Where(function (x) { return parseFloat(x.fuel_percentage) > 0 })
        .Where(function (x) { return parseInt(x.rownum) <=  parseInt(x_id.rownum) })
        .OrderByDescending("$.gps_datetime")
        .FirstOrDefault();

        if(x_res !==undefined)
        {
            var row_num = parseInt(x_res.rownum);
        //  var row_num_minus1 = row_num -1;
        //  debugger;

            json_result.oil_percent_beforechange = linq.Enumerable.From(data)
            .Where(function (x) { return parseInt(x.rownum) == row_num })
            .Select(function (x) { return parseFloat(x.fuel_percentage) })
            .FirstOrDefault();

            json_result.gps_datetime = x_id.gps_datetime; //x_res.gps_datetime;
            json_result.rownum = row_num ;

                callback(json_result);
            return;
        }
        else if(x_id.rownum =='1' || x_id.rownum =='2')
        {
                        var x_res = null;
                    x_res = linq.Enumerable.From(data)
                    .Where(function (x) { return x.input_status > 0})
                    .Where(function (x) { return parseFloat(x.fuel_percentage) > 0 })
                    //.OrderByAscending("$.gps_datetime")
                    .FirstOrDefault();

                    if(x_res !==undefined)
                    {
                        var row_num = parseInt(x_res.rownum);
                        json_result.gps_datetime = x_id.gps_datetime; //x_res.gps_datetime;
                        json_result.rownum = row_num ;

                        callback(json_result);
                        return;
                    }
                    else
                    {
                        json_result.row_num ='stop'
                        callback(json_result);
                        return;
                    }
                

            }  
            else
            {
                        json_result.row_num ='stop'
                        callback(json_result);
                        return;
           }
            
        
    }
    else
    {
         json_result.row_num ='stop'
         callback(json_result);
         return;
    }


}

function find_close_service(data,  gps_datetime,row_endservice,res_end_working, callback) 
{
    var row_num = null
     row_num = linq.Enumerable.From(data)
    .Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
    .Where(function (x) { return x.gps_datetime >= gps_datetime })
    .Where(function (x) { return parseInt(x.status) == 3 })
    .Select(function (x) { return parseInt(x.rownum) })
    .FirstOrDefault();

 //case of cutting loading = 5 at end of days
  if(row_num >= res_end_working.id_start   && row_num <= res_end_working.id_end )
  {
       //  debugger
 
        var xres = linq.Enumerable.From(data)
        .Where(function (x) { return parseInt(x.rownum) == row_num  })
        .ToArray();

        xres[0].rownum = row_endservice;
        callback(xres[0]);
       return;
         
  }
  else
  {
    if(row_num !=null)
    {
      //  row_num = row_num-1;
      // debugger;
       var xres = linq.Enumerable.From(data)
        .Where(function (x) { return parseInt(x.rownum) == row_num  })
        .ToArray();

        callback(xres[0]);
       return;
    }
    else
    {
      //  debugger;
         var xres=linq.Enumerable.From(data)
        .Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
        .Where(function (x) { return x.gps_datetime >= gps_datetime })
        .FirstOrDefault();

        if(xres !==undefined)
        {
            xres.rownum = row_endservice;
            callback(xres);
           return;
        } 
        else
        {
            var xres=linq.Enumerable.From(data)
            //.Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
            .Where(function (x) { return x.gps_datetime >= gps_datetime })
            .OrderByDescending("$.gps_datetime")
            .FirstOrDefault();

            xres.rownum = row_endservice;
            callback(xres);
            return;
        }

    }
  }  


}

//หาจุดสุดท้ายของข้อมูลที่ค่าเป็นศูนย์ 
function find_end_service(data, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return parseFloat(x.fuel_percentage) < 0 })
    .Select(function (x) { return parseInt(x.rownum) })
    .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

   // debugger;
     
     callback(x_end_rownum);
     return;
    
}

function update_fuel_zero(tb_name,oil_percent,x_time_min,x_time_max,callback)
{
  debugger;
 var sql ="UPDATE "+tb_name+" SET oil_percent="+utl.sqote(oil_percent)+" WHERE gps_datetime >="+utl.sqote(x_time_min)+' AND gps_datetime <='+utl.sqote(x_time_max);
     ocsb_excute(sql,db_owner,function(res_ex1)
     {
        // console.log(res_ex1)
     
         callback(res_ex1)
         return;
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

 

function fill_fuel_before_change(data,tb_name,next_id,rownum_next,oil_percent, callback)
{
  //  debugger;
    var x_fuel_percentage = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.rownum) == next_id})
    .Where(function (x) { return parseFloat(x.fuel_percentage) <= 0 })
    .Select(function (x) { return x.fuel_percentage })
    .FirstOrDefault();


    var x_time_min = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.rownum) >= next_id})
    .Where(function (x) { return parseFloat(x.fuel_percentage) == x_fuel_percentage })
    .Select(function (x) { return x.gps_datetime  })
    .Min();

     var x_time_max = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.rownum) >= next_id})
    .Where(function (x) { return parseInt(x.rownum) <= rownum_next})
    .Where(function (x) { return parseFloat(x.fuel_percentage) == x_fuel_percentage })
    .Select(function (x) { return x.gps_datetime })
    .Max();

     debugger;

    update_fuel_zero(tb_name,oil_percent,x_time_min,x_time_max,function(xres)
    {
         callback(xres)
         return;
    })


  
}

 

function update_oil_first_start(modem_id,start,stop,fuelempty,fuelfull,callback)
{
 /**/
 debugger
var sql="UPDATE ht_"+modem_id+" SET oil_percent =round (((analog_input1::DECIMAL - "+fuelempty+")*100 / "+fuelfull+" -"+fuelempty+"),2)::FLOAT ";
sql +=" WHERE gps_datetime >="+utl.sqote(start) //'2016-12-21 00:00:00'
sql +=" AND gps_datetime <="+utl.sqote(stop) //'2016-12-21 23:59:00'

 ocsb_excute(sql,db_owner,function(res_ex1)
     {
         callback(res_ex1)
         return;
     });

}

function is_first_record_fuel_zero(data,tb_name,callback)
{
      var is_first_zero = linq.Enumerable.From(data)
     .Where(function (x) { return parseFloat(x.fuel_percentage) < '0'})
     .Where(function (x) { return parseInt(x.rownum) == 1 })
     .FirstOrDefault();


     if(is_first_zero !==undefined)
     {
        var row_end = null
        row_end = linq.Enumerable.From(data)
        .Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
        .Where(function (x) { return parseInt(x.status) == 3 })
        .FirstOrDefault();


        if(row_end !==undefined)
        {
            var start_time =  is_first_zero.gps_datetime;
            var end_time   =  row_end.gps_datetime;
            var fuel_percentage =    row_end.fuel_percentage;

            debugger;

            update_fuel_zero(tb_name,fuel_percentage,start_time,end_time,function(xupdate)
            {
                 callback(true);
                 return;
            })
        }
        else{
            callback(true);
            return;
        }

     }
     else
     {
         callback(true);
         return;
     }

}

function is_end_record_working(data,callback)
{
   // debugger
      var x_working_end = linq.Enumerable.From(data)
   // .Where(function (x) { return parseInt(x.input_status) == 5 })
    .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

   var x_working_start = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.input_status) != 5 })
    .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

  
     var id_start = parseInt(x_working_start.rownum);
     var id_end = parseInt(x_working_end.rownum);

    id_start =  id_start !==NaN ? id_start : id_end;

    var res ={"id_start":id_start ,"id_end":id_end };
    callback(res);
    return;

}

function get_fuel_full_and_empty(modem_id,callback)
{
   var sql= "SELECT fuelempty,fuelfull FROM master_config_vehicle WHERE modem_id="+utl.sqote(modem_id);
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
       // debugger    
        if (rows.length > 0) 
        { 
           // rows[0].fuelempty 
           // rows[0].fuelfull;
           callback(rows);
           return;
        }
    });
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

  //  debugger;
    // Isauthenticate(req, res, function () {
   // var db_name = 'db_10003'; //req.body.fleetid; //
  //  var modem_id = '1010003016';// req.body.modemid; //
   // var start =  '2017-01-08 00:00';//req.body.start; //
   // var stop = '2017-01-08 23:59';//req.body.stop; //
    var tb_name = "ht_" + modem_id;
    var index_next = 1;

    //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
    var sql = "";
    sql += " SELECT DISTINCT row_number() over (order by gps_datetime) as rownum ";
    sql += ",idate(gps_datetime) as gps_datetime ,CASE WHEN input_status =4 THEN '5' ELSE input_status END as input_status,status";
    sql += ",tambol||':'||amphur||':'||province as tloc ";
    sql += ",etambol||':'||eamphur||':'||eprovince as eloc,oil_percent as fuel_percentage,'' as close_service";
   // sql += ",status,round (((analog_input1::DECIMAL -0.3000)*100 / 3.9 -0.300),2)::text  as fuel_percentage";
    sql += " FROM " + tb_name;
    sql += " WHERE  gps_datetime >= " + utl.sqote(start);
    sql += " AND gps_datetime <=" + utl.sqote(stop);
    sql += " ORDER BY gps_datetime ";

     var temp ='';

    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (rows) 
    {
         
        if (rows.length > 0) 
        { 

            is_end_record_working(rows,function(res_end_working)
            {

                is_first_record_fuel_zero(rows,tb_name,function(res_is_first_zero)
                {    
                    
                    find_end_service(rows,function(row_endservice)
                    {
                       // debugger;
                        //  console.log(row_endservice);

                    // for(var i=0;i<=rows.length;i++)
                        var find_start = true;

                        while(do_process)
                        {
                            
                            if(find_start)
                            {
                                temp = new driving_temp();
                                // gps_datetime = rows[i].gps_datetime;
                                find_open_service(rows,x_index,function(xres)
                                {
                                    //  debugger
                                    if(xres.row_num !='stop')
                                    {
                                         find_start = false;
                                        // i = xres.rownum;
                                        gps_datetime = xres.gps_datetime;
                                        temp.start_rownum = xres.rownum;
                                        temp.start_service = xres.gps_datetime;
                                        temp.fuel_percentage_change = xres.oil_percent_beforechange;
                                    }
                                    else
                                    {
                                         do_process = false;
                                        console.log(res_ar);
                                        final_update_result(tb_name,res_ar,function(final_result)
                                        {
                                            callback(final_result);
                                            return;
                                        })
                                    }
                                   
                                })
                            }
                            else
                            {
                                

                            find_close_service(rows,gps_datetime,row_endservice,res_end_working,function(xres)
                            {
                                // 
                                
                                if(row_endservice != xres.rownum)
                                {
                                    temp.end_rownum = xres.rownum;
                                    temp.end_service = xres.gps_datetime;

                                    temp.fuel_percentage_change =  parseFloat(xres.fuel_percentage) > temp.fuel_percentage_change ? parseFloat(xres.fuel_percentage) :temp.fuel_percentage_change;
                                    x_index = temp.end_rownum;

                                //   console.log(temp);
                                    res_ar.push(temp);
                                // i = -1;
                                find_start = true;
                                }
                                else
                                {
                                    debugger
                                    //finish 
                                    temp.end_rownum = xres.rownum;
                                    temp.end_service = xres.gps_datetime;
                                    x_index = temp.end_rownum;
                                    res_ar.push(temp);

                                
                                    do_process = false;
                                    console.log(res_ar);
                                    final_update_result(tb_name,res_ar,function(final_result)
                                    {
                                        callback(final_result);
                                        return;
                                    })
                                  
                                }

                            })

                            }
                            
                        }

                    })
                });

            });
          
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

function final_update_result(tb_name,res_ar,callback)
{
      async.eachSeries(res_ar, function (row, next)
       {

            var oil_percent = row.fuel_percentage_change;
            var x_time_min = row.start_service;
            var x_time_max= row.end_service;

            debugger;

            update_fuel_zero(tb_name,oil_percent,x_time_min,x_time_max,function(xres)
            {
              next();                      
            });

                                        
         },function()
        {
            debugger;
            console.log('+++ finish +++')
            callback(true);
            return;
        });

}


function get_all_vehicle_calculate_fuel(start_date)
{
    //to_char(now(), 'YYYY-MM-DD')
  // var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2"; AND db_name='db_10003' 
   var sql= "SELECT modem_id,db_name FROM master_config_vehicle WHERE is_calculate_fuel='1' AND db_name='db_10003'  AND modem_id !='1010003026' ORDER BY modem_id ; ";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_ar) 
    {
            var date_now=moment(moment(start_date+' 00:00:00').format('YYYY-MM-DD'))
            var start = date_now.format('YYYY-MM-DD') + ' 00:00'
            var stop = date_now.format('YYYY-MM-DD') + ' 23:59'
         // debugger;
             async.eachSeries(res_ar, function (row, next)
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

            //clear global varialble
           res_ar = [];
           open_rownumber = 0;
           gps_datetime='';
           x_index =0;
           do_process = true;


            console.log('db_name '+db_name+' modemid '+modem_id+' start '+start+' stop '+stop)
          //  next();
           
            //update_oil_first_start
            /* */
                get_fuel_full_and_empty(modem_id,function(x)
                {
                    console.log(modem_id);
                    console.log(x[0].fuelempty);
                    console.log(x[0].fuelfull);

                    update_oil_first_start(modem_id,start,stop,x[0].fuelempty,x[0].fuelfull,function(xres)
                    {
                        console.log(' update_oil_first_start '+xres);
                        calculate_fuel(db_name,modem_id,start,stop,function(is_finish)
                        {
                            debugger;
                            if(is_finish)
                            {
                                 console.log('finish '+is_finish+' '+modem_id);
                                 next();
                            }else{
                                console.log('xfinish '+is_finish+' '+modem_id);
                                next();
                            }
                          
                        })
                    })
                
                    
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

   console.log('Harvester find total working  This runs at 00:30 every day. ');
    debugger;

    get_all_vehicle_calculate_fuel(xdate);

});


  /*   
setTimeout(function () {
       debugger;

    var xdate =  '2017-01-30';//req.body.start; //

 
 //update_oil_first_start

    get_all_vehicle_calculate_fuel(xdate);

 }, 1000);
 
 */