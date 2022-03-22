
var async = require('async');
var mustache = require("mustache");

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');

function Gen_report_trip(para,callback)
{

    var sql1 = ' '; var sql2 = ' ';
   // debugger;
    sql1 += "SELECT get_vehiclename(modem_id) as vehicle_name,idate(start_date) as start_date,idate(end_date) as end_date  ,start_loc_th,end_loc_th ";
    sql1 += " ,start_loc_en,end_loc_en,start_lonlat,end_lonlat ";
    sql1 += " ,itime_use(timeuse) as timeuse ";
    sql1 += " ,distance as distance ";
    sql1 += " ,(distance / get_oil_level(" + utl.sqote(para.modem_id) + ")) as fuel ";
    sql1 += " FROM rp_trip ";
    sql1 += " WHERE modem_id=" + utl.sqote(para.modem_id);
    sql1 += " AND start_date>=" + utl.sqote(para.start_time) + " ";
    sql1 += " AND end_date <=" + utl.sqote(para.end_time) + " ";

    var detail = { 'rows': '', 'sum': '' };

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql1, function (row) 
    {
        detail.rows = row;
        callback(detail);
        return;
    });
    
    /* 
    sql2 += " SELECT  ";
    sql2 += " itime_use(SUM(timeuse)) as timeuse ";
    sql2 += ",SUM(distance) as distance ";
    sql2 += ",SUM(distance) / get_oil_level(" + utl.sqote(para.modem_id) + ") as fuel ";
    sql2 += " FROM rp_trip ";
    sql2 += " WHERE modem_id=" + utl.sqote(para.modem_id);
    sql2 += " AND start_date>=" + utl.sqote(para.start_time) + " ";
    sql2 += " AND end_date <=" + utl.sqote(para.end_time) + " ";

    get_row_sum(sql1, sql2, function (xres) 
    {
        //debugger;
        callback(xres);
        return;
    });
   */

}


function get_row_sum(sql1, sql2, callback)
{

    ipm.db.dbname = db_config;
    var detail = { 'rows': '', 'sum': '' };
    var a = false; var b = false;
   
        db.get_rows(ipm, sql1, function (row) {
            if (row.length > 0)
            {
                a = true;
                detail.rows = row;
                next();
            }
            else
            {
                a = true;
                detail.rows = [];
                next();
            }
        });
  
        db.get_rows(ipm, sql2, function (row) {
            if (row.length > 0) {
               b = true;
                detail.sum = row;
                next();
            }
            else {
                b = true;
                detail.sum = [];
                next();
            }
        });

        function next()
        {
            if (a && b) {
                callback(detail);
                return;
            }
        }
}

var all_data=[];

function get_allharvester(param,callback)
{
   // var xparam = param.start_time;

    var sql = "SELECT harvester_name,modem_id FROM harvester_register2 ORDER BY harvester_name ASC";
    ipm.db.dbname = db_sugarcane;
     db.get_rows(ipm, sql, function (rows) 
     {
         // res.send(rows);
        // debugger;
       //  console.log(rows);
         async.eachSeries(rows, function (row, next)
         {
           // row.modem_id='1010003151'
           //'2018-12-02 00:00'
           //'2018-12-03 23:59'
            var para={'modem_id':row.modem_id,'start_time':param.start_time,'end_time':param.end_time};
            Gen_report_trip(para,function(result)
            {
               // console.log(result);
                if(result.rows.length >0)
                {
                    if(all_data.length>0)
                    {
                        //all_data[0].push(result.rows);
                        utcp.iConcat(all_data,result.rows,function(xar)
                        {
                            all_data =xar;
                        })
                    }
                    else
                    {
                        all_data.push(result.rows);
                    }
                    
                }
                next();
            });

         },function(){
            callback(all_data);
            return;
         });

     });

}

//get_allharvester();

exports.get_allharvester =get_allharvester;

/*
get_allharvester(function(json){
    debugger
   console.log(json);
})
*/