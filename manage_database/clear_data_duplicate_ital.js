
var async = require('async');
var squel = require("squel");

var db =require('iConnectdb_ktc.js'); // require('iConnectdb_ktc_backup.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";


var db2 = require('iConnectdb_ktc.js');
var ipm2 = new db2.im2(db2.get_configdb_tcp());
var utl = require('Utility.js');
var year ="2019"

var db_owner ='db_10036'

function move_to_backup()
{

      var sql="";
      sql+=" SELECT DISTINCT to_char(gps_datetime:: TIMESTAMP, 'YYYY-MM-DD HH24:MI') as gps_datetime FROM ht_143200384772 ";
      sql+=" WHERE gps_datetime :: TIMESTAMP >= '2021-12-02 00:00' ";
      sql+=" AND gps_datetime :: TIMESTAMP <= '2021-12-07 23:59' ORDER BY gps_datetime ";

//143200384772  L958F_620131_บุรีรัมย์  

    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)    
        {
            async.eachSeries(rows, function (row, next)
            {
                var gps_datetime = row.gps_datetime;
                debugger;
               var sql = "SELECT to_char(rtc_datetime:: TIMESTAMP, 'YYYY-MM-DD HH24:MI') as rtc_datetime1 ";
               sql+= ",to_char(time_server_recive:: TIMESTAMP, 'YYYY-MM-DD HH24:MI') as time_server_recive1 ";
               sql+= ",to_char(time_server_fin:: TIMESTAMP, 'YYYY-MM-DD HH24:MI') as time_server_fin1 ";
               sql+= ",* FROM ht_143200384772 WHERE to_char(gps_datetime:: TIMESTAMP, 'YYYY-MM-DD HH24:MI')='"+gps_datetime+"' LIMIT 1 ";

               ipm.db.dbname = db_owner;
               db.get_rows(ipm, sql, function (rows) 
               {
                 var ar =  rows[0];
                var sql_update = squel.insert()
                .into("ht_143200384772_backup2")
                .set("modem_id", '143200384772')
               .set("gps_datetime", gps_datetime)
               .set("rtc_datetime", ar.rtc_datetime1)
               .set("lon", ar.lon)
               .set("lat", ar.lat)
               .set("speed", ar.speed)
               .set("direction", ar.direction)
               .set("altitude", ar.altitude)
               .set("satelites", ar.satelites)
               .set("message_id", ar.message_id)
               .set("input_status", ar.input_status)
               .set("output_status", ar.output_status)
               .set("analog_input1", ar.analog_input1)
               .set("analog_input2", ar.analog_input2)
               .set("mileage", ar.mileage)
     
     
               .set("tambol", ar.tambol)
               .set("amphur", ar.amphur)
               .set("province", ar.province)
               .set("etambol", ar.etambol)
               .set("eamphur", ar.eamphur)
               .set("eprovince", ar.eprovince)
               .set("time_server_recive", ar.time_server_recive1)
               .set("time_server_fin", ar.time_server_fin1)
               .set("angle", ar.angle)
               .set("oil_percent", ar.oil_percent)
               .set("oil_liter", ar.oil_liter)
               .set("status", ar.status)
               .set("heading", ar.heading)
              // .where("gps_datetime='"+gps_datetime+"'")
               .toString();

                excute(sql_update,db_owner,function(xr)
                {
                    console.log(ar.rtc_datetime1)
                    next();
                })

               });

              

            },function()
            {
                console.log('finish');
            });
        }
    });
}



function excute(sql,tb_name,callback)
{
    ipm.db.dbname = db_owner;
    db.excute(ipm, sql, function (is_ok) 
    {
      
      callback(is_ok);
      return;
    });
}


move_to_backup();

/*

INSERT INTO  ht_143200384772_backup (gps_datetime,modem_id)
(

SELECT
DISTINCT to_char(gps_datetime :: TIMESTAMP, 'YYYY-MM-DD HH24:MI'):: TIMESTAMP AS gps_datetime,modem_id--
FROM
	ht_143200384772 
WHERE
	gps_datetime :: TIMESTAMP >= '2021-10-16 00:00'
AND gps_datetime :: TIMESTAMP <= '2021-10-16 23:59'
ORDER BY gps_datetime
)


SELECT DISTINCT to_char(mt.gps_datetime :: TIMESTAMP, 'YYYY-MM-DD HH24:MI'):: TIMESTAMP,* FROM  ht_143200384772_backup as bk,ht_143200384772 as mt
WHERE to_char(mt.gps_datetime:: TIMESTAMP, 'YYYY-MM-DD HH24:MI')=to_char(bk.gps_datetime:: TIMESTAMP, 'YYYY-MM-DD HH24:MI')--to_char(gps_datetime :: TIMESTAMP, 'YYYY-MM-DD HH24:MI')='2021-10-13 00:01'
AND mt.gps_datetime :: TIMESTAMP >= '2021-10-14 00:00'
AND mt.gps_datetime :: TIMESTAMP <= '2021-10-14 23:59'


UPDATE ht_143200384772_backup
SET rtc_datetime=b.rtc_datetime
,lon=b.lon
,lat=b.lat
,speed=b.speed
,direction=b.direction
,altitude=b.altitude
,satelites=b.satelites
,message_id=b.message_id
,input_status=b.input_status
,output_status=b.output_status
,analog_input1=b.analog_input1
,analog_input2=b.analog_input2
,mileage=b.mileage
,tambol=b.tambol
,etambol=b.etambol
,amphur=b.amphur
,eamphur=b.eamphur
,province=b.province
,eprovince=b.eprovince
,time_server_recive=b.time_server_recive
,time_server_fin=b.time_server_fin
,angle=b.angle
,oil_percent=b.oil_percent
,oil_liter=b.oil_liter
,status=b.status
 FROM ht_143200384772 as b
WHERE ht_143200384772_backup.gps_datetime=b.gps_datetime
AND b.gps_datetime :: TIMESTAMP >= '2021-10-15 00:00'
AND b.gps_datetime :: TIMESTAMP <= '2021-10-15 23:59'


SELECT
to_char(gps_datetime:: TIMESTAMP, 'YYYY-MM-DD HH24:MI')
FROM ht_143200384772_backup
WHERE gps_datetime :: TIMESTAMP >= '2021-10-15 00:00'
AND gps_datetime :: TIMESTAMP <= '2021-10-15 23:59'
ORDER BY gps_datetime


SELECT * FROM ht_143200384772 
WHERE to_char(gps_datetime:: TIMESTAMP, 'YYYY-MM-DD HH24:MI')='2021-10-15 09:04' LIMIT 1


SELECT * FROM ht_143200384772_backup 
WHERE gps_datetime :: TIMESTAMP >= '2021-10-13 00:00' 
AND gps_datetime :: TIMESTAMP <= '2021-10-13 23:59' ORDER BY gps_datetime 

SELECT * FROM ht_143200384772 
WHERE gps_datetime :: TIMESTAMP >= '2021-10-13 00:00' 
AND gps_datetime :: TIMESTAMP <= '2021-10-13 23:59' --ORDER BY gps_datetime 

DELETE FROM ht_143200384772 
WHERE gps_datetime :: TIMESTAMP >= '2021-10-14 00:00' 
AND gps_datetime :: TIMESTAMP <= '2021-10-16 23:59' --ORDER BY gps_datetime 

+++++ step 1

INSERT INTO ht_143200384772_backup 
SELECT * FROM ht_143200384772
WHERE gps_datetime :: TIMESTAMP >= '2021-10-14 00:00' 
AND gps_datetime :: TIMESTAMP <= '2021-10-16 23:59' --ORDER BY gps_datetime 


-- check 
SELECT * FROM ht_143200384772_backup2 
WHERE gps_datetime :: TIMESTAMP >= '2021-12-02 00:00' 
AND gps_datetime :: TIMESTAMP <= '2021-12-07 23:59' 
ORDER BY gps_datetime ASC 

+++++ step 2

DELETE FROM ht_143200384772 
WHERE gps_datetime :: TIMESTAMP >= '2021-12-01 00:00' 
AND gps_datetime :: TIMESTAMP <= '2021-12-07 23:59' 

++++ step 3 

INSERT INTO ht_143200384772
SELECT * FROM ht_143200384772_backup2
WHERE gps_datetime :: TIMESTAMP >= '2021-11-23 00:00' 
AND gps_datetime :: TIMESTAMP <= '2021-12-01 23:59' --ORDER BY gps_datetime 


*/