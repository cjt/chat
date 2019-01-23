'use strict';

angular
    .module('roomList')
    .component('roomList', {
        templateUrl: 'room-list/room-list.template.html',
        controller: function roomListController() {
            this.rooms = [
                {
                    name: "Mountain Rescue",
                    messages: 2
                },
                {
                    name: "RNLI",
                    messages: 1
                }
            ];
        }
    });
