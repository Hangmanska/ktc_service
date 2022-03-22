var minifyAll = require("minify-all");

minifyAll("D:/zip_project/tcp_server/root/server_tcp", { silent: true }, function(err){
    if(err){
        console.log(err);
    }
});