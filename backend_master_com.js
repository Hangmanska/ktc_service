var async = require('async');
var squel = require("squel");
var exec = require('child_process').exec;

var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var utl = require('Utility.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_owner ="db_10030";

var token="lFeyGvT4DhoTetVDQ78DFGMcy8EqkXeJjx7rptacNCH";//token="fQoTmXoaFW7jVJjWznmdIwSMIuGtrVqJgUqUnbo4i43";
//lFeyGvT4DhoTetVDQ78DFGMcy8EqkXeJjx7rptacNCH

//curl -X POST https://notify-api.line.me/api/notify -H 'Authorization: Bearer lFeyGvT4DhoTetVDQ78DFGMcy8EqkXeJjx7rptacNCH' -F 'message=test' -F 'imageFile=@/root/test_curl/digit.jpg'

function insert_data()
{

    let ar={
        "modem_id":"142181155786"
        ,"date_problem":"2017-09-06 16:49:04"
        ,"problem":{"1":"แอร์ไม่เย็น","2":"พัดลมเสียงดัง","3":"วิทยุไม่ติด","4":"ท่อไอเสียควันดำ","5":""}
        ,"details_fixed":{"1":"เปลี่ยนกรองแอร์","2":"เปลี่ยนพัดลม","3":"เปลี่ยนวิทยุ","4":"เปลี่ยนไส้กรอง","5":""}
        }
        
        
        var sql_insrt = squel.insert()
        .into("master_problem")
        .set("modem_id", ar.fleetid)
        .set("date_problem",ar.date_problem)
        .set("problem", JSON.stringify(ar.problem))
        .set("detials_fiexd", JSON.stringify(ar.details_fixed))
        //.set("date_fixed", ar.atenna_disconnect)
       // .set("editor", ar.hard_acceleration)
        .toString();
        
         ipm.db.dbname = db_config;
         db.excute(ipm, sql_insrt, function (is_ok) {
             debugger;
             if (is_ok == 'oK') {
                 res.json({ success: true, message: 'Complete add config_notify.' });
             }
             else {
                 ar.message = is_ok.message;
                 add_error_message(ar, function (res_add) {
                     debugger;
                     res.json({ success: false, message: 'Not Complete add config_notify.' });
                 });
             }
         });


}


function get_model_km(table_model,max_length,callback)
{
    var sql="";var sql2=''
    for(var i=1;i<=max_length;i++)
    {
        if(i>1){
            sql+=" ,split_part(REPLACE(REPLACE(get_index6('y"+i+"','"+table_model+"','0'),'Km',''),'เดือน',''),'/',1) as h"+i+" ";
            sql2+=" ,split_part(REPLACE(REPLACE(get_index6('y"+i+"','"+table_model+"','0'),'Km',''),'เดือน',''),'/',2) as h"+i+" ";
        }else{
            sql+=" split_part(REPLACE(REPLACE(get_index6('y"+i+"','"+table_model+"','0'),'Km',''),'เดือน',''),'/',1) as h"+i+" ";
            sql2+=" split_part(REPLACE(REPLACE(get_index6('y"+i+"','"+table_model+"','0'),'Km',''),'เดือน',''),'/',2) as h"+i+" ";
        }
        
    }

    sql = "SELECT "+utl.iRmend(sql);
    sql2 = "SELECT "+utl.iRmend(sql2);

    var xsql=sql+' UNION ALL '+sql2;

  ipm.db.dbname = db_owner;
  db.get_rows(ipm, xsql, function (rows) {
      if (rows.length > 0) 
      {
       // console.log(rows);
       callback(rows);
       return;
      }
      else {
        callback([]);
        return;
      }
  });

}



//{hr:0 ,km:5000,idy:1,month:3}

//'{"tables":"pat900","max_length":"8","type_hour_km":"km"}'

function get_processid_realtime(modem_id,callback)
{
    var sql= " SELECT coalesce(hour_or_km_lastcheck,'1') as hour_or_km_lastcheck FROM realtime WHERE modem_id='"+modem_id+"' ";
    ipm.db.dbname = db_config
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) 
        {
            callback(rows);
            return;
        }
    });

}

//{"tables":"pat900","max_length":"8","type_hour_km":"km","date_send_vehicle":"2019-03-08 13:57:23"}
function get_master_type(modem_id,callback)
{
    var sql= " SELECT master_type FROM  master_config_vehicle WHERE modem_id='"+modem_id+"' ";
    ipm.db.dbname = db_config
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            callback(rows);
            return;
        }
        else
        {
            callback([]);
            return;
        }
    })
}

//++++++++++ Set Vehicle for use this System ++++++++

function set_master_type(modem_id)
{
    get_master_type(modem_id,function(rows)
    {

        if (rows.length > 0) 
        {
           var ar = rows[0].master_type;
           
           get_model_km( ar.tables,ar.max_length,function(xres)
           { 
               if(ar.type_hour_km=='km')
               {
                   get_processid_realtime(modem_id,function(xreal)
                   {
                         if(xreal[0].hour_or_km_lastcheck=='1') //ยังไม่มี การเซ็ต hour_or_km_lastcheck ใน realtime
                         {
                             var x1 ={"hr":0 
                             ,"km":utl.Trim(xres[0].h1)
                             ,"idy":1
                             ,"month":utl.Trim(xres[1].h1)
                             ,"date_send_vehicle" : ar.date_send_vehicle
                            }
                             
                             var sql ="UPDATE realtime SET hour_or_km_lastcheck='"+JSON.stringify(x1)+"' WHERE modem_id="+utl.sqote(modem_id);
                             excute_master_config(sql,function(res_excute)
                             {
                                 console.log(res_excute);
                             })
                         }
                         else
                         {
                            var next_index = xreal[0].hour_or_km_lastcheck.idy+1;
 
                            if( next_index <= ar.max_length)
                            {
                                var column_data = 'h'+next_index;
                                var val_km = xres[0][column_data];
                                var val_month = xres[1][column_data];
 
                                 var x1 ={"hr":0 
                                 ,"km":utl.Trim(val_km)
                                 ,"idy":next_index
                                 ,"month":utl.Trim(val_month)
                                 ,"date_send_vehicle" : ar.date_send_vehicle
                                }
 
                                var sql ="UPDATE realtime SET hour_or_km_lastcheck='"+JSON.stringify(x1)+"' WHERE modem_id="+utl.sqote(modem_id);
                                excute_master_config(sql,function(res_excute)
                                {
                                    console.log(res_excute);
                                })
 
                            }
                            else
                            {
                             console.log('this vehicle is over warantee '+modem_id);
                            }
 
                         }
                   });
               //  xres[1].h1
                // {hr:0 ,km:5000,idy:1,month:3}
               }
            // console.log(xres);
           })
           
          // console.log(rows[0].master_type);
        }
        else 
        {
            //res.send(message_json);
        }
    })
      
}


//++++++++++++ check mantanace every 08:00 for send LINE +++++++

function check_realtime_maintanace(modem_id)
{
    var sql= "";
    sql+="  WITH xres as( ";
    sql+="  WITH res as (SELECT (hour_or_km_lastcheck::json ->>'km')::int as km,(hour_or_km_lastcheck::json ->>'hr')::int as hr,mileage ";
    sql+=" ,DATE_PART('day',now()-(hour_or_km_lastcheck::json ->>'date_send_vehicle')::timestamp )as date_use_vehicle ";
    sql+=" ,(hour_or_km_lastcheck::json ->>'month')::int * 30 as day_warantee ";
    sql+=" ,(hour_or_km_lastcheck::json ->>'idy')::int as m_index ";
    sql+="  FROM realtime WHERE modem_id='"+modem_id+"') ";
    sql+=" SELECT km,hr,mileage,day_warantee,date_use_vehicle,m_index ";
    sql+=" ,CASE WHEN km > hr THEN km ELSE hr END as maintanace_point ";
    sql+=" ,CASE WHEN date_use_vehicle > day_warantee THEN 'send_alert' ELSE 'normal' END as is_maintanace_month  FROM res ) ";
    sql+=" SELECT mileage as mile_now ";
    sql+=" ,maintanace_point ";
    sql+=" ,day_warantee ";
    sql+=" ,date_use_vehicle,is_maintanace_month,m_index ";
   // sql+=" ,maintanace_point-mileage as man_mile_now ";
   // sql+=" ,fn_colour_master_km(maintanace_point,mileage::int) as status_alert";
   sql+=" ,maintanace_point-4500 as man_mile_now ";
   sql+=" ,fn_colour_master_km(maintanace_point,4500) as status_alert";
    sql+=" FROM xres ";

    ipm.db.dbname = db_config
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) 
        {
            rows = rows[0];
           // console.log(rows)
            if(rows.status_alert <=5 || rows.send_alert=='send_alert')
            {
                prepare_msg_line( modem_id, rows);
               // console.log(rows.status_alert)
            }
        }
    });
        
}

function prepare_msg_line(modem_id,rt)
{
    /* */
    var msg=""
     msg+= '\n'+"รถทะเบียน "+modem_id+'\n'
     if(rt.man_mile_now >0)
     {
        msg+= "เลขไมล์ปัจจุบัน "+rt.mile_now+" km เหลืออีก "+rt.man_mile_now +" km ถึงรอบเช็คระยะ "+rt.maintanace_point +" km "+'\n';
     }
     else
     {
        msg+= "เลขไมล์ปัจจุบัน "+rt.mile_now+" km เกิน "+Math.abs(rt.man_mile_now) +" km เกินรอบเช็คระยะ "+rt.maintanace_point +" km "+'\n';
     }
 
     msg+= "รายการที่เช็ค / ราคา (บาท) "+'\n'
   

   get_master_type(modem_id,function(rows)
   {
       var ar = rows[0].master_type;
       var sum_price=0;
       var i=1;
       
       var column ='"y'+rt.m_index+'"';
       var sql = "SELECT id,items,saleprice  FROM "+ar.tables+" WHERE "+column+"='P' ORDER BY id::int";
      
       ipm.db.dbname = db_owner
       db.get_rows(ipm, sql, function (rows) 
       {
           if (rows.length > 0) 
           {

            async.eachSeries(rows, function (row, next)
            {
                msg+= i+"."+ utl.Trim( row.items)+" / "+ utl.Trim( row.saleprice)+'\n';

                sum_price += parseInt( row.saleprice);
                i++;

                next();
            },function(){
                msg+= "รวมค่าใช้จ่าย "+sum_price+" บาท";
                curl_send_line(token,msg,function(is_ok)
                {
                    console.log(is_ok);
                })
            });

           }
       });
   });

}

function curl_send_line(token,msg,callback)
{
   // -F 'imageFile=@/PATH/TO/IMAGE/cony.jpg'
 // curl -X POST https://notify-api.line.me/api/notify -H 'Authorization: Bearer ZlyfamuXdnyAhDuxBTMPq2SwlnpUcqKXlbIOesDY7IE' -F 'message=test' -F 'imageFile=@/root/test_curl/digit.jpg'
 //var command = "curl -X POST https://notify-api.line.me/api/notify -H 'Authorization:Bearer "+token+"' -F 'message='"+msg+"' "
 var imagepath ="/root/image_schoolbus/1.jpg";
 var command = "curl -X POST https://notify-api.line.me/api/notify -H 'Authorization: Bearer "+token+"' -F 'message="+msg+"' -F 'imageFile=@'"+imagepath+""
   child =exec(command, function (error,stdout,stderr) 
    {
        if(error !=null)
        {
            console.log(error);
        }
        callback(stdout);
        return;
       // console.log(stdout);
      
    });

}


function excute_master_config(sql,callback)
{
    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
           var json=({ success: true, message: 'Complete.' });
           callback(json);
           return;
        } else {
           var json=({ success: false, message: 'Not Complete.' });
           callback(json);
           return;
        }
    });
}


//++++++++++++++++++ Update Mantanace +++++++++++++++++++++
function update_mantanace_range(modem_id,mantanace_range)
{
    var next_index=1;
    get_master_type(modem_id,function(rows)
    {

        if (rows.length > 0) 
        {
           var ar = rows[0].master_type;
           
           get_model_km( ar.tables,ar.max_length,function(row)
           { 
                //async.forEach(xres, function (row, cb)
                // h1   h2      h3      h4      h5      h6      h7      h8
               // 5000 	10000 	15000 	20000 	25000 	30000 	35000	40000
               // 3	    6	    9	    12	    15 	    18 	    21 	    24 

                for (var i=1; i <= ar.max_length; i++) 
                {
                 //  console.log( row);
                    var column_data = 'h'+i;
                    var val_km = utl.Trim(row[0][column_data]);

                    if(val_km==mantanace_range)
                    {
                        var result = i == ar.max_length ? i : i+1;
                        finish(row,result);
                    }


                }
           });

           function finish(row,next_index)
           {

             //   console.log(next_index);
                var column_data = 'h'+next_index;
                var val_km = row[0][column_data];
                var val_month = row[1][column_data];

                 var x1 ={"hr":0 
                 ,"km":utl.Trim(val_km)
                 ,"idy":next_index
                 ,"month":utl.Trim(val_month)
                 ,"date_send_vehicle" : ar.date_send_vehicle
                }

                var sql ="UPDATE realtime SET hour_or_km_lastcheck='"+JSON.stringify(x1)+"' WHERE modem_id="+utl.sqote(modem_id);
                excute_master_config(sql,function(res_excute)
                {
                    console.log(res_excute);
                })
           }
        }
    });
}

//SELECT id,items,saleprice  FROM pat900 WHERE "y1"='P' ORDER BY id::int


//get_model_km('pat900',8)
//get_model_month('pat900',8)
//set_master_type('142181155786');
check_realtime_maintanace('142181155786'); //prepare_msg_line('142181155786',1);

//update_mantanace_range('142181155786','25000');//เลขกล่อง รอบที่ทำการเช็คระยะ