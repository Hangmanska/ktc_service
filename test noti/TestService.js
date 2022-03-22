var request = require('request');
var fs = require('fs');
/*
var sha1 = require('sha1');
var php = require('phpjs');
*/

function iGet(url, callback) {
    request({
        uri: url,
        method: "GET",
    }, function (error, response, body) {
        
        if (error) {
            console.log("err iPost : " + error.message);
        }
        callback(body);
        return;
    });
}

function iPost(url, JsonBody, callback) {
    request({
        uri: url,
        json: true,
        method: "POST",
        body: JsonBody
    }, function (error, response, body) {
        
        if (error) {
            console.log("err iPost : " + error.message);
        }
        callback(body);
        return;
    });
}


setTimeout(function () {
    
  //  decode('i516j5l5p4w5', "DTCGPS");
    test_postruuvi();

}, 1000);

function test_postruuvi()
{

   var json = { tags: 
        [ { accelX: 0.115,
            accelY: 0.041,
            accelZ: 1.025,
            dataFormat: 3,
            defaultBackground: 6,
            favorite: true,
            gatewayUrl: '',
            humidity: 50,
            id: 'C7:A4:8E:F4:EF:C2',
            measurementSequenceNumber: 0,
            movementCounter: 0,
            pressure: 1008.15,
            rawDataBlob: [Object],
            rssi: -43,
            temperature: 31.26,
            txPower: 0,
            updateAt: '2019-09-19T01:20:14+0700',
            voltage: 3.019 } ],
       batteryLevel: 51,
       deviceId: 'cadff4a8-94f6-4803-81d4-6cf9c123d3d0',
       eventId: 'ea3acafd-9032-409c-b446-a303eb9d1924',
       location: 
        { accuracy: 2000,
          latitude: 13.801801801801801,
          longitude: 100.59829044867064 },
       time: '2019-09-19T01:20:14+0700' }

       /*
       iPost('http://61.91.14.253:8003/api/gateway_sensor', json, function (respond) {
        console.log(respond);
    });
    */

    iPost('http://127.0.0.1:8003/api/gateway_sensor', json, function (respond) {
        console.log(respond);
    });
}

function test() {
    var json = [
    { "vehicle_type_id": "25", "vehicle_type": "รถบรรทุกอ้อยตัด (รถพ่วง)", "total": "40", "company_code": "MPK" }
    ];

    var json = {
        "vehicle_type_id": "25",
        "vehicle_type": "รถบรรทุกอ้อยตัด (รถพ่วง)",
        "total": "40",
        "company_code": "MPK"
    }

    iPost('http://localhost:9002/add_master_vehicle_type', json, function (respond) {
        console.log(respond);
    });
}


/* */
function decode($string, $key) {
    debugger;
    var key = sha1($key);
    var strLen = php.strlen($string);
    var keyLen = php.strlen($key);
    var j = 0; 
    var hash = "";
    for (var i = 0; i < strLen; i+=2) {
        var ordStr = hexdec(base_convert(php.strrev(substr(string, i, 2)), 36, 16));
        if (j == keyLen) { j = 0; }
        ordKey = ord(substr(key,j,1));
       j++;
       // $hash .= chr($ordStr - $ordKey);
    }
     // return $hash;
    return hash;
}
