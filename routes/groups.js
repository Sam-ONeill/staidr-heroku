const router = require('express').Router();

let Group = require('../models/groups_model');

router.get('/', async (req, res) => {
  const groups = await Group.find();
  try {
    res.send(groups);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:id', async (req, res) => {
  const groups = await Group.findById(req.params.id);
  try {
    res.send(groups);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/add', async (req, res) => {
  console.log(req.body);
  const Name = req.body.Name;
  const Rooms = req.body.Rooms;
  const TotalMessagesSent = req.body.TotalMessagesSent;
  const Users = req.body.Users;

  const newGroup = new Group({
    Name,
    Rooms,
    TotalMessagesSent,
    Users,
  });

  try {
    await newGroup.save();
    res.send(newGroup);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      res.status(404).send('No item found');
    }
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/update', async (req, res) => {
  try {
    await Group.find(
        {"Name":"CS620C","Rooms.Room_name": "Apple"});
    await Group.save();
    res.send(group);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
