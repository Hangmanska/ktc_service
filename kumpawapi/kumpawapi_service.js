
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
var iutm = require('utm2latlon.js');


var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_kumpawapi";

function base_geom() {
    this.station_name = '';
    this.station_type = '';
    this.bound1 = '';
    this.bound2 = '';
}

function set_json()
{
    this.name_farmmer ='';
    this.qt ='';
    this.farm_id ='';
    this.home ='';
    this.tambon ='';
    this.aumpher ='';
    this.province ='';
    this.area ='';
    this.type_ground ='';
    this.type_sugarcane ='';
    this.name_sugarcane ='';
    this.source ='';
    this.xdate ='';
    this.distance ='';
    this.methode ='';
    this.owner ='';
    this.eastimate ='';
    this.zone='';
    this.lon='';
    this.lat='';
    this.geomx ='';
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

function get_allfarm(req, res)
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
/**/
var sql = "SELECT st_asgeojson(the_geomx::geometry)as geom  ";
sql += ",name_farmmer,qt,farm_id ";
sql += ",home,tambon,aumpher,province,area,type_ground,type_sugarcane ";
sql += ",name_sugarcane,source,xdate,distance,mothode,owner,eastimate, ";
sql += ",st_x(st_centroid(the_geomx::geometry)) as x ";
sql += ",st_y(st_centroid(the_geomx::geometry)) as y ";
sql += " FROM all_farm as a,detail_farm_register as b ";
sql += " WHERE a.owner_id::int=b.owner_id::int AND the_geomx IS NOT NULL ";

/*
sql += " UNION ALL ";
sql += "SELECT st_asgeojson(the_geomx::geometry)as geom ";
sql += ",'-'as name_farmmer,'-' as qt,'-' as farm_id  ";
sql += ",'-' as home,'-' as tambon,'-' as aumpher,'-' as province,'-' as area,'-' as type_ground,'-' as type_sugarcane  ";
sql += ",'-' name_sugarcane,'-' as source,'-' as xdate,'-' as distance,'-' as mothode,'-' as owner,'-' as eastimate  ";
sql += " FROM all_farm ";
sql += " WHERE owner_id is NULL ";
sql += " AND the_geomx IS NOT NULL  ";
sql += " AND gid NOT IN( ";
sql += " SELECT a.gid FROM all_farm as a,detail_farm_register as b  ";
sql += " WHERE a.owner_id::int=b.owner_id::int ";
sql += "  AND the_geomx IS NOT NULL ) ";
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
            // strMustache += ' "name_farmmer": "{{name_farmmer}}",';
            // strMustache += ' "properties": {"qt": "{{qt}}","farm_id": "{{farm_id}}","district": "{{home}}"';
            // strMustache += ' ,"tambon": "{{tambon}}","aumpher": "{{aumpher}}","province": "{{province}}" },';
            // strMustache += ' ,"area": "{{area}}","type_ground": "{{type_ground}}","type_sugarcane": "{{type_sugarcane}}" },';
            // strMustache += ' ,"name_sugarcane": "{{name_sugarcane}}","source": "{{source}}","xdate,distance": "{{xdate,distance}}" },';
            // strMustache += ' ,"mothode": "{{mothode}}","owner": "{{owner}}","eastimate": "{{eastimate}}" },';
            
            // strMustache += ' "properties": {"ชื่อชาวไร่": "{{name_farmmer}}","โควตา": "{{qt}}","เลขที่แปลง": "{{farm_id}}","บ้าน": "{{home}}"';
            // strMustache += ' ,"ตำบล": "{{tambon}}","อำเภอ": "{{aumpher}}","จังหวัด": "{{province}}" ';
            // strMustache += ' ,"พื้นที่ปลูก(ไร่)": "{{area}}","ประเภทดิน": "{{type_ground}}","ประเภทอ้อย": "{{type_sugarcane}}" ';
            // strMustache += ' ,"พันธุ์อ้อย": "{{name_sugarcane}}","แหล่งพันธุ์": "{{source}}","วันที่ปลูก": "{{xdate}}","ระยะปลูก": "{{xdistance}}" ';
            // strMustache += ' ,"วิธีการปลูก": "{{mothode}}","ผู้ปลูก": "{{owner}}","คาดการณ์ผลผลิต(ลำ/ไร่)": "{{eastimate}}" },';
            // strMustache += ' "geometry":  {{geom}}';

            strMustache += ' ,"name_farmmer": "{{name_farmmer}}","quota": "{{qt}}","farm_id": "{{farm_id}}","district": "{{home}}"';
            strMustache += ' ,"tambon": "{{tambon}}","aumpher": "{{aumpher}}","province": "{{province}}" ';
            strMustache += ' ,"area": "{{area}}","type_ground": "{{type_ground}}","type_sugarcane": "{{type_sugarcane}}" ';
            strMustache += ' ,"name_sugarcane": "{{name_sugarcane}}","source": "{{source}}","date_grow": "{{xdate}}","distance_grow": "{{xdistance}}" ';
            strMustache += ' ,"method_grow": "{{mothode}}","owner": "{{owner}}","predict": "{{eastimate}}","x": "{{x}}" ,"y": "{{y}}"  ';
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

function find_loc()
{
     call_adminPoint('99.6472','15.2235',function(rows)
    {
        debugger;
        if(rows.length>0)
        {
            console.log(rows[0].tam_tname+','+rows[0].amp_tname+','+rows[0].prov_tname);
        }
        
    })

}

function call_adminPoint(lon, lat, callback)
{
    if (utl.isNumber(lon) && utl.isNumber(lat))
    {
        var query = 'SELECT';
   //     query += ' "ADMIN_CODE" AS admin_code,';
        query += ' "TAM_TNAME" AS tam_tname,';
        query += ' "AMP_TNAME" AS amp_tname,';
        query += ' "PROV_TNAME" AS prov_tname,';
        query += ' "TAM_ENAME" AS tam_ename,';
        query += ' "AMP_ENAME" AS amp_ename,';
        query += ' "PROV_ENAME" AS prov_ename';
        query += ' FROM tambon WHERE ST_Contains(the_geom, ST_SetSRID(ST_Point(' + utl.sqote(lon) + ',' + utl.sqote(lat) + '), 4326)) LIMIT 1';

      //  debugger
        ipm.db.dbname = 'admin_point';
         db.get_rows(ipm, query, function (rows) 
        {
            if (rows.length > 0) 
            {
                callback(rows);
                return;
            } 
            else 
            {
                callback([]);
                return;
            }
        });
    }
}

/*
(name_farmmer, qt, farm_id,home, zone, tambon, aumpher, province ";
sql2 +=", area, type_ground, type_sugarcane, name_sugarcane, source, distance, methode, owner, eastimate ";
sql2 +=", lat, lon,type_project, geomx) 
*/

function load_kml()
{

   
    
     // var file_path =  __dirname+'/myshapes/KSP_Sugar_Projects.kml';
     var file_path =  __dirname+'/myshapes/KMP.kml';
    var kml = new DOMParser().parseFromString(fs.readFileSync(file_path, 'utf8'));

   // var converted = togeojson.kml(kml);

    var convertedWithStyles = togeojson.kml(kml, { styles: true });

      var str_line = JSON.stringify(convertedWithStyles);
  //  var str_line = JSON.stringify(converted);
  
         if(utl.Contains(file_path,'KSP'))
        {
            store_2_postgresql_KSP(str_line,function(x)
            {
                console.log(x);
            });
        }
        else
        {
             store_2_postgresql_KMP2(str_line,function(x)
            {
                console.log(x);
            });
        }


}

function store_2_postgresql_KMP2(gpx_geojson,callback)
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
            //console.log(rows);
             async.eachSeries(rows, function (row, next)
            {
                var geom = row.st_geomfromgeojson
                var prop = JSON.stringify(row.properties);
                var name = row.properties.name;
                var ar = row.properties;
        
                /*
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
                    */

                    var _ar = new set_json();
                    var xs = 2;
                
                    _ar.geomx = geom;
                    _ar.name_farmmer = ar.name_farmmer
                    _ar.qt = ar.Quota;
                    _ar.zone = ar.zone
                    _ar.farm_id =ar.farm_id
                    _ar.lat  = ar.lat
                    _ar.lon  = ar.lon

            
                    _ar.area = ar.area
                    _ar.type_ground =ar.type_ground
                    _ar.type_sugarcane =ar.type_sugarcane
                    _ar.name_sugarcane =ar.name_sugarcane
                 //   _ar.source =ar[xs+15]
                  //  _ar.xdate ='';
                
                 //   _ar.distance =ar[xs+17]
                //    _ar.methode =ar[xs+18]
                 //   _ar.owner =ar[xs+19]
                 //   _ar.eastimate =ar[xs+20]

                    _ar.tambon =ar.tambon
                    _ar.aumpher =ar.aumpher
                    _ar.province =ar.province

               
                    debugger;
                    console.log(latlon);
                    /**/

                    insert_into_details_farms_register(_ar,function(sf)
                    {
                        next();
                    });
                    

              

                    /*
                call_adminPoint(_ar.lon,_ar.lat,function(rows)
                {
                    debugger;
                    if(rows.length>0)
                    {
                    // console.log(rows[0].tam_tname+','+rows[0].amp_tname+','+rows[0].prov_tname);
                        _ar.tambon =rows[0].tam_tname;
                        _ar.aumpher =rows[0].amp_tname;
                        _ar.province =rows[0].prov_tname;

                        insert_into_details_farms_register(_ar,function(sf)
                        {
                            next();
                        });

                    // console.log();
                    } 
                    else
                    {
                        insert_into_details_farms_register(_ar,function(sf)
                        {
                             next();
                        });

                    }
                  
                    
                })
                  */

            },function()
            {
                update_line_2_polygon(function(result)
                {
                     callback(result);
                     return;
                });
            })
 


        }
        else
        {
            callback([]);
            return;
        }
       
    });

}

//KMP

function store_2_postgresql_KSP(gpx_geojson,callback)
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
                    var xs = 3;
                
                    _ar.geomx = geom;
                    _ar.name_farmmer = ar[15];
                    _ar.qt = ar[xs+1];
                    _ar.farm_id =ar[xs+2];
                    _ar.zone = ar[xs+3];
                    _ar.lat  = ar[xs+4]
                    _ar.home = ar[xs+5]
                    _ar.tambon =ar[xs+6] 
                    _ar.aumpher =ar[xs+7] 
                    _ar.province =ar[xs+8] 

                    _ar.lon  = ar[xs+9]        
                    _ar.area = ar[xs+14]
                    _ar.type_ground =ar[xs+15]
                    _ar.type_sugarcane =ar[xs+16]
                    _ar.name_sugarcane =ar[xs+17]
                    _ar.source =ar[xs+19]
                    _ar.xdate ='';
                
                    _ar.distance =ar[xs+20]
                    _ar.methode =ar[xs+21]
                    _ar.owner =ar[xs+22]
                    _ar.eastimate =ar[xs+23]

                if(_ar.tambon =='')
                {
                    call_adminPoint(_ar.lon,_ar.lat,function(rows)
                    {
                     
                        if(rows.length>0)
                        {
                        // console.log(rows[0].tam_tname+','+rows[0].amp_tname+','+rows[0].prov_tname);
                            _ar.tambon =rows[0].tam_tname;
                            _ar.aumpher =rows[0].amp_tname;
                            _ar.province =rows[0].prov_tname;

                            insert_into_details_farms_register(_ar,function(sf)
                            {
                                next();
  
                            });

                        }
                        else
                        {
                            insert_into_details_farms_register(_ar,function(sf)
                            {
                                next();
  
                            });

                        }
                        
                    })
                }
                else
                {
                       insert_into_details_farms_register(_ar,function(sf)
                       {
                         next();
                       });

                }
         
 
            },function(){
           
                update_line_2_polygon(function(result)
                {
                     callback(result);
                     return;
                });
                   
            })
            
        }
        else
        {
            callback([]);
            return;
        }
       
    });

}

function store_2_postgresql_KMP(gpx_geojson,callback)
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
            //console.log(rows);
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
                    var xs = 2;
                
                    _ar.geomx = geom;
                    _ar.name_farmmer = ar[xs];
                    _ar.qt = ar[xs+1];
                    _ar.zone = ar[xs+2];
                    _ar.farm_id =ar[xs+3];
                    _ar.lat  = ar[xs+5]
                    _ar.lon  = ar[xs+6]

            
                    _ar.area = ar[xs+11]
                    _ar.type_ground =ar[xs+12]
                    _ar.type_sugarcane =ar[xs+13]
                    _ar.name_sugarcane =ar[xs+14]
                    _ar.source =ar[xs+15]
                    _ar.xdate ='';
                
                    _ar.distance =ar[xs+17]
                    _ar.methode =ar[xs+18]
                    _ar.owner =ar[xs+19]
                    _ar.eastimate =ar[xs+20]

                call_adminPoint(_ar.lon,_ar.lat,function(rows)
                {
                    debugger;
                    if(rows.length>0)
                    {
                    // console.log(rows[0].tam_tname+','+rows[0].amp_tname+','+rows[0].prov_tname);
                        _ar.tambon =rows[0].tam_tname;
                        _ar.aumpher =rows[0].amp_tname;
                        _ar.province =rows[0].prov_tname;

                        insert_into_details_farms_register(_ar,function(sf)
                        {
                            next();
                        });

                    // console.log();
                    } 
                    else
                    {
                        insert_into_details_farms_register(_ar,function(sf)
                        {
                             next();
                        });

                    }
                    
                })

            },function()
            {
                update_line_2_polygon(function(result)
                {
                     callback(result);
                     return;
                });
            })
 


        }
        else
        {
            callback([]);
            return;
        }
       
    });

}

function update_line_2_polygon(callback)
{
   var sql= "UPDATE detail_farm_register_61_62 SET geomx=ST_GeomFromText('POLYGON(('||substring(left(St_astext(ST_Force_2D(geomx)),-1),12)||','||LEFT(substring(left(St_astext(ST_Force_2D(geomx)),-1),12),strpos(substring(left(St_astext(ST_Force_2D(geomx)),-1),12), ',')-1)||'))')::geometry ";
   sql+= " WHERE geomx IS NOT NULL AND st_geometrytype(geomx::geometry)='ST_LineString' ";
   ocsb_excute(sql,db_sugarcane,function(xres)
   {
       callback(xres);
       return;
    })
}

function insert_into_details_farms_register(data,callback)
{
      var sql = squel.insert()
      .into("detail_farm_register_61_62")
      .set("name_farmmer", data.name_farmmer)
      .set("qt", data.qt)
      .set("farm_id", data.farm_id)
      .set("zone", data.zone)
      .set("tambon", data.tambon)
      .set("aumpher", data.aumpher)
      .set("province", data.province)
      .set("area", data.area)
      .set("type_ground", data.type_ground)
      .set("type_sugarcane", data.type_sugarcane)
      .set("name_sugarcane", data.name_sugarcane)
    //  .set("source", data.source)
     // .set("xdate", data.xdate)
    //  .set("distance", data.distance)
    //  .set("methode", data.methode)
    //  .set("owner", data.owner)
    //  .set("eastimate", data.eastimate)
      .set("lat", data.lat)
      .set("lon", data.lon)
      .set("geomx", "ST_Force_2D("+utl.sqote(data.geomx)+")::geometry")
      .set("idate", utcp.now())
      .toString();
      
      
/*  */
     var sql2 = "INSERT INTO detail_farm_register_61_62 (name_farmmer, qt, farm_id,home, zone, tambon, aumpher, province ";
        sql2 +=", area, type_ground, type_sugarcane, name_sugarcane, source, distance, methode, owner, eastimate ";
        sql2 +=", lat, lon, geomx) VALUES ";
        sql2 +=" ("+utl.sqote(data.name_farmmer)+","+utl.sqote(data.qt)+","+utl.sqote(data.farm_id)+","+utl.sqote(data.home)+","+utl.sqote(data.zone)+","+utl.sqote(data.tambon)+" ";
        sql2 +=","+utl.sqote(data.aumpher)+","+utl.sqote(data.province)+","+utl.sqote(data.area)+","+utl.sqote(data.type_ground)+" ";
        sql2 +=","+utl.sqote(data.type_sugarcane)+","+utl.sqote(data.name_sugarcane)+","+utl.sqote(data.source)+","+utl.sqote(data.distance)+" ";
        sql2 +=","+utl.sqote(data.methode)+","+utl.sqote(data.owner)+","+utl.sqote(data.eastimate)+","+utl.sqote(data.lat)+","+utl.sqote(data.lon)+" ";
        sql2 +=","+"ST_Force_2D("+utl.sqote(data.geomx)+")::geometry ) " ;


    ipm.db.dbname = db_sugarcane;
    db.excute(ipm, sql2, function (is_ok) 
    {
        console.log('add detail_farm_register ' + is_ok);
        callback(is_ok);
        return;
    });
  
}


function load_gpx()
{

//http://kalapun.com/posts/gpx-to-geojson-in-mongodb-with-node-js/

//http://www.postgresonline.com/journal/archives/116-Loading-and-Processing-GPX-XML-files-using-PostgreSQL.html
/*
name  |   longitude    |   latitude   | elevation
--------+----------------+--------------+------------
 001    |  121.043382715 | 14.636015547 |  45.307495
 002    |  121.042653322 | 14.637198653 |  50.594727
 003    |  121.043165457 | 14.640581002 |  46.989868
 004    |  120.155537082 | 14.975596117 |  38.097656
*/

  var file_path =  __dirname+'/5201_2016-10-10_16021.gpx';

     fs.readFile(file_path,function(err, data)
     {
         debugger;
         var gpx = jsdom(data);
         var converted = togeojson.gpx(gpx);
         var str_line = JSON.stringify(converted);


     });
      
}



function upload_gpx2gis(req, res)
{
     //var data = req.body.datagpx;
      // var base64 = req.body.file;
      // console.log('data '+base64);
       /*
        var gpx = jsdom(data);
         var converted = togeojson.gpx(gpx);
         var str_line = JSON.stringify(converted);

         store_2_postgresql(str_line,function(xres){
            res.send(xres);
         });
        
         */
  //  console.log('xxxx '+req.body.file)

    var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) 
    {
       // console.log( files.file);
      //  console.log(files.file.path);
      
		var old_path = files.file.path;
		var file_size = files.file.size;
		var file_ext = files.file.name.split('.').pop();
		var index = old_path.lastIndexOf('/') + 1;
		var file_name = files.file.name;
		var new_path = path.join(__dirname, '/gpx/', file_name);
        
        fs.readFile(old_path, function (err, data) 
        {
            fs.writeFile(new_path, data, function (err) 
            {
                 console.log('ddd '+file_size);
               
                 var gpx = jsdom(data);
                var converted = togeojson.gpx(gpx);
                var str_line = JSON.stringify(converted);

                store_2_postgresql(str_line,function(xres){
                   // res.send(xres);
                    res.send(xres);
                });

            });
           
        });
          /**/
        //res.send('ok');
    });

}

function ocsb_excute(sql,db_con,callback)
{
     ipm.db.dbname = db_con;
     db.excute(ipm, sql, function (response) 
     {
        if (response == 'oK') 
        {
           callback(true);
          return;
        }
        else
        {
          callback(false);
          return;
        }
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
            debugger;
            //console.log(rows);
          var geom = rows[0].st_geomfromgeojson
          var prop = JSON.stringify(rows[0].properties);
          var name = rows[0].properties.name;

          var sql ="INSERT INTO all_farm (name,properties,the_geom) VALUES ("+utl.sqote(name)+","+utl.sqote(prop)+","+"ST_Force_2D("+utl.sqote(geom)+")::geometry )";

          ocsb_excute(sql,db_sugarcane,function(xres)
          {
              debugger;
                console.log(xres);
                callback(xres);
                return;
          })
        }
    });

}

function kmz_2_geojson()
{

var file_path =  __dirname+'/xkmz.kmz';

    // fs.readFile(file_path,function(err, data)
   //  {
         debugger;
        KMZGeoJSON.toGeoJSON(file_path, function(err, json) 
        {
          // Do something with the GeoJSON data.
            console.log(json);
        });
    // });
}

function factory_point(req,res)
{
   var sql = "SELECT factory_name,lat_factory,lng_factory FROM master_factory_config ";
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            res.send(rows);
        }else{
             res.send([]);
        }
    });
}

function circle_around_factory(req,res)
{
    var sql='';
//
    sql += " SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 10000))) as geom,'10' as km FROM master_factory_config UNION ALL ";
    sql += " SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 20000))) as geom,'20' as km FROM master_factory_config UNION ALL ";
    sql += " SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 30000))) as geom,'30' as km FROM master_factory_config UNION ALL ";
    sql += " SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 50000))) as geom,'50' as km FROM master_factory_config  ";
  
     ipm.db.dbname = db_sugarcane;
     debugger;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature"';
            strMustache += ' ,"geometry":  {{geom}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';

            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');

            res.send(JSON.parse(final));
          }else{
               res.send([]);
          }

    });
}

function list_geomkpwp(req,res){
    var sql='';
    sql += "SELECT name_farmmer,qt,farm_id ";
    sql += ",tambon||':'||aumpher||':'||province as location";
    sql += ",type_ground,type_sugarcane,name_sugarcane,SOURCE";
    sql += ",distance,mothode,owner,eastimate";
    sql += ",replace(replace(replace(box(ST_Buffer(the_geom::geography, 20)::geometry)::text, '(', ''),'),', '|'),')','') as boxs ";
    sql += " FROM all_farm as a,detail_farm_register as b ";
    sql += "WHERE a.owner_id::int=b.owner_id::int AND the_geomx IS NOT NULL";

        ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
              // res.send(rows);
                 var final = [];
                async.eachSeries(rows, function (row, next)
            {
                var xres = new base_geom();
                xres.station_name = row.name_farmmer;
                xres.station_type = row.farm_id;
                var xx = split_box(row.boxs);
                xres.bound1 = xx.bound1;//utl.replaceAll('"','',split_box(row.boxs));
                xres.bound2 = xx.bound2;
                final.push(xres);


                next();
            }, function () {
                res.send(final);
            });
        }else{
                res.send([]);
        }
    });

}

function load_farmer_detials()
{
    //ข้อมูลชาวไร่-KSP-60_61
     var inputFile =  __dirname+'/myshapes/famer_detials_KSP-60_61_2.csv';

     var i =0;
    var parser = parse({delimiter: ','}, function (err, data) 
    {

        async.eachSeries(data, function (line,next) 
        {
  
        var data ={'qt':'','prename':'','name':'','zone':'','address':'','mootee':'','mooban':'','tambon':'','aumpher':'','province':''}
         
        if(i>=2)
          {
            debugger;
          //  console.log(line);
              data.qt = '0'+line[0];
              data.prename = line[1];
              data.name = line[2];
              data.zone = '0'+line[3];
              data.address = utl.Trim( line[4]);
              data.mootee = utl.Trim(line[5]);
              data.mooban = utl.Trim(line[6]);
              data.tambon = utl.Trim(line[7]);
              data.aumpher = utl.Trim(line[8]);
              data.province = utl.Trim(line[9]);


                  var sql = squel.insert()
                .into("farmer_details")
                .set("qt", data.qt)
                .set("prename", data.prename)
                .set("name", data.name)
                .set("zone", data.zone)
                .set("address", data.address)
                .set("moo", data.mootee)
                .set("village", data.mooban)
                .set("tambon", data.tambon)
                .set("aumpher", data.aumpher)
                .set("province", data.province)
                .set("idate", utcp.now())
                .toString();

               
                  ocsb_excute(sql,db_sugarcane,function(xres)
                {
                    debugger;
                       next();
                })

          }
          else
          {
              i++;
              next();
          }


        },function(){
            console.log('finish');
        });

    });

    fs.createReadStream(inputFile).pipe(parser);

}

//debugger;
//get_allfarm('','');

//load_gpx();
//kmz_2_geojson();
//circle_around_factory('','');
//list_geomkpwp('','');
//load_kml();
//find_loc();
//load_farmer_detials();
/*
update_line_2_polygon(function(ress){
    console.log(ress);
})
*/

exports.get_allfarm = get_allfarm;
exports.upload_gpx2gis = upload_gpx2gis;
exports.factory_point = factory_point;
exports.circle_around_factory =circle_around_factory;
exports.list_geomkpwp = list_geomkpwp;

function update_utm2latlon()
{

  var sql =  "SELECT st_asgeojson(geomx::geometry)as geom  ,farm_id FROM detail_farm_register_61_62";
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) 
    {
            if (rows.length > 0)
            {
                // debugger;
                    //console.log(rows);
                    async.eachSeries(rows, function (row, next)
                    {

                       // var x ="{"type":"Polygon","coordinates":[[[94.5121817128185,0.000153013004017],[94.5121817181939,0.00015302563116],[94.5121817271529,0.000153029238917],[94.5121817244652,0.000153013905958],[94.5121817128185,0.000153013004017],[94.5121817128185,0.000153013004017],[94.5121817128185,0.000153013004017],[94.5121817128185,0.000153013004017]]]}"
                        iutm.iUTMXYToLatLon(row, 47, function (latlon)
                        {
                            debugger;
                            console.log(latlon);
                            /*

                            insert_into_details_farms_register(_ar,function(sf)
                            {
                                next();
                            });
                            */

                        });

                });
            }
    });

}

//update_utm2latlon();