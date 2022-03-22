var exec = require('child_process').exec;

child =exec('sudo ./ngrok http 8080', function (error,stdout,stderr) {
	console.log('stdout:'+stdout);
	console.log('stderr:'+stderr);       

 if(error !=null){
console.log(error);
}
});

