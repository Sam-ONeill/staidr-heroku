const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const SocketIO = require('socket.io');
require('dotenv').config();

const port = process.env.PORT || 4000;
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
app.use('/groups', groupRouter);

const Group = require('./models/groups_model');
// IMPORTS REQUIRED TO CREATE A SESSION ON THE SERVER INCLUDING RANDOM SESSION IDS
const { Storage } = require('./sessionStore');
const sessionStore = new Storage();
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

let socketGroupName = "CS620C"
let socketRoomName = ""
let socketUserName = ""
//console.log(query);
//Begin SocketIO init

const io = SocketIO(server);
io.disconnectSockets();
//socketIO functions


// socket.IO server

//General functions on startup

io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    console.log("Made it here 1");
    if (sessionID) {
        // find existing session
        const session = sessionStore.findSession(sessionID);
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.username = session.username;
            return next();
        }
    }
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    // create new session
    socket.sessionID = randomId();
    socket.userID = randomId();
    socket.username = username;
    next();
    console.log("Made it here 2");

});
//User based functions
io.on('connection',
    (socket) => {
        console.log("Made it here 3");

        /*socket.emit("hello from server", 1, "2", {3: Buffer.from([4])});
        socket.on("hello from client", () => {
          // ...
          console.log("The client said hello");
        });*/
        //console.log(socket.rooms); // Set { <socket.id> }
        //print all events to console
        socket.onAny((event, ...args) => {
            console.log(event, args);
        });

        console.log("user Joined");
        sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            username: socket.username,
            connected: true,
        });

        // emit session details
        socket.emit("session", {
            sessionID: socket.sessionID,
            userID: socket.userID,
        });

        socket.on("join-room", (roomName, userName) => {
            socket.join(roomName);
            let socketRoomName = roomName
            socket.username = userName;

            const users = [];
            sessionStore.findAllSessions().forEach((session) =>{
                if (socket.username != null) {
                    users.push({
                        userID: session.userID,
                        username: session.username,
                        connected: session.connected,
                    });
                }
            });

            socket.emit("users", users);

            socket.broadcast.emit("user connected", {
                userID: socket.userID,
                username: socket.username,
                connected: true,
            });

            console.log(`socket ${socket.id} has joined room ${socketRoomName} under username ${socket.username}`);
            //increase active users in room by 1
            Group.findOneAndUpdate({
                "Name": socketGroupName,
                "Rooms.Room_name": socketRoomName
            }, {$inc: {'Rooms.$.Active_users': 1}}, {
                rawResult: true // Return the raw result from the MongoDB driver
            })

            socket.on("Room message", ({ content}) => {
                socket.to(socketRoomName).emit("message", {
                    content,
                    from: socket.userID,
                });
            });

        });
        socket.on("ping", () => {
            console.log("ping");
            socket.emit("pong");
        });

        socket.on("disconnect", async() => {

            Group.findOneAndUpdate({
                "Name": socketGroupName,
                "Rooms.Room_name": socketRoomName
            }, {$inc: {'Rooms.$.Active_users': -1}}, {
                rawResult: true // Return the raw result from the MongoDB driver
            }).then(() => {
                console.log(`Ran and disconnected i guess ${socketGroupName} ${socketRoomName}`);
            });
            const matchingSockets = await io.in(socket.userID).allSockets();
            const isDisconnected = matchingSockets.size === 0;
            if (isDisconnected) {
                // notify other users
                socket.broadcast.emit("user disconnected", socket.userID);
                // update the connection status of the session
                sessionStore.saveSession(socket.sessionID, {
                    userID: socket.userID,
                    username: socket.username,
                    connected: false,
                });
            }
        });

    });


//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//node_server.listen(process.env.PORT);
