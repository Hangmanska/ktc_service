
var squel = require("squel");
var request = require('request');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var idif = require('iDatediff.js');

var linq = require('linq.js');
var ipost = require('xPost.js');
var db_owner = "db_sensor_10001";
var ipm = new db.im2(db.get_configdb_tcp());

//https://www.hackster.io/amir-pournasserian/ble-weather-station-with-esp32-and-ruuvi-e8a68d

var url_setting ="http://combinepart.dyndns.biz:81/smarthospital/alert.php";

function set_data_sensor_temp(req, res)
{

    var para =  req.body;

    // var para =  { id: 'd4bc1ea955d4',data: '{"dataFormat":3,"rssi":-46,"humidity":56.5,"temperature":129.59,"pressure":100740,"accelerationX":205,"accelerationY":-252,"accelerationZ":973,"battery":2941}' }
    // console.log(para)
     var tnow = utl.timenow();
    // res.send('oK');

     /* 
     var query = squel.update()
         .table('tb_now')
         .set('data_sensor', para.data)
         .set('receive_time', tnow)
         .set('id_server', para.id_server)
         .where('tagid = ' + utl.sqote(para.id))
         .toString();

        // debugger;
        // console.log(query);

         ipm.db.dbname = db_owner;
         db.excute(ipm, query, response => {
         
             if (response == 'oK')
             {
               // console.log(response);
               //  res.send(response);
              // d4bc1ea955d4
              var ht_sensor ="ht_"+para.id;

              var insert = squel.insert()
              .into(ht_sensor)
              .set('data_sensor', para.data)
              .set('receive_time', tnow)
              .set('id_server', para.id_server)
              .toString();

              
               ipm.db.dbname = db_owner;
               db.excute(ipm, insert, response => { 

                check_for_send_LINE(para.id,para,function(x_line)
                {
                  res.send(response); 
                })
           
                
              });

             }
             else
             {
                res.send('fail not register');
             }

        });
       */
      res.send('Ok'); 
 
}

function history_data_sensor(req, res)
{
  var para =  req.body;
 // var para =  { id: 'c1cb3fd50f74',start:'2019-09-13 00:00',stop:'2019-09-13 23:59'}

  var tb_name ="ht_"+para.id;
  var sql="";
  sql+=" SELECT ";  
  sql+="  to_char(receive_time, 'YYYY-MM-DD HH24:MI:SS') as receive_time ";
  sql+=" ,data_sensor -> 'rssi' AS rssi  ";
  sql+=" ,data_sensor -> 'battery' AS battery ";
  sql+=" ,data_sensor -> 'temperature' AS temperature ";
  sql+=" ,data_sensor -> 'humidity' AS humidity ";
  sql+=" ,data_sensor -> 'pressure' AS pressure ";
  sql+=" ,id_server ";
  sql+=" ,data_sensor -> 'accelerationX' AS X ";
  sql+=" ,data_sensor -> 'accelerationY' AS Y ";
  sql+=" ,data_sensor -> 'accelerationZ' AS Z ";
  sql+=" FROM "+tb_name;
  sql+=" WHERE receive_time >'"+para.start+"' ";
  sql+=" AND receive_time <'"+para.stop+"' ";
  sql+=" ORDER BY receive_time ASC ";

  ipm.db.dbname = db_owner;
  db.get_rows(ipm, sql, function(rows)
  {
      if(rows.length>0)
      {
        res.send(rows);
      }
      else
      {
        res.send([]);
      }
       
  });

}

function list_all_sensor(req, res)
{
    var sql = "SELECT id,tagid,data_sensor,idate(receive_time) as receive_time FROM tb_now ORDER BY id ";
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function(rows)
    {
         res.send(rows);
    });
}

function list_all_sensor_PMK(req, res)
{
    var sql = "SELECT id,tagid,data_sensor,idate(receive_time) as receive_time FROM  tb_now WHERE id_group='0002' ORDER BY id ";
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function(rows)
    {
         res.send(rows);
    });
}

//set_data_sensor_temp(' ',' ')

function check_for_send_LINE(id_sensor,data_sensor,callback)
{
 // console.log(data_sensor)
 /*
  ipost.send_data(url_setting,null,result =>
  {
    var setting = linq.Enumerable.From(result)
    .Where(function (x) { return x.tagid == id_sensor })
    .ToArray()


   var data = JSON.parse(data_sensor.data)
   // console.log(data.temperature)
   // data.humidity
  //  data.pressure
     if(setting.length>0)
     {
        var st = setting[0];
       // st.linedelay = 300;
       // console.log(st);
      //  st.tempMax = 28
        if(data.temperature > st.tempMax)
        {
          //st.delay
          check_line_delay(id_sensor,st.linedelay,is_true =>{
              if(is_true)
              {
                line_format_Temp(st,data.temperature,true,function(x1)
                { 
                  update_time_delay(id_sensor,function(x2)
                  {
                    callback(x2); 
                    return;
                  })
            
                })
              }
              else
              {
                callback('line delay not over '); 
                return;
              }
          });
            
        }

        if(data.temperature < st.tempMin)
        { 
          // line_format_Temp(st,data.temperature,false,function(x){ callback(x); return; })
          check_line_delay(id_sensor,st.linedelay,is_true =>{
            if(is_true)
            {
              line_format_Temp(st,data.temperature,false,function(x1)
              { 
                update_time_delay(id_sensor,function(x2)
                {
                  callback(x2); 
                  return;
                })
          
              })
            }
            else
            {
              callback('line delay not over '); 
              return;
            }
        });
        }

        if(data.humidity > st.humiMax) 
        { 
          //line_format_Humudity(st,data.humidity,true,function(x){ callback(x); return; }) 
          check_line_delay(id_sensor,st.linedelay,is_true =>{
            if(is_true)
            {
              line_format_Humudity(st,data.humidity,true,function(x1)
              { 
                update_time_delay(id_sensor,function(x2)
                {
                  callback(x2); 
                  return;
                })
          
              })
            }
            else
            {
              callback('line delay not over '); 
              return;
            }
         });
        }

        if(data.humidity < st.humiMin) 
        {
           //line_format_Humudity(st,data.humidity,false,function(x){ callback(x); return; })  
           check_line_delay(id_sensor,st.linedelay,is_true =>{
            if(is_true)
            {
              line_format_Humudity(st,data.humidity,false,function(x1)
              { 
                update_time_delay(id_sensor,function(x2)
                {
                  callback(x2); 
                  return;
                })
          
              })
            }
            else
            {
              callback('line delay not over '); 
              return;
            }
         });
        }

        if(data.pressure > st.pressMax) 
        { 
          // line_format_Pressure(st,data.pressure,true,function(x){ callback(x); return; }) 
          check_line_delay(id_sensor,st.linedelay,is_true =>{
            if(is_true)
            {
              line_format_Pressure(st,data.pressure,true,function(x1)
              { 
                update_time_delay(id_sensor,function(x2)
                {
                  callback(x2); 
                  return;
                })
          
              })
            }
            else
            {
              callback('line delay not over '); 
              return;
            }
         });
        }

        if(data.pressure < st.pressMin) 
        {
          // line_format_Pressure(st,data.pressure,false,function(x){ callback(x); return; }) 
          check_line_delay(id_sensor,st.linedelay,is_true =>{
            if(is_true)
            {
              line_format_Pressure(st,data.pressure,false,function(x1)
              { 
                update_time_delay(id_sensor,function(x2)
                {
                  callback(x2); 
                  return;
                })
          
              })
            }
            else
            {
              callback('line delay not over '); 
              return;
            }
          });
        }

     }
     else
     {
      callback(true); return; 
     }
      
  });

  */

 callback('line delay not over '); 
 return; 

}

/*
"tagid":"a42c1ea966d5"
,"name":"Freezer 01"
,"department":"Chemical Dept."
,"floor":"Floor G"
,"tempMin":"20","tempMax":"30"
,"humiMin":"40","humiMax":"50"
,"pressMin":"60","pressMax":"70"
,"line":"FzsVe27FdYiaeClqnkUptzXPOKBrCTWYaIFuC9ycQvh"
*/
  //sf+=" 💦 ความชื้อสูงกว่าที่กำหนด 75% (จาก 30%) ";
  //sf+=" 🌬️ แรงดันอากาศสูงกว่าที่กำหนด 370 hPa (จาก 100041 hPa) ";
 // sf+=" ⚠️ เครื่องมือถูกเคลื่อนย้ายออกจากจุดที่กำหนด ⚠️ ";
  //sf+=" ปัจจุบันอยู่ที่ ชั้น 3, แผนกเคมีบำบัด ";


function line_format_Temp(st_data,temperature,is_min_max,callback)
{
  var sf="";
  sf+=" Smart Hospital: 🏥 [ทดสอบ] ⚠️ แจ้งเตือน ⚠️ \r\n";
  sf+=" ❄️ "+st_data.name+" "+st_data.floor+", "+st_data.department+ '\r\n';

  if(is_min_max==true)
  {
    sf+=" 🌡️ อุณหภูมิสูงกว่าที่กำหนด "+temperature+" °C (จาก "+st_data.tempMax+" °C) "+ '\r\n';
  }

  if(is_min_max==false)
  {
    sf+=" 🌡️ อุณหภูมิต่ำกว่าที่กำหนด "+temperature+" °C (จาก "+st_data.tempMin+" °C) "+ '\r\n';
  }

  var token = st_data.line;
  send_line(sf,token,function(xres)
  {
     callback(xres);
     return;
  });
}

function line_format_Humudity(st_data,Humudity,is_min_max,callback)
{
  var sf="";
  sf+=" Smart Hospital: 🏥 [ทดสอบ] ⚠️ แจ้งเตือน ⚠️ \r\n";
  sf+=" ❄️ "+st_data.name+" "+st_data.floor+", "+st_data.department+ '\r\n';

  if(is_min_max==true)
  {
    sf+=" 💦 ความชื้นสูงกว่าที่กำหนด "+Humudity+" % (จาก "+st_data.humiMax+" %) "+ '\r\n';
  }

  if(is_min_max==false)
  {
    sf+=" 💦 ความชื้นต่ำกว่าที่กำหนด "+Humudity+" % (จาก "+st_data.humiMin+" %) "+ '\r\n';
  }

  var token = st_data.line;
  send_line(sf,token,function(xres)
  {
     callback(xres);
     return;
  });
}

function line_format_Pressure(st_data,Pressure,is_min_max,callback)
{
  var sf="";
  sf+=" Smart Hospital: 🏥 [ทดสอบ] ⚠️ แจ้งเตือน ⚠️ \r\n";
  sf+=" ❄️ "+st_data.name+" "+st_data.floor+", "+st_data.department+ '\r\n';

  if(is_min_max==true)
  {
     sf+=" 🌬️ แรงดันอากาศสูงกว่าที่กำหนด "+Pressure+" hPa (จาก "+st_data.pressMax+" hPa) "+ '\r\n';
  }

  if(is_min_max==false)
  {
    sf+=" 🌬️ แรงดันอากาศต่ำกว่าที่กำหนด "+Pressure+" hPa (จาก "+st_data.pressMin+" hPa) "+ '\r\n';
  }

  

  var token = st_data.line;
   send_line(sf,token,function(xres)
   {
      callback(xres);
      return;
   });
}



function send_line(msg,token,callback)
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
    // console.log(JSON.stringify(err));
    // console.log(JSON.stringify(httpResponse));
    // console.log(JSON.stringify(body));
     callback(true);
     return;
  })
}


function check_line_delay(id_sensor,sec_delay,callback)
{
  var sql = "SELECT idate(receive_time) as recive_time,idate(timer_cheker_delay) as checker_time FROM tb_now WHERE tagid='"+id_sensor+"'  ";
  ipm.db.dbname = db_owner;
  db.get_rows(ipm, sql, function(rows)
  {
  //  rows[0].recive_time
   // rows[0].checker_time
  
    var ts = idif.datediff(rows[0].checker_time,rows[0].recive_time);
    ts.total_sec = parseInt(ts.total_sec);
    sec_delay =parseInt(sec_delay);
    console.log('check_line_delay '+ts.total_sec+' '+sec_delay)
    if(ts.total_sec > sec_delay)
    {
      callback(true)
      return;
    }
    else
    {
      callback(false)
      return;
    }
   // console.log( ts.total_sec);
  });
}

function update_time_delay(id_sensor,callback)
{

  var tnow = utl.timenow();
  var query = squel.update()
  .table('tb_now')
  .set('timer_cheker_delay', tnow)
  .where('tagid = ' + utl.sqote(id_sensor))
  .toString();

  ipm.db.dbname = db_owner;
  db.excute(ipm, query, finis_update => {
    callback(finis_update);
    return;
  });

}


function gateway_sensor(req, res)
{
  debugger;
  console.log( req.body);

  res.send(req.body); 
}

/*
  
 { tags: 
    [ { accelX: 0.115,
        accelY: 0.041,
        accelZ: 1.025,
        dataFormat: 3,
        defaultBackground: 6,
        favorite: true,
        gatewayUrl: '',
        humidity: 50,
        id: 'C7:A4:8E:F4:EF:C2',
        measurementSequenceNumber: 0,
        movementCounter: 0,
        pressure: 1008.15,
        rawDataBlob: [Object],
        rssi: -43,
        temperature: 31.26,
        txPower: 0,
        updateAt: '2019-09-19T01:20:14+0700',
        voltage: 3.019 } ],
   batteryLevel: 51,
   deviceId: 'cadff4a8-94f6-4803-81d4-6cf9c123d3d0',
   eventId: 'ea3acafd-9032-409c-b446-a303eb9d1924',
   location: { accuracy: 2000,latitude: 13.801801801801801, longitude: 100.59829044867064 },
   time: '2019-09-19T01:20:14+0700' 
  }
*/


var para =  { id: 'd4bc1ea955d4',data: '{"dataFormat":3,"rssi":-46,"humidity":56.5,"temperature":29.59,"pressure":100740,"accelerationX":205,"accelerationY":-252,"accelerationZ":973,"battery":2941}' }
//check_for_send_LINE('c7a48ef4efc2',para);


exports.set_data_sensor_temp = set_data_sensor_temp;
exports.list_all_sensor  = list_all_sensor;
exports.list_all_sensor_PMK = list_all_sensor_PMK;
exports.history_data_sensor = history_data_sensor;
exports.gateway_sensor = gateway_sensor;

function test()
{
  var ts =idif.datediff('2019-09-05 16:41:55','2019-09-05 16:52:39');
   console.log( ts.total_sec);
}

/*
check_line_delay('c1cb3fd50f74','20',function(is_alert)
{
  console.log(is_alert);
});

*/
//test();
//set_data_sensor_temp('','');

//https://github.com/ruuvi/com.ruuvi.station/blob/master/app/src/main/java/com/ruuvi/station/util/AlarmChecker.java
function hasTagMoved(one,two) 
{
  var threshold = 0.03;
  return diff(one.accelZ, two.accelZ) > threshold 
  || diff(one.accelX, two.accelX) > threshold 
  || diff(one.accelY, two.accelY) > threshold;
}

function diff(one, two) 
{
  return Math.abs(one - two);
}

//var one={accelZ:-27,accelX:-960,accelY:179};
//var two={accelZ:-1007,accelX:-54,accelY:82};
//var x = hasTagMoved(one,two);
//console.log(x);
//accelerationX":-960,"accelerationY":179,"accelerationZ":-27
//"accelerationX":-54,"accelerationY":82,"accelerationZ":1007

//{"battery":2971}

// SELECT round( CAST(float8 (2971.0/3000)*100 as numeric), 2) as percent_bettery
/*
var sensor0={
data_json={
altitude: "24.89"
,batt_voltage: 4.141935
,firmware_version: "2.1"
,humidity: "42.90"
,ip_address: "192.168.210.119"
,mac_address: "CC:50:E3:08:74:C6"
,pressure: "1010.26"
,send_error: 1
,sleep_time: 180
,temperature: "24.98"
,type_sensor: "Temperature&Humidity"
,wifi_count_connect: 521
,wifi_password: "Vejth@n1"
,wifi_rssi: "-89"
,wifi_ssid: "VTN_Device"
}
,setting_sensor={
calibrate_humidity: "0"
,calibrate_temperature: "0"
,call_notify: false
,critical_temperature_max: "26"
,critical_temperature_min: "19"
,limit_humidity: "60"
,limit_temperature_max: "26"
,limit_temperature_min: "19"
,line_notify: false
,sensor_name: "(ชั้น1)_CT Scan"
,sleep_time: "180"
,sms_notify: false
,type_sensor: "Temperature&Humidity"
,wifi_password: "Vejth@n1"
,wifi_ssid: "VTN_Device"
}
,humidity_max: "71.51"
,humidity_min: "0"
,mac_address: "CC:50:E3:08:74:C6"
,send_error_max: "51"
,sensor_datetime: "2019-09-10 06:26:49"
,sensor_id: 3
,server_datetime: "2019-09-10 06:26:49"
,temperature_max: "29.48"
,temperature_min: "17.97"
,udid: "02e1c529-e99e-43d3-95d8-5cf30bd27c1a"
,update_firmware: false
,wifi_connection_time_max: "35952"
}
*/