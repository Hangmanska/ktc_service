
//https://medium.com/@goldrydigital/seamless-coastal-boundaries-with-postgis-4523eb21ed51

//#region header
var async = require('async');
var mustache = require("mustache");
var path = require('path');
var KMZGeoJSON = require('kmz-geojson');
var squel = require("squel");
var moment = require('moment');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var hpt = require('hp_timer.js');

var jwtTokenSecret = 'hangman';


var togeojson = require('togeojson');
var fs = require('fs');
var jsdom = require('jsdom').jsdom;
//var lineToPolygon = require('turf-line-to-polygon');
DOMParser = require('xmldom').DOMParser;
//var parse = require('csv-parse');
var linq = require('linq.js');

const cheerio = require('cheerio');
var htmlparser = require("htmlparser2");

var formidable = require('formidable');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var xreq = require('xPost.js');
var gentxt = require('iGenTextFile');
var irp = require('iReports.js');

var _ = require('underscore')

var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_kumpawapi";
var db_owner ='db_10011'
var db_owner_slave ='db_10023'
//var year_plant ='60_61'
var path_images='';

//https://gi4u.wordpress.com/2009/05/11/%E0%B9%81%E0%B8%9B%E0%B8%A5%E0%B8%87%E0%B8%AB%E0%B8%99%E0%B9%88%E0%B8%A7%E0%B8%A2%E0%B8%95%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B9%80%E0%B8%A1%E0%B8%95%E0%B8%A3%E0%B9%84%E0%B8%9B%E0%B9%80%E0%B8%9B/
//FLOOR(ABS(st_area(geomx::geography)/1600)
//https://gis.stackexchange.com/questions/82174/convert-an-area-to-meters%C2%B2-in-postgis
//https://stackoverflow.com/questions/3418606/sql-how-do-i-get-only-the-numbers-after-the-decimal

//https://gistnu.wordpress.com/2017/02/19/%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B8%B3%E0%B8%99%E0%B8%A7%E0%B8%93%E0%B9%80%E0%B8%99%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B9%84%E0%B8%A3%E0%B9%88-%E0%B8%87%E0%B8%B2%E0%B8%99/
//https://stackoverflow.com/questions/23648300/i-tried-all-ways-but-still-my-area-is-calculated-wrongly-in-postgis
//https://gis.stackexchange.com/questions/201843/calculating-the-area-of-polygons-within-bigger-polygons/201862
//#endregion

function base_geom() {
    this.station_name = '';
    this.farm_id = '';
    this.qt='';
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
    
    var left = map.getBounds().getSouthWest().lng();  swlng1
    var top = map.getBounds().getNorthEast().lat();   nelat2
    var right = map.getBounds().getNorthEast().lng(); nelon2
    var bottom = map.getBounds().getSouthWest().lat(); swlat1

    swlng1: 103.01879882812501
    nelat2: 17.11454265715201
    nelon2: 103.01879882812501
    swlat1: 17.11454265715201
    */
debugger
    var left = req.body.swlng1;  //'103.0187988281';
    var top  = req.body.nelon2;  //'103.01879882812';
    var right = req.body.swlat1; //'17.11454265715';
    var bottom = req.body.nelat2;  //'17.114542657';
    var zoom_level = req.body.zoom_level;
    var year_plant =  '63_64'; //req.body.year_plant;  //

  console.log("get_allfarm "+left+' '+top+' '+right+' '+bottom+' '+year_plant)
   // debugger;
  //  var sql = "SELECT st_asgeojson(the_geom::geometry)as geom FROM all_farm ";

//console.log(req.body);
//console.log(req.headers['x-access-token']);

//var sql = "SELECT st_asgeojson(geomx::geometry)as geom   ";

var sql = "SELECT st_asgeojson((ST_Dump(geomx)).geom) as geom ";
sql += ",name_farmmer as name_farmmer,qt,farm_id "; 
sql += ",home,tambon,aumpher,province ";
sql += ",FLOOR(ABS(st_area(geomx::geography)/1600)) As area ";
sql += ",type_ground,type_sugarcane "; 
sql += ",zone,name_sugarcane,source,xdate,distance as xdistance,methode,owner,eastimate "; 
sql += ",COALESCE(icollect_ton,'0') as total_ton,COALESCE(icolour_code,'1') as colour_status ";
sql += ",st_x(st_centroid(geomx::geometry)) as lon ";
sql += ",st_y(st_centroid(geomx::geometry)) as lat ";
sql += ",b.colour_code,b.harvester_code,substr(farm_id,0,9) as quota  ";
sql += ",zone ,item as cutting_ordering  ";
sql += ",areas ,ton ,result as product_eastimate,home as location";
sql += ",CASE WHEN _getdetail_picture(farm_id) =''  THEN NULL ELSE _getdetail_picture_id(farm_id) END as id_picture ";
sql += " FROM detail_farm_register_"+year_plant+" as a,harvester_register as b"

//sql+=" WHERE geomx &&  ST_MakeEnvelope("+left+","+top+","+right+","+bottom+",4326) ";
sql+=" WHERE a.harvester_name = b.harvester_code "
//sql += " WHERE geomx IS NOT NULL "; 
//sql += " WHERE farm_id IS NOT NULL "; 
//sql += " WHERE (st_x(st_centroid(geomx::geometry)) >" + utl.sqote(swlng1) + " AND st_x(st_centroid(geomx::geometry)) < " + utl.sqote(nelon2) + ") ";
//sql += " AND (st_y(st_centroid(geomx::geometry)) <= " + utl.sqote(nelat2) + " AND st_y(st_centroid(geomx::geometry)) >= " + utl.sqote(swlat1) + ") ";

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
            strMustache += ' ,"name_farmmer": "{{name_farmmer}}","quota": "{{qt}}","farm_id": "{{farm_id}}","district": "{{home}}"';
            strMustache += ' ,"tambon": "{{tambon}}","aumpher": "{{aumpher}}","province": "{{province}}" ';
            strMustache += ' ,"area": "{{area}}","type_ground": "{{type_ground}}","type_sugarcane": "{{type_sugarcane}}"';
            strMustache += ' ,"name_sugarcane": "{{name_sugarcane}}","source": "{{source}}","date_grow": "{{xdate}}","distance_grow": "{{xdistance}}" ';
            strMustache += ' ,"method_grow": "{{methode}}","growner": "{{owner}}","predict": "{{eastimate}}","lon": "{{lon}}" ,"lat": "{{lat}}"  ';
            strMustache += ' ,"total_ton":"{{total_ton}}","colour_status":"{{colour_status}}","geometry":{{geom}}';
            strMustache += ' ,"id_picture":"{{id_picture}}","colour_code":"{{colour_code}}","harvester_code":"{{harvester_code}}" ';
            strMustache += ' ,"zone":"{{zone}}","quota":"{{quota}}","cutting_ordering":"{{cutting_ordering}}","areas":"{{areas}}","ton":"{{ton}}","product_eastimate":"{{product_eastimate}}","location":"{{location}}" ';
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



function upload_kpwp(req, res)
{

    var year_plant = req.body.year_plant;   //'61_62'; //b.year_plant; //  
    var name_tb = set_tbname(year_plant);

   // debugger;
    var skip_first_row=false;
    var csvData=[];
    var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) 
    {
       // console.log( files.file);
        fs.createReadStream(files.file.path)
        //.pipe(parse({delimiter: ','})) //windows
        .pipe(parse({delimiter: '\t'})) //linux
        .on('data', function(csvrow) 
        {
           // console.log(csvrow);
            //do something with csvrow
            csvData.push(csvrow);        
        })
        .on('end',function() 
        {
          //do something wiht csvData
        //  debugger;
          //console.log(csvData);
      //    gentxt.build_text('upload_kpwp.txt',csvData);
          /* */
          async.eachSeries(csvData, function (row, next)
          {
             // console.log(row);
            if(skip_first_row)
            {
                var step1_finish = false;
                var step2_finish = false;
                var step3_finish = false;
                var farm_id =  row[4];
                var ton = row[7];

               // console.log(farm_id +' '+ton);

                /* */
                var sql1 = "UPDATE "+name_tb+" SET icollect_ton=COALESCE(icollect_ton,'0')+"+ton+" WHERE farm_id="+utl.sqote(farm_id);
              
                ocsb_excute(sql1,db_sugarcane,function(xres)
                {
                  //  console.log(xres);
                   step1_finish = true;
                   final();
                })

                var json ={'year_plant':year_plant,'bill_number':row[0],'weight_number':row[1],'quota':row[3],'farm_id':row[4]
                ,'name_farmmer':row[5],'vehicle_name':row[6],"weight": row[7],'zone':row[10]
                ,'type_sugarcane':row[12],'date_send_cane':format_date_csv(row[14])
            }

            

                add_report_01(json,function(xreport)
                {
                    step3_finish = true;
                    final();
                })


                var sql2 = squel.insert()
                .into('weighing')
                .set("bill_number", row[0])
                .set("weight_number", row[1]) 
                .set("distic", row[2])
                .set("qt", row[3])
                .set("farm_id", row[4])
                .set("name_farmmer", row[5])
                .set("vehicle_name", row[6])
                .set("weight", row[7])
                .set("distance", row[8])
                .set("ampher", row[9])
                .set("zone", row[10])
                .set("rate", row[11])
                .set("sugarcane_type", row[12])
                .set("anm", row[13])
                .set("dmy", json.date_send_cane)
                .set("date_input", utcp.now())
                .toString();
/**/
                ocsb_excute(sql2,db_sugarcane,function(xres)
                { 
                    step2_finish = true;
                    final();
                })

                function final()
                {
                    if(step1_finish  && step2_finish && step3_finish)
                    {
                        next();
                    }
                }
               

            }
            else
            {
                skip_first_row = true;
                next();
            }
          

          },function()
          {
                res.send(true);
          });
         
          
        });

    });

   
}

function format_date_csv(dateString)
{
    var comp = dateString.split('/');
    
        if (comp.length !== 3) {
            return false;
        }
    
        var y = parseInt(comp[2], 10);
        var m = parseInt(comp[1], 10);
        var d = parseInt(comp[0], 10);
      
        var date = new Date(y, m - 1, d);
        var res = moment(date).format("YYYY-MM-DD HH:mm");
     return  res;
}



function add_report_01(json,callback)
{
    function find_type_fill_weight(canename,weight)
    {
        var res={'r1':'','r2':'','r3':'','r4':'','r5':'','r6':'','r7':'','r8':'','r9':'','r10':''};
    
       switch(canename)
       {
           case "อ้อยสด" : { res.r1=weight  }break;
           case "อ้อยสดสวยงาม" : { res.r2=weight  }break;
           case "อ้อยสดปนเปื้อน" : { res.r3=weight  }break;
           case "อ้อยสดยอดยาว" : { res.r4=weight  }break;
           case "อ้อยสดไม่ตัดยอด" : { res.r5=weight  }break;
           case "อ้อยไฟไหม้" : { res.r6=weight  }break;
           case "อ้อยไฟไหม้ไม่มัด" : { res.r7=weight  }break;
           case "อ้อยไฟไหม้ปนเปื้อน" : { res.r8=weight  }break;
           case "อ้อยไฟไหม้ยอดยาว" : { res.r9=weight  }break;
           case "อ้อยไฟไหม้ไม่ตัดยอด" : { res.r10=weight  }break;
           default : { res.r1=weight  }break;
       }
       return res;
    }

    function report_01_getstatus(year_plant,farm_id,callback)
    {
       // var year_plant = '60_61'; //b.year_plant; //  
        var name_tb = set_tbname(year_plant);
       // var farm_id ='15021001001'
        var status ="";
    
       var sql ="SELECT COUNT(id) as is_closefarm_or_openfarm FROM "+name_tb+"  WHERE farm_id="+utl.sqote(farm_id)+"  AND icolour_code='5'  ";
       sql +=" UNION ALL SELECT COUNT(id) FROM report_01 WHERE farmid="+utl.sqote(farm_id) ;
    
       nrows(sql,db_sugarcane,function(res)
       {
          // debugger;
      
         if(res[0].is_closefarm_or_openfarm =="0")
         {
            if(res[1].is_closefarm_or_openfarm >0 )
            {
                status = "ระหว่างตัด"
                callback(status);
                return;
            }
            else
            {
                status = "เปิดแปลง"
                callback(status);
                return;
            }
    
           
         }
         else
         {
            status = "ปิดแปลง"
            callback(status);
            return;
         }
    
       })
    
    }

    var cane =  find_type_fill_weight(json.type_sugarcane,json.weight);

    report_01_getstatus(json.year_plant,json.farm_id,function(res_status_farm)
    {
            var sql = squel.insert()
            .into('report_01')
            .set("weighing_id", json.weight_number)
            .set("quota", json.quota)
            .set("farm_id", json.farm_id)
            .set("name", json.name_farmmer)
            .set("zone", json.zone)
            //.set("round", row[0])
        // .set("harvest", row[0])
        // .set("cane_contract", row[0])
        // .set("type_vehicle", row[0])
            .set("cane_today", json.weight)
            .set("vehicle_number", json.vehicle_name)
        
            .set("fresh_cane", cane.r1)
            .set("fresh_cane_beautiful", cane.r2)
            .set("fresh_cane_contamination", cane.r3)
            .set("fresh_cane_longtop", cane.r4)
            .set("fresh_cane_uncuttop", cane.r5)
            .set("cane_onfire", cane.r6)
            .set("cane_onfire_untie", cane.r7)
            .set("cane_onfire_contamination", cane.r8)
            .set("cane_onfire_longtop", cane.r9)
            .set("cane_onfire_uncuttop", cane.r10)
        
            .set("date_send_cane", json.date_send_cane)
            .set("status_farm", res_status_farm)
            .set("total_cane", json.weight)
            .toString();

            ocsb_excute(sql,db_sugarcane,function(xres)
            {
               callback(xres);
               return;
            })
        
    })

}

//+++++++++++++++++++++++++ Report +++++++++++++++++++++++++++++++


function get_report_01(req, res)
{
    var farm_id = req.body.farm_id;//'15021001001';

    var detail = { 'rows': '', 'sum': '' };

  var sql =  squel.select()
    .from("report_01")
    .field("weighing_id")
    .field("quota")
    .field("farm_id")
    .field("name")
    .field("zone")
    .field("row_number() OVER(ORDER BY id) as round")
    .field("harvest")
    .field("cane_contract")
    .field("cane_today")
    .field("COALESCE(type_vehicle,'') as type_vehicle")
    .field("vehicle_number")
    .field("fresh_cane")
    .field("fresh_cane_beautiful")
    .field("fresh_cane_contamination")
    .field("fresh_cane_longtop")
    .field("fresh_cane_uncuttop")
    .field("cane_onfire")
    .field("cane_onfire_untie")
    .field("cane_onfire_contamination")
    .field("cane_onfire_longtop")
    .field("cane_onfire_uncuttop")
    .field("to_char(date_send_cane, 'DD/MM/YY') as date_send_cane")
    .field("status_farm")
    .where("farm_id ="+utl.sqote(farm_id))
    .toString()

    nrows(sql,db_sugarcane,function(xres)
    {
        var s1 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.cane_today) })
        .Sum();

        var s2 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.fresh_cane) })
        .Sum();

        var s3 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.fresh_cane_beautiful) })
        .Sum();

        var s4 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.fresh_cane_contamination) })
        .Sum();


        var s5 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.fresh_cane_longtop) })
        .Sum();

        var s6 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.fresh_cane_uncuttop) })
        .Sum();

        var s7 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.cane_onfire) })
        .Sum();

        var s8 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.cane_onfire_untie) })
        .Sum();

        var s9 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.fresh_cane_uncuttop) })
        .Sum();

        var s10 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.cane_onfire_contamination) })
        .Sum();

        var s11 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.cane_onfire_longtop) })
        .Sum();

        var s12 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.cane_onfire_uncuttop) })
        .Sum();

        var summa={'s1':s1,'s2':s2,'s3':s3,'s4':s4,'s5':s5,'s6':s6
        ,'s7':s7,'s8':s8,'s9':s9,'s10':s10,'s11':s11,'s12':s12
    }

         detail.rows =xres;
         detail.sum = summa;

        res.send(detail);
    })
}

function get_report_02(req, res)
{
    var year_plant = req.body.year_plant; //
    var quota = req.body.quota; //'11013062';
    var name_tb = set_tbname(year_plant);
    
    var detail = { 'rows': '', 'sum': '' };

    var sql ="";
    sql +=" SELECT DISTINCT ";
	sql +="right(farm_id,3) as code_farm ";
    sql +=",(FLOOR (ABS ( st_area (geomx :: geography) / 1600))) as rai ";
    sql +=",home,tambon,aumpher,province ";
    sql +=" ,eastimate,COALESCE(icollect_ton,0)as total_ton  ";
    sql +=" FROM  "+name_tb;
    sql +=" WHERE qt ="+utl.sqote(quota);
    sql +=" AND province NOT IN('กรุงเทพมหานคร','สมุทรปราการ') ";
    sql +=" ORDER BY right(farm_id,3) ";

    nrows(sql,db_sugarcane,function(xres)
    {
        var s1 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.rai) })
        .Sum();

        var s2 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.eastimate) })
        .Sum();

        var s3 = linq.Enumerable.From(xres)
        .Select(function (x) { return parseInt(x.total_ton) })
        .Sum();

        var sum ={'s1':s1,'s2':s2,'s3':s3};

        detail.rows =xres;
        detail.sum = sum;

        res.send(detail);
    })
}


function get_report_03(req, res)
{
    var year_plant = req.body.year_plant; // '60_61'; //b.year_plant; //  
     var quota = req.body.quota; //'27007546';
    var name_tb = set_tbname(year_plant);
    var detail = { 'rows': '', 'sum': '' };

    var result =[];

    function find_fill_weight_to_radius(radius,rai_or_ton,weight)
    {
        var res={'r1':'','r2':'','r3':'','r4':'','r5':'','r6':'','r7':''
           ,'r8':'','r9':'','r10':'','r11':'','r12':'','r13':'','r14':''
       };
    
       if(rai_or_ton=='rai')
       {
            switch(radius)
            {
                case "10" : { res.r1=weight  }break;
                case "15" : { res.r2=weight  }break;
                case "20" : { res.r3=weight  }break;
                case "40" : { res.r4=weight  }break;
                case "60" : { res.r5=weight  }break;
                case "80" : { res.r6=weight  }break;
                case "100" : { res.r7=weight  }break;
                default : { res.r1=weight  }break;
            }
            return res;
       }
       else
       {
        switch(radius)
        {
            case "10" : { res.r8=weight  }break;
            case "15" : { res.r9=weight  }break;
            case "20" : { res.r10=weight  }break;
            case "40" : { res.r11=weight  }break;
            case "60" : { res.r12=weight  }break;
            case "80" : { res.r13=weight  }break;
            case "100" : { res.r14=weight  }break;
            default : { res.r1=weight  }break;
        }
        return res;
       }
    
    }

    function set_json_report_03()
    {
        this.quotas='';
        this.name_farmer='';
        this.farmid='';
        this.type_cane='';
        this.total_area='';
        this.total_contract='';
        this.total_cane='';
        this.rai_10='';
        this.rai_15='';
        this.rai_20='';
        this.rai_40='';
        this.rai_60='';
        this.rai_80='';
        this.rai_100='';
        this.ton_10='';
        this.ton_15='';
        this.ton_20='';
        this.ton_40='';
        this.ton_60='';
        this.ton_80='';
        this.ton_100=''; 
          
    }

    var sql ="";
    sql +="  SELECT DISTINCT ";
    sql +=" farm_id ";
    sql +=" ,qt as quotas";
    sql +=" ,name_farmmer ";
    sql +=" ,name_sugarcane ";
    sql +=" ,COALESCE(icollect_ton,0)as total_cane  ";
    sql +=" ,(FLOOR (ABS (	st_area (geomx :: geography) / 1600) )) as total_area ";
    sql +=" ,home,tambon,aumpher,province ";
    sql +=" ,eastimate ";
    sql +=" ,_i_getradius(farm_id) as radius ";
    
    sql +=" FROM  "+name_tb;
    sql +=" WHERE qt ="+utl.sqote(quota);
    sql +=" AND province NOT IN('กรุงเทพมหานคร','สมุทรปราการ') ";

    nrows(sql,db_sugarcane,function(xres)
    {
       // res.send(xres);
       debugger;
       async.eachSeries(xres, function (row, next)
       {
           // console.log(row.radius,'ton',row.total_ton)
           var _ar = new set_json_report_03();
           var t =  find_fill_weight_to_radius(row.radius,'ton',row.total_cane);

           _ar.quotas=row.quotas;
           _ar.name_farmer=row.name_farmmer;
           _ar.farmid=row.farm_id;
           _ar.type_cane='';
           _ar.total_area=row.total_area;
           _ar.total_contract='';
           _ar.total_cane=row.total_cane;
           _ar.rai_10=t.r1;
           _ar.rai_15=t.r2;
           _ar.rai_20=t.r3;
           _ar.rai_40=t.r4;
           _ar.rai_60=t.r5;
           _ar.rai_80=t.r6;
           _ar.rai_100=t.r7;
           _ar.ton_10=t.r8;
           _ar.ton_15=t.r9;
           _ar.ton_20=t.r10;
           _ar.ton_40=t.r11;
           _ar.ton_60=t.r12;
           _ar.ton_80=t.r13;
           _ar.ton_100=t.r14;

           result.push(_ar);

           next();


       },function(){
        debugger;
        var s0 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.total_cane) })
        .Sum();

        var s1 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.rai_10) })
        .Sum();
        var s2 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.rai_15) })
        .Sum();
        var s3 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.rai_20) })
        .Sum();
        var s4 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.rai_40) })
        .Sum();
        var s5 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.rai_60) })
        .Sum();
        var s6 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.rai_80) })
        .Sum();
        var s7 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.rai_100) })
        .Sum();


        var s8 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.ton_10) })
        .Sum();
        var s9 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.ton_15) })
        .Sum();
        var s10 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.ton_20) })
        .Sum();
        var s11 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.ton_40) })
        .Sum();
        var s12 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.ton_60) })
        .Sum();
        var s13 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.ton_80) })
        .Sum();
        var s14 = linq.Enumerable.From(result)
        .Select(function (x) { return parseFloat(x.ton_100) })
        .Sum();

        var summa={
          's0':s0, 's1':s1,'s2':s2,'s3':s3,'s4':s4,'s5':s5,'s6':s6,'s7':s7
         ,'s8':s8,'s9':s9,'s10':s10,'s11':s11,'s12':s12,'s13':s13,'s14':s14
         }

         detail.rows =result;
         detail.sum = summa;

          res.send(detail);
           
       });
     //  
      // console.log(xres);
    })

}

function get_report_04(req, res)
{  
    var year_plant = req.body.year_plant; //  '60_61'; //
    var quota =req.body.quota; //'15021001';
    var name_tb = set_tbname(year_plant);
    

    var sql ="";
    sql +=" SELECT DISTINCT ";
    sql +="qt as quota";
    sql +=",name_farmmer ";
    sql +=",farm_id ";
    sql +=",type_sugarcane ";
    sql +=",name_sugarcane ";
    sql +=",methode ";
    sql +=",(FLOOR (ABS (	st_area (geomx :: geography) / 1600))) as area ";
    sql +=",'' as contract ";
    sql +=",'' as cutting_time ";
    sql +=",COALESCE(icollect_ton,0)as total_cane  ";
    sql +=" FROM  "+name_tb;
    sql +=" WHERE qt ="+utl.sqote(quota);
    sql +=" AND province NOT IN('กรุงเทพมหานคร','สมุทรปราการ') ";

    nrows(sql,db_sugarcane,function(xres)
    {
        res.send(xres);
    })

}

function get_report_05(req, res)
{

    var year_plant = req.body.year_plant; //  '60_61'; //
    var zone = req.body.zone; //'401';//
    var name_tb = set_tbname(year_plant);
    var result=[];

    function set_json_report_05()
    {
        this.quotas='';
        this.name_farmer='';
        this.zone='';
        this.contract_150_ton='';
        this.normal_contract='';
        this.project_contract='';
        this.cane_send ='';
        this.percent_cane_send='';
        this.fresh_cane_10='';
        this.fresh_cane_15='';
        this.fresh_cane_20='';
        this.fresh_cane_40='';
        this.fresh_cane_60='';
        this.fresh_cane_80='';
        this.fresh_cane_100='';
        this.cane_onfire_10='';
        this.cane_onfire_15='';
        this.cane_onfire_20='';
        this.cane_onfire_40='';
        this.cane_onfire_60='';
        this.cane_onfire_80='';
        this.cane_onfire_100=''; 
          
    }

    var sql ="";
    sql +=" SELECT DISTINCT  ";
    sql +=" qt as quota ";
    sql +=",name_farmmer  ";
    sql +=",zone ";
	sql +=",'' as contract_150_ton ";
	sql +=",'' as normal_contract ";
    sql +=",'' as project_contract ";
    sql +=",COALESCE(icollect_ton,0) as cane_send ";
    sql +=",'' as percent_cane_send ";
    sql +=",_i_getradius(farm_id) as radius ";
    sql +=" FROM  "+name_tb;
    sql +=" WHERE zone ="+utl.sqote(zone);
    sql +=" AND province NOT IN('กรุงเทพมหานคร','สมุทรปราการ') ";

    function find_fill_weight_to_radius(radius,rai_or_ton,weight)
    {
        var res={'r1':'','r2':'','r3':'','r4':'','r5':'','r6':'','r7':''
           ,'r8':'','r9':'','r10':'','r11':'','r12':'','r13':'','r14':''
       };
    
       if(rai_or_ton=='rai')
       {
            switch(radius)
            {
                case "10" : { res.r1=weight  }break;
                case "15" : { res.r2=weight  }break;
                case "20" : { res.r3=weight  }break;
                case "40" : { res.r4=weight  }break;
                case "60" : { res.r5=weight  }break;
                case "80" : { res.r6=weight  }break;
                case "100" : { res.r7=weight  }break;
                default : { res.r1=weight  }break;
            }
            return res;
       }
       else
       {
        switch(radius)
        {
            case "10" : { res.r8=weight  }break;
            case "15" : { res.r9=weight  }break;
            case "20" : { res.r10=weight  }break;
            case "40" : { res.r11=weight  }break;
            case "60" : { res.r12=weight  }break;
            case "80" : { res.r13=weight  }break;
            case "100" : { res.r14=weight  }break;
            default : { res.r1=weight  }break;
        }
        return res;
       }
    
    }

    nrows(sql,db_sugarcane,function(xres)
    {
       // res.send(xres);
       async.eachSeries(xres, function (row, next)
       {
           // console.log(row.radius,'ton',row.total_ton)
           var _ar = new set_json_report_05();
           var t =  find_fill_weight_to_radius(row.radius,'ton',row.total_cane);

           _ar.quotas=row.quotas;
           _ar.name_farmer=row.name_farmmer;
           _ar.zone=row.zone;
           _ar.contract_150_ton=row.contract_150_ton;
           _ar.normal_contract=row.normal_contract;
           _ar.project_contract=row.project_contract;
           _ar.cane_send =row.cane_send;
           _ar.percent_cane_send=row.percent_cane_send;

           _ar.fresh_cane_10=t.r1;
           _ar.fresh_cane_15=t.r2;
           _ar.fresh_cane_20=t.r3;
           _ar.fresh_cane_40=t.r4;
           _ar.fresh_cane_60=t.r5;
           _ar.fresh_cane_80=t.r6;
           _ar.fresh_cane_100=t.r7;
           _ar.cane_onfiren_10=t.r8;
           _ar.cane_onfire_15=t.r9;
           _ar.cane_onfire_20=t.r10;
           _ar.cane_onfire_40=t.r11;
           _ar.cane_onfire_60=t.r12;
           _ar.cane_onfire_80=t.r13;
           _ar.cane_onfire_100=t.r14;

           result.push(_ar);

           next();


       },function(){
          res.send(result);
       });

    })

}

function get_report_all_area_quota(req, res)
{
    var year_plant = req.body.year_plant; //  '60_61'; //

    var sql= "";
    sql+= " SELECT DISTINCT qt as quota ";
    sql+= " ,COUNT(farm_id) as total_farm  "
    sql+= " ,COALESCE(get_area_rai_by_qt_"+year_plant+"(qt),'0') as rai "
    sql+= " ,get_area_ngan_by_qt_"+year_plant+"(qt) as ngan "
    sql+= " FROM detail_farm_register_"+year_plant+"  "
    sql+= " WHERE COALESCE(get_area_rai_by_qt_"+year_plant+"(qt),'0')>'0' "
    sql+= " GROUP BY qt ORDER BY qt ";
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
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

function get_report_all_area_zone(req, res)
{
    var year_plant = req.body.year_plant; //  '60_61'; //

    var sql= "";
    sql+= " SELECT DISTINCT zone ";
    sql+= " ,COUNT(farm_id) as total_farm  "
    sql+= " ,COALESCE(get_area_rai_by_zone_"+year_plant+"(zone),'0') as rai "
    sql+= " ,get_area_ngan_by_zone_"+year_plant+"(zone) as ngan "
    sql+= " FROM detail_farm_register_"+year_plant+"  "
    sql+= " GROUP BY zone  ORDER BY zone   ";
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
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


function report_distance_farm_to_kmp(req, res)
{
    var year_plant = req.body.year_plant; //  '60_61'; //
    
    var sql= "";
    sql+= " SELECT name_farmmer,farm_id ";
    sql+= " ,st_y( st_centroid(geomx)) as lat_farm,st_x( st_centroid(geomx)) as lon_farm ";
    sql+= " ,distance_real_road ";
    sql+= " ,duration_real_road ";
    sql+= " FROM detail_farm_register_"+year_plant+" ";
    sql+= " WHERE substr(qt, 0,3)  IN ('27','28') ";
    sql+= " AND geomx IS NOT NULL  ";
    sql+= " AND distance_real_road IS NOT NULL ";
    sql+= " AND farm_id !='0' ";
    sql+= " AND distance_real_road >'0' ";
    sql+= " ORDER BY substr(distance_real_road,0,position(' ' in distance_real_road))::float ";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
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

function report_distance_farm_to_ksp(req, res)
{
    var year_plant = req.body.year_plant; //  '60_61'; //
    
    var sql= "";
    sql+= " SELECT name_farmmer,farm_id ";
    sql+= " ,st_y( st_centroid(geomx)) as lat_farm,st_x( st_centroid(geomx)) as lon_farm ";
    sql+= " ,distance_real_road ";
    sql+= " ,duration_real_road ";
    sql+= " FROM detail_farm_register_"+year_plant+" ";
    sql+= " WHERE substr(qt, 0,3) NOT IN ('27','28') ";
    sql+= " AND geomx IS NOT NULL  ";
    sql+= " AND distance_real_road IS NOT NULL ";
    sql+= " AND farm_id !='0' ";
    sql+= " AND distance_real_road >'0' ";
    sql+= " ORDER BY substr(distance_real_road,0,position(' ' in distance_real_road))::float ";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
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

function upload_gpx2gis(req, res)
{
    var year_plant = '61_62';//req.body.year_plant; //
    var type_project = 'project';//req.body.type_project; //'normal' //
    var xpara={'year_plant':year_plant,'type_project':type_project};
    
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
          
                /*
                 console.log('ddd '+file_size);
               
                 var gpx = jsdom(data);
                var converted = togeojson.gpx(gpx);
                var str_line = JSON.stringify(converted);

                store_2_postgresql(str_line,function(xres){
                   // res.send(xres);
                    res.send(xres);
                });
                */
                 var kml = new DOMParser().parseFromString(fs.readFileSync(new_path, 'utf8'));

            // var converted = togeojson.kml(kml);

                var convertedWithStyles = togeojson.kml(kml, { styles: true });

                var str_line = JSON.stringify(convertedWithStyles);
            //  var str_line = JSON.stringify(converted);
             
                  
                if(utl.Contains(new_path,'KSP'))
                {
                    store_2_postgresql_KSP(xpara,str_line,function(x)
                    {
                       // console.log(x);
                       res.send(x)
                    });
                }
                else
                {
                    store_2_postgresql_KMP(xpara,str_line,function(x)
                    {
                       // console.log(x);
                       res.send(x)
                    });
                }

            });
                    
        });
          /**/
        //res.send('ok');
    });

}

function update_line_2_polygon(xpara,callback)
{
  //  var year_plant ='60_61';
 //  var sql= " UPDATE all_farm SET the_geomx=ST_GeomFromText('POLYGON(('||substring(left(St_astext(ST_Force_2D(the_geom)),-1),12)||','||LEFT(substring(left(St_astext(ST_Force_2D(the_geom)),-1),12),strpos(substring(left(St_astext(ST_Force_2D(the_geom)),-1),12), ',')-1)||'))')::geometry ";
 //  sql+= " WHERE properties IS NOT NULL AND the_geomx IS NULL ";
   var sql= "UPDATE detail_farm_register_"+xpara.year_plant+" SET geomx=ST_GeomFromText('POLYGON(('||substring(left(St_astext(ST_Force_2D(geomx)),-1),12)||','||LEFT(substring(left(St_astext(ST_Force_2D(geomx)),-1),12),strpos(substring(left(St_astext(ST_Force_2D(geomx)),-1),12), ',')-1)||'))')::geometry ";
   sql+= " WHERE geomx IS NOT NULL AND st_geometrytype(geomx::geometry)='ST_LineString' ";
   ocsb_excute(sql,db_sugarcane,function(xres)
   {
       callback(xres);
       return;
    })
}

function store_2_postgresql_KSP(xpara,gpx_geojson,callback)
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
        //   console.log('row length '+rows.length);
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

                            insert_into_details_farms_register(xpara,_ar,function(sf)
                            {
                                next();
  
                            });

                        }
                        else
                        {
                            insert_into_details_farms_register(xpara,_ar,function(sf)
                            {
                                next();
  
                            });

                        }
                        
                    })
                }
                else
                {
                       insert_into_details_farms_register(xpara,_ar,function(sf)
                       {
                         next();
                       });

                }
         
 
            },function(){
           
                update_line_2_polygon(xpara,function(result)
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

function store_2_postgresql_KMP(xpara,gpx_geojson,callback)
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

                        insert_into_details_farms_register(xpara,_ar,function(sf)
                        {
                            next();
                        });


                    } 
                    else
                    {
                        insert_into_details_farms_register(xpara,_ar,function(sf)
                        {
                             next();
                        });

                    }
                    
                })

            },function()
            {
                update_line_2_polygon(xpara,function(result)
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

function insert_into_details_farms_register(xpara,data,callback)
{

     var sql2 = "INSERT INTO detail_farm_register_"+xpara.year_plant+" (name_farmmer, qt, farm_id,home, zone, tambon, aumpher, province ";
        sql2 +=", area, type_ground, type_sugarcane, name_sugarcane, source, distance, methode, owner, eastimate ";
        sql2 +=", lat, lon,type_project, geomx) VALUES ";
        sql2 +=" ("+utl.sqote(data.name_farmmer)+","+utl.sqote(data.qt)+","+utl.sqote(data.farm_id)+","+utl.sqote(data.home)+","+utl.sqote(data.zone)+","+utl.sqote(data.tambon)+" ";
        sql2 +=","+utl.sqote(data.aumpher)+","+utl.sqote(data.province)+","+utl.sqote(data.area)+","+utl.sqote(data.type_ground)+" ";
        sql2 +=","+utl.sqote(data.type_sugarcane)+","+utl.sqote(data.name_sugarcane)+","+utl.sqote(data.source)+","+utl.sqote(data.distance)+" ";
        sql2 +=","+utl.sqote(data.methode)+","+utl.sqote(data.owner)+","+utl.sqote(data.eastimate)+","+utl.sqote(data.lat)+","+utl.sqote(data.lon)+" ";
        sql2 +=","+utl.sqote(xpara.type_project)+" ";
        sql2 +=","+"ST_Force_2D("+utl.sqote(data.geomx)+")::geometry ) " ;



    ipm.db.dbname = db_sugarcane;
    db.excute(ipm, sql2, function (is_ok) {
     //   console.log('add detail_farm ' + is_ok);
        callback(is_ok);
        return;
    });
  
}


function edit_geom_farm(req, res)
{
   //var data = req.body.data;
   var year_plant = req.body.year_plant; //'60_61';//

 //  console.log(year_plant);

    var s = {"fleetid":"db_10011","fleetname":"kmp","geom_data":["{ \"type\": \"FeatureCollection\", \"features\": [{\"type\":\"Feature\",\"name_farmmer\":\"เทีนมจันทร์ ศรีหริ่ง\",\"quota\":\"15031059\",\"farm_id\":\"15031059001\",\"district\":\"\",\"tambon\":\"หนองหญ้าไซ\",\"aumpher\":\"วังสามหมอ\",\"province\":\"อุดรธานี\",\"area\":\"7\",\"type_ground\":\"ร่วนปนทราย\",\"type_sugarcane\":\"ตุลา\",\"zone\":\"ศูนย์ส่งเสริมอ้อยวังสามหมอ\",\"name_sugarcane\":\"ขอนแก่น3\",\"source\":\"\",\"date_grow\":\"\",\"distance_grow\":\"1.2 m.\",\"method_grow\":\"เครื่องปลูก\",\"growner\":\"เจ้าของ\",\"predict\":\"10\",\"lon\":\"103.346943279673\",\"lat\":\"16.9778730779021\",\"total_ton\":\"0\",\"colour_status\":\"7\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[103.346637748234,16.9773541916427],[103.346621653966,16.9773542366089],[103.346608347597,16.9773573986251],[103.346561592743,16.9773920459063],[103.346498248995,16.9774270070508],[103.346414814392,16.9774652732039],[103.346361325415,16.9774972450019],[103.346306990176,16.9775326477137],[103.346283959437,16.9775748052332],[103.346264293063,16.9776598496224],[103.34630634716,16.9781522536237],[103.34706902503967,16.9778563220822],[103.347473513392,16.9784041015681],[103.347685152648,16.9777083662483],[103.346637748234,16.9773541916427],[103.346637748234,16.9773541916427]]]},\"id_picture\":\"\",\"$$hashKey\":\"object:4655\"}] }"]}
    
  // var x = JSON.stringify(s);
 var xar = JSON.parse(s.geom_data);
 //var xar = JSON.parse(req.body.geom_data);
  var ar = xar.features[0].geometry.coordinates;
  var name_tb = "detail_farm_register_"+year_plant;
  var farm_id= xar.features[0].farm_id;
 
  prepare_array2geo2text2(ar,name_tb,farm_id,function(geomx)
  {
      debugger;
   //  console.log(geomx);
     var sql = "UPDATE detail_farm_register_"+year_plant+" SET geomx="+geomx.arr_area+"  WHERE farm_id="+utl.sqote(farm_id);
     
         ipm.db.dbname = db_sugarcane;
         db.excute(ipm, sql, function (is_ok) 
         {
            res.send(is_ok);
         });
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
          //  console.log(json);
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

/* 
var sql='';
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 20000)::geometry)) as geom,'20' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 30000)::geometry)) as geom,'30' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 50000)::geometry)) as geom,'50' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 70000)::geometry)) as geom,'70' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 90000)::geometry)) as geom,'90' as km FROM master_factory_config WHERE id < '3' ";
*/

function circle_around_factory(req,res)
{
  var sql = "SELECT st_asgeojson(geom) as geom,size_km  as radius FROM master_factory_config WHERE geom IS NOT NULL ";

   debugger;

 ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature"';
            strMustache += ' ,"geometry":  {{geom}}';
            strMustache += ' ,"radius":  {{radius}}';
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

function list_search_farmer_factory(req,res)
{
    var year_plant = req.body.year_plant; 

    var sql='';
    sql += "SELECT CASE WHEN name_farmmer='.' THEN qt ELSE name_farmmer END name_farmmer,qt,farm_id ";
    sql += ",tambon||':'||aumpher||':'||province as location";
    sql += ",type_ground,type_sugarcane,name_sugarcane,SOURCE";
    sql += ",distance,methode,owner,eastimate";
    sql += ",replace(replace(replace(box(ST_Buffer(geomx::geography, 20)::geometry)::text, '(', ''),'),', '|'),')','') as boxs ";
    sql += " FROM detail_farm_register_"+year_plant;
    sql += " WHERE geomx IS NOT NULL  AND zone >='100' AND zone <='300' AND name_farmmer !='' "; 

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

function list_geomkpwp(req,res)
{
    var year_plant = req.body.year_plant; // '60_61'; //b.year_plant; //  

    var sql='';
    sql += "SELECT CASE WHEN name_farmmer='.' THEN qt ELSE name_farmmer END name_farmmer,qt,farm_id ";
    sql += ",tambon||':'||aumpher||':'||province as location";
    sql += ",type_ground,type_sugarcane,name_sugarcane,SOURCE";
    sql += ",distance,methode,owner,eastimate";
    sql += ",replace(replace(replace(box(ST_Buffer(geomx::geography, 20)::geometry)::text, '(', ''),'),', '|'),')','') as boxs ";
    sql += " FROM detail_farm_register_"+year_plant;
    sql += " WHERE geomx IS NOT NULL  AND zone >='100' AND zone <='300'"; 

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


function list_search_farmer_center(req,res)
{
    var year_plant = req.body.year_plant; 

    var sql='';
    sql += "SELECT CASE WHEN name_farmmer='.' THEN qt ELSE name_farmmer END name_farmmer,qt,farm_id ";
    sql += ",tambon||':'||aumpher||':'||province as location";
    sql += ",type_ground,type_sugarcane,name_sugarcane,SOURCE";
    sql += ",distance,methode,owner,eastimate";
    sql += ",replace(replace(replace(box(ST_Buffer(geomx::geography, 20)::geometry)::text, '(', ''),'),', '|'),')','') as boxs ";
    sql += " FROM detail_farm_register_"+year_plant;
    sql += " WHERE geomx IS NOT NULL AND length(name_farmmer)::int != 0  AND zone >='301' OR zone like '%ศูนย์%' "; 

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



function find_contain()
{
   var year_plant ='60_61'; //req.body.year_plant; 

   var sql= "SELECT owner_id,location FROM detail_farm_register_"+year_plant+" WHERE owner_id::int >='19' ";

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
               // console.log('fin');
            })
        }
    });

}

function update_match_farmdetail_gpx(owner_id,gid,callback)
{
    var sql="UPDATE all_farm SET owner_id='"+owner_id+"' WHERE gid='"+gid+"' ";

    ocsb_excute(sql,db_sugarcane,function(xres)
    {
     //   console.log(xres);
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
    var year_plant =req.body.year_plant;   //'60_61'; // 
    var r = req.body;
    var ar = { 'collect_ton': r.collect_ton, 'farm_id': r.farm_id };

    var tb_name = "detail_farm_register_"+year_plant;

    var sql = squel.update()
   .table(tb_name)
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

function get_total_farm_rai(req,res)
{
    var year_plant =req.body.year_plant;   //'60_61'; // 

    var tb_name = "detail_farm_register_"+year_plant;

    get_total_farmer(function(count_farmmer)
    {

    var sql="";
    sql+="SELECT '20' as radius";
    sql+=",COUNT(c.farm_id) as count_farm";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=","+count_farmmer[0].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='20'";
    sql+=" AND zone_id='1' AND substr(qt, 0,3) IN ('27','28') ";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '40'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=","+count_farmmer[1].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='40'";
    sql+=" AND zone_id='1' AND substr(qt, 0,3) IN ('27','28') ";
    sql+=" AND c.qt NOT IN (SELECT DISTINCT c.qt";
    sql+=" FROM  master_factory_config b ,"+tb_name+" c";
    sql+=" WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL AND b.size_km='20'  AND zone_id='1' AND substr(qt, 0,3) IN ('27','28'))";
    
    sql+=" UNION ALL ";
    
    
    sql+="SELECT '60'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=","+count_farmmer[2].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='60'";
    sql+=" AND zone_id='1' AND substr(qt, 0,3) IN ('27','28')";
    sql+=" AND c.farm_id NOT IN (";
    sql+="SELECT DISTINCT c.farm_id FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='40'";
    sql+=" AND zone_id='1' AND substr(qt, 0,3) IN ('27','28') ";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '80'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=","+count_farmmer[3].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='80'";
    sql+=" AND zone_id='1' AND substr(qt, 0,3) IN ('27','28') ";
    sql+=" AND c.farm_id NOT IN (";
    sql+=" SELECT DISTINCT c.farm_id FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='60'";
    sql+=" AND zone_id='1' AND substr(qt, 0,3) IN ('27','28') ";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    
    sql+=" SELECT '100'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=","+count_farmmer[4].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='100'";
    sql+=" AND zone_id='1' AND substr(qt, 0,3) IN ('27','28')";
    sql+=" AND c.farm_id NOT IN (";
    sql+=" SELECT DISTINCT c.farm_id FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='80'";
    sql+=" AND zone_id='1' AND substr(qt, 0,3) IN ('27','28')";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '20' as radius";
    sql+=",COUNT(c.farm_id) as count_farm";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=","+count_farmmer[5].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='20'";
    sql+=" AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28') ";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '40'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=","+count_farmmer[6].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='40'";
    sql+=" AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28')";
    sql+=" AND c.qt NOT IN (SELECT DISTINCT c.qt";
    sql+=" FROM  master_factory_config b ,"+tb_name+" c";
    sql+=" WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL AND b.size_km='20'  AND zone_id='2') AND substr(qt, 0,3) NOT IN ('27','28')";
    
    sql+=" UNION ALL ";
    
    
    sql+="SELECT '60'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=","+count_farmmer[7].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='60'";
    sql+=" AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28') ";
    sql+=" AND c.farm_id NOT IN (";
    sql+="SELECT DISTINCT c.farm_id FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='40'";
    sql+=" AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28')";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '80'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=","+count_farmmer[8].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='80'";
    sql+=" AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28')";
    sql+=" AND c.farm_id NOT IN (";
    sql+=" SELECT DISTINCT c.farm_id FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='60'";
    sql+=" AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28')";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    
    sql+=" SELECT '100'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=","+count_farmmer[9].count+" as total_farmer";
    sql+=" FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='100'";
    sql+=" AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28') ";
    sql+=" AND c.farm_id NOT IN (";
    sql+=" SELECT DISTINCT c.farm_id FROM master_factory_config b ,"+tb_name+" c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='80'";
    sql+=" AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28')";
    sql+=")";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) 
    {
        
       // debugger;
      //  console.log(rows);
        var x_count_farm1 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '1' })
        .Select(function (x) { return parseInt(x.count_farm) })
        .Sum();

        var x_count_farm2 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '2' })
        .Select(function (x) { return parseInt(x.count_farm) })
        .Sum();

        var x_rai1 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '1' })
        .Select(function (x) { return parseFloat(x.rai) })
        .Sum();

        var x_rai2 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '2' })
        .Select(function (x) { return parseFloat(x.rai) })
        .Sum();

        var x_ngan1 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '1' })
        .Select(function (x) { return parseInt(x.ngan) })
        .Sum();

        var x_ngan2 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '2' })
        .Select(function (x) { return parseInt(x.ngan) })
        .Sum();

        var x_farmer1 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '1' })
        .Select(function (x) { return parseInt(x.total_farmer) })
        .Sum();

        var x_farmer2 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '2' })
        .Select(function (x) { return parseInt(x.total_farmer) })
        .Sum();

        var data_sum={'total_farm1':x_count_farm1,'total_farm2':x_count_farm2
        ,'total_rai1': x_rai1.toFixed(3),'total_rai2':x_rai2.toFixed(3)
        ,'total_ngan1':x_ngan1,'total_ngan2':x_ngan2,'total_farmer1':x_farmer1,'total_farmer2':x_farmer2
      }

      var result = { 'rows': rows, 'sum': data_sum };
      res.send(result);

    });

 });
    
}

function get_total_farmer(callback)
{

    var sql="";
    sql+="	SELECT COUNT(DISTINCT qt),'1' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL AND b.size_km='20' AND zone_id='1' AND substr(qt, 0,3) IN ('27','28')	";
            
    sql+="	UNION ALL	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'1' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL	";
    sql+="	AND b.size_km='40'	";
    sql+="	AND zone_id='1'	";
    sql+="	AND substr(qt, 0,3) IN ('27','28')	";
    sql+="	AND c.qt NOT IN (SELECT DISTINCT c.qt	";
    sql+="	FROM  master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	 WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	 AND c.geomx IS NOT NULL AND b.size_km='20'  AND zone_id='1' AND substr(qt, 0,3) IN ('27','28'))	";
            
    sql+="	UNION ALL 	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'1' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL	";
    sql+="	AND b.size_km='60'	";
    sql+="	AND zone_id='1' AND substr(qt, 0,3) IN ('27','28')	";
    sql+="	AND c.farm_id NOT IN (	";
    sql+="	SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='40'	";
    sql+="	AND zone_id='1' AND substr(qt, 0,3) IN ('27','28') )	";
            
            
    sql+="	UNION ALL 	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'1' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL	";
    sql+="	AND b.size_km='80'	";
    sql+="	AND zone_id='1' AND substr(qt, 0,3) IN ('27','28')	";
    sql+="	AND c.farm_id NOT IN (	";
    sql+="	SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='60'	";
    sql+="	AND zone_id='1' AND substr(qt, 0,3) IN ('27','28') )	";
            
            
    sql+="	UNION ALL 	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'1' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL	";
    sql+="	AND b.size_km='100'	";
    sql+="	AND zone_id='1' AND substr(qt, 0,3) IN ('27','28')	";
    sql+="	AND c.farm_id NOT IN (	";
    sql+="	SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='80'	";
    sql+="	AND zone_id='1' AND substr(qt, 0,3) IN ('27','28') )	";
            
            
    sql+="	UNION ALL 	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'2' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL AND b.size_km='20' AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28')	";
            
    sql+="	UNION ALL	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'2' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL	";
    sql+="	AND b.size_km='40'	";
    sql+="	AND zone_id='2'	";
    sql+="	AND substr(qt, 0,3) IN ('27','28')	";
    sql+="	AND c.qt NOT IN (SELECT DISTINCT c.qt	";
    sql+="	FROM  master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	 WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	 AND c.geomx IS NOT NULL AND b.size_km='20'  AND zone_id='2' AND substr(qt, 0,3) NOT IN  ('27','28'))	";
            
    sql+="	UNION ALL 	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'2' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL	";
    sql+="	AND b.size_km='60'	";
    sql+="	AND zone_id='2' AND substr(qt, 0,3) NOT IN  ('27','28')	";
    sql+="	AND c.farm_id NOT IN (	";
    sql+="	SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='40'	";
    sql+="	AND zone_id='2' AND substr(qt, 0,3) NOT IN  ('27','28') )	";
            
            
    sql+="	UNION ALL 	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'2' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0)	";
    sql+="	AND c.geomx IS NOT NULL	";
    sql+="	AND b.size_km='80'	";
    sql+="	AND zone_id='2' AND substr(qt, 0,3) NOT IN  ('27','28')	";
    sql+="	AND c.farm_id NOT IN (	";
    sql+="	SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='60'	";
    sql+="	AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28') )	";
            
            
    sql+="	UNION ALL 	";
            
    sql+="	SELECT COUNT(DISTINCT qt),'2' as zone_id	";
    sql+="	FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) 	";
    sql+="	AND c.geomx IS NOT NULL	";
    sql+="	AND b.size_km='100'	";
    sql+="	AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28')	";
    sql+="	AND c.farm_id NOT IN (	";
    sql+="	SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c	";
    sql+="	    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='80'	";
    sql+="	AND zone_id='2' AND substr(qt, 0,3) NOT IN ('27','28'))	";
    
    ipm.db.dbname = db_sugarcane;
    nrows(sql,db_sugarcane,function  (rows){ 
      //  debugger;
      //  console.log(rows);
        callback(rows);
        return;
     });
}



//++++++++++++++++++++++++++++++++++++ Recive images ++++++++++++++++++++++
//https://www.base64-image.de/  img 2 base64
//https://codebeautify.org/base64-to-image-converter

function retrive_image_km_addfarm(req, res)
{
    debugger;
    var b = req.body;

    var ar ={'farm_id':b.farm_id,'details':b.details,'year_plant':b.year_plant
    ,'project_type':b.project_type,'base64':b.photo,'imei':b.imei,'image_name':b.image_name};


     var sql_insrt = squel.insert()
    .into('detail_farm_picture')
    .set('farm_id', ar.farm_id)
    .set('idate', utcp.now())
    .set('details', ar.details)
    .set('year_plant', ar.year_plant)
    .set('project_type', ar.project_type)
    .set('image_data', ar.base64)
   // .set('image_name', ar.image_name)
    .set('imei', ar.imei)
    .toString();

    ocsb_excute(sql_insrt,db_sugarcane,function(xres)
    {
       res.send(xres);
    })
    
}

function get_last_pic_by_farmid(req, res)
{
      var b = req.body;

    var ar ={'farm_id':b.farm_id,'year_plant':b.year_plant,'project_type':b.project_type};

    var sql= "SELECT image_base64 FROM detail_farm_picture WHERE "
    sql+= " farm_id ="+utl.sqote(ar.farm_id)+" AND year_plant ="+utl.sqote(ar.year_plant)+" AND project_type ="+utl.sqote(ar.project_type)+" ORDER BY idate DESC LIMIT 1;";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });

}

function prepare_array2geo2text(arr,name_tb,farm_id,callback)
{
    //SELECT ST_GeomFromText('POLYGON((-71.1776585052917 42.3902909739571,-71.1776820268866 42.3903701743239,-71.1776585052917 42.3902909739571))');
     //var arr = [[13.5675835,100.6438525],[13.5675835,100.6438525],[13.5675835,100.6438525]];
    var result =''
      async.eachSeries(arr, function (row, next)
     {
       
        result += row[1]+' '+row[0]+','

        next();
     },function(){
        result = result+arr[0][1]+' '+arr[0][0];
         //result = utl.iRmend(result);
        var final ="ST_GeomFromText('POLYGON(("+result+"))')";
     var sql ="SELECT (st_area(geomx::geography)/1600) as area FROM "+name_tb+" WHERE farm_id="+utl.sqote(farm_id)+" LIMIT 1";
       // console.log(final);
       var res={'area':0,'arr_area':''}
       nrows(sql,db_sugarcane,function  (rows)
       { 
           if(rows.length>0)
           {
             res.area = rows[0].area;
             res.arr_area = final;
             callback(res);
             return;
           }else{
            res.arr_area = final;
            callback(res);
            return;
           }
          
    
        });
       
     })
}

function prepare_array2geo2text2(arr,name_tb,farm_id,callback)
{
    //SELECT ST_GeomFromText('POLYGON((-71.1776585052917 42.3902909739571,-71.1776820268866 42.3903701743239,-71.1776585052917 42.3902909739571))');
     //var arr = [[13.5675835,100.6438525],[13.5675835,100.6438525],[13.5675835,100.6438525]];
     if(arr.length>0)
     {
        arr =  arr[0];
        var result =''
        for(var i=0;i<arr.length;i++)
        {
            result +=  arr[i][0]+' '+arr[i][1]+','
        }
    
        result = utl.iRmend(result);
          // result = result+arr[0][0];
    
       // console.log(result);
    
        var final ="ST_GeomFromText('POLYGON(("+result+"))')";
        var sql ="SELECT (st_area(geomx::geography)/1600) as area FROM "+name_tb+" WHERE farm_id="+utl.sqote(farm_id)+" LIMIT 1";
          // console.log(final);
          var res={'area':0,'arr_area':''}
          nrows(sql,db_sugarcane,function  (rows)
          { 
              if(rows.length>0)
              {
                res.area = rows[0].area;
                res.arr_area = final;
                callback(res);
                return;
              }else{
               res.arr_area = final;
               callback(res);
               return;
              }
             
       
           });
     }else{
        res.arr_area = []
        callback(res);
        return;
     }


    /*
      async.eachSeries(arr, function (row, next)
     {
       debugger;
      //  result += row[0]+' '+row[1]+','

        next();
     },function(){
      //  result = result+arr[0][1]+' '+arr[0][0];
         //result = utl.iRmend(result);
       
       
     })
     */
}



function set_track_farm(req, res)
{
   
    debugger
  //data test = create_area
 
   var b = req.body.data;

 // gentxt.build_text('data_set_track_farm.txt',JSON.stringify(b));

    var year_plant = b.year_plant; //  '60_61'; //
    var name_tb = set_tbname(year_plant);
    var step1 = false;
 

   prepare_array2geo2text(b.area,name_tb,b.farm_id,function(result_geox)
   {
      b.arr_area = result_geox.arr_area;
      b.area = result_geox.area;

     var ar ={'name_farmmer':b.farm_name,'qt':b.quota,'farm_id':b.farm_id,'zone':b.zone
    ,'home':b.district,'tambon':b.tambon,'aumpher':b.aumpher,'province':b.province,'area':b.area
    ,'type_ground':b.type_ground,'type_sugarcane':b.type_sugarcane,'name_sugarcane':b.name_sugarcane
    ,'source':b.source,'dateplant':b.date_grow,'distance':b.distance,'methode':b.methode,'owner':b.owner
    ,'eastimate':b.eastimate,'icolour_code':b.status_farm_id,'type_project':b.status_farm,'year_plant':b.year_plant
    ,'owner':b.owner ,'geomx': b.arr_area };

    var ar2 ={'farm_id':b.farm_id,'year_plant':b.year_plant ,'project_type':b.status_farm};

    if(ar.tambon===undefined)
    {
        var lon = b.lon;
        var lat = b.lat;
        call_adminPoint(lon,lat,function(xrow)
        {
            if(xrow.length>0)
            {
                ar.tambon = xrow[0].prov_tname;
                ar.aumpher = xrow[0].prov_tname;
                ar.province = xrow[0].prov_tname;
                ar.icolour_code = ar.icolour_code === undefined ? '1' : ar.icolour_code;
                step1 = true;
                process_step1();
            }
            else
            {
                ar.tambon = '';
                ar.aumpher = '';
                ar.province = '';
                step1 = true;
                ar.icolour_code = ar.icolour_code === undefined ? '1' : ar.icolour_code;
                process_step1();
            }
        });
    }


 

    debugger;

   // 

    /**/

    function process_step1()
    {
        if(step1==true)
        {
            var sql=" INSERT INTO "+name_tb+" (name_farmmer, farm_id, qt, zone, home, tambon, aumpher, province"
            sql+=", area, type_ground, type_sugarcane, name_sugarcane, source, xdate, distance, methode, owner, geomx"
            sql+=", eastimate, icolour_code, type_project, idate) VALUES "
             sql +=" ("+utl.sqote(ar.name_farmmer)
             sql +=","+utl.sqote(ar.farm_id)
             sql +=","+utl.sqote(ar.qt)
             sql +=","+utl.sqote(ar.zone)
             sql +=","+utl.sqote(ar.home)
             sql +=","+utl.sqote(ar.tambon)
             sql +=","+utl.sqote(ar.aumpher)
             sql +=","+utl.sqote(ar.province)
             sql +=","+utl.sqote(ar.area)
             sql +=","+utl.sqote(ar.type_ground)
             sql +=","+utl.sqote(ar.type_sugarcane)
             sql +=","+utl.sqote(ar.name_sugarcane)
             sql +=","+utl.sqote(ar.source)
             sql +=","+utl.sqote(ar.dateplant)
             sql +=","+utl.sqote(ar.distance)
             sql +=","+utl.sqote(ar.methode)
             sql +=","+utl.sqote(ar.owner)
             sql +=","+ ar.geomx
             sql +=","+utl.sqote(ar.eastimate)
             sql +=","+utl.sqote(ar.icolour_code)
             sql +=","+utl.sqote(ar.type_project)
             sql +=","+utl.sqote(utcp.now())
             sql +=")"

            ocsb_excute(sql,db_sugarcane,function(xres)
            {
                if(xres !=null)
                {
        
                    var xphoto  = utl.replaceAll('data:image/jpeg;base64,','',b.photo)
        
                    var sql2 =" INSERT INTO detail_farm_picture (farm_id,idate,year_plant,project_type,image_data)  "
                    sql2 +=" values ("+utl.sqote(ar2.farm_id)
                    sql2 +=","+utl.sqote(utcp.now())
                    sql2 +=","+utl.sqote(ar2.year_plant)
                    sql2 +=","+utl.sqote(ar2.project_type)
                    sql2 +=",decode('"+xphoto+"', 'base64')"
                    sql2 +=")"
        
                   //  gentxt.build_text('data_detail_farm_picture.txt',sql2);
                    
                     
                    ocsb_excute(sql2,db_sugarcane,function(xres)
                    {
                        if(xres !=null)
                        {
                          //  console.log(' kum set_track_farm '+xres)

                            
                            res.send(true);
                        }
                        else
                        {
                            res.send('OK');
                        }
                    });
                  
        
                }
                else
                {
                     res.send('OK');
                }
                
            
            });
        }
        
    }


   })

}

function set_activity_details(req, res)
{
    /**/

 var b = req.body.data;
  var ar ={'year_plant':b.year_plant,'type_sugarcane':b.type_sugarcane
  ,'activity':b.activity,'details':b.details,'lon':b.lon,'lat':b.lat //,'pic_data':b.pic_data
  };

  //gentxt.build_text('data_set_activity_details.txt',JSON.stringify(b));


  debugger;
 // var  data = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/';

  //  b.pic_data =utl.replaceAll('data:image/jpeg;base64,','',data)
   var ddd  = utl.replaceAll('data:image/jpeg;base64,','',b.photo)


     var sql= " INSERT INTO activity_details (year_plant,type_sugarcane,activity,details,lon,lat,pic_data,idate) ";
      sql +=" VALUES("+utl.sqote(ar.year_plant)+","+utl.sqote(ar.type_sugarcane)+" "
      sql +=" ,"+utl.sqote(ar.activity)+","+utl.sqote(ar.details)+","+utl.sqote(ar.lon)+","+utl.sqote(ar.lat)+" ";
      sql +=" ,decode('"+ddd+"', 'base64')"
      sql +=" ,now() ) ";

    //  gentxt.build_text('data_activit.txt',sql);

      /*  */
   ocsb_excute(sql,db_sugarcane,function(xres)
   {
        if(xres ==true)
        {
          //  console.log(' kum set_activity_details '+xres)
            res.send(true);
        }
        else
        {
            res.send('OK');
        }
    })
  
}

function set_detail_farm_register(req, res)
{
    var year_plant = req.body.year_plant;   //'60_61'; // 
  
    var r = req.body;
    var ar = {  'farm_id': r.farm_id,'type_ground': r.type_ground,'name_sugarcane':r.name_sugarcane
    ,'source':r.source,'distance':r.distance,'methode':r.methode,'owner':r.owner,'eastimate':r.eastimate
    ,'icolour_code':r.icolour_code,'type_sugarcane':r.type_sugarcane
     };
    
  /*
     var ar = {  'farm_id': "11113062002",'type_ground': "ร่วนปนทราย",'name_sugarcane':"ขอนแก่น3"
     ,'source':"0",'distance':'1.2 m','methode':"เครื่องปลูก",'owner':"เจ้าของ",'eastimate':'10'
     ,'icolour_code':'1'
      }; */

    var tb_name = "detail_farm_register_"+year_plant;

    var sql = squel.update()
   .table(tb_name)
   .set("type_ground", ar.type_ground)
   .set("type_sugarcane", ar.type_sugarcane)
   .set("name_sugarcane", ar.name_sugarcane)
   .set("source", ar.source)
   .set("distance", ar.distance)
   .set("methode", ar.methode)
   .set("owner", ar.owner)
   .set("eastimate", ar.eastimate)
   .set("icolour_code", ar.icolour_code)
   .where('farm_id = ' + utl.sqote(ar.farm_id))
   .toString();

    ipm.db.dbname = db_sugarcane;
    db.excute(ipm, sql, function (is_ok) 
    {
        debugger;
        if (is_ok == 'oK') 
        {
            res.json({ success: true, message: 'Complete set detail_farm_register.' });
        }
        else 
        {
             res.json({ success: false, message: 'UnComplete set detail_farm_register.' });
        }
    });
}

//+++++++++++++++++++++++++++++++++++++++ detail farm ++++++++++++++++++++++

function list_name_farmer(req,res)
{
   var sql= "SELECT DISTINCT name FROM farmer_details WHERE name !='สหกรณ์การเกษตรโนนสะอาด จำกัด' ORDER BY name DESC";
   nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}


function list_qt(req,res)
{
    var year_plant =req.body.year_plant; //  '60_61'; //

   var sql= "SELECT DISTINCT qt,_0getname_farmmer(qt) as name_farmer,_0getfarm_id(qt) as farmid FROM "+set_tbname(year_plant)+" ORDER BY qt ASC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_name_farmer_by_qt(req,res)
{
    var year_plant =req.body.year_plant; //  '60_61'; //
    var qt= req.body.qt; //'28005190' //
    var sql=" SELECT name_farmmer,farm_id FROM "+set_tbname(year_plant)+"  WHERE qt="+utl.sqote(qt)+" ORDER BY farm_id DESC LIMIT 1";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function get_maxfarm_id(req,res)
{
    var year_plant =req.body.year_plant; //  '60_61'; //
    var qt=req.body.qt; //'15021003' //

   var sql= "SELECT COALESCE('"+qt+"'||LPAD((right(max(farm_id),3)::int+1)::text, 3, '0'),'N-0000') as max_qt  FROM "+set_tbname(year_plant)+" WHERE qt="+utl.sqote(qt);
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_zone(req,res)
{
    var year_plant =req.body.year_plant; //  '60_61'; //

   var sql= "SELECT DISTINCT TRIM(zone) as zone FROM "+set_tbname(year_plant)+" ORDER BY TRIM(zone) ASC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}


function get_location(req,res)
{
     var lat=req.body.lat;
     var lon=req.body.lon;

    call_adminPoint(lon,lat,function(xrow)
    {
        if(xrow.length>0)
        {
            var ress=[];
            ress.push({'tambon':xrow[0].tam_tname,'aumpher':xrow[0].amp_tname,'province':xrow[0].prov_tname});
            res.send(ress);
        }else{
             var ress=[];
             ress.push({'tambon':'','aumpher':'','province':''});
            res.send(ress);
        }
    })
}


function list_area(req,res)
{
    var year_plant =req.body.year_plant; //  '60_61'; //  

   var sql= "SELECT DISTINCT area FROM "+set_tbname(year_plant)+" ORDER BY area ASC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_type_ground(req,res)
{
    var year_plant =req.body.year_plant; //  '60_61'; // 

   var sql= "SELECT DISTINCT TRIM(type_ground) as type_ground FROM "+set_tbname(year_plant)+" ORDER BY TRIM(type_ground) DESC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}


function list_type_sugarcane(req,res)
{
   var year_plant =req.body.year_plant; //  '60_61'; //

   var sql= "SELECT DISTINCT type_sugarcane FROM "+set_tbname(year_plant)+" ORDER BY type_sugarcane DESC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_name_sugarcane(req,res)
{
   var year_plant =req.body.year_plant; //  '60_61'; // 

   var sql= "SELECT DISTINCT TRIM(name_sugarcane) as name_sugarcane FROM "+set_tbname(year_plant)+" ORDER BY TRIM(name_sugarcane) DESC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_source(req,res)
{
   var year_plant =req.body.year_plant; //  '60_61'; //  

   var sql= "SELECT DISTINCT source FROM "+set_tbname(year_plant)+" ORDER BY source DESC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_distance(req,res)
{
   var year_plant =req.body.year_plant; //  '60_61'; //  

   var sql= "SELECT DISTINCT TRIM(distance) as distance FROM "+set_tbname(year_plant)+" ORDER BY TRIM(distance) ASC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_methode(req,res)
{
   var year_plant =req.body.year_plant; //  '60_61'; // 

   var sql= "SELECT DISTINCT TRIM(methode) as methode FROM "+set_tbname(year_plant)+" ORDER BY TRIM(methode) DESC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}


function list_owner(req,res)
{
   var year_plant =req.body.year_plant; //  '60_61'; //  

   var sql= "SELECT DISTINCT TRIM(OWNER) as owner FROM "+set_tbname(year_plant)+" ORDER BY TRIM(OWNER) DESC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_eastimate(req,res)
{
   var year_plant =req.body.year_plant; //  '60_61'; // 

   var sql= "SELECT DISTINCT TRIM(eastimate)as eastimate FROM "+set_tbname(year_plant)+" ORDER BY TRIM(eastimate) ASC";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_status_farm(req,res)
{ //||'อ้อย'|| ||COALESCE(type_sugar,'') 
    var sql= "SELECT id,name_colour_th as type_sugar,colour,id_group,(SELECT group_name_th FROM group_status_farm WHERE id=id_group::int) as headers FROM icolour_status ORDER BY id";
     nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_farm_id(req,res)
{
    var year_plant = req.body.year_plant; //  '60_61'; // 
    var sql= " SELECT DISTINCT farm_id FROM "+set_tbname(year_plant)
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_ms_yearplant(req,res)
{
   var sql= "SELECT year_plant_key,year_plant_val FROM ms_yearplant";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}


function list_ms_type_sugarcane(req,res)
{
   var sql= "SELECT id,name_th as type_val,name_en as type_key FROM ms_type_sugarcan";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_ms_activity(req,res)
{
   var sql= "SELECT id as act_key,activity_th as act_val FROM ms_activity";
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}


function set_tbname(year_plant)
{
   var tb_name = "detail_farm_register_"+year_plant;
     return tb_name;
}

function list_vehicle_name(req,res)
{
    var result={'modem_id':'1010001002','vehicle_name':'รถทดสอบ1'};
    var xres =[];
    xres.push(result);
    res.send(xres);
}

function report_group_activity(req,res)
{


    var year_plant = req.body.year_plant; // '60_61'; //  

    var sql=""; 
    
    sql+=" SELECT COUNT (DISTINCT farm_id) "
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai ";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton "
    sql+=",_0getstatus_farm(icolour_code) as name_status "
    sql+=" ,_0getstatus_name_th(_0getid_group(icolour_code)) as group";
    sql+=" ,_0getcolour(icolour_code) as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='3' "
    sql+=" GROUP BY icolour_code "

    sql+=" UNION ALL ";

    sql+=" SELECT COUNT (DISTINCT farm_id) "
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai ";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton "
    sql+=",_0getstatus_farm(icolour_code) as name_status "
    sql+=" ,_0getstatus_name_th(_0getid_group(icolour_code)) as group";
    sql+=" ,_0getcolour(icolour_code) as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='4' "
    sql+=" GROUP BY icolour_code "

    sql+=" UNION ALL ";

    sql+=" SELECT COUNT (DISTINCT farm_id) "
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai ";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton "
    sql+=",_0getstatus_farm(icolour_code) as name_status "
    sql+=" ,_0getstatus_name_th(_0getid_group(icolour_code)) as group";
    sql+=" ,_0getcolour(icolour_code) as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='5' "
    sql+=" GROUP BY icolour_code "

    sql+=" UNION ALL ";

    sql+=" SELECT COUNT (DISTINCT farm_id) "
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai ";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton "
    sql+=",_0getstatus_farm(icolour_code) as name_status "
    sql+=" ,_0getstatus_name_th(_0getid_group(icolour_code)) as group";
    sql+=" ,_0getcolour(icolour_code) as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='7' "
    sql+=" GROUP BY icolour_code "

    sql+=" UNION ALL ";

    sql+=" SELECT COUNT (DISTINCT farm_id) "
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai ";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton "
    sql+=",_0getstatus_farm(icolour_code) as name_status "
    sql+=" ,_0getstatus_name_th(_0getid_group(icolour_code)) as group";
    sql+=" ,_0getcolour(icolour_code) as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='6' "
    sql+=" GROUP BY icolour_code "


    sql+=" UNION ALL ";

    sql+=" SELECT COUNT (DISTINCT farm_id) "
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai ";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton "
    sql+=",_0getstatus_farm('8') as name_status "
    sql+=" ,_0getstatus_name_th(_0getid_group('8')) as group";
    sql+=" ,_0getcolour('8') as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='8' OR icolour_code IS NULL "


    sql+=" UNION ALL ";

    sql+=" SELECT COUNT (DISTINCT farm_id) "
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai ";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton "
    sql+=",_0getstatus_farm(icolour_code) as name_status "
    sql+=" ,_0getstatus_name_th(_0getid_group(icolour_code)) as group";
    sql+=" ,_0getcolour(icolour_code) as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='1' "
    sql+=" GROUP BY icolour_code "
    
    sql+=" UNION ALL ";
    
    sql+="SELECT COUNT (DISTINCT farm_id)";
    sql+=",SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton";
    sql+=" ,_0getstatus_farm(icolour_code) as name_status";
    sql+=" ,_0getstatus_name_th(_0getid_group(icolour_code)) as group";
    sql+=" ,_0getcolour(icolour_code) as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='2' ";
    sql+=" GROUP BY icolour_code ";
    
    sql+=" UNION ALL ";
    
    sql+=" SELECT COUNT (DISTINCT farm_id) ";
    sql+=" ,SUM(ROUND((st_area(geomx::geography)/1600)::numeric,3)) as rai";
    sql+=" ,SUM(COALESCE(icollect_ton,0)) as collec_ton";
    sql+=" ,_0getstatus_farm(icolour_code) as name_status";
    sql+=" ,_0getstatus_name_th(_0getid_group(icolour_code)) as group";
    sql+=" ,_0getcolour(icolour_code) as colour "
    sql+="  FROM "+set_tbname(year_plant)
    sql+=" WHERE icolour_code='5' ";
    sql+=" GROUP BY icolour_code ";
    
    nrows(sql,db_sugarcane,function  (rows)
    { 
        if(rows.length>0)
        {
            res.send(rows);
        }
    });

}

//++++++++++++++++++++++++  Add User ++++++++++++++++++++++++++++++++++++++++++++

function encode_pws(pws, callback)
{
    bcrypt.hash(pws, null, null, function (err, hash) {
        // Store hash in your password DB.
        //console.log(hash);
        callback(hash);
        return;
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

function list_user(req,res)
{
   var sql = "SELECT id,username,factory_id,role_id FROM users_login";
   nrows(sql,db_sugarcane,function  (rows)
   { 
       if(rows.length>0)
       {
           res.send(rows);
       }
   });

}

function add_user(req,res)
{
    var b = req.body;
    
    var ar ={'username':b.username,'password':b.password,'factory_id':b.factory_id,'role_id':b.role_id};
    
    encode_pws(ar.password,function(res_pws)
    {
        ar.password = res_pws;

        var sql_insrt = squel.insert()
        .into('users_login')
        .set("username", ar.username)
        .set("password", ar.password)
        .set("factory_id", ar.factory_id)
        .set("role_id", ar.role_id)
        .toString();
     
    

        ocsb_excute(sql_insrt,db_sugarcane,function(xres)
        {
        
         
         var  sql =  "SELECT MAX(id) as max_id FROM users_login";

         nrows(sql,db_sugarcane,function  (rows)
         { 
             if(rows.length>0)
             {
                var result = {success: true, id:rows[0].max_id };
                    res.send(result);
             }else{
              
                var result = {success: false, id:'0' };
                res.send(result);
             }
         });

        })
    })

   
}

function set_user(req,res)
{
    var b = req.body;
    
    var ar ={'id':b.id,'username':b.username,'password':b.password,'factory_id':b.factory_id,'role_id':b.role_id};
    
    encode_pws(ar.password,function(res_pws)
    {
        ar.password = res_pws;

        var sql_update = squel.update()
        .table('users_login')
        .set("username", ar.username)
        .set("password", ar.password)
        .set("factory_id", ar.factory_id)
        .set("role_id", ar.role_id)
        .where('id = ' + utl.sqote(ar.id))
        .toString();
     
        ocsb_excute(sql_update,db_sugarcane,function(xres)
        {
           res.send(xres);
        })
    })
}

function del_user(req,res)
{
   var id = req.body.id;

   var sql = "DELETE FROM users_login WHERE id="+utl.sqote(id);
   ocsb_excute(sql,db_sugarcane,function(xres)
   {
      res.send(xres);
   })
}


function get_login_kmp_ksp(req, res)
{
    debugger;

    var user = req.body.user;
    var pwd = req.body.pass;

    //var token = jwt.sign(user, key, {
    //    expiresInMinutes: 1440 // expires in 24 hours
    //});

      //  var user = 'hydac'
  //  var pwd = '1234';

    var sql = "SELECT id,password as hash,token,get_rolename(role_id::int) as role  FROM users_login WHERE username=" + utl.sqote(user);//+ " AND password=" + utl.sqote(pwd);
    ipm.db.dbname = db_sugarcane;
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
                            fleetname: 'kmp',
                            fleetid: 'db_10011',
                            role: rows[0].role,
                            token: token,
                            id:rows[0].id

                        };

                        var sql = "UPDATE users_login SET token=" + utl.sqote(token) + " WHERE id=" + utl.sqote(rows[0].id) + ";";
                        ipm.db.dbname = db_sugarcane;
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

function list_factory(req,res)
{
   var sql = "SELECT id,factory_name,factory_code FROM ms_factory_login ";
   nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function list_role(req,res)
{
   var sql = "SELECT id,role_name FROM ms_role ";
   nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function get_picture(req,res)
{
    var id = req.body.id;
    var sql=" SELECT project_type,details,idate(idate) as img_name,encode(image_data::bytea, 'base64')  as img_base64 ";
    sql+=" FROM detail_farm_picture WHERE id="+utl.sqote(id);

    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function Isauthenticate(req, res,next)
{
    debugger;
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token)
    {
        // verifies secret and checks exp
        //var key ='hangman' 
        //App.{get}('jwtTokenSecret')
        jwt.verify(token, jwtTokenSecret, function (err, decoded) {
            if (err) {
                if (err.message == 'jwt expired') {
                    //  res.end('Access token has expired', 400);
                    return res.json({ success: false, message: 'Access token has expired' });
                }
                else {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                }
            }
            else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    }
    else
    {

        if (req.originalUrl == '/api/get_login')//'/api/authenticate'
        {
            next();
        }
        else
        {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }

    }
}


function get_logout_kmp_ksp(req, res)
{
    var id = req.body.id;
        debugger;
        // console.log('tracking_realtime ' + req.body.fleetid);
 
    var sql = "UPDATE users_login SET token='' WHERE id=" + utl.sqote(id) + ";";
     ipm.db.dbname = db_sugarcane;
        db.excute(ipm, sql, function (is_ok) {
        res.json({ success: true, message: 'Completed logout.' });
     });
    
   
}


//+++++++++++++++++++++++++++++++++++ Report History ++++++++++++++++++++++++++++

function has_table(modem_id,db_name,callback)
{
    /*
    SELECT EXISTS (
   SELECT 1
   FROM   information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name = 'ht_142181053379'
   );
    */

  var sql="  SELECT EXISTS ( ";
  sql+="  SELECT 1 ";
  sql+="  FROM   information_schema.tables ";
  sql+="  WHERE  table_schema = 'public' ";
  sql+="  AND    table_name = 'ht_"+modem_id+"' ";
  sql+="  ) ";

  ipm.db.dbname = db_name;
  db.get_rows(ipm, sql, function (res_db)
  {
      debugger;
      //  console.log(res_db[0].exists)
        callback(res_db[0].exists)
        return;
  });

}

function report_driving_history(req,res)
{ //2017-11-26 00:00 - 2017-11-27 23:59d
 
    var modem_id=req.body.modem_id; // '1110011082';//
    var start_date =req.body.start_date; //'2017-12-01 07:53:38' //'2017-11-26 00:00';//
    var end_date =req.body.end_date; //'2017-12-02 12:21:38' //'2017-11-27 23:59';//
   /*
    //ht_14218
 
 
 
    var modem_id='1110011064';//'1110011082';//req.body.modem_id; // '1110011082';//
    var start_date ='2019-12-16 10:00' //req.body.start_date; //'2017-12-01 07:53:38' //'2017-11-26 00:00';//
    var end_date ='2019-12-16 13:30' //req.body.end_date; //'2017-12-02 12:21:38' //'2017-11-27 23:59';//
 */

 var sql ='';var is_vt900 =false;

  if(utl.StartsWith(modem_id, '14218'))
  {

    has_table(modem_id,db_owner,function(resx)
    {
        sql +="SELECT idate(gps_datetime) as gps_datetime,lon,lat,speed ";
        //sql +=",message_id,analog_input1,analog_input2 ";
        sql +=",tambol, etambol, amphur,eamphur, province, eprovince";
        sql +=",tambol||':'||amphur||':'||province as loc_th ";
        sql +=",etambol||':'||eamphur||':'||eprovince as loc_en ";
        sql +=",status,status||'_'||angle as heading,mileage ";
        sql +=" FROM ht_"+modem_id;
        sql +=" WHERE gps_datetime >="+utl.sqote(start_date);
        sql +=" AND gps_datetime <="+utl.sqote(end_date);
        sql +=" AND satelites >'0' ORDER BY gps_datetime ASC ";

        if(resx==false)
        {
            is_vt900 = true;
            db_owner=db_owner_slave;
            xfinal();
       
        }else{
            is_vt900 = true;
            xfinal();
        }
       
    })


  }
  else
  {
    has_table(modem_id,db_owner,function(resx)
    {
    sql +="SELECT idate(gps_datetime) as gps_datetime,lon,lat,speed ";
    //sql +=",message_id,analog_input1,analog_input2 ";
    sql +=",tambol, etambol, amphur,eamphur, province, eprovince";
    sql +=",status,status||'_'||angle as heading,mileage ";
    sql +=",tambol||':'||amphur||':'||province as loc_th ";
    sql +=",etambol||':'||eamphur||':'||eprovince as loc_en ";
    sql +=" FROM ht_"+modem_id;
    sql +=" WHERE gps_datetime >="+utl.sqote(start_date);
    sql +=" AND gps_datetime <="+utl.sqote(end_date);
    sql +=" AND satelites >'0'  AND message_id !='11' ORDER BY gps_datetime ASC";
    //AND message_id !='2'

        if(resx==false)
        {
           // is_vt900 = true;
            db_owner=db_owner_slave;
            xfinal();
    
        }else{
           // is_vt900 = true;
            xfinal();
        }
    })
     
  }


 // sql +="  SELECT row_number() OVER (ORDER BY gps_datetime) as id ";


  var sql2 ='';
  sql2 +="( SELECT 'trip' as row ,SUM(distance) as distance_gps ";
  sql2 +=",SUM(timeuse) as duration_gps ";
  sql2 +=",idate(min(start_date)) as start_date, idate(max(end_date)) as end_date";
  sql2 +=",MIN(start_loc_th) as start_loc_th ,MAX(end_loc_th) as end_loc_th";
  sql2 +=",MIN(start_loc_en) as start_loc_en,MAX(end_loc_en) as end_loc_en";
  sql2 +=",min(start_mile) as start_mile,max(end_mile) as end_mile ";
  sql2 +=" FROM rp_trip"; 
  sql2 +=" WHERE modem_id="+utl.sqote(modem_id)
  sql2 +=" AND start_date >="+utl.sqote(start_date);
  sql2 +=" AND end_date <="+utl.sqote(end_date);
  sql2 +=" )";

  /*
    var sql2 ='';
    sql2 +="(SELECT 'trip' as row ,distance as distance_gps,timeuse as duration_gps ";
    sql2 +=",start_mile,end_mile ";
    sql2 +=",idate(start_date) as start_date, idate(end_date) as end_date";
    sql2 +=",start_loc_th,end_loc_th ";
    sql2 +=",start_loc_en,end_loc_en ";
    sql2 +=" FROM rp_trip"; 
    sql2 +=" WHERE modem_id="+utl.sqote(modem_id)
    sql2 +=" AND start_date >="+utl.sqote(start_date);
    sql2 +=" AND end_date <="+utl.sqote(end_date);
    sql2 +=" ORDER BY timeuse DESC LIMIT 1) UNION ALL ";

    sql2 +="(SELECT 'parking' as row ,distance as distance_gps,timeuse as duration_gps ";
    sql2 +=",start_mile,end_mile ";
    sql2 +=",idate(start_date) as start_date, idate(end_date) as end_date ";
    sql2 +=",start_loc_th,end_loc_th ";
    sql2 +=",start_loc_en,end_loc_en ";
    sql2 +=" FROM rp_parking"; 
    sql2 +=" WHERE modem_id="+utl.sqote(modem_id)
    sql2 +=" AND start_date >="+utl.sqote(start_date);
    sql2 +=" AND end_date <="+utl.sqote(end_date);
    sql2 +=" ORDER BY timeuse DESC LIMIT 1) UNION ALL ";

    sql2 +="(SELECT 'idleling' as row ,'0' as distance_gps,timeuse as duration_gps ";
    sql2 +=",'0' as start_mile,'0' as end_mile ";
    sql2 +=",idate(start_date) as start_date, idate(end_date) as end_date ";
    sql2 +=",start_loc_th,end_loc_th ";
    sql2 +=",start_loc_en,end_loc_en ";
    sql2 +=" FROM rp_idleling"; 
    sql2 +=" WHERE modem_id="+utl.sqote(modem_id)
    sql2 +=" AND start_date >="+utl.sqote(start_date);
    sql2 +=" AND end_date <="+utl.sqote(end_date);
    sql2 +=" ORDER BY timeuse DESC LIMIT 1) ";
   
*/

  var step1_finish = false;
  var step2_finish = false;
  var details={'rows':'','sum':'','speed_max':'','distance_google':'','duration_google':''};

  /*  */
  var _sum={
    "row":'', 'speed_max':'', 'distance_gps':'', 'duration_gps':'','start_mile':'','end_mile':''
   ,'start_date':'','end_date':'','start_loc_th':'','end_loc_th':''
   ,'start_loc_en':'','end_loc_en':'','distance_google':'','duration_google':''
  }


  function xfinal()
  {
    nrows(sql,db_owner,function  (rows)
    { 
        if(rows.length>0)
        {
          step1_finish = true;
          
               var speed_max = linq.Enumerable.From(rows)
                .Select(function (x) { return parseInt(x.speed) })
                .Max();
  /*
                var mileage_max = linq.Enumerable.From(rows)
                .Select(function (x) { return parseFloat(x.mileage) })
                .Max();
  
                var mileage_min = linq.Enumerable.From(rows)
                .Select(function (x) { return parseFloat(x.mileage) })
                .Min();
                */
               var count = rows.length -1;
  
                var mileage_min =  parseFloat( rows[0].mileage );
                var mileage_max =  parseFloat( rows[count].mileage );
  
              //  console.log(' mileage report_driving_history '+mileage_max-mileage_min);
  
              var resdistance = (mileage_max - mileage_min).toFixed(2);

    
          
          
              var source = rows[0].lat+','+rows[0].lon;//"17.6326460,102.6905040";
              var destination= rows[count].lat+','+rows[count].lon; //"16.80101,102.77213";
          
          //    get_distance_direction(source,destination,function(xresult)
          //    {
                  //{'distance':xdistance,'duration':xduration}
                 // debugger;
                 details.rows = rows;

                 if(is_vt900)
                 {
                    details.distance_google = resdistance +' km';//xresult.distance;
                    //  details.duration_google = xresult.duration;
                      details.speed_max = speed_max;
                     _sum.row = "trip";
                     _sum.distance_gps  = resdistance +' km';
                     _sum.start_date = rows[0].gps_datetime;
                     _sum.end_date = rows[count].gps_datetime;

                     var time_use = irp.diff_min(_sum.start_date, _sum.end_date); 
                     _sum.duration_gps  = hpt.min2hhmm(time_use);
                     _sum.start_mile = mileage_min;
                     _sum.end_mile = mileage_max;
           
                     _sum.start_loc_th = rows[0].loc_th;
                     _sum.end_loc_th = rows[count].loc_th;
                     _sum.start_loc_en =  rows[0].loc_en;
                     _sum.end_loc_en =  rows[count].loc_en;
                     _sum.speed_max = speed_max;

                     var ds=[];
                     ds.push(_sum);
                     details.sum =  ds;
                     step2_finish = true;
                     db_owner= 'db_10011';
                     final_report_driving_history();

                 }
                 else
                 {
                    nrows(sql2,db_config,function  (xrows)
                    { 
                        debugger;
                        
                        if(xrows[0].duration_gps !=null)
                        {
                            /*  */
                            rows = xrows[0];
                            details.distance_google = resdistance +' km';//xresult.distance;
                          //  details.duration_google = xresult.duration;
                            details.speed_max = speed_max;
                           _sum.row = "trip";
                           _sum.distance_gps  = resdistance +' km';
                           _sum.duration_gps  = hpt.min2hhmm(rows.duration_gps);

                           _sum.start_mile = mileage_min;
                           _sum.end_mile = mileage_max;

                           _sum.start_date = details.rows[0].gps_datetime;
                           _sum.end_date = details.rows[count].gps_datetime;
                           _sum.start_loc_th = details.rows[0].loc_th;
                           _sum.end_loc_th = details.rows[count].loc_th;
                           _sum.start_loc_en =  details.rows[0].loc_en;
                           _sum.end_loc_en =  details.rows[count].loc_en;

                           /*
                           _sum.start_mile = rows.start_mile;
                           _sum.end_mile = rows.end_mile;
                           _sum.start_date = rows.start_date;
                           _sum.end_date = rows.end_date;
                           _sum.start_loc_th = rows.start_loc_th; //
                           _sum.end_loc_th = rows.end_loc_th;
                           _sum.start_loc_en = rows.start_loc_en;
                           _sum.end_loc_en = rows.end_loc_en;
                           */
                         
                           
                           var ds=[];
                           ds.push(_sum);
                           details.sum =  ds;
                           step2_finish = true;
                           final_report_driving_history();
                 
                        }
                        else
                        {
                           // details.sum = [];

                           details.distance_google = resdistance +' km';//xresult.distance;
                           //  details.duration_google = xresult.duration;
                             details.speed_max = speed_max;
                            _sum.row = "trip";
                            _sum.distance_gps  = resdistance +' km';
                            _sum.start_date = rows[0].gps_datetime;
                            _sum.end_date = rows[count].gps_datetime;
       
                            var time_use = irp.diff_min(_sum.start_date, _sum.end_date); 
                            _sum.duration_gps  = hpt.min2hhmm(time_use);
                            _sum.start_mile = mileage_min;
                            _sum.end_mile = mileage_max;
                  
                            _sum.start_loc_th = rows[0].tambol+':'+rows[0].amphur+':'+rows[0].province; //tambol||':'||amphur||':'||province as loc_th
                            _sum.end_loc_th = rows[count].tambol+':'+rows[count].amphur+':'+rows[count].province; //rows[count].loc_th;
                            _sum.start_loc_en =  rows[0].etambol+':'+rows[0].eamphur+':'+rows[0].eprovince;  //rows[0].loc_en;
                            _sum.end_loc_en =  rows[count].etambol+':'+rows[count].eamphur+':'+rows[count].eprovince; //rows[count].loc_en;
                            _sum.speed_max = speed_max;
       
                            var ds=[];
                            ds.push(_sum);
                            details.sum =  ds;
                            step2_finish = true;
                            db_owner= 'db_10011';
                            final_report_driving_history();
                        }
                    });
                 
                 }
   
  
                 // final_report_driving_history();
             // })
        }
        else
        {
          step1_finish = true;
          final_report_driving_history();
        }
  
  
    });
  }
 

 



   function final_report_driving_history()
   {
    if(step1_finish==true && step2_finish==true)
        {
            
             res.send(details);  
        }
   }

}

function report_waitting_in_factory(req,res)
{
   
    var factory_id=req.body.factory_id; // '1110011082';//
    var start_date =req.body.start_date; //'2017-12-01 07:53:38' //'2017-11-26 00:00';//
    var end_date =req.body.end_date; //'2017-12-02 12:21:38' //'2017-11-27 23:59';//
 /*
    //275 โรงงานกุมภวาปี
    //277 โรงงานเกษตรผล
   
    var factory_id ='275'
    var start_date ='2018-01-03 00:00';
    var end_date ='2018-01-07 23:59'
 */


    var sql1 = ' '; var sql2 = ' ';
    debugger;
    sql1 += "SELECT get_vehiclename(modem_id) as vehicle_name,idate(enter_time) as start_date,idate(leave_time) as end_date  ,start_loc_th,end_loc_th ";
    sql1 += " ,start_loc_en,end_loc_en,start_lonlat,end_lonlat ";
    sql1 += " ,itime_use(timeuse) as timeuse ";
    sql1 += " FROM rp_enter_geom ";
    sql1 += " WHERE geom_id=" + utl.sqote(factory_id);
    sql1 += " AND timeuse > '5' AND enter_time >=" + utl.sqote(start_date) + " ";
    sql1 += " AND leave_time <=" + utl.sqote(end_date) + " ";
    sql1 += " ORDER BY modem_id ";

    nrows(sql1,db_config,function  (rows){ res.send( rows); });
    /*
    sql2 += " SELECT  ";
    sql2 += " itime_use(SUM(timeuse)) as timeuse ";
    sql2 += ",SUM(distance) as distance ";
    sql2 += ",SUM(distance) / get_oil_level(modem_id) as fuel ";
    sql2 += " FROM rp_enter_geom ";
    sql2 += " WHERE geom_id=" + utl.sqote(factory_id);
    sql2 += " AND enter_time >=" + utl.sqote(start_date) + " ";
    sql2 += " AND leave_time <=" + utl.sqote(end_date) + " ";

    get_row_sum(sql1, sql2, function (xres) 
    {
        debugger;
        // res.send(xres);
       //  callback(xres);
       // return;
        res.send( rows);
    });
    */
}


function get_row_sum(sql1, sql2, callback)
{

    ipm.db.dbname = db_config;
    var detail = { 'rows': '', 'sum': '' };
    var a = false; var b = false;
   
        db.get_rows(ipm, sql1, function (row) {
            if (row.length > 0)
            {
                a = true;
                detail.rows = row;
                next();
            }
            else
            {
                a = true;
                detail.rows = [];
                next();
            }
        });
  
        db.get_rows(ipm, sql2, function (row) {
            if (row.length > 0) {
               b = true;
                detail.sum = row;
                next();
            }
            else {
                b = true;
                detail.sum = [];
                next();
            }
        });

        function next()
        {
            if (a && b) {
                callback(detail);
                return;
            }
        }
  }


  function nrows(sql,db_name,callback)
{
         ipm.db.dbname = db_name;
      db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
           callback(rows);
           return;
        }else{
            callback([]);
           return;
        }
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

function list_harvester_areaworking(req, res)
{
    res.send([]);
    /*
    var sql2 = " SELECT fs,quota,name_farmer||' '||surname_farmer as name_farmer,farm_id "
    sql2 +=",name||' '||surname as admin "
    sql2 +=",rai,ton,total,lat,lon,name_harvester,dmy ";
    sql2 +=",replace(name_harvester,' ','_')  as img_harvester "
    sql2 +=" FROM harvester_working_area2 as h"
    sql2 +="  WHERE h.lat !='' AND h.lon !='' "

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql2, function (rows) 
    {
        if (rows.length > 0)
        {
            res.send(rows);
        }else{
             res.send([]);
        }
    });
    */
}


function list_group_farmrai_psun(req, res)
{
    var sql ="SELECT DISTINCT name_group FROM group_farm_rai"
    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });
}

function get_group_farmrai_psun(req, res)
{
    var sql ="SELECT id_group,name_rai,name_group,st_asgeojson(geomx::geometry)as geom  FROM group_farm_rai ";
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature"';
            strMustache += ' ,"id": "{{id_group}}","name_rai": "{{name_rai}}","name_group": "{{name_group}}","geometry":{{geom}}';
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


function get_report_harvester_working_with_truck(req, res)
{
 
    var start_date =req.body.start_date; 
    var end_date =req.body.end_date;

   /*
    var start_date ='2016-12-17 01:30'
    var end_date ='2016-12-17 23:59'
    */

    var sql ="";
    sql +="SELECT idate(start_record) as start_working,idate(end_record) as leave_farm,itime_use(total_time)as timeuse,plot_code_start as farm_id ";
    sql +=",get_harvestername(blackbox_id) as harvester_name,loading_truck_vehicle as truck_name ";
    sql +=",tambol_start||':'||amphur_start||':'||province_start as location ";
    sql +=" FROM history_status_havester ";
    sql +=" WHERE start_record >="+utl.sqote(start_date)+" AND end_record <="+utl.sqote(end_date)+" ";

    nrows(sql,db_sugarcane,function  (rows){ res.send( rows); });

}


//+++++++++++++++++++++++++++++++++++++++++++++++++++++


function _monitor_status(req, res)
{

    var type_vehicle =  req.body.type_vehicle; //req.params.type_vehicle;//
    var modem_id =   req.body.modem_id;// req.params.modem_id;
    var year_plant =  req.body.year_plant; //'61_62'
    var db_owner = 'db_10011';

   // console.log(type_vehicle+' '+modem_id+' '+year_plant )
   
    /*
    var type_vehicle =  "0"
    var modem_id =  "1110011002"
    var year_plant =  '61_62'
    var db_owner = 'db_10011';
    */

    if(year_plant===undefined)
    {
        res.send(null); 
    }
    else
    {
        if(type_vehicle=='0') // Harvester
        {
            var sql="";
            sql +="SELECT modem_id,get_vehicle_name(modem_id) as vehicle_name ";
            sql +=",coalesce(htt_plotcode,NULL) as htt_plotcode ";
            sql +=",coalesce(oil_percent,NULL) as oil_percent ";
            sql +=",coalesce(oil_liter,NULL) as oil_liter ";
            sql +=",status ";
            sql +=",idate(gps_datetime) as gps_datetime ";
            sql +=",dblink_get_today_roundtrip(modem_id) as ktc_round ";
            sql +=",dblink_get_round_collect(modem_id) as ktc_round_collect ";
            sql +=",dblink_get_TonTotal_Harvester(modem_id)::NUMERIC /1000 as ktc_weight";
            sql +=",dblink_get_starttime(modem_id) as ktc_starttime ";
            sql +=",dblink_get_stoptime(modem_id) as ktc_stoptime ";
          
            sql +=",dblink_get_truck_id(modem_id) as truck_id";
            sql +=",get_vehicle_name(dblink_get_truck_id(modem_id)) AS truck_name ";
            sql +=",dblink_get_lat_truck(dblink_get_truck_id(modem_id)) as lat_truck ";
            sql +=",dblink_get_lon_truck(dblink_get_truck_id(modem_id)) as lon_truck ";
  
            sql +=",coalesce(ktc_distance_truck,NULL) as ktc_distance_truck ";
            sql +=",coalesce(ktc_distance_collect_truck,NULL) as ktc_distance_collect_truck ";
            sql +=",coalesce(ktc_area_tracktor,NULL) as ktc_area_tracktor ";
            sql +=",coalesce(ktc_area_collect_tracktor,NULL) as ktc_area_collect_tracktor "
            sql +=",camera_url";
            sql +=",dblink_get_geofarm(dblink_get_farmid(lon::varchar,lat::varchar,'"+year_plant+"'),'"+year_plant+"') as geojson_farm ";
            sql +=" FROM realtime ";
            sql +=" WHERE htt_harvester_or_truck ='0' ";
    
            if(modem_id !='0')
            {
                sql +=" AND modem_id ="+utl.sqote(modem_id);
            }

            /*
               nrows(sql,db_owner,function  (rows)
               { 
                   if(rows.length>0)
                   {
                        var gis_id = rows[0].htt_plotcode ;//'16011244021'
                         detail_farms(gis_id,function(detail_farm)
                         {
                            var target = _.extend(rows[0], detail_farm);
                            res.send(target);
                         });
                   }
               })
               */

           // console.log('monitor_status '+db_owner);
    
            nrows(sql,db_owner,function  (rows){ res.send( rows); });
        }
        else if(type_vehicle=='1') //Truck
        {
            var sql="";
            sql +="SELECT modem_id,get_vehicle_name(modem_id) as vehicle_name ";
            sql +=",coalesce(htt_plotcode,NULL) as htt_plotcode ";
            sql +=",coalesce(oil_percent,NULL) as oil_percent ";
            sql +=" ,coalesce(oil_liter,NULL) as oil_liter ";
            sql +=",status ";
            sql +=",idate(gps_datetime) as gps_datetime ";
            sql +=" ,coalesce(ktc_round,NULL) as ktc_round ";
            sql +=" ,coalesce(ktc_round_collect,NULL) as ktc_round_collect ";

            sql +=",dblink_get_starttime_truck(modem_id) as ktc_starttime ";
            sql +=",dblink_get_stoptime_truck(modem_id) as ktc_stoptime ";
            sql +=",coalesce(htt_truck_name,NULL) as htt_truck_name ";

            sql +=",dblink_get_harvester_id(modem_id) as harvester_id";
            sql +=",get_vehicle_name(dblink_get_harvester_id(modem_id)) AS harvester_name ";

            sql +=",coalesce(ktc_distance_truck,NULL) as ktc_distance_truck ";
            sql +=",coalesce(ktc_distance_collect_truck,NULL) as ktc_distance_collect_truck ";
            sql +=",coalesce(ktc_area_tracktor,NULL) as ktc_area_tracktor ";
            sql +=",coalesce(ktc_area_collect_tracktor,NULL) as ktc_area_collect_tracktor "
            sql +=",coalesce(ktc_weight,NULL) as ktc_weight";

            sql +=",camera_url";
            sql +=",dblink_get_geofarm(dblink_get_farmid(lon::varchar,lat::varchar,'"+year_plant+"'),'"+year_plant+"') as geojson_farm ";
            sql +=" FROM realtime ";
            sql +=" WHERE htt_harvester_or_truck ='1' ";
    
            if(modem_id !='0')
            {
                sql +=" AND modem_id ="+utl.sqote(modem_id);
            }
    
            /*
            nrows(sql,db_owner,function  (rows)
            { 
                if(rows.length>0)
                {
                     var gis_id = rows[0].htt_plotcode ;//'16011244021'
                      detail_farms(gis_id,function(detail_farm)
                      {
                         var target = _.extend(rows[0], detail_farm);
                         res.send(target);
                      });
                }
            })*/

            nrows(sql,db_owner,function  (rows){ res.send( rows); });
        }
    }
    

}

function detail_farms(gis_id,callback)
{
    var result={'name_farmmer':'','serveyor':'','location':'','area':'','ton':'','result':''}
  
    var sql="";
    sql +=" SELECT b.name_farmmer,serveyor,b.location ";
    sql +=" ,coalesce(areas,'-') as area ,ton,result ";
    sql +=" FROM detail_farm_register_61_62 as a,detail_farm_61_62 as b ";
    sql +=" WHERE a.farm_id=b.gis_id ";
    sql +="  AND a.farm_id='"+gis_id+"' ";

    nrows(sql,db_sugarcane,function  (rows)
    { 
        if(rows.length>0)
        {
            var r=rows[0];
            result.name_farmmer=r.name_farmmer;
            result.serveyor =r.serveyor;
            result.location = r.location;
            result.area = r.area;
            result.ton= r.ton;
            result.result =r.result;
            callback(result);
            return;
        }else{
            callback(result);
            return;
        }
  
    });

}

//monitor_status('','')

function exports_csv_weight(start_date,callback)
{
   // var start_date ='2019-03-21';

    var sql="";

    sql +=" WITH res as( ";
    sql +="    SELECT 'id' as id";
    sql +=",'ชื่อรถ' as loading_truck_vehicle ";
    sql +=",'หมายเลขแปลง' as plot_code ";
    sql +=",'ห้องชั่ง' as station_name ";
    sql +=",'วันเวลาที่เข้าห้องชั่ง' as access_time ";
    sql +=",'น้ำหนัก' as weight ";
        
    sql +=" UNION 	ALL ";

    sql +=" SELECT DISTINCT ";
    sql +=" a.id::text ";
    sql +=",b.loading_truck_vehicle ";
    sql +=",b.plot_code ";
    sql +=",CASE WHEN a.station_id='793' THEN 'ห้องชั่งกุมภวาปี' ELSE 'ห้องชั่งเกษตรผล' END as station_name ";
    sql +=",idate(a.access_time) as access_time ";
    sql +=",COALESCE(a.weight::varchar,'')  as  weight";

    sql +=" FROM truck_accsss_weighing_zone as a ";
    sql +=",history_status_havester_report as b ";
    sql +=" WHERE to_char(a.access_time,'YYYY-MM-DD')=to_char(b.start_record,'YYYY-MM-DD') ";
    sql +=" AND to_char(a.access_time,'YYYY-MM-DD')='"+start_date+"' ";
    sql +=" AND a.truck_id=b.truck_blackbox_id ";
    //sql +=" ORDER BY idate(a.access_time), b.truck_blackbox_id ";

    sql +=" ) SELECT * FROM res ORDER BY access_time ";
  //  var result=[{'blackbox_id':'','loading_truck_vehicle':'','plot_code':'','station_name':'','access_time':'','weight':''}];

    nrows(sql,db_sugarcane,function  (rows)
    { 
        if(rows.length>0)
        {
        
           // res.send(target);
            callback(rows);
            return;
        }
  
    });
}


function monitor_status(req, res)
{

  
    var type_vehicle =  req.body.type_vehicle; //req.params.type_vehicle;//
    var modem_id =   req.body.modem_id;// req.params.modem_id;
    var year_plant =  req.body.year_plant; //'61_62'
    var db_owner = 'db_10011';

    if(year_plant===undefined)
    {
        res.send(null); 
    }
     else
    {

        if(type_vehicle=='0') // Harvester
        {
            var sql="";
            sql +="SELECT modem_id,get_vehicle_name(modem_id) as vehicle_name ";
            sql +=",coalesce(htt_plotcode,'0') as htt_plotcode ";
            sql +=",coalesce(oil_percent,'0') as oil_percent ";
            sql +=" ,coalesce(oil_liter,'0') as oil_liter ";
            sql +=",status ";
            sql +=",dblink_gps_datetime(modem_id) as gps_datetime  ";
            sql +=",dblink_get_today_roundtrip(modem_id) as ktc_round ";
            sql +=",dblink_get_round_collect(modem_id) as ktc_round_collect ";
            sql +=",dblink_get_TonTotal_Harvester(modem_id)::NUMERIC /1000 as ktc_weight";
            sql +=",idate(htt_cuttingtime) as ktc_starttime,idate(htt_farm_leaving) as ktc_stoptime ";
            sql +=",get_vehicle_name(htt_truck_name) as htt_truck_name ";
            sql +=",coalesce(ktc_distance_truck,'0') as ktc_distance_truck ";
            sql +=",coalesce(ktc_distance_collect_truck,'0') as ktc_distance_collect_truck ";
            sql +=",coalesce(ktc_area_tracktor,'0') as ktc_area_tracktor ";
            sql +=",coalesce(ktc_area_collect_tracktor,'0') as ktc_area_collect_tracktor "
           //      sql +=",dblink_get_geofarm(dblink_get_plot_code(modem_id),'"+year_plant+"') as geojson_farm ";
            sql +=",dblink_get_geofarm(dblink_get_farmid(lon::varchar,lat::varchar,'"+year_plant+"'),'"+year_plant+"') as geojson_farm ";
            sql +=",camera_url";
            sql +=" FROM realtime ";
            sql +=" WHERE htt_harvester_or_truck ='0' ";
            if(modem_id !='0'){
                sql +=" AND modem_id ="+utl.sqote(modem_id);
            }

            nrows(sql,db_owner,function  (rows){ res.send( rows); });
        }
        else if(type_vehicle=='1') //Truck
        {
            var sql="";
            sql +="SELECT modem_id,get_vehicle_name(modem_id) as vehicle_name ";
            sql +=",coalesce(htt_plotcode,'0') as htt_plotcode ";
            sql +=",coalesce(oil_percent,'0') as oil_percent ";
            sql +=",coalesce(oil_liter,'0') as oil_liter ";
            sql +=",status ";
            sql +=",dblink_gps_datetime(modem_id) as gps_datetime  ";
            sql +=",coalesce(ktc_round,'0') as ktc_round ";
            sql +=",coalesce(ktc_round_collect,'0') as ktc_round_collect ";
            sql +=",ktc_starttime,ktc_stoptime ";
            sql +=",coalesce(htt_truck_name,' ') as htt_truck_name ";
            sql +=",coalesce(ktc_distance_truck,'0') as ktc_distance_truck ";
            sql +=",coalesce(ktc_distance_collect_truck,'0') as ktc_distance_collect_truck ";
            sql +=",coalesce(ktc_area_tracktor,'0') as ktc_area_tracktor ";
            sql +=",coalesce(ktc_area_collect_tracktor,'0') as ktc_area_collect_tracktor "
            sql +=",coalesce(ktc_weight,'0') as ktc_weight";
            sql +=",camera_url";
            sql +=",dblink_get_geofarm(dblink_get_farmid(lon::varchar,lat::varchar,'"+year_plant+"'),'"+year_plant+"') as geojson_farm ";
            sql +=" FROM realtime ";
            sql +=" WHERE htt_harvester_or_truck ='1' ";
            if(modem_id !='0'){
                sql +=" AND modem_id ="+utl.sqote(modem_id);
            }

            nrows(sql,db_owner,function  (rows){ res.send( rows); });
        }

   }

}

/*
exports_csv_weight('',function(x){
    console.log(x);
})
*/
exports.monitor_status = monitor_status;

exports.list_name_farmer = list_name_farmer;
exports.list_qt = list_qt;

exports.list_name_farmer_by_qt = list_name_farmer_by_qt;

exports.get_maxfarm_id =get_maxfarm_id;
exports.list_zone=list_zone;
exports.get_location =get_location;
exports.list_area = list_area;
exports.list_type_ground =list_type_ground;
exports.list_type_sugarcane =list_type_sugarcane;
exports.list_name_sugarcane =list_name_sugarcane;
exports.list_source =list_source;
exports.list_methode =list_methode;
exports.list_distance =list_distance;
exports.list_type_ground =list_type_ground;
exports.list_owner =list_owner;
exports.list_eastimate=list_eastimate;
exports.list_status_farm=list_status_farm;


exports.list_ms_yearplant =list_ms_yearplant;
exports.list_ms_type_sugarcane =list_ms_type_sugarcane;
exports.list_ms_activity =list_ms_activity;
exports.list_farm_id = list_farm_id;

exports.retrive_image_km_addfarm = retrive_image_km_addfarm;
exports.get_last_pic_by_farmid=get_last_pic_by_farmid;
exports.set_track_farm=set_track_farm;
exports.set_activity_details =set_activity_details; 


exports.get_allfarm = get_allfarm;
exports.upload_gpx2gis = upload_gpx2gis;
exports.factory_point = factory_point;
exports.circle_around_factory =circle_around_factory;
exports.list_search_farmer_factory = list_search_farmer_factory;
exports.list_search_farmer_center =list_search_farmer_center;

exports.list_geomkpwp = list_geomkpwp;

exports.set_collect_ton_weight_system = set_collect_ton_weight_system;
exports.get_distance_direction = get_distance_direction;

exports.upload_kpwp = upload_kpwp;
exports.get_total_farm_rai = get_total_farm_rai;

exports.get_report_01 = get_report_01;
exports.get_report_02 = get_report_02;
exports.get_report_03 = get_report_03;
exports.get_report_04 = get_report_04;
exports.get_report_05 =get_report_05;

exports.report_driving_history = report_driving_history;

exports.list_vehicle_name =list_vehicle_name;


exports.report_distance_farm_to_kmp = report_distance_farm_to_kmp;//1.5
exports.report_distance_farm_to_ksp = report_distance_farm_to_ksp;//1.5
exports.report_group_activity = report_group_activity;//1.6
exports.get_report_all_area_quota = get_report_all_area_quota; //1.7
exports.get_report_all_area_zone = get_report_all_area_zone; //1.7
exports.set_detail_farm_register = set_detail_farm_register;//1.8

exports.add_user  = add_user;
exports.set_user=set_user;
exports.del_user = del_user;
exports.list_factory = list_factory;
exports.list_role = list_role;
exports.get_login_kmp_ksp = get_login_kmp_ksp;
exports.get_picture = get_picture;
exports.list_user = list_user;
exports.get_logout_kmp_ksp = get_logout_kmp_ksp;

exports.edit_geom_farm = edit_geom_farm;
exports.list_harvester_areaworking = list_harvester_areaworking;


exports.report_waitting_in_factory = report_waitting_in_factory;
exports.get_group_farmrai_psun = get_group_farmrai_psun;
exports.list_group_farmrai_psun = list_group_farmrai_psun;
exports.get_report_harvester_working_with_truck = get_report_harvester_working_with_truck;

exports.monitor_status = monitor_status;
exports.exports_csv_weight = exports_csv_weight;

function test()
{
    var json ={'bill_number':'7166','weight_number':'017887','qt':'15021001','farm_id':'15021001001'
    ,'name_farmmer':'ปวีณา จันทร์สุข','vehicle_name':'6พ050-02',"weight": '53.920','zone':'221'
    ,'type_sugarcane':'อ้อยสดสวยงาม'
    }

   var x =  find_type_fill_weight(json.type_sugarcane,json.weight);
   debugger
  // console.log(x);

   report_01_getstatus(function(dd){
    //console.log(dd);
   })

}


function cal_real_road_distance()
{

  var sql =  " SELECT DISTINCT farm_id ";
  sql += ",st_y( st_centroid(geomx)) as lat_farm,st_x( st_centroid(geomx)) as lon_farm";
  sql +=  ",'17.072361' as lat,'102.923586' as lon ";
  sql +=  "FROM detail_farm_register_60_61 ";
  sql +=  " WHERE substr(qt, 0,3) NOT IN ('27','28') ";
  sql +=  " AND geomx IS NOT NULL AND distance_real_road IS  NULL"

    nrows(sql,db_sugarcane,function  (rows)
    { 
        if(rows.length>0)
        {
            async.eachSeries(rows, function (row, next)
            {
                debugger;
               // console.log(row);
                var farm_id  = row.farm_id;
                var source = row.lat+','+row.lon;//"17.6326460,102.6905040";
                var destination= row.lat_farm+','+row.lon_farm; //"16.80101,102.77213";
               
                    // executes after one second, and blocks the thread
                
                        get_distance_direction(source,destination,function(xresult)
                        {
                            //{'distance':xdistance,'duration':xduration}
                            debugger;
                            var distance_google = xresult.distance;
                            var duration_google = xresult.duration;

                            console.log(farm_id+' '+distance_google+' '+duration_google);

                            var sql = squel.update()
                            .table('detail_farm_register_60_61')
                            .set("distance_real_road", distance_google)
                            .set("duration_real_road", duration_google)
                            .where('farm_id = ' + utl.sqote(farm_id))
                            .toString();

                            ocsb_excute(sql,db_sugarcane,function(xres)
                            {
                                debugger;
                             //   console.log('ress '+xres);
                                sleep(1000, function() {
                                      next();
                                });
                            })
                        

                        });
                 
            });
        }
    });
}

//monitor_status(' ',' ');
//test();
//get_count_farm_rai()
//get_report_05(' ',' ');

//list_name_farmer_by_qt('','');
//set_track_farm('','');
//set_activity_details('','');
//report_driving_history('','');
//get_total_farm_rai('','');
// cal_real_road_distance()

//get_allfarm('','');

//load_gpx();
//kmz_2_geojson();
//circle_around_factory('','');
//list_geomkpwp('','');

function sleep(time, callback) 
{
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) 
    {
        ;
    }
    callback();
}


//set_detail_farm_register('','');

//edit_geom_farm('','');

//report_driving_history('','');