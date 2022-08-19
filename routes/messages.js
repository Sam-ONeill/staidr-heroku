
const mongoose = require("mongoose");
const router = require('express').Router();
const Message= require('../models/message_model');
mongoose.set('debug', true);
router.get('/', async (req, res) => {
  const messages = await Message.find();
  try {
    res.send(messages);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:Room_name', async (req, res) => {

  const messages = await Message.find(
      {"Room_name": req.params.Room_name});
  try {
    res.send(messages);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/add', async (req, res) => {
  const Edited_flag = req.body.Edited_flag;
  const Is_image= req.body.Is_image;
  const Group_id= mongoose.Types.ObjectId(req.body.Group_id);
  const Current_message = req.body.Current_message;
  const Original_message = req.body.Current_message;
  const Room_name = req.body.Room_name;
  const User = req.body.User;
  const Avatar = req.body.avatar;
  const newMessage = new Message({
    Room_name,
    Edited_flag,
    Is_image,
    Group_id,
    Current_message,
    Original_message,
    User,
    Avatar,
  });

  if(req.body.Room_name != null) {
    console.log(req.body.Room_name);
    try {
      await newMessage.save();
      res.send(newMessage);
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      res.status(404).send('No item found');
    }
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/update/:id', async (req, res) => {
  console.log(req.body);
  const Edited_flag = req.body.Edited_flag;
  const Is_image= req.body.Is_image;
  const Group_id= req.body.Group_id;
  const Original_message = req.body.Message;
  const Room_name = req.body.Room_name;
  const User = req.body.User;
  if(req.body.Room_name != null) {
    console.log(req.body.Room_name);
    try {
      const update = await Message.findOne(
          {"Name": "CS620C"});

      await Message.save();
      res.send(message);
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

module.exports = router;
