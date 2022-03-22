
var fs = require('fs');
var express = require('express');
var https = require('https');
var key = fs.readFileSync('./hacksparrow-key.pem');
var cert = fs.readFileSync('./hacksparrow-cert.pem');

var https_options = {
    key: key,
    cert: cert
};
var PORT = 8080//9009;
var HOST = '127.0.0.1';//'61.91.14.253';
var app = express();

var apiRoutes = express.Router();
app.use('/', apiRoutes);
//app.configure(function () {
  //  app.use(app.router);
//});

server = https.createServer(https_options, app).listen(PORT);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);

app.get('/', function (req, res) {
    res.header('Content-type', 'text/html');
    return res.end('<h1>Hello, Secure World!</h1>');
});
    // routes
app.get('/hey', function (req, res) {
    res.send('HEY!');
});
app.post('/ho', function (req, res) {
    res.send('HO!');
});

    //https://www.sitepoint.com/use-ngrok-test-local-site/