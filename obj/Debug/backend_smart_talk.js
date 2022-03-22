

var net = require("net");
var utcp = require('Utility_tcp.js');
//var HOST = "61.91.14.253";//Test local
var HOST = '127.0.0.1';//real server//
var PORT_Connect = 6000; //700
var header_msg = '(*--)';


function send_data(buffer, cb)
{
    // console.log(buffer);
    /*    */
    var socket = net.connect(PORT_Connect, HOST, function () {
        console.log("client start!!!!");
    });

    socket.on("connect", function () {
        console.log("connected");

        var nbuf = new Buffer(buffer);
        socket.write(nbuf);
    });

    socket.on("data", function (data) {
        debugger;
        var nbuf = new Buffer(data);
        var res = nbuf.toString('ascii');
        console.log('recive ' + res);
        var resx = JSON.stringify(data);
        console.log('recive ' + resx);
        //cb(res);
        //return;
        if (utcp.Contains(res, 'oK'))
        {
            //   var resx = JSON.stringify(nbuf);
            //  console.log('recive ' + res);
            //  console.log("client received: " + resx.toString());
            // socket.write('oK');
            //socket.end();
            //  socket.end();

        }
        else
        {
            console.log('recive else ' + res);
        }
        // socket.destroy(); // kill client after server's response

    });

    socket.on('close', function () {
        console.log('Connection closed');
    })

    socket.on('end', function () {
        socket.destroy();
        console.log('disconnected from server');
    });

}

    //exports.send_command = send_command;

function smart_talk(req, res)
{
  
    var b = req.body;
    //var fleet_id = 'db_10001'
    //var modem_id = '1010001006';
    //var command = "AT$QUST?";
    //"AT$MODID?";//'AT$VERSION=?';//'AT$REBOOT';"AT$IGNEN?";//

    var fleet_id = b.fleetid;
    var fleet_name = b.fleetname;
    var modem_id = b.modemid;
    var command = b.command;

    var text = header_msg + '|' + fleet_id + '|' + modem_id + '|' + command;

    console.log(text);

    /**/
    res.send({ success: true, message: text });

    send_data(text, function (x2)
    {
        console.log(x2);
      
    })
    
}

exports.smart_talk = smart_talk;

//#regeion
/*
setTimeout(function () {
    //var data=[49, 48, 49, 48, 48, 48, 49, 48, 49, 57, 44, 50, 48, 49, 54, 48, 56, 50, 54, 48, 57, 53, 52, 50, 51, 44, 49, 48, 48, 46, 55, 54, 53, 56, 49, 53, 44, 49, 52, 46, 48, 50, 53, 50, 57, 53, 44, 48, 44, 48, 44, 49, 57, 44, 49, 50, 44, 50, 44, 48, 44, 48, 44, 48, 46, 48, 48, 48, 44, 48, 46, 48, 48, 48, 44, 50, 48, 49, 54, 48, 56, 50, 54, 48, 57, 53, 52, 50, 51, 44, 48, 13, 10]
    //var data = [250, 248, 0, 1, 169, 236, 149, 78]
    // var data = [0, 1, 1, 0, 0, 9, 65, 84, 36, 77, 79, 68, 73, 68, 61, 63]//AT$MODID?
    //1318448297

    // var raw_data = nbuf.toString('ascii');
    //var data = "AT$MODID?";
    //var xdata = new Buffer(data);
    //var raw_data = xdata.toString('ascii');
    //AT$MODID=?
   
       var data = [79, 75, 58, 73, 71, 78, 69, 78, 13, 10, 36, 73, 71, 78, 69, 78, 61, 49, 44, 50, 44, 48, 44, 48, 13, 10]
       data = new Buffer(data);
       var sdata = data.toString('ascii');
       debugger;
       console.log(sdata);
   

    //var command = 'list_connected'
    var fleet_id = 'db_10001'
    var modem_id = '1010001006';
    var command = "AT$QUST?";//"AT$MODID?";//'AT$VERSION=?';//'AT$REBOOT';"AT$IGNEN?";//
    var text = header_msg + '|' + fleet_id + '|' + modem_id + '|' + command;

    // send_data(data, function (x1)
    // {

    //  console.log(x1);
    send_data(text, function (x2) {
        console.log(x2);
    })
    //})


}, 1000);
*/
//#endregion