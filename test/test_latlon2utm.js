
var utm = require('utm-latlng');

function test()
{
    var longitude='99.76033'
    var latitude='14.843041'
    var precision ='47'

   var testtt = utm.convertLatLngToUtm(latitude, longitude,precision);
   console.log(testtt);

}


test();