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
      //debugger;
      //  console.log(res_db[0].exists)
        callback(res_db[0].exists)
        return;
  });

}

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

function get_all_vehicle(date_process)
{
    //to_char(now(), 'YYYY-MM-DD')
   //var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";
   //var sql = "SELECT modem_id,db_name,'"+date_process+"' as date_process  FROM master_config_vehicle WHERE db_name='db_10036' ";
  
   var sql = "";
   sql += " SELECT r.modem_id,'"+date_process+"' as date_process,mcv.speedmax as limit_speed "
   sql += " FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r "
   sql += " WHERE sv.fleetcode=get_fleetid('nissan_nft') "
   sql += " AND mcv.db_name=sv.fleetid "
   sql += " AND sv.modem_id= mcv.modem_id "
   sql += " AND sv.modem_id=r.modem_id "


   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          /* */
          debugger;
             async.eachSeries(res_ar, function (row, next)
             {
               
                has_table(row.modem_id,db_owner,function(resx)
                {
                    if(resx==true)
                    {
                        console.log(row.modem_id,row.date_process);
                        gen_data(row.modem_id,row.date_process,row.limit_speed,function(xres)
                        {
                            if(xres)
                            {
                                next();
                            }
                        });
                    }
                    else
                    {
                        console.log('no_table '+row.modem_id+' '+row.date_process);
                        next();
                    }
                });
             },function(){
                 console.log('finish');
                 
             });
            
    });

}

function gen_data(modem_id,date_process,limit_speed,callback)
{
  /*
    SELECT idlht_forklift_workinghour_norun_bydate('143190871346','2020-06-28')as norun
,idlht_forklift_workinghour_run_bydate('143190871346','2020-06-28') as run
,idlht_forklift_distance('143190871346','2020-06-28') as distanc
,idlht_forklift_maxspeed('143190871346','2020-06-28') as max_speed
,idlht_forklift_count_speed('143190871346','2020-06-28','8') as count_speed
*/

var sql=""
sql+=" SELECT idlht_forklift_workinghour_norun_bydate("+utl.sqote(modem_id)+","+utl.sqote(date_process)+")as working_norun ";
sql+=",idlht_forklift_workinghour_run_bydate("+utl.sqote(modem_id)+","+utl.sqote(date_process)+") as working_hour ";
//sql+=",idlht_forklift_distance("+utl.sqote(modem_id)+","+utl.sqote(date_process)+") as distance ";
sql+=",coalesce(round(dblink_forklift_sum_mileage('db_10039',"+utl.sqote(modem_id)+",iymd("+utl.sqote(date_process)+")||' 00:00',iymd("+utl.sqote(date_process)+")||' 23:59'),4),'0') as distance ";
sql+=",idlht_forklift_maxspeed("+utl.sqote(modem_id)+","+utl.sqote(date_process)+") as max_speed ";
sql+=",idlht_forklift_count_speed("+utl.sqote(modem_id)+","+utl.sqote(date_process)+",'"+limit_speed+"') as count_speed ";
//sql+=",idlht_forklift_milelage("+utl.sqote(modem_id)+") as max_milelage ";


   ipm.db.dbname = db_config;
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

check_has_row(modem_id,date_process,function(has_row)
{
    if(has_row==false)
    {
        var sql = squel.insert()
        .into('rp_forklift_summary')
        .set('modem_id',modem_id)
        .set('date_process',date_process)
        .set('distance',isnull(ar[0].distance))
        .set('working_hour',isnull(ar[0].working_hour))
        .set('working_norun',isnull(ar[0].working_norun))
       // .set('vibration_count',isnull(ar[3].count))
       // .set('vibration_max',isnull(ar[4].count))
        .set('speed_count',isnull(ar[0].count_speed))
        .set('speed_max',isnull(ar[0].max_speed))
     //   .set('mileage_max',isnull(ar[0].max_milelage))
        .toString();
    
    
         //console.log(sql)
         ocsb_excute(sql,db_config,function(xres)
         {
            // console.log(xres);
             callback(xres);
             return;
         })
    }
    else
    {
        var sql = squel.update()
        .table('rp_forklift_summary')
        .set('modem_id',modem_id)
        .set('date_process',date_process)
        .set('distance',isnull(ar[0].distance))
        .set('working_hour',isnull(ar[0].working_hour))
        .set('working_norun',isnull(ar[0].working_norun))
       // .set('vibration_count',isnull(ar[3].count))
       // .set('vibration_max',isnull(ar[4].count))
        .set('speed_count',isnull(ar[0].count_speed))
        .set('speed_max',isnull(ar[0].max_speed))
     //   .set('mileage_max',isnull(ar[0].max_milelage))
        .where(' modem_id = ' + utl.sqote(modem_id))
        .where(" to_char(date_process,'YYYY-MM-DD') =" + utl.sqote(date_process))
        .toString();

    
    
         //console.log(sql)
         ocsb_excute(sql,db_config,function(xres)
         {
            // console.log(xres);
             callback(xres);
             return;
         })
    }
   
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

function check_has_row(modem_id,date_process,callback)
{
    var sql =" SELECT COUNT(modem_id) as has_row FROM rp_forklift_summary WHERE modem_id='"+modem_id+"' AND to_char(date_process,'YYYY-MM-DD')='"+date_process+"' ";
    db.get_rows(ipm, sql, function (res_ar) 
    {
          //debugger;
        if (res_ar.length > 0) 
        { 
           var result =  res_ar[0].has_row == '0' ? false : true;
           callback(result);
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

   var start_date = '2019-02-02';//date_now.format('YYYY-MM-DD') 

   jrp_today.clear_report_today(start_date,function(is_clr_fin)
   {
       if(is_clr_fin)
       {
             get_all_harvester(start_date);

              console.log('Harvester find total working  This runs at 00:20 every day. '+start_date);
             debugger;
       }
     
      
  });

   
 }, 1000);
 */

/*
gen_data('143190871346','2020-06-28',function(x)
{
    console.log(x);
})
*/

var i=1;
function doit()
{
    
    i =i <= 9 ? "0"+i  : i;
    var start_date = '2021-07-'+i;
    get_all_vehicle_manual(start_date,function(is_fin)
    {
        if(is_fin)
        {
            if(i < 31)
            {
                console.log(i);
                i++;
                doit();
            }
            else
            {
               
               console.log('fin');
            }
           
        }
    });
}

function get_all_vehicle_manual(date_process,callback)
{
    //to_char(now(), 'YYYY-MM-DD')
   //var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";
   //var sql = "SELECT modem_id,db_name,'"+date_process+"' as date_process  FROM master_config_vehicle WHERE db_name='db_10036' ";
  //AND sv.modem_id='143190871464'
   var sql = "";
   sql += " SELECT r.modem_id,'"+date_process+"' as date_process "
   sql += " FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r "
   sql += " WHERE sv.fleetcode=get_fleetid('nissan_nft') "
   sql += " AND mcv.db_name=sv.fleetid "
   sql += " AND sv.modem_id= mcv.modem_id "
   sql += " AND sv.modem_id=r.modem_id  AND sv.modem_id='143200384825' " //


   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          /* */
          debugger;
             async.eachSeries(res_ar, function (row, next)
             {
               
                has_table(row.modem_id,db_owner,function(resx)
                {
                    if(resx==true)
                    {
                        console.log(row.modem_id,row.date_process);
                        gen_data(row.modem_id,row.date_process,function(xres)
                        {
                            if(xres)
                            {
                                next();
                            }else{
                                next();
                            }
                        });
                    }
                    else
                    {
                        console.log('no_table '+row.modem_id+' '+row.date_process);
                        next();
                    }
                });
             },function(){
                 console.log('finish');
                 callback(true);
                 return;
             });
            
    });

}

doit();

var start_date = '2021-10-19';
//get_all_vehicle_manual(start_date,function(){});
//143200385073