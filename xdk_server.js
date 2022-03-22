
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

var util = require('util');
var port_service = 9905;
    //http://angular-ui.github.io/ui-leaflet/examples/0000-viewer.html#/layers/overlays-markers-nested-example
    //https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
    //http://na5cent.blogspot.com/2015/02/jwt-json-web-token.html
// use body parser so we can get info from POST and/or URL parameters
//serverApp.use(bodyParser.urlencoded({ extended: false }));

//serverApp.set('superSecret', config.secret); // secret variable

app.get('/get', function (req, res)
{
    var payload = req.body;
    console.log('get'+payload);
   // res.json({ message: 'Welcome to the coolest API on earth!' });
});

app.post('/post', function (req, res)
{
    var payload = req.body;
    console.log('post '+payload);
});


app.post('/bosch/xdk/senddata', function (req, res) {
    console.log("Sending Bosch xdk data.");
    var payload = req.body;
    var header = req.headers;

    // Adjust values
    payload.temperature = payload.temperature/1000;
    payload.pressure = payload.pressure/100;

    // Modify the data based on spec:
    console.log("Header: "+util.inspect(header,false,null));
    console.log("Payload: "+util.inspect(payload,false,null));

    var deviceId = req.body.xdkSN
  //  sendData(deviceId, "XKit", "urn:bosch:device:xdk", "urn:bosch:device:xdk:data", payload);

    // Respond async.  No need for transactional.
    res.send(JSON.stringify({ result: "Success"}));
    res.end();
});

app.listen(port_service);
//server.listen(port_service);
console.log('KTC service  Listening on port ' + port_service + '...');