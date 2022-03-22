
var async = require('async');
var db = require('iConnectdb_ktc.js');
var idf = require('iDatediff.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_kumpawapi";
var moment = require('moment');
var db_owner ='db_10011'

/*
INSERT INTO report_harvester_open_cutting(gps_datetime,total_min_open_cutting,modem_id)
SELECT
	iymd(gps_datetime) AS gps_datetime
	,COUNT(status::int)
	,modem_id
 --,itime_use(COUNT(status::NUMERIC))
FROM
	ht_1110011011
WHERE
	gps_datetime >= '2022-01-19 15:00'
AND gps_datetime < '2022-01-19 23:59'
AND status='5' --AND analog_input2='2600'--status='5'
GROUP BY iymd(gps_datetime),modem_id
ORDER BY iymd(gps_datetime)

*/


function nrows(sql,db_name,callback)
{
         ipm.db.dbname = db_name;
      db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
           callback(rows);
           return;
        }else{
            callback([]);
           return;
        }
    });
}

function ocsb_excute(sql,db_con,callback)
{
     ipm.db.dbname = db_con;
     db.excute(ipm, sql, function (response) 
     {
        if (response == 'oK') 
        {
           callback(true);
          return;
        }
        else
        {
          callback(false);
          return;
        }
     });

}

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
        
       

                             insert_to_open_cutting(para.modem_id,para.datetime, function (xres) 
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


function insert_to_open_cutting(modem_id,gps_date,callback)
{
    var start_date = gps_date+" 00:00";
    var end_date = gps_date+" 23:59";
    var tb_name="ht_"+modem_id

    var sql="";
  sql+=" INSERT INTO report_harvester_open_cutting(gps_datetime,total_min_open_cutting,modem_id) ";
  sql+="SELECT ";
  sql+="iymd(gps_datetime) AS gps_datetime  ";
  sql+=",COUNT(status::int)  ";
  sql+=",modem_id  ";
  sql+=" FROM  "+tb_name;
  sql+="  WHERE gps_datetime >= '"+start_date+"'  ";
  sql+="  AND gps_datetime < '"+end_date+"'  ";
  sql+="  AND status='5'  ";
  sql+="  GROUP BY iymd(gps_datetime),modem_id ";
  sql+="  ORDER BY iymd(gps_datetime) ";

  ocsb_excute(sql,db_owner,function(xres)
  {
     // console.log(xres);
      callback(xres);
      return;
  })

/*
  nrows(sql,db_owner,function(rows)
  {
      console.log(rows);
      callback(true);
      return
  });
  */

}
  

function get_harvester()
{
   var sql=" SELECT modem_id ,get_vehicle_name(r.modem_id) as vehicle_name ";
   sql+=" FROM realtime as r WHERE htt_harvester_or_truck ='0'  AND r.modem_id !='199999999969' ";

    nrows(sql,db_owner,function(rows)
    {
       // console.log(row);
        async.eachSeries(rows, function (row, next)
        {
            
           // insert_to_open_cutting(row.modem_id,'2022-01-13')
           var para = { 'modem_id': row.modem_id
           , 'start_time': '2022-03-10 00:00', 'end_time': '2022-03-10 23:59', 'date_gen_report': '2022-01-13', 'message': '' }
           
           
                process_multidate(para,function(xs)
                {
                    console.log(xs);
                    next();
                });

        },function(){

        })
    })

}


get_harvester();

/**
 * 



	SELECT r.modem_id,total_min_open_cutting
	,fn_min_to_hrs(total_min_open_cutting) as hh_mm
,get_vehicle_name(r.modem_id) as vehicle_name 
 FROM realtime as r,report_harvester_open_cutting as rp 
WHERE htt_harvester_or_truck ='0'  
AND r.modem_id=rp.modem_id
AND rp.gps_datetime='2022-01-30'


SELECT modem_id ,get_vehicle_name(r.modem_id) as vehicle_name 
 FROM realtime as r
WHERE htt_harvester_or_truck ='0'
AND r.modem_id !='199999999969'
 */