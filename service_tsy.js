
var squel = require("squel");


var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_user ='thaisengyont';
var db_vehicle ='db_10014';
var db_config = "master_config";

function set_action_tsy(req, res)
{
    var id =   req.body.id; //'1110014001'; //
    var key = req.body.key; // 'stop';//
    var result ={'success':false,'details':''}


    //start stop quagmire stump

    switch(key)
    {
        case 'start' : {

           var start_time = utcp.now();//'2018-04-27 16:26:00';// 
           //2018-04-27 16:26

            var sql = " INSERT INTO cal_area (modem_id,start_time) VALUES (" + utl.sqote(id)+','+utl.sqote(start_time)+')'
            excute(sql,function(xres)
            {
               // res.send(xres);
               result.success =true;
               res.send(result);
               
            });

        }break;

        case 'stop' :{
            var stop_time = utcp.now().substring(0,16);//'2018-05-09 18:15'//

           // console.log(stop_time)

            var sql = "SELECT id FROM cal_area WHERE stop_time IS NULL AND modem_id="+utl.sqote(id)+" LIMIT 1";
            var xid =0;
            get_rows(sql,db_user,function(rows)
            {
                if(rows !=null)
                {
                   xid =  rows[0].id; //'16';
                   var sql = " UPDATE cal_area SET stop_time="+utl.sqote(stop_time)+" WHERE id="+utl.sqote(xid);
                    excute(sql,function(xres)
                    {
                        setTimeout(function(){ 
                            
                            if(xres=='oK')
                            {
                                var sql = "  SELECT  idate(start_time) as start_time ";
                               sql += " ,idate(stop_time) as stop_time ";
                               sql += " ,fn_min_to_hrs(DateDiff('mi',start_time,stop_time)) as total_time ";
                               sql += " ,COALESCE(xarea,'0') as area ";
                               sql += " FROM cal_area WHERE id="+utl.sqote(xid);
    
                               get_rows(sql,db_user,function(xrow)
                               {
                                    if(xrow.length>0)
                                    {
                                        result.success =true;
                                        result.details = xrow[0];
                                        res.send(result);
                                    }
                                    else
                                    {
                                        result.success =false;
                                        res.send(result);
                                    }
                                 
                               })
    
                            }
                            else
                            {
                                result.success =false;
                                res.send(result);
                            }

                         }, 3000);
                       
                    })
                }
            })

          //  
          
        } break;

        case 'quagmire' : {
           // event_status
           get_realtime(id,function(row)
           {
                if(row.length>0)
                {
                //  var dt =  row[0].gps_datetime;
                  set_event_status(row[0],key,function(xres)
                  {
                    result.success =true;
                    result.details = row[0];
                    res.send(result);
                  });
                }
                else
                {
                    result.success =false;
                    result.details='no realtime modem_id '+id+' '+key
                    res.send(result);
                }
           });

        }break;
        case 'stump' : {
            get_realtime(id,function(row)
            {
                 if(row.length>0)
                 {
                 //  var dt =  row[0].gps_datetime;
                   set_event_status(row[0],key,function(xres)
                   {
                     result.success =true;
                     result.details = row[0];
                     res.send(result);
                   });
                 }
                 else
                 {
                     result.success =false;
                     result.details='no realtime modem_id '+id+' '+key
                     res.send(result);
                 }
            });
        }break;
        case 'list' : {
            get_quagmire_stump(function(row)
            {
                 if(row.length>0)
                 {
                 //  var dt =  row[0].gps_datetime;
                   
                     result.success =true;
                     result.details = row;
                     res.send(result);
                   
                 }
                 
            });
        }break;
    }

   

}

function get_realtime(modem_id,callback)
{
    var sql="SELECT modem_id,idate(gps_datetime) as gps_datetime,lon,lat,speed,direction,altitude "
    sql += ",satelites,tambol,amphur,province "
    sql += ",etambol,eamphur,eprovince "
    sql += " FROM realtime WHERE modem_id="+utl.sqote(modem_id);

    get_rows(sql,db_vehicle,function(rows)
    {
        if(rows !=null)
        {
            callback(rows);
            return;
        }else{
            callback(null);
            return;
        }
          
    })

}

function get_quagmire_stump(callback)
{
   // var sql="SELECT modem_id,idate(gps_datetime) as gps_datetime,lon,lat,speed,direction,altitude "
  //  sql += ",satelites,tambol,amphur,province "
   var sql = "SELECT * FROM event_status"
   // sql += " FROM realtime WHERE modem_id="+utl.sqote(modem_id);

    get_rows(sql,db_user,function(rows)
    {
        if(rows !=null)
        {
            callback(rows);
            return;
        }else{
            callback(null);
            return;
        }
          
    })
}

function set_event_status(data,event_name,callback)
{
    
    var sql = squel.insert()
    .into('event_status')
    .set('modem_id', data.modem_id)
    .set('gps_datetime', data.gps_datetime)
    .set('lon', data.lon)
    .set('lat', data.lat)
    .set('speed', data.speed)
    .set('direction', data.direction)
    .set('altitude', data.altitude)
    .set('satelites', data.satelites)
    .set('tambol', data.tambol)
    .set('etambol', data.etambol)
    .set('amphur', data.amphur)
    .set('eamphur', data.eamphur)
    .set('province', data.province)
    .set('eprovince', data.eprovince)
    .set('event_name', event_name)
    .toString();

    excute(sql,function(res)
    {
        callback(res);
        return;
    })

}

function get_rows(sql,dbname,callback)
{
    ipm.db.dbname = dbname;
    db.get_rows(ipm, sql, function (rows)
    {
       // console.log('get_geom '+rows.length);
        if (rows.length > 0)
        {
            callback(rows);
            return;
        }else{
            callback(null);
            return;
        }
    });
}

function excute(sql,callback)
{
    ipm.db.dbname = db_user;
    db.excute(ipm, sql, function (response) 
    {
        if (response == 'oK') 
        {
            //res.send('oK');
            callback(response);
            return;
        } 
        else 
        {
            callback('error '+response);
            return;
        }
    });
}


function is_master_fleet(fleet_name,callback)
{
   var sql=" SELECT coalesce(masterfleet,'0') as master_fleet FROM master_fleet WHERE fleetname="+ utl.sqote(fleet_name);
   ipm.db.dbname = db_config;
   db.get_rows(ipm, sql, function (rows) 
   {
       if (rows.length > 0) 
       {
          callback(rows[0].master_fleet);
          return;
       }
       else 
       {
        callback('0');
        return;
       }
   });
}

function tracking_realtime_tsy(object,req,res)
{
    // var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname, "vehicle_tracking": [] };
   // { db_name: 'db_10014',  fleetname: '1110014001',vehicle_tracking: [] }


    var sql='';
    sql += " SELECT DISTINCT r.modem_id ";
    sql += ",get_vehiclename_fleet(r.modem_id,r.fleet_id) as vehicle_name ,get_carlicence(r.modem_id) as car_licence";
    sql += ",idate(gps_datetime)as gps_datetime,  lon, lat, speed,get_speed_limit(r.modem_id) as speedmax, direction ";
    sql += ",altitude, satelites, message_id, input_status, output_status ";
    sql += ",r.analog_input1, r.analog_input2, mileage";
    sql += ",tambol, etambol, amphur,eamphur, province, eprovince";
    sql += ",idate(time_server_fin)as time_server, angle, r.oil_percent, r.oil_liter";
    sql += ",status,status||'_'||angle as heading,status||'_'||angle as status_angle";
    sql += ",get_model_device(r.modem_id) as model_device";
    sql += ",coalesce (driver_prefix||' '||driver_name||' '||driver_surname,'') as driver_name ";
    sql += ",coalesce(driver_id,'') as driver_id,coalesce(driver_no,'') as driver_no,coalesce(substr(driver_type, 1,2),'') as driver_type  ";
    sql += ",coalesce(CASE WHEN driver_sex='1' THEN 'ชาย' WHEN driver_sex='2' THEN 'หญิง'  END,'') as driver_sex_th  ";
    sql += ",coalesce(CASE WHEN driver_sex='1' THEN 'Male'  WHEN driver_sex='2' THEN 'Female'  END,'') as driver_sex_en ";
    sql += ",coalesce(driver_birthcard,'') as driver_birthcard,coalesce(driver_expirecard,'') as driver_expirecard";
    sql +=  ",get_has_card_reader(r.modem_id) as has_card_reader ";
  //  sql +=  ",temperature ";
   

    is_master_fleet(object.fleetname,function(is_master_fleet)
    {
        if(is_master_fleet=='1')
        {
           // sql += " WHERE r.modem_id=sv.modem_id AND sv.fleetid=" + utl.sqote(object.db_name) + "";
           // sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' ) ";
           // sql += " ORDER BY r.modem_id ASC ";

            sql += "  FROM realtime as r,master_config_vehicle as mcv,setup_vehicle as sv ";
            sql += "  WHERE	sv.fleetcode=get_fleetid(" +utl.sqote(object.fleetname)+" )";
            sql += " AND r.modem_id=sv.modem_id ";
            sql += " AND mcv.db_name=sv.fleetid AND sv.modem_id= mcv.modem_id ";
            sql += " ORDER BY r.modem_id ASC ";

            ipm.db.dbname = db_config;
            db.get_rows(ipm, sql, function (rows) {
            // console.log(rows.length);
                if (rows.length > 0) {
                    object.vehicle_tracking = rows;
                    res.send(object);
                } else {
                    var r = {"vehicle_tracking": []};
                    res.send(r);
                }
            });

        }
        else
        {
            sql += " FROM	realtime as r, setup_vehicle as sv";
            sql += " WHERE r.modem_id=sv.modem_id AND r.modem_id="+utl.sqote(object.fleetname) +" ";
            sql += " AND sv.fleetid='db_10014' ";
            sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' ) ";
            sql += " ORDER BY r.modem_id ASC ";

            ipm.db.dbname = db_config;
            db.get_rows(ipm, sql, function (rows) {
            // console.log(rows.length);
                if (rows.length > 0) {
                    object.vehicle_tracking = rows;
                    res.send(object);
                } else {
                    var r = {"vehicle_tracking": []};
                    res.send(r);
                }
            });
        }



    });

}

exports.set_action_tsy = set_action_tsy;
exports.tracking_realtime_tsy = tracking_realtime_tsy;

//set_action_tsy('','')