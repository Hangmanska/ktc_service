



//V=(60*n*2πR*10^(-3))/ (reduction ratio)
//n = rotate speed of motor  (rpm/min)
//R = Radius of the front wheel  = 290 mm
//reduction ratio  = 29.5

var rotate_speed_motor = 5350////4050
var Radius_front_wheel = 290;
var redcution_ratio = 29.5;


function calspeed()
{
  var pi = Math.PI;
  var n = rotate_speed_motor;
  var R = Radius_front_wheel; // 290 ;
  var c =(2*pi*R );
  var x  = (60 * n * c );
  x = x  * Math.pow(10, -3)
  var V =  ( x / redcution_ratio );
   console.log(parseInt( V/1000))
}

calspeed();