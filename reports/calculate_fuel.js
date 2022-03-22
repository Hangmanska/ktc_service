

var async = require('async');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var utl = require('Utility.js');

var db_config = "master_config";

function calBase(ref_min, ref_max, act1_min, act1_max, x) 
{
    var m1 = (act1_max - act1_min) / (ref_max - ref_min);
    var c1 = act1_min - (m1 * ref_min);
    var result = (m1 * x) + c1;
    return result.toFixed(2);
}

function calLiter(h, x, l) 
{
  var sum = (h * x * l) / 1000;
  return sum;
}

function calculate_oil_UltraSonic(v,analog_input1,gps_datetime,modem_id,db_name,callback)
{
   var W = v.tank_width;//38;//width
   var L = v.tank_length;//92;//length
   var H = v.tank_height;

    var tank_volum =(W*L*H)// (v.tank_width*v.tank_length*v.tank_height) ///1000; //1000 convert 1mc = 1000 cm
    tank_volum = Math.ceil(tank_volum /1000);

    console.log('calculate_oil_UltraSonic '+analog_input1)

    var h = (((analog_input1/1024)*24.0)/5)*100;
    var p=  ((h/H)*100);
    var fuel_percent = p;
    var fuel_liter = (h / H) * tank_volum;

    
 var tb_name = "ht_" + modem_id;

 var sql="UPDATE "+tb_name+" SET oil_liter='"+fuel_liter+"',oil_percent='"+fuel_percent+"' WHERE gps_datetime='"+gps_datetime+"' ";
 
 ipm.db.dbname = db_name;
 db.excute(ipm, sql, function (response)
  {
     if (response == 'oK') 
     {
          var res={'actual':v.analog_input1,'fuel_percent':fuel_liter,'fuel_liter':fuel_liter}
          callback(res);
          return;
     }
    });

}

function calculate_oil(v,analog_input1,gps_datetime,modem_id,db_name,callback)
{
  //  console.log('analog1 '+v.analog_input1);
   // var v={'tank_width':40,'tank_length':60,'tank_height':40}
   //var v={'tank_width':70,'tank_length':100,'tank_height':100}
  // var v={'tank_width':60,'tank_length':138,'tank_height':53} //

   //h = calBase(5.70, 0.66, 0, 30, 0.66)
   //calBase(v.ref_min, v.ref_max, v.act1_min, v.act1_max,v.analog_input1); //calBase(5.70, 0.26, 0, 30, AD1); // 0.543
   var X = v.tank_width;//38;//width
   var L = v.tank_length;//92;//length
   var Y = v.tank_height;

    var tank_volum =(X*L*Y)// (v.tank_width*v.tank_length*v.tank_height) ///1000; //1000 convert 1mc = 1000 cm
    tank_volum = Math.ceil(tank_volum /1000);
    //console.log('total tank_volum ='+tank_volum)

   /*
    var H = 33;
    var left_volum =(X*L*H)/1000;
    console.log('left_volum ='+left_volum);

        var left_volum =Math.ceil((X*L*H)/1000);
    console.log(left_volum);
     */
   //var AD1 = 0.02;
  // data.analog_input1 = 0.14;

  //  H = parseInt( calBase(2.86, 0.02, 0,  v.tank_height, AD1));
  var H = calBase(v.ref_min, v.ref_max, v.act1_min, v.tank_height,analog_input1); 
  var fuel_liter = calLiter(H,X,L);
 // fuel_liter = fuel_liter > v.fueltank ? v.fueltank :  fuel_liter;
  fuel_liter = parseInt(fuel_liter);
 // var left_volum =Math.ceil((X*L*H)/1000);
 //console.log(fuel_liter);

 var tb_name = "ht_" + modem_id;

 var sql="UPDATE "+tb_name+" SET oil_liter='"+fuel_liter+"',oil_percent='"+fuel_liter+"' WHERE gps_datetime='"+gps_datetime+"' ";
 
 ipm.db.dbname = db_name;
 db.excute(ipm, sql, function (response)
  {
     if (response == 'oK') 
     {
          var res={'actual':v.analog_input1,'fuel_percent':fuel_liter,'fuel_liter':fuel_liter}
          callback(res);
          return;
     }
    });

}


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


function calculate_fuel(db_name,modem_id,start,stop,callback) 
{


   has_table(modem_id,db_name,function(has_x)
   {
        if(has_x)
        {
            var tb_name = "ht_" + modem_id;

            var sql = "";
            sql += " SELECT  ";
            sql += " idate(gps_datetime) as gps_datetime";
            sql += ",analog_input1";
            sql += " FROM " + tb_name;
            sql += " WHERE  gps_datetime >= " + utl.sqote(start);
            sql += " AND gps_datetime <=" + utl.sqote(stop);
            sql += " ORDER BY gps_datetime ";
        
             var temp ='';
        
            ipm.db.dbname = db_name;//db_owner;
            db.get_rows(ipm, sql, function (rows) 
            {
                 
                if (rows.length > 0) 
                { 
                    get_tank_setting(modem_id,function(v)
                    {
                        async.eachSeries(rows, function (row, next) 
                        {
                            calculate_oil(v[0],row.analog_input1,row.gps_datetime,modem_id,db_name,function(x)
                            {
                                next();
                            })
                        },function(){
                            console.log('finish');
                        });
                    })

                }

            });
        }
   })
}

function update_fuel()
{
    var tb_name = "ht_" + modem_id;

    var sql="UPDATE "+tb_name+" SET oil_liter=,oil_percent= "
}

function get_tank_setting(modem_id,callback)
{
var sql="";
sql+="SELECT ref_min,ref_max,tank_width,tank_length,tank_height,tank_liter,act1_min,act1_max  FROM master_config_vehicle  WHERE modem_id='"+modem_id+"' ";
ipm.db.dbname = db_config
db.get_rows(ipm, sql, function (rows) 
{
     
    if (rows.length > 0) 
    { 
        callback(rows);
        return;
    }

});

}

//db_10033 142190463156  2020-07-16 
/*
get_tank_setting('142190463156',function(x)
{
    debugger;
    console.log(x);
})


calculate_fuel('db_10036','143190871494','2020-09-20 00:00','2020-09-20 23:59',function(x){

})
*/

calculate_fuel('db_10006','142190463119','2021-11-25 00:00','2021-11-25 23:59',function(x){

})