'use strict';

angular
  .module('state.service')
  .factory('roomState', function() {
    return {
      // Current selected room
      room: null,
      // Function for reloading messages
      reloadMessages: null
    };
});
