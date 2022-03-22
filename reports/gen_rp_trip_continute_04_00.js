
//#region modules
var schedule = require('node-schedule');
var timespan = require('timespan');
var async = require('async');
var moment = require('moment');
var squel = require("squel");
var mustache = require("mustache");

var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var iBuildText = require('iGenTextFile.js');
var linq = require('linq.js');
var utl = require('Utility.js');
var irp = require('iReports.js');

var db_config = "master_config";
//https://jsonformatter.curiousconcept.com/

//#endregion


//#region structure
function driving_temp()
{
    this.modem_id = '';
    this.start_date = '';
    this.end_date = '';

    this.time_use = '';
    this.start_loc_th = '';
    this.end_loc_th = '';
    this.start_loc_en = '';
    this.end_loc_en = '';


    this.distance = 0;
    this.start_mile = 0;
    this.end_mile = 0;
    this.start_lonlat = '';
    this.end_lonlat = '';

    this.oil_level = 0;
    this.speed = 0;
}
//#endregion


//#region track report trip

function add_track_report_trip(para, callback) 
{
    var query = squel.insert()
        .into('track_rp_trip_continue')
        .set('modem_id', para.modem_id)
        .set('date_report', para.date_gen_report)
        .set('start_process', irp.timenow())
        .set('message', para.message)
        .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, query, function (response) 
    {
        if (response == 'oK') 
            {
            var sql = "SELECT id FROM track_rp_trip_continue ORDER BY id DESC LIMIT 1";
            db.get_rows(ipm, sql, function (row) 
            {
                if (row.length > 0)
                {
                    var id = row[0].id
                    callback(id);
                    return;
                }
            });
        } 
        else 
        {
            callback(0);
            return;
        }

    });
}

function set_track_report_trip(para, callback) 
{
    debugger;
    var query = squel.update()
       .table('track_rp_trip_continue')
       .set('end_process', irp.timenow())
       .set('message', para.message)
       .set('is_complete', para.complete)
      .where('id = ' + utl.sqote(para.id))
      .toString();

    ipm.db.dbname = db_config;
    db.excute(ipm, query, function (response) 
    {
        if (response == 'oK') 
        {
            callback(response);
            return;
        }
        else 
        {
            callback([]);
            return;
        }
    });
}

function set_track_report(para, callback)
{
    set_track_report_trip(para, function (xres)
    {
        if (xres == 'oK') {
            callback(xres);
            return;
        } else {
            callback([]);
            return;
        }
    });
}

//#endregion




function ical_distance(lonlat_start,lonlat_end) {
    var r = utl.Split(lonlat_start, ',');
    var n = utl.Split(lonlat_end, ',');
    return irp.cal_distance(r[0], r[1], n[0], n[1]);
   // return res;
}

    //#endregion




function get_data(para, callback)
{

var sql = ' ';
sql += " SELECT modem_id,idate(start_date) as start_date,idate(end_date) as end_date,start_loc_th,end_loc_th ";
sql += " ,start_loc_en,end_loc_en,start_lonlat,end_lonlat ";
sql += " ,itime_use(timeuse) as timeuse ";
sql += " ,distance as distance,start_mile,end_mile ";
sql += " ,(distance / get_oil_level('"+para.modem_id+"')) as fuel ";
sql += " FROM rp_trip ";
sql += " WHERE modem_id='"+para.modem_id+"' ";
sql += " AND start_date >='"+para.start_time+"' ";
sql += " AND end_date <='"+para.end_time+"' ";
sql += " ORDER BY start_date ";

    var start_first = true;
    var res_ar = [];
    var temp='';
    var before_date ='';
    var before_loc_end_th='';
    var before_loc_end_en='';
    var before_lonlat='';
    var before_mile='';


  ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) 
    {
        if (rows.length > 0) 
        {
            async.eachSeries(rows, function (row, next) 
            {
                if(start_first)
                {
               
                temp = new driving_temp();
                temp.modem_id = row.modem_id;
                temp.start_date = row.start_date;
                temp.end_date = row.end_date;

                
                temp.start_loc_th = row.start_loc_th;
                temp.end_loc_th = row.end_loc_th;

                temp.start_loc_en = row.start_loc_en;
                temp.end_loc_en = row.end_loc_en;

                temp.start_lonlat = row.start_lonlat;
                temp.end_lonlat = row.end_lonlat;

                temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                temp.start_mile = row.start_mile;
                temp.end_mile = row.end_mile;
                
                res_ar.push(temp);

                before_loc_end_th=row.end_loc_th;
                before_loc_end_en=row.end_loc_en;
                before_lonlat = row.end_lonlat;
                before_date  = row.end_date;
                before_mile = row.end_mile;
                start_first = false;
                next();
               
                }
                else
                {
                    temp = new driving_temp();
                    temp.modem_id = row.modem_id;
                    temp.start_date = before_date;
                    temp.end_date =  row.start_date;

                    temp.start_mile = before_mile;
                    temp.end_mile = row.start_mile;              
                
                    temp.start_loc_th = before_loc_end_th;
                    temp.end_loc_th = row.start_loc_th;

                    temp.start_loc_en = before_loc_end_en;
                    temp.end_loc_en = row.start_loc_en;

                    temp.start_lonlat =  before_lonlat
                    temp.end_lonlat = row.end_lonlat;

                    temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                    temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);


                    res_ar.push(temp);

                    temp = new driving_temp();
                    temp.start_date = row.start_date;
                    temp.end_date = row.end_date;
                    temp.start_mile = row.start_mile;
                    temp.end_mile = row.end_mile;
                   
                    temp.modem_id = row.modem_id;
                    
                    temp.start_loc_th = row.start_loc_th;
                    temp.end_loc_th = row.end_loc_th;

                    temp.start_loc_en = row.start_loc_en;
                    temp.end_loc_en = row.end_loc_en;
                    temp.start_lonlat = row.start_lonlat;
                    temp.end_lonlat = row.end_lonlat;

                    temp.time_use = irp.diff_min(temp.start_date, temp.end_date);
                    temp.distance = ical_distance(temp.start_lonlat, temp.end_lonlat).toFixed(2);
                   
                    res_ar.push(temp);

                    before_date  = row.end_date;
                    before_lonlat = row.end_lonlat;
                    before_loc_end_th=row.end_loc_th;
                    before_loc_end_en=row.end_loc_en;
                    before_mile = row.end_mile;

                    next();
                     
                }
              

            },function()
            {
               debugger;
                if (res_ar.length > 0) 
                {
                    console.log('add_rp_trip_continue '+para.modem_id);
                    add_rp_trip_continue(para.id, res_ar, function (xrr) 
                    {
                        callback(xrr);
                        return
                    });
                }
                 
            });

        }
        else
        {
             callback([]);
            return;
        }
    });


}



function add_rp_trip_continue(id, res, callback)
{
    debugger;
    var strMustache = '{{#.}}';
    strMustache += "('{{modem_id}}','{{start_date}}','{{end_date}}','{{start_loc_th}}','{{end_loc_th}}','{{start_loc_en}}','{{end_loc_en}}' ";
    strMustache += ",'{{start_mile}}','{{end_mile}}','{{distance}}','{{time_use}}','{{start_lonlat}}','{{end_lonlat}}'";
    strMustache += "),";
    strMustache += '{{/.}}';

    var result_val = mustache.render(strMustache, res);
    result_val = utl.iRmend(result_val);
    var sql = " INSERT INTO rp_trip_continue(modem_id,start_date,end_date,start_loc_th,end_loc_th,start_loc_en,end_loc_en";
    sql += ",start_mile,end_mile,distance,timeuse,start_lonlat,end_lonlat) VALUES " + result_val;


    //  iBuildText.build_text('c:\\sql_x.txt', sql)
    
    if (res.length > 0)
    {
        var para = { 'id': id, 'message': '', 'complete': 0 };

        ipm.db.dbname = db_config;
        db.excute(ipm, sql, function (response) 
        {
            if (response == 'oK') 
            {
                para.complete = 1;
                para.message = response;
                set_track_report_trip(para, function (xres) 
                {
                    if (xres == 'oK') 
                    {
                        callback(xres);
                        return;
                    }
                });
            }
            else 
            {

                para.complete = 0;
                para.message = response;
                set_track_report_trip(para, function (xres) 
                {
                    if (xres == 'oK')
                    {
                        callback([]);
                        return;
                    }
                });
            }
        });
    }
    else
    {
        console.log('empty data');
        callback([]);
        return;
    }
}

function start(date_gen_report) {

    // var date_gen_report = '2016-07-02'; //WHERE modem_id IN ('1010006001','1010006002','1010006003') 
    var sql = "SELECT modem_id,db_name,speedmax,track_every,oil_level  FROM master_config_vehicle WHERE db_name='db_10001'  ORDER BY modem_id";
    //WHERE modem_id='1010001003' 
    console.log('start genreport_trip_continue ' + date_gen_report + ' timenow : ' + irp.timenow());

    //var date_gen_report = '2016-06-25';
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (res) {
        if (res.length > 0) {
            async.eachSeries(res, function (row, next) 
            {
                //   debugger;
                // console.log(row);
                var para = { 'id': 1, 'db_name': row.db_name, 'modem_id': row.modem_id, 'start_time': date_gen_report + ' 00:00', 'end_time': date_gen_report + ' 23:59', 'date_gen_report': date_gen_report, 'message': '', 'oil_level': row.oil_level }

                add_track_report_trip(para, function (xid) 
                {
                    para.id = xid;
                    get_data(para, function (xres) 
                    {
                        if (xres != null) 
                        {
                            next();
                            console.log(xres);
                        }
                        else
                        {
                            next();
                            console.log('ielse ' + xres);
                        }

                    });
                });


            }, function () {
                console.log('finish master');
            });
        } else {
            console.log('empty data');
        }
    });

}

//#region job start at 04:00 after finish gen_trip normal

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 04;
rule.minute = 00;

schedule.scheduleJob(rule, function () 
{
    //var date_gen_report = moment().format("YYYY-MM-DD");
    var date_gen_report = moment().subtract(1, "days").format("YYYY-MM-DD");
    start(date_gen_report);

});

    //#endregion


//#region test


/*
setTimeout(function ()
{
    //get_engine_start_first('db_10001', '1010001002', '2016-06-25', function (xres) {
    //    debugger;
    //    console.log(xres);
    //});
   // start('2017-04-07');
  var date_gen_report = '2017-08-12';//moment().subtract(1, "days").format("YYYY-MM-DD");
    start(date_gen_report);

}, 1000);
*/
//#endregion

//#region
    /*
    
function coutPage(Row, valueDev) {
    debugger;
    Row = parseInt(Row);
    var count_Dev = parseInt(Row / valueDev);
    var count_Mod = Row % valueDev;

    if (count_Mod > 0) {
        Row = parseInt(count_Dev + 1);
    }
    else
    {
        if (count_Mod == 0) {
            Row = 1;
        }
        else {
            Row = Row;
        }
    }
    var res = { 'total_page': count_Dev, 'row_per_page': valueDev, 'last_page': count_Mod }
    return res;
}

function start2()
{
    console.log(coutPage(24, 10));
}

      SELECT gps_datetime,lon,lat,speed,status,satelites,altitude
,message_id,analog_input1,analog_input2
,mileage,tambol,amphur,province
,heading
 FROM ht_1010001002 
WHERE gps_datetime >='2016-06-23 00:00' 
AND gps_datetime <='2016-06-23 23:59' 
--AND status ='1' 
AND satelites >'0'
AND message_id ='11'
 */
//#endregion

