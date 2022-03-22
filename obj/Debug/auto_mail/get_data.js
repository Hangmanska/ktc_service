
var request = require('request');
var mustache = require("mustache");
var moment = require('moment');
//var fs = require('fs-extra');
//var mkdirp = require('mkdirp');
var async = require('async');
var util = require("util");


var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());

var Report = require('./backend_reports.js');

function process()
{
    console.log(moment().subtract(1, 'days').format("YYYY-MM-DD"));

    
    var para = {
        'fleetid': 'db_10001', 'modem_id': '1010001002'
        , 'start_time': '2016-09-29 00:00', 'end_time': '2016-09-29 23:59'
    };

    Report.Gen_report_trip(para, function (xres)
    {
        debugger;
        console.log(xres);
    });



    /*
    var sql = "SELECT fleetid,fleetname FROM master_fleet WHERE automail='1' ";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
    */

}


setTimeout(function () {
    //   get_period();
    process();
    //test_readDirectory();
  

}, 1000);