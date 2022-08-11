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
let socketUserName = ""
//console.log(query);
//Begin SocketIO init

const io = SocketIO(server);
//socketIO functions



// socket.IO server

//General functions on startup


// I want to test how session store saves sessions

const users = [];

sessionStore.saveSession("12345", {
    userID: "ABCDEF",
    username: "tesT",
    connected: true,
});

sessionStore.saveSession("123454", {
    userID: "ABCDEF2",
    username: "tesT2",
    connected: true,
});



function saveOneSession(sessionID,userID,username,connected){
    sessionStore.saveSession(sessionID, {
        userID: userID,
        username: username,
        connected: connected,
    });
}

function getAllSessions(){
    sessionStore.findAllSessions().forEach((session) => {
        if (session.username != null) {
            console.log("pushing users to user")
            users.push({
                userID: session.userID,
                username: session.username,
                connected: session.connected,
            });
        }
    });
}

saveOneSession("77","ABCDEF3","test3",true );

getAllSessions();

console.log("all my users" +JSON.stringify(users));

//User based functions
io.on('connection',
    (socket) => {
        saveOneSession("77","ABCDEF3","test4",true );

        getAllSessions();
        console.log("all my users in connection" +JSON.stringify(users));

        //print all events to console
        socket.onAny((event, ...args) => {
            console.log(event, args);
        });

        /*
        If i set the session on the group screen
         the client should be able to access that from any group
         */

        socket.on("Joined-group", (userName) => {
            saveOneSession("77","ABCDEF3","test5",true );

            getAllSessions();
            console.log("all my users in joined group" +JSON.stringify(users));

            if(!userName){
                console.log("no username found");
            }else {
                const sessionID = socket.sessionID;
                console.log("is there a socket? " + sessionID);
                if (sessionID) {
                    // find existing session
                    session = sessionStore.findSession(sessionID);
                    if (session) {
                        socket.sessionID = sessionID;
                        socket.userID = session.userID;
                        socket.username = session.username;
                    }
                } else {

                    // if there isn't an existing session
                    // create new session
                    socket.sessionID = randomId();
                    socket.userID = randomId();
                    socket.username = userName
                    console.log("userid " + socket.userID);
                    console.log("created new session");
                    sessionStore.saveSession(socket.sessionID, {
                        userID: socket.userID,
                        username: socket.username,
                        connected: true,
                    });
                    const session = sessionStore.findSession(socket.sessionID);

                    console.log("Session created" + session.username + " " + session.userID);
                }
                socket.emit("session", {
                    sessionID: socket.sessionID,
                    userID: socket.userID,
                });
            }

        });

        socket.on("join-room", (roomName, userName, sessionID, userID) => {
            saveOneSession("77","ABCDEF3","test6",true );

            getAllSessions();
            console.log("all my users in join room" +JSON.stringify(users));

            if (!sessionID) {
                alert("no session id");
            } else {
                session = sessionStore.findSession(socket.sessionID);
                console.log("session data below");
                console.dir(session);
                console.log("session data above");
                socket.username = userName;
                socket.join(roomName);
                let socketRoomName = roomName


                const users = [];
                sessionStore.findAllSessions().forEach((session) => {
                    if (socket.username != null) {
                        users.push({
                            userID: session.userID,
                            username: session.username,
                            connected: session.connected,
                        });
                    }
                });
                socket.emit("session", {
                    sessionID: socket.sessionID,
                    userID: socket.userID,
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

                socket.on("Room message", ({content}) => {
                    socket.to(socketRoomName).emit("message", {
                        content,
                        from: socket.userID,
                    });
                });
            }
        });
        socket.on("ping", () => {
            console.log("ping");
            socket.emit("pong");
        });


        socket.on("leaveRoom", ({socketRoomName}) => {
            Group.findOneAndUpdate({
                "Name": socketGroupName,
                "Rooms.Room_name": socketRoomName
            }, {$inc: {'Rooms.$.Active_users': -1}}, {
                rawResult: true // Return the raw result from the MongoDB driver
            }).then(() => {
                console.log(`Ran and disconnected i guess ${socketGroupName} ${socketRoomName}`);
            });
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
                    username: socket.username,
                    connected: false,
                });
            }
        });

    });









//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//node_server.listen(process.env.PORT);
