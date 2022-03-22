var moment = require('moment');
var async = require('async');
var squel = require("squel");
var LINQ = require('node-linq').LINQ;

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb.js');
var pg_config_dbu101279 = new db.im2(db.get_dbconfig_realtime());
var pg_config_HTT = new db.im2(db.get_dbconfig_htt());

// #region usability

function get_history_harvester_usability(day, callback) {
    var query = " WITH res as";
    query += " (";
    query += " SELECT";
    query += " DISTINCT vehicle_name as vehicle_name";
    query += " , count(vehicle_name) as total_vehicle_lost";
    query += " , datediff('hour', start_lost, end_lost) as total_time";
    query += " FROM lost_vehicle";
    query += " WHERE get_YMD(start_lost) = " + utl.sqote(day);
    query += " AND vehicle_type = 'รถตัด'";
    query += " GROUP BY vehicle_name, start_lost, end_lost";
    query += " )";
    query += " SELECT";
    query += " " + utl.sqote(day) + " as nowdate";
    query += " ,count(vehicle_name) as total_vehicle_lost";
    query += " ,COALESCE(sum(total_vehicle_lost),0) as total_day_lost";
    query += " ,COALESCE(sum(total_time),0) as total_time_lost";
    query += " FROM res";

    db.get_rows(pg_config_HTT, query, function (rows) {
        callback(rows[0]);
        return;
    });
}

function dump_history_harvester_usability(object, callback) { 
    var query_insert = squel.insert()
        .into('history_usability_harvester')
        .set('lost_date', object.nowdate)
        .set('lost_date_vehicle', object.total_vehicle_lost)
        .set('lost_date_total', object.total_day_lost)
        .set('lost_date_diff', object.total_time_lost)
        .toString();
    var query_update = squel.update()
        .table('history_usability_harvester')
        .set('lost_date_vehicle', object.total_vehicle_lost)
        .set('lost_date_total', object.total_day_lost)
        .set('lost_date_diff', object.total_time_lost)
        .where('lost_date = ' + utl.sqote(object.nowdate))
        .toString();
    
    utcp.upsert_template(query_insert, query_update, function (query) {
        db.excute(pg_config_HTT, query, function (response) {
            callback(response);
            return;
        });
    });
}

function get_history_truck_usability(day, callback) {
    var query = " WITH res as";
    query += " (";
    query += " SELECT";
    query += " DISTINCT vehicle_name as vehicle_name";
    query += " ,count(vehicle_name) as total_vehicle_lost";
    query += " ,datediff('hour', start_lost, end_lost) as total_time";
    query += " FROM lost_vehicle";
    query += " WHERE get_YMD(start_lost) = " + utl.sqote(day);
    query += " AND vehicle_type = 'รถบรรทุก'";
    query += " GROUP BY vehicle_name, start_lost, end_lost";
    query += " )";
    query += " SELECT";
    query += " " + utl.sqote(day) + " as nowdate";
    query += " ,get_trucktype2(vehicle_name) as type_truck";
    query += " ,count(vehicle_name) as total_vehicle_lost";
    query += " ,COALESCE(sum(total_vehicle_lost),0) as total_day_lost";
    query += " ,COALESCE(sum(total_time),0) as total_time_lost";
    query += " FROM res GROUP BY type_truck";
    query += " UNION ALL";
    query += " SELECT";
    query += " " + utl.sqote(day) + " as nowdate";
    query += " ,'0' as type_truck";
    query += " ,count(vehicle_name) as total_vehicle_lost";
    query += " ,COALESCE(sum(total_vehicle_lost), 0) as total_day_lost";
    query += " ,COALESCE(sum(total_time), 0) as total_time_lost";
    query += " FROM res";
    
    db.get_rows(pg_config_HTT, query, function (rows) {
        callback(rows);
        return;
    });
}

function dump_history_truck_usability(object, callback) {
    var query_insert = squel.insert()
        .into('history_usability_truck')
        .set('lost_date', object.nowdate)
        .set('lost_type', object.type_truck)
        .set('lost_date_vehicle', object.total_vehicle_lost)
        .set('lost_date_total', object.total_day_lost)
        .set('lost_date_diff', object.total_time_lost)
        .toString();
    var query_update = squel.update()
        .table('history_usability_truck')
        .set('lost_date_vehicle', object.total_vehicle_lost)
        .set('lost_date_total', object.total_day_lost)
        .set('lost_date_diff', object.total_time_lost)
        .where('lost_date = ' + utl.sqote(object.nowdate))
        .where('lost_type = ' + utl.sqote(object.type_truck))
        .toString();
    
    utcp.upsert_template(query_insert, query_update, function (query) {
        db.excute(pg_config_HTT, query, function (response) {
            callback(response);
            return;
        });
    });
}

exports.get_history_harvester_usability = get_history_harvester_usability;
exports.dump_history_harvester_usability = dump_history_harvester_usability;
exports.get_history_truck_usability = get_history_truck_usability;
exports.dump_history_truck_usability = dump_history_truck_usability;

// #endregion usability

// #region performance

function get_history_performance(date, callback) {
    var object = { "date": date, "stop": "0", "idle": "0", "run": "0", "cut_load": "0", "efficiency": "0" };

    var query = " SELECT status_type_start,round(SUM(total_time) / 60)";
    query += " FROM history_status_havester";
    query += " WHERE to_char(start_record, 'YYYY-MM-DD') = " + utl.sqote(date);
    query += " GROUP BY status_type_start";

    db.get_rows(pg_config_HTT, query, function (rows) {
        if (rows.length > 0) {
            object.stop = new LINQ(rows).Where(function (x) { return x.status_type_start == 33 }).Select(function (x) { return x.round }).FirstOrDefault();
            object.idle = new LINQ(rows).Where(function (x) { return x.status_type_start == 31 }).Select(function (x) { return x.round }).FirstOrDefault();
            object.run = new LINQ(rows).Where(function (x) { return x.status_type_start == 30 }).Select(function (x) { return x.round }).FirstOrDefault();
            object.cut_load = new LINQ(rows).Where(function (x) { return x.status_type_start == 11 }).Select(function (x) { return x.round }).FirstOrDefault();

            object.stop = object.stop == null ? 0 : parseInt(object.stop);
            object.idle = object.idle == null ? 0 : parseInt(object.idle);
            object.run = object.run == null ? 0 : parseInt(object.run);
            object.cut_load = object.cut_load == null ? 0 : parseInt(object.cut_load);
            
            if ((object.idle + object.run) > 0) {
                object.efficiency = Math.round((object.cut_load / (object.idle + object.run)) * 100);
            } else {
                object.efficiency = 0;
            }

        }
        callback(object);
        return;
    });
}

function dump_history_performance(object, callback) {
    var query_insert = squel.insert()
        .into('history_performance_harvester')
        .set('date', object.date)
        .set('stop', object.stop)
        .set('idle', object.idle)
        .set('run', object.run)
        .set('cut_load', object.cut_load)
        .set('efficiency', object.efficiency)
        .toString();
    var query_update = squel.update()
        .table('history_performance_harvester')
        .set('stop', object.stop)
        .set('idle', object.idle)
        .set('run', object.run)
        .set('cut_load', object.cut_load)
        .set('efficiency', object.efficiency)
        .where('date = ' + utl.sqote(object.date))
        .toString();

    utcp.upsert_template(query_insert, query_update, function (query) { 
        db.excute(pg_config_HTT, query, function (response) {
            callback(response);
            return;
        });
    });
}

exports.get_history_performance = get_history_performance;
exports.dump_history_performance = dump_history_performance;

// #endregion performance

// #region Waiting

function get_history_waiting(date, callback) {
    var query = " WITH rex AS (";
    query += " SELECT";
    query += " get_trucktype_htt(get_truckcode(blackbox_id)) as truck_type,";
    query += " datediff('hour', htt_farm_leaving::TIMESTAMP, htt_cuttingtime::TIMESTAMP) as waiting_infarm,";
    query += " datediff('hour', htt_park_prepare::TIMESTAMP, htt_park_outside::TIMESTAMP) as waitting_park_outside,";
    query += " datediff('hour', htt_park_inside::TIMESTAMP, htt_park_prepare::TIMESTAMP) as waitting_park_prepare,";
    query += " datediff('hour', htt_factory_leaving::TIMESTAMP, htt_park_inside::TIMESTAMP) as waitting_inside";
    query += " FROM rec_now";
    query += " WHERE htt_harvester_or_truck = '1'";
    query += " AND get_ymd(htt_cuttingtime) = " + utl.sqote(date);
    query += " AND get_ymd(htt_farm_leaving) = " + utl.sqote(date);
    query += " AND get_ymd(htt_park_prepare) = " + utl.sqote(date);
    query += " AND get_ymd(htt_park_inside) = " + utl.sqote(date);
    query += " AND get_ymd(htt_park_outside) = " + utl.sqote(date);
    query += " ORDER BY htt_cuttingtime DESC";
    query += " )";
    query += " SELECT";
    query += " " + utl.sqote(date) + " as date,";
    query += " truck_type,";
    query += " SUM(waiting_infarm) as waiting_infarm,";
    query += " SUM(waitting_park_outside) as waitting_park_outside,";
    query += " SUM(waitting_park_prepare) as waitting_park_prepare,";
    query += " SUM(waitting_inside) as waitting_inside";
    query += " FROM rex WHERE truck_type IS NOT NULL";
    query += " GROUP BY truck_type ";
    query += " UNION ALL";
    query += " SELECT";
    query += " " + utl.sqote(date) + " as date,";
    query += " '0' as truck_type,";
    query += " SUM(waiting_infarm) as waiting_infarm,";
    query += " SUM(waitting_park_outside) as waitting_park_outside,";
    query += " SUM(waitting_park_prepare) as waitting_park_prepare,";
    query += " SUM(waitting_inside) as waitting_inside";
    query += " FROM rex WHERE truck_type IS NOT NULL";

    db.get_rows(pg_config_dbu101279, query, function (rows) {
        if (rows.length > 0) { 
            callback(rows);
        } else {
            callback([]);
        }
        return;
    });
}

function dump_history_waiting(object, callback) {
    var query_insert = squel.insert()
        .into('history_waiting_truck')
        .set('date', object.date)
        .set('type', object.truck_type)
        .set('waiting_infarm', object.waiting_infarm)
        .set('waiting_parkoutside', object.waitting_park_outside)
        .set('waiting_prepare', object.waitting_park_prepare)
        .set('waiting_inside', object.waitting_inside)
        .toString();
    var query_update = squel.update()
        .table('history_waiting_truck')
        .set('waiting_infarm', object.waiting_infarm)
        .set('waiting_parkoutside', object.waitting_park_outside)
        .set('waiting_prepare', object.waitting_park_prepare)
        .set('waiting_inside', object.waitting_inside)
        .where('date = ' + utl.sqote(object.date))
        .where('type = ' + utl.sqote(object.truck_type))
        .toString();

    utcp.upsert_template(query_insert, query_update, function (query) {
        db.excute(pg_config_HTT, query, function (response) { 
            callback(response);
            return;
        });
    });
}

// #endregion Waiting

// #region process-vehicle-timestamp

function get_process_timestamp(callback) { 
    var query = " SELECT";
    query += " htt_transectionid,";
    query += " idate(htt_cuttingtime) as htt_cuttingtime,";
    query += " idate(htt_farm_leaving) as htt_farm_leaving,";
    query += " idate(htt_park_outside) as htt_park_outside,";
    query += " idate(htt_park_prepare) as htt_park_prepare,";
    query += " idate(htt_park_inside) as htt_park_inside,";
    query += " idate(htt_factory_leaving) as htt_factory_leaving";
    query += " FROM rec_now";
    query += " WHERE htt_harvester_or_truck = '1'";
    query += " AND get_ymd(htt_cuttingtime) = get_ymd(now()::TIMESTAMP)";
    query += " ORDER BY htt_cuttingtime DESC";

    db.get_rows(pg_config_dbu101279, query, function (rows) {
        if (rows.length > 0) { 
            callback(rows)
        } else {
            callback([]);
        }
        return;
    });
}

function run_process_timestamp(Array) {
    async.eachSeries(Array, function (row, next) {
        console.log(row);
        next();
    }, function () { 
    
    });
}

// #endregion process-vehicle-timestamp


/**/
setTimeout(function () {
    
    var day_realTime = '2016-02-08';

    get_process_timestamp(function (data) {
        if (data.length > 0) {
            run_process_timestamp(data);
        } else {
            console.log('No-Query-Timestamp');
        }
    });

    //get_history_waiting(day_realTime, function (xres) {
    //    var str = '';
    //    if (xres.length > 0) {
    //        async.eachSeries(xres, function (row, next) {
    //            dump_history_waiting(row, function (response) {
    //                str = response;
    //                next();
    //            });
    //        }, function () { 
    //            console.log(str + ' : ' + day_realTime);
    //        });
    //    } else {
    //        console.log('Not Data : ' + day_realTime);
    //    }
    //});

    //get_history_harvester_usability(day_realTime, function (xres) {
    //    dump_history_harvester_usability(xres, function (response) { 
    //        console.log(response + ' : ' + day_realTime);
    //    });
    //});

    //get_history_truck_usability(day_realTime, function (xres) {
    //    dump_history_truck_usability(xres, function (response) { 
    //        console.log(response + ' : ' + day_realTime);
    //    });
    //});
    
    //get_history_performance(day_realTime, function (xres) {
    //    dump_history_performance(xres, function (response) { 
    //        console.log(response + ' : ' + day_realTime);
    //    });
    //});

}, 1000);
