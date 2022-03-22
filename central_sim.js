
var request = require('request');

// https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/

//https://docs.google.com/spreadsheets/d/1n5YgHyeebWZwN8WjjlA-1XA5piZ_YCjqAKrKEm4P-CQ/edit#gid=1751898576

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var utl = require('Utility.js');
var db_config = "master_config";


//var url = "http://61.91.14.253:9003/api/"; 
var api_name ="http://127.0.0.1:3000"; 

function dbqote (s) 
{
  return '"' + s + '"';
}

function load_data()
{

  var sql="";
  sql+="    SELECT "+dbqote('SIM Status')+","+dbqote('Activated')+" ";
  sql+="  ,substr("+dbqote('MSISDN')+",3,10) as sim_true ";
  sql+="  ,mcv.serial_sim as ktc_sim ";
  sql+="  ,mcv.vehiclename,mcv.db_name ";
  sql+="  ,mcv.modem_id ";
  sql+="  ,idate(mcv.time_config) as time_config ";
  sql+="  FROM export_20200 ,master_config_vehicle as mcv ";
  sql+=" WHERE substr(mcv.serial_sim,2,10)=substr("+dbqote('MSISDN')+",3,10) ";
  sql+=" AND "+dbqote('SIM Status')+"='Activated' ";
  sql+=" ORDER BY mcv.db_name LIMIT 10";

  ipm.db.dbname = db_config;
  db.get_rows(ipm, sql, function (rows) 
  {
  // console.log(rows.length);
      if (rows.length > 0) 
      {
       //  var json = JSON.stringify(rows);
       /*
       {
        "data": [[1,2], [3,4]]
       }
       */
       // var x =  JSON.parse(rows);
       var data={'data':rows};

         send_data(api_name,data,function(xs)
         {
           debugger;
            console.log(xs);
         })
         // console.log(rows);
      } 
      else 
      {
         
      }
  });

}

load_data();


function send_data(master_url, json_data, callback) {
 // var master_url = url //+ api_name;

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