
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


function get_data(start,stop,callback)
{

var sql1 = ""; 
sql1 += "  WITH res as ( ";
sql1 += "  SELECT  ";
sql1 += "   fs.modem_id  ";
sql1 += " ,idate(date_process) as  date_process";
sql1 += " ,iymd(date_process) as dtime ";
sql1 += " ,distance ";
//sql1 += " ,working_hour as working_hour  ";
//sql1 += " ,working_norun as working_norun  ";
sql1 += " ,speed_max  ";//speed_count as total_overspeed
sql1 += " ,dv.rround_slash_rfid as total_slash_rfid ";
sql1 += " ,idate(dv.rstart_time) as first_slash_rfid ";
sql1 += " ,idate(dv.rend_time) as end_slash_rfid ";
sql1 += " ,dv.rtotal_min as drivertime_use_forklift ";
sql1 += " ,get_speed_limit(fs.modem_id)::varchar as limit_speed ";
sql1 += " ,fn_nissan_summary_get_drivername(fs.modem_id,'"+start+"','"+stop+"') as driver_name ";
//sql1 += ",idlht_forklift_count_speed(modem_id,date_process,limit_speed) as total_overspeed ";
sql1 += " FROM rp_forklift_summary as fs  ";
sql1 += " ,fn_nissan_tb_sumary_driver(fs.modem_id,'"+start+"','"+stop+"')as dv ";
sql1 += "  WHERE date_process >= '"+start+"' ";
sql1 += "  AND date_process <='"+stop+"' ";
sql1 += ")  SELECT modem_id,date_process,distance ";
sql1 += "  ,speed_max,limit_speed ";
sql1 += "  ,total_slash_rfid,first_slash_rfid,end_slash_rfid,drivertime_use_forklift,driver_name,dtime ";
//sql1 += " ,idlht_forklift_count_speed(modem_id,dtime,limit_speed) as total_overspeed ";
sql1 += " FROM res ";
//sql1 += "   FROM res ORDER BY group_zone ASC ";

ipm.db.dbname = db_config;
db.get_rows(ipm, sql1, function (rows) 
{
    if (rows.length > 0) 
    {
      // console.log(rows);
      async.eachSeries(rows, function (row, next)
      {
        //console.log(row);
        get_over_speed(row.modem_id,row.dtime,row.limit_speed,function(total_overspeed)
        {
            insert_2db(row,total_overspeed,function(is_ok)
            {
                next();
            })
        });

      },function(){
        console.log('finish');
        callback(true);
        return;
      });
    }
    else 
    {
      callback(true);
      return;
    }
});

}

function isnull(data)
{
   data = data === null ? 0 : data;
   return data;
}

function insert_2db(ar,total_overspeed,callback)
{

debugger

    
        var sql = squel.insert()
        .into('rp_usage_vehicle_and_driver')
        .set('modem_id',ar.modem_id)
        .set('date_process',ar.dtime)
        .set('distance',isnull(ar.distance))
        //.set('working_hour',isnull(ar.working_hour))
        //.set('working_norun',isnull(ar.working_norun))
        .set('total_overspeed',isnull(total_overspeed))
        .set('speed_max',isnull(ar.speed_max))
        .set('total_slash_rfid',isnull(ar.total_slash_rfid))
        .set('first_slash_rfid',ar.first_slash_rfid)
        .set('end_slash_rfid',ar.end_slash_rfid)
        .set('drivertime_use_forklift',isnull(ar.drivertime_use_forklift))
        .set('driver_name',isnull(ar.driver_name))
        .toString();
    
    
         //console.log(sql)
         ocsb_excute(sql,db_config,function(xres)
         {
            // console.log(xres);
             callback(xres);
             return;
         })


}

function get_over_speed(modemid,datetime,limit_speed,callback)
{
   var sql= "SELECT idlht_forklift_count_speed('"+modemid+"','"+datetime+"','"+limit_speed+"') as overspeed_count";
   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
      //  console.log(rows[0].overspeed_count);
        callback(rows[0].overspeed_count);
        return;
    });

}

function get_minute_run_park_idle(modem_id,start_date,callback)
{
  var tb = "ht_"+modem_id
  var time = "AND gps_datetime >= '"+start_date+" 00:00' AND gps_datetime <= '"+start_date+" 23:59' "
  var sql="";
  sql+=" SELECT COUNT(modem_id)::int ,'1' as status FROM "+tb+" WHERE status ='1' "+time;
  sql+=" UNION ALL  ";
  sql+=" SELECT COUNT(modem_id)::int,'2' as status FROM "+tb+" WHERE status ='2' "+time;
  sql+=" UNION ALL  ";
  sql+="  SELECT COUNT(modem_id)::int,'3' as status FROM "+tb+" WHERE status ='3' "+time;

  ipm.db.dbname = db_owner;
  db.get_rows(ipm, sql, function (rows) 
  {
   //  console.log(rows[0].count);
     var result={'parking':rows[0].count,'idling':rows[1].count,'running':rows[2].count};
     callback(result);
     return;
    //   callback(rows[0].overspeed_count);
     // return;
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


var start=3;
var end = 9;
function doit()
{
    
    start =start <= 9 ? "0"+start  : start;
  var start_date = '2021-11-'+start;
  var starttime =  start_date+' 00:00';
  var endtime = start_date+' 23:59';

    get_data(starttime,endtime,function(is_fin)
    {
        if(is_fin)
        { 
            if(start < end)
            {
                console.log(start);
                start++;
                doit();
            }
            else
            {
               
               console.log('fin');
               update_data_running_idle_parking();
            }
           
        }
    });
}
//'2021-10-01 00:00','2021-10-01 23:59')
//get_data('2021-10-21 00:00','2021-10-21 23:59',function(){})

//get_over_speed('143190871542','2021-10-20','10')
//doit();

// get_minute_run_park_idle('143190871464','2021-10-20',function(res){ console.log(res); });


var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 06;
rule.minute = 10;


schedule.scheduleJob(rule, function ()
{
   // console.log('Harvester Midnight This runs at 23:59 every day.');

    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    console.log('start forklift_gen_rp_usage_vehicle_and_driver ' + date_gen_report + ' timenow : ' +  moment().format('YYYY-MM-DD HH:mm:ss'));

    var start_time =  date_gen_report+' 00:00';
    var end_time = date_gen_report+' 23:59';
  
      get_data(start_time,end_time,function(is_fin)
      {
        console.log('finish forklift_gen_rp_usage_vehicle_and_driver ' + date_gen_report + ' timenow : ' +  moment().format('YYYY-MM-DD HH:mm:ss'));
        update_data_running_idle_parking();
      });
  
});

console.log("start program forklift_gen_rp_usage_vehicle_and_driver "+ moment().format('YYYY-MM-DD HH:mm:ss')+" wait process at 06:10 every day")


/*
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_trip WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);
    sql += " UNION ALL ";
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_parking WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);
    sql += " UNION ALL ";
    sql += " SELECT COALESCE(SUM(timeuse),'0')as sum FROM rp_idleling WHERE modem_id=" + utl.sqote(modem_id) + " AND start_date >=" + utl.sqote(start) + " AND start_date <=" + utl.sqote(stop);


     WITH resx as ( 
     SELECT date_trunc('day', dd):: date as datex 
     FROM generate_series 
    ( to_char('2021-10-20'::timestamp,'YYYY-MM-DD')::timestamp 
      , to_char('2021-10-20'::timestamp,'YYYY-MM-DD')::timestamp 
      , '1 day'::interval) dd 
     ) 
    
     SELECT idate(datex) as datetime 
     ,fn_rp_trip_graph('143190871464',datex::varchar) as trip_timeuse 
     ,fn_rp_parking_graph('143190871464',datex::varchar) as parking_timeuse 
     ,fn_rp_idleling_graph('143190871464',datex::varchar) as idleling_timeuse 
     FROM resx 

    --park 469   run 316   idle  615

*/

function update_data_running_idle_parking()
{

 var sql=" SELECT id,to_char(date_process::timestamp,'YYYY-MM-DD') as date_process "
 sql+=" ,modem_id,parking,idling,runing   ";
 sql+="  FROM rp_usage_vehicle_and_driver  ";
 sql+="  WHERE parking IS NULL ";

 ipm.db.dbname = db_config;
 db.get_rows(ipm, sql, function (rows) 
 {
        async.eachSeries(rows, function (row, next) 
        {
             console.log(row.date_process+' '+row.modem_id);
             get_minute_run_park_idle(row.modem_id,row.date_process,function(res)
             {
                  var sql = squel.update()
                  .table('rp_usage_vehicle_and_driver')
                  .set('parking',(res.parking))
                  .set('idling',(res.idling))
                  .set('runing',(res.running))
                  .where('id = ' + utl.sqote(row.id))
                  .toString();

                 // console.log(sql);
                  ipm.db.dbname = db_config;
                  db.excute(ipm, sql, function (response) 
                  {
                      if (response == 'oK') {
                          next();
                      }
                      else {
                        next();
                      }
                  });

             })
        },function(){
            console.log('finish');
        });
 });


}


//update_data_running_idle_parking()