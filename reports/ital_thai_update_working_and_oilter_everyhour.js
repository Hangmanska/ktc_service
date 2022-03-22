
var schedule = require('node-schedule');
var async = require('async');
var squel = require("squel");
var moment = require('moment');
var mustache = require("mustache");

var fs = require('fs');

var utl = require('Utility.js');
var linq = require('linq.js');
var utl = require('Utility.js');


var iBuildText = require('iGenTextFile.js');


var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());

var db_config = "master_config";



function start() 
{
    var sql=" "
    sql+=" SELECT mcv.db_name,r.modem_id,coalesce(mcv.ital_is_usecase_status,'0') as upside_status ";
    sql+=" , CASE  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' THEN dblink_countworking_italthai_upsidedown_status(r.fleet_id,r.modem_id,'26')::numeric::integer  ";
    sql+=" WHEN coalesce(mcv.ital_is_usecase_status,'0')='0' THEN dblink_countworking_italthai(r.fleet_id,r.modem_id)::numeric::integer   ";
    sql+="  END as working_hour ";
    sql += " , CASE WHEN mcv.is_calculate_fuel='1' THEN ";
    sql += " TRUNC(linear_regression(mcv.fuelempty::DECIMAL,mcv.fuelfull::DECIMAL,0,mcv.fueltank::DECIMAL,dblink_last_analog_input1('db_10036',r.modem_id)::DECIMAL),2) ";
    sql += " ELSE '0' END  AS oil_liter ";
    sql+=" FROM realtime as r,master_config_vehicle as mcv WHERE r.fleet_id='db_10036' AND r.modem_id=mcv.modem_id AND r.fleet_id = mcv.db_name ";
    
        //var date_gen_report = '2016-06-25';
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (res) 
        {
            if (res.length > 0) 
            {
                async.eachSeries(res, function (row, next) 
                {
                        console.log( row.modem_id+' '+row.working_hour);
                       update_data_working_hour(row.working_hour,row.modem_id,function(resx0)
                       {
                         update_data_oil_liter( row.oil_liter,row.modem_id,function(resx1)
                         {
                           if(resx1=='oK')
                           {
                              next();
                           }
                          });
                         
                       })
                        
                },function(){
                    console.log('finish');
                });
            }
        });
}

function update_data_working_hour(working_hour,modem_id,callback)
{
   var sql= "UPDATE master_config_vehicle SET iti_working_hour='"+working_hour+"'  WHERE modem_id='"+modem_id+"' ";

   ipm.db.dbname = db_config;
   db.excute(ipm, sql, function (response) 
   {
       if (response == 'oK') 
       {
         callback(response);
         return;
       } 
       else
        {
           callback(0);
           return;
       }

   });
}



function update_data_oil_liter(oil_liter,modem_id,callback)
{
    oil_liter = oil_liter <= 0 ? 0 : oil_liter;
   var sql= "UPDATE realtime SET oil_liter='"+oil_liter+"'  WHERE modem_id='"+modem_id+"' ";

   ipm.db.dbname = db_config;
   db.excute(ipm, sql, function (response) 
   {
       if (response == 'oK') 
       {
         callback(response);
         return;
       } 
       else
        {
           callback(0);
           return;
       }

   });
}



var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00//23;
rule.minute = 20//59;

schedule.scheduleJob(rule, function ()
{
    
    var date_now='';
       date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
       date_now = date_now.subtract(1, 'days');

      var start_date = date_now.format('YYYY-MM-DD') 

start();


});