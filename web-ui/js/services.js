/* jshint undef: true, unused: true */
/* globals angular */
/* jshint strict: true */
/* jshint unused:true */
"use strict";
angular.module('appServices', []).factory('SoftwareFactory', function ($resource) {
    return $resource('/api/software/:id', {id: '@_id'}, {update: {method: 'PUT'}});
}).factory('LicensesFactory', function ($resource) {
    return $resource('/api/software/:softwareId/licenses/:id', {id: '@_id', softwareId: '@softwareId'}, {
        query: {method:'GET', isArray:true},
        update: {method: 'PUT'}
    });
}).factory('DevicesFactory', function ($resource) {
    return $resource('/api/software/:softwareId/licenses/:licenseId/activations/:id', {id: '@_id', softwareId: '@softwareId', licenseId: '@licenseId'}, {
        query: {method:'GET', isArray:true},
        update: {method: 'PUT'}
    });
}).factory('LicenseFileFactory', function ($resource) {
    return $resource('/api/software/:softwareId/licenses/:licenseId/activations/:activationId/license_file', {
        softwareId: '@softwareId',
        licenseId: '@licenseId',
        activationId: '@activationId'
    }, {});
});