

var async = require('async');
var squel = require("squel");
var moment = require('moment');
var mustache = require("mustache");


var db = require('iConnectdb_ktc.js');
const { updateLocale } = require('moment');
var ipm = new db.im2(db.get_configdb_tcp());

var db_config = "master_config";
var db_focus="db_10011"
var db_owner ="sugarcane_kumpawapi"
var utl = require('Utility.js');
var date_start="2021-02-10"
var idf = require('iDatediff.js');


function has_table(modem_id,db_name,callback)
{
    /*
    SELECT EXISTS (
   SELECT 1
   FROM   information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name = 'ht_142181053379'
   );
    */

  var sql="  SELECT EXISTS ( ";
  sql+="  SELECT 1 ";
  sql+="  FROM   information_schema.tables ";
  sql+="  WHERE  table_schema = 'public' ";
  sql+="  AND    table_name = 'ht_"+modem_id+"' ";
  sql+="  ) ";

  ipm.db.dbname = db_name;
  db.get_rows(ipm, sql, function (res_db)
  {
      debugger;
      //  console.log(res_db[0].exists)
        callback(res_db[0].exists)
        return;
  });

}

function what_time_enter_factory(modem_id,start,end,id_key,db_name,callback)
{
   // var start =  date+" 00:00";
  //  var end = date+" 23:59";

    console.log('modem_id '+modem_id);

    var sql=" WITH res as( ";
    sql+=" SELECT gps_datetime";
    sql+=" ,dblink_which_factory(lon::NUMERIC,lat::NUMERIC) as factory_id   ";
    sql+="  FROM ht_"+modem_id;
    sql+="  WHERE gps_datetime >='"+start+"'   ";
    sql+="  AND gps_datetime <='"+end+"' )  ";
        
    sql+="  SELECT factory_id,idate(gps_datetime) as  gps_datetime  FROM res  ";
    sql+="     WHERE factory_id IS NOT NULL  ";
    sql+="     ORDER BY gps_datetime ASC LIMIT 1  ";

    ipm.db.dbname = db_name;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length >0) 
        {
            set_report(res[0].factory_id,res[0].gps_datetime,id_key,function(xres)
            {
                callback(true);
                return;
            })
        }
        else
        {
            console.log('not found '+modem_id+" "+start );

            set_report('999','2021-09-18 00:00',id_key,function(xres)
            {
                callback(true);
                return;
            })
        }
    });

}



function set_report(factory_id,gps_datetime,id_key,callback)
{
    console.log('factory_id= '+factory_id+' time_enter_factory='+gps_datetime+' id '+id_key)
    var sql= " UPDATE truck_work_in_farm2 SET factory_id='"+factory_id+"',time_enter_factory='"+gps_datetime+"'  WHERE id='"+id_key+"' ";
 
    ipm.db.dbname = db_owner;
    db.excute(ipm, sql, function (response) 
    {
        if (response == 'oK') 
        {
            callback(response);
            return;
           
        }
        else 
        {
            callback(response);
            return;

        }
    });
} 



function start()
{


    var sql = " SELECT b.id as id_key";
    sql += ",to_char(b.end_work, 'YYYY-MM-DD HH24:MI') as tk_start";
    sql += ",to_char(b.end_work, 'YYYY-MM-DD')||' 23:59' as tk_end";
    sql += ",b.modem_id as modem_id ";
    sql += " FROM harvester_report2 as a,truck_work_in_farm2 as b  ";
    sql += " WHERE b.farm_id=a.farm_id  ";
    sql += " AND b.farm_id =a.farm_id  ";
    sql += " AND to_char(a.start_work, 'YYYY-MM-DD')=to_char(b.start_work, 'YYYY-MM-DD') AND b.factory_id IS NULL  ";


    //var date_gen_report = '2016-06-25'
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {

                has_table(row.modem_id,db_focus,function(result)
                {
                    if(result)
                    {
                        what_time_enter_factory(row.modem_id,row.tk_start,row.tk_end, row.id_key,"db_10011",function(xrds)
                        {
                            next();
                        });
                    }
                    else
                    {
                        what_time_enter_factory(row.modem_id,row.tk_start,row.tk_end, row.id_key,"db_10023",function(xrds)
                        {
                            next();
                        });
                    }

               });

            },function(){
                console.log('++++++++++ finish complete ++++++++++');
            });
        }
    });

}

//moment().format("YYYY-MM-DD");
start();

//test();