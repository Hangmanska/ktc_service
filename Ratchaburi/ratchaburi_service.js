
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

function get_allfarm_ratchaburi(req, res)
{



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

sql += ",st_asgeojson(geomx::geometry)as geom    ";
sql += ",st_x(st_centroid(geomx::geometry)) as lon--x   ";
sql += ",st_y(st_centroid(geomx::geometry)) as lat--y   ";
sql += " FROM  detail_farms  ";

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
            strMustache += ' ,"name_farmmer": "{{name_farmmer}}","quota": "{{quota}}","farm_id": "{{id}}"';
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


exports.get_allfarm_ratchaburi = get_allfarm_ratchaburi;