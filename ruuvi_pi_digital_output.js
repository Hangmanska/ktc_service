//https://www.npmjs.com/package/rpio
var rpio = require('rpio');
var async = require('async');
var ipost = require('xPost.js');
var linq = require('linq.js');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var idif = require('iDatediff.js');


var db_owner = "db_sensor_10001";
var ipm = new db.im2(db.get_configdb_tcp());


var url_setting ="http://www.cinnova.co.th/smartmonitor/alert.php";
var url_allsensor = "http://128.199.176.174:8003/api/list_all_sensor";

//"http://128.199.176.174:8003/api/

//Pin12 / GPIO18
//pint7 / GPIO4
var pin_out1 = 7;

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var CurrentDateTime = date+' '+time;

/*
 * Set the initial state to low.  The state is set prior to the pin
 * being actived, so is safe for devices which require a stable setup.
 */

rpio.open(pin_out1, rpio.OUTPUT, rpio.LOW);

console.log(CurrentDateTime+' Pin 4 = %d', rpio.read(pin_out1));



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
   rpio.write(pin_out1, rpio.HIGH);
    console.log('x2 Pin 12 = %d', rpio.read(pin_out1));
}, 1000);
*/

function alert_sound()
{
    /*   */
    console.log(CurrentDateTime+' Alert Sound Pin 4 = %d', rpio.read(pin_out1));
    rpio.write(pin_out1, rpio.HIGH);
    rpio.sleep(2);
    rpio.write(pin_out1, rpio.HIGH);
    rpio.sleep(2);
    console.log(CurrentDateTime+' Alert Sound Pin 4 = %d', rpio.read(pin_out1));
    rpio.write(pin_out1, rpio.LOW);
    console.log(CurrentDateTime+' Alert Sound Pin 4 = %d', rpio.read(pin_out1));
  
    console.log('alert_sound();');
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
 // console.log(id_sensor)
 // console.log(data_sensor)

  ipost.send_data(url_setting,null,result =>
  {
    var setting = linq.Enumerable.From(result)
    .Where(function (x) { return x.tagid == id_sensor })
    .ToArray()

    var s1_min =false;var s2_min=false;var s3_min=false;
    var s1_max =false;var s2_max=false;var s3_max=false;

  //  var data = data_sensor;
 // console.log(data_sensor.data);

   var data = data_sensor ; //JSON.parse(data_sensor)
   // console.log(data.temperature+' '+st.tempMax)
   // data.humidity
  //  data.pressure
 // console.log(data_sensor);
     if(setting.length>0)
     {
        var st = setting[0];
       // st.linedelay = 300;
       // console.log(st);
       // st.tempMax = 28
   
        check_snooz(id_sensor,st.snooze,is_true =>{
            console.log(id_sensor+' check_snooz '+is_true);
            console.log(data.temperature+' temp max '+st.tempMax+' temp min '+st.tempMin)
             if(is_true)
            {
                if(data.temperature > st.tempMax)
                {
                    console.log('id_sensor > '+id_sensor+' '+data.temperature+' '+st.tempMax)
                    s1_max =true;
                    alert_sound();
                }
                else
                {
                    s1_max =true;
                }

                if(data.temperature < st.tempMin)
                { 
                    console.log('id_sensor < '+id_sensor+' '+data.temperature+' '+st.tempMax)
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

                 /*
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
                */

              //  if(s1_max && s2_max && s3_max && s1_min && s2_min && s3_min)
              if(s1_max && s2_max  && s1_min && s2_min ) 
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

           });

        }

      
  })
}


function check_snooz(id_sensor,snooze_time,callback)
{

 if(snooze_time!="")
 {
    var sql = "SELECT idate(receive_time + interval '7' HOUR ) as recive_time,idate(timer_cheker_delay) as checker_time FROM tb_now WHERE tagid='"+id_sensor+"'  ";
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function(rows)
    {
    console.log(  rows[0].recive_time +' '+rows[0].checker_time +' '+snooze_time)

    
     // var ts = idif.datediff(rows[0].checker_time,rows[0].recive_time);
     var ts = idif.datediff(rows[0].recive_time,snooze_time);
      ts.total_min = parseInt(ts.total_min);
     // sec_delay =parseInt(sec_delay);
      //console.log('check_line_delay '+ts.total_sec+' '+sec_delay)
     // if(ts.total_sec > sec_delay)
     console.log('check_snooz total_min '+ts.total_min);

     if(ts.total_min <= 0)
      {
        callback(true)
        return;
      }
      else
      {
        callback(false)
      // callback(true)
        return;
      }
     // console.log( ts.total_sec);
    });
 }
 else  //not set snooze this mean ready for check
 {
    callback(true)
    return;
 }
 
}


setInterval(function() 
{
    list_all_sensor()
    
}, 10000)

  /*
setInterval(function() 
{
    alert_sound()
}, 10000)
 */

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

//alert_sound();

var para =  { id: 'c8dc88061a9c',data: '{"dataFormat":3,"rssi":-46,"humidity":56.5,"temperature":29.59,"pressure":100740,"accelerationX":205,"accelerationY":-252,"accelerationZ":973,"battery":2941}' }
//check_for_alert('e45433f277e0',para,function(){});
/*
check_snooz("c8dc88061a9c","2020-07-15 07:43:24",function(x){
    console.log(x);
})
*/
