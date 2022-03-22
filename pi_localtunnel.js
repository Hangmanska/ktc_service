
var config_file = require('pi_config.js');
var config = [];
config_file.getcon_localtunnel(function (res_config) {
    config = res_config;

});

var local = require('localtunnel');
var pi3send = require('pi_senddata.js');
var api_name = config.camera.api_name; //'set_urlcamera';
var port = config.camera.port; //8080;

//var tunnel = local(port, { subdomain: config.camera.camera_id}, function (err, tunnel)
var tunnel = local(port, function (err, tunnel)
{
    //response from localtunnell = tunnel.url
    if (err)
    {
        console.log(err);
        process.exit(1); // we want it to restart and get a local tunnel that works
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


tunnel.on('close', function () {
    console.log('tunnel close');
    process.exit(1);
});
    
tunnel.on('error', function (err) {
    process.exit(err);
});
    
process.on('uncaughtException', function (er) {
    process.exit(err);
 });

 //config.camera.camera_id
 //config.camera.file_name
 //config.camera.photo