const uuid = require('uuidv4')
const mongoose = require("mongoose");
const messageModel = require("./models/message_model");
const groupModel = require("./models/groups_model");
const axios = require("axios");
const {ObjectId} = require("mongodb");
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

function getPastMessages (groupName, chatName)
{
    axios.get('http://localhost:4000/groups/'+groupName).then(res =>{
        let groupID= res.data[0]._id;
        axios.get('http://localhost:4000/messages/'+groupID+'/'+chatName).then(res => {
           return res.data;
        })
    })
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
