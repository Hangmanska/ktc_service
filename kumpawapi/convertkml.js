

var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;
    var async = require('async');
var utl = require('Utility.js');
var utcp = require('Utility_tcp.js');
var iutm = require('utm2latlon.js');
var iBuildText = require('iGenTextFile.js');

    var path = __dirname+'\\ศราวุธ แสนหลวง.kml';

       fs.readFile(path, 'utf-8', function (err, data) 
    {
		//	debugger;
		var kml = new DOMParser().parseFromString(data);

    
        var converted = tj.kml(kml);
       var array = converted.features;

      iBuildText.build_text('c:\\ศราวุธ แสนหลวง.geojson', JSON.stringify(converted))
    debugger;
      //  var convertedWithStyles = tj.kml(kml, { styles: true });

         
      //  var data = JSON.stringify(utl.Trim(data.toString()));


       // data = JSON.parse(data);
      //  var array = data.toString().split('\n');




    }); 



