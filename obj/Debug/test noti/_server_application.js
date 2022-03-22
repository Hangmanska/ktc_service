//#region module

var cors = require('cors');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var express = require('express');

//var SHTT = require('./service_htt.js');
var SKTC = require('./service_ktc.js');
//#endregion

//#region setting

var serverApp = express();
serverApp.use(cors());
serverApp.use(bodyParser.json({ limit: '50mb' }));
serverApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
serverApp.disable('etag');

//#endregion setting


serverApp.get('/tracking_realtime', SKTC.tracking_realtime);
serverApp.post('/get_login', SKTC.get_login);

//#region serverApp.listen

serverApp.listen(9002);
console.log('KTC service  Listening on port 9002...');

    //#endregion serverApp.listen



