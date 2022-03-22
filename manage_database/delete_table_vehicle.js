
var async = require('async');


var db =require('iConnectdb_ktc.js'); // require('iConnectdb_ktc_backup.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";


var db2 = require('iConnectdb_ktc.js');
var ipm2 = new db2.im2(db2.get_configdb_tcp());
var utl = require('Utility.js');
var year ="2019"

var db_owner ='db_10014'
var db_config = "master_config";

function main()
{
    var condition ='"7"'
    var sql =" SELECT r.modem_id FROM realtime as r,master_config_vehicle as mcv WHERE r.modem_id IN (SELECT "+condition+" FROM remove_vehicle_tsy) AND r.modem_id = mcv.modem_id ORDER BY r.modem_id ";

    ipm2.db.dbname = db_config;
    db2.get_rows(ipm2, sql, function (rows) 
    {
        if (rows.length > 0)    
        {
            async.eachSeries(rows, function (row, next)
            {
                console.log(row.modem_id)
                del_table(row.modem_id,function()
                {
                    next();
                })
                
            },function(){
                console.log('finish');
            });
        }
    });

}



function del_table(modem_id,callback)
{
    var tb_name = "ht_"+modem_id;
    var sql= "DROP TABLE "+tb_name;
    
    ipm2.db.dbname = db_owner;
    db2.excute(ipm2, sql, function (is_ok) 
    {
        console.log(' del '+tb_name+' '+is_ok)
      callback(is_ok);
      return;
    });
}


main();