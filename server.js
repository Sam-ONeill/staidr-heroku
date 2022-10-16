const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const SocketIO = require('socket.io');
require('dotenv').config();
const socketManage = require('./socketManage');


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
const messageRouter = require('./routes/messages');
const userRouter = require('./routes/users');
app.use('/users',userRouter);
app.use('/messages',messageRouter);
app.use('/groups', groupRouter);

const Group = require('./models/groups_model');
const Message = require('./models/message_model');
// IMPORTS REQUIRED TO CREATE A SESSION ON THE SERVER INCLUDING RANDOM SESSION IDS
const {InMemorySessionStore} = require('./sessionStore');
const sessionStore = new InMemorySessionStore();
const crypto = require("crypto");
const {disconnect} = require("mongoose");
const methods = require("./methods");
const events = require("./events");
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
/*



Test area

const test = ()=>{
    setTimeout(function () {
        // ...
    }, 10000);
    methods.getPastMessages("CS620C", "Niamh");
    console.log("testting herer");}
test();

 */




//io.on('connection',socketManage)

/*






Test area end






 */

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
//console.log("at beginning" + JSON.stringify(users));
//console.log("amount" + users.length);


//User based functions
io.on('connection', socketManage)

    /*
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
                //console.log("test 1" + users.find(user => user.username === socketUserName));
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
                   // console.log("test 2" + index);
                    socket.emit('sessionData', {
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
                //console.log("joining " + roomName)
                socket.join(roomName)
                //console.log("joined the room hopefully");
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
                socket.to(roomName).emit("test-socket-emit", {
                    sessionID,
                    userID,
                });
                // sends to all including sender
                io.in(roomName).emit("test-io-emit", {
                    sessionID,
                    userID,
                });

                //console.log(`socket ${userID} has joined room ${socketRoomName} under username ${userName}`);
                //increase active users in room by 1
             Group.findOneAndUpdate({
                    "Name": socketGroupName,
                    "Rooms.Room_name": socketRoomName
                }, {$inc: {'Rooms.$.Active_users': 1}}, {
                   new: true,
                    rawResult: true // Return the raw result from the MongoDB driver
                }).then(console.log(""))
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
            //console.log(socketGroupName+ socketRoomName);
            Group.findOneAndUpdate({
                "Name": socketGroupName,
                "Rooms.Room_name": socketRoomName
            }, {$inc: {'Rooms.$.Active_users': -1}}, {
                new: true,
                rawResult: true // Return the raw result from the MongoDB driver
            }).then(console.log(""))

            /*
            Issue with finding what rooms the socket is in and then leaving them on leave-room

            console.log("rooms"+JSON.stringify(socket.rooms));
            let roster = io.sockets.clients('chatroom1');
            for ( let i in roster )
            {
                console.log('Username: ' + roster[i]);
            }
            socket.leave(socketRoomName);


            io.in(socketRoomName).allSockets().then(result => {
                console.log("num in room " + result.size)
            }) */

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
*/

//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//node_server.listen(process.env.PORT);
