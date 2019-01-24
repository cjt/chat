'use strict';

angular.
  module('room').
  component('room', {
    templateUrl: 'room/room.template.html',
    controller: ['$http', '$routeParams',
		 function RoomController($http, $routeParams) {
		   var self = this;
		   // get room details from couch...
		   this.room = $routeParams.room;
		 }]
  });
