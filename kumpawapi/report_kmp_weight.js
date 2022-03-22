var async = require('async');
var squel = require("squel");

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');

var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_kumpawapi";

function test1(start_time)
{

   var sql=" SELECT DISTINCT truck_blackbox_id FROM history_status_havester ";
   sql+=" WHERE  start_record >='"+start_time+" 00:00' ";
   sql+=" AND start_record <='"+start_time+" 23:59' ";
   sql+=" AND truck_blackbox_id !='undefined' ";
   sql+=" AND end_record IS NOT NULL ";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            async.eachSeries(rows, function (row, next)
            {
                get_details(start_time, row.truck_blackbox_id,function(xres)
                {
                    debugger;
                    console.log(row.truck_blackbox_id);
                    if(xres)
                    {
                        next();
                    }
                });
            },function(){
                console.log('finish');
            });
           
        }
    });
}

function get_details(start_time,truck_id,callback)
{
  
    var sql="";
    sql+=" WITH res as (SELECT get_min_startrecord('"+truck_id+"','"+start_time+"') as start_record";
    sql+=" ,get_max_startrecord('"+truck_id+"','"+start_time+"') as end_record";
    sql+=" ,datediff('minute',get_min_startrecord('"+truck_id+"','"+start_time+"')::TIMESTAMP,get_max_startrecord('"+truck_id+"','"+start_time+"')::TIMESTAMP ) as total_time ";
    sql+=" ,start_lat, start_lon, end_lat, end_lon, blackbox_id , idate(date_record) as date_record";
    sql+=" , tambol_start , amphur_start, province_start, tambol_end, amphur_end, province_end ";
    sql+=" , plot_code_start as plot_code, loading_truck_vehicle, truck_blackbox_id, ktc_area_working ";
    sql+=" FROM history_status_havester ";
    sql+=" WHERE truck_blackbox_id='"+truck_id+"' ";
    sql+=" AND to_char(start_record,'YYYY-MM-DD')='"+start_time+"' ";
    sql+=" AND plot_code_start !='undefined' LIMIT 1 ) ";
    sql+=" SELECT *,dblink_get_area_working_harvester(blackbox_id,start_record,end_record) as ktc_area_working FROM res";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
           insert_db(rows[0],function(xr)
           {
                if(xr)
                {
                    callback(xr);
                    return;
                }
           })
        }
    });

}

function insert_db(ar,callback)
{

    var sql_insrt = squel.insert()
    .into('history_status_havester_report')
    .set('blackbox_id', ar.blackbox_id)
    .set('start_record', ar.start_record)
    .set('end_record', ar.end_record)
    .set('total_time', ar.total_time)
    .set('start_lat', ar.start_lat)
    .set('start_lon', ar.start_lon)
    .set('tambol_start', ar.tambol_start)
    .set('amphur_start', ar.amphur_start)
    .set('province_start', ar.province_start)
    .set('date_record', ar.date_record)
    .set('plot_code', ar.plot_code)
    .set('end_lat', ar.end_lat)
    .set('end_lon', ar.end_lon)
    .set('tambol_end', ar.tambol_end)
    .set('amphur_end', ar.amphur_end)
    .set('province_end', ar.province_end)
    .set('loading_truck_vehicle', ar.loading_truck_vehicle)
    .set('truck_blackbox_id', ar.truck_blackbox_id)
    .set('ktc_area_working', ar.ktc_area_working)
    .toString();

    ipm.db.dbname = db_sugarcane;
    db.excute(ipm, sql_insrt, function (is_ok) 
    {
        callback(is_ok);
        return;
    });

}

test1('2019-03-22')