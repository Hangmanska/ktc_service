

var filepath = '~/007.jpg'

var express = require('express');
var app = express();

app.get('/set_picsnap_from_esp32cam', function (req, res) {
    res.sendFile(filepath);
})