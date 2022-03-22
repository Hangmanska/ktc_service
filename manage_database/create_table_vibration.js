var async = require('async');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_owner ="db_10039";

function create_table(modem_id,callback)
{
    var tb="vb_"+modem_id;
var sql="";
sql+=' CREATE TABLE "public"."'+tb+'" ( ';
    sql+='    "id" bigserial NOT NULL, ';
    sql+=' "recive_time" timestamp(6),  ';
    sql+='   "vibration_data" varchar(200) COLLATE "default", ';
    sql+='   CONSTRAINT "'+tb+'_pkey" PRIMARY KEY ("id") ';
    sql+='   ) ';
    sql+='   WITH (OIDS=FALSE) ';
    sql+='   ; ';

    ipm.db.dbname = db_owner;
    db.excute(ipm, sql, function (is_ok)
    {
        callback(is_ok);
        return;
    });

}
/*

*/

function list_table()
{

    var sql=""
    sql+=" WITH res as (SELECT table_name ";
    sql+=" FROM information_schema.tables ";
    sql+=" WHERE table_schema = 'public' ) ";

    sql+=" SELECT substr(table_name,4,15)as modem_id FROM res ";
    sql+=" WHERE table_name !='realtime' "; 
    sql+=" AND table_name !='vb_143190871745' ";

    ipm.db.dbname = db_owner;
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