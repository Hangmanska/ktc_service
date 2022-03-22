
var fs = require("fs");
var path = require("path");
var utl = require('Utility.js');

function list_image_playback(req, res)
{
  var modem_id ='1010003025'
  var dir = path.join(__dirname, '/Service_SugarCane/pi_image/' + modem_id+'/');
   var ar=[];
    fs.readdir(dir, function (err, files) 
    {
        if (err) {
            throw err;
        }
          //  ar.push(files);
       // console.log(files);
       res.send(files);
   });
}

//app.get('/readPNG', function(req, res){

function get_image_playback()
{

/*2017-01-15 12:49:00 image picture
SELECT * FROM ht_1010003025 WHERE gps_datetime >= '2017-01-15 12:48:00'
AND gps_datetime <= '2017-01-15 12:49:00'
AND input_status='5'
ORDER BY gps_datetime ASC
LIMIT 1
 */
//
 //read image file
  var file_name ='19-20170104063700-snapshot.jpg';
  var modem_id ='1010003047'
  var xpath = path.join(__dirname, '/Service_SugarCane/pi_image/' + modem_id+'/'+file_name);

    fs.readFile(xpath, function(err, data){
        
        //error handle
        if(err) res.status(500).send(err);
        
        //get image file extension name
        var extensionName = path.extname(xpath);
        
        //convert image file to base64-encoded string
        var base64Image = new Buffer(data, 'binary').toString('base64');
        
        //combine all strings
        var imgSrcString = "data:image/"+extensionName.split('.').pop()+';base64,'+base64Image;
        
        console.log(imgSrcString);
        //send image src string into jade compiler
       // res.render('index', {imgSrcString: imgSrcString});
    })
//});

}
    
exports.list_image_playback = list_image_playback;
   

/*

SELECT ((88.42 -82.26) / 124.0)
--0.04


SELECT COUNT(status) FROM ht_1010003001
WHERE gps_datetime >='2016-12-21 13:36:19'
AND gps_datetime <='2016-12-21 17:14:29'
*/
setTimeout(function ()
{
 // list_image_playback();
 //get_image_playback();
 //test();
    var id='1010005007'
   id =  utl.Mid(id,3,5);
   console.log(id)
}, 1000);


function test()
{
    var j= 88.42
    var r=0;
    for(var i=0;i<=124;i++)
    {
      r = j - 0.0496;
      j=r;
      console.log(r);
    }
}

var utl = require('Utility.js');

