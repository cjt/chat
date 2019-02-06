'use strict';

angular
  .module('roomList')
  .component('roomList', {
    templateUrl: 'room-list/room-list.template.html',
    controller: ['$http', '$scope', '$interval', 'roomState', 'CHAT_CONFIG', 'chatSocket', function roomListController($http, $scope, $interval, roomState, CHAT_CONFIG, chatSocket) {
      let self = this;
      self.rooms = [];
      
      chatSocket.on('roomstate', (rooms) => {
	console.log(`Updating roomstate: ${rooms.length} rooms`);
	self.rooms = rooms;
      });

      $scope.select = function(room) {
	roomState.room = room;

	console.log(`Joining room ${room.room}`);
	chatSocket.emit('joinroom', room.room);

	if (roomState.reloadMessages != null) {
	  roomState.reloadMessages();
	}
      };
      
      $scope.create = (newroom) => {
	const datetime = CHAT_CONFIG.nowString();
	const room = { "room":newroom, "user":"", "datetime":datetime, "message":"Welcome to your new room!" };
	chatSocket.emit('newroom', room, () => {
	  console.log(`Emitted newroom: ${JSON.stringify(room)}`);
	  $scope.newroom = '';
	});
      };
    }]
  });

