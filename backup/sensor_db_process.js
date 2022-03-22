
var squel = require("squel");

var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var inoti = require('iNotification.js');

var utl = require('Utility.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_owner = "db_sensor_10001";

function struc_sensor()
{
    var r = {
        fleet_id :"",
        modem_id: "1010001001",
        modem_name: "demo_temp1",
        ondelay_sec: 120,
        start_time: "2017-07-07 11:43:25",
        total_time: 7,
        iso_resistant: 250,
        iso4: {
             volt: 2.90,
             min: 12,
             max: 17,
             low_sec: 60,
             high_sec: 60
        },
        iso6: {
             volt: 2.71,
             min: 9,
             max: 15,
             low_sec: 60,
             high_sec: 60
        },
             iso14: {
             volt: 2.59,
             min: 8,
             max: 12,
             low_sec: 60,
             high_sec: 60
        },
        lat: 0,
        lon: 0,
        fix_lat: 13.6700138,
        fix_lon: 100.6663594,
        gps_time: "0000-00-00 00:00:00",
        tambol: "ลาดพร้าว",
        etambol: "RAT PRAO",
        amphur: "ลาดพร้าว",
        eamphur: "Lat Phrao",
        province: "กรุงเทพมหานคร",
        eprovince: "Bangkok",
        analog1: {
             type: "gauge",
             title: "Sensor1",
             unit: "bar",
             value: 0.93,
             min: 0,
             max: 400,
             resistant: 220,
             val_min: 4,
             val_max: 20,
             val_type: "current"
        },
        analog2: {
             type: "gauge",
             title: "Sensor2",
             unit: "%",
             value: 4.048,
             min: 0,
             max: 100,
             resistant: 0,
             val_min: 0,
             val_max: 10,
             val_type: "volt"
        },
        analog3: {
             type: "gauge",
             title: "Sensor3",
             unit: "bar",
             value: 0.66,
             min: 0,
             max: 250,
             resistant: 0,
             val_min: 0,
             val_max: 5,
             val_type: "volt"
        },
        analog4: {
             type: "gauge",
             title: "Sensor4",
             unit: "C",
             value: 2.16,
             min: -25,
             max: 100,
             resistant: 0,
             val_min: 0,
             val_max: 5,
             val_type: "volt"
        },
        status: "start"
    }
    return r;
}


function add_realtime_first_sensor(data,callback) 
{
    // var data =  JSON.stringify(ar);
    var sql = squel.insert()
      .into("realtime_sensor")
      .set("id_sensor", data.sensor_id)
      .set("data", JSON.stringify(data))
      .set("idate", utcp.now())
      .toString();

    ipm.db.dbname = db_owner;
    db.excute(ipm, sql, function (is_ok) {
        console.log('add_realtime_sensor ' + is_ok);
    });
}

function get_realtime_sensor(id_sensor,callback)
{
   var sql= "SELECT data FROM realtime_sensor WHERE id_sensor='"+id_sensor+"' ";
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (res) 
    {
       // debugger;

        callback(res);
        return;
    });
}

function get_realtime_sensordb(db_name,id_sensor,callback)
{
   var sql= "SELECT data FROM realtime_sensor WHERE id_sensor='"+id_sensor+"' ";
    ipm.db.dbname = db_name+'_sensor';
    db.get_rows(ipm, sql, function (res) 
    {
        callback(res);
        return;
    });
}

function get_all_sensor(req, res)
{
     var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };

     object.db_name ='db_sensor_10001'
     
     var sql= "SELECT * FROM realtime_sensor ";
    ipm.db.dbname = object.db_name;
    db.get_rows(ipm, sql, function (data_sensor) 
    {

        res.json(data_sensor);
        return;
    });
}


function set_realtime_sensor(data,callback) 
{
    // var data =  JSON.stringify(ar);
    debugger;
     var sql = squel.update()
      .table("realtime_sensor")
      .set("data", JSON.stringify(data))
      .set("idate", utcp.now())
      .where("id_sensor='"+data.sensor_id+"'")
      .toString();

    ipm.db.dbname = data.db_name;
    db.excute(ipm, sql, function (is_ok) 
    {
        if(is_ok)
        {
            console.log('set_realtime_sensor ' + is_ok);
            callback(is_ok);
            return;
        }
      
    });
}



function alarm_setting(req, res)
{
  // var r={'modem_id':'','sensor_id':'','ondelaysec':'','isohighsec':'','isolowsec':'','iso4max':'','iso6max':'','iso14max':'' } 
    
   var r={'modem_id':'1010001001','sensor_id':'A0','ondelaysec':'20'
   ,'isohighsec':'15','isolowsec':'10','iso4max':'17','iso6max':'15','iso14max':'12' } 
    
    var sql = squel.insert()
    .into("hydac_alarm_setting")
    .set("modem_id", r.modem_id)
    .set("sensor_id", r.sensor_id)
    .set("ondelaysec", r.ondelaysec)
    .set("isohighsec", r.isohighsec)
    .set("isolowsec", r.isolowsec)
    .set("iso4max", r.iso4max)
    .set("iso6max", r.iso6max)
    .set("iso14max", r.iso14max)
    .set("idate", utcp.now())
  //  .where("sensor_id='"+r.sensor_id+"'")
    .toString();

  ipm.db.dbname = db_config ;
  db.excute(ipm, sql, function (is_ok) 
  {
      if(is_ok)
      {

      }
    
  });
}

function add_realtime_dashboard(req, res)
{
   // var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };
   var object = { "db_name": 'db_10001_sensor', 'fleetname': 'demo1' };
    //object.db_name ='db_sensor_10001'

    var r ={'modem_id':'1010001001', 'sensor_id':'A0', 'iso4_val':'13', 'iso6_val':'10', 'iso14_val':'8'
    ,'input1':'1', 'input2':'1', 'input3':'1', 'input4':'1','output1':'1', 'output2':'0'
    , 'delaytime':'10','start_time':'2017-07-07 11:43:25','lon':'102.204315','lat':'13.77985','gps_time':'2016-08-27 16:49:23'
    , 'tambol':'ห้วยโจด', 'etambol':'HUAI CHOT','amphur':'วัฒนานคร', 'eamphur':'Wattana Nakhon', 'province':'สระแก้ว', 'eprovince':'Srakaeo'};

    /*
    var r ={'modem_id':'1010001001', 'sensor_id':'A1', 'iso4_val':'16', 'iso6_val':'10', 'iso14_val':'8'
    ,'input1':'1', 'input2':'0', 'input3':'1', 'input4':'1','output1':'1', 'output2':'0'
    , 'delaytime':'10','start_time':'2017-07-07 11:43:25','lon':'102.204315','lat':'13.77985','gps_time':'2016-08-27 16:49:23'
    , 'tambol':'ห้วยโจด', 'etambol':'HUAI CHOT','amphur':'วัฒนานคร', 'eamphur':'Wattana Nakhon', 'province':'สระแก้ว', 'eprovince':'Srakaeo'};
    */

    var sql = squel.insert()
    .into("realtime")
    .set("modem_id", r.modem_id)
    .set("sensor_id", r.sensor_id)
    .set("iso4_val", r.iso4_val)
    .set("iso6_val", r.iso6_val)
    .set("iso14_val", r.iso14_val)
    .set("input1", r.input1)
    .set("input2", r.input2)
    .set("input3", r.input3)
    .set("input4", r.input4)
    .set("output1", r.output1)
    .set("output2", r.output2)
    .set("delaytime", r.delaytime)
    .set("start_time", r.start_time)
    .set("lon", r.lon)
    .set("lat", r.lat)
    .set("gps_time", r.gps_time)
    .set("tambol", r.tambol)
    .set("etambol", r.etambol)
    .set("amphur", r.amphur)
    .set("eamphur", r.eamphur)
    .set("province", r.province)
    .set("eprovince", r.eprovince)
    .toString();

    ipm.db.dbname = object.db_name;
    db.excute(ipm, sql, function (is_ok) 
    {
        if(is_ok)
        {
  
        }
      
    });
    
}



function get_realtime_dashboard(req, res)
{
   // var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };
    var object = { "db_name": 'db_10001'};
    //var object = { "db_name": 'db_10001'};
  //  req.params.modem_id ;
    var db_name_sensor = object.db_name+'_sensor';
    //var b = req.body;
   // var r = { modem_id:'1010001001'}
 
    var sql="";
    sql +="SELECT modem_id,modem_name,ondelay_sec,iso4min,iso6min,iso14min,iso4max,iso6max,iso14max";
    sql +=",iso4_low_sec,iso6_low_sec,iso14_low_sec,iso4_high_sec,iso6_high_sec,iso14_high_sec";
    sql +=",lat,lon,fix_lat,fix_lon,status,total_time ";
    sql +=" FROM realtime WHERE modem_id="+utl.sqote(object.modem_id);

    var sql2 = "SELECT * FROM realtime ";
 
    ipm.db.dbname = db_name_sensor;
    db.get_rows(ipm, sql2, function (data_sensor) 
    {
        res.send(data_sensor);
    });

    /*
    db.get_rows(ipm, sql, function (data_sensor) 
    {
        debugger;
        if(data_sensor.length > 0)
        {
          
           var r = new struc_sensor();
           var row =  data_sensor[0];
         //  var  rr = b.split('|');
 
           r.fleet_id = object.db_name;
           r.modem_id = row.modem_id;
           r.ondelay_sec = row.ondelay_sec;
           r.iso4_min = row.iso4min;
           r.iso6_min = row.iso6min;
           r.iso14_min = row.iso14min;
           r.iso4_max = row.iso4max;
           r.iso6_max = row.iso6max;
           r.iso14_max = row.iso14max;
           r.iso4_low_sec = row.iso4_low_sec;
           r.iso6_low_sec = row.iso6_low_sec;
           r.iso14_low_sec = row.iso14_low_sec;
           r.iso4_high_sec = row.iso4_high_sec;
           r.iso6_high_sec = row.iso6_high_sec;
           r.iso14_high_sec = row.iso14_high_sec;
           r.lat = row.lat;
           r.lon = row.lon;
           r.fix_lat = row.fix_lat;
           r.fix_lon = row.fix_lon;
           r.status = row.status;
           r.total_time = row.total_time;
 
           r.iso4 = row.iso4;
           r.iso6 = row.iso6;
           r.iso14 = row.iso14;
           
           res.send(r);
 
         }
         
    });
    */
}

function set_sensor_setting_iso(req, res)
{
    var object = { "db_name": 'db_10001', 'fleetname': req.body.fleetname };

    object.db_name = object.db_name+'_sensor';

    var r = {
        modem_id: "1010001001",
        modem_name: "demo_temp1",
        ondelay_sec: 120,
        start_time: "2017-07-07 11:43:25",
        total_time: 7,
        iso4: {
            volt: 2.65,
            current: 10.6,
            iso: 10
        },
        iso6: {
            volt: 2.51,
            current: 10.04,
            iso: 9
        },
        iso14: {
            volt: 2.35,
            current: 9.4,
            iso: 8
        },
        iso4_min: 12,
        iso6_min: 9,
        iso14_min: 8,
        iso4_max: 17,
        iso6_max: 15,
        iso14_max: 12,
        iso4_low_sec: 60,
        iso6_low_sec: 60,
        iso14_low_sec: 60,
        iso4_high_sec: 60,
        iso6_high_sec: 60,
        iso14_high_sec: 60,
        lat: 0,
        lon: 0,
        fix_lat: 13.6700138,
        fix_lon: 100.6663594,
        gps_time: utcp.now(), //"0000-00-00 00:00:00",
        tambol: "ลาดพร้าว",
        etambol: "RAT PRAO",
        amphur: "ลาดพร้าว",
        eamphur: "Lat Phrao",
        province: "กรุงเทพมหานคร",
        eprovince: "Bangkok",
        analog1: {
            type: "gauge",
            title: "Sensor1",
            unit: "bar",
            value: 1.5,
            min: 0,
            max: 250,
            resistant: 100,
            val_min: 4,
            val_max: 20,
            val_type: "current"
        },
        analog2: {
            type: "gauge",
            title: "Sensor2",
            unit: "bar",
            value: 1.5,
            min: 0,
            max: 250,
            resistant: 100,
            val_min: 4,
            val_max: 20,
            val_type: "current"
        },
        analog3: {
            type: "gauge",
            title: "Sensor3",
            unit: "bar",
            value: 1.5,
            min: 0,
            max: 250,
            resistant: 100,
            val_min: 4,
            val_max: 20,
            val_type: "current"
        },
        analog4: {
            type: "gauge",
            title: "Sensor4",
            unit: "bar",
            value: 1.5,
            min: 0,
            max: 250,
            resistant: 100,
            val_min: 4,
            val_max: 20,
            val_type: "current"
        },
        status: "start"
    }
     
     debugger;
     var sql = squel.update()
     .table("realtime")
     .set("modem_id", r.modem_id)
     .set("modem_name", r.modem_name)
     .set("ondelay_sec", r.ondelay_sec)
     .set("total_time", r.total_time)
     
    // .set("iso4", JSON.stringify(r.iso4))
   //  .set("iso6", JSON.stringify(r.iso6))
    // .set("iso14", JSON.stringify(r.iso14))
     
     .set("iso4min", r.iso4_min)
     .set("iso6min", r.iso6_min)
     .set("iso14min", r.iso14_min)

     .set("iso4max", r.iso4_max)
     .set("iso6max", r.iso6_max)
     .set("iso14max", r.iso14_max)

     .set("iso4_low_sec", r.iso4_low_sec)
     .set("iso6_low_sec", r.iso6_low_sec)
     .set("iso14_low_sec", r.iso14_low_sec)

     .set("iso4_high_sec", r.iso4_high_sec)
     .set("iso6_high_sec", r.iso6_high_sec)
     .set("iso14_high_sec", r.iso14_high_sec)

     .set("lon", r.lon)
     .set("lat", r.lat)
     .set("fix_lon", r.fix_lon)
     .set("fix_lat", r.fix_lat)
     .set("gpstime", r.gps_time)

   //  .set("analog1", JSON.stringify(r.analog1))
   //  .set("analog2", JSON.stringify(r.analog2))
   //  .set("analog3", JSON.stringify(r.analog3))
  //   .set("analog4", JSON.stringify(r.analog4))

     .set("status", r.status)
     .where("modem_id='"+r.modem_id+"'")
     .toString();
   
   ipm.db.dbname = object.db_name;
   db.excute(ipm, sql, function (is_ok) 
   {
       if(is_ok)
       {
 
       }
     
   });
}


//iso: 3.21|5.00|5.00

function pi_set_realtime_dashboard_iso(req, res)
{
    debugger;
    var b = req.body.data;  //'3.58|3.34|3.18' //
    //console.log(b);

   var object = { "db_name": req.params.fleet_id, 'modem_id': req.params.modem_id};
  // var object = { "db_name": 'db_10001', 'modem_id':'1010001001'};
   //var object = { "db_name": 'db_10001'};
 //  req.params.modem_id ;
   var db_name_sensor = object.db_name+'_sensor';
   //var b = req.body;
  // var r = { modem_id:'1010001001'}

   var sql="";
   sql +="SELECT modem_id,modem_name,ondelay_sec,iso4min,iso6min,iso14min,iso4max,iso6max,iso14max";
   sql +=",iso4_low_sec,iso6_low_sec,iso14_low_sec,iso4_high_sec,iso6_high_sec,iso14_high_sec";
   sql +=",lat,lon,fix_lat,fix_lon,status,total_time ";
   sql +=" FROM realtime WHERE modem_id="+utl.sqote(object.modem_id);

   ipm.db.dbname = db_name_sensor;
   db.get_rows(ipm, sql, function (data_sensor) 
   {
       debugger;
       if(data_sensor.length > 0)
       {
         
          var r = new struc_sensor();
          var row =  data_sensor[0];
          var  rr = b.split('|');

          r.fleet_id = object.db_name;
          r.modem_id = row.modem_id;
          r.ondelay_sec = row.ondelay_sec;
          r.iso4_min = row.iso4min;
          r.iso6_min = row.iso6min;
          r.iso14_min = row.iso14min;
          r.iso4_max = row.iso4max;
          r.iso6_max = row.iso6max;
          r.iso14_max = row.iso14max;
          r.iso4_low_sec = row.iso4_low_sec;
          r.iso6_low_sec = row.iso6_low_sec;
          r.iso14_low_sec = row.iso14_low_sec;
          r.iso4_high_sec = row.iso4_high_sec;
          r.iso6_high_sec = row.iso6_high_sec;
          r.iso14_high_sec = row.iso14_high_sec;
          r.lat = row.lat;
          r.lon = row.lon;
          r.fix_lat = row.fix_lat;
          r.fix_lon = row.fix_lon;
          r.status = row.status;
          r.total_time = row.total_time;

          r.iso4.volt = utl.replaceAll('iso: ','',rr[0]);
          r.iso6.volt = rr[1];
          r.iso14.volt = rr[2];
          r.analog1.value = rr[3]; //'0.93';//
          r.analog2.value = rr[4]; //'3.63'//
          r.analog3.value = rr[5];//'1.38'//
          r.analog4.value = rr[6]; //'1.02'//
          

         // console.log(r);
    
          inoti.noti_tracking_sensor(r, function (res_noti)
          {
            if(res_noti)
            {
                debugger;
                var sql = squel.update()
                .table("realtime")
                .set("iso4", JSON.stringify(r.iso4))
                .set("iso6", JSON.stringify(r.iso6))
                .set("iso14", JSON.stringify(r.iso14))

                .set("analog1", JSON.stringify(r.analog1))
                .set("analog2", JSON.stringify(r.analog2))
                .set("analog3", JSON.stringify(r.analog3))
                .set("analog4", JSON.stringify(r.analog4))

                .where("modem_id='"+r.modem_id+"'")
                .toString();
           
               ipm.db.dbname = db_name_sensor;
               db.excute(ipm, sql, function (is_ok) 
               {
                   if(is_ok)
                   {
                     //  res.send(is_ok);
                      res.send(res_noti)
                   }
                 
               });
               
            }
            else
            {
                res.send(res_noti)
            }
           
          });

        }
        
   });


    
}

exports.set_realtime_sensor = set_realtime_sensor;
exports.add_realtime_first_sensor = add_realtime_first_sensor;
exports.get_realtime_sensor = get_realtime_sensor;
exports.get_realtime_sensordb = get_realtime_sensordb;
exports.get_all_sensor = get_all_sensor;
exports.get_realtime_dashboard = get_realtime_dashboard;

exports.add_realtime_dashboard =add_realtime_dashboard;
exports.pi_set_realtime_dashboard_iso = pi_set_realtime_dashboard_iso;
exports.set_sensor_setting_iso  = set_sensor_setting_iso;

//alarm_setting('','');
//set_realtime_dashboard('','');
//add_sensor_setting('','');

//pi_set_realtime_dashboard_iso('','');

function test()
{
  // iso: 3.21|5.00|5.00
   var data ='iso: 3.21|5.00|5.00';
   var req = {'body':data,'fleet_id':'db_10001' }
   pi_set_realtime_dashboard_iso(req,'');

}

//test();