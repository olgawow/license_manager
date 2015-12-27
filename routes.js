"use strict";
var express = require('express');
var router = express.Router();
var mongodb = require('./mongo');
var path = require('path');

//---------- SOFTWARE ------------//
router.route('/software')
    .get(function (req, res) {
        mongodb.getAllSoftware(function (err, records) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(records); }
        });
    })
    .post(function (req, res) {
        mongodb.addSoftware(req.body, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    });
router.route('/software/:softwareId')
    .get(function (req, res) {
        mongodb.getSoftware(req.params.softwareId, function (err, record) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(record); }
        });
    })
    .put()
    .delete(function (req, res) {
        mongodb.removeSoftware(req.params.softwareId, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    });
//------------- LICENSES -----------------//
router.route('/software/:softwareId/licenses')
    .get(function (req, res) {
        mongodb.getAllLicenses(req.params.softwareId, function (err, records) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(records); }
        });
    })
    .post(function (req, res) {
        mongodb.addLicense(req.body, function (err, result) {
            res.json(result);
        });
    });
router.route('/software/:softwareId/licenses/:licenseId')
    .get(function (req, res) {
        mongodb.getLicense(req.params.licenseId, function (err, record) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(record); }
        });
    })
    .put(function (req, res) {
        var license = {};
        license.expirationDate = req.body.expirationDate;
        license.allowedActivations = req.body.allowedActivations;
        license.userOrganizationName = req.body.userOrganizationName;
        license.softwareId = req.body.softwareId;
        mongodb.updateLicense (req.params.licenseId, req.params.softwareId, license, function(err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })
    .delete();

//------------- ACTIVATIONS ------------------//
router.route('/software/:softwareId/licenses/:licenseId/activations')
    .get(function (req, res) {
        mongodb.getAllActivations(req.params.licenseId, req.params.softwareId, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })
    .post(function (req, res) {
        mongodb.addActivation(req.params.licenseId, req.body.activationId, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    });
router.route('/software/:softwareId/licenses/:licenseId/activations/:activationId')
    .get(function (req, res) {
        mongodb.getActivation(req.params.activationId, req.params.licenseId, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })
    .put()
    .delete();

//---------- API to activate license for UI Web-Service ----------//
router.route('/software/:softwareId/licenses/:licenseId/activations/:activationId/license_file')
    .get(function (req, res) {
        mongodb.getActivation(req.params.activationId, req.params.licenseId, function (err, license) {
            mongodb.getSoftware(req.params.softwareId, function (err, software) {
                if (err) { res.status(err.status).send(err.message); }
                else {
                    var fileStream = mongodb.createActivationFile(software.name, license, req.params.activationId);
                    console.log('fileStream: ' + fileStream);
                    if (fileStream instanceof Error) {
                        res.status(fileStream.status).send(fileStream.message);
                    }
                    else {
                        var fileName = 'license_' + license.licenseUniqueID.value.slice(0,8) + '_' + req.params.activationId.slice(0,5) + '.json';
                        res.setHeader('Content-disposition', 'attachment; filename:' + fileName);
                        res.setHeader('Content-type', 'application/json');
                        res.end(fileStream);
                    }
                }
            });
        });
    });
//---------- Public API to activate license ----------//
router.route('/software/licenses/activations/activate') //assuming POST: licenseId=123&activationId=1234
    .post(function (req, res) {
        mongodb.getLicense(req.body.licenseId, function (err, record) {
            mongodb.getSoftware(record.softwareId, function (err, software) {
                if (err) { res.status(err.status).send(err.message); }
                else {
                    mongodb.addActivation(req.body.licenseId, req.body.activationId, function (err, result) {
                        if (err) { res.status(err.status).send(err.message); }
                        else {
                            var filePath = mongodb.createActivationFile(software.name, record, req.body.activationId);
                            if (filePath instanceof Error) {
                                res.status(filePath.status).send(filePath.message);
                            }
                            else {
                                var options = { flags: 'r',
                                    encoding: 'base64',
                                    fd: null,
                                    mode: '0o666',
                                    autoClose: true
                                };
                                var stream = fs.createReadStream(filePath, options);
                                var buffer = new Buffer(JSON.stringify(stream)).toString('base64');
                                res.writeHead(
                                    200,
                                    "OK",
                                    {
                                        "Content-Type": "json/text",
                                        "Content-Disposition": "inline; filename=license.json",
                                        "Contente-Length": buffer.length
                                    }
                                );
                                buffer.pipe(res);
                            }
                        }
                    });
                }
            });
        });
    });

module.exports = router;