"use strict";

const couchDbUrl = 'http://localhost:5984';
const dbName = 'chat'
const port = 8080;

const express = require('express');
const app = express();
const cors = require('cors');
const bodyparser = require('body-parser');

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.use(express.static('app'));

const http = require('http').Server(app);
const io = require('socket.io')(http, { origins: '*:*' });
const stream = require('socket.io-stream');

const nano = require('nano')(`${couchDbUrl}`);
const db = nano.db.use(dbName);

// Static routes

app.get('/api/room/:name', (request, response) => {
  const roomName = request.params.name;
  db.view('messages', 'messages', {
    key: roomName,
    include_docs: true
  }).then((body) => {
    response.send(body);
  });
});

// Maintain state, a map of Room to User count. Modified by clients joining and leaving rooms. Might eventually ideally need a mutex to prevent bogus states.
let rooms = new Map();
db.view('rooms', 'rooms', { group:true }).then((body) => {
  body.rows.forEach((row) => {
    rooms.set(row.key, 0);
  });
});

// Angulars ng-repeat doesn't like ES6 Maps so for now let's use this to make it an object array: FIXME: find a nicer solution, ng filter etc.
let toObjectArray = (map) => {
  let arr = [];
  map.forEach((value, key, map) => {
    arr.push({ "room":key, "usercount":value });
  });
  return arr;
};

io.sockets.on('connect', (socket) => {
  console.debug(`User ${socket.id} connected`);

  // joinroom event allows a client to join an arbitrary room. The client will be evicted from all rooms it belongs to except it's 'direct message' room.
  socket.on('joinroom', (room) => {
    let currentRooms = Object.keys(socket.rooms).filter(room => room !== socket.id);
    console.debug(`User ${socket.id} leaving ${currentRooms.join(', ')}...`);
    currentRooms.forEach((currentRoom) => {
      socket.leave(currentRoom);
      rooms.set(currentRoom, rooms.get(currentRoom)-1);
    });

    console.debug(`User ${socket.id} joining ${room}`);
    socket.join(room);
    socket.room = room;
    
    // update room state and send updated roomstate to all clients
    rooms.set(room, rooms.get(room)+1);
    io.emit('roomstate', toObjectArray(rooms));

    // tell client to load history for room
    socket.emit('chathistory', room);
  });
  
  // newmessage event allows a client to post a message. On successful persistence it will be emitted to the room to which it belongs via the chatmessage event.
  socket.on('newmessage', (message) => {
    db.insert(message).then((response) => {
      if (response.ok) {
	console.debug(`Message from ${socket.id} for ${message.room}: ${JSON.stringify(message)}`);
	io.in(message.room).emit('chatmessage', message);
      }
      else {
	console.error(`Error saving message from ${socket.id}: ${JSON.stringify(response)}`);
      }
    });
  });

  // newroom allows a client to create a new room. This will update room state, push out updates to that room state to all clients.
  socket.on('newroom', (newroom) => {
    console.debug(`newroom from ${socket.id}: ${JSON.stringify(newroom)}`);
    db.insert(newroom).then((response) => {
      if (response.ok) {
	rooms.set(newroom.room, 0);

	io.emit('roomstate', toObjectArray(rooms));
      }
      else {
	console.error(`Error saving new room message from ${socket.id}: ${JSON.stringify(response)}`);
      }
    });
  });

  // immediately push out room state to the newly connected client
  socket.emit('roomstate', toObjectArray(rooms));
  
//  stream(socket).on('message', (s, data) => {
//    db.changes(dbName, { filter: "filters/room",
//			 room: data.name,
//			 include_docs: true }).
//      pipe(s);
//  });

  // Disconnect event updates room state to reflect departure of client. 
  socket.on('disconnect', () => {
    rooms.set(socket.room, rooms.get(socket.room)-1);
    io.emit('roomstate', toObjectArray(rooms));
    console.debug(`User ${socket.id} disconnected`);
  });
});

http.listen(port, () => { console.log(`Listening on port ${port}...`); });
