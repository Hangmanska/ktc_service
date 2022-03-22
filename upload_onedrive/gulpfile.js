var gulp = require('gulp')
var spsave = require('gulp-spsave')
var watch = require('gulp-watch')
var cached = require('gulp-cached');

var coreOptions = {
    siteUrl: 'https://aero1992-my.sharepoint.com/personal/mis_support_aero1992_com/_layouts/15/onedrive.aspx',
    notification: true,
    // path to document library or in this case the master pages gallery
    folder: "mis.support/Documents/db_10001/", 
    flatten: false

};
//
var creds = {
    username: 'mis.support@aero1992.com',
    password: 'bUT6n6mk8JNq53'
};


gulp.task('spdefault', function() {
    // runs the spsave gulp command on only files the have 
    // changed in the cached files
    return gulp.src('src/**')
        .pipe(cached('spFiles'))
        .pipe(spsave(coreOptions, creds));     
});


gulp.task('default', function() {
    // create an initial in-memory cache of files
    gulp.src('src/**')
    .pipe(cached('spFiles'));
    
    // watch the src folder for any changes of the files
    gulp.watch(['./src/**'], ['spdefault']);
});

//https://www.spdavid.com/post/use-gulp-and-npm-to-automate-2/
// bUT6n6mk8JNq53
// mis.support@aero1992.com

//https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/50b85bfb-678e-41eb-8e65-7debc6123642/isMSAApp/

//https://login.microsoftonline.com/cac719c1-eb1a-4f94-9490-d8beab45f92d/oauth2/v2.0/token
//https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-core

//https://blog.atwork.at/post/Access-files-in-OneDrive-or-SharePoint-with-Microsoft-Graph-and-the-Excel-API