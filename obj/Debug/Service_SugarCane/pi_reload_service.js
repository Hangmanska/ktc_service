
var exec = require('child_process').exec;

function reset_camera()
{
    child = exec('sudo service motion restart', function (error, stdout, stderr) {
        console.log('stdout:' + stdout);
        console.log('stderr:' + stderr);

        if (error != null) {
            console.log(error);
        }
    });
}


function reset_pm2()
{
    child = exec('pm2 restart all', function (error, stdout, stderr) {
        console.log('stdout:' + stdout);
        console.log('stderr:' + stderr);

        if (error != null) {
            console.log(error);
        }
    });
}


setInterval(function () {
   // console.log('The answer to life, the universe, and everything!');
    reset_camera();
    reset_pm2();

}, 1 * 60 * 60 * 1000); 