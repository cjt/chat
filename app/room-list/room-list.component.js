'use strict';

angular
  .module('roomList')
  .component('roomList', {
    templateUrl: 'room-list/room-list.template.html',
    controller: ['$http', '$scope', '$interval', 'roomState', function roomListController($http, $scope, $interval, roomState) {
      $scope.select = function(room) {
	roomState.room = room;
	$scope.$parent.loadMessages();
      };
      
      let self = this;

      let loadRoomList = function() {      
	$http.get('http://localhost:5984/chat/_design/rooms/_view/rooms?group=true').then(function(response) {
          let rows = response.data.rows;
          let rooms = [];

          rows.forEach((row) => {
            rooms.push({ "name":row.key, "messages":row.value })
          });

	  if (roomState.room == null) {
	    $scope.select(rooms[0]);
	  }

          self.rooms = rooms;
	});
      }

      loadRoomList();

      $scope.create = (newroom) => {
	const datetime = (new Date()).toISOString().slice(0, 23).replace("T", " ");
	$http.post('http://127.0.0.1:5984/chat/', JSON.stringify({ "room":newroom, "user":"", "datetime":datetime, "message":"Welcome to your new room!" })).
	  then((response) => {
	    loadRoomList();
	  });
      };
      
      $interval(function() {
	loadRoomList();
      }, 500);
    }]
  });

