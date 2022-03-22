
var config_file = require('pi_config.js');
var exec = require('child_process').exec;

var config = [];
config_file.getcon_localtunnel(function (res_config) {
    config = res_config;

});

var local = require('localtunnel');
var pi3send = require('pi_senddata.js');
var api_name = config.camera.api_name; //'set_urlcamera';
var port = 8083;//config.camera.port; //

var tunnel = local(port, function (err, tunnel)
{
    //response from localtunnell = tunnel.url
    if (err)
    {
        console.log(err);
        child = exec('node pi_localtunnel_cam2.js', function (error, stdout, stderr) {
            console.log('stdout:' + stdout);
            console.log('stderr:' + stderr);
    
            if (error != null) {
                console.log(error);
            }
        });
	}

    pi3send.send_data(api_name, {
        'fleetid': config.camera.fleetid //'ocsb'
        , 'url': tunnel.url
        , 'camera_id': config.camera.camera_id //'1010003013'
    }, function (res)
    {
	    console.log('callback ' + res);
	});

	console.log(tunnel.url);
 });

tunnel.on('close', function ()
{
   console.log('tunnel close');
});

