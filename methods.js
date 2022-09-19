const uuid = require('uuidv4')
const mongoose = require("mongoose");
const messageModel = require("./models/message_model");
const groupModel = require("./models/groups_model");

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

async function getPastMessages (groupName, chatName)
{

    const group = await groupModel.findOne({"Name":groupName});
    try {
        const recentMessages = await messageModel.find({Group_id: group._id,Room_name: chatName}).sort({_id:-1})
            .limit(10);
        try {
            return recentMessages
        } catch (err){
            console.log("messages"+ err)
        }
    } catch (err) {
        console.log("Groups" + err);
    }


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
