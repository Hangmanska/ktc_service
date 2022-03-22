//https://www.npmjs.com/package/rpio
var rpio = require('rpio');
var async = require('async');
var db = require('iConnectdb_ktc.js');
var ipost = require('xPost.js');
var linq = require('linq.js');
var db_owner = "db_sensor_10001";
var ipm = new db.im2(db.get_configdb_tcp());
var url_setting ="http://combinepart.dyndns.biz:81/smarthospital/alert.php";
var url_allsensor = "http://61.91.14.253:8003/api/list_all_sensor_PMK";

//Pin12 / GPIO18
var pin_out1 = 12;

/*
 * Set the initial state to low.  The state is set prior to the pin
 * being actived, so is safe for devices which require a stable setup.
 */
rpio.open(pin_out1, rpio.OUTPUT, rpio.LOW);


// 
//console.log('Pin 12 = %d', rpio.read(pin_out1));

/*
setTimeout(function ()
{
    console.log('x Pin 12 = %d', rpio.read(pin_out1));
    rpio.write(pin_out1, rpio.HIGH);
    console.log('x2 Pin 12 = %d', rpio.read(pin_out1));
}, 1000);


setTimeout(function ()
{
    console.log('x Pin 12 = %d', rpio.read(pin_out1));
   rpio.write(pin_out1, rpio.LOW);
    console.log('x2 Pin 12 = %d', rpio.read(pin_out1));
}, 1000);
*/

function alert_sound()
{
    /* */
    rpio.write(pin_out1, rpio.HIGH);
  //  rpio.sleep(2);

    // Off for half a second (500ms) 
  //  rpio.write(pin_out1, rpio.LOW);
  //  rpio.sleep(2);
   
   //console.log('hi');
}

function list_all_sensor()
{
    /*
    var sql = "SELECT id,tagid,data_sensor,idate(receive_time) as receive_time FROM tb_now WHERE id_group='0001' ORDER BY id ";
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, rows =>
    {
        // res.send(rows);
        async.eachSeries(rows, function (row, next)
        {
            check_for_alert(row.tagid ,row.data_sensor,function(xres)
            {
                next();
            });
        },function(){
            console.log('finish');
        });
    });
    */
   ipost.send_data(url_allsensor,null,result =>
    {
        async.eachSeries(result, function (row, next)
        {
            check_for_alert(row.tagid ,row.data_sensor,function(xres)
            {
                next();
            });
        },function(){
            console.log('finish');
        });
    });
}


function check_for_alert(id_sensor,data_sensor,callback)
{
  console.log(id_sensor)
  console.log(data_sensor)
  ipost.send_data(url_setting,null,result =>
  {
    var setting = linq.Enumerable.From(result)
    .Where(function (x) { return x.tagid == id_sensor })
    .ToArray()

    var s1_min =false;var s2_min=false;var s3_min=false;
    var s1_max =false;var s2_max=false;var s3_max=false;
    var data = data_sensor;
  // var data = JSON.parse(data_sensor.data)
   // console.log(data.temperature)
   // data.humidity
  //  data.pressure
     if(setting.length>0)
     {
        var st = setting[0];
       // st.linedelay = 300;
       // console.log(st);
       // st.tempMax = 28
        if(data.temperature > st.tempMax)
        {
            s1_max =true;
            alert_sound();
        }
        else
        {
            s1_max =true;
        }

        if(data.temperature < st.tempMin)
        { 
            s1_min =true;
            alert_sound();
        }
        else
        {
            s1_min =true;
        }

        if(data.humidity > st.humiMax) 
        {   s2_max =true;
            alert_sound();
        }
        else
        {
            s2_max =true;
        }

        if(data.humidity < st.humiMin) 
        {
            s2_min =true;
            alert_sound();
        }else
        {
            s2_min =true;
        }

        if(data.pressure > st.pressMax) 
        { 
            s3_max =true;
            alert_sound();
        }else
        {
            s3_max =true;
        }

        if(data.pressure < st.pressMin) 
        {
            s3_min =true;
            alert_sound();
        }
        else
        {
            s3_min =true;
        }

        if(s1_max && s2_max && s3_max && s1_min && s2_min && s2_min)
        {
            callback(true); 
            return; 
        }

     }
     else
     {
      callback(true); 
      return; 
     }
      
  })
}

/*
setInterval(function() 
{
    list_all_sensor()
}, 10000)
   */

//list_all_sensor()