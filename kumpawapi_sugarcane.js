
var async = require('async');
var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var iutm = require('utm2latlon.js');
var fs = require('fs');

function load_geojson_2_table()
{
   // var xar = [];
   var path_geojson = __dirname +'/kmp62.geojson';//'/data.geojson';
   // var path_geojson = __dirname + '/xคิวรถตัดอ้อย_5960_031259_2.geojson';



   fs.readFile(path_geojson, { encoding: 'utf8' }, function (err, data) {
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

                var t = row.properties;
             //   t.WPSEND_DAT = custom_date(t.WPSEND_DAT);//moment(t.WPSEND_DAT).format('YYYY-MM-DD');
             //   t.plant_date = custom_date(t.plant_date);

               
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

           

            val = utl.iRmend(val);

            var column ='stid,stid_1,project_y,oid';
            column += ',caneyear,zone,responsibl,field_id';
            column += ',farmerid,pre_name,f_name,l_name';
            column += ',area,area_law,project_sd,project_cn,project_ce,wpsend_dat,soil_name';

            var sql = '  INSERT INTO sugarcane_farm3 (coordinates,properties,' + column + ')  VALUES ' + val;
            //var sql = '  INSERT INTO sugarcane_farm (coordinates,'+column+')  VALUES ' + val;

            ipm.db.dbname = db_sugarcane;
            db.excute(ipm, sql, function (response) 
            {
                if (response == 'oK') 
                {
                    console.log(response);

                }
            });

        });


});
    
   
}

load_geojson_2_table();