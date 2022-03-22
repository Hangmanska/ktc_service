
var request = require("request");



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


setTimeout(function () {

    var para = { fleetid: 'ocsb', url: 'https://ulxdriugto.localtunnel.me', camera_id: '1010003004' };
    //var url = 'http://127.0.0.1:9003/api/set_urlcamera';
    var url = 'http://61.91.14.253:9003/api/set_urlcamera';

    iGet(url, para, function (xres) {
        console.log(xres);
    });

}, 1000);