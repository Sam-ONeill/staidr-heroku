const https = require('https');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

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


// Initialise node HTTPS server
const node_server = https.createServer(app);

//Begin SocketIO init
const { Server } = require("socket.io");

const io = new Server(node_server);

// socket.IO server

io.on('connection', (socket) => {
  console.log('Num Of Users online ' + io.engine.clientsCount);
  console.log(socket.id);
  socket.on('disconnect', () => console.log('client disconnected'));
});
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

node_server.listen(5000);
