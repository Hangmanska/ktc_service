
var async = require('async');
var request = require('request');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var iBuildText = require('iGenTextFile.js')
var pg = require('pg');

var urlencode = require('urlencode');
var url = require('url');
var process = require('child_process');
var parse = require('csv-parse');
//var copyFrom = require('pg-copy-streams').from;

var utl = require('Utility.js');
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";

var pg_db = {
    // "host": "127.0.0.1",
     "host": "61.91.14.253", 
     "port": "5432",
     "user": "postgres",
     "pws": "cloundserver@253",
     "dbname": "master_config",
     "ip_config_file": "http://203.154.243.61/"
 }

 function setcon(db_name) {
    //debugger;
    var constring = 'postgres://' + pg_db.user + ':' + pg_db.pws + '@' + pg_db.host + ':' + pg_db.port + '/' + db_name;
    return constring;
}
 

function upload_ktc(req, res)
{
   // var fleetid = req.headers.fleetid;
    var fleetid ='db_10015';
    console.log(fleetid);
    if(fleetid=='db_10001')
    {
        var csvData=[];
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) 
        {
           // console.log( files.file);
          //  console.log(files.file.path);
          
          //  var old_path = files.file.path;
    
            fs.createReadStream(files.file.path)
            .pipe(parse({delimiter: ','}))
            .on('data', function(csvrow) 
            {
              //  console.log(csvrow);
                //do something with csvrow
                csvData.push(csvrow);       
            })
            .on('end',function() {
              //do something wiht csvData
              debugger;
             // console.log(csvData);
              async.eachSeries(csvData, function (row, next)
              {
                 // console.log(row);
                 var sql = "UPDATE master_config_vehicle SET mileage_collect="+utl.sqote(row[2])+" WHERE modem_id="+utl.sqote(row[0]);
               
                 ipm.db.dbname = db_config;
                 db.excute(ipm, sql, function (xres) 
                 {
                    if(xres)
                    {
                        next();
                    }else{
                        next();
                    }
    
                 });
    
              },function(){
                res.send(true);
              });
    
            });
    
        });
    }
    else if(fleetid=='db_10003')
    {
        var csvData=[];
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) 
        {
           // console.log( files.file);
          //  console.log(files.file.path);
          
          //  var old_path = files.file.path;
    
            fs.createReadStream(files.file.path)
            .pipe(parse({delimiter: ','}))
            .on('data', function(csvrow) 
            {
              //  console.log(csvrow);
                //do something with csvrow
                csvData.push(csvrow);       
            })
            .on('end',function() {
              //do something wiht csvData
              debugger;
             // console.log(csvData);
             var val ='';
              async.eachSeries(csvData, function (row, next)
              {
                //  console.log(row);
                // var sql = "UPDATE master_config_vehicle SET mileage_collect="+utl.sqote(row[2])+" WHERE modem_id="+utl.sqote(row[0]);
                val+= "("+utl.sqote(row[0])+","+utl.sqote(row[1])+","+utl.sqote(row[2])+"),"
                next();
    
              },function(){
                  val = utl.iRmend(val);
                  var sql="INSERT INTO farmer_details (qt,name,zone) VALUES "+val;
                 // console.log(sql);
                  /* */
                  //var db_sugarcane = ;
                  ipm.db.dbname = "sugarcane_kumpawapi";
                  db.excute(ipm, sql, function (xres) 
                  {
                     if(xres)
                     {
                        res.send(true);
                     }else{
                        res.send(true);
                     }
     
                  });
                 
                
              });
    
            });
    
        });
    }
    else if(fleetid=='db_10015')
    {
        var csvData=[];
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) 
        {
          //  console.log( files.path.path);
          //  console.log(files.file.path);
          var file_name = files.file.name //files.file.name;
          var new_path = path.join(__dirname, '/var/lib/pgsql/9.3/data/', file_name);

          fs.createReadStream(files.file.path)//files.file.path
          .pipe(parse({delimiter: ','}))
          .on('data', function(csvrow) 
          {
            //  console.log(csvrow);
              //do something with csvrow
              csvData.push(csvrow);       
          })
          .on('end',function() {

              console.log(csvData.length);
            fs.writeFile(new_path, csvData, function (err) 
            {
            });
             
          });

  
        });
    }
    else if(fleetid=='db_10011')
    {
        var csvData=[];
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) 
        {
          //  console.log( files.file);
            console.log(files.path);
          
 
          fs.readFile(files.thumbnail.path, { encoding: 'utf8' }, function (err, data) 
          {
          //  debugger;
         
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

                 var arr =   coordinates;
                  //  arr =  arr[0];
        var result =''
        for(var i=0;i<arr.length;i++)
        {
            result +=  arr[i][0]+' '+arr[i][1]+','
        }
    
        result = utl.iRmend(result);
          // result = result+arr[0][0];
    
       // console.log(result);
    
        var latlon ="ST_GeomFromText('POLYGON(("+result+"))')";
    
                    var t = row.properties;

    
                        val += "(" + latlon + "," + utl.sqote(t.Name) +"),";
                        
    
                        next();

                }
                else
                {
                    next();
                }
            
            }, function () { 
                debugger;
    
               
    
                val = utl.iRmend(val);

                var sql = '  INSERT INTO group_farm_rai (geomx,name_rai)  VALUES ' + val;
                //var sql = '  INSERT INTO sugarcane_farm (coordinates,'+column+')  VALUES ' + val;
    
                ipm.db.dbname = "sugarcane_kumpawapi";
                db.excute(ipm, sql, function (xres) 
                {
                   if(xres)
                   {
                      res.send(true);
                   }else{
                      res.send(true);
                   }
   
                });
    
            });
    
       });
    });

    


    }
   
}

exports.upload_ktc = upload_ktc;

function test_upload()
{
   var table_import = '"import_data"';
   var sql= "copy "+table_import+" from '/var/lib/pgsql/9.3/data/data_sample2.csv' WITH DELIMITER as ',' CSV;"

   ipm.db.dbname = "rttgroups";
   db.excute(ipm, sql, function (xres) 
   {
      console.log(xres)

   });
}

//test_upload();

/*
 fs.createReadStream(files.path.path)//files.file.path
            .pipe(parse({delimiter: ','}))
            .on('data', function(csvrow) 
            {
              //  console.log(csvrow);
                //do something with csvrow
                csvData.push(csvrow);       
            })
            .on('end',function() {
              //do something wiht csvData
            //  debugger;
             // console.log(csvData);
         
             var except_firstrow =false;
             var ar_row=[];
              async.eachSeries(csvData, function (row, next)
              {
                //  console.log(row);
                var val ='';
                if(except_firstrow)
                {
 // var sql = "UPDATE master_config_vehicle SET mileage_collect="+utl.sqote(row[2])+" WHERE modem_id="+utl.sqote(row[0]);
                val+= "("+utl.sqote(row[0])+","+utl.sqote(row[1])+","+utl.sqote(row[2])+","+utl.sqote(row[3])+","+utl.sqote(row[4])+","+utl.sqote(row[5])+","+utl.sqote(row[6])+","+utl.sqote(row[7])+","+utl.sqote(row[8])+","+utl.sqote(row[9])+""
                val+= ","+utl.sqote(row[10])+","+utl.sqote(row[11])+","+utl.sqote(row[12])+","+utl.sqote(row[13])+","+utl.sqote(row[14])+","+utl.sqote(row[15])+","+utl.sqote(row[16])+","+utl.sqote(row[17])+","+utl.sqote(row[18])+","+utl.sqote(row[19])+""
                val+= ","+utl.sqote(row[20])+","+utl.sqote(row[21])+","+utl.sqote(row[22])+","+utl.sqote(row[23])+","+utl.sqote(row[24])+","+utl.sqote(row[25])+","+utl.sqote(row[26])+","+utl.sqote(row[27])+","+utl.sqote(row[28])+","+utl.sqote(row[29])+""
                val+= ","+utl.sqote(row[30])+","+utl.sqote(row[31])+","+utl.sqote(row[32])+","+utl.sqote(row[33])+","+utl.sqote(row[34])+","+utl.sqote(row[35])+")"
                  next();
                  ar_row.push(val);
                 // except_firstrow = true;
                }else{
                    except_firstrow = true;
                    next();
                }
        
    
              },function(){
                  debugger;
console.log(ar_row.length)
      /*
              // var xdd = ar_row.join();//C:\_Project
           //    iBuildText.build_text('c:\\_Project\\data_text.txt', xdd)

               //  var val = utl.iRmend(xdd);
               //  var sql="INSERT INTO import_data " 
                  var sql="COPY import_data";
                  sql+="(";
                  sql+="transfer_order_no,"
                  sql+="time_of_to_created,"
                  sql+="group_number,"
                  sql+="group_name,"
                  sql+="po_number,"
                  sql+="so_number,"
                  sql+="so_type,"
                  sql+="delivery_no,"
                  sql+="do_creation_time,"
                  sql+="routing,"
                  sql+="sales_org,"
                  sql+="sold_to_party,"
                  sql+="ship_to_party,"
                  sql+="customer_name,"
                  sql+="address,"
                  sql+="province,"
                  sql+="billing_no,"
                  sql+="num_of_box,"
                  sql+="shipping_instruction,"
                  sql+="volume_unit,"
                  sql+="no_of_packages,"
                  sql+="date_of_to_created,"
                  sql+="do_creation_date,"
                  sql+="picking_date,"
                  sql+="delivery_date,"
                  sql+="actual_gi_date,"
                  sql+="invoice_date,"
                  sql+="num_of_lines_on_do,"
                  sql+="area_001,"
                  sql+="area_002,"
                  sql+="area_003,"
                  sql+="area_004,"
                  sql+="num_of_lines_on_to,"
                  sql+="total_qty_of_do,"
                  sql+="volume,"
                  sql+="total_weight"
                   sql+=")";
                   sql+="FROM "+files.path.path+'\\'+files.path.name
                   sql+=" WITH CSV HEADER delimiter ',' ";
                 // sql+="lat,"
                //  sql+="lon)"
              //   sql+= " VALUES "+val;

           
                 COPY zipcodes (zzip,ztype,primary_city
                    , acceptable_cities,unacceptable_cities
                    , state,county,ztimezone,area_codes
                    , latitude,longitude,world_region,country
                    , decommissioned,estimated_population)
                    FROM '/var/lib/pgsql/9.3/data/zip_code_database2.csv'
                    WITH CSV HEADER delimiter ','
                    ;

                          //var db_sugarcane = ;
                  ipm.db.dbname = "rttgroups";
                  db.excute(ipm, sql, function (xres) 
                  {
                     if(xres)
                     {
                        res.send(true);
                     }else{
                        res.send(true);
                     }
     
                  });
                

               res.send(true);


              });
    
            });
*/

/*
https://nominatim.openstreetmap.org/search?q=ซ.ศรีด่าน22 ถ.ศรีนครินทร์ แขวงบางแก้ว สมุทรปราการ?format=json&addressdetails=1&limit=1&polygon_svg=1

 http://maps.googleapis.com/maps/api/geocode/json?address=ซ.ศรีด่าน22 ถ.ศรีนครินทร์ แขวงบางแก้ว สมุทรปราการ&sensor=false

*/