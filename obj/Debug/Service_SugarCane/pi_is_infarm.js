
var config_file = require('pi_config.js');
var pi3send = require('pi_senddata.js');
var pi3get_pic = require('pi_get_image.js');
var pi3up_pic = require('pi_upload_image2serv.js');
var pi3_ota = require('pi_ota.js');

var config = [];
config_file.getcon_localtunnel(function (res_config) {
    config = res_config;
});

var api_quey = config.is_infarm.api_quey;
var pi_version = config.version.id;

function is_infarm_getpicture()
{
    /**/
     pi3send.send_data(api_quey, {
        'fleetid': config.camera.fleetid //'ocsb'
        , 'camera_id': config.camera.camera_id //'1010003013'
    }, function (res)
    {
        debugger;
        //console.log('callback ' + res.camera_id);
        //console.log('callback ' + res.is_infarm)
        //console.log('callback ' + res.is_cutting_loading);

        if (res.server_version > pi_version) 
         { 
           
         }

        if (res.is_infarm == true && res.is_cutting_loading == true) 
        {
            pi3get_pic.get_lastimage(function(pic_name)
            {
                pi3up_pic.pi_upload2_serv(pic_name, res.camera_id, function (response)
                {
                    console.log(response);
                });
            });
        }


	});
    
   // console.log(api_name + ' ' + config.camera.camera_id);
}


setInterval(function () {
    // console.log('The answer to life, the universe, and everything!');
     is_infarm_getpicture();
      //var dest = path.join(__dirname, '/Service_SugarCane/node_modules/')
      //pi3_ota.download('61.91.14.253', dest, function () {
      
      //});

}, 1 *  60 * 1000);