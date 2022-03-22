
var geolib = require('geolib');

var idiff = require('iDatediff.js');

function test()
{//2016-11-11 16:25:05
    	//2016-11-11 16:26:05
  //var t= geolib.getSpeed(
  //  {lat: 13.780038, lng: 102.203514, time: 1360231200880},
  //  { lat: 13.780086, lng: 102.203529, time: 1360245600880 },
  //  {unit: 'km'}
    // );

   var t= geolib.getSpeed(
    {lat: 51.567294, lng: 7.38896, time: 1360231200880},
    {lat: 52.54944, lng: 13.468509, time: 1360245600880},
    { unit: 'km' }
);
   debugger;
   //var end = 1360245600880;
    //var start = 1360231200880;
   	
   var distance = geolib.getDistance(
         { lat: 13.90839, lng: 101.961181 },
         { lat: 13.909439, lng: 101.948677 }
     );

   var xs = idiff.datediff('2016-11-04 11:14:31', '2016-11-04 11:15:31');

        var time = xs.total_ms;//((end *1)/1000) - ((start*1)/1000);
            var mPerHr = (distance/time)*3600;
            var speed = Math.round(mPerHr * 0.001 * 10000) / 10000;
    //return speed;

   

            console.log(speed);
}

setTimeout(function () {

test();

}, 1000);
