"use strict";



var express      = require('express');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser'); 
var path         = require('path');  
var helmet       = require('helmet');
var sessions     = require('express-session');
var router       = express.Router();

var app          = express(); 

var hour         = 3600000; 
var check        = 1440;
var exp          = new Date(Date.now() + hour); 

if (app.get('env') === 'development') {
    require('dotenv').config();
}

app.use(helmet());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(
  sessions({  
    secret: process.env.APP_SECRET,  
    resave: true,
    saveUninitialized: true,
    cookie: { 
        maxAge: hour, 
        httpOnly: true, 
        secure: false 
    }
  })
); 

            //Tela 01 src files
            app.use('/tela-01', express.static(path.join(__dirname, '/tela-01'))); 
            app.use('/tela-01/css', express.static(path.join(__dirname, '/tela-01/css'))); 
            app.use('/tela-01/data', express.static(path.join(__dirname, '/tela-01/data'))); 
            app.use('/tela-01/games', express.static(path.join(__dirname, '/tela-01/games'))); 
            app.use('/tela-01/js', express.static(path.join(__dirname, '/tela-01/js'))); 
    
            //Tela 03 src files
            app.use('/tela-03', express.static(path.join(__dirname, '/tela-03'))); 
            app.use('/tela-03/css', express.static(path.join(__dirname, '/tela-03/css'))); 
            app.use('/tela-03/data', express.static(path.join(__dirname, '/tela-03/data'))); 
            app.use('/tela-03/games', express.static(path.join(__dirname, '/tela-03/games'))); 
            app.use('/tela-03/js', express.static(path.join(__dirname, '/tela-03/js'))); 
   
            //Tela 04 src files
            app.use('/tela-04', express.static(path.join(__dirname, '/tela-04'))); 
            app.use('/tela-04/css', express.static(path.join(__dirname, '/tela-04/css'))); 
            app.use('/tela-04/data', express.static(path.join(__dirname, '/tela-04/data')));  
            app.use('/tela-04/js', express.static(path.join(__dirname, '/tela-04/js')));
   


app.use('/', function(req, res){  
 
  switch(req.originalUrl){
      case '/tela01' :
         res.sendFile(path.resolve(path.join(__dirname, 'tela-01/index.html') )); 
      break;
      case '/tela03' :
         res.sendFile(path.resolve(path.join(__dirname, 'tela-03/index.html') )); 
      break;
      case '/tela04' :
         res.sendFile(path.resolve(path.join(__dirname, 'tela-04/index.html') )); 
      break;
      default :
        res.sendFile(path.resolve(path.join(__dirname, 'index.html') )); 
  }
});
// app.use('/tela01', tela1);


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;