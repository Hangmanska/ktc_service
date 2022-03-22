
var request = require("request");

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

function iGet(url, JsonBody, callback) {
    request({
        uri: url,
        json: true,
        method: "GET",
        body: JsonBody
    }, function (error, response, body) {

        if (error) {
            console.log("err iPost : " + error.message);
        }
        callback(body);
        return;
    });
}

function send_to_sockio(callback) {
    debugger;
    //noti/db_10002/ความเร็วเกินกำหนด125
    //success = 1 green, info = 2 blue, warning = 3 orange, danger = 4  red
    var json2 = {
        "fleet_id": "db_10001",
        "message": "รถเข้าสถานีzzz",
        "status" : 1
    }

    var json =
      {
          'fleet_id': 'db_10001', 'vehicle_name': 'กล่องเทส'
          , 'speed_setting': '80', 'speed_over': '98'
      };

    iPost('http://61.91.14.253:9003/api/noti', json, function (respond) {
        debugger;
        console.log(respond);
    });

}

function send_to_camera(callback)
{
    var json = { fleet_id: 'ocsb', url: 'https://uuizicseze.localtunnel.me', camera_id: '1010003013' }

    iGet('http://127.0.0.1:9003/api/set_urlcamera', json, function (respond) {
        debugger;
        console.log(respond);
    });
}


setTimeout(function () {

    //send_to_sockio(function (res) {
    //    debugger;
    //    console.log(res);
    //});

    send_to_camera(function (res) {
            debugger;
            console.log(res);
    });

}, 1000);