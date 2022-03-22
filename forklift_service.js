
var async = require('async');
var mustache = require("mustache");
var squel = require("squel");

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var utl = require('Utility.js');

var db_config = "master_config";
var db_owner_forklift = "db_10039"



function tracking_realtime_forklift(req, res)
{
   // debugger;
   // var tt = req.headers["x-access-token"];
   // Isauthenticate(req, res, function () {
        debugger;
//    console.log('tracking_realtime ' + req.body.fleetname);
//var object = { "db_name": 'db_10039', 'fleetname': 'nissan_nft', "vehicle_tracking": [] };
        var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname, "vehicle_tracking": [] };
        var sql = '';
       // console.log(JSON.stringify(object));

        sql += " SELECT DISTINCT r.modem_id ";
        sql += ",mcv.vehiclename as vehicle_name,get_carlicence(r.modem_id) as car_licence";
        sql += ",idate(gps_datetime)as gps_datetime,  lon, lat, speed,get_speed_limit(r.modem_id) as speedmax, direction ";
        sql += ",altitude, satelites, message_id, input_status, output_status ";
        sql += ",r.analog_input1, r.analog_input2 ";
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
        sql +=  ",r.analog_input1 as batterry,rfid ";
        sql +=  ",forklift_person_code(rfid) as person_code ";
        sql +=  ",forklift_person_name(rfid) as person_name ";
        sql +=  ",forklift_organization_unit(rfid) as organization_unit ";
        sql +=  ",allmin_run+r.forklift_minute_working_today  as working_hour ";
        sql +=  ",allmin_norun as working_norun ";
       // sql +=  ",(idlht_forklift_workinghour(r.modem_id)::NUMERIC) as working_hour ";
       // sql +=  ",(idlht_forklift_workinghour_norun(r.modem_id)::NUMERIC) as working_norun ";
     //   sql +=  ", (idlht_forklift_milelage(mcv.modem_id)::NUMERIC) as mileage ";
       // sql +=  ",forklift_img_base64(rfid) as image ";
        //  sql += ",coalesce((idlht_forklift_milelage(mcv.modem_id)::NUMERIC),'0') as mileage ";
        sql += ",CASE WHEN mvm.vehicletypeid='48' THEN dblink_forklift_can_calmileage(db_name,r.modem_id) ELSE '0' END as mileage ";
        sql +=  " ,idate(timer_rfid_update) as scan_datetime ";
        sql +=  " ,forklift_phone(rfid) as phone ";
        sql +=  " ,forklift_email(rfid) as email ";
        sql +=  " ,COALESCE(forklift_min_bat,'0') as min_bat,COALESCE(forklift_max_bat,'0') as max_bat ";
        sql += ",forklift_can_speed_motor as can_speed_motor,forklift_can_volt_batt as can_volt_batt";
        sql += ",forklift_can_percent_batt as can_percent_batt,forklift_can_temp_batt as can_temp_batt,forklift_can_speed as can_speed";      
        sql += " FROM	realtime as r, setup_vehicle as sv ,master_config_vehicle as mcv,master_vehicle_model as mvm";

        

        is_master_fleet(object.fleetname,function(is_master_fleet)
        {
            if(is_master_fleet=='1')
            {
                sql += " WHERE sv.modem_id=r.modem_id  ";
                sql += " AND sv.fleetid = mcv.db_name ";
                sql += " AND sv.modem_id = mcv.modem_id ";
                sql += " AND sv.fleetcode=get_fleetid(" + utl.sqote(object.fleetname) + ")"
                sql += " AND mcv.vehicle_model_id::int=mvm.vehiclemodelid::int ";
          
                sql += " ORDER BY mcv.vehiclename ASC ";

                

               // console.log(sql);

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
                sql += " WHERE r.modem_id=sv.modem_id AND sv.fleetcode=get_fleetid(" + utl.sqote(object.fleetname) + ")";
                sql += " AND sv.fleetid = mcv.db_name ";
                sql += " AND sv.modem_id = mcv.modem_id ";
                sql += " AND mcv.vehicle_model_id::int=mvm.vehiclemodelid::int ";
               // sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' ) ";
                sql += " ORDER BY mcv.vehiclename ASC   ";


               // console.log(sql);

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

function tracking_history_forklift(req, res)
{

  //  Isauthenticate(req, res, function ()
   // {
    

        var db_name = req.body.fleetid; //'db_10001';
        var modem_id = req.body.modemid; //'1010001004';
        var start = req.body.start; // '2016-06-04 00:00';
        var stop = req.body.stop; //'2016-06-04 23:59';
        var tb_name = "ht_" + modem_id;
        //db_name='db_10023';
 
        var prefix_model =  modem_id.substring(0,2);

        prefix_model = prefix_model =='14' ? 'VT900' : 'U1 LITE PLUS';


        query_respone();

        function query_respone()
        {
            var sql = "";
            sql += "WITH res as( SELECT row_number() OVER (ORDER BY gps_datetime) as id,modem_id,to_char(gps_datetime, 'YYYY-MM-DD HH24:MI') as gps_datetime,to_char(time_server_recive, 'YYYY-MM-DD HH24:MI') as time_server_recive,lon,lat,speed,satelites,altitude";
            sql += " ,message_id,analog_input1,analog_input2";
            sql += " ,CASE status WHEN '2' THEN (1) WHEN '3' THEN (1) ELSE '0' END as minute_working ";
           // sql += " ,round (abs((SELECT mileage FROM " + tb_name + " WHERE gps_datetime >=" + utl.sqote(start) + " LIMIT 1)-mileage)::DECIMAL,2)::text as mileage
            sql += " ,tambol, etambol, amphur,eamphur, province, eprovince,status,status||'_'||angle as heading";
            sql += " FROM " + tb_name;
            sql += " WHERE gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop);
         //   sql += " ORDER BY gps_datetime ASC 
            sql += " )" ;

            sql += "  SELECT DISTINCT gps_datetime ";
            sql += "  ,modem_id ,lon,lat,speed,satelites,altitude ";
            sql += "  ,message_id,analog_input1,analog_input2,heading ";
            sql += "  ,status,tambol, etambol, amphur,eamphur, province, eprovince,'"+prefix_model+"' as model_device ";
            sql += "  ,sum(minute_working) over (order by id asc rows between unbounded preceding and current row) as minute_working ";
            sql += "  FROM res ";
            sql += "   ORDER BY gps_datetime ASC  ";

            ipm.db.dbname = db_name;
            db.get_rows(ipm, sql, function (rows) {
                if (rows.length > 0) {
                    res.send(rows);
                }
                else {
                    res.send([]);
                }
            });
        }
       
   // });

}

function get_vehicle_info_forklift(req, res)
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
     ,coalesce(mileage_start,'0') as mileage_start,coalesce(mileage_stop,'0') as mileage_stop,coalesce(mileage_message_alert ,'') as mileage_message_alert
    ,coalesce(calibrate_working_hour,'0') as calibrate_work_time  
    ,coalesce(calibrate_battery,'0') as calibrate_battery 
    ,r.analog_input1 as batterry,coalesce(calibrate_mileage,'0') as calibrate_mileage  
    ,group_zone
		--,COALESCE((idlht_forklift_workinghour(mcv.modem_id)::NUMERIC),'0') as working_hour 
   -- ,(idlht_forklift_workinghour_norun(mcv.modem_id)::NUMERIC) as working_norun 
   ,CASE WHEN x.xVehicletypeid='48' THEN COALESCE(dblink_forklift_can_calmileage(db_name,r.modem_id),'0') ELSE '0' END as mileage 
     FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r 
     ,fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x 
     WHERE	sv.fleetcode=get_fleetid('nissan_nft') 
     AND mcv.db_name=sv.fleetid AND sv.modem_id= mcv.modem_id AND sv.modem_id=r.modem_id ORDER BY mcv.modem_id ASC
    */
    //#endregion
   

    var b = req.body;
    var ar = { 'fleetid': b.fleetid, 'fleetname': b.fleetname}
   // var ar = { 'fleetid': 'db_10001', 'fleetname': 'demoktc' };

    var sql = "";
    sql += " SELECT DISTINCT mcv.modem_id,mcv.sim,mcv.vehiclename,mcv.carlicence,mcv.speedmax,mcv.idlestop,mcv.chassesno ";
    sql += " ,mcv.vehicle_model_id,mcv.vehicle_color_id ";
    sql += " ,mcv.fuelempty,mcv.fuelfull,mcv.fueltank,mcv.oil_level as km_per_lite ";
    sql += " ,x.xvehiclebrandid as vbrand_id,x.xVehicletypeid as vtype_id,mcv.sim_brand ";
    sql += " ,mcv.min_max_temperature ::text ";
    sql += " ,coalesce( mcv.has_card_reader,'0') as has_card_reader ";
    sql += " ,coalesce(mcv.dlt_card_reader,'0') as send_dlt ";
    sql += " ,coalesce(mileage_start,'0') as mileage_start,coalesce(mileage_stop,'0') as mileage_stop,coalesce(mileage_message_alert ,'') as mileage_message_alert";
    sql += ",coalesce(calibrate_working_hour,'0') as calibrate_work_time  ";
    sql += ",coalesce(calibrate_battery,'0') as calibrate_battery ";
    sql += ",r.analog_input1 as batterry,coalesce(calibrate_mileage,'0') as calibrate_mileage  ";
    sql += ",group_zone,COALESCE((idlht_forklift_workinghour(mcv.modem_id)::NUMERIC),'0') as working_hour ";
    sql += ",(idlht_forklift_workinghour_norun(mcv.modem_id)::NUMERIC) as working_norun ";
    sql += ",CASE WHEN x.xVehicletypeid='48' THEN COALESCE(dblink_forklift_can_calmileage(db_name,r.modem_id),'0') ELSE '0' END as mileage ";
  //  sql += ",dblink_forklift_can_calmileage(db_name,r.modem_id) as mileage ";
    sql += " FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r ";
    sql += " ,fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x ";
    sql += " WHERE	sv.fleetcode=get_fleetid(" + utl.sqote(ar.fleetname) + ") ";
    sql += " AND mcv.db_name=sv.fleetid AND sv.modem_id= mcv.modem_id AND sv.modem_id=r.modem_id ORDER BY mcv.modem_id ASC";

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

function set_vehicle_info_forklift(req, res)
{
 
    var b = req.body;
    var ar = {
        'fleetid': b.fleetid, 'fleetname': b.fleetname, 'modem_id': b.modem_id
         , 'vehiclename': b.vehiclename, 'carlicence': b.carlicence ,"sim": b.sim
         , 'speedmax': b.speedmax, 'idlestop': b.idlestop, "km_per_lite": b.km_per_lite, 'fueltank': b.fueltank
         , "vbrand_id": b.vbrand_id, 'vehicle_model_id': b.vehicle_model_id, "vtype_id": b.vtype_id
         , 'vehicle_color_id': b.vehicle_color_id, "sim_brand": b.sim_brand,'calibrate_mileage':b.calibrate_mileage
         ,'calibrate_work_time':b.calibrate_work_time,'calibrate_battery':b.calibrate_battery,'group_zone':b.group_zone
         , 'message': ''
    };
    
    /*
    var ar = {
        "fleetid": "db_10039", "fleetname": "nissan_nft", "modem_id": "143190871463"
        , "vehiclename": "1ฒบ-7235", "carlicence": "1ฒบ-7235", "sim": "0649326055"
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
   // .set("chassesno", ar.chassesno)
    .set("vehicle_model_id", ar.vehicle_model_id)
    .set("vehicle_color_id", ar.vehicle_color_id)
    
   // .set("oil_level", ar.km_per_lite)
   // .set("fueltank", ar.fueltank)
    .set("calibrate_working_hour", ar.calibrate_work_time)
    .set("calibrate_battery", ar.calibrate_battery)
    .set("calibrate_mileage", ar.calibrate_mileage)
    .set("group_zone",ar.group_zone)
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
            ar.message = is_ok.message;
            add_error_message(ar, function (res_add) {
                debugger;
                res.json({ success: false, message: 'Not Complete set vehicle_info.' });
            });
        }
    });
}

function report_summary_forklift(req, res)
{

    var start = req.body.start; // '2016-06-04 00:00';
    var stop = req.body.stop; //'2016-06-04 23:59';
    var modem_id =  req.body.modemid;
    var is_all = req.body.is_all;

    var sql = "";
   sql += " SELECT ";
   sql += " forklift_get_group_zone(modem_id) as group_zone ";
   sql += " ,to_char(date_process,'YYYY-MM-DD') as date_process ";
   sql += " ,forklift_get_vehiclename(modem_id) as vehicle_name ";
   sql += ",distance";
   sql += ",itime_use(working_hour) as working_hour";
   sql += ",itime_use(working_norun) as working_norun ";
   sql += ",vibration_count ";
   sql += ",vibration_max ";
   sql += ",speed_count ";
   sql += ",speed_max ";
   sql += " FROM rp_forklift_summary  ";
   sql += " WHERE date_process >= " + utl.sqote(start);
   sql += " AND date_process <=" + utl.sqote(stop);
   if(is_all=='false' || is_all==false)
   {
    sql += " AND modem_id =" + utl.sqote(modem_id);
   }

   sql += " ORDER BY date_process ASC ";

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

function report_summary_forklift_monthly(req, res)
{
 
    var db_name = req.body.fleetid; //'db_10001';
    var year_month = req.body.year_month; // '2016-06';
    var fleetname = req.body.fleetname; //'supervisor4'
    var sql1 = ' '; 
    var isql=''

    if(fleetname !==undefined)
    {
        isql = " AND sv.fleetcode=get_fleetid("+ utl.sqote(fleetname)+")";
    
    }else{
        isql = " AND sv.fleetcode=get_fleetid(get_fleetnameby_dbname("+ utl.sqote(db_name)+"))";
    }


/*
    var sql = "";
   sql += " SELECT ";
   sql += " forklift_get_group_zone(modem_id) as group_zone ";
   sql += " ,to_char(date_process,'YYYY-MM-DD') as date_process ";
   sql += " ,forklift_get_vehiclename(modem_id) as vehicle_name ";
   sql += ",distance ";
   sql += ",working_hour ";
   sql += ",working_norun ";
   sql += ",vibration_count ";
   sql += ",vibration_max ";
   sql += ",speed_count ";
   sql += ",speed_max ";
   sql += " FROM rp_forklift_summary  ";
   sql += " WHERE to_char(date_process,'YYYY-MM') ="+utl.sqote(year_month);
   sql += " ORDER BY date_process ASC ";
   */

 var sql1 ="";
   sql1 += " SELECT DISTINCT r.modem_id ";
   sql1 += " , forklift_get_group_zone(r.modem_id) as group_zone ";
   sql1 += "  ,forklift_get_vehiclename(r.modem_id) as vehicle_name ";
   sql1 += " ,fk.distance";
   sql1 += " ,itime_use(working_hour) as working_hour ";
   sql1 += "  ,itime_use(working_norun) as working_norun";
   sql1 += "  ,COALESCE(vibration_count,0) as vibration_count";
   sql1 += "  ,COALESCE(vibration_max,0) as  vibration_max ";
   sql1 += " ,x2.xcount as ovsp_time,COALESCE(x2.xdistance,'0')  as ovsp_distance ";
   sql1 += ",x3.distance as idle_distance,COALESCE(x3.total_timeuse,'00:00') as idle_total_timeuse ";
   sql1 += ",x4.xcount as inout ";
   sql1 += " FROM	master_config_vehicle as r, setup_vehicle as sv ,rp_forklift_summary as fk";
   sql1 += ",fn_tb_sum_overspeed_by_month(r.modem_id,"+ utl.sqote(year_month)+") as x2 ";
   sql1 += ",fn_tb_sum_idleling_by_month(r.modem_id," + utl.sqote(year_month) + ") as x3 ";
   sql1 += ",fn_tb_sum_inout_geom_by_month(r.modem_id," + utl.sqote(year_month) + ") as x4 ";
   sql1 += " WHERE r.modem_id=sv.modem_id AND r.modem_id =fk.modem_id";
   sql1 += isql

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


function struct_Base_vibration()
{
    this.ax_min1='0'
    this.ax_max1='0'
    this.ay_min1='0'
    this.ay_max1='0'
    this.az_min1='0'
    this.az_max1='0'
    this.gx_min1='0'
    this.gx_max1='0'
    this.gy_min1='0'
    this.gy_max1='0'
    this.gz_min1='0'
    this.gz_max1='0'

    this.ax_min2='0'
    this.ax_max2='0'
    this.ay_min2='0'
    this.ay_max2='0'
    this.az_min2='0'
    this.az_max2='0'
    this.gx_min2='0'
    this.gx_max2='0'
    this.gy_min2='0'
    this.gy_max2='0'
    this.gz_min2='0'
    this.gz_max2='0'
}

function report_graph_vibration_forklift(req, res)
{

    var db_name = req.body.fleetid; //'db_10039'; //
    var modem_id = req.body.modemid; //'143190871472'; //
    var start =req.body.start; // '2020-07-16 00:00'; //
    var stop = req.body.stop; //'2020-07-16 23:05'; //


    var tb_name = "vb_" + modem_id;

    var sql = "";
    sql += "  SELECT idate(recive_time) as recive_time,vibration_data ";
    sql += "  FROM "+tb_name
    sql += "  WHERE recive_time >= '"+start+"' ";
    sql += "  AND recive_time <= '"+stop+"' ORDER BY recive_time ASC";

    /*
  ax_min: 6332,
  ax_max: 5672,
  ay_min: -1080,
  ay_max: 9360,
  az_min: 8160,
  az_max: 25220,
  gx_min: -1826,
  gx_max: -447,
  gy_min: -1018,
  gy_max: 1638,
  gz_min: -320,
  gz_max: 4955
    */
   
   var result='';
    ipm.db.dbname = db_owner_forklift;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0) 
        {
            for (let i = 0, len = rows.length; i < len; i++) 
            {
               // dest.push(source[x]);
               var t = rows[i].vibration_data;
               var r  = t.split(',')
               var va = new struct_Base_vibration();
               va.ax_min1 = is_empty(is_nan(r[0]));
               va.ax_max1 = is_empty(is_nan(r[1]));
               va.ay_min1 = is_empty(is_nan(r[2]));
               va.ay_max1 = is_empty(is_nan(r[3]));
               va.az_min1 = is_empty(is_nan(r[4]));
               va.az_max1 = is_empty(is_nan(r[5]));
               va.gx_min1 = is_empty(is_nan(r[6]));
               va.gx_max1 = is_empty(is_nan(r[7]));
               va.gy_min1 = is_empty(is_nan(r[8]));
               va.gy_max1 = is_empty(is_nan(r[9]));
               va.gz_min1 = is_empty(is_nan(r[10]));
               va.gz_max1 = is_empty(is_nan(r[11]));

               va.ax_min2 = is_empty(is_nan(r[12]));
               va.ax_max2 = is_empty(is_nan(r[13]));
               va.ay_min2 = is_empty(is_nan(r[14]));
               va.ay_max2 = is_empty(is_nan(r[15]));
               va.az_min2 = is_empty(is_nan(r[16]));
               va.az_max2 = is_empty(is_nan(r[17]));
               va.gx_min2 = is_empty(is_nan(r[18]));
               va.gx_max2 = is_empty(is_nan(r[19]));
               va.gy_min2 = is_empty(is_nan(r[20]));
               va.gy_max2 = is_empty(is_nan(r[21]));
               va.gz_min2 = is_empty(is_nan(r[22]));
               va.gz_max2 = is_empty(is_nan(r[23]));

                var strMustache = '{{#.}}';
                strMustache += '{"datetime":"'+ rows[i].recive_time+'"';
                strMustache += ',"data":[{';
                strMustache += '"ax_min":"{{ax_min1}}",';
                strMustache += '"ax_max":"{{ax_max1}}",';
                strMustache += '"ay_min":"{{ay_min1}}",';
                strMustache += '"ay_max":"{{ay_max1}}",';
                strMustache += '"az_min":"{{az_min1}}",';
                strMustache += '"az_max":"{{az_max1}}",';
                strMustache += '"gx_min":"{{gx_min1}}",';
                strMustache += '"gx_max":"{{gx_max1}}",';
                strMustache += '"gy_min":"{{gy_min1}}",';
                strMustache += '"gy_max":"{{gy_max1}}",';
                strMustache += '"gz_min":"{{gz_min1}}",';
                strMustache += '"gz_max":"{{gz_max1}}"';
                strMustache += '},{';
                strMustache += '"ax_min":"{{ax_min2}}",';
                strMustache += '"ax_max":"{{ax_max2}}",';
                strMustache += '"ay_min":"{{ay_min2}}",';
                strMustache += '"ay_max":"{{ay_max2}}",';
                strMustache += '"az_min":"{{az_min2}}",';
                strMustache += '"az_max":"{{az_max2}}",';
                strMustache += '"gx_min":"{{gx_min2}}",';
                strMustache += '"gx_max":"{{gx_max2}}",';
                strMustache += '"gy_min":"{{gy_min2}}",';
                strMustache += '"gy_max":"{{gy_max2}}",';
                strMustache += '"gz_min":"{{gz_min2}}",';
                strMustache += '"gz_max":"{{gz_max2}}"';
                strMustache += '}]},';
                strMustache += '{{/.}}';

                result += mustache.render(strMustache, va);

                if(i==rows.length-1)
                {
                    result = utl.iRmend(result);
               //    var final = '{ "result":' + result + ' }';
                  var final = '[ '+ result + ' ]';
                    final = final.replace(/&quot;/g, '"');
                    res.send(final);
                  //  res.send(JSON.parse(final));
                    //console.log(final);
                }

            }

       
        }
    });

    function is_nan(data){
        if(data=='NaN'){
            return '0';
        }else{
            return data;
        }
       
    }

    function is_empty(data){
        if(data===undefined){
            return '0';
        }else{
            return data;
        }
       
    }


}

function rp_graph_working_forklift(req,res)
{
    debugger;
  var modem_id = req.body.modemid; //'143190871427'; //
  var start = req.body.start; // '2017-01-25 00:00';//
  var stop = req.body.stop; //'2017-01-26 23:59'; // 

  /*
   SELECT DISTINCT gps_datetime
,CASE status WHEN '2' THEN (1) WHEN '3' THEN (1) ELSE '0' END as minute_working
 FROM ht_143190871427 
 WHERE gps_datetime >= '2020-07-26 20:00' AND gps_datetime <= '2020-07-26 21:00'
 ORDER BY gps_datetime ASC

  */

 // if(moment(engagementDate).isSame(today, 'day'))
    var sql=' ';
    sql += " SELECT get_ymd(date_process) as date_process, get_vehiclename(modem_id) as vehicle_name ";
    sql += ",working_00, working_01, working_02, working_03, working_04, working_05 , working_06, working_07, working_08, working_09, working_10,working_11, working_12 "; 
    sql += ",working_13, working_14, working_15, working_16, working_17, working_18  ,working_19, working_20, working_21, working_22, working_23 ";
    sql += " FROM rp_nissan_forklift_working_everyhour";
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

function rp_graph_speed(req, res) 
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
     */
    //#endregion

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
    sql += " ,speed";
    //sql += " ,tambol || amphur || province as tloc , etambol||eamphur||eprovince as eloc,status";
    sql += ",tambol||':'||amphur||':'||province as tloc ";
    sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
    sql += ",status";
    sql += " FROM " + tb_name;
    sql += " WHERE  gps_datetime >= " + utl.sqote(start);
    sql += " AND gps_datetime <=" + utl.sqote(stop);
    sql += " ORDER BY gps_datetime ";
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

    ipm.db.dbname = db_name;
    db.get_rows(ipm, sql, function (rows) {
         debugger;
        if (rows.length > 0) {
           
          //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
            var strMustache1 = '{{#.}}';
            strMustache1 += '"{{gps_datetime}}"';
            strMustache1 += ',';
            strMustache1 += '{{/.}}';

            var strMustache2 = '{{#.}}';
            strMustache2 += '{{speed}}';
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
            result2 = '{ "speed":"xspeed","data":[' + result2 + '] }';
            result2 = result2.replace(/&quot;/g, '"');

            result3 = utl.iRmend(result3);
            result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
            result3 = result3.replace(/&quot;/g, '"');

            result4 = utl.iRmend(result4);
            result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
            result4 = result4.replace(/&quot;/g, '"');

            res.send('['+result1 +','+ result2+','+ result3+','+ result4+']');
        }
        else {
            res.send([]);
        }
    });
   
}


/*
  SELECT DISTINCT to_char(recive_time, 'YYYY-MM-DD HH24:MI') as gps_datetime
,coalesce(can_percent_batt,'0') as voltage_battery
,ht.tambol||':'||ht.amphur||':'||ht.province as tloc 
,ht.etambol||':'||ht.eamphur||':'||ht.eprovince as eloc 
,ht.status
               -- ,status,get_forklift_minbat('"+modem_id+"') as min_bat,get_forklift_maxbat('"+modem_id+"') as max_bat 
FROM can_143190871316 as can,ht_143190871316 as ht
WHERE  recive_time >='2021-10-08 00:00'
AND recive_time <='2021-10-08 23:59'
AND to_char(recive_time, 'YYYY-MM-DD HH24:MI') = to_char(ht.gps_datetime, 'YYYY-MM-DD HH24:MI')
ORDER BY gps_datetime ASC 
*/

function chart_percent_battery_forklift(req, res) 
{
  
    var db_name = req.body.fleetid; //'db_10039'; //
    var modem_id =  req.body.modemid; //'143190871749';//
    var start = req.body.start; // '2020-08-29 00:00';//
    var stop = req.body.stop; //'2020-08-29 23:59';//
    var tb_ht = "ht_" + modem_id;
    var tb_can = "can_" + modem_id;


                var sql = "";
                sql += " SELECT DISTINCT to_char(recive_time, 'YYYY-MM-DD HH24:MI') as gps_datetime";
                sql += " ,coalesce(can_volt_batt,'0') as voltage_battery";
                sql += " ,coalesce(can_percent_batt,'0') as percent_battery";
                sql += ",tambol||':'||amphur||':'||province as tloc ";
                sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
               sql += ",CASE WHEN can_speed >0 THEN 3 ELSE 2 END as status ";
            //    sql += ",get_forklift_minbat('"+modem_id+"') as min_bat,get_forklift_maxbat('"+modem_id+"') as max_bat ";
                sql += " FROM " + tb_can+" as can , "+tb_ht +" as ht"
                sql += " WHERE recive_time >= " + utl.sqote(start);
                sql += " AND recive_time <=" + utl.sqote(stop);
                sql += " AND to_char(recive_time, 'YYYY-MM-DD HH24:MI') = to_char(ht.gps_datetime, 'YYYY-MM-DD HH24:MI') ";
                sql += " ORDER BY gps_datetime ASC  ";
            
                has_table(modem_id,db_name,function(resx)
                {
                    if(resx==true)
                    {
                        ipm.db.dbname = db_name;
                        db.get_rows(ipm, sql, function (rows) 
                        {
                            debugger;
                        
                    //      console.log('chart_oil_percent2 db_name ='+db_name+' modem_id='+modem_id+' leangt='+ rows.length)
                            if (rows.length > 0) 
                            {
                                debugger;
                            //  strMustache += '"time":{{gps_datetime}},"speed":{{speed}},"loc":{{tloc}}';
                                var strMustache1 = '{{#.}}';
                                strMustache1 += '"{{gps_datetime}}"';
                                strMustache1 += ',';
                                strMustache1 += '{{/.}}';
        
                                var strMustache2 = '{{#.}}';
                                strMustache2 += '{{percent_battery}}';
                                strMustache2 += ',';
                                strMustache2 += '{{/.}}';
        
                                var strMustache3 = '{{#.}}';
                                strMustache3 += '"{{tloc}} | {{percent_battery}} เปอร์เซ็นต์แบตเตอรี่"';
                                strMustache3 += ',';
                                strMustache3 += '{{/.}}';
        
                                var strMustache4 = '{{#.}}';
                                strMustache4 += '"{{eloc}} | {{percent_battery}} Percent_Battery"';
                                strMustache4 += ',';
                                strMustache4 += '{{/.}}';
        
        
                                var strMustache5 = '{{#.}}';
                                strMustache5 += '{{status}}';
                                strMustache5 += ',';
                                strMustache5 += '{{/.}}';
        
                                var result1 = mustache.render(strMustache1, rows);
                                var result2 = mustache.render(strMustache2, rows);
                                var result3 = mustache.render(strMustache3, rows);
                                var result4 = mustache.render(strMustache4, rows);
                                var status = mustache.render(strMustache5, rows);

                              // var result0 = '{ "min_bat":' +utl.sqote( rows[0].min_bat) + ',"max_bat":'+utl.sqote(rows[0].max_bat)+' }';
                             //  var result0 = '{ "min_bat":0,"max_bat":79 }';
                            //    result0 = result0.replace(/&quot;/g, '"');
        
                                result1 = utl.iRmend(result1);
                                result1 = '{ "name":"time","data":[' + result1 + '] }';
                                result1 = result1.replace(/&quot;/g, '"');
        
                                result2 = utl.iRmend(result2);
                                result2 = '{ "voltage_battery":"xvoltage_battery","data":[' + result2 + '] }';
                                result2 = result2.replace(/&quot;/g, '"');
        
                                result3 = utl.iRmend(result3);
                                result3 = '{ "tloc":"xtloc","data":[' + result3 + '] }';
                                result3 = result3.replace(/&quot;/g, '"');
        
                                result4 = utl.iRmend(result4);
                                result4 = '{ "eloc":"xtloc","data":[' + result4 + '] }';
                                result4 = result4.replace(/&quot;/g, '"');
        
                                status = utl.iRmend(status);
                                status = '{ "status":"xstatus","data":[' + status + '] }';
                                status = status.replace(/&quot;/g, '"');
        
                                res.send('['+result1 +','+ result2+','+ result3+','+ result4+','+status+']');
                            }
                            else {
                                res.send([]);
                            }
                        });
                    }
                    else
                    {
                        res.send([]);
                    }

                })

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

function who_is_driving_forklift(req, res)
{

//--,fn_who_is_driving_forklift('143190871464','2021-02-18 00:00','2021-02-18 23:59',to_char(gps_datetime, 'YYYY-MM-DD HH24:MI'),to_char(gps_datetime, 'YYYY-MM-DD HH24:MI'))
var modem_id="143190871464";
var start_date="2021-02-18 00:00"
var end_date="2021-02-18 23:59";

var sql=" SELECT gps_datetime,speed,angle,to_char(gps_datetime, 'YYYY-MM-DD HH24:MI') ";
sql+=" FROM ht_"+modem_id;
sql+=" WHERE gps_datetime >= '"+start_date+"' ";
sql+=" AND gps_datetime <= '"+end_date+"' ";
sql+=" ORDER BY gps_datetime ASC  ";




}


function rp_rfid_working_details(req,res)
{
    var start = req.body.start; // '2017-01-25 00:00';//
    var stop = req.body.stop; //'2017-01-26 23:59'; // 

    var sql=' ';
   
        sql += " WITH res as ( SELECT ";
        sql += " rfid as person_code ";
        sql += ",fn_forklift_driver_name(rfid) as driver_name ";
        sql += ",get_vehiclename(modem_id) as vehicle_name ";
        sql += ",idate(start_time) as start_time,idate(stop_time) as stop_time ";
        sql += ",total_min,total_distance,mileage ";
        
        sql += " FROM rp_nissan_forklift_rfid ";
        sql += " WHERE start_time >= '"+start+"' ";
        sql += " AND stop_time <= '"+stop+"' ";
        sql += " AND  total_min >= '1' ";
        sql += " ORDER BY modem_id,start_time ASC ) ";
        sql += " SELECT person_code,driver_name,vehicle_name ,start_time,stop_time ";
        sql += " ,total_min,total_distance,mileage ";
        sql += " FROM res WHERE driver_name IS NOT NULL ";

        
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

function rp_rfid_working_summary(req,res)
{
    var start = req.body.start; // '2017-01-25 00:00';//
    var stop = req.body.stop; //'2017-01-26 23:59'; // 
    var sql=' ';
   
    sql += "  WITH res as ( SELECT rfid ";
    sql += " ,fn_forklift_driver_name(rfid) as driver_name ";
    sql += " ,fn_min_to_hrs(SUM(total_min)) as working_hour ";
    sql += " ,SUM(total_distance) as distance  ";
    sql += "  FROM rp_nissan_forklift_rfid  ";
    sql += " WHERE start_time >= '"+start+"' ";
    sql += " AND stop_time <= '"+stop+"' ";
    sql += " AND  total_min >= '1' ";
    sql += " GROUP BY rfid ) SELECT * FROM res  WHERE driver_name IS NOT NULL ";

        
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

function rp_working_by_driver(req,res)
{
    var start = '2021-07-28 00:00' // req.body.start; // '2017-01-25 00:00';//
    var stop = '2021-07-28 23:59' //req.body.stop; //'2017-01-26 23:59'; // 
    var rfid = "8937174,9437901,13751506,7885608" //req.body.rfid; //"8937174,9437901,13751506,7885608"

    if(utl.Contains())




    var sql=' ';
    sql += "   WITH res as ( ";
    sql += "  SELECT rfid as person_code ";
    sql += "  ,fn_forklift_driver_name(rfid) as driver_name ";
    sql += "  ,get_vehiclename(modem_id) as vehicle_name ";
    sql += "  ,start_time,stop_time,total_min ";
    sql += "  ,round(dblink_forklift_sum_mileage('db_10039',modem_id,idate(start_time),idate(stop_time)),4) as distance  ";
    sql += "   FROM rp_nissan_forklift_rfid  ";
    sql += "  WHERE start_time >= '2021-07-28 00:00'  ";
    sql += "  AND stop_time <= '2021-07-28 23:59'  ";
    sql += "  AND rfid IN ('8937174','9437901','13751506','7885608') AND  total_min > '3' )  ";
    sql += "   SELECT person_code,driver_name,vehicle_name ";
    sql += "  ,start_time,stop_time,total_min,distance FROM res  ";
    sql += "  WHERE driver_name IS NOT NULL  ";
    sql += "  ORDER BY driver_name ASC ";

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

function rp_usage_vehicle_forklift(req,res)
{
    var db_name = req.body.fleetid; //'db_10001';//
    var modem_id = req.body.modemid; //'1010001004';//
    var start_time = req.body.start; //'2016-06-24 00:00';// 
    var end_time = req.body.stop; //'2016-06-25 23:59';//
  

/*
    var db_name = 'db_10033';//req.body.fleetid; 
    var modem_id = '142181256576'; //req.body.modemid; //

    var start_time = '2019-06-03 00:00' //req.body.start;
    var end_time ='2019-06-03 23:59' // req.body.stop;
    */

    var para = { 'db_name': db_name, 'modem_id': modem_id, 'start_time': start_time, 'end_time': end_time };

    var sql1 = ' '; 
    debugger;
    sql1 += "SELECT DISTINCT idate(start_date) as start_date,idate(end_date) as end_date  ,start_loc_th,end_loc_th ";
    sql1 += " ,start_loc_en,end_loc_en,start_lonlat,end_lonlat,modem_id ";
    sql1 += " ,itime_use(timeuse) as timeuse ";
    sql1 += " ,coalesce(round(dblink_forklift_sum_mileage('db_10039',modem_id,idate(start_date),idate(end_date)),4),'0') as distance ";
    sql1 += " ,power_consumption_per_km ";
    //sql1 += " ,ABS(((end_mile-start_mile) / get_oil_level(" + utl.sqote(para.modem_id) + "))) as fuel ";
    sql1 += " FROM rp_trip ";
    sql1 += " WHERE modem_id=" + utl.sqote(para.modem_id);
    sql1 += " AND start_date>=" + utl.sqote(para.start_time) + " ";
    sql1 += " AND end_date <=" + utl.sqote(para.end_time) + " ";
    sql1 += " AND timeuse > 1 ";

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

function rp_usage_vehicle_forklift_monthly(req,res)
{
    var db_name = req.body.fleetid; //'db_10039';
    var modem_id = req.body.modemid; //'143190871561';
    var year_month = req.body.year_month; // '2021-09';
   // console.log(req.body)

    /*
WITH res2 as (
WITH res as (
  SELECT iymd(start_date) as start_date 
      ,timeonly(min(start_date)) as start_time 
      ,timeonly(max(end_date)) as end_time 
     ,itime_use(sum(timeuse))  as timeuse 
      FROM rp_trip
      WHERE modem_id='143190871561'
      AND timeuse > '0' AND iym(start_date)='2021-07'
      GROUP BY iymd(start_date)
)
SELECT start_date,start_time,end_time,timeuse
,start_date||' '||start_time as startt
,start_date||' '||end_time as endt
 FROM res 
)
SELECT start_date,start_time,end_time,timeuse
,round(dblink_forklift_sum_mileage('db_10039','143190871561',startt,endt),4) as distance
 FROM res2
ORDER BY start_date ASC 
*/

var sql="";
sql += " WITH res2 as ( ";
sql += " WITH res as ( ";
sql += " SELECT iymd(start_date) as start_date  ";
sql += " ,timeonly(min(start_date)) as start_time "; 
sql += " ,timeonly(max(end_date)) as end_time "; 
sql += " ,itime_use(sum(timeuse))  as timeuse "; 
sql += " FROM rp_trip ";
sql += " WHERE modem_id='"+modem_id+"' ";
sql += " AND timeuse > '0' AND iym(start_date)='"+year_month+"'  ";
sql += " GROUP BY iymd(start_date)  ";
sql += " ) ";
sql += "  SELECT start_date,start_time,end_time,timeuse ";
sql += " ,start_date||' '||start_time as startt ";
sql += " ,start_date||' '||end_time as endt ";
sql += " FROM res  ";
sql += "  ) ";
sql += " SELECT start_date,start_time,end_time,timeuse ";
sql += " ,round(dblink_forklift_sum_mileage('"+db_name+"','"+modem_id+"',startt,endt),4) as distance ";
sql += "  FROM res2 ";
sql += " ORDER BY start_date ASC  ";

//console.log(sql);

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


function get_noti_details_forklift(req, res)
{
    //#region
    /*
SELECT date_event,message_th,message_en,colour,lon,lat  
FROM	noti_details as r, setup_vehicle as sv
WHERE r.modem_id=sv.modem_id 
AND sv.fleetcode=get_fleetid('combinepart')
AND is_read='0'
ORDER BY date_event DESC
    */
    //#endregion
    //Isauthenticate(req, res, function ()
    //{

      var fleet_id = req.body.fleetid;//db_10039
     var fleetname = req.body.fleetname;
    debugger;
      // var fleet_id = 'db_10001'
       var sql1 = ""; 
       sql1 += " WITH res as ( ";
        sql1 += " SELECT date_event,message_th,message_en,colour,lon,lat,is_read ";
        sql1 += "  FROM noti_details ";
        sql1 += " WHERE fleetid='"+fleet_id+"' ";
        sql1 += " AND modem_id IN (SELECT modem_id FROM setup_vehicle WHERE fleetcode=get_fleetid('"+fleetname+"')) "; 
        sql1 += " ORDER BY date_event DESC ";
        sql1 += " LIMIT 50 ";
        sql1 += " ) ";
        sql1 += " SELECT date_event,message_th,message_en,colour,lon,lat,is_read ";
        sql1 += "  FROM res ";
        sql1 += "  WHERE is_read='0' ";

        var message_json = {'total_unread':0,'data':[]}


        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql1, function (rows) {
            if (rows.length > 0) {
                // res.send(rows);
                message_json.data = rows;
                message_json.total_unread = rows.length -1;

             
                res.send(message_json);
            }
            else {
                res.send(message_json);
            }
        });
   // });
}


function rp_usage_vehicle_and_driver(req, res)
{
   
 /*
    var db_name = 'db_10039';//
    var modem_id = '1010001004';//
    var start ='2021-10-07 00:00';// 
    var stop = '2021-10-07 23:59';//
    var is_all = true;
      */

   
    var db_name = req.body.fleetid; //'db_10039';//
    var modem_id = req.body.modemid; //'1010001004';//
    var start = req.body.start; //'2016-06-24 00:00';// 
    var stop = req.body.stop; //'2016-06-25 23:59';//
    var is_all = req.body.is_all;
   

    var sql1 = ""; 
    sql1 += " WITH res as ( ";
    sql1 += "  SELECT forklift_get_group_zone(modem_id) as group_zone ";
    sql1 += ",to_char(date_process,'YYYY-MM-DD') as date_process ";
    sql1 += ",forklift_get_vehiclename(modem_id) as vehicle_name ,distance ";
    sql1 += ",itime_use(working_hour) as working_hour ";
    sql1 += ",itime_use(working_norun) as working_norun ";
    sql1 += ",itime_use(runing) as running,itime_use(idling) as idling"
    sql1 += ",itime_use(1440 -(runing+idling)) as parking ";
    sql1 += ",total_overspeed ,speed_max  ,total_slash_rfid ";
    sql1 += ",idate(first_slash_rfid) as first_slash_rfid ";
    sql1 += ",idate(end_slash_rfid) as end_slash_rfid ";
    sql1 += ",itime_use(drivertime_use_forklift) as drivertime_use_forklift,driver_name ";
    sql1 += " FROM rp_usage_vehicle_and_driver ";
    sql1 += " WHERE date_process >= '"+start+"' ";
    sql1 += " AND date_process <='"+stop+"' ";
    
    if(is_all=='false' || is_all==false)
    {
     sql1 += " AND modem_id =" + utl.sqote(modem_id);
    }
    sql1 += " ) ";

    sql1 += "  SELECT * FROM res ORDER BY group_zone ";
     

   

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql1, function (rows) 
    {
        if (rows.length > 0) 
        {
            res.send(rows);
          //console.log(rows);
        }
        else 
        {
            res.send([]);
        }
    });
}


exports.tracking_realtime_forklift = tracking_realtime_forklift;
exports.get_vehicle_info_forklift  = get_vehicle_info_forklift;
exports.set_vehicle_info_forklift = set_vehicle_info_forklift;
exports.tracking_history_forklift = tracking_history_forklift;
exports.report_summary_forklift = report_summary_forklift;
exports.report_summary_forklift_monthly = report_summary_forklift_monthly;
exports.report_graph_vibration_forklift = report_graph_vibration_forklift;
exports.rp_graph_working_forklift  = rp_graph_working_forklift;
exports.chart_percent_battery_forklift = chart_percent_battery_forklift;

exports.rp_rfid_working_details = rp_rfid_working_details;
exports.rp_rfid_working_summary = rp_rfid_working_summary;
exports.rp_usage_vehicle_forklift = rp_usage_vehicle_forklift;
exports.rp_usage_vehicle_forklift_monthly = rp_usage_vehicle_forklift_monthly;
exports.rp_usage_vehicle_and_driver  = rp_usage_vehicle_and_driver;
exports.get_noti_details_forklift  = get_noti_details_forklift;

//report_graph_vibration_forklift('','')
//chart_percent_battery_forklift('','')
//rp_working_by_driver('','')
//rp_usage_vehicle_and_driver('','')

//sql+=",coalesce(round(dblink_forklift_sum_mileage('db_10039',"+utl.sqote(modem_id)+",iymd("+utl.sqote(date_process)+")||' 00:00',iymd("+utl.sqote(date_process)+")||' 23:59'),4),'0') as distance ";