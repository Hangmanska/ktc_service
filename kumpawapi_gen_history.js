var async = require('async');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var xreq = require('xPost.js');
var gentxt = require('iGenTextFile');
var irp = require('iReports.js');

var _ = require('underscore')

var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_kumpawapi";
var db_owner ='db_10011'
var db_owner_slave ='db_10023'
var year_plant =  '64_65';
var path_images='';

const fastcsv = require('fast-csv');
const fs = require('fs');

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

function test()
{
  var sql= " SELECT DISTINCT r.modem_id ";
  sql+= " ,mcv.db_name  ";
  sql+= "  , idate(gps_datetime)as gps_datetime ";
  sql+= "  ,mcv.vehiclename as vehicle_name ";
  sql+= "  FROM	realtime as r, setup_vehicle as sv,master_config_vehicle as mcv ";
  sql+= "  WHERE	sv.modem_id = r.modem_id ";
  sql+= "		AND sv.modem_id = mcv.modem_id ";
  sql+= "		AND sv.fleetid = mcv.db_name ";
  sql+= "  AND sv.fleetcode = get_fleetid('kmp') ";
  sql+= "		AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' ) ";
  sql+= "		AND  date_part('YEAR', gps_datetime)>='2020' 	AND mcv.vehiclename  NOT LIKE '%รถไถ%'  ";
  sql+= "  ORDER BY mcv.vehiclename,gps_datetime ASC ";

  
  ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
      if (rows.length > 0)
      {
           // console.log(rows);
           async.eachSeries(rows, function (row, next)
           {
             //  var tb_name ="ht_"+row.modem_id
               var vehicle_name  = row.vehicle_name;
                 

               var prefix_model =  row.modem_id.substring(0,2);
              

               prefix_model = prefix_model =='14' ? 'VT900' : 'U1 LITE PLUS';

               has_table(row.modem_id,row.db_name,function(has_table)
               {
                    if(has_table)
                    {
                      get_history(row.modem_id,prefix_model,vehicle_name,row.db_name ,function(res)
                      {
                        
                            var _file_name = res.file_name+'.csv';
                            const ws = fs.createWriteStream(_file_name,{encoding: 'utf-16le'});
                            fastcsv
                              .write(res.data,{ headers: true })
                              .pipe(ws);

                              next();
                        
                      })

                    }else{
                      console.log("not found db "+row.modem_id);
                      get_history(row.modem_id,prefix_model,vehicle_name,"db_10023" ,function(res)
                      {
                        
                            var _file_name = res.file_name+'.csv';
                            const ws = fs.createWriteStream(_file_name,{encoding: 'utf-16le'});
                            fastcsv
                              .write(res.data,{ headers: true })
                              .pipe(ws);

                              next();
                        
                      })
                    }
               });

             //  console.log(row.modem_id);
              // next();
           },function(){
               console.log('finish');
           });
      }
  });
}

/*
 SELECT DISTINCT r.modem_id
   ,mcv.db_name 
    , idate(gps_datetime)as gps_datetime
    ,mcv.vehiclename as vehicle_name
    FROM	realtime as r, setup_vehicle as sv,master_config_vehicle as mcv
    WHERE	sv.modem_id = r.modem_id
  		AND sv.modem_id = mcv.modem_id
  		AND sv.fleetid = mcv.db_name
    AND sv.fleetcode = get_fleetid('kmp')
  		AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' )
  		AND  date_part('YEAR', gps_datetime)>='2020'
			AND mcv.vehiclename  NOT LIKE '%รถไถ%'
	--AND r.modem_id='142181256679'
    ORDER BY mcv.vehiclename,gps_datetime ASC
*/

//test();

function get_history(modem_id,prefix_model,vehicle_name,db_name,callback)
{
    
    var start = '2020-01-01 00:00' ;
    var stop ='2020-12-31 23:59' ;
    var tb_name ="ht_"+modem_id;
        var sql = "";


 //row_number() OVER (ORDER BY gps_datetime) as id
        sql += " SELECT  ";
        sql += " modem_id,idate(gps_datetime) as gps_datetime  ";
      //  sql += " ,to_char(time_server_recive, 'YYYY-MM-DD HH24:MI:SS:MS') as time_server_recive  ";
        sql += " ,lon,lat,status,speed,altitude,satelites,direction";
        sql += " ,etambol,eamphur,eprovince"; //,tambol,amphur,province,
        sql += " ,round (abs((SELECT mileage FROM " + tb_name + " WHERE gps_datetime >=" + utl.sqote(start) + " LIMIT 1)-mileage)::DECIMAL,2)::text as mileage";
        sql += " FROM " + tb_name;
        sql += " WHERE gps_datetime >= " + utl.sqote(start);
        sql += " AND gps_datetime <=" + utl.sqote(stop);
        sql += " ORDER BY gps_datetime ASC ";

       // console.log(db_name);

        ipm.db.dbname = db_name;
        db.get_rows(ipm, sql, function (rows) 
        {
            if (rows.length > 0) 
            {
                console.log(rows.length);
                var res={'data':rows,'file_name':modem_id+'_'+vehicle_name};
                callback(res);
                return;
               // res.send(rows);
               /*
               kpwp.exports_csv_weight(start_date,function(json)
               {
                  res.setHeader('Content-type', 'text/csv; charset=utf-8');
                  res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + start_date+ '.csv\"');
                  res.csv(rows);
               });
               */
            }
            else 
            {
                console.log("no data");
                var res={'data':[],'file_name':modem_id+'_'+vehicle_name+' no_data'};
                callback(res);
                return;
            }
        });
    
}

function test_write_csv()
{ 

    get_history('1110011011','U1 LITE PLUS',"1ขอ3365",function(res)
    {
        var _file_name = res.file_name+'.csv';
        const ws = fs.createWriteStream(_file_name,{encoding: 'utf-16le'});
        fastcsv
          .write(res.data,{ headers: true })
          .pipe(ws);
    })

}

//test_write_csv()

test();