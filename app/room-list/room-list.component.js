'use strict';

angular
    .module('roomList')
    .component('roomList', {
        templateUrl: 'room-list/room-list.template.html',
        controller: function roomListController($http) {
            var self = this;
            $http.get('http://localhost:5984/chat1/_design/rooms/_view/rooms?group=true').then(function(response) {
                var rows = response.data.rows;
                var rooms = [];

                rows.forEach(function(row) {
                    rooms.push({ "name":row.key, "messages":row.value })
                });
                
                self.rooms = rooms;
            });
        }
    });
