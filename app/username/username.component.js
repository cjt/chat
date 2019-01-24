'use strict';

angular
  .module('username')
  .component('username', {
    templateUrl: 'username/username.template.html',
    controller: ['$scope', function usernameController($scope) {
      $scope.setUsername = function (username) {
	$scope.$parent.username = username;
	console.log("Selected username: " + username);
      };
    }]
  });
