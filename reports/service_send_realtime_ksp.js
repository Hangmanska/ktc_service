
var async = require('async');
var ip = require('xPost');
var db_config = "master_config";

var utl = require('Utility.js');
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());

var service_name ='https://prj-ksp.as.r.appspot.com/gps'

function get_data(callback)
{
    var sql = "";
    sql += " SELECT DISTINCT r.modem_id  ";
    sql += ", idate(gps_datetime)as gps_datetime,mcv.vehiclename as vehicle_name  ";
    sql += ",altitude, satelites,lon, lat, speed, direction ,status,input_status ";
    sql += " FROM	realtime as r, setup_vehicle as sv,master_config_vehicle as mcv  ";
    sql += " WHERE	sv.modem_id = r.modem_id AND sv.modem_id = mcv.modem_id AND sv.fleetid = mcv.db_name  ";
    sql += " AND sv.fleetcode = get_fleetid('kmp') ";
	sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' )  ";
	//sql += " AND mcv.vehiclename NOT like '%รถไถ%'  ";
    sql += "  AND to_char( r.gps_datetime::TIMESTAMP, 'YYYY-MM-DD HH24:MI') = to_char( now()::TIMESTAMP, 'YYYY-MM-DD HH24:MI') ";
    sql += " ORDER BY gps_datetime DESC ";


ipm.db.dbname = db_config;
db.get_rows(ipm, sql, function (rows) 
{
  //  debugger;
    //console.log(rows);
    callback(rows);
    return;
});

}


function process()
{

    get_data(function(data)
{
    debugger;
    async.eachSeries(data, function (row, next)
    {
       
       // var xdata = JSON.stringify(row);
      //  console.log(xdata)
        ip.send_data(service_name,row,function(xrs)
        {
             debugger
          //   console.log(xrs);
             next();
        })
        // console.log(data);

    },function(){
       console.log('finish '+utl.timenow());
      //  callback(true);
     
    });


});

}


setInterval(function ()
{ 
   console.log(" start "+utl.timenow());
   process();
}, 60000);

/*
{
    "gps_device_id" : "2",
    "gps_name" : "GNT2011",
    "gps_latitude" : "32.86181641",
    "gps_longitude" : "100.61820221"
}
*/