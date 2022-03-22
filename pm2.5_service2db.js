
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

//recive from pi
function set_data_sensor_pm(req, res)
{

    var para =  req.body;

    // var para =  { id: 'd4bc1ea955d4',data: '{"dataFormat":3,"rssi":-46,"humidity":56.5,"temperature":129.59,"pressure":100740,"accelerationX":205,"accelerationY":-252,"accelerationZ":973,"battery":2941}' }
    // console.log(para)
     var tnow = utl.timenow();
    // res.send('oK');
  /* 
    var insert = squel.insert()
    .into('tb_now_pm')
    .set('data_sensor', para.data)
    .set('receive_time', tnow)
    .set('tagid',para.id)
   // .where('tagid = ' + utl.sqote(para.id))
    .toString();

    ipm.db.dbname = db_owner;
    db.excute(ipm, insert, response => { 

     res.send(response);
     
     });
   */
   
     var query = squel.update()
         .table('tb_now_pm')
         .set('data_sensor', para.data)
         .set('receive_time', tnow)
        // .set('id_server', para.id_server)
         .where('tagid = ' + utl.sqote(para.id))
         .toString();

         ipm.db.dbname = db_owner;
         db.excute(ipm, query, response => {
         
             if (response == 'oK')
             {
               // console.log(response);
               //  res.send(response);
              // d4bc1ea955d4
              var ht_sensor ="pm_"+para.id;

              var insert = squel.insert()
              .into(ht_sensor)
              .set('data_sensor', para.data)
              .set('receive_time', tnow)
            //  .set('id_server', para.id_server)
              .toString();

              
               ipm.db.dbname = db_owner;
               db.excute(ipm, insert, response => { 

                res.send(response);
                
              });

             }
             else
             {

               res.send('fail not register');
             }

        });
    
 
}

function history_data_sensor_pm(req, res)
{
  var para =  req.body;
 // var para =  { id: 'c1cb3fd50f74',start:'2019-09-13 00:00',stop:'2019-09-13 23:59'}

  var tb_name ="pm_"+para.id;
  var sql="";
  sql+=" SELECT ";  
  sql+="  to_char(receive_time, 'YYYY-MM-DD HH24:MI:SS') as receive_time ";
  sql+=" ,data_sensor -> 'pm1.0' AS pm1_0  ";
  sql+=" ,data_sensor -> 'pm2.5' AS pm2_5 ";
  sql+=" ,data_sensor -> 'pm10' AS pm10 ";
  sql+=" ,data_sensor -> 'pm1_atmospheric' AS pm1_atmospheric ";
  sql+=" ,data_sensor -> 'pm2.5_atmospheric' AS pm2_5_atmospheric ";
  sql+=" ,data_sensor -> 'pm10_atmospheric' AS pm10_atmospheric ";
  sql+=" ,data_sensor -> 'count_0.3um' AS count_0_3um";
  sql+=" ,data_sensor -> 'count_0.5um' AS count_0_5um";
  sql+=" ,data_sensor -> 'count_1.0um' AS count_1_0um";
  sql+=" ,data_sensor -> 'count_2.5um' AS count_2_5um";
  sql+=" ,data_sensor -> 'count_5.0um' AS count_5_0um";
  sql+=" ,data_sensor -> 'count_10um' AS count_10um";

  sql+=" FROM "+tb_name;
  sql+=" WHERE receive_time >'"+para.start+"' ";
  sql+=" AND receive_time <'"+para.stop+"' ";
  sql+=" ORDER BY receive_time ASC ";

  //console.log(sql);

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

function list_all_sensor_pm(req, res)
{
    var sql = "SELECT id,tagid,data_sensor,idate(receive_time) as receive_time FROM tb_now_pm ORDER BY id ";
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function(rows)
    {
         res.send(rows);
    });
}




exports.set_data_sensor_pm = set_data_sensor_pm;
exports.list_all_sensor_pm  = list_all_sensor_pm;
exports.history_data_sensor_pm = history_data_sensor_pm;