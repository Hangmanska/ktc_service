
//#region header
var async = require('async');
var mustache = require("mustache");
var path = require('path');
var KMZGeoJSON = require('kmz-geojson');
var squel = require("squel");
var moment = require('moment');


var togeojson = require('togeojson');
var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var lineToPolygon = require('turf-line-to-polygon');
DOMParser = require('xmldom').DOMParser;
var parse = require('csv-parse');
var linq = require('linq.js');

const cheerio = require('cheerio');
var htmlparser = require("htmlparser2");

var formidable = require('formidable');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var xreq = require('xPost.js');
var gentxt = require('iGenTextFile');


var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_factory_01";
var db_owner ='db_10001'
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
var year_plant ='60_61'; //req.body.year_plant; 

var sql = "SELECT st_asgeojson(geomx::geometry)as geom   ";
sql += ",name_farmmer as name_farmmer,qt,farm_id "; 
sql += ",home,tambon,aumpher,province ";
sql += ",FLOOR(ABS(st_area(geomx::geography)/1600)) As area ";
sql += ",type_ground,type_sugarcane "; 
sql += ",zone,name_sugarcane,source,xdate,distance as xdistance,methode,owner,eastimate "; 
sql += ",COALESCE(icollect_ton,'0') as total_ton,COALESCE(icolour_code,'1') as colour_status ";
sql += ",st_x(st_centroid(geomx::geometry)) as lon ";
sql += ",st_y(st_centroid(geomx::geometry)) as lat ";
sql += " FROM detail_farm_register_"+year_plant;
sql += " WHERE lon IS NOT NULL "; 



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
            strMustache += ' ,"area": "{{area}}","type_ground": "{{type_ground}}","type_sugarcane": "{{type_sugarcane}}","zone":"{{zone}}" ';
            strMustache += ' ,"name_sugarcane": "{{name_sugarcane}}","source": "{{source}}","date_grow": "{{xdate}}","distance_grow": "{{xdistance}}" ';
            strMustache += ' ,"method_grow": "{{methode}}","growner": "{{owner}}","predict": "{{eastimate}}","lon": "{{lon}}" ,"lat": "{{lat}}"  ';
            strMustache += ' ,"total_ton":"{{total_ton}}","colour_status":"{{colour_status}}","geometry":{{geom}}';
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

    var year_plant = '60_61'; //b.year_plant; //  
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


function upload_gpx2gis(req, res)
{
    var year_plant ='60_61';//req.body.year_plant; 
    var type_project ='project';//'normal' //req.body.type_project; 
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
        console.log('add detail_farm ' + is_ok);
        callback(is_ok);
        return;
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
/* 
var sql='';
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 20000)::geometry)) as geom,'20' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 30000)::geometry)) as geom,'30' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 50000)::geometry)) as geom,'50' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 70000)::geometry)) as geom,'70' as km FROM master_factory_config WHERE id < '3' UNION ALL ";
sql += "SELECT st_asgeojson( st_astext( ST_Buffer(ST_MakePoint(lng_factory::FLOAT, lat_factory::FLOAT)::geography, 90000)::geometry)) as geom,'90' as km FROM master_factory_config WHERE id < '3' ";
*/

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
    sql += " WHERE lon IS NOT NULL AND zone >='100' AND zone <='300'"; 

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
    var year_plant = '60_61'; 

    var sql='';
    sql += "SELECT CASE WHEN name_farmmer='.' THEN qt ELSE name_farmmer END name_farmmer,qt,farm_id ";
    sql += ",tambon||':'||aumpher||':'||province as location";
    sql += ",type_ground,type_sugarcane,name_sugarcane,SOURCE";
    sql += ",distance,methode,owner,eastimate";
    sql += ",replace(replace(replace(box(ST_Buffer(geomx::geography, 20)::geometry)::text, '(', ''),'),', '|'),')','') as boxs ";
    sql += " FROM detail_farm_register_"+year_plant;
    sql += " WHERE lon IS NOT NULL AND zone >='100' AND zone <='300'"; 

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
    sql += " WHERE lon IS NOT NULL AND zone >='301' OR zone like '%ศูนย์%' "; 

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
    var year_plant ='60_61'; //req.body.year_plant;     
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
    var sql="";
    sql+="SELECT '20' as radius";
    sql+=",COUNT(c.farm_id) as count_farm";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='20'";
    sql+=" AND zone_id='1'";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '40'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='40'";
    sql+=" AND zone_id='1'";
    sql+=" AND c.qt NOT IN (SELECT DISTINCT c.qt";
    sql+=" FROM  master_factory_config b ,detail_farm_register_60_61 c";
    sql+=" WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL AND b.size_km='20'  AND zone_id='1')";
    
    sql+=" UNION ALL ";
    
    
    sql+="SELECT '60'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='60'";
    sql+=" AND zone_id='1'";
    sql+=" AND c.farm_id NOT IN (";
    sql+="SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='40'";
    sql+=" AND zone_id='1'";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '80'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='80'";
    sql+=" AND zone_id='1'";
    sql+=" AND c.farm_id NOT IN (";
    sql+=" SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='60'";
    sql+=" AND zone_id='1'";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    
    sql+=" SELECT '100'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'1' as zone_id";
    sql+=",_i_getfactory_name('1') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='100'";
    sql+=" AND zone_id='1'";
    sql+=" AND c.farm_id NOT IN (";
    sql+=" SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='80'";
    sql+=" AND zone_id='1'";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '20' as radius";
    sql+=",COUNT(c.farm_id) as count_farm";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='20'";
    sql+=" AND zone_id='2'";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '40'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='40'";
    sql+=" AND zone_id='2'";
    sql+=" AND c.qt NOT IN (SELECT DISTINCT c.qt";
    sql+=" FROM  master_factory_config b ,detail_farm_register_60_61 c";
    sql+=" WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL AND b.size_km='20'  AND zone_id='2')";
    
    sql+=" UNION ALL ";
    
    
    sql+="SELECT '60'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='60'";
    sql+=" AND zone_id='2'";
    sql+=" AND c.farm_id NOT IN (";
    sql+="SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='40'";
    sql+=" AND zone_id='2'";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    sql+="SELECT '80'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='80'";
    sql+=" AND zone_id='2'";
    sql+=" AND c.farm_id NOT IN (";
    sql+=" SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='60'";
    sql+=" AND zone_id='2'";
    sql+=")";
    
    sql+=" UNION ALL ";
    
    
    sql+=" SELECT '100'";
    sql+=",COUNT(c.farm_id) as total";
    sql+=",SUM(FLOOR(ABS(st_area(geomx::geography)/1600))) as rai";
    sql+=",SUM(FLOOR((ABS(st_area(geomx::geography)/1600) - FLOOR(ABS(st_area(geomx::geography)/1600)))*4)) as ngan";
    sql+=",'2' as zone_id";
    sql+=",_i_getfactory_name('2') as factory_name"
    sql+=" FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) ";
    sql+=" AND c.geomx IS NOT NULL";
    sql+=" AND b.size_km='100'";
    sql+=" AND zone_id='2'";
    sql+=" AND c.farm_id NOT IN (";
    sql+=" SELECT DISTINCT c.farm_id FROM master_factory_config b ,detail_farm_register_60_61 c";
    sql+="    WHERE ST_DWithin(c.geomx::geography,b.geom::geography,0) AND c.geomx IS NOT NULL AND b.size_km='80'";
    sql+=" AND zone_id='2'";
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
        .Select(function (x) { return parseInt(x.rai) })
        .Sum();

        var x_rai2 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '2' })
        .Select(function (x) { return parseInt(x.rai) })
        .Sum();

        var x_ngan1 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '1' })
        .Select(function (x) { return parseInt(x.ngan) })
        .Sum();

        var x_ngan2 = linq.Enumerable.From(rows)
        .Where(function (x) { return parseInt(x.zone_id) == '2' })
        .Select(function (x) { return parseInt(x.ngan) })
        .Sum();

        var data_sum={'total_farm1':x_count_farm1,'total_farm2':x_count_farm2
        ,'total_rai1':x_rai1,'total_rai2':x_rai2
        ,'total_ngan1':x_ngan1,'total_ngan2':x_ngan2
      }

      var result = { 'rows': rows, 'sum': data_sum };
      res.send(result);

    });
    
}

//++++++++++++++++++++++++++++++++++++ Recive images ++++++++++++++++++++++
//https://www.base64-image.de/  img 2 base64
//https://codebeautify.org/base64-to-image-converter

function retrive_image_km_addfarm(b)
{
    debugger;
  //  var b = req.body;

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

function prepare_array2geo2text(arr,callback)
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
       // console.log(final);
        callback(final);
        return;
     })
}


function set_track_farm(req, res)
{
    /**/
   var b = req.body.data;
    
    var year_plant = b.year_plant; //  '60_61'; //
    var name_tb = set_tbname(year_plant);

   // var b={'arr_area':[[16.909515653,102.961439905],[16.907063034,102.96104296],[16.9068404720001,102.963092578],[16.9092113130001,102.963259737],[16.909515653,102.961439905],[16.909515653,102.961439905]]}

   // b.arr_area = [[16.909515653,102.961439905],[16.907063034,102.96104296],[16.9068404720001,102.963092578],[16.9092113130001,102.963259737],[16.909515653,102.961439905],[16.909515653,102.961439905]];
  //  console.log(req.body.data);

    /*
    var geom ={"type":"Polygon","coordinates":[[[103.200644986377,17.617644463821],[103.200649322009,17.617659814349],[103.200652951672,17.6176854234436],[103.200673524564,17.6177007991527],[103.20100018583,17.6184240087675],[103.201216556224,17.6187167793911],[103.202006160181,17.6181842350346],[103.202599309936,17.6177453170845],[103.202431005662,17.6173130614565],[103.201705614423,17.617277799431],[103.200644986377,17.617644463821],[103.200644986377,17.617644463821]]]}
   

    var ar ={'name_farmmer':'ประเชิญ โพะิ์ผาราช','qt':'15071074','farm_id':'15071074001','zone':'ศูนย์ส่งเสริมอ้อยทุ่งฝน'
    ,'home':' ','tambon':'บ้านชัย','aumpher':'บ้านดุง','province':'อุดรธานี','area':'0'
    ,'type_ground':'ร่วนปนทราย','type_sugarcane':'ตุลา','name_sugarcane':'ขอนแก่น3'
    ,'source':'อ้อยนอกเขต','dateplant':'','distance':'1.2 m.','methode':'เครื่องปลูก','owner':'เจ้าของ'
    ,'eastimate':'10','icolour_code':'2','type_project':'project','year_plant':'60_61'
    ,'geomx':geom,'base64':b.photo,'imei':b.imei};

    {"farmer_name":"ประเสริฐสิทธิ์  ศรีสุข","year_plant":"60_61","quota":"0","farm_id":"0001","zone":"ศูนย์ส่งเสริมอ้อยสระไค","district":"555","tambon":"แพรกษา","aumpher":"เมืองสมุทรปราการ","province":"สมุทรปราการ","area":"10","type_ground":"ร่วนปนทราย","type_sugarcane":"ตุลา","name_sugarcane":"ขอนแก่น3","source":"อ้อยนอกเขต","date_grow":"2017-07-31","distance":"1.0 m.","methode":"เครื่องปลูก","owner":"ชาวไร่","eastimate":"10,000","status_farm_id":"1","status_farm":"เตรียมแปลงอ้อย","arr_area":[[13.5676583,100.6438893],[13.5676583,100.6438893],[13.5676583,100.6438893]],"photo":"base64"}

    */

   prepare_array2geo2text(b.arr_area,function(result_geox)
   {
      b.arr_area = result_geox;

     var ar ={'name_farmmer':b.farmer_name,'qt':b.quota,'farm_id':b.farm_id,'zone':b.zone
    ,'home':b.district,'tambon':b.tambon,'aumpher':b.aumpher,'province':b.province,'area':b.area
    ,'type_ground':b.type_ground,'type_sugarcane':b.type_sugarcane,'name_sugarcane':b.name_sugarcane
    ,'source':b.source,'dateplant':b.date_grow,'distance':b.distance,'methode':b.methode,'owner':b.owner
    ,'eastimate':b.eastimate,'icolour_code':b.status_farm_id,'type_project':b.status_farm,'year_plant':b.year_plant
    ,'owner':b.owner ,'geomx': b.arr_area };

    var ar2 ={'farm_id':b.farm_id,'year_plant':b.year_plant ,'project_type':b.status_farm};


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

    debugger;

   //  gentxt.build_text('data_sql.txt',sql);

    /**/
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
                    console.log(' kum '+xres)
                    res.send('OK');
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


   })

}

function set_activity_details(req, res)
{
    /**/
  var b = req.body.data;
  var ar ={'year_plant':b.year_plant,'type_sugarcane':b.type_sugarcane
  ,'activity':b.activity,'details':b.details,'lon':b.lon,'lat':b.lat //,'pic_data':b.pic_data
  };


  debugger;
 // var  data = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/';

  //  b.pic_data =utl.replaceAll('data:image/jpeg;base64,','',data)
   var ddd  = utl.replaceAll('data:image/jpeg;base64,','',b.pic_data)


     var sql= " INSERT INTO activity_details (year_plant,type_sugarcane,activity,details,lon,lat,pic_data,idate) ";
      sql +=" VALUES("+utl.sqote(ar.year_plant)+","+utl.sqote(ar.type_sugarcane)+" "
      sql +=" ,"+utl.sqote(ar.activity)+","+utl.sqote(ar.details)+","+utl.sqote(ar.lon)+","+utl.sqote(ar.lat)+" ";
      sql +=" ,decode('"+ddd+"', 'base64')"
      sql +=" ,now() ) ";

    //  gentxt.build_text('data_activit.txt',sql);

      /*  */
   ocsb_excute(sql,db_sugarcane,function(xres)
   {
        res.send(xres);
    })
  
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

   var sql= "SELECT DISTINCT qt FROM "+set_tbname(year_plant)+" ORDER BY qt ASC";
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
{
    var sql= "SELECT id,name_colour_th||'อ้อย'||COALESCE(type_sugar,'') as type_sugar FROM icolour_status ORDER BY id";
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


//+++++++++++++++++++++++++++++++++++ Report History ++++++++++++++++++++++++++++

function report_driving_history(req,res)
{
    var modem_id=req.body.modem_id; // '1010001002';
    var start_date =req.body.start_date; //'2017-09-01 00:00';
    var end_date =req.body.end_date; //'2017-09-01 23:59';

  var sql ='';
 // sql +="  SELECT row_number() OVER (ORDER BY gps_datetime) as id ";
  sql +="SELECT idate(gps_datetime) as gps_datetime,lon,lat,speed ";
  //sql +=",message_id,analog_input1,analog_input2 ";
  //sql +=",tambol, etambol, amphur,eamphur, province, eprovince";
  sql +=",status,status||'_'||angle as heading ";
  sql +=" FROM ht_"+modem_id;
  sql +=" WHERE gps_datetime >="+utl.sqote(start_date);
  sql +=" AND gps_datetime <="+utl.sqote(end_date);

  
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
   


  var step1_finish = false;
  var step2_finish = false;
  var details={'rows':'','sum':'','speed_max':'','distance_google':'','duration_google':''};

  /*
  var _sum={
    'speed_max':'', 'distance_gps':'', 'duration_gps':'','start_mile':'','end_mile':''
   ,'start_date':'','end_date':'','start_loc_th':'','end_loc_th':''
   ,'start_loc_en':'','end_loc_en':'','distance_google':'','duration_google':''
  }
  */

  nrows(sql,db_owner,function  (rows)
  { 
      if(rows.length>0)
      {
        step1_finish = true;
        
             var speed_max = linq.Enumerable.From(rows)
              .Select(function (x) { return parseInt(x.speed) })
              .Max();
        
            var count = rows.length -1;
            var source = rows[0].lat+','+rows[0].lon;//"17.6326460,102.6905040";
            var destination= rows[count].lat+','+rows[count].lon; //"16.80101,102.77213";
        
            get_distance_direction(source,destination,function(xresult)
            {
                //{'distance':xdistance,'duration':xduration}
               // debugger;
                details.distance_google = xresult.distance;
                details.duration_google = xresult.duration;
                details.speed_max = speed_max;
                details.rows = rows;

                nrows(sql2,db_config,function  (xrows)
                { 
                    debugger;
                    step2_finish = true;
                    if(xrows.length>0)
                    {
                        /*
                        rows = rows[0];
                       _sum.distance_gps  = rows.distance_gps;
                       _sum.duration_gps  = rows.duration_gps;
                       _sum.start_mile = rows.start_mile;
                       _sum.end_mile = rows.end_mile;
                       _sum.start_date = rows.start_date;
                       _sum.end_date = rows.end_date;
                       _sum.start_loc_th = rows.start_loc_th;
                       _sum.end_loc_th = rows.end_loc_th;
                       _sum.start_loc_en = rows.start_loc_en;
                       _sum.end_loc_en = rows.end_loc_en;
                         */
                       details.sum = xrows;
             
                       final_report_driving_history();
             
                    }
                });
             

               // final_report_driving_history();
            })
      }
      else
      {
        step1_finish = true;
        final_report_driving_history();
      }


  });

 



   function final_report_driving_history()
   {
    if(step1_finish==true && step2_finish==true)
        {
            
             res.send(details);  
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

exports.list_name_farmer = list_name_farmer;
exports.list_qt = list_qt;
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

function test()
{
    var json ={'bill_number':'7166','weight_number':'017887','qt':'15021001','farm_id':'15021001001'
    ,'name_farmmer':'ปวีณา จันทร์สุข','vehicle_name':'6พ050-02',"weight": '53.920','zone':'221'
    ,'type_sugarcane':'อ้อยสดสวยงาม'
    }

   var x =  find_type_fill_weight(json.type_sugarcane,json.weight);
   debugger
   console.log(x);

   report_01_getstatus(function(dd){
    console.log(dd);
   })

}


//test();
//get_count_farm_rai()
//get_report_05(' ',' ');


//set_track_farm('','');
//set_activity_details('','');
//report_driving_history('','');

