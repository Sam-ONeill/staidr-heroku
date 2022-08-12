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
const {InMemorySessionStore} = require('./sessionStore');
const sessionStore = new InMemorySessionStore();
const crypto = require("crypto");
const {disconnect} = require("mongoose");
const randomId = () => crypto.randomBytes(8).toString("hex");
let session;

let socketGroupName = "CS620C"
let socketRoomName = ""

let socketUserName = "" // global username variable
//console.log(query);
//Begin SocketIO init

const io = SocketIO(server);
//socketIO functions


// socket.IO server

//General functions on startup


// I want to test how session store saves sessions

//theres an issue where the user is constanly recconecting and not remembering its session id and userid


const users = [];

// check if user has access to their userid & has logged in before
// if they have reassign them there userid and session set connected to true
// else create a user in session store
// this should only be run once the first time they open the group once in the group they should keep the sessin id and user id through navigation route params

function saveOneSession(sessionID, userID, username, connected) {
    sessionStore.saveSession(sessionID, {
        userID: userID,
        username: username,
        connected: connected,
        sessionID: sessionID,
    });
}

function getOneSession(sessionID) {
    session = sessionStore.findSession(sessionID);
    return session;
}

function getAllSessions() {
    sessionStore.findAllSessions().forEach((session) => {
        if (session.username != null) {
            users.push({
                userID: session.userID,
                username: session.username,
                connected: session.connected,
                sessionID: session.sessionID,
            });
        }
    });
}

getAllSessions();
console.log("at begining" + JSON.stringify(users));
console.log("amount" + users.length);


//User based functions
io.on('connection',
    (socket) => {
        //print all events to console
        socket.onAny((event, ...args) => {
            console.log(event, args);
        });


        //check if user has signed in before
        socket.on('username', (username) => {

            getAllSessions();
            socketUserName = username;

            if (socketUserName != null) {
                console.log("test 1" + users.find(user => user.username === socketUserName));
                if (users.find(user => user.username === socketUserName) === undefined) { // User has not logged in before
                    socket.sessionID = randomId();
                    socket.userID = randomId();
                    saveOneSession(socket.sessionID, socket.userID, socketUserName, true);
                    socket.emit('sessionData', {
                        sessionID: socket.sessionID,
                        userID: socket.userID,
                    });
                } else { // User has logged in before
                    const index = users.findIndex((item) => item.username === socketUserName);
                    console.log("test 2" + index);
                    socket.emit('SessionData', {
                        sessionID: users[index].sessionID,
                        userID: users[index].userID,
                    });
                    socket.sessionID = users[index].sessionID;
                    socket.userID = users[index].userID;
                }
            }
        });
        /*
        If i set the session on the group screen
         the client should be able to access that from any group
         */

        socket.on("join-room", (roomName, userName, sessionID, userID) => {


            if (!sessionID) {
                console.log("no session id");
            } else {
                console.log("joining " + roomName)
                socket.join(roomName);
                let socketRoomName = roomName

                /*
                not sure if needed

                socket.emit("sessionData", {
                    sessionID: sessionID,
                    userID: userID,
                });
                */
                getAllSessions();

                socket.emit("users", users);

                socket.broadcast.emit("user connected", {
                    userID: userID,
                    username: userName,
                    connected: true,
                });

                console.log(`socket ${userID} has joined room ${socketRoomName} under username ${userName}`);
                //increase active users in room by 1
             Group.findOneAndUpdate({
                    "Name": socketGroupName,
                    "Rooms.Room_name": socketRoomName
                }, {$inc: {'Rooms.$.Active_users': 1}}, {
                   new: true,
                    rawResult: true // Return the raw result from the MongoDB driver
                })
            }
        });
        socket.on("Room-message", ({content,to,from}) => {
            console.log("room message function"+ to+" " + from);

            socket.emit("message", {
                content,
                from: from,
            });

            // sends to all but sender
            socket.to(to).emit("message", {
                content,
                from: from,
            });
            // sends to all including sender
            io.in(to).emit("message", {
                content,
                from: from,
            });
        });


        socket.on("leaveRoom", (socketRoomName, userID, userName) => {
            socket.broadcast.emit("user left room", {
                userID: userID,
                username: userName,
                connected: false,
            });
            console.log(socketGroupName+ socketRoomName);
            Group.findOneAndUpdate({
                "Name": socketGroupName,
                "Rooms.Room_name": socketRoomName
            }, {$inc: {'Rooms.$.Active_users': -1}}, {
                new: true,
                rawResult: true // Return the raw result from the MongoDB driver
            })

            socket.leave(socketRoomName);
            io.in(socketRoomName).allSockets().then(result => {
                console.log("num in room " + result.size)
            })

        });


        socket.on("disconnect", async () => {
            const matchingSockets = await io.in(socket.userID).allSockets();
            const isDisconnected = matchingSockets.size === 0;
            if (isDisconnected) {
                // notify other users
                socket.broadcast.emit("user disconnected", socket.userID);
                // update the connection status of the session
                sessionStore.saveSession(socket.sessionID, {
                    userID: socket.userID,
                    username: socketUserName,
                    connected: false,
                });
            }
        });
    });


//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//node_server.listen(process.env.PORT);
