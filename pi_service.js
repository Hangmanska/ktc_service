
//https://github.com/ruuvi/ruuvi-sensor-protocols
//https://www.npmjs.com/package/node-ruuvitag

//npm install "https://github.com/jrobeson/node-bluetooth-hci-socket/#fix-builds-for-node-10"
//https://github.com/noble/node-bluetooth-hci-socket/issues/84

const ruuvi = require('node-ruuvitag');
var pi3send = require('pi_senddata.js');
var config_file = require('pi_config.js');

var config = [];
config_file.getcon_config(function (res_config) {
    config = res_config;
});

//var idata =null;
var api_name = config.service.api_name; 
var id_server= config.service.id_server; 

/**/
ruuvi.on('found', tag => {
  console.log('Found RuuviTag, id: ' + tag.id);
  tag.on('updated', data => {
    //console.log('Got data from RuuviTag ' + tag.id + ':\n' +JSON.stringify(data, null, '\t'));
     // console.log(tag.id)
    var idata = {'id':tag.id, data: JSON.stringify(data, null),'id_server':id_server};
     console.log(idata);
   pi3send.send_data(api_name,idata, function (res)
   {
       console.log('callback ' + res);
     //  return new Promise(resolve => setTimeout(resolve, 300));
   });

  });
});


/*

var sec = 15000;

setInterval(function() 
{
  console.log('run every 15 sec'+JSON.stringify(idata));

  pi3send.send_data(api_name,idata, function (res)
  {
      console.log('callback ' + res);
    //  return new Promise(resolve => setTimeout(resolve, 300));
  });

}, 10000);
*/

function test()
{
  var idata ={ id: 'c7a48ef4efc2',data: '{"dataFormat":3,"rssi":-50,"humidity":55.5,"temperature":30.35,"pressure":100730,"accelerationX":3,"accelerationY":202,"accelerationZ":994,"battery":2977}' }
  console.log(idata);
  pi3send.send_data(api_name,idata, function (res)
  {
      console.log('callback ' + res);
    //  return new Promise(resolve => setTimeout(resolve, 300));
  });
}

//test();


//https://iotandelectronics.wordpress.com/2016/10/07/how-to-calculate-distance-from-the-rssi-value-of-the-ble-beacon/

//https://gist.github.com/eklimcz/446b56c0cb9cfe61d575
function calculateDistance(rssi,txPower) {
  
 // var txPower = -59 //hard coded power value. Usually ranges between -59 to -65
  
  if (rssi == 0) {
    return -1.0; 
  }

  var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    return distance;
  }
} 


//{ id: 'd4bc1ea955d4', data: '{"url":"https://ruu.vi/#AnAeAMTg","dataFormat":2,"rssi":-74,"humidity":56,"temperature":30,"pressure":1004}' }


/*
{ id: 'd4bc1ea955d4',
  data: 
   { url: 'https://ruu.vi/#AnAeAMTg',
     dataFormat: 2,
     rssi: -82,
     humidity: 56,
     temperature: 30,
     pressure: 1004,
     eddystoneId: undefined 
    } 
}


Got data from RuuviTag d4bc1ea955d4:
{
        "url": "https://ruu.vi/#AmAcAMYM",
        "dataFormat": 2,
        "rssi": -52,
        "humidity": 48,
        "temperature": 28,
        "pressure": 1007
}
Got data from RuuviTag c7a48ef4efc2:
{
        "url": "https://ruu.vi/#AmAdAMYM",
        "dataFormat": 2,
        "rssi": -44,
        "humidity": 48,
        "temperature": 29,
        "pressure": 1007
}

*/