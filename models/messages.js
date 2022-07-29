const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let messages = new Schema(
  {
    CreatedAt: {
      bsonType: 'timestamp',
    },
    Edited_flag: {
      bsonType: 'bool',
    },
    Group_id: {
      bsonType: 'objectId',
    },
    Message: {
      bsonType: 'string',
    },
    Original_message: {
      bsonType: 'string',
    },
    Room_name: {
      bsonType: 'string',
    },
    User: {
      bsonType: 'object',
      properties: {
        Email: {
          bsonType: 'string',
        },
        User_id: {
          bsonType: 'objectId',
        },
      },
    },
    _id: {
      bsonType: 'objectId',
    },
  },
  {collection: 'staidr', timestamps: true},
);
module.exports = mongoose.model('messages', messages);
