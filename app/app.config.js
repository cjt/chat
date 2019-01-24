'use strict';

angular.
  module('chatApp').
  config(['$routeProvider',
	  function config($routeProvider) {
	    $routeProvider.
	      when('/rooms', {
		template: '<room-list></room-list>'
	      }).
	      when('/rooms/:room', {
		template: '<room></room>'
	      }).
	      otherwise('/rooms');
	  }
	 ]);
