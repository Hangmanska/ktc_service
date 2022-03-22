//var http = require('http'); //Https module of Node.js
var request = require('request');
//var fs = require('fs'); //FileSystem module of Node.js
//var FormData = require('form-data'); //Pretty multipart form maker.
//var restler = require('restler');

var api_server = 'http://127.0.0.1:9003/api/upload_image';
var file_name = '01-20161126024100-snapshot.jpg';
var image = __dirname + '/'+file_name;



var upload_image = function(fileBase64Encoded, cb) {

//console.log(buff);
  var r = request.post(api_server, function (err, httpResponse, body)
{
    if (err)
    {
        cb(err);
    }
    cb(null, body);
});

var form = r.form();
//form.append('file', buff, { filename: 'temp.txt' });
form.append('file', buff);
form.append('file_name', file_name);
}

var buff = new Buffer(fs.readFileSync(image)).toString("base64");

upload_image(buff, function (xres)
{

})

