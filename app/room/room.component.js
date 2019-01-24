'use strict';

angular.
  module('room').
  component('room', {
    templateUrl: 'room/room.template.html',
    controller: ['$http', '$routeParams', function RoomController($http, $routeParams) {
      var self = this;
      var room = $routeParams.room; // sanitize this...
      
      $http.get('http://127.0.0.1:5984/chat1/_design/messages/_view/messages?key=' + room + '&include_docs=true').then(function(response) {
        var rows = response.data.rows;
        var messages = [];

        rows.forEach(function(row) {
          messages.push({ "room":row.doc.room, "datetime":row.doc.datetime, "username":row.doc.user, "message":row.doc.message })
        });

        self.messages = messages;  
      });
    }]
  });
