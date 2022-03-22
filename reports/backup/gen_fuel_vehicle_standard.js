
//#region
var mustache = require("mustache");
var timespan = require('timespan');
var async = require('async');
var moment = require('moment');
var schedule = require('node-schedule');
//var pm2 = require('pm2');


var linq = require('linq.js');
var db = require('iConnectdb_ktc.js');

var iconn = require('conn_sugar_cane.js');
var pg_htt = new db.im2(iconn.get_dbconfig_htt());
var ipm = new db.im2(iconn.get_dbconfig_realtime());

var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10003";

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db_config = "master_config";

  var res_ar = [];
  var open_rownumber = 0;
  var gps_datetime='';
  var x_index =0;
  var do_process = true;
//#endregion

    //1010001030
function minus_datetime(start,callback)
{

    var date_now= moment(moment(start+' 00:00:00').format('YYYY-MM-DD'))
      date_now = date_now.subtract(1, 'days');

     var start = date_now.format('YYYY-MM-DD') + ' 00:00'
     var stop = date_now.format('YYYY-MM-DD') + ' 23:59'
     var res={'start':start,'stop':stop};
     callback(res);
     return;
}


function driving_temp()
{
    this.start_rownum='';
    this.end_rownum='';
    this.start_service = '';
    this.end_service = '';
    this.fuel_percentage_change ='';
}


function HOUR(min) {
    var ts = timespan.fromMinutes(min);
    //  console.log(ts);
    var result = 0;
    utl.is_undefined(ts, function (is_true) {
        if (is_true) {
            result = 0;
        } else {
            result =ts.days + ' days '+ ts.hours + ' hr' + ts.minutes+' mi';
        }
    })

    return result;
}

function find_fuel_before_change(data, callback)
{
   // debugger;
     var x_res = linq.Enumerable.From(data)
     .Where(function (x) { return parseInt(x.input_status) == 0 })
     .Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
     .ToArray();

     callback(x_res);
    return;
}

function find_open_service(data, x_index, callback) 
{   
    var json_result={'gps_datetime':'','rownum':'','oil_percent_beforechange':''};
    

//find id < 0 
  var x_id = null;
     x_id = linq.Enumerable.From(data)
    .Where(function (x) { return parseFloat(x.fuel_percentage) <= 0 })
    .Where(function (x) { return parseInt(x.rownum) > x_index })
    .FirstOrDefault();

    if(x_id !==undefined)
   {
            var x_res = null;
        x_res = linq.Enumerable.From(data)
        .Where(function (x) { return x.input_status > 0})
        .Where(function (x) { return parseFloat(x.fuel_percentage) > 0 })
        .Where(function (x) { return parseInt(x.rownum) <=  parseInt(x_id.rownum) })
        .OrderByDescending("$.gps_datetime")
        .FirstOrDefault();

        if(x_res !==undefined)
        {
            var row_num = parseInt(x_res.rownum);
        //  var row_num_minus1 = row_num -1;
        //  debugger;

            json_result.oil_percent_beforechange = linq.Enumerable.From(data)
            .Where(function (x) { return parseInt(x.rownum) == row_num })
            .Select(function (x) { return parseFloat(x.fuel_percentage) })
            .FirstOrDefault();

            json_result.gps_datetime = x_id.gps_datetime; //x_res.gps_datetime;
            json_result.rownum = row_num ;

            callback(json_result);
            return;
        }
        else if(x_id.rownum =='1' || x_id.rownum =='2')
        {
                        var x_res = null;
                    x_res = linq.Enumerable.From(data)
                    .Where(function (x) { return x.input_status > 0})
                    .Where(function (x) { return parseFloat(x.fuel_percentage) > 0 })
                    .FirstOrDefault();

                    if(x_res !==undefined)
                    {
                        var row_num = parseInt(x_res.rownum);
                        json_result.gps_datetime = x_id.gps_datetime; //x_res.gps_datetime;
                        json_result.rownum = row_num ;

                        callback(json_result);
                        return;
                    }
                    else
                    {
                        json_result.row_num ='stop'
                        callback(json_result);
                        return;
                    }
                

            }  
            else
            {
                        json_result.row_num ='stop'
                        callback(json_result);
                        return;
           }
            
        
    }
    else
    {
         json_result.row_num ='stop'
         callback(json_result);
         return;
    }


}

function find_close_service(data,  gps_datetime,row_endservice,res_end_working, callback) 
{
    var row_num = null
     row_num = linq.Enumerable.From(data)
    .Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
    .Where(function (x) { return x.gps_datetime >= gps_datetime })
    .Where(function (x) { return parseInt(x.status) == 3 })
    .Select(function (x) { return parseInt(x.rownum) })
    .FirstOrDefault();

 //case of cutting loading = 5 at end of days
  if(row_num >= res_end_working.id_start   && row_num <= res_end_working.id_end )
  {
       //  debugger
 
        var xres = linq.Enumerable.From(data)
        .Where(function (x) { return parseInt(x.rownum) == row_num  })
        .ToArray();

        xres[0].rownum = row_endservice;
        callback(xres[0]);
       return;
         
  }
  else
  {
    if(row_num !=null)
    {
      //  row_num = row_num-1;
      // debugger;
       var xres = linq.Enumerable.From(data)
        .Where(function (x) { return parseInt(x.rownum) == row_num  })
        .ToArray();

        callback(xres[0]);
       return;
    }
    else
    {
      //  debugger;
         var xres=linq.Enumerable.From(data)
        .Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
        .Where(function (x) { return x.gps_datetime >= gps_datetime })
        .FirstOrDefault();

        if(xres !==undefined)
        {
            xres.rownum = row_endservice;
            callback(xres);
           return;
        } 
        else
        {
            var xres=linq.Enumerable.From(data)
            //.Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
            .Where(function (x) { return x.gps_datetime >= gps_datetime })
            .OrderByDescending("$.gps_datetime")
            .FirstOrDefault();

            xres.rownum = row_endservice;
            callback(xres);
            return;
        }

    }
  }  


}

//หาจุดสุดท้ายของข้อมูลที่ค่าเป็นศูนย์ 
function find_end_service(data, callback)
{
    var x_end_rownum = linq.Enumerable.From(data)
    .Where(function (x) { return parseFloat(x.fuel_percentage) < 0 })
    .Select(function (x) { return parseInt(x.rownum) })
    .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

   // debugger;
     
     callback(x_end_rownum);
     return;
    
}

function update_fuel_zero(tb_name,oil_percent,x_time_min,x_time_max,callback)
{
//  debugger;
    if(oil_percent !='')
    {
    var sql ="UPDATE "+tb_name+" SET oil_percent="+utl.sqote(oil_percent)+" WHERE gps_datetime >="+utl.sqote(x_time_min)+' AND gps_datetime <='+utl.sqote(x_time_max);
    ocsb_excute(sql,db_owner,function(res_ex1)
    {
       // console.log(res_ex1)
    
        callback(res_ex1)
        return;
    });
    }
    else
    {
        callback(true)
        return;
    }
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

 

function fill_fuel_before_change(data,tb_name,next_id,rownum_next,oil_percent, callback)
{
  //  debugger;
    var x_fuel_percentage = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.rownum) == next_id})
    .Where(function (x) { return parseFloat(x.fuel_percentage) <= 0 })
    .Select(function (x) { return x.fuel_percentage })
    .FirstOrDefault();


    var x_time_min = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.rownum) >= next_id})
    .Where(function (x) { return parseFloat(x.fuel_percentage) == x_fuel_percentage })
    .Select(function (x) { return x.gps_datetime  })
    .Min();

     var x_time_max = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.rownum) >= next_id})
    .Where(function (x) { return parseInt(x.rownum) <= rownum_next})
    .Where(function (x) { return parseFloat(x.fuel_percentage) == x_fuel_percentage })
    .Select(function (x) { return x.gps_datetime })
    .Max();

     debugger;

    update_fuel_zero(tb_name,oil_percent,x_time_min,x_time_max,function(xres)
    {
         callback(xres)
         return;
    })


  
}

 

function update_oil_first_start(modem_id,start,stop,fuelempty,fuelfull,callback)
{
 /**/
 debugger
//var sql="UPDATE ht_"+modem_id+" SET oil_percent =round (((analog_input1::DECIMAL - "+fuelempty+")*100 / "+fuelfull+" -"+fuelempty+"),2)::FLOAT ";
var sql="UPDATE ht_"+modem_id+" SET oil_percent =100-(round (((analog_input1::DECIMAL - "+fuelempty+")*100 / "+fuelfull+" -"+fuelempty+"),2)::FLOAT) ";
sql +=" WHERE gps_datetime >="+utl.sqote(start) //'2016-12-21 00:00:00'
sql +=" AND gps_datetime <="+utl.sqote(stop) //'2016-12-21 23:59:00'

 ocsb_excute(sql,db_owner,function(res_ex1)
     {
         callback(res_ex1)
         return;
     });

}

function is_first_record_fuel_zero(data,tb_name,callback)
{
      var is_first_zero = linq.Enumerable.From(data)
     .Where(function (x) { return parseFloat(x.fuel_percentage) < '0'})
     .Where(function (x) { return parseInt(x.rownum) == 1 })
     .FirstOrDefault();


     if(is_first_zero !==undefined)
     {
        var row_end = null
        row_end = linq.Enumerable.From(data)
        .Where(function (x) { return parseFloat(x.fuel_percentage) >= 0 })
        .Where(function (x) { return parseInt(x.status) == 3 })
        .FirstOrDefault();


        if(row_end !==undefined)
        {
            var start_time =  is_first_zero.gps_datetime;
            var end_time   =  row_end.gps_datetime;
            var fuel_percentage =    row_end.fuel_percentage;

            debugger;

            update_fuel_zero(tb_name,fuel_percentage,start_time,end_time,function(xupdate)
            {
                 callback(true);
                 return;
            })
        }
        else{
            callback(true);
            return;
        }

     }
     else
     {
         callback(true);
         return;
     }

}

function is_end_record_working(data,callback)
{
   // debugger
      var x_working_end = linq.Enumerable.From(data)
   // .Where(function (x) { return parseInt(x.input_status) == 5 })
    .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

   var x_working_start = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.input_status) != 5 })
    .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();

  
     var id_start = parseInt(x_working_start.rownum);
     var id_end = parseInt(x_working_end.rownum);

    id_start =  id_start !==NaN ? id_start : id_end;

    var res ={"id_start":id_start ,"id_end":id_end };
    callback(res);
    return;

}

function get_fuel_full_and_empty(modem_id,callback)
{
   var sql= "SELECT fuelempty,fuelfull FROM master_config_vehicle WHERE modem_id="+utl.sqote(modem_id);
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
       // debugger    
        if (rows.length > 0) 
        { 
           // rows[0].fuelempty 
           // rows[0].fuelfull;
           callback(rows);
           return;
        }
    });
}

function temp_oil_zero()
{
    this.start_service = '';
    this.end_service = '';
    this.fuel_percentage ='';
    this.end_rownum ='';
    this.is_dojob =true;
    this.tb_name ='';
}

function get_avg_oil_zero(data_filter)
{
      var xx = linq.Enumerable.From(data_filter)
     .Select(function (x) { return parseFloat(x.fuel_percentage)  })
     .Average();

     return xx.toFixed(2);
}

function get_start_service_fill_oil_zero(data,first_rownum,_fuel_percentage)
{
     var result = linq.Enumerable.From(data)
    .Where(function (x) { return parseInt(x.rownum) == first_rownum })
    .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : _fuel_percentage }   })
    .OrderByDescending("$.gps_datetime")
    .FirstOrDefault();
    return result;
}

function get_oil_zero(data,first_rownum,first_gpsdate,tb_name,xres_temp)
{
    try{

    
       var temp = new temp_oil_zero();
        var first='';
        if(first_gpsdate==null)
        {
        
            first = linq.Enumerable.From(data)
            .Where(function (x) { return parseInt(x.rownum) < first_rownum })
            .Where(function (x) { return parseInt(x.status) == '3'})
            .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
            .OrderByDescending("$.gps_datetime")
        // .Skip(xfirst_rownum)
            .Take(10)
            .ToArray();

            if(first.length==0)
            {
                
                     
                    first = linq.Enumerable.From(data)
                    .Where(function (x) { return parseInt(x.status) == '3'})
                    .Where(function (x) { return parseFloat(x.fuel_percentage) < 100.0})
                    
                    .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
                // .OrderByDescending("$.gps_datetime")
                    .Take(10)
                    .ToArray();

                        if(first.length>0)
                        {
                            first_rownum = first[0].rownum;
                            var _fuel_percentage = get_avg_oil_zero(first);
                            first = get_start_service_fill_oil_zero(data,first_rownum,_fuel_percentage);
                        }
                        else
                        {
                            first = linq.Enumerable.From(data)
                            .Where(function (x) { return parseInt(x.rownum) == '1' })
                            .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
                            .FirstOrDefault();
                        }
              
             }
             else
             {
                  //sometime NaN
                 var _fuel_percentage = get_avg_oil_zero(first);
                 first = get_start_service_fill_oil_zero(data,first_rownum,_fuel_percentage);
             }

        

        }
        else
        {
            first = linq.Enumerable.From(data)
            .Where(function (x) { return parseInt(x.rownum) <= first_rownum })
            .Where(function (x) { return x.gps_datetime >= first_gpsdate })
            .Where(function (x) { return parseInt(x.status) == '3'})
            .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
            .OrderByDescending("$.gps_datetime")
            .Take(10)
            .ToArray();

            if(first.length==0)
            {
                 first = linq.Enumerable.From(data)
                .Where(function (x) { return parseInt(x.rownum) <= first_rownum })
                .Where(function (x) { return x.gps_datetime >= first_gpsdate })
                .Where(function (x) { return (parseInt(x.status) == '2')  })
                .Where(function (x) { return parseFloat(x.fuel_percentage) < 100.0})
                
                .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
                .OrderByDescending("$.gps_datetime")
                .Take(10)
                .ToArray();

                if(first.length==0)
                {
                     first = linq.Enumerable.From(data)
                  //  .Where(function (x) { return parseInt(x.rownum) <= first_rownum })
                    .Where(function (x) { return x.gps_datetime >= first_gpsdate })
                    .Where(function (x) { return (parseInt(x.status) == '2')  })
                    .Where(function (x) { return parseFloat(x.fuel_percentage) < 100.0})
                    
                    .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
                    //.OrderByDescending("$.gps_datetime")
                    .Take(10)
                    .ToArray();

                     var _fuel_percentage = get_avg_oil_zero(first);
                      if(_fuel_percentage==='NaN')
                     {
                        debugger;
                         var last_row = xres_temp.length-1 ;
                        _fuel_percentage = xres_temp[last_row].fuel_percentage;
                       // console.log(_fuel_percentage);
                     }

                     first = get_start_service_fill_oil_zero(data,first_rownum,_fuel_percentage);


                }
                else
                {
                   // 
                    //sometime NaN
                     var _fuel_percentage = get_avg_oil_zero(first);
                     if(_fuel_percentage==='NaN')
                     {
                        debugger;
                          var last_row = xres_temp.length-1 ;
                        _fuel_percentage = xres_temp[last_row].fuel_percentage;
                        //console.log(_fuel_percentage);
                     }

                   first = get_start_service_fill_oil_zero(data,first_rownum,_fuel_percentage);
                }
            }
            else
            {
                  var _fuel_percentage = get_avg_oil_zero(first);
                  if(_fuel_percentage==='NaN')
                  {
                         debugger;
                            var last_row = xres_temp.length-1 ;
                        _fuel_percentage = xres_temp[last_row].fuel_percentage;
                  }

                   first = get_start_service_fill_oil_zero(data,first_rownum,_fuel_percentage);
            }

           

        }

            if(first ===undefined)
            {
                debugger;
                temp.is_dojob = false;
                return temp;
            }
            else
            {
                var end = linq.Enumerable.From(data)
                .Where(function (x) { return parseFloat(x.status) != '1'})
                .Where(function (x) { return parseInt(x.rownum) > first.rownum })
            
                .Select(function (x) { return { "rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
                .FirstOrDefault();
    
                if(end !==undefined)
                {
                    temp.start_service = first.gps_datetime;
                    temp.fuel_percentage = first.fuel_percentage;
                    temp.end_service = end.gps_datetime;
                    temp.end_rownum = end.rownum;
                    temp.tb_name = tb_name;
                    return temp;
                }
                else
                {
                    //หาหมดแล้ว หยุดหา
                    temp.start_service = first.gps_datetime;
                    temp.fuel_percentage = first.fuel_percentage;
                    temp.end_service =  data[data.length-1].gps_datetime;
                    temp.is_dojob = false;
                    temp.tb_name = tb_name;
                    return temp;
                }
            }
          

    }catch(e){
        debugger;
        console.log('err = '+e);
    }


}

function is_first_record_is_over_high(tb_name,data)
{
  // debugger;
   var first_fuel = data[0].fuel_percentage;
   var start_service = data[0].gps_datetime;
   var end_service = data[0].gps_datetime;

   var first = linq.Enumerable.From(data)
            .Where(function (x) { return parseInt(x.rownum) > 1 })
            .Select(function (x) { return { "fuel_percentage" : parseFloat(x.fuel_percentage) }   })
            .Take(10)
            .ToArray();

  var _fuel_percentage = get_avg_oil_zero(first);

  if(first_fuel> _fuel_percentage)
  {
     update_fuel_zero(tb_name,_fuel_percentage,start_service,end_service,function(xx)
      {   
          console.log('fin asc');
       },function(){
           console.log('fin asc');
       });
  }

}

function filter_status2_over_100(tb_name,data)
{
       var records = linq.Enumerable.From(data)
        .Where(function (x) { return parseFloat(x.status) == '2'})
        .Where(function (x) { return parseFloat(x.fuel_percentage) > 100.0})
        .Select(function (x) { return { "rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime }   })
        .ToArray();

    async.eachSeries(records, function (row, next)
    {
       var xfirst = linq.Enumerable.From(data)
            .Where(function (x) { return parseInt(x.rownum) > row.rownum })
            .Where(function (x) { return parseFloat(x.fuel_percentage) < 100.0})
            .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
            .Take(10)
            .ToArray();

            

            if(xfirst.length>0)
            {
               var start_service =  row.gps_datetime;
               var end_service = row.gps_datetime;
                var _fuel_percentage = get_avg_oil_zero(xfirst);

                // debugger;
                update_fuel_zero(tb_name,_fuel_percentage,start_service,end_service,function(xx)
                {   
                    next();
                });
            }else{
                 next();
            }

    },function()
    {
           console.log('xxx');
    });


}

function get_avg_oil(tb_name,data,callback)
{
     var xx = linq.Enumerable.From(data)
     .Select(function (x) { return parseFloat(x.fuel_percentage)  })
     .Average();

     return xx.toFixed(2);
}

function filter_oil_zero(tb_name,data,callback)
{
    try{
      debugger;
      //เช็คเรคคอร์ดแรก ถ้ากระโดดให้กรองให้เรียบ
      is_first_record_is_over_high(tb_name,data);


   //   filter_status2_over_100(tb_name,data);

        //กรองเอาเฉพาะที่สถานะ 1 
      var all_rec = linq.Enumerable.From(data)
     .Where(function (x) { return (x.status == '1' || x.status == '2') })
     // .Where(function (x) { return parseInt(x.status) == 2})
       .Where(function (x) { return parseFloat(x.fuel_percentage) >= 100.0})

     .Select(function (x) { return { "rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime,"fuel_percentage" : parseFloat(x.fuel_percentage) }   })
     .OrderBy(x => parseInt(x.rownum))
     .ToArray();

     var xres_temp =[];

     if(all_rec.length==0){
        console.log('fin filter_oil_zero');
        callback(true);
        return;
     }else{
          //หาตำแหน่งเริ่ม สิ้นสุดที่เป็น 1
     for(var i=0;i <= all_rec.length;i++)
     {
          if(i==0)
          {
        
             var first_rownum = all_rec[i].rownum;
             first_rownum = first_rownum -1;
             xres_temp.push( get_oil_zero(data,first_rownum,null,tb_name,xres_temp));

          }
          else
          {
           // debugger
                var last_row= xres_temp.length-1 ;

                var first_rownum = xres_temp[last_row].end_rownum;
                var first_gpsdate = xres_temp[last_row].end_service;

                var xfirst_rownum = linq.Enumerable.From(all_rec)
                .Where(function (x) { return parseInt(x.rownum) > first_rownum })
                .Select(function (x) { return  parseInt(x.rownum)-1   })
                .FirstOrDefault();

              //  console.log('dd '+xfirst_rownum);

                if(xfirst_rownum !==undefined)
                {
                      xres_temp.push( get_oil_zero(data,xfirst_rownum,first_gpsdate,tb_name,xres_temp));
                      last_row = xres_temp.length-1;

                    if(xres_temp[last_row].is_dojob==false)
                    {
                            i = all_rec.length;
                        
                            if(xres_temp.length>0)
                            {
                                debugger;
                                async.eachSeries(xres_temp, function (row, next)
                                {
                                   // console.log( row.tb_name+' '+ row.start_service+' '+row.end_service+' '+row.fuel_percentage);
                                    
                                    update_fuel_zero(row.tb_name,row.fuel_percentage,row.start_service,row.end_service,function(xx)
                                    {   
                                        next();
                                    });
                                },function(){
                                    debugger;
                                        console.log('fin asc');
                                        callback(true);
                                        return;
                                });
                            }
                            else
                            {
                                callback(false);
                                return;
                            }
                    }

             }
             else
             {
                 debugger;
     
                     console.log('fin filter_oil_zero');
                     callback(true);
                     return;
             }

       

          }
            
     }
     }
   
  }catch(e)
  {
    console.log('er'+e);
  }


}

function get_data_filter_idle_over_100(db_name,tb_name,start,stop,callback)
{
    var sql = "";
    sql += " ";   
    sql += " SELECT DISTINCT row_number() over (order by gps_datetime) as rownum ,idate(gps_datetime) as gps_datetime ";
    sql += ",oil_percent,status "
    sql += " FROM " + tb_name;
    sql += " WHERE  gps_datetime >= " + utl.sqote(start);
    sql += " AND gps_datetime <=" + utl.sqote(stop);
    sql += " ORDER BY gps_datetime ";


      ipm.db.dbname = db_name;//db_owner;
    db.get_rows(ipm, sql, function (data) 
    {
           var records = linq.Enumerable.From(data)
        .Where(function (x) { return x.status == '2'})
        .Where(function (x) { return parseFloat(x.oil_percent) > 100.0})
        .Select(function (x) { return { "rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime }   })
        .ToArray();

        debugger;

        if(records.length >0)
        {
            async.eachSeries(records, function (row, next)
            {
                var xid = (row.rownum-10);
                       var xfirst = linq.Enumerable.From(data)
                       .Where(function (x) { return parseInt(x.rownum) > xid })
                       .Where(function (x) { return parseInt(x.rownum) < row.rownum })
                       .Where(function (x) { return parseFloat(x.oil_percent) < 100.0})
                       .Select(function (x) { return { "status":parseInt(x.status),"rownum":parseInt(x.rownum),'gps_datetime': x.gps_datetime ,"fuel_percentage" : parseFloat(x.oil_percent) }   })
                       .Take(10)
                       .ToArray();
   
                          if(xfirst.length>0)
                         {
                           var start_service =  row.gps_datetime;
                           var end_service = row.gps_datetime;
                           var _fuel_percentage = get_avg_oil_zero(xfirst);
   
                               // debugger;
                               update_fuel_zero(tb_name,_fuel_percentage,start_service,end_service,function(xx)
                               {   
                                   next();
                               });
                           }else{
                               next();
                           }
   
               },function(){
                    debugger;
                     //  console.log('ssss');
                       callback(true);
                       return;
               });
        }else{
            debugger;
            //  console.log('ssss');
              callback(true);
              return;
        }

      
    });


}

function get_avg_oil_db(db_name,tb_name,start,stop,callback)
{
   var sql =" SELECT AVG(oil_percent) FROM " + tb_name+" WHERE  gps_datetime >= " + utl.sqote(start)+" AND gps_datetime <=" + utl.sqote(stop);
   ipm.db.dbname = db_name;//db_owner;
    db.get_rows(ipm, sql, function (rows) 
    {
        var result = rows[0].avg.toFixed(2);
        callback(result);
        return ;
  
    });

}

function update_oil_by_avg(db_name,tb_name,start,stop,avg_oil,find_oil,callback)
{
     var sql ="UPDATE "+tb_name+" SET oil_percent="+utl.sqote(avg_oil)+" WHERE gps_datetime >="+utl.sqote(start)+' AND gps_datetime <='+utl.sqote(stop)
     sql +=" AND oil_percent="+utl.sqote(find_oil);
     ocsb_excute(sql,db_name,function(res_ex1)
     {
        // console.log(res_ex1)
     
         callback(res_ex1)
         return;
     });
}

function update_oil_by_not_running(db_name,tb_name,start,stop,oil_percent,callback)
{
     var sql ="UPDATE "+tb_name+" SET oil_percent="+utl.sqote(oil_percent)+" WHERE gps_datetime >="+utl.sqote(start)+' AND gps_datetime <='+utl.sqote(stop)

     ocsb_excute(sql,db_name,function(res_ex1)
     {
         callback(res_ex1)
         return;
     });
}

function get_find_max_oil(db_name,tb_name,start,stop,avg_oil,callback)
{
   var sql =" SELECT DISTINCT oil_percent FROM " + tb_name+" WHERE  gps_datetime >= " + utl.sqote(start)+" AND gps_datetime <=" + utl.sqote(stop);
   sql +="AND oil_percent > "+utl.sqote(avg_oil);
   
   ipm.db.dbname = db_name;//db_owner;
    db.get_rows(ipm, sql, function (records) 
    {
        // callback(rows);
        // return ;
         async.eachSeries(records, function (row, next)
         {
             var find_oil = row.oil_percent;
            update_oil_by_avg(db_name,tb_name,start,stop,avg_oil,find_oil,function(x)
            {
                next();
            })
         },function(){
             console.log('+++++++++++++++ FINISH ++++++++++++');
             callback(true);
             return;
         });
  
    });

}

function is_not_running_allday(data,db_name,tb_name,start,callback)
{
  
    var row_count = linq.Enumerable.From(data)
    .Where(function (x) { return (parseInt(x.status) == 3) || (parseInt(x.status) == 2) })
    .Select(function (x) { return parseInt(x.rownum) })
    .Count();

    var ress={'isnot_run':false,'oil_percent':0}

    debugger;
   // console.log(row_count);
    if(row_count==0)
    {
       
        start = start.substring(0,10);

        minus_datetime(start,function(res)
        {
            debugger;
           // console.log(xx);
            var sql =" SELECT coalesce(oil_percent,'0.0') as oil_percent FROM "+tb_name+"  WHERE  gps_datetime >= "+utl.sqote(res.start)+" AND gps_datetime <="+utl.sqote(res.stop)+" ORDER BY gps_datetime DESC LIMIT 1";
            ipm.db.dbname = db_name;//db_owner;
            db.get_rows(ipm, sql, function (rows) 
            {
                debugger;
                if(rows==0)
                {
                    is_not_running_allday(data,db_name,tb_name,res.start,function(d)
                    {
                        callback(d);
                        return ;
                    })
                }
                else
                {
                    if(rows.length>0)
                    {
                         ress.isnot_run=true;
                         ress.oil_percent = rows[0].oil_percent;
                         callback(ress);
                         return ;
                    }
                 
                }
            });


        })

    }
    else
    {
          callback(ress);
           return ;
    }

}

function calculate_fuel(db_name,modem_id,start,stop,callback) 
{
    //#region
    /*
SELECT 
idate(gps_datetime) as gps_datetime,status,input_status
,analog_input1
,round (((analog_input1::DECIMAL -0.3000)*100 / 3.9 -0.300),2)::text  as fuel_percentage
 FROM ht_1010003020
WHERE gps_datetime >='2016-12-21 00:00:00'
AND gps_datetime <='2016-12-21 23:59:00'
ORDER BY gps_datetime ASC 
     */
    //#endregion

  // debugger;
    // Isauthenticate(req, res, function () {
   // var db_name = 'db_10003'; //req.body.fleetid; //
  //  var modem_id = '1010003016';// req.body.modemid; //
   // var start =  '2017-01-08 00:00';//req.body.start; //
   // var stop = '2017-01-08 23:59';//req.body.stop; //
    var tb_name = "ht_" + modem_id;
    var index_next = 1;

    //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
    var sql = "";
    sql += " SELECT DISTINCT row_number() over (order by gps_datetime) as rownum ";
    sql += ",idate(gps_datetime) as gps_datetime ,CASE WHEN input_status =4 THEN '5' ELSE input_status END as input_status,status";
    sql += ",tambol||':'||amphur||':'||province as tloc ";
    sql += ",etambol||':'||eamphur||':'||eprovince as eloc,oil_percent as fuel_percentage,'' as close_service";
   // sql += ",status,round (((analog_input1::DECIMAL -0.3000)*100 / 3.9 -0.300),2)::text  as fuel_percentage";
    sql += " FROM " + tb_name;
    sql += " WHERE  gps_datetime >= " + utl.sqote(start);
    sql += " AND gps_datetime <=" + utl.sqote(stop);
    sql += " ORDER BY gps_datetime ";

     var temp ='';

    ipm.db.dbname = db_name;//db_owner;
    db.get_rows(ipm, sql, function (rows) 
    {
         
        if (rows.length > 0) 
        { 

            is_end_record_working(rows,function(res_end_working)
            {

                is_first_record_fuel_zero(rows,tb_name,function(res_is_first_zero)
                {    
                    
                    find_end_service(rows,function(row_endservice)
                    {
                       // debugger;
                        //  console.log(row_endservice);

                    // for(var i=0;i<=rows.length;i++)
                        var find_start = true;

                        while(do_process)
                        {
                            
                            if(find_start)
                            {
                                temp = new driving_temp();
                                // gps_datetime = rows[i].gps_datetime;
                                find_open_service(rows,x_index,function(xres)
                                {
                                    //  debugger
                                    if(xres.row_num !='stop')
                                    {
                                         find_start = false;
                                        // i = xres.rownum;
                                        gps_datetime = xres.gps_datetime;
                                        temp.start_rownum = xres.rownum;
                                        temp.start_service = xres.gps_datetime;
                                        temp.fuel_percentage_change = xres.oil_percent_beforechange;
                                    }
                                    else
                                    {
                                         do_process = false;
                                      //  console.log(res_ar);
                                        final_update_result(tb_name,res_ar,function(final_result)
                                        {
                                            //++++++++++++++++++++++ Update Fill Oil Zero ++++++++++++++++++++++
                                             debugger;

                                             is_not_running_allday(rows,db_name,tb_name,start,function(res1)
                                             {
                                                   debugger;
                                                   if(res1.isnot_run)
                                                   {
                                                       update_oil_by_not_running(db_name,tb_name,start,stop,res1.oil_percent,function(res2)
                                                       {
                                                             callback(res2);
                                                             return;
                                                       })
                                                   }
                                                   else
                                                   {
                                                          filter_oil_zero(tb_name,rows,function(ss)
                                                          {
                                                                debugger
                                                                    get_data_filter_idle_over_100(db_name,tb_name,start,stop,function(ss)
                                                                    {
                                                                        callback(final_result);
                                                                        return;
                                                                    });

                                                         });
                                                   }
                                            
                                             })

                                             /*
                                           
                                            */

                                        })
                                    }
                                   
                                })
                            }
                            else
                            {
                                

                            find_close_service(rows,gps_datetime,row_endservice,res_end_working,function(xres)
                            {
                                // 
                                
                                if(row_endservice != xres.rownum)
                                {
                                    temp.end_rownum = xres.rownum;
                                    temp.end_service = xres.gps_datetime;

                                    temp.fuel_percentage_change =  parseFloat(xres.fuel_percentage) > temp.fuel_percentage_change ? parseFloat(xres.fuel_percentage) :temp.fuel_percentage_change;
                                    x_index = temp.end_rownum;

                                //   console.log(temp);
                                    res_ar.push(temp);
                                // i = -1;
                                find_start = true;
                                }
                                else
                                {
                                  //  debugger
                                    //finish 
                                    temp.end_rownum = xres.rownum;
                                    temp.end_service = xres.gps_datetime;
                                    x_index = temp.end_rownum;
                                    res_ar.push(temp);

                                
                                    do_process = false;
                                  //  console.log(res_ar);
                                    final_update_result(tb_name,res_ar,function(final_result)
                                    {
                                           debugger;

                                             is_not_running_allday(rows,db_name,tb_name,start,function(res1)
                                             {
                                                   debugger;
                                                   if(res1.isnot_run)
                                                   {
                                                       update_oil_by_not_running(db_name,tb_name,start,stop,res1.oil_percent,function(res2)
                                                       {
                                                             callback(res2);
                                                             return;
                                                       })
                                                   }
                                                   else
                                                   {
                                                          filter_oil_zero(tb_name,rows,function(ss)
                                                          {
                                                                debugger
                                                                    get_data_filter_idle_over_100(db_name,tb_name,start,stop,function(ss)
                                                                    {
                                                                        callback(final_result);
                                                                        return;
                                                                    });

                                                         });
                                                   }
                                            
                                             })
                                       
                                    })
                                  
                                }

                            })

                            }
                            
                        }

                    })
                });

            });
          
        }
        else 
        {
           // res.send([]);
           console.log('+++ finish no data +++')
           callback(true);
            return;
        }
    });
   
}

function final_update_result(tb_name,res_ar,callback)
{
      async.eachSeries(res_ar, function (row, next)
       {
//debugger;
            var oil_percent = (100 - row.fuel_percentage_change);
            var x_time_min = row.start_service;
            var x_time_max= row.end_service;

            //debugger;

            update_fuel_zero(tb_name,oil_percent,x_time_min,x_time_max,function(xres)
            {
              next();                      
            });

                                        
         },function()
        {
           // debugger;
            console.log('+++ finish +++')
            callback(true);
            return;
        });

}

//AND modem_id='1110014020'
//AND modem_id='1110014045' AND modem_id='1110014026'  AND db_name ='db_10014'
function get_all_vehicle_calculate_fuel(start_date)
{
    //to_char(now(), 'YYYY-MM-DD') is_fuel_invert='0' AND
  // var sql = "SELECT modem_id,harvester_name,'"+date_process+"' as date_process FROM harvester_register2";ORDER BY db_name is_calculate_fuel='1'  AND  modem_id='1010006003' AND db_name='db_10003' modem_id='1010006001' AND
   //var sql= "SELECT modem_id,db_name FROM master_config_vehicle WHERE is_calculate_fuel='1'  AND db_name !='db_10003'   ORDER BY db_name ; ";
   var sql= "SELECT modem_id,db_name FROM master_config_vehicle WHERE is_calculate_fuel='1'    ORDER BY modem_id ; ";
   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (xres_ar) 
    {
            var date_now=moment(moment(start_date+' 00:00:00').format('YYYY-MM-DD'))
            var start = date_now.format('YYYY-MM-DD') + ' 00:00'
            var stop = date_now.format('YYYY-MM-DD') + ' 23:59'
         // debugger;
             async.eachSeries(xres_ar, function (row, inext)
             {
                
                // console.log(row.modem_id,row.date_process);
             
             //   var start =  '2017-01-07 00:00';//req.body.start; //
              //  var stop = '2017-01-07 23:59';//req.body.stop; //
      
                
            // var date_now='';
            // date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
            // date_now = date_now.subtract(1, 'days');
         
            //  console.log(date_now);
            var db_name = row.db_name;
            var modem_id = row.modem_id;

            //clear global varialble
           res_ar = [];
           open_rownumber = 0;
           gps_datetime='';
           x_index =0;
           var current_row =0;
           do_process = true;
           db_owner = db_name;

            console.log('db_name '+db_name+' modemid '+modem_id+' start '+start+' stop '+stop)
          //  next();
           
            //update_oil_first_start
            /* */
                get_fuel_full_and_empty(modem_id,function(x)
                {
                    console.log(modem_id);
                    console.log(x[0].fuelempty);
                    console.log(x[0].fuelfull);

                    update_oil_first_start(modem_id,start,stop,x[0].fuelempty,x[0].fuelfull,function(xres)
                    {
                        console.log(' update_oil_first_start '+xres);
                        calculate_fuel(db_name,modem_id,start,stop,function(is_finish)
                        {
                            //debugger;
                            if(is_finish)
                            {
                             
                                current_row++;
                                if(current_row != xres_ar.length)
                                {
                                     console.log('finish '+is_finish+' '+modem_id);
                                     inext();
                                }
                                else
                                {
                                      console.log('++finish all vehicle++');
                                }
                                
                            }
                            else
                            {
                               // debugger;
                                 current_row++;
                                if(current_row != xres_ar.length)
                                {
                                     console.log('finish '+is_finish+' '+modem_id);
                                     inext();
                                }
                                else
                                {
                                      console.log('++finish all vehicle++');
                                }
                            }
                          
                        })
                    })
                
                    
                });
           

             },function(){
                  
                 console.log('finish all vehicle');
             });
            
    });

}



// setTimeout(function () {
//     get_all_vehicle_calculate_fuel();
// }, 1000);

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 00//23;
rule.minute = 30//59;

/*   
pm2.connect(function(err) 
{
    if (err) throw err;

  setTimeout(function worker() {
    console.log("Restarting app...");
    pm2.restart('gen_fuel_vehicle_standard', function() {});
     setTimeout(worker, 1000); 
  }, 60 * 60 * 1000);
     //setTimeout(worker, 60 * 60 * 1000);
});
 */
//#region
  
/*    */
schedule.scheduleJob(rule, function ()
{
    
    var date_now='';
       date_now = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
       date_now = date_now.subtract(1, 'days');

    //start_date = date_now.format('YYYY-MM-DD') + ' 00:00'
   // end_date = date_now.format('YYYY-MM-DD') + ' 23:59'

  var xdate = date_now.format('YYYY-MM-DD');

   console.log('Calculate Fuel  This runs at 00:30 every day. ');
    debugger;

    get_all_vehicle_calculate_fuel(xdate);

});

/*
//2018-10-23 error
//'2018-11-20' 2018-11-25 1110014035 ค้าง update_oil_first_start true
setTimeout(function () {
       debugger; 

    var xdate =  '2018-12-18';//req.body.start; //2018-11-17'

 
 //update_oil_first_start

    get_all_vehicle_calculate_fuel(xdate);

 }, 1000);
 */
