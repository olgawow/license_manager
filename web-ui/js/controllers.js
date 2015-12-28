/* jshint undef: true, unused: true */
/* globals angular */
/* jshint strict: true */
/* jshint unused:true */
"use strict";
angular.module('appControllers', []).controller('SoftwareController', function ($scope, SoftwareFactory) {
    $scope.isShown = false;
    $scope.getSoftware = function () {
        $scope.softwares = SoftwareFactory.query(function (data) {
            if (data.length > 0) {$scope.isShown = true;}
        });
    };
    $scope.getSoftware();
    $scope.software = new SoftwareFactory();
    $scope.createSoftware = function () {
        $scope.isSaving = true;
        $scope.software.$save(function () {
            $scope.isSaving = false;
            $scope.inputForm.$setPristine();
            $scope.getSoftware();
        });
    };
}).controller('LicensesController', function ($scope, $routeParams, SoftwareFactory, LicensesFactory) {
    $scope.isShown = false;
    $scope.getLicenses = function () {
        $scope.licenses = LicensesFactory.query({softwareId: $routeParams.softwareId}, function (data) {
            if (data.length > 0) {$scope.isShown = true;}
        });
    };
    $scope.getLicenses();

    $scope.software = SoftwareFactory.get({id: $routeParams.softwareId});

    $scope.license = new LicensesFactory();
    $scope.createLicense = function () {
        $scope.isSaving = true;
        $scope.license.softwareId = $routeParams.softwareId;
        $scope.license.$save({softwareId: $routeParams.softwareId}, function () {
            $scope.inputForm.$setPristine();
            $scope.isSaving = false;
            $scope.getLicenses();
        });
    };

    //----- Date Picker ------//
    $scope.today = function() { $scope.dt = new Date(); };
    $scope.today();
    $scope.clear = function () { $scope.dt = null; };
    $scope.open = function($event) { $scope.status.opened = true; };
    $scope.setDate = function(year, month, day) { $scope.dt = new Date(year, month, day); };
    $scope.status = { opened: false };
    $scope.showButtonBar = false;

}).controller('DevicesController', function ($http, $scope, $routeParams, SoftwareFactory, DevicesFactory, LicensesFactory) {
    $scope.software = SoftwareFactory.get({id: $routeParams.softwareId});
    $scope.isShown = false;
    $scope.getLicense = function () {
        $scope.license = LicensesFactory.get({id: $routeParams.licenseId, softwareId: $routeParams.softwareId}, function () {
            $scope.devices = $scope.license.issuedLicenses;
            if ($scope.devices.length > 0) {$scope.isShown = true;}
        });
    };
    $scope.getLicense();

    $scope.device = new DevicesFactory();
    $scope.createDevice = function () {
        $scope.isSaving = true;
        if ($scope.license.allowedActivations - $scope.license.issuedLicenses.length > 0) {
            $scope.device.licenseId = $routeParams.licenseId;
            $scope.device.$save({softwareId: $routeParams.softwareId, licenseId: $routeParams.licenseId}, function () {
                $scope.isSaving = false;
                $scope.inputForm.$setPristine();
                $scope.getLicense();
            });
        } else { console.log('In $scope.createDevice, $scope.activeActivations <= 0'); }
    };
});