
var squel = require("squel");

var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var inoti = require('iNotification.js');

var utl = require('Utility.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_owner = "senser";

function set_realtime_sensor(data)
{
    var data_sensor = data;

    if(data_sensor.length >0 )
    {
       var r = data_sensor[0];


       var sql = squel.insert()
       .into("sensor_now")
       .set("machine_name", r.machine_name)
       .set("oil_pressure", r.oil_pressure)
       .set("oil_temperature", r.oil_temperature)
       .set("machine_running_on_off", r.machine_running_on_off)
       .set("machine_clamp_close_count", r.machine_clamp_close_count)
       .set("machine_cycle_run_hr", r.machine_cycle_run_hr)
       .set("machine_run_hr", r.machine_run_hr)
       .set("oil_filter_status", r.oil_filter_status)
       .set("machine_power_kwhr", r.machine_power_kwhr)
       .set("date_time", r.date_time)
       //.set("group_id", r.group_id)
       .toString();
   
       ipm.db.dbname = db_owner;
       db.excute(ipm, sql, function (is_ok) 
       {
           if(is_ok)
           {
     
           }
         
       });
    }
   
}


exports.set_realtime_sensor = set_realtime_sensor;