"use strict";

require('dotenv').config();

var express      = require('express');
var sessions     = require('express-session');
var path         = require('path'); 
var router       = express.Router();
var app          = express(); 


app.use('/css', express.static(path.join(__dirname, 'css'))); 
app.use('/data', express.static(path.join(__dirname, 'data'))); 
app.use('/games', express.static(path.join(__dirname, 'games'))); 
app.use('/js', express.static(path.join(__dirname, 'js'))); 

app.use('/tela01', function(req, res){ 
    res.sendFile(path.join(__dirname, 'index.html')); 
});


router.get('/', function(req, res){ 
    res.sendFile(path.join(__dirname, 'index.html')); 
});

module.exports = router;