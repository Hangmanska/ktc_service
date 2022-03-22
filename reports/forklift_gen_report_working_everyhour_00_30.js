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


var db_config = "master_config";
var db_owner = "db_10039";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');

var xquery =" AND CAST(analog_input2 as int)=2400 ";


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

function get_all_vehicle(date_process)
{
    //to_char(now(), 'YYYY-MM-DD')
   //var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";
   var sql = "";
   sql += " SELECT r.modem_id,'"+date_process+"' as date_process "
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
                
                 console.log(row.modem_id,row.date_process);
                 has_table(row.modem_id,db_owner,function(resx)
                 {
                     if(resx==true)
                     {
                        gen_data(row.modem_id,row.date_process,function(xres)
                        {
                            if(xres)
                            {
                                next();
                            }
                        });
                     }else{
                        next();
                     }
                 });

             },function(){
                 console.log('finish');
                
             });
            
    });

}

function gen_data(modem_id,date_process,callback)
{
  
    var xq=" AND status IN('2','3') ";

    var sql = "";
sql += "WITH res as( ";
sql += " SELECT '00' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 00:00' AND gps_datetime <='"+date_process+" 01:00' "+xq;
sql += " UNION ";
sql += " SELECT '01' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 01:00' AND gps_datetime <='"+date_process+" 02:00' "+xq;
sql += " UNION ";
sql += " SELECT '02' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 02:00' AND gps_datetime <='"+date_process+" 03:00' "+xq;
sql += " UNION ";
sql += " SELECT '03' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 03:00' AND gps_datetime <='"+date_process+" 04:00' "+xq;
sql += " UNION ";
sql += " SELECT '04' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 04:00' AND gps_datetime <='"+date_process+" 05:00' "+xq;
sql += " UNION ";
sql += " SELECT '05' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 05:00' AND gps_datetime <='"+date_process+" 06:00' "+xq;
sql += " UNION ";
sql += " SELECT '06' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 06:00' AND gps_datetime <='"+date_process+" 07:00' "+xq;
sql += " UNION ";
sql += " SELECT '07' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 07:00' AND gps_datetime <='"+date_process+" 08:00' "+xq;
sql += " UNION  ";
sql += " SELECT '08' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 08:00' AND gps_datetime <='"+date_process+" 09:00' "+xq;
sql += " UNION  ";
sql += " SELECT '09' as id,COUNT(status)    FROM ht_"+modem_id+"  WHERE  gps_datetime >='"+date_process+" 09:00' AND gps_datetime <='"+date_process+" 10:00' "+xq;
sql += " UNION  ";
sql += " SELECT '10' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 10:00'  AND gps_datetime <='"+date_process+" 11:00' "+xq;
sql += " UNION  ";
sql += " SELECT '11' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 11:00'  AND gps_datetime <='"+date_process+" 12:00' "+xq;
sql += " UNION  ";
sql += " SELECT '12' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 12:00' AND gps_datetime <='"+date_process+" 13:00' "+xq;
sql += " UNION  ";
sql += " SELECT '13' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 13:00'  AND gps_datetime <='"+date_process+" 14:00' "+xq;
sql += " UNION  ";
sql += " SELECT '14' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 14:00' AND gps_datetime <='"+date_process+" 15:00' "+xq;
sql += " UNION  ";
sql += " SELECT '15' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 15:00' AND gps_datetime <='"+date_process+" 16:00' "+xq;
sql += " UNION  ";
sql += " SELECT '16' as id,COUNT(status)   FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 16:00'  AND gps_datetime <='"+date_process+" 17:00' "+xq;
sql += " UNION  ";
sql += " SELECT '17' as id,COUNT(status)   FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 17:00' AND gps_datetime <='"+date_process+" 18:00' "+xq;
sql += " UNION  ";
sql += " SELECT '18' as id,COUNT(status)   FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 18:00'  AND gps_datetime <='"+date_process+" 19:00' "+xq;
sql += " UNION  ";
sql += " SELECT '19' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 19:00'  AND gps_datetime <='"+date_process+" 20:00' "+xq;
sql += " UNION  ";
sql += " SELECT '20' as id,COUNT(status)   FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 20:00'  AND gps_datetime <='"+date_process+" 21:00' "+xq;
sql += " UNION  ";
sql += " SELECT '21' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 21:00'  AND gps_datetime <='"+date_process+" 22:00' "+xq;
sql += " UNION  ";
sql += " SELECT '22' as id,COUNT(status)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 22:00'  AND gps_datetime <='"+date_process+" 23:00' "+xq;
sql += " UNION  ";
sql += " SELECT '23' as id,COUNT(status)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 23:00'  AND gps_datetime <='"+date_process+" 00:00' "+xq;
sql += "   ) ";
sql += " SELECT id,CASE WHEN (count>60) THEN '60' ELSE count END as count FROM res ORDER BY id ";

debugger
   ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          debugger;
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
    .into('rp_nissan_forklift_working_everyhour')
    .set('modem_id',modem_id)
    .set('date_process',date_process)
    .set('working_00',isnull(ar[0].count))
    .set('working_01',isnull(ar[1].count))
    .set('working_02',isnull(ar[2].count))
    .set('working_03',isnull(ar[3].count))
    .set('working_04',isnull(ar[4].count))
    .set('working_05',isnull(ar[5].count))
    .set('working_06',isnull(ar[6].count))
    .set('working_07',isnull(ar[7].count))
    .set('working_08',isnull(ar[8].count))
    .set('working_09',isnull(ar[9].count))
    .set('working_10',isnull(ar[10].count))
    .set('working_11',isnull(ar[11].count))
    .set('working_12',isnull(ar[12].count))
    .set('working_13',isnull(ar[13].count))
    .set('working_14',isnull(ar[14].count))
    .set('working_15',isnull(ar[15].count))
    .set('working_16',isnull(ar[16].count))
    .set('working_17',isnull(ar[17].count))
    .set('working_18',isnull(ar[18].count))
    .set('working_19',isnull(ar[19].count))
    .set('working_20',isnull(ar[20].count))
    .set('working_21',isnull(ar[21].count))
    .set('working_22',isnull(ar[22].count))
    .set('working_23',isnull(ar[23].count))
 
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

//++++++++++++++++++++++++++++++++++ 2 Program  Run Every Hour +++++++++++++++++++++++++

function get_all_vehicle_update_working_today()
{
    var sql= "  SELECT DISTINCT r.modem_id ";
//,mcv.vehiclename,group_zone,x.xVehicletypeid
sql+= " FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r  ";
sql+= ",fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x  ";
sql+= " WHERE	 mcv.db_name=sv.fleetid  "; //sv.fleetcode=get_fleetid('tnt_pathum') AND
sql+= " AND sv.modem_id= mcv.modem_id AND sv.modem_id=r.modem_id ";
sql+= " AND sv.fleetid='db_10039' ";
//AND allmin_run IS  NULL ";

ipm.db.dbname = db_config;
db.get_rows(ipm, sql, function (res) 
{
    if (res.length > 0) 
    {
        async.eachSeries(res, function (row, next) 
        {
            get_all_minute_working_today(row.modem_id,function(is_ok)
            {
                if(is_ok)
                {
                    next();
                }else{
                    next();
                }
            })
        },function(){
            console.log('finish');
        });
    }
});

}

function get_all_minute_working_today(modem_id,callback)
{  // to_char(now(),'YYYY-MM-DD')  '2021-07-11'
    var sql=" ";
sql+=" SELECT COALESCE(COUNT(gps_datetime)::int,'0') as minute_working  FROM ht_"+modem_id+" WHERE status !='1' ";
sql+=" AND to_char(gps_datetime,'YYYY-MM-DD') = to_char(now(),'YYYY-MM-DD')  ";

ipm.db.dbname = db_owner;
db.get_rows(ipm, sql, function (rows) 
{
    if (rows.length > 0) 
    {
       var minute_working = rows[0].minute_working;
       
       update_realtime_working_today(modem_id,minute_working,function(is_ok)
        {
            console.log(is_ok+' '+modem_id+' '+minute_working)
           // console.log('stop '+rows[0].count+' idle '+rows[1].count+'run '+rows[2].count)
            callback(is_ok);
            return;
        })
    }
});

}

function update_realtime_working_today(modem_id,all_minute_today,callback)
{
   var sql= " UPDATE realtime SET forklift_minute_working_today='"+all_minute_today+"'  WHERE modem_id='"+modem_id+"' ";
   ipm.db.dbname = db_config;
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

schedule.scheduleJob('1 * * * *', function() { //run every hour at minute 1
    //console.log('The answer to life, the universe, and everything!');
    console.log(' update realtime working today forklift '+moment().format("YYYY-MM-DD HH:mm"));
          //++++++++++++++++ Start Program  Find working hour on Today ++++++++++
         get_all_vehicle_update_working_today();
  });


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

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00//23;
rule.minute = 30//59;

//#region
  

schedule.scheduleJob(rule, function ()
{
    
    var date_now='';
       date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
       date_now = date_now.subtract(1, 'days');

      var start_date = date_now.format('YYYY-MM-DD');
      get_all_vehicle(start_date);



      /*
    jrp_today.clear_report_today(start_date,function(is_clr_fin)
     {
         if(is_clr_fin)
         {
               get_all_harvester(start_date);

                console.log('Harvester find total working  This runs at 00:20 every day. '+start_date);
               debugger;
         }
    });
    */

});

/*
gen_data('143190871427','2020-07-26',function(x)
{
    console.log(x);
})
*/
//24

function get_all_vehicle_manual(date_process,callback)
{
    //to_char(now(), 'YYYY-MM-DD')
   //var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";
   var sql = "";
   sql += " SELECT r.modem_id,'"+date_process+"' as date_process "
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
                
                 console.log(row.modem_id,row.date_process);
                 has_table(row.modem_id,db_owner,function(resx)
                 {
                     if(resx==true)
                     {
                        gen_data(row.modem_id,row.date_process,function(xres)
                        {
                            if(xres)
                            {
                                next();
                            }
                        });
                     }else{
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


var i=1;
function doit()
{
    var start_date = '2020-11-'+i;
    get_all_vehicle_manual(start_date,function(is_fin)
    {
        if(is_fin)
        {
            if(i < 13)
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


//doit();


/*
var start_date = '2020-11-14';
get_all_vehicle(start_date);
*/