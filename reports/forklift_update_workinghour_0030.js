
/*
SELECT to_char(date_process,'YYYY-MM-DD')
,distance
 FROM rp_forklift_summary 
WHERE modem_id='143190871737'
ORDER BY date_process DESC
*/
var async = require('async');
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var geolib = require('geolib');
var schedule = require('node-schedule');
var timespan = require('timespan');
var moment = require('moment');

var db_config = "master_config";
var db_owner = "db_10039";


function get_data()
{
   var sql= " SELECT to_char(date_process,'YYYY-MM-DD') as date_process ";
   sql+= " ,COALESCE (ROUND(idht_forklift_sum_mileage('db_10039',modem_id,to_char(date_process,'YYYY-MM-DD')),3),0) as distance,modem_id " 
   sql+= " FROM rp_forklift_summary ";
   sql+= " WHERE modem_id='143190871451' AND date_part('YEAR', date_process)='2021' ";
   sql+= " AND to_char(date_process,'YYYY-MM-DD') < '2021-07-07' ";
   sql+= "  ORDER BY date_process ASC ";


   ipm.db.dbname = db_config;
   db.get_rows(ipm, sql, function (res) 
   {
       if (res.length > 0) 
       {
           async.eachSeries(res, function (row, next) 
           {
                console.log(row.date_process+' '+row.distance);
                update_data(row.modem_id,row.date_process,row.distance,function(xres)
                {
                    next();
                })
                
           },function(){
               console.log('finish ');
           });
       }
   });

}

function update_data(modem_id,date_process,distance,callback)
{
   var sql= " UPDATE rp_forklift_summary SET distance='"+distance+"' WHERE modem_id='"+modem_id+"' AND to_char(date_process,'YYYY-MM-DD')='"+date_process+"' ";
   ipm.db.dbname = db_config;
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

//ROUND(idht_forklift_sum_mileage('db_10039',modem_id,to_char(date_process,'YYYY-MM-DD')),3) 


//get_data();

/*

parseFloat((parseFloat(data.working_norun|| 0) 
+ parseFloat(data.working_hour|| 0) 
+ parseFloat(data.setting.calibrate_work_time || 0)) / 60).toFixed(0)

*/






//get_base_data("143190871652")
//143190871652



function get_all_vehicle_update_working_today()
{
    var sql= "  SELECT DISTINCT r.modem_id ";
//,mcv.vehiclename,group_zone,x.xVehicletypeid
sql+= " FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r  ";
sql+= ",fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x  ";
sql+= " WHERE	 mcv.db_name=sv.fleetid  "; //sv.fleetcode=get_fleetid('tnt_pathum') AND
sql+= " AND sv.modem_id= mcv.modem_id AND sv.modem_id=r.modem_id ";
sql+= " AND sv.fleetid='db_10039' ";
//AND allmin_run IS  NULL ";

ipm.db.dbname = db_config;
db.get_rows(ipm, sql, function (res) 
{
    if (res.length > 0) 
    {
        async.eachSeries(res, function (row, next) 
        {
            get_all_minute_working_today(row.modem_id,function(is_ok)
            {
                if(is_ok)
                {
                    next();
                }else{
                    next();
                }
            })
        },function(){
            console.log('finish');
        });
    }
});

}

function get_all_minute_working_today(modem_id,callback)
{  // to_char(now(),'YYYY-MM-DD')  '2021-07-11'
    var sql=" ";
sql+=" SELECT COALESCE(COUNT(gps_datetime)::int,'0') as minute_working  FROM ht_"+modem_id+" WHERE status !='1' ";
sql+=" AND to_char(gps_datetime,'YYYY-MM-DD') = to_char(now(),'YYYY-MM-DD')  ";

ipm.db.dbname = db_owner;
db.get_rows(ipm, sql, function (rows) 
{
    if (rows.length > 0) 
    {
       var minute_working = rows[0].minute_working;
       
       update_realtime_working_today(modem_id,minute_working,function(is_ok)
        {
            console.log(is_ok+' '+modem_id)
           // console.log('stop '+rows[0].count+' idle '+rows[1].count+'run '+rows[2].count)
            callback(is_ok);
            return;
        })
    }
});

}

function update_realtime_working_today(modem_id,all_minute_today,callback)
{
   var sql= " UPDATE realtime SET forklift_minute_working_today='"+all_minute_today+"'  WHERE modem_id='"+modem_id+"' ";
   ipm.db.dbname = db_config;
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



//get_all_vehicle();

//https://stackoverflow.com/questions/61135374/postgresql-calculate-distance-between-two-points-without-using-postgis

/*
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float, units varchar)
RETURNS float AS $dist$
    DECLARE
        dist float = 0;
        radlat1 float;
        radlat2 float;
        theta float;
        radtheta float;
    BEGIN
        IF lat1 = lat2 OR lon1 = lon2
            THEN RETURN dist;
        ELSE
            radlat1 = pi() * lat1 / 180;
            radlat2 = pi() * lat2 / 180;
            theta = lon1 - lon2;
            radtheta = pi() * theta / 180;
            dist = sin(radlat1) * sin(radlat2) + cos(radlat1) * cos(radlat2) * cos(radtheta);

            IF dist > 1 THEN dist = 1; END IF;

            dist = acos(dist);
            dist = dist * 180 / pi();
            dist = dist * 60 * 1.1515;

            IF units = 'K' THEN dist = dist * 1.609344; END IF;
            IF units = 'N' THEN dist = dist * 0.8684; END IF;

            RETURN dist;
        END IF;
    END;
$dist$ LANGUAGE plpgsql;

SELECT calculate_distance(32.9697, -96.80322, 29.46786, -98.53506, 'M');
SELECT calculate_distance(32.9697, -96.80322, 29.46786, -98.53506, 'K');
SELECT calculate_distance(32.9697, -96.80322, 29.46786, -98.53506, 'N');

*/

/*
SELECT gps_datetime,lon,lat,status,mileage
,round(calculate_distance(13.961202,100.53152,lat,lon,'K')::decimal,3)
 FROM ht_143190871451 
WHERE gps_datetime>='2021-07-07 00:02'
AND gps_datetime <='2021-07-15 01:59'
ORDER BY gps_datetime ASC 
*/

function cal_distance(rlat, rlon, nlat, nlon) 
{
    //debugger;
    var distance = geolib.getDistance(
          { latitude: rlat, longitude: rlon }
        , { latitude: nlat, longitude: nlon });

    distance = distance / 1000.0; //km
    return distance;
}

function cal_from_db(rlat, rlon, nlat, nlon,callback)
{

    var sql= " SELECT round(calculate_distance("+rlat+","+rlon+","+nlat+","+nlon+",'K')::decimal,3) as distance";
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (rows) 
    {
        callback(rows[0].distance);
        return;
    });
}

function getDistance(rlat, rlon, nlat, nlon, decimals) {
    decimals = decimals || 3;
    var earthRadius = 6371; // km
    /*
    lat1 = parseFloat(start.latitude);//rlat
    lat2 = parseFloat(end.latitude); //nlat
    lon1 = parseFloat(start.longitude);//rlon
    lon2 = parseFloat(end.longitude);//nlon
    */
    lat1 = parseFloat(rlat);//rlat
    lon1 = parseFloat(rlon);//rlon
    lat2 = parseFloat(nlat); //nlat
    lon2 = parseFloat(nlon);//nlon


    var dLat = (lat2 - lat1).toRad();
    var dLon = (lon2 - lon1).toRad();
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = earthRadius * c;
    return Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

function calculate_mile(modem_id,callback)
{

var sql=" SELECT idate(gps_datetime) as gps_datetime,lon,lat,status ";
//,round(calculate_distance(13.961202,100.53152,lat,lon,'K')::decimal,3)
sql+=" FROM ht_"+modem_id;
sql+=" WHERE gps_datetime>='2021-07-07 00:00' ";
sql+=" AND gps_datetime <='2021-07-16 23:59'  ";
sql+=" ORDER BY gps_datetime ASC  ";

    var i=0; var j=1;
    var is_do=true;
    ipm.db.dbname = db_owner;
    var all_row = 0;
    db.get_rows(ipm, sql, function (row) 
    {

        all_row =  row.length;
        if (all_row > 0) 
        {
            async.eachSeries(row, function (rows, next) 
            {
                if(i <= all_row)
                {
                   
                   var gps_datetime = row[i].gps_datetime;
                   var rlat = row[i].lat;
                   var rlon = row[i].lon;
                   var nlat = row[j].lat;
                   var nlon = row[j].lon;
                  // var res_distance = cal_distance(rlat, rlon, nlat, nlon);
                   var n_dis = getDistance(rlat, rlon, nlat, nlon);
             //      console.log('i = '+i +' j='+j +' '+n_dis+' ');
                  // console.log('i = '+i +' j='+j +' '+ res_distance+' '+n_dis+' ');
    
                  update_history_mileage(modem_id,gps_datetime,n_dis,function(is_ok)
                  {
                      if(is_ok)
                      {
                        next();
                        i = j;
                        j =  j+1;
      
                      }

                  })

                  // console.log('i = '+i +' j='+j +' '+ rows[i].lat +' '+ rows[i].lon +' '+rows[j].lat +' '+ rows[j].lon);
                  /*
                    cal_from_db(rlat, rlon, nlat, nlon,function(res_distance1)
                    {
                        //console.log(res_distance1)
                        console.log('i = '+i +' j='+j +' '+ res_distance+' '+n_dis+' '+res_distance1);
                    })
                    */
                }else{
                  //  console.log(j);
                    is_do = false;
                }
             
            },function(){
              
                  
                var gps_datetime = row[i].gps_datetime;
                var rlat = row[i].lat;
                var rlon = row[i].lon;
                var nlat = row[all_row-1].lat;
                var nlon = row[all_row-1].lon;
               // var res_distance = cal_distance(rlat, rlon, nlat, nlon);
                var n_dis = getDistance(rlat, rlon, nlat, nlon);
                console.log('i = '+i +' j='+j +' '+n_dis+' ');
               // console.log('i = '+i +' j='+j +' '+ res_distance+' '+n_dis+' ');
 
               update_history_mileage(modem_id,gps_datetime,n_dis,function(is_ok)
               {
                console.log('finish calculate_mile '+modem_id);
                 callback(true);
                 return;    

               });
            });
           
            
        }else{
            callback(true);
            return;  
        }
    });

}

function update_history_mileage(modem_id,gps_datetime,mileage,callback)
{
    var sql= "UPDATE ht_"+modem_id+" SET mileage='"+mileage+"' WHERE gps_datetime='"+gps_datetime+"' ";

    ipm.db.dbname = db_owner;
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




//get_all_vehicle_update_working_today();
//get_per_vehicle();

function get_per_vehicle()
{
    get_base_data('143190871521',function(is_ok)
    {
        console.log();
    })
}

function all_vehicle_excetp_patum_fix_mileage()
{
   var sql=" SELECT DISTINCT r.modem_id  FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r ";
   sql+=" WHERE	mcv.db_name=sv.fleetid  AND sv.modem_id= mcv.modem_id AND sv.modem_id=r.modem_id ";
   sql+="  AND mcv.db_name='db_10039'  AND r.modem_id ='143200385087' ";
   /*
   sql+=" AND r.modem_id  IN ('143200384751','143200385003','143190871357','143190871482','143190871319','143190871317'  ";
   sql+=",'143190871740','143190871637','143190871561','143190871581','143190871411','143190871453'  ";
   sql+=" ,'143190871446','143190871323','143190871688','143190871652','143190871601'  ";
   sql+=" ,'143190871757','143190871451','143190871489') ";
   */
 //  sql+="  ORDER BY group_zone  ";
   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {
                calculate_mile(row.modem_id,function(xsss){
                    next();
                })

            },function(){
                console.log('+++++ finish +++++');
            });
        }
    });

   //calculate_mile("143190871316")

}

//all_vehicle_excetp_patum_fix_mileage();

/*
  SELECT DISTINCT r.modem_id 
FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r  
,fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x  
WHERE	 mcv.db_name=sv.fleetid 
AND sv.fleetcode IN ('572','573','608','609')
AND sv.modem_id= mcv.modem_id AND sv.modem_id=r.modem_id 
AND sv.fleetid='db_10039'  
*/

//get_all_vehicle_update_allworking();

function get_all_vehicle_update_allworking(start_date)
{
    var sql= "  SELECT DISTINCT r.modem_id ";
//,mcv.vehiclename,group_zone,x.xVehicletypeid
sql+= " FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r  ";
sql+= ",fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x  ";
sql+= " WHERE	 mcv.db_name=sv.fleetid  AND sv.fleetcode IN ('572','573','607','608','609','574','575') "; ////sv.fleetcode=get_fleetid('tnt_pathum')  
sql+= " AND sv.modem_id= mcv.modem_id AND sv.modem_id=r.modem_id ";
sql+= " AND sv.fleetid='db_10039'  ";
//AND allmin_run IS  NULL "; get_fleetid('tnt_pathum')--572 get_fleetid('tnt_rangsit') 573

ipm.db.dbname = db_config;
db.get_rows(ipm, sql, function (res) 
{
    if (res.length > 0) 
    {
        async.eachSeries(res, function (row, next) 
        {
            get_base_data(row.modem_id,start_date,function(is_ok)
            {
                if(is_ok)
                {
                    next();
                }else{
                    next();
                }
            })
        },function(){
            console.log('finish');
        });
    }
});

}


function get_base_data(modem_id,start_date,callback)
{
    var sql=" ";
sql+=" SELECT COUNT(modem_id)::int ,'1' as status FROM ht_"+modem_id+" WHERE status ='1' AND to_char(gps_datetime,'YYYY-MM-DD') <='"+start_date+"' ";
sql+=" UNION ALL ";
sql+=" SELECT COUNT(modem_id)::int,'2' as status FROM ht_"+modem_id+" WHERE status ='2' AND to_char(gps_datetime,'YYYY-MM-DD') <='"+start_date+"' ";
sql+=" UNION ALL ";
sql+=" SELECT COUNT(modem_id)::int,'3' as status FROM ht_"+modem_id+" WHERE status ='3' AND to_char(gps_datetime,'YYYY-MM-DD') <='"+start_date+"' ";


ipm.db.dbname = db_owner;
db.get_rows(ipm, sql, function (rows) 
{
    if (rows.length > 0) 
    {
        var data={'run':rows[2].count,'idle':rows[1].count,'stop':rows[0].count}
       
        update_data_fix_workhour(modem_id,data,function(is_ok)
        {
            console.log(is_ok+' '+modem_id)
            console.log('stop '+rows[0].count+' idle '+rows[1].count+' run '+rows[2].count)
            callback(is_ok);
            return;
        })
    }
});

}


function update_data_fix_workhour(modem_id,data,callback)
{
   var sql= " UPDATE master_config_vehicle SET allmin_run='"+data.run+"',allmin_norun='"+data.idle+"',allmin_stop='"+data.stop+"' WHERE modem_id='"+modem_id+"' ";
   ipm.db.dbname = db_config;
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



var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00;
rule.minute = 30;


schedule.scheduleJob(rule, function ()
{
   // console.log('Harvester Midnight This runs at 23:59 every day.');

    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    console.log('start forklift_update_working_hour ' + date_gen_report + ' timenow : ' + moment().format('YYYY-MM-DD HH:mm:ss'));

    get_all_vehicle_update_allworking(date_gen_report);
  
});

//get_all_vehicle_update_allworking('2021-08-05');
console.log("start program cal working hour "+ moment().format('YYYY-MM-DD HH:mm:ss')+" wait process at 00:30 every day")

//var date_gen_report ='2021-09-13'
//get_all_vehicle_update_allworking(date_gen_report);