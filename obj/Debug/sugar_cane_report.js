
//#region
var async = require('async');


var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var helper = require('yazaki_helper.js');
var hpt = require('hp_timer.js');
var linq = require('linq.js');

var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";

//#endregion

function driving_temp()
{
    this.current_time = "";
    this.next_time = "";
    this.sdiff = "";
}

function driving()
{
    this.start = "";
    this.stop = "";
    this.sdiff = "";
}

function test()
{
    var sql="SELECT gps_datetime,analog_input2,analog_input3 FROM ht_863835021279075 WHERE analog_input2='0' AND analog_input3='1' ORDER BY gps_datetime ASC";
    ipm.db.dbname = 'db_10003';
    var res_ar = [];
    var final = [];
    db.get_rows(ipm, sql, function (rows)
    {
        debugger;
        var end_loop = rows.length;

        for (var i = 0; i < end_loop; i++)
        {
            if (i != end_loop - 1)
            {
                var cur_dt = rows[i]['gps_datetime'];
                var next_dt = rows[i + 1]['gps_datetime'];
                var res_diff = helper.diff_second(cur_dt, next_dt);

                var temp = new driving_temp();
                temp.current_time = hpt.set_format(cur_dt);
                temp.next_time = hpt.set_format(next_dt);
                temp.sdiff = res_diff;

                res_ar.push(temp);
            }
            else
            {
                // console.log('finish');
                debugger;
                // console.log(JSON.stringify(res_ar));
                //var temp = new driving_temp();
                //temp.current_time = hpt.set_format(rows[0]['gps_datetime']);
                //res_ar.push(temp);

                var x_row = linq.Enumerable.From(res_ar)
                .Where(function (x) { return parseInt(x.sdiff) > 10 })
                .ToArray();

                /*
                for (var i = 0; i < x_row.length; i++)
                 {
                    
                        if (i == 0)
                        {
                            var start = rows[0]['gps_datetime'];
                            var stop = x_row[i].current_time;

                            var temp = new driving();
                            temp.start = hpt.set_format(start);
                            temp.stop = hpt.set_format(stop);
                            temp.sdiff = helper.diff_second(start, stop);
                            final.push(temp);

                            start = x_row[i].next_time;
                        }
                        else
                        {
                            var temp = new driving();
                            var stop = x_row[i].current_time;

                            temp.start = hpt.set_format(start);
                            temp.stop = hpt.set_format(stop);
                            temp.sdiff = helper.diff_second(start, stop);
                            final.push(temp);

                            start = x_row[i].next_time;

                           
                        }
                    }
                    
                 }
*/

                var j = 0;
                async.eachSeries(x_row, function (row, next)
                {

                    if (j == 0)
                    {
                        var start = rows[0]['gps_datetime'];
                        var stop = row.current_time;

                        var temp = new driving();
                        temp.start = hpt.set_format(start);
                        temp.stop = hpt.set_format(stop);
                        temp.sdiff = helper.diff_second(start, stop);
                        final.push(temp);

                        start = row.next_time;
                        j++;
                        next();
                    }
                    else
                    {
                        var temp = new driving();
                        var stop = row.current_time;

                        temp.start = hpt.set_format(start);
                        temp.stop = hpt.set_format(stop);
                        temp.sdiff = helper.diff_second(start, stop);
                        final.push(temp);

                        start = row.next_time;
                        j++;
                        next();

                    }


                }, function () {
                    console.log('fin');
                });


            }
        }
        
    });

}

setTimeout(function ()
{
    test();
}, 1000);