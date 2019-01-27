'use strict';

angular.
  module('room').
  component('room', {
    templateUrl: 'room/room.template.html',
    controller: ['$http', '$scope', '$interval', 'roomState', 'CHAT_CONFIG', function RoomController($http, $scope, $interval, roomState, CHAT_CONFIG) {
      var self = this;

      $scope.send = (username, newmessage) => {
	const datetime = CHAT_CONFIG.nowString();
	const message = JSON.stringify({ "room":roomState.room.name, "user":username, "datetime":datetime, "message":newmessage });
	$http.post(`${CHAT_CONFIG.url}/${CHAT_CONFIG.db}`, message).
	  then((response, message) => {
	    self.newmessage = '';
	    roomState.reloadMessages();
	  });
      };
      
      roomState.reloadMessages = () => {
	const uri = `${CHAT_CONFIG.url}/${CHAT_CONFIG.db}/_design/messages/_view/messages?key=\"${roomState.room.name}\"&include_docs=true`;
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
	  
	  self.room = roomState.room.name;
          self.messages = sortMessages(messages);
	});
      }

      $interval(() => {
	if (roomState.room != null && roomState.reloadMessages != null) {
	  roomState.reloadMessages();
	}
      }, 250);
    }]
  });
