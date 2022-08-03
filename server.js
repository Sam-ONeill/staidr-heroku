const https = require('https');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express().listen(port,()=>console.log("listening on port" + port));

// Connect to the MongoDb database
app.use(cors({origin: true}));
app.use(express.json());
mongoose
  .connect(process.env.DB, {useNewUrlParser: true})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log(err));

//Setup routes to groups
const groupRouter = require('./routes/groups');
app.use('/groups', groupRouter);

//Begin SocketIO init
const { Server } = require("socket.io");

const io = new Server(app);

// socket.IO server

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});
//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
console.log("port " + port);
//node_server.listen(process.env.PORT);
