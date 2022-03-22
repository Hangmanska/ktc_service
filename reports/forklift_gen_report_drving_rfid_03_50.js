
var schedule = require('node-schedule');
var mustache = require("mustache");
var timespan = require('timespan');
var moment = require('moment');

var async = require('async');
var squel = require("squel");
var linq = require('linq.js');
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var irp = require('iReports.js');
var idf = require('iDatediff.js');

var db_config = "master_config";
var db_owner = "db_10039";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var status_engine_work = '2';// เครื่องยนต์ทำงาน

function driving_temp()
{
    
    this.start_date = '';
    this.end_date = '';
    this.time_use = '';

    this.start_lonlat = '';
    this.end_lonlat = '';
    this.modem_id = '';
    
    this.distance = '';
    this.driver_id='';
    this.mileage='';
}

var i = 0;
var modem_id = ''; //1010003020
var res_ar = [];
var open_datetime = '';
var open_status = '';
var open_rownumber = '';
var open_start_lonlat = '';
var open_start_loc_th = '';
var open_start_loc_en = '';
var cur_lon='';
var cur_lat ='';
var date_process ='';
var start_date='';//'2017-01-08 00:00';
var end_date='';//'2017-01-08 23:59';

function ical_distance(lonlat_start,lonlat_end) {
    var r = utl.Split(lonlat_start, ',');
    var n = utl.Split(lonlat_end, ',');
    return irp.cal_distance(r[0], r[1], n[0], n[1]);
   // return res;
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

function get_all_vehicle(date_process)
{
    //to_char(now(), 'YYYY-MM-DD')
   //var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";
   //var sql = "SELECT modem_id,db_name,'"+date_process+"' as date_process  FROM master_config_vehicle WHERE db_name='db_10036' ";
  
   var sql = "";
   sql += " SELECT r.modem_id,'"+date_process+"' as date_process "
   sql += " FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r "
   sql += " WHERE sv.fleetcode=get_fleetid('nissan_nft') "
   sql += " AND mcv.db_name=sv.fleetid "
   sql += " AND sv.modem_id= mcv.modem_id "
   sql += " AND sv.modem_id=r.modem_id "


   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_ar) 
    {
          /* */
          debugger;
             async.eachSeries(res_ar, function (row, next)
             {
               
                has_table(row.modem_id,db_owner,function(resx)
                {
                    if(resx==true)
                    {
                        console.log(row.modem_id,row.date_process);
                        gen_data(row.modem_id,row.date_process,function(xres)
                        {
                            if(xres)
                            {
                                next();
                            }
                        });
                    }
                    else
                    {
                        console.log('no_table '+row.modem_id+' '+row.date_process);
                        next();
                    }
                });
             },function(){
                 console.log('finish');
                 
             });
            
    });

}

function find_open_service(data, input_status, gps_datetime, callback) 
{
    var x_res = linq.Enumerable.From(data)
       .Where(function (x) { return x.input_status == input_status })
       .FirstOrDefault();
    callback(x_res);
    return;
}

function find_close_service(data, rownum, callback)
{
    var x_res = linq.Enumerable.From(data)
    .Where(function (x) { return x.rownum == rownum })
    .FirstOrDefault();
    callback(x_res);
    return;
}

//หาจุดสุดท้ายของข้อมูลที่ค่าเป็นศูนย์ 
function find_index_end_service(data,rownum, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return x.input_status == '1' })
    .Where(function (x) { return x.rownum > parseInt( rownum) })
    .Select(function (x) { return parseInt(x.rownum) })
   // .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

   // debugger;
     
     callback(x_end_rownum);
     return;
    
}

function find_index_start_service(data,status_engine_work,rownum, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return x.input_status == status_engine_work })
    .Where(function (x) { return x.rownum > rownum })
    .Select(function (x) { return parseInt(x.rownum) })
   // .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

   // debugger;
     
     callback(x_end_rownum);
     return;
    
}
function getArraySum(a){
    var total=0;
    for(var i in a) { 
        total += parseFloat( a[i]);
    }
    return total.toFixed(3);
}

function find_sum_mileage(data,start_date,end_date, callback)
{
    var res_mileage = linq.Enumerable.From(data)
    .Where(function (x) { return x.gps_datetime >= start_date }) 
    .Where(function (x) { return x.gps_datetime <= end_date }) 
    .Select(function (x) { return parseFloat(x.mileage).toFixed(3) })
    .ToArray();

   var asum = getArraySum(res_mileage);
    callback(asum);
    return;
}

function find_sum_mileage_db(start_date,end_date,para,callback)
{
    var sql=" SELECT  SUM(mileage) as sum_mileage ";
    sql+=" FROM ht_"+para.modem_id;
    sql+=" WHERE gps_datetime >= '"+start_date+"' ";
    sql+=" AND gps_datetime <= '"+end_date+"' ";
    sql+=" AND driver_id='"+para.driver_id+"' ";
    sql+=" AND analog_input2 !='0400' ";    
    
   ipm.db.dbname = db_owner;
   db.get_rows(ipm, sql, function (res_ar) 
   {
    if(res_ar.length >0)
    {
        var res = res_ar[0]['sum_mileage'];
        callback(res);
        return;
    };
   }); 


}

function get_data_details(para,callback)
{
   var sql=" SELECT row_number() over (order by gps_datetime) as rownum ";
   sql+=" ,modem_id,idate(gps_datetime)as gps_datetime,lon||','||lat as lonlat,lat,lon,analog_input2,status as input_status,status,mileage ";
   sql+=" FROM ht_"+para.modem_id;
   sql+=" WHERE gps_datetime >= '"+para.start_time+"' ";
   sql+=" AND gps_datetime <= '"+para.end_time+"' ";
   sql+=" AND driver_id='"+para.driver_id+"' ";
   sql+=" AND analog_input2 !='0400' ";     
   sql+=" ORDER BY gps_datetime ASC ";

   res_ar = []; // very important clear before call again
   i = 0;
   open_datetime = '';
   open_status = '';
   open_rownumber = '';
   open_start_lonlat = '';
   cur_lon='';
   cur_lat ='';
   date_process ='';

 // date_process = para.start_time;

   ipm.db.dbname = db_owner;
   db.get_rows(ipm, sql, function (res_ar) 
   {
        debugger;
       // console.log(res_ar);
        if(res_ar.length >0)
        {
            sup_process(res_ar,para,function(res_final)
            {
                callback(res_final);
                return;
            })
        }
        else
        {
            console.log('no data on get_data_details');
            callback(true);
            return;
        }
   });

}


function sup_process(rows,para,callback)
{


             if (i == 0)
             {
                 var temp = new driving_temp();
                 temp.start_date = rows[0].gps_datetime;

                 find_open_service(rows, status_engine_work, temp.start_date, function (xres)
                 {
                    // debugger;
                     // console.log(xres);
                     if(xres !==undefined)
                     {
                     open_rownumber = xres.rownum; //- 1;

                     open_datetime = xres.gps_datetime;
                     open_status = xres.status;
                     temp.start_lonlat = xres.lonlat;
           
                    // temp.end_date = xres.gps_datetime;
                     temp.start_date = xres.gps_datetime;
                     temp.start_mile = xres.mileage ===null ? '0': xres.mileage;
                     temp.driver_id = para.driver_id;
                   //  console.log('start_mile '+temp.start_mile)
                     

                     find_index_end_service(rows,open_rownumber,function(open_rownumber)
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
                                     
                            
                                        temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                        temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
                            
                                        temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                                        temp.end_mile = xres.mileage ===null ? '0': xres.mileage;

                                        find_sum_mileage(rows,temp.start_date,temp.end_date,function(res_mileage)
                                        {
                                            temp.mileage  = res_mileage;
                                            res_ar.push(temp);
                                        })
      
                                        sup_process(rows,para,function()
                                        {
                                            callback(true);
                                            return;
                                        });
                                    }
                                    else
                                    {

                                        
                                           debugger;
                                          // console.log(res_ar);
                                           index = rows.length -1;
         
                                           temp.modem_id = rows[index].modem_id;
                                           temp.end_date = rows[index].gps_datetime;
                                       
               
                                           temp.end_lonlat = rows[index].lonlat;
                                    
               
                                           temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                           temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
               
                                           temp.end_mile =  rows[index].mileage ===null ? '0': rows[index].mileage; 
                                           temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                                           
                                           find_sum_mileage(rows,temp.start_date,temp.end_date,function(res_mileage)
                                           {
                                               temp.mileage  = res_mileage;
                                               res_ar.push(temp);
                                           })

                                        add_report_trip(para.id,res_ar,function()
                                        {
                                            callback(true);
                                            return;
                                        })
                                    }
                                  
                                                 
                                                 
                                });
                     })
                    }
                     else
                    {
                         debugger;
           
                         if(res_ar.length>0)
                         {
                             console.log('add_report_trip '+para.modem_id+' = '+res_ar.length);
                             //  console.log(para.modem_id);
                           //  clear_data_now_by_id(para,function(xf)
                           //  {
                                 add_report_trip(para.id,res_ar,function(res_y)
                                 {
                                     callback(res_y);
                                     return;
                                 })
                           //  })
                         }
                         else
                         {
                             callback([]);
                             return;
                         }

                    }
                 

                 });
             } 
             else 
             { 
                 var temp = new driving_temp();

                 find_index_start_service(rows,status_engine_work,i,function(index)
                 {
                   

                        if(rows[index] !==undefined)
                        {
                            temp.start_date = rows[index].gps_datetime;
                            temp.status = rows[index].status;
                            temp.start_mile = rows[index].mileage;

                            temp.start_mile = temp.start_mile ===null ? '0': temp.start_mile;

                           // console.log('start_mile '+temp.start_mile)
                     
           
                            temp.start_lonlat = rows[index].lonlat;

                            open_rownumber = rows[index].rownum;
                            temp.driver_id = para.driver_id;
                         
   
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
                        
      
                                  temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                  temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
      
                                  temp.end_mile = rows[index].mileage ===null ? '0': rows[index].mileage; // rows[index].mileage;

                                //  console.log('end_mile '+temp.end_mile)
   
                                  temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);

                                  find_sum_mileage(rows,temp.start_date,temp.end_date,function(res_mileage)
                                  {
                                      temp.mileage  = res_mileage;
                                      res_ar.push(temp);
                                  })
      
                                  

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

    
                                temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                                temp.time_use =  temp.time_use == 0 ? 1 : temp.time_use;
    
                                temp.end_mile =  res_close.mileage ===null ? '0': res_close.mileage;

                             //   console.log('end_mile '+temp.end_mile)
 
                                temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);

                                find_sum_mileage(rows,temp.start_date,temp.end_date,function(res_mileage)
                                {
                                    temp.mileage  = res_mileage;
                                    res_ar.push(temp);
                                })
    
                             
 
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
                               //  clear_data_now_by_id(para,function(xf)
                               //  {
                                     add_report_trip(para.id,res_ar,function(res_y)
                                     {
                                         callback(res_y);
                                         return;
                                     })
                               //  })
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

function add_report_trip(id, res, callback)
{
    debugger;
    var strMustache = '{{#.}}';
    strMustache += "('{{modem_id}}','{{start_date}}','{{end_date}}','{{distance}}','{{time_use}}','{{start_lonlat}}','{{end_lonlat}}','{{driver_id}}','{{mileage}}'";
    strMustache += "),";
    strMustache += '{{/.}}';

    var result_val = mustache.render(strMustache, res);
    result_val = utl.iRmend(result_val);
    var sql = " INSERT INTO rp_nissan_forklift_rfid(modem_id,start_time,stop_time,total_distance,total_min,lonlat_start,lonlat_stop,rfid,mileage) VALUES " + result_val;


    //  iBuildText.build_text('c:\\sql_x.txt', sql)
    
    if (res.length > 0)
    {
        var para = { 'id': id, 'message': '', 'complete': 0 };

        ipm.db.dbname = db_config;
        db.excute(ipm, sql, function (response) 
        {
            if (response == 'oK') 
            {
                para.complete = 1;
                para.message = response;
                /* */

                    if (response == 'oK') 
                    {
                        callback(response);
                        return;
                    }
                
               
            }
            else 
            {

                para.complete = 0;
                para.message = response;
                /* */
              
                    if (response == 'oK') 
                    {
                        callback([]);
                        return;
                    }
               
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



function main_start(para,callback)
{
   // var para = {'driver_id':'', 'id': 1, 'db_name': db_owner, 'modem_id': '143190871427', 'start_time': '2021-03-01' + ' 00:00', 'end_time': '2021-03-01'+ ' 23:59', 'date_gen_report': '2021-03-01', 'message': '' }
   
    var sql= " SELECT driver_id,COUNT(driver_id) FROM ht_"+para.modem_id+" WHERE gps_datetime >= '"+para.start_time+"' AND gps_datetime <= '"+para.end_time+"'  GROUP BY driver_id ";
  
        ipm.db.dbname = db_owner;
        db.get_rows(ipm, sql, function (res) 
        {
            if (res.length > 0) 
            {
                async.eachSeries(res, function (row, next) 
                {
                    para.driver_id = row.driver_id;
                    get_data_details(para,function(xres)
                    {
                        console.log(xres);
                        next();
                    })

                },function(){
                    console.log('++++ finish main_start++++');
                    callback(true);
                    return;
                });
            }else{
                console.log('!!!! XXXXXXXX no data main_start XXXXXXXXX !!!!! ');
                callback(true);
                return;
            }
        });

}




//main_start();

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
        
       

            main_start(para,function(is_finish)
            {
                next();
            })
        
       
    },function(){
       // console.log('finish');
        callback(true);
        return;
    });


}


//var para = {'driver_id':'', 'id': 1, 'db_name': db_owner, 'modem_id': '143190871427', 'start_time': '2021-03-01' + ' 00:00'
//, 'end_time': '2021-03-01'+ ' 23:59', 'date_gen_report': '2021-03-01', 'message': '' }

/*
var para = {'driver_id':'', 'id': 1, 'db_name': 'db_10039', 'modem_id': '143190871317','datetime':''
, 'start_time': '2021-03-01 00:00', 'end_time': '2021-03-10 23:59', 'date_gen_report': '2021-03-05', 'message': '' }

process_multidate(para,function(xs)
{
    console.log(xs);
})
*/



//start();


var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 03;
rule.minute = 50;


schedule.scheduleJob(rule, function ()
{
   // console.log('Harvester Midnight This runs at 23:59 every day.');

    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    console.log('start forklift_gen_report_driving_rfid  ' + date_gen_report + ' timenow : ' +  moment().format('YYYY-MM-DD HH:mm:ss'));

    var start_time =  date_gen_report+' 00:00';
    var end_time = date_gen_report+' 23:59';
  
    start(start_time,end_time,date_gen_report);
  
  
});

function start(start_time,end_time,date_gen_report)
{


var sql = "SELECT  modem_id,db_name FROM master_config_vehicle WHERE db_name='db_10039'  ORDER BY db_name DESC";
 //   console.log('start genreport ' + date_gen_report + ' timenow : ' + irp.timenow());
 
    //var date_gen_report = '2016-06-25';
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {

                var para = {'driver_id':'', 'id': 1, 'db_name': 'db_10039', 'modem_id': row.modem_id,'datetime':''
, 'start_time': start_time, 'end_time': end_time, 'date_gen_report': date_gen_report, 'message': '' }


                process_multidate(para,function(xs)
                {
                    console.log(xs);
                    next();
                });

            },function(){
                console.log('++++++++++ finish complete ++++++++++');
                console.log('finish forklift_gen_report_driving_rfid  ' + date_gen_report + ' timenow : ' +  moment().format('YYYY-MM-DD HH:mm:ss'));

            });
        }
    });

}


console.log("start program forklift_gen_report_driving_rfid "+ moment().format('YYYY-MM-DD HH:mm:ss')+" wait process at 03:50 every day")
