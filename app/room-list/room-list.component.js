'use strict';

angular
  .module('roomList')
  .component('roomList', {
    templateUrl: 'room-list/room-list.template.html',
    controller: ['CHAT_CONFIG', 'chatSocket', function roomListController(CHAT_CONFIG, chatSocket) {
      var vm = this;

      vm.rooms = [];

      vm.select = selectRoom;
      
      vm.create = createRoom;

      chatSocket.on('roomstate', updateRoomState);

      function selectRoom(room) {
	console.debug(`Joining room ${room.room}`);
	chatSocket.emit('joinroom', room.room);
      }
      
      function createRoom(newroom) {
	const datetime = CHAT_CONFIG.nowString();
	const room = { "room":newroom, "user":"", "datetime":datetime, "message":"Welcome to your new room!" };
	chatSocket.emit('newroom', room, () => {
	  console.debug(`Emitted newroom: ${JSON.stringify(room)}`);
	  vm.newroom = '';
	});
      };

      function updateRoomState(rooms) {
	console.debug(`Updating roomstate: ${rooms.length} rooms`);
	vm.rooms = rooms;
      }
    }]
  });
