var async = require('async');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_owner ="db_10039";

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
  sql+="  AND    table_name = 'can_"+modem_id+"' ";
  sql+="  ) ";

  ipm.db.dbname = db_name;
  db.get_rows(ipm, sql, function (res_db)
  {
     // debugger;
      //  console.log(res_db[0].exists)
        callback(res_db[0].exists)
        return;
  });

}

function create_table(modem_id,callback)
{
    var tb="can_"+modem_id;

    has_table(modem_id,db_owner,function(has_table)
    {
        if(!has_table)
            {

    var sql="";
    sql+=' CREATE TABLE "public"."'+tb+'" ( ';
        sql+='   "id" bigserial NOT NULL, ';
        sql+='   "recive_time" timestamp(6),  ';
        sql+='   "can_speed_motor" numeric, ';
        sql+='   "can_volt_batt" numeric, ';
        sql+='   "can_percent_batt" numeric, ';
        sql+='   "can_speed" numeric, ';
        sql+='   "can_temp_batt" numeric, ';
        sql+='   "sec_movement" numeric, ';
        sql+='   CONSTRAINT "'+tb+'_pkey" PRIMARY KEY ("id") ';
        sql+='   ) ';
        sql+='   WITH (OIDS=FALSE); ';
        sql+='   CREATE INDEX "id_'+modem_id+'_x" ON "public"."'+tb+'" USING btree (recive_time); ';
    //  sql+='   ; ';



        ipm.db.dbname = db_owner;
        db.excute(ipm, sql, function (is_ok)
        {
            callback(is_ok);
            return;
        });
        }else{
            callback(true);
            return;
        }
   });

}
/*

*/

function list_table()
{
    var sql=""
    sql+=" SELECT r.modem_id,mcv.vehiclename,group_zone,x.xVehicletypeid ";
    sql+=" FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r  ";
    sql+=" ,fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x  ";
    sql+=" WHERE	sv.fleetcode=get_fleetid('admin_tnt') AND mcv.db_name=sv.fleetid  ";
    sql+=" AND sv.modem_id= mcv.modem_id AND sv.modem_id=r.modem_id AND x.xVehicletypeid='48' ";
    sql+=" AND group_zone NOT LIKE '%บางขะแยง%' ";
    //sql+=" AND sv.modem_id NOT IN ('143190871427','143190871737') ";
  //  sql+=" AND sv.modem_id='143200385143' ";
    sql+=" ORDER BY mcv.vehiclename ";

/*
    var sql=""
    sql+=" WITH res as (SELECT table_name ";
    sql+=" FROM information_schema.tables ";
    sql+=" WHERE table_schema = 'public' ) ";

    sql+=" SELECT substr(table_name,4,15)as modem_id FROM res ";
    sql+=" WHERE table_name !='realtime' "; 
    sql+=" AND table_name !='vb_143190871745' ";
*/

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0) 
        {
           // res.send(rows);
           async.eachSeries(rows, function (row, next)
           {
               create_table(row.modem_id,function(ds)
               {
                    next();
               })
           },function(){
               console.log('finish');
           });
        }

        else 
        {
           // res.send([]);
        }
    });

}

list_table();