



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

function truncDigits(inputNumber, digits) {
  const fact = 10 ** digits;
  return Math.floor(inputNumber * fact) / fact;
}

function cal_vibration()
{
  /*
  a = v-u/t
  a = ความเร่ง
  v = ความเร็วปลาย km/hr
  u = ความเร็วต้น km/hr
  t = ระยะเวลา (Second)
  a = (10 km/hr – 0.5 km/hr) / 10 Second 
  a = (10 km x 1000 m x 1 hr ) - (0.5 km x 1000 m x 1 hr)
  hr km 3600 S hr km 3600 S
  a = (2.77 m/s – 0.138 m/s) / 10 S
  a = 0.2632 m/S2 = X 
*/

  //var a='';
  var v = 4//10 ; //ความเร็วปลาย km/hr
  var u = 0.5; //ความเร็วต้น km/hr
  var t = 10; //ระยะเวลา (Second)
  var M = 2500 ; // มวลของวัตถุ

  var kx =0;
  var absorb_metal = 59.4;
  //var a = (v-u) / t;
  var x  = v * 1000; //convert to meter
  _x = truncDigits((x/3600),2); //2.77     // 3600s  = 1 hr
  u = u*1000;
  u= truncDigits((u/3600),3) //0.138

  var xx = truncDigits(((_x -u ) / t),4)   //x  0.2632   72.86//
  //var xx = a;
  //var x = v;  //Fd = Mx” + cx’ + kx
  console.log(_x);
  console.log(xx);

   var _u = (M * xx);//660
   _x = truncDigits(_x,1);
   var _v = (M * _x);//6750

   var Fd = _u+_v+kx;

   console.log(Fd)

    var vibration = (Fd * (absorb_metal / 100));
    
    console.log(vibration);
    rate_vibration(vibration)


}

function rate_vibration(force)
{
   if(force > 0 && force < 1100){
     console.log('level_1');
   }else if (force > 1100 && force < 2200){
    console.log('level_2');
   }
   else if (force > 2200 && force < 3300){
    console.log('level_3');
   }
   else (force > 3300 && force > 4000)
   {
    console.log('level_4');
   }
}

//cal_vibration();

//https://www.convertworld.com/en/acceleration/g-unit.html

//https://www.i2cdevlib.com/forums/topic/81-convert-dmp-values-to-g-force/
//https://www.youtube.com/watch?v=aYecA1axhm0

//https://www.youtube.com/watch?v=dXcF-Uqa-gw  ESP32 Web Server with MPU-6050 Accelerometer and Gyroscope (3D object representation)

//https://www.youtube.com/watch?v=bqVqwAQEbfE  Plotting (Graphing) Accelerometer + Gyro MPU6050 using Arduino and Processing

//https://lastminuteengineers.com/mpu6050-accel-gyro-arduino-tutorial/
//https://mjwhite8119.github.io/Robots/mpu6050
//