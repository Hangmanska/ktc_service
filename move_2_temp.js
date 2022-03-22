
var async = require('async');


var db = require('iConnectdb_ktc_backup.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";


var db2 = require('iConnectdb_ktc.js');
var ipm2 = new db2.im2(db2.get_configdb_tcp());
var utl = require('Utility.js');
var year ="";//"2020"

var db_owner =""; //'db_10001'

function move_to_backup(req, res)
{
     db_owner = req.body.db_name; //'db_10001'; //
     year = req.body.year; //'1010001030';// 
/*
    var sql="";
    sql+="  WITH res as( ";
    sql+="    SELECT row_number() OVER (ORDER BY table_name), table_schema,table_name";
    sql+=" ,substr(table_name,4,11) as id ";
    sql+="    FROM information_schema.tables";
    sql+="    WHERE table_schema='public'";
    sql+="    AND table_name LIKE 'ht%'";
  //  sql+="    --OR table_name LIKE 'img%'";
    sql+="    ORDER BY table_schema,table_name)";
    sql+="    SELECT table_name,id FROM res WHERE row_number >'16' ";
    sql+="    AND row_number < '143' ";
 

    var sql="";
    sql+="  SELECT table_name,pg_size_pretty(pg_relation_size(table_name)) ";
    sql+="  FROM information_schema.tables ";
    sql+="  WHERE table_schema='public' ";
    sql+="  AND table_name LIKE 'ht%' ";
    sql+="  AND pg_size_pretty(pg_relation_size(table_name))  like '%MB%' ";
    sql+="   ORDER BY table_name ";

       */

      var sql="";
      sql+="  SELECT table_name,pg_size_pretty(pg_total_relation_size(table_name)) ";
      sql+="  FROM information_schema.tables ";
      sql+="  WHERE table_schema='public' ";
      sql+="  AND table_name LIKE 'ht%' ";
     // sql+="  AND table_name= 'ht_1010001002' ";
      sql+="  AND pg_size_pretty(pg_total_relation_size(table_name))  like '%MB%' ";
      sql+="   ORDER BY table_name ";

    ipm2.db.dbname = db_owner;
    db2.get_rows(ipm2, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            async.eachSeries(rows, function (row, next)
            {

                debugger;
                var tb_name = utl.Trim( row.table_name)
              //  var idx = row.id;
                //var sql = "COPY "+tb_name+" FROM '/var/lib/pgsql/9.5/data/"+tb_name+".csv';";
                //var sql = " COPY (select * from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2019') TO '/data/db_10011/"+tb_name+".csv' ";
                var sql = " COPY (select * from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime) !='"+year+"') TO '/data/"+db_owner+"/"+tb_name+".csv' ";
            //  var xtable =  schma_table(tb_name,idx);

              excute(db_owner,sql,tb_name,function(is_ok)
              {
                  console.log(' copy '+tb_name+' '+is_ok);

                  del_when_move_complete(db_owner,tb_name,function(is_del_ok)
                  {
                        console.log(' del_move_complete '+is_del_ok);

                        clean_tb(db_owner,tb_name,function(is_clean_ok)
                        {
                            console.log(' clean_complete '+is_clean_ok);
                            next();
                        })
                  })
                  // 
              });

              

            },function()
            {
                console.log('finish');
                res.send('finish');
            });
        }
    });
}

function del_when_move_complete(db_owner,tb_name,callback)
{
    var sql="";
   // sql+=" DELETE from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2019' ";
   sql+=" DELETE from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime) !='"+year+"' ";
    excute(db_owner,sql,tb_name,function(is_ok)
    {
        console.log(' del '+tb_name+' '+is_ok)
        callback(is_ok)
    });
}

function clean_tb(db_owner,tb_name,callback)
{
    
    var sql="VACUUM(FULL, ANALYZE, VERBOSE) "+tb_name;
    excute(db_owner,sql,tb_name,function(is_ok)
    {
        console.log(' VACUUM '+tb_name+' '+is_ok)
        callback(is_ok)
    });

}


function excute(db_owner,sql,tb_name,callback)
{
    ipm2.db.dbname = db_owner;
    db2.excute(ipm2, sql, function (is_ok) 
    {
      
      callback(is_ok);
      return;
    });
}

function move_to_backup_manual()
{
     db_owner = 'db_10021'; //
     year = '2020'; //
/*
    var sql="";
    sql+="  WITH res as( ";
    sql+="    SELECT row_number() OVER (ORDER BY table_name), table_schema,table_name";
    sql+=" ,substr(table_name,4,11) as id ";
    sql+="    FROM information_schema.tables";
    sql+="    WHERE table_schema='public'";
    sql+="    AND table_name LIKE 'ht%'";
  //  sql+="    --OR table_name LIKE 'img%'";
    sql+="    ORDER BY table_schema,table_name)";
    sql+="    SELECT table_name,id FROM res WHERE row_number >'16' ";
    sql+="    AND row_number < '143' ";
 

    var sql="";
    sql+="  SELECT table_name,pg_size_pretty(pg_relation_size(table_name)) ";
    sql+="  FROM information_schema.tables ";
    sql+="  WHERE table_schema='public' ";
    sql+="  AND table_name LIKE 'ht%' ";
    sql+="  AND pg_size_pretty(pg_relation_size(table_name))  like '%MB%' ";
    sql+="   ORDER BY table_name ";

       */

      var sql="";
      sql+="  SELECT table_name,pg_size_pretty(pg_total_relation_size(table_name)) ";
      sql+="  FROM information_schema.tables ";
      sql+="  WHERE table_schema='public' ";
      sql+="  AND table_name LIKE 'ht%' ";
     // sql+="  AND table_name= 'ht_1010001002' ";
      sql+="  AND pg_size_pretty(pg_total_relation_size(table_name))  like '%MB%' ";
      sql+="   ORDER BY table_name ";

    ipm2.db.dbname = db_owner;
    db2.get_rows(ipm2, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            async.eachSeries(rows, function (row, next)
            {

                debugger;
                var tb_name = utl.Trim( row.table_name)
              //  var idx = row.id;
                //var sql = "COPY "+tb_name+" FROM '/var/lib/pgsql/9.5/data/"+tb_name+".csv';";
                //var sql = " COPY (select * from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2019') TO '/data/db_10011/"+tb_name+".csv' ";
                var sql = " COPY (select * from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime) !='"+year+"') TO '/data/"+db_owner+"/"+tb_name+".csv' ";
            //  var xtable =  schma_table(tb_name,idx);

              excute(db_owner,sql,tb_name,function(is_ok)
              {
                  console.log(' copy '+tb_name+' '+is_ok);

                  del_when_move_complete(db_owner,tb_name,function(is_del_ok)
                  {
                        console.log(' del_move_complete '+is_del_ok);

                        clean_tb(db_owner,tb_name,function(is_clean_ok)
                        {
                            console.log(' clean_complete '+is_clean_ok);
                            next();
                        })
                  })
                  // 
              });

              

            },function()
            {
                console.log('finish');
                res.send('finish');
            });
        }
    });
}

exports.move_to_backup = move_to_backup;
//move_to_backup();

//move_to_backup_manual();