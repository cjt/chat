'use strict';

angular.module('sockets').
  factory('chatSocket', (socketFactory) => {
    return socketFactory();
  });
