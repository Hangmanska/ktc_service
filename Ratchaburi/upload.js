
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

var parse = require('csv-parse');

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

function set_json()
{
    this.fid ='';
    this.id ='';
    this.zone_area ='';
    this.quota ='';
    this.name_sur ='';
    this.addr ='';
    this.area_rai ='';
    this.area ='';
    this.occupy2 ='';
    this.type_s2 ='';
    this.variety ='';
    this.soil2 ='';
    this.water2 ='';
    this.harvester ='';
    this.usurevey2 ='';
    this.dsurvey ='';
    this.no_pact ='';
    this.no_deed ='';
    this.true_area='';
 //   this.lon='';
 //   this.lat='';
    this.shape_leng='';
    this.shape_le_1='';
    this.shape_area='';
    this.rai='';
    this.ngan='';
    this.wa ='';
    this.code='';
    this.pacel_num ='';
   // this.geomx ='';
}

function load_kml()
{

   // var file_path =  __dirname+'/myshapes/farm_company.kml';
   var file_path =  __dirname+'/myshapes/farm_2561_62.kml';
    
    var kml = new DOMParser().parseFromString(fs.readFileSync(file_path, 'utf8'));

    var convertedWithStyles = togeojson.kml(kml, { styles: true });

    var str_line = JSON.stringify(convertedWithStyles);
 
    store_2_postgresql(str_line,function(x)
    {
        console.log(x);
    });
   

}

function store_2_postgresql(gpx_geojson,callback)
{
    var sql="";
   sql +=" WITH data AS (SELECT '"+gpx_geojson+"'::json AS fc) "
   sql +="  SELECT "
   sql +="  row_number() OVER () AS gid, "
   sql +=" ST_AsText(ST_GeomFromGeoJSON(feat->>'geometry')) AS geom, "
   sql +="ST_GeomFromGeoJSON(feat->>'geometry'), "
   sql +="feat->'properties' AS properties "
   sql +="FROM ( "
   sql +="SELECT json_array_elements(fc->'features') AS feat "
   sql +="FROM data "
   sql +=") AS f; ";



    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
           // debugger;
           console.log('row length '+rows.length);
             async.eachSeries(rows, function (row, next)
            {

                var geom = row.st_geomfromgeojson
                var prop = JSON.stringify(row.properties);
                var name = row.properties.name;

        
                    const dom = htmlparser.parseDOM(prop);

                    const $ = cheerio.load(dom);

                    const ar = [];

                    $('td').each(function(i, elem) 
                    {
                    if (i % 2 != 0)
                        {
                        ar.push($(this).text());
                        }
                    });

                    var _ar = new set_json();
                  //  var xs = 3;
                
                  //  _ar.geomx = geom;
                
                    _ar.fid =ar[1];
                    _ar.id =ar[2];
                    _ar.zone_area =ar[3];
                    _ar.quota =ar[4];
                    _ar.name_sur =ar[5];
                    _ar.addr =ar[6];
                    _ar.area_rai =ar[7];
                    _ar.area =ar[8];
                    _ar.occupy2 =ar[9];
                    _ar.type_s2 =ar[10];
                    _ar.variety =ar[11];
                    _ar.soil2 =ar[12];
                    _ar.water2 =ar[13];
                    _ar.harvester =ar[14];
                    _ar.usurevey2 =ar[15];
                    _ar.dsurvey = ar[16] == "&lt;Null&gt;" ? "" : ar[16];
                    _ar.no_pact =ar[17];
                    _ar.no_deed =ar[18];
                    _ar.true_area=ar[19];
                    var lon=ar[20];
                    var lat=ar[21];
                    _ar.shape_leng=ar[22];
                    _ar.shape_le_1=ar[23];
                    _ar.shape_area=ar[24];
                    _ar.rai=ar[25];
                    _ar.ngan=ar[26];
                    _ar.wa =ar[27];
                    _ar.code=ar[28];
                    _ar.pacel_num =ar[29];



                    insert_into_details_farms_register(_ar,geom,lon,lat,function(sf)
                    {
                         next();
  
                    });

 
            },function(){
           
               callback('Ok');
               return;
            })
            
        }
        else
        {
            callback([]);
            return;
        }
       
    });

}




function insert_into_details_farms_register(data,geomx,lon,lat,callback)
{


       var xjson = JSON.stringify(data);

       var sql2 = "INSERT INTO detail_farms (details, lat, lon, geomx) VALUES ";
       sql2 +="("+utl.sqote(xjson)+","+utl.sqote(lat)+","+utl.sqote(lon)+" ";
       sql2 +=","+"ST_Force_2D("+utl.sqote(geomx)+")::geometry ) " ;


    ipm.db.dbname = db_sugarcane;
    db.excute(ipm, sql2, function (is_ok) 
    {
        console.log('add detail_farms ' + is_ok);
        callback(is_ok);
        return;
    });
  
}

load_kml();