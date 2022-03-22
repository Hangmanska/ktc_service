

//#region modules
var fs = require('fs');
var async = require('async');
var mustache = require("mustache");
var moment = require('moment');
var encoding = require("encoding");
var squel = require("squel");
var path = require('path');
var request = require("request");
var prettyjson = require('prettyjson');

var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var db = require('iConnectdb_ktc.js');
var linq = require('linq.js');


var ipm = new db.im2(db.get_configdb_tcp());
var db_config = "master_config";
var db_sugarcane = "sugarcane";
var db_owner = "db_10003";
var BOM = "\uFEFF";
var prefix_tb ='img_'

var api_noticamera = 'http://127.0.0.1:9003/api/noti_camera'; //real 
//#endregion




//#region Camera



function exute_inside(query)
{

    ipm.db.dbname = db_config;
            db.excute(ipm, query, function (response) 
            {
                if (response == 'oK') 
                {
                   console.log('ok');
                }
                else 
                {
                    //res.send('fail');
                }
            });
}


function set_urlcamera_x(req, res)
{
    //debugger;
    var para =  req.body;
   //  var para =  { fleetid: 'db_10005', urlx: 'https://ulxdriugto.localtunnel.me', camera_id: '1010003004' }
   console.log(para)
    var tnow = utl.timenow();
    //console.log(para);
    var query = squel.update()
        .table('realtime')
        .set('camera_lastupdate', tnow)
        .set('camera_url', para.url)
        .where('modem_id = ' + utl.sqote(para.camera_id))
        .toString();

    var sql = "SELECT  status FROM realtime WHERE modem_id=" + utl.sqote(para.camera_id);


    ipm.db.dbname = para.fleetid;
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            db.get_rows(ipm, sql, function (rows) 
            {
                if (rows.length > 0) 
                {
                    //debugger;
                    exute_inside(query);
                    final(rows[0]['status']);
                    
                }
                else
                {
                    final('1');
                }
            });
        }
        
    });



   // final(3);

    function final(status)
    {
        debugger;
        var message_json = {
            "fleet_id": para.fleetid
            , "status": status
            , "lastupdate": tnow
            , "url": para.url
            , "modem_id": para.camera_id
            , 'header': 'noti_camera'
        }

      //  console.log(message_json);

        send_sockio(api_noticamera, message_json, function (xres) 
        {

            ipm.db.dbname = para.fleetid;
            db.excute(ipm, query, function (response) 
            {
                if (response == 'oK') 
                {
                    res.send('ok');
                }
                else 
                {
                    res.send('fail');
                }
            });
        });
    }

   
}


function set_urlcamera_realtime(req, res)
{
    //debugger;
    var para =  req.body;
   //  var para =  { fleetid: 'db_10005', urlx: 'https://ulxdriugto.localtunnel.me', camera_id: '1010003004' }
   console.log(para)

   if(para.modem_id=='1110011002')
   {
      para.camera_id ='143200385009';
      _set_camera(para,req,res) 
   }
   else
   {
      _set_camera(para,req,res) 
   }

}

function _set_camera(para,req,res)
{
    var tnow = utl.timenow();
    //console.log(para);
    var query = squel.update()
        .table('realtime')
        .set('camera_lastupdate', tnow)
        .set('camera_url', para.url)
        .where('modem_id = ' + utl.sqote(para.camera_id))
        .toString();

    var sql = "SELECT  status FROM realtime WHERE modem_id=" + utl.sqote(para.camera_id);


    ipm.db.dbname = db_config
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            db.get_rows(ipm, sql, function (rows) 
            {
                if (rows.length > 0) 
                {
                    //debugger;
                    exute_inside(query);
                    final(rows[0]['status']);
                    
                }
            });
        }
        
    });



   // final(3);

    function final(status)
    {
        debugger;
        var message_json = {
            "fleet_id": para.fleetid
            , "status": status
            , "lastupdate": tnow
            , "url": para.url
            , "modem_id": para.camera_id
            , 'header': 'noti_camera'
        }

      //  console.log(message_json);

        send_sockio(api_noticamera, message_json, function (xres) 
        {

            ipm.db.dbname = para.fleetid;
            db.excute(ipm, query, function (response) 
            {
                if (response == 'oK') 
                {
                    res.send('ok');
                }
                else 
                {
                    res.send('fail');
                }
            });
        });
    }
}

function set_url_multicamera(req, res)
{
    //debugger;
    var para =  req.body;
   //  var para =  { fleetid: 'db_10005', urlx: 'https://ulxdriugto.localtunnel.me', camera_id: '1010003004' }
   /*
   var para =  { fleet_id: 'db_10005',
   status: '2',
  lastupdate: '2019-07-22 06:47:36',
url: 'https://9a978a68.ngrok.io',
 modem_id: '1010005002',
 camera_id: '1010005002_1' }
 */

 // console.log('set_url_multicamera'+JSON.stringify(para))

    var tnow = utl.timenow();
    //console.log(para);
    var query = squel.update()
        .table('master_multicam')
        .set('camera_lastupdate', tnow)
        .set('camera_url', para.url)
        .where('camera_id = ' + utl.sqote(para.camera_id))
        .toString();

    var sql = "SELECT  status FROM realtime WHERE modem_id=" + utl.sqote(para.modem_id);


    ipm.db.dbname = db_config;//para.fleetid;
    db.excute(ipm, query, function (response)
    {
        if (response == 'oK')
        {
            db.get_rows(ipm, sql, function (rows) 
            {
                if (rows.length > 0) 
                {
                    //debugger;
                  //  exute_inside(query);
                    final(rows[0]['status']);
                    
                }
            });
        }
        
    });



   // final(3);

    function final(status)
    {
        debugger;
        var message_json = {
            "fleet_id": para.fleetid
            , "status": status
            , "lastupdate": tnow
            , "url": para.url
            , "modem_id": para.modem_id
            , 'header': 'noti_camera'
        }

     //   console.log(message_json);

        send_sockio(api_noticamera, message_json, function (xres) 
        {
        //    console.log('final set_url_multicamera '+JSON.stringify(xres))
            res.send('ok');
           // res.send(xres);
            /*
            ipm.db.dbname = para.fleetid;
            db.excute(ipm, query, function (response) 
            {
                if (response == 'oK') 
                {
                    res.send('ok');
                }
                else 
                {
                    res.send('fail');
                }
            });
            */
        });
    }

   
}

function set_picsnap_from_pi_multicam(req, res)
{
    var ar = req.body;


   // "file_name":"08-20190724124800-snapshot.jpg","camera_id":"1010005002_1","db_name":"db_10005"}

    if (req.method === 'POST') 
    {
         // console.log(' data ar '+JSON.stringify(ar));
        var body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            console.log('end body '+body);
            res.end('ok');
        });

        req.on('aborted', () => {
            console.error('Request aborted by the user')
        })
        req.on('error', (err) => {
            console.error('Error', err)
            throw err
        })
         
    }

//console.log(ar.file_name+' '+ar.camera_id+' '+ar.db_name);
   // console.log(JSON.stringify(ar))

    /*  */
    var tb_name = prefix_tb+ar.camera_id;

    if( typeof tb_name === 'undefined' || tb_name === null  || typeof ar.db_name === 'undefined')
    {
        console.log('undefind set_picsnap_from_pi')
        console.log(ar);
        res.end();
    }else{
        
        
        var sql =" INSERT INTO "+tb_name+" (idate,img_name,img_data) "; 
        sql +=" VALUES("+utl.sqote(utcp.now())+","+utl.sqote(ar.file_name)+",decode("+utl.sqote(ar.photo)+",'base64') )"
       // res.send('ok');
        /* */
        ocsb_excute(sql,ar.db_name,function(xres)
        {
           res.send(xres);
        })
       
    }
  

}

function set_picsnap_from_pi(req, res)
{
    var ar = req.body;

    if (req.method === 'POST') 
    {
       //   console.log(' data ar '+JSON.stringify(ar));
        var body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            console.log('end body '+body);
            res.end('ok');
        });

        req.on('aborted', () => {
            console.error('Request aborted by the user')
        })
        req.on('error', (err) => {
            console.error('Error', err)
            throw err
        })
         
    }

    var tb_name = prefix_tb+ar.camera_id;

    if( typeof tb_name === 'undefined' || tb_name === null  || typeof ar.db_name === 'undefined')
    {
        console.log('undefind set_picsnap_from_pi')
        console.log(ar);
        res.end();
    }else{
        
        
        var sql =" INSERT INTO "+tb_name+" (idate,img_name,img_data) "; 
        sql +=" VALUES("+utl.sqote(utcp.now())+","+utl.sqote(ar.file_name)+",decode("+utl.sqote(ar.photo)+",'base64') )"
    
        ocsb_excute(sql,ar.db_name,function(xres)
        {
           res.send(xres);
        })
    }



}


function send_sockio(api_name, message_json, callback)
{
    debugger;
    //noti/db_10002/ความเร็วเกินกำหนด125
    //var api_name ='trackingio';
    //var json = {
    //    "fleet_id": "db_10002",
    //    "message": "รถเข้าสถานีzzz"
    //}

    iPost(api_name, message_json, function (response) {
        debugger;
        //  console.log('send_to_sockio ' + response);
        callback(response);
        return;
    });

}

function iPost(url, JsonBody, callback) {
    request({
        uri: url,
        json: true,
        method: "POST",
        body: JsonBody
    }, function (error, response, body) {

        if (error) {
            console.log("err iPost : " + error.message);
        }
        callback(body);
        return;
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

function rows_excute(sql,db_con,callback)
{
    ipm.db.dbname = db_con;
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

function get_tb_img(modem_id)
{
   return prefix_tb+modem_id;
}

function get_picture_db(req, res)
{
    var b = req.body;

    var db_name =b.fleetid;  //"db_10005"//
    var modem_id =b.modem_id; // "1010005006";
    var name_img =b.name_img; // "2017-07-31 00:19:16"
    var tb_name = get_tb_img(modem_id);
    
   var sql=" SELECT idate(idate) as img_name,encode(img_data::bytea, 'base64') as img_base64 FROM "+tb_name+" WHERE idate(idate)="+utl.sqote(name_img);

    rows_excute(sql,db_name,function(rows)
    {
        if(rows.length>0){
            res.send(rows[0]);
        }else{
            res.send([]);
        }
        
    })
     
}

function list_picture_db(req, res)
{
    debugger;
 //   console.log(req.headers.fleetid);
    var b = req.body;
  //  console.log(b);
    var db_name = b.fleetid;  //"db_10005"//
    var modem_id =b.modem_id; // "1010005006";
    var tb_name = get_tb_img(modem_id);
    var start = b.start;//'2017-08-31 00:17'
    var stop = b.stop;// '2017-08-31 23:23'

  

    var sql="  SELECT idate(idate) as img_name FROM "+tb_name;
    sql+="  WHERE idate(idate)>="+utl.sqote(start)+" AND idate(idate)<="+utl.sqote(stop);

      rows_excute(sql,db_name,function(rows)
    {
        res.send(rows);
    })
 
}

function get_picture_infarm (req, res)
{
   console.log(' get_picture_infarm');
    console.log(req.body);
}

function is_infarm(req, res)
{
   console.log(' is_infarm');
    console.log(req.body);
    res.send('ok');
}


exports.set_url_multicamera = set_url_multicamera;
exports.set_picsnap_from_pi_multicam = set_picsnap_from_pi_multicam;
exports.set_urlcamera_realtime = set_urlcamera_realtime;


exports.set_urlcamera_x =set_urlcamera_x;
exports.set_picsnap_from_pi=set_picsnap_from_pi;
exports.get_picture_db = get_picture_db;
exports.list_picture_db = list_picture_db;

exports.get_picture_infarm = get_picture_infarm;
exports.is_infarm = is_infarm;

    /*
setTimeout(function ()
{

}, 1000);
 
  */ 

