

/*
SELECT
	MIN (gps_datetime) AS start_engine,
	MAX (gps_datetime) AS off_engine,
	MIN (mileage) AS mile_start,
	MAX (mileage) AS mile_stop,
	MAX (mileage) - MIN (mileage) AS distance,
	'staion' AS station --,get_poi_name('1010003144','2019-04-24 00:00','2019-04-24 23:59')
FROM
	ht_142181155693
WHERE
	gps_datetime >= '2019-04-24 00:00'
AND gps_datetime <= '2019-04-24 23:59'
AND input_status = '2'
*/




//#region modules
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
var irp = require('iReports.js');

var db_config = "master_config";
    //https://jsonformatter.curiousconcept.com/
var min_idle = 1;

 //#endregion

//#region structure

function driving_temp()
{
    this.modem_id = '';
    this.start_date = '';
    this.end_date = '';

    this.mile_start="";
    this.mile_stop="";
    this.distance='';
    this.time_use = '';

    this.station='';
}



//#endregion



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


function main_process(para,callback)
{

var tb = "ht_"+para.modem_id;

var sql=''
sql+="SELECT ";
sql+="	idate(MIN (gps_datetime)) AS start_engine,idate(MAX (gps_datetime)) AS off_engine ";
sql+="	,MIN (mileage) AS mile_start,MAX (mileage) AS mile_stop ";
sql+="	,(MAX (mileage) - MIN (mileage))::int AS distance ";
sql+=" ,itime_use(DateDiff('mi',MIN (gps_datetime),MAX (gps_datetime))) as time_use";
sql+=" FROM	"+tb;
sql+=" WHERE	gps_datetime >=  "+ utl.sqote(para.start_time) ;
sql+=" AND gps_datetime <= "+ utl.sqote(para.end_time);
sql+=" AND status = '2' ";

    ipm.db.dbname = para.db_name;
    db.get_rows(ipm, sql, function (res_db)
    {
       // debugger;
        if (res_db.length > 0)
        {
            res_db = res_db[0];
         //   console.log(res_db[0]);
            var temp = new driving_temp();
            temp.start_date = res_db.start_engine;
            temp.end_date = res_db.off_engine;
            temp.mile_start = res_db.mile_start;
            temp.mile_stop = res_db.mile_stop;
            temp.distance = res_db.distance;
            temp.modem_id = para.modem_id;
            temp.time_use = res_db.time_use;
        

            /*  */
            get_enter_geom(para,function(ress)
            {
                if(ress.length > 0)
                {
                    temp.station = ress[0].geom_name;
                    if(temp.station !=null)
                    {
                        add_report_nao_enter_station(temp,function(is_complete)
                        {
                            callback(is_complete);
                            return;
                        })
                    }
                    else
                    {
                        get_ampher(para,function(result)
                        {
                            temp.station = result;
                            if(temp.station !=null)
                            {
                                add_report_nao_enter_station(temp,function(is_complete)
                                {
                                    callback(is_complete);
                                    return;
                                })
                            } 
                            else
                            {
                                callback(null);
                                return;
                            }
                           
                        });
                    }
                }
                else
                {
                    get_ampher(para,function(result)
                    {
                        temp.station = result;
                        if(temp.station !=null)
                        {
                            add_report_nao_enter_station(temp,function(is_complete)
                            {
                                callback(is_complete);
                                return;
                            })
                        } 
                        else
                        {
                            callback(null);
                            return;
                        }
                       
                    });
                }
            })
          
        }else{
            callback(null);
            return;
        }
    })

}

function get_ampher(para,callback)
{
    
/*
    para.start_time = '2019-04-01 00:00';
    para.end_time ='2019-04-27 23:59';
    para.modem_id ='1010003121'
    */

    var tb = "ht_"+para.modem_id;

    var sql=''
    sql+="SELECT DISTINCT amphur,province ,min(gps_datetime)  as enter_time";
    sql+=" FROM	"+tb;
    sql+=" WHERE	gps_datetime >=  "+ utl.sqote(para.start_time) ;
    sql+=" AND gps_datetime <= "+ utl.sqote(para.end_time);
    sql+=" GROUP BY amphur,province ORDER BY min(gps_datetime) ASC";

    ipm.db.dbname = para.db_name;
    db.get_rows(ipm, sql, function (res_db)
    {
      //  debugger;
        if (res_db.length > 0)
        {
            var result =''
            var pbefore =0;
            async.eachSeries(res_db, function (row, next)
            {

                    if(pbefore==0)
                    {
                        pbefore = row.province;
                    }

                    if(row.province !=pbefore )
                    {
                        result +=  'อ.'+row.amphur+" ";
                        result +=  'จ.'+pbefore+" ";
                        pbefore = row.province;
                    }
                    else
                    {
                        result +=  'อ.'+row.amphur+" ";
                    }

                    next();
 
            },function(){
                result +=  'จ.'+pbefore+" ";
                //console.log(result);
                callback(result);
                return;
            });
            
        }
        else
        {
            callback("");
            return;
        }
    })

}

function get_enter_geom(para,callback)
{

    /*
 WITH x as (    
	 WITH i as (  
		SELECT geom_id,geom_name  ,fn_nao_prfix_zone_id(geom_id::varchar) as id_zone 
		,enter_time
		FROM rp_enter_geom   
		WHERE modem_id='142181256585'  
		AND	enter_time >= '2019-05-17 00:00'  
		AND enter_time <= '2019-05-17 23:59' 
	)    
 SELECT * FROM i WHERE id_zone IN (SELECT split_to_rows('51',',')) ORDER BY enter_time ASC    
)     
SELECT string_agg (fn_nao_prfix_zone_id(geom_id::varchar)||''||geom_name, ',')as geom_name    
  FROM x 

    */
   var sql=''
    //geom_name,enter_time
    if(para.nao_group_sale !='X')
    {
 
        sql+="  WITH x as ( "
        sql+="    WITH i as ( "
        sql+=" SELECT  "
        sql+=" geom_id,geom_name "
        sql+=" ,fn_nao_prfix_zone_id(geom_id::varchar) as id_zone,enter_time  "
        sql+=" FROM rp_enter_geom  "
        sql+=" WHERE modem_id="+utl.sqote(para.modem_id) +" ";
        sql+=" AND	enter_time >= "+ utl.sqote(para.start_time)  +" ";
        sql+=" AND enter_time <= "+ utl.sqote(para.end_time); +" ";
        sql+="    ) "
        sql+="    SELECT * FROM i WHERE id_zone IN (SELECT split_to_rows('"+para.nao_group_sale+"',',')) ORDER BY enter_time ASC "
        sql+="    ) "
        sql+="     SELECT string_agg (fn_nao_zone_name(fn_nao_prfix_zone_id (geom_id :: VARCHAR)) || '' || geom_name,',') AS geom_name  "
        sql+="    FROM x "
    }
    else
    {
        sql+="  WITH x as ( "
        sql+="    WITH i as ( "
        sql+=" SELECT  "
        sql+=" geom_id,geom_name "
        sql+=" ,fn_nao_prfix_zone_id(geom_id::varchar) as id_zone,enter_time  "
        sql+=" FROM rp_enter_geom  "
        sql+=" WHERE modem_id="+utl.sqote(para.modem_id) +" ";
        sql+=" AND	enter_time >= "+ utl.sqote(para.start_time)  +" ";
        sql+=" AND enter_time <= "+ utl.sqote(para.end_time); +" ";
        sql+="    ) "
        sql+="    SELECT * FROM i  ORDER BY enter_time ASC "
        sql+="    ) "
        sql+="    SELECT string_agg (fn_nao_zone_name(fn_nao_prfix_zone_id (geom_id :: VARCHAR)) || '' || geom_name,',') AS geom_name "
        sql+="    FROM x "
    }

    /*
    sql+=" SELECT string_agg (fn_nao_prfix_zone_id(geom_id::varchar)||''||geom_name, ',')as geom_name  ";
    sql+="  FROM rp_enter_geom "
    sql+=" WHERE modem_id="+utl.sqote(para.modem_id)
    sql+=" AND	enter_time >=  "+ utl.sqote(para.start_time) ;
    sql+=" AND enter_time <= "+ utl.sqote(para.end_time);
    */

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_db)
    {
      //  debugger;
        if (res_db.length > 0)
        {
           // console.log(res_db);
           callback(res_db);
           return;
        }
        else
        {
            callback([]);
           return;
        }
    })
}

function add_report_nao_enter_station(para, callback)
{
    var query = squel.insert()
        .into('rp_nao_enter_station')
        .set('modem_id', para.modem_id)
        .set('start_date', para.start_date)
        .set('end_date', para.end_date)
        .set('mile_start', para.mile_start)
        .set('mile_stop',para.mile_stop)
        .set('distance', para.distance)
        .set('time_use', para.time_use)
        .set('station_name', para.station)
        .set('date_process', irp.timenow())
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
            callback(0);
            return;
        }

    });
}


function start(date_gen_report) 
{
   // var date_gen_report = '2019-05-02';db_name='db_10034'
    console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());


    //WHERE  modem_id='142181256553'  AND nao_group_sale IS NOT NULL  AND modem_id='142181256585'  
    var sql = "SELECT modem_id,db_name,speedmax,track_every,COALESCE( nao_group_sale,'X') as nao_group_sale  FROM master_config_vehicle WHERE db_name='db_10034'   ORDER BY modem_id";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res)
    {
        if (res.length > 0)
        {
            async.eachSeries(res, function (row, next)
            {
               // debugger;
                // console.log(row);
                var para = { 'id': 1, 'db_name': row.db_name, 'modem_id': row.modem_id,'nao_group_sale':row.nao_group_sale, 'speed_max': row.speedmax, 'track_every': row.track_every, 'start_time': date_gen_report + ' 00:00', 'end_time': date_gen_report + ' 23:59', 'date_gen_report': date_gen_report, 'message': '' }

              //  add_track_report_idleling(para, function (xid) {
              //      para.id = xid;
                    has_table(para.modem_id,para.db_name,function(has_table)
                    {
                        if(has_table)
                        {
                            main_process(para, function (xres) 
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
                        }
                        else
                        {
                            next();
                            console.log('no table '+para.modem_id)
                        } 
                   
                });

            }, function () {
                console.log('final finish ');
            });
        } else {
            console.log('empty data');
        }
    });
}


function clear_data_yesterday(callback)
{
    var date_now='';
    date_now = moment(moment().format('YYYY-MM-DD'))//moment('2019-05-02 00:00:00');//
    date_now = date_now.subtract(1, 'days');

  //  console.log();
    date_now = utl.format_date(date_now);

   var sql =" DELETE FROM rp_nao_enter_station WHERE iymd(start_date)='"+date_now+"' ";

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) 
    {
            debugger;
        if (is_ok == 'oK') 
        {
          callback(is_ok);
          return;
        }
    });

}

function clear_data_now_by_id(para,callback)
{
    var date_now = utl.format_date(para.start_time);
    var sql =" DELETE FROM rp_nao_enter_station WHERE iymd(start_date)='"+date_now+"' AND modem_id= '"+para.modem_id+"' ";

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) 
    {
            debugger;
        if (is_ok == 'oK') 
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

//#region job start at 00:40


var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00;
rule.minute = 10;

schedule.scheduleJob(rule, function () {
   // console.log('Harvester Midnight This runs at 23:59 every day.');
    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    clear_data_yesterday(function(xres)
    {
          start(date_gen_report);
    })
  
   
});

/**/
    //#endregion

exports.main_process = main_process;
exports.clear_data_now_by_id = clear_data_now_by_id;



 //#region Test

 //start('2019-05-25')
/*
clear_data_yesterday(function(){

});
*/