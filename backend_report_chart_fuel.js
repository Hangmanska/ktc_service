
//#region
var mustache = require("mustache");
var timespan = require('timespan');
var async = require('async');


var linq = require('linq.js');
var db = require('iConnectdb_ktc.js');

var genfuel_now = require('iGen_fuel_vehicle_standard.js');

var iconn = require('conn_sugar_cane.js');
var pg_htt = new db.im2(iconn.get_dbconfig_htt());
var ipm = new db.im2(iconn.get_dbconfig_realtime());

var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10003";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
//var db_config = "master_config";
//#endregion

    //1010001030

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

//var REFERENCE = moment(utcp.now()); // fixed just for testing, use moment();
//var TODAY = REFERENCE.clone().startOf('day');




function chart_oil_percent(req, res) 
{
    //#region
    /*
 SELECT DISTINCT gps_datetime
 ,speed
  ,tambol||amphur||province as tloc , etambol||eamphur||eprovince as eloc,status
  FROM ht_1010001030
 WHERE  gps_datetime >= '2016-09-09 00:00'
 AND gps_datetime <='2016-09-09 23:59'
ORDER BY gps_datetime

   var db_name = 'db_10033'; //req.body.fleetid; //
    var modem_id =  '142181155700';//req.body.modemid; //
    var start = '2019-08-03 00:00';//req.body.start; // 
    var stop = '2019-08-03 23:59' //req.body.stop; //'2017-01-07 23:59';//
    var tb_name = "ht_" + modem_id;

  */
  
    //#endregion
    var db_name = req.body.fleetid; //'db_10003'; //
    var modem_id =  req.body.modemid; //'1010003020';//
    var start = req.body.start; // '2017-01-07 00:00';//
    var stop = req.body.stop; //'2017-01-07 23:59';//
    var tb_name = "ht_" + modem_id;

    //res.send('5555');
 
  //  console.log('db_name ='+db_name+' modem_id='+modem_id)
    /*    */
    if(db_name != 'db_10032')
    {
        debugger;
        is_vt900_this_vehicle_set_calfuel(modem_id,function(_is_vt900_cal_fuel)
        {

            if(_is_vt900_cal_fuel)
            {
                main_show_result(db_name,tb_name,start,stop,res);
            }
            else
            {
                genfuel_now.main_cal_fuel_now(modem_id,start,function(xresf)
                {
                    if(xresf)
                    {
                           // Isauthenticate(req, res, function () {
            
                            main_show_result(db_name,tb_name,start,stop,res);
                         
                    }
                })
            }

        });

     
    }
    else
    {
     chart_oil_percent2(req, res);
      // res.send('5555');
    }
 

}

/*

if(modem_id !='142181155700')
{
   
}else{
    main_show_result_lpt(db_name,tb_name,start,stop,res);
}
*/


function main_show_result(db_name,tb_name,start,stop,res)
{
       //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
       var sql = "";
       sql += " SELECT DISTINCT gps_datetime";
       sql += " ,COALESCE(oil_percent,0.0) as oil_percent ";
       sql += " ,COALESCE(oil_liter,0.0) as oil_liter ";
       sql += ",tambol||':'||amphur||':'||province as tloc ";
       sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
       if(db_name !='db_10036'){
        sql += ",status";
       }else{
        sql += ",CASE  WHEN CAST(analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as status";
       }
    
       sql += " FROM " + tb_name;
       sql += " WHERE  gps_datetime >= " + utl.sqote(start);
       sql += " AND gps_datetime <=" + utl.sqote(stop);
       sql += " ORDER BY gps_datetime ASC";
   

       ipm.db.dbname = db_name;
       db.get_rows(ipm, sql, function (rows) {
           debugger;
           if (rows.length > 0) {
               debugger;
           //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
               var strMustache1 = '{{#.}}';
               strMustache1 += '"{{gps_datetime}}"';
               strMustache1 += ',';
               strMustache1 += '{{/.}}';

               var strMustache2 = '{{#.}}';
               strMustache2 += '{{oil_percent}}';
               strMustache2 += ',';
               strMustache2 += '{{/.}}';

               var strMustache3='';
               var strMustache4='';

               if(db_name =='db_10006')
               {
               strMustache3 = '{{#.}}';
               strMustache3 += '"{{tloc}} | {{oil_liter}} เปอร์เซ็นต์"';
               strMustache3 += ',';
               strMustache3 += '{{/.}}';
 
               strMustache4 = '{{#.}}';
               strMustache4 += '"{{eloc}} | {{oil_liter}} Percent"';
               strMustache4 += ',';
               strMustache4 += '{{/.}}';
               
              }
              else if(db_name !='db_10036')
               {
               strMustache3 = '{{#.}}';
               strMustache3 += '"{{tloc}} | {{oil_percent}} เปอร์เซ็นต์"';
               strMustache3 += ',';
               strMustache3 += '{{/.}}';

               strMustache4 = '{{#.}}';
               strMustache4 += '"{{eloc}} | {{oil_percent}} Percent"';
               strMustache4 += ',';
               strMustache4 += '{{/.}}';
               
              }           
              else
              {
                strMustache3 = '{{#.}}';
                strMustache3 += '"{{tloc}} | {{oil_percent}} ลิตร"';
                strMustache3 += ',';
                strMustache3 += '{{/.}}';
 
                strMustache4 = '{{#.}}';
                strMustache4 += '"{{eloc}} | {{oil_percent}} Liter"';
                strMustache4 += ',';
                strMustache4 += '{{/.}}';
              }

               var strMustache5 = '{{#.}}';
               strMustache5 += '{{status}}';
               strMustache5 += ',';
               strMustache5 += '{{/.}}';

               var result1 = mustache.render(strMustache1, rows);
               var result2 = mustache.render(strMustache2, rows);
               var result3 = mustache.render(strMustache3, rows);
               var result4 = mustache.render(strMustache4, rows);
               var status = mustache.render(strMustache5, rows);

               result1 = utl.iRmend(result1);
               result1 = '{ "name":"time","data":[' + result1 + '] }';
               result1 = result1.replace(/&quot;/g, '"');

               result2 = utl.iRmend(result2);
               result2 = '{ "oil_percent":"xoil_percent","data":[' + result2 + '] }';
               result2 = result2.replace(/&quot;/g, '"');

               result3 = utl.iRmend(result3);
               result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
               result3 = result3.replace(/&quot;/g, '"');

               result4 = utl.iRmend(result4);
               result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
               result4 = result4.replace(/&quot;/g, '"');

               status = utl.iRmend(status);
               status = '{ "status":"xstatus","data":[' + status + '] }';
               status = status.replace(/&quot;/g, '"');

               res.send('['+result1 +','+ result2+','+ result3+','+ result4+','+status+']');
           }
           else {
               res.send([]);
           }
       });
}


function check_case_status(modem_id,callback)
{
  var sql=" SELECT COALESCE(ital_is_usecase_status,'0') as ital_is_usecase_status "  
  sql+="  FROM master_config_vehicle ";
  sql+="  WHERE modem_id='"+modem_id+"' ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
        if (rows.length > 0)
        {
            callback(rows[0]['ital_is_usecase_status'])
            return;
        }
    });
}

function chart_oil_percent_avg_with_realval(req, res) 
{
    //#region
    /*
 SELECT DISTINCT gps_datetime
 ,speed
  ,tambol||amphur||province as tloc , etambol||eamphur||eprovince as eloc,status
  FROM ht_1010001030
 WHERE  gps_datetime >= '2016-09-09 00:00'
 AND gps_datetime <='2016-09-09 23:59'
ORDER BY gps_datetime

   var db_name = 'db_10033'; //req.body.fleetid; //
    var modem_id =  '142181155700';//req.body.modemid; //
    var start = '2019-08-03 00:00';//req.body.start; // 
    var stop = '2019-08-03 23:59' //req.body.stop; //'2017-01-07 23:59';//
    var tb_name = "ht_" + modem_id;

  */
  
    //#endregion
    var db_name = req.body.fleetid; //'db_10003'; //
    var modem_id =  req.body.modemid; //'1010003020';//
    var start = req.body.start; // '2017-01-07 00:00';//
    var stop = req.body.stop; //'2017-01-07 23:59';//
    var tb_name = "ht_" + modem_id;

  //  tb_name ="ht_1010006004";
  //  db_name="db_10006";
       //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
       var sql = "";
       sql += " SELECT DISTINCT gps_datetime";
       sql += " ,COALESCE(oil_percent,0.0) as oil_percent ";
       sql += " ,COALESCE(oil_liter,0.0) as oil_liter ";
       sql += ",tambol||':'||amphur||':'||province as tloc ";
       sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
       //italthai
       if(db_name !='db_10036')
       {
        sql += ",status,fuel_avg";
       }
       else
       {
            check_case_status(modem_id,function(result)
            {
                var sql="";
                if(result=='0') //
                {
                  //sql += ",CASE  WHEN CAST(analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as status";
                  sql += "  ,CASE   WHEN CAST(analog_input2 as int)=2400 THEN '3'  ";
                  sql += " WHEN CAST(analog_input2 as int)=2402 THEN '3' ";
                  sql += " WHEN CAST(analog_input2 as int)=2600 THEN '2'  ";
                  sql += " WHEN CAST(analog_input2 as int)=2602 THEN '2'  ";
                  sql += " WHEN CAST(analog_input2 as int)=2000 THEN '1'  ";
                  sql += " ELSE status END as status ";
                }
                else
                {
                    sql += "  ,CASE   WHEN CAST(analog_input2 as int)=2600 THEN '3'  ";
                    sql += " WHEN CAST(analog_input2 as int)=2602 THEN '3' ";
                    sql += " WHEN CAST(analog_input2 as int)=2200 THEN '2'  ";
                    sql += " WHEN CAST(analog_input2 as int)=2202 THEN '2'  ";
                    sql += " WHEN CAST(analog_input2 as int)=2000 THEN '1'  ";
                    sql += " ELSE status END as status ";
                }

                sql += " FROM " + tb_name;
                sql += " WHERE  gps_datetime >= " + utl.sqote(start);
                sql += " AND gps_datetime <=" + utl.sqote(stop);
                sql += " ORDER BY gps_datetime ASC";
            
         
                ipm.db.dbname = db_name;
                db.get_rows(ipm, sql, function (rows) {
                    debugger;
                    if (rows.length > 0) {
                        debugger;
                    //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
                        var strMustache1 = '{{#.}}';
                        strMustache1 += '"{{gps_datetime}}"';
                        strMustache1 += ',';
                        strMustache1 += '{{/.}}';
         
                        var strMustache2 = '{{#.}}';
                        strMustache2 += '{{oil_percent}}';
                        strMustache2 += ',';
                        strMustache2 += '{{/.}}';
         
                        var strMustache3='';
                        var strMustache4='';
         
                        if(db_name !='db_10036')
                        {
                        strMustache3 = '{{#.}}';
                        strMustache3 += '"{{tloc}} | {{oil_percent}} เปอร์เซ็นต์"';
                        strMustache3 += ',';
                        strMustache3 += '{{/.}}';
         
                        strMustache4 = '{{#.}}';
                        strMustache4 += '"{{eloc}} | {{oil_percent}} Percent"';
                        strMustache4 += ',';
                        strMustache4 += '{{/.}}';
                        
                       }
                       else
                       {
                         strMustache3 = '{{#.}}';
                         strMustache3 += '"{{tloc}} | {{oil_percent}} ลิตร"';
                         strMustache3 += ',';
                         strMustache3 += '{{/.}}';
          
                         strMustache4 = '{{#.}}';
                         strMustache4 += '"{{eloc}} | {{oil_percent}} Liter"';
                         strMustache4 += ',';
                         strMustache4 += '{{/.}}';
                       }
         
                        var strMustache5 = '{{#.}}';
                        strMustache5 += '{{status}}';
                        strMustache5 += ',';
                        strMustache5 += '{{/.}}';
         
                        var strMustache6 = '{{#.}}';
                        strMustache6 += '{{fuel_avg}}';
                        strMustache6 += ',';
                        strMustache6 += '{{/.}}';
         
                        var result1 = mustache.render(strMustache1, rows);
                        var result2 = mustache.render(strMustache2, rows);
                        var result3 = mustache.render(strMustache3, rows);
                        var result4 = mustache.render(strMustache4, rows);
                   
                        var status = mustache.render(strMustache5, rows);
         
                        var result5 = mustache.render(strMustache6, rows);
         
                        result1 = utl.iRmend(result1);
                        result1 = '{ "name":"time","data":[' + result1 + '] }';
                        result1 = result1.replace(/&quot;/g, '"');
         
                        result2 = utl.iRmend(result2);
                        result2 = '{ "oil_percent":"xoil_percent","data":[' + result2 + '] }';
                        result2 = result2.replace(/&quot;/g, '"');
                        
         
                        result3 = utl.iRmend(result3);
                        result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
                        result3 = result3.replace(/&quot;/g, '"');
         
                        result4 = utl.iRmend(result4);
                        result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
                        result4 = result4.replace(/&quot;/g, '"');
         
                        result5 = utl.iRmend(result5);
                        result5 = '{ "fuel_avg":"xfuel_avg","data":[' + result5 + '] }';
                        result5 = result5.replace(/&quot;/g, '"');
         
                        status = utl.iRmend(status);
                        status = '{ "status":"xstatus","data":[' + status + '] }';
                        status = status.replace(/&quot;/g, '"');
         
                        res.send('['+result1 +','+ result2+','+ result3+','+ result4+','+ result5+','+status+']');
                    }
                    else {
                        res.send([]);
                    }
                });
         
         

            });
       
        }
    

}




function is_vt900_this_vehicle_set_calfuel(modem_id,call_back)
{
    var sql = "";
    sql += " SELECT ref_min,ref_max,act1_max,act1_max,tank_width,tank_length,tank_height,tank_liter,is_calculate_fuel  ";
    sql += " FROM master_config_vehicle  ";
    sql += " WHERE modem_id=" +utl.sqote(modem_id)+" ";
    sql += " AND is_calculate_fuel IS NOT NULL ";

    
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0) 
        {
            call_back(true);
            return;
        }
        else
        {
            call_back(false);
            return;
        }
    });
}


function chart_oil_percent2(req, res) 
{
    //#region
    /*
 SELECT DISTINCT gps_datetime
 ,speed
  ,tambol||amphur||province as tloc , etambol||eamphur||eprovince as eloc,status
  FROM ht_1010001030
 WHERE  gps_datetime >= '2016-09-09 00:00'
 AND gps_datetime <='2016-09-09 23:59'
ORDER BY gps_datetime

    var db_name = 'db_10032'; //req.body.fleetid; //
    var modem_id =  '142181155693';//'142181155693';//req.body.modemid; //
    var start = '2019-03-18 00:00';//req.body.start; // 
    var stop = '2019-03-18 23:59' //req.body.stop; //'2017-01-07 23:59';//
    var tb_name = "ht_" + modem_id;
  */
   var db_name = req.body.fleetid; //'db_10003'; //
    var modem_id =  req.body.modemid; //'1010003020';//
    var start = req.body.start; // '2017-01-07 00:00';//
    var stop = req.body.stop; //'2017-01-07 23:59';//
    var tb_name = "ht_" + modem_id;


  
    //#endregion


 

    debugger;
 
               // Isauthenticate(req, res, function () {


                //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
                var sql = "";
                sql += " SELECT DISTINCT gps_datetime";
                sql += " ,coalesce(oil_liter,'0') as oil_liter";
                
                sql += " ,coalesce(oil_percent,'0') as oil_percent";
                sql += ",tambol||':'||amphur||':'||province as tloc ";
                sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
                sql += ",status";
                sql += " FROM " + tb_name;
                sql += " WHERE  gps_datetime >= " + utl.sqote(start);
                sql += " AND gps_datetime <=" + utl.sqote(stop);
                sql += " ORDER BY gps_datetime ASC ";
            

                ipm.db.dbname = db_name;
                db.get_rows(ipm, sql, function (rows) {
                    debugger;
                   
              //      console.log('chart_oil_percent2 db_name ='+db_name+' modem_id='+modem_id+' leangt='+ rows.length)
                    if (rows.length > 0) {
                        debugger;
                    //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
                        var strMustache1 = '{{#.}}';
                        strMustache1 += '"{{gps_datetime}}"';
                        strMustache1 += ',';
                        strMustache1 += '{{/.}}';

                        var strMustache2 = '{{#.}}';
                        strMustache2 += '{{oil_liter}}';
                        strMustache2 += ',';
                        strMustache2 += '{{/.}}';

                        var strMustache3 = '{{#.}}';
                        strMustache3 += '"{{tloc}} | {{oil_percent}} เปอร์เซ็นต์"';
                        strMustache3 += ',';
                        strMustache3 += '{{/.}}';

                        var strMustache4 = '{{#.}}';
                        strMustache4 += '"{{eloc}} | {{oil_percent}} Percent"';
                        strMustache4 += ',';
                        strMustache4 += '{{/.}}';

                        var strMustache5 = '{{#.}}';
                        strMustache5 += '{{status}}';
                        strMustache5 += ',';
                        strMustache5 += '{{/.}}';

                        var result1 = mustache.render(strMustache1, rows);
                        var result2 = mustache.render(strMustache2, rows);
                        var result3 = mustache.render(strMustache3, rows);
                        var result4 = mustache.render(strMustache4, rows);
                        var status = mustache.render(strMustache5, rows);

                        result1 = utl.iRmend(result1);
                        result1 = '{ "name":"time","data":[' + result1 + '] }';
                        result1 = result1.replace(/&quot;/g, '"');

                        result2 = utl.iRmend(result2);
                        result2 = '{ "oil_percent":"xoil_percent","data":[' + result2 + '] }';
                        result2 = result2.replace(/&quot;/g, '"');

                        result3 = utl.iRmend(result3);
                        result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
                        result3 = result3.replace(/&quot;/g, '"');

                        result4 = utl.iRmend(result4);
                        result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
                        result4 = result4.replace(/&quot;/g, '"');

                        status = utl.iRmend(status);
                        status = '{ "status":"xstatus","data":[' + status + '] }';
                        status = status.replace(/&quot;/g, '"');

                        res.send('['+result1 +','+ result2+','+ result3+','+ result4+','+status+']');
                    }
                    else {
                        res.send([]);
                    }
                });
        
  
   
}


exports.chart_oil_percent = chart_oil_percent;

exports.chart_oil_percent_avg_with_realval = chart_oil_percent_avg_with_realval;

    /*   
setTimeout(function () {
      debugger;
   // var iss =  isToday('2017-04-10 00:00')
  //  console.log(iss)
    chart_oil_percent('','');
 }, 1000);
 */