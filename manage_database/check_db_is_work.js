

var schedule = require('node-schedule');
var exec = require('child_process').exec;
var moment = require('moment');

var utcp = require('Utility_tcp.js');

function start()
{
    child = exec('service postgresql-9.3 status', function (error, stdout, stderr) 
    {
       
       // console.log('stderr:' + stderr);
      

        if (utcp.Contains(stdout, 'dead'))
        {
            console.log('stdout: Database dead ' + stdout+' '+moment().format("YYYY-MM-DD HH:mm") );
            //service postgresql-9.3 restart
            child = exec('service postgresql-9.3 restart', function (error, stdout, stderr) 
            {
                console.log('stdout_restart :' + stdout+' '+moment().format("YYYY-MM-DD HH:mm") );
                console.log('stderr_restart :' + stderr);
            })
        }
        else
        {
            console.log('stdout: Database still OK ' + stdout+' '+moment().format("YYYY-MM-DD HH:mm") );
        } 

        if (error != null) 
        {
            console.log(error);
        }
    });
}

console.log('start '+moment().format("YYYY-MM-DD HH:mm"))

schedule.scheduleJob('*/2 * * * *', function() { // run a cron job every two minutes
    start();
});

//https://linuxize.com/post/cron-jobs-every-5-10-15-minutes/
//*/5  * * * *