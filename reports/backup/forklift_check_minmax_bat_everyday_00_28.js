var schedule = require('node-schedule');
var mustache = require("mustache");
var timespan = require('timespan');
var moment = require('moment');

var async = require('async');
var squel = require("squel");
var linq = require('linq.js');
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());



var db_config = "master_config";
var db_owner = "db_10039";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');



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

function get_all_vehicle(date_process,all_bat)
{
    //to_char(now(), 'YYYY-MM-DD')
   //var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";
   //var sql = "SELECT modem_id,db_name,'"+date_process+"' as date_process  FROM master_config_vehicle WHERE db_name='db_10036' ";
  
   var sql = "";
   sql += " SELECT r.modem_id,'"+date_process+"' as date_process "
   sql += " FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r "
   sql += " WHERE sv.fleetcode=get_fleetid('nissan_nft') "
   sql += " AND mcv.db_name=sv.fleetid "
   sql += " AND sv.modem_id= mcv.modem_id "
   sql += " AND sv.modem_id=r.modem_id  AND mcv.vehicle_model_id in ('277','278') " // AND r.modem_id='143190871316' 


   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          /* */
          debugger;
             async.eachSeries(res_ar, function (row, next)
             {
                
                 console.log(row.modem_id,row.date_process);
                 find_minmax_bat(row.modem_id,row.date_process,all_bat,function(xres)
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

function find_minmax_bat(modem_id,date_process,all_bat,callback)
{
  /*

SELECT min(analog_input1),max(analog_input1)
 FROM ht_143190871316
WHERE gps_datetime >= '2020-08-26 00:00:28'
AND gps_datetime <= '2020-08-26 23:59:28'
*/
var start =date_process+' 00:00' 
var stop = date_process+' 23:59' 
var tb_name ='ht_'+modem_id;

var sql=""
sql+=" SELECT COALESCE(min(analog_input1),'0')::float as his_min_bat,COALESCE(max(analog_input1),'0')::float as his_max_bat ";
sql+="  FROM "+tb_name;
sql+=" WHERE gps_datetime >="+utl.sqote(start);
sql+=" AND gps_datetime <= "+utl.sqote(stop);

   ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          //debugger;
        if (res_ar.length > 0) 
        {    // var xres_ar=[];
         //  console.log( res_ar[5].avg);

         var x_realtime_bat = linq.Enumerable.From(all_bat)
         .Where(function (x) { return x.modem_id == modem_id})
         .ToArray();

  

         if(x_realtime_bat.length >0)
         {
            var his_min_bat = res_ar[0].his_min_bat;
            var his_max_bat = res_ar[0].his_max_bat;

            var realtime_min_bat = x_realtime_bat[0].min_bat;
            var realtime_max_bat = x_realtime_bat[0].max_bat;

            var res_min_bat =0;
            var res_max_bat =0;

            if(realtime_min_bat==0)
            {
              res_min_bat = his_min_bat > realtime_min_bat  ? his_min_bat : realtime_min_bat;
            }
            else
            {
                res_min_bat = his_min_bat < realtime_min_bat  ? his_min_bat : realtime_min_bat;
            }

            res_max_bat =  his_max_bat > realtime_max_bat  ? his_max_bat : realtime_max_bat;

            update_2db(modem_id,date_process,res_min_bat,res_max_bat,function(xres)
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


        }
        else
        {
            callback(true);
            return;

        }
    });

}

function get_all_reltime_bat(callback)
{
   var sql=" SELECT COALESCE(forklift_min_bat,'0')as min_bat, COALESCE(forklift_max_bat,'0') as max_bat,modem_id FROM realtime   WHERE fleet_id='db_10039'  ";
   ipm.db.dbname = db_config;
   db.get_rows(ipm, sql, function (res_ar) 
   {
       callback(res_ar);
       return;
   });

}


function update_2db(modem_id,date_process,res_min_bat,res_max_bat,callback)
{

debugger
    var sql = squel.update()
    .table('realtime')
    .set('forklift_min_bat',res_min_bat)
    .set('forklift_max_bat',res_max_bat)
    .where('modem_id = ' + utl.sqote(modem_id))
    .toString();


     //console.log(sql)
     ocsb_excute(sql,db_config,function(xres)
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

      get_all_reltime_bat(function(all_bat)
    {
        if(all_bat.length >0)
        {
            get_all_vehicle(start_date,all_bat);
        }
    
    })


});

/*
gen_data('143190871346','2020-06-28',function(x)
{
    console.log(x);
})
*/

var start_date = '2020-11-13';
get_all_reltime_bat(function(all_bat)
{
    if(all_bat.length >0)
    {
        get_all_vehicle(start_date,all_bat);
    }
   
})


//find_minmax_bat('143190871316','2020-08-26',function(x){})