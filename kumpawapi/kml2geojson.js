
var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom 
    DOMParser = require('xmldom').DOMParser;
 
var kml = new DOMParser().parseFromString(fs.readFileSync('foo.kml', 'utf8'));
 
var converted = tj.kml(kml);
 
var convertedWithStyles = tj.kml(kml, { styles: true });