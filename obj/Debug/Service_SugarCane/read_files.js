


var http = require('http');

 //http://127.0.0.1/inspect/http

var options = {
    host: 'http://127.0.0.1:4040',
    path: '/'
}
var request = http.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });lo
    res.on('end', function () {
        console.log(data);

    });
});
request.on('error', function (e) {
    console.log(e.message);
});
request.end();

