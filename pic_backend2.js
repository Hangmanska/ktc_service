
//#region module
var cors = require('cors');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const formidable = require('express-formidable');

require('events').EventEmitter.prototype._maxListeners = 0;

var express = require('express');
var jwt = require('jsonwebtoken');

var hpt = require('hp_timer.js');
var ith = require('iTimer_Helper.js');

var pic2db = require('./pic_sevice2db2.js');



var jwtTokenSecret = 'hangman';
var port_service = 8004;


var App = express();
var apiRoutes = express.Router();
var busboy = require('connect-busboy');

App.use(cors());
App.use(bodyParser.json({ limit: '50mb' }));
App.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
App.disable('etag');

App.use('/api', apiRoutes);

App.use(formidable());


apiRoutes.get('/', function (req, res)
{
    res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.post('/set_urlcamera_x', pic2db.set_urlcamera_x);

apiRoutes.post('/retrive_picsnap_from_pi', multipartMiddleware, pic2db.set_picsnap_from_pi);

apiRoutes.post('/get_picture_db',pic2db.get_picture_db);

apiRoutes.post('/list_picture_db',pic2db.list_picture_db);

//#region serverApp.listen

App.listen(port_service);
//server.listen(port_service);
console.log('KTC service  Listening on port ' + port_service + '...');

//#endregion serverApp.listen
