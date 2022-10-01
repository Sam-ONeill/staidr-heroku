const uuid = require('uuidv4')
const mongoose = require("mongoose");
const messageModel = require("./models/message_model");
const groupModel = require("./models/groups_model");
const {ObjectId} = require("mongodb");
const groupRouter = require('./routes/groups');
const express = require("express");
const app = express();
app.use('/groups', groupRouter);

const isUser = ( users, nickname ) => nickname in users

const createUser = ( nickname, socketId ) => ({ nickname, socketId })

const addUsers = ( users, user ) => {
    //console.log("methods"+ JSON.stringify(user));
    users[ user.nickname ] = user
    return users
}

const createChat = ({ name, description = 'Public Room'} = {}) => ({
    name,
    description,
    messages: [],
    msgCount: 0,
    typingUser: []
})

const isChannel = ( channelName, chats ) => chats.includes( channelName )


const delUser = ( users, nickname ) => {
    delete users[ nickname ]
    return users
}

const createMessage = ( message, sender ) => ({
    id: uuid(),
    time: new Date(Date.now()),
    message,
    sender
})
const getPastMessages=(groupName, chatName)=> {
    /*
    await axios.get('http://staidr-heroku.herokuapp.com/groups/' + groupName).then(async res => {
        let groupID = res.data[0]._id;
        await axios.get('http://staidr-heroku.herokuapp.com/messages/' + groupID + '/' + chatName).then(async res => {
            return await res.data;
        })
    })
    */
    // call router for groups .then call router for messages return those back
    console.log("numero 1");

app.get('http://staidr-heroku.herokuapp.com/groups/' + groupName,(req,res) => {
        console.log(res);

        res.send("hello world");

}).then((res) => {
    console.log("numero 3");

    return res;

});
}



module.exports = {
    isUser,
    createUser,
    addUsers,
    createChat,
    delUser,
    createMessage,
    isChannel,
    getPastMessages,
}
