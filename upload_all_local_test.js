
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
//var parse = require('csv-parse');
//var copyFrom = require('pg-copy-streams').from;

var utl = require('Utility.js');
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane_kumpawapi";

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
 // console.log(JSON.stringify(req.headers))
    var fleetid = req.headers.fleetid;
    var fleetid ='db_10099';
 //   console.log(fleetid);
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
          var new_path = path.join(__dirname, '/csv/', file_name);

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
                console.log(err);
              pg.connect(setcon('rttgroups'), function (err, client, done) 
              {
                  console.log(err);
                   debugger;
                   var stream = client.query(copyFrom('COPY import_data FROM STDIN'));
                   var fileStream = fs.createReadStream(new_path)
                   fileStream.on('error', done);
                   fileStream.pipe(stream).on('finish', done).on('error', done);
              });
            });
          });


          //  var old_path = files.file.path;
  
        });
    }
    else if(fleetid=='db_10011x')
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
    else if(fleetid=='db_10011')
    {
    
            var csvData=[];
            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) 
            {
              //  console.log( files.file);
              //  console.log(files.file.path);
              

              fs.readFile(files.file.path, { encoding: 'utf8' }, function (err, data) 
              {
              //  debugger;
            
                var data = JSON.stringify(utl.Trim(data.toString()));
        
        
                data = JSON.parse(data);
                var array = data.toString().split('\n');
        
              //  console.log('array '+array.length);
                
                var is_firstrow = true;
             
                async.eachSeries(array, function (xrow, next)
                {
        
                    //  debugger;
                    if(!is_firstrow)
                    {
                      var row = utl.replaceAll('"','',xrow);
                      row = row.split(',');
                  
                     var id = row[0];
                     var weight = utl.Trim(row[5]);

                     var sql= ' UPDATE truck_accsss_weighing_zone SET weight='+utl.sqote(weight)+" WHERE id="+utl.sqote(id);

                      ipm.db.dbname = "sugarcane_kumpawapi";
                      db.excute(ipm, sql, function (xres) 
                      {
                          if(xres)
                          {
                            next();
                          }
                          
                      });

                     
                    }
                    else
                    {
                      is_firstrow =false;
                      next();
                    }

                }, function () { 
                    debugger;
                  // console.log('ok');
                   res.send('ok');
                });
        
          
              });

           });

    }
    else if(fleetid=='db_10099')
    {
    
            var csvData=[];
            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) 
            {
              //  console.log( files.file);
              //  console.log(files.file.path);
              

              fs.readFile(files.file.path, { encoding: 'utf8' }, function (err, data) 
              {
              //  debugger;
              
              var data = JSON.stringify(utl.Trim(data.toString()));

                get_current_year_plant(function(current_year)
                {
                //   console.log(current_year); 64_65
                 var tb_update =  "detail_farm_register_"+current_year;

          
          
                  data = JSON.parse(data);
                  var array = data.toString().split('\n');
          
                //  console.log('array '+array.length);
                  
                  var is_firstrow = true;
                
                    async.eachSeries(array, function (xrow, next)
                    {
            
                        //  debugger;
                        if(!is_firstrow)
                        {
                          var row = utl.replaceAll('"','',xrow);
                          row = row.split(',');
                      

                        var farm_id =  row[4];
                        var ton = utl.Trim(row[7]);

                        // var sql= ' UPDATE truck_accsss_weighing_zone SET weight='+utl.sqote(weight)+" WHERE id="+utl.sqote(id);
                         var sql= "  UPDATE "+tb_update+" SET icollect_ton=(COALESCE(icollect_ton,0)+ ("+ton+")) WHERE farm_id='"+farm_id+"' ";
                          ipm.db.dbname = "sugarcane_kumpawapi";
                          db.excute(ipm, sql, function (xres) 
                          {
                              if(xres)
                              {
                                next();
                              }
                              
                          });

                        
                        }
                        else
                        {
                          is_firstrow =false;
                          next();
                        }

                    }, function () { 
                        debugger;
                      // console.log('ok');
                      res.send('ok');
                    });


                })

          
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

function get_current_year_plant(callback)
{
  var sql="SELECT year_plant_key FROM ms_yearplant WHERE set_default='1' "
  ipm.db.dbname = db_sugarcane;
  db.get_rows(ipm, sql, function (rows) 
  {
  //  debugger;
      //console.log(rows);
     // res.send(rows);
      callback( rows[0].year_plant_key);
      return;
  });

}

