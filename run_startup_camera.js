var exec = require('child_process').exec;



child =exec('sudo motion', function (error,stdout,stderr) {
        if(error !=null){
console.log(error);
}
});

