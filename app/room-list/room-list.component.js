'use strict';

angular
  .module('roomList')
  .component('roomList', {
    templateUrl: 'room-list/room-list.template.html',
    controller: ['$scope', '$interval', 'CHAT_CONFIG', 'chatSocket', function roomListController($scope, $interval, CHAT_CONFIG, chatSocket) {
      var vm = this;
      vm.rooms = [];
      
      chatSocket.on('roomstate', (rooms) => {
	console.debug(`Updating roomstate: ${rooms.length} rooms`);
	vm.rooms = rooms;
      });

      $scope.select = (room) => {
	console.debug(`Joining room ${room.room}`);
	chatSocket.emit('joinroom', room.room);
      };

      $scope.create = (newroom) => {
	const datetime = CHAT_CONFIG.nowString();
	const room = { "room":newroom, "user":"", "datetime":datetime, "message":"Welcome to your new room!" };
	chatSocket.emit('newroom', room, () => {
	  console.debug(`Emitted newroom: ${JSON.stringify(room)}`);
	  $scope.newroom = '';
	});
      };
    }]
  });
