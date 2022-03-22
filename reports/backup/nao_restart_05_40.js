
var schedule = require('node-schedule');
var pm2 = require('pm2');
var moment = require('moment');

var rule_6011 = new schedule.RecurrenceRule();
rule_6011.dayOfWeek = [new schedule.Range(0, 6)];
rule_6011.hour = 03;
rule_6011.minute = 00;

var rule_6020 = new schedule.RecurrenceRule();
rule_6020.dayOfWeek = [new schedule.Range(0, 6)];
rule_6020.hour = 04;
rule_6020.minute = 20;

var rule_6023 = new schedule.RecurrenceRule();
rule_6023.dayOfWeek = [new schedule.Range(0, 6)];
rule_6023.hour = 04;
rule_6023.minute = 11;

var rule_6026 = new schedule.RecurrenceRule();
rule_6026.dayOfWeek = [new schedule.Range(0, 6)];
rule_6026.hour = 04;
rule_6026.minute = 00;

var rule_6027 = new schedule.RecurrenceRule();
rule_6027.dayOfWeek = [new schedule.Range(0, 6)];
rule_6027.hour = 04;
rule_6027.minute = 05;

var rule_6028 = new schedule.RecurrenceRule();
rule_6028.dayOfWeek = [new schedule.Range(0, 6)];
rule_6028.hour = 04;
rule_6028.minute = 08;

var rule_6030 = new schedule.RecurrenceRule();
rule_6030.dayOfWeek = [new schedule.Range(0, 6)];
rule_6030.hour = 04;
rule_6030.minute = 10;

var rule_6032 = new schedule.RecurrenceRule();
rule_6032.dayOfWeek = [new schedule.Range(0, 6)];
rule_6032.hour = 04;
rule_6032.minute = 32;

var rule_6033 = new schedule.RecurrenceRule();
rule_6033.dayOfWeek = [new schedule.Range(0, 6)];
rule_6033.hour = 04;
rule_6033.minute = 35;



var rule_6034 = new schedule.RecurrenceRule();
rule_6034.dayOfWeek = [new schedule.Range(0, 6)];
rule_6034.hour = 05;
rule_6034.minute = 40;

var rule_6036 = new schedule.RecurrenceRule();
rule_6036.dayOfWeek = [new schedule.Range(0, 6)];
rule_6036.hour = 04;
rule_6036.minute = 40;

var rule_6039 = new schedule.RecurrenceRule();
rule_6039.dayOfWeek = [new schedule.Range(0, 6)];
rule_6039.hour = 04;
rule_6039.minute = 45;


//https://github.com/node-schedule/node-schedule
var j = schedule.scheduleJob({hour: 05, minute: 30, dayOfWeek: 0}, function(){
  //console.log('Time for tea!');
  console.log('restart every Sunday iServer_6027_VT900 Ratburi '+moment().format("YYYY-MM-DD HH:mm"));
  // restart_ratburi();
});

var port_6011 ='iServer_6011'; //Udon KMP U1 Lite
var port_6020 ='iServer_6020_Sec'; //ราชบุรี U1 Lite
var port_6023 ='iServer_6023_VT900_Udon';
var port_6026 ='iServer_6026_VT900';
var port_6027 ='iServer_6027_VT900';

var port_6028 ='iServer_6028_VT900'; //++

var port_6030 ='iServer_6030_VT900';
var port_6032 ='iServer_6032_VT900'; //++
var port_6033 ='iServer_6033_VT900_Center';
var port_6034 ='iServer_6034_VT900_Nao';

var port_6036 ='iServer_6036_VT900_Italthai';
var port_6039 ='iServer_6039_VT900_Nissan';


schedule.scheduleJob(rule_6011, function () 
{
  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6011_U1Lite udon '+moment().format("YYYY-MM-DD HH:mm"));
  restart_udon_6011();

});

schedule.scheduleJob(rule_6020, function () 
{
  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6020_U1Lite ratburi '+moment().format("YYYY-MM-DD HH:mm"));
  restart_ratburi_6020();

});


schedule.scheduleJob(rule_6023, function () 
{
  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6023_VT900 udon '+moment().format("YYYY-MM-DD HH:mm"));
  restart_udon_6023();

});

//{hour: 14, minute: 30, dayOfWeek: 0}

schedule.scheduleJob(rule_6026, function () 
{
  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6026_VT900 udon '+moment().format("YYYY-MM-DD HH:mm"));
  restart_udon_6026();

});

schedule.scheduleJob(rule_6027, function () {
 

  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6027_VT900 Ratburi '+moment().format("YYYY-MM-DD HH:mm"));

  restart_ratburi_6027();

});

schedule.scheduleJob(rule_6028, function () {
 

  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6028_VT900  '+moment().format("YYYY-MM-DD HH:mm"));

  restart_6028();

});


schedule.scheduleJob(rule_6030, function () 
{
  console.log('restart iServer_6030 '+moment().format("YYYY-MM-DD HH:mm"));
  restart_6030();
});

schedule.scheduleJob(rule_6032, function () {
 
  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6032_VT900 '+moment().format("YYYY-MM-DD HH:mm"));
  restart_6032();

});


schedule.scheduleJob('1 * * * *', function() { //run every hour at minute 1
  //console.log('The answer to life, the universe, and everything!');
  console.log('restart iServer_6033_VT900_Center '+moment().format("YYYY-MM-DD HH:mm"));
  restart_center_6033();
});

/*
schedule.scheduleJob(rule_6033, function () {
 
  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

});
*/

schedule.scheduleJob(rule_6034, function () {
 

    //var date_gen_report = moment().format("YYYY-MM-DD");
   // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

    console.log('restart iServer_6034_VT900_Nao '+moment().format("YYYY-MM-DD HH:mm"));

    restart_nao_6034();

});

schedule.scheduleJob(rule_6036, function () {
 

  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6036_VT900_Italthai '+moment().format("YYYY-MM-DD HH:mm"));

  restart_italthai_6036();

});

schedule.scheduleJob(rule_6039, function () {
 

  //var date_gen_report = moment().format("YYYY-MM-DD");
 // var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

  console.log('restart iServer_6039_VT900_Nissan '+moment().format("YYYY-MM-DD HH:mm"));

  restart_nissan_6039();

});


function restart_udon_6011()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6011, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_ratburi_6020()
{

  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6020, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}


function restart_udon_6023()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6023, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}


function restart_udon_6026()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6026, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_ratburi_6027()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6027, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_6028()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6028, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_6030()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6030, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_6032()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting 6032_VT900 or PM2 64");
      pm2.restart(port_6032, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_center_6033()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting 6033_VT900_Center or PM2 64");
      pm2.restart(port_6033, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_nao_6034()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6034, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_italthai_6036()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6036, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

function restart_nissan_6039()
{
  
  pm2.connect(function(err) {
    if (err) throw err;
  
    setTimeout(function worker() {
      console.log("Restarting app...");
      pm2.restart(port_6039, function() {});
        setTimeout(worker, 1000);
      }, 1000);
  });
  
  /**/
  setTimeout(function(){
      process.exit(0);
  }, 5000);

}

console.log('start '+moment().format("YYYY-MM-DD HH:mm"));