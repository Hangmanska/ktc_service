

var async = require('async');
var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var iutm = require('utm2latlon.js');
var fs = require('fs');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var iBuildText = require('iGenTextFile.js');

var db_sugarcane = "sugarcane_kumpawapi";

function load_geojson_2_table()
{
   // var xar = [];
   var path_geojson = __dirname + '/รอบแปลง.geojson';
   // var path_geojson = __dirname + '/xคิวรถตัดอ้อย_5960_031259_2.geojson';



   fs.readFile(path_geojson, { encoding: 'utf8' }, function (err, data) {
        debugger;
     
      //  var data = JSON.stringify(utl.Trim(data.toString()));


        data = JSON.parse(data);
     //   var array = data.toString().split('\n');

      var array  = data.features;
        var val = ' ';
        //  var i = 0;
        async.eachSeries(array, function (row, next)
        {

           //   debugger;
         //   row = utl.Trim(row);
          //  if (utcp.Contains(row, 'geometry'))
          if (row.geometry.type !='Point')
            {

                var coordinates = row.geometry.coordinates//[0];
                var properties = JSON.stringify(row.properties);

                 var t = row.properties;
                 t.name = utl.replaceAll('#', '', t.name);
             //   t.WPSEND_DAT = custom_date(t.WPSEND_DAT);//moment(t.WPSEND_DAT).format('YYYY-MM-DD');
             //   t.plant_date = custom_date(t.plant_date);

               
                iutm.iUTMXYToLatLon_kpv(coordinates, 47, function (latlon)
                {
                    debugger;

                    val = "(ST_GeomFromText(" + latlon + ", 4326))," + utl.sqote(t.name)//+",";
                    
                    next();
/*
                     var sql = '  INSERT INTO sugarcane_farm (coordinates,soil_name)  VALUES (' + val+')';
            //var sql = '  INSERT INTO sugarcane_farm (coordinates,'+column+')  VALUES ' + val;
  // iBuildText.build_text('c:\\sql.txt', sql)
                    ipm.db.dbname = db_sugarcane;
                    db.excute(ipm, sql, function (response) 
                    {
                        debugger;
                        if (response == 'oK') 
                        {
                            console.log(response);
                            next();

                        }else{
                            console.log('err');
                            next();
                        }
                    });
      */              

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
/**/
            var sql = '  INSERT INTO sugarcane_farm (coordinates,soil_name)  VALUES ' + val;
            //var sql = '  INSERT INTO sugarcane_farm (coordinates,'+column+')  VALUES ' + val;
  // iBuildText.build_text('c:\\sql2.txt', sql)
            ipm.db.dbname = db_sugarcane;
            db.excute(ipm, sql, function (response) 
            {
                if (response == 'oK') 
                {
                    console.log(response);

                }else{
                     console.log(response);
                }
            });

        });


});
    
   
}


load_geojson_2_table();