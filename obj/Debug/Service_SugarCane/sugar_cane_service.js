
var fs = require('fs');
//var async = require('async');
var utl = require('Utility.js');

function test(){
    
    var path_geojson = __dirname + '/data.geojson';
    fs.readFile(path_geojson,  function (err, data)
    {
        debugger;

        data = utl.Trim(data);

        console.log(data);
    

    });
}


setTimeout(function ()
{
    test();

}, 1000);