var schedule = require('node-schedule');
var mustache = require("mustache");
var timespan = require('timespan');
var moment = require('moment');
var idf = require('iDatediff.js');

var async = require('async');
var squel = require("squel");
var linq = require('linq.js');
var db = require('iConnectdb_ktc.js');

var iconn = require('conn_sugar_cane.js');
var pg_htt = new db.im2(iconn.get_dbconfig_htt());
var ipm = new db.im2(iconn.get_dbconfig_realtime());
var inout = require('inout_polygon.js');
var jrp_today = require('ocsb_gen_report_speed_avg_today.js');

var db_config = "master_config";
var db_owner = "db_10036";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');

var status_working_flip = "('2600','2602')";
var status_working_normal = "('2400','2402')";

/*
SELECT gps_datetime,speed
,CASE  WHEN CAST(input_status as int)=5 OR CAST(input_status as int)=3 THEN '4' ELSE status END status
,tambol,amphur,province
,lat,lon,modem_id
FROM ht_1010003020
WHERE gps_datetime >='2017-01-08 00:00'
AND gps_datetime <='2017-01-08 23:59'
and speed >= 5
--AND input_status =5
ORDER BY gps_datetime ASC 
 */


function check_case_status(modem_id,callback)
{
  var sql1=" SELECT COALESCE(ital_is_usecase_status,'0') as ital_is_usecase_status "  
  sql1+="  FROM master_config_vehicle ";
  sql1+="  WHERE modem_id='"+modem_id+"' ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows)
    {
        debugger;
        if (rows.length > 0)
        {
             result = rows[0]['ital_is_usecase_status'] ;
            if(result=='1') // VCEW1458
            {
               callback(result);
                return
            }
            else
            {           
                callback(result);
                return
            }
           
        }
    });
}

function get_all_vehicle(date_process)
{
    //to_char(now(), 'YYYY-MM-DD')
   //var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";
   var sql = "SELECT modem_id,db_name,'"+date_process+"' as date_process  FROM master_config_vehicle WHERE db_name='db_10036'  "; //AND modem_id='143200385105'
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          /* */
          debugger;
             async.eachSeries(res_ar, function (row, next)
             {
                
                 console.log(row.modem_id,row.date_process);
                gen_data(row.modem_id,row.date_process,function(xres)
                {
                    if(xres)
                    {
                        next();
                    }
                });

             },function(){
                 console.log('finish');
             });
            
    });

}

function gen_data(modem_id,date_process,callback)
{
  
    check_case_status(modem_id,function(result)
    {
        var status_working ="";
        if(result=='0') //
        {
            status_working = status_working_normal;
        }
        else  // VCEW1458
        {
            status_working = status_working_flip;
        }

      
  
        var sql = "";
        sql += "WITH res as( ";
        sql += " SELECT '00' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 00:00' AND gps_datetime <='"+date_process+" 01:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION ";
        sql += " SELECT '01' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 01:01' AND gps_datetime <='"+date_process+" 02:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION ";
        sql += " SELECT '02' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 02:01' AND gps_datetime <='"+date_process+" 03:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION ";
        sql += " SELECT '03' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 03:01' AND gps_datetime <='"+date_process+" 04:00' AND analog_input2 IN "+status_working+" ";
        sql += " UNION ";
        sql += " SELECT '04' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 04:01' AND gps_datetime <='"+date_process+" 05:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION ";
        sql += " SELECT '05' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 05:01' AND gps_datetime <='"+date_process+" 06:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION ";
        sql += " SELECT '06' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 06:01' AND gps_datetime <='"+date_process+" 07:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION ";
        sql += " SELECT '07' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 07:01' AND gps_datetime <='"+date_process+" 08:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '08' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 08:01' AND gps_datetime <='"+date_process+" 09:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '09' as id,count(analog_input2)    FROM ht_"+modem_id+"  WHERE  gps_datetime >='"+date_process+" 09:01' AND gps_datetime <='"+date_process+" 10:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '10' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 10:01'  AND gps_datetime <='"+date_process+" 11:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '11' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 11:01'  AND gps_datetime <='"+date_process+" 12:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '12' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 12:01' AND gps_datetime <='"+date_process+" 13:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '13' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 13:01'  AND gps_datetime <='"+date_process+" 14:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '14' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 14:01' AND gps_datetime <='"+date_process+" 15:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '15' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 15:01' AND gps_datetime <='"+date_process+" 16:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '16' as id,count(analog_input2)   FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 16:01'  AND gps_datetime <='"+date_process+" 17:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '17' as id,count(analog_input2)   FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 17:01' AND gps_datetime <='"+date_process+" 18:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '18' as id,count(analog_input2)   FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 18:01'  AND gps_datetime <='"+date_process+" 19:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '19' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 19:01'  AND gps_datetime <='"+date_process+" 20:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '20' as id,count(analog_input2)   FROM ht_"+modem_id+"   WHERE gps_datetime >='"+date_process+" 20:01'  AND gps_datetime <='"+date_process+" 21:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '21' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 21:01'  AND gps_datetime <='"+date_process+" 22:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '22' as id,count(analog_input2)   FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 22:01'  AND gps_datetime <='"+date_process+" 23:00' AND analog_input2 IN "+status_working+"  ";
        sql += " UNION  ";
        sql += " SELECT '23' as id,count(analog_input2)  FROM ht_"+modem_id+"  WHERE gps_datetime >='"+date_process+" 23:01'  AND gps_datetime <='"+date_process+" 00:00' AND analog_input2 IN "+status_working+"  ";
        sql += "   ) ";
        sql += " SELECT * FROM res ORDER BY id ";
    
    
       ipm.db.dbname = db_owner;
        db.get_rows(ipm, sql, function (res_ar) 
        {
              //debugger;
            if (res_ar.length > 0) 
            {    // var xres_ar=[];
             //  console.log( res_ar[5].avg);
             insert_2db(modem_id,date_process,res_ar,function(xres)
             {
                 //console.log(xres);
                  callback(xres);
                  return;
             })
    
            }
            else
            {
                callback(true);
                return;
    
            }
        });


    });


}

function insert_2db(modem_id,date_process,ar,callback)
{

debugger
    var sql = squel.insert()
    .into('rp_italthai_working_everyhour')
    .set('modem_id',modem_id)
    .set('date_process',date_process)
    .set('working_00',isnull(ar[0].count))
    .set('working_01',isnull(ar[1].count))
    .set('working_02',isnull(ar[2].count))
    .set('working_03',isnull(ar[3].count))
    .set('working_04',isnull(ar[4].count))
    .set('working_05',isnull(ar[5].count))
    .set('working_06',isnull(ar[6].count))
    .set('working_07',isnull(ar[7].count))
    .set('working_08',isnull(ar[8].count))
    .set('working_09',isnull(ar[9].count))
    .set('working_10',isnull(ar[10].count))
    .set('working_11',isnull(ar[11].count))
    .set('working_12',isnull(ar[12].count))
    .set('working_13',isnull(ar[13].count))
    .set('working_14',isnull(ar[14].count))
    .set('working_15',isnull(ar[15].count))
    .set('working_16',isnull(ar[16].count))
    .set('working_17',isnull(ar[17].count))
    .set('working_18',isnull(ar[18].count))
    .set('working_19',isnull(ar[19].count))
    .set('working_20',isnull(ar[20].count))
    .set('working_21',isnull(ar[21].count))
    .set('working_22',isnull(ar[22].count))
    .set('working_23',isnull(ar[23].count))
 
     .toString();


     //console.log(sql)
     ocsb_excute(sql,db_config,function(xres)
     {
        // console.log(xres);
         callback(xres);
         return;
     })

}

function isnull(data)
{
   data = data === null ? 0 : data;
   return data;
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



var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00//23;
rule.minute = 20//59;

//#region
  

schedule.scheduleJob(rule, function ()
{
    
    var date_now='';
       date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
       date_now = date_now.subtract(1, 'days');

      var start_date = date_now.format('YYYY-MM-DD') 

  //  jrp_today.clear_report_today(start_date,function(is_clr_fin)
   //  {
   //      if(is_clr_fin)
    //     {
            get_all_vehicle(start_date);

                console.log('Italthai find total working  This runs at 00:20 every day. '+start_date);
               debugger;
               start_getdata_working_hour();
     //    }
       
        
  //  });
   

});

/*
gen_data('143200384932','2020-10-17',function(x)
{
    console.log(x);
})
*/


function start_getdata_working_hour() 
{
   var date_now = moment(moment().format('YYYY-MM-DD'))
    console.log('Italthai find getdata_working_hour This runs at 00:20 every day. '+date_now);

    var sql=" "
    sql+=" SELECT mcv.db_name,r.modem_id,coalesce(mcv.ital_is_usecase_status,'0') as upside_status ";
    sql+=" , CASE  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' THEN dblink_countworking_italthai_upsidedown_status(r.fleet_id,r.modem_id,'26')::numeric::integer  ";
    sql+=" WHEN coalesce(mcv.ital_is_usecase_status,'0')='0' THEN dblink_countworking_italthai(r.fleet_id,r.modem_id)::numeric::integer   ";
    sql+="  END as working_hour ";
    sql += " , CASE WHEN mcv.is_calculate_fuel='1' THEN ";
    sql += " TRUNC(linear_regression(mcv.fuelempty::DECIMAL,mcv.fuelfull::DECIMAL,0,mcv.fueltank::DECIMAL,dblink_last_analog_input1('db_10036',r.modem_id)::DECIMAL),2) ";
    sql += " ELSE '0' END  AS oil_liter ";
    sql+=" FROM realtime as r,master_config_vehicle as mcv WHERE r.fleet_id='db_10036' AND r.modem_id=mcv.modem_id AND r.fleet_id = mcv.db_name ";
    
        //var date_gen_report = '2016-06-25';
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (res) 
        {
            if (res.length > 0) 
            {
                async.eachSeries(res, function (row, next) 
                {
                        console.log( row.modem_id+' '+row.working_hour);
                       update_data_working_hour(row.working_hour,row.modem_id,function(resx0)
                       {
                         update_data_oil_liter( row.oil_liter,row.modem_id,function(resx1)
                         {
                           if(resx1=='oK')
                           {
                              next();
                           }
                          });
                         
                       })
                        
                },function(){
                    console.log('finish '+date_now);
                });
            }
        });
}

function update_data_working_hour(working_hour,modem_id,callback)
{
   var sql= "UPDATE master_config_vehicle SET iti_working_hour='"+working_hour+"'  WHERE modem_id='"+modem_id+"' ";

   ipm.db.dbname = db_config;
   db.excute(ipm, sql, function (response) 
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



function update_data_oil_liter(oil_liter,modem_id,callback)
{
    oil_liter = oil_liter <= 0 ? 0 : oil_liter;
   var sql= "UPDATE realtime SET oil_liter='"+oil_liter+"'  WHERE modem_id='"+modem_id+"' ";

   ipm.db.dbname = db_config;
   db.excute(ipm, sql, function (response) 
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



//get_all_vehicle('2021-10-05')


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
        
       

                            gen_data(para.modem_id,para.datetime, function (xres) 
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


    var sql = "SELECT modem_id,db_name FROM master_config_vehicle WHERE db_name='db_10036' AND modem_id='143200384772' "; //
 //   console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());
 
    //var date_gen_report = '2016-06-25';
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {

                var para = {'driver_id':'', 'id': 1, 'db_name': 'db_10036', 'modem_id': row.modem_id,'datetime':''
, 'start_time': '2021-12-02 00:00', 'end_time': '2021-12-07 23:59', 'date_gen_report': '2021-12-08', 'message': '' }


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

//start();