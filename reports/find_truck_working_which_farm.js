

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

function test()
{

    var sql=" SELECT modem_id FROM vehicle_kmp WHERE vehicle_factory_or_outside='2';"

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {
                //
                has_table(row.modem_id,db_focus,function(result)
                {
                    console.log(row.modem_id +' '+result);
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

function get_data(modem_id,start,end,callback)
{
   // var start =  date+" 00:00";
  //  var end = date+" 23:59";

    console.log('modem_id '+modem_id);

    var sql=" WITH res as( ";
        sql+="  SELECT gps_datetime ";
    //    sql+=" ,dblink_get_farmid(lon::varchar,lat::varchar,'63_64') as farm_id ";
       sql+="  ,dblink_which_farmid_working(lon::NUMERIC,lat::NUMERIC)::text  as farm_id ";
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
    var sql = " INSERT INTO truck_work_in_farm2(modem_id,farm_id,start_work,end_work,minute_working) VALUES " + result_val;

    
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

//test();
//check_by_provice('ht_142181053389')
/**/


//2021-02-08 00:00 - 2021-02-08 23:00
function process_multidate(para,callback)
{
    var start = para.start_time;
    var stop = para.end_time;

    var xx = idf.datediff(start,stop);
    var total_days = parseInt(xx.total_days);
    console.log('total_days '+total_days);
    var isdo = total_days >= 0 ? true : false;
    

    var iar = new Array(total_days); 
    for(var i=0;i<=total_days;i++)
    {
        iar[i]= i;
    }


    async.eachSeries(iar, function (row, next)
    {
        //console.log(row);
        var date_gen_report = moment(start).add(row, "days").format("YYYY-MM-DD");
        //  console.log(date_gen_report+' '+i);

          var xstart = date_gen_report+' 00:00';
          var xstop = date_gen_report+' 23:59';

          para.start_time=xstart;
          para.end_time=xstop;
          para.datetime=date_gen_report;

         // console.log('date_gen_report '+row);
         console.log('date_gen_report '+date_gen_report+' '+ para.modem_id+' '+para.start_time+' '+  para.end_time);
        

                            get_data(para.modem_id,para.start_time,para.end_time, function (xres) 
                            {
                                if (xres != null) 
                                {
                                    next();
                                    console.log(xres);
                                }
                                else 
                                {
                                    next();
                                    console.log('ielse ' + xres);
                                }
        
                            });
        
       
    },function(){
       // console.log('finish');
        callback(true);
        return;
    });


}



function start()
{


    var sql = "SELECT modem_id FROM vehicle_kmp  WHERE vehicle_factory_or_outside ='1' ";
 //   console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());
 
    //var date_gen_report = '2016-06-25';
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {

                var para = {'driver_id':'', 'id': 1, 'db_name': 'db_10033', 'modem_id': row.modem_id,'datetime':''
, 'start_time': '2020-12-10 00:00', 'end_time': '2021-02-28 23:59', 'date_gen_report': '2021-06-28', 'message': '' }


                process_multidate(para,function(xs)
                {
                    console.log(xs);
                    next();
                });

            },function(){
                console.log('++++++++++ finish complete ++++++++++');
            });
        }
    });

}


start();

//test();