//#region
var net = require('net');
var prettyjson = require('prettyjson');
var utl = require('Utility.js');
var host = '127.0.0.1';//'203.151.4.8'; //
var port = 6004;

var irec_now = require('htt_master_realtime.js');

//#endregion

/*
 
--harvest 33  35
--truck 233   regis 221   not found 89
--unregis 296

 */

var server = net.createServer(function (socket)
{
    socket.on('data', function (buffer)
    {
        debugger;
      //  console.log(JSON.stringify(buffer)); //decimal data

        // do whatever that we want with buffer
        var data = buffer.toString('utf-8');
        data = JSON.parse(data);
       // console.log(data);

        //  data = JSON.stringify(data);
      // console.log(JSON.stringify(data));
        //var data2 = {
        //    "relid": "38465"
        //    , "old": { "gps_time": null, "start_trip_distance": null, "mticdriver_name": " ", "ecu_battery_volt": 0, "blackbox_temp": null, "mticdriver_id": " ", "htt_status_useability": "ready", "alert_idle": null, "attitude": null, "driver_id": "0", "ecu_fule_litper_minuite": 0, "r_speed": 0, "ecu_chl_suddenly": 0, "r_io2": "00000000", "ext2": null, "ext1": null, "is_ecu": "0", "ecu_throttle_position": 0, "r_value": 30, "headding": 90, "tmp_station_id": null, "station_id": null, "spacial_status": 86, "htt_cuttingtime": null, "ecu_hrpm": 0, "check_danger": null, "compass": null, "ip_mail_tcp": "undefined", "etambol": "KHOK SA-AT", "hourmeter": null, "r_time_terminal": "2015-11-11 18:52:02", "htt_match_harvester_truck": null, "r_lon": 102.123, "mticdriver_sex": null, "id_node": "undefined", "htt_qt": null, "ecu_distance_meter": 0, "cell_site_id": null, "ecu_fule_consumption": 0, "ecu_fule_system": 0, "r_analog2": 0, "r_analog3": 0, "ig_day_time": null, "r_analog1": 0, "ecu_rpm": 0, "ecu_air_intake_temp": 0, "htt_name_farmer": null, "check_tracking": null, "htt_status_cutting": "10", "s_station_time": null, "mticdriver_personalcard": " ", "min_speed": null, "email": "13py01webhtt@ib166.com", "htt_place": null, "timedrive": null, "flagreport": "0", "lastupdate": "2015-10-27 14:29:38", "has_tbz": "1", "dtc_counter_idle": null, "max_speed": null, "gsm_value": 18, "station_lat": null, "sattelite_value": 5, "idle_day_time": null, "htt_status_operation": "STOP", "tmp_station_time": null, "ecu_fule_collect": 0, "remark": "16.478346&&102.12217", "ecu_hahd": 0, "ip_server_node": " ", "mticdriver_surname": " ", "odspeed": 0, "r_oil": 22, "r_lat": 16.4775, "htt_plotcode": null, "direction_gps": null, "htt_truck_distance": null, "satelites": null, "routealert": "0", "eamphur": "Phukhieo", "ecu_air_flow_rate": 0, "htt_is_send_order_distance": "0", "ecu_status": 0, "truck_radio_id": "0953674470", "blackbox_id": "189600101733", "htt_phone_farmer": null, "ecu_speed": 0, "dtc_counter_pto1": null, "dtc_counter_pto2": null, "dtc_counter_pto3": null, "htt_workout_zone": "workout_zone", "smscontrol_engin": null, "r_status": 32, "tmp_station_name": null, "serial_sim": "8966003215900807541", "alert_pto2": null, "htt_id_lost": null, "alert_pto1": null, "hdop": 1, "dtc_counter_start": null, "eprovince": "Chaiyaphum", "mticdriver_prefix": " ", "mticdriver_branch": null, "r_distance": 6.7378955, "station_lon": null, "timereport": null, "pic_path": null, "gps_status": "A", "volt_car": 23404, "nextupdate": null, "stationtype_id": null, "htt_truck_name": null, "htt_harvester_or_truck": "0", "id": 266, "lastdistance": null, "r_time": "2015-11-11 14:11:45", "employee_id": "0", "gsm_values": null, "vdo_streamming": null, "routename": null, "htt_harvester_name": null, "internalvolt_in": null, "alert_notupdate": null, "out_of_scope": null, "lastupdate_trip": "2015-10-27 14:29:38", "smscontrol_emer": null, "province": "à¸à¸±à¸¢à¸ à¸¹à¸¡à¸´", "force_s": null, "mticdriver_no": null, "tmp_station_type_id": null, "ecu_fule_pressure": 0, "r_version": "SMARTi3G020122", "htt_transectionid": null, "dtc_counter_over_speed": null, "volt_battery": 359, "ecu_engine_load": 0, "htt_status_truck": "EMPTY", "station_name": null, "alert_car_out_path": null, "amphur": "à¸ à¸¹à¹à¸à¸µà¸¢à¸§", "cell_site_name": null, "mticdriver_type": null, "ecu_distance_count": 0, "tambol": "à¹à¸à¸à¸ªà¸°à¸­à¸²à¸", "accumulate_distance": null, "timecard": null, "alert_stop": null, "start_day_distance": null, "ecu_coolent_temp": 0, "over_speed_day_time": null, "r_io": "1100000000", "_r_datasend": "2015-11-11 18:52:23" }
        //    , "name": "mytrigger", "level": "ROW", "table_schema": "public", "args": null, "when": "AFTER", "table_name": "rec_now"
        //    , "new": { "gps_time": null, "start_trip_distance": null, "mticdriver_name": " ", "ecu_battery_volt": 0, "blackbox_temp": null, "mticdriver_id": " ", "htt_status_useability": "ready", "alert_idle": null, "attitude": null, "driver_id": "0", "ecu_fule_litper_minuite": 0, "r_speed": 0, "ecu_chl_suddenly": 0, "r_io2": "00000000", "ext2": null, "ext1": null, "is_ecu": "0", "ecu_throttle_position": 0, "r_value": 30, "headding": 90, "tmp_station_id": null, "station_id": null, "spacial_status": 86, "htt_cuttingtime": null, "ecu_hrpm": 0, "check_danger": null, "compass": null, "ip_mail_tcp": "undefined", "etambol": "KHOK SA-AT", "hourmeter": null, "r_time_terminal": "2015-11-11 18:52:02", "htt_match_harvester_truck": null, "r_lon": 102.123, "mticdriver_sex": null, "id_node": "undefined", "htt_qt": null, "ecu_distance_meter": 0, "cell_site_id": null, "ecu_fule_consumption": 0, "ecu_fule_system": 0, "r_analog2": 0, "r_analog3": 0, "ig_day_time": null, "r_analog1": 0, "ecu_rpm": 0, "ecu_air_intake_temp": 0, "htt_name_farmer": null, "check_tracking": null, "htt_status_cutting": "10", "s_station_time": null, "mticdriver_personalcard": " ", "min_speed": null, "email": "13py01webhtt@ib166.com", "htt_place": null, "timedrive": null, "flagreport": "0", "lastupdate": "2015-10-27 14:29:38", "has_tbz": "1", "dtc_counter_idle": null, "max_speed": null, "gsm_value": 18, "station_lat": null, "sattelite_value": 5, "idle_day_time": null, "htt_status_operation": "STOP", "tmp_station_time": null, "ecu_fule_collect": 0, "remark": "16.478346&&102.12217", "ecu_hahd": 0, "ip_server_node": " ", "mticdriver_surname": " ", "odspeed": 0, "r_oil": 22, "r_lat": 16.4775, "htt_plotcode": null, "direction_gps": null, "htt_truck_distance": null, "satelites": null, "routealert": "0", "eamphur": "Phukhieo", "ecu_air_flow_rate": 0, "htt_is_send_order_distance": "0", "ecu_status": 0, "truck_radio_id": "0953674470", "blackbox_id": "189600101733", "htt_phone_farmer": null, "ecu_speed": 0, "dtc_counter_pto1": null, "dtc_counter_pto2": null, "dtc_counter_pto3": null, "htt_workout_zone": "workout_zone", "smscontrol_engin": null, "r_status": 32, "tmp_station_name": null, "serial_sim": "8966003215900807541", "alert_pto2": null, "htt_id_lost": null, "alert_pto1": null, "hdop": 1, "dtc_counter_start": null, "eprovince": "Chaiyaphum", "mticdriver_prefix": " ", "mticdriver_branch": null, "r_distance": 6.7378955, "station_lon": null, "timereport": null, "pic_path": null, "gps_status": "A", "volt_car": 23404, "nextupdate": null, "stationtype_id": null, "htt_truck_name": null, "htt_harvester_or_truck": "0", "id": 266, "lastdistance": null, "r_time": "2015-11-11 14:11:48", "employee_id": "0", "gsm_values": null, "vdo_streamming": null, "routename": null, "htt_harvester_name": null, "internalvolt_in": null, "alert_notupdate": null, "out_of_scope": null, "lastupdate_trip": "2015-10-27 14:29:38", "smscontrol_emer": null, "province": "à¸à¸±à¸¢à¸ à¸¹à¸¡à¸´", "force_s": null, "mticdriver_no": null, "tmp_station_type_id": null, "ecu_fule_pressure": 0, "r_version": "SMARTi3G020122", "htt_transectionid": null, "dtc_counter_over_speed": null, "volt_battery": 359, "ecu_engine_load": 0, "htt_status_truck": "EMPTY", "station_name": null, "alert_car_out_path": null, "amphur": "à¸ à¸¹à¹à¸à¸µà¸¢à¸§", "cell_site_name": null, "mticdriver_type": null, "ecu_distance_count": 0, "tambol": "à¹à¸à¸à¸ªà¸°à¸­à¸²à¸", "accumulate_distance": null, "timecard": null, "alert_stop": null, "start_day_distance": null, "ecu_coolent_temp": 0, "over_speed_day_time": null, "r_io": "1100000000", "_r_datasend": "2015-11-11 18:52:23" }
        //    , "event": "UPDATE"
        //}
        //var data = data2;

        console.log('data.event : ' + data.event + ' old.gps_datetime : ' + data.old.gps_datetime + ' new.gps_datetime : ' + data.new.gps_datetime + ' htt_harvester_or_truck :' + data.new.htt_harvester_or_truck);

        if (data.event == "UPDATE" && data.old.gps_datetime != data.new.gps_datetime)
        {
            var x = data.new;
            //var master_status = x.r_status;
            //x.r_status = x.htt_status_cutting == 10 ?  10 : x.r_status;
            //                'blackbox_id': x.blackbox_id, 'r_distance': x.r_distance, 'r_time': x.r_time, 'r_io': parseInt(utl.Left(x.r_io, 2)), 'r_status': parseInt(x.input_status)

            x = {
                'blackbox_id': x.modem_id, 'r_distance': x.mileage, 'r_time': x.gps_datetime, 'r_io': parseInt(x.input_status), 'r_status': parseInt(x.status)
                , 'r_status_old': data.old.status, 'lon': x.lon, 'lat': x.lat, 'r_speed': x.speed, 'tambol': x.tambol, 'amphur': x.amphur, 'province': x.province
                , 'htt_status_operation': x.htt_status_operation, 'htt_status_useability': x.htt_status_useability, 'htt_status_truck': x.htt_status_truck
                , 'htt_plotcode': x.htt_plotcode, 'htt_place': x.htt_place, 'htt_harvester_or_truck': x.htt_harvester_or_truck, 'htt_id_lost': x.htt_id_lost, 'htt_workout_zone': x.htt_workout_zone
                , 'htt_name_farmer': x.htt_name_farmer, 'htt_phone_farmer': x.htt_phone_farmer, 'htt_cuttingtime': x.htt_cuttingtime, 'htt_truck_distance': x.htt_truck_distance
                , 'htt_match_harvester_truck': x.htt_match_harvester_truck, 'htt_qt': x.htt_qt, 'htt_harvester_name': x.htt_harvester_name, 'htt_truck_name': x.htt_truck_name
                , 'htt_transectionid': x.htt_transectionid, 'htt_is_send_order_distance': x.htt_is_send_order_distance
            }
            
            var ilog = {
                'modem_id': x.blackbox_id, 'distance': x.r_distance, 'time': x.r_time, 'cutting_loading': x.r_io, 'status': x.r_status, 'status_old': data.old.status
                , 'lon': x.lon, 'lat': x.lat, 'speed': x.r_speed, 'htt_status_operation': x.htt_status_operation, 'htt_status_useability': x.htt_status_useability
                , 'htt_status_truck': x.htt_status_truck, 'htt_plotcode': x.htt_plotcode, 'htt_place': x.htt_place, 'htt_harvester_or_truck': x.htt_harvester_or_truck
                , 'htt_id_lost': x.htt_id_lost, 'htt_workout_zone': x.htt_workout_zone, 'htt_name_farmer': x.htt_name_farmer, 'htt_phone_farmer': x.htt_phone_farmer
                , 'htt_match_harvester_truck': x.htt_match_harvester_truck, 'htt_qt': x.htt_qt, 'htt_harvester_name': x.htt_harvester_name, 'htt_truck_name': x.htt_truck_name
                , 'htt_transectionid': x.htt_transectionid, 'htt_is_send_order_distance': x.htt_is_send_order_distance
            }

            var options = {
                indent: 4
            };

     
          
          
          

            //htt_havester_or_truck = 0  รถตัด

            if (x.htt_harvester_or_truck == 0)
            {
                  //console.log(prettyjson.render(x, options));
               // console.log(x);
                console.log('+++++++++++++++++++++++++++++++++++++++++++++++');
                console.log(prettyjson.render(ilog, options));

               // console.log(ilog);
           
                irec_now.havester_operate(x, function (res1) {
                    console.log('Havester_operate' + res1);
                });

                irec_now.havester_useability(x, function (res2) {
                    console.log('Havester_useability' + res2);
                });

                irec_now.havester_workout_zone(x, function (res3) {
                    console.log('Havester_workout_zone' + res3);
                });
                
            }
  /* 
            //htt_havester_or_truck = 1  รถบรรทุก

            if (x.htt_harvester_or_truck == 1)
            {
                irec_now.truck_operate(x, function (xs1) {
                   
                    console.log('Truck_operate' + xs1);
                });

                irec_now.truck_useability(x, function (xs2) {
                    console.log('Truck_useability' + xs2);
                });

                irec_now.truck_place(x, function (xs3) {
                    console.log('Truck_Place' + xs3);
                });

            }
           
          */

        }

    });
});

server.listen(port, host);

console.log('start on port '+port);

//#region
    /*
//http://www.postgresonline.com/journal/archives/99-Quick-Intro-to-PLPython.html    

    //https://www.simple-talk.com/sql/database-administration/database-design-a-point-in-time-architecture/

    //http://www.ibm.com/developerworks/data/library/techarticle/dm-1204db2temporaldata/

    //http://www.ibm.com/developerworks/data/library/techarticle/dm-1207db2temporalintegrity/index.html

 CREATE OR REPLACE FUNCTION sendsocket(msg character varying, host character varying, port integer)
  RETURNS integer AS
$BODY$
  import _socket
  try:
    s = _socket.socket(_socket.AF_INET, _socket.SOCK_STREAM)
    s.connect((host, port))
    s.sendall(msg)
    s.close()
    return 1
  except:
    return 0
$BODY$
  LANGUAGE plpython2u VOLATILE
  COST 100;


CREATE OR REPLACE FUNCTION myTriggerToSendSockets()
RETURNS trigger AS
$BODY$
   import json
   stmt = plpy.prepare("select sendSocket($1, $2, $3)", ["text", "text", "int"])
   rv = plpy.execute(stmt, [json.dumps(TD), "210.4.143.54", 26200])
$BODY$
LANGUAGE plpython2u VOLATILE
COST 100;


CREATE TRIGGER myTrigger
  AFTER INSERT OR UPDATE OR DELETE
  ON test_python
  FOR EACH ROW
  EXECUTE PROCEDURE myTriggerToSendSockets();

  INSERT INTO test_python (user1,user2,inum) VALUES('test2','afa','23');

{
"relid": "36815"
, "old": null
, "name": "mytrigger"
, "level": "ROW"
, "table_schema": "public"
, "args": null
, "when": "AFTER"
, "table_name": "test_python"
, "new": {"inum": 23, "user2": "afa", "user1": "test2"}
, "event": "INSERT"
}

 */

    //http://tombatossals.github.io/angular-leaflet-directive/examples/0000-viewer.html#/paths/events-example

    /*
     
CREATE OR REPLACE FUNCTION mytriggertosendsockets()
  RETURNS trigger AS
$BODY$
   import json
   stmt = plpy.prepare("select sendSocket($1, $2, $3)", ["text", "text", "int"])
   rv = plpy.execute(stmt, [json.dumps(TD),"210.4.143.54", 26200])
$BODY$
  LANGUAGE plpython2u VOLATILE
  COST 100;
ALTER FUNCTION mytriggertosendsockets()
  OWNER TO postgres;


 INSERT INTO rec_now2 (user1,user2,inum,truck_radio_id)
   VALUES('test2','afa','23','0876841096');
{"relid": "76850", "old": null, "name": "mytrigger", "level": "ROW", "table_schema": "public", "args": null, "when": "AFTER", "table_name": "rec_now2", "new": {"truck_radio_id": "0876841096", "inum": 23, "user2": "afa", "id": 5, "user1": "test2"}, "event": "INSERT"}

 */

    //#endregion


    //HTT02-01-1
    //HTT03-01-1