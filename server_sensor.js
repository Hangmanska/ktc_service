//console.log('Hello world');
var moment = require('moment');
var async = require('async');
var squel = require("squel");
var request = require('request');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js'); 

var ipm = new db.im2(db.get_configdb_tcp());


var A_min =[60766.0,65100.0,65410.0,60766.0,65100.0,64941.0]
var A_max =[595640.0,599640.0,599640.0,1160000.0,599640.0,599640.0]
var Act_min =[0.0,0.0,0.0,0.0,0.0,-25.0]
var Act_max =[14.0,60.0,250.0,100.0,250.0,100.0]
var unit =['SAE','lpm','bar','%','bar','C'];

var send_every_sec = 10;
var prefix_db ='db_'
var suffix_db = '_sensor';
var Splitter ='X'
var db_config = "master_config";
var url = "http://127.0.0.1:9003/api/"; //config.camera.server;//



function struct_Base()
{
    this.modem_id = "0";
    this.gps_datetime = "";
    this.lon = "0";
}

function get_dbname(modem_id)
{
    //var x =  utl.Left(data,13);
   // var t = utl.Right(x,10);
    var dbx = utl.Mid(modem_id,3,5);
    dbx = prefix_db+dbx+suffix_db;
    return dbx;
}

function setdate_fromdv(dt)
{
      var t = moment(dt,'YYYYMMDDHHmmss').format(); //https://github.com/moment/moment/issues/3047
      t =  format_unix_date(t,null);
     return t;
}

function format_unix_date(dt, format) 
{
    if(format!=null)
    {
        return moment(dt).format(format);
    }
    else
    {
         return moment(dt).format('YYYY-MM-DD hh:mm:ss');
    }
    
}



//+++++++++++++++++++ First step ++++++++++++++++



function get_master_config_sensor(modem_id,callback)
{
   var sql= "SELECT modem_id,ref_min,ref_max,act_min,act_max,unit,sensor_id,sensor_name,groupid,apikey FROM master_config_sensor WHERE modem_id="+utl.sqote(modem_id);
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        callback(res);
        return;
    });
}

function send_data(api_name, json_data, callback) {
    var master_url = url + api_name;

  //  console.log(master_url);

    request({
        url: master_url,
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

function process_realtime(dt,callback)
{

       //var t = moment('20170212061010','YYYYMMDDHHmmss').format();
     var ar = utl.Split(dt,',');
     var modem_id = ar[0];
     var db_sensor = get_dbname(modem_id);
     var t = setdate_fromdv(ar[1]);

     get_master_config_sensor(modem_id,function(row)
     {
        // debugger;
     
          async.eachSeries(row, function (x, xnext)
            {
                var index = parseInt( x.sensor_id)+2;
                raw_val = parseInt(ar[index]);
                cal_val = base_cal(x.ref_min,x.ref_max,x.act_min,x.act_max,raw_val);

            var json={ sensor_id: 'A'+x.sensor_id,
            rawval: raw_val,
            sensor_name: x.sensor_name,
            calval: cal_val,
            unit: x.unit,
            group: x.groupid,
            apikey:x.apikey,
            db_name :db_sensor,
            modem_id : modem_id
            };

        //    console.log(json);

            var api_name ='api_sensor/'+json.sensor_id

            send_data(api_name,json,function(xres)
            {
                  debugger;
                  if(xres!=null)
                  {
                    set_history_sensor(json,function(resx)
                    {
                         xnext();
                    })
                    
                  }
                  else
                  {
                      xnext();
                  }
               
            })
             
               
            },function(){
                 //  console.log('finish');
                   callback('oK');
                   return;
            });
     });



}


 function base_cal(ref_min,ref_max,Act1_min,Act1_max,send_data)
{
   
  //  console.log(t);
    var x = ((parseFloat( send_data) * 0.1875) /1000)
    console.log('x'+x)
  var m1 = (Act1_max - Act1_min)/(ref_max - ref_min);
  var c1 = Act1_min - (m1 * ref_min);



 // var total1=3752//950671  //read from analog sesor_data

 // var result = (m1 * send_data) + c1 ; //
   var result = (m1 * x) + c1 ; //
  result = result.toFixed(2);
  console.log("m1="+m1 +' c1 ='+c1+' x='+x +' result ='+result)
  return result;
}


function set_history_sensor(data,callback) 
{
    var tb_name ="ht_"+data.modem_id;

      var sql = squel.insert()
      .into(tb_name)
      .set("data_sensor", JSON.stringify(data))
      .set("date_stamp", utcp.now())
      .toString();

    ipm.db.dbname = data.db_name;
    db.excute(ipm, sql, function (is_ok) 
    {
        if(is_ok)
        {
          //  console.log('set_history_sensor ' + is_ok);
            callback(is_ok);
            return;
        }
      
    });
}

 /*

 setTimeout(function ()
{
  
    debugger;
   //var  
 
   var t = moment('20170212061010','YYYYMMDDHHmmss').format();
       t =  moment(t).add(send_every_sec, 'seconds');
       t =  format_unix_date(t,null);
        console.log(t);
     
  // main();

  var last = '13.32,56.04,-0.63,21.93,-0.51,-25.36';
  var xjson={'t':'20170212061010','modem_id':'1010001001','time_device':'2017-02-12 06:10:11','db_name':'db_10001_sensor','data':''};
  insert_realtime(xjson,last,function(xres)
  {
    console.log(xres);
  });


}, 1000);

  //console.log(temp0);




//{"sensor_id":"A0","rawval":"570029","sensor_name":"SAE","calval":"15.0","unit":"SAE","group":"hydacsensor","apikey":"$2a$10$imfccwgRrs7AL1cu3rr3nOjv"}

//var s='@@,1010001001,20170622164346X6234,6242,6245,6245,2894,2857,2912,6245X6233,6243,6244,6244,2861,2894,2889,6246X6233,6242,6244,6244,2863,2917,2844,6245X6233,6242,6245,6245,2910,2862,2901,6245X6234,6242,6243,6246,2904,2861,2916,6244X6233,6241,6243,6246,2912,2856,2909,6245X6232,6241,6244,6244,2917,2851,2920,6246X6234,6243,6242,6245,2889,2864,2920,6246X6233,6241,6245,6244,2860,2928,2845,6245X6232,6240,6245,6245,2907,2875,2879,6243';
var s='1010005005,20170706072622,19040,19016,19013,19029,2917,2844,3309,19028';
process_realtime(s,function(x)
{
    console.log(x);
});
 */

exports.process_realtime = process_realtime;
//exports.insert_rawdata = insert_rawdata;
