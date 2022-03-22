

var schedule = require('node-schedule');
var async = require('async');
var moment = require('moment');
var dtc2cane = require('dtc2cane.js');



    //http://www.codexpedia.com/javascript/nodejs-cron-schedule-examples/

var rule2 = new schedule.RecurrenceRule();
rule2.dayOfWeek = [new schedule.Range(0, 6)];
rule2.hour = 23;
rule2.minute = 50;

    //#region


    //delay 1 day waiting harvest_fuel_report and  truck_fuel_report

schedule.scheduleJob(rule2, function () {

    console.log('cal oil This runs at 23:50 every day.');

    var xdate_now = moment().subtract(1, "days").format("YYYY-MM-DD");

  //  var xdate_now = '2016-02-12'

    console.log(xdate_now);

    debugger;

    dtc2cane.get_oil_harvester(xdate_now, function (res_oil_harvester) {
        console.log('res_oil_harvester ' + res_oil_harvester);
    });

    dtc2cane.get_oil_truck(xdate_now, function (res_oil_truck) {
        console.log('res_oil_truck ' + res_oil_truck);
    });

});


    /*
setTimeout(function () {
    var t = moment().subtract(1, "days").format("YYYY-MM-DD");
    console.log(t);
}, 1000); */