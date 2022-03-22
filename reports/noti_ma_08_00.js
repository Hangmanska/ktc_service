
var request = require('request')
var async = require('async');
var schedule = require('node-schedule');
//const token = "NrVZcDMEXDLrvJP3WG7LiJme1UH0owtCGN1SmmcZxp8";//ดคกย
//const token = "UFxS7kNBC858zhUuTsyYK4ADiMv2j2yMxf2Lbhf9dVL"; //

//1oXUbS4fLwFwzvw7z6oaZRa1tWDA98D8goa38874aCq  KTC2DLT

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";

function nrows(sql,db_name,callback)
{
      ipm.db.dbname = db_name;
      db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
           callback(rows);
           return;
        }else{
            callback([]);
           return;
        }
    });
}

function get_data()
{
  var sql='';
  sql += "WITH result as ("; 
  sql += "SELECT  rt.modem_id "; 
  sql += ",get_vehiclename(rt.modem_id ) as vehiclename"; 
  sql += ",mcv.db_name"; 
  sql += ",mf.subfleetid as name_fleet"; 
  sql += ",DATE_PART('day',gps_datetime::timestamp - now()::timestamp) as daysleep"; 
  sql += ",ABS(DATE_PART('day',gps_datetime::timestamp - now()::timestamp)) as daysleep_int"; 
  sql += ",idate(gps_datetime) as xgps_datetime "; 
  sql += ",CASE WHEN get_dlt_vehicle(rt.modem_id) ='1' THEN 'C' ELSE '' END as is_dlt_vehicle";
  sql += " FROM realtime as rt ,master_config_vehicle as mcv,master_fleet as mf "; 
  sql += " WHERE rt.modem_id NOT LIKE '%x%' " ; 
  sql += "AND rt.modem_id = mcv.modem_id "; 
  sql += "AND mf.fleetid = mcv.db_name "; 
  sql += "AND DATE_PART('day',gps_datetime::timestamp - now()::timestamp) < '-1' "; 
  sql += "AND mcv.db_name !='db_10003' "; 
  sql += "ORDER BY gps_datetime DESC "; 
  sql += " )"; 
  sql += "SELECT DISTINCT modem_id,daysleep_int"; 
  sql += ",is_dlt_vehicle||' รถ '||vehiclename||' deep sleep '||daysleep_int||' days' as message"; 
  sql += " FROM result "; 
  sql += " WHERE db_name='db_10001'"; 
  sql += " AND daysleep_int < '10'"; 
  sql += " ORDER  BY daysleep_int"; 

  nrows(sql,db_config,function(xres)
  {
    debugger;
  //  console.log(xres);
    var res='';
    async.eachSeries(xres, function (row, next)
    {
          res += row.message+'\r\n'
          next();
    },function(){
      main_send_noti(res)
    });

  })

}

function check_dlt_before_expire()
{
  var sql='';
  sql += " WITH res as ( ";
  sql += "  SELECT cussy as chassis_no ";
  sql += "  ,b.modem_id,a.users,province,expire_date ";
  sql += "  ,get_vehiclename(b.modem_id) as vehiclename";
  sql += "  ,DATE_PART('day', expire_date::timestamp - now()::timestamp) as diffday,idmy(expire_date::TIMESTAMP) as xpire_date ";
  sql += "  FROM vehicle_setting_dltcsv as a,master_config_vehicle as b ";
  sql += "  WHERE expire_date IS NOT NULL AND inform_ok='0' ";
  sql += "  AND a.cussy = b.dlt_vehicle_chassis_no) ";
  sql += "  SELECT chassis_no,xpire_date,province,modem_id,users,vehiclename,diffday,ABS(diffday)  FROM res WHERE diffday < 0 OR diffday <= 30 ";
  sql += "  ORDER BY diffday ASC ";
  sql += "   "; //LIMIT 15

  nrows(sql,db_config,function(xres)
  {
    debugger;
  //  console.log(xres);
    //var res=[];
    var token_KTC2DLT ="1oXUbS4fLwFwzvw7z6oaZRa1tWDA98D8goa38874aCq";
    async.eachSeries(xres, function (row, next)
    {
      if(row.diffday < 0)
      {
        var x ='รถ '+ row.vehiclename+' '+row.modem_id+' '+row.users+' วันสิ้นอายุภาษี '+row.xpire_date+' เกินวันที่ต่อทะเบียนมาแล้ว '+row.abs+' วัน\r\n'
       // var token_KTC2DLT ="1oXUbS4fLwFwzvw7z6oaZRa1tWDA98D8goa38874aCq";
        main_send_noti(x,token_KTC2DLT)
        next();
      }
      else
      {
        var x ='รถ '+ row.vehiclename+' '+row.modem_id+' '+row.users+' วันสิ้นอายุภาษี '+row.xpire_date+' เหลืออีก '+row.abs+' ถึงวันต่อทะเบียน \r\n'
      //  var token_KTC2DLT ="1oXUbS4fLwFwzvw7z6oaZRa1tWDA98D8goa38874aCq";
        main_send_noti(x,token_KTC2DLT)
        next();
      }
       
         // res += row.message+'\r\n'
        
    },function(){
 
    // debugger;
        //console.log(res);
       
      
    });

  })

}

function get_data_allgroup()
{
  var sql='';
  sql += "WITH result as ("; 
  sql += "SELECT  rt.modem_id "; 
  sql += ",get_vehiclename(rt.modem_id ) as vehiclename"; 
  sql += ",mcv.db_name"; 
  sql += ",mf.subfleetid as name_fleet"; 
  sql += ",DATE_PART('day',gps_datetime::timestamp - now()::timestamp) as daysleep"; 
  sql += ",ABS(DATE_PART('day',gps_datetime::timestamp - now()::timestamp)) as daysleep_int"; 
  sql += ",idate(gps_datetime) as xgps_datetime "; 
  sql += ",CASE WHEN get_dlt_vehicle(rt.modem_id) ='1' THEN 'C' ELSE '' END as is_dlt_vehicle";
  sql += " FROM realtime as rt ,master_config_vehicle as mcv,master_fleet as mf "; 
  sql += " WHERE rt.modem_id NOT LIKE '%x%' " ; 
  sql += "AND rt.modem_id = mcv.modem_id "; 
  sql += "AND mf.fleetid = mcv.db_name "; 
  sql += "AND DATE_PART('day',gps_datetime::timestamp - now()::timestamp) < '-1' "; 
  sql += "AND mcv.db_name !='db_10003' "; 
  sql += "ORDER BY gps_datetime DESC "; 
  sql += " )"; 
  sql += "SELECT DISTINCT modem_id,daysleep_int"; 
  sql += ",is_dlt_vehicle||' รถ '||vehiclename||' deep sleep '||daysleep_int||' days'||' '||get_fleetname(modem_id) as message"; 
  sql += " FROM result "; 
  sql += " WHERE  daysleep_int < '10'"; 
  sql += " ORDER  BY daysleep_int"; 

  nrows(sql,db_config,function(xres)
  {
    debugger;
  //  console.log(xres);
    var res='';
    async.eachSeries(xres, function (row, next)
    {
          res += row.message+'\r\n'
          next();
    },function(){
      var token_ma ="HSZN2FXpWWimbfTh2I1njZkIHv9gkaBNBBOgL10UvlT";
      main_send_noti(res,token_ma)
    });

  })

}


function main_send_noti(msg,token)
{
    // var msg = "Test Noti ได้ป่าวว่ะ ";
  request({
     method: 'POST',
     uri: 'https://notify-api.line.me/api/notify',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
  },
     'auth': {
       'bearer': token
  },form: {
       message: msg,
    }
  }, (err,httpResponse,body) => {
     console.log(JSON.stringify(err));
     console.log(JSON.stringify(httpResponse));
     console.log(JSON.stringify(body));
  })
}


//http://www.codexpedia.com/javascript/nodejs-cron-schedule-examples/
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 08//23;
rule.minute = 00//59;

schedule.scheduleJob(rule, function ()
{
    
  get_data_allgroup();
  check_dlt_before_expire();

});


//check_dlt_before_expire();
//main();

/*
{"statusCode":200,"body":"{\"status\":200,\"message\":\"ok\"}","headers":{"server":"nginx","date":"Sat, 10 Jun 2017 03:33:11 GMT","content-type":"application/json;charset=UTF-8","transfer-encoding":"chunked","connection":"keep-alive","keep-alive":"timeout=3","x-ratelimit-limit":"1000","x-ratelimit-imagelimit":"50","x-ratelimit-remaining":"999","x-ratelimit-imageremaining":"50","x-ratelimit-reset":"1497069191"},"request":{"uri":{"protocol":"https:","slashes":true,"auth":null,"host":"notify-api.line.me","port":443,"hostname":"notify-api.line.me","hash":null,"search":null,"query":null,"pathname":"/api/notify","path":"/api/notify","href":"https://notify-api.line.me/api/notify"},"method":"POST","headers":{"Content-Type":"application/x-www-form-urlencoded","authorization":"Bearer NrVZcDMEXDLrvJP3WG7LiJme1UH0owtCGN1SmmcZxp8","content-length":115}}}
"{\"status\":200,\"message\":\"ok\"}"
 */