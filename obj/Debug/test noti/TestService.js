var request = require('request');
var fs = require('fs');

var sha1 = require('sha1');
var php = require('phpjs');

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
    
    decode('i516j5l5p4w5', "DTCGPS");


}, 1000);

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
