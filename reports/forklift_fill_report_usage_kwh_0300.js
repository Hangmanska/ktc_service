

var async = require('async');
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var geolib = require('geolib');
var schedule = require('node-schedule');
var timespan = require('timespan');
var moment = require('moment');

var db_config = "master_config";
var db_owner = "db_10039";
var percent_capacity_batt = 5.4;
var watt_per_hour =1000;
var Sum_Power_consumption =0;

function find_min_maxbat(modem_id,start_time,stop_time,distance,callback)
{
var sql="";

sql+=" (SELECT recive_time,can_volt_batt,can_percent_batt FROM can_"+modem_id;
sql+=" WHERE recive_time >='"+start_time+"' ";
sql+=" AND recive_time <='"+stop_time+"' ";
sql+=" AND can_percent_batt <='100'  ";
sql+=" ORDER BY recive_time ASC LIMIT 1 ) ";

sql+="  UNION ALL  ";

sql+=" (SELECT recive_time,can_volt_batt,can_percent_batt FROM can_"+modem_id;
sql+=" WHERE recive_time >='"+start_time+"' ";
sql+=" AND recive_time <='"+stop_time+"' ";
sql+=" AND can_percent_batt <='100'  ";
sql+=" ORDER BY recive_time DESC LIMIT 1 ) ";

//debugger
    ipm.db.dbname = db_owner;
    db.get_rows(ipm, sql, function (row) 
    {
        if(row.length>0)
        {
           // console.log(row[0].can_percent_batt-row[1].can_percent_batt);
            var AA = row[0].can_percent_batt-row[1].can_percent_batt;
            var volt_batt = row[0].can_volt_batt;

            var M  = parseFloat(AA * percent_capacity_batt * volt_batt).toFixed(3);
       
            var Power_consumption_rate  = parseFloat(M / watt_per_hour).toFixed(3); 

            var rate_usage_power_per_km = 0;

            if(distance > 0){
                rate_usage_power_per_km = parseFloat( Power_consumption_rate / distance).toFixed(3);
                Sum_Power_consumption = (parseFloat( Sum_Power_consumption) + parseFloat( rate_usage_power_per_km)).toFixed(3);
            }else{
                rate_usage_power_per_km = 0;
                Sum_Power_consumption =0;
            }
        

           //  console.log(AA +' '+volt_batt+' '+M +' Power_consumption_rate ='+Power_consumption_rate+' rate_usage_power_per_km='+rate_usage_power_per_km+' Sum_Power_consumption='+Sum_Power_consumption)
             update_rp_trip_fill_powerconsump(modem_id,start_time,Power_consumption_rate,rate_usage_power_per_km,Sum_Power_consumption,function(xres_cal)
             {
                callback(true);
                return
             })

        }
        else
        {
            update_rp_trip_fill_powerconsump(modem_id,start_time,'0','0','0',function(xres_cal)
            {
               callback(true);
               return
            })
        }
    });


}


function update_rp_trip_fill_powerconsump(modem_id,start_date,Power_consumption_rate,rate_usage_power_per_km,Sum_Power_consumption,callback)
{
    var sql =" UPDATE rp_trip SET power_consumption_rate='"+Power_consumption_rate+"' ";
    sql +=" ,power_consumption_per_km='"+rate_usage_power_per_km+"' "
    sql +=" ,sum_power_consumption='"+Sum_Power_consumption+"'  "
    sql +=" WHERE modem_id='"+modem_id+"' AND start_date='"+start_date+"' ";

    ipm.db.dbname = db_config;
    db.excute(ipm, sql, function (response) 
    {
       if (response == 'oK') 
       {
          callback(true);
         return;
       }
       else
       {
         callback(true);
         return;
       }
    });


}


function main(modem_id,time_process,callback)
{
    var start_time = time_process+" 00:00";
    var stop_time = time_process+" 23:59";

var sql="";
 sql+=" SELECT DISTINCT idate(start_date) as start_date,idate(end_date) as end_date ";
 sql+=",modem_id  ";
 sql+=",itime_use(timeuse) as timeuse  ";
 sql+=",round(dblink_forklift_sum_mileage('db_10039',modem_id,idate(start_date),idate(end_date)),4) as distance  ";
 sql+=" FROM rp_trip   ";
 sql+=" WHERE modem_id='"+modem_id+"'  ";
 sql+=" AND start_date >='"+start_time+"'  ";
 sql+=" AND end_date <='"+stop_time+"' ";
 sql+=" AND timeuse > 1  ";
 sql+=" ORDER BY start_date ASC ";

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
      //  console.log('main '+res.length);
        if(res.length >0)
        {
            async.eachSeries(res, function (row, next) 
            {
               // row.start_date 
              //  row.end_date
    
                find_min_maxbat(modem_id, row.start_date , row.end_date,row.distance,function(x_res)
                {
                   // console.log(' main '+x_res);
                    next();
    
                });
    
            },function(){
               // console.log('finish main');
                callback(true);
                return;
            });
        }else{
            console.log(' no data ');
            callback(true);
            return;
        }
        
    });



}

//main('143190871464');

function get_vehicle_electric()
{
    var sql=" SELECT DISTINCT r.modem_id ";
    sql+=" FROM master_config_vehicle as mcv,setup_vehicle as sv,realtime as r ";
    sql+=" ,fn_tb_getbrand_vehicle(mcv.vehicle_model_id::INTEGER) as x ";
    sql+=" WHERE	mcv.db_name=sv.fleetid ";
    sql+=" AND sv.modem_id= mcv.modem_id  AND sv.modem_id=r.modem_id ";
    sql+=" AND mcv.db_name='db_10039' AND sv.fleetcode IN ('572','573','607','608','609','574','575') ";
    sql+=" AND x.xvehicletypeid='48' ";

    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");

    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) 
    {
        if (res.length > 0) 
        {
            async.eachSeries(res, function (row, next) 
            {
               // console.log(res.length+' '+row.modem_id);
                main(row.modem_id,date_gen_report,function(x_res)
                {
                    if(x_res)
                    {
                        next();
                    }else{
                        console.log('get_vehicle_electric() '+x_res);
                        next();
                    }
                   
                })
                
            },function()
            {
                console.log("+++ finish +++ ");
            })
        }
    });

}



var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 03;
rule.minute = 00;


schedule.scheduleJob(rule, function ()
{
   // console.log('Harvester Midnight This runs at 23:59 every day.');

    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    console.log('start forklift_fill_report_usage_kwh ' + date_gen_report + ' timenow : ' +  moment().format('YYYY-MM-DD HH:mm:ss'));

    get_vehicle_electric();
  
});

console.log("start program cal usage kwh"+ moment().format('YYYY-MM-DD HH:mm:ss')+" wait process at 03:00 every day")

//get_vehicle_electric(); 