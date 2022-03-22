
var request = require('request');
var mustache = require("mustache");
var moment = require('moment');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var async = require('async');
var utl = require('Utility.js');

var linq = require('linq.js');
var db = require('iConnectdb_ktc.js');
var ipm = new db.im2(db.get_configdb_tcp());
var exec = require('child_process').exec;

var db_config = "master_config";
var Report = require('./backend_reports.js');
var BOM = "\uFEFF";


//
//http://stackoverflow.com/questions/19492846/javascript-to-csv-export-encoding-issue

function process(param,callback)
{
  //  console.log(moment().subtract(1, 'days').format("YYYY-MM-DD"));

    


    Report.Gen_report_trip(param, function (xres)
    {
        debugger;


        //var header_column = linq.Enumerable.From(source)
        // .Select("$.Key")
        // .ToString(',') + '\r\n';
   /*
        var ar_header = linq.Enumerable.From(source)
         .Select("$.Key")
         .ToArray();

        var template_start = '{{#.}}';

        for (var i = 0; i < ar_header.length; i++)
        {
            template_start += "{{{" + ar_header[i] + "}}},"
        }


        template_start = utl.iRmend(template_start);

        template_start = template_start + "\r\n{{/.}}";

*/

        var hd_text = "\r\n\r\n รายงานการใช้รถ  : " + param.start_time + ' \r\n';
        var header_column = "เวลาเริ่ม,สถานที่,เวลาสิ้นสุด,สถานที่,ระยะเวลา (ชม.),ระยะทาง (กม.),น้ำมัน (ลิตร)" + '\r\n';
        var template_start = "{{#.}}{{start_date}},{{end_date}},{{start_loc_th}},{{end_loc_th}},{{timeuse}},{{distance}},{{fuel}}\r\n{{/.}}";

        var summary = { "end_loc_th":"สรุป","timeuse": xres.sum[0].timeuse, "distance": xres.sum[0].distance, "fuel": xres.sum[0].fuel };
        xres.rows.push(summary);


        var data = mustache.render(template_start, xres.rows);

        data = BOM + hd_text + header_column + data;

        var filename_fin = param.fleetid + '_' + param.vehicle_name + '.csv';

        
        var uri ='./directory-csv/'+filename_fin;
        fs.writeFile(uri, data, 'utf8', function (err) {
            if (err) 
            {
               
                console.log('error when create ' + err);
                callback(false);
                return;
            } 
            else 
            {
                // callback('ok', param.modem_id);
                console.log('ok'+param.modem_id);
                callback(true);
                return;
            }
        });

    });



    /*
    var sql = "SELECT fleetid,fleetname FROM master_fleet WHERE automail='1' ";
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            res.send(rows);
        }
        else {
            res.send([]);
        }
    });
    */

}

function get_vehicle(callback)
{
    var sql="  SELECT modem_id,get_vehiclename(modem_id) as vehicle_name FROM master_config_vehicle WHERE db_name='db_10001' ORDER BY modem_id ASC "
    ipm.db.dbname = db_config;
    db.get_rows(ipm, sql, function (rows) {
        if (rows.length > 0) {
            callback(rows);
            return;
        }
        else
        {
            callback([]);
            return;
        }
    });
}

function start() {


    get_vehicle(function (res)
    {

        async.eachSeries(res, function (vehicle, next)
        {
            debugger;
            var param = {
                'fleetid': 'db_10001', 'modem_id': vehicle.modem_id, 'vehicle_name': vehicle.vehicle_name, 'start_time': '2016-09-29 00:00', 'end_time': '2016-09-29 23:59'
            };

            process(param, function (xres)
            {
                if (xres == true)
                {
                    next();
                }
                else
                {
                    next();
                }

            });
        }, function () {
            console.log('fin');
        });
    });

}

function python_combine(path, callback) {
    exec("python combine.py " + path, function (error, stdout, stderr) {
        console.log('stdout : python_combine ' + stdout);
        console.log('stderr : python_combine ' + stderr);
        if (error !== null) {
            console.log('exec error : ' + error);
        }

        callback();
        return;
    });
}

setTimeout(function () {
    //   get_period();
    //process();
    //test_readDirectory();
    //start();
    python_combine(__dirname + '\directory-csv\db_10001', function () {
        console.log();
    })
  

}, 1000);