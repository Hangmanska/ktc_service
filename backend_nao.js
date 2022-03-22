
//#region module
var cors = require('cors');
const formidable = require('express-formidable');
var express = require('express');


var nao = require('./service_nao.js');
var port_service = 9003;

var App = express();
var apiRoutes = express.Router();

App.use(cors());
App.use(bodyParser.json({ limit: '50mb' }));
App.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
App.disable('etag');

App.use('/api', apiRoutes);

App.use(formidable());

//+++++++++++++++++ Nao +++++++++++++++++++++++++++
apiRoutes.post('/get_report_working',nao.get_report_working);
apiRoutes.post('/get_login_nao', nao.authenticate_nao);
apiRoutes.post('/get_station_nao', nao.get_station_nao);
apiRoutes.post('/list_station_nao', nao.list_station_nao);
apiRoutes.post('/add_geom_nao', nao.add_geom_nao);
apiRoutes.post('/del_geom_nao', nao.del_geom_nao);



App.listen(port_service);

//console.log('KTC service  Listening on port ' + port_service + '...');

