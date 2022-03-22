

//#region modules
var fs = require('fs');
var async = require('async');
var mustache = require("mustache");
var moment = require('moment');
var encoding = require("encoding");
var squel = require("squel");
var path = require('path');
var request = require("request");
var prettyjson = require('prettyjson');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var iutm = require('utm2latlon.js');
var linq = require('linq.js');


var jrp_today = require('ocsb_gen_report_speed_avg_today.js');
var jrptank_today = require('ocsb_tankwater_gen_report_speed_avg_today.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10003";
var BOM = "\uFEFF";

var api_noticamera = 'http://127.0.0.1:9003/api/noti_camera'; //real 
    //#endregion

function stucture_geom()
{
    this.stid = '';
    this.project_y = '';
    this.oid = '';
    this.stid_1= '';
    this.caneyear = '';
    this.zone = '';
    this.responsibl= '';
    this.farmerid = '';
    this.pre_name = '';
    this.f_name = '';
    this.l_name = '';
    this.field_id = '';
    this.area = '';
    this.area_law = '';
    this.project_sd = '';
    this.project_cn = '';
    this.project_ce = '';
    this.wpsend_dat = '';
    this.soil_name = '';
    this.admin = '';
    this.status = '';
    this.area_gread = '';
    this.area_type = '';
    this.harvester_number = '';
    this.plant_date = '';
    this.farm_code = '';
    this.soil = '';
    this.terrain = '';
    this.village = '';
    this.tambol = '';
    this.amphor = '';
    this.province= '';
    this.harvester_number1 = '';
    this.que = '';

}

//http://gis.stackexchange.com/questions/142391/store-a-geojson-featurecollection-to-postgres-with-postgis
//http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html
//http://stackoverflow.com/questions/28166374/how-to-determine-if-column-value-is-integer-inside-a-trigger

function load_geojson_2_table1()
{
    
    var path_geojson = __dirname + '/data.geojson';
   // var path_geojson = __dirname + '/แปลงรถตัด111059_รับเข้าโครงการ_ลงคิว.geojson';
    
    fs.readFile(path_geojson,  function (err, data)
    {
        debugger;

        var data = JSON.stringify(utl.Trim(data.toString()));
        data = JSON.parse(data);


     
        var sql= ' ';
        sql += "   WITH data AS (SELECT '" + data + "'::json AS fc) ";
        sql += "SELECT ";
        sql+= "  row_number() OVER () AS gid, ";
        sql += "  ST_AsText(ST_GeomFromGeoJSON(feat->>'geometry')) AS coordinates, ";
        sql+= "  feat->'properties' AS properties ";
        sql+= "    FROM ( ";
        sql+= "      SELECT json_array_elements(fc->'features') AS feat ";
        sql+= "    FROM data ";
        sql += " ) AS f ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        if (rows.length > 0)
        {
            //debugger;

            var val = ' ';
            async.eachSeries(rows, function (row, next)
            {

                var jString = JSON.stringify(row.properties);
                val += '(' + utl.sqote(row.coordinates) + ',' + utl.sqote(jString)+ '),';
                next();

            }, function () 
            {
               // debugger;
   
                val = utl.iRmend(val);
                var sql = '  INSERT INTO sugarcane_farm (coordinates, properties)  VALUES ' + val;
                db.excute(ipm, sql, function (response)
                {
                    if (response == 'oK')
                    {
                        console.log(response);

                    }
                });

                //var query = "COPY station_customer (coordinates, properties)";
                //query += " FROM " + utl.sqote(new_path) + " WITH CSV HEADER delimiter ','";
             
            });


        }
    });
    

    });
}

function load_geojson_2_table2()
{
    var path_geojson = __dirname + '/data2.geojson';
   //  var path_geojson = __dirname + '/แปลงรถตัด111059_รับเข้าโครงการ_ลงคิว.geojson';
    
    fs.readFile(path_geojson,  function (err, data)
    {
        debugger;

        var data = JSON.stringify(utl.Trim(data.toString()));
            data = JSON.parse(data);
            var array = data.toString().split('\n');


        var val = ' ';
      //  var i = 0;
        async.eachSeries(array, function (row, next)
        {
          
            //  debugger;
            row = utl.Trim(row);
            if (utcp.Contains(row, 'geometry'))
            {
                if (utcp.EndsWith(row, ','))
                {
                    row = utl.iRmend(row);
                }
                
             
                row = JSON.parse(row);
                var coordinates = row.geometry.coordinates[0];
                var properties = JSON.stringify(row.properties);
                //var x_res = linq.Enumerable.From(row)
                //         .Select(function (x) { return x.geometry })
                //         .ToArray();
               debugger;
           

               iutm.iUTMXYToLatLon_ar(coordinates, 47, function (latlon)
               {
                    debugger;

                //    "STID": 465823, "PROJECT_Y": "255960", "OID_": 1, "STID_1": 465823, "CaneYear": "255960", "Zone": "22", "Responsibl": "ปฐม   ภักดีณรงค์", "FarmerId": "322008", "PRE_NAME": "นาง", "F_NAME": "ล้วน", "L_NAME": "วินเนตรวงษ์", "FIELD_ID": "39223-001", "Area": 11.570000, "AREA_LAW": 0.000000, "Project_Sd": "ปกติ", "PROJECT_CN": "ข้ามแล", "PROJECT_CE": "รื้อตอ", "WPSEND_DAT": "2015\/09\/30", "SOIL_NAME": "-", "ผู้ดูแล": "ปฐม   ภักดีณรงค์", "สถานะ": "รับเข้าโครงการ", "เกรดพื้นที": "C", "พื้นที่เก่": "ใหม่", "เบอร์รถตัด": "6&7", "วันที่ปลูก": "14\/01\/2016", "รหัสแปลง": "39223-001", "ดิน": "-", "ลักษณะภูมิ": "-", "หมู่บ้าน": "บ้านห้วยโจด", "ตำบล": "ต.ห้วยโจด", "อำเภอ": "อ.วัฒนานคร", "จังหวัด": "สระแก้ว", "เบอร์รถต_1": "6&7", "ลงคิวการ_1": 35.000000

                    val += "(ST_AsGeoJSON((ST_GeomFromText(" + latlon + ", 4326)))," + utl.sqote(properties) + "),";
                    //" + utl.sqote(r[2]) + ", " + utl.sqote(r[3]) + ", " + utl.sqote(r[4]) + ", " + utl.sqote(r[5]) + ", " + utl.sqote(r[6]) + ", " + utl.sqote(r[7]) + ", " + utl.sqote(r[8]) + ", " + utl.sqote(r[9]) + ", " + utl.sqote(r[10]) + ", " + utl.sqote(r[11]) + ", " + utl.sqote(r[12]) + ", " + utl.sqote(r[13]) + "),";
                    next();
                   // i++
                });

            } else {
                next();
              //  i++
            }


        }, function () {

            debugger;
            val = utl.iRmend(val);
            var sql = '  INSERT INTO sugarcane_farm (coordinates, properties)  VALUES ' + val;
            db.excute(ipm, sql, function (response) {
                if (response == 'oK') {
                    console.log(response);

                }
            });

        });
    });
}

function load_geojson_2_table3()
{
   // var xar = [];
   var path_geojson = __dirname + '/data.geojson';
   // var path_geojson = __dirname + '/xคิวรถตัดอ้อย_5960_031259_2.geojson';



   fs.readFile(path_geojson, { encoding: 'utf8' }, function (err, data) {
        debugger;
     
        var data = JSON.stringify(utl.Trim(data.toString()));

        
        data = utl.replaceAll('ผู้ดูแล', 'admin', data);
        data = utl.replaceAll('สถานะ', 'status', data);
        data = utl.replaceAll('เกรดพื้นที', 'area_grade', data);
        data = utl.replaceAll('พื้นที่เก่', 'area_type', data);

        data = utl.replaceAll('เบอร์รถตัด', 'harvester_number', data);
        data = utl.replaceAll('เบอร์รถต_1', 'harvester_number1', data);
        data = utl.replaceAll('วันที่ปลูก', 'plant_date', data);
        data = utl.replaceAll('รหัสแปลง', 'farm_code', data);
    
        data = utl.replaceAll('ดิน', 'soil', data);
        data = utl.replaceAll('ลักษณะภูมิ', 'terrain', data);
        data = utl.replaceAll('หมู่บ้าน', 'village', data);
        data = utl.replaceAll('ตำบล', 'tambol', data);

        data = utl.replaceAll('อำเภอ', 'amphor', data);
        data = utl.replaceAll('จังหวัด', 'province', data);
        data = utl.replaceAll('ลงคิวการ_1', 'que', data);
        data = utl.replaceAll('&', ',', data);

        data = JSON.parse(data);
        var array = data.toString().split('\n');


        var val = ' ';
        //  var i = 0;
        async.eachSeries(array, function (row, next)
        {

              debugger;
            row = utl.Trim(row);
            if (utcp.Contains(row, 'geometry'))
            {
                if (utcp.EndsWith(row, ','))
                {
                    row = utl.iRmend(row);
                }


                row = JSON.parse(row);
                var coordinates = row.geometry.coordinates[0];
                var properties = JSON.stringify(row.properties);



                //var x_res = linq.Enumerable.From(row)
                //         .Select(function (x) { return x.geometry })
                //         .ToArray();
              //  debugger;
                var t = row.properties;
                t.WPSEND_DAT = custom_date(t.WPSEND_DAT);//moment(t.WPSEND_DAT).format('YYYY-MM-DD');
                t.plant_date = custom_date(t.plant_date);

                /*
                var s = new stucture_geom();

                s.stid = t.STID;
                s.stid_1 = t.STID_1;
                s.project_y = t.PROJECT_Y;
                s.oid = t.OID_;
                s.caneyear = t.CaneYear;
                s.zone = t.Zone;
                s.responsibl = t.Responsibl;
                s.field_id = t.FIELD_ID;
                s.farmerid = t.FarmerId;
                s.pre_name = t.PRE_NAME;
                s.f_name = t.F_NAME;
                s.l_name = t.L_NAME;
                s.area = t.Area;
                s.area_law = t.AREA_LAW;
                s.project_sd = t.Project_Sd;
                s.project_cn = t.PROJECT_CN;
                s.project_ce = t.PROJECT_CE;
                s.wpsend_dat = moment(t.WPSEND_DAT).format('YYYY-MM-DD');
                s.soil_name = t.SOIL_NAME;
                s.admin = t.admin;
                s.status = t.status;
                s.area_grade = t.area_grade;
                s.area_type = t.area_type;
                s.harvester_number = t.harvester_number;
                s.harvester_number1 = t.harvester_number1;
                s.plant_date = custom_date(t.plant_date);
                s.farm_code = t.farm_code;
                s.soil = t.soil;
                s.terrain = t.terrain;
                s.village = t.village;
                s.tambol = t.tambol;
                s.amphor = t.amphor;
                s.province = t.province;
                s.que = t.que;
                */
                

             //   xar.push(s);
                iutm.iUTMXYToLatLon_ar(coordinates, 47, function (latlon)
                {
                    debugger;

                    val += "(ST_AsGeoJSON((ST_GeomFromText(" + latlon + ", 4326)))," + utl.sqote(properties) //+ "),";
                  //  val += "(ST_AsGeoJSON((ST_GeomFromText(" + latlon + ", 4326)))"  //+ "),";
                    /**/
                    val += "," + utl.sqote(t.STID) + "," + utl.sqote(t.STID_1) + "," + utl.sqote(t.PROJECT_Y) + "," + utl.sqote(t.OID_)
                    val += "," + utl.sqote(t.CaneYear) + "," + utl.sqote(t.Zone) + "," + utl.sqote(t.Responsibl) + "," + utl.sqote(t.FIELD_ID)
                    val += "," + utl.sqote(t.FarmerId) + "," + utl.sqote(t.PRE_NAME) + "," + utl.sqote(t.F_NAME) + "," + utl.sqote(t.L_NAME)
                    val += "," + utl.sqote(t.Area) + "," + utl.sqote(t.AREA_LAW) + "," + utl.sqote(t.Project_Sd) + "," + utl.sqote(t.PROJECT_CN) + "," + utl.sqote(t.PROJECT_CE) + "," + utl.sqote(t.WPSEND_DAT) + "," + utl.sqote(t.SOIL_NAME)

                    // val += "," + utl.sqote(t.admin) + "," + utl.sqote(t.status) + "," + utl.sqote(t.area_grade) + "," + utl.sqote(t.area_type)
                    // val += "," + utl.sqote(t.harvester_number) + "," + utl.sqote(t.harvester_number1) + "," + utl.sqote(t.plant_date) + "," + utl.sqote(t.farm_code) + "," + utl.sqote(t.soil) + "," + utl.sqote(t.terrain)
                    // val += "," + utl.sqote(t.village) + "," + utl.sqote(t.tambol) + "," + utl.sqote(t.amphor) + "," + utl.sqote(t.province) + "," + utl.sqote(t.que)
                    val +="),";
                    

                    next();
                    // i++
                });
            }
            else
            {
                next();
            }
        
        }, function () { 
            debugger;

            //#region
            /*
            var strMustache = '{{#.}}';
            strMustache += "('{{stid}}','{{project_y}}','{{oid}}','{{stid_1}}','{{caneyear}}','{{zone}}','{{responsibl}}','{{farmerid}}','{{pre_name}}' ";
            strMustache += ",'{{f_name}}','{{l_name}}','{{field_id}}','{{area}}','{{area_law}}'"
            strMustache += ",'{{project_sd}}','{{project_cn}}','{{project_ce}}','{{wpsend_dat}}','{{soil_name}}'"
            strMustache += ",'{{admin}}','{{status}}','{{area_gread}}','{{area_type}}','{{harvester_number}}'"
            strMustache += ",'{{plant_date}}','{{farm_code}}','{{soil}}','{{terrain}}','{{village}}'"
            strMustache += ",'{{tambol}}','{{amphor}}','{{province}}','{{harvester_number1}}','{{que}}'"
            strMustache += "),";
            strMustache += '{{/.}}';
            

            var result_val = mustache.render(strMustache, xar);
            result_val = utl.iRmend(result_val);

            console.log(result_val);
            */
            //#endregion

            val = utl.iRmend(val);

            var column ='stid,stid_1,project_y,oid';
            column += ',caneyear,zone,responsibl,field_id';
            column += ',farmerid,pre_name,f_name,l_name';
            column += ',area,area_law,project_sd,project_cn,project_ce,wpsend_dat,soil_name';
           // column += ',admin,status,area_gread,area_type'
          //  column += ',harvester_number,harvester_number1,plant_date,farm_code,soil,terrain'
          //  column += ',village,tambol,amphor,province,que';
            //,' + column + '
            var sql = '  INSERT INTO sugarcane_farm3 (coordinates,properties,' + column + ')  VALUES ' + val;
            //var sql = '  INSERT INTO sugarcane_farm (coordinates,'+column+')  VALUES ' + val;

            ipm.db.dbname = db_sugarcane;
            db.excute(ipm, sql, function (response) {
                if (response == 'oK') {
                    console.log(response);

                }
            });

        });


});
    
   
}

function test_unregis()
{

    var path_geojson = __dirname + '/Plant5960.geojson';

    fs.readFile(path_geojson, { encoding: 'utf8' }, function (err, data) {
        // debugger;

        var data = JSON.stringify(utl.Trim(data.toString()));

        /*
        data = utl.replaceAll('ผู้ดูแล', 'admin', data);
        data = utl.replaceAll('สถานะ', 'status', data);
        data = utl.replaceAll('เกรดพื้นที', 'area_grade', data);
        data = utl.replaceAll('พื้นที่เก่', 'area_type', data);

        data = utl.replaceAll('เบอร์รถตัด', 'harvester_number', data);
        data = utl.replaceAll('เบอร์รถต_1', 'harvester_number1', data);
        data = utl.replaceAll('วันที่ปลูก', 'plant_date', data);
        data = utl.replaceAll('รหัสแปลง', 'farm_code', data);

        data = utl.replaceAll('ดิน', 'soil', data);
        data = utl.replaceAll('ลักษณะภูมิ', 'terrain', data);
        data = utl.replaceAll('หมู่บ้าน', 'village', data);
        data = utl.replaceAll('ตำบล', 'tambol', data);

        data = utl.replaceAll('อำเภอ', 'amphor', data);
        data = utl.replaceAll('จังหวัด', 'province', data);
        data = utl.replaceAll('ลงคิวการ_1', 'que', data);
        data = utl.replaceAll('&', ',', data);
        */

        data = JSON.parse(data);
        var array = data.toString().split('\n');


        var val = ' ';
        //  var i = 0;
        async.eachSeries(array, function (row, next) {

            //  debugger;
            row = utl.Trim(row);
            if (utcp.Contains(row, 'geometry')) {
                if (utcp.EndsWith(row, ',')) {
                    row = utl.iRmend(row);
                }


                row = JSON.parse(row);
                var coordinates = row.geometry.coordinates[0];
                var properties = JSON.stringify(row.properties);



                //var x_res = linq.Enumerable.From(row)
                //         .Select(function (x) { return x.geometry })
                //         .ToArray();
                //  debugger;
                /* 
                var t = row.properties;
                t.WPSEND_DAT = custom_date(t.WPSEND_DAT);//moment(t.WPSEND_DAT).format('YYYY-MM-DD');
                t.plant_date = custom_date(t.plant_date);

                
                var s = new stucture_geom();

                s.stid = t.STID;
                s.stid_1 = t.STID_1;
                s.project_y = t.PROJECT_Y;
                s.oid = t.OID_;
                s.caneyear = t.CaneYear;
                s.zone = t.Zone;
                s.responsibl = t.Responsibl;
                s.field_id = t.FIELD_ID;
                s.farmerid = t.FarmerId;
                s.pre_name = t.PRE_NAME;
                s.f_name = t.F_NAME;
                s.l_name = t.L_NAME;
                s.area = t.Area;
                s.area_law = t.AREA_LAW;
                s.project_sd = t.Project_Sd;
                s.project_cn = t.PROJECT_CN;
                s.project_ce = t.PROJECT_CE;
                s.wpsend_dat = moment(t.WPSEND_DAT).format('YYYY-MM-DD');
                s.soil_name = t.SOIL_NAME;
                s.admin = t.admin;
                s.status = t.status;
                s.area_grade = t.area_grade;
                s.area_type = t.area_type;
                s.harvester_number = t.harvester_number;
                s.harvester_number1 = t.harvester_number1;
                s.plant_date = custom_date(t.plant_date);
                s.farm_code = t.farm_code;
                s.soil = t.soil;
                s.terrain = t.terrain;
                s.village = t.village;
                s.tambol = t.tambol;
                s.amphor = t.amphor;
                s.province = t.province;
                s.que = t.que;
                */


                //   xar.push(s);
                iutm.iUTMXYToLatLon_ar(coordinates, 47, function (latlon) {
                    // debugger;

                    val += "(ST_AsGeoJSON((ST_GeomFromText(" + latlon + ", 4326)))," + utl.sqote(properties) + "),";
                    //  val += "(ST_AsGeoJSON((ST_GeomFromText(" + latlon + ", 4326)))"  //+ "),";
                    /*
                    val += "," + utl.sqote(t.STID) + "," + utl.sqote(t.STID_1) + "," + utl.sqote(t.PROJECT_Y) + "," + utl.sqote(t.OID_)
                    val += "," + utl.sqote(t.CaneYear) + "," + utl.sqote(t.Zone) + "," + utl.sqote(t.Responsibl) + "," + utl.sqote(t.FIELD_ID)
                    val += "," + utl.sqote(t.FarmerId) + "," + utl.sqote(t.PRE_NAME) + "," + utl.sqote(t.F_NAME) + "," + utl.sqote(t.L_NAME)
                    val += "," + utl.sqote(t.Area) + "," + utl.sqote(t.AREA_LAW) + "," + utl.sqote(t.Project_Sd) + "," + utl.sqote(t.PROJECT_CN) + "," + utl.sqote(t.PROJECT_CE) + "," + utl.sqote(t.WPSEND_DAT) + "," + utl.sqote(t.SOIL_NAME)
                  
                    val += "," + utl.sqote(t.admin) + "," + utl.sqote(t.status) + "," + utl.sqote(t.area_grade) + "," + utl.sqote(t.area_type)
                    val += "," + utl.sqote(t.harvester_number) + "," + utl.sqote(t.harvester_number1) + "," + utl.sqote(t.plant_date) + "," + utl.sqote(t.farm_code) + "," + utl.sqote(t.soil) + "," + utl.sqote(t.terrain)
                    val += "," + utl.sqote(t.village) + "," + utl.sqote(t.tambol) + "," + utl.sqote(t.amphor) + "," + utl.sqote(t.province) + "," + utl.sqote(t.que)
                  
                     val += "),";
                     */

                    next();
                    // i++
                });
            }
            else {
                next();
            }

        }, function () {
            debugger;

            //#region
            /*
            var strMustache = '{{#.}}';
            strMustache += "('{{stid}}','{{project_y}}','{{oid}}','{{stid_1}}','{{caneyear}}','{{zone}}','{{responsibl}}','{{farmerid}}','{{pre_name}}' ";
            strMustache += ",'{{f_name}}','{{l_name}}','{{field_id}}','{{area}}','{{area_law}}'"
            strMustache += ",'{{project_sd}}','{{project_cn}}','{{project_ce}}','{{wpsend_dat}}','{{soil_name}}'"
            strMustache += ",'{{admin}}','{{status}}','{{area_gread}}','{{area_type}}','{{harvester_number}}'"
            strMustache += ",'{{plant_date}}','{{farm_code}}','{{soil}}','{{terrain}}','{{village}}'"
            strMustache += ",'{{tambol}}','{{amphor}}','{{province}}','{{harvester_number1}}','{{que}}'"
            strMustache += "),";
            strMustache += '{{/.}}';
            

            var result_val = mustache.render(strMustache, xar);
            result_val = utl.iRmend(result_val);

            console.log(result_val);
            */
            //#endregion

            val = utl.iRmend(val);

            var column = 'stid,stid_1,project_y,oid';
            column += ',caneyear,zone,responsibl,field_id';
            column += ',farmerid,pre_name,f_name,l_name';
            column += ',area,area_law,project_sd,project_cn,project_ce,wpsend_dat,soil_name';
            //column += ',admin,status,area_gread,area_type'
            //column += ',harvester_number,harvester_number1,plant_date,farm_code,soil,terrain'
            //column += ',village,tambol,amphor,province,que';
            //,' + column + '
           // var sql = '  INSERT INTO sugarcane_farm (coordinates,properties,' + column + ')  VALUES ' + val;
          // var sql = '  INSERT INTO sugarcane_farm (coordinates,'+column+')  VALUES ' + val;
            var sql = '  INSERT INTO sugarcane_farm_unregis (coordinates,properties)  VALUES ' + val;

            ipm.db.dbname = db_sugarcane;
            db.excute(ipm, sql, function (response) {
                if (response == 'oK') {
                    console.log(response);

                }
            });

        });


    });
 }

function custom_date(dt)
{
    // dt = '01/02/2016';
    if (dt != null) {
        var ar = dt.split('/');
        dt = ar[2] + '-' + ar[1] + '-' + ar[0];
       
    }
     return dt;
}

/*
function datas(){
    var xres = {
        stid = t.STID
                    stid_1 = t.STID_1
                    project_y = t.PROJECT_Y
                    oid = t.OID_
                    caneyear = t.CaneYear
                    zone  = t.Zone
                    responsibl = t.Responsibl
                    farmerid = t.FarmerId
                    pre_name = t.PRE_NAME
                    f_name = t.F_NAME
                    l_name = t.L_NAME
                    area = t.Area
                    area_law = t.AREA_LAW
                    project_sd = t.Project_Sd
                    project_cn = t.PROJECT_CN
                    project_ce = t.PROJECT_CE
                    wpsend_dat = t.WPSEND_DAT
                    soil_name = t.SOIL_NAME
                    admin  = t.ผู้ดูแล
                    status = t.สถานะ
                    area_gread = t.เกรดพื้นที
                    area_type = t.พื้นที่เก่
                    harvester_number = t.เบอร์รถตัด
                    harvester_number1 = t.เบอร์รถต_1
                    plant_date = t.วันที่ปลูก
                    farm_code = t.รหัสแปลง
                    soil  = t.ดิน
                    terrain = t.ลักษณะภูมิ
                    village = t.หมู่บ้าน
                    tambol = t.ตำบล
                    amphor = t.อำเภอ
                    province = t.จังหวัด
                    que = t.ลงคิวการ_1
}
 }
*/

//INSERT INTO harvester_register(harvester_number, harvester_driver, type, brand,  modem_id, sim_id)
//VALUES (16, 'สำรวย ช่วยชาติ', '', 'JohnDeer',  '1010003004', '0990847058')

function get_geom(req, res)
{

   // console.log('get_geom '+JSON.stringify(req.body));
   
    var swlng1 = req.body.swlat1; //'103.888';
    var nelon2 = req.body.nelon2;  //'104.534';
    var nelat2 = req.body.nelat2;  //'16.057';
    var swlat1 = req.body.swlng1;  //'15.673';
    var zoom_level = req.body.zoom_level;
    var all_id = req.body.all_id;

//console.log('allid '+all_id);

 /*
    backend_real-2   swlat1: 13.036669323115246,
backend_real-2   swlng1: 101.2994384765625,
backend_real-2   nelat2: 14.525097701098893,
backend_real-2   nelon2: 103.10943603515625,
    
   // debugger;
    var sql = " SELECT name_t,name_e,ST_AsGeoJSON(st_point(lon,lat)) as geom,poi_type as icon FROM poi ";
    sql += " WHERE (lon >" + utl.sqote(swlng1) + " AND lon < " + utl.sqote(nelon2) + ") ";
    sql += " AND (lat <= " + utl.sqote(nelat2) + " AND lat >= " + utl.sqote(swlat1) + ") AND minzoom=" + utl.sqote(zoom_level); //limit 100";
    
    --ST_MakeEnvelope(xmin, ymin, xmax, ymax, srid);
--ST_MakeEnvelope(long_min, lat_min, long_max, lat_max, srid); 
--ST_MakeEnvelope(12.95, 43.77, 13.05, 43.88, 4326);

    */

    debugger;
    /* */
    try
    {
          var sql = ' ';
        if(all_id =='')
        {
           sql += " SELECT ID AS station_id,'farm' as station_type,st_asgeojson(coordinates) as coordinates, properties,field_id,area,pre_name||' '||f_name||' '||l_name as name_farmer FROM sugarcane_farm ";
           sql += " WHERE ST_Contains( ST_MakeEnvelope("+swlng1+","+swlat1+","+nelon2+","+nelat2+", 4326),coordinates::geometry) ";
      // AND id NOT IN(15411,15421,16027)

         // console.log(sql)
        //debugger;
        }
        else
        {
             sql += " SELECT ID AS station_id,'farm' as station_type,st_asgeojson(coordinates) as coordinates, properties,field_id,area,pre_name||' '||f_name||' '||l_name as name_farmer FROM sugarcane_farm ";
             sql += " WHERE ST_Contains( ST_MakeEnvelope("+swlng1+","+swlat1+","+nelon2+","+nelat2+", 4326),coordinates::geometry) ";
             sql += " AND id NOT IN("+all_id+") ";
            // console.log(sql)
        }
      
   
        ipm.db.dbname = db_sugarcane;
        db.get_rows(ipm, sql, function (rows)
        {
           // console.log('get_geom '+rows.length);
            if (rows.length > 0)
            {
            
                var strMustache = '{{#.}}';
                strMustache += '{';
                strMustache += ' "type": "Feature",';
                strMustache += ' "station_id": "{{station_id}}",';
                strMustache += ' "field_id": "{{field_id}}",';
                strMustache += ' "station_type":"{{station_type}}",';
                strMustache += ' "area":"{{area}}",';
                strMustache += ' "station_name":"{{name_farmer}}",';
             //   strMustache += ' "properties":{{properties}},';
                strMustache += ' "geometry":{{coordinates}}';
                strMustache += '}';
                strMustache += ',';
                strMustache += '{{/.}}';

                var result = mustache.render(strMustache, rows);
                result = utl.iRmend(result);
                var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
                final = final.replace(/&quot;/g, '"');

              //  console.log('get_geom ' + final);

               res.send(JSON.parse(final));
            }
            else
            {
                res.send([]);
            }
        });

    }catch(e){
        console.log(e.message);
    }
   

  

}


function manage_farm(req, res)
{

    var sql = ' ';

    sql += "SELECT DISTINCT st_asgeojson(coordinates) as coordinates,properties";
    sql +=",stid,farmerid,pre_name||f_name||' '||l_name as farmer_name";
    sql +=",soil,terrain ";
    sql +=",area,area_law,area_gread";
    sql +=",project_sd,project_cn,project_ce";
  //  sql +=",status";
    sql +=",tambol,amphor,province";
    sql +=" FROM sugarcane_farm limit 10";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {

            var strMustache = '{{#.}}';
            strMustache += '{';
         //   strMustache += ' "type": "Feature",';
            strMustache += ' "properties":{{properties}},';
            strMustache += ' "geometry":{{coordinates}},';
            strMustache += ' "stid": "{{stid}}",';
            strMustache += ' "farmerid": "{{farmerid}}",';
            strMustache += ' "farmer_name": "{{farmer_name}}",';
            strMustache += ' "soil": "{{soil}}",';
            strMustache += ' "terrain": "{{terrain}}",';
            strMustache += ' "area": "{{area}}",';
            strMustache += ' "area_law": "{{area_law}}",';
            strMustache += ' "area_gread": "{{area_gread}}",';

            strMustache += ' "project_sd": "{{project_sd}}",';
            strMustache += ' "project_cn": "{{project_cn}}",';
            strMustache += ' "project_ce": "{{project_ce}}",';
            strMustache += ' "tambol": "{{tambol}}",';
            strMustache += ' "amphor": "{{amphor}}",';
            strMustache += ' "province": "{{province}}"';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';

            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');

            res.send(JSON.parse(final));
        }
        else {
            res.send([]);
        }
    });
}

function get_harvester_number() {
    var sql = ' ';
      sql += "SELECT DISTINCT harvester_number  "
      sql += "FROM sugarcane_farm  "
      sql += "WHERE status='รับเข้าโครงการ'  "
      sql += "AND isnumeric(harvester_number)='t' ";
      
      ipm.db.dbname = db_sugarcane;
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

function get_harvester_name(req, res)
{
  var sql = "SELECT harvester_name,modem_id FROM harvester_register2 ORDER BY harvester_name ASC";
   ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) 
    {
         res.send(rows);
    });
}

function get_working_harvester(req,res)
{


  var db_name = req.body.fleetid; //'db_10001';
  var modem_id = req.body.modemid; //'1010003020'; //
  var start = req.body.start; // '2016-12-20 00:00';//
  var stop = req.body.stop; //'2016-12-26 23:59'; //
 

 var sql=' ';
sql += " SELECT  get_harvester_name(modem_id) as harvester_name ,idate(start_record) as start_record ";
sql += ", idate(end_record) as end_record,fn_min_to_hrs(time_use::int)as time_use  ";
sql += ", start_lonlat,end_lonlat ";
sql += ", start_loc_th, end_loc_th,start_loc_en, end_loc_en ";
sql += ", plot_code, area, name_farmer, work_in_polygon,trim(status) as status ";
sql += " FROM harvester_working_history  ";
sql += " WHERE modem_id="+utl.sqote(modem_id);
sql += " AND start_record >="+ utl.sqote(start);
sql += " AND end_record <="+ utl.sqote(stop);

/*
var sql_sum ='';
sql_sum += " SELECT iymd(date)as start_date,fn_min_to_hrs(stop::int)as stop,fn_min_to_hrs(idle::int)as idle,fn_min_to_hrs(running::int)as running,fn_min_to_hrs(cutting::int)as cutting,efficiency ";
sql_sum +=" FROM harvester_performance_working ";
sql_sum += " WHERE modem_id="+utl.sqote(modem_id);
sql_sum += " AND iymd(date) >=iymd("+ utl.sqote(start)+") "
sql_sum += " AND iymd(date) <=iymd("+ utl.sqote(stop)+") ORDER BY iymd(date) ASC"
*/

var sql_sum ='';
sql_sum += " SELECT fn_min_to_hrs(SUM(stop::int)::int)as stop ";
sql_sum += ",fn_min_to_hrs(SUM(idle::int)::int)as idle ";
sql_sum += ",fn_min_to_hrs(SUM(running::int)::int)as running ";
sql_sum += ",fn_min_to_hrs(SUM(cutting::int)::int)as cutting ";
sql_sum += ",iround( ((SUM(cutting::float)/(SUM(idle::int) +SUM(running::int)+SUM(cutting::int))  ";
sql_sum += " )*100 ),3) as efficiency ";
sql_sum += " FROM harvester_performance_working  ";
sql_sum += " WHERE modem_id="+utl.sqote(modem_id);
sql_sum += " AND iymd(date) >= iymd("+utl.sqote(start)+")";
sql_sum += " AND iymd(date) <= iymd("+utl.sqote(stop)+")";

    var step1 =false; var step2 =false;

   var detail = { 'rows': '', 'sum': '' };

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (_rows) 
    {
        if (_rows.length > 0) 
        {
            detail.rows = _rows;
            step1 = true;
            final();
        }
        else 
        {
            step1 = true;
            detail.rows = [];
            final();
        }
    });


     ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql_sum, function (_rows) 
    {
        if (_rows.length > 0) 
        {
            detail.sum = _rows;
            step2 = true;
            final();
        }
        else {
            detail.sum = [];
            step2 = true;
            final();
        }
    });

    function final()
    {
        if(step1==true && step2==true)
        {
            res.send(detail);
        }
    }

}

function get_working_tankwater_group(req,res)
{
  var db_name = req.body.fleetid; //'db_10003';//
  var start = req.body.start; // '2017-01-31 00:00';//
  var stop = req.body.stop; //'2017-01-31 23:59'; //

 var sql=' ';
 sql += "   WITH res as ( ";
 sql += "   SELECT ";
 sql += "   get_tankwater_name (modem_id) AS vehicle_name";
 sql += "   ,fn_min_to_hrs(SUM(stop::int)::int)as stop ";
 sql += "   ,fn_min_to_hrs(SUM(idle::int)::int)as idle ";
 sql += "   ,fn_min_to_hrs(SUM(running::int)::int)as running ";
 sql += "   ,fn_min_to_hrs(SUM(cutting::int)::int)as splash_water"; 
 sql += "   ,iround( ((SUM(cutting::float)/(SUM(idle::int) +SUM(running::int)+SUM(cutting::int)) )*100 ),3) as efficiency "; 
 sql += "    ,modem_id ";
 sql += "    ,idate(date) as date_process ";
 sql += "    FROM tankwater_performance_working ";
 sql += "    WHERE date >="+ utl.sqote(start);
 sql += "    AND date <="+ utl.sqote(stop);
 sql += "    GROUP BY modem_id,date";
 sql += "    ) ";
 sql += "   SELECT vehicle_name,date_process,stop,idle,running,splash_water,efficiency ";
 sql += "   FROM res ORDER BY vehicle_name";

   ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (_rows) 
    {
        if (_rows.length > 0) 
        {
            res.send(_rows);
        }
        else 
        {
            res.send([]);
        }
    });

}


function get_working_tankwater(req,res)
{


  var db_name = req.body.fleetid; //'db_10003';//
  var modem_id = req.body.modemid; //'1010003076'; //
  var start = req.body.start; // '2017-01-31 00:00';//
  var stop = req.body.stop; //'2017-01-31 23:59'; //
 

 var sql=' ';
sql += " SELECT  get_tankwater_name(modem_id) as vehicle_name ,idate(start_record) as start_record ";
sql += ", idate(end_record) as end_record,fn_min_to_hrs(time_use::int)as time_use  ";
sql += ", start_lonlat,end_lonlat ";
sql += ", start_loc_th, end_loc_th,start_loc_en, end_loc_en ";
sql += ",trim(status) as status ";
sql += ",avg_speed,max_speed ";
sql += ", plot_code||' '||name_farmer as name_farmer "
sql += ", CASE WHEN avg_speed > '5' THEN '1' ELSE '0' END as is_splash_hold_farm ";
sql += " FROM tankwater_working_history   ";
sql += " WHERE modem_id="+utl.sqote(modem_id);
sql += " AND start_record >="+ utl.sqote(start);
sql += " AND end_record <="+ utl.sqote(stop);


var sql_sum ='';
sql_sum += " SELECT fn_min_to_hrs(SUM(stop::int)::int)as stop ";
sql_sum += ",fn_min_to_hrs(SUM(idle::int)::int)as idle ";
sql_sum += ",fn_min_to_hrs(SUM(running::int)::int)as running ";
sql_sum += ",fn_min_to_hrs(SUM(cutting::int)::int)as splash_water ";
sql_sum += ",iround( ((SUM(cutting::float)/(SUM(idle::int) +SUM(running::int)+SUM(cutting::int))  ";
sql_sum += " )*100 ),3) as efficiency ";
sql_sum += " FROM tankwater_performance_working  ";
sql_sum += " WHERE modem_id="+utl.sqote(modem_id);
sql_sum += " AND iymd(date) >= iymd("+utl.sqote(start)+")";
sql_sum += " AND iymd(date) <= iymd("+utl.sqote(stop)+")";

    var step1 =false; var step2 =false;

   var detail = { 'rows': '', 'sum': '' };

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (_rows) 
    {
        if (_rows.length > 0) 
        {
            detail.rows = _rows;
            step1 = true;
            final();
        }
        else 
        {
            step1 = true;
            detail.rows = [];
            final();
        }
    });


     ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql_sum, function (_rows) 
    {
        if (_rows.length > 0) 
        {
            detail.sum = _rows;
            step2 = true;
            final();
        }
        else {
            detail.sum = [];
            step2 = true;
            final();
        }
    });

    function final()
    {
        if(step1==true && step2==true)
        {
            res.send(detail);
        }
    }

}



function get_working_harvester_monthly(req,res)
{

//console.log(req.body)
  var db_name = req.body.fleetid; //'db_10001';
  var modem_id = req.body.modemid; //'1010003020'; //
  var year_month = req.body.year_month; // '2016-12-20 00:00';//

 

 var sql=' ';
sql += " SELECT DISTINCT plot_code,name_farmer ";
sql += " ,fn_min_to_hrs(get_timeuse_by_status(modem_id,iym(start_record),plot_code,'1')::int) as stop ";
sql += " ,fn_min_to_hrs(get_timeuse_by_status(modem_id,iym(start_record),plot_code,'2')::int) as idle ";
sql += " ,fn_min_to_hrs(get_timeuse_by_status(modem_id,iym(start_record),plot_code,'3')::int) as running ";
sql += " ,fn_min_to_hrs(get_timeuse_by_status(modem_id,iym(start_record),plot_code,'4')::int) as cutting ";
sql += " FROM harvester_working_history  ";
sql += " WHERE modem_id="+utl.sqote(modem_id);
sql += " AND iym(start_record) >="+ utl.sqote(year_month);
sql += " AND iym(end_record) <="+ utl.sqote(year_month);
//sql += " AND length(plot_code) > 0 ";


    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (_rows) 
    {
        if (_rows.length > 0) 
        {
            res.send(_rows);
        }
        else 
        {
            res.send([]);
        }
    });

}


function get_working_truck(req,res)
{


  var db_name = req.body.fleetid; //'db_10003';//
  var modem_id = req.body.modemid; //'1010003076'; //
  var start = req.body.start; // '2017-01-31 00:00';//
  var stop = req.body.stop; //'2017-01-31 23:59'; //
 

 var sql=' ';
sql += " SELECT  get_truck_name(modem_id) as truck_name ,idate(start_record) as start_record ";
sql += ", idate(end_record) as end_record,fn_min_to_hrs(time_use::int)as time_use  ";
sql += ", start_lonlat,end_lonlat ";
sql += ", start_loc_th, end_loc_th,start_loc_en, end_loc_en ";
sql += ",trim(status) as status ";
sql += " FROM truck_working_history  ";
sql += " WHERE modem_id="+utl.sqote(modem_id);
sql += " AND start_record >="+ utl.sqote(start);
sql += " AND end_record <="+ utl.sqote(stop);


var sql_sum ='';
sql_sum += " SELECT fn_min_to_hrs(SUM(stop::int)::int)as stop ";
sql_sum += ",fn_min_to_hrs(SUM(idle::int)::int)as idle ";
sql_sum += ",fn_min_to_hrs(SUM(running::int)::int)as running ";
sql_sum += ",fn_min_to_hrs(SUM(cutting::int)::int)as cutting ";
sql_sum += ",iround( ((SUM(cutting::float)/(SUM(idle::int) +SUM(running::int)+SUM(cutting::int))  ";
sql_sum += " )*100 ),3) as efficiency ";
sql_sum += " FROM truck_performance_working  ";
sql_sum += " WHERE modem_id="+utl.sqote(modem_id);
sql_sum += " AND iymd(date) >= iymd("+utl.sqote(start)+")";
sql_sum += " AND iymd(date) <= iymd("+utl.sqote(stop)+")";

    var step1 =false; var step2 =false;

   var detail = { 'rows': '', 'sum': '' };

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (_rows) 
    {
        if (_rows.length > 0) 
        {
            detail.rows = _rows;
            step1 = true;
            final();
        }
        else 
        {
            step1 = true;
            detail.rows = [];
            final();
        }
    });


     ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql_sum, function (_rows) 
    {
        if (_rows.length > 0) 
        {
            detail.sum = _rows;
            step2 = true;
            final();
        }
        else {
            detail.sum = [];
            step2 = true;
            final();
        }
    });

    function final()
    {
        if(step1==true && step2==true)
        {
            res.send(detail);
        }
    }

}


function get_report_speed(req,res)
{

  var db_name = req.body.fleetid; //'db_10001';
  var modem_id = req.body.modemid; //'1010003020'; //
  var start = req.body.start; // '2017-01-08 00:00';//
  var stop = req.body.stop; //'2017-01-08 23:59'; //
  var speed_over = 5;//req.body.speed_over;  //5

   var sql=' ';
   sql += "  SELECT get_harvester_name(modem_id) as get_harvester_name,idate(gps_datetime) as gps_datetime,speed ";
   sql += "  ,CASE  WHEN CAST(input_status as int)=3 OR CAST(input_status as int)=4 THEN '3' WHEN input_status='5' THEN '5' WHEN input_status='7' THEN '7'  ELSE status END status ";
   sql += "  ,tambol||':'||amphur||':'||province as locations_th ";
   sql += "  ,etambol||':'||eamphur||':'||eprovince as locations_en,lat,lon ";
   sql += "  FROM ht_"+modem_id;
   sql += "  WHERE gps_datetime >="+utl.sqote(start);
   sql += "  AND gps_datetime <="+utl.sqote(stop);
   sql += "  and speed >= "+utl.sqote(speed_over);
   sql += "  ORDER BY gps_datetime ASC ";

     ipm.db.dbname = db_owner;
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


function isToday(momentDate) {
    var TODAY = utl.timenow();
    return moment(momentDate).isSame(TODAY, 'd');
}

function get_report_avg_speed(req,res)
{
    debugger;
  var db_name = req.body.fleetid; //'db_10003';//
  var start = req.body.start; // '2017-01-25 00:00';//
  var stop = req.body.stop; //'2017-01-26 23:59'; // 

 // if(moment(engagementDate).isSame(today, 'day'))
   var is_today_start =  isToday(start);
   var is_today_stop = isToday(stop);
   var iTODAY = utl.format_date(utl.timenow()); //'2017-01-26'

   if(is_today_start || is_today_stop)
   {
     jrp_today.clear_report_today(iTODAY,function(is_clr_fin)
     {
         debugger;
         if(is_clr_fin)
         {
            jrp_today.process_report_avg_speed_today(iTODAY,function(xres)
            {
                    if(xres)
                    {
                    var sql=' ';
                    sql += " SELECT get_ymd(date_process) as date_process, get_harvester_name(modem_id) as harvester_name";
                    sql += " ,avg_00, avg_01, avg_02, avg_03, avg_04, avg_05 , avg_06, avg_07, avg_08, avg_09, avg_10,avg_11, avg_12 "; 
                    sql += " ,avg_13, avg_14, avg_15, avg_16, avg_17, avg_18  ,avg_19, avg_20, avg_21, avg_22, avg_23";
                    sql += " FROM harvester_avg_speed_report ";
                    sql += " WHERE iymd(date_process) >= iymd("+utl.sqote(start)+") AND iymd(date_process) <= iymd("+utl.sqote(stop)+") ";
                    sql += " ORDER BY get_harvester_name(modem_id),get_ymd(date_process) ";

                        ipm.db.dbname = db_sugarcane;
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
                });
         }
         else{
              res.send([]);
         }
         
            
     })
               
            
        
   }
   else
   {

            var sql=' ';
    sql += " SELECT get_ymd(date_process) as date_process, get_harvester_name(modem_id) as harvester_name";
    sql += " ,avg_00, avg_01, avg_02, avg_03, avg_04, avg_05 , avg_06, avg_07, avg_08, avg_09, avg_10,avg_11, avg_12 "; 
    sql += " ,avg_13, avg_14, avg_15, avg_16, avg_17, avg_18  ,avg_19, avg_20, avg_21, avg_22, avg_23";
    sql += " FROM harvester_avg_speed_report ";
    sql += " WHERE iymd(date_process) >= iymd("+utl.sqote(start)+") AND iymd(date_process) <= iymd("+utl.sqote(stop)+") ";
    sql += " ORDER BY get_harvester_name(modem_id),get_ymd(date_process) ";

        ipm.db.dbname = db_sugarcane;
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


}


function get_tankwater_report_avg_speed(req,res)
{
    debugger;
  var modem_id = req.body.modemid; //'1010003020'; //
  var start = req.body.start; // '2017-01-25 00:00';//
  var stop = req.body.stop; //'2017-01-26 23:59'; // 

 // if(moment(engagementDate).isSame(today, 'day'))
             var sql=' ';
    sql += " SELECT get_ymd(date_process) as date_process, get_tankwater_name(modem_id) as harvester_name";
    sql += " ,avg_00, avg_01, avg_02, avg_03, avg_04, avg_05 , avg_06, avg_07, avg_08, avg_09, avg_10,avg_11, avg_12 "; 
    sql += " ,avg_13, avg_14, avg_15, avg_16, avg_17, avg_18  ,avg_19, avg_20, avg_21, avg_22, avg_23";
    sql += " FROM tankwater_avg_speed_report ";
    sql += " WHERE iymd(date_process) >= iymd("+utl.sqote(start)+") AND iymd(date_process) <= iymd("+utl.sqote(stop)+") ";
    sql += " AND modem_id="+utl.sqote(modem_id)+" ORDER BY get_tankwater_name(modem_id),get_ymd(date_process) ";

        ipm.db.dbname = db_sugarcane;
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

function get_tankwater_report_avg_speed_group(req,res)
{
    debugger;
  var db_name = req.body.fleetid; //'db_10003';//
  var start = req.body.start; // '2017-01-25 00:00';//
  var stop = req.body.stop; //'2017-01-26 23:59'; // 

 // if(moment(engagementDate).isSame(today, 'day'))
   var is_today_start =  isToday(start);
   var is_today_stop = isToday(stop);
   var iTODAY = utl.format_date(utl.timenow()); //'2017-01-26'

   if(is_today_start || is_today_stop)
   {
     jrptank_today.clear_tankwater_report_today(iTODAY,function(is_clr_fin)
     {
         debugger;
         if(is_clr_fin)
         {
            jrptank_today.process_tankwater_report_avg_speed_today(iTODAY,function(xres)
            {
                    if(xres)
                    {
                    var sql=' ';
                    sql += " SELECT get_ymd(date_process) as date_process, get_tankwater_name(modem_id) as harvester_name";
                    sql += " ,avg_00, avg_01, avg_02, avg_03, avg_04, avg_05 , avg_06, avg_07, avg_08, avg_09, avg_10,avg_11, avg_12 "; 
                    sql += " ,avg_13, avg_14, avg_15, avg_16, avg_17, avg_18  ,avg_19, avg_20, avg_21, avg_22, avg_23";
                    sql += " FROM tankwater_avg_speed_report";
                    sql += " WHERE iymd(date_process) >= iymd("+utl.sqote(start)+") AND iymd(date_process) <= iymd("+utl.sqote(stop)+") ";
                    sql += " ORDER BY get_tankwater_name(modem_id),get_ymd(date_process) ";

                        ipm.db.dbname = db_sugarcane;
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
                });
         }
         else{
              res.send([]);
         }
         
            
     })
               
            
        
   }
   else
   {

            var sql=' ';
    sql += " SELECT get_ymd(date_process) as date_process, get_tankwater_name(modem_id) as harvester_name";
    sql += " ,avg_00, avg_01, avg_02, avg_03, avg_04, avg_05 , avg_06, avg_07, avg_08, avg_09, avg_10,avg_11, avg_12 "; 
    sql += " ,avg_13, avg_14, avg_15, avg_16, avg_17, avg_18  ,avg_19, avg_20, avg_21, avg_22, avg_23";
    sql += " FROM tankwater_avg_speed_report ";
    sql += " WHERE iymd(date_process) >= iymd("+utl.sqote(start)+") AND iymd(date_process) <= iymd("+utl.sqote(stop)+") ";
    sql += " ORDER BY get_tankwater_name(modem_id),get_ymd(date_process) ";

        ipm.db.dbname = db_sugarcane;
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


}



function get_harvester_farm_details(req, res) 
{
   // var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };
    var object = { "harvest_name": '8', 'fleetname': '' };

    /*
     SELECT 
 harvester_number,que,caneyear,zone
 ,farmerid,pre_name||f_name||' '||l_name as farmer_name
,tambol,amphor,province
 ,st_asgeojson(coordinates) as coordinates
 FROM sugarcane_farm 
WHERE split_part(harvester_number, ',', 1)='8'
OR split_part(harvester_number, ',', 2)='8'
FROM sugarcane_farm 
     */

    var sql=' ';
    sql += " SELECT harvester_number,que,caneyear,zone"
    sql +=",farmerid,pre_name||f_name||' '||l_name as farmer_name"
    sql +=",tambol,amphor,province"
    sql +=",st_asgeojson(coordinates) as coordinates"
    sql +=" FROM sugarcane_farm "
    sql += " WHERE split_part(harvester_number, ',', 1)=" + utl.sqote(object.harvest_name);
    sql += " OR split_part(harvester_number, ',', 2)=" + utl.sqote(object.harvest_name);
    sql +=" ORDER BY CAST(que as int)";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });

   
}

function camera_harvester(req, res)
{
    //#region
    /*
      SELECT row_number() OVER (ORDER BY r.modem_id) as id 
,r.modem_id  ,status  ,camera_url 
,get_vehiclename(r.modem_id) as vehicle_name 
,get_carlicence(r.modem_id) as car_licence 
,idate(camera_lastupdate)as lastupdate  
FROM	realtime as r, setup_vehicle as sv 
WHERE	r.modem_id=sv.modem_id 
AND sv.fleetcode=get_fleetid('ocsb')
AND camera_url !='' 
 ORDER BY get_vehiclename(r.modem_id) 

 ,CASE  
			 WHEN CAST(input_status as int)=0 THEN '1' --stop
	     WHEN CAST(input_status as int)=2 AND speed='0' THEN '1' --stop
			 WHEN CAST(input_status as int)=1 THEN '2' --idle
			 WHEN CAST(input_status as int)=3 THEN '2' --idle
			 WHEN		CAST(input_status as int)=5 THEN '5' -- both cutting
			 WHEN		CAST(input_status as int)=7 THEN '7' --lower cuttting
--ELSE status 
END xstatus
     */
    //#endregion

    var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };

   // console.log(JSON.stringify(object))

    is_fleet_multicam(object,function(is_found)
    {
        if(is_found)
        {
            /*
            SELECT get_vehiclename(modem_id)||' '||camera_name as vehicle_name 
            ,camera_id as modem_id
            ,camera_url
            ,camera_lastupdate
            FROM master_multicam 
            */
            var sql = ' ';
            sql += " SELECT camera_id as modem_id ";
            sql += ",get_vehiclename(modem_id)||' '||camera_name as vehicle_name  "; 
            sql += ",get_carlicence(modem_id) as car_licence ";
            sql += ",idate(camera_lastupdate)as lastupdate,camera_url ";
            sql += " FROM master_multicam ";
            sql += " WHERE fleet_id='"+object.db_name+"' AND fleet_name='"+object.fleetname+"' ";
            sql += " ORDER BY camera_name ASC ";
    
            ipm.db.dbname = db_config;
            db.get_rows(ipm, sql, function (rows) {
                if (rows.length > 0) {
                    res.send(rows);
                }
                else {
                    res.send([]);
                }
            });
        }
        else
        {
            var sql = ' ';
            sql += " SELECT row_number() OVER (ORDER BY r.modem_id) as id ";
            sql += ",r.modem_id ,camera_url ";
            sql += ",CASE  WHEN CAST(input_status as int)=0 THEN '1' ";
            sql += "	   WHEN CAST(input_status as int)=2 THEN  '1' ";
            sql += "	   WHEN CAST(input_status as int)=1 THEN '2' ";
            sql += "	   WHEN CAST(input_status as int)=3 THEN '2' ";
            sql += "	   WHEN	CAST(input_status as int)=5 THEN '5' ";
            sql += "	   WHEN	CAST(input_status as int)=7 THEN '7' END as status";
          //  sql += " ELSE status END as status "
           // sql += ",CASE WHEN input_status ='3' OR input_status='4'  THEN '3' WHEN input_status='5' THEN '5' WHEN input_status='7' THEN '7' ELSE  status end as status  ";
            sql += ",get_vehiclename(r.modem_id) as vehicle_name ";
            sql += ",get_carlicence(r.modem_id) as car_licence ";
            sql += " ,idate(camera_lastupdate)as lastupdate  ";
          
            sql += " FROM	realtime as r, setup_vehicle as sv ";
            sql += " WHERE	r.modem_id=sv.modem_id ";
            sql += " AND sv.fleetcode=get_fleetid(" + utl.sqote(object.fleetname) + ")";
            sql += " AND camera_url !='' ";
            sql += " ORDER BY get_vehiclename(r.modem_id) ";
        
            ipm.db.dbname = db_config;
            db.get_rows(ipm, sql, function (rows) {
                if (rows.length > 0) {
                    res.send(rows);
                }
                else {
                    res.send([]);
                }
            });
        }
    })

}

function is_fleet_multicam(object,callback)
{
    //SELECT db_name,fleet_name FROM master_multicam_login WHERE db_name='db_10005' AND fleet_name='pec'
   var sql="SELECT db_name,fleet_name FROM master_multicam_login WHERE db_name='"+object.db_name+"' AND fleet_name='"+object.fleetname+"' ";
    
   ipm.db.dbname = db_config;
   db.get_rows(ipm, sql, function (rows) 
   {
       if (rows.length > 0) 
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


//#region Camera

function set_urlcamera(req, res)
{
    //debugger;
    var para =  req.body;
   //  var para =  { fleetid: 'db_10005', url: 'https://ulxdriugto.localtunnel.me', camera_id: '1010003004' }
    var tnow = utl.timenow();

    var query = squel.update()
        .table('realtime')
        .set('camera_lastupdate', tnow)
        .set('camera_url', para.url)
        .where('modem_id = ' + utl.sqote(para.camera_id))
        .toString();

    var sql = "SELECT CASE CAST(input_status as int) WHEN 5 THEN '3' ELSE status END status FROM realtime WHERE modem_id=" + utl.sqote(para.camera_id);


    ipm.db.dbname = db_owner;
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            db.get_rows(ipm, sql, function (rows) {
                if (rows.length > 0) {
                    //debugger;
                    final(rows[0]['status']);
                }
            });
        }
        
    });

  


   // final(3);

    function final(status)
    {
        debugger;
        var message_json = {
            "fleet_id": "db_10003"
            , "status": status
            , "lastupdate": tnow
            , "url": para.url
            , "modem_id": para.camera_id
            , 'header': 'noti_camera'
        }

        console.log(message_json);

        send_sockio(api_noticamera, message_json, function (xres) {

            ipm.db.dbname = db_config;
            db.excute(ipm, query, function (response) {
                if (response == 'oK') {
                    res.send('ok');
                }
                else {
                    res.send('fail');
                }
            });
        });
    }

   
}

function exute_inside(query,callback)
{
    ipm.db.dbname = db_config;
    db.ccc(ipm, query, function (response) 
    {
        callback(response);
        return;
    });
}


function set_urlcamera_x(req, res)
{
    //debugger;
    var para =  req.body;
   //  var para =  { fleetid: 'db_10005', urlx: 'https://ulxdriugto.localtunnel.me', camera_id: '1010003004' }
   //console.log(para)
    var tnow = utl.timenow();
    //console.log(para);
    var query = squel.update()
        .table('realtime')
        .set('camera_lastupdate', tnow)
        .set('camera_url', para.url)
        .where('modem_id = ' + utl.sqote(para.camera_id))
        .toString();

    var sql = "SELECT  status FROM realtime WHERE modem_id=" + utl.sqote(para.camera_id);


    ipm.db.dbname = para.fleetid;
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            db.get_rows(ipm, sql, function (rows) 
            {
                if (rows.length > 0) 
                {
                    //debugger;
                    exute_inside(query,function(xres)
                    {
                        final(rows[0]['status']);
                    });
                   
                    
                }
            });
        }
        
    });


    //track_rp_camera_change


   // final(3);

    function final(status)
    {
        debugger;
        var message_json = {
            "fleet_id": para.fleetid
            , "status": status
            , "lastupdate": tnow
            , "url": para.url
            , "modem_id": para.camera_id
            , 'header': 'noti_camera'
        }

        var query_insert = squel.insert()
        .into('track_rp_camera_change')
        .set('fleet_id', para.fleet_id)
        .set('status', status)
        .set('camera_lastupdate', tnow)
        .set('camera_url', para.url)
        .set('modem_id', para.camera_id)
        .toString();
    

     //   console.log(message_json);

        send_sockio(api_noticamera, message_json, function (xres) 
        {

            ipm.db.dbname = para.fleetid;
            db.excute(ipm, query, function (response) 
            {
                if (response == 'oK') 
                {
                    console.log('set_urlcamera_x '+query_insert);
                    exute_inside(query_insert,function(xre)
                    {
                        res.send('ok');
                    })
                   
                }
                else 
                {
                    res.send('fail');
                }
            });
        });
    }

   
}

function set_url_multicamera(req, res)
{
    //debugger;
    var para =  req.body;
   //  var para =  { fleetid: 'db_10005', urlx: 'https://ulxdriugto.localtunnel.me', camera_id: '1010003004' }
   /*
   var para =  { fleet_id: 'db_10005',
   status: '2',
  lastupdate: '2019-07-22 06:47:36',
url: 'https://9a978a68.ngrok.io',
 modem_id: '1010005002',
 camera_id: '1010005002_1' }
 */

   console.log('set_url_multicamera'+JSON.stringify(para))

    var tnow = utl.timenow();
    //console.log(para);
    var query = squel.update()
        .table('master_multicam')
        .set('camera_lastupdate', tnow)
        .set('camera_url', para.url)
        .where('camera_id = ' + utl.sqote(para.camera_id))
        .toString();

    var sql = "SELECT  status FROM realtime WHERE modem_id=" + utl.sqote(para.modem_id);


    ipm.db.dbname = db_config;//para.fleetid;
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            db.get_rows(ipm, sql, function (rows) 
            {
                if (rows.length > 0) 
                {
                    //debugger;
                  //  exute_inside(query);
                    final(rows[0]['status']);
                    
                }
            });
        }
        
    });



   // final(3);

    function final(status)
    {
        debugger;
        var message_json = {
            "fleet_id": para.fleetid
            , "status": status
            , "lastupdate": tnow
            , "url": para.url
            , "modem_id": para.modem_id
            , 'header': 'noti_camera'
        }

        console.log(message_json);

        send_sockio(api_noticamera, message_json, function (xres) 
        {
            console.log('final set_url_multicamera '+JSON.stringify(xres))
            res.send('ok');
           // res.send(xres);
            /*
            ipm.db.dbname = para.fleetid;
            db.excute(ipm, query, function (response) 
            {
                if (response == 'oK') 
                {
                    res.send('ok');
                }
                else 
                {
                    res.send('fail');
                }
            });
            */
        });
    }

   
}


function retrive_image(req, res)
{
    debugger;
    var modem_id = req.body.camera_id;
    var file_name = req.body.file_name;
    var base64 = req.body.file;


    var dir = path.join(__dirname, '/Service_SugarCane/pi_image/'+modem_id)

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }


    var savePath = path.join(__dirname, '/Service_SugarCane/pi_image/' + modem_id+'/'+ file_name)
    fs.writeFile(savePath, base64, { encoding: 'base64' }, function (err)
    {
        if (err)
        {
            console.log(err);  
        }
        console.log('File created');
    });

}

function pi_is_infarm(req, res) 
{
    debugger;
   var para = req.body;
  //  console.log(para.camera_id);
    // console.log(para.fleetid);
   // var camera_id = '19' //1010003019

    var sql = " SELECT COUNT(htt_status_operation) FROM realtime WHERE input_status='5' AND htt_status_operation='CUTTING_AND_LOADING' AND modem_id=" + utl.sqote(para.camera_id) + ';'
     //check db has inside farm and status 5 return trun
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
       var xresult =  rows[0].count == 1 ? true : false;
        //console.log(rows);
       var result = { 'camera_id': para.camera_id, 'is_infarm': true, 'is_cutting_loading': xresult, 'server_version': 1 };
        res.send(result);
        return;
    });


}

function list_image_playback(req, res)
{
  //var modem_id ='1010003025'
  var modem_id = req.body.modemid;
  var dir = path.join(__dirname, '/Service_SugarCane/pi_image/' + modem_id+'/');
   var ar=[];
    fs.readdir(dir, function (err, files) 
    {
        if (err) {
            throw err;
        }
          //  ar.push(files);
       // console.log(files);
       res.send(files);
   });
}

function get_image_playback(req, res)
{

/*2017-01-15 12:49:00 image picture
SELECT * FROM ht_1010003025 WHERE gps_datetime >= '2017-01-15 12:48:00'
AND gps_datetime <= '2017-01-15 12:49:00'
AND input_status='5'
ORDER BY gps_datetime ASC
LIMIT 1
 */
//
 //read image file
  //var file_name ='19-20170104063700-snapshot.jpg';
  //var modem_id ='1010003047'
var modem_id = req.body.modemid;
var file_name = req.body.file_name;

  var xpath = path.join(__dirname, '/Service_SugarCane/pi_image/' + modem_id+'/'+file_name);

    fs.readFile(xpath, function(err, data){
        
        //error handle
        if(err) res.status(500).send(err);
        
        //get image file extension name
        var extensionName = path.extname(xpath);
        
        //convert image file to base64-encoded string
        var base64Image = new Buffer(data, 'binary').toString('base64');
        
        //combine all strings
        var imgSrcString = "data:image/"+extensionName.split('.').pop()+';base64,'+base64Image;
        
       // console.log(imgSrcString);
         res.send(imgSrcString);
        //send image src string into jade compiler
       // res.render('index', {imgSrcString: imgSrcString});
    })
//});

}

//#endregion

function send_sockio(api_name, message_json, callback)
{
    debugger;
    //noti/db_10002/ความเร็วเกินกำหนด125
    //var api_name ='trackingio';
    //var json = {
    //    "fleet_id": "db_10002",
    //    "message": "รถเข้าสถานีzzz"
    //}

    iPost(api_name, message_json, function (response) {
        debugger;
        //  console.log('send_to_sockio ' + response);
        callback(response);
        return;
    });

}

function iPost(url, JsonBody, callback) {
    request({
        uri: url,
        json: true,
        method: "POST",
        body: JsonBody
    }, function (error, response, body) {

        if (error) {
            console.log("err iPost : " + error.message);
        }
        callback(body);
        return;
    });
}

function check_camera(req, res)
{
   var id = req.params.harvester_number;
      var sql ='';
   sql =" SELECT DISTINCT get_vehiclename(x.modem_id) ";
   sql +=" ,x.modem_id,x.sim,camera_url,idate(camera_lastupdate) as camera_lastupdate,idate(gps_datetime) as gps_datetime ";
   sql +=",CAST(input_status as int),CASE CAST(input_status as int) WHEN 5 THEN '3' ELSE status END status ";
   sql +=",analog_input1,fuelempty,fuelfull ";
   sql +=" FROM realtime,master_config_vehicle as x ";
   sql +=" WHERE camera_url !='' AND get_vehiclename(x.modem_id)='รถตัด_'||"+id+" AND x.modem_id=realtime.modem_id ORDER BY get_vehiclename(x.modem_id)  ";

var options = {
  noColor: true
  ,indent:4
};

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
            if (rows.length > 0)
            {
            // res.setHeader('Content-Type', 'application/json');
            // res.send(rows);
            res.send( prettyjson.render(rows, options));
           // console.log(prettyjson.render(rows, options))
            }
    });
}

function check_camerax(req, res)
{
   var id = req.params.modem_id;
 var sql ='';
 sql =" SELECT modem_id,camera_url,idate(camera_lastupdate) as camera_lastupdate,idate(gps_datetime) as gps_datetime";
 sql +=",analog_input1,analog_input2,status,input_status  FROM realtime WHERE   modem_id='"+id+"' ";

 db_name =  'db_'+ utl.Mid(id,3,5);


var options = {
  noColor: true
  ,indent:4
};

/* */

    ipm.db.dbname = db_config;//db_name;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
            if (rows.length > 0)
            {
            // res.setHeader('Content-Type', 'application/json');
            // res.send(rows);
            res.send( prettyjson.render(rows, options));
           // console.log(prettyjson.render(rows, options))
            }
    });
   
}


function check_status(req, res)
{
    var object = { "db_name": req.params.db_name, 'modem_id': req.params.modem_id,'input_status': req.params.input_status  };

   var sql ='';
 //   if(object.status !=null)
   // { WHERE input_status="+utl.sqote(object.input_status)+"
      sql ="SELECT idate(gps_datetime) as gps_datetime,input_status,status,analog_input1 FROM ht_"+object.modem_id+"  ORDER BY gps_datetime DESC";
 
   // }else{
   //  sql ="SELECT idate(gps_datetime) as gps_datetime,input_status,status FROM ht_"+object.modem_id+" WHERE input_status='5' ORDER BY gps_datetime DESC";
 
   // }
 
     ipm.db.dbname = object.db_name;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
            if (rows.length > 0)
            {
             res.send(rows);
            }else{
                 res.send('no data');
            }
    });

}

function check_maxdevice(req, res)
{
    var sql='';
var object = { "db_name": req.params.db_name,'type_device': req.params.type_device };
    switch(object.type_device){
        case "U1" : { sql ="SELECT max(modem_id) FROM realtime WHERE substr(modem_id,'0',3)='10'"; }break;
        case "UE" : { sql="SELECT max(modem_id) FROM realtime WHERE substr(modem_id,'0',3)='20'"; }break;
    }
  
     ipm.db.dbname = object.db_name;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
            if (rows.length > 0)
            {
             res.send(rows);
            }else{
                 res.send('no data');
            }
    });


}

function check_all_vehicle(req, res)
{
    var sql ='';
    sql =" SELECT get_fleet_name(db_name) as fleetname";
    sql +=" ,modem_id,idate(time_inserver) as last_time,idate(time_config) as time_config";
    sql +=" ,vehiclename,carlicence,db_name,sim";
    sql +=" ,COALESCE(sim_camera,'') as sim_camera";
    sql +=",COALESCE(is_calculate_fuel,'') as is_calculate_fuel";
    sql +=",COALESCE(has_card_reader,'') as has_card_reader";
    sql +=",COALESCE(dlt_vehicle_id,'') as dlt_vehicle_id";
    sql +=",COALESCE(dlt_vehicle_type,'') as dlt_vehicle_type";
    sql +=",COALESCE(dlt_vehicle_chassis_no,'') as dlt_vehicle_chassis_no";
    sql +=",COALESCE(dlt_vehicle_register_type,'') as dlt_vehicle_register_type";
    sql +=",COALESCE(dlt_card_reader,'') as dlt_card_reader";
    sql +=",COALESCE(dlt_province_code,'') as dlt_province_code";
    sql +=",COALESCE(dlt_model_id,'') as dlt_model_id";
    sql +=",COALESCE(dlt_result,'') as dlt_result";
    sql +=" FROM master_config_vehicle ";
    sql +=" ORDER BY db_name ASC ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows)
    {
        res.send(rows);
    });
}


function get_row_sum(db_config,sql1, sql2, callback)
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

function get_tractor_name(req, res)
{
    var sql ="SELECT truck_name as vehicle_name,modem_id FROM truck_register2 ORDER BY modem_id";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
            if (rows.length > 0)
            {
             res.send(rows);
            }
    });
}

function get_tankwater_name(req, res)
{
    var sql ="SELECT vehiclename as vehicle_name,modem_id FROM tankwater_register ORDER BY modem_id";

    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
            if (rows.length > 0)
            {
             res.send(rows);
            }
    });
}


function get_poi(req, res)
{

/*
    var swlng1 = '103.888';
    var nelon2 = '104.534';
    var nelat2 = '16.057';
    var swlat1 = '15.673';
    */
    var swlng1 = req.body.swlat1; //'103.888';
    var nelon2 = req.body.nelon2;  //'104.534';
    var nelat2 = req.body.nelat2;  //'16.057';
    var swlat1 = req.body.swlng1;  //'15.673';
    var zoom_level = req.body.zoom_level;
 
   // debugger;
    var sql = " SELECT name_t,name_e,ST_AsGeoJSON(st_point(lon,lat)) as geom,poi_type as icon FROM poi ";
    sql += " WHERE (lon >" + utl.sqote(swlng1) + " AND lon < " + utl.sqote(nelon2) + ") ";
    sql += " AND (lat <= " + utl.sqote(nelat2) + " AND lat >= " + utl.sqote(swlat1) + ") AND minzoom=" + utl.sqote(zoom_level); //limit 100";

    ipm.db.dbname = 'admin_point';
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0)
        {
            /*
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  -38.3613558,
                  -8.8044875
                ]
              },
              "properties": {
                "Ordem": "193",
                "Eixo": "Leste",
                "Meta": "1L",
                "Municipio": "Petrolândia",
                "Estado": "PE",
                "Nome da Comunidade": "Agrovila 4"
              }
             */
            //res.send(rows);

            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "icon": "{{icon}}",';
            strMustache += ' "properties": {"name_t": "{{name_t}}","name_e": "{{name_e}}" },';
            strMustache += ' "geometry":  {{geom}}';
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


function get_bigfarm(req, res)
{
    /**/
    var sql = " SELECT ID AS station_id,'farm' as station_type,st_asgeojson(coordinates) as coordinates,field_id,area,pre_name||' '||f_name||' '||l_name as name_farmer FROM sugarcane_farm3 limit 10";
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows)
    {
   
        if (rows.length > 0)
        {
        
            var strMustache = '{{#.}}';
            strMustache += '{';
            strMustache += ' "type": "Feature",';
            strMustache += ' "station_id": "{{station_id}}",';
            strMustache += ' "field_id": "{{field_id}}",';
            strMustache += ' "station_type":"{{station_type}}",';
            strMustache += ' "area":"{{area}}",';
            strMustache += ' "station_name":"{{name_farmer}}",';
            strMustache += ' "properties":{ "farmer_name":"{{name_farmer}}" },';
   
            strMustache += ' "geometry":{{coordinates}}';
            strMustache += '}';
            strMustache += ',';
            strMustache += '{{/.}}';

            var result = mustache.render(strMustache, rows);
            result = utl.iRmend(result);
            var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
            final = final.replace(/&quot;/g, '"');

          //  console.log('get_geom ' + final);

           res.send(JSON.parse(final));
        }
    });
    
    //res.send(null);
}

function get_bigfarm_details(req, res)
{   
    /*
    
SELECT 
field_id,area,pre_name||' '||f_name||' '||l_name as name_farmer
,zone,farmerid,wpsend_dat
FROM sugarcane_farm3 
WHERE ST_Contains(coordinates, ST_SetSRID( ST_Point(102.0372,13.5494), 4326 ) ) LIMIT 1 
    */  
    
    var lat =  req.body.lat;
    var lon =  req.body.lon;
    var sql = "SELECT field_id,area,pre_name||' '||f_name||' '||l_name as name_farmer,zone,farmerid,wpsend_dat FROM sugarcane_farm3 WHERE ST_Contains(coordinates, ST_SetSRID( ST_Point(" + lon + "," + lat + "), 4326 ) ) LIMIT 1 ";
    ipm.db.dbname = db_sugarcane;
    db.get_rows(ipm, sql, function (rows)
    {
        if (rows.length > 0) {
            debugger;
          //  console.log(rows[0]['f_id']);
          res.send(rows);
           // return;
        } else {
            res.send([]);
           // return;
        }
    });
}


function get_report_working_harvester(req, res)
{
   // var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };

   // var modem_id = req.body.modemid; //'1010001004';
    var start = req.body.start; // '2018-02-16 00:00';
    var stop = req.body.stop; //'2018-02-18 02:59';
    var when_speed_over ='10'
    var minute_moving_run_over ='30'
    
    var sql = "";
 sql += " WITH res as ( ";
 sql += " SELECT modem_id,harvester_name ";
 sql += "   ,COALESCE(idate(get_start_cutting_times(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")::TIMESTAMP),'') as start_open_cutting ";
 sql += "   ,COALESCE(idate(get_end_cutting_times(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")::TIMESTAMP),'') as stop_open_cutting ";
 sql += "   ,TO_CHAR((get_all_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") || 'minute')::interval, 'HH24:MI:SS') as all_cutting ";
 sql += "   ,TO_CHAR((get_hight_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")|| 'minute')::interval, 'HH24:MI:SS') as lowhight_cutting ";
 sql += "   ,TO_CHAR((get_lower_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")|| 'minute')::interval, 'HH24:MI:SS') as low_cutting ";
 sql += "   ,TO_CHAR((get_down_engine(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")|| 'minute')::interval, 'HH24:MI:SS') as down_engine ";
 sql += "   ,COALESCE(idate(get_start_time_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+")::TIMESTAMP),'') as start_time_move ";
 sql += "   ,COALESCE(idate(get_stop_time_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+")::TIMESTAMP),'') as stop_time_move ";
 sql += "   ,CASE WHEN get_timefirst_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+") IS NOT NULL ";
 sql += "    THEN get_time_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+")  ";
 sql += "    ELSE '0' END as moving ";
 sql += "    FROM harvester_register2  ";
 sql += "   ORDER BY harvester_name ) ";
    
 sql += "   SELECT  ";
 sql += "       modem_id,harvester_name ";
 sql += "   ,start_open_cutting,stop_open_cutting,all_cutting,lowhight_cutting,low_cutting,down_engine ";
 sql += "       ,CASE WHEN moving::int >"+minute_moving_run_over+" THEN start_time_move ELSE '' END as start_time_movefarm ";
 sql += "       ,CASE WHEN moving::int >"+minute_moving_run_over+" THEN stop_time_move ELSE '' END as stop_time_movefarm ";
 sql += "       ,CASE WHEN moving::int >"+minute_moving_run_over+" THEN TO_CHAR((moving||'minute')::interval, 'HH24:MI:SS') ELSE '' END as total_time_move ";
 sql += "   FROM res ";

 var sql2 = "";
 sql2 += " WITH res as ( ";
 sql2 +=" SELECT ";
 sql2 +="    get_all_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") as all_cutting ";
 sql2 +="   ,get_hight_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") as lowhight_cutting ";
 sql2 +="   ,get_lower_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") as low_cutting ";
 sql2 +="   ,get_down_engine(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") as down_engine ";
 sql2 +="   ,get_time_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+") AS moving ";
 sql2 +="    FROM harvester_register2 ";
 sql2 +="   ORDER BY harvester_name ) ";
    
 sql2 +="   SELECT  ";
 sql2 +="    TO_CHAR((SUM(all_cutting::int)|| 'minute')::interval, 'HH24:MI:SS') as total_all_cutting ";
 sql2 +="   ,TO_CHAR((SUM(lowhight_cutting::int)|| 'minute')::interval, 'HH24:MI:SS') as sum_lowhight_cutting ";
 sql2 +="   ,TO_CHAR((SUM(low_cutting::int)|| 'minute')::interval, 'HH24:MI:SS') as sum_low_cutting ";
 sql2 +="   ,TO_CHAR((SUM(down_engine::int)|| 'minute')::interval, 'HH24:MI:SS') as down_engine "; 
 sql2 +="   FROM res ";


 get_row_sum(db_sugarcane,sql,sql2,function(result){
    res.send(result);
 })


}

function get_report_working_harvester_by_vehicle(req, res)
{
   // var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };

   // var modem_id = req.body.modemid; //'1010001004';
    var start = req.body.start; // '2018-02-16 00:00';
    var stop = req.body.stop; //'2018-02-18 02:59';
    var when_speed_over ='10'
    var minute_moving_run_over ='30'
    var list_modem_id = req.body.list_modem_id;// "'1010003015','1010003016','1010003150'";
    
    var sql = "";
 sql += " WITH res as ( ";
 sql += " SELECT modem_id,harvester_name ";
 sql += "   ,COALESCE(idate(get_start_cutting_times(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")::TIMESTAMP),'') as start_open_cutting ";
 sql += "   ,COALESCE(idate(get_end_cutting_times(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")::TIMESTAMP),'') as stop_open_cutting ";
 sql += "   ,TO_CHAR((get_all_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") || 'minute')::interval, 'HH24:MI:SS') as all_cutting ";
 sql += "   ,TO_CHAR((get_hight_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")|| 'minute')::interval, 'HH24:MI:SS') as lowhight_cutting ";
 sql += "   ,TO_CHAR((get_lower_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")|| 'minute')::interval, 'HH24:MI:SS') as low_cutting ";
 sql += "   ,TO_CHAR((get_down_engine(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+")|| 'minute')::interval, 'HH24:MI:SS') as down_engine ";
 sql += "   ,COALESCE(idate(get_start_time_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+")::TIMESTAMP),'') as start_time_move ";
 sql += "   ,COALESCE(idate(get_stop_time_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+")::TIMESTAMP),'') as stop_time_move ";
 sql += "   ,CASE WHEN get_timefirst_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+") IS NOT NULL ";
 sql += "    THEN get_time_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+")  ";
 sql += "    ELSE '0' END as moving ";
 sql += "    FROM harvester_register2  ";
 sql += "   ORDER BY harvester_name ) ";
    
 sql += "   SELECT  ";
 sql += "       modem_id,harvester_name ";
 sql += "   ,start_open_cutting,stop_open_cutting,all_cutting,lowhight_cutting,low_cutting,down_engine ";
 sql += "       ,CASE WHEN moving::int >"+minute_moving_run_over+" THEN start_time_move ELSE '' END as start_time_movefarm ";
 sql += "       ,CASE WHEN moving::int >"+minute_moving_run_over+" THEN stop_time_move ELSE '' END as stop_time_movefarm ";
 sql += "       ,CASE WHEN moving::int >"+minute_moving_run_over+" THEN TO_CHAR((moving||'minute')::interval, 'HH24:MI:SS') ELSE '' END as total_time_move ";
 sql += "   FROM res WHERE modem_id IN("+list_modem_id+")";

 var sql2 = "";
 sql2 += " WITH res as ( ";
 sql2 +=" SELECT ";
 sql2 +="    get_all_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") as all_cutting ";
 sql2 +="   ,get_hight_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") as lowhight_cutting ";
 sql2 +="   ,get_lower_cutting(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") as low_cutting ";
 sql2 +="   ,get_down_engine(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+") as down_engine ";
 sql2 +="   ,get_time_move(modem_id,"+utl.sqote(start)+","+utl.sqote(stop)+","+utl.sqote(when_speed_over)+") AS moving ";
 sql2 +="    FROM harvester_register2 ";
 sql2 +="   ORDER BY harvester_name ) ";
    
 sql2 +="   SELECT  ";
 sql2 +="    TO_CHAR((SUM(all_cutting::int)|| 'minute')::interval, 'HH24:MI:SS') as total_all_cutting ";
 sql2 +="   ,TO_CHAR((SUM(lowhight_cutting::int)|| 'minute')::interval, 'HH24:MI:SS') as sum_lowhight_cutting ";
 sql2 +="   ,TO_CHAR((SUM(low_cutting::int)|| 'minute')::interval, 'HH24:MI:SS') as sum_low_cutting ";
 sql2 +="   ,TO_CHAR((SUM(down_engine::int)|| 'minute')::interval, 'HH24:MI:SS') as down_engine "; 
 sql2 +="   FROM res ";


 get_row_sum(db_sugarcane,sql,sql2,function(result){
    res.send(result);
 })


}

//++++++++++++++++++ รถน้ำ +++++++++++++++++++++++++

function getmaster_vehicle_tankwater(req, res)
{
    //to_char(now(), 'YYYY-MM-DD')
  // var sql = "SELECT modem_id,vehiclename as harvester_name,'"+date_process+"' as date_process FROM tankwater_register";
   
   var sql = "  SELECT r.modem_id ";
   sql += ",get_vehiclename_fleet(r.modem_id,r.fleet_id) as vehicle_name";
  // sql += ",idate(gps_datetime) as date_process ";
   sql += " FROM	realtime as r, setup_vehicle as sv";
   sql += " WHERE	r.modem_id=sv.modem_id ";
   sql += " AND r.fleet_id=sv.fleetid ";
  //AND r.modem_id='1010003082' ";
   sql += " AND sv.fleetcode=get_fleetid('watertank') ";
  // sql += " AND to_char(gps_datetime,'YYYY-MM-DD')='2018-11-08' ";

   ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (result) 
    {
      //  callback(res_ar);
      //  return;
        res.send(result); 
    });

}

function getdata_watertank(req, res)
{
  // modem_id,date_process,callback
  var modem_id = req.body.modem_id; // '2018-02-16 00:00';
  var date_process = req.body.date_time; //'2018-02-18 02:59';

    var detail = { 'data': '', 'max_time': '' };

    var sql = " SELECT modem_id,idate(gps_datetime) as gps_datetime,status,speed,lat,lon,tambol,amphur,province";
    sql += " FROM ht_"+modem_id //1010003082
    sql += " WHERE gps_datetime >'"+date_process+"'";
    sql += " ORDER BY gps_datetime LIMIT 5000";

    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (ar_data) 
    {
       // result_final.push(ar_data);

       if (ar_data.length > 0) 
       { 
        var max_datetime = linq.Enumerable.From(ar_data)
        .Select(function (x) { return x.gps_datetime })
        .Max();

          debugger;
        //  console.log(max_datetime)
          detail.data = ar_data;
          detail.max_time = max_datetime;

          res.send(detail);
         // callback(detail);
         // return;
        }
        else
        {
          //  callback([]);
           // return;
           res.send([]);
        }

    });

}

function get_realtime(req, res)
{
    var type_vehicle = req.body.type_vehicle;

    var sql = "";
    sql += " SELECT r.modem_id ";
    sql += ",get_vehiclename(r.modem_id) as vehicle_name ";
    sql += ",idate(gps_datetime)as gps_datetime,  lon, lat";
    sql += ", mileage,angle,altitude, speed";
    sql += ", satelites, input_status, status";
    sql += ", tambol, etambol, amphur";
    sql += " ,eamphur, province, eprovince";
    sql += " FROM	realtime as r, setup_vehicle as sv";
    sql += " WHERE	r.modem_id=sv.modem_id";
    sql += " AND sv.fleetcode=get_fleetid('"+type_vehicle+"')";
    sql += " AND (get_vehiclename(r.modem_id) !='1234' OR get_fleetid('dlt')!='23' )";
    sql += " ORDER BY gps_datetime DESC";
 
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (ar_data) 
    {
        res.send(ar_data);
    });

}
  

exports.get_geom = get_geom;
exports.manage_farm = manage_farm;
exports.set_urlcamera = set_urlcamera;
exports.set_urlcamera_x =set_urlcamera_x;
exports.set_url_multicamera = set_url_multicamera;


exports.retrive_image = retrive_image;
exports.pi_is_infarm = pi_is_infarm;
exports.camera_harvester = camera_harvester;

exports.list_image_playback = list_image_playback;
exports.get_image_playback = get_image_playback;

exports.get_working_truck = get_working_truck;
exports.get_working_harvester = get_working_harvester;
exports.get_working_tankwater = get_working_tankwater;
exports.get_working_tankwater_group = get_working_tankwater_group;

exports.get_working_harvester_monthly =get_working_harvester_monthly;

exports.get_tractor_name = get_tractor_name;
exports.get_tankwater_name = get_tankwater_name;
exports.get_harvester_name = get_harvester_name;

exports.get_tankwater_report_avg_speed = get_tankwater_report_avg_speed;
exports.get_tankwater_report_avg_speed_group = get_tankwater_report_avg_speed_group;

exports.get_report_avg_speed = get_report_avg_speed;
exports.get_report_speed  = get_report_speed;
exports.get_poi = get_poi;

exports.check_status = check_status;
exports.check_maxdevice =check_maxdevice;
exports.check_camera = check_camera;
exports.check_camerax = check_camerax;
exports.check_all_vehicle = check_all_vehicle;
exports.get_bigfarm = get_bigfarm;
exports.get_bigfarm_details = get_bigfarm_details;

exports.get_report_working_harvester =get_report_working_harvester;
exports.get_report_working_harvester_by_vehicle = get_report_working_harvester_by_vehicle;
   

exports.getdata_watertank = getdata_watertank;
exports.getmaster_vehicle_tankwater = getmaster_vehicle_tankwater;
exports.get_realtime = get_realtime;

/*
setTimeout(function ()
{
    //load_geojson_2_table3();
    var id='1010005007'
     utl.Mid(id,2,5);
 
   // test_unregis();
    // get_geom(' ', ' ');
    // manage_farm(' ', ' ');
   // pi_is_infarm(' ', ' ');
   // set_urlcamera(' ', ' ');
   //get_report_avg_speed(' ', ' ');
  // get_working_truck(' ', ' ');

}, 1000);

 
  */ 

 //set_url_multicamera(' ', ' ');

