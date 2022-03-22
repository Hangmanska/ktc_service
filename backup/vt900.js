
var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var iutm = require('utm2latlon.js');
var squel = require("squel");

//var iOut = require('out_of_service.js');
//var iResend = require('resend_cat2crush');

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";

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
     // debugger;
      //  console.log(res_db[0].exists)
        callback(res_db[0].exists)
        return;
  });

}

function detail_fleet(req, res)
{
    var fleetid = req.body.fleetid;

    var sql =" SELECT fleetcode,fleetid as db_name,childfleetid as login_name ";
    sql +=" FROM setup_vehicle WHERE fleetcode=get_fleetid('"+fleetid+"') LIMIT 1 ";

    nrows(sql,db_config,function(rows)
    {
        res.send(rows);
    })


}

function master_add_vehicle(req, res)
{
    debugger;
    var fleetcode = req.body.fleetcode;
    var db_name = req.body.db_name;
    var login_name = req.body.login_name;
    var modem_id = req.body.modem_id;
    var phone_number = req.body.phone_number;
   
  

    var x1 =false;var x2=false;var x3=false;var x4 =false;

    var sql=""
    sql +="INSERT INTO master_config_vehicle( ";
    sql +="    modem_id, db_name, serial_sim, sim,sim_brand, time_inserver, time_config, ";
    sql +="    global_hour, global_minute, vehiclename, carlicence, registerdate, ";
    sql +="    chassesno, fuelempty, fuelfull, fueltank, speedmax, idlestop)";
    sql +=" VALUES ('"+modem_id+"', '"+db_name+"', '"+phone_number+"', '"+phone_number+"','3', now(), now(), ";
    sql +="    '7', '0', '12345', '12345', now(), ";
    sql +="    '', '0', '0', '0', '80', '10');";

    excute(sql,db_config,function(xres1)
    {
        if(xres1)
        {
            x1=true;
            finalx();
        }else{
            x1=false;
            finalx();
        }
    })

    
    var sql2=""
    sql2 +="INSERT INTO setup_vehicle (modem_id,vehicleid,fleetid,childfleetid,fleetcode)";
    sql2 +="VALUES ('"+modem_id+"','3','"+db_name+"','"+login_name+"','"+fleetcode+"');";

    excute(sql2,db_config,function(xres2)
    {
        if(xres2)
        {
            x2=true;
            finalx();
        }else{
            x2=false;
            finalx();
        }
    })

    /* */

    first_add_backbox(db_name,modem_id,function(xres3)
    {
        if(xres3)
        {
            x3=true;
            finalx();
        }else{
            x3=false;
            finalx();
        }
    })

    first_add_realtime(db_name,modem_id,function(xres4)
    {
        if(xres4)
        {
            x4=true;
            finalx();
        }else{
            x4=false;
            finalx();
        }
    })
   

    function finalx()
    {
        if(x1 && x2 && x3 && x4)
        {
            res.send('OK');
        }
    }
    

}

function first_add_backbox(db_name, modem_id,callback) 
{

    var sql = " ";
    sql += '	CREATE TABLE "public"."ht_' + modem_id + '" (	';
    sql += '	modem_id varchar(20) COLLATE "default" NOT NULL,	';
    sql += '	gps_datetime timestamp(6) NOT NULL,	';
    sql += '	rtc_datetime timestamp(6),	';
    sql += '	lon float8,	';
    sql += '	lat float8,	';
    sql += '	speed float4,	';
    sql += '	direction float4,	';
    sql += '	altitude float4,	';
    sql += '	satelites float4,	';
    sql += '	message_id varchar(20) COLLATE "default",	';
    sql += '	input_status float8,	';
    sql += '	output_status float8,	';
    sql += '	analog_input1 varchar(10) COLLATE "default",	';
    sql += '	analog_input2 varchar(10) COLLATE "default",	';
    sql += '	mileage float8,	';
    sql += '	tambol varchar(255) COLLATE "default",	';
    sql += '	etambol varchar(255) COLLATE "default",	';
    sql += '	amphur varchar(255) COLLATE "default",	';
    sql += '	eamphur varchar(255) COLLATE "default",	';
    sql += '	province varchar(255) COLLATE "default",	';
    sql += '	eprovince varchar(255) COLLATE "default",	';
    sql += '	driver_id varchar(60) COLLATE "default",	';
    sql += '	driver_prefix varchar(10) COLLATE "default",	';
    sql += '	driver_name varchar(255) COLLATE "default",	';
    sql += '	driver_surname varchar(255) COLLATE "default",	';
    sql += '	driver_personalcard varchar(255) COLLATE "default",	';
    sql += '	driver_type varchar(10) COLLATE "default",	';
    sql += '	driver_no varchar(255) COLLATE "default",	';
    sql += '	driver_branch varchar(255) COLLATE "default",	';
    sql += '	driver_sex varchar(1) COLLATE "default",	';
    sql += '	driver_birthcard varchar(20) COLLATE "default",	';
    sql += '	driver_expirecard varchar(20) COLLATE "default",	';
    sql += '	time_server_recive timestamp(6),	';
    sql += '	time_server_fin timestamp(6),	';
    sql += '	angle varchar(4) COLLATE "default",	';
    sql += '	oil_percent float8,	';
    sql += '	oil_liter float8,	';
    sql += '    status varchar(2) COLLATE "default", ',
    sql += '    heading varchar(2) COLLATE "default", ',
    sql += '    odb2_data json, ',
    sql += '    temperature json, ',
    sql += '	CONSTRAINT "ht_' + modem_id + '_pkey" PRIMARY KEY ("modem_id","gps_datetime")	';
    sql += '	)	';
    sql += '	WITH (OIDS=FALSE);	';

    sql += '	ALTER TABLE "public"."ht_' + modem_id + '" OWNER TO "postgres";	';

    sql += '	CREATE INDEX "idx_' + modem_id + '" ON "public"."ht_' + modem_id + '" USING btree (gps_datetime,message_id);	';


    debugger;
    ipm.db.dbname = db_name;
    db.excute(ipm, sql, function (is_ok) 
    {
       // console.log('first_add_backbox ' + is_ok);
       
            callback(is_ok);
            return;

    });
}

function first_add_realtime(db_name,modem_id,callback)
{

        var sql_insrt = squel.insert()
        .into('realtime')
        .set("modem_id", modem_id)
        .set("gps_datetime",  utl.timenow())
        .set("rtc_datetime",  utl.timenow())
        .set("lon", '100.71657')
        .set("lat", '14.011632')
        .set("speed", '0')
        .set("direction",'187')
        .set("altitude", '16')
        .set("satelites", '9')
        .set("tambol", 'รังสิต')
        .set("amphur",  'ธัญญบุรี')
        .set("province",'ปทุมธานี')
        .set("etambol", 'Rangsit')
        .set("eamphur",'Thanyaburi')
        .set("eprovince",'Pathum Thani')
        .set("time_server_recive",utl.timenow())
        .set("time_server_fin", utl.timenow())
        .set("angle", '180')
        .set("status", '1')
      // .set("heading", )
        .set("fleet_id", db_name)    
        .toString();

        excute(sql_insrt,db_config,function(xres2)
        {
            if(xres2)
            {
               callback(xres2);
               return;
            }
            else
            {
                callback(xres2);
                return;
            }
        })
    
}

function delete_backbox(req, res)
{
    var modem_id = req.body.modem_id;
    var db_name = req.body.db_name;

    var sql1="DELETE FROM setup_vehicle WHERE modem_id='"+modem_id+"'";

    var sql2="DELETE FROM master_config_vehicle WHERE modem_id='"+modem_id+"' ";

    var sql3="DROP TABLE ht_"+modem_id;

    var x1 =false;var x2=false;var x3=false;

    excute(sql1,db_config,function(xres1)
    {
        if(xres1)
        {
            x1=true;
            finalx();
        }else{
            x1=false;
            finalx();
        }
    })

    excute(sql2,db_config,function(xres2)
    {
        if(xres2)
        {
            x2=true;
            finalx();
        }else{
            x2=false;
            finalx();
        }
    })

    excute(sql3,db_name,function(xres2)
    {
        if(xres2)
        {
            x2=true;
            finalx();
        }else{
            x2=false;
            finalx();
        }
    })

    function finalx()
    {
        if(x1 && x2 && x3)
        {
            res.send('Delete OK');
        }
    }

}

function nrows(sql,db_name,callback)
{
    ipm.db.dbname = db_name;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0)
        {
           callback(rows);
           return;
        }else{
            callback([]);
           return;
        }
    });
}

function excute(sql,db_con,callback)
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


//100 200 250 300 350 400 tank_size
//
function set_fuel(req, res)
{
    var b =  req.body;
    var volt_fuel_full = b.volt_fuel_full;
    var volt_fuel_empty =b.volt_fuel_empty;
    var size_tank =b.size_tank;
    var modem_id =b.modem_id;

    var tank_width='';
    var tank_length=''
    var tank_hight ='';

   // console.log(b);

    /*
    var volt_fuel_full = '' //ref_max
    var volt_fuel_empty ='' //ref_min
    var size_tank ='';
    var modem_id ='';
    var tank_width='';
    var tank_length=''
    var tank_hight ='';
    var modem_id='';
    */

    switch(size_tank)
    {
        case '100' : {tank_width=42;tank_length=95;tank_hight=26}break;//103
        case '150' : {tank_width=45;tank_length=110;tank_hight=33}break;//153
        case '200' : {tank_width=50;tank_length=100;tank_hight=40}break;//200
        case '250' : {tank_width=50;tank_length=111;tank_hight=45}break;//255
        case '300' : {tank_width=60;tank_length=105;tank_hight=53}break;//302
        case '350' : {tank_width=60;tank_length=138;tank_hight=43}break;//356
        case '400' : {tank_width=60;tank_length=138;tank_hight=49}break;//405
        case '450' : {tank_width=60;tank_length=138;tank_hight=55}break;//455
        case '500' : {tank_width=62;tank_length=152;tank_hight=54}break;//508
        case '600' : {tank_width=71;tank_length=152;tank_hight=56}break;//604
    }

   // console.log(tank_width+' '+tank_length+' '+tank_hight)

   // res.send(tank_width+' '+tank_length+' '+tank_hight)

    
    var sql=""
    sql+=" UPDATE master_config_vehicle ";
    sql+=" SET ref_min='"+volt_fuel_full+"' ";
    sql+=" ,ref_max='"+volt_fuel_empty+"' ";
    sql+=",tank_width='"+tank_width+"' ";
    sql+=",tank_length='"+tank_length+"' ";
    sql+=",tank_height='"+tank_hight+"' ";
    sql+=",tank_liter='"+size_tank+"' ";
    sql+=",act1_min='0',is_calculate_fuel='1' ";
    sql+="  WHERE modem_id='"+modem_id+"' ";


    excute(sql,db_config,function(xres1)
    {
         if(xres1){
        res.send('OK Complete set_fuel');
        }else{
            res.send('Fail');
        }
    });

    /**/
}

function move_vehicle(req, res)
{
    var b =  req.body;

    var modem_id =b.modem_id;
    var db_name=b.database_destination; 
    var id=b.id;


   var sql1=" UPDATE realtime SET fleet_id='"+db_name+"'   WHERE modem_id='"+modem_id+"' ";

   var sql2=" UPDATE master_config_vehicle  SET db_name='"+db_name+"' WHERE modem_id='"+modem_id+"' ";

   var sql3=" UPDATE setup_vehicle SET fleetcode='"+id+"',fleetid='"+db_name+"'  WHERE modem_id='"+modem_id+"' ";

   var x1 =false;var x2=false;var x3=false;

   excute(sql1,db_config,function(xres1)
   {
       if(xres1)
       {
           x1=true;
           finalx();
       }else{
           x1=false;
           finalx();
       }
   })

   excute(sql2,db_config,function(xres2)
   {
       if(xres2)
       {
           x2=true;
           finalx();
       }else{
           x2=false;
           finalx();
       }
   })

   excute(sql3,db_config,function(xres2)
   {
       if(xres2)
       {
           x3=true;
           finalx();
       }else{
           x3=false;
           finalx();
       }
   })

   function finalx()
   {
       if(x1 && x2 && x3)
       {
           res.send('OK Move Complete');
       }
      // else
     //  {
    //      res.send('Fail Move Data');
     // }
   }

}

function move_data(req, res)
{

    var b =  req.body;

    var modem_id =b.modem_id; //'142190463256';
    var source="'dbname=db_10033 port=5432'";

    var dest=b.database_destination; //'db_10020';
    var tb_name ='ht_'+modem_id
    var q1="'WITH res as ( SELECT * FROM "+tb_name+"  ) SELECT * FROM res'"
 
     /*
    var modem_id ='142190463203';
    var source="'dbname=db_10020 port=5432'";

    var dest='db_10020';
    var tb_name ='ht_'+modem_id
    var q1="'WITH res as ( SELECT * FROM "+tb_name+"  ) SELECT * FROM res'"
  
    //===
    CREATE TABLE img_142181256594_2 AS 
    SELECT
    *
    FROM img_142181256594
    https://blog.francium.tech/postgres-copy-data-using-dblink-extension-8e84ecb2716
    */


var sql='';
sql+='	create	';
sql+='	table	';
sql+='	'+tb_name+'	';
sql+='	  as 	';
sql+='	  select * from dblink('+source+','+q1+' ';
sql+='	  ) as res(	';
sql+='	    "modem_id" varchar(20) COLLATE "default" ,	';
sql+='	    "gps_datetime" timestamp(6) ,	';
sql+='	    "rtc_datetime" timestamp(6),	';
sql+='	    "lon" float8,	';
sql+='	    "lat" float8,	';
sql+='	    "speed" float4,	';
sql+='	    "direction" float4,	';
sql+='	    "altitude" float4,	';
sql+='	    "satelites" float4,	';
sql+='	    "message_id" varchar(20) COLLATE "default",	';
sql+='	    "input_status" float8,	';
sql+='	    "output_status" float8,	';
sql+='	    "analog_input1" varchar(10) COLLATE "default",	';
sql+='	    "analog_input2" varchar(10) COLLATE "default",	';
sql+='	    "mileage" float8,	';
sql+='	    "tambol" varchar(255) COLLATE "default",	';
sql+='	    "etambol" varchar(255) COLLATE "default",	';
sql+='	    "amphur" varchar(255) COLLATE "default",	';
sql+='	    "eamphur" varchar(255) COLLATE "default",	';
sql+='	    "province" varchar(255) COLLATE "default",	';
sql+='	    "eprovince" varchar(255) COLLATE "default",	';
sql+='	    "driver_id" varchar(60) COLLATE "default",	';
sql+='	    "driver_prefix" varchar(10) COLLATE "default",	';
sql+='	    "driver_name" varchar(255) COLLATE "default",	';
sql+='	    "driver_surname" varchar(255) COLLATE "default",	';
sql+='	    "driver_personalcard" varchar(255) COLLATE "default",	';
sql+='	    "driver_type" varchar(10) COLLATE "default",	';
sql+='	    "driver_no" varchar(255) COLLATE "default",	';
sql+='	    "driver_branch" varchar(255) COLLATE "default",	';
sql+='	    "driver_sex" varchar(1) COLLATE "default",	';
sql+='	    "driver_birthcard" varchar(20) COLLATE "default",	';
sql+='	    "driver_expirecard" varchar(20) COLLATE "default",	';
sql+='	    "time_server_recive" timestamp(6),	';
sql+='	    "time_server_fin" timestamp(6),	';
sql+='	    "angle" varchar(4) COLLATE "default",	';
sql+='	    "oil_percent" float8,	';
sql+='	    "oil_liter" float8,	';
sql+='	    "status" varchar(2) COLLATE "default",	';
sql+='	    "heading" varchar(2) COLLATE "default"	';
sql+='	  )	';


has_table(modem_id,dest,function(xhas_table)
{

    if(xhas_table)
    {
       // console.log(xhas_table);
       res.send('OK Already Move Data');
    }
    else
    {
        excute(sql,dest,function(xres1)
        {
            if(xres1)
            {
                res.send('OK Complete Move Data');
            }
            else
            {
                res.send('Fail Move Data');
            };
        });
    }
  

})




}

function list_masterfleet(req, res)
{
    var sql1="  SELECT id,subfleetid,fleetname,dbname   FROM master_fleet  WHERE masterfleet='1' ORDER BY dbname ASC ";

    nrows(sql1,db_config,function(rows)
    {
        res.send(rows);
    })
}

function check_simnumber(req, res)
{
    var b =  req.body;

    var sim =b.sim;
  var sql = " SELECT modem_id,db_name,sim,time_config,vehiclename,carlicence FROM master_config_vehicle WHERE sim LIKE '%"+sim+"%' "; 

nrows(sql1,db_config,function(rows)
{
    res.send(rows);
})

}

exports.detail_fleet = detail_fleet;
exports.master_add_vehicle = master_add_vehicle;
exports.delete_backbox = delete_backbox;
exports.set_fuel = set_fuel;
exports.move_vehicle = move_vehicle;
exports.move_data  = move_data;
exports.list_masterfleet = list_masterfleet;
exports.check_simnumber = check_simnumber;

/*
SELECT 42*95*26 /1000 --103
SELECT 45*110*31 /1000 --153
SELECT 50*100*40 /1000 --200 
SELECT 50*111*45 /1000 --255 
SELECT 60*105*48 /1000 --302
SELECT 60*138*43 /1000 --356

SELECT 60*138*49 /1000 --405
SELECT 60*138*55 /1000 --455
SELECT 62*152*54 /1000 --508
SELECT 71*152*56 /1000 --604

*/

//move_data('','')
