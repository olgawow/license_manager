"use strict";
var assert = require('assert');
var guid = require('guid');
var fs = require('fs');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var Licenses, Software;
//var dbUrl = 'mongodb://localhost:27017/test_messages', dbPort = '27017'; //testing
var dbUrl = 'mongodb://user:123@ds042138.mongolab.com:42138/test_messages', dbPort = '42138'; //production

var runDB = function (callback) {
    MongoClient.connect(dbUrl, function (err, db) {
        assert.equal(null, err);
        Software = db.collection('software');
        Licenses = db.collection('licenses');
        callback (err, dbPort);
    });
};
//---------- SOFTWARE ------------//
var addSoftware = function (software, callback) {
    Software.insert({name: software.name}, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("addSoftware()." + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};
var getSoftware = function (softwareId, callback) {
    if (ObjectId.isValid(softwareId) === false) {
        var error = new Error("getSoftware(). \nMessage: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 500;
        callback (error);
        return;
    }
    Software.findOne({ _id: new ObjectId(softwareId) }, function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("getSoftware(). \nMessage: No Software Found. One Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};
var getAllSoftware = function  (callback) {
    Software.find({}).toArray(function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("getAllSoftware(). \nMessage: No Software Found. All Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};
var removeSoftware = function (id, callback) {
    if (ObjectId.isValid(id) === false) {
        var error1 = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error1.status = 500;
        callback (error1);
        return;
    }
    Software.deleteOne({_id: new ObjectId(id)}, function (err, res) {
        if (err) {
            var error2 = new Error("Error occurred. Didn't remove software. " + err.message);
            error2.status = err.status;
            callback (error2);
            return;
        }
        if (res.deletedCount !== 1) {
            var error3 = new Error("Didn't remove software. " + err.message);
            error3.status = err.status;
            callback (error3);
            return;
        }
        Licenses.deleteOne({softwareId: id}, {w:1}, function (err, result) {
            if (err) {
                var error4 = new Error("Error occurred. Didn't remove licenses. " + err.message);
                error4.status = err.status;
                callback (error4);
                return;
            }
            if (result.deletedCount !== 1) {
                var error5 = new Error("Didn't remove License. " + err.message);
                error5.status = err.status;
                callback (error5);
                return;
            }
            callback(null, result);
        });
    });
};
//------------- LICENSES -----------------//
var addLicense = function (license, callback) {
    Licenses.insert({
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
    Licenses.findOne({ _id: new ObjectId(licenseId) }, function (err, result) {
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
    Licenses.updateOne({
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
    Licenses.find({softwareId: softwareId}).toArray(function (err, result) {
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
var addActivation = function (licenseId, activationId, callback) {
    getLicense(licenseId, function (err, license) {
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
        Licenses.updateOne({
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
    Licenses.findOne({
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
    Licenses.findOne({
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
    runDB: runDB,
    addLicense: addLicense,
    getLicense: getLicense,
    updateLicense: updateLicense,
    getAllLicenses: getAllLicenses,
    addSoftware: addSoftware,
    getSoftware: getSoftware,
    getAllSoftware: getAllSoftware,
    removeSoftware: removeSoftware,
    addActivation: addActivation,
    getActivation: getActivation,
    getAllActivations: getAllActivations,
    createActivationFile: createActivationFile
};