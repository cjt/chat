'use strict';

angular.
  module('room').
  component('room', {
    templateUrl: 'room/room.template.html',
    controller: ['$http', '$scope', function RoomController($http, $scope) {
      var self = this;

      $scope.send = function (newmessage) {
	var datetime = (new Date()).toISOString().slice(0, 23).replace("T", " "); // TODO break out common code, date format is important
	$http.post('http://127.0.0.1:5984/chat/', JSON.stringify({ "room":$scope.$parent.room.name, "user":$scope.$parent.username, "datetime":datetime, "message":newmessage })).
	  then(function(response) {
	    newmessage = '';
	    $scope.$parent.loadMessages();
	  })
      };

      var sortMessages = function(messages) {
	var compareOnDatetime = (a, b) => (a.datetime < b.datetime) ? -1 : (a.datetime > b.datetime) ? 1 : 0;
	return messages.sort(compareOnDatetime);
      };
      
      var loadMessages = () => {
	$http.get('http://127.0.0.1:5984/chat/_design/messages/_view/messages?key=\"' + $scope.$parent.room.name + '\"&include_docs=true').then(function(response) {
          var rows = response.data.rows;
          var messages = [];
	  
          rows.forEach(function(row) {
            messages.push({ "room":row.doc.room, "datetime":row.doc.datetime, "username":row.doc.user, "message":row.doc.message })  
          });
	  
	  self.room = $scope.$parent.room.name;
          self.messages = sortMessages(messages);
	});
      }

      $scope.$parent.loadMessages = loadMessages;
    }]
  });
