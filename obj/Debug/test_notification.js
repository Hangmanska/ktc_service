
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

function send_to_sockio(callback) {
    debugger;
    //noti/db_10002/ความเร็วเกินกำหนด125
    //success = 1 green, info = 2 blue, warning = 3 orange, danger = 4  red
    var json = {
        "fleet_id": "db_10001",
        "message": "ซักสิบแปดบทเพลง",
        "status" : 1
    }

    iPost('http://61.91.14.253:9003/api/noti', json, function (respond) {
        debugger;
        console.log(respond);
    });

}


setTimeout(function () {

    send_to_sockio(function (res) {
        debugger;
        console.log(res);
    });

}, 1000);