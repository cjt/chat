'use strict';

angular.
  module('room').
  component('room', {
    templateUrl: 'room/room.template.html',
    controller: ['$http', '$scope', '$interval', function RoomController($http, $scope, $interval) {
      var self = this;

      $scope.send = (username, newmessage) => {
	const datetime = (new Date()).toISOString().slice(0, 23).replace("T", " "); // TODO break out common code, date format is important
	$http.post('http://127.0.0.1:5984/chat/', JSON.stringify({ "room":$scope.$parent.room.name, "user":username, "datetime":datetime, "message":newmessage })).
	  then((response) => {
	    newmessage = '';
	    $scope.$parent.loadMessages();
	  });
      };
      
      $scope.$parent.loadMessages = () => {
	$http.get('http://127.0.0.1:5984/chat/_design/messages/_view/messages?key=\"' + $scope.$parent.room.name + '\"&include_docs=true').then(function(response) {
          let rows = response.data.rows;
          let messages = [];
	  
	  let sortMessages = function(messages) {
	    let compareOnDatetime = (a, b) => (a.datetime < b.datetime) ? -1 : (a.datetime > b.datetime) ? 1 : 0;
	    return messages.sort(compareOnDatetime);
	  };

	  rows.forEach((row) => {
	    messages.push({ "room":row.doc.room, "datetime":row.doc.datetime, "username":row.doc.user, "message":row.doc.message });
	  });
	  
	  self.room = $scope.$parent.room.name;
          self.messages = sortMessages(messages);
	});
      }

      $interval(() => {
	$scope.$parent.loadMessages();
      }, 250);
    }]
  });
