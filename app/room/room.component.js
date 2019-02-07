'use strict';

angular.
  module('room').
  component('room', {
    templateUrl: 'room/room.template.html',
    controller: ['$http', 'CHAT_CONFIG', 'chatSocket', function RoomController($http, CHAT_CONFIG, chatSocket) {
      var vm = this;

      vm.messages = [];
      
      vm.send = sendNewMessage;

      chatSocket.on('chathistory', loadChatHistory);
      
      chatSocket.on('chatmessage', loadChatMessage);

      function loadChatHistory(room) {
	const uri = `${CHAT_CONFIG.url}/api/room/${room}`;
	$http.get(uri).then(function(response) {
	  vm.messages = [];

	  let rows = response.data.rows;
	  const compareOnDatetime = (a, b) => (a.datetime < b.datetime) ? -1 : (a.datetime > b.datetime) ? 1 : 0;

	  rows.forEach((row) => {
	    vm.messages.push({ "room":row.doc.room, "datetime":row.doc.datetime, "username":row.doc.user, "message":row.doc.message });
	  });
	  
	  vm.room = room;
	  vm.messages.sort(compareOnDatetime);
	});
      }

      function loadChatMessage(message) {
	if (message.room === vm.room) {
	  console.debug(`chatmessage: ${JSON.stringify(message)}`);
	  vm.messages.push(message);
	}
	else {
	  console.error(`Got message for ${message.room} in error: ${JSON.stringify(message)}`);
	}
      }

      function sendNewMessage(username, newmessage) {
	const datetime = CHAT_CONFIG.nowString();
	const message = { "room":vm.room, "datetime":datetime, "username":username, "message":newmessage };
	const messageStr = JSON.stringify(message);

	chatSocket.emit('newmessage', message, () => {
	  console.debug(`Emitted newmessage: ${JSON.stringify(message)}`);
	  vm.newmessage = '';
	});
      }
    }]
  });
