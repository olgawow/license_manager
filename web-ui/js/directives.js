/* jshint undef: true, unused: true */
/* globals angular */
/* jshint strict: true */
/* globals window */
/* jshint unused:true */
"use strict";
angular.module('appDirectives', []).directive('goToUrl', ['$location', function ($location) {
    return{
        restrict: 'A',
        link: function (scope, element, attr) {
            element.attr('style', 'cursor:pointer');
            element.on('click', function(){
                $location.url(attr.goToUrl);
                scope.$apply();
            });
        }
    };
}]).directive('negativeIntegerValidator', function () {
    return {
        link: function (scope, elm, attrs) {
            elm.bind('keypress', function(e){
                var char = String.fromCharCode(e.which||e.charCode||e.keyCode), matches = [];
                var inputDataLength = document.getElementById('allowedActivations').value.length;
                if(char > 0) { matches.push(char); }
                else if (char == 0 && inputDataLength > 0) { matches.push(char); }
                if(matches.length === 0){
                    e.preventDefault();
                    return false;
                }
            });
        }
    };
});