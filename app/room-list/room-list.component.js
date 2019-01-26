'use strict';

angular
  .module('roomList')
  .component('roomList', {
    templateUrl: 'room-list/room-list.template.html',
    controller: ['$http', '$scope', '$interval', function roomListController($http, $scope, $interval) {
      $scope.select = function(room) {
	$scope.$parent.room = room;
	$scope.$parent.loadMessages();
	console.log("Selected room: " + $scope.$parent.room.name);
      };
      
      var self = this;

      var loadRoomList = function() {      
	$http.get('http://localhost:5984/chat/_design/rooms/_view/rooms?group=true').then(function(response) {
          var rows = response.data.rows;
          var rooms = [];

          rows.forEach(function(row) {
            rooms.push({ "name":row.key, "messages":row.value })
          });

	  if ($scope.$parent.room == null) {
	    $scope.select(rooms[0]);
	  }

          self.rooms = rooms;
	});
      }

      loadRoomList();

      $scope.create = (newroom) => {
	var datetime = (new Date()).toISOString().slice(0, 23).replace("T", " ");
	$http.post('http://127.0.0.1:5984/chat/', JSON.stringify({ "room":newroom, "user":"", "datetime":datetime, "message":"Welcome to your new room!" })).
	  then(function(response) {
	    loadRoomList();
	  });
      };
      
      $interval(function() {
	loadRoomList();
      }, 500);
    }]
  });

