//https://www.pluralsight.com/guides/node-js/exposing-your-local-node-js-app-to-the-world


//var config_file = require('pi_config.js');
var config_file = require('pi_config_multicam.js');
var config = [];
config_file.getcon_localtunnel(function (res_config) {
    config = res_config;

});

const ngrok = require('ngrok');
//var local = require('localtunnel');
var pi3send = require('pi_senddata.js');
var api_name = config.camera.api_name; //'set_urlcamera';
var port = 8080; //config.camera.port; //

(async function() {
    const url = await ngrok.connect(port);
    
  //  console.log(url);
    
/*  */
    pi3send.send_data(api_name, {
        'fleetid': config.camera.fleetid //'ocsb'
        , 'url': url //tunnel.url
        , 'camera_id': config.camera.camera_id //'1010003013'
    }, function (res)
    {
	    console.log('callback ' + res);
    });
  
   
  })();

  /*
ngrok.connect(port, function (err, url) {
    if (err)
    {
        console.log(err);
        process.exit(1); // we want it to restart and get a local tunnel that works
    }
    

    pi3send.send_data(api_name, {
        'fleetid': config.camera.fleetid //'ocsb'
        , 'url': url //tunnel.url
        , 'camera_id': config.camera.camera_id //'1010003013'
    }, function (res)
    {
	    console.log('callback ' + res);
    });
  
    
    console.log(url);
});
*/

//OCSB03,OCSB04

/*
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

 */