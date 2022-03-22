
 //#region module
var schedule = require('node-schedule');
var async = require('async');
var squel = require("squel");
var moment = require('moment');
//var _ = require('underscore');
var mustache = require("mustache");

var fs = require('fs');
//var copyFrom = require('pg-copy-streams').from;
var jCutloading = require('job_load_cutting_loadding.js');
var utl = require('Utility.js');
var linq = require('linq.js');
var utl = require('Utility.js');

var inout = require('inout_polygon.js');
var find_place = require('iAdmin_point.js');

var dtc2cane = require('dtc2cane.js');

debugger;
var db = require('iConnectdb.js');
var pg_htt = new db.im2(db.get_dbconfig_htt());
var pg_realtime = new db.im2(db.get_dbconfig_realtime());

var start_time = ' ';
var end_time = ' ';
    //#endregion

function process_start(ar, callback)
{
    var s = ' ';
    if (days == 0) {
        s = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
        s = s.subtract(1, 'days');

    } else if (days > 0) {
        s = moment(moment().format('YYYY-MM-DD'))//moment('2015-09-02 00:00:00');
        s = s.subtract(days, 'days');
    }

    start_time = s.format('YYYY-MM-DD') + ' 00:00:00'
    end_time = s.format('YYYY-MM-DD') + ' 23:59:59'

}

function get_havester(callback)
{
    //harvester_number,
    var sql = "SELECT blackbox_id FROM htt4";
    db.get_rows(pg_htt, sql, function (res)
    {
        debugger;
        if (res.length > 0)
        {
           // console.log(res);
            callback(res);
            return;
        }
    });
}

function get_truck(callback) {
    //harvester_number,
    var sql = "SELECT blackbox_id FROM htt7";
    db.get_rows(pg_htt, sql, function (res) {
        debugger;
        if (res.length > 0) {
            // console.log(res);
            callback(res);
            return;
        }
    });
}

    //datediff
    //2015-04-23
    //#region sample
    /*
SELECT idate(start_time)as start_record,idate(end_time)as end_record
,CASE WHEN status <> '10' THEN  DateDiff('minute',start_time,end_time)::int  ELSE get_cutting_time(blackbox_id,idate(start_time),idate(end_time))::int END  as total_time
,start_lat,start_lon,end_lat,end_lon,blackbox_id
,CASE WHEN status <> '10' THEN status ELSE '11' END as status_type_start
,idate(now()::TIMESTAMP) as date_record 
,stam_tname as tambol_start,samp_tname as amphur_start,sprov_tname as province_start,etam_tname as tambol_end,eamp_tname as amphur_end,eprov_tname as province_end,' ' as plot_code,' ' as zone_id 
 FROM z189600105030rep  
 WHERE cast(start_time as varchar(10))='2015-12-23'
 AND status IN ('30','31','33','10')  --('10')--
 AND get_cutting_time(blackbox_id,idate(start_time),idate(end_time))::int >0
     */
    //#endregion

function get_zrepdata_harvester(blackbox_id, date,callback)
{
    var sql = "SELECT idate(start_time)as start_record,idate(end_time)as end_record";
    sql +=" ,CASE WHEN status <> '10' THEN  DateDiff('minute',start_time,end_time)::int  ELSE get_cutting_time(blackbox_id,idate(start_time),idate(end_time))::int END  as total_time ";
    sql +=" ,CASE WHEN status <> '10' THEN status ELSE '11' END as status_type_start ";
    sql +=" ,start_lat,start_lon,end_lat,end_lon,blackbox_id ";
    sql+=" ,idate(now()::TIMESTAMP) as date_record ";
    sql += " ,stam_tname as tambol_start,samp_tname as amphur_start,sprov_tname as province_start,etam_tname as tambol_end,eamp_tname as amphur_end,eprov_tname as province_end,' ' as plot_code,' ' as zone_id ";
    sql+=" FROM z"+blackbox_id+"rep  ";
    sql+=" WHERE cast(start_time as varchar(10))="+utl.sqote(date);
    sql += " AND status IN ('30','31','33','10') AND DateDiff('minute',start_time,end_time) >0 ";
  //  sql += " AND status IN ('10') AND DateDiff('minute',start_time,end_time) >0 ";

    db.get_rows(pg_realtime, sql, function (res)
    {
        debugger;
        if (res.length > 0)
        {
            // console.log(res);

            async.eachSeries(res, function (row, next)
            {
                var step1 = false;
                if (row.province_start === "undefined") {
                    find_place.call_adminPoint(row.start_lon, row.start_lat, function (place) {
                        //  debugger;
                        // console.log(place);
                        if (place.length > 0) {
                            row.stam_tname = place[0]['tambol_start'];
                            row.samp_tname = place[0]['amphur_start'];
                            row.sprov_tname = place[0]['province_start']
                        }
                        step1 = true;
                        is_fin();
                    });
                } else {
                    step1 = true;
                    is_fin();
                }

                function is_fin() {
                    if (step1) {
                        //   row.start_lon = 102.195250325693
                        //  row.start_lat = 16.4149841094033
                        inout.is_inconfig_polygon(blackbox_id, row.start_lon, row.start_lat, function (inzone) {
                                debugger;
                            if (inzone.length > 0) {
                                row.plot_code = inzone[0].plot_code
                                row.zone_id = inzone[0].zone_id
                            }
                            next();
                        });
                    }

                }

            }, function () {
                debugger;
                //  console.log(JSON.stringify(res))
                var strMustache = '{{#.}}';
                strMustache += "('{{start_record}}','{{end_record}}','{{total_time}}','{{start_lat}}','{{start_lon}}','{{end_lat}}','{{end_lon}}','{{blackbox_id}}','{{status_type_start}}'";
                strMustache += ",'{{date_record}}','{{tambol_start}}','{{amphur_start}}','{{province_start}}','{{tambol_end}}','{{amphur_end}}','{{province_end}}','{{plot_code}}','{{zone_id}}'";
                strMustache += "),";
                strMustache += '{{/.}}';

                var result = mustache.render(strMustache, res);
                result = utl.iRmend(result);
                var sql = " INSERT INTO history_status_havester(start_record, end_record, total_time, start_lat, start_lon,";
                sql += " end_lat, end_lon, blackbox_id, status_type_start, date_record,";
                sql += " tambol_start, amphur_start, province_start, tambol_end, amphur_end,";
                sql += " province_end, plot_code_start, zone_id_start) VALUES " + result;

                db.excute(pg_htt, sql, function (response) {
                    if (response == 'oK') {
                        callback(true);
                        return;
                    }
                    else {
                        callback(true);
                        return;
                    }
                });

                // console.log(JSON.stringify(res))

            });
        }
        else
        {
            callback(true);
            return;
        }
    });

}


function get_zrepdata_truck(blackbox_id, date, callback) {
    var sql = "SELECT idate(start_time)as start_record,idate(end_time)as end_record,DateDiff('minute',start_time,end_time) as total_time";
    sql += " ,start_lat,start_lon,end_lat,end_lon,blackbox_id,status as status_type_start";
    sql += " ,idate(now()::TIMESTAMP) as date_record ";
    sql += " ,stam_tname as tambol_start,samp_tname as amphur_start,sprov_tname as province_start,etam_tname as tambol_end,eamp_tname as amphur_end,eprov_tname as province_end,' ' as plot_code,' ' as zone_id ";
    sql += " FROM z" + blackbox_id + "rep  ";
    sql += " WHERE cast(start_time as varchar(10))=" + utl.sqote(date);
    sql += " AND status IN ('30','31','33') AND DateDiff('minute',start_time,end_time) >0 ";

    db.get_rows(pg_realtime, sql, function (res) {
         debugger;
        if (res.length > 0) {
            // console.log(res);

            async.eachSeries(res, function (row, next) {
                var step1 = false;
                if (row.province_start === "undefined") {
                    find_place.call_adminPoint(row.start_lon, row.start_lat, function (place) {
                        //  debugger;
                        // console.log(place);
                        if (place.length > 0) {
                            row.stam_tname = place[0]['tambol_start'];
                            row.samp_tname = place[0]['amphur_start'];
                            row.sprov_tname = place[0]['province_start']
                        }
                        step1 = true;
                        is_fin();
                    });
                } else {
                    step1 = true;
                    is_fin();
                }

                function is_fin() {
                    if (step1) {
                        //   row.start_lon = 102.195250325693
                        //  row.start_lat = 16.4149841094033
                        inout.is_inconfig_polygon(blackbox_id, row.start_lon, row.start_lat, function (inzone) {
                            //    debugger;
                            if (inzone.length > 0) {
                                row.plot_code = inzone[0].plot_code
                                row.zone_id = inzone[0].zone_id
                            }
                            next();
                        });
                    }

                }

            }, function () {
                debugger;
                //  console.log(JSON.stringify(res))
                var strMustache = '{{#.}}';
                strMustache += "('{{start_record}}','{{end_record}}','{{total_time}}','{{start_lat}}','{{start_lon}}','{{end_lat}}','{{end_lon}}','{{blackbox_id}}','{{status_type_start}}'";
                strMustache += ",'{{date_record}}','{{tambol_start}}','{{amphur_start}}','{{province_start}}','{{tambol_end}}','{{amphur_end}}','{{province_end}}','{{plot_code}}','{{zone_id}}'";
                strMustache += "),";
                strMustache += '{{/.}}';

                var result = mustache.render(strMustache, res);
                result = utl.iRmend(result);
                var sql = " INSERT INTO history_status_truck(start_record, end_record, total_time, start_lat, start_lon,";
                sql += " end_lat, end_lon, blackbox_id, status_type_start, date_record,";
                sql += " tambol_start, amphur_start, province_start, tambol_end, amphur_end,";
                sql += " province_end, plot_code_start, zone_id_start) VALUES " + result;

                db.excute(pg_htt, sql, function (response) {
                    if (response == 'oK') {
                        callback(true);
                        return;
                    }
                    else {
                        callback(true);
                        return;
                    }
                });

                // console.log(JSON.stringify(res))

            });
        }
        else {
            callback(true);
            return;
        }
    });

}


//#region
/*
 
SELECT start_time
,end_time
,start_lat
,start_lon
,end_lat
,end_lon
,blackbox_id
,status 
,idate(now())
,stam_tname
,samp_tname
,sprov_tname
,etam_tname
,eamp_tname
,eprov_tname
,status
FROM z104090169333rep 
WHERE cast(start_time as varchar(10))='2015-04-23'
AND status IN ('30','31','33')
 */
//#endregion

    //for generate_report driving stop ideling from table zrep
/*
setTimeout(function ()
{
    get_zrepdata_harvester('189600105030', '2015-12-23', function (xres) {
        debugger;
        console.log(xres);
    })

}, 1000);
*/
//#region
    /*
setTimeout(function ()
{

    /// var date_now = moment().format("YYYY-MM-DD");
    var date_now = '2015-09-14'
    debugger;
    get_havester(function (data) {
        async.eachSeries(data, function (row, next)
        {
            //console.log(row.blackbox_id);
            //  date_now = '2015-11-27'
            get_zrepdata(row.blackbox_id, date_now, function (r) {
                if (r == true) {
                    next();
                }
            });

        }, function () {
            console.log('start get_harvest_vehicle_working_log && get_delivery_vehicle_working_log');
            dtc2cane.get_harvest_vehicle_working_log();
            dtc2cane.get_delivery_vehicle_working_log();
            // dtc2cane.get_harvest_vehicle_working_log();
           // dtc2cane.get_delivery_vehicle_working_log();
        });
    });

}, 1000);
*/

    //#endregion


//http://www.codexpedia.com/javascript/nodejs-cron-schedule-examples/
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 23;
rule.minute = 59;

//#region
  

schedule.scheduleJob(rule, function ()
{
    console.log('Harvester Midnight This runs at 23:59 every day.');

    var date_now = moment().format("YYYY-MM-DD");
    //var date_now = '2015-12-02'
   
    debugger;

    dtc2cane.get_oil_harvester(date_now, function (res_oil_harvester) {
        console.log('res_oil_harvester '+res_oil_harvester);
    });

    dtc2cane.get_oil_truck(date_now, function (res_oil_truck) {
        console.log('res_oil_harvester ' + res_oil_truck);
    });


    get_havester(function (data)
    {
        async.eachSeries(data, function (row, next) {
            //console.log(row.blackbox_id);
            //  date_now = '2015-11-27'
            get_zrepdata_harvester(row.blackbox_id, date_now, function (r) {
                if (r == true) {
                    next();
                }
            });

        }, function () {
            console.log('start get_harvest_vehicle_working_log ');
            dtc2cane.get_harvest_vehicle_working_log();
            process_truck();
        });
    });
   

    function process_truck()
    {
        get_truck(function (data)
        {
            async.eachSeries(data, function (row, next) {
                //console.log(row.blackbox_id);
                //  date_now = '2015-11-27'
                get_zrepdata_truck(row.blackbox_id, date_now, function (r) {
                    if (r == true)
                    {
                        next();
                    }
                });

            }, function ()
            {
                console.log('start  get_delivery_vehicle_working_log');
                jCutloading.send2history_status_11cutting_77loading(function ()
                {
                    dtc2cane.get_delivery_vehicle_working_log();
                })

            });
        });
    }
    
    
    /* EDIT BY AOB */
    
    clear_truck_weight();
    
    function clear_truck_weight() {
        var auto_update = "UPDATE rec_now SET htt_status_truck='EMPTY'; ";
        auto_update += "UPDATE rec_now SET htt_place='ROAD_WITHOUT_CANE' WHERE blackbox_id IN ";
        auto_update += "(SELECT htt7.blackbox_id FROM dblink('dbname=HTT port=5432', 'SELECT blackbox_id FROM htt7') as htt7 (blackbox_id varchar(20))); ";
        db.excute(pg_realtime, auto_update, function (result) {
            if (result == "oK") {
                console.log("Status Truck (weight) Updated");
            }
        });
    }

});

    /**/


//#endregion
