
var express = require('express');
var app = express();

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/test');
exports.db = db;

var err = require("./error_handler");

var api_port = 9000;

var bodyParser  = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))    // parse application/x-www-form-urlencoded
app.use(bodyParser.json())    // parse application/json


app.use(function(req, res, next) {
    
    // CORS headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
    
    return next();
});

var routes = require('./routes');
app.use('/', routes);


app.listen(api_port);


