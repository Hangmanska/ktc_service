//https://www.npmjs.com/package/rpio
var rpio = require('rpio');
var async = require('async');
var ipost = require('xPost.js');
var linq = require('linq.js');
var url_setting ="http://combinepart.dyndns.biz:81/smarthospital/alert.php";
var url_allsensor = "http://61.91.14.253:8003/api/list_all_sensor_PMK";

//Pin12 / GPIO18
var pin_out1 = 12;

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var CurrentDateTime = date+' '+time;

/*
 * Set the initial state to low.  The state is set prior to the pin
 * being actived, so is safe for devices which require a stable setup.
 */
rpio.open(pin_out1, rpio.OUTPUT, rpio.LOW);


// 
console.log(CurrentDateTime+' Pin 12 = %d', rpio.read(pin_out1));

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
    console.log(CurrentDateTime+' Alert Sound Pin 12 = %d', rpio.read(pin_out1));
    rpio.write(pin_out1, rpio.HIGH);
    rpio.sleep(2);
    rpio.write(pin_out1, rpio.HIGH);
    rpio.sleep(2);
    console.log(CurrentDateTime+' Alert Sound Pin 12 = %d', rpio.read(pin_out1));
    rpio.write(pin_out1, rpio.LOW);
    console.log(CurrentDateTime+' Alert Sound Pin 12 = %d', rpio.read(pin_out1));
}

function list_all_sensor()
{

   ipost.send_data(url_allsensor,{todo: 'Buy the milk'  },result =>
    {
        debugger
      //  console.log(result);
        async.eachSeries(result, function (row, next)
        {
            debugger;
            check_for_alert(row.tagid ,row.data_sensor,function(xres)
            {
                next();
            });
        },function(){
            console.log(CurrentDateTime+' finish Check Alert');
        });
    });
}


function check_for_alert(id_sensor,data_sensor,callback)
{
 //console.log(id_sensor)
 // console.log(data_sensor)
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

/*   */
setInterval(function() 
{
    list_all_sensor()
}, 60000)


//list_all_sensor()

function test()
{
    const request = require('request')
/*
    request.post(url_allsensor, 
    {json: {todo: 'Buy the milk'  }}
    , (error, res, body) => {
    if (error) 
    {
        console.error(error)
        return
    }
    console.log(`statusCode: ${res.statusCode}`)
    console.log(body)
    })
    */
   var json_data={todo: 'Buy the milk'  }
   request({
    url: url_allsensor,
    method: "POST",
    json: true,   // <--Very important!!!
    body: json_data
    }, function (error, response, body) {
       debugger;
        if (error) {
            console.log(error);
            callback(error);
            return;
        }
        //console.log(body);
        callback(body);
        return;
    
    });
}

//test();