
 //#region modules
var request = require("request");
var squel = require("squel");

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";

var api_noti = 'http://127.0.0.1:9003/api/noti'; //real  
var api_tracking = 'http://127.0.0.1:9003/api/trackingio'; //real
var api_talk = 'http://127.0.0.1:9003/api/talk'; //real
var api_sensor_noti = 'http://127.0.0.1:8002/api/noti_sensor'; //real call by backend_sensor.js 



//var api_noti = 'http://61.91.14.253:9003/api/noti'; //test
//var api_tracking = 'http://61.91.14.253:9003/api/trackingio'; //test
//var api_talk = 'http://61.91.14.253:9003/api/talk';
//var sockio = require('iSend_sockio.js');
//#endregion

function noti_tracking_sensor(data, callback)
{
    debugger;

   send_sockio(api_sensor_noti, data, function (xres) {
        callback(xres);
        return;
    });

}

//tcp_pg.js call
function noti_overspeed(data,callback)
{

    var msg_th = 'รถ ' + data.vehicle_name + ' ความเร็วเกิน ' + data.speed_over + ' km/h setting (' + data.speed_setting + ')';
    var msg_en = 'vehicle ' + data.vehicle_name + ' OverSpeed ' + data.speed_over + ' km/h setting (' + data.speed_setting + ')';

    var message_json = {
        "fleet_id": data.fleet_id //"db_10002"
        , "message_th": msg_th
        , "message_en": msg_en
        , 'colour': '4'
        , 'header': 'noti'
    }

   send_sockio(api_noti, message_json, function (xres) {
        callback(message_json);
        return;
    });

}

function noti_tow_alert(data, callback)
{

    var msg_th = 'รถ ' + data.vehicle_name + ' ถูกถอดเสา'; // + data.speed_over + ' km/h setting (' + data.speed_setting + ')';
    var msg_en = 'vehicle ' + data.vehicle_name + ' Tow Alert'; //+ data.speed_over + ' km/h setting (' + data.speed_setting + ')';

    var message_json = {
        "fleet_id": data.fleet_id //"db_10002"
        , "message_th": msg_th
        , "message_en": msg_en
        , 'colour': '4'
        , 'header': 'noti'
    }

   send_sockio(api_noti, message_json, function (xres) {
        callback(message_json);
        return;
    });

}

function noti_tracking(data, callback)
{
    debugger;

   send_sockio(api_tracking, data, function (xres) {
        callback(xres);
        return;
    });

}

function noti_talk(data, callback) {
    debugger;
    //var message_json = {
    //    "fleet_id": data.fleet_id //"db_10002"
    //   , "message_response": data.msg_response
    //}

    console.log('noti_talk ' + JSON.stringify(data));
        
    send_sockio(api_talk, data, function (xres) {
        callback(xres);
        return;
    });

}

function noti_carmera(data, callback) {

    var message_json = {
        "fleet_id": data.fleet_id //"db_10002"
      , "message_th": msg_th
      , "message_en": msg_en
      , 'colour': '4'
      , 'header': 'noti'
    }

    send_sockio(api_noti, message_json, function (xres) {
        callback(message_json);
        return;
    });
}



function add_noti_history(msg,ar,callback)
{
    
    //event_id 1 = overspeed , 2 = in, geom 3=out ,4 tow alert
    var sql_insrt = squel.insert()
           .into("noti_details")
           .set("fleetid", msg.fleet_id)
           .set("message_th", msg.message_th)
           .set("message_en", msg.message_en)
           .set("colour", msg.colour)

           .set("event_id", ar.event_id)
           .set("modem_id", ar.modem_id)
           .set("date_event", ar.date_event)
           .set("loc_th", ar.loc_th)
           .set("loc_en", ar.loc_en)
           .set("lon", ar.lon)
           .set("lat", ar.lat)
           .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, sql_insrt, function (is_ok)
    {
        debugger;
        callback(is_ok);
        return;
       // res.json({ success: true, message: 'Completed set noti.' });
    });

}




function iPost(url, JsonBody, callback) {
    request({
        uri: url,
        json: true,
        method: "POST",
        body: JsonBody
    }, function (error, response, body) {

        if (error) {
            console.log("err iPost : " + error.message);
        }
        callback(body);
        return;
    });
}

function send_sockio(api_name, message_json, callback) {
    debugger;
    //noti/db_10002/ความเร็วเกินกำหนด125
    //var api_name ='trackingio';
    //var json = {
    //    "fleet_id": "db_10002",
    //    "message": "รถเข้าสถานีzzz"
    //}

    iPost(api_name, message_json, function (response) {
        debugger;
      //  console.log('send_to_sockio ' + response);
        callback(response);
        return;
    });

}

exports.noti_tracking_sensor = noti_tracking_sensor;
exports.noti_overspeed = noti_overspeed;
exports.add_noti_history = add_noti_history;
exports.noti_tow_alert = noti_tow_alert;
exports.noti_tracking = noti_tracking;
exports.noti_talk = noti_talk;


    /*
setTimeout(function ()
{
    
    //var xdata = { 'fleet_id': 'db_10001', 'vehiclename': '4กพ-4897', 'speed_over': '120', 'speed_setting': '80' };
    //noti_overspeed(xdata, function (xr) {
    //    debugger;
    //    console.log(xr);
    //});
    

    var ar = {
        "header":'tracking',
        "modem_id": "1010001019",
        "vehiclename": "2กก9104",
        //"car_licence" :'',
        "gps_datetime": "2016-08-26 16:54:23",
        "longtitude": "100.765815",
        "lattitude": "14.025295",
        "speed": "0",
        "direction": "0",
        "altitude": "19",
        "satellites": "12",
        "message_id": "2",
        "input_status": "0",
        "output_status": "0",
        "analog_input1": "0.000",
        //"analog_input2": "0.000",
        "mileage": 0,
        "tambol": "ลำผักกูด",
        "etambol": "LAM PHAK KUT",
        "amphur": "ธัญบุรี",
        "eamphur": "Thanyaburi",
        "province": "ปทุมธานี",
        "eprovince": "Pathum Thani",
        "time_server_fin": "2016-08-27 15:47:11.713",
        "angle": 0,
        "status": 1,
        "reserved": "0.000",
        "rtc_datetime": "2016-08-26 16:54:23",
        "time_server_recive": "2016-08-27 15:46:59.809",
        "heading": 3, // "status": 1, "angle": 0,  as heading
        "db_name": "db_10001",
        "speedmax": 80,
    };

    noti_tracking(ar, function (xre) {
        debugger;
        console.log(xre);
    });

}, 1000);
*/


