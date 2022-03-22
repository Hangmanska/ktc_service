
var express= require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');

var app = express();
server = http.createServer(app);

app.set('view engine', 'jade');

app.get('/readPNG', function(req, res){
    
    //read image file

  var file_name ='gps_mac.jpg';
  var modem_id ='1010003047'
  //C:\_Data\iP\KTC
  var xpath = path.join(__dirname, '/Service_SugarCane/pi_image/' + modem_id+'/'+file_name);

    fs.readFile(process.cwd()+'/pics/gps_mac.jpg', function(err, data){
        
        //error handle
        if(err) res.status(500).send(err);
        
        //get image file extension name
        var extensionName = path.extname(process.cwd()+'/pics/demopic.png');
        
        //convert image file to base64-encoded string
        var base64Image = new Buffer(data, 'binary').toString('base64');
        
        //combine all strings
        var imgSrcString = "data:image/"+extensionName.split('.').pop()+';base64,'+base64Image;
        
        //send image src string into jade compiler
        res.render('index', {imgSrcString: imgSrcString});
    })
});

server.listen(2222);