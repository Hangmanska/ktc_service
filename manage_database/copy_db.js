var async = require('async');


var db = require('iConnectdb_ktc_backup.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_owner ='db_10003'

var db2 = require('iConnectdb_ktc.js');
var ipm2 = new db2.im2(db2.get_configdb_tcp());
var utl = require('Utility.js');

//COPY (select * from ht_1010003003 WHERE EXTRACT(YEAR FROM gps_datetime)!='2018') TO '/data/backup/ht_1010003003.csv';

function clear_master()
{
    var sql="";
    sql+="  WITH res as( ";
    sql+="    SELECT row_number() OVER (ORDER BY table_name), table_schema,table_name";
    sql+="    FROM information_schema.tables";
    sql+="    WHERE table_schema='public'";
    sql+="    AND table_name LIKE 'ht%'";
  //  sql+="    --OR table_name LIKE 'img%'";
    sql+="    ORDER BY table_schema,table_name)";
    sql+="    SELECT table_name FROM res WHERE row_number >'15' ";
    sql+="    AND row_number < '143' ";

    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            async.eachSeries(rows, function (row, next)
            {

                var tb_name = row.table_name
              //  var sql = "COPY (select * from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2018') TO '/data/backup/"+tb_name+".csv';"
              var sql = " DELETE from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2018' ";
              excute(sql,tb_name,function(is_ok)
              {
                    console.log(tb_name+' finish Delete');

                    var sql1="VACUUM(FULL, ANALYZE, VERBOSE) "+tb_name;
                    excute(sql1,tb_name,function(is_ok)
                    {
                        console.log(tb_name+' finish ANALYZE');
                        next();
                    });
              });

              

            },function(){
                console.log('finish');
            });
        }
    });
}

function excute(sql,tb_name,callback)
{
    ipm.db.dbname = db_owner;
    db.excute(ipm, sql, function (is_ok) {
      
      // next();
      callback(is_ok);
      return;
    });
}


function create_table_backup()
{


    var sql="";
    sql+="  WITH res as( ";
    sql+="    SELECT row_number() OVER (ORDER BY table_name), table_schema,table_name";
    sql+=" ,substr(table_name,4,11) as id ";
    sql+="    FROM information_schema.tables";
    sql+="    WHERE table_schema='public'";
    sql+="    AND table_name LIKE 'ht%'";
  //  sql+="    --OR table_name LIKE 'img%'";
    sql+="    ORDER BY table_schema,table_name)";
    sql+="    SELECT table_name,id FROM res WHERE row_number >'8' ";
    sql+="    AND row_number < '143' ";

    ipm2.db.dbname = db_owner;
    db2.get_rows(ipm2, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            async.eachSeries(rows, function (row, next)
            {

                var tb_name = utl.Trim( row.table_name)
                var idx = row.id;
              //  var sql = "COPY (select * from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2018') TO '/data/backup/"+tb_name+".csv';"
            //  var sql = " DELETE from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2018' ";
            
              var xtable =  schma_table(tb_name,idx);

              excute(xtable,tb_name,function(is_ok)
              {
                   next();
              });

              

            },function(){
                console.log('finish');
            });
        }
    });
}


function move_to_backup()
{


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

    ipm2.db.dbname = db_owner;
    db2.get_rows(ipm2, sql, function (rows) 
    {
        if (rows.length > 0)
        {
            async.eachSeries(rows, function (row, next)
            {

                var tb_name = utl.Trim( row.table_name)
              //  var idx = row.id;
                var sql = "COPY "+tb_name+" FROM '/var/lib/pgsql/9.5/data/"+tb_name+".csv';";
             //  var sql = "COPY (select * from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2018') TO '/data/backup/"+tb_name+".csv';"
            //  var sql = " DELETE from "+tb_name+" WHERE EXTRACT(YEAR FROM gps_datetime)!='2018' ";
            
            //  var xtable =  schma_table(tb_name,idx);

              excute(sql,tb_name,function(is_ok)
              {
                  console.log(' copy '+tb_name+' '+is_ok)
                   next();
              });

              

            },function()
            {
                console.log('finish');
            });
        }
    });
}



//start_copy();

function schma_table(tb_name,idx)
{
    var sql=''
    sql +='CREATE TABLE public.'+tb_name;
    sql +='(';
    sql +='    modem_id character varying(20) COLLATE pg_catalog."default" NOT NULL,';
    sql +='    gps_datetime timestamp(6) without time zone NOT NULL,';
    sql +='    rtc_datetime timestamp(6) without time zone,';
    sql +='    lon double precision,';
    sql +='    lat double precision,';
    sql +='    speed real,';
    sql +='    direction real,';
    sql +='    altitude real,';
    sql +='    satelites real,';
    sql +='    message_id character varying(20) COLLATE pg_catalog."default",';
    sql +='    input_status double precision,';
    sql +='    output_status double precision,';
    sql +='    analog_input1 character varying(10) COLLATE pg_catalog."default",';
    sql +='    analog_input2 character varying(10) COLLATE pg_catalog."default",';
    sql +='    mileage double precision,';
    sql +='    tambol character varying(255) COLLATE pg_catalog."default",';
    sql +='    etambol character varying(255) COLLATE pg_catalog."default",';
    sql +='    amphur character varying(255) COLLATE pg_catalog."default",';
    sql +='    eamphur character varying(255) COLLATE pg_catalog."default",';
    sql +='    province character varying(255) COLLATE pg_catalog."default",';
    sql +='    eprovince character varying(255) COLLATE pg_catalog."default",';
    sql +='    driver_id character varying(60) COLLATE pg_catalog."default",';
    sql +='    driver_prefix character varying(10) COLLATE pg_catalog."default",';
    sql +='    driver_name character varying(255) COLLATE pg_catalog."default",';
    sql +='    driver_surname character varying(255) COLLATE pg_catalog."default",';
    sql +='    driver_personalcard character varying(255) COLLATE pg_catalog."default",';
    sql +='    driver_type character varying(10) COLLATE pg_catalog."default",';
    sql +='    driver_no character varying(255) COLLATE pg_catalog."default",';
    sql +='    driver_branch character varying(255) COLLATE pg_catalog."default",';
    sql +='    driver_sex character varying(1) COLLATE pg_catalog."default",';
    sql +='    driver_birthcard character varying(20) COLLATE pg_catalog."default",';
    sql +='    driver_expirecard character varying(20) COLLATE pg_catalog."default",';
    sql +='    time_server_recive timestamp(6) without time zone,';
    sql +='    time_server_fin timestamp(6) without time zone,';
    sql +='    angle character varying(4) COLLATE pg_catalog."default",';
    sql +='    oil_percent double precision,';
    sql +='    oil_liter double precision,';
    sql +='    status character varying(2) COLLATE pg_catalog."default",';
    sql +='    heading character varying(2) COLLATE pg_catalog."default",';
    sql +='    CONSTRAINT '+tb_name+'_pkey PRIMARY KEY (modem_id, gps_datetime)';
    sql +=')';
    sql +='WITH (';
    sql +='    OIDS = FALSE';
    sql +=')';
    sql +=' TABLESPACE pg_default;';
  //  sql +=' ALTER TABLE public.'+tb_name+'';
 //   sql +='    OWNER to postgres';

    sql +=' CREATE INDEX idx_'+idx;
    sql +='    ON public.'+tb_name+' USING btree';
    sql +='    (gps_datetime, message_id COLLATE pg_catalog."default")';
    sql +='    TABLESPACE pg_default;';
    
    return sql;

}

//create_table_backup();
//move_to_backup();

/*

Nonquery err.code = 22P04 err.message extra data after last expected column
excute COPY ht_1010003150 FROM '/var/lib/pgsql/9.5/data/ht_1010003150.csv'; 22P04
Nonquery err.code = 22P04 err.message extra data after last expected column
excute COPY ht_1010003151 FROM '/var/lib/pgsql/9.5/data/ht_1010003151.csv'; 22P04
Nonquery err.code = 22P04 err.message extra data after last expected column
excute COPY ht_1010003152 FROM '/var/lib/pgsql/9.5/data/ht_1010003152.csv'; 22P04
Nonquery err.code = 22P04 err.message extra data after last expected column
excute COPY ht_1010003155 FROM '/var/lib/pgsql/9.5/data/ht_1010003155.csv'; 22P04
Nonquery err.code = 22P04 err.message extra data after last expected column
excute COPY ht_1010003156 FROM '/var/lib/pgsql/9.5/data/ht_1010003156.csv'; 22P04
Nonquery err.code = 22P04 err.message extra data after last expected column
excute COPY ht_1010003157 FROM '/var/lib/pgsql/9.5/data/ht_1010003157.csv'; 22P04
finish
*/