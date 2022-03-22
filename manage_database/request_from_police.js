

var async = require('async');
var squel = require("squel");
var moment = require('moment');
var mustache = require("mustache");


var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());

var db_config = "master_config";
var db_focus="db_10033"


function test()
{

    var sql=" SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%ht_%' ORDER BY table_name;"

    ipm.db.dbname = db_focus;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {
                //console.log(row.table_name);
                check_by_provice(row.table_name,function(result)
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
            });
        }
    });

}

function check_by_provice(tb_name,callback)
{
    var sql=" SELECT COUNT(modem_id) as found FROM "+tb_name+" WHERE gps_datetime >='2020-10-04 00:00' AND gps_datetime <='2020-10-05 23:59' AND province='ชัยนาท' ";
    ipm.db.dbname = db_focus;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res[0].found != 0) 
        {
            console.log(res[0].found+' '+tb_name );
            callback(res[0].found)
            return;
        }
        else
        {
           // console.log('not found '+tb_name );
            callback(false);
            return;
        }
    });

}

test();
//check_by_provice('ht_142181053389')