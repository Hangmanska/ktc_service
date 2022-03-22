
//#region module
var cors = require('cors');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var express = require('express');
var jwt = require('jsonwebtoken');
    //var process = require('child_process');//
//var http = require('http');
//var sockjs = require('sockjs');

    //var SHTT = require('./service_htt.js');
var hpt = require('hp_timer.js');
var ith = require('iTimer_Helper.js');

var SKTC = require('./backend_ktc.js');
var Report = require('./backend_reports.js');
var noti = require('./backend_sockjs_noti.js');//9004 port socket io

var alpha = require('./backend_smart_talk.js');
var tango = require('./backend_sockjs_talk.js');//9005 port socket io

var chart = require('./backend_report_chart.js');

//var suga = require('./sugar_cane_service.js');

var jwtTokenSecret = 'hangman';
var port_service = 9003;
//#endregion


//var nu = require('./path/nu');
//module.exports = function (app) {
//    app.post('/create_newissue', nu.resourcesFunc);
//};


//http://www.gianlucaguarini.com/blog/nodejs-and-a-simple-push-notification-server/

var App = express();
var apiRoutes = express.Router();




    //http://angular-ui.github.io/ui-leaflet/examples/0000-viewer.html#/layers/overlays-markers-nested-example
    //https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
    //http://na5cent.blogspot.com/2015/02/jwt-json-web-token.html
// use body parser so we can get info from POST and/or URL parameters
//serverApp.use(bodyParser.urlencoded({ extended: false }));
App.use(cors());
App.use(bodyParser.json({ limit: '50mb' }));
App.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
App.disable('etag');
//serverApp.set('superSecret', config.secret); // secret variable
App.use('/api', apiRoutes);


// route middleware to verify a token
//apiRoutes.use(SKTC.Isauthenticate);

apiRoutes.get('/', function (req, res)
{
    res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.post('/noti', function (req, res)
{
 
    var fleet_id = req.body.fleet_id;
    var message = req.body.message_th;
    //var room_id = 'db_10001';//req.id;
   // console.log(fleet_id);
    var msg = { mess: 'Welcome to the coolest API on earth! ' + fleet_id + ' ' + message };
    res.json(msg);

    noti.broadcast(req.body, fleet_id);

});


apiRoutes.post('/smart_talk', alpha.smart_talk);

apiRoutes.post('/talk', function (req, res)
{
    debugger;
    var fleet_id = req.body.fleet_id;
    var message = req.body.msg_response;
    //var room_id = 'db_10001';//req.id;
    console.log(JSON.stringify(req.body));
     var msg = { mess: 'Welcome to the coolest API on earth! ' + fleet_id, 'message': message };// ' ' + message };
    res.json(msg);

    tango.broadcast(req.body, fleet_id);
});


apiRoutes.post('/trackingio', function (req, res) {

    debugger;
    var fleet_id = req.body.db_name;
   // var message = req.body.message_th;
    //var room_id = 'db_10001';//req.id;
    // console.log(fleet_id);
  //  var msg = { mess: 'Welcome to the coolest API on earth! ' + fleet_id + ' ' + message };
  //  res.json(msg);

    noti.broadcast(req.body, fleet_id);
    var msg = { mess: 'ok :-)' + fleet_id };
    res.json(msg);

});



//apiRoutes.get('/status', SKTC.get_server_status);
//apiRoutes.get('/allinfo', SKTC.get_server_all_info);
//apiRoutes.get('/mem', SKTC.get_server_mem_info);

//#region

apiRoutes.post('/authenticate', SKTC.authenticate);

apiRoutes.post('/tracking_realtime', SKTC.tracking_realtime);
apiRoutes.post('/tracking_history', SKTC.tracking_history);

apiRoutes.post('/get_vehicle_byfleet', SKTC.get_vehicle_byfleet);
apiRoutes.post('/get_login', SKTC.authenticate); //apiRoutes.post('/get_login', SKTC.get_login);
apiRoutes.post('/get_logout', SKTC.logout);
apiRoutes.post('/set_note', SKTC.set_note);



apiRoutes.post('/set_password', SKTC.set_password);

apiRoutes.post('/get_vehicle_info', SKTC.get_vehicle_info);
apiRoutes.post('/set_vehicle_info', SKTC.set_vehicle_info);

apiRoutes.post('/get_sim', SKTC.get_sim);
apiRoutes.post('/get_color', SKTC.get_color);
apiRoutes.post('/get_brand_vehicle', SKTC.get_brand_vehicle);
apiRoutes.post('/get_detail_vehicle', SKTC.get_detail_vehicle);

//#endregion

//#region customer

apiRoutes.post('/get_customer_contract', SKTC.get_customer_contract);
apiRoutes.post('/add_customer_contract', SKTC.add_customer_contract);
apiRoutes.post('/set_customer_contract', SKTC.set_customer_contract);
apiRoutes.post('/del_customer_contract', SKTC.del_customer_contract);
//#endregion

//#region Report

apiRoutes.post('/get_report_over_speed', Report.get_report_over_speed);
apiRoutes.post('/get_report_over_speed_all_event', Report.get_report_over_speed_all_event);

apiRoutes.post('/get_report_idling', Report.get_report_idling);
apiRoutes.post('/get_report_idling_monthly', Report.get_report_idling_monthly);

apiRoutes.post('/get_report_parking', Report.get_report_parking);
apiRoutes.post('/get_report_parking_monthly', Report.get_report_parking_monthly);

apiRoutes.post('/get_report_trip', Report.get_report_trip);
apiRoutes.post('/get_report_trip_monthly', Report.get_report_trip_monthly);

apiRoutes.post('/get_report_summary_vehicle_monthly', Report.get_report_summary_vehicle_monthly);
apiRoutes.post('/get_report_summary_by_group_monthly', Report.get_report_summary_by_group_monthly);

apiRoutes.post('/get_report_inout_geom', Report.get_report_inout_geom);
apiRoutes.post('/get_report_inout_geom_by_group_monthly', Report.get_report_inout_geom_by_group_monthly);



apiRoutes.post('/get_report_tow_alert', Report.get_report_tow_alert);
apiRoutes.post('/get_report_enter_low_power_mode', Report.get_report_enter_low_power_mode);
apiRoutes.post('/get_report_note_details', Report.get_report_note_details);


apiRoutes.post('/get_report_maintanace_oil', Report.get_report_maintanace_oil);
apiRoutes.post('/get_report_maintanace_tyre', Report.get_report_maintanace_tyre);

//#endregion

//#region Geom

apiRoutes.post('/add_geom', SKTC.add_geom);
apiRoutes.post('/get_geom', SKTC.get_geom);
apiRoutes.post('/set_geom', SKTC.set_geom);
apiRoutes.post('/del_geom', SKTC.del_geom);
apiRoutes.post('/list_geom', SKTC.list_geom);
apiRoutes.post('/get_poi', SKTC.get_poi);

//#endregion

//#region notify

apiRoutes.post('/add_notify', SKTC.add_notify);
apiRoutes.post('/get_notify', SKTC.get_notify);
apiRoutes.post('/set_notify', SKTC.set_notify);
apiRoutes.post('/del_notify', SKTC.del_notify);
apiRoutes.post('/get_noti_details', SKTC.get_noti_details);
apiRoutes.post('/clr_noti_details', SKTC.clr_noti_details);

    //#endregion

//#region Chart

apiRoutes.post('/chart_speed', chart.track_speed);
apiRoutes.post('/chart_status_vehicle', chart.status_vehicle);
apiRoutes.post('/chart_utilization_vehicle_by_month', chart.utilization_vehicle_by_month);
apiRoutes.get('/chart_utilization_test', chart.utilization_test);

//#endregion

//#region
apiRoutes.post('/get_company', SKTC.get_company);
apiRoutes.post('/set_company', SKTC.set_company);

apiRoutes.get('/get_province', SKTC.get_province);

apiRoutes.post('/add_driver', SKTC.add_driver);
apiRoutes.post('/get_driver', SKTC.get_driver);


apiRoutes.post('/add_new_subfleet', SKTC.add_new_subfleet);
apiRoutes.post('/list_fleet', SKTC.list_fleet);

apiRoutes.get('/test_noti', function (req, res) {

    var fleet_id = 'db_10001';//
    //1 = green , 2 = blue , 3 = red ,4 = orange


    var msg_th = 'รถ 4กพ-4897 เข้า สถานี KTC ทดสอบ';
    var msg_en = 'vehicle 4กพ-4897 In Station KTC Test';

    var message_json = {
        "fleet_id": "db_10001"
        , "message_th": msg_th
        , "message_en": msg_en
        , 'colour': '1'
    }


    //var room_id = 'db_10001';//req.id;
    // console.log(fleet_id);
    var msg = { mess: 'Welcome to the coolest API on earth! ' + fleet_id + ' ' + msg_th };
    res.json(msg);

    noti.broadcast(message_json, fleet_id);

});

apiRoutes.get('/test_noti/:color', function (req, res) {

    var fleet_id = 'db_10001';//
    //1 = green , 2 = blue , 3 = red ,4 = orange


    var msg_th = 'รถ 4กพ-4897 เข้า สถานี KTC';
    var msg_en = 'vehicle 4กพ-4897 In Station KTC';
    var color = req.params.color;
    var message_json = {
        "fleet_id": "db_10001"
        , "message_th": msg_th
        , "message_en": msg_en
        , 'colour': color
    }


    //var room_id = 'db_10001';//req.id;
    // console.log(fleet_id);
    var msg = { mess: 'Welcome to the coolest API on earth! ' + fleet_id + ' ' + msg_th };
    res.json(msg);

    noti.broadcast(message_json, fleet_id);

});

apiRoutes.post('/diffsec', function (req, res)
{
    debugger;
    var start = req.body.d1;
    var stop = req.body.d2;
    var xstart = hpt.iso_to_ndate(start);
    var xstop = hpt.iso_to_ndate(stop);

    var _start = hpt.set_format(ith.addhours(xstart, 7, 0));
    var _stop = hpt.set_format(ith.addhours(xstop, 7, 0));

    var diffsec = hpt.diff_second( _stop,_start);

    var result = { 'start': _start, 'stop': _stop, 'diffsec': diffsec };
    console.log(result);



});



apiRoutes.post('/zone_test', SKTC.zone_test);

//#endregion

//apiRoutes.post('/get_geom_sugarcane', suga.get_geom);

//#region serverApp.listen

App.listen(port_service);
//server.listen(port_service);
console.log('KTC service  Listening on port ' + port_service + '...');

//#endregion serverApp.listen


//https://github.com/simon04/POImap