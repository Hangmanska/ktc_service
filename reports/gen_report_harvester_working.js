

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


function run_job(modem_id,callback)
{
    var sql= " SELECT lon,lat,idate(gps_datetime) as gps_datetime FROM ht_"+modem_id+" WHERE gps_datetime >='2020-12-10 00:00'  AND gps_datetime <='2021-02-28 23:59' ORDER BY gps_datetime ASC "
    ipm.db.dbname = db_focus;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {
               // console.log(row.gps_datetime);
                which_farm(row.lon,row.lat,row.gps_datetime,function(farm_id)
                {
                    if(farm_id!=0)
                    {
                        update_farmid(modem_id,row.gps_datetime,farm_id,function(res_finis)
                        {
                            //console.log(res_finis) 
                            next();
                        })
                    }
                    else
                    {
                        next();
                    }
                  
                })
              
            },function()
            {
                console.log('finish');
                callback(true);
                return;
            })
        }
    });

}


function which_farm(lon,lat,gps_datetime,callback)
{
   // var sql="SELECT dblink_which_farmid_working("+lon+","+lat+")::text ";
   var sql=' WITH res as ( ';
    sql+=' SELECT ST_SetSRID(geom, 4326) as geom,"Name" as farm_id FROM demo_upload_kmp_63_64 ';
    sql+=' UNION ALL '
    sql+=' SELECT ST_SetSRID(geom, 4326) as geom,"Name" as farm_id FROM demo_upload_ksp_63_64 ) ';
    sql+='   SELECT farm_id FROM res WHERE ST_Contains(geom,ST_SetSRID( ST_Point('+utl.sqote(lon)+','+utl.sqote(lat)+'), 4326 ))  ';

    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (res) 
    {
       
        if(res==0)
        {
           // console.log(res);
            callback(res);
            return;
        }
        else
        {
            var farm_id = res[0].farm_id;
         //   console.log(farm_id);
            callback(farm_id);
            return;
        }
        
    });
}

function update_farmid(modem_id,gps_datetime,farm_id,callback)
{
    var sql=" UPDATE ht_"+modem_id+" SET farmid_working="+farm_id+" WHERE gps_datetime='"+gps_datetime+"' ";

    console.log(modem_id+' '+farm_id+' '+gps_datetime)

    ipm.db.dbname = db_focus;
    db.excute(ipm, sql, function (response) 
    {
        if (response == 'oK') 
        {
            callback(response);
            return;
           
        }else{
            callback(response);
            return;
           
        }
    });

}

//which_farm('103.030476618803','17.0229145395642','2020-12-16 09:33:05',function(res){console.log(res) })
//which_farm('103.076385','17.000715','2020-12-16 09:33:05',function(res){})
 

function start()
{

  //  var sql=" SELECT modem_id,harvester_name FROM harvester_register ORDER BY modem_id LIMIT 12;"

  var sql=" SELECT modem_id,harvester_name FROM harvester_register WHERE harvester_name IN ('รถตัด_S812','รถตัด_S813','รถตัด_S814','รถตัด_S815') ORDER BY harvester_name ";

    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {
                console.log(row.modem_id)
                run_job(row.modem_id,function(x_runjob)
                {
                    if(x_runjob)
                    {
                        next();
                    }
                    
                })
            },function(){
                console.log('++++++++++++ FINISH COMPLETE ++++++++++++++++++');
            })
        }
    })
}

//test('1110011003');

start();