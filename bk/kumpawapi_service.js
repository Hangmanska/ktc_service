
var async = require('async');
var mustache = require("mustache");
var path = require('path');
var KMZGeoJSON = require('kmz-geojson');
var squel = require("squel");

var togeojson = require('togeojson');
var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var lineToPolygon = require('turf-line-to-polygon');

var formidable = require('formidable');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var xreq = require('xPost.js');



var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_kumpawapi";

function base_geom() {
    this.station_name = '';
    this.farm_id = '';
    this.qt='';
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
/*
var sql = "SELECT st_asgeojson(the_geomx::geometry)as geom  ";
sql += ",name_farmmer,qt,farm_id ";
sql += ",home,tambon,aumpher,province,area,type_ground,type_sugarcane ";
sql += ",name_sugarcane,source,xdate,distance,methode,owner,eastimate ";
sql += ",st_x(st_centroid(the_geomx::geometry)) as x ";
sql += ",st_y(st_centroid(the_geomx::geometry)) as y ";
sql += " FROM all_farm as a,detail_farm_register as b ";
sql += " WHERE a.owner_id::int=b.owner_id::int AND the_geomx IS NOT NULL ";
*/

var sql = "SELECT st_asgeojson(geomx::geometry)as geom   ";
sql += ",name_farmmer as name_farmmer,qt,farm_id "; 
sql += ",home,tambon,aumpher,province ";
sql += ",ST_Area(geomx)*POWER(0.3048,2) As sqm_area ";
sql += ",type_ground,type_sugarcane "; 
sql += ",name_sugarcane,source,xdate,distance as xdistance,methode,owner,eastimate "; 
sql += " FROM detail_farm_register ";
sql += " WHERE lon IS NOT NULL "; 



/*
var sql='';
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 10000))) as geom,'10' as km FROM master_factory_config UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 20000))) as geom,'20' as km FROM master_factory_config UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 30000))) as geom,'30' as km FROM master_factory_config UNION ALL ";
sql += " SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 50000))) as geom,'50' as km FROM master_factory_config  ";
*/
/*
sql += " UNION ALL ";
sql += "SELECT st_asgeojson(the_geomx::geometry)as geom ";
sql += ",'-'as name_farmmer,'-' as qt,'-' as farm_id  ";
sql += ",'-' as home,'-' as tambon,'-' as aumpher,'-' as province,'-' as area,'-' as type_ground,'-' as type_sugarcane  ";
sql += ",'-' name_sugarcane,'-' as source,'-' as xdate,'-' as distance,'-' as methode,'-' as owner,'-' as eastimate  ";
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
            // strMustache += ' ,"methode": "{{methode}}","owner": "{{owner}}","eastimate": "{{eastimate}}" },';
            
            // strMustache += ' "properties": {"ชื่อชาวไร่": "{{name_farmmer}}","โควตา": "{{qt}}","เลขที่แปลง": "{{farm_id}}","บ้าน": "{{home}}"';
            // strMustache += ' ,"ตำบล": "{{tambon}}","อำเภอ": "{{aumpher}}","จังหวัด": "{{province}}" ';
            // strMustache += ' ,"พื้นที่ปลูก(ไร่)": "{{area}}","ประเภทดิน": "{{type_ground}}","ประเภทอ้อย": "{{type_sugarcane}}" ';
            // strMustache += ' ,"พันธุ์อ้อย": "{{name_sugarcane}}","แหล่งพันธุ์": "{{source}}","วันที่ปลูก": "{{xdate}}","ระยะปลูก": "{{xdistance}}" ';
            // strMustache += ' ,"วิธีการปลูก": "{{methode}}","ผู้ปลูก": "{{owner}}","คาดการณ์ผลผลิต(ลำ/ไร่)": "{{eastimate}}" },';
            // strMustache += ' "geometry":  {{geom}}';

            strMustache += ' ,"name_farmmer": "{{name_farmmer}}","quota": "{{qt}}","farm_id": "{{farm_id}}","district": "{{home}}"';
            strMustache += ' ,"tambon": "{{tambon}}","aumpher": "{{aumpher}}","province": "{{province}}" ';
            strMustache += ' ,"area": "{{area}}","type_ground": "{{type_ground}}","type_sugarcane": "{{type_sugarcane}}" ';
            strMustache += ' ,"name_sugarcane": "{{name_sugarcane}}","source": "{{source}}","date_grow": "{{xdate}}","distance_grow": "{{xdistance}}" ';
            strMustache += ' ,"method_grow": "{{methode}}","growner": "{{owner}}","predict": "{{eastimate}}","x": "{{x}}" ,"y": "{{y}}"  ';
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






function load_gpx_or_kml()
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

         store_2_postgresql(str_line);

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
                // console.log(xres);
                // callback(xres);
                // return;
                update_line_2_polygon(function(result)
                {
                     callback(result);
                     return;
                })
          })
        }
    });

}

function update_line_2_polygon(callback)
{
   var sql= " UPDATE all_farm SET the_geomx=ST_GeomFromText('POLYGON(('||substring(left(St_astext(ST_Force_2D(the_geom)),-1),12)||','||LEFT(substring(left(St_astext(ST_Force_2D(the_geom)),-1),12),strpos(substring(left(St_astext(ST_Force_2D(the_geom)),-1),12), ',')-1)||'))')::geometry ";
   sql+= " WHERE properties IS NOT NULL AND the_geomx IS NULL ";
   ocsb_excute(sql,db_sugarcane,function(xres)
   {
                callback(xres);
                return;
    })
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
/* */
var sql='';
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 10000)::geometry)) as geom,'10' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 20000)::geometry)) as geom,'20' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 30000)::geometry)) as geom,'30' as km FROM master_factory_config WHERE id < '3' ";
//sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 25000)::geometry)) as geom,'50' as km FROM master_factory_config WHERE id !='3' "; 
//sql += "SELECT st_asgeojson(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)) as geom,'50' as km FROM master_factory_config WHERE id ='3' ";


 
    /*
  var sql='';
sql += "SELECT st_asgeojson( ST_Buffer(ST_GeometryFromText('POINT(102.755120 16.801850)', 4326), 10000)),'10' as km FROM master_factory_config UNION ALL ";
sql += "SELECT st_asgeojson( ST_Buffer(ST_GeometryFromText('POINT(102.755120 16.801850)', 4326), 20000)),'20' as km FROM master_factory_config UNION ALL ";
sql += "SELECT st_asgeojson( ST_Buffer(ST_GeometryFromText('POINT(102.755120 16.801850)', 4326), 30000)),'30' as km FROM master_factory_config UNION ALL ";
sql += "SELECT st_asgeojson( ST_Buffer(ST_GeometryFromText('POINT(102.755120 16.801850)', 4326), 50000)),'50' as km FROM master_factory_config  ";

 
var sql = "SELECT st_asgeojson(the_geomx::geometry)as geom  ";
sql += ",name_farmmer,qt,farm_id ";
sql += ",home,tambon,aumpher,province,area,type_ground,type_sugarcane ";
sql += ",name_sugarcane,source,xdate,distance,methode,owner,eastimate ";
sql += " FROM all_farm as a,detail_farm_register as b ";
sql += " WHERE a.owner_id::int=b.owner_id::int AND the_geomx IS NOT NULL ";
  */
   debugger;

 ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature"';
            strMustache += ' ,"name_farmmer": "{{name_farmmer}}","quota": "{{qt}}","farm_id": "{{farm_id}}","district": "{{home}}"';
            strMustache += ' ,"tambon": "{{tambon}}","aumpher": "{{aumpher}}","province": "{{province}}" ';
            strMustache += ' ,"area": "{{area}}","type_ground": "{{type_ground}}","type_sugarcane": "{{type_sugarcane}}" ';
            strMustache += ' ,"name_sugarcane": "{{name_sugarcane}}","source": "{{source}}","date_grow": "{{xdate}}","distance_grow": "{{xdistance}}" ';
            strMustache += ' ,"method_grow": "{{methode}}","growner": "{{owner}}","predict": "{{eastimate}}" ';
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

function list_geomkpwp(req,res)
{
    var sql='';
    sql += "SELECT name_farmmer,qt,farm_id ";
    sql += ",tambon||':'||aumpher||':'||province as location";
    sql += ",type_ground,type_sugarcane,name_sugarcane,SOURCE";
    sql += ",distance,methode,owner,eastimate";
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
                xres.farm_id = row.farm_id;
                xres.qt = row.qt;
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




//get_allfarm('','');

//load_gpx();
//kmz_2_geojson();
//circle_around_factory('','');
//list_geomkpwp('','');


function find_contain()
{
   var sql= "SELECT owner_id,location FROM detail_farm_register WHERE owner_id::int >='19' ";

     ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            async.eachSeries(rows, function (row, next)
            {

               find_contains_details(row.location,row.owner_id,function(xres)
               {
                 //  debugger;
                    next();
               }) 
                
            },function(){
                console.log('fin');
            })
        }
    });

}

function update_match_farmdetail_gpx(owner_id,gid,callback)
{
    var sql="UPDATE all_farm SET owner_id='"+owner_id+"' WHERE gid='"+gid+"' ";

    ocsb_excute(sql,db_sugarcane,function(xres)
    {
        console.log(xres);
        callback(xres);
        return;
    });
}

function find_contains_details(lon_lat,owner_id,callback)
{
  var sql= "SELECT gid FROM all_farm WHERE ST_Contains(the_geomx, ST_GeometryFromText('POINT("+lon_lat+")')) ";
   ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            debugger;

              async.eachSeries(rows, function (row, next)
            {

               update_match_farmdetail_gpx(owner_id,row.gid,function(xrr)
               {
                    next();
               });
                
            },function(){
                callback(true);
                return;
            })

           
        }
        else
        {
            callback(false);
            return;
        }
    });

}

//+++++++++++++++++++++++++++++++ After Signe +++++++++++++++++++

function set_collect_ton_weight_system(req,res)
{
    var r = req.body;
    var ar = { 'collect_ton': r.collect_ton, 'farm_id': r.farm_id };

    var sql = squel.update()
   .table("detail_farm_register")
   .set("icollect_ton", ar.collect_ton)
   .where('farm_id = ' + utl.sqote(ar.farm_id))
   .toString();

    ipm.db.dbname = db_sugarcane;
    db.excute(ipm, sql, function (is_ok) 
    {
        debugger;
        if (is_ok == 'oK') 
        {
            res.json({ success: true, message: 'Complete set collect_ton.' });
        }
        else 
        {
             res.json({ success: false, message: 'UnComplete set collect_ton.' });
        }
    });

}

function get_distance_direction(source,destination,callback)
{
  //  var source ="17.6326460,102.6905040";
  //  var destination="16.80101,102.77213";
    var master_url ="http://maps.googleapis.com/maps/api/directions/json?origin="+source+"&destination="+destination+"&alternatives=true&sensor=false"

    xreq.send_data(master_url,'',function(xres)
    {
       if( xres.routes.length > 0)
       {
           var xdistance = xres.routes[0].legs[0].distance.text;
           var xduration =  xres.routes[0].legs[0].duration.text;

           var result ={'distance':xdistance,'duration':xduration}
           callback(result);
           return;
       }
      //  console.log(xres);
    })

}



exports.get_allfarm = get_allfarm;
exports.upload_gpx2gis = upload_gpx2gis;
exports.factory_point = factory_point;
exports.circle_around_factory =circle_around_factory;
exports.list_geomkpwp = list_geomkpwp;
exports.set_collect_ton_weight_system = set_collect_ton_weight_system;
exports.get_distance_direction = get_distance_direction;

