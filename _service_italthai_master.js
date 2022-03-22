var request = require('request');
var mustache = require("mustache");
var timespan = require('timespan');
var squel = require("squel");
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var utl = require('Utility.js');

var db_config = "master_config";
var db_owner ='db_10036'

var status_working = "2400";
var status_idleling ="2600";
var status_parking ="2000"



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

function tracking_realtime_italthai(object,req, res)
{ 

    /* 
    object= { db_name: 'db_10036',
 fleetname: 'italthai',
  vehicle_tracking: [] }
 */

    var sql='';
    sql += "WITH res as(  SELECT DISTINCT r.modem_id ";
    sql += ",get_vehiclename_fleet(r.modem_id,r.fleet_id) as vehicle_name ,get_carlicence(r.modem_id) as car_licence";
    sql += ",idate(gps_datetime)as gps_datetime,  lon, lat, speed,get_speed_limit(r.modem_id) as speedmax, direction ";
    sql += ",altitude, satelites, message_id, input_status, output_status ";
    sql += ",r.analog_input1, r.analog_input2, mileage";
    sql += ",tambol, etambol, amphur,eamphur, province, eprovince";
    sql += ",idate(time_server_fin)as time_server, angle, r.oil_percent, r.oil_liter,status";
   // sql += ",status,status||'_'||angle as heading,status||'_'||angle as status_angle";
  //  sql += " ,CASE  WHEN CAST(r.analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as xstatus "
   // sql += ",get_model_device(r.modem_id) as model_device";
    sql += ",get_model_device(r.modem_id) as model_device ";
    sql += ",coalesce (driver_prefix||' '||driver_name||' '||driver_surname,'') as driver_name ";
    sql += ",coalesce(driver_id,'') as driver_id,coalesce(driver_no,'') as driver_no,coalesce(substr(driver_type, 1,2),'') as driver_type  ";
    sql += ",coalesce(CASE WHEN driver_sex='1' THEN 'ชาย' WHEN driver_sex='2' THEN 'หญิง'  END,'') as driver_sex_th  ";
    sql += ",coalesce(CASE WHEN driver_sex='1' THEN 'Male'  WHEN driver_sex='2' THEN 'Female'  END,'') as driver_sex_en ";
    sql += ",coalesce(driver_birthcard,'') as driver_birthcard,coalesce(driver_expirecard,'') as driver_expirecard";
    sql += ",get_has_card_reader(r.modem_id) as has_card_reader ";
    sql += ",dblink_countworking_italthai(r.fleet_id,r.modem_id)::numeric::integer  as working_hour ";
    sql += ",'0' as calibrate_working_hour "
    sql += ",coalesce(r.oil_liter,'100') as oil_liter ";
    sql += " FROM	realtime as r, setup_vehicle as sv";

    is_master_fleet(object.fleetname,function(is_master_fleet)
    {
        if(is_master_fleet=='1')
        {
            sql += " WHERE r.modem_id=sv.modem_id AND sv.fleetid=" + utl.sqote(object.db_name) + "";
            sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' ) ";
            sql += " ORDER BY r.modem_id ASC ";
        }
        else
        {
            sql += " WHERE r.modem_id=sv.modem_id AND sv.fleetcode=get_fleetid(" + utl.sqote(object.fleetname) + ")";
            sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('kmp')!='23' ) ";
            sql += " ORDER BY r.modem_id ASC ";
        }


      //  sql += " ) ";
        sql += ") SELECT *,status,status||'_'||angle as heading,status||'_'||angle as status_angle FROM res ";
        

     //   console.log(sql);

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
        sql += " ,message_id,analog_input1,analog_input2,status";
       // sql += " ,CASE  WHEN CAST(analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as status";
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
   // var ar = { 'fleetid': 'db_1036', 'fleetname': 'italthai' };

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
    sql += " ,dblink_countworking_italthai(sv.fleetid,sv.modem_id)::numeric::integer  as working_hour ";
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
   // .set("chassesno", ar.chassesno)
    .set("vehicle_model_id", ar.vehicle_model_id)
    .set("vehicle_color_id", ar.vehicle_color_id)
    
    .set("oil_level", ar.km_per_lite)
    .set("fueltank", ar.fueltank)

    .set("fuelempty", b.fuel_empty)
    .set("fuelfull", b.fuel_full)
    .set("set_point1", b.set_point_1)
    .set("set_point2", b.set_point_2)
    .set("set_point3", b.set_point_3)
   // .set("set_actual1", b.set_actual_1)
   // .set("set_actual2", b.set_actual_2)
  //  .set("set_actual3", b.set_actual_3)
    .set("calibrate_working_hour", b.calibrate_working_hour)

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
         sql += ",etambol||':'||eamphur||':'||eprovince as eloc,status ";
    //     sql += ",CASE   WHEN CAST(analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as status";
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

    var sql="";
   sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
   sql += " FROM " + tb_name +" ";
   sql += " WHERE  gps_datetime >= " + utl.sqote(start);
   sql += " AND gps_datetime <=" + utl.sqote(stop) +" AND analog_input2 = "+utl.sqote(status_working);
   sql += " UNION ALL ";
   sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
   sql += " FROM " + tb_name +" ";
   sql += " WHERE  gps_datetime >= " + utl.sqote(start);
   sql += " AND gps_datetime <=" + utl.sqote(stop)+" AND analog_input2 = "+utl.sqote(status_parking);
   sql += " UNION ALL ";
   sql += " SELECT COALESCE(count(analog_input2),'0') as sum  ";       
   sql += " FROM " + tb_name +" ";
   sql += " WHERE  gps_datetime >= " + utl.sqote(start);
   sql += " AND gps_datetime <=" + utl.sqote(stop)+" AND analog_input2 = "+utl.sqote(status_idleling);

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


           res.send(result);
           // console.log(rows);
       }
       else
       {
           res.send([]);
       }
   });

 }

 function get_result_textbelow_chartfuel(req, res)
 {
     /*
    var db_name = req.body.fleetid; //'db_10001'; //
    var modem_id = req.body.modemid; //'1010001030';// 
    var start = req.body.start; // '2016-09-09 00:00';//
    var stop = req.body.stop; //'2016-09-09 23:59';//
    var tb_name = "ht_" + modem_id;
    */
    var db_name = 'db_10036'; //req.body.fleetid; //
    var modem_id = '142190463056';// req.body.modemid; //
    var start = '2020-06-01 00:00';//req.body.start; // 
    var stop = '2020-06-01 23:59';//req.body.stop; //

    var tb_name = "ht_" + modem_id;

    var sql="";
    sql += " SELECT COALESCE(count(analog_input2),'0') as sum_status_working  ";       
    sql += " FROM " + tb_name +" ";
    sql += " WHERE  gps_datetime >= " + utl.sqote(start);
    sql += " AND gps_datetime <=" + utl.sqote(stop) +" AND analog_input2 = "+utl.sqote(status_working);

  

    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
        if (rows.length > 0)
        {
            var working = parseInt(rows[0]['sum_status_working']);
             working = parseFloat((working / 60.0).toFixed(2));
             get_fuel_consumtion(modem_id,function(fuel_con)
            {
                var total_liter_usage = (fuel_con * working).toFixed(2);

                var exres={'total_liter_usage':total_liter_usage,'fuel_consumption':fuel_con,'total_working':working}
            });
          

        }
        else
        {
            res.send([]);
        }
    });
 
    function get_fuel_consumtion(modem_id,callback)
{
    var sql =" SELECT fuel_consumption FROM master_config_vehicle WHERE modem_id='"+modem_id+"' ";

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

   var db_name = 'db_10033'; //req.body.fleetid; //
    var modem_id =  '142181155700';//req.body.modemid; //
    var start = '2019-08-03 00:00';//req.body.start; // 
    var stop = '2019-08-03 23:59' //req.body.stop; //'2017-01-07 23:59';//
    var tb_name = "ht_" + modem_id;

  */
  
    //#endregion
    var db_name = 'db_10036'; //req.body.fleetid; //
    var modem_id = '142190463056';// req.body.modemid; //
    var start = '2020-06-01 00:00';//req.body.start; // 
    var stop = '2020-06-01 23:59';//req.body.stop; //
    var tb_name = "ht_" + modem_id;

    tb_name ="ht_142190463056";
    db_name="db_10036";
       //to_char(gps_datetime, 'YYYYMMDDHH24MI')as gps_datetime
       var sql = "";
       sql += " SELECT DISTINCT gps_datetime";
       sql += " ,TRUNC(COALESCE(oil_percent,0.0)::numeric, 2 )  as oil_percent ";
       sql += " ,TRUNC(COALESCE(oil_liter,0.0)::numeric, 2 )  as oil_liter ";
       sql += ",tambol||':'||amphur||':'||province as tloc ";
       sql += ",etambol||':'||eamphur||':'||eprovince as eloc ";
       //italthai
    
        sql += ",CASE  WHEN CAST(analog_input2 as int)=2400 THEN '3' WHEN CAST(analog_input2 as int)=2402 THEN '2' ELSE status END as status";
       
    
       sql += " FROM " + tb_name;
       sql += " WHERE  gps_datetime >= " + utl.sqote(start);
       sql += " AND gps_datetime <=" + utl.sqote(stop);
       sql += " ORDER BY gps_datetime ASC";
   

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
               var result5 = mustache.render(strMustache6, rows);

               var status = mustache.render(strMustache5, rows);

               result1 = utl.iRmend(result1);
               result1 = '{ "name":"time","data":[' + result1 + '] }';
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

               result5 = utl.iRmend(result5);
               result5 = '{ "fuel_avg":"xfuel_avg","data":[' + result5 + '] }';
               result5 = result5.replace(/&quot;/g, '"');

               status = utl.iRmend(status);
               status = '{ "status":"xstatus","data":[' + status + '] }';
               status = status.replace(/&quot;/g, '"');

               res.send('['+result1 +','+ result2+','+ result3+','+ result4+','+ result5+','+status+']');
           }
           else {
               res.send([]);
           }
       });


}

//chart_oil_percent_italthai('','');

//get_result_textbelow_chartfuel('','');

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


exports.tracking_history_italthai = tracking_history_italthai;
exports.tracking_realtime_italthai = tracking_realtime_italthai;
exports.set_vehicle_info_italthai = set_vehicle_info_italthai;
exports.get_vehicle_info_italthai = get_vehicle_info_italthai;

exports.rp_maintanace_italthai = rp_maintanace_italthai;
exports.rp_graph_working = rp_graph_working;
exports.rp_graph_vehicle_status_italthai = rp_graph_vehicle_status_italthai;
exports.rp_graph_efficient = rp_graph_efficient;
exports.chart_oil_percent_italthai = chart_oil_percent_italthai;


//get_vehicle_info_italthai('','')