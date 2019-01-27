'use strict';

angular.module('config').
  constant('CHAT_CONFIG', {
    // URL and port of the CouchDb instance
    url: 'http://127.0.0.1:5984',

    // CouchDb database the app will use
    db: 'chat',

    // Formatted string function returning 'now' - better home somewhere else?
    nowString: () => { return (new Date()).toISOString().slice(0, 23).replace("T", " "); }
  });
