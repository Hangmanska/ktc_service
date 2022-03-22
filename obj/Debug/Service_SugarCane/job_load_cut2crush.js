
//#region
var schedule = require('node-schedule');
var mustache = require("mustache");
var async = require('async');

var every = require('every-moment');

var utl = require('Utility.js');
var db = require('iConnectdb.js');
var jpc = require('job_performance.js');
var jrr = require('job_real_time_report.js');
var pg_htt = new db.im2(db.get_dbconfig_htt());
var pg_realtime = new db.im2(db.get_dbconfig_realtime());

var dtc2cane = require('dtc2cane.js');

//#endregion

function getdata_cut2crush(callback)
{
    var sql = ""
    sql += "SELECT "
    sql += "htt_plotcode, "
    sql += "idate(htt_cuttingtime) as cuttingtime, "
    sql += "htt_harvester_name, "
    sql += "idate(htt_factorytime) as factorytime, "
    sql += "htt_truck_name, "
    sql += "dlget_trucklicen(htt_truck_name) as truck_licence, "
    sql += "dlget_trucktype(htt_truck_name) as truck_type,"
    sql += "htt_transectionid, "
    sql += "date_part('HOUR', htt_factorytime::TIMESTAMP-htt_cuttingtime::TIMESTAMP) as summary_time,"
    sql += "dlget_res_cane(htt_transectionid) as message_cane,"
    sql += "blackbox_id,"
    sql += "htt_match_harvester_truck,idate(htt_farm_leaving) as htt_farm_leaving "
    sql += " FROM rec_now WHERE htt_cuttingtime IS NOT NULL "
    sql += " AND to_char(now(),'YYYY-MM-dd') = to_char(htt_cuttingtime,'YYYY-MM-dd') "

    debugger;
    
    db.get_rows(pg_realtime, sql, function (rows)
    {
        if (rows.length > 0)
        {

            //#region
            /*
            var strMustache = '{{#.}}';
            strMustache += "('{{htt_plotcode}}','{{cuttingtime}}','{{htt_harvester_name}}','{{factorytime}}','{{htt_truck_name}}'";
            strMustache += " ,'{{truck_licence}}','{{truck_type}}','{{htt_transectionid}}','{{summary_time}}'";
            strMustache += ",{{message_cane}},'{{blackbox_id}}','{{htt_match_harvester_truck}}'";
            strMustache += "),";
            strMustache += '{{/.}}';

            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            */
            //#endregion

            var s = " ";
            async.eachSeries(rows, function (row, next) {

                s += "(" + utl.sqote(row.htt_plotcode) + ',' + utl.sqote(row.cuttingtime) + ',' + utl.sqote(row.htt_harvester_name) + ',' + utl.sqote(row.factorytime) + ',' + utl.sqote(row.htt_truck_name) + ',';
                s += utl.sqote(row.truck_licence) + ',' + utl.sqote(row.truck_type) + ',' + utl.sqote(row.htt_transectionid) + ',' + utl.sqote(row.summary_time) + ',' + utl.sqote(row.message_cane) + ',' + utl.sqote(row.blackbox_id) + ',' + utl.sqote(row.htt_match_harvester_truck) + ',' + utl.sqote(row.htt_farm_leaving) + "),"
                next();
            }, function () {
                debugger
                s = utl.iRmend(s);
                var sql_insert = " INSERT INTO cut_to_crushtime_log (plot_code,cutting_time,harvester_name,factorytime,truck_name,truck_licence,truck_type,transectionid,summary_time,message_cane,blackbox_id,match_harvester_truck,farm_leaving) VALUES " + s;
                db.excute(pg_htt, sql_insert, function (response) {
                    if (response == 'oK') {
                        callback(response);
                        return;
                    }
                    else {
                        console.log('err ' + sql_insert);
                        callback(response);
                        return;
                     
                    }
                });

            });


        }
        else {
            callback('oK');
            return;
        }
    });
}


    //http://www.codexpedia.com/javascript/nodejs-cron-schedule-examples/
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 23;
rule.minute = 59;

var timer = every(1, 'hour', function ()
{
    get_process_timestamp();
   
});

//get_process_timestamp()

console.log('start');

schedule.scheduleJob(rule, function ()
{
    console.log('This runs at 23:59 every day.');

    getdata_cut2crush(function (xres) {
        console.log(xres);
    });

    jpc.start_job_performance();

    jrr.start_job_realtime_report();

    set_empty_status_truck();

});


function get_process_timestamp() 
{
    var query = " SELECT";
    query += " htt_transectionid,";
    query += " idate(htt_cuttingtime) as htt_cuttingtime,";
    query += " idate(htt_farm_leaving) as htt_farm_leaving,";
    query += " idate(htt_park_prepare) as htt_park_prepare,";
    query += " idate(htt_park_outside) as htt_park_outside,";
    query += " idate(htt_park_inside) as htt_park_inside,";
    query += " idate(htt_factory_leaving) as htt_factory_leaving";
    query += " FROM rec_now";
    query += " WHERE htt_harvester_or_truck = '1'";
    query += " AND get_ymd(htt_cuttingtime) = get_ymd(now()::TIMESTAMP) "; ////
    query += " ORDER BY htt_cuttingtime DESC";

    db.get_rows(pg_realtime, query, function (rows) {
        if (rows.length > 0) 
        {
            // callback(rows)
            debugger;
            run_process_timestamp(rows);

        } 
        
    });
}

function run_process_timestamp(Array)
{
    async.eachSeries(Array, function (row, next) 
    {
        // console.log(row);
        //transaction_id,cutting,farm_leaving,park_prepare,park_outside,park_inside,factory_leaving
        var para = row.htt_transectionid
        + ',' + row.htt_cuttingtime
        + ',' + row.htt_farm_leaving
        + ',' + row.htt_park_prepare
        + ',' + row.htt_park_outside
        + ',' + row.htt_park_inside
        + ',' + row.htt_factory_leaving;

        dtc2cane.set_harvester_cutting_timestamp_final(para,function(x)
        {
            debugger;
            console.log(x);
      
            if (x != null)
            {
                next();
            }
        });
  
    }, function () {
        console.log('finish run_process_timestamp');
    });
}


//clear status truck empty
function set_empty_status_truck()
{
   
    var sql =" ";
  sql +="  UPDATE rec_now SET  ";
  sql +="  htt_factory_leaving=now() ";
  sql +=" ,htt_place='ROAD_WITHOUT_CANE' ";
  sql +=" ,htt_match_harvester_truck=' ' ";
  sql +=" ,htt_truck_distance='0' ";
  sql +=",htt_is_send_order_distance='0' ";
  sql +=",htt_status_truck='EMPTY' ";
  sql +="  WHERE blackbox_id  ";
    sql +="  IN ( ";
  sql +="  WITH res as ( ";
  sql +="  SELECT  ";
  sql +="  htt7.blackbox_id ";
  sql +="  ,lower(htt_status_truck) as htt_status_truck ";
  sql +="  ,lower(htt_place) as htt_place ";
  sql +="  ,htt_farm_leaving ";
  sql +="  FROM rec_now,truck,blackbox ";
  sql +="  ,dblink('dbname=HTT port=5432', 'SELECT truck_number,blackbox_id,bp,name,truck_telephone FROM htt7, master_truck WHERE htt7.truck_number = master_truck.truck_vehicle_code') as htt7 ";
  sql +="  (truck_code varchar(50), blackbox_id varchar(50), bp varchar(10), name varchar(255),truck_telephone varchar(20)) ";
  sql +="  WHERE blackbox.blackbox_id = rec_now.blackbox_id ";
  sql +="  AND truck.truck_id = blackbox.truck_id ";
  sql +="  AND htt7.blackbox_id = rec_now.blackbox_id ";
  sql +="  ) ";


  sql +="   SELECT blackbox_id ";
  sql +="   FROM rec_now WHERE blackbox_id IN ( SELECT blackbox_id FROM res WHERE  htt_status_truck='hard' 	AND get_ymd(htt_farm_leaving) !=get_ymd(now()::TIMESTAMP)) AND datediff('hour', htt_factory_leaving,htt_park_inside) IS NULL ";

  sql +="   UNION ALL  ";

  sql +="   SELECT blackbox_id  ";
  sql +="   FROM rec_now WHERE blackbox_id IN ( SELECT blackbox_id FROM res WHERE  htt_status_truck='hard' 	AND get_ymd(htt_farm_leaving) !=get_ymd(now()::TIMESTAMP)) AND datediff('hour', htt_factory_leaving,htt_park_inside) < 0 ";

  sql +="  UNION ALL  ";

  sql +="   SELECT blackbox_id ";
  sql +="  FROM rec_now WHERE blackbox_id IN  (SELECT blackbox_id FROM res WHERE  htt_status_truck='hard' AND get_ymd(htt_farm_leaving) !=get_ymd(now()::TIMESTAMP)) AND datediff('hour', htt_factory_leaving,htt_park_inside) > 24  ";

    sql += ")";

 
  db.excute(pg_realtime, sql, function (result) {
      console.log(' set_empty_status_truck() ' + result);
  });
      
}


//exports.getdata_cut2crush = getdata_cut2crush;



/*
setTimeout(function ()
{
    get_process_timestamp();

}, 1000);
*/