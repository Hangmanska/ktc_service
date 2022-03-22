var fs = require("fs"),
    path = require("path");
var util = require('util')
var moment = require('moment');
var async = require('async');

var _ = require('underscore');
var linq = require('linq.js');
var idf = require('iDatediff.js');
var utl = require('Utility.js');

var p = "/var/lib/motion"

//http://stackoverflow.com/questions/7559555/last-modified-file-date-in-node-js
//http://nodeexamples.com/2012/09/28/getting-a-directory-listing-using-the-fs-module-in-node-js/
//http://stackoverflow.com/questions/10559685/using-node-js-how-do-you-get-a-list-of-files-in-chronological-order
//http://stackoverflow.com/questions/20256901/file-path-and-delete-file-in-nodejs

function get_image()
{

    fs.readdir(p, function (err, files) {
    if (err) {
        throw err;
    }

   

    /*
     files.map(function (file) 
     {
         var full = path.join(p, file);
       //  console.log(full);
         var stats = fs.statSync(full);//"/var/lib/motion/05-20161120215031-01.jpg"
         var mtime = new Date(util.inspect(stats.ctime));
         console.log(mtime);
     })
*/
     var filesWithStats = [];
     _.each(files, function getFileStats(file) {
         var full = path.join(p, file);
         var stats = fs.statSync(full);
         var _ctime = new Date(util.inspect(stats.ctime));
         var _now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

       //  console.log('get image ' + _now);

         filesWithStats.push({
             filename: file,
             ctime: _ctime,
             diff : idf.datediff(_ctime,_now).total_min
         });
         file = null;
     });

     //get pictue that datetime more than 5 minute
     var old_file_more5min = linq.Enumerable.From(filesWithStats)
                     .Where(function (x) { return utl.Contains(x.filename, 'snapshot') })
                     .Where(function (x) { return x.diff <= 1 })
                     .ToArray();


     async.eachSeries(old_file_more5min, function (row, next)
     {
         console.log('name ' + row.filename);
       //  fs.unlink(path.join(p, row.filename));
         next();
     });
  

    
});

}


//setInterval(function () {
    // console.log('The answer to life, the universe, and everything!');
    get_image();

//}, 1 * 60  * 1000); 