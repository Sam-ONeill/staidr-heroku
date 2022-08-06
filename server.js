const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const SocketIO = require('socket.io');
require('dotenv').config();

const port = process.env.PORT || 3000;
const INDEX = '/index.html';

const app = express();
const server = app
    .listen(port, () => console.log(`Listening on ${port}`));

// Connect to the MongoDb database
app.use(cors({origin: true}));
app.use(express.json());
mongoose
  .connect(process.env.DB, {useNewUrlParser: true})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log(err));

//Setup routes to groups
const groupRouter = require('./routes/groups');
const Console = require("console");
app.use('/groups', groupRouter);

//Begin SocketIO init

const io = SocketIO(server);

//socketIO functions
function getActiveRooms(io) {
  // Convert map into 2D list:
  // ==> [['4ziBKG9XFS06NdtVAAAH', Set(1)], ['room1', Set(2)], ...]
  const arr = Array.from(io.sockets.adapter.rooms);
  // Filter rooms whose name exist in set:
  // ==> [['room1', Set(2)], ['room2', Set(2)]]
  const filtered = arr.filter(room => !room[1].has(room[0]))
  // Return only the room name:
  // ==> ['room1', 'room2']
  const res = filtered.map(i => i[0]);
  return res;
}

function getLengthOfRooms(item, index, arr){
return item+" + "+item.length;

}



// socket.IO server

io.on('connection', (socket) => {
  socket.emit("hello from server", 1, "2", {3: Buffer.from([4])});
  socket.on("hello from client", () => {
    // ...
    console.log("The client said hello");
  });
  socket.on("join-room", ({room, id}) => {
    socket.emit("Room " + room + " was joined");
    console.log(`socket ${id} has joined room ${room}`);
    console.log(io.sockets.adapter.rooms);
    if (io.sockets.adapter.rooms["apple"] !== undefined) {

      console.log(getActiveRooms(socket));
      console.log(getActiveRooms(socket).forEach(getLengthOfRooms));
      //const rooms = io.sockets.adapter.rooms[room];
      //console.log(rooms.length);

      socket.emit(`there are ${rooms.length} people in room ${room}`);
    }
  });

});



//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//node_server.listen(process.env.PORT);
