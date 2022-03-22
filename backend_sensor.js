
//#region module
var cors = require('cors');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const formidable = require('express-formidable');

require('events').EventEmitter.prototype._maxListeners = 0;

var express = require('express');
var jwt = require('jsonwebtoken');

var sensor_db = require('./sensor_db_process.js');
var sensor_cal = require('./server_sensor.js');
var noti = require('./backend_sockjs_noti_hydac.js');//9000 port socket io


var xhydac = require('./test_senddata_2_sensor_hydac.js')


var jwtTokenSecret = 'hangman';
var port_service = 8002;
//#endregion


//var nu = require('./path/nu');
//module.exports = function (app) {
//    app.post('/create_newissue', nu.resourcesFunc);
//};

//https://www.thethingsnetwork.org/forum/t/how-to-push-the-data-to-freeboard-io/1395/2
//http://www.gianlucaguarini.com/blog/nodejs-and-a-simple-push-notification-server/

var App = express();
var apiRoutes = express.Router();
var busboy = require('connect-busboy');


App.use(cors());
App.use(bodyParser.json({ limit: '50mb' }));
App.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
App.disable('etag');
//serverApp.set('superSecret', config.secret); // secret variable
App.use('/api', apiRoutes);

App.use(formidable());



apiRoutes.get('/', function (req, res)
{
    res.json({ message: 'Welcome to the coolest API on earth!' });
});


//++++++++++++++++++ Hydac Sensor ++++++++++++++++++++++++++
apiRoutes.post('/rawdata_hydac',xhydac.send_no_serial);
apiRoutes.post('/get_all_sensor',sensor_db.get_all_sensor);

apiRoutes.post('/api_sensor/:sensor_id', function (req, res)
{
    debugger;
  //  var apikey = req.body.apikey;
    //var data_sensor = req.body.data;
 var data_sensor = req.body;

    var d={ sensor_id: 'A1',
  rawval: '564609',
  sensor_name: 'Temp',
  calval: '91.81',
  unit: 'C',
  group: 'hydacsensor',
  apikey: '$2a$10$imfccwgRrs7AL1cu3rr3nOjv' }
    // var msg = { mess: 'server reply ok ' + group, 'data_sensor': data_sensor};// ' ' + message };
   // res.json(data_sensor);
   
    sensor_db.set_realtime_sensor(data_sensor,function(xrs)
    {
        debugger
        res.json(data_sensor);
    });
  // sensor.broadcast(req.body, group);
});


apiRoutes.get('/get_sensor/:sensor_id', function (req, res)
{
    debugger;
  //  var apikey = req.body.apikey;
    var id_sensor = req.params.sensor_id;
 //   Gdata_sensor = data_sensor;
 //   var group = req.body.group;
    //var room_id = 'db_10001';//req.id;
  //  console.log(JSON.stringify(req.body));

    var d={ sensor_id: 'A1',
  rawval: '564609',
  sensor_name: 'Temp',
  calval: '91.81',
  unit: 'C',
  group: 'hydacsensor',
  apikey: '$2a$10$imfccwgRrs7AL1cu3rr3nOjv' }
    // var msg = { mess: 'server reply ok ' + group, 'data_sensor': data_sensor};// ' ' + message };
  // res.json(d);
  //[{"data":"{\"sensor_id\":\"A0\",\"rawval\":\"570700\",\"sensor_name\":\"SAE\",\"calval\":\"15.0\",\"unit\":\"SAE\",\"group\":\"hydacsensor\",\"apikey\":\"$2a$10$imfccwgRrs7AL1cu3rr3nOjv\"}"}]
  // {"sensor_id":"A1","rawval":"564609","sensor_name":"Temp","calval":"91.81","unit":"C","group":"hydacsensor","apikey":"$2a$10$imfccwgRrs7AL1cu3rr3nOjv"}
   /**/
    sensor_db.get_realtime_sensor(id_sensor,function(data_sensor)
    {
        debugger
       // var data={'name':id_sensor,data_sensor}
       res.send(data_sensor[0].data);
      
    });
    
  // sensor.broadcast(req.body, group);
});

apiRoutes.get('/get_sensor/:db_sensor/:sensor_id', function (req, res)
{
    debugger;
  //  var apikey = req.body.apikey;
    var id_sensor = req.params.sensor_id;
    var db_sensor = req.params.db_sensor;

    sensor_db.get_realtime_sensordb(db_sensor,id_sensor,function(data_sensor)
    {
        debugger
       // var data={'name':id_sensor,data_sensor}
       res.send(data_sensor[0].data);
      
    });

});

apiRoutes.post('/getraw_datasensor', function (req, res)
{
 
   var data_sensor = req.body;
    //  console.log(data_sensor);
   sensor_cal.process_realtime(data_sensor.rawval,function(xres)
   {
        if (res.finished == false) 
        {
              console.log(data_sensor);
              res.send(xres);
         }
   })
});

apiRoutes.post('/get_realtime_dashboard',sensor_db.get_realtime_dashboard);

apiRoutes.post('/pi_set_realtime_dashboard_iso/:modem_id/:fleet_id',sensor_db.pi_set_realtime_dashboard_iso);


apiRoutes.post('/noti_sensor', function (req, res)
{
 
    var fleet_id = req.body.fleet_id;
  //  var message = req.body.message;
    //var room_id = 'db_10001';//req.id;
   // console.log(fleet_id);
   var msg = { mess: 'ok :-) ' + fleet_id };
    res.json(msg);

    noti.broadcast(req.body, fleet_id);

});

//#region serverApp.listen

App.listen(port_service);
//server.listen(port_service);
console.log('KTC sensor  Listening on port ' + port_service + '...');

//#endregion serverApp.listen


//https://github.com/simon04/POImap