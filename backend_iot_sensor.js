
//#region module
var cors = require('cors');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const formidable = require('express-formidable');
var  iproces = require('./sensor_iot_process.js')

require('events').EventEmitter.prototype._maxListeners = 0;

var port_service = 9017;
var express = require('express');

var noti = require('./backend_sockjs_iot_sensor.js');//9018 port socket io



var App = express();
var apiRoutes = express.Router();
var busboy = require('connect-busboy');

    //http://angular-ui.github.io/ui-leaflet/examples/0000-viewer.html#/layers/overlays-markers-nested-example
    //https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
    //http://na5cent.blogspot.com/2015/02/jwt-json-web-token.html
// use body parser so we can get info from POST and/or URL parameters
//serverApp.use(bodyParser.urlencoded({ extended: false }));
App.use(cors());
App.use(bodyParser.json({ limit: '50mb' }));
App.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
App.disable('etag');
//serverApp.set('superSecret', config.secret); // secret variable

App.use('/api', apiRoutes);

App.use(formidable());


// route middleware to verify a token
//apiRoutes.use(SKTC.Isauthenticate);

apiRoutes.get('/', function (req, res)
{
    res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.post('/get_datasensor', function (req, res)
{
debugger

//console.log(req.body.data);
 iproces.set_realtime_sensor(req.body.data);
 
   //console.log(data_sensor);
  // var t = JSON.stringify( data_sensor.data);
  // console.log(t);
  // res.send(t);
 
  /*
   sensor_cal.process_realtime(data_sensor.rawval,function(xres){
        if (res.finished == false) 
        {
              console.log(data_sensor);
              res.send(xres);
         }
   });
   */

});


App.listen(port_service);
//server.listen(port_service);
console.log('KTC service  Listening on port ' + port_service + '...');