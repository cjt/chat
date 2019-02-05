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

//
// Websocket stuff
//

io.sockets.on('connect', (socket) => {
  console.log(`User ${socket.id} connected`);

  // joinroom event allows a client to join an arbitrary room. The client will be evicted from all rooms it belongs to except it's 'direct message' room.
  socket.on('joinroom', (room) => {
    let currentRooms = Object.keys(socket.rooms).filter(room => room !== socket.id);
    console.debug(`User ${socket.id} leaving ${currentRooms.join(', ')}`);
    currentRooms.forEach((currentRoom) => {
      socket.leave(currentRoom);
    });

    console.debug(`User ${socket.id} joining ${room}`);
    socket.join(room);
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
  
//  socket.on('newroom', (newroom) => {
//    console.log(`newroom: ${newroom}`);
//    io.emit('newroom', newroom);
//  });

//  stream(socket).on('message', (s, data) => {
//    db.changes(dbName, { filter: "filters/room",
//			 room: data.name,
//			 include_docs: true }).
//      pipe(s);
//  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
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
