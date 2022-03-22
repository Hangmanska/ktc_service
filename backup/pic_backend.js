
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

var hpt = require('hp_timer.js');
var ith = require('iTimer_Helper.js');

var pic2db = require('./pic_sevice2db.js');
var tempsv = require('./ruuvi_service2db.js'); 
var pm25sv = require('./pm2.5_service2db.js'); 


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


apiRoutes.post('/set_urlcamera_x', pic2db.set_urlcamera_x);

apiRoutes.post('/set_urlcamera_realtime', pic2db.set_urlcamera_realtime); //vt900 

apiRoutes.post('/set_url_multicamera', pic2db.set_url_multicamera);

apiRoutes.post('/set_picsnap_from_pi_multicam',multipartMiddleware,pic2db.set_picsnap_from_pi_multicam);

apiRoutes.post('/retrive_picsnap_from_pi',multipartMiddleware,pic2db.set_picsnap_from_pi);

apiRoutes.post('/get_picture_db',pic2db.get_picture_db);

apiRoutes.post('/list_picture_db',pic2db.list_picture_db);

apiRoutes.post('/get_picture_infarm',pic2db.get_picture_infarm);

apiRoutes.post('/is_infarm',pic2db.is_infarm)


//ruuvi 
/**/
apiRoutes.post('/set_data_sensor_temp',tempsv.set_data_sensor_temp);
apiRoutes.post('/list_all_sensor',tempsv.list_all_sensor);
apiRoutes.post('/list_all_sensor_PMK',tempsv.list_all_sensor_PMK);
apiRoutes.post('/history_data_sensor',tempsv.history_data_sensor);
apiRoutes.post('/gateway_sensor',tempsv.gateway_sensor);

apiRoutes.post('/set_data_sensor_pm',pm25sv.set_data_sensor_pm);
apiRoutes.post('/list_all_sensor_pm',pm25sv.list_all_sensor_pm);
apiRoutes.post('/history_data_sensor_pm',pm25sv.history_data_sensor_pm);



//#region serverApp.listen
//const apiTimeout = 10 * 1000;
App.listen(port_service);
//App.setTimeout(apiTimeout);
//App.timeout = 1000;
//server.listen(port_service);
console.log('KTC service  Listening on port ' + port_service + '...');

//#endregion serverApp.listen
