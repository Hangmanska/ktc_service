var request = require('request');
var mustache = require("mustache");
var timespan = require('timespan');
var squel = require("squel");
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var utl = require('Utility.js');
var linq = require('linq.js');


var db_config = "master_config";
var db_owner ='db_10036'


var status_working_flip = "('2600','2602')";
var status_working_normal = "('2400','2402')";

var status_working_flip_green_yellow = "('2600','2602','2200','2202')";
var status_working_normal_green_yellow = "('2400','2402','2600','2602')";

var status_idleling ="('2600','2602')";
var status_parking ="('2000')"

var mailer = require('send_mail.js');
var mail_sender ='saksphosri@gmail.com';
var pws_mailsender ='iBorn2B1.'



function check_case_status_getqeury(modem_id,callback)
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
             var sql=''
            if(result=='1') // VCEW1458
            {
                sql += " ,CASE   WHEN CAST(analog_input2 as int)=2400 THEN '2'  ";
                sql += " WHEN CAST(analog_input2 as int)=2401 THEN '2' ";
                sql += " WHEN CAST(analog_input2 as int)=2402 THEN '2' ";
                sql += " WHEN CAST(analog_input2 as int)=2403 THEN '2' ";
            
                sql += " WHEN CAST(analog_input2 as int)=2600 THEN '3'  ";
                sql += " WHEN CAST(analog_input2 as int)=2601 THEN '3'  ";
                sql += " WHEN CAST(analog_input2 as int)=2602 THEN '3'  ";
                sql += " WHEN CAST(analog_input2 as int)=2603 THEN '3'  ";
            
                sql += " WHEN CAST(analog_input2 as int)=2000 THEN '1'  ";
                sql += " ELSE status END as status ";
                    
               callback(sql);
                return
            }
            else
            {
       
                sql += " ,CASE   WHEN CAST(analog_input2 as int)=2400 THEN '3'  ";
                sql += " WHEN CAST(analog_input2 as int)=2401 THEN '3' ";
                sql += " WHEN CAST(analog_input2 as int)=2402 THEN '3' ";
                sql += " WHEN CAST(analog_input2 as int)=2403 THEN '3' ";
            
                sql += " WHEN CAST(analog_input2 as int)=2600 THEN '2'  ";
                sql += " WHEN CAST(analog_input2 as int)=2601 THEN '2'  ";
                sql += " WHEN CAST(analog_input2 as int)=2602 THEN '2'  ";
                sql += " WHEN CAST(analog_input2 as int)=2603 THEN '2'  ";
            
                sql += " WHEN CAST(analog_input2 as int)=2000 THEN '1'  ";
                sql += " ELSE status   END  as status ";
                callback(sql);
                return
            }
           
        }
    });
}

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

function tracking_realtime_italthai(req, res)
{ 

    /*  
    var object= { db_name: 'db_10036',
 fleetname: 'ITIGPSCENTER',
  vehicle_tracking: [] }
*/
 var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname, "vehicle_tracking": [] };

    var sql='';
    sql += "WITH res as(  SELECT DISTINCT r.modem_id ";
    sql += ",get_vehiclename_fleet(r.modem_id,r.fleet_id) as vehicle_name ,get_carlicence(r.modem_id) as car_licence";
    sql += ",idate(gps_datetime)as gps_datetime,  lon, lat, speed,get_speed_limit(r.modem_id) as speedmax, direction ";
    sql += ",altitude, satelites, message_id, input_status, output_status ";
    sql += ",r.analog_input1, r.analog_input2, mileage";
    sql += ",tambol, etambol, amphur,eamphur, province, eprovince";
    sql += ",idate(time_server_fin)as time_server, angle, r.oil_percent  ";

    sql += ",CASE  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' THEN ";

    sql += " CASE   WHEN CAST(analog_input2 as int)=2400 THEN '2'  ";
    sql += " WHEN CAST(analog_input2 as int)=2401 THEN '2' ";
    sql += " WHEN CAST(analog_input2 as int)=2402 THEN '2' ";
    sql += " WHEN CAST(analog_input2 as int)=2403 THEN '2' ";

    sql += " WHEN CAST(analog_input2 as int)=2600 THEN '3'  ";
    sql += " WHEN CAST(analog_input2 as int)=2601 THEN '3'  ";
    sql += " WHEN CAST(analog_input2 as int)=2602 THEN '3'  ";
    sql += " WHEN CAST(analog_input2 as int)=2603 THEN '3'  ";

    sql += " WHEN CAST(analog_input2 as int)=2000 THEN '1'  ";
    sql += " ELSE status END  ";

    sql += " ELSE ";

    sql += " CASE   WHEN CAST(analog_input2 as int)=2400 THEN '3'  ";
    sql += " WHEN CAST(analog_input2 as int)=2401 THEN '3' ";
    sql += " WHEN CAST(analog_input2 as int)=2402 THEN '3' ";
    sql += " WHEN CAST(analog_input2 as int)=2403 THEN '3' ";

    sql += " WHEN CAST(analog_input2 as int)=2600 THEN '2'  ";
    sql += " WHEN CAST(analog_input2 as int)=2601 THEN '2'  ";
    sql += " WHEN CAST(analog_input2 as int)=2602 THEN '2'  ";
    sql += " WHEN CAST(analog_input2 as int)=2603 THEN '2'  ";

    sql += " WHEN CAST(analog_input2 as int)=2000 THEN '1'  ";
    sql += " ELSE status END  ";
   
    sql += " END  as status ";

    sql += ",get_model_device(r.modem_id) as model_device ";
    sql += ",coalesce (driver_prefix||' '||driver_name||' '||driver_surname,'') as driver_name ";
    sql += ",coalesce(driver_id,'') as driver_id,coalesce(driver_no,'') as driver_no,coalesce(substr(driver_type, 1,2),'') as driver_type  ";
    sql += ",coalesce(CASE WHEN driver_sex='1' THEN 'ชาย' WHEN driver_sex='2' THEN 'หญิง'  END,'') as driver_sex_th  ";
    sql += ",coalesce(CASE WHEN driver_sex='1' THEN 'Male'  WHEN driver_sex='2' THEN 'Female'  END,'') as driver_sex_en ";
    sql += ",coalesce(driver_birthcard,'') as driver_birthcard,coalesce(driver_expirecard,'') as driver_expirecard";
    sql += ",get_has_card_reader(r.modem_id) as has_card_reader ";
    sql += ",coalesce(mcv.ital_is_usecase_status,'0') as ital_is_usecase_status ";
    sql += ",CAST(coalesce(mcv.calibrate_working_hour,'0') as NUMERIC) as calibrate_working_hour  ";
  
    sql += ",CAST(coalesce(mcv.iti_working_hour,'0') as NUMERIC) as working_hour "
    
    
  
    sql += ",coalesce(r.oil_liter,'100') as oil_liter ";
     /*
      sql += ",CASE  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' THEN dblink_countworking_italthai_upsidedown_status(sv.fleetid,sv.modem_id,'26')::numeric::integer ";
    sql += "  WHEN coalesce(mcv.ital_is_usecase_status,'0')='0' THEN dblink_countworking_italthai(sv.fleetid,sv.modem_id)::numeric::integer  ";
    sql += " END as working_hour  ";
  
    sql += " , CASE WHEN mcv.is_calculate_fuel='1' THEN ";
    sql += " TRUNC(linear_regression(mcv.fuelempty::DECIMAL,mcv.fuelfull::DECIMAL,0,mcv.fueltank::DECIMAL,dblink_last_analog_input1('db_10036',r.modem_id)::DECIMAL),2) ";
    sql += " ELSE '0' END  AS oil_liter ";
      */
   
    sql += ",coalesce(mcv.iti_customer_name,'')  as customer_name ,coalesce(mcv.iti_company_name,'')  as company_name,coalesce(mcv.iti_customer_phone,'')  as customer_phone ";
    sql += " FROM	realtime as r, setup_vehicle as sv,master_config_vehicle as mcv";

    is_master_fleet(object.fleetname,function(is_master_fleet)
    {
        if(is_master_fleet=='1')
        {
            sql += " WHERE r.modem_id=sv.modem_id AND sv.fleetid=" + utl.sqote(object.db_name) + "";
            sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' ) ";
            sql += " AND mcv.db_name=sv.fleetid AND sv.modem_id= mcv.modem_id ";
            sql += " ORDER BY r.modem_id ASC ";
        }
        else
        {
            sql += " WHERE r.modem_id=sv.modem_id AND sv.fleetcode=get_fleetid(" + utl.sqote(object.fleetname) + ")";
            sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' ) ";
            sql += " AND mcv.db_name=sv.fleetid AND sv.modem_id= mcv.modem_id ";
            sql += " ORDER BY r.modem_id ASC ";
        }


      //  sql += " ) ";
        sql += ") SELECT *,status,status||'_'||angle as heading,status||'_'||angle as status_angle FROM res ";
        

        console.log(sql);

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

    });
}

function tracking_history_italthai(req, res)
{
    //#region
    /*
WITH res as(
SELECT row_number() OVER (ORDER BY gps_datetime) as id,gps_datetime,lon,lat,speed,satelites,altitude
,message_id,analog_input1,analog_input2,CASE  WHEN CAST(analog_input2 as int)=2400 THEN '3' ELSE status END as status
,round (abs((SELECT mileage FROM ht_142190463056 WHERE gps_datetime >='2020-01-27 00:00' LIMIT 1)-mileage)::DECIMAL,2)::text
 ,angle,tambol, etambol, amphur,eamphur, province, eprovince
 FROM ht_142190463056
WHERE gps_datetime >='2020-01-27 00:00'
AND gps_datetime <='2020-01-27 23:00'
ORDER BY gps_datetime
)
SELECT *,status||'_'||angle as heading FROM res
     */
    //#endregion

    debugger;
 
      //  console.log('tracking_history '+JSON.stringify(req.body));

        var db_name = req.body.fleetid; //'db_10001';
        var modem_id = req.body.modemid; //'1010001004';
        var start = req.body.start; // '2016-06-04 00:00';
        var stop = req.body.stop; //'2016-06-04 23:59';
        var tb_name = "ht_" + modem_id;

 
        var prefix_model =  modem_id.substring(0,2);

        prefix_model = prefix_model =='14' ? 'VT900' : 'U1 LITE PLUS';




        var sql = "";
        sql += "WITH res as( SELECT row_number() OVER (ORDER BY gps_datetime) as id,modem_id,idate(gps_datetime) as gps_datetime,to_char(time_server_recive, 'YYYY-MM-DD HH24:MI:SS:MS') as time_server_recive,lon,lat,speed,satelites,altitude";
        sql += " ,message_id,analog_input1,analog_input2 ";
     //  sql += " ,TRUNC(COALESCE(oil_percent,0.0)::numeric, 2 )  as oil_percent ";
        sql += " ,TRUNC(COALESCE(oil_percent,0.0)::numeric, 2 )  as oil_liter ";
        sql += " ,db_link_get_vehiclename(modem_id) as vehicle_name ,db_link_get_carlicence(modem_id) as car_licence  ";

        check_case_status_getqeury(modem_id,function(sql1)
        {
            sql += sql1;

            sql += " ,round (abs((SELECT mileage FROM " + tb_name + " WHERE gps_datetime >=" + utl.sqote(start) + " LIMIT 1)-mileage)::DECIMAL,2)::text as mileage,tambol, etambol, amphur,eamphur, province, eprovince,angle,'"+prefix_model+"' as model_device";
            sql += " FROM " + tb_name;
            sql += " WHERE gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop);
            sql += " ORDER BY gps_datetime ASC ) SELECT *,status||'_'||angle as heading FROM res ";
    
            ipm.db.dbname = db_name;
            db.get_rows(ipm, sql, function (rows) 
            {
                if (rows.length > 0) 
                {
                    res.send(rows);
                }
                else 
                {
                    res.send([]);
                }
            });
        });
       // sql += " ,CASE  WHEN CAST(analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as status";
  
   
}

function get_vehicle_info_italthai(req, res)
{
    //#region
    /*
   
     SELECT DISTINCT mcv.modem_id,mcv.sim,mcv.vehiclename,mcv.carlicence,mcv.speedmax,mcv.idlestop,mcv.chassesno 
     ,mcv.vehicle_model_id,mcv.vehicle_color_id 
     ,mcv.fuelempty,mcv.fuelfull,mcv.fueltank,mcv.oil_level as km_per_lite 
     ,x.xvehiclebrandid as vbrand_id,x.xVehicletypeid as vtype_id,mcv.sim_brand 
     ,mcv.min_max_temperature ::text 
     ,coalesce( mcv.has_card_reader,'0') as has_card_reader 
     ,coalesce(mcv.dlt_card_reader,'0') as send_dlt 
		 ,mileage_start,mileage_stop,mileage_message_alert
     FROM master_config_vehicle as mcv,setup_vehicle as sv 
     ,fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x 
     WHERE	sv.fleetcode=get_fleetid('demoktc') 
     AND mcv.db_name=sv.fleetid AND sv.modem_id= mcv.modem_id ORDER BY mcv.modem_id ASC
    */
    //#endregion
   

    var b = req.body;
    var ar = { 'fleetid': b.fleetid, 'fleetname': b.fleetname}
   // var ar = { 'fleetid': 'db_10001', 'fleetname': 'demoktc' };

    var sql = "";
    sql += " SELECT DISTINCT mcv.modem_id,mcv.sim,mcv.vehiclename,mcv.carlicence,mcv.speedmax,mcv.idlestop,mcv.chassesno ";
    sql += " ,mcv.vehicle_model_id,mcv.vehicle_color_id ";
    sql += " ,mcv.fuelempty as fuel_empty,mcv.fuelfull as fuel_full,mcv.fueltank,mcv.oil_level as km_per_lite ";
    sql += " ,x.xvehiclebrandid as vbrand_id,x.xVehicletypeid as vtype_id,mcv.sim_brand ";
    sql += " ,mcv.min_max_temperature ::text ";
    sql += " ,coalesce( mcv.has_card_reader,'0') as has_card_reader ";
    sql += " ,coalesce(mcv.dlt_card_reader,'0') as send_dlt ";
    sql += " ,coalesce(mileage_start,'0') as mileage_start,coalesce(mileage_stop,'0') as mileage_stop,coalesce(mileage_message_alert ,'') as mileage_message_alert";
    sql += " ,set_point1 as set_point_1,set_point2 as set_point_2,set_point3 as  set_point_3,coalesce(calibrate_working_hour,'0') as calibrate_working_hour";
    sql += " ,coalesce(mcv.ital_is_usecase_status,'0') as ital_is_usecase_status,coalesce(mcv.iti_working_hour,'0') as working_hour ";
    /*
    sql += " ,CASE  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' THEN dblink_countworking_italthai_upsidedown_status(sv.fleetid,sv.modem_id,'26')::numeric::integer ";
    sql += "  WHEN coalesce(mcv.ital_is_usecase_status,'0')='0' THEN dblink_countworking_italthai(sv.fleetid,sv.modem_id)::numeric::integer ";
    sql += "  END as working_hour ";
    */
    sql += " ,iymd(iti_vehicle_delivery_date) as vehicle_delivery_date ";
    sql += " ,iymd(iti_waranty_expiration_date) as waranty_expiration_date ";
    sql += " ,iti_waranty_expiration_hour as waranty_expiration_hour ,coalesce(iti_due_date_service_hour,500) as due_date_service_hour";
    sql += " ,coalesce(iti_customer_name,'') as customer_name,coalesce(iti_company_name ,'') as company_name,coalesce(iti_customer_phone,'') as customer_phone ";
    sql += " FROM master_config_vehicle as mcv,setup_vehicle as sv ";
    sql += " ,fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x ";
    sql += " WHERE	sv.fleetcode=get_fleetid(" + utl.sqote(ar.fleetname) + ") ";
    sql += " AND mcv.db_name=sv.fleetid AND sv.modem_id= mcv.modem_id ORDER BY mcv.modem_id ASC";


    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });

}

function set_vehicle_info_italthai(req, res)
{
 
    var b = req.body;
    var ar = {
        'fleetid': b.fleetid, 'fleetname': b.fleetname, 'modem_id': b.modem_id
         , 'vehiclename': b.vehiclename, 'carlicence': b.carlicence ,"sim": b.sim
         , 'speedmax': b.speedmax, 'idlestop': b.idlestop, "km_per_lite": b.km_per_lite, 'fueltank': b.fueltank
         , "vbrand_id": b.vbrand_id, 'vehicle_model_id': b.vehicle_model_id, "vtype_id": b.vtype_id
         , 'vehicle_color_id': b.vehicle_color_id, "sim_brand": b.sim_brand
         , 'message': ''
    };
    
    /*
    var ar = {
        "fleetid": "db_10001", "fleetname": "demoktc", "modem_id": "1010001017"
        , "vehiclename": "1ฒบ-7235", "carlicence": "1ฒบ-7235", "sim": "1234567890"
        , "speedmax": "80", "idlestop": "10", "km_per_lite": "3.5", "fueltank": "0"
        , "vbrand_id": "1", "vehicle_model_id": "97", "vtype_id": "2"
        , "vehicle_color_id": "11", "sim_brand": "1"
    }
    */

    debugger;
    var sql = squel.update()
    .table("master_config_vehicle")
    .set("sim", ar.sim)
    .set("sim_brand", ar.sim_brand)
	.set("vehiclename", ar.vehiclename)
	.set("carlicence", ar.carlicence)
	.set("speedmax", ar.speedmax)
	.set("idlestop", ar.idlestop)
 
    .set("vehicle_model_id", ar.vehicle_model_id)
    .set("vehicle_color_id", ar.vehicle_color_id)
    
    .set("oil_level", ar.km_per_lite)
    .set("fueltank", ar.fueltank)

    .set("fuelempty", b.fuel_empty)
    .set("fuelfull", b.fuel_full)
   // .set("set_point1", b.set_point_1)
   // .set("set_point2", b.set_point_2)
   // .set("set_point3", b.set_point_3)

    .set("calibrate_working_hour", b.calibrate_working_hour)

    .set("iti_vehicle_delivery_date", b.vehicle_delivery_date)
    .set("iti_waranty_expiration_date", b.waranty_expiration_date)
    .set("iti_waranty_expiration_hour", b.waranty_expiration_hour)

    .set("iti_customer_name", b.customer_name)
    .set("iti_company_name", b.company_name)
    .set("iti_customer_phone", b.customer_phone)
    .set("iti_due_date_service_hour",b.due_date_service_hour)
    
    .where('modem_id = ' + utl.sqote(ar.modem_id))
    .where('db_name = ' + utl.sqote(ar.fleetid))
    .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) {
        debugger;
        if (is_ok == 'oK') {
            res.json({ success: true, message: 'Complete set vehicle_info.' });
        }
        else {
            //ar.message = is_ok.message;
           // add_error_message(ar, function (res_add) {
                debugger;
                res.json({ success: false, message: 'Not Complete set vehicle_info.' });
           // });
        }
    });
}

function get_detail_vehicle_italthai(req, res)
{
    //#region
    /*
SELECT 
vb.vehiclebrandid,vb.vehiclebrand,vm.vehiclemodelid,vm.vehiclemodel_name
,vt.Vehicletypeid,vt.vehicletype
,vm.emptygauge,vm.fullgauge,vm.oiltank
,x.xvehiclebrandid as vbrand_id,x.xVehicletypeid as vtype_id,'1' as sim_brand
FROM master_vehicle_brand as vb,master_vehicle_model as vm
,master_vehicle_type as vt
,fn_tb_getbrand_vehicle(vm.vehiclemodelid::INTEGER) as x
WHERE vb.vehiclebrandid = vm.vehiclebrandid
AND vm.vehicletypeid=vt.vehicletypeid
ORDER BY vb.vehiclebrandid ASC 
     */
    //#endregion

  //  var brand_id = '1';//req.body.brand_id;



    var sql = "";
    sql += " SELECT ";
    sql += "  vb.vehiclebrandid,vb.vehiclebrand,vm.vehiclemodelid,vm.vehiclemodel_name ";
    sql += " ,vt.Vehicletypeid,vt.vehicletype ";
    sql += " ,vm.emptygauge,vm.fullgauge,vm.oiltank ";
    sql += " ,x.xvehiclebrandid as vbrand_id,x.xVehicletypeid as vtype_id,'1' as sim_brand ";
    sql += " FROM master_vehicle_brand as vb,master_vehicle_model as vm ";
    sql += " ,set_point1 as set_point_1,set_point2 as set_point_2,set_point3 as  set_point_3,set_actual1  as set_actual_1,set_actual2 as set_actual_2,set_actual3 as set_actual_3";

    sql += " ,master_vehicle_type as vt ";
    sql += " ,fn_tb_getbrand_vehicle(vm.vehiclemodelid::INTEGER) as x ";
    sql += " WHERE vb.vehiclebrandid = vm.vehiclebrandid ";
    sql += " AND vm.vehicletypeid=vt.vehicletypeid ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
}

function rp_maintanace_italthai(req, res)
{
    /*
 WITH res as (
         SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name 
        ,mcv.maintance_oil
				,dblink_countworking_italthai(r.fleet_id,r.modem_id)::numeric::integer  as now_mileage
        ,mcv.maintance_oil_lastcheck as lastcheck 
        ,mcv.maintance_oil_duecheck as duecheck 
        ,mcv.maintance_oil_check_every as check_every 
         FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv 
         WHERE r.modem_id=mcv.modem_id 
        AND r.modem_id=sv.modem_id 
        AND sv.fleetcode=get_fleetid('italthai') 
         ORDER BY r.modem_id ASC 
)

SELECT *
,ABS(now_mileage-maintance_oil) as leftmileage 
,case WHEN now_mileage-maintance_oil < 0 THEN 'left' ELSE 'over' end as status 
 FROM res
    */
    debugger;
 
        var json = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };
        // console.log(JSON.stringify(t));

        //var object = { "db_name": 'db_10001', 'fleetname': 'demoktc' };

        var sql1 = ' ';
        sql1 += "  WITH res as ( ";
        sql1 += "    SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name ";
        sql1 += "   ,mcv.maintance_oil ";
        sql1 += "   ,dblink_countworking_italthai(r.fleet_id,r.modem_id)::numeric::integer  as now_mileage ";
        sql1 += "   ,mcv.maintance_oil_lastcheck as lastcheck ";
        sql1 += "   ,mcv.maintance_oil_duecheck as duecheck ";
        sql1 += "   ,mcv.maintance_oil_check_every as check_every ";
        sql1 += "    FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv ";
        sql1 += "    WHERE r.modem_id=mcv.modem_id ";
        sql1 += "    AND r.modem_id=sv.modem_id ";
        sql1 += "    AND sv.fleetcode=get_fleetid(" + utl.sqote(json.fleetname) + ") ";
        sql1 += "    ORDER BY r.modem_id ASC "
        sql1 += " ) ";
   
        sql1 += " SELECT * ";
        sql1 += " ,ABS(now_mileage-maintance_oil) as leftmileage ";
        sql1 += " ,case WHEN now_mileage-maintance_oil < 0 THEN 'left' ELSE 'over' end as status ";
        sql1 += " FROM res ";

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });
    
}


function rp_graph_working(req,res)
{
    debugger;
  var modem_id = req.body.modemid; //'1010003020'; //
  var start = req.body.start; // '2017-01-25 00:00';//
  var stop = req.body.stop; //'2017-01-26 23:59'; // 

  /*
       SELECT get_ymd(date_process) as date_process,get_vehiclename(modem_id) as vehicle_name
     ,working_00, working_01, working_02, working_03, working_04, working_05 , working_06, working_07, working_08, working_09, working_10,working_11, working_12 
     ,working_13, working_14, working_15, working_16, working_17, working_18  ,working_19, working_20, working_21, working_22, working_23
     FROM rp_italthai_working_everyhour
     WHERE 
	iymd(date_process) >= iymd('2020-01-24 00:00') 
	AND iymd(date_process) <= iymd('2020-01-25 23:59') 
  AND modem_id='142190463056' 
  ORDER BY get_ymd(date_process) 

  */

 // if(moment(engagementDate).isSame(today, 'day'))
    var sql=' ';
    sql += " SELECT get_ymd(date_process) as date_process, get_vehiclename(modem_id) as vehicle_name ";
    sql += ",working_00, working_01, working_02, working_03, working_04, working_05 , working_06, working_07, working_08, working_09, working_10,working_11, working_12 "; 
    sql += ",working_13, working_14, working_15, working_16, working_17, working_18  ,working_19, working_20, working_21, working_22, working_23 ";
    sql += " FROM rp_italthai_working_everyhour ";
    sql += " WHERE ";
    sql += " iymd(date_process) >= iymd("+utl.sqote(start)+") ";
    sql += " AND iymd(date_process) <= iymd("+utl.sqote(stop)+")  ";
    sql += " AND modem_id="+utl.sqote(modem_id)+" ";
    sql += " ORDER BY get_ymd(date_process) ";

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (rows) 
        {
            if (rows.length > 0) 
            {
                res.send(rows);
            }
            else 
            {
                res.send([]);
            }
        });


}


function rp_graph_vehicle_status_italthai(req, res)
{
    debugger;
    // Isauthenticate(req, res, function () {
    var db_name = req.body.fleetid; //'db_10001'; //
    var modem_id = req.body.modemid; //'1010001030';// 
    var start = req.body.start; // '2016-09-09 00:00';//
    var stop = req.body.stop; //'2016-09-09 23:59';//
    var tb_name = "ht_" + modem_id;

    //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
    var sql = "";
 
        sql += " SELECT DISTINCT gps_datetime";
        // sql += ", CASE WHEN status ='1' THEN '#FC5050' WHEN status ='2' THEN '#F6EA27' WHEN status ='3' THEN '#ADCE59' END as status";
         sql += ",tambol||':'||amphur||':'||province as tloc ";
         sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
    //     sql += ",CASE   WHEN CAST(analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as status";
    check_case_status_getqeury(modem_id,function(sql1)
    {
        sql += sql1;

        sql += " FROM " + tb_name;
        sql += " WHERE  gps_datetime >= " + utl.sqote(start);
        sql += " AND gps_datetime <=" + utl.sqote(stop);
        sql += " ORDER BY gps_datetime ";
   
        ipm.db.dbname = db_name;
        db.get_rows(ipm, sql, function (rows) {
            debugger;
            if (rows.length > 0) 
            {
    
                //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
                var strMustache1 = '{{#.}}';
                strMustache1 += '"{{gps_datetime}}"';
                strMustache1 += ',';
                strMustache1 += '{{/.}}';
    
                var strMustache2 = '{{#.}}';
                strMustache2 += '{{status}}';
                strMustache2 += ',';
                strMustache2 += '{{/.}}';
    
                var strMustache3 = '{{#.}}';
                strMustache3 += '"{{tloc}}"';
                strMustache3 += ',';
                strMustache3 += '{{/.}}';
    
                var strMustache4 = '{{#.}}';
                strMustache4 += '"{{eloc}}"';
                strMustache4 += ',';
                strMustache4 += '{{/.}}';
    
                var result1 = mustache.render(strMustache1, rows);
                var result2 = mustache.render(strMustache2, rows);
                var result3 = mustache.render(strMustache3, rows);
                var result4 = mustache.render(strMustache4, rows);
    
                result1 = utl.iRmend(result1);
                result1 = '{ "name":"time","data":[' + result1 + '] }';
                result1 = result1.replace(/&quot;/g, '"');
    
                result2 = utl.iRmend(result2);
                result2 = '{ "status":"xstatus","data":[' + result2 + '] }';
                result2 = result2.replace(/&quot;/g, '"');
    
                result3 = utl.iRmend(result3);
                result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
                result3 = result3.replace(/&quot;/g, '"');
    
                result4 = utl.iRmend(result4);
                result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
                result4 = result4.replace(/&quot;/g, '"');
    
                res.send('[' + result1 + ',' + result2 + ',' + result3 + ',' + result4 + ']');
            }
            else {
                res.send([]);
            }
    })


  
 
    //speed >0

    /*
    [{
    "name": "Month",
    "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }, {
        "name": "Revenue",
        "data": [23987, 24784, 25899, 25569, 25897, 25668, 24114, 23899, 24987, 25111, 25899, 23221]
    }, {
        "name": "Overhead",
        "data": [21990, 22365, 21987, 22369, 22558, 22987, 23521, 23003, 22756, 23112, 22987, 22897]
    }]
     */

   
       
    });
 }

 function HOUR(min) {
    var ts = timespan.fromMinutes(min);
    //  console.log(ts);
    var result = 0;
    utl.is_undefined(ts, function (is_true) {
        if (is_true) {
            result = '0 days  0 hr 0 mi'; //0
        } else {
            result =ts.days + ' days '+ ts.hours + ' hr' + ts.minutes+' mi';
        }
    })

    return result;
}

 function rp_graph_efficient(req, res)
 {
    var db_name = req.body.fleetid; //'db_10001'; //
    var modem_id = req.body.modemid; //'1010001030';// 
    var start = req.body.start; // '2016-09-09 00:00';//
    var stop = req.body.stop; //'2016-09-09 23:59';//
    var tb_name = "ht_" + modem_id;

    check_case_status(modem_id,function(result)
    {
        var sql="";
        if(result=='0') //
        {
       
            sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
            sql += " FROM " + tb_name +" ";
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop) +" AND analog_input2 IN "+status_working_normal;
            sql += " UNION ALL ";
            sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
            sql += " FROM " + tb_name +" ";
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop)+" AND analog_input2 IN "+status_parking;
            sql += " UNION ALL ";
            sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
            sql += " FROM " + tb_name +" ";
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop)+" AND analog_input2 IN "+status_idleling;

       
        }
        else
        { // 1  = VCEW1458
        

            sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
            sql += " FROM " + tb_name +" ";
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop) +" AND analog_input2 IN "+status_working_flip
            sql += " UNION ALL ";
            sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
            sql += " FROM " + tb_name +" ";
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop)+" AND analog_input2  IN "+status_parking;
            sql += " UNION ALL ";
            sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
            sql += " FROM " + tb_name +" ";
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop)+" AND  analog_input2 IN "+status_idleling
        }

     //   console.log(sql);

        ipm.db.dbname = db_owner;
        db.get_rows(ipm, sql, function (rows)
        {
            debugger;
            if (rows.length > 0)
            {
                var working = parseInt(rows[0]['sum']);
                var parking = parseInt(rows[1]['sum']);
                var idleling = parseInt(rows[2]['sum']);

                //  var sum = working + parking + idleling;

                /*
                var prun = ((working / sum) * 100).toFixed(2);

                var ppark = ((parking / sum) * 100).toFixed(2);

                var pidle = ((idleling / sum) * 100).toFixed(2);

                var result = [{
                        'running': prun, 'parking': ppark, 'ideling': pidle
                    , 'total_running': HOUR(working), 'total_parking': HOUR(parking), 'total_ideling': HOUR(idleling)
                }];
                */

                var result = [{
                'total_running': working, 'total_parking':parking, 'total_ideling': idleling
                }];

             //   console.log(result);

                res.send(result);
                // console.log(rows);
            }
            else
            {
                res.send([]);
            }
        });

    });
 }


function _get_result_textbelow_chartfuel(para, callback)
{
    /*
   var db_name = req.body.fleetid; //'db_10001'; //
   var modem_id = req.body.modemid; //'1010001030';// 
   var start = req.body.start; // '2016-09-09 00:00';//
   var stop = req.body.stop; //'2016-09-09 23:59';//
   var tb_name = "ht_" + modem_id;

   var db_name = 'db_10036'; //req.body.fleetid; //
   var modem_id = '142190463056';// req.body.modemid; //
   var start = '2020-06-01 00:00';//req.body.start; // 
   var stop = '2020-06-01 23:59';//req.body.stop; //

   var tb_name = "ht_" + modem_id;
   */


  check_case_status(para.modem_id,function(is_148volvo)
  {
      var status_working=''
        if(is_148volvo=='1')
        {
           status_working  = status_working_flip; //status_working_flip_green_yellow; //
        }else{
            status_working  =status_working_normal;  //status_working_normal_green_yellow; //
        }

        
   var sql="";
   sql += " SELECT COALESCE(count(analog_input2),'0') as sum_status_working  ";       
   sql += " FROM " + para.tb_name +" ";
   sql += " WHERE  gps_datetime >= " + utl.sqote(para.start);
   sql += " AND gps_datetime <=" + utl.sqote(para.stop) +" AND analog_input2 IN "+status_working

 

   ipm.db.dbname = db_owner;
   db.get_rows(ipm, sql, function (rows)
   {
       debugger;
       if (rows.length > 0)
       {
           var working = parseInt(rows[0]['sum_status_working']);
            working = parseFloat((working / 60.0).toFixed(2));
            callback(working);
            return;

            /*
            get_fuel_consumtion(para.modem_id,function(fuel_con)
           {
               var total_liter_usage = (fuel_con * working).toFixed(2);

               var exres={'total_liter_usage':total_liter_usage,'fuel_consumption':fuel_con,'total_working':working}
               callback(exres);
               return;
           });
         
           */

       }
       else
       {
        var exres={'total_liter_usage':0,'fuel_consumption':0,'total_working':0}
        callback(exres);
        return;
       }
   });
  })


   function get_fuel_consumtion(modem_id,callback)
{
   var sql =" SELECT oil_level as fuel_consumption FROM master_config_vehicle WHERE modem_id='"+modem_id+"' ";

   ipm.db.dbname = db_config;
   db.get_rows(ipm, sql, function (rows)
   {
       debugger;
       if (rows.length > 0)
       {
           var fuel_consumption = parseFloat( rows[0]['fuel_consumption']);
           callback(fuel_consumption);
           return ;
       }
       else
       {
           callback(0);
           return ;
       }
   });

}

}

function get_result_textbelow_chartfuel(para, callback)
{
    var sql=" WITH res as (";
    sql+=" SELECT itime_use(SUM(COALESCE(x1,'0')::int)) as total_working_time ";
    sql+=" ,fn_min_to_hrs(SUM(COALESCE(x1,'0')::NUMERIC)) as timeuse ";
    sql+=" ,SUM(COALESCE(fn_total_liter_usage_italthai("+utl.sqote(para.modem_id)+",iymd(tdate::timestamp)),'0')::DECIMAL) as total_liter_usage ";
    sql+=" FROM generate_series("+utl.sqote(para.start)+"::date," + utl.sqote(para.stop) +"::date, '1 day'::interval) as tdate "; 
    sql+=",fn_tb_sum_trip_timeuse2("+utl.sqote(para.modem_id)+",iymd(tdate::timestamp)) as x1 )";
    sql+=" SELECT total_working_time::varchar ,total_liter_usage::varchar,timeuse  FROM res  ";


    //,TRUNC(total_liter_usage/timeuse,2)::varchar as lite_per_hour
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
        if (rows.length > 0)
        {
      
            var total_working_time = rows[0]['total_working_time'];
            var total_liter_usage =  rows[0]['total_liter_usage'];
           // var lite_per_hour =  rows[0]['lite_per_hour'];
            var timeuse =  rows[0]['timeuse'];

            if(timeuse>0)
            {
                var lite_per_hour= (total_liter_usage / timeuse).toFixed(2)

                var exres={'total_liter_usage':total_liter_usage,'lite_per_hour':lite_per_hour,'total_working':total_working_time}
                callback(exres);
                return;
            }
            else
                {
                    var exres={'total_liter_usage':0,'lite_per_hour':0,'total_working':0}
                    callback(exres);
                    return;
                }

        }
        else
        {
            var exres={'total_liter_usage':0,'lite_per_hour':0,'total_working':0}
            callback(exres);
            return;
        }
    });


}

function get_total_lite(para,callback)
{
    var sql=" ";
    sql += " WITH res as ( ";
    sql += "     SELECT ";
    sql += " TRUNC(linear_regression(ref_min::DECIMAL,ref_max::DECIMAL,0,fueltank::DECIMAL,dblink_analog_input1_start('db_10036', r.modem_id,idate(start_date),idate(end_date))::NUMERIC),2) oil_percent_max  ";
    sql += " ,TRUNC(linear_regression(ref_min::DECIMAL,ref_max::DECIMAL,0,fueltank::DECIMAL,dblink_analog_input1_end('db_10036', r.modem_id,idate(end_date))::NUMERIC),2) as oil_percent_min ";
    
    sql += " FROM rp_trip as r,master_config_vehicle as mcv ";
    sql += " WHERE r.modem_id='"+para.modem_id+"' ";
    sql += " AND start_date>='"+para.start+"' ";
    sql += " AND end_date <='"+para.stop+"' ";
    sql += " AND mcv.modem_id=r.modem_id ";
    sql += " AND timeuse > 0 ) ";
    sql += "  SELECT SUM(TRUNC((oil_percent_max-oil_percent_min),2)) as total_liter_usage FROM res ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
        if (rows.length > 0)
        {
         
            callback( rows[0]['total_liter_usage']);
            return ;
        }
         else
        {
            callback(0);
            return ;
        }
    });


}

function get_fuel_config(modem_id,callback)
{
   var sql =" SELECT fuelempty as ref_min, fuelfull as ref_max,fueltank FROM master_config_vehicle WHERE modem_id='"+modem_id+"' ";

   ipm.db.dbname = db_config;
   db.get_rows(ipm, sql, function (rows)
   {
       debugger;
       if (rows.length > 0)
       {
           var fueltank = parseInt( rows[0]['fueltank']);
           var ref_max = parseFloat( rows[0]['ref_max']);
           var ref_min = parseFloat( rows[0]['ref_min']);

           var row={'fueltank':fueltank,'ref_min':ref_min,'ref_max':ref_max};;

           callback(row);
           return ;
       }
       else
       {
           callback(0);
           return ;
       }
   });

}


function chart_oil_percent_italthai(req, res) 
{
   //#region
   /*
SELECT DISTINCT gps_datetime
,speed
 ,tambol||amphur||province as tloc , etambol||eamphur||eprovince as eloc,status
 FROM ht_1010001030
WHERE  gps_datetime >= '2016-09-09 00:00'
AND gps_datetime <='2016-09-09 23:59'
ORDER BY gps_datetime

   var db_name = 'db_10036'; //req.body.fleetid; //
   var modem_id =  '143200384786';//req.body.modemid; //
   var start = '2020-11-03 00:00';//req.body.start; // 
   var stop = '2020-11-03 23:59' //req.body.stop; //'2017-01-07 23:59';//
   var tb_name = "ht_" + modem_id;
 


    */
   //#endregion

   var db_name = req.body.fleetid; //'db_10036'; //
   var modem_id =  req.body.modemid; // '142190463056';//
   var start = req.body.start; // '2020-06-01 00:00';//
   var stop = req.body.stop; // '2020-06-01 23:59';//
   var tb_name = "ht_" + modem_id;

/*

   var db_name = 'db_10036'; // req.body.fleetid; //'
   var modem_id =  '143200385059';//req.body.modemid; // 
   var start = '2021-02-15 00:00';// req.body.start; // 
   var stop = '2021-02-15 23:59';// req.body.stop; // 
   var tb_name = "ht_" + modem_id;
*/
  // var para={'db_name':'','modem_id':'143200384932','start':'2020-10-26 00:00','stop':'2020-10-26 23:59','tb_name':'ht_143200384932'};

   var para={'db_name':db_name,'modem_id':modem_id,'start':start,'stop':stop,'tb_name':tb_name};

   //tb_name ="ht_142190463056";
   //db_name="db_10036";
   
      //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime

      update_fix_fuel(modem_id,start,stop,function(is_complete)
      {
        get_fuel_config(modem_id,function(config)
        {
          var sql = "";
          sql += " SELECT DISTINCT idate(gps_datetime) as gps_datetime";
         // sql += " ,TRUNC(COALESCE(oil_percent,0.0)::numeric, 2 )  as oil_percent ";
          sql += " ,TRUNC(COALESCE(oil_liter,0.0)::numeric, 2 )  as oil_liter ";
          sql += " ,CASE WHEN TRUNC(linear_regression("+config.ref_min+","+config.ref_max+",0,  "+config.fueltank+", analog_input1::DECIMAL),2)  < 0 THEN get_oilpercent_previus(modem_id,idate(gps_datetime),"+config.ref_min+","+config.ref_max+","+config.fueltank+")::DECIMAL  "
          sql += "  ELSE TRUNC(linear_regression("+config.ref_min+","+config.ref_max+",0,  "+config.fueltank+", analog_input1::DECIMAL),2) END  as oil_percent ";
       //   sql += " ,TRUNC(linear_regression("+config.ref_min+","+config.ref_max+",0,  "+config.fueltank+", analog_input1::DECIMAL),2) as oil_percent";
          sql += ",tambol||':'||amphur||':'||province as tloc ";
          sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
          //italthai
       
          check_case_status_getqeury(modem_id,function(sql1)
        {
            sql += sql1;
         
            sql += " FROM " + tb_name;
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop);
            sql += " ORDER BY gps_datetime ASC";
      
           
            get_result_textbelow_chartfuel(para,function(res_value)
            {
                ipm.db.dbname = db_name;
                db.get_rows(ipm, sql, function (rows) {
                    debugger;
                    if (rows.length > 0) {
                        debugger;
                    //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
                        var strMustache1 = '{{#.}}';
                        strMustache1 += '"{{gps_datetime}}"';
                        strMustache1 += ',';
                        strMustache1 += '{{/.}}';
          
                        var strMustache2 = '{{#.}}';
                        strMustache2 += '{{oil_percent}}';
                        strMustache2 += ',';
                        strMustache2 += '{{/.}}';
          
                        var strMustache3='';
                        var strMustache4='';
          
                         strMustache3 = '{{#.}}';
                         strMustache3 += '"{{tloc}} | {{oil_percent}} ลิตร"';
                         strMustache3 += ',';
                         strMustache3 += '{{/.}}';
          
                         strMustache4 = '{{#.}}';
                         strMustache4 += '"{{eloc}} | {{oil_percent}} Liter"';
                         strMustache4 += ',';
                         strMustache4 += '{{/.}}';
                       
          
                        var strMustache5 = '{{#.}}';
                        strMustache5 += '{{status}}';
                        strMustache5 += ',';
                        strMustache5 += '{{/.}}';
          
                        var strMustache6 = '{{#.}}';
                        strMustache6 += '{{fuel_avg}}';
                        strMustache6 += ',';
                        strMustache6 += '{{/.}}';
          
                        var result1 = mustache.render(strMustache1, rows);
                        var result2 = mustache.render(strMustache2, rows);
                        var result3 = mustache.render(strMustache3, rows);
                        var result4 = mustache.render(strMustache4, rows);
                 //       var result5 = mustache.render(strMustache6, rows);
          
                        var status = mustache.render(strMustache5, rows);
      
                        /*
                        var oil_percent_max = linq.Enumerable.From(rows)
                        .Where(function (x) { return x.status == '3' })
                        .Select(function (x) { return parseFloat(x.oil_percent) })
                        .Max();
                       // .FirstOrDefault()
      
                        var oil_percent_min = linq.Enumerable.From(rows)
                        .Where(function (x) { return x.status == '3' })
                        .Select(function (x) { return parseFloat(x.oil_percent) })
                        .OrderByDescending(x => x.gps_datetime)
                        .FirstOrDefault()
      
                        var total_liter_usage = (oil_percent_max - oil_percent_min).toFixed(2);
                        */

                      //  var fuel_consumption = (total_liter_usage / total_working_green_yellow).toFixed(2);
                   
          
                      //  console.log(res_value);
                      
                        result1 = utl.iRmend(result1);
                        result1 = '{ "total_liter_usage" : "'+res_value.total_liter_usage+'","fuel_consumption" : "'+res_value.lite_per_hour+'","total_working" : "'+res_value.total_working+'","name":"time","data":[' + result1 + '] }';
                      // result1 = '{ "total_liter_usage" : "86.52","fuel_consumption" : "12.13","total_working" : "07:13","name":"time","data":[' + result1 + '] }';
                       result1 = result1.replace(/&quot;/g, '"');
          
                        result2 = utl.iRmend(result2);
                        result2 = '{ "oil_percent":"xoil_percent","data":[' + result2 + '] }';
                        result2 = result2.replace(/&quot;/g, '"');
                        
          
                        result3 = utl.iRmend(result3);
                        result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
                        result3 = result3.replace(/&quot;/g, '"');
          
                        result4 = utl.iRmend(result4);
                        result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
                        result4 = result4.replace(/&quot;/g, '"');
          
                   /*     result5 = utl.iRmend(result5);
                        result5 = '{ "fuel_avg":"xfuel_avg","data":[' + result5 + '] }';
                        result5 = result5.replace(/&quot;/g, '"');
                      */
          
                        status = utl.iRmend(status);
                        status = '{ "status":"xstatus","data":[' + status + '] }';
                        status = status.replace(/&quot;/g, '"');


          
                        res.send('['+result1 +','+ result2+','+ result3+','+ result4+','+status+']');
                      
                    }
                    else
                    {
                        res.send([]);
                    }
                });
          
            });
         
    
      
          
        });
       
        })
  
   
      })

   

}

function update_fix_fuel(modem_id,start,stop,callback)
{
    var tb_name ="ht_"+modem_id;
    
   var sql=" UPDATE  "+tb_name;
   sql+="  SET analog_input1=get_analog_not_zero(b.modem_id,b.gps_datetime) ";
   sql+="  FROM "+tb_name+" as b ";
   sql+="  WHERE b.gps_datetime >='"+start+"' ";
   sql+="  AND b.gps_datetime <='"+stop+"' ";
   sql+="  AND b.analog_input1 < '1' ";
   sql+="  AND "+tb_name+".gps_datetime=b.gps_datetime ";

   ipm.db.dbname = db_owner;
   db.excute(ipm, sql, function (is_ok) 
   {
        callback(is_ok);
        return;
   });

}


function set_note_italthai(req, res)
{
//    Isauthenticate(req, res, function () {
        debugger;
       // console.log(req.body);
          var fleet_id = req.body.fleetid;//'db_10036';//
          var modem_id = req.body.modemid; //'142190463056'; //
          var message = req.body.message;//'ทดสอบข้อความแจ้งซ่อม' // 'tstst';//
          var type_msg = req.body.type;  // service  /  repair  / consult
      //  console.log('set_note ' + modem_id + ' ' + message);
    // SELECT modem_id,idate(now()::TIMESTAMP) as timenow,status,speed,satelites,mileage,lon,lat,tambol,etambol,amphur,eamphur,province,eprovince  ,angle,oil_percent,oil_liter,heading  FROM realtime  WHERE modem_id= '1010001001'

        var sql = "";
        sql += "  SELECT DISTINCT r.modem_id,CASE  ";
        sql += "  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' ";
        sql += "  THEN dblink_countworking_italthai_upsidedown_status(sv.fleetid,sv.modem_id,'26')::numeric::integer ";
        sql += "  WHEN coalesce(mcv.ital_is_usecase_status,'0')='0' ";
        sql += "  THEN dblink_countworking_italthai(sv.fleetid,sv.modem_id)::numeric::integer  ";
        sql += "  END as working_hour ";
        sql += " ,idate(now()::TIMESTAMP) as timenow,status,speed,satelites,mileage,lon,lat,tambol,etambol,amphur,eamphur,province,eprovince ";
        sql += " ,angle,r.oil_percent,r.oil_liter,heading,get_vehiclename(r.modem_id) as vehicle_name ";
        sql += " FROM	realtime as r, setup_vehicle as sv,master_config_vehicle as mcv ";
        sql += " WHERE r.modem_id=" + utl.sqote(modem_id);
        sql += " AND mcv.db_name=sv.fleetid ";
        sql += " AND sv.modem_id= mcv.modem_id ";
        sql += " AND r.modem_id=sv.modem_id ";



        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (ar)
        {
            if (ar.length > 0)
            {
                ar =ar[0];
              //  console.log(JSON.stringify(ar[0]));

                 var sql_insrt_note = squel.insert()
               .into("note_details")
               .set("fleetid", fleet_id)
               .set("modem_id", ar.modem_id)
               .set("datenote", ar.timenow)
               .set("message", message)
               .set("lon", ar.lon)
               .set("lat", ar.lat)
               .set("speed", ar.speed)
               .set("heading", ar.heading)
               .set("satelites", ar.satelites)
               .set("status", ar.status)
               .set("tambol", ar.tambol)
               .set("amphur", ar.amphur)
               .set("province", ar.province)
               .set("etambol", ar.etambol)
               .set("eamphur", ar.eamphur)
               .set("eprovince", ar.eprovince)
               .set("angle", ar.angle)
                .set("oil_percent", ar.oil_percent)
                .set("oil_liter", ar.oil_liter)
                .set("working_hour_italthai", ar.working_hour)  
                .set("type_msg_italthai", type_msg)  
                .toString();

             //   console.log(sql_insrt_note);
             
            var subject = '⚠️'+type_msg+' '+ar.vehicle_name+' '+message;
            var from = mail_sender
            var to = 'callcenter@italthaigroup.com,saksphosri@gmail.com';

            var loc_th = ar.tambol+' '+ar.amphur+' '+ar.province
             var imessage= '<b>วันที่</b> '+utl.timenow()+'<br> <b>'+type_msg+' '+ar.vehicle_name+' '+message+'</b><br>'
             imessage+=' <b>สถานที่</b>  : '+loc_th+'<br>'
             imessage+=' <b>ตำแหน่ง</b> : https://www.google.com/maps?q='+ar.lat+','+ar.lon+' ';
     
                 ipm.db.dbname = db_config;
                 db.excute(ipm, sql_insrt_note, function (is_ok)
                 {
                     debugger;
                    //
                     mailer.send_mail(
                        mail_sender
                        ,pws_mailsender
                        ,from
                        ,to
                        , subject
                        ,imessage ,function(is_ok_mail)
                        {
                            res.json({ success: true, message: 'Completed set note.' });
                        })
                 });
              
            }
            else
            {
                res.json({ success: false, message: 'Not Completed set note.' });
            }
        });
  //  });
}

function get_report_note_italthai(req, res)
{
    //#region
    /*
    SELECT modem_id,idate(datenote),message,lon,lat
    ,tambol,amphur,province
	,etambol,eamphur,eprovince
     FROM note_details 
    WHERE modem_id='1010001001'
    AND datenote >='2016-06-04 00:00'
    AND datenote <='2016-06-30 23:59'

     */
    //#endregion

  //  Isauthenticate(req, res, function (){

        var db_name = req.body.fleetid; //'db_10036';
        var modem_id = req.body.modemid; //'142190463056';
        var start = req.body.start; // '2016-06-01 00:00';
        var stop = req.body.stop; //'2016-06-30 23:59';

        var sql1 = ' ';
        sql1 += " SELECT modem_id,idate(datenote) ,message,lon,lat ";
        sql1 += " ,tambol,amphur,province,etambol,eamphur,eprovince ";
        sql1 += " ,coalesce(working_hour_italthai,0) as working_hour ";
        sql1 += " ,type_msg_italthai as type_message";
        sql1 += " FROM note_details ";
        sql1 += " WHERE modem_id=" + utl.sqote(modem_id);
        sql1 += " AND datenote >=" + utl.sqote(start);
        sql1 += " AND datenote <=" + utl.sqote(stop);

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows) 
        {
            if (rows.length > 0)
            {
                res.send(rows);
            }
            else 
            {
                res.send([]);
            }
        });
   // });
}


function maintanace_italthai(req, res) 
{
    /*
WITH res as (

    SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name 
    ,CASE  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' THEN dblink_countworking_italthai_upsidedown_status(sv.fleetid,sv.modem_id,'26')::numeric::integer
		+ mcv.calibrate_working_hour::NUMERIC
    WHEN coalesce(mcv.ital_is_usecase_status,'0')='0' THEN dblink_countworking_italthai(sv.fleetid,sv.modem_id)::numeric::integer
		+  mcv.calibrate_working_hour::NUMERIC
     END as working_hour_now  
		,coalesce(mcv.iti_hour_start_service,0)+500 as due_date_service
		,mcv.iti_waranty_expiration_date as waranty_expiration_date 
		,mcv.iti_waranty_expiration_hour as waranty_expiration_hour
    FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv 
    WHERE r.modem_id=mcv.modem_id 
		AND r.modem_id=sv.modem_id 
    AND sv.fleetcode=get_fleetid('ITIGPSCENTER') 
    ORDER BY vehicle_name ASC 
)

SELECT modem_id,vehicle_name,working_hour_now
, due_date_service
, due_date_service-working_hour_now  as hour_left_send_alert
, waranty_expiration_date
,EXTRACT(DAY FROM  waranty_expiration_date-now()) as date_left_send_alert
,waranty_expiration_hour
, waranty_expiration_hour::NUMERIC -working_hour_now::NUMERIC as hour_left_waranty
 FROM res
    */
    debugger;
  //  Isauthenticate(req, res, function ()
  //  {
      //  var json = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };
       // var json = { "db_name": 'db_10036', 'fleetname': 'ITIGPSCENTER' };
      //  console.log(JSON.stringify(json));

        //var object = { "db_name": 'db_10001', 'fleetname': 'demoktc' };
        var db_name = req.body.fleetid; //'db_10036'; //
        var fleetname = req.body.fleetname;
//
     //   console.log(db_name+' '+fleetname)

        var sql1 = ' ';
  

        sql1 += " WITH res as ( ";
            sql1 += " SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name ";
            sql1 += " ,CASE  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' THEN dblink_countworking_italthai_upsidedown_status(sv.fleetid,sv.modem_id,'26')::numeric::integer ";
            sql1 += " + mcv.calibrate_working_hour::NUMERIC ";
            sql1 += " WHEN coalesce(mcv.ital_is_usecase_status,'0')='0' THEN dblink_countworking_italthai(sv.fleetid,sv.modem_id)::numeric::integer ";
            sql1 += " +  mcv.calibrate_working_hour::NUMERIC END as working_hour_now  ";
            sql1 += " ,coalesce(mcv.iti_hour_start_service,0)+coalesce(mcv.iti_due_date_service_hour,500) as due_date_service ";
            sql1 += " ,mcv.iti_waranty_expiration_date as waranty_expiration_date ";
            sql1 += " ,mcv.iti_waranty_expiration_hour as waranty_expiration_hour ";
            sql1 += " ,coalesce(mcv.iti_hour_start_service,0) as hour_start_service ";
            sql1 += " FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv ";
            sql1 += "  WHERE r.modem_id=mcv.modem_id AND r.modem_id=sv.modem_id ";
            sql1 += " AND sv.fleetcode=get_fleetid(" + utl.sqote(fleetname) + ") ORDER BY vehicle_name ASC ) ";
        
            sql1 += " SELECT DISTINCT modem_id,vehicle_name,working_hour_now,hour_start_service ";
            sql1 += " , due_date_service ";
            sql1 += " , due_date_service-working_hour_now  as hour_left_send_alert ";
            sql1 += " ,iymd(waranty_expiration_date) as waranty_expiration_date ";
            sql1 += " ,EXTRACT(DAY FROM  waranty_expiration_date-now()) as date_left_send_alert ";
            sql1 += " ,waranty_expiration_hour ";
            sql1 += " , waranty_expiration_hour::NUMERIC -working_hour_now::NUMERIC as hour_left_waranty ";
            sql1 += " FROM res  ";
  

      //  console.log(sql1);

        /* */
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                res.send(rows);
            }
            else {
                res.send([]);
            }
        });
       
}


function set_hour_start_service(req, res)
{
    var hour_start_service  = req.body.hour_start_service;
    var waranty_expiration_date = req.body.waranty_expiration_date;
    var modem_id = req.body.modemid;
    var fleetname = req.body.fleetname;

    var sql = squel.update()
    .table("master_config_vehicle")
    .set("iti_hour_start_service", hour_start_service)
   // .set("iti_waranty_expiration_date", waranty_expiration_date)
    .where('modem_id = ' + utl.sqote(modem_id))
    .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (is_ok) 
    {
        debugger;
        if (is_ok == 'oK') 
        {
            //res.json({ success: true, message: 'Complete set vehicle_info.' });
            var sql1 =' ';
            sql1 += " WITH res as ( ";
            sql1 += " SELECT r.modem_id,get_vehiclename(r.modem_id) as vehicle_name ";
            sql1 += " ,CASE  WHEN coalesce(mcv.ital_is_usecase_status,'0')='1' THEN dblink_countworking_italthai_upsidedown_status(sv.fleetid,sv.modem_id,'26')::numeric::integer ";
            sql1 += " + mcv.calibrate_working_hour::NUMERIC ";
            sql1 += " WHEN coalesce(mcv.ital_is_usecase_status,'0')='0' THEN dblink_countworking_italthai(sv.fleetid,sv.modem_id)::numeric::integer ";
            sql1 += " +  mcv.calibrate_working_hour::NUMERIC END as working_hour_now  ";
            sql1 += " ,coalesce(mcv.iti_hour_start_service,0)+mcv.iti_due_date_service_hour as due_date_service ";
            sql1 += " ,mcv.iti_waranty_expiration_date as waranty_expiration_date ";
            sql1 += " ,mcv.iti_waranty_expiration_hour as waranty_expiration_hour ";
            sql1 += " ,coalesce(mcv.iti_hour_start_service,0) as hour_start_service ";
            sql1 += " FROM realtime as r,master_config_vehicle as mcv, setup_vehicle as sv ";
            sql1 += "  WHERE r.modem_id=mcv.modem_id AND r.modem_id=sv.modem_id ";
            sql1 += " AND sv.fleetcode=get_fleetid(" + utl.sqote(fleetname) + ") ORDER BY vehicle_name ASC ) ";
        
            sql1 += " SELECT modem_id,vehicle_name,working_hour_now,hour_start_service ";
            sql1 += " , due_date_service ";
            sql1 += " , due_date_service-working_hour_now  as hour_left_send_alert ";
            sql1 += " ,iymd(waranty_expiration_date) as waranty_expiration_date ";
            sql1 += " ,EXTRACT(DAY FROM  waranty_expiration_date-now()) as date_left_send_alert ";
            sql1 += " ,waranty_expiration_hour ";
            sql1 += " , waranty_expiration_hour::NUMERIC -working_hour_now::NUMERIC as hour_left_waranty ";
            sql1 += " FROM res WHERE modem_id='"+modem_id+"' ";

            ipm.db.dbname = db_config;
            db.get_rows(ipm, sql1, function (rows) {
                if (rows.length > 0) {
                    res.send(rows);
                }
                else {
                    res.send([]);
                }
            });

        }
        else 
        {
            debugger;
            res.json({ success: false, message: 'Not Complete set hour_start_service.' });
        }
    });
}


function get_report_inout_geom_italthai(req, res)
{
    var modem_id = req.body.modemid; //'142190463056';
    var start = req.body.start; // '2016-06-01 00:00';
    var stop = req.body.stop; //'2016-06-30 23:59';

    var sql1='';
    sql1 += "  SELECT iymd(enter_time) as enter_date ";
    sql1 += "  ,to_char(enter_time, 'HH24:MI') as enter_time ";
    //sql1 += " ,iymd(leave_time) as leave_date ";
    sql1 += " ,iymd(leave_time) as leave_date " //||' '||to_char(leave_time, 'HH24:MI') 
    sql1 += " ,to_char(leave_time, 'HH24:MI') as leave_time ";
    sql1 += "  ,itime_use(timeuse) as timeuse ";
    sql1 += " ,distance,gmt.type_id ";
    sql1 += " ,geom_name as enter_station ";
    sql1 += " ,geom_name as exit_station ";
    sql1 += "  ,geom_name,gmt.type_name_th,gmt.type_name_en ";
    sql1 += "  ,start_loc_th,end_loc_th,start_loc_en,end_loc_en,start_lonlat,end_lonlat  ";
    sql1 += "  FROM rp_enter_geom as rp,master_station_type as gmt ";
    sql1 += "  WHERE modem_id="+utl.sqote(modem_id);
    sql1 += "  AND gmt.type_id=rp.geom_type::int ";
    sql1 += "  AND enter_time >=" + utl.sqote(start);
    sql1 += "  AND leave_time <=" + utl.sqote(stop);
    sql1 += " ORDER BY enter_time ASC ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });

}

function get_report_usage_vehicle_italthai(req, res)
{

   // var db_name = req.body.fleetid; //'db_10036';
    var modem_id = req.body.modemid; //'142190463056';
    var start = req.body.start; // '2016-06-01 00:00';
    var stop = req.body.stop; //'2016-06-30 23:59';

    var sql1='';
    debugger;
    sql1 += "WITH res as ( SELECT r.modem_id,idate(start_date) as start_date,idate(end_date) as end_date  ,start_loc_th,end_loc_th ";
    sql1 += " ,start_loc_en,end_loc_en,start_lonlat,end_lonlat ";
    sql1 += " ,itime_use(timeuse) as timeuse ";
    sql1 += " ,end_mile-start_mile as distance ";
    sql1 += " ,TRUNC(linear_regression(ref_min::DECIMAL,ref_max::DECIMAL,0,fueltank::DECIMAL,dblink_analog_input1_start('db_10036', r.modem_id,idate(start_date),idate(end_date))::NUMERIC),2) oil_percent_max "; 
    sql1 += " ,TRUNC(linear_regression(ref_min::DECIMAL,ref_max::DECIMAL,0,fueltank::DECIMAL,dblink_analog_input1_end('db_10036', r.modem_id,idate(end_date))::NUMERIC),2) as oil_percent_min "; 
    //sql1 += ",TRUNC((get_oil_level(" + utl.sqote(modem_id) + ") * (timeuse/60.0))::numeric,2) as fuel  ";
    sql1 += " ,italthai_is_ingeom_parking(SPLIT_PART(start_lonlat, ',', 1)::NUMERIC,SPLIT_PART(start_lonlat, ',', 2)::NUMERIC) as is_in_station_when_more_zero ";
    sql1 += " FROM rp_trip as r,master_config_vehicle as mcv ";
    sql1 += " WHERE r.modem_id=" + utl.sqote(modem_id);
    sql1 += " AND start_date>=" + utl.sqote(start) + " ";
    sql1 += " AND end_date <=" + utl.sqote(stop) + " ";
    sql1 += " AND  mcv.modem_id=r.modem_id AND timeuse > 1 )";

    sql1 += " SELECT *,coalesce(ABS(TRUNC((oil_percent_max-oil_percent_min),2)),'0') as fuel FROM res ";
   // WHERE TRUNC((oil_percent_max-oil_percent_min),2) > '0' ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) 
    {
        if (rows.length > 0)
        {
            res.send(rows);
        }
        else 
        {
            res.send([]);
        }
    });
}

function get_report_parking_italthai(req, res)
{
    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001004';
    var start = req.body.start; // '2016-06-04 00:00';
    var stop = req.body.stop; //'2016-06-04 23:59';

    //#region
    /*
   SELECT modem_id
,to_char(start_date, 'HH24:MI') as start_date --itimeonly(start_date)
,to_char(end_date, 'HH24:MI') as end_date
,start_loc_th,end_loc_th,start_loc_en,end_loc_en,itime_use(timeuse) as timeuse,start_lonlat,end_lonlat 
FROM rp_parking 
WHERE modem_id='1010001004'
AND start_date>='2016-07-01 00:00'
AND end_date <='2016-07-10 23:59'
AND timeuse >= get_parkingstop(modem_id)

 SELECT  
itime_use(SUM(timeuse)) as timeuse 
  FROM rp_parking 
 WHERE modem_id='1010001004'
AND start_date>='2016-07-01 00:00'
AND end_date <='2016-07-10 23:59'
  AND timeuse >= get_parkingstop(modem_id)

     */
    //#endregion

    var sql1 = ' ';
    sql1 += "   SELECT modem_id,iymd(start_date) as date,to_char(start_date, 'HH24:MI') as start_date,to_char(end_date, 'HH24:MI')  as end_date";
    sql1 += " ,start_loc_th,end_loc_th,start_loc_en,end_loc_en,itime_use(timeuse) as timeuse,start_lonlat,end_lonlat ";
    sql1 += " ,italthai_is_ingeom_parking(SPLIT_PART(start_lonlat, ',', 1)::NUMERIC,SPLIT_PART(start_lonlat, ',', 2)::NUMERIC) as is_in_station_when_more_zero ";
    sql1 += "  FROM rp_parking ";
    sql1 += "  WHERE modem_id=" + utl.sqote(modem_id);
    sql1 += "  AND start_date>=" + utl.sqote(start);
    sql1 += "  AND end_date <=" + utl.sqote(stop);
    sql1 += "  AND timeuse >= get_parkingstop(modem_id) ";

    
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows)
    {
        if (rows.length > 0) 
        {
            res.send(rows);
        }
        else 
        {
            res.send([]);
        }
    });
}
//2020-10-01 00:00 - 2020-10-27 23:59

function get_report_idling_italthai(req, res)
{
  
        var db_name = req.body.fleetid; //'db_10001';
        var modem_id = req.body.modemid; //'1010001004';
        var start = req.body.start; // '2016-06-04 00:00';
        var stop = req.body.stop; //'2016-06-04 23:59';

        //#region
        /*
    SELECT modem_id,start_date,end_date,start_loc_th,end_loc_th
    ,start_loc_en,end_loc_en,timeuse,lonlat
     FROM rp_idleling
    WHERE modem_id='1010001001'
    AND start_date>='2016-06-04 00:00'
    AND end_date <='2016-06-04 23:59'
    AND timeuse >get_idlestop(modem_id)
         */
        //#endregion

        var sql1 = ' '; var sql2 = ' ';
        sql1 += "   SELECT modem_id,iymd(start_date) as date,timeonly(start_date) as start_date,timeonly(end_date) as end_date,start_loc_th,end_loc_th ";
        sql1 += ", start_loc_en,end_loc_en,itime_use(timeuse) as timeuse,lonlat ";
        sql1 += " ,italthai_is_ingeom_parking(SPLIT_PART(lonlat, ',', 1)::NUMERIC,SPLIT_PART(lonlat, ',', 2)::NUMERIC) as is_in_station_when_more_zero ";
        sql1 += "  FROM rp_idleling ";
        sql1 += "  WHERE modem_id=" + utl.sqote(modem_id);
        sql1 += "  AND start_date>=" + utl.sqote(start);
        sql1 += "  AND end_date <=" + utl.sqote(stop);
        sql1 += "  AND timeuse >= get_idlestop(modem_id) ";

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows)
        {
            if (rows.length > 0) 
            {
                res.send(rows);
            }
            else 
            {
                res.send([]);
            }
        });



}

function get_report_summary_italthai(req, res)
{
debugger;
    /*

    SELECT iymd(tdate::timestamp) as st_date 
    ,itime_use(COALESCE(x1.xtimeuse,'0')::int) as timeuse  
	,COALESCE(fn_total_liter_usage_italthai('143200384932',iymd(tdate::timestamp)),'0') as fuel
    ,COALESCE(x2,'0') as inout_station 
	,itime_use(COALESCE(fn_inout_station_italthai('143200384932',iymd(tdate::timestamp),'2'),'0')::int) as time_instaion_allow
	,itime_use(COALESCE(fn_inout_station_italthai('143200384932',iymd(tdate::timestamp),'3'),'0')::int) as time_instaion_notallow
	,x3.times as total_ideling
	,COALESCE(x3.toal_timeuse,'00:00') as time_ideling
    FROM generate_series('2020-10-26 00:00'::date,'2020-10-30 23:59'::date, '1 day'::interval) as tdate  
  	,fn_tb_sum_trip_timeuse('143200384932',iymd(tdate::timestamp)) as x1
    ,fn_tb_sum_inout_geom('143200384932',iymd(tdate::timestamp)) as x2 
	,fn_tb_sum_idleling('143200384932',iymd(tdate::timestamp)) as x3 

    */
  // {"rows":[{"st_date":"2020-10-30","ovsp_count":"0","ovsp_distance":0,"idle_timeuse":3,"idle_distance":"00:32","trip_distance":0.49,"trip_fuel":0.0317358,"inout":"2

    var db_name = req.body.fleetid; //'db_10001';
    var modem_id = req.body.modemid; //'1010001004';
    var year_month = req.body.year_month; // '2016-06';
    var start_time = req.body.start; //'2016-06-24 00:00';// 
    var end_time = req.body.stop; //'2016-06-25 23:59';//

    var sql1='';

    sql1 += "SELECT iymd(tdate::timestamp) as st_date ";

    sql1 += ",itime_use(ABS(COALESCE(x1,'0')::int)) as trip_distance  "; // timeuse
    sql1 += ",COALESCE(fn_total_liter_usage_italthai(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)),'0') as trip_fuel ";

    sql1 += ",itime_use(COALESCE(fn_inout_station_italthai(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp),'2'),'0')::int) as ovsp_count "; //--time_instaion_allow
    sql1 += ",itime_use(COALESCE(fn_inout_station_italthai(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp),'3'),'0')::int) as ovsp_distance "; // --time_instaion_notallow


    sql1 += ",x3.times as idle_timeuse ";
    sql1 += ",COALESCE(x3.toal_timeuse,'00:00') as idle_distance ";

    sql1 += ",COALESCE(x2,'0') as inout "; //inout_station 

  //  sql1 += "from generate_series(" + utl.sqote(date_start) + "::date," + utl.sqote(date_end) + "::date, '1 day'::interval) as tdate ";
    sql1 += " FROM generate_series(" + utl.sqote(start_time) + "::date," + utl.sqote(end_time) + "::date, '1 day'::interval) as tdate "; 
    sql1 += ",fn_tb_sum_trip_timeuse(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x1 ";
    sql1 += ",fn_tb_sum_inout_geom(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x2 ";
    sql1 += ",fn_tb_sum_idleling(" + utl.sqote(modem_id) + ",iymd(tdate::timestamp)) as x3 ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) 
    {
     if (rows.length > 0) 
     {
         var detail = { 'rows': '', 'sum': '' };
         detail.rows=rows;
         res.send(detail);
     }
     else 
     {
         res.send([]);
     }
   });
 

}

exports.tracking_history_italthai = tracking_history_italthai;
exports.tracking_realtime_italthai = tracking_realtime_italthai;
exports.set_vehicle_info_italthai = set_vehicle_info_italthai;
exports.get_vehicle_info_italthai = get_vehicle_info_italthai;

exports.rp_maintanace_italthai = rp_maintanace_italthai;
exports.rp_graph_working = rp_graph_working;
exports.rp_graph_vehicle_status_italthai = rp_graph_vehicle_status_italthai;
exports.rp_graph_efficient = rp_graph_efficient;
exports.chart_oil_percent_italthai  = chart_oil_percent_italthai;
exports.set_note_italthai = set_note_italthai;
exports.get_report_note_italthai = get_report_note_italthai;
exports.get_report_usage_vehicle_italthai = get_report_usage_vehicle_italthai;
exports.get_report_inout_geom_italthai = get_report_inout_geom_italthai;

exports.maintanace_italthai  = maintanace_italthai;
exports.set_hour_start_service  = set_hour_start_service;
exports.get_report_parking_italthai = get_report_parking_italthai;
exports.get_report_idling_italthai = get_report_idling_italthai;

exports.get_report_summary_italthai = get_report_summary_italthai;  //call from backend_report inception

//tracking_realtime_italthai('','')

//chart_oil_percent_italthai('','')
 /* rp_Graph_Efficient
 
 
SELECT COALESCE(SUM(timeuse),'0') as sum FROM rp_trip 
WHERE modem_id='142190463056' AND start_date >='2020-01-26 00:00' AND start_date <='2020-01-30 23:59'
 UNION ALL 
SELECT COALESCE(SUM(timeuse),'0') as sum  FROM rp_parking 
WHERE modem_id='142190463056' AND start_date >='2020-01-26 00:00' AND start_date <='2020-01-30 23:59'
 UNION ALL 
SELECT COALESCE(SUM(timeuse),'0') as sum  FROM rp_idleling 
WHERE modem_id='142190463056' AND start_date >='2020-01-26 00:00' AND start_date <='2020-01-30 23:59'

 WITH resx as ( 
SELECT date_trunc('day', dd):: date as datex 
FROM generate_series 
( to_char('2019-10-01'::timestamp,'YYYY-MM-DD')::timestamp 
  , to_char('2019-10-02'::timestamp,'YYYY-MM-DD')::timestamp 
    , '1 day'::interval) dd 
  )

--SELECT * FROM resx

  SELECT idate(datex) as datetime 
 ,fn_rp_trip_graph('142190463056',datex::varchar) as trip_timeuse 
 ,fn_rp_parking_graph('142190463056',datex::varchar) as parking_timeuse 
 ,fn_rp_idleling_graph('142190463056',datex::varchar) as idleling_timeuse 
 FROM resx 
 */


 function test()
 {
    var working = parseInt(333)/60;
    var parking = parseInt(212)/60;
    var idleling = parseInt(925)/60;

     var sum_hr = working + parking + idleling;

    if(sum_hr < 24){
       var diff_hr = 24- sum_hr
       parking = parking+diff_hr;
    }

    var sum_idleling = idleling;
    var sum_parking =  parking;
    var sum_working = working;

    var prun = ((working / sum_hr) * 100).toFixed(2);

    var ppark = ((parking / sum_hr) * 100).toFixed(2);

    var pidle = ((idleling / sum_hr) * 100).toFixed(2);

 }


 //test();
 //set_note_italthai(' ',' ');

 //get_maintanace_working_hour_italthai('','')
 //chart_oil_percent_italthai(' ',' ');

