var schedule = require('node-schedule');
var mustache = require("mustache");
var timespan = require('timespan');
var moment = require('moment');

var async = require('async');
var squel = require("squel");
var linq = require('linq.js');
var db = require('iConnectdb_ktc.js');

var iconn = require('conn_sugar_cane.js');
var pg_htt = new db.im2(iconn.get_dbconfig_htt());
var ipm = new db.im2(iconn.get_dbconfig_realtime());
var inout = require('inout_polygon.js');
var jrp_today = require('ocsb_tankwater_gen_report_speed_avg_today.js');

var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10003";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db_config = "master_config";
var buffer_default = 15;  //meter


/*
SELECT gps_datetime,speed
,CASE  WHEN CAST(input_status as int)=5 OR CAST(input_status as int)=3 THEN '4' ELSE status END status
,tambol,amphur,province
,lat,lon,modem_id
FROM ht_1010003020
WHERE gps_datetime >='2017-01-08 00:00'
AND gps_datetime <='2017-01-08 23:59'
and speed >= 5
--AND input_status =5
ORDER BY gps_datetime ASC 
 */

function get_all_watertank(date_process)
{
    //to_char(now(), 'YYYY-MM-DD')
  // var sql = "SELECT modem_id,vehiclename as harvester_name,'"+date_process+"' as date_process FROM tankwater_register";
  
  var sql = "";
  sql += "SELECT r.modem_id ";
  sql += ",get_vehiclename(r.modem_id) as harvester_name ";
  sql += ",'"+date_process+"' as date_process ";
  sql += " FROM	realtime as r, setup_vehicle as sv ";
  sql += " WHERE r.modem_id=sv.modem_id ";
  sql += " AND sv.fleetcode=get_fleetid('watertank') ";
  sql += " ORDER BY r.modem_id ";

    ipm.db.dbname = db_config; //db_sugarcane;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          /* */
          debugger;
             async.eachSeries(res_ar, function (row, next)
             {
                
                 console.log(row.modem_id,row.date_process);
                gen_data_maxspeed(row.modem_id,row.date_process,function(xres)
                {
                    if(xres)
                    {
                        next();
                    }
                });

             },function(){
                 console.log('finish');
             });
            
    });

}

//อันเก่า
function gen_data(modem_id,date_process,callback)
{
    var sql = "";
sql += "WITH res as( ";
sql += " SELECT '00' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 00:00' AND gps_datetime <='"+date_process+" 01:00' AND speed >0";
sql += " UNION ";
sql += " SELECT '01' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 01:00' AND gps_datetime <='"+date_process+" 02:00' AND speed >0";
sql += " UNION ";
sql += " SELECT '02' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 02:00' AND gps_datetime <='"+date_process+" 03:00' AND speed >0";
sql += " UNION ";
sql += " SELECT '03' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 03:00' AND gps_datetime <='"+date_process+" 04:00' AND speed >0";
sql += " UNION ";
sql += " SELECT '04' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 04:00' AND gps_datetime <='"+date_process+" 05:00' AND speed >0";
sql += " UNION ";
sql += " SELECT '05' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 05:00' AND gps_datetime <='"+date_process+" 06:00' AND speed >0";
sql += " UNION ";
sql += " SELECT '06' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 06:00' AND gps_datetime <='"+date_process+" 07:00' AND speed >0";
sql += " UNION ";
sql += " SELECT '07' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 07:00' AND gps_datetime <='"+date_process+" 08:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '08' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 08:00' AND gps_datetime <='"+date_process+" 09:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '09' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)   FROM ht_"+modem_id+"  WHERE  gps_datetime >='"+date_process+" 09:00' AND gps_datetime <='"+date_process+" 10:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '10' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 10:00'  AND gps_datetime <='"+date_process+" 11:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '11' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 11:00'  AND gps_datetime <='"+date_process+" 12:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '12' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 12:00' AND gps_datetime <='"+date_process+" 13:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '13' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)) ,count(speed) FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 13:00'  AND gps_datetime <='"+date_process+" 14:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '14' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 14:00' AND gps_datetime <='"+date_process+" 15:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '15' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 15:00' AND gps_datetime <='"+date_process+" 16:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '16' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 16:00'  AND gps_datetime <='"+date_process+" 17:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '17' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 17:00' AND gps_datetime <='"+date_process+" 18:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '18' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 18:00'  AND gps_datetime <='"+date_process+" 19:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '19' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 19:00'  AND gps_datetime <='"+date_process+" 20:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '20' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 20:00'  AND gps_datetime <='"+date_process+" 21:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '21' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)) ,count(speed) FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 21:00'  AND gps_datetime <='"+date_process+" 22:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '22' as id,CAST(AVG(COALESCE(speed,0) ) AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 22:00'  AND gps_datetime <='"+date_process+" 23:00' AND speed >0";
sql += " UNION  ";
sql += " SELECT '23' as id,CAST(AVG(COALESCE(speed,0) )AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 23:00'  AND gps_datetime <='"+date_process+" 00:00' AND speed >0";
sql += "   ) ";
sql += " SELECT * FROM res ORDER BY id ";


   ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          //debugger;
        if (res_ar.length > 0) 
        {    // var xres_ar=[];
         //  console.log( res_ar[5].avg);
         insert_2db(modem_id,date_process,res_ar,function(xres)
         {
             //console.log(xres);
              callback(xres);
              return;
         })

        }
        else
        {
            callback(true);
            return;

        }
    });

}

//
function gen_data_maxspeed(modem_id,date_process,callback)
{

    var sql = "";
    sql += "WITH res as( ";
    sql += " SELECT '00' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 00:00' AND gps_datetime <='"+date_process+" 01:00' AND speed >0";
    sql += " UNION ";
    sql += " SELECT '01' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 01:00' AND gps_datetime <='"+date_process+" 02:00' AND speed >0";
    sql += " UNION ";
    sql += " SELECT '02' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 02:00' AND gps_datetime <='"+date_process+" 03:00' AND speed >0";
    sql += " UNION ";
    sql += " SELECT '03' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 03:00' AND gps_datetime <='"+date_process+" 04:00' AND speed >0";
    sql += " UNION ";
    sql += " SELECT '04' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 04:00' AND gps_datetime <='"+date_process+" 05:00' AND speed >0";
    sql += " UNION ";
    sql += " SELECT '05' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 05:00' AND gps_datetime <='"+date_process+" 06:00' AND speed >0";
    sql += " UNION ";
    sql += " SELECT '06' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 06:00' AND gps_datetime <='"+date_process+" 07:00' AND speed >0";
    sql += " UNION ";
    sql += " SELECT '07' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 07:00' AND gps_datetime <='"+date_process+" 08:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '08' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 08:00' AND gps_datetime <='"+date_process+" 09:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '09' as id,COALESCE(MAX(speed),0) AS max,count(speed)   FROM ht_"+modem_id+"  WHERE  gps_datetime >='"+date_process+" 09:00' AND gps_datetime <='"+date_process+" 10:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '10' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 10:00'  AND gps_datetime <='"+date_process+" 11:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '11' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 11:00'  AND gps_datetime <='"+date_process+" 12:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '12' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 12:00' AND gps_datetime <='"+date_process+" 13:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '13' as id,COALESCE(MAX(speed),0) AS max ,count(speed) FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 13:00'  AND gps_datetime <='"+date_process+" 14:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '14' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 14:00' AND gps_datetime <='"+date_process+" 15:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '15' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 15:00' AND gps_datetime <='"+date_process+" 16:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '16' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 16:00'  AND gps_datetime <='"+date_process+" 17:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '17' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 17:00' AND gps_datetime <='"+date_process+" 18:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '18' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 18:00'  AND gps_datetime <='"+date_process+" 19:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '19' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 19:00'  AND gps_datetime <='"+date_process+" 20:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '20' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 20:00'  AND gps_datetime <='"+date_process+" 21:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '21' as id,COALESCE(MAX(speed),0) AS max ,count(speed) FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 21:00'  AND gps_datetime <='"+date_process+" 22:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '22' as id,COALESCE(MAX(speed),0) AS max,count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 22:00'  AND gps_datetime <='"+date_process+" 23:00' AND speed >0";
    sql += " UNION  ";
    sql += " SELECT '23' as id,CAST(COALESCE(MAX(speed),0)AS DECIMAL(10,2)),count(speed)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 23:00'  AND gps_datetime <='"+date_process+" 00:00' AND speed >0";
    sql += "   ) ";
    sql += " SELECT * FROM res ORDER BY id ";

   ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          //debugger;
        if (res_ar.length > 0) 
        {    // var xres_ar=[];
         //  console.log( res_ar[5].avg);
         insert_2db(modem_id,date_process,res_ar,function(xres)
         {
             //console.log(xres);
              callback(xres);
              return;
         })

        }
        else
        {
            callback(true);
            return;

        }
    });

}

function insert_2db(modem_id,date_process,ar,callback)
{

debugger
    var sql = squel.insert()
    .into('tankwater_avg_speed_report')
    .set('modem_id',modem_id)
    .set('date_process',date_process)
    .set('avg_00',isnull(ar[0].max))
    .set('avg_01',isnull(ar[1].max))
    .set('avg_02',isnull(ar[2].max))
    .set('avg_03',isnull(ar[3].max))
    .set('avg_04',isnull(ar[4].max))
    .set('avg_05',isnull(ar[5].max))
    .set('avg_06',isnull(ar[6].max))
    .set('avg_07',isnull(ar[7].max))
    .set('avg_08',isnull(ar[8].max))
    .set('avg_09',isnull(ar[9].max))
    .set('avg_10',isnull(ar[10].max))
    .set('avg_11',isnull(ar[11].max))
    .set('avg_12',isnull(ar[12].max))
    .set('avg_13',isnull(ar[13].max))
    .set('avg_14',isnull(ar[14].max))
    .set('avg_15',isnull(ar[15].max))
    .set('avg_16',isnull(ar[16].max))
    .set('avg_17',isnull(ar[17].max))
    .set('avg_18',isnull(ar[18].max))
    .set('avg_19',isnull(ar[19].max))
    .set('avg_20',isnull(ar[20].max))
    .set('avg_21',isnull(ar[21].max))
    .set('avg_22',isnull(ar[22].max))
    .set('avg_23',isnull(ar[23].max))
 
     .toString();


     //console.log(sql)
     ocsb_excute(sql,db_sugarcane,function(xres)
     {
        // console.log(xres);
         callback(xres);
         return;
     })

}

function isnull(data)
{
   data = data === null ? 0 : data;
   return data;
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

/*    
setTimeout(function () {
    //    debugger;
    // gen_data('1010003019','2017-01-11');
    //     var date_now='';
    //    date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
    //    date_now = date_now.subtract(1, 'days');

   var start_date = '2018-11-21';//date_now.format('YYYY-MM-DD') 

    get_all_watertank(start_date);
 }, 1000);
*/

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00//23;
rule.minute = 20//59;

//#region
  

schedule.scheduleJob(rule, function ()
{
    
    var date_now='';
       date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
       date_now = date_now.subtract(1, 'days');

      var start_date = date_now.format('YYYY-MM-DD') 

    jrp_today.clear_tankwater_report_today(start_date,function(is_clr_fin)
     {
         if(is_clr_fin)
         {
              get_all_watertank(start_date);

                console.log('watertank find total working  This runs at 00:20 every day. '+start_date);
               debugger;
         }
       
        
    });
   

});