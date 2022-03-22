
/*
const { app, BrowserWindow } = require('electron');

app.on('ready', function() {
    var mainWindow = new BrowserWindow({
        show: false,
    });
    mainWindow.maximize();
    mainWindow.loadFile('boundig.html');
    mainWindow.show();
});
*/

const { app, BrowserWindow } = require('electron')

let tray = null
app.on('ready', () => {
 // tray = new Tray('/path/to/icon.png')
 // tray.setTitle('hello world')
 var mainWindow = new BrowserWindow({
    show: false,
});
mainWindow.maximize();
mainWindow.loadFile('boundig.html');
mainWindow.show();
})