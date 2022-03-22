/*
var fs = require('fs');
var mime = require('mime');
var request = require('request');

var file = './sample.zip'; // Filename you want to upload on your local PC
var onedrive_folder = 'db_10001'; // Folder name on OneDrive
var onedrive_filename = 'sample.zip'; // Filename on OneDrive
*/
/*
var oneDriveAPI = require('onedrive-api');

oneDriveAPI.items.listChildren({
    accessToken: 'bUT6n6mk8JNq53',
    itemId: 'root',
    shared: true,
    user: 'mis.support@aero1992.com'
  }).then((childrens) => {
  // list all children of dkatavics root directory
  //
     console.log(childrens);
  // returns body of https://dev.onedrive.com/items/list.htm#response
  })
  */

  /*
  https://blog.cloudrail.com/onedrive-nodejs-sdk-integrate-onedrive-api-node-js/
  
  const cloudrail = require("cloudrail-si");
cloudrail.Settings.setKey("[CloudRail License Key]");

// let cs = new cloudrail.services.Box(redirectReceiver, "[clientIdentifier]", "[clientSecret]", "[redirectUri]", "[state]");
let cs = new cloudrail.services.OneDrive(redirectReceiver, "[clientIdentifier]", "[clientSecret]", "[redirectUri]", "[state]");
// let cs = new cloudrail.services.GoogleDrive(redirectReceiver, "[clientIdentifier]", "[clientSecret]", "[redirectUri]", "[state]");
// let cs = new cloudrail.services.Dropbox(redirectReceiver, "[clientIdentifier]", "[clientSecret]", "[redirectUri]", "[state]");

cs.createFolder("/TestFolder", (err) => { // <---
    if (err) throw err;
    let fileStream = fs.createReadStream("UserData.csv");
    let size = fs.statSync("UserData.csv").size;
    cs.upload("/TestFolder/Data.csv", fileStream, size, false, (err) => { // <---
        if (err) throw err;
        console.log("Upload successfully finished");
    });
});
  */

 var fs = require('fs');
 var mime = require('mime');
 var request = require('request');
 
 var file = './data/db_10002/ht_1010002001.csv'; // Filename you want to upload on your local PC
 var onedrive_folder = 'db_10001'; // Folder name on OneDrive
 var onedrive_filename = 'ht_1010002001.csv'; // Filename on OneDrive
 
 request.post({
     url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
     form: {
         redirect_uri: 'http://localhost/dashboard',
         client_id: onedrive_client_id,
         client_secret: onedrive_client_secret,
         refresh_token: onedrive_refresh_token,
         grant_type: 'refresh_token'
     },
 }, function(error, response, body) {
     fs.readFile(file, function read(e, f) {
         request.put({
             url: 'https://graph.microsoft.com/v1.0/drive/root:/' + onedrive_folder + '/' + onedrive_filename + ':/content',
             headers: {
                 'Authorization': "Bearer " + JSON.parse(body).access_token,
                 'Content-Type': mime.getType(file), // When you use old version, please modify this to "mime.lookup(file)",
             },
             body: f,
         }, function(er, re, bo) {
             console.log(bo);
         });
     });
 });