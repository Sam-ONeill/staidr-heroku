const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const SocketIO = require('socket.io');
require('dotenv').config();

const port = 3000;
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
  console.log('Client connected');
  socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });
  socket.on("hello from client", () => {
    // ...
    console.log("The client said hello");
  })
});
io.on("joinRoom",(socket,{roomName,user }) => {
  socket.create(13);
  socket.emit("Room "+roomName+" was joined");
});


//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//node_server.listen(process.env.PORT);
