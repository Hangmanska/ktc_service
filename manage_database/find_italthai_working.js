

var async = require('async');
var squel = require("squel");
var moment = require('moment');
var mustache = require("mustache");


var db = require('iConnectdb_ktc.js');
const { updateLocale } = require('moment');
var ipm = new db.im2(db.get_configdb_tcp());

var db_config = "master_config";
var db_focus="db_10036"
var db_owner ="sugarcane_kumpawapi"
var utl = require('Utility.js');
var date_start="2020-12-31"

function test()
{

    var sql=" SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name ";
    sql+=" , idate(gps_datetime)as gps_datetime ";
    sql+=" FROM	realtime as r, setup_vehicle as sv,master_config_vehicle as mcv ";
    sql+="    WHERE	sv.modem_id = r.modem_id AND sv.modem_id = mcv.modem_id AND sv.fleetid = mcv.db_name ";
    sql+="    AND sv.fleetcode = get_fleetid('ITIGPSCENTER')  AND get_vehiclename(r.modem_id) !=r.modem_id ";
    sql+=" ORDER BY  idate(gps_datetime) DESC "

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {
                //console.log(row.table_name);
                get_data(row.modem_id,date_start,function(result)
                {
                    if(result !=false)
                    {
                        next();
                    }
                    else
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

function get_data(modem_id,date,callback)
{
    var start =  date+" 00:00";
    var end = date+" 23:59";

    console.log('modem_id '+modem_id);

    var sql=" WITH res as( ";
        sql+="  SELECT gps_datetime ";
        sql+=" ,dblink_get_farmid(lon::varchar,lat::varchar,'63_64') as farm_id ";
        sql+="  FROM ht_"+modem_id+"   ";
        sql+="  WHERE gps_datetime >='"+start+"' ";
        sql+="  AND gps_datetime <='"+end+"'  ) ";
        
        
        sql+="  SELECT DISTINCT farm_id,"+modem_id+" as modem_id,idate(MIN(gps_datetime)) as start_work,idate(MAX(gps_datetime)) as end_work ";
        sql+=" ,DateDiff('minute',MIN(gps_datetime)::TIMESTAMP,MAX(gps_datetime)::TIMESTAMP) as minute_working ";
        sql+=" FROM res  WHERE farm_id IS NOT NULL   GROUP BY farm_id ";

    ipm.db.dbname = db_focus;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length >0) 
        {
            add_report(res,function(xres)
            {
                callback(true);
                return;
            })
        }
        else
        {
           // console.log('not found '+tb_name );
            callback(false);
            return;
        }
    });

}

function add_report( res, callback)
{
    debugger;
    var strMustache = '{{#.}}';
    strMustache += "('{{modem_id}}','{{farm_id}}','{{start_work}}','{{end_work}}','{{minute_working}}'),";
    strMustache += '{{/.}}';

    var result_val = mustache.render(strMustache, res);
    result_val = utl.iRmend(result_val);
    var sql = " INSERT INTO harvester_report(modem_id,farm_id,start_work,end_work,minute_working) VALUES " + result_val;

    
    if (res.length > 0)
    {
       console.log('res length '+res.length)

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
    else
    {
        console.log('empty data');
        callback([]);
        return;
    }
}

test();
//check_by_provice('ht_142181053389')
/*
get_data('1110011118','2021-01-16',function(rs)
{

})
*/