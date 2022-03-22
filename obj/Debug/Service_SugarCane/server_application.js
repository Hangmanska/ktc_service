//#region module

var http = require('http');
var cors = require('cors');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var express = require('express');

var SHTT = require('./service_htt.js');

//#endregion

var serverApp = express();
serverApp.use(cors());
serverApp.use(bodyParser.json());
serverApp.use(bodyParser.json({ limit: '50mb' }));
serverApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
serverApp.disable('etag');


/* service start HTT01-01-1 */
serverApp.get('/get_htt1/:page', SHTT.get_htt1);
serverApp.get('/fillter_htt1/:f_id', SHTT.fillter_htt1);
serverApp.post('/upload_htt1', SHTT.upload_htt1);
serverApp.post('/upload_HTT', SHTT.upload_HTT);
serverApp.post('/upload_HTT2', SHTT.upload_HTT2);
serverApp.post('/update_htt1', SHTT.update_htt1);
serverApp.post('/delete_htt1', SHTT.delete_htt1);
serverApp.get('/csv_htt1', SHTT.csv_htt1);

/* service start HTT01-02-1 */ 
serverApp.post('/find_place', SHTT.find_place);
serverApp.post('/insert_htt2', SHTT.insert_htt2);

/* service start HTT01-03-1 */
serverApp.post('/upload_htt3', SHTT.upload_htt3);
serverApp.post('/get_yard', SHTT.get_yard);

/* service start HTT02-01-1 */
serverApp.get('/select_htt4/:harvester_name', SHTT.select_htt4);
serverApp.get('/get_MasterHavest/:harvester_name', SHTT.get_MasterHavest);
serverApp.get('/update_htt4', SHTT.update_htt4);
serverApp.post('/harvester_unregis', SHTT.harvester_unregis);
serverApp.post('/register_htt4', SHTT.register_htt4);

/* service start HTT02-02-1 */
serverApp.get('/get_norelation', SHTT.get_norelation);
serverApp.post('/get_relation', SHTT.get_relation);
serverApp.post('/get_fieldID', SHTT.get_fieldID);

//#region ระบบรถตัด
/* service start HTT02-03-1 */
    //serverApp.get('/tracking_havester', SHTT.tracking_havester);
serverApp.get('/tracking_havester/:priority', SHTT.tracking_havester);

/* service start HTT02-03-2 */
serverApp.get('/working_havester/:priority', SHTT.working_havester);

/* service start HTT02-03-3 */
serverApp.get('/havester_out_of_area/:priority', SHTT.havester_out_of_area);

//#endregion

/* service start HTT02-04-1 */
serverApp.get('/isDay_usability/:start_time/:end_time', SHTT.isDay_usability);
serverApp.get('/isAll_usability', SHTT.isAll_usability);
serverApp.get('/Day_usability/:date', SHTT.Day_usability);

/* service start HTT02-04-2 */
serverApp.get('/isDay_performance/:start_time/:end_time', SHTT.isDay_performance);
serverApp.get('/isAll_performance', SHTT.isAll_performance);
serverApp.get('/Day_performance/:date', SHTT.Day_performance);

/* service start HTT02-04-3 */
serverApp.get('/get_report_harvester_history/:havester_name/:start_time/:end_time', SHTT.get_report_harvester_history);
serverApp.get('/get_activity_harvester/:vihicle_code/:selectTime', SHTT.get_activity_harvester);

/* service start HTT02-04-4 */
serverApp.get('/isDay_outsize/:start_time/:end_time', SHTT.isDay_outsize);
serverApp.get('/isAll_outsize', SHTT.isAll_outsize);
serverApp.get('/Day_outsize/:date', SHTT.Day_outsize);

/* service start HTT02-04-5 */
serverApp.get('/fuel_report_harvester/:havester_name/:start_time/:end_time', SHTT.fuel_report_harvester);

/* service start HTT03-01-1 */
serverApp.get('/select_htt7/:truck_name', SHTT.select_htt7);
serverApp.get('/get_MasterTruck/:truck_name', SHTT.get_MasterTruck);
serverApp.get('/update_htt7', SHTT.update_htt7);
serverApp.post('/truck_unregis', SHTT.truck_unregis);
serverApp.post('/register_htt7', SHTT.register_htt7);

/* service start HTT03-02-1 */
serverApp.get('/get_norelation_T_H', SHTT.get_norelation_T_H);
serverApp.post('/get_relation_T_H', SHTT.get_relation_T_H);

/* service start HTT03-03-1 */
serverApp.get('/tracking_truck/:priority', SHTT.tracking_truck);

/* service start HTT03-03-2 */
serverApp.get('/working_truck/:priority', SHTT.working_truck);

/* service start HTT03-03-3 */
serverApp.get('/truck_of_status/:priority', SHTT.truck_of_status);

/* service start HTT03-04-1 */
serverApp.get('/inDay_usability/:start_time/:end_time/:type', SHTT.inDay_usability);
serverApp.get('/inAll_usability/:type', SHTT.inAll_usability);
serverApp.get('/in_usability/:date', SHTT.in_usability);

/* service start HTT03-04-2 */
serverApp.get('/inDay_performance/:start_time/:end_time/:type', SHTT.inDay_performance);
serverApp.get('/inAll_performance/:type', SHTT.inAll_performance);
serverApp.get('/in_performance/:date', SHTT.in_performance);

/* service start HTT03-04-3 */
serverApp.get('/get_report_truck_history/:truck_name/:start_time/:end_time', SHTT.get_report_truck_history);
serverApp.get('/get_activity_truck/:vihicle_code/:selectTime', SHTT.get_activity_truck);

/* service start HTT03-04-4 */
serverApp.get('/inDay_waiting/:start_time/:end_time/:type', SHTT.inDay_waiting);
serverApp.get('/inAll_waiting/:type', SHTT.inAll_waiting);

/* service start HTT03-04-5 */
serverApp.get('/fuel_report_truck/:truck_name/:start_time/:end_time', SHTT.fuel_report_truck);

/* service start HTT03-04-6 */
serverApp.get('/point_average/:vehicle_code', SHTT.point_average);

/* service start HTT04-01-1 */
serverApp.get('/check_status_cane', SHTT.check_status_cane);
serverApp.get('/tracking_cane/:vehicle_code', SHTT.tracking_cane);

/* service start HTT04-01-2 */
serverApp.get('/load_caneAmount', SHTT.load_caneAmount);

/* service start HTT04-01-3 */
serverApp.get('/cut_to_crush', SHTT.cut_to_crush);
serverApp.post('/cut_to_crushS', SHTT.cut_to_crushS);
serverApp.get('/resend_to_cane/:transectionID', SHTT.resend_to_cane);

/* Extra */
serverApp.get('/edit_settingTruck/:weight_one/:weight_two/:weight_three/:weight_four', SHTT.edit_settingTruck);
serverApp.get('/truck_setting', SHTT.truck_setting);
serverApp.post('/search_vehicle_lost', SHTT.search_vehicle_lost);
serverApp.post('/insert_vehicle_lost', SHTT.insert_vehicle_lost);
serverApp.post('/update_vehicle_lost', SHTT.update_vehicle_lost);
serverApp.post('/report_vehicle_lost', SHTT.report_vehicle_lost);

/* plugin */
serverApp.post('/count_table', SHTT.count_table);
serverApp.post('/bound_relation_area', SHTT.bound_relation_area);
serverApp.post('/activity_match_vehicle', SHTT.activity_match_vehicle);
serverApp.get('/get_harvester', SHTT.get_harvester);
serverApp.get('/get_harvester_register', SHTT.get_harvester_register);
serverApp.get('/get_truck', SHTT.get_truck);
serverApp.get('/get_truck_register', SHTT.get_truck_register);
serverApp.get('/get_zone', SHTT.get_zone);
serverApp.get('/get_all_field', SHTT.get_all_field);
serverApp.get('/get_blackbox', SHTT.get_blackbox);
serverApp.get('/get_importanArea', SHTT.get_importanArea);
serverApp.get('/non_register_gps/:type_vehicle', SHTT.non_register_gps);
serverApp.get('/reletion_tracking/:vehicle_code/:sql_colum', SHTT.reletion_tracking);
serverApp.get('/view_register/:blackbox_code', SHTT.view_register);


/* CaneGis-Service for harvester */
serverApp.post('/add_master_harvester', SHTT.add_master_harvester);
serverApp.post('/set_master_harvester', SHTT.set_master_harvester);
serverApp.post('/del_master_harvester', SHTT.del_master_harvester);
serverApp.post('/add_listDetail_harvester', SHTT.add_listDetail_harvester);
serverApp.post('/add_detail_harvester', SHTT.add_detail_harvester);
serverApp.post('/set_detail_harvester', SHTT.set_detail_harvester);
serverApp.post('/del_detail_harvester', SHTT.del_detail_harvester);
serverApp.get('/list_master_harvester', SHTT.list_master_harvester);
serverApp.get('/list_detail_harvester', SHTT.list_detail_harvester);

/* CaneGis-Service for truck */
serverApp.post('/add_master_truck', SHTT.add_master_truck);
serverApp.post('/set_master_truck', SHTT.set_master_truck);
serverApp.post('/del_master_truck', SHTT.del_master_truck);
serverApp.post('/add_detail_truck', SHTT.add_detail_truck);
serverApp.post('/set_detail_truck', SHTT.set_detail_truck);
serverApp.post('/del_detail_truck', SHTT.del_detail_truck);
serverApp.get('/list_master_truck', SHTT.list_master_truck);
serverApp.get('/list_detail_truck', SHTT.list_detail_truck);

/* CaneGis-Service for master_vehicle */
serverApp.post('/add_master_vehicle_type', SHTT.add_master_vehicle_type);
serverApp.get('/list_master_vehicle_type', SHTT.list_master_vehicle_type);

//#region HTT-LOGIN

serverApp.get('/get_login/:name/:pass', SHTT.get_login);

//#endregion HTT-LOGIN


serverApp.listen(9007);
console.log('service server_app Listening on port 9002...');
