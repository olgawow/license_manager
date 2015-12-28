"use strict";
var guid = require('guid');
var ObjectId = require('mongodb').ObjectID;
var mongo = require('./mongo');

//------------- LICENSES -----------------//
var addLicense = function (license, callback) {
    mongo.Licenses.insert({
        userOrganizationName: license.userOrganizationName,
        expirationDate: license.expirationDate,
        allowedActivations: license.allowedActivations,
        configurationsNameID: license.configurationsNameID,
        softwareId: license.softwareId,
        licenseUniqueID: guid.create(),
        issuedLicenses: []
    }, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("Added License. " + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};
var getLicense = function (licenseId, callback) {
    if (ObjectId.isValid(licenseId) === false) {
        var error = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 500;
        callback (error);
        return;
    }
    mongo.Licenses.findOne({ _id: new ObjectId(licenseId) }, function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("No License Found. One Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};
var updateLicense = function (licenseId, softwareId, license, callback) {
    if (ObjectId.isValid(licenseId) === false) {
        var error = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 500;
        callback (error);
        return;
    }
    mongo.Licenses.updateOne({
            _id: new ObjectId(licenseId),
            softwareId: softwareId
        },
        {$set: {
            expirationDate: license.expirationDate,
            allowedActivations: license.allowedActivations,
            userOrganizationName: license.userOrganizationName,
            softwareId: license.softwareId
        }}, {w: 1}, function(err, result) {
            if (err) {
                var error3 = new Error("Cannot update license. Try again.");
                error3.status = 403;
                callback (error3);
                return;
            }
            if (result.matchedCount !== 1) {
                var error1 = new Error("No license was found.");
                error1.status = 404;
                callback (error1);
                return;
            } else if (result.modifiedCount !== 1) {
                var error2 = new Error("No license was updated.");
                error2.status = 404;
                callback (error2);
                return;
            }
            if (err) { callback (err); return; }
            callback(null, result);
        });
};
var getAllLicenses = function (softwareId, callback) {
    mongo.Licenses.find({softwareId: softwareId}).toArray(function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("Message: No Licenses Found. All Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};

module.exports = {
    addLicense: addLicense,
    getLicense: getLicense,
    updateLicense: updateLicense,
    getAllLicenses: getAllLicenses
};