

var ngrok = require('ngrok');
 

ngrok.connect(8081, function (err, url) {
    console.log(url);
});