
var moment = require('moment');
var tm = require('hp_timer.js');
var date_service_every =25;

var i=0;
function test(dt_start)
{   
 
    if(i<=11)
    {
        var result =  tm.set_format(tm.dateAdd(dt_start,'day',date_service_every));
        var x1 = moment(result).format("LLLL");
        var t = x1.split(',')
        if(t[0]=='Sunday')
        {
            result = tm.set_format(tm.dateAdd(result,'day',1));
        }
        if(t[0]=='Saturday')
        {
            result = tm.set_format(tm.dateAdd(result,'day',2));
        }
        console.log(  moment(result).format("LLLL"));
   
        i++;
        test(result);
     
    }
    else
    {
        console.log('stop');
    }
      
     

}


var dt_start ='2019-05-23 05:33';
test(dt_start);

/*
Monday, June 3, 2019 5:33 AM
Monday, June 24, 2019 5:33 AM
Monday, July 15, 2019 5:33 AM
Monday, August 5, 2019 5:33 AM
Monday, August 26, 2019 5:33 AM
Monday, September 16, 2019 5:33 AM
Monday, October 7, 2019 5:33 AM
Monday, October 28, 2019 5:33 AM
Monday, November 18, 2019 5:33 AM
Monday, December 9, 2019 5:33 AM
Friday, December 27, 2019 5:33 AM
Monday, January 20, 2020 5:33 AM
*/