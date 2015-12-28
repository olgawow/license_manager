"use strict";
var guid = require('guid');
var ObjectId = require('mongodb').ObjectID;
var licenses = require('./licenses');
var mongo = require('./mongo');

var addActivation = function (licenseId, activationId, callback) {
    licenses.getLicense(licenseId, function (err, license) {
        if (license.allowedActivations < license.issuedLicenses.length) {
            var error1 = new Error("You have exceeded amount of allowed activations.");
            error1.status = 403;
            callback (error1);
            return;
        }
        var actualActivation = license.issuedLicenses.filter(function (activation) {
            return activation.activationId === activationId;
        });
        if (actualActivation.length !== 0) {
            var error2 = new Error("Device with this ID has been activated.");
            error2.status = 403;
            callback (error2);
            return;
        }
        if (ObjectId.isValid(licenseId) === false) {
            var error4 = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
            error4.status = 500;
            callback (error4);
            return;
        }
        /* Before activating a device I need to know
         if the number of activations didn't change and
         this device wasn't activated at the same time from
         a different computer while I am trying to activate it. */
        mongo.Licenses.updateOne({
            _id: new ObjectId(licenseId),
            issuedLicenses: license.issuedLicenses
        }, { $addToSet: {
            issuedLicenses : {
                activationId: activationId
            }
        }}, {w: 1}, function (err, result) {
            if (err) {
                var error3 = new Error("Cannot activate device. Try again.");
                error3.status = 403;
                callback (error3);
                return;
            }
            if (result.matchedCount !== 1) {
                var error5 = new Error("Device wasn't activated. License does not exist.");
                error5.status = 404;
                callback (error5);
                return;
            } else if (result.modifiedCount !== 1) {
                var error6 = new Error("Device wasn't activated.");
                error6.status = 404;
                callback (error6);
                return;
            }
            if (err) { callback (err); return; }
            callback(null, result);
        });
    });
};
var getActivation = function (activationId, licenseId, callback) {
    if (ObjectId.isValid(licenseId) === false) {
        var error1 = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error1.status = 500;
        callback (error1);
        return;
    }
    mongo.Licenses.findOne({
        _id: new ObjectId(licenseId),
        'issuedLicenses.activationId': activationId
    }, function (err, record) {
        if (err) {
            callback (err);
            return;
        }
        if (record === null) {
            var error = new Error("No Activation Found. One Requested.");
            error.status = 404;
            callback (error);
            return;
        }
        callback(null, record);
    });
};
var getAllActivations = function (licenseId, softwareId, callback) {
    if (ObjectId.isValid(licenseId) === false) {
        var error1 = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error1.status = 500;
        callback (error1);
        return;
    }
    mongo.Licenses.findOne({
        _id: new ObjectId(licenseId),
        softwareId: softwareId
    }, { _id:0, issuedLicenses:1 }, function (err, record) {
        if (err) {
            callback (err);
            return;
        }
        if (record === null) {
            var error2 = new Error("No Activations Found. All Requested.");
            error2.status = 404;
            callback (error2);
            return;
        }
        callback(null, record.issuedLicenses);
    });
};
var createActivationFile = function (softwareName, license, activationId) {
    if (guid.isGuid(license.licenseUniqueID.value) === false) {
        var error = new Error('Wrong License GUID.');
        error.status = 403;
        return error;
    }
    var returnData = {
        software: softwareName,
        licenseUniqueID: license.licenseUniqueID.value,
        activationId: activationId,
        expirationDate: license.expirationDate
    };
    return JSON.stringify(returnData, null, '\t');
};

module.exports = {
    addActivation: addActivation,
    getActivation: getActivation,
    getAllActivations: getAllActivations,
    createActivationFile: createActivationFile
};