const router = require('express').Router();

let User = require('../models/user_model');

router.get('/', async (req, res) => {
  const users = await User.find();
  try {
    res.send(users);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:email', async (req, res) => {
  const users = await User.find({"email":req.params.email});
  try {
    res.send(users);
  } catch (err) {
    res.status(400).send(err);
  }
});


module.exports = router;
