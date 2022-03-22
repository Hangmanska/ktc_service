
//#region 
var fs = require('fs');
var async = require('async');
var mustache = require("mustache");
var moment = require('moment');
var encoding = require("encoding");
var squel = require("squel");
var path = require('path');
var request = require("request");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');


var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var svnao = require('nao_gen_rp_enter_geom_00_10.js');

var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10034";

var jwtTokenSecret = 'hangman';
var port_service = 9003;

//http://www.samuelbosch.com/p/geometry-visualizer.html

//#endregion



function base_geom() 
{
    this.station_name = '';
    this.station_id = '';
    this.station_type='1';
    this.bound1 = '';
    this.bound2 = '';
}

function split_box(s) 
{
    //var s = '100.438213348389,13.654444219406|100.438213348389,13.654444219406';
    if(s !=null){
        var ar = s.split('|');
        var x1 = set_format(ar[0]);
        var x2 = set_format(ar[1]);
        var res = { 'bound1': x1, 'bound2': x2 };
       // var res = 'bound1:' + x1 + ',bound2:' + x2 ;
        return res;
    }else{
       // console.log('split_box null '+s);
        var res = { 'bound1': [17.2158675348097,102.834641428846], 'bound2': [17.2138871139657,102.831043943583] };
        return res;
    }
    
}

function set_format(x) 
{
    var xar = x.split(',');
    var lon = xar[0];
    var lat = xar[1];

    var res = '[' + lat + ',' + lon + ']';
    return res;
}

function get_report_working(req, res)
{
    /*
    SELECT 
modem_id 
,idmy(start_date) as date_work 
,timeonly(start_date) as start_work 
,timeonly(end_date) as end_work 
,mile_start 
,mile_stop 
,distance 
,time_use 
,station_name 
FROM rp_nao_enter_station  
WHERE modem_id='142181256674'
AND iymd(start_date) ='2019-05-04'
    */

  var db_name = req.body.fleetid; //'db_10034';
  var modem_id = req.body.modemid; //'1010003020'; //
  var year_month = req.body.year_month; // '2019-05-20 00:00';//

  var start_date = req.body.start;
  var stop_date = req.body.stop;

  //console.log(JSON.stringify(req.body))

  var para = { 'id': 1, 'db_name': db_name, 'modem_id': modem_id, 'start_time':start_date , 'end_time': stop_date , 'message': '' }

 // console.log(year_month);
  //console.log(JSON.stringify(para));

    if(year_month !=undefined)
    {
        
        var sql=''
        sql+=" SELECT ";
        sql+=" modem_id ";
        sql+=",idmy(start_date) as date_work ";
        sql+=",timeonly(start_date) as start_work ";
        sql+=",timeonly(end_date) as end_work ";
        sql+=" ,mile_start ";
        sql+=" ,mile_stop ";
        sql+=" ,distance ";
        sql+=",time_use ";
        sql+=",station_name ";
        sql+=" FROM rp_nao_enter_station  ";
        sql += " WHERE modem_id="+utl.sqote(modem_id);
        sql += " AND iym(start_date) ="+ utl.sqote(year_month);

        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (rows) 
        {
            if (rows.length > 0) 
            {
                res.send(rows);
            }
            else 
            {
                res.send([]);
            }
        });
    }
    else
    {
        is_process_now(para,function(is_complete)
        {
         //   console.log('is_complete '+is_complete);

            if(is_complete)
            {
                var sql=''
                sql+=" SELECT ";
                sql+=" modem_id ";
                sql+=",idmy(start_date) as date_work ";
                sql+=",timeonly(start_date) as start_work ";
                sql+=",timeonly(end_date) as end_work ";
                sql+=" ,mile_start ";
                sql+=" ,mile_stop ";
                sql+=" ,distance ";
                sql+=",time_use ";
                sql+=",station_name ";
                sql+=" FROM rp_nao_enter_station  ";
                sql += " WHERE modem_id="+utl.sqote(modem_id);
                sql += " AND start_date >="+ utl.sqote(start_date);
                sql += " AND end_date <="+ utl.sqote(stop_date);

             //   console.log(sql)
        
                ipm.db.dbname = db_config;
                db.get_rows(ipm, sql, function (rows) 
                {
                    if (rows.length > 0) 
                    {
                        res.send(rows);
                    }
                    else 
                    {
                        res.send([]);
                    }
                });
            }
             else 
            {
                
                var sql=''
                sql+=" SELECT ";
                sql+=" modem_id ";
                sql+=",idmy(start_date) as date_work ";
                sql+=",timeonly(start_date) as start_work ";
                sql+=",timeonly(end_date) as end_work ";
                sql+=" ,mile_start ";
                sql+=" ,mile_stop ";
                sql+=" ,distance ";
                sql+=",time_use ";
                sql+=",station_name ";
                sql+=" FROM rp_nao_enter_station  ";
                sql += " WHERE modem_id="+utl.sqote(modem_id);
                sql += " AND start_date >="+ utl.sqote(start_date);
                sql += " AND end_date <="+ utl.sqote(stop_date);

             //   console.log(sql)
        
                ipm.db.dbname = db_config;
                db.get_rows(ipm, sql, function (rows) 
                {
                    if (rows.length > 0) 
                    {
                        res.send(rows);
                    }
                    else 
                    {
                        res.send([]);
                    }
                });
            }
           
        })
    }

}

function get_report_stopengine_enter_station(req, res)
{
    /*
     SELECT idate(enter_time) as enter_date 
    ,idate(leave_time) as leave_time 
    ,timeuse 
    ,station_id, station_name
    ,start_loc_th,end_loc_th,start_loc_en,end_loc_en,start_lonlat,end_lonlat  
    FROM rp_nao_visit_stop_engine
    WHERE modem_id='142181256513'
    AND enter_time >='2019-05-01 00:00'
    AND leave_time <='2019-05-14 23:59'
    ORDER BY enter_time ASC 
    */

   var db_name = req.body.fleetid; //'db_10001';
   var modem_id = utl.Trim(req.body.modemid); //'1010001004';
   var start = req.body.start; // '2016-06-01 00:00';
   var stop = req.body.stop; //'2016-06-30 23:59';

 //  console.log(db_name+' '+modem_id+' '+start+' '+stop)

   var sql1 = ' '; 

   sql1 += " SELECT idate(enter_time) as enter_date ";
   sql1 += " ,idate(leave_time) as leave_time ";
   sql1 += " ,timeuse ";
   sql1 += " ,station_id, station_name ";
   sql1 += " ,start_loc_th,end_loc_th,start_loc_en,end_loc_en,start_lonlat,end_lonlat ";  
   sql1 += " FROM rp_nao_visit_stop_engine ";
   sql1 += "  WHERE modem_id="+utl.sqote(modem_id);
   sql1 += "  AND enter_time >=" + utl.sqote(start);
   sql1 += "  AND leave_time <=" + utl.sqote(stop);
   sql1 += " AND timeuse !='00:00' ORDER BY enter_time ASC ";

   ipm.db.dbname = db_config;
   db.get_rows(ipm, sql1, function (rows) {
       if (rows.length > 0) {
           res.send(rows);
       }
       else {
           res.send([]);
       }
   });


}

function get_station_nao(req, res)
{
    var nao_group_sale =  req.body.nao_group_sale; //='11,12,14,15,16,17' '0'
 
     var right = req.body.right;
    var left = req.body.left;
    var top = req.body.top;
    var bottom = req.body.bottom;
    var id_station = req.body.all_id;

     /*
    var swlng1 = req.body.swlng1; // '103.888';
    var nelon2 = req.body.nelon2; //'104.534';
    var nelat2 = req.body.nelat2; //  '16.057';
    var swlat1 = req.body.swlat1; //  '15.673';

    var right = nelon2;//'103.888';
    var left = swlng1;//'104.534';
    var top = nelat2;//'16.057';
    var bottom = swlat1;//'15.673';
   

   var left ='97.349853515625'
   var top ='18.999802829053262'
   var right ='102.5628662109375'
   var bottom ='15.0827316716058'
 */
   // console.log('ST_MakeEnvelope('+left+','+top+','+right+','+bottom+', 4326)');

  //  console.log(JSON.stringify(req.body));
  //console.log( id_station );



    /*
    var right = map.getBounds().getNorthEast().lng(); nelon2
    var left = map.getBounds().getSouthWest().lng();  swlng1
    var top = map.getBounds().getNorthEast().lat();   nelat2
    var bottom = map.getBounds().getSouthWest().lat(); swlat1

    var right = '103.888';
    var left = '104.534';
    var top = '16.057';
    var bottom = '15.673';
*/

    var sql=''
    sql+="  SELECT st_asgeojson((ST_Dump(geom)).geom) as geom ";
    sql+="  ,address ";
    sql+=" ,radius";
    sql+=" ,station_name";
    sql+=" ,zone_id";
    sql+=" ,lat,lng";
    sql+=" ,admin";
    sql+=" ,idx ";
    sql+=" FROM station_nao ";

    if(right !=undefined)
    {
        if (utcp.Contains(nao_group_sale, ','))
        {
            sql+= " WHERE zone_id IN (SELECT split_to_rows('"+nao_group_sale+"',',') ) ";
            sql+=" AND geom &&  ST_MakeEnvelope("+left+","+top+","+right+","+bottom+",4326) ";
            if(id_station !=''){
                sql+=" AND  idx::text NOT IN (SELECT split_to_rows('"+id_station+"',',') ) "
            }
            

        }
        else
        {
            if(nao_group_sale !=0)
            {
                sql+=" WHERE zone_id='"+nao_group_sale+"'"
                sql+=" AND geom &&  ST_MakeEnvelope("+left+","+top+","+right+","+bottom+",4326) ";
                if(id_station !=''){
                    sql+=" AND  idx::text NOT IN (SELECT split_to_rows('"+id_station+"',',') ) "
                }
    
            }
            else
            {
                sql+=" WHERE geom &&  ST_MakeEnvelope("+left+","+top+","+right+","+bottom+",4326) ";
                if(id_station !=''){
                    sql+=" AND  idx::text NOT IN (SELECT split_to_rows('"+id_station+"',',') ) "
                }
            }
           
        }

     //   console.log(sql);
    
        ipm.db.dbname = db_config;
        db.get_rows(ipm, sql, function (rows) 
        {
            if (rows.length > 0)
            {
                var strMustache = '{{#.}}';
                strMustache += '{';
                strMustache += ' "type": "Feature"';
                strMustache += ' ,"admin": "{{admin}}","station_name": "{{station_name}}","zone_id": "{{zone_id}}"';
                strMustache += ' ,"lon": "{{lng}}" ,"lat": "{{lat}}","id": "{{idx}}"  ';
                strMustache += ' ,"radius":"{{radius}}","address":"{{address}}","geometry":{{geom}}';
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
    else
    {
        res.send([]);
    }
   


}


function list_station_nao(req, res)
{
    /*
    
     SELECT st_asgeojson((ST_Dump(geom)).geom) as geom 
     ,id as station_id 
    ,radius
     ,station_name
     ,zone_id
,replace(replace(replace(box(geom::geometry)::text, '(', ''),'),', '|'),')','') as boxs  
FROM station_nao 
LIMIT 10
    */
    var nao_group_sale = req.body.nao_group_sale; //'11,12,14,15,16,17' //=

    var sql=''
    sql+="  SELECT st_asgeojson((ST_Dump(geom)).geom) as geom ";
    sql+="  ,id as station_id ";
    sql+=" ,zone_id||' '||station_name";
    sql+=" ,zone_id";
    sql+="  ,replace(replace(replace(box(geom::geometry)::text, '(', ''),'),', '|'),')','') as boxs ";
    sql+=" FROM station_nao ";
   
    if (utcp.Contains(nao_group_sale, ','))
    {
        sql+= " WHERE zone_id IN (SELECT split_to_rows('"+nao_group_sale+"',',') ) ";
    }
    else
    {
        if(nao_group_sale!=0)
        {
            sql+=" WHERE zone_id='"+nao_group_sale+"'"
        }
       
    }

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            /*
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature"';
            strMustache += ' ,"zone_id": "{{zone_id}}"';
            strMustache += ' ,"station_id": "{{station_id}}" ';
            strMustache += ' ,"radius":"{{radius}}","station_name":"{{station_name}}","geometry":{{geom}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';

            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');

            res.send(JSON.parse(final));
            */
           var final = [];
           async.eachSeries(rows, function (row, next)
       {
           var xres = new base_geom();
           xres.station_name = row.station_name;
           xres.station_id = row.station_id;
   
           var xx = split_box(row.boxs);
           xres.bound1 = xx.bound1;//utl.replaceAll('"','',split_box(row.boxs));
           xres.bound2 = xx.bound2;
           final.push(xres);


           next();
       }, function () {
           res.send(final);
       });
        
           
        }
        else
        {
            res.send([]);
        }
    });

}

function add_geom_nao(req, res)
{
    debugger;

    
    var db_name = req.body.fleetid; //'db_10034';//
    var station_name = req.body.station_name; // 'testsbest';//
    var station_type = req.body.station_type;//'1';//
    var zone_id = req.body.zone_id;//'MT';//
    var geom = req.body.geom; //'{ "type": "FeatureCollection", "features": [{"type":"Feature","properties":{"radius":200},"geometry":{"type":"Point","coordinates":[100.33882141113281,13.865413684661691]}}] }'
   
    var type_geom = JSON.parse(geom);
    var res_type = type_geom.features[0].geometry.type;

    var radius ='200';
   
/*
    var geom = '{ "type": "FeatureCollection", "features": [{"type":"Feature","properties":{"radius":200},"geometry":{"type":"Point","coordinates":[100.33882141113281,13.865413684661691]}}] }'
    var type_geom = JSON.parse(geom);
    var res_type = type_geom.features[0].geometry.type;
    var db_name = 'db_10034';
    var zone_id ='1';
    var station_name='testsbest';
    var radius ='200';
 */

     //   var geom = '{ "type": "FeatureCollection", "features": [{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[100.30963897705078,13.767897510377683],[100.30963897705078,13.784236397354777],[100.32817840576172,13.784236397354777],[100.32817840576172,13.767897510377683],[100.30963897705078,13.767897510377683]]]}}] }'
    //  var type_geom = geom;
    // console.log(geo);
       

     

                if (res_type == 'Point')
                {
                    var t = type_geom.features[0];
                    var radius = t.properties.radius;
                    var lng = t.geometry.coordinates[0];
                    var lat = t.geometry.coordinates[1];
                    var ar = { 'fleetid': db_name, 'zone_id': zone_id, 'station_name': station_name, 'geom': 'POINT(' + lng + ' ' + lat + ')', 'radius': radius };


                  var st ='ST_Buffer(CAST(ST_SetSRID(ST_Point('+lng+','+ lat+'),4326) AS geography),200)::geometry';


                    var sql=""
                   sql+=" INSERT INTO station_nao ( ";
                   sql+=" station_name,";
                   sql+=" label,";
                   sql+=" geom,";
                   sql+=" radius,";
                   sql+=" zone_id,";
                   sql+=" lat,lng";
                   sql+="  ) ";
                   sql+=" VALUES ('"+ar.station_name+"','"+ar.station_name+"',"+st+",'"+ar.radius+"','"+ar.zone_id+"','"+lat+"','"+lng+"' ) "




                   // INSERT INTO station_customer (fleet_id, date_create, station_name, geom, radius, station_type) VALUES ('db_10001', '2016-10-13 15:00:26', 'swf', 'POINT(100.33882141113281 13.865413684661691)', 933.7352180462822, '1')

                    ipm.db.dbname = db_config;
                    db.excute(ipm, sql, function (row_id)
                    {
                        debugger;
                        if (row_id != 'ERROR')
                        {
                            res.json({ success: true, message: 'Complete add customer_contract.', 'id': '0'});
                        }
                        else
                        {
                            res.json({ success: false, message: 'Not Complete add customer_contract.','id':'0' });
                        }
                    });

                }
                
}

function set_geom_nao(req, res) 
{
    debugger;
  // console.log(JSON.stringify(req.body));
   //var geom = '{ "type": "FeatureCollection", "features": [{ "type": "Feature", "station_id": "5", "station_name": "กรมทหารราบที่11", "properties": { "radius": 0 }, "geometry": { "type": "Polygon", "coordinates": [[[100.600605010986, 13.8639970755196], [100.603222846985, 13.868705184286], [100.607171058655, 13.8665386328218], [100.606741905212, 13.8657053384119], [100.607814788818, 13.8649970358114], [100.603566169739, 13.8577055598928], [100.604338645935, 13.8575805611667], [100.606784820557, 13.8560805712061], [100.60643076896667, 13.855663905609084], [100.60436010360716, 13.85508057251768], [100.60323357582092, 13.854809738798743], [100.60328722000122, 13.854559738162546], [100.601892471313, 13.854247236989], [100.600991249084, 13.85283055973], [100.599403381348, 13.853413898471], [100.600090026855, 13.8556639056091], [100.59730052948, 13.8572055645847], [100.597214698792, 13.8575805611667], [100.596013069153, 13.8587472133276], [100.595755577087, 13.8590805414401], [100.598931312561, 13.8643303960955], [100.600261688232, 13.8639137453008], [100.600605010986, 13.8639970755196]]] } }] }';

   //var x = ['{ "type": "FeatureCollection", "features": [{ "type": "Feature", "station_id": "3", "station_name": "aaa", "properties": { "radius": 500 }, "geometry": { "type": "Point", "coordinates": [100.500869750977, 13.7367170795724] } }] }'
   //   ,
   // '{ "type": "FeatureCollection", "features": [{ "type": "Feature", "station_id": "16", "station_name": "test", "properties": { "radius": 2777.6003183696444 }, "geometry": { "type": "Point", "coordinates": [100.438213348389, 13.654444219406] } }] }'
   //];

 // var geom = { "type": "FeatureCollection", "features": [{"type":"Feature","station_id":"6092","station_type":"3","station_name":"bestestabcs","properties":{"radius":200},"geometry":{"type":"Polygon","coordinates":[[[99.9343872070313,13.6459868148753],[99.9343872070313,13.6966933367377],[99.9810791015625,13.6966933367377],[99.9810791015625,13.6459868148753],[99.9343872070313,13.6459868148753]]]}}] }

 
   var geom = req.body.geom_data;//x;//
   var sql = '';
   if (geom.length > 1)
   {

       async.eachSeries(geom, function (xgom, next)
       {
           var xrow = JSON.parse(xgom);
           var res_type = xrow.features[0].geometry.type;
           var station_id = xrow.features[0].station_id;

           var q = '( WITH data AS (SELECT ' + utl.sqote(xgom) + '::json AS fc) ';
           q += ' SELECT ';
           q += '  ST_AsText(ST_GeomFromGeoJSON(feat->>' + utl.sqote('geometry') + ')) AS geom ';
           q += ' FROM ( ';
           q += ' SELECT json_array_elements(fc->' + utl.sqote('features') + ') AS feat ';
           q += ' FROM data ';
           q += ' ) AS f) ';

           if (res_type == 'Point')
           {
              // var radius = xrow.features[0].properties.radius;

               sql += " UPDATE station_nao SET geom=" + q + " WHERE idx=" + utl.sqote(station_id) + '; ';
               next();
           }
           else
           {

               sql += " UPDATE station_nao SET geom=" + q + " WHERE idx=" + utl.sqote(station_id) + '; ';
               next();
           }

       }, function () {
           // debugger;
           ipm.db.dbname = db_config;
           db.excute(ipm, sql, function (is_ok) {
               //   debugger;
               if (is_ok == 'oK') {
                   res.json({ success: true, message: 'Complete set_geom.' });
               } else {
                   res.json({ success: false, message: 'Not Complete set_geom.' });
               }
           });
       });
   }
   else {
       var ar = JSON.parse(geom);
      // var res_type = ar.features[0].geometry.type;
       var station_id = ar.features[0].station_id;

       var q = '( WITH data AS (SELECT ' + utl.sqote(geom) + '::json AS fc) ';
       q += ' SELECT ';
       q += '  ST_AsText(ST_GeomFromGeoJSON(feat->>' + utl.sqote('geometry') + ')) AS geom ';
       q += ' FROM ( ';
       q += ' SELECT json_array_elements(fc->' + utl.sqote('features') + ') AS feat ';
       q += ' FROM data ';
       q += ' ) AS f) ';


       if (res_type == 'Point') {
           var radius = ar.features[0].properties.radius;

           sql = " UPDATE station_customer SET radius=" + utl.sqote(radius) + ",geom=" + q + " WHERE station_id=" + utl.sqote(station_id) + '; ';

       } else {
           sql = " UPDATE station_customer SET geom=" + q + " WHERE station_id=" + utl.sqote(station_id) + '; ';
       }

       ipm.db.dbname = db_config;
       db.excute(ipm, sql, function (is_ok) {
           debugger;
           if (is_ok == 'oK') {
               res.json({ success: true, message: 'Complete set_geom.' });
           } else {
               res.json({ success: false, message: 'Not Complete set_geom.' });
           }
       });
   }


}

function del_geom_nao(req, res) 
{
    var geom = req.body.geom_data;

    if (geom.length > 1) {
        var sql = ' ';
        async.eachSeries(geom, function (xgom, next) {

            var xrow = JSON.parse(xgom);
            //  var res_type = xrow.features[0].geometry.type;
            var station_id = xrow.features[0].station_id;

            sql += " DELETE FROM station_nao  WHERE idx=" + utl.sqote(station_id) + ';';
            next();
        }, function () {
            // debugger;
            ipm.db.dbname = db_config;
            db.excute(ipm, sql, function (is_ok) {
                //   debugger;
                if (is_ok == 'oK') {
                    res.json({ success: true, message: 'Complete set geom.' });
                } else {
                    res.json({ success: false, message: 'Not Complete set geom.' });
                }
            });
        });

    } else {

        var ar = JSON.parse(geom);
      //  var res_type = ar.features[0].geometry.type;
        var station_id = ar.features[0].station_id;

        var sql = "DELETE FROM station_nao  WHERE idx=" + utl.sqote(station_id);

        ipm.db.dbname = db_config;
        db.excute(ipm, sql, function (is_ok) {
            debugger;
            if (is_ok == 'oK') {
                res.json({ success: true, message: 'Complete del geom.' });
            } else {
                res.json({ success: false, message: 'Not Complete del geom' });
            }
        });
    }
}


function is_process_now(para,callback)
{
     /* 
  //var start = req.body.start; // '2016-06-04 00:00';
  //var stop = req.body.stop; //'2016-06-04 23:59';
 

   var start = '2019-05-04 00:00';
   var stop = '2019-05-07 23:59';
   var modem_id ='142181256674'
   var db_name = 'db_10034';
*/
var datenow = utl.timenow();
var xdatenow =  utl.format_date(datenow);
//console.log('is_process_now '+para)

var vstart = utl.format_date(para.start_time);
var vstop = utl.format_date(para.end_time);
  //if(true)// 
  if(vstart == xdatenow || vstop == xdatenow)
   {

  //var para = { 'id': 1, 'db_name': para.db_name, 'modem_id': para.modem_id, 'start_time':'2019-05-06 00:00', 'end_time': '2019-05-06 23:59', 'date_gen_report': datenow, 'message': '' }

  
    svnao.clear_data_now_by_id(para,function(xres)
    {
       // console.log('clear_data_now_by_id '+xres);
       if(xres)
       {
        
        get_param_report_working(para,function(res_param)
        {
           // console.log(res_param)
            svnao.main_process(res_param,function(is_ok)
            {
                callback(true);
                return;
            })
        })
        
   
       }
       else
       {
        callback(false);
        return;
       }
     
    })

   }
   else
   {
        callback(false);
        return;
   }

}


function authenticate_nao(req, res)
{
   //console.log(req.body.user);
   // req.body.password
    debugger;
  //  var user = 'hydac'
  //  var pwd = '1234';
    var user = utl.Trim(req.body.user);
    var pwd = utl.Trim(req.body.pass); //'naosale5'//

    //var token = jwt.sign(user, key, {
    //    expiresInMinutes: 1440 // expires in 24 hours
    //});

    var sql = "SELECT id,fleetid,fleetname,password as hash,token,get_rolename(role::int)as role " //+ " AND password=" + utl.sqote(pwd);
   //,COALESCE(nao_group_sale,'') as nao_group_sale,COALESCE (fn_nao_zone_id(nao_group_sale),'0') as zone_id
   sql += ",CASE WHEN nao_group_sale IS NULL THEN '0' ELSE COALESCE (nao_group_sale, '') END AS nao_group_sale ";
   sql += " ,CASE WHEN nao_group_sale IS NULL THEN '0' ELSE COALESCE (fn_nao_zone_id (nao_group_sale),'0') END AS zone_id ";
   sql += " FROM master_fleet WHERE fleetname=" + utl.sqote(user);

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {

        // if user is found and password is right
        // create a token
        if (rows.length > 0)
        {
            var hash = rows[0].hash;
            decode_pws(pwd, hash, function (xres)
            {
                    debugger;
                    // console.log(xres);
                    if (xres == true)
                    {
                        var token = jwt.sign({ user: user }, jwtTokenSecret, { expiresIn: '1d' });

                        var result = {
                            success: true, message: 'Pass to authenticate token.',
                            fleetname: rows[0].fleetname,
                            fleetid: rows[0].fleetid,
                            role: rows[0].role,
                            token: token,
                            group_sale:rows[0].nao_group_sale,
                            zone_id:rows[0].zone_id
                        };

                        var sql = "UPDATE master_fleet SET token=" + utl.sqote(token) + " WHERE id=" + utl.sqote(rows[0].id) + ";";
                        ipm.db.dbname = db_config;
                        db.excute(ipm, sql, function (is_ok) {
                            res.send(result);
                        });
                    }
                    else
                    {
                        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                    }
                });

        } else {
            // res.send(object);
            return res.json({ success: false, message: 'Failed to authenticate token.' });
        }
    });


}

function decode_pws(pws, hash, callback)
{
    bcrypt.compare(pws, hash, function (err, res) {
        // res === true
        // console.log(res);
        callback(res);
        return;
    });
}

function get_param_report_working(xpara,callback)
{
    var sql = "SELECT modem_id,db_name,speedmax,track_every,COALESCE( nao_group_sale,'X') as nao_group_sale  "
    sql += " FROM master_config_vehicle WHERE db_name='db_10034' AND modem_id='"+xpara.modem_id+"' "
  //  sql += " AND modem_id='142181256553'   ORDER BY modem_id";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (row)
    {
        if (row.length > 0)
        {
             row=row[0];
             //start_time
               // debugger;
             
                var para = { 'id': 1, 'db_name': row.db_name, 'modem_id': row.modem_id,'nao_group_sale':row.nao_group_sale, 'speed_max': row.speedmax, 'track_every': row.track_every, 'start_time': xpara.start_time, 'end_time': xpara.end_time, 'message': '' }
                console.log(para);
                callback(para);
                return;
        }
        
    });
    

}


exports.authenticate_nao = authenticate_nao;
exports.get_report_working = get_report_working;
exports.get_report_stopengine_enter_station = get_report_stopengine_enter_station;
exports.get_station_nao = get_station_nao;
exports.list_station_nao = list_station_nao;
exports.add_geom_nao = add_geom_nao;
exports.del_geom_nao = del_geom_nao;
exports.set_geom_nao = set_geom_nao;


//#region Test



//set_geom_nao('','')

//list_station_nao('','')

//get_station_nao('','')

//get_report_working('','')
//is_process_now()
//#endregion

