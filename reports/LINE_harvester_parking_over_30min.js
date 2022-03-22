

var schedule = require('node-schedule');
var async = require('async');
var moment = require('moment');


var db = require('iConnectdb_ktc.js');
const { updateLocale } = require('moment');
var ipm = new db.im2(db.get_configdb_tcp());

var db_config = "master_config";
var LINE_NOTI  = require('KMP_send_LINE_Noti.js');

var token_kmp = "QDhTX3glWRZ5qSVnuLMfPFyA9mjUYSxNB77BKfVdhs4";  //"HBONA6422b7d9bg0Im0Htaxy660PtJ8r6hgjQ92LBda";
var minute_limit_parking = 30;  //30;
var time_process_start ='07:00:00';
var time_process_stop = '19:00:00';

/**/

var rule_stop = new schedule.RecurrenceRule();
rule_stop.dayOfWeek = [new schedule.Range(0, 6)];
rule_stop.hour = 06;
rule_stop.minute = 59;




schedule.scheduleJob(rule_stop, function ()
{
        var sql =" UPDATE realtime SET kmp_last_stop_engine=NULL WHERE fleet_id ='db_10011'  AND get_vehiclename(modem_id) LIKE '%รถตัด%' "
        ocsb_excute(sql,db_config,function(is_ok)
        {
            console.log('clear data kmp_last_stop_engine at '+moment()+' for check tomorrow ')
        })
});

/*  */

function chek_time_process(callback)
{

    var format = 'hh:mm'

        var time_now = moment() //gives you current time. no format required. console.log(time1) //moment("2022-01-28T11:59:59.634")

        var time = moment(time_now,format),
        beforeTime = moment(time_process_start, format),
        afterTime = moment(time_process_stop, format);

        if (time.isBetween(beforeTime, afterTime)) 
        {
                callback(true);
                return;

        } else {
              callback(false);
              return;

        }
 }



setInterval(function() 
{
    chek_time_process(function(is_allow_process)
    {
            // do your stuff here
            if(is_allow_process)
            {
               // console.log('still working every minute');
                get_data();

            }else{
               // console.log('exx still working every minute');
            
            }
    });


  },10 * 60 * 1000 );


//AND r.modem_id='142190463196' 

  function get_data()
  {
   var sql=" SELECT DISTINCT get_vehiclename(x.modem_id) as harvester_name,r.modem_id ";
   sql+=" ,idate(gps_datetime)as gps_datetime,status,speed,lon,lat "
   sql+=" ,idate(COALESCE(kmp_last_stop_engine,'1981-12-12 00:00')) as kmp_last_stop_engine ";
   sql+=",datediff('minute',kmp_last_stop_engine::TIMESTAMP,gps_datetime::TIMESTAMP) as min_diff ";
   sql+=",fn_min_to_hrs(datediff('minute',kmp_last_stop_engine::TIMESTAMP,gps_datetime::TIMESTAMP)) as hh_mm ";
   sql+=" FROM realtime as r,master_config_vehicle as x  ";

   sql+=" WHERE r.camera_url !=''  AND x.modem_id=r.modem_id AND r.fleet_id ='db_10011'  ORDER BY status ASC ";

   ipm.db.dbname = db_config;
   db.get_rows(ipm, sql, function (rows) 
   {
       
        async.eachSeries(rows, function (row, next)
        {
            if(row.kmp_last_stop_engine =='1981-12-12 00:00:00' && row.status == "1")
            {
                //stamp lasttime stop engine
               var sql= " UPDATE realtime SET kmp_last_stop_engine='"+row.gps_datetime+"' WHERE modem_id='"+row.modem_id+"'  ";
                ocsb_excute(sql,db_config,function(is_ok)
                {
                    next();
                })
            }
            else
            {
              
               if( parseInt( row.status) > 1 && row.speed >= 2)
                    {
                        var sql= " UPDATE realtime SET kmp_last_stop_engine=NULL WHERE modem_id='"+row.modem_id+"'  ";
                        ocsb_excute(sql,db_config,function(is_ok)
                        {
                            console.log('clear '+row.modem_id)
                            next();
                        })
                    }else{
                        
                        if(row.min_diff > minute_limit_parking && row.kmp_last_stop_engine !='1981-12-12 00:00:00')
                        {
                            //send line
                           var data_to_LINE = {'gps_datetime':row.gps_datetime
                           ,'vehicle_name':row.harvester_name
                           ,'start_parking':row.kmp_last_stop_engine
                           ,'hour_min':row.hh_mm
                           ,'latlon':row.lat+','+row.lon
                           ,'line_token':token_kmp
                            }
                            LINE_NOTI.LINE_KMP_Harverster_Parking(data_to_LINE,function()
                            {
                              //  console.log('send line '+row.modem_id+' '+row.hh_mm)
                                next();
                            })

                        }
                        else{
                            next();
                          //  console.log('process next harvester '+row.modem_id)
                        }
                    }
                
                /**/
             
                
            }
        },function(){
           // console.log('finish');
        });

     
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


//get_data()


