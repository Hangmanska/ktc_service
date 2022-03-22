

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
//var schedule = require('node-schedule');
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
var idf = require('iDatediff.js');
var db_config = "master_config";
var db_owner ='db_10034';
    //https://jsonformatter.curiousconcept.com/
var min_idle = 1;

 //#endregion

//#region structure

function _driving_temp()
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
                        callback(null);
                        return;
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
    //geom_name,enter_time
    var sql=''
    sql+="  SELECT string_agg (geom_name, ',') as geom_name ";
    sql+="  FROM rp_enter_geom "
    sql+=" WHERE modem_id="+utl.sqote(para.modem_id)
    sql+=" AND	enter_time >=  "+ utl.sqote(para.start_time) ;
    sql+=" AND enter_time <= "+ utl.sqote(para.end_time);

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

    console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());

  // var date_gen_report = '2016-09-24';db_name='db_10003'
    //WHERE modem_id='1010003121' modem_id='142181256535' 
    var sql = "SELECT modem_id,db_name,speedmax,track_every  FROM master_config_vehicle WHERE db_name='db_10034'   ORDER BY modem_id";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res)
    {
        if (res.length > 0)
        {
            async.eachSeries(res, function (row, next)
            {
               // debugger;
                // console.log(row);
                var para = { 'id': 1, 'db_name': row.db_name, 'modem_id': row.modem_id, 'speed_max': row.speedmax, 'track_every': row.track_every, 'start_time': date_gen_report + ' 00:00', 'end_time': date_gen_report + ' 23:59', 'date_gen_report': date_gen_report, 'message': '' }

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

/*
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
*/
/**/
    //#endregion

exports.main_process = main_process;
exports.clear_data_now_by_id = clear_data_now_by_id;

function driving_temp()
{
    this.start_date = '';
    this.end_date = '';
    this.time_use = '';

    this.start_lonlat = '';
    this.end_lonlat = '';
    this.modem_id = '';
    
    this.start_loc_th = '';
    this.end_loc_th = '';
    this.start_loc_en = '';
    this.end_loc_en = '';
    this.distance = '';
    this.start_mile='';
    this.end_mile='';

    this.geom_name='';
    this.geom_id ='';
   
}

function ical_distance(lonlat_start,lonlat_end) {
    var r = utl.Split(lonlat_start, ',');
    var n = utl.Split(lonlat_end, ',');
    return irp.cal_distance(r[0], r[1], n[0], n[1]);
   // return res;
}

function find_close_service(data, rownum, callback)
{
    var x_res = linq.Enumerable.From(data)
    .Where(function (x) { return x.rownum == rownum })
    .FirstOrDefault();
    callback(x_res);
    return;
}

function find_open_service(data,cur_idx, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return x.idx != cur_idx })
    .Select(function (x) { return parseInt(x.rownum) })
    .FirstOrDefault();   
     callback(x_end_rownum);
     return;
    
}

function find_nextopen_service(data,cur_idx,rownum, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return x.idx != cur_idx })
    .Where(function (x) { return x.rownum > rownum })
    .Select(function (x) { return parseInt(x.rownum) })
    .FirstOrDefault();   
     callback(x_end_rownum);
     return;
    
}

function is_not_onerecord(data,cur_idx,rownum, callback)
{
    //var next1 = rownum+1;

    var before = linq.Enumerable.From(data)
    .Where(function (x) { return x.rownum == rownum-1 })
    .Select(function (x) { return parseInt(x.idx) })
    .FirstOrDefault();   

/*
    var next = linq.Enumerable.From(data)
    .Where(function (x) { return x.rownum == rownum+1 })
    .Select(function (x) { return parseInt(x.idx) })
    .FirstOrDefault(); 
    */

    if(before==parseInt( cur_idx))
    {
        callback(true);
        return;
    }
    else
    {
        callback(false);
        return;
    }

     
}

function find_1(data, startdate,enddate, callback)
{
    var start = linq.Enumerable.From(data)
    .Where(function (x) { return x.gps_datetime == startdate })
    .FirstOrDefault();

    var end = linq.Enumerable.From(data)
    .Where(function (x) { return x.gps_datetime == enddate })
    .FirstOrDefault();

    var dr =[];
    dr.push(start);
    dr.push(end);

    callback(dr);
    return;
}

function get_data1(modem_id,gps_datetime,callback)
{
    var sql=''
    sql+="  SELECT mileage ";
    sql+=",lon || ',' || lat AS lonlat ";
    sql+=",tambol || ':' || amphur || ':' || province AS locations_th ";
    sql+=",etambol || ':' || eamphur || ':' || eprovince AS locations_en ";
    sql+="  FROM ht_"+modem_id
    sql+=" WHERE gps_datetime ="+utl.sqote(gps_datetime)


    ipm.db.dbname = db_owner;
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

function get_naogrop_sale(modem_id,callback)
{
    var sql= "SELECT nao_group_sale FROM master_config_vehicle WHERE modem_id='"+modem_id+"' ";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_db)
    {
      //  debugger;
        if (res_db.length > 0)
        {
           // console.log(res_db);
           callback(res_db[0].nao_group_sale);
           return;
        }
        else
        {
            callback([]);
           return;
        }
    })
}

function main_start(modem_id,datetime,nao_group_sale,callback)
{
    var sql=''
   sql+=" WITH res as ( ";
   sql+=" SELECT idate(gps_datetime) as gps_datetime,modem_id,mileage ";
   sql+=",get_nao_isin_station_id_only(lon::varchar,lat::varchar,'"+nao_group_sale+"') as idx ";
   sql+=",get_nao_isin_station4(lon::varchar,lat::varchar,'"+nao_group_sale+"') as station_name ";
   sql+=",lon||','||lat as lonlat";
   sql+=",tambol||':'||amphur||':'||province as locations_th";
   sql+=",etambol||':'||eamphur||':'||eprovince as locations_en";
   sql+=",speed ,status,input_status  ";
   sql+=" FROM ht_"+modem_id; //142181256535
   sql+=" WHERE gps_datetime >='"+datetime+" 00:00' ";//2019-11-07
   sql+=" AND gps_datetime <='"+datetime+" 23:59' ) ";
   sql+=" SELECT  row_number() over (order by gps_datetime) as rownum,* FROM res WHERE idx IS NOT NULL ";

/*

WITH res AS (
	SELECT
		idate (gps_datetime) AS gps_datetime,
		modem_id,
		mileage,
		get_nao_isin_station_id_only5 (
			lon :: VARCHAR,
			lat :: VARCHAR,
			'17'
		)::INTEGER AS idx,

		get_nao_isin_station5 (
			lon :: VARCHAR,
			lat :: VARCHAR,
			'17'
		) AS station_name,
		lon || ',' || lat AS lonlat,
		tambol || ':' || amphur || ':' || province AS locations_th,
		etambol || ':' || eamphur || ':' || eprovince AS locations_en,
		speed,
		status,
		input_status
	FROM
		ht_142181256535
	WHERE
		gps_datetime >= '2019-12-15 00:00'
	AND gps_datetime <= '2019-12-15 23:59'
) 

SELECT
	COUNT (idx),
	idx,
	MIN (gps_datetime) AS startdate,
	MAX (gps_datetime) AS enddate,
	station_name,
	modem_id
FROM
	res
GROUP BY
	idx,
	station_name,
	modem_id
HAVING
	COUNT (idx)>= 5
ORDER BY
	MIN (gps_datetime)
*/


 //  var sql2="WITH res as (SELECT idate(gps_datetime) as gps_datetime,modem_id,lon||','||lat as lonlat,mileage,idx,station_name,speed FROM test_)";
  // sql2+=" SELECT COUNT(idx),min(gps_datetime) as startdate,max(gps_datetime)as enddate,station_name FROM res GROUP BY idx,station_name HAVING COUNT(idx)>=5 ORDER BY min(gps_datetime) ";
 var sql1='';
  sql1+=" WITH res as ( ";
  sql1+=" SELECT idate(gps_datetime) as gps_datetime,modem_id,mileage ";
 sql1+=",get_nao_isin_station_id_only5(lon::varchar,lat::varchar,'"+nao_group_sale+"') as idx ";
  sql1+=",get_nao_isin_station5(lon::varchar,lat::varchar,'"+nao_group_sale+"') as station_name ";
 // sql1+=",get_nao_isin_station_id_only_1time(lon::varchar,lat::varchar,'"+nao_group_sale+"') as idx ";
 // sql1+=",get_nao_isin_station1time(lon::varchar,lat::varchar,'"+nao_group_sale+"') as station_name ";
  sql1+=",lon||','||lat as lonlat";
  sql1+=",tambol||':'||amphur||':'||province as locations_th";
  sql1+=",etambol||':'||eamphur||':'||eprovince as locations_en";
  sql1+=",speed ,status,input_status  ";
  sql1+=" FROM ht_"+modem_id; //142181256535
  sql1+=" WHERE gps_datetime >='"+datetime+" 00:00' ";//2019-11-07
  sql1+=" AND gps_datetime <='"+datetime+" 23:59' ) ";
  sql1+=" SELECT COUNT(idx),idx,min(gps_datetime)as startdate,max(gps_datetime) as enddate,station_name,modem_id  ";
  sql1+=" FROM res GROUP BY idx,station_name,modem_id  HAVING COUNT(idx)>=5 ORDER BY min(gps_datetime) ";



//var para = { 'id': 1, 'db_name': 'db_10034', 'modem_id': '142181256535', 'start_time': '2019-11-07 00:00', 'end_time': '2019-11-07 23:59', 'date_gen_report': '2019-11-21', 'message': '' }


ipm.db.dbname = db_owner;
db.get_rows(ipm, sql1, function (res_db)
{
    // debugger;
    
        if (res_db.length > 0) 
        {
        // subp(res_db,para,function(d)
            add_2_database(res_db,function(d)
            {
                //console.log(d);
                callback(d);
                return;
            })
        }
    
});




}

var modem_id = ''; //1010003020
var res_ar = [];
var open_datetime = '';
var open_status = '';
var open_rownumber = '';
var find_next =0;
var i = 0;
var cur_idx =0;

function add_2_database(rows,callback)
{
    if (rows.length > 0)
    {
    async.eachSeries(rows, function (row, next)
    {
     
        var temp = new driving_temp();
        temp.start_date  = row.startdate;
        temp.end_date  = row.enddate;
        temp.geom_name = row.station_name; 
        temp.geom_id = row.idx;

        modem_id =  row.modem_id;

        var step1 = false; var step2 = false;

        get_data1(row.modem_id,row.startdate,function(xr)
        {   
            //debugger;
            temp.modem_id =xr[0].modem_id;
            temp.start_lonlat = xr[0].lonlat;
            temp.start_mile = xr[0].mileage;
            temp.start_loc_th = xr[0].locations_th;
            temp.start_loc_en = xr[0].locations_en;

            step1 = true;

            finish();


        })

        get_data1(row.modem_id,row.enddate,function(xr)
        { 
            temp.end_lonlat = xr[0].lonlat;
            temp.end_mile = xr[0].mileage;
            temp.end_loc_th = xr[0].locations_th;
            temp.end_loc_en = xr[0].locations_en;
             step2 = true;
            finish();
        
        });


        function finish(){

            if(step1 && step2)
            {
                temp.modem_id = row.modem_id;
                temp.time_use = irp.diff_min(temp.start_date,temp.end_date );
                temp.distance = (temp.end_mile-temp.start_mile).toFixed(2);//ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
              //  res_ar.push(temp);

                add_rp_enter_geom(temp,function(xfs)
                {
                    next();
                })
               
            }
           
        }



  
    },function(){
        debugger;
        console.log('finish add data '+modem_id);
      //  console.log(res_ar)
        callback(res_ar);
        return;
    });
  }else{
      console.log('no data');
      callback('nodata');
      return;
  }
}

function add_rp_enter_geom(para, callback)
{
    debugger;
        var sql_insrt = squel.insert()
        .into('rp_enter_geom')
        .set('modem_id', para.modem_id)
        .set('enter_time', para.start_date)
        .set('start_lonlat', para.start_lonlat)
        .set('start_loc_th', para.start_loc_th)
        .set('start_loc_en', para.start_loc_en)
        .set('start_mile', para.start_mile)
    
        .set('date_record', irp.timenow())

        .set('status_type_start', '10')
        .set('geom_id', para.geom_id)
        .set('geom_name', para.geom_name)
        .set('geom_type', '1')

        .set('leave_time', para.end_date)
        .set('timeuse', para.time_use)
        .set('distance', para.distance)
        .set('end_mile', para.end_mile)
        .set('end_lonlat', para.end_lonlat)
        .set('end_loc_th', para.end_loc_th)
        .set('end_loc_en', para.end_loc_en)
        .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql_insrt, function (response)
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

function subp(res_db,para,callback)
{
    var end_loop = res_db.length;

    for (i; i < end_loop; i++)
    {
        if (i != end_loop - 1)
        {

            if (find_next == 0)
            {
                var temp = new driving_temp();

              //  var i_next = i + 1;

                temp.start_date  = res_db[i]['gps_datetime'];
                temp.start_lonlat = res_db[i]['lonlat'];
                cur_idx = res_db[i]['idx'];
                temp.start_mile  = res_db[i]['mileage'];


        //        temp.start_loc_th = res_db[i]['locations_th'];
        //        temp.start_loc_en = res_db[i]['locations_en'];



                find_open_service(res_db,cur_idx,function(x_end_rownum)
                {
                 
                //  console.log(x_end_rownum);
                    find_next = x_end_rownum;
                    open_rownumber = x_end_rownum -1 ;
                    
                    is_not_onerecord(res_db,cur_idx,open_rownumber,function(res_isone)
                    {
                        if(res_isone)
                        {
                            find_close_service(res_db, open_rownumber, function (xres)
                            {
                           
                                if(xres !=undefined)
                                {
                                    temp.modem_id = xres.modem_id;
                                    temp.end_date  = xres.gps_datetime;
                                                        
                                    temp.end_lonlat = xres.lonlat;
                            //       temp.end_loc_th = xres.locations_th;
                            //       temp.end_loc_en = xres.locations_en;
                                
                                    temp.time_use = irp.diff_min(temp.start_date,temp.end_date);
                                    temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
                                    temp.geom_name = xres.station_name;
                                
                                    temp.distance =  ( temp.start_mile-xres.mileage).toFixed(2);//ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                                    temp.end_mile = xres.mileage;
                                    res_ar.push(temp);

                                    subp(res_db,para,function()
                                    {
                                        callback(true);
                                        return;
                                    });

                                }
                            })
                        }
                        else
                        {
                               debugger;
                        }
                    });


                })

            }
            else
            {
              
               
                    cur_idx = res_db[find_next]['idx'];

                    find_nextopen_service(res_db,cur_idx,find_next,function(x_end_rownum)
                    {
                       // 
                    //  console.log(x_end_rownum);
                       // var idex_before = find_next -1;
                        find_next = x_end_rownum;
                         open_rownumber = x_end_rownum -1 ;

                         if(!isNaN(open_rownumber)) 
                         {
                          
                            is_not_onerecord(res_db,cur_idx,open_rownumber,function(res_isone)
                            {
                                if(res_isone)
                                {
                                    var temp = new driving_temp();
                                    temp.start_date  = res_db[idex_before]['gps_datetime'];
                                    temp.start_lonlat = res_db[idex_before]['lonlat'];
                                    temp.start_mile  = res_db[idex_before]['mileage'];
                                   
                                   find_close_service(res_db, open_rownumber, function (xres)
                                   {
                                       if(xres !=undefined)
                                       {
                                           temp.modem_id = xres.modem_id;
                                           temp.end_date  = xres.gps_datetime;                  
                                           temp.end_lonlat = xres.lonlat;
                                    //       temp.end_loc_th = xres.locations_th;
                                    //       temp.end_loc_en = xres.locations_en;
                                       
                                           temp.time_use = irp.diff_min(temp.start_date,temp.end_date );
                                           temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
                                           temp.geom_name = xres.station_name;
                                       
                                           temp.distance =  (temp.start_mile-xres.mileage).toFixed(2);//ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                                           temp.end_mile = xres.mileage;
                                           res_ar.push(temp);
               
                                           subp(res_db,para,function()
                                           {
                                               callback(true);
                                               return;
                                           });
               
                                       }
                                   })
                                }
                                else
                                {
                                 //   debugger;
                                 //  console.log( res_db[idex_before]['gps_datetime']);
                                   var temp = new driving_temp();
                                   temp.start_date  = res_db[open_rownumber]['gps_datetime'];
                                   temp.end_date  = res_db[open_rownumber]['gps_datetime'];
                                   temp.start_lonlat = res_db[open_rownumber]['lonlat'];
                                   temp.start_mile  = res_db[open_rownumber]['mileage'];
                                   temp.modem_id = res_db[open_rownumber]['modem_id']; 
                                   temp.geom_name = res_db[open_rownumber]['station_name']; 
                            //       temp.end_loc_th = xres.locations_th;
                            //       temp.end_loc_en = xres.locations_en;
                               
                                   temp.time_use = irp.diff_min(temp.start_date,temp.end_date );
                                   temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
                                 
                               
                                   temp.distance =  0;//(temp.start_mile-xres.mileage).toFixed(2);//ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                                   temp.end_mile =  temp.start_mile; //xres.mileage;
                                   res_ar.push(temp);
       
                                   subp(res_db,para,function()
                                   {
                                       callback(true);
                                       return;
                                   });

                                }
                            })

                        

                         } 
                         else
                        {
                                debugger
                                console.log(res_ar);
                        }
 
    
                    })
                
               
               
            }

        }
    }
}

function sup_process(rows,para,callback)
{
 // var status_engine_work = '2';

             if (i == 0)
             {
                 var temp = new driving_temp();
                 temp.start_date = rows[0].gps_datetime;
                 var cur_idx = rows[i]['idx'];

                 find_open_service(rows, cur_idx, function (xres)
                 {
                    // debugger;
                     // console.log(xres);
                     open_rownumber = xres.rownum; //- 1;

                     open_datetime = xres.gps_datetime;
                     open_status = xres.status;
                     temp.start_lonlat = xres.lonlat;
                     temp.start_loc_th = xres.locations_th;
                     temp.start_loc_en = xres.locations_en;
                    // temp.end_date = xres.gps_datetime;
                     temp.start_date = xres.gps_datetime;
                     temp.start_mile = xres.mileage;
                     

                     find_open_service(rows,cur_idx,function(open_rownumber)
                     {
                        i = open_rownumber;
                        open_rownumber = open_rownumber -1 ;
                        
                        
                                find_close_service(rows, open_rownumber, function (xres)
                                {
                        
                                    if(xres !=undefined)
                                    {
                                        temp.modem_id = xres.modem_id;
                                        temp.end_date  = xres.gps_datetime;
                                                    
                                        temp.end_lonlat = xres.lonlat;
                                        temp.end_loc_th = xres.locations_th;
                                        temp.end_loc_en = xres.locations_en;
                            
                                        temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                        temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
                            
                                        temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                                        temp.end_mile = xres.mileage;
                                        res_ar.push(temp);
                            
                                                     
                                        sup_process(rows,para,function()
                                        {
                                            callback(true);
                                            return;
                                        });
                                    }else{

                                        
                                           debugger;
                                          // console.log(res_ar);
                                           index = rows.length -1;
         
                                           temp.modem_id = rows[index].modem_id;
                                           temp.end_date = rows[index].gps_datetime;
                                       
               
                                           temp.end_lonlat = rows[index].lonlat;
                                           temp.end_loc_th = rows[index].locations_th;
                                           temp.end_loc_en = rows[index].locations_en;
               
                                           temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                           temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
               
                                           temp.end_mile = rows[index].mileage;
            
                                           temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
               
                                           res_ar.push(temp);
         
       
                                        add_report_trip(para.id,res_ar,function()
                                        {
                                            callback(true);
                                            return;
                                        })
                                    }
                                  
                                                 
                                                 
                                });
                     })

                 

                 });
             } 
             else 
             { 
                 var temp = new driving_temp();

                 find_open_service(rows,i,function(index)
                 {
                   

                        if(rows[index] !==undefined)
                        {
                            temp.start_date = rows[index].gps_datetime;
                            temp.status = rows[index].status;
                            temp.start_mile = rows[index].mileage;
           
                            temp.start_lonlat = rows[index].lonlat;
                            temp.start_loc_th = rows[index].locations_th;
                            temp.start_loc_en = rows[index].locations_en;

                            open_rownumber = rows[index].rownum;

                         
   
                       find_index_end_service(rows,index,function(open_rownumber)
                        {
                           i = open_rownumber;
                           open_rownumber = open_rownumber -1 ;
                           
                        
                           find_close_service(rows, open_rownumber, function (res_close) 
                           {
                               // 
                               if(res_close ===undefined)
                               {
                                  debugger;
                                 // console.log(res_ar);
                                  index = rows.length -1;

                                  temp.modem_id = rows[index].modem_id;
                                  temp.end_date = rows[index].gps_datetime;
                              
      
                                  temp.end_lonlat = rows[index].lonlat;
                                  temp.end_loc_th = rows[index].locations_th;
                                  temp.end_loc_en = rows[index].locations_en;
      
                                  temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                  temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
      
                                  temp.end_mile = rows[index].mileage;
   
                                  temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
      
                                  res_ar.push(temp);

                                  add_report_trip(para.id,res_ar,function()
                                  {
                                      callback(true);
                                      return;
                                  })

                               }
                               else
                               {

                                temp.modem_id = res_close.modem_id;
                                temp.end_date = res_close.gps_datetime;

                                temp.end_lonlat = res_close.lonlat;
                                temp.end_loc_th = res_close.locations_th;
                                temp.end_loc_en = res_close.locations_en;
    
                                temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
    
                                temp.end_mile = res_close.mileage;
 
                                temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
    
                                res_ar.push(temp);
 
                                     sup_process(rows,para,function()
                                    {
                                        callback(true);
                                        return;
                                    });
                               }
                            
                           
   
                           });
                        });
                       
                        }
                        else
                        {
                             debugger;
               
                             if(res_ar.length>0)
                             {
                                 console.log('add_report_trip '+para.modem_id+' = '+res_ar.length);
                                 //  console.log(para.modem_id);
                                 clear_data_now_by_id(para,function(xf)
                                 {
                                     add_report_trip(para.id,res_ar,function(res_y)
                                     {
                                         callback(res_y);
                                         return;
                                     })
                                 })
                             }
                             else
                             {
                                 callback([]);
                                 return;
                             }
   
                        }
                     


                 })

               

             }
         
}

function all_vehicle_nao()
{
    var sql= "SELECT modem_id FROM master_config_vehicle WHERE db_name='db_10034' AND nao_group_sale IS NOT NULL  AND modem_id in('142181256548')"//  "; ,'142181155750'
    var datetime ='2021-03-05';

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        async.eachSeries(rows, function (row, next)
        {
            get_naogrop_sale(row.modem_id,function(group_sale)
            {
                main_start(row.modem_id,datetime,group_sale,function(x)
                {
                    debugger;
                    console.log(x);
                    next();
                })
            })
        },function(){
            console.log('xxx finish');
        });
   });
}

function check_process(para,callback)
{
   // var modem_id ='142181256623';
   // var datetime ='2019-11-08';
    get_naogrop_sale(para.modem_id,function(group_sale)
    {
        main_start(para.modem_id,para.datetime,group_sale,function(x)
        {
            debugger;
            callback(x);
            return;
         //   add_report_nao_enter_station(x,function(resx){{
           //        console.log(resx);

         //   }})
        })
    })
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
        
         clear_data_now_by_id(para,function(xs)
         {

            check_process(para,function(is_finish)
            {
                next();
            })
         })
         


       
    },function(){
        console.log('finish');
        callback(true);
        return;
    });


}

function clear_data_now_by_id(para,callback)
{
    var date_now = utl.format_date(para.start_time);
    var sql =" DELETE FROM rp_enter_geom WHERE iymd(enter_time)='"+date_now+"' AND modem_id= '"+para.modem_id+"' ";

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

/*
var para = { 'id': 1, 'db_name': 'db_10034', 'modem_id': '142181256548','datetime':''
, 'start_time': '2021-03-06 00:00', 'end_time': '2021-03-10 23:59', 'date_gen_report': '2021-03-05', 'message': '' }

process_multidate(para,function(xs)
{
    console.log(xs);
})
*/



//all_vehicle_nao();

//check_process;


 //#region Test

 //start('2019-11-07')
/*
clear_data_yesterday(function(){

});
*/

/*

SELECT * FROM rp_enter_geom WHERE modem_id='142181256535' 
AND enter_time >='2019-11-07 00:00'
AND leave_time <='2019-11-07 23:59'

SELECT * FROM rp_nao_enter_station WHERE iymd(start_date)='2019-11-07'
AND modem_id ='142181256535'


SELECT * FROM rp_enter_geom WHERE iymd(enter_time)='2019-11-07'
AND modem_id ='142181256535'


*/


