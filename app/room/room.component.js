'use strict';

angular.
  module('room').
  component('room', {
    templateUrl: 'room/room.template.html',
    controller: ['$http', '$scope', '$interval', 'roomState', 'CHAT_CONFIG', 'chatSocket', function RoomController($http, $scope, $interval, roomState, CHAT_CONFIG, chatSocket) {
      var vm = this;

      vm.send = (username, newmessage) => {
	const datetime = CHAT_CONFIG.nowString();
	const message = { "room":roomState.room.name, "datetime":datetime, "username":username, "message":newmessage };
	const messageStr = JSON.stringify(message);

	chatSocket.emit('newmessage', message, () => {
	  console.log(`Emitted newmessage: ${message}`);
	  vm.newmessage = '';
	});
	
	//$http.post(`${CHAT_CONFIG.url}/api/message`, message).
	//  then((response, message) => {
	//    $scope.newmessage = '';
	//    roomState.reloadMessages();
	//  });
      };
      
      const loadMessages = () => {
	const uri = `${CHAT_CONFIG.url}/api/room/RNLI`; //${roomState.room.name}`;
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
	  
	  vm.room = 'RNLI'; //roomState.room.name;
          vm.messages = sortMessages(messages);
	});
      };

      loadMessages();

      chatSocket.on('chatmessage', (message) => {
	console.log(`chatmessage: ${message}`);
	vm.messages.push(message);
      });

      $scope.$on('$destroy', (event) => {
	chatSocket.removeAllListeners();
      });
    }]
  });
