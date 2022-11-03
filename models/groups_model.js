const mongoose = require('mongoose');
const Int32 = require('mongoose-int32').loadType(mongoose);
const Long = require('mongoose-long')(mongoose);
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    Name: {
      type: String,
    },
    Rooms: {
      type: Array,
      items: {
        type: Object,
        properties: {
          Active_users: {
            type: Int32,
          },
          Room_name: {
            type: String,
          },
        },
      },
    },
    TotalMessagesSent: {
      type: Long,
    },
    Users: {
      type: Array,
      items: {
        type: Object,
        properties: {
          Joined_flag: {
            type: Boolean,
          },
          User_id: {
            bsonType: 'objectId',
          },
            User_name:{
              type: String
            },
            MemberOfRooms: {
                type: Array,
                items: {
                    type: Object,
                    properties: {
                        Active_users: {
                            type: Int32,
                        },
                        Room_name: {
                            type: String,
                        },
                    },
                },
            },
        },
      },
    },
  },
  {type: Int32, required: true},
);
module.exports = mongoose.model('groups', groupSchema);
