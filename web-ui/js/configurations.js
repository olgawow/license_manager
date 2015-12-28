/* jshint undef: true, unused: true */
/* globals angular */
/* jshint strict: true */
/* jshint unused:true */
"use strict";
angular.module('appConfigurations', []).config(function ($routeProvider) {
    $routeProvider.when('/software', {
        templateUrl: 'partials/software.html',
        controller: 'SoftwareController'
    }).when('/software/:softwareId/licenses', {
        templateUrl: 'partials/licenses.html',
        controller: 'LicensesController'
    }).when('/software/:softwareId/licenses/:licenseId/devices', {
        templateUrl: 'partials/devices.html',
        controller: 'DevicesController'
    }).when('/404', {
        templateUrl: 'partials/error.html'
    }).when('/', {
        redirectTo: '/software'
    }).otherwise({redirectTo: '/404'});
});