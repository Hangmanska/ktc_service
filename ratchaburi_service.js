
var async = require('async');
var mustache = require("mustache");
var path = require('path');
var KMZGeoJSON = require('kmz-geojson');
var squel = require("squel");

var togeojson = require('togeojson');
var fs = require('fs');
var jsdom = require('jsdom').jsdom;
//var lineToPolygon = require('turf-line-to-polygon');
DOMParser = require('xmldom').DOMParser;

//var parse = require('csv-parse');

const cheerio = require('cheerio');
var htmlparser = require("htmlparser2");
//var tdtojson = require("td-to-json");

var formidable = require('formidable');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');



var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_factory_ratchaburi";
var db_vehicle_rat ="db_10021";

function base_geom() {
    this.station_name = '';
    this.station_type = '';
    this.bound1 = '';
    this.bound2 = '';
}

function split_box(s) {
    //var s = '100.438213348389,13.654444219406|100.438213348389,13.654444219406';
    var ar = s.split('|');
    var x1 = set_format(ar[0]);
    var x2 = set_format(ar[1]);
    var res = { 'bound1': x1, 'bound2': x2 };
   // var res = 'bound1:' + x1 + ',bound2:' + x2 ;
    return res;
}

function set_format(x) {
    var xar = x.split(',');
    var lon = xar[0];
    var lat = xar[1];

    var res = '[' + lat + ',' + lon + ']';
    return res;
}

function get_allfarm_ratchaburi(req, res)
{

/*
    var swlng1 = '103.888';
    var nelon2 = '104.534';
    var nelat2 = '16.057';
    var swlat1 = '15.673';
   
debugger
    var swlng1 = req.body.swlat1; //'103.888';
    var nelon2 = req.body.nelon2;  //'104.534';
    var nelat2 = req.body.nelat2;  //'16.057';
    var swlat1 = req.body.swlng1;  //'15.673';
    var zoom_level = req.body.zoom_level;
  */
   // debugger;
  //  var sql = "SELECT st_asgeojson(the_geom::geometry)as geom FROM all_farm ";
/*
var sql = "SELECT st_asgeojson(the_geomx::geometry)as geom  ";
sql += ",name_farmmer,qt,farm_id ";
sql += ",home,tambon,aumpher,province,area,type_ground,type_sugarcane ";
sql += ",name_sugarcane,source,xdate,distance,mothode,owner,eastimate, ";
sql += ",st_x(st_centroid(the_geomx::geometry)) as x ";
sql += ",st_y(st_centroid(the_geomx::geometry)) as y ";
sql += " FROM all_farm as a,detail_farm_register as b ";
sql += " WHERE a.owner_id::int=b.owner_id::int AND the_geomx IS NOT NULL ";
*/

var sql = "SELECT  "; 
sql += "details->>'id' as id  ";
sql += ",details->>'name_sur' as name_farmer  ";
sql += ",details->>'addr' as address  ";
sql += ",details->>'quota' as quota  ";
sql += ",details->>'true_area' as true_area  ";
sql += ",details->>'area_rai' as area_rai  ";
sql += ",details->>'ngan' as ngan  ";
sql += ",details->>'harvester' as harvester  ";
sql += ",details->>'usurevey2' as usurevey2  ";
sql += ",details->>'water2' as water2  ";

sql += ",st_asgeojson(geomx::geometry) as geom    ";
sql += ",st_x(st_centroid(geomx::geometry)) as lon  "; //--x 
sql += ",st_y(st_centroid(geomx::geometry)) as lat  "; //--y 
sql += " FROM  detail_farms ";

/*
SELECT 
details->>'id' as id
,details->>'name_sur' as name_farmer
,details->>'addr' as address
,details->>'quota' as quota
,details->>'true_area' as true_area
,details->>'area_rai' as area_rai
,details->>'ngan' as ngan
,details->>'harvester' as harvester
,details->>'usurevey2' as usurevey2
,details->>'water2' as water2

,st_asgeojson(geomx::geometry)as geom  
,st_x(st_centroid(geomx::geometry)) as lon--x 
,st_y(st_centroid(geomx::geometry)) as lat--y 
--,replace(replace(replace(box(ST_Extent(geomx)::geometry)::text, '(', ''),'),', '|'),')','') as boxs
 FROM  detail_farms

*/


//    sql += " WHERE (lon >" + utl.sqote(swlng1) + " AND lon < " + utl.sqote(nelon2) + ") ";
 //   sql += " AND (lat <= " + utl.sqote(nelat2) + " AND lat >= " + utl.sqote(swlat1) + ") AND minzoom=" + utl.sqote(zoom_level); //limit 100";

//ลำดับ,ชื่อชาวไร่,,โควตา,เลขที่แปลง,พิกัดแปลง,พิกัดรอบพื้นที่แปลง,เลขที่,บ้าน,ตำบล,อำเภอ,จังหวัด,พื้นที่ปลูก(ไร่),ประเภทดิน
//,ประเภทอ้อย,พันธุ์อ้อย,แหล่งพันธุ์,วันที่ปลูก,ระยะปลูก,วิธีการปลูก,ผู้ปลูก,คาดการณ์ผลผลิต(ลำ/ไร่)
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature"';
            strMustache += ' ,"name_farmmer": "{{name_farmer}}","quota": "{{quota}}","farm_id": "{{id}}"';
            strMustache += ' ,"address": "{{address}}","true_area": "{{true_area}}","area_rai": "{{area_rai}}" ';
            strMustache += ' ,"ngan": "{{ngan}}","harvester": "{{harvester}}","usurevey2": "{{usurevey2}}","water2": "{{water2}}" ';
            strMustache += ' ,"lon": "{{lon}}" ,"lat": "{{lat}}"  ';
            strMustache += ' ,"geometry":  {{geom}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';

            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');

            res.send(JSON.parse(final));
        }
        else
        {
            res.send([]);
        }
    });

}

function webservice_truck(req, res)
{
    var truck_name = req.body.truck_name;

    var sql = "SELECT htt_truck_name ";
    sql += ",htt_driver_name,htt_quota,htt_name_farmer,htt_driver_bank ";
    sql += ",lon,lat,htt_status_operation,speed,htt_harvester_name ";
    sql += ",htt_type_sugarcane,htt_plotcode,htt_type_vehicle ";
    sql += ",htt_time_distance_farm2factory";
    sql += ",htt_paydriver,htt_time_working_harvester ";
    sql += ",idate(htt_starttime_change_farm) as htt_starttime_change_farm ";
    sql += ",idate(htt_stoptime_change_farm) as htt_stoptime_change_farm ";
    sql += ",idate(htt_farm_leaving) as htt_farm_leaving ";
    sql += ",idate(htt_factorytime) as htt_factorytime ";
    sql += " FROM realtime  ";
    sql += " WHERE htt_truck_name='"+truck_name+"' ";

    ipm.db.dbname = db_vehicle_rat;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            res.send(rows);
        }
    });

}


function list_geom_ratchaburi(req, res)//(callback)
{

/*
    SELECT
    details->>'name_sur' as station_name
    ,'2' as station_type
    , replace(replace(replace(box(ST_Extent(geomx)::geometry)::text, '(', ''),'),', '|'),')','') as boxs
    FROM  detail_farms
    GROUP BY station_name
    */

   var sql = "SELECT ";
   sql += " details->>'name_sur' as station_name ";
   sql += ",'2' as station_type ";
   sql += ", replace(replace(replace(box(ST_Extent(geomx)::geometry)::text, '(', ''),'),', '|'),')','') as boxs ";
   sql += " FROM  detail_farms ";
   sql += " GROUP BY station_name ";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows)
    {
        if (rows.length > 0)
        {
          //  res.send(rows);
            var final = [];
           // var xres = {'station_name':'','station_type':'','pont_center':''}
            async.eachSeries(rows, function (row, next)
            {
                var xres = new base_geom();
                xres.station_name = row.station_name;
                xres.station_type = row.station_type;
                var xx = split_box(row.boxs);
                xres.bound1 = xx.bound1;//utl.replaceAll('"','',split_box(row.boxs));
                xres.bound2 = xx.bound2;
                final.push(xres);


                next();
            }, function () {
//debugger;
                res.send(final);
              // callback(final);
             //  return;
     
            });
        }
        else {
          //  callback([]);
          //  return;
          res.send([]);
        }
    });
}



exports.list_geom_ratchaburi = list_geom_ratchaburi;
exports.get_allfarm_ratchaburi = get_allfarm_ratchaburi;
exports.webservice_truck =webservice_truck;

//get_allfarm_ratchaburi('','');

//list_geom_ratchaburi('','');