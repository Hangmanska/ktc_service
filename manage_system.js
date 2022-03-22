
var bcrypt = require('bcrypt-nodejs');
var async = require('async');


var utl = require('Utility.js');
var db = require('iConnectdb_ktc.js');

var iconn = require('conn_sugar_cane.js');
var pg_htt = new db.im2(iconn.get_dbconfig_htt());
var ipm = new db.im2(iconn.get_dbconfig_realtime());

var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10003";

function add_fleet() 
{
    var role = '1'; //admin 
    //  var role = '0'; //staff
    var db_name = 'db_10004'
    var fleet_name = 'esac';
    var password = 'esac';
    var port ='6004'
  

    var sql='INSERT INTO master_fleet ("fleetid",  "fleetname", "password"'
    sql+=', "dtmdemo", "dtmsign", "portnum", "description", "dbserver", "publicpass", "language" '
    sql+=', "dealerid", "accesscode" ';
    sql+=' , "dbname" , "role") ' 
    sql += " VALUES( " + utl.sqote(db_name) + "," + utl.sqote(fleet_name) + ", " +utl.sqote(encode_pws(password))+ ", now(), now(), "+utl.sqote(port)+", '', '', '', '', '', '' "
    sql += " , " + utl.sqote(db_name) + "," + utl.sqote(role) + " ";

    excute(sql,db_config,function(res)
    {
        console.log(res);
    })

}

function excute(sql,db_name,callback){
     ipm.db.dbname = db_name;
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

function get_all_vehicle()
{
     var sql= "SELECT modem_id FROM realtime WHERE length(modem_id)='10' AND fleet_id='db_10003' AND camera_url !='' ORDER BY modem_id";
   
     ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res_ar) 
    {
        async.eachSeries(res_ar, function (row, next)
        {
            debugger;
                 console.log('t '+row.modem_id);
                get_min_max_allvehicle(row.modem_id,function(xres)
                {
                    if(xres)
                    {
                        next();
                    }
                    else
                    {
                        console.log('x '+row.modem_id);
                        next();
                    }
                })
        });
    });

}

function get_min_max_allvehicle(modem_id,callback)
{
    var sql ="SELECT max(analog_input1) as xmax,min(analog_input1) as xmin FROM ht_"+modem_id+" WHERE analog_input1 > '0.000' ";
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (rows) 
    {
            debugger;
       // console.log(rows);
  
        var sql =" UPDATE  master_config_vehicle SET fuelempty="+utl.sqote(rows[0].xmin)+",fuelfull="+utl.sqote(rows[0].xmax)+" WHERE modem_id="+utl.sqote(modem_id);
        ocsb_excute(sql,db_config,function(result)
        {
           callback(result);
            return;
        })
        
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

/*
SELECT * FROM master_config_vehicle WHERE modem_id='1010001040'

--6.064 
--0.096

UPDATE  master_config_vehicle SET fuelempty='0.096',fuelfull='5.424' WHERE modem_id='1010001041'
*/

function encode_pws(pws) {
    bcrypt.hash(pws, null, null, function (err, hash) {
        // Store hash in your password DB.
        //console.log(hash);
        // callback(hash);
      // var xhash = 
        return hash;
    });
}

setTimeout(function () 
{
    //add_fleet();
    get_all_vehicle();
}, 1000);