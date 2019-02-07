'use strict';

angular.
  module('room').
  component('room', {
    templateUrl: 'room/room.template.html',
    controller: ['$http', '$scope', '$interval', 'CHAT_CONFIG', 'chatSocket', function RoomController($http, $scope, $interval, CHAT_CONFIG, chatSocket) {
      var vm = this;

      chatSocket.on('chathistory', (room) => {
	const uri = `${CHAT_CONFIG.url}/api/room/${room}`;
	$http.get(uri).then(function(response) {
	  let rows = response.data.rows;
          let messages = [];
	  
	  let sortMessages = function(messages) {
	    let compareOnDatetime = (a, b) => (a.datetime < b.datetime) ? -1 : (a.datetime > b.datetime) ? 1 : 0;
	    return messages.sort(compareOnDatetime);
	  };

	  rows.forEach((row) => {
	    messages.push({ "room":row.doc.room, "datetime":row.doc.datetime, "username":row.doc.user, "message":row.doc.message });
	  });
	  
	  vm.room = room;
          vm.messages = sortMessages(messages);
	});
      });

      vm.send = (username, newmessage) => {
	const datetime = CHAT_CONFIG.nowString();
	const message = { "room":vm.room, "datetime":datetime, "username":username, "message":newmessage };
	const messageStr = JSON.stringify(message);

	chatSocket.emit('newmessage', message, () => {
	  console.debug(`Emitted newmessage: ${JSON.stringify(message)}`);
	  vm.newmessage = '';
	});
      };
      
      chatSocket.on('chatmessage', (message) => {
	if (message.room === vm.room) {
	  console.debug(`chatmessage: ${JSON.stringify(message)}`);
	  vm.messages.push(message);
	}
	else {
	  console.error(`Got message for ${message.room} in error: ${JSON.stringify(message)}`);
	}
      });

      $scope.$on('$destroy', (event) => {
	chatSocket.removeAllListeners();
      });
    }]
  });
