"use strict";
var superAgent = require('superagent');
var assert = require('assert');
var port = 8000;
var url = 'http://localhost:' + port;
function parseResponse (err, res) {
    if (err) { console.log('Error: ' + err.response.error.text + '\nError Code: ' + err.status); }
    assert.ifError(err);
    assert.equal(res.status, 200);
    return JSON.parse(res.text);
}

describe('Test All UI endpoints', function() {
    var testSoftware = { name: 'Software Test' };
    var testLicense;
    var testLicenseUpdated;
    var testDevice;
    describe('1. Create and Verify Software and License Records', function () {
        it('Creates Software', function (done) {
            superAgent
            .post(url + '/api/software', testSoftware)
            .end(function (err, res) {
                var addedSoftware = parseResponse(err, res);
                testSoftware._id = addedSoftware.ops[0]._id;
                done();
            });
        });
        it('Gets Software by ID that Does Not Exist', function (done) {
            testSoftware._idNoExistent = '565ef8ae6c00a3c562028043';
            superAgent
            .get(url + '/api/software/' + testSoftware._idNoExistent)
            .end(function (err, res) {
                assert.equal(err.status, 404);
                done();
            });
        });
        it('Gets Software by ID that is wrong format', function (done) {
            testSoftware._idNoExistent = 'dsfsdfsdf';
            superAgent
                .get(url + '/api/software/' + testSoftware._idNoExistent)
                .end(function (err, res) {
                    assert.equal(err.status, 500);
                    done();
                });
        });
        it('Gets Software by ID and Verify', function (done) {
            superAgent
            .get(url + '/api/software/' + testSoftware._id)
            .end(function (err, res) {
                var actualSoftware = parseResponse(err, res);
                assert.equal(actualSoftware.name, testSoftware.name);
                assert.equal(actualSoftware._id, testSoftware._id);
                done();
            });
        });
        it('Gets All Software and Verify', function (done) {
            superAgent
                .get(url + '/api/software')
                .end(function(err, res) {
                    var softwareArray = parseResponse(err, res);
                    var actualSoftwareArray = softwareArray.filter(function (value) { return value._id === testSoftware._id; });
                    assert.equal(1, actualSoftwareArray.length);
                    var actualSoftware = actualSoftwareArray[0];
                    assert.equal(actualSoftware.name, testSoftware.name);
                    assert.equal(actualSoftware._id, testSoftware._id);
                    done();
                });
        });
        it('Creates License', function (done) {
            testLicense = {
                expirationDate: '2019/10/09',
                allowedActivations: 5,
                userOrganizationName: 'Some Random Co',
                softwareId: testSoftware._id
            };
            superAgent
            .post(url + '/api/software/' + testSoftware._id + '/licenses', testLicense)
            .end(function (err, res) {
                var addedLicense = parseResponse(err, res);
                testLicense._id = addedLicense.ops[0]._id;
                done();
            });
        });
        it('Gets License by ID and Verifies', function (done) {
            superAgent
            .get(url + '/api/software/' + testSoftware._id + '/licenses/' + testLicense._id)
            .end(function (err, res) {
                var actualLicense = parseResponse(err, res);
                assert.equal(actualLicense.expirationDate, testLicense.expirationDate);
                assert.equal(actualLicense.allowedActivations, testLicense.allowedActivations);
                assert.equal(actualLicense.userOrganizationName, testLicense.userOrganizationName);
                assert.equal(actualLicense.softwareId, testLicense.softwareId);
                assert.equal(actualLicense._id, testLicense._id);
                done();
            });
        });
        it('Gets All Licenses by Software ID and Verifies', function (done) {
            superAgent
            .get(url + '/api/software/' + testSoftware._id + '/licenses')
            .end(function(err, res) {
                var licensesArray = parseResponse(err, res);
                var actualLicenses = licensesArray.filter(function(license) { return license._id === testLicense._id; });
                assert.equal(1, actualLicenses.length);
                var actualLicense = actualLicenses[0];
                assert.equal(actualLicense.expirationDate, testLicense.expirationDate);
                assert.equal(actualLicense.allowedActivations, testLicense.allowedActivations);
                assert.equal(actualLicense.userOrganizationName, testLicense.userOrganizationName);
                assert.equal(actualLicense.softwareId, testLicense.softwareId);
                assert.equal(actualLicense._id, testLicense._id);
                done();
            });
        });
    });
    describe.skip('2. Activate License', function () {
        it('Tests Activation by POSTing License ID and Device ID to Public API', function (done) {
            testDevice = { activationId: 'sdlkfj' };
            superAgent
            .post(url + '/api/software/licenses/activations/activate', {licenseId: testLicense._id, activationId: testDevice.activationId})
            .end(function (err, res) {
                assert.ifError(err);
                assert.equal(res.status, 200);
                done();
            });
        });
        it('Gets Activation by Device Id and Verifies', function (done) {
            superAgent
            .get(url + '/api/software/' + testSoftware._id + '/licenses/' + testLicense._id + '/activations/' + testDevice.activationId)
            .end(function (err, res) {
                var actualDevice = parseResponse(err, res);
                assert.equal(actualDevice.userOrganizationName, testLicense.userOrganizationName);
                assert.equal(actualDevice.expirationDate, testLicense.expirationDate);
                assert.equal(actualDevice.allowedActivations, testLicense.allowedActivations);
                assert.equal(actualDevice.softwareId, testLicense.softwareId);
                assert.equal(actualDevice._id, testLicense._id);
                assert.equal(actualDevice.issuedLicenses[0].activationId, testDevice.activationId);
                done();
            });
        });
        it('Gets All Activations and Verifies', function (done) {
            superAgent
            .get(url + '/api/software/'+ testSoftware._id + '/licenses/' + testLicense._id + '/activations')
            .end(function(err, res) {
                var actualLicense = parseResponse(err, res);
                var actualDevice = actualLicense.issuedLicenses.filter(function(actualDevice) {return actualDevice.activationId === testDevice.activationId;});
                assert.equal(1, actualDevice.length);
                assert.equal(testDevice.activationId, actualDevice[0].activationId);
                done();
            });
        });
        it('Tests Activation by GETing Device ID to UI Web-Service', function (done) {
            superAgent
            .get(url + '/api/software/' + testSoftware._id + '/licenses/' + testLicense._id +
                '/activations/' + testDevice.activationId + '/license_file')
            .end(function (err, res) {
                assert.ifError(err);
                assert.equal(res.status, 200);
                var actualActivation = JSON.parse(new Buffer(res.text, 'base64').toString('ascii'));
                assert.equal(actualActivation.software, testSoftware.name);
                assert.equal(actualActivation.expirationDate, testLicense.expirationDate);
                done();
            });
        });
    });
    describe('3. Update Licence', function () {
        it('Updates License', function (done) {
            testLicenseUpdated = {
                allowedActivations: 2,
                expirationDate: '2029/10/09',
                userOrganizationName: 'Updated Some Random Co',
                softwareId: testSoftware._id
            };
            superAgent
            .put(url + '/api/software/' + testSoftware._id + '/licenses/' + testLicense._id, testLicenseUpdated)
            .end(function (err, res) {
                var responseText = parseResponse(err, res);
                assert.equal(responseText.nModified, 1);
                done();
            });
        });
        it('Gets License and Verifies', function (done) {
            superAgent
            .get(url + '/api/software/' + testSoftware._id + '/licenses/' + testLicense._id)
            .end(function (err, res) {
                var responseText = parseResponse(err, res);
                assert.equal(responseText.userOrganizationName, testLicenseUpdated.userOrganizationName);
                assert.equal(responseText.expirationDate, testLicenseUpdated.expirationDate);
                assert.equal(responseText.allowedActivations, testLicenseUpdated.allowedActivations);
                assert.equal(responseText.softwareId, testLicenseUpdated.softwareId);
                assert.equal(responseText._id, testLicense._id);
                done();
            });
        });
    });
    describe('4. Delete All', function () {
        it('DELETEs Software and all Licenses by Software ID', function (done) {
            superAgent
            .del(url + '/api/software/' + testSoftware._id)
            .end(function (err, res) {
                var responseText = parseResponse(err, res);
                done();
            });
        });
    });
});
/*1. Create software, the create license.
 2. Activate using web-service. Check that the returned file has all the fields.
 3, Get the activation using UI web-service and check all the fields.*/
describe('Test Public API', function() {
    var testSoftware = { name: 'Software Test' };
    var testLicense;
    var testDevice;
    describe('1. Create Software and License', function () {
        it('Creates Software', function (done) {
            superAgent
                .post(url + '/api/software', testSoftware)
                .end(function (err, res) {
                    var responseText = parseResponse(err, res);
                    testSoftware._id = responseText.ops[0]._id;
                    done();
                });
        });
        it('Creates license', function (done) {
            testLicense = {
                expirationDate: '2019/10/09',
                allowedActivations: 5,
                userOrganizationName: 'Some Random Co',
                softwareId: testSoftware._id
            };
            superAgent
                .post(url + '/api/software/' + testSoftware._id + '/licenses', testLicense)
                .end(function (err, res) {
                    var responseText = parseResponse(err, res);
                    testLicense._id = responseText.ops[0]._id;
                    done();
                });
        });
    });
    describe('2. Activate using UI web-service and verify', function () {
        it('Activates License using UI web-service', function (done) {
            testDevice = { activationId: 'sdfsdfsdfd' };
            superAgent
                .post(url + '/api/software/' + testSoftware._id + '/licenses/' + testLicense._id +
                    '/activations/', testDevice)
                .end(function (err, res) {
                    var responseText = parseResponse(err, res);
                    assert.equal(res.request._data.activationId, testDevice.activationId);
                    done();
                });
        });
        it('Verifies Activation using UI web-service', function (done) {
            superAgent
                .get(url + '/api/software/' + testSoftware._id + '/licenses/' + testLicense._id +
                    '/activations/' + testDevice.activationId + '/license_file')
                .end(function (err, res) {
                    assert.ifError(err);
                    assert.equal(res.status, 200);
                    var actualActivation = JSON.parse(new Buffer(res.text, 'base64').toString('ascii'));
                    assert.equal(actualActivation.software, testSoftware.name);
                    assert.equal(actualActivation.expirationDate, testLicense.expirationDate);
                    assert.equal(actualActivation.activationId, testDevice.activationId);
                    done();
                });
        });
    });
    describe('3. Activate using web-service and Verify', function () {
        it('Activates License by POSTing existing License ID and a new Device ID', function (done) {
            var testDevice1 = { activationId: 'sdlkfj' };
            superAgent
                .post(url + '/api/software/licenses/activations/activate', { licenseId: testLicense._id, activationId: testDevice1.activationId })
                .end(function (err, res) {
                    assert.ifError(err);
                    assert.equal(res.status, 200);
                    var actualActivation = JSON.parse(new Buffer(res.text, 'base64').toString('ascii'));
                    assert.equal(actualActivation.software, testSoftware.name);
                    assert.equal(actualActivation.expirationDate, testLicense.expirationDate);
                    assert.equal(actualActivation.activationId, testDevice1.activationId);
                    done();
                });
        });
    });
    describe('4. Delete all', function () {
        it('DELETE Software and all Licenses by Software ID', function (done) {
            superAgent
                .del(url + '/api/software/' + testSoftware._id)
                .end(function (err, res) {
                    var responseText = parseResponse(err, res);
                    done();
                });
        });
    });
});