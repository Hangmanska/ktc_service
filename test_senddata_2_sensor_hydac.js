
var fs = require('fs');
var async = require('async');
 //var pi3send = require('pi_senddata_sensor.js');
 var utl = require('Utility.js');

/*
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var portName = "COM4";





var path = __dirname+'\\rawdata_hydac.txt';


//https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-communication-with-node-js/

var com = new SerialPort('\\\\.\\'+portName, {
    baudRate: 9600,
    databits: 8,
    parity: 'none'
}, false);

//var command ="AT$MODID?\r\n"
var index =0;
var ar_command =[];
var gcmd='';

function open_port(callback)
{
    com.open(function (error) 
    {
                if (error) 
                {
                    console.log('Error while opening the port ' + error);
                } 
                else 
                {
                    console.log('CST port open');
               // var buffer = new Buffer(command);
               var cmd = utl.Trim(ar_command[index])+'\r';
               gcmd = cmd;
               console.log('start command '+cmd);

                var buffer = new Buffer(cmd);
                com.write(buffer, function (err, result) 
                {
                    if (err) {
                        console.log('Error while sending message : ' + err);
                    }
                    if (result) 
                    {
                //   var decode = result.toString('ascii', 0, result.length);
                        console.log('recive ' +JSON.stringify(result) );
                        console.log('Response received after sending message : ' + result);
                    }   

                    callback(true);
                    return; 
                });
        }              
        });
}




com.on('open', showPortOpen);
com.on('data', saveLatestData2);
com.on('close', showPortClose);
com.on('error', showError);

function saveLatestData2(data) 
{
    debugger;
    var decode = data.toString('ascii', 0, data.length);

}

    // these are the functions called when the serial events occur:
function showPortOpen() 
{
    debugger;
    console.log('port open. Data rate: ' + com.options.baudRate);
}

function saveLatestData(data) 
{
    debugger;
    var decode = data.toString('ascii', 0, data.length);

    console.log(' #:) recive response :-)'+decode);

   index =  index+1;
  var  command ='';
   if(index !=413)
   {
     command = utl.Trim(ar_command[index])+'\n';
     gcmd = command;

   console.log('index '+index);
  }
  else{
      // command ="AT$REBOOT\n";
     //  gcmd = command;
     console.log('finish');
  }

    sendToSerial(gcmd);
 
  
}

function showPortClose() 
{
    console.log('port closed.');
}

function showError(error) 
{
    console.log('Serial port error: ' + error);
}


function sendToSerial(data) 
{
    // sleep.sleep(1);
    
    console.log("sending to serial: " + data);
    var buffer = new Buffer(data);
    com.write(buffer);
   
}


*/



//Raw A0 value is 569538  SAE is  15.0 SAE

/*
setTimeout(function ()
{
    console.log('start send command 2 serial');
    read_config(function(xar)
    {
        if((xar.length>0))
        {
          //  console.log(xar);
          open_port(function(xsss)
          {
               async.eachSeries(ar_command, function (row, next)
                {
                    var cmd = utl.Trim(row)+'\r';
                   
                    sendToSerial(cmd);
                    next();

                    
                //       var cmd = utl.Trim(row);
                //    console.log(  Parse_sensorval(cmd));
                   

                });
          });
     
        }
       
    })
}, 1000);
*/

var index =0;
var ar_command =[];
var gcmd='';
var path = __dirname+'/rawdata_hydac.txt';
var split_window ='\r\n';
var split_centos = '\n';

function read_config(callback)
{
     // console.log(path);

     console.log(' dir '+__dirname)

     console.log(' dir '+path)
     
    fs.readFile(path, 'utf-8', function (err, data) 
    {
			debugger;
		//	 ar_command  = data.split(split_centos);
        		 ar_command  = data.split(split_window);
            callback(ar_command);
            return;
    }); 
}


function send_no_serial(req, res)
{
   // var refreshIntervalId = setInterval(fname, 10000);

        console.log('start send command 2 serial');
        
    read_config(function(xar)
    {
         console.log(xar.length);

        if((xar.length>0))
        {
          // 
         
               async.eachSeries(ar_command, function (row, next)
                {
                    var cmd = utl.Trim(row)+'\r';
                   
                  //  sendToSerial(cmd);
                  

                    /**/
                      var data = utl.Trim(row);
                    var xres =  Parse_sensorval(data);
                    xres.apikey ='$2a$10$imfccwgRrs7AL1cu3rr3nOjv';
                    xres.group = 'hydacsensor';
                //   console.log(  Parse_sensorval(data));
                  pi3send.send_data('api_sensor/'+xres.sensor_id, {
                   //     'apikey':'$2a$10$imfccwgRrs7AL1cu3rr3nOjv',
                   //     'group': 'hydacsensor',
                     // JSON.stringify(Parse_sensorval(data)) 
                     'data': xres
                    }, function (res)
                    {
                       //sleep.sleep(1);
                           next();
                        console.log(res);
                    });
                    
                   

                },function(){
                       res.send('ok');
                });
         
     
        }
    })
}

/*
setInterval(function() {  
    console.log('sgsgsg');
    send_no_serial();  
}, 10000);

setTimeout(function ()
{
    send_no_serial();

}, 1000);

*/



/*
//A1  A4  A6 A9 A10
setTimeout(function ()
{
    var s='Raw A0 value is 569538  SAE is  15.0 SAE';
    var ar =s.split(' ');
    debugger;
   // console.log(ar);
    
    var res= {"sensor_id":ar[1] ,"rawval":ar[4] ,"sensor_name":ar[6],"calval":ar[9],"unit":ar[10]};

}, 1000);
*/


function Parse_sensorval(sensor)
{
   var ar =sensor.split(' ');
    //debugger;
   // console.log(ar);
    switch(ar[1]){
        case "A1" : {
               var res= {"sensor_id":ar[1] ,"rawval":ar[4] ,"sensor_name":ar[6],"calval":ar[9],"unit":ar[11],"group":'',"apikey":''};
          return res;
        }break;
        default :{
             var res= {"sensor_id":ar[1] ,"rawval":ar[4] ,"sensor_name":ar[6],"calval":ar[9],"unit":ar[10],"group":'',"apikey":''};
          return res;
        }break;
    }
 
}


exports.send_no_serial =send_no_serial;