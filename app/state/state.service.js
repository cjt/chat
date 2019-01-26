'use strict';

angular
  .module('state.service')
  .factory('roomState', function() {
    return {
      room: null // Current selected room
    };
});
