

//#region modules
var fs = require('fs');
var async = require('async');
var mustache = require("mustache");
var moment = require('moment');
var encoding = require("encoding");
var squel = require("squel");
var path = require('path');
var request = require("request");

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var iutm = require('utm2latlon.js');
var linq = require('linq.js');

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
   //var path_geojson = __dirname + '/data3.geojson';
    var path_geojson = __dirname + '/xคิวรถตัดอ้อย_5960_031259_2.geojson';



   fs.readFile(path_geojson, { encoding: 'utf8' }, function (err, data) {
       // debugger;
     
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
                   // debugger;

                    val += "(ST_AsGeoJSON((ST_GeomFromText(" + latlon + ", 4326)))," + utl.sqote(properties) //+ "),";
                  //  val += "(ST_AsGeoJSON((ST_GeomFromText(" + latlon + ", 4326)))"  //+ "),";
                    /**/
                    val += "," + utl.sqote(t.STID) + "," + utl.sqote(t.STID_1) + "," + utl.sqote(t.PROJECT_Y) + "," + utl.sqote(t.OID_)
                    val += "," + utl.sqote(t.CaneYear) + "," + utl.sqote(t.Zone) + "," + utl.sqote(t.Responsibl) + "," + utl.sqote(t.FIELD_ID)
                    val += "," + utl.sqote(t.FarmerId) + "," + utl.sqote(t.PRE_NAME) + "," + utl.sqote(t.F_NAME) + "," + utl.sqote(t.L_NAME)
                    val += "," + utl.sqote(t.Area) + "," + utl.sqote(t.AREA_LAW) + "," + utl.sqote(t.Project_Sd) + "," + utl.sqote(t.PROJECT_CN) + "," + utl.sqote(t.PROJECT_CE) + "," + utl.sqote(t.WPSEND_DAT) + "," + utl.sqote(t.SOIL_NAME)

                    val += "," + utl.sqote(t.admin) + "," + utl.sqote(t.status) + "," + utl.sqote(t.area_grade) + "," + utl.sqote(t.area_type)
                    val += "," + utl.sqote(t.harvester_number) + "," + utl.sqote(t.harvester_number1) + "," + utl.sqote(t.plant_date) + "," + utl.sqote(t.farm_code) + "," + utl.sqote(t.soil) + "," + utl.sqote(t.terrain)
                    val += "," + utl.sqote(t.village) + "," + utl.sqote(t.tambol) + "," + utl.sqote(t.amphor) + "," + utl.sqote(t.province) + "," + utl.sqote(t.que)
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
            column += ',admin,status,area_gread,area_type'
            column += ',harvester_number,harvester_number1,plant_date,farm_code,soil,terrain'
            column += ',village,tambol,amphor,province,que';
            //,' + column + '
            var sql = '  INSERT INTO sugarcane_farm2 (coordinates,properties,' + column + ')  VALUES ' + val;
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
    debugger;
    try
    {
        var sql = ' ';
        sql += " SELECT ID AS station_id,'farm' as station_type,st_asgeojson(coordinates) as coordinates, properties FROM sugarcane_farm ";
        debugger;
        ipm.db.dbname = db_sugarcane;
        db.get_rows(ipm, sql, function (rows)
        {
            console.log('get_geom '+rows.length);
            if (rows.length > 0)
            {
            
                var strMustache = '{{#.}}';
                strMustache += '{';
                strMustache += ' "type": "Feature",';
                strMustache += ' "station_id": "{{station_id}}",';
                strMustache += ' "station_type": "{{station_type}}",';
                strMustache += ' "properties":{{properties}},';
                strMustache += ' "geometry":{{coordinates}}';
                strMustache += '}';
                strMustache += ',';
                strMustache += '{{/.}}';

                var result = mustache.render(strMustache, rows);
                result = utl.iRmend(result);
                var final = '{ "type":"FeatureCollection","features":[' + result + '] }';
                final = final.replace(/&quot;/g, '"');

             //   console.log('get_geom ' + final);

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
     */
    //#endregion

    var object = { "db_name": req.body.fleetid, 'fleetname': req.body.fleetname };

    var sql = ' ';
    sql += " SELECT row_number() OVER (ORDER BY r.modem_id) as id ";
    sql += ",r.modem_id  ,CASE CAST(input_status as int) WHEN 5 THEN '3' ELSE status END status  ,camera_url ";
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


//#region Camera

function set_urlcamera(req, res)
{
    //debugger;
    var para =  req.body;
   //  var para =  { fleetid: 'ocsb', url: 'https://ulxdriugto.localtunnel.me', camera_id: '1010003004' }
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


function check_status(){
    var object = { "db_name": req.body.fleetid, '': req.modem_id };
}

exports.get_geom = get_geom;
exports.manage_farm = manage_farm;
exports.set_urlcamera = set_urlcamera;
exports.retrive_image = retrive_image;
exports.pi_is_infarm = pi_is_infarm;
exports.camera_harvester = camera_harvester;

    /* 
setTimeout(function ()
{
    load_geojson_2_table3();
   // test_unregis();
    // get_geom(' ', ' ');
    // manage_farm(' ', ' ');
   // pi_is_infarm(' ', ' ');
   // set_urlcamera(' ', ' ');

}, 1000);
   */


