
var bcrypt = require('bcrypt-nodejs');
var db = require('iConnectdb_ktc.js');
var utl = require('Utility.js');
var ipm = new db.im2(db.get_configdb_tcp());


var db_config = "master_config";

function add_fleet() 
{
    var role = '1'; //admin 
    //  var role = '0'; //staff
    var db_name = 'db_10001'
    var fleet_name = 'demoktt';
    var password = 'demoktt';
  

    var sql='INSERT INTO master_fleet ("fleetid",  "fleetname", "password '
    sql+=', "dtmdemo", "dtmsign", "portnum", "description", "dbserver", "publicpass", "language" '
    sql+=', "dealerid", "accesscode ';
    sql+=' , "dbname" , "role") '
    sql += " VALUES( " + utl.sqote(db_name) + "," + utl.sqote(fleet_name) + ", " +utl.sqote(encode_pws(password))+ ", '2016-06-06 10:53:36.399663', '2016-06-06 10:53:36.399663', '6000 ', '', '', '', '', '', '' "
    sql += " , " + utl.sqote(db_name) + "," + utl.sqote(role) + " ";

}



function encode_pws(pws) {
    bcrypt.hash(pws, null, null, function (err, hash) {
        // Store hash in your password DB.
        //console.log(hash);
        // callback(hash);
      // var xhash = 
        return hash;
    });
}