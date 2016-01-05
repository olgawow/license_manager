"use strict";
var MongoClient = require('mongodb').MongoClient;
var connection = require('./connection.json').production;
var assert = require('assert');
function getdbUrl(){
    var url = '';
    if (connection.user.length == 0 || connection.user == ' ') {
        url =  'mongodb://' + connection.url + ':' + connection.port + '/' + connection.db;
    } else {
        url = 'mongodb://' + connection.user + ':' + connection.password + '@' + connection.url + ':' + connection.port + '/' + connection.db;
    }
    return url;
}
function getdbPort(){
    return connection.port;
}
var runDB = function (callback) {
    MongoClient.connect(getdbUrl(), function (err, db) {
        assert.equal(null, err);
        module.exports.Software = db.collection('software');
        module.exports.Licenses = db.collection('licenses');
        callback (err, getdbPort());
    });
};

module.exports = {
    runDB: runDB
};