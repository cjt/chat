'use strict';

angular
  .module('roomList')
  .component('roomList', {
    templateUrl: 'room-list/room-list.template.html',
    controller: ['$http', '$scope', '$interval', 'roomState', 'CHAT_CONFIG', function roomListController($http, $scope, $interval, roomState, CHAT_CONFIG) {
      $scope.select = function(room) {
	roomState.room = room;

	if (roomState.reloadMessages != null) {
	  roomState.reloadMessages();
	}
      };
      
      let self = this;

      let loadRoomList = function() {
	const uri = `${CHAT_CONFIG.url}/api/rooms`;
	$http.get(uri).then(function(response) {
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
	const datetime = CHAT_CONFIG.nowString();
	const room = JSON.stringify({ "room":newroom, "user":"", "datetime":datetime, "message":"Welcome to your new room!" });
	const uri = `${CHAT_CONFIG.url}/api/room/new`;
	$http.post(uri, room).then((response) => {
	  loadRoomList();
	  $scope.newroom = '';
	});
      };
    }]
  });

