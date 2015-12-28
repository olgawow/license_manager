"use strict";
var MongoClient = require('mongodb').MongoClient;
//var dbUrl = 'mongodb://localhost:27017/test_messages', dbPort = '27017'; //testing
var dbUrl = 'mongodb://user:123@ds042138.mongolab.com:42138/test_messages', dbPort = '42138'; //production
var assert = require('assert');
var runDB = function (callback) {
    MongoClient.connect(dbUrl, function (err, db) {
        assert.equal(null, err);
        module.exports.Software = db.collection('software');
        module.exports.Licenses = db.collection('licenses');
        callback (err, dbPort);
    });
};

module.exports = {
    runDB: runDB
};