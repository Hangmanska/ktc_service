var schedule = require('node-schedule');
var timespan = require('timespan');
var async = require('async');
var moment = require('moment');
var squel = require("squel");
var mustache = require("mustache");

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
//var iBuildText = require('iGenTextFile.js');
var linq = require('linq.js');
var utl = require('Utility.js');
var db_config = "master_config";
var db_name ="db_10034";

function driving_temp()
{
    this.modem_id = '';
    this.start_date = '';
    this.end_date = '';

    this.mile_start="";
    this.mile_stop="";
    this.distance='';
    this.time_use = '';

    this.station_id='';
    this.station_name='';

    this.start_loc_th = '';
    this.end_loc_th = '';
    this.start_loc_en = '';
    this.end_loc_en = '';
    this.start_lonlat = '';
    this.end_lonlat = '';
  
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
      //debugger;
      //  console.log(res_db[0].exists)
        callback(res_db[0].exists)
        return;
  });

}

function add_report_nao(para, callback)
{

    var query = squel.insert()
        .into('rp_nao_visit_stop_engine')
        .set('modem_id', para.modem_id)
        .set('enter_time', para.start_date)
        .set('leave_time', para.end_date)

        .set('start_loc_th', para.start_loc_th)
        .set('start_loc_en', para.start_loc_en)
        .set('end_loc_th',para.end_loc_th)
        .set('end_loc_en', para.end_loc_en)

        .set('start_lonlat', para.start_lonlat)
        .set('end_lonlat', para.end_lonlat)

        .set('start_mile', para.mile_start)
        .set('end_mile',para.mile_stop)
        .set('distance', para.distance)
        .set('timeuse', para.time_use)
        .set('station_name', para.station_name)
        .set('station_id', para.station_id)
        .set('date_record', utl.timenow())
        .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            callback(response);
            return;
        } 
        else 
        {
            callback(null);
            return;
        }

    });
}



function get_data()
{
    var xpara = { 'db_name':'db_10034', 'modem_id': '142181256644' }

    var sql=""
  sql+=" SELECT modem_id,idate(enter_time) as enter_time,idate(leave_time) as leave_time,geom_id as station_id,geom_name as station_name";
  sql+="  FROM rp_enter_geom ";
  sql+="  WHERE modem_id='"+xpara.modem_id+"' ";
  sql+="  AND enter_time >='2019-05-09 00:00' ";
  sql+="  AND leave_time <='2019-05-12 23:59' ";
  sql+="  AND timeuse > 1 ";

  ipm.db.dbname = db_config;
  db.get_rows(ipm, sql, function (res)
  {
      if (res.length > 0)
      {
          async.eachSeries(res, function (row, next)
          {
                var para={'db_name':xpara.db_name,'modem_id':row.modem_id,'enter_time':row.enter_time,'leave_time':row.leave_time,'station_id':row.station_id,'station_name':row.station_name}
              
                get_htdata(para,function(result)
                {
                    debugger;
               //     console.log(result);
                    if(result !=null)
                    {
                        add_report_nao(result,function(xres)
                        {
                            console.log(xres);
                        });
                    }
                   
                })
          });
      }
  });
}

function get_htdata(para,callback)
{
    var tb = "ht_"+para.modem_id;

    var sql=""
    sql+="WITH res as ( SELECT idate(MIN (gps_datetime)) AS off_engine_first,idate(MAX (gps_datetime)) AS off_engine_end ";
    sql+=" ,MIN (mileage) AS mile_start,MAX (mileage) AS mile_stop  ";
    sql+=" ,(MAX (mileage) - MIN (mileage))::int AS distance  ";
    sql+=" ,itime_use(DateDiff('mi',MIN (gps_datetime),MAX (gps_datetime))) as time_use,modem_id ";
    sql+=" FROM	"+tb;
    sql+=" WHERE gps_datetime >=  "+ utl.sqote(para.enter_time) ;
    sql+=" AND gps_datetime <= "+ utl.sqote(para.leave_time);
    sql+=" AND status='1' GROUP BY modem_id ";
    sql+=" ) ";
    sql+=" SELECT  ";
    sql+=" dblink_nao_getlocation(modem_id,off_engine_first) as loc_start_engine";
    sql+=" ,dblink_nao_getlocation(modem_id,off_engine_end) as loc_off_engine";
    sql+=" ,* FROM res ";

    ipm.db.dbname = para.db_name;
    db.get_rows(ipm, sql, function (row)
    {
        if(row.length>0)
        {
            row=row[0];
            var res = new driving_temp();
            var r1 = row.loc_start_engine.split('|');
            var r2= row.loc_off_engine.split('|'); 
            
            res.modem_id = para.modem_id;
            res.start_date = row.off_engine_first;
            res.end_date = row.off_engine_end;
            res.mile_start = row.mile_start;
            res.mile_stop = row.mile_stop;
            res.distance = row.distance;
            res.time_use = row.time_use;
            res.station_id = para.station_id;
            res.station_name = para.station_name;


            res.start_lonlat = r1[0];
            res.start_loc_th = r1[1];
            res.start_loc_en = r1[2];

            res.end_lonlat = r2[0];
            res.end_loc_th = r2[1];
            res.end_loc_en = r2[2];

           callback(res);
           return;
        }
        else
        {
            callback(null);
            return;
        }
     

    })

}

function get_data_enterstation()
{
    
    /*
    SELECT modem_id,idate(enter_time) as enter_time,idate(leave_time) as leave_time,geom_id as station_id,geom_name as station_name
,timeuse
FROM rp_enter_geom
WHERE enter_time >='2019-05-09 00:00' 
  AND leave_time <='2019-05-09 23:59'
 AND timeuse >= 5
AND modem_id in(SELECT modem_id FROM master_config_vehicle WHERE db_name='db_10034')
ORDER BY modem_id 
    */

    var sql = "";
    sql += "  SELECT modem_id,idate(enter_time) as enter_time,idate(leave_time) as leave_time,geom_id as station_id,geom_name as station_name "
    sql += " FROM rp_enter_geom ";
    sql += " WHERE enter_time >='2019-05-15 00:00' "
    sql += " AND leave_time <='2019-05-24 23:59' "
    sql += "  AND timeuse >= 5 "
    sql += " AND modem_id in(SELECT modem_id FROM master_config_vehicle WHERE db_name='db_10034') "
    sql += " ORDER BY modem_id "

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res)
    {
        if (res.length > 0)
        {
            async.eachSeries(res, function (row, next)
            {
                var para={
                'db_name':db_name
                ,'modem_id':row.modem_id
                ,'enter_time':row.enter_time
                ,'leave_time':row.leave_time
                ,'station_id':row.station_id
                ,'station_name':row.station_name
                 }

                 has_table(para.modem_id,para.db_name,function(has_table)
                 {
                     if(has_table)
                     {
                        get_htdata(para,function(result)
                        {
                              if (result != null) 
                              {
                                 
                                  add_report_nao(result,function(_xres)
                                  {
                                       next();
                                       console.log('add rp_nao_visit_stop_engine '+row.modem_id +' '+_xres);
                                  });
                              } 
                              else 
                              {
                                  next();
                                  console.log('ielse ' + result);
                              }
                        });
                    }
                    else
                    {
                        console.log('no history table '+row.modem_id);
                        next();
                    }
                });

            },function(){
                console.log('final finish ');
            })
        }
    });
}

//get_data();
//get_data_enterstation();

//#region
/*
WITH res as (
SELECT
idate(MIN (gps_datetime)) AS start_engine,idate(MAX (gps_datetime)) AS off_engine 
,MIN (mileage) AS mile_start,MAX (mileage) AS mile_stop 
,(MAX (mileage) - MIN (mileage))::int AS distance 
,itime_use(DateDiff('mi',MIN (gps_datetime),MAX (gps_datetime))) as time_use
,modem_id

 FROM ht_142181256644
 WHERE gps_datetime >='2019-05-09 12:40:16'
AND gps_datetime <='2019-05-09 14:24:36'
AND status='1' GROUP BY modem_id
)
SELECT 
dblink_nao_getlocation(modem_id,start_engine)
,dblink_nao_getlocation(modem_id,off_engine)
,* FROM res
*/
//#endregion