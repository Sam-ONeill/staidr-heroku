const mongoose = require('mongoose');
const Schema = mongoose.Schema;
    //.Types.Mixed;

let messageSchema = new Schema(
  {
      Room_name: {
          type: String,
      },
    Edited_flag: {
      type: Boolean,
    },
      Is_image:{
        type: Boolean,
      },
    Group_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    Current_message: {
      type: String,
    },
    Original_message: {
        type: String,
    },
    User: {
        Email: {
            type: String,
        },
        User_id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        Avatar: {
            type: String,
        },
    },
  },
  {timestamps: true},
);
module.exports = mongoose.model('messages', messageSchema);
