
var async = require('async');
var ip = require('xPost');
var db_config = "master_config";

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());

var service_name ='http://mining-truck.herokuapp.com/product/create.php'

function get_data(callback)
{
    var sql = "";
    sql += " SELECT modem_id as gps_device_id ";
    sql += ",get_vehiclename(modem_id) as gps_name";
    sql += ",lon as gps_longitude";
    sql += ",lat as gps_latitude";
    sql += " FROM realtime ";
    sql += " WHERE modem_id in('142190463055','142190463068','142190463186')";

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
        ip.send_data(service_name,row,function(xrs)
        {
             debugger
            // console.log(xrs);
             next();
        })
        // console.log(data);

    },function(){
      // console.log('finish');
      //  callback(true);
     
    });


});

}


setInterval(function ()
{
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