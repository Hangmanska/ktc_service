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
var jrp_today = require('ocsb_gen_report_speed_avg_today.js');

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

function get_all_harvester(start_date,end_date)
{
    //to_char(now(), 'YYYY-MM-DD')
   var sql = "SELECT modem_id,harvester_name FROM harvester_register2";
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          /* */
          debugger;
             async.eachSeries(res_ar, function (row, next)
             {
                
               console.log(row.modem_id);
                gen_data(row.modem_id,start_date,end_date,function(xres)
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

function gen_data(modem_id,date_start,date_end,callback)
{
    var sql = "";
sql += "WITH res as( ";
sql += " SELECT generate_series('"+date_start+"', '"+date_end+"', '1 day'::interval)::date|| ' 06:00'::varchar as x06";
sql += " ,generate_series('"+date_start+"', '"+date_end+"', '1 day'::interval)::date|| ' 18:00'::varchar as x18";
sql += " ,generate_series('"+date_start+"', '"+date_end+"', '1 day'::interval)::date|| ' 18:01'::varchar as x19";
sql += " ,generate_series('"+date_start+"', '"+date_end+"', '1 day'::interval)::date|| ' 23:00'::varchar as x23";
sql += " ,generate_series('"+date_start+"', '"+date_end+"', '1 day'::interval)::date as xdate";
sql += " , '"+modem_id+"'::varchar as modem_id ";
sql += "   ) ";

sql += " SELECT iymd(xdate) as xdate,modem_id ";
sql += ",get_all_cutting(modem_id,x06,x18) as working_06_18 ";
sql += ",round( COALESCE(get_avg_speed(modem_id,x06,x18),'0')::numeric,2) as avgspeed_06_18 ";
sql += ",get_all_cutting(modem_id,x19,x23) as working_18_23 ";
sql += ",round(COALESCE(get_avg_speed(modem_id,x19,x23),'0')::numeric,2) as avgspeed_18_23 ";
sql += " FROM res ";


   ipm.db.dbname = db_sugarcane ;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          //debugger;
        if (res_ar.length > 0) 
        {    // var xres_ar=[];
         //  console.log( res_ar[5].avg);
         /*  */
         insert_2db(res_ar,function(xres)
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

function insert_2db(ar_data,callback)
{
    
    var strMustache = '{{#.}}';
    strMustache += "('{{xdate}}','{{modem_id}}','{{working_06_18}}','{{working_18_23}}','{{avgspeed_06_18}}','{{avgspeed_18_23}}'";
    strMustache += "),";
    strMustache += '{{/.}}';


   
    var tb_name = 'harvester_sumary_working_speed';

    var result_val = mustache.render(strMustache, ar_data);
    result_val = utl.iRmend(result_val);

   
     var column ="date_process,modem_id,working_06_18,working_18_23,avg_speed_06_18,avg_speed_18_23"
     

     var sql = " INSERT INTO " + tb_name + "(" + column + ") VALUES " + result_val;

debugger


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


setTimeout(function () {
    //    debugger;
    // gen_data('1010003019','2017-01-11');
    //     var date_now='';
    //    date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
    //    date_now = date_now.subtract(1, 'days');

   var start_date = '2018-04-01';//date_now.format('YYYY-MM-DD') 
    var end_date = '2018-04-26'
    get_all_harvester(start_date,end_date);
 }, 1000);
 
/*  
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

    jrp_today.clear_report_today(start_date,function(is_clr_fin)
     {
         if(is_clr_fin)
         {
               get_all_harvester(start_date);

                console.log('Harvester find total working  This runs at 00:20 every day. '+start_date);
               debugger;
         }
       
        
    });
   

});

 */