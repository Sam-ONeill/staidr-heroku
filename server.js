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

// socket.IO server

io.on('connection', (socket) => {
  socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });
  socket.on("hello from client", () => {
    // ...
    console.log("The client said hello");
  });
  socket.on("join-room",({room,id }) => {
    socket.emit("Room "+room+" was joined");
    console.log(`socket ${id} has joined room ${room}`);
    const rooms = io.sockets.adapter.rooms[room];
    console.log(rooms.length);
    socket.emit(`there are ${rooms.length} people in room ${room}`);
  });
});



//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//node_server.listen(process.env.PORT);
