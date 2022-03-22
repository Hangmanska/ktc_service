
//#region module
var cors = require('cors');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const formidable = require('express-formidable');

require('events').EventEmitter.prototype._maxListeners = 0;

var express = require('express');
var jwt = require('jsonwebtoken');
var csv = require('express-csv');
    //var process = require('child_process');//
//var http = require('http');
//var sockjs = require('sockjs');

    //var SHTT = require('./service_htt.js');
var hpt = require('hp_timer.js');
var ith = require('iTimer_Helper.js');

var SKTC = require('./backend_ktc.js');
var upload = require('./upload_all.js');
var Report = require('./backend_reports.js');
var noti = require('./backend_sockjs_noti.js');//9004 port socket io

var alpha = require('./backend_smart_talk.js');
var tango = require('./backend_sockjs_talk.js');//9005 port socket io

var sensor = require('./backend_sockjs_sensor.js');//5000 port socket io
var sensor_db = require('./sensor_db_process.js');
var sensor_cal = require('./server_sensor.js');

var chart = require('./backend_report_chart.js');
var chart_fuel = require('./backend_report_chart_fuel.js');//+++++++++
var suga = require('./sugar_cane_service.js');

var kpwp = require('./kumpawapi_service.js');
var ratchaburi = require('./ratchaburi_service.js');
var test = require('./ocsb_report_spacial.js');
var nao = require('./service_nao.js');
var ital = require('./service_italthai.js');
var nissan = require('./forklift_service.js');
//var sgc01 = require('./sugarcane_factory_01_service.js');

var xhydac = require('./test_senddata_2_sensor_hydac.js');
var tsy = require('./service_tsy.js');

var dlt = require('dlt_set_masterfile.js')
var loc = require('iAdmin_point.js')
var vt900 = require('./vt900.js');
var m2backup = require('./move_2_temp.js');

var jwtTokenSecret = 'hangman';
var port_service = 9003;
//#endregion


//var nu = require('./path/nu');
//module.exports = function (app) {
//    app.post('/create_newissue', nu.resourcesFunc);
//};

//https://www.thethingsnetwork.org/forum/t/how-to-push-the-data-to-freeboard-io/1395/2
//http://www.gianlucaguarini.com/blog/nodejs-and-a-simple-push-notification-server/
//https://stackoverflow.com/questions/43199786/add-csv-file-to-http-postupload_gpx2gis

var App = express();
var apiRoutes = express.Router();
//var busboy = require('connect-busboy');
//var json2csv = require('json2csv');
//csv = require('express-csv')
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

App.use(formidable());



// route middleware to verify a token
//apiRoutes.use(SKTC.Isauthenticate);

apiRoutes.get('/all_harvester_working/:start_time/:end_time', function (req, res)
{
    //res.json({ message: 'Welcome to the coolest API on earth!' });
   /*
    var fields = ['name', 'phone', 'mobile', 'email', 'address', 'notes'];
var fieldNames = ['Name', 'Phone', 'Mobile', 'Email', 'Address', 'Notes'];
var data = json2csv({ data: docs, fields: fields, fieldNames: fieldNames });
res.attachment('filename.csv');
res.status(200).send(data);
res.csv([
    ["a", "b", "c"]
  , ["d", "e", "f"]
  ]);
  */
 
 var start_date = req.params.start_time;
 var end_date = req.params.end_time;
 var jparm={'start_time':start_date,'end_time':end_date}

    test.get_allharvester(jparm,function(json)
    {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + start_date+'-'+end_date + '.csv\"');
        res.csv(json[0]);
    })

});

apiRoutes.get('/load_data',SKTC.load_data)

apiRoutes.post('/noti', function (req, res)
{
 
    var fleet_id = req.body.fleet_id;
    var message = req.body.message_th;
    //var room_id = 'db_10001';//req.id;
   // console.log(fleet_id);
    var msg = { mess: 'Welcome to the coolest API on earth! ' + fleet_id + ' ' + message };
    res.json(msg);

    noti.broadcast(req.body, fleet_id);

   // console.log(JSON.stringify(req.body))

});

apiRoutes.post('/noti_camera', function (req, res) {
    debugger;
    var fleet_id = req.body.fleet_id;
   // var message = req.body.message_th;
    //var room_id = 'db_10001';//req.id;
    // console.log(fleet_id);
    var msg = { mess: 'Welcome to the coolest API on earth! ' + fleet_id };
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
   // console.log(JSON.stringify(req.body));
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
   /*
   if(fleet_id=='db_10039')
   {
        console.log(JSON.stringify(req.body))
   }
   */
 
     noti.broadcast(req.body, fleet_id);
     var msg = { mess: 'ok :-)' + fleet_id };
     res.json(msg);

});


apiRoutes.post('/noti_temp', function (req, res) {

    //debugger;
  //  console.log(req.body);
    var fleet_id = req.body.db_name;
    noti.broadcast(req.body, fleet_id);
    var msg = { mess: 'ok Temp :-)' + fleet_id };
    res.json(msg);

});



apiRoutes.post('/tracking_forklift', function (req, res) 
{

    //debugger;
  //console.log(req.body);

    var fleet_id = req.body.fleet_id;

/*
    if(fleet_id=='db_10039')
    {
         console.log(JSON.stringify(req.body))
    }
*/
    noti.broadcast(req.body, fleet_id);
    var msg = { mess: 'ok Temp :-)' + fleet_id };
    res.json(msg);

});


//apiRoutes.get('/status', SKTC.get_server_status);
//apiRoutes.get('/allinfo', SKTC.get_server_all_info);
//apiRoutes.get('/mem', SKTC.get_server_mem_info);

apiRoutes.post('/authenticate', SKTC.authenticate);

apiRoutes.post('/tracking_realtime', SKTC.tracking_realtime);
//apiRoutes.post('/tracking_realtime2', SKTC.tracking_realtime2);
apiRoutes.post('/tracking_realtime_ocsb', SKTC.tracking_realtime_ocsb);

apiRoutes.post('/tracking_realtime_forklift', nissan.tracking_realtime_forklift);
apiRoutes.post('/tracking_history_forklift', nissan.tracking_history_forklift);
apiRoutes.post('/get_vehicle_info_forklift', nissan.get_vehicle_info_forklift);
apiRoutes.post('/set_vehicle_info_forklift', nissan.set_vehicle_info_forklift);
apiRoutes.post('/report_summary_forklift', nissan.report_summary_forklift);
apiRoutes.post('/rp_graph_working_forklift', nissan.rp_graph_working_forklift);
apiRoutes.post('/report_graph_vibration_forklift', nissan.report_graph_vibration_forklift);
apiRoutes.post('/chart_percent_battery_forklift', nissan.chart_percent_battery_forklift);


apiRoutes.post('/tracking_history', SKTC.tracking_history);

apiRoutes.post('/get_vehicle_byfleet', SKTC.get_vehicle_byfleet);
apiRoutes.post('/list_vehiclename_setoil', SKTC.list_vehiclename_setoil);
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

apiRoutes.post('/get_customer_contract', SKTC.get_customer_contract);
apiRoutes.post('/add_customer_contract', SKTC.add_customer_contract);
apiRoutes.post('/set_customer_contract', SKTC.set_customer_contract);
apiRoutes.post('/del_customer_contract', SKTC.del_customer_contract);

apiRoutes.post('/add_group_fleet', SKTC.add_group_fleet);
apiRoutes.post('/list_vehicle_group', SKTC.list_vehicle_group);
apiRoutes.post('/change_password', SKTC.change_password);
apiRoutes.post('/del_group_fleet', SKTC.del_group_fleet);
apiRoutes.post('/edit_group_fleet', SKTC.edit_group_fleet);



apiRoutes.post('/get_report_over_speed', Report.get_report_over_speed);
apiRoutes.post('/get_report_over_speed_all_event', Report.get_report_over_speed_all_event);
apiRoutes.post('/get_report_over_speed_group', Report.get_report_over_speed_group);

apiRoutes.post('/get_report_idling', Report.get_report_idling);
apiRoutes.post('/get_report_idling_monthly', Report.get_report_idling_monthly);
apiRoutes.post('/get_report_idling_group', Report.get_report_idling_group);

apiRoutes.post('/get_report_parking', Report.get_report_parking);
apiRoutes.post('/get_report_parking_monthly', Report.get_report_parking_monthly);

apiRoutes.post('/get_report_trip', Report.get_report_trip);
apiRoutes.post('/get_report_trip_monthly', Report.get_report_trip_monthly);

apiRoutes.post('/get_report_summary_vehicle_monthly', Report.get_report_summary_vehicle_monthly);
apiRoutes.post('/get_report_summary_by_group_monthly', Report.get_report_summary_by_group_monthly);

apiRoutes.post('/get_report_inout_geom', Report.get_report_inout_geom);
apiRoutes.post('/get_report_inout_geom_by_group_monthly', Report.get_report_inout_geom_by_group_monthly);

apiRoutes.post('/get_report_maintanace_oil', Report.get_report_maintanace_oil);
apiRoutes.post('/get_report_maintanace_tyre', Report.get_report_maintanace_tyre);


apiRoutes.post('/zone_test', SKTC.zone_test);

apiRoutes.post('/get_report_tow_alert', Report.get_report_tow_alert);
apiRoutes.post('/get_report_enter_low_power_mode', Report.get_report_enter_low_power_mode);
apiRoutes.post('/get_report_note_details', Report.get_report_note_details);

apiRoutes.post('/get_report_temperature', Report.get_report_temperature);


apiRoutes.post('/add_geom', SKTC.add_geom);
apiRoutes.post('/add_route', SKTC.add_route);
apiRoutes.post('/get_geom', SKTC.get_geom);
apiRoutes.post('/set_geom', SKTC.set_geom);
apiRoutes.post('/del_geom', SKTC.del_geom);
apiRoutes.post('/list_geom', SKTC.list_geom);
apiRoutes.post('/get_poi', SKTC.get_poi);

apiRoutes.post('/add_notify', SKTC.add_notify);
apiRoutes.post('/get_notify', SKTC.get_notify);
apiRoutes.post('/set_notify', SKTC.set_notify);
apiRoutes.post('/del_notify', SKTC.del_notify);

apiRoutes.post('/get_noti_details_limit10', SKTC.get_noti_details_limit10);
apiRoutes.post('/get_noti_details', SKTC.get_noti_details);
apiRoutes.post('/clr_noti_details', SKTC.clr_noti_details);


apiRoutes.post('/get_company', SKTC.get_company);
apiRoutes.post('/set_company', SKTC.set_company);

apiRoutes.get('/get_province', SKTC.get_province);

apiRoutes.post('/add_driver', SKTC.add_driver);
apiRoutes.post('/get_driver', SKTC.get_driver);


apiRoutes.post('/add_new_subfleet', SKTC.add_new_subfleet);
apiRoutes.post('/list_fleet', SKTC.list_fleet);
apiRoutes.post('/report_get_driver_slashcard', SKTC.report_get_driver_slashcard);
apiRoutes.post('/report_get_driver_slashcard_group', SKTC.report_get_driver_slashcard_group);
apiRoutes.post('/get_list_driver_card', SKTC.get_list_driver_card);
apiRoutes.post('/report_driver_driving_trip', SKTC.report_driver_driving_trip);


apiRoutes.post('/upload_ktc',upload.upload_ktc);


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
   // console.log(result);

});

apiRoutes.post('/chart_speed', chart.track_speed);
apiRoutes.post('/chart_status_vehicle', chart.status_vehicle);
apiRoutes.post('/chart_utilization_vehicle_by_month', chart.utilization_vehicle_by_month);
apiRoutes.post('/new_utilization_vehicle', chart.new_utilization_vehicle);
apiRoutes.get('/chart_utilization_test', chart.utilization_test);

apiRoutes.post('/chart_oil_percent', chart_fuel.chart_oil_percent);//++++++
apiRoutes.post('/chart_oil_percent_avg_with_realval', chart_fuel.chart_oil_percent_avg_with_realval);


//++++++++++++++++++ OCSB ++++++++++++++++++++++++++

apiRoutes.post('/get_geom_sugarcane', suga.get_geom);
apiRoutes.post('/get_bigfarm', suga.get_bigfarm);
apiRoutes.post('/get_bigfarm_details', suga.get_bigfarm_details);

apiRoutes.post('/set_manage_farm', suga.manage_farm);

apiRoutes.post('/get_camera_harvester',  suga.camera_harvester);

//apiRoutes.get('/xget_geom_sugarcane', suga.get_geom);

apiRoutes.get('/set_urlcamera', suga.set_urlcamera);
apiRoutes.post('/set_urlcamera_x', suga.set_urlcamera_x);

apiRoutes.post('/set_url_multicamera', suga.set_url_multicamera);

apiRoutes.post('/upload_image', multipartMiddleware, suga.retrive_image);
apiRoutes.get('/is_infarm', suga.pi_is_infarm);
apiRoutes.post('/list_image_playback', suga.list_image_playback);
apiRoutes.post('/get_image_playback', suga.get_image_playback);


apiRoutes.post('/get_working_truck', suga.get_working_truck);

apiRoutes.post('/get_working_harvester_monthly', suga.get_working_harvester_monthly);
apiRoutes.post('/get_working_harvester', suga.get_working_harvester);

// Tank water
apiRoutes.post('/get_working_tankwater_group', suga.get_working_tankwater_group);
apiRoutes.post('/get_working_tankwater', suga.get_working_tankwater);
apiRoutes.post('/get_tankwater_report_avg_speed',suga.get_tankwater_report_avg_speed);
apiRoutes.post('/get_tankwater_report_avg_speed_group',suga.get_tankwater_report_avg_speed_group);

apiRoutes.post('/get_harvester_name',suga.get_harvester_name);
apiRoutes.post('/get_tractor_name',suga.get_tractor_name);
apiRoutes.post('/get_tankwater_name',suga.get_tankwater_name);

apiRoutes.post('/get_report_avg_speed',suga.get_report_avg_speed);
apiRoutes.post('/get_report_speed',suga.get_report_speed);
apiRoutes.post('/get_report_working_harvester',suga.get_report_working_harvester);
apiRoutes.post('/get_report_working_harvester_by_vehicle',suga.get_report_working_harvester_by_vehicle);

apiRoutes.post('/master_vehicle_tankwater',suga.getmaster_vehicle_tankwater);
apiRoutes.post('/servicedata_watertank',suga.getdata_watertank);
//+++++++++++++++++++++ ratchaburi +++++++++++++++++++++++++++++

apiRoutes.post('/get_allfarm_ratchaburi',ratchaburi.get_allfarm_ratchaburi);
apiRoutes.post('/webservice_truck',ratchaburi.webservice_truck);


//+++++++++++++++++++ Kumpawapi ++++++++++++++++++++++++++++++++

apiRoutes.post('/upload_kpwp',kpwp.upload_kpwp);
apiRoutes.post('/get_total_farm_rai',kpwp.get_total_farm_rai)

apiRoutes.post('/get_report_01',kpwp.get_report_01)
apiRoutes.post('/get_report_02',kpwp.get_report_02)
apiRoutes.post('/get_report_03',kpwp.get_report_03)
apiRoutes.post('/get_report_04',kpwp.get_report_04)
apiRoutes.post('/get_report_05',kpwp.get_report_05)
apiRoutes.post('/report_driving_history',kpwp.report_driving_history);
apiRoutes.post('/report_waitting_in_factory',kpwp.report_waitting_in_factory);

apiRoutes.post('/get_allfarm',kpwp.get_allfarm);
apiRoutes.post('/upload_gpx2gis',kpwp.upload_gpx2gis);
apiRoutes.post('/factory_point',kpwp.factory_point);
apiRoutes.post('/circle_around_factory',kpwp.circle_around_factory);


apiRoutes.post('/list_geomkpwp',kpwp.list_geomkpwp);
apiRoutes.post('/list_search_farmer_factory',kpwp.list_search_farmer_factory);
apiRoutes.post('/list_search_farmer_center',kpwp.list_search_farmer_center);
apiRoutes.post('/set_collect_ton',kpwp.set_collect_ton_weight_system);

//multipartMiddleware,
apiRoutes.post('/retrive_image_km_addfarm',kpwp.retrive_image_km_addfarm);
apiRoutes.post('/get_last_pic_by_farmid',kpwp.get_last_pic_by_farmid);

apiRoutes.post('/set_track_farm',kpwp.set_track_farm);


apiRoutes.post('/list_name_farmer',kpwp.list_name_farmer);
apiRoutes.post('/list_qt',kpwp.list_qt);

apiRoutes.post('/list_name_farmer_by_qt',kpwp.list_name_farmer_by_qt);

apiRoutes.post('/get_maxfarm_id',kpwp.get_maxfarm_id);
apiRoutes.post('/list_zone',kpwp.list_zone);
apiRoutes.post('/get_location',kpwp.get_location);
apiRoutes.post('/list_area',kpwp.list_area);
apiRoutes.post('/list_type_ground',kpwp.list_type_ground);
apiRoutes.post('/list_type_sugarcane',kpwp.list_type_sugarcane);
apiRoutes.post('/list_name_sugarcane',kpwp.list_name_sugarcane);
apiRoutes.post('/list_source',kpwp.list_source);
apiRoutes.post('/list_distance',kpwp.list_distance);
apiRoutes.post('/list_methode',kpwp.list_methode);
apiRoutes.post('/list_owner',kpwp.list_owner);
apiRoutes.post('/list_eastimate',kpwp.list_eastimate);
apiRoutes.post('/list_status_farm',kpwp.list_status_farm);
apiRoutes.post('/list_farm_id',kpwp.list_farm_id);



apiRoutes.post('/list_ms_yearplant',kpwp.list_ms_yearplant);
apiRoutes.post('/list_ms_type_sugarcane',kpwp.list_ms_type_sugarcane);
apiRoutes.post('/list_ms_activity',kpwp.list_ms_activity);
apiRoutes.post('/list_vehicle_name',kpwp.list_vehicle_name);


apiRoutes.post('/set_activity_details',kpwp.set_activity_details);
apiRoutes.post('/report_distance_farm_to_kmp',kpwp.report_distance_farm_to_kmp);//1.5
apiRoutes.post('/report_distance_farm_to_ksp',kpwp.report_distance_farm_to_ksp);//1.5
apiRoutes.post('/report_group_activity',kpwp.report_group_activity);//1.6
apiRoutes.post('/get_report_all_area_quota',kpwp.get_report_all_area_quota);//1.7
apiRoutes.post('/get_report_all_area_zone',kpwp.get_report_all_area_zone);//1.7
apiRoutes.post('/set_detail_farm_register',kpwp.set_detail_farm_register);//1.8

apiRoutes.post('/add_user',kpwp.add_user);
apiRoutes.post('/set_user',kpwp.set_user);
apiRoutes.post('/del_user',kpwp.del_user);
apiRoutes.post('/list_factory',kpwp.list_factory);
apiRoutes.post('/list_role',kpwp.list_role);
apiRoutes.post('/get_login_kmp_ksp',kpwp.get_login_kmp_ksp);
apiRoutes.post('/get_logout_kmp_ksp',kpwp.get_logout_kmp_ksp); 
apiRoutes.post('/get_picture',kpwp.get_picture);
apiRoutes.post('/list_user',kpwp.list_user);
apiRoutes.post('/edit_geom_farm',kpwp.edit_geom_farm);
apiRoutes.post('/list_harvester_areaworking',kpwp.list_harvester_areaworking);
apiRoutes.post('/get_group_farmrai_psun',kpwp.get_group_farmrai_psun);
apiRoutes.post('/list_group_farmrai_psun',kpwp.list_group_farmrai_psun);

apiRoutes.post('/get_report_harvester_working_with_truck',kpwp.get_report_harvester_working_with_truck);
apiRoutes.post('/kmp_monitor_status/:type_vehicle/:modem_id', kpwp.monitor_status);
apiRoutes.post('/kmp_monitor_status', kpwp.monitor_status);


apiRoutes.post('/set_action_tsy', tsy.set_action_tsy);

apiRoutes.get('/all_harvester_working/:start_time/:end_time', function (req, res)
{
    //res.json({ message: 'Welcome to the coolest API on earth!' });
   /*
    var fields = ['name', 'phone', 'mobile', 'email', 'address', 'notes'];
var fieldNames = ['Name', 'Phone', 'Mobile', 'Email', 'Address', 'Notes'];
var data = json2csv({ data: docs, fields: fields, fieldNames: fieldNames });
res.attachment('filename.csv');
res.status(200).send(data);
res.csv([
    ["a", "b", "c"]
  , ["d", "e", "f"]
  ]);
  */
 
 var start_date = req.params.start_time;
 var end_date = req.params.end_time;
 var jparm={'start_time':start_date,'end_time':end_date}

    test.get_allharvester(jparm,function(json)
    {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + start_date+'-'+end_date + '.csv\"');
        res.csv(json[0]);
    })

});


//++++++++++++++++++ Helper Technical ++++++++++++++++++++++++++

apiRoutes.get('/check_status/:db_name/:modem_id', suga.check_status);
apiRoutes.get('/check_maxdevice/:db_name/:type_device', suga.check_status);
apiRoutes.get('/check_camera/:harvester_number', suga.check_camera);
apiRoutes.get('/check_camerax/:modem_id', suga.check_camerax);
apiRoutes.post('/check_all_vehicle', suga.check_all_vehicle);
apiRoutes.post('/gen_password', function (req, res)
{  
    var pws = req.body.pws;

    SKTC.encode_pws(pws,function(ress)
    {
        res.send(ress)
    })
});

apiRoutes.post('/vt900_detail_fleet', vt900.detail_fleet);
apiRoutes.post('/vt900_master_add_vehicle', vt900.master_add_vehicle);
apiRoutes.post('/set_fuel', vt900.set_fuel);
apiRoutes.post('/move_vehicle', vt900.move_vehicle);
apiRoutes.post('/move_data', vt900.move_data);
apiRoutes.post('/list_masterfleet', vt900.list_masterfleet);


apiRoutes.post('/vt900_delete_vehicle', vt900.delete_backbox);
apiRoutes.post('/set_ktc_combinepart',multipartMiddleware,SKTC.set_ktc_combinepart);
apiRoutes.post('/list_ktc_combinepart',SKTC.list_ktc_combinepart);
apiRoutes.post('/movedata_to_backup',m2backup.move_to_backup);
apiRoutes.get('/list_vehicle_online',SKTC.list_vehicle_online);


//++++++++++++++++++ Hydac Sensor ++++++++++++++++++++++++++
apiRoutes.post('/rawdata_hydac',xhydac.send_no_serial);
apiRoutes.post('/get_all_sensor',sensor_db.get_all_sensor);

apiRoutes.post('/api_sensor/:sensor_id', function (req, res)
{
    debugger;
  //  var apikey = req.body.apikey;
    //var data_sensor = req.body.data;
 var data_sensor = req.body;

    var d={ sensor_id: 'A1',
  rawval: '564609',
  sensor_name: 'Temp',
  calval: '91.81',
  unit: 'C',
  group: 'hydacsensor',
  apikey: '$2a$10$imfccwgRrs7AL1cu3rr3nOjv' }
    // var msg = { mess: 'server reply ok ' + group, 'data_sensor': data_sensor};// ' ' + message };
   // res.json(data_sensor);
   
    sensor_db.set_realtime_sensor(data_sensor,function(xrs)
    {
        debugger
        res.json(data_sensor);
    });
  // sensor.broadcast(req.body, group);
});


apiRoutes.get('/get_sensor/:sensor_id', function (req, res)
{
    debugger;
  //  var apikey = req.body.apikey;
    var id_sensor = req.params.sensor_id;
 //   Gdata_sensor = data_sensor;
 //   var group = req.body.group;
    //var room_id = 'db_10001';//req.id;
  //  console.log(JSON.stringify(req.body));

    var d={ sensor_id: 'A1',
  rawval: '564609',
  sensor_name: 'Temp',
  calval: '91.81',
  unit: 'C',
  group: 'hydacsensor',
  apikey: '$2a$10$imfccwgRrs7AL1cu3rr3nOjv' }
    // var msg = { mess: 'server reply ok ' + group, 'data_sensor': data_sensor};// ' ' + message };
  // res.json(d);
  //[{"data":"{\"sensor_id\":\"A0\",\"rawval\":\"570700\",\"sensor_name\":\"SAE\",\"calval\":\"15.0\",\"unit\":\"SAE\",\"group\":\"hydacsensor\",\"apikey\":\"$2a$10$imfccwgRrs7AL1cu3rr3nOjv\"}"}]
  // {"sensor_id":"A1","rawval":"564609","sensor_name":"Temp","calval":"91.81","unit":"C","group":"hydacsensor","apikey":"$2a$10$imfccwgRrs7AL1cu3rr3nOjv"}
   /**/
    sensor_db.get_realtime_sensor(id_sensor,function(data_sensor)
    {
        debugger
       // var data={'name':id_sensor,data_sensor}
       res.send(data_sensor[0].data);
      
    });
    
  // sensor.broadcast(req.body, group);
});

apiRoutes.get('/get_sensor/:db_sensor/:sensor_id', function (req, res)
{
    debugger;
  //  var apikey = req.body.apikey;
    var id_sensor = req.params.sensor_id;
    var db_sensor = req.params.db_sensor;

    sensor_db.get_realtime_sensordb(db_sensor,id_sensor,function(data_sensor)
    {
        debugger
       // var data={'name':id_sensor,data_sensor}
       res.send(data_sensor[0].data);
      
    });

});

apiRoutes.post('/getraw_datasensor', function (req, res)
{

   var data_sensor = req.body;
   
   sensor_cal.process_realtime(data_sensor.rawval,function(xres){
        if (res.finished == false) 
        {
            //  console.log(data_sensor);
              res.send(xres);
         }
   })

/*
    sensor_db.set_realtime_sensor(data_sensor,function(xrs)
    {
        debugger
        res.json(data_sensor);
    });
*/
  
});


apiRoutes.post('/getlocation', function (req, res)
{
    var lon = req.body.lon;
    var lat = req.body.lat;
    loc.call_adminPoint(lon,lat,function(res_loc)
    {
        res.send(res_loc);
    });

});

apiRoutes.get('/get_exports_csv_weight/:start_time', function (req, res)
{
    var start_date = req.params.start_time;
  //  var start_date='2019-03-21'
    kpwp.exports_csv_weight(start_date,function(json)
    {
       res.setHeader('Content-type', 'text/csv; charset=utf-8');
       res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + start_date+ '.csv\"');
       res.csv(json);
    });
});

//call_adminPoint


//++++++++++++++++++++ DLT ++++++++++++++++++++++++++++
apiRoutes.post('/set_masterfile',dlt.set_masterfile);
apiRoutes.post('/check_dltok',dlt.check_dltok);
apiRoutes.post('/send_dltnow',dlt.send_dltnow);


//+++++++++++++++++ Nao +++++++++++++++++++++++++++
/**/
apiRoutes.post('/get_report_working',nao.get_report_working);
apiRoutes.post('/regen_report_working_history',nao.regen_report_working_history);
apiRoutes.post('/get_report_stopengine_enter_station',nao.get_report_stopengine_enter_station);
apiRoutes.post('/get_login_nao', nao.authenticate_nao);
apiRoutes.post('/get_station_nao', nao.get_station_nao);
apiRoutes.post('/list_station_nao', nao.list_station_nao);
apiRoutes.post('/add_geom_nao', nao.add_geom_nao);
apiRoutes.post('/del_geom_nao', nao.del_geom_nao);

//++++++++++++++++++++++ ItalThai +++++++++++++++++++++++
apiRoutes.post('/get_vehicle_info_italthai', ital.get_vehicle_info_italthai);
apiRoutes.post('/set_vehicle_info_italthai', ital.set_vehicle_info_italthai);
apiRoutes.post('/tracking_history_italthai', ital.tracking_history_italthai);

apiRoutes.post('/rp_maintanace_italthai', ital.rp_maintanace_italthai);
apiRoutes.post('/rp_graph_working', ital.rp_graph_working);
apiRoutes.post('/rp_graph_vehicle_status_italthai', ital.rp_graph_vehicle_status_italthai);
apiRoutes.post('/rp_graph_efficient', ital.rp_graph_efficient);
//apiRoutes.post('/chart_oil_percent_italthai', chart_fuel.chart_oil_percent_italthai);

apiRoutes.post('/chart_oil_percent_italthai_withtext', ital.chart_oil_percent_italthai);



//#region serverApp.listen

App.listen(port_service);
//server.listen(port_service);
console.log('KTC service  Listening on port ' + port_service + '...');

//#endregion serverApp.listen


//https://github.com/simon04/POImap

