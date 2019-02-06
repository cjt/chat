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

// console.log(`room: ${room}, datetime:${datetime}, username:${username}, message:${message}`);

//
// Static routes
//

app.get('/api/rooms', (request, response) => {
  db.view('rooms', 'rooms', { group:true }).then((body) => {
    response.send(body);
  });
});

app.post('/api/room/new', (request, response) => {
  db.insert(request.body).then((body) => {
    response.send(body);
  });
});

app.get('/api/room/:name', (request, response) => {
  const roomName = request.params.name;
  db.view('messages', 'messages', {
    key: roomName,
    include_docs: true
  }).then((body) => {
    response.send(body);
  });
});

app.post('/api/message', (request, response) => {
  db.insert(request.body).then((body) => {
    response.send(body);
  });
});

// Server State

let rooms = new Map();
db.view('rooms', 'rooms', { group:true }).then((body) => {
  body.rows.forEach((row) => {
    rooms.set(row.key, 0);
  });
  console.debug(`Loaded rooms: ${Array.from(rooms.keys()).join()}`);
});

let toObjectArray = (map) => {
  let arr = [];
  map.forEach((value, key, map) => {
    arr.push({ "room":key, "usercount":value });
  });
  return arr;
};

// Websocket stuff

io.sockets.on('connect', (socket) => {
  console.log(`User ${socket.id} connected`);

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
  
  socket.on('newroom', (newroom) => {
    console.log(`newroom from ${socket.id}: ${JSON.stringify(newroom)}`);
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

  socket.on('disconnect', () => {
    rooms.set(socket.room, rooms.get(socket.room)-1);
    io.emit('roomstate', toObjectArray(rooms));
    console.log(`User ${socket.id} disconnected`);
  });
});

// Timelooped emitter spitting messages out to a room
//let i = 1;
//setInterval(() => {
//  const datetime = (new Date()).toISOString().slice(0, 23).replace("T", " ");
//  const message = { "room":"RNLI", "datetime":datetime, "username":"server", "message":`server message ${i}` };
//  console.log(`Emitting message ${i}...`);
//  io.sockets.emit('chatmessage', message);
//  i++;
//}, 3000);

http.listen(port, () => { console.log(`Listening on port ${port}...`); });
