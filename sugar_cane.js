
    /**/
    //http://gis.stackexchange.com/questions/142391/store-a-geojson-featurecollection-to-postgres-with-postgis
var toJSON = require('shp2json');
var gentext = require('iGenTextFile.js');

    //var stdout = process.openStdin();
var Stream = require('stream').Stream;
var path_shape = __dirname + '/shape_data/แปลงรถตัด111059_รับเข้าโครงการ_ลงคิว.shp';
var decoder = new (require('string_decoder').StringDecoder)('utf-8')
// toJSON.fromShpFile(path_shape).pipe(
//    process.stdout
//);

 var outStream = new Stream;
 outStream.writable = true;

 var data = '';
 outStream.write = function (buf) {
     data += buf.toString('utf8');
 };

 outStream.end = function ()
 {
    // var geo = JSON.parse(data);
     gentext.build_text('c:\\_1data_shp.txt',  data)
 };

 toJSON.fromShpFile(path_shape).pipe(outStream);


