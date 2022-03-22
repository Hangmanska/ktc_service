
var net = require("net");
var utcp = require('Utility_tcp.js');
//var HOST = "61.91.14.253";//Test local
var HOST = '127.0.0.1';//real server//
var PORT_Connect = 6004; //700
var header_msg = '(*--)';
var tail_msg = '*--*';
var line_feed = "\r\n";

function send_data(buffer, cb) {
    // console.log(buffer);
    /*    */
    var socket = net.connect(PORT_Connect, HOST, function () {
        console.log("client start!!!!");
    });

    socket.on("connect", function () {
        console.log("connected");

        var nbuf = new Buffer(buffer);
        socket.write(nbuf);
        //socket.destroy();
    });

    socket.on("data", function (data) {
        debugger;
        var nbuf = new Buffer(data);
        var res = nbuf.toString('ascii');
        console.log('recive ' + res);
        var resx = JSON.stringify(data);
        console.log('recive ' + resx);
        //cb(res);
        //return;
        if (utcp.Contains(res, 'oK')) {
            //   var resx = JSON.stringify(nbuf);
            //  console.log('recive ' + res);
            //  console.log("client received: " + resx.toString());
            // socket.write('oK');
            //socket.end();
            //  socket.end();

        } else {
            console.log('recive else ' + res);
        }
        // socket.destroy(); // kill client after server's response

    });

    socket.on('close', function () {
        console.log('Connection closed');
    })

    socket.on('end', function () {
        socket.destroy();
        console.log('disconnected from server');
    });


}

var data2 = {
    "relid": "296249",
    "old": {
        "gsm_signal": null,
        "status": "1",
        "driver_type": null,
        "analog_input2": "4",
        "output_status": 0,
        "htt_qt": null,
        "htt_plotcode": null,
        "htt_status_useability": "ready",
        "data_length": null,
        "temp_num_val": null,
        "htt_id_lost": null,
        "satelites": 10,
        "oil_percent": null,
        "time_server_recive": "2016-10-31 00:50:37.221",
        "driver_id": null,
        "fleet_id": "db_10003",
        "eamphur": "Wattana Nakhon",
        "htt_transectionid": null,
        "event_decode": null,
        "gps_datetime": "2016-11-07 17:00:05",
        "command_type": null,
        "htt_harvester_or_truck": 0,
        "speed": 0,
        "io_port_status": null,
        "htt_status_operation": '',//'CUTTING_AND_LOADING',
        "analog_input3": "0",
        "driver_no": null,
        "rtc_datetime": "2016-11-07 17:00:06",
        "driver_branch": null,
        "htt_factorytime": null,
        "htt_park_inside": null,
        "htt_phone_farmer": null,
        "altitude": 36,
        "analog_input1": "0",
      
        "htt_workout_zone": null,
        "driver_surname": null,
        "driver_personalcard": null,
        "htt_status_truck": "EMPTY",
        "protocol_version": null,
        "oil_liter": null,
        "temp_senser_no": null,
        "message_id": "35",
        "modem_id": "8",//"1010003003",
        "htt_harvester_name": null,
        "province": "สระแก้ว",
        "htt_factory_leaving": null,
        "direction": 0,
        "mileage": 0,
        "htt_truck_name": null,
        "htt_farm_leaving": null,
        "driver_expirecard": null,
        "eprovince": "Srakaeo",
        "htt_truck_distance": null,
        "rfid": null,
        "time_server_fin": "2016-10-31 00:51:39.252",
        "assisted_event": null,
        "driver_prefix": null,
        "htt_cuttingtime": null,
        "htt_name_farmer": null,
        "run_time": null,
        "position_status": null,
        "lat": 13.7870896379905,
        "lon": 102.370085460477,
        "angle": "0",
        "customize_data": null,
        "etambol": "HUAI CHOT",
        "base_station": null,
        "htt_park_outside": null,
        "picture_name": null,
        "amphur": "ห้วยโจด",
        "driver_birthcard": null,
        "checksum": null,
        "tambol": "วัฒนานคร",
        "horizon_acc": null,
        "driver_sex": null,
        "heading": "0",
        "htt_match_harvester_truck": null,
        "driver_name": null,
        "htt_place": "ROAD_WITHOUT_CANE",
        "htt_is_send_order_distance": "0",
        "fuel_percentage": null,
        "htt_park_prepare": null,
        "identifier": null,
        "input_status": 5
    },
    "name": "itrigger",
    "level": "ROW",
    "table_schema": "public",
    "args": null,
    "when": "AFTER",
    "table_name": "realtime",
    "new": {
        "gsm_signal": null,
        "status": "1",
        "driver_type": null,
        "analog_input2": "4",
        "output_status": 0,
        "htt_qt": null,
        "htt_plotcode": null,
        "htt_status_useability": "ready",
        "data_length": null,
        "temp_num_val": null,
        "htt_id_lost": null,
        "satelites": 10,
        "oil_percent": null,
        "time_server_recive": "2016-10-31 00:50:37.221",
        "driver_id": null,
        "fleet_id": "db_10003",
        "eamphur": "Wattana Nakhon",
        "htt_transectionid": null,
        "event_decode": null,
        "gps_datetime": "2016-11-07 17:00:06",
        "command_type": null,
        "htt_harvester_or_truck": 0,
        "speed": 0,
        "io_port_status": null,
        "htt_status_operation": '',//'CUTTING_AND_LOADING', //val = "UNCUTTING_LOADING"
        "analog_input3": "0",
        "driver_no": null,
        "rtc_datetime": "2016-11-07 17:00:06",
        "driver_branch": null,
        "htt_factorytime": null,
        "htt_park_inside": null,
        "htt_phone_farmer": null,
        "altitude": 36,
        "analog_input1": "0",
        "lat": 13.7870896379905,
        "lon": 102.370085460477,
        "htt_workout_zone": null,
        "driver_surname": null,
        "driver_personalcard": null,
        "htt_status_truck": "EMPTY",
        "protocol_version": null,
        "oil_liter": null,
        "temp_senser_no": null,
        "message_id": "35",
        "modem_id": "8",//"1010003003",
        "htt_harvester_name": null,
        "province": "สระแก้ว",
        "htt_factory_leaving": null,
        "direction": 0,
        "mileage": 0,
        "htt_truck_name": null,
        "htt_farm_leaving": null,
        "driver_expirecard": null,
        "eprovince": "Srakaeo",
        "htt_truck_distance": null,
        "rfid": null,
        "time_server_fin": "2016-10-31 00:51:39.252",
        "assisted_event": null,
        "driver_prefix": null,
        "htt_cuttingtime": null,
        "htt_name_farmer": null,
        "run_time": null,
        "position_status": null,
        "angle": "0",
        "customize_data": null,
        "etambol": "HUAI CHOT",
        "base_station": null,
        "htt_park_outside": null,
        "picture_name": null,
        "amphur": "ห้วยโจด",
        "driver_birthcard": null,
        "checksum": null,
        "tambol": "วัฒนานคร",
        "horizon_acc": null,
        "driver_sex": null,
        "heading": "0",
        "htt_match_harvester_truck": null,
        "driver_name": null,
        "htt_place": "ROAD_WITHOUT_CANE",
        "htt_is_send_order_distance": "0",
        "fuel_percentage": null,
        "htt_park_prepare": null,
        "identifier": null,
        "input_status": 5
    },
    "event": "UPDATE"
}

setTimeout(function () {


    send_data(JSON.stringify(data2), function (x2) {
        console.log(x2);
    });

}, 1000);