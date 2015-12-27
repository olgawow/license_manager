"use strict";
var express = require('express');
var app = new express();
var path = require('path');
var bodyParser = require('body-parser');
var router = require('./routes');
var mongo = require('./mongo');

app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.use('/api', router);
app.use(express.static(path.join(__dirname, 'app')));
app.use('/app', express.static(__dirname + '/app'));

// ERROR Handler 400
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// ERROR Handler 505
if (app.get('env') === 'development') {
    app.use(function (req, res, next) {
        var err = new Error('Not Found' + ' - Development Mode');
        err.status = 505;
        next(err);
    });
}

app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.send(err.status + ': Internal Server Error\n\r' + err.message);
});

// Initialize SERVER & DB connection once
mongo.runDB(function (err, dbPort) {
    if (err) { throw err; }
    app.set('port', process.env.PORT || 8000);
    var server = app.listen(app.get('port'), function () {
        console.log('MongoDB is running on port ' + dbPort);
        console.log('Express server listening on port ' + server.address().port);
    });
});