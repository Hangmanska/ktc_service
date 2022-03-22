
//#region module
var cors = require('cors');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const formidable = require('express-formidable');

require('events').EventEmitter.prototype._maxListeners = 0;

var express = require('express');
var timeout = require('connect-timeout')
var jwt = require('jsonwebtoken');

//var hpt = require('hp_timer.js');
//var ith = require('iTimer_Helper.js');


var tempsv = require('./ruuvi_service2db.js'); 



var jwtTokenSecret = 'hangman';
var port_service = 8003;


var App = express();
var apiRoutes = express.Router();
var busboy = require('connect-busboy');

App.use(cors());
App.use(bodyParser.json({ limit: '50mb' }));
App.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
App.disable('etag');

App.use('/api', apiRoutes);
App.use(busboy());
App.use(formidable());

App.use(timeout('5s'))
App.use(haltOnTimedout)

function haltOnTimedout (req, res, next) {
    if (!req.timedout) next()
  }
  

  // https://expressjs.com/en/resources/middleware/timeout.html

/**/

App.use(function(err, req, res, next)
{
    console.log(JSON.stringify(req.headers));
    console.log('Something '+JSON.stringify(req.body));
    console.log('Something broke!')
    console.error(err.stack);
   // res.send(500, 'Something broke!');
  //  res.render('index',{title: "Something broker"})
});

apiRoutes.get('/', function (req, res)
{
    res.json({ message: 'Welcome to the coolest API on earth!' });
});




//ruuvi 
/**/
apiRoutes.post('/set_data_sensor_temp',tempsv.set_data_sensor_temp);
apiRoutes.post('/list_all_sensor',tempsv.list_all_sensor);
apiRoutes.post('/list_all_sensor_PMK',tempsv.list_all_sensor_PMK);
apiRoutes.post('/history_data_sensor',tempsv.history_data_sensor);
apiRoutes.post('/gateway_sensor',tempsv.gateway_sensor);

/*
apiRoutes.post('/set_data_sensor_pm',pm25sv.set_data_sensor_pm);
apiRoutes.post('/list_all_sensor_pm',pm25sv.list_all_sensor_pm);
apiRoutes.post('/history_data_sensor_pm',pm25sv.history_data_sensor_pm);
*/


//#region serverApp.listen
//const apiTimeout = 10 * 1000;
App.listen(port_service);
//App.setTimeout(apiTimeout);
//App.timeout = 1000;
//server.listen(port_service);
console.log('KTC service  Listening on port ' + port_service + '...');

//#endregion serverApp.listen
